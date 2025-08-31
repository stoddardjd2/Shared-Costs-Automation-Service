const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

const {
  getOrCreateStripeCustomerForUser,
} = require("../stripe/createSubscriptionHelper");
const User = require("../models/User");

// Create Express Connected Account
const createAccount = async (req, res, next) => {
  console.log("createAccount called with body:", req.body);
  try {
    const { email } = req.body;
    console.log("Creating Stripe account for email:", email);

    const account = await stripe.accounts.create({
      type: "express",
      email,
      capabilities: {
        // card_payments: { requested: true },
        // transfers: { requested: true },
        // us_bank_account_ach_payments: { requested: true },
      },
      //   ssn_last_4: "1234", // Only last 4 digits initially
      business_type: "individual", // or 'company' as appropriate
      business_profile: {
        // Since they don't have a business, use product description
        product_description:
          "Freelance graphic design services including logo design and branding",
        mcc: "5045", // Merchant category code
      },
    });

    console.log(
      "Stripe STANDARD account created with capabilities:",
      account.id,
      account.capabilities
    );
    res.json({ accountId: account.id });
  } catch (err) {
    console.error("Error in createAccount:", err);
    next(err);
  }
};

// Generate Account Link for Onboarding
const createAccountLink = async (req, res, next) => {
  console.log("createAccountLink called with body:", req.body);
  try {
    const { accountId } = req.body;
    console.log("Generating Account Link for account:", accountId);

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      type: "account_onboarding",
      refresh_url: `${process.env.CLIENT_URL}/stripe/refresh`,
      return_url: `${process.env.CLIENT_URL}/stripe/return`,
      collection_options: {
        // fields: "eventually_due",
        fields: "currently_due", // Only collect what's needed NOW
      }, // up-front flow
    });

    console.log("Account Link URL:", accountLink.url);
    // Either redirect immediately:
    // res.redirect(303, accountLink.url);

    // Or send back the URL for your client to redirect:
    // res.json({ url: accountLink.url });
  } catch (err) {
    console.error("Error in createAccountLink:", err);
    next(err);
  }
};

// Check Onboarding Status
const returnAccountStatus = async (req, res, next) => {
  console.log("returnAccountStatus called with query:", req.query);
  try {
    const accountId = req.query.account;
    console.log("Retrieving Stripe account:", accountId);

    const account = await stripe.accounts.retrieve(accountId);
    console.log("Account requirements:", account.requirements);

    if (account.requirements.currently_due.length === 0) {
      console.log("Onboarding complete for account:", accountId);
      res.render("onboard-success");
    } else {
      console.log(
        "Onboarding incomplete, missing:",
        account.requirements.currently_due
      );
      res.render("onboard-incomplete", {
        missing: account.requirements.currently_due,
      });
    }
  } catch (err) {
    console.error("Error in returnAccountStatus:", err);
    next(err);
  }
};

// Stripe Webhook Handler
const webHookHandler = async (req, res) => {
  console.log("webHookHandler invoked");
  const sig = req.headers["stripe-signature"];
  console.log("Received Stripe signature:", sig);

  let event;
  try {
    // Use req.rawBody (Buffer) instead of req.body here
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("Stripe event constructed:", event.type);
  } catch (err) {
    console.error("Error verifying Stripe webhook signature:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle account.updated
  if (event.type === "account.updated") {
    const acct = event.data.object;
    console.log(
      "account.updated event for:",
      acct.id,
      "requirements:",
      acct.requirements
    );
    // TODO: Persist acct.requirements.currently_due / past_due to your database
  }

  res.json({ received: true });
};

// Initiate Payout
const payoutAccount = async (req, res, next) => {
  console.log("payoutAccount called with body:", req.body);
  try {
    const accountId = req.body.accountId;
    console.log("Retrieving account for payout:", accountId);

    const account = await stripe.accounts.retrieve(accountId);
    console.log("Payouts enabled status:", account.payouts_enabled);

    if (!account.payouts_enabled) {
      console.error("Account not ready for payouts:", accountId);
      throw new Error("Account not ready for payouts");
    }

    // TODO: create a payout or transfer here
    console.log("Account ready for payouts:", accountId);
    res.json({ success: true });
  } catch (err) {
    console.error("Error in payoutAccount:", err);
    next(err);
  }
};

// async function createSubscription(req, res) {
//   const isProd = process.env.NODE_ENV === "production";

//   try {
//     const { planKey, interval, currency = "usd" } = req.body || {};
//     const userId = req?.user?._id;

//     // 1) Basic input validation
//     if (!userId) {
//       return res.status(401).json({ error: "Unauthenticated user" });
//     }
//     if (!planKey || !interval) {
//       return res.status(400).json({ error: "Missing planKey or interval" });
//     }

//     // 2) Map UI plans -> env Price IDs
//     const PRICE_IDS = {
//       plaid: {
//         monthly: process.env.STRIPE_PRICE_PLAID_MONTHLY,
//         annual: process.env.STRIPE_PRICE_PLAID_ANNUAL,
//       },
//       premium: {
//         monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
//         annual: process.env.STRIPE_PRICE_PREMIUM_ANNUAL,
//       },
//     };
//     const priceId = PRICE_IDS?.[planKey]?.[interval];

//     if (!priceId || !/^price_/.test(priceId)) {
//       return res.status(400).json({
//         error: `Invalid plan/interval or missing env Price ID for ${planKey}/${interval}`,
//       });
//     }

//     // 3) Verify the Price exists and mode matches (test vs live)
//     let priceObj;
//     try {
//       priceObj = await stripe.prices.retrieve(priceId);
//     } catch (e) {
//       const msg = `Stripe price not found: ${priceId}`;
//       if (!isProd) console.error(msg, e);
//       return res.status(400).json({ error: msg });
//     }
//     const usingLiveKey = (process.env.STRIPE_SECRET_KEY || "").startsWith(
//       "sk_live_"
//     );
//     if (usingLiveKey !== !!priceObj.livemode) {
//       return res.status(400).json({
//         error:
//           "Stripe mode mismatch: your secret key and the Price ID are from different environments (test vs live).",
//       });
//     }

//     // 4) Ensure or create a Stripe customer
//     const customer = await getOrCreateStripeCustomerForUser(userId, stripe);
//     if (!customer?.id) {
//       return res
//         .status(500)
//         .json({ error: "Could not resolve Stripe customer" });
//     }

//     // 5) Create the subscription in "incomplete" so we can confirm payment via Payment Element
//     const subscription = await stripe.subscriptions.create({
//       customer: customer.id,
//       items: [{ price: priceId }],
//       payment_behavior: "default_incomplete",
//       payment_settings: {
//         payment_method_types: ["card"], // 👈 force card for subscription PI
//         save_default_payment_method: "on_subscription",
//         automatic_payment_methods:{enabled: true}
//       },
//       // If you use trials, uncomment below and handle SetupIntent flow instead of PaymentIntent.
//       // trial_period_days: Number(process.env.STRIPE_TRIAL_DAYS) || undefined,
//       expand: ["latest_invoice.payment_intent", "latest_invoice.subscription"],
//       // (Optional) Set default currency on prices instead; currency here is ignored if price is currency-specific
//       // collection_method, days_until_due, default_tax_rates, etc. can be added as needed
//     });

//     // 6) Extract client secret (pay-now flow)
//     const paymentIntent = subscription?.latest_invoice?.payment_intent;
//     if (!paymentIntent?.client_secret) {
//       // This can happen if you're using a pure trial (no immediate payment)
//       const detail =
//         "No client_secret present. If you enabled a free trial, create a SetupIntent flow first, or remove the trial for pay-now.";
//       if (!isProd) console.error(detail, { subscriptionId: subscription?.id });
//       return res
//         .status(400)
//         .json({ error: detail, subscriptionId: subscription?.id });
//     }

//     return res.json({
//       status: "success",
//       clientSecret: paymentIntent.client_secret,
//       subscriptionId: subscription.id,
//     });
//   } catch (err) {
//     console.log("err", err);
//     // Rich diagnostics for Stripe + network errors
//     const payload = {
//       error: err?.message || "Internal server error",
//       type: err?.type,
//       code: err?.code,
//       param: err?.param,
//       statusCode: err?.statusCode,
//     };
//     if (!isProd)
//       console.error("Error in createSubscription:", payload, err?.stack);
//     return res
//       .status(err?.statusCode || 500)
//       .json(isProd ? { error: payload.error } : payload);
//   }
// }

async function createSubscription(req, res) {
  console.log("createSubscription called with body:", req.body);
  const isProd = process.env.NODE_ENV === "production";

  try {
    const { planKey, interval, currency = "usd" } = req.body || {};
    const userId = req?.user?._id;

    // 1) Basic input validation
    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated user" });
    }
    if (!planKey || !interval) {
      return res.status(400).json({ error: "Missing planKey or interval" });
    }

    // 2) Map UI plans -> env Price IDs
    const PRICE_IDS = {
      plaid: {
        monthly: process.env.STRIPE_PRICE_PLAID_MONTHLY,
        annual: process.env.STRIPE_PRICE_PLAID_ANNUAL,
      },
      premium: {
        monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
        annual: process.env.STRIPE_PRICE_PREMIUM_ANNUAL,
      },
    };
    const priceId = PRICE_IDS?.[planKey]?.[interval];

    if (!priceId || !/^price_/.test(priceId)) {
      return res.status(400).json({
        error: `Invalid plan/interval or missing env Price ID for ${planKey}/${interval}`,
      });
    }

    // 3) Verify the Price exists and mode matches (test vs live)
    let priceObj;
    try {
      priceObj = await stripe.prices.retrieve(priceId);
    } catch (e) {
      const msg = `Stripe price not found: ${priceId}`;
      if (!isProd) console.error(msg, e);
      return res.status(400).json({ error: msg });
    }
    const usingLiveKey = (process.env.STRIPE_SECRET_KEY || "").startsWith(
      "sk_live_"
    );
    if (usingLiveKey !== !!priceObj.livemode) {
      return res.status(400).json({
        error:
          "Stripe mode mismatch: your secret key and the Price ID are from different environments (test vs live).",
      });
    }

    // 4) Ensure or create a Stripe customer
    const customer = await getOrCreateStripeCustomerForUser(userId, stripe);
    if (!customer?.id) {
      return res
        .status(500)
        .json({ error: "Could not resolve Stripe customer" });
    }

    // 5) Create the subscription in "incomplete" so we can confirm payment via Payment Element
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: {
        // ✅ Specify all payment method types you want to support for subscriptions
        payment_method_types: ["card", "us_bank_account"],
        save_default_payment_method: "on_subscription",
      },
      // If you use trials, uncomment below and handle SetupIntent flow instead of PaymentIntent.
      // trial_period_days: Number(process.env.STRIPE_TRIAL_DAYS) || undefined,
      expand: ["latest_invoice.payment_intent", "latest_invoice.subscription"],
      // (Optional) Set default currency on prices instead; currency here is ignored if price is currency-specific
      // collection_method, days_until_due, default_tax_rates, etc. can be added as needed
    });

    // 6) Extract client secret (pay-now flow)
    const paymentIntent = subscription?.latest_invoice?.payment_intent;
    if (!paymentIntent?.client_secret) {
      // This can happen if you're using a pure trial (no immediate payment)
      const detail =
        "No client_secret present. If you enabled a free trial, create a SetupIntent flow first, or remove the trial for pay-now.";
      if (!isProd) console.error(detail, { subscriptionId: subscription?.id });
      return res
        .status(400)
        .json({ error: detail, subscriptionId: subscription?.id });
    }

    return res.json({
      status: "success",
      clientSecret: paymentIntent.client_secret,
      subscriptionId: subscription.id,
    });
  } catch (err) {
    console.log("err", err);
    // Rich diagnostics for Stripe + network errors
    const payload = {
      error: err?.message || "Internal server error",
      type: err?.type,
      code: err?.code,
      param: err?.param,
      statusCode: err?.statusCode,
    };
    if (!isProd)
      console.error("Error in createSubscription:", payload, err?.stack);
    return res
      .status(err?.statusCode || 500)
      .json(isProd ? { error: payload.error } : payload);
  }
}

// Map Stripe Price IDs -> planKey, interval, role
const PRICE_TO_PLAN = {
  [process.env.STRIPE_PRICE_PLAID_MONTHLY]: {
    planKey: "plaid",
    interval: "monthly",
    plan: "plaid",
  },
  [process.env.STRIPE_PRICE_PLAID_ANNUAL]: {
    planKey: "plaid",
    interval: "annual",
    plan: "plaid",
  },
  [process.env.STRIPE_PRICE_PREMIUM_MONTHLY]: {
    planKey: "premium",
    interval: "monthly",
    plan: "premium",
  },
  [process.env.STRIPE_PRICE_PREMIUM_ANNUAL]: {
    planKey: "premium",
    interval: "annual",
    plan: "premium",
  },
};

// Helper to infer plan/interval from subscription
function inferPlanFromSubscription(sub) {
  const item = sub?.items?.data?.[0];
  const price = item?.price;
  const priceId = price?.id;

  if (priceId && PRICE_TO_PLAN[priceId]) {
    return { ...PRICE_TO_PLAN[priceId], priceId };
  }

  // fallback
  let interval;
  if (price?.recurring?.interval === "year") interval = "annual";
  if (price?.recurring?.interval === "month") interval = "monthly";

  return { planKey: undefined, interval, plan: undefined, priceId };
}

async function handleStripeWebHook(req, res) {
  console.log("stripe webhook received:", req.body);

  const sig = req.headers["stripe-signature"];
  const raw = req.rawBody;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      raw,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("⚠️  Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        if (
          invoice.billing_reason === "subscription_create" ||
          invoice.billing_reason === "subscription_cycle"
        ) {
          const subId = invoice.subscription;
          const customerId = invoice.customer;
          const sub = await stripe.subscriptions.retrieve(subId);

          const user = await User.findOne({ stripeCustomerId: customerId });
          if (!user) break;

          const { planKey, interval, plan } = inferPlanFromSubscription(sub);

          await User.updateOne(
            { _id: user._id },
            {
              $set: {
                "subscription.id": sub.id,
                "subscription.planKey":
                  planKey || user.subscription?.planKey || null,
                "subscription.interval":
                  interval || user.subscription?.interval || null,
                "subscription.status": sub.status,
                "subscription.currentPeriodStart": new Date(
                  sub.current_period_start * 1000
                ),
                "subscription.currentPeriodEnd": new Date(
                  sub.current_period_end * 1000
                ),
                "subscription.cancelAtPeriodEnd": !!sub.cancel_at_period_end,
                "subscription.latestInvoiceId": invoice.id,
                "subscription.defaultPaymentMethodId":
                  sub.default_payment_method || null,
                isPremium: ["active", "trialing"].includes(sub.status),
                plan: plan || "free",
              },
            }
          );
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object;
        const customerId = sub.customer;

        const user = await User.findOne({ stripeCustomerId: customerId });
        if (!user) break;

        const { planKey, interval, plan } = inferPlanFromSubscription(sub);

        await User.updateOne(
          { _id: user._id },
          {
            $set: {
              "subscription.id": sub.id,
              "subscription.planKey":
                planKey || user.subscription?.planKey || null,
              "subscription.interval":
                interval || user.subscription?.interval || null,
              "subscription.status": sub.status,
              "subscription.currentPeriodStart": new Date(
                sub.current_period_start * 1000
              ),
              "subscription.currentPeriodEnd": new Date(
                sub.current_period_end * 1000
              ),
              "subscription.cancelAtPeriodEnd": !!sub.cancel_at_period_end,
              "subscription.defaultPaymentMethodId":
                sub.default_payment_method || null,
              isPremium: ["active", "trialing"].includes(sub.status),
              plan: plan || "free",
            },
          }
        );
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        const subId = invoice.subscription;

        const sub = subId ? await stripe.subscriptions.retrieve(subId) : null;
        const user = await User.findOne({ stripeCustomerId: customerId });
        if (!user) break;

        await User.updateOne(
          { _id: user._id },
          {
            $set: {
              "subscription.status": sub?.status || "past_due",
              isPremium: ["active", "trialing"].includes(sub?.status || ""),
            },
          }
        );
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const customerId = sub.customer;

        const user = await User.findOne({ stripeCustomerId: customerId });
        if (!user) break;

        await User.updateOne(
          { _id: user._id },
          {
            $set: {
              "subscription.status": "canceled",
              isPremium: false,
              plan: "free", // remove plan on cancel
            },
          }
        );
        break;
      }

      default:
        // ignore others
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    res.status(500).send("Webhook handler failed");
  }
}

async function createPortalSession(req, res) {
  try {
    const user = req.user; // your auth sets this
    if (!user?.stripeCustomerId) {
      return res.status(400).json({ error: "Missing stripeCustomerId" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: process.env.APP_PORTAL_RETURN_URL,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create portal session" });
  }
}

module.exports = {
  createAccount,
  createAccountLink,
  returnAccountStatus,
  webHookHandler,
  createSubscription,
  payoutAccount,
  handleStripeWebHook,
  createPortalSession,
};

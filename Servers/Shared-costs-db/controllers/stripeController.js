const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

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

module.exports = {
  createAccount,
  createAccountLink,
  returnAccountStatus,
  webHookHandler,
  payoutAccount,
};

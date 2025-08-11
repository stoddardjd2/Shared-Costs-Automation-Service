import Stripe from "stripe";
import { create } from "../models/Request";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

const account =  await stripe.accounts.create({
  country: "US",
  email: "jenny.rosen@example.com",
//   controller: {
//     stripe_dashboard: {
//       type: "full",
//     },
//   },
  type:"standard"
});

async function createDynamicSplitCheckout(
  connectedAccountId,
  amountCents,
  label,
  yourCutCents
) {
  // amountCents: total to charge user B
  // label: dynamic product name/description
  // yourCutCents: how much to keep as application fee

  const session = await stripe.checkout.sessions.create(
    {
      payment_method_types: ["card", "link", "venmo", "cashapp"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: {
              name: label,
              description: `One-time payment of $${(amountCents / 100).toFixed(
                2
              )}`,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_intent_data: {
        application_fee_amount: yourCutCents,
        transfer_data: {
          destination: connectedAccountId,
        },
      },
      success_url:
        "https://yourapp.com/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://yourapp.com/canceled",
    },
    {
      stripeAccount: connectedAccountId, // Direct-charge style: connector bears net settlement
    }
  );

  return session.url;
}

// // Example
// createDynamicSplitCheckout(
//   'acct_1ABcDeFgHiJkLmnO', // User A
//   5000,                    // $50.00 total
//   'Custom Consultation',   // dynamic label
//   1000                     // $10.00 your platform fee
// ).then(url => console.log('Send B here:', url));
module.exports = {
  createDynamicSplitCheckout,
  account,
};

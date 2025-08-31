const User = require("../models/User");

// Helper to get or create Stripe Customer for a user
async function getOrCreateStripeCustomerForUser(userId, stripe) {
  // Step 1: Load user from your database
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Step 2: If already has a Stripe customerId, return it
  if (user.stripeCustomerId) {
    try {
      const existing = await stripe.customers.retrieve(user.stripeCustomerId);
      if (!existing.deleted) {
        return existing;
      }
    } catch (err) {
      console.error("Error retrieving existing Stripe customer:", err);
      // fall through to create a new one
    }
  }

  // Step 3: Create new Stripe customer
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name || undefined,
    metadata: {
      appUserId: user._id.toString(), // helpful for linking in Stripe dashboard
    },
  });

  // Step 4: Save back to your DB
  user.stripeCustomerId = customer.id;
  await user.save();

  // Step 5: Return Stripe customer object
  return customer;
}

module.exports = { getOrCreateStripeCustomerForUser };

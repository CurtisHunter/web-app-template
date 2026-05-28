//const db = require("../db/queries");
//const { body, validationResult, matchedData } = require("express-validator");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const supabase = require("../lib/supabase");

exports.healthCheck = async (req, res) => {
  res.json({ status: "ok" });
};

exports.createCheckoutSession = async (req, res) => {
  try {
    if (!process.env.STRIPE_PRICE_ID || !process.env.CLIENT_URL) {
      return res
        .status(500)
        .json({ error: "Stripe checkout is not configured" });
    }

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User id is required" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      client_reference_id: userId,
      metadata: {
        userId,
      },
      subscription_data: { metadata: { userId } },
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/?checkout=success`,
      cancel_url: `${process.env.CLIENT_URL}/?checkout=cancelled`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating Stripe checkout session", error);
    res.status(500).json({ error: "Could not create checkout session" });
  }
};

// update subscription if exists, insert if not. eg new subscription, new trialing, sub cancelled, paused status etc
async function upsertSubscription(subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error(
      "Stripe subscription is missing userId metadata:",
      subscription.id,
    );
    return;
  }

  const priceId = subscription.items?.data?.[0]?.price?.id || null;

  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: subscription.customer,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      price_id: priceId,
      current_period_end: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );

  if (error) {
    throw error;
  }
}

exports.handleStripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);
    return res.status(400).send(`Webhook Error ${error.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;

      console.log("Checkout completed for user:", session.client_reference_id);
      console.log("Stripe customer:", session.customer);
      console.log("Stripe subscription:", session.subscription);
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object;

      console.log(
        "Subscription event for user:",
        subscription.metadata?.userId,
      );
      console.log("Subscription status:", subscription.status);
      console.log("Stripe subscription:", subscription.id);
      await upsertSubscription(subscription);
      break;
    }

    case "invoice.paid":
    case "invoice.payment_failed": {
      const invoice = event.data.object;

      console.log("Invoice event:", event.type);
      console.log("Stripe customer:", invoice.customer);
      console.log("Stripe subscription:", invoice.subscription);
      break;
    }

    default:
      console.log("Unhandled Stripe webhook event:", event.type);
  }

  res.json({ received: true });
};

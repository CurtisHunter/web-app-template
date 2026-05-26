//const db = require("../db/queries");
//const { body, validationResult, matchedData } = require("express-validator");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
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

  console.log("Received Stripe webhook:", event.type);

  res.json({ received: true });
};

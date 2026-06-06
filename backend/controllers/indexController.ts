//const { body, validationResult, matchedData } = require("express-validator");

import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../types/express";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const supabase = require("../lib/supabase");
const { canUseMonthlyAllowance, recordUsageEvent } = require("../lib/usage");

exports.healthCheck = async (_req: Request, res: Response) => {
  res.json({ status: "ok" });
};

exports.createCheckoutSession = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!process.env.STRIPE_PRICE_ID || !process.env.CLIENT_URL) {
      return res
        .status(500)
        .json({ error: "Stripe checkout is not configured" });
    }

    const userId = req.user.id;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      client_reference_id: userId,
      metadata: {
        userId,
      },
      // Stripe subscription webhooks use this metadata to connect the Stripe
      // subscription back to the Supabase user without trusting the frontend.
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

// Stripe sends many events for the same subscription over time. Upsert keeps
// one row per Stripe subscription and updates status/period/price as it changes.
async function upsertSubscription(subscription: any) {
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

exports.handleStripeWebhook = async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"];

  let event: any;

  try {
    // Verify the event came from Stripe before trusting any billing data.
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error: any) {
    console.error("Stripe webhook signature verification failed", error);
    return res.status(400).send(`Webhook Error ${error.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;

      console.log("Checkout completed:", {
        hasUserReference: Boolean(session.client_reference_id),
        hasSubscription: Boolean(session.subscription),
      });
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      // Subscription events are the source of truth for whether the user has
      // Pro access. Invoice events are useful later for payment history.
      const subscription = event.data.object;

      console.log("Subscription event:", {
        type: event.type,
        status: subscription.status,
        hasUserMetadata: Boolean(subscription.metadata?.userId),
      });
      await upsertSubscription(subscription);
      break;
    }

    case "invoice.paid":
    case "invoice.payment_failed": {
      console.log("Invoice event:", event.type);
      break;
    }

    default:
      console.log("Unhandled Stripe webhook event:", event.type);
  }

  res.json({ received: true });
};

exports.getBillingStatus = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const user = req.user;

    // The frontend only needs a boolean. Keep Stripe ids, subscription rows,
    // and other billing details server-owned.
    const { data, error } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing"])
      .limit(1);

    if (error) {
      throw error;
    }

    res.json({ hasPro: data.length > 0 });
  } catch (error) {
    console.error("Error loading billing status:", error);
    res.status(500).json({ error: "Could not load billing status" });
  }
};

exports.useDemoExternalApi = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const user = req.user;

    // Hardcoded for now - this endpoint is just a demo of the pattern:
    // check allowance -> perform API call -> record usage
    const eventType = "demo_external_api";
    const monthlyLimit = 5;
    const prompt = req.body.prompt;
    const requestedUnits = 1;

    const allowance = await canUseMonthlyAllowance({
      userId: user.id,
      eventType,
      monthlyLimit,
      requestedUnits,
    });

    if (!allowance.allowed) {
      return res.status(429).json({
        error: "Monthly usage limit reached",
        ...allowance,
      });
    }

    // In a real route, the paid external API call would happen here.

    // Only record usage after the expensive action succeeds.
    await recordUsageEvent({
      userId: user.id,
      eventType,
      units: requestedUnits,
      metadata: {
        source: "demo_endpoint",
        promptLength: prompt.length,
      },
    });

    res.json({
      ok: true,
      usedUnits: allowance.usedUnits + requestedUnits,
      remainingUnits: Math.max(allowance.remainingUnits - requestedUnits, 0),
      monthlyLimit: allowance.monthlyLimit,
    });
  } catch (error) {
    console.error("Error using demo external API:", error);
    res.status(500).json({ error: "Could not use demo external API" });
  }
};

exports.createCustomerPortalSession = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const user = req.user;

    const { data, error } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing", "past_due"])
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data?.stripe_customer_id) {
      return res.status(404).json({ error: "No Stripe customer found" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: data.stripe_customer_id,
      return_url: process.env.CLIENT_URL,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating Stripe customer portal session:", error);
    res.status(500).json({ error: "Could not create customer portal session" });
  }
};

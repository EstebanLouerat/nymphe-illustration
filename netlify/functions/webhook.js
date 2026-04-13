// netlify/functions/webhook.js
// POST /api/webhook → reçoit les événements Stripe

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const sig = event.headers["stripe-signature"];
  let stripeEvent;

  try {
    // event.body est une string — Netlify Functions le gère automatiquement
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object;
    console.log("✅ Paiement confirmé:", session.id);
    console.log("   Email:", session.customer_details?.email);
    console.log("   Montant:", session.amount_total / 100, session.currency?.toUpperCase());

    // TODO : envoyer un email de confirmation, mettre à jour une base de données, etc.
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
};

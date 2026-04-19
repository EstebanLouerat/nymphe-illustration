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
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object;
    console.log("✅ Paiement confirmé:", session.id);
    console.log("   Email:", session.customer_details?.email);
    console.log(
      "   Montant:",
      session.amount_total / 100,
      session.currency?.toUpperCase(),
    );

    // Récupère les line items pour identifier les produits achetés
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

    // Appel interne à la fonction popularity
    const store = getStore("popularity");
    const existing = (await store.get("counts", { type: "json" }))?.value ?? {};

    for (const item of lineItems.data) {
      // L'id Contentful est passé en metadata de chaque product
      const contentfulId = item.price?.product_metadata?.contentful_id;
      if (contentfulId) {
        existing[contentfulId] =
          (existing[contentfulId] ?? 0) + (item.quantity ?? 1);
      }
    }
    await store.set("counts", JSON.stringify(existing));
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
};

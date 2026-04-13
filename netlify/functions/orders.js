// netlify/functions/orders.js
// GET /api/orders/:sessionId → vérifie le statut d'une commande

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // L'URL sera /api/orders?session_id=cs_xxx
  const sessionId = event.queryStringParameters?.session_id;

  if (!sessionId) {
    return { statusCode: 400, body: JSON.stringify({ error: "session_id requis" }) };
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: session.payment_status,
        customerEmail: session.customer_details?.email,
        amountTotal: session.amount_total,
        currency: session.currency,
      }),
    };
  } catch (err) {
    return { statusCode: 404, body: JSON.stringify({ error: "Commande introuvable" }) };
  }
};

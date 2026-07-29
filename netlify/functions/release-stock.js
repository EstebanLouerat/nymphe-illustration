// netlify/functions/release-stock.js
// POST /api/release-stock  body: { sessionId }
// Appelé quand l'acheteur annule sur l'écran Stripe : libère
// immédiatement la réservation au lieu d'attendre le TTL.
//
// Sécurité : on interroge Stripe pour vérifier que la session existe
// et n'est PAS payée. Une session payée ne peut jamais être libérée.

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const json = (statusCode, payload) => ({
  statusCode,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  body: JSON.stringify(payload),
});

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let sessionId;
  try {
    ({ sessionId } = JSON.parse(event.body || "{}"));
  } catch {
    return json(400, { error: "Invalid JSON" });
  }

  if (typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
    return json(400, { error: "sessionId invalide" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Paiement abouti (ou en cours de traitement) → on ne touche à rien
    if (session.status === "complete" || session.payment_status === "paid") {
      return json(409, { released: false, reason: "session_paid" });
    }

    // Expirer la session empêche tout paiement ultérieur avec cette URL.
    // Stripe émettra `checkout.session.expired` ; release_stock étant
    // idempotent, le webhook ne fera rien de plus.
    if (session.status === "open") {
      await stripe.checkout.sessions
        .expire(sessionId)
        .catch((e) => console.error("session expire failed:", e.message));
    }

    const { data: released, error } = await supabase.rpc("release_stock", {
      p_session_id: sessionId,
    });

    if (error) {
      console.error("release_stock error:", error.message);
      return json(500, { error: "Libération du stock impossible" });
    }

    return json(200, { released: true, rows: released ?? 0 });
  } catch (err) {
    console.error("release-stock error:", err.message);
    return json(500, { error: err.message });
  }
};

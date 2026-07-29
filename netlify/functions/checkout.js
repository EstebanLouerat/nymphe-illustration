// netlify/functions/checkout.js
// POST /api/checkout → appelé depuis PaymentService.createCheckoutSession()

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const SHIPPING_RATE_ID = "shr_1TNTsDLMUOoqSMpemmbp6C4V";

// Service role : la réservation de stock doit bypasser RLS
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// La session Stripe expire au bout de 31 min (minimum autorisé : 30),
// la réservation de stock quelques minutes après → aucune fenêtre où
// le stock serait libre alors que la session est encore payable.
const SESSION_TTL_MINUTES = 31;
const RESERVATION_TTL_MINUTES = 40;

const sanitizeImageUrl = (url) => {
  if (!url) return null;
  try {
    return encodeURI(decodeURI(url)); // idempotent si déjà encodée
  } catch {
    return null;
  }
};

const stockConflict = (unavailable) => ({
  statusCode: 409,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    error: "Stock insuffisant",
    code: "STOCK_UNAVAILABLE",
    unavailable: (unavailable ?? []).map((u) => ({
      id: u.contentful_id,
      requested: u.requested,
      available: u.available,
    })),
  }),
});

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let items, customer, promoId;
  try {
    ({ items, customer, promoId } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  if (!items || items.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "No items provided" }),
    };
  }

  const origin =
    event.headers.origin ||
    process.env.URL ||
    "https://nympheillustration.com"; /* fallback en cas de dev local sans proxy */

  // Articles au format attendu par les RPC de stock
  const stockItems = items
    .map((item) => ({
      contentful_id: item?.id ?? null,
      quantity: Math.max(1, Number(item?.quantity) || 1),
    }))
    .filter((i) => typeof i.contentful_id === "string" && i.contentful_id.length > 0);

  try {
    // ── Pré-vérification : évite de créer une session vouée à l'échec
    if (stockItems.length > 0) {
      const { data: availability, error: checkError } = await supabase.rpc(
        "check_stock",
        { p_items: stockItems },
      );
      if (checkError) {
        console.error("check_stock error:", checkError.message);
      } else if (availability?.ok === false) {
        return stockConflict(
          (availability.items ?? [])
            .filter((i) => i.ok === false)
            .map((i) => ({
              contentful_id: i.contentful_id,
              requested: i.requested,
              available: i.available,
            })),
        );
      }
    }

    const lineItems = items.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.titre,
          metadata: { contentful_id: item.id },
          description: item.selectedFormat
            ? `Format : ${item.selectedFormat}`
            : undefined,
          images: sanitizeImageUrl(item.image)
            ? [sanitizeImageUrl(item.image)]
            : [],
        },
        unit_amount: Math.round((item.prix || 0) * 100),
      },
      quantity: item.quantity || 1,
    }));

    const sessionParams = {
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      customer_email: customer?.email || undefined,
      metadata: {
        customer_name: customer?.name || "",
        customer_address: customer?.address || "",
        customer_city: customer?.city || "",
        customer_zip: customer?.zip || "",
        customer_country: customer?.country || "",
        promo_id: promoId || "",
      },
      shipping_options: [{ shipping_rate: SHIPPING_RATE_ID }],
      expires_at: Math.floor(Date.now() / 1000) + SESSION_TTL_MINUTES * 60,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
    };

    if (promoId) {
      sessionParams.discounts = [{ promotion_code: promoId }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // ── Réservation atomique du stock, liée à la session Stripe.
    // Deux acheteurs sur le dernier exemplaire : les lignes sont
    // verrouillées côté Postgres, le second reçoit un 409.
    if (stockItems.length > 0) {
      const { data: reservation, error: reserveError } = await supabase.rpc(
        "reserve_stock",
        {
          p_session_id: session.id,
          p_items: stockItems,
          p_ttl_minutes: RESERVATION_TTL_MINUTES,
        },
      );

      if (reserveError || reservation?.ok === false) {
        // Session inutilisable → on l'expire pour éviter un paiement fantôme
        await stripe.checkout.sessions
          .expire(session.id)
          .catch((e) => console.error("session expire failed:", e.message));

        if (reserveError) {
          console.error("reserve_stock error:", reserveError.message);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: "Impossible de réserver le stock" }),
          };
        }
        return stockConflict(reservation.unavailable);
      }
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkoutUrl: session.url, sessionId: session.id }),
    };
  } catch (err) {
    console.error("Stripe error:", err.message);

    // Stripe rejected the promo code — tell the frontend to clear it
    if (
      promoId &&
      err.type === "StripeInvalidRequestError" &&
      (err.param?.includes("discount") || err.message?.includes("promotion"))
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Code promo invalide",
          code: "PROMO_INVALID",
        }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

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

// Prix, titre et image font foi depuis Contentful, jamais depuis le client
// (token Delivery en lecture seule, le même que celui du front)
const CONTENTFUL_SPACE_ID =
  process.env.CONTENTFUL_SPACE_ID ?? process.env.VITE_CONTENTFUL_SPACE_ID;
const CONTENTFUL_ACCESS_TOKEN =
  process.env.CONTENTFUL_ACCESS_TOKEN ?? process.env.VITE_CONTENTFUL_ACCESS_TOKEN;

const MAX_LINE_ITEMS = 50;
const MAX_QUANTITY = 99;
const ENTRY_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
const FORMAT_RE = /^[\p{L}\p{N} ._-]{1,20}$/u;

const badRequest = (error, extra = {}) => ({
  statusCode: 400,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ error, ...extra }),
});

// Map contentful_id → { titre, prix, image } pour les illustrations demandées
const fetchCatalog = async (ids) => {
  if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
    throw new Error("Contentful credentials missing");
  }

  const url = new URL(
    `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/entries`,
  );
  url.searchParams.set("content_type", "nympheIllustration");
  url.searchParams.set("sys.id[in]", ids.join(","));
  url.searchParams.set("limit", "100");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${CONTENTFUL_ACCESS_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Contentful HTTP ${res.status}`);
  const data = await res.json();

  const assets = new Map(
    (data.includes?.Asset ?? []).map((a) => [a.sys.id, a.fields?.file?.url]),
  );

  return new Map(
    (data.items ?? []).map((entry) => {
      const f = entry.fields ?? {};
      const assetUrl = assets.get(f.image?.sys?.id);
      return [
        entry.sys.id,
        {
          titre: f.titre || "Sans titre",
          prix: Number(f.prix),
          image: assetUrl ? `https:${assetUrl}?w=600&fm=webp&q=80` : null,
        },
      ];
    }),
  );
};

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

  if (!Array.isArray(items) || items.length === 0) {
    return badRequest("No items provided");
  }
  if (items.length > MAX_LINE_ITEMS) {
    return badRequest("Trop d'articles dans le panier");
  }

  // Du panier client on ne garde que l'identifiant, la quantité et le format
  const cartItems = [];
  for (const item of items) {
    const id = item?.id;
    const quantity = Number(item?.quantity ?? 1);
    if (
      typeof id !== "string" ||
      !ENTRY_ID_RE.test(id) ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_QUANTITY
    ) {
      return badRequest("Article invalide", { code: "ITEM_INVALID" });
    }
    const format =
      typeof item.selectedFormat === "string" &&
      FORMAT_RE.test(item.selectedFormat)
        ? item.selectedFormat
        : null;
    cartItems.push({ id, quantity, format });
  }

  const origin =
    event.headers.origin ||
    process.env.URL ||
    "https://nympheillustration.com"; /* fallback en cas de dev local sans proxy */

  // Articles au format attendu par les RPC de stock
  const stockItems = cartItems.map((item) => ({
    contentful_id: item.id,
    quantity: item.quantity,
  }));

  let catalog;
  try {
    catalog = await fetchCatalog([...new Set(cartItems.map((i) => i.id))]);
  } catch (err) {
    console.error("Contentful error:", err.message);
    return {
      statusCode: 502,
      body: JSON.stringify({ error: "Catalogue indisponible" }),
    };
  }

  const unknownIds = cartItems
    .filter((item) => !(catalog.get(item.id)?.prix > 0))
    .map((item) => item.id);
  if (unknownIds.length > 0) {
    return badRequest("Article introuvable", {
      code: "ITEM_UNAVAILABLE",
      ids: unknownIds,
    });
  }

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

    const lineItems = cartItems.map((item) => {
      const product = catalog.get(item.id);
      const image = sanitizeImageUrl(product.image);
      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: product.titre,
            metadata: { contentful_id: item.id },
            description: item.format ? `Format : ${item.format}` : undefined,
            images: image ? [image] : [],
          },
          unit_amount: Math.round(product.prix * 100),
        },
        quantity: item.quantity,
      };
    });

    const sessionParams = {
      allowed_payment_method_types: ["card"],
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
      cancel_url: `${origin}/checkout/cancel?session_id={CHECKOUT_SESSION_ID}`,
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

// netlify/functions/checkout.js
// POST /api/checkout → appelé depuis PaymentService.createCheckoutSession()

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const SHIPPING_RATE_ID = "shr_1TNTsDLMUOoqSMpemmbp6C4V";

const sanitizeImageUrl = (url) => {
  if (!url) return null;
  try {
    return encodeURI(decodeURI(url)); // idempotent si déjà encodée
  } catch {
    return null;
  }
};

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

  try {
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
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
    };

    if (promoId) {
      sessionParams.discounts = [{ promotion_code: promoId }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

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

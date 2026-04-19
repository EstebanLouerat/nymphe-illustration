// netlify/functions/checkout.js
// POST /api/checkout → appelé depuis PaymentService.createCheckoutSession()

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let items, customer;
  try {
    ({ items, customer } = JSON.parse(event.body));
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
    "https://nympheillustration.netlify.app";

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
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round((item.prix || 0) * 100),
      },
      quantity: item.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
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
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkoutUrl: session.url, sessionId: session.id }),
    };
  } catch (err) {
    console.error("Stripe error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const SHIPPING_RATE_ID = "shr_1TNTsDLMUOoqSMpemmbp6C4V";

export const handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  try {
    const rate = await stripe.shippingRates.retrieve(SHIPPING_RATE_ID);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: rate.fixed_amount.amount / 100,
        currency: rate.fixed_amount.currency,
        display_name: rate.display_name,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

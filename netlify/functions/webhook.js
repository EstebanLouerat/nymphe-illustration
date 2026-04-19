import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Service role key pour bypasser RLS côté serveur
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const sig = event.headers["stripe-signature"];
  let stripeEvent;

  try {
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
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ["data.price.product"],
    });

    const email = session.customer_details?.email;

    // Trouver le user Supabase par email
    let userId = null;
    if (email) {
      const { data: users } = await supabase.auth.admin.listUsers();
      const match = users?.users?.find((u) => u.email === email);
      userId = match?.id ?? null;
    }

    // Formater les items pour la DB
    const items = lineItems.data.map((item) => ({
      titre: item.description,
      prix: (item.price?.unit_amount ?? 0) / 100,
      quantity: item.quantity,
      contentful_id: item.price?.product?.metadata?.contentful_id ?? null,
    }));

    // Sauvegarder la commande
    await supabase.from("orders").insert({
      user_id: userId,
      stripe_session_id: session.id,
      customer_email: email,
      items,
      amount_total: session.amount_total,
      currency: session.currency,
    });

    // Popularité (logique existante conservée)
    const store = getStore("popularity");
    const existing = (await store.get("counts", { type: "json" }))?.value ?? {};
    for (const item of lineItems.data) {
      const contentfulId = item.price?.product?.metadata?.contentful_id;
      if (contentfulId) {
        existing[contentfulId] =
          (existing[contentfulId] ?? 0) + (item.quantity ?? 1);
      }
    }
    await store.set("counts", JSON.stringify(existing));
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};

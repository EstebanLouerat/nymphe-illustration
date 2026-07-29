import Stripe from "stripe";
import { getStore } from "@netlify/blobs";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

console.log("STRIPE KEY:", process.env.STRIPE_SECRET_KEY?.slice(0, 8));

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
    await supabase.from("orders").upsert(
      {
        user_id: userId,
        stripe_session_id: session.id,
        customer_email: email,
        items,
        amount_total: session.amount_total,
        currency: session.currency,
      },
      { onConflict: "stripe_session_id", ignoreDuplicates: true },
    );

    // ── Stock : la réservation posée au checkout devient une vente.
    // Idempotent → un rejeu du webhook ne déduit pas deux fois.
    try {
      const { data: confirmation, error: confirmError } = await supabase.rpc(
        "confirm_stock",
        { p_session_id: session.id },
      );
      if (confirmError) throw new Error(confirmError.message);

      if (confirmation?.action === "none") {
        // Aucune réservation pour cette session (paiement hors tunnel,
        // session antérieure à la mise en place du stock) → décrément
        // direct borné à 0 : le paiement est encaissé, on n'échoue pas.
        const stockItems = items
          .filter((i) => i.contentful_id)
          .map((i) => ({
            contentful_id: i.contentful_id,
            quantity: i.quantity ?? 1,
          }));

        if (stockItems.length > 0) {
          const { data: decrement, error: decrementError } = await supabase.rpc(
            "decrement_stock",
            { p_items: stockItems },
          );
          if (decrementError) throw new Error(decrementError.message);
          if (decrement?.oversold?.length > 0) {
            console.error(
              `Stock survendu (session ${session.id}):`,
              JSON.stringify(decrement.oversold),
            );
          }
        }
      }
    } catch (err) {
      // Jamais de 500 ici : Stripe rejouerait le webhook et dupliquerait
      // la commande. On loggue pour reprise manuelle.
      console.error(
        `Mise à jour du stock échouée (session ${session.id}):`,
        err.message,
      );
    }

    // Popularité (logique existante conservée)
    try {
      const store = getStore("popularity");
      const existing =
        (await store.get("counts", { type: "json" }))?.value ?? {};
      for (const item of lineItems.data) {
        const contentfulId = item.price?.product?.metadata?.contentful_id;
        if (contentfulId) {
          existing[contentfulId] =
            (existing[contentfulId] ?? 0) + (item.quantity ?? 1);
        }
      }
      await store.set("counts", JSON.stringify(existing));
    } catch (err) {
      console.error("Mise à jour de la popularité échouée:", err.message);
    }
  }

  // Session abandonnée / paiement échoué → on rend le stock réservé
  if (
    stripeEvent.type === "checkout.session.expired" ||
    stripeEvent.type === "checkout.session.async_payment_failed"
  ) {
    const session = stripeEvent.data.object;
    const { error } = await supabase.rpc("release_stock", {
      p_session_id: session.id,
    });
    if (error) {
      console.error(
        `release_stock échoué (session ${session.id}):`,
        error.message,
      );
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};

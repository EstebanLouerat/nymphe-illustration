// netlify/functions/stock.js
//  GET  /api/stock            → { stock: { [contentful_id]: quantity } }
//  GET  /api/stock?ids=a,b    → idem, filtré
//  POST /api/stock            → validation serveur avant ajout au panier
//       body : { items: [{ id, quantity }] }
//       →      { ok, items: [{ id, requested, available, tracked, ok }] }
//
//  Une illustration absente de `illustration_stock` n'est pas suivie
//  (stock illimité) → tracked: false, available: null.

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const json = (statusCode, payload) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  },
  body: JSON.stringify(payload),
});

export const handler = async (event) => {
  if (event.httpMethod === "GET") {
    // Restitue le stock des réservations expirées avant de lire
    await supabase.rpc("release_expired_reservations");

    const idsParam = event.queryStringParameters?.ids?.trim();
    let query = supabase.from("illustration_stock").select("contentful_id, quantity");

    if (idsParam) {
      const ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
      if (ids.length === 0) return json(200, { stock: {} });
      query = query.in("contentful_id", ids);
    }

    const { data, error } = await query;
    if (error) {
      console.error("stock GET error:", error.message);
      return json(500, { error: "Impossible de lire le stock" });
    }

    const stock = {};
    for (const row of data ?? []) stock[row.contentful_id] = row.quantity;
    return json(200, { stock });
  }

  if (event.httpMethod === "POST") {
    let items;
    try {
      ({ items } = JSON.parse(event.body || "{}"));
    } catch {
      return json(400, { error: "Invalid JSON" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return json(400, { error: "Aucun article fourni" });
    }

    const payload = items
      .map((i) => ({
        contentful_id: i?.contentful_id ?? i?.id ?? null,
        quantity: Math.max(1, Number(i?.quantity) || 1),
      }))
      .filter((i) => typeof i.contentful_id === "string" && i.contentful_id.length > 0);

    if (payload.length === 0) {
      return json(400, { error: "Identifiants d'articles invalides" });
    }

    const { data, error } = await supabase.rpc("check_stock", { p_items: payload });
    if (error) {
      console.error("check_stock error:", error.message);
      return json(500, { error: "Impossible de vérifier le stock" });
    }

    return json(200, {
      ok: data?.ok ?? true,
      items: (data?.items ?? []).map((row) => ({
        id: row.contentful_id,
        requested: row.requested,
        available: row.available,
        tracked: row.tracked,
        ok: row.ok,
      })),
    });
  }

  return { statusCode: 405, body: "Method Not Allowed" };
};

// ============================================================
//  services/stock.js — Disponibilité des illustrations
//  Lecture : Supabase (table publique en lecture seule)
//  Validation : /api/stock (service role = source de vérité)
// ============================================================

import axios from "axios";
import { supabase } from "./supabase";

/**
 * Une illustration absente de `illustration_stock` n'est pas suivie
 * en stock → disponibilité illimitée (`null`).
 *
 * @typedef {Object} StockCheckItem
 * @property {string} id
 * @property {number} requested
 * @property {number|null} available
 * @property {boolean} tracked
 * @property {boolean} ok
 */

export const StockService = {
  /**
   * @returns {Promise<Record<string, number>>} { [contentful_id]: quantité }
   */
  async fetchStockMap() {
    const { data, error } = await supabase
      .from("illustration_stock")
      .select("contentful_id, quantity");

    if (error) {
      // Repli sur la fonction serveur (service role) si la lecture publique échoue
      console.error("Erreur fetchStockMap:", error.message);
      try {
        const { data: fallback } = await axios.get("/api/stock");
        return fallback?.stock ?? {};
      } catch {
        return {};
      }
    }

    const map = {};
    for (const row of data ?? []) map[row.contentful_id] = row.quantity;
    return map;
  },

  /**
   * Validation serveur avant ajout au panier / incrément de quantité.
   * @param {{ id: string, quantity: number }[]} items
   * @returns {Promise<{ ok: boolean, items: StockCheckItem[] }>}
   * @throws si l'API est injoignable (l'appelant décide du repli)
   */
  async checkAvailability(items) {
    const { data } = await axios.post("/api/stock", { items });
    return data;
  },

  /**
   * Libère la réservation d'une session Stripe abandonnée.
   * Le serveur refuse si la session a été payée.
   * @param {string} sessionId
   * @returns {Promise<boolean>} true si le stock a été rendu
   */
  async releaseSession(sessionId) {
    try {
      const { data } = await axios.post("/api/release-stock", { sessionId });
      return data?.released === true;
    } catch (err) {
      // Pas bloquant : le TTL de la réservation prendra le relais
      console.error("Libération du stock impossible:", err?.message ?? err);
      return false;
    }
  },
};

export default StockService;

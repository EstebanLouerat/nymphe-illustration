// ============================================================
//  services/api.js — Service API centralisé
//  Gère tous les appels Contentful + Paiement
// ============================================================

import axios from "axios";

const CONTENTFUL_SPACE_ID = import.meta.env.VITE_CONTENTFUL_SPACE_ID;
const CONTENTFUL_ACCESS_TOKEN = import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN;
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

const contentfulAPI = axios.create({
  baseURL: `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}`,
  params: {
    access_token: CONTENTFUL_ACCESS_TOKEN,
  },
});

/**
 *  Contentful API
 */
export const ContentfulService = {
  /**
   * Récupère un contenu générique par label
   * @param {string} label - Le label du contenu
   * @returns {Promise<{label, image, text}>}
   */
  async fetchContent(label) {
    try {
      const { data } = await contentfulAPI.get("/entries", {
        params: { content_type: "content" },
      });

      const entry = data.items.find((item) => item.fields.label === label);
      if (!entry) return null;

      const imageField = entry.fields.image || entry.fields.media;
      let imageUrl = null;

      if (imageField?.sys?.id) {
        const asset = data.includes?.Asset?.find(
          (a) => a.sys.id === imageField.sys.id,
        );
        if (asset) {
          imageUrl = `https:${asset.fields.file.url}?w=800&fm=webp&q=85`;
        }
      }

      return {
        label,
        image: imageUrl,
        text: entry.fields.text || entry.fields.description || null,
      };
    } catch (err) {
      console.error(`Erreur fetchContent(${label}):`, err);
      return null;
    }
  },

  /**
   * Récupère les illustrations
   * @returns {Promise<Array>}
   */
  async fetchIllustrations() {
    try {
      const { data } = await contentfulAPI.get("/entries", {
        params: {
          content_type: "nympheIllustration",
          order: "-sys.createdAt",
          limit: 12,
        },
      });

      const assets = {};
      (data.includes?.Asset || []).forEach((a) => {
        assets[a.sys.id] = `https:${a.fields.file.url}`;
      });

      return data.items.map((item) => {
        const f = item.fields;
        const imgId = f.image?.sys?.id;
        const imgSrc =
          imgId && assets[imgId] ? `${assets[imgId]}?w=600&fm=webp&q=80` : null;

        return {
          id: item.sys.id,
          titre: f.titre || "Sans titre",
          prix: f.prix || 0,
          description: f.description || "",
          image: imgSrc,
          category: f.category || "",
        };
      });
    } catch (err) {
      console.error("Erreur fetchIllustrations:", err);
      return [];
    }
  },

  /**
   * Récupère une illustration par ID
   * @param {string} id - ID Contentful
   * @returns {Promise<Object>}
   */
  async fetchIllustrationById(id) {
    try {
      const { data } = await contentfulAPI.get(`/entries/${id}`, {
        params: { include: 10 },
      });

      const assets = {};
      (data.includes?.Asset || []).forEach((a) => {
        assets[a.sys.id] = `https:${a.fields.file.url}`;
      });

      const f = data.fields;
      const imgId = f.image?.sys?.id;
      let imgSrc = null;

      // Si l'asset est dans les includes, utiliser l'URL complète
      if (imgId && assets[imgId]) {
        imgSrc = `${assets[imgId]}?w=800&fm=webp&q=80`;
      } else if (imgId) {
        try {
          const assetData = await contentfulAPI.get(`/assets/${imgId}`);
          if (assetData.data.fields?.file?.url) {
            const assetUrl = `https:${assetData.data.fields.file.url}`;
            imgSrc = `${assetUrl}?w=800&fm=webp&q=80`;
          }
        } catch (assetErr) {
          console.error(`Erreur récupération asset ${imgId}:`, assetErr);
        }
      }

      return {
        id: data.sys.id,
        titre: f.titre || "Sans titre",
        prix: f.prix || 0,
        description: f.description || "",
        image: imgSrc,
        category: f.category || "",
        tag: f.tag || [],
      };
    } catch (err) {
      console.error(`Erreur fetchIllustrationById(${id}):`, err);
      return null;
    }
  },
};

/**
 *  Paiement API (Stripe)
 */
export const PaymentService = {
  /**
   * Crée une session Stripe Checkout
   * @param {Array} items - Articles à payer
   * @param {Object} customer - Info client
   * @returns {Promise<{sessionId}>}
   */
  async createCheckoutSession(items, customer) {
    try {
      // À remplacer par un vrai appel backend
      const response = await axios.post("/api/checkout", {
        items,
        customer,
      });
      return response.data;
    } catch (err) {
      console.error("Erreur createCheckoutSession:", err);
      throw err;
    }
  },

  /**
   * Récupère le statut d'une commande
   * @param {string} orderId
   * @returns {Promise<Object>}
   */
  async fetchOrderStatus(orderId) {
    try {
      const response = await axios.get(`/api/orders/${orderId}`);
      return response.data;
    } catch (err) {
      console.error(`Erreur fetchOrderStatus(${orderId}):`, err);
      return null;
    }
  },
};

/**
 *  Contact & Commission API (Formspree)
 */
export const FormService = {
  /**
   * Envoie un formulaire de contact
   * @param {Object} data - Données du formulaire
   * @returns {Promise<{ok, message}>}
   */
  async submitContact(data) {
    try {
      const response = await axios.post(
        `https://formspree.io/f/${import.meta.env.VITE_FORMSPREE_CONTACT_ID}`,
        data,
      );
      return { ok: true, message: "Message envoyé !" };
    } catch (err) {
      console.error("Erreur submitContact:", err);
      return { ok: false, message: "Erreur lors de l'envoi" };
    }
  },

  /**
   * Envoie une demande de commission
   * @param {Object} data
   * @returns {Promise<{ok, message}>}
   */
  async submitCommission(data) {
    try {
      const response = await axios.post(
        `https://formspree.io/f/${import.meta.env.VITE_FORMSPREE_COMMISSION_ID}`,
        data,
      );
      return { ok: true, message: "Demande envoyée !" };
    } catch (err) {
      console.error("Erreur submitCommission:", err);
      return { ok: false, message: "Erreur lors de l'envoi" };
    }
  },
};

export default {
  ContentfulService,
  PaymentService,
  FormService,
};

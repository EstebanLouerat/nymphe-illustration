// ============================================================
//  services/api.js — Service API centralisé
//  Gère tous les appels Contentful + Paiement
// ============================================================

import axios from "axios";

const CONTENTFUL_SPACE_ID = import.meta.env.VITE_CONTENTFUL_SPACE_ID;
const CONTENTFUL_ACCESS_TOKEN = import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN;

const contentfulAPI = axios.create({
  baseURL: `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}`,
  params: { access_token: CONTENTFUL_ACCESS_TOKEN },
});

export const ContentfulService = {
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
        if (asset)
          imageUrl = `https:${asset.fields.file.url}?w=800&fm=webp&q=85`;
      }
      return {
        label,
        image: imageUrl,
        title: entry.fields.title || null,
        text: entry.fields.text || entry.fields.description || null,
      };
    } catch (err) {
      console.error(`Erreur fetchContent(${label}):`, err);
      return null;
    }
  },

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
          category: f.categorie || "",
        };
      });
    } catch (err) {
      console.error("Erreur fetchIllustrations:", err);
      return [];
    }
  },

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
      if (imgId && assets[imgId]) {
        imgSrc = `${assets[imgId]}?w=800&fm=webp&q=80`;
      } else if (imgId) {
        try {
          const assetData = await contentfulAPI.get(`/assets/${imgId}`);
          if (assetData.data.fields?.file?.url)
            imgSrc = `https:${assetData.data.fields.file.url}?w=800&fm=webp&q=80`;
        } catch {}
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

export const PaymentService = {
  async createCheckoutSession(items, customer) {
    try {
      const response = await axios.post("/api/checkout", { items, customer });
      return response.data;
    } catch (err) {
      console.error("Erreur createCheckoutSession:", err);
      throw err;
    }
  },

  async fetchOrderStatus(sessionId) {
    try {
      const response = await axios.get(`/api/orders?session_id=${sessionId}`);
      return response.data;
    } catch (err) {
      console.error(`Erreur fetchOrderStatus(${sessionId}):`, err);
      return null;
    }
  },
};

export const FormService = {
  async submitContact(data) {
    try {
      await axios.post(
        `https://formspree.io/f/${import.meta.env.VITE_FORMSPREE_CONTACT_ID}`,
        data,
      );
      return { ok: true, message: "Message envoyé !" };
    } catch {
      return { ok: false, message: "Erreur lors de l'envoi" };
    }
  },

  async submitCommission(data) {
    try {
      await axios.post(
        `https://formspree.io/f/${import.meta.env.VITE_FORMSPREE_COMMISSION_ID}`,
        data,
      );
      return { ok: true, message: "Demande envoyée !" };
    } catch {
      return { ok: false, message: "Erreur lors de l'envoi" };
    }
  },
};

export default { ContentfulService, PaymentService, FormService };

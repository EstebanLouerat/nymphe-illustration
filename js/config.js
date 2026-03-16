// ============================================================
//  config.js — Variables de configuration
//  Récupère les credentials depuis js/.env.js
// ============================================================

// Variables d'environnement (chargées depuis .env.js)
const CONTENTFUL_SPACE_ID =
  typeof window !== "undefined" && window.ENV
    ? window.ENV.CONTENTFUL_SPACE_ID
    : "";

const CONTENTFUL_ACCESS_TOKEN =
  typeof window !== "undefined" && window.ENV
    ? window.ENV.CONTENTFUL_ACCESS_TOKEN
    : "";

// Export pour les modules ES
if (typeof module !== "undefined" && module.exports) {
  module.exports = { CONTENTFUL_SPACE_ID, CONTENTFUL_ACCESS_TOKEN };
}

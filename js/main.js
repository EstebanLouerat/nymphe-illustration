// ============================================================
//  main.js — Point d'entrée principal
//  Initialise tous les modules et listeners
// ============================================================

document.addEventListener("DOMContentLoaded", async function () {
  // ── Icônes ────────────────────────────────────────────────
  UI.initIcons();

  // ── Image du Hero (chargée depuis Contentful) ──────────────
  const heroImg = document.querySelector(".hero-img");
  if (heroImg) {
    const heroImageUrl = await ContentfulAPI.fetchContent("Hero Image");
    if (heroImageUrl) {
      heroImg.src = heroImageUrl.image;
      heroImg.alt = heroImageUrl.label;
    }
  }

  // ── Image du logo (chargée depuis Contentful) ──────────────
  const logoImg = document.querySelector(".logo-img");
  if (logoImg) {
    const logoImageUrl = await ContentfulAPI.fetchContent("Logo");
    if (logoImageUrl) {
      logoImg.src = logoImageUrl.image;
      logoImg.alt = logoImageUrl.label;
    }
  }

  // ── Panier ─────────────────────────────────────────────────
  Cart.init();

  const cartToggle = document.getElementById("cart-toggle");
  if (cartToggle) {
    cartToggle.addEventListener("click", () => Cart.openPanel());
  }

  const cartOverlay = document.getElementById("cart-overlay");
  if (cartOverlay) {
    cartOverlay.addEventListener("click", () => Cart.closePanel());
  }

  // ── Menu mobile ───────────────────────────────────────────
  const hamburger = document.getElementById("hamburger");
  if (hamburger) {
    hamburger.addEventListener("click", () => UI.toggleMobileMenu());
  }

  // ── Contentful (page d'accueil) ────────────────────────────
  const productGrid = document.getElementById("product-grid");
  if (productGrid) {
    const loading = document.getElementById("grid-loading");
    const placeholder = document.getElementById("grid-placeholder");

    const items = await ContentfulAPI.fetchIllustrations();

    if (items === null) {
      // Erreur ou configuration incomplète
      if (loading) loading.style.display = "none";
      if (placeholder) placeholder.style.display = "block";
    } else if (items.length === 0) {
      // Aucune illustration
      if (loading)
        loading.innerHTML = "Aucune illustration publiée pour l'instant.";
    } else {
      // Succès
      if (loading) loading.style.display = "none";
      if (placeholder) placeholder.style.display = "none";
      ContentfulAPI.renderGrid(productGrid, items);
    }
  }
});

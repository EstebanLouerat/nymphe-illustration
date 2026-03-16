// ============================================================
//  about-page.js — Logique de la page à propos
// ============================================================

document.addEventListener("DOMContentLoaded", function () {
  // Initialiser les icônes
  UI.initIcons();

  // Hamburger menu
  const hamburger = document.getElementById("hamburger");
  if (hamburger) {
    hamburger.addEventListener("click", () => UI.toggleMobileMenu());
  }
});

// ============================================================
//  modules/ui.js — Fonctions UI générales
// ============================================================

const UI = {
  /**
   * Initialise les icônes Lucide
   */
  initIcons() {
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  },

  /**
   * Bascule le menu mobile
   */
  toggleMobileMenu() {
    const menu = document.getElementById("mobile-menu");
    if (menu) {
      menu.classList.toggle("open");
    }
  },

  /**
   * Affiche une notification toast
   * @param {string} message - Message à afficher
   * @param {number} duration - Durée en ms (défaut: 2500)
   */
  showToast(message, duration = 2500) {
    const toast = document.getElementById("cart-toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, duration);
  },

  /**
   * Active le lien de navigation actuelle
   * @param {string} page - Nom de la page (ex: 'index', 'about')
   */
  setActiveNavLink(page) {
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active");
      const href = link.getAttribute("href");
      if (href && href.includes(page)) {
        link.classList.add("active");
      }
    });
  },
};

// Export pour les modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = UI;
}

// ============================================================
//  modules/cart.js — Logique panier partagée
//  Stockage : localStorage (persiste entre les sessions)
// ============================================================

const Cart = {
  // ── Lecture / écriture ─────────────────────────────────────
  getItems() {
    try {
      return JSON.parse(localStorage.getItem("nymphe_cart") || "[]");
    } catch {
      return [];
    }
  },

  save(items) {
    localStorage.setItem("nymphe_cart", JSON.stringify(items));
    Cart.updateBadge();
    Cart.renderPanel();
  },

  // ── Ajouter un article ─────────────────────────────────────
  add(item) {
    // item = { id, titre, prix, image }
    const items = Cart.getItems();
    const existing = items.find((i) => i.id === item.id);
    if (existing) {
      existing.qty += 1;
    } else {
      items.push({ ...item, qty: 1 });
    }
    Cart.save(items);
    Cart.openPanel();
  },

  // ── Modifier la quantité ───────────────────────────────────
  setQty(id, qty) {
    let items = Cart.getItems();
    if (qty <= 0) {
      items = items.filter((i) => i.id !== id);
    } else {
      const it = items.find((i) => i.id === id);
      if (it) it.qty = qty;
    }
    Cart.save(items);
  },

  // ── Supprimer un article ───────────────────────────────────
  remove(id) {
    Cart.setQty(id, 0);
  },

  // ── Totaux ────────────────────────────────────────────────
  totalQty() {
    return Cart.getItems().reduce((s, i) => s + i.qty, 0);
  },
  totalPrice() {
    return Cart.getItems().reduce((s, i) => s + i.prix * i.qty, 0);
  },

  // ── Badge compteur dans la nav ─────────────────────────────
  updateBadge() {
    const qty = Cart.totalQty();
    document.querySelectorAll(".cart-badge").forEach((b) => {
      b.textContent = qty;
      b.style.display = qty > 0 ? "flex" : "none";
    });
  },

  // ── Ouvrir / fermer le panneau ─────────────────────────────
  openPanel() {
    document.getElementById("cart-panel")?.classList.add("open");
    document.getElementById("cart-overlay")?.classList.add("open");
    document.body.style.overflow = "hidden";
  },

  closePanel() {
    document.getElementById("cart-panel")?.classList.remove("open");
    document.getElementById("cart-overlay")?.classList.remove("open");
    document.body.style.overflow = "";
  },

  // ── Rendu du panneau latéral ───────────────────────────────
  renderPanel() {
    const list = document.getElementById("cart-items-list");
    const footer = document.getElementById("cart-footer");
    if (!list) return;

    const items = Cart.getItems();

    if (items.length === 0) {
      list.innerHTML = `
        <div class="cart-empty">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <p>Votre panier est vide</p>
          <a href="index.html#galerie" onclick="Cart.closePanel()">Découvrir les illustrations →</a>
        </div>`;
      if (footer) footer.style.display = "none";
      return;
    }

    if (footer) footer.style.display = "flex";

    list.innerHTML = items
      .map(
        (item) => `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.image}" alt="${item.titre}" class="cart-item-img" />
        <div class="cart-item-info">
          <p class="cart-item-name">${item.titre}</p>
          <p class="cart-item-price">€ ${(item.prix * item.qty).toFixed(2)}</p>
          <div class="cart-item-qty">
            <button onclick="Cart.setQty('${item.id}', ${item.qty - 1})" aria-label="Diminuer">−</button>
            <span>${item.qty}</span>
            <button onclick="Cart.setQty('${item.id}', ${item.qty + 1})" aria-label="Augmenter">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="Cart.remove('${item.id}')" aria-label="Supprimer">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>`,
      )
      .join("");

    // Mettre à jour le total
    const totalEl = document.getElementById("cart-total");
    if (totalEl) totalEl.textContent = "€ " + Cart.totalPrice().toFixed(2);
  },

  // ── Initialisation (à appeler sur chaque page) ─────────────
  init() {
    Cart.updateBadge();
    Cart.renderPanel();

    // Fermer avec la touche Echap
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") Cart.closePanel();
    });
  },
};

// Export pour les modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = Cart;
}

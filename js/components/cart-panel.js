class NympheCartPanel extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <div class="cart-overlay" id="cart-overlay" onclick="Cart.closePanel()"></div>
      <aside class="cart-panel" id="cart-panel" role="dialog" aria-label="Panier">
        <div class="cart-header">
          <h2>Votre panier</h2>
          <button
            class="cart-close"
            onclick="Cart.closePanel()"
            aria-label="Fermer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="cart-items-list" id="cart-items-list"></div>
        <div class="cart-footer" id="cart-footer">
          <div class="cart-subtotal">
            <span>Total</span>
            <span id="cart-total">€ 0.00</span>
          </div>
          <a href="checkout.html" class="cart-checkout">Commander →</a>
          <button class="cart-continue" onclick="Cart.closePanel()">
            Continuer mes achats
          </button>
        </div>
      </aside>

      <!-- Toast notification -->
      <div class="cart-toast" id="cart-toast"></div>
    `;

    // Setup cart toggle button listener (from navbar)
    setTimeout(() => {
      const cartToggle = document.querySelector("#cart-toggle");
      if (cartToggle) {
        cartToggle.addEventListener("click", () => Cart.openPanel());
      }
    }, 0);
  }
}

customElements.define("nymphe-cart-panel", NympheCartPanel);

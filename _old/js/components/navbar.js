class NympheNavbar extends HTMLElement {
  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.innerHTML = `
      <header class="nav-header">
        <div class="nav-inner">
          <!-- Logo -->
          <a href="index.html" class="logo">
            <img
                src="https://placehold.co/100x50/d4c9a8/7a6e52?text=Logo"
                alt="Logo"
                class="logo-img"
            />
          </a>

          <!-- Nav Links (desktop) -->
          <nav class="nav-links" id="nav-links">
            <a href="index.html" class="nav-link active">Illustration</a>
            <a href="index.html#galerie" class="nav-link">Sticker</a>
            <a href="about.html" class="nav-link">Bio</a>
            <a href="contact.html" class="nav-link">Contact</a>
          </nav>

          <!-- Icons -->
          <div class="nav-icons">
            <button class="icon-btn" aria-label="Rechercher">
              <i data-lucide="search"></i>
            </button>
            <button class="icon-btn" aria-label="Mon compte">
              <i data-lucide="user"></i>
            </button>
            <div class="cart-btn-wrap">
              <button class="icon-btn" id="cart-toggle" aria-label="Panier">
                <i data-lucide="shopping-bag"></i>
              </button>
              <span class="cart-badge">0</span>
            </div>
            <!-- Hamburger (mobile) -->
            <button class="icon-btn hamburger" id="hamburger" aria-label="Menu">
              <i data-lucide="menu"></i>
            </button>
          </div>
        </div>

        <!-- Mobile menu -->
        <div class="mobile-menu" id="mobile-menu">
          <a href="index.html" class="mobile-link">Illustration</a>
          <a href="index.html#galerie" class="mobile-link">Sticker</a>
          <a href="about.html" class="mobile-link">Bio</a>
          <a href="contact.html" class="mobile-link">Contact</a>
          <a href="commission.html" class="mobile-link">Commander</a>
        </div>
      </header>
    `;

    // Re-render lucide icons
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  }

  setupEventListeners() {
    const hamburger = this.querySelector("#hamburger");
    const mobileMenu = this.querySelector("#mobile-menu");
    const mobileLinks = this.querySelectorAll(".mobile-link");

    if (hamburger) {
      hamburger.addEventListener("click", () => {
        mobileMenu.classList.toggle("active");
      });
    }

    // Close mobile menu when clicking a link
    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("active");
      });
    });

    // Update active nav link based on current page
    this.setActiveLink();
  }

  setActiveLink() {
    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";
    const navLinks = this.querySelectorAll(".nav-link");

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      // Simple check: if current page matches href or if on index and href is index.html
      if (
        href === currentPage ||
        (currentPage === "" && href === "index.html")
      ) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }
}

customElements.define("nymphe-navbar", NympheNavbar);

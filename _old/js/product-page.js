// ============================================================
//  product-page.js — Logique de la page produit
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
  // Initialiser les icônes et le panier
  UI.initIcons();
  Cart.init();

  // Menu mobile
  const hamburger = document.getElementById("hamburger");
  if (hamburger) {
    hamburger.addEventListener("click", () => UI.toggleMobileMenu());
  }

  // Ouvrir panier
  const cartToggle = document.getElementById("cart-toggle");
  if (cartToggle) {
    cartToggle.addEventListener("click", () => Cart.openPanel());
  }

  // ── Récupérer l'ID depuis l'URL (?id=xxxxx) ─────────────
  const params = new URLSearchParams(window.location.search);
  const entryId = params.get("id");

  if (
    !entryId ||
    !CONTENTFUL_SPACE_ID ||
    CONTENTFUL_SPACE_ID === "VOTRE_SPACE_ID"
  ) {
    document.getElementById("product-skeleton").style.display = "none";
    document.getElementById("product-error").style.display = "block";
    return;
  }

  try {
    // Charger l'entrée spécifique
    const url =
      `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/entries/${entryId}` +
      `?access_token=${CONTENTFUL_ACCESS_TOKEN}`;

    const res = await fetch(url);
    const item = await res.json();

    if (!item.fields) throw new Error("Entry not found");

    const f = item.fields;

    // Résoudre l'image
    let imgSrc =
      "https://placehold.co/800x800/e8e0d0/8a7e62?text=" +
      encodeURIComponent(f.titre || "");

    if (f.image?.sys?.id) {
      try {
        const aRes = await fetch(
          `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/assets/${f.image.sys.id}` +
            `?access_token=${CONTENTFUL_ACCESS_TOKEN}`,
        );
        const asset = await aRes.json();
        if (asset.fields?.file?.url) {
          imgSrc = "https:" + asset.fields.file.url + "?w=900&fm=webp&q=85";
        }
      } catch (e) {
        console.warn("Erreur lors du chargement de l'image:", e);
      }
    }

    // Mettre à jour la page
    document.title = (f.titre || "Illustration") + " — Nymphe Illustration";

    const breadcrumbTitle = document.getElementById("breadcrumb-title");
    if (breadcrumbTitle) breadcrumbTitle.textContent = f.titre || "";

    const productImg = document.getElementById("product-img");
    if (productImg) {
      productImg.src = imgSrc;
      productImg.alt = f.titre || "";
    }

    const productTitle = document.getElementById("product-title");
    if (productTitle) productTitle.textContent = f.titre || "Sans titre";

    const productCategory = document.getElementById("product-category");
    if (productCategory) productCategory.textContent = f.categorie || "";

    const productPrice = document.getElementById("product-price");
    if (productPrice) {
      productPrice.textContent = f.prix ? "€ " + Number(f.prix).toFixed(2) : "";
    }

    const productDesc = document.getElementById("product-desc");
    if (productDesc && f.description) {
      productDesc.textContent = f.description;
    }

    // Bouton "Ajouter au panier"
    const btnAddCart = document.getElementById("btn-add-cart");
    if (btnAddCart) {
      btnAddCart.addEventListener("click", () => {
        Cart.add({
          id: item.sys.id,
          titre: f.titre || "Sans titre",
          prix: Number(f.prix) || 0,
          image: imgSrc,
        });
        UI.showToast("✦ Ajouté au panier");
      });
    }

    // Sélecteur de format
    document.querySelectorAll(".format-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll(".format-btn")
          .forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
      });
    });

    // Afficher le contenu
    const skeleton = document.getElementById("product-skeleton");
    const content = document.getElementById("product-content");
    if (skeleton) skeleton.style.display = "none";
    if (content) content.style.display = "grid";

    // Charger des produits similaires
    loadRelated(item.sys.id, f.categorie);
  } catch (err) {
    console.error("Erreur produit:", err);
    const skeleton = document.getElementById("product-skeleton");
    const error = document.getElementById("product-error");
    if (skeleton) skeleton.style.display = "none";
    if (error) error.style.display = "block";
  }
});

/**
 * Charge et affiche les produits similaires
 */
async function loadRelated(currentId, categorie) {
  try {
    let url =
      `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/entries` +
      `?access_token=${CONTENTFUL_ACCESS_TOKEN}` +
      `&content_type=nympheIllustration&limit=4`;

    if (categorie) {
      url += `&fields.categorie=${encodeURIComponent(categorie)}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    const assets = {};
    (data.includes?.Asset || []).forEach((a) => {
      assets[a.sys.id] = "https:" + a.fields.file.url;
    });

    const others = (data.items || [])
      .filter((i) => i.sys.id !== currentId)
      .slice(0, 4);

    if (others.length === 0) return;

    const grid = document.getElementById("related-grid");
    if (!grid) return;

    others.forEach((item) => {
      const f = item.fields;
      const imgId = f.image?.sys?.id;
      const imgSrc =
        imgId && assets[imgId]
          ? assets[imgId] + "?w=600&fm=webp&q=80"
          : "https://placehold.co/400x400/e8e0d0/8a7e62?text=Illustration";

      const card = document.createElement("article");
      card.className = "product-card";
      card.innerHTML = `
        <a href="product?id=${item.sys.id}" class="product-link">
          <div class="product-img-wrap">
            <img src="${imgSrc}" alt="${f.titre || ""}" class="product-img" loading="lazy" />
            <div class="product-overlay"><span>Voir</span></div>
          </div>
          <div class="product-info">
            <h3 class="product-name">${f.titre || "Sans titre"}</h3>
            <p class="product-price">${f.prix ? "€ " + f.prix + " EUR" : ""}</p>
          </div>
        </a>`;
      grid.appendChild(card);
    });

    const relatedSection = document.getElementById("related-section");
    if (relatedSection) relatedSection.style.display = "block";
  } catch (e) {
    console.error("Erreur produits similaires:", e);
  }
}

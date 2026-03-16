// ============================================================
//  modules/contentful.js — Chargement depuis Contentful
// ============================================================

const ContentfulAPI = {
  /**
   * Charge un contenu générique depuis Contentful (Content Type: Content)
   * @param {string} label - Le label du contenu à récupérer (ex: "Hero Image")
   * @returns {Promise<{label: string, image: string|null, text: string|null}|null>} Objet contenu ou null
   */
  async fetchContent(label) {
    if (!CONTENTFUL_SPACE_ID || CONTENTFUL_SPACE_ID === "VOTRE_SPACE_ID") {
      console.warn(
        "⚠️ Configuration Contentful incomplète. Consultez config.js",
      );
      return null;
    }

    try {
      const url =
        `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/entries` +
        `?access_token=${CONTENTFUL_ACCESS_TOKEN}` +
        `&content_type=content`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        console.log(`Aucune entrée Content trouvée pour label: ${label}`);
        return null;
      }

      // Chercher l'entrée avec le label spécifié
      const contentEntry = data.items.find(
        (item) => item.fields.label === label,
      );

      if (!contentEntry) {
        console.log(`Entrée '${label}' non trouvée dans Contentful.`);
        return null;
      }

      // Récupérer l'image
      let imageUrl = null;
      const imageField = contentEntry.fields.image || contentEntry.fields.media;
      if (imageField && imageField.sys?.id) {
        const asset = data.includes?.Asset?.find(
          (a) => a.sys.id === imageField.sys.id,
        );
        if (asset) {
          imageUrl = "https:" + asset.fields.file.url + "?w=800&fm=webp&q=85";
        }
      }

      // Récupérer le texte
      const textField =
        contentEntry.fields.text || contentEntry.fields.description;
      const textUrl = textField || null;

      return {
        label: label,
        image: imageUrl,
        text: textUrl,
      };
    } catch (err) {
      console.error(`Erreur chargement contenu '${label}':`, err);
      return null;
    }
  },

  /**
   * Charge les illustrations depuis Contentful
   * @returns {Promise<Array>} Liste des illustrations
   */
  async fetchIllustrations() {
    if (!CONTENTFUL_SPACE_ID || CONTENTFUL_SPACE_ID === "VOTRE_SPACE_ID") {
      console.warn(
        "⚠️ Configuration Contentful incomplète. Consultez config.js",
      );
      return null;
    }

    try {
      const url =
        `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/entries` +
        `?access_token=${CONTENTFUL_ACCESS_TOKEN}` +
        `&content_type=nympheIllustration` +
        `&order=sys.createdAt` +
        `&limit=12`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        console.log("Aucune illustration trouvée.");
        return [];
      }

      // Mapper les assets
      const assets = {};
      (data.includes?.Asset || []).forEach((a) => {
        assets[a.sys.id] = "https:" + a.fields.file.url;
      });

      // Transformer les items
      return data.items.map((item) => {
        const f = item.fields;
        const imgId = f.image?.sys?.id;
        const imgSrc =
          imgId && assets[imgId] ? assets[imgId] + "?w=600&fm=webp&q=80" : null;

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
      console.error("Erreur Contentful:", err);
      return null;
    }
  },

  /**
   * Rend une grille de produits à partir des données
   * @param {HTMLElement} container - Conteneur pour la grille
   * @param {Array} items - Liste des illustrations
   */
  renderGrid(container, items) {
    if (!items || items.length === 0) {
      container.innerHTML =
        '<p style="text-align: center; color: var(--brown-light);">Aucune illustration disponible.</p>';
      return;
    }

    container.innerHTML = items
      .map(
        (item, i) => `
      <article class="product-card" style="animation-delay: ${i * 0.06}s">
        <a href="product?id=${item.id}" class="product-link">
          <div class="product-img-wrap">
            <img 
              src="${item.image || "https://placehold.co/400x400/e8e0d0/8a7e62?text=" + encodeURIComponent(item.titre)}"
              alt="${item.titre}"
              class="product-img"
              loading="lazy"
            />
            <div class="product-overlay"><span>Voir</span></div>
          </div>
          <div class="product-info">
            <h3 class="product-name">${item.titre}</h3>
            <p class="product-price">${item.prix ? "€ " + item.prix + " EUR" : ""}</p>
          </div>
        </a>
      </article>
    `,
      )
      .join("");
  },
};

// Export pour les modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = ContentfulAPI;
}

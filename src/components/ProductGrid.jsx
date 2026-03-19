import { useState, useEffect } from "react";
import { ContentfulService } from "../services/api";
import { useStore } from "../services/store";
import { Link } from "react-router-dom";
import "./ProductGrid.css";

function ProductGrid({ products = null, showTitle = true }) {
  const [illustrations, setIllustrations] = useState(products || []);
  const [loading, setLoading] = useState(!products);

  useEffect(() => {
    // Si products sont fournis en props, on les utilise
    if (products) {
      setIllustrations(products);
      setLoading(false);
      return;
    }

    // Sinon on charge depuis Contentful
    const load = async () => {
      const items = await ContentfulService.fetchIllustrations();
      setIllustrations(items);
      setLoading(false);
    };
    load();
  }, [products]);

  const content = (
    <>
      {showTitle && <h2 className="section-title">Nouveautés</h2>}

      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: "48px 0",
            color: "var(--brown-light)",
          }}
        >
          Chargement des illustrations…
        </div>
      )}

      {!loading && illustrations.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "48px 0",
            color: "var(--brown-light)",
          }}
        >
          Aucune illustration disponible
        </div>
      )}

      <div className="product-grid">
        {illustrations.map((item) => (
          <Link
            key={item.id}
            to={`/product/${item.id}`}
            className="product-card"
          >
            <div className="product-img-wrap">
              <img
                src={
                  item.image ||
                  "https://placehold.co/400x400/e8e0d0/8a7e62?text=" +
                    encodeURIComponent(item.titre)
                }
                alt={item.titre}
                className="product-img"
              />
              <div className="product-overlay">
                <span>Voir</span>
              </div>
            </div>
            <div className="product-info">
              <h3 className="product-name">{item.titre}</h3>
              {item.prix && <p className="product-price">€ {item.prix}</p>}
            </div>
          </Link>
        ))}
      </div>
    </>
  );

  // Si c'est une grille standalone, on l'enveloppe dans section + container
  if (products) {
    return <div className="product-grid-container">{content}</div>;
  }

  // Sinon c'est pour la homepage avec section + container
  return (
    <section className="section" id="galerie">
      <div className="container">{content}</div>
    </section>
  );
}

export default ProductGrid;

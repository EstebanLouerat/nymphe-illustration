import { useState, useEffect, useMemo } from "react";
import { ContentfulService } from "../services/api";
import { useStore } from "../services/store";
import { Link } from "react-router-dom";
import axios from "axios";
import "./ProductGrid.css";

const SORT_OPTIONS = [
  { value: "date", label: "Date d'ajout" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix décroissant" },
  { value: "popularite", label: "Popularité" },
];

function ProductGrid({ products = null, showTitle = true }) {
  const [illustrations, setIllustrations] = useState(products || []);
  const [loading, setLoading] = useState(!products);
  const [popularity, setPopularity] = useState({});
  const [activeCat, setActiveCat] = useState("all");
  const [activeSort, setActiveSort] = useState("date");

  useEffect(() => {
    if (products) {
      setIllustrations(products);
      setLoading(false);
      return;
    }
    const load = async () => {
      const items = await ContentfulService.fetchIllustrations();
      // const [items, pop] = await Promise.all([
      //   ContentfulService.fetchIllustrations(),
      //   axios
      //     .get("/api/popularity")
      //     .then((r) => r.data)
      //     .catch(() => ({})),
      // ]);
      setIllustrations(items);
      // setPopularity(pop);
      setLoading(false);
    };
    load();
  }, [products]);

  // Catégories dynamiques extraites de Contentful
  const categories = useMemo(() => {
    const cats = [
      ...new Set(illustrations.map((i) => i.category).filter(Boolean)),
    ];
    return cats;
  }, [illustrations]);

  const filtered = useMemo(() => {
    let list =
      activeCat === "all"
        ? [...illustrations]
        : illustrations.filter((i) => i.category === activeCat);

    switch (activeSort) {
      case "prix-asc":
        list.sort((a, b) => a.prix - b.prix);
        break;
      case "prix-desc":
        list.sort((a, b) => b.prix - a.prix);
        break;
      case "popularite":
        list.sort((a, b) => (popularity[b.id] ?? 0) - (popularity[a.id] ?? 0));
        break;
      default:
        break; // "date" = ordre Contentful (-sys.createdAt)
    }
    return list;
  }, [illustrations, activeCat, activeSort, popularity]);

  const showFilters = !products; // filtres uniquement sur la homepage, pas dans "vous aimerez aussi"

  const content = (
    <>
      {showFilters && (
        <div className="filter-bar">
          {showTitle && (
            <h2 className="section-title filter-bar-title">Nouveautés</h2>
          )}

          <div className="filter-bar-controls">
            <div className="filter-pills">
              <button
                className={`filter-pill ${activeCat === "all" ? "active" : ""}`}
                onClick={() => setActiveCat("all")}
              >
                Tout
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`filter-pill ${activeCat === cat ? "active" : ""}`}
                  onClick={() => setActiveCat(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="filter-sort">
              <label htmlFor="sort-select" className="filter-sort-label">
                Trier
              </label>
              <select
                id="sort-select"
                className="filter-sort-select"
                value={activeSort}
                onChange={(e) => setActiveSort(e.target.value)}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <span className="filter-count">
              {filtered.length} illustration{filtered.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      )}

      {!showFilters && showTitle && (
        <h2 className="section-title">Nouveautés</h2>
      )}

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

      {!loading && filtered.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "48px 0",
            color: "var(--brown-light)",
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
          }}
        >
          Aucune illustration dans cette catégorie
        </div>
      )}

      <div className="product-grid">
        {filtered.map((item, i) => (
          <Link
            key={item.id}
            to={`/product/${item.id}`}
            className="product-card"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="product-img-wrap">
              <img
                src={
                  item.image ||
                  `https://placehold.co/400x400/e8e0d0/8a7e62?text=${encodeURIComponent(item.titre)}`
                }
                alt={item.titre}
                className="product-img"
              />
              <div className="product-overlay">
                <span>Voir</span>
              </div>
            </div>
            <div className="product-info">
              {item.category && (
                <p className="product-category">{item.category}</p>
              )}
              <h3 className="product-name">{item.titre}</h3>
              {item.prix && <p className="product-price">€ {item.prix}</p>}
            </div>
          </Link>
        ))}
      </div>
    </>
  );

  if (products) return <div className="product-grid-container">{content}</div>;
  return (
    <section className="section" id="galerie">
      <div className="container">{content}</div>
    </section>
  );
}

export default ProductGrid;

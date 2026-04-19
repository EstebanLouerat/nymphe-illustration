import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Heart, Truck, Package, CheckCircle } from "lucide-react";
import { ContentfulService } from "../services/api";
import { useStore } from "../services/store";
import { formatRichText } from "../services/richTextFormatter";
import ProductGrid from "../components/ProductGrid";
import "../styles/Product.css";

function Product() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("A5");
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [heartAnim, setHeartAnim] = useState(false); // animation cœur
  const [isZoomOpen, setIsZoomOpen] = useState(false); // zoom modal

  const { addToCart, openCart, toggleFavorite, isFavorite, favorites } =
    useStore();

  // isFav est recalculé à chaque changement du store favorites
  const isFav = product ? isFavorite(product.id) : false;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setIsZoomOpen(false); // Fermer le zoom si on change de produit
      try {
        const item = await ContentfulService.fetchIllustrationById(id);
        if (item) {
          setProduct(item);
          setError(false);
          // Scroll en haut de la page
          window.scrollTo(0, 0);
          const allProducts = await ContentfulService.fetchIllustrations();
          setRelatedProducts(
            allProducts.filter((p) => p.id !== id).slice(0, 4),
          );
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Erreur chargement produit:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({ ...product, selectedFormat });
      openCart();
    }
  };

  const handleToggleFavorite = async () => {
    if (!product) return;
    const result = await toggleFavorite(product.id);
    // Animation uniquement si l'article vient d'être AJOUTÉ avec succès en BDD
    if (result?.success && result?.added) {
      setHeartAnim(true);
      setTimeout(() => setHeartAnim(false), 700);
    }
  };

  const formats = [
    { label: "A5 — 14×21 cm", value: "A5" },
    { label: "A4 — 21×29 cm", value: "A4" },
    { label: "A3 — 30×42 cm", value: "A3" },
  ];

  if (error) {
    return (
      <main>
        <div
          className="product-error"
          style={{
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <p>
            L'illustration que vous recherchez n'existe pas ou a été supprimée.
          </p>
          <Link to="/" className="btn-outline">
            ← Retour à la galerie
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main>
        <div className="product-page">
          <div className="product-skeleton">
            <div className="skeleton" style={{ aspectRatio: "1" }}></div>
            <div className="skeleton-text">
              <div
                className="skeleton"
                style={{ height: "14px", width: "80px" }}
              ></div>
              <div
                className="skeleton"
                style={{ height: "44px", width: "90%" }}
              ></div>
              <div
                className="skeleton"
                style={{ height: "30px", width: "100px" }}
              ></div>
              <div
                className="skeleton"
                style={{ height: "1px", margin: "8px 0" }}
              ></div>
              <div className="skeleton" style={{ height: "14px" }}></div>
              <div
                className="skeleton"
                style={{ height: "14px", width: "85%" }}
              ></div>
              <div
                className="skeleton"
                style={{ height: "50px", marginTop: "24px" }}
              ></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) return null;

  return (
    <main>
      <nav className="breadcrumb">
        <Link to="/">Accueil</Link>
        <span>›</span>
        <Link to="/#galerie">Galerie</Link>
        <span>›</span>
        <span>{product.titre}</span>
      </nav>

      <div className="product-page">
        <div className="product-gallery">
          <div
            className="product-gallery-main"
            onClick={() => setIsZoomOpen(true)}
          >
            {product.image && (
              <img
                src={product.image}
                alt={product.titre}
                className="product-img"
              />
            )}
          </div>
        </div>

        <div className="product-detail">
          {product.category && (
            <p className="product-detail-category">{product.category}</p>
          )}
          <h1 className="product-detail-title">{product.titre}</h1>
          <p className="product-detail-price">€ {product.prix}</p>
          <hr className="product-detail-divider" />

          {product.description && (
            <div className="product-detail-desc">
              {formatRichText(product.description)}
            </div>
          )}

          {/* <p className="format-label">Format</p>
          <div className="format-options">
            {formats.map((fmt) => (
              <button
                key={fmt.value}
                className={`format-btn ${selectedFormat === fmt.value ? "selected" : ""}`}
                onClick={() => setSelectedFormat(fmt.value)}
              >
                {fmt.label}
              </button>
            ))}
          </div> */}

          <div className="product-cta">
            <button
              className="btn-primary"
              style={{ flex: 1 }}
              onClick={handleAddToCart}
            >
              Ajouter au panier
            </button>

            <button
              className={`btn-wishlist ${isFav ? "btn-wishlist--active" : ""} ${heartAnim ? "btn-wishlist--pop" : ""}`}
              aria-label={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
              onClick={handleToggleFavorite}
            >
              <Heart
                size={20}
                fill={isFav ? "currentColor" : "none"}
                className={heartAnim ? "heart-icon--pop" : ""}
              />
            </button>
          </div>

          <div className="shipping-info">
            <div className="shipping-row">
              <Truck size={20} />
              <span>Livraison en 3–5 jours ouvrés</span>
            </div>
            <div className="shipping-row">
              <Package size={20} />
              <span>Emballage sécurisé, tube ou pochette rigide</span>
            </div>
            <div className="shipping-row">
              <CheckCircle size={20} />
              <span>Impression signée, édition limitée</span>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="related-section">
          <hr className="section-divider" />
          <h2>Vous aimerez aussi</h2>
          <ProductGrid products={relatedProducts} />
        </div>
      )}

      {/* Modal de zoom */}
      {isZoomOpen && product.image && (
        <div className="zoom-modal" onClick={() => setIsZoomOpen(false)}>
          <div
            className="zoom-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="zoom-close-btn"
              onClick={() => setIsZoomOpen(false)}
              aria-label="Fermer le zoom"
            >
              ✕
            </button>
            <img src={product.image} alt={product.titre} className="zoom-img" />
          </div>
        </div>
      )}
    </main>
  );
}

export default Product;

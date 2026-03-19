import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Heart, Truck, Package, CheckCircle } from "lucide-react";
import { ContentfulService } from "../services/api";
import { useStore } from "../services/store";
import ProductGrid from "../components/ProductGrid";
import "../styles/Product.css";

function Product() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("A5");
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { addToCart, openCart, showToast } = useStore();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const item = await ContentfulService.fetchIllustrationById(id);
        if (item) {
          setProduct(item);
          setError(false);

          // Charger les produits similaires
          const allProducts = await ContentfulService.fetchIllustrations();
          const similar = allProducts.filter((p) => p.id !== id).slice(0, 4);
          setRelatedProducts(similar);
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
      const itemToAdd = {
        ...product,
        selectedFormat,
      };
      addToCart(itemToAdd);
      showToast(`${product.titre} ajouté au panier !`);
      openCart();
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
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/">Accueil</Link>
        <span>›</span>
        <Link to="/#galerie">Galerie</Link>
        <span>›</span>
        <span>{product.titre}</span>
      </nav>

      {/* Contenu Produit */}
      <div className="product-page">
        {/* Galerie */}
        <div className="product-gallery">
          <div className="product-gallery-main">
            {product.image && (
              <img
                src={
                  product.image ||
                  "https://placehold.co/400x400/e8e0d0/8a7e62?text=" +
                    encodeURIComponent(item.titre)
                }
                alt={product.titre}
                className="product-img"
              />
            )}
          </div>
        </div>

        {/* Détails */}
        <div className="product-detail">
          {product.category && (
            <p className="product-detail-category">{product.category}</p>
          )}
          <h1 className="product-detail-title">{product.titre}</h1>
          <p className="product-detail-price">€ {product.prix}</p>
          <hr className="product-detail-divider" />

          {product.description && (
            <p className="product-detail-desc">{product.description}</p>
          )}

          {/* Formats disponibles */}
          <p className="format-label">Format</p>
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
          </div>

          {/* Boutons d'action */}
          <div className="product-cta">
            <button
              className="btn-primary"
              style={{ flex: 1 }}
              onClick={handleAddToCart}
            >
              Ajouter au panier
            </button>
            <button
              className="btn-wishlist"
              aria-label="Ajouter aux favoris"
              onClick={() => showToast("Ajouté aux favoris !", "info")}
            >
              <Heart size={20} />
            </button>
          </div>

          {/* Infos livraison */}
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

      {/* Produits similaires */}
      {relatedProducts.length > 0 && (
        <div className="related-section">
          <hr className="section-divider" />
          <h2>Vous aimerez aussi</h2>
          <ProductGrid products={relatedProducts} />
        </div>
      )}
    </main>
  );
}

export default Product;

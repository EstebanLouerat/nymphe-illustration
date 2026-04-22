import { useStore } from "../services/store";
import { useNavigate, Link } from "react-router-dom";
import { PaymentService } from "../services/api";
import { useState } from "react";
import { Lock, ChevronRight, ShoppingBag, ArrowLeft } from "lucide-react";
import "../styles/Checkout.css";

function Checkout() {
  const { cart, cartTotal, showError, showInfo } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    address: "",
    city: "",
    zip: "",
    country: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await PaymentService.createCheckoutSession(cart, formData);
      window.location.href = result.checkoutUrl;
    } catch (err) {
      console.error("Erreur paiement:", err);
      showError(
        "Une erreur est survenue lors du paiement. Veuillez réessayer.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main className="checkout-empty-wrap">
        <div className="checkout-empty">
          <ShoppingBag size={40} strokeWidth={1} />
          <h2>Votre panier est vide</h2>
          <p>Vous n'avez aucun article dans votre panier.</p>
          <Link to="/" className="btn-primary">
            Retour à la boutique
          </Link>
        </div>
      </main>
    );
  }

  const shipping = 4.9;
  const total = cartTotal + shipping;

  return (
    <main className="checkout-root">
      {/* ── Colonne gauche : formulaire ── */}
      <div className="checkout-left">
        <Link to="/" className="checkout-back">
          <ArrowLeft size={14} />
          Retour à la boutique
        </Link>

        <div className="checkout-brand">Nymphe Illustration</div>
        <h1 className="checkout-title">Finaliser la commande</h1>

        <form onSubmit={handleCheckout} className="checkout-form">
          <fieldset className="checkout-fieldset">
            <legend className="checkout-legend">Contact</legend>
            <div
              className={`checkout-field ${activeField === "email" ? "active" : ""} ${formData.email ? "filled" : ""}`}
            >
              <label htmlFor="email">Adresse e-mail</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setActiveField("email")}
                onBlur={() => setActiveField(null)}
                required
                autoComplete="email"
              />
            </div>
          </fieldset>

          <fieldset className="checkout-fieldset">
            <legend className="checkout-legend">Livraison</legend>

            <div
              className={`checkout-field ${activeField === "name" ? "active" : ""} ${formData.name ? "filled" : ""}`}
            >
              <label htmlFor="name">Nom complet</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onFocus={() => setActiveField("name")}
                onBlur={() => setActiveField(null)}
                required
                autoComplete="name"
              />
            </div>

            <div
              className={`checkout-field ${activeField === "address" ? "active" : ""} ${formData.address ? "filled" : ""}`}
            >
              <label htmlFor="address">Adresse</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                onFocus={() => setActiveField("address")}
                onBlur={() => setActiveField(null)}
                required
                autoComplete="street-address"
              />
            </div>

            <div className="checkout-row">
              <div
                className={`checkout-field ${activeField === "zip" ? "active" : ""} ${formData.zip ? "filled" : ""}`}
              >
                <label htmlFor="zip">Code postal</label>
                <input
                  type="text"
                  id="zip"
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  onFocus={() => setActiveField("zip")}
                  onBlur={() => setActiveField(null)}
                  required
                  autoComplete="postal-code"
                />
              </div>
              <div
                className={`checkout-field ${activeField === "city" ? "active" : ""} ${formData.city ? "filled" : ""}`}
              >
                <label htmlFor="city">Ville</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  onFocus={() => setActiveField("city")}
                  onBlur={() => setActiveField(null)}
                  required
                  autoComplete="address-level2"
                />
              </div>
            </div>

            <div
              className={`checkout-field ${activeField === "country" ? "active" : ""} ${formData.country ? "filled" : ""}`}
            >
              <label htmlFor="country">Pays</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                onFocus={() => setActiveField("country")}
                onBlur={() => setActiveField(null)}
                required
                autoComplete="country-name"
              />
            </div>
          </fieldset>

          <button
            type="submit"
            className={`checkout-submit ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? (
              <span className="checkout-submit-inner">
                <span className="checkout-spinner" />
                Redirection vers Stripe…
              </span>
            ) : (
              <span className="checkout-submit-inner">
                <Lock size={14} />
                Payer · € {total.toFixed(2)}
                <ChevronRight size={16} />
              </span>
            )}
          </button>

          <p className="checkout-secure-note">
            <Lock size={11} />
            Paiement sécurisé via Stripe - vos données ne transitent pas par nos
            serveurs
          </p>
        </form>
      </div>

      {/* ── Colonne droite : résumé ── */}
      <aside className="checkout-right">
        <div className="checkout-summary">
          <h2 className="checkout-summary-title">Votre commande</h2>

          <ul className="checkout-items">
            {cart.map((item) => (
              <li key={item.id} className="checkout-item">
                <div className="checkout-item-img-wrap">
                  {item.image ? (
                    <img src={item.image} alt={item.titre} />
                  ) : (
                    <div className="checkout-item-img-placeholder" />
                  )}
                  {item.quantity > 1 && (
                    <span className="checkout-item-qty">{item.quantity}</span>
                  )}
                </div>
                <div className="checkout-item-info">
                  <p className="checkout-item-name">{item.titre}</p>
                  {item.selectedFormat && (
                    <p className="checkout-item-format">
                      Format {item.selectedFormat}
                    </p>
                  )}
                </div>
                <p className="checkout-item-price">
                  € {(item.prix * item.quantity).toFixed(2)}
                </p>
              </li>
            ))}
          </ul>

          <div className="checkout-totals">
            <div className="checkout-total-row">
              <span>Sous-total</span>
              <span>€ {cartTotal.toFixed(2)}</span>
            </div>
            <div className="checkout-total-row">
              <span>Livraison</span>
              <span>€ {shipping.toFixed(2)}</span>
            </div>
            <div className="checkout-total-row checkout-total-final">
              <span>Total</span>
              <span>€ {total.toFixed(2)}</span>
            </div>
          </div>

          <p className="checkout-summary-note">
            Impression signée · Emballage sécurisé · Livraison 5 à 10 jours
          </p>
        </div>
      </aside>
    </main>
  );
}

export default Checkout;

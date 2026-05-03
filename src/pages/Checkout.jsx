import { useStore } from "../services/store";
import { useNavigate, Link } from "react-router-dom";
import { PaymentService } from "../services/api";
import { useState, useEffect } from "react";
import {
  Lock,
  ChevronRight,
  ShoppingBag,
  ArrowLeft,
  Tag,
  Check,
  X,
  Loader,
  Clock,
} from "lucide-react";
import "../styles/Checkout.css";

function Checkout() {
  const { cart, showError, showInfo } = useStore();
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

  // Promo — les données viennent directement de Stripe via /api/validate-promo
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  // shape: { code, promoId, discount: { type, value, label }, expiresAt, usagesLeft }
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  const [shippingRate, setShippingRate] = useState(null);
  useEffect(() => {
    PaymentService.fetchShippingRate()
      .then((r) => setShippingRate(r))
      .catch(() => setShippingRate({ amount: 3, display_name: "Livraison" }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyPromo = async () => {
    const code = promoInput.trim();
    if (!code) return;
    setPromoLoading(true);
    setPromoError("");
    try {
      const res = await fetch(
        `/api/validate-promo?code=${encodeURIComponent(code)}`,
      );
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setPromoError(data.reason || "Code promo invalide");
        setAppliedPromo(null);
      } else {
        setAppliedPromo(data);
        setPromoError("");
      }
    } catch {
      setPromoError("Impossible de vérifier le code, réessayez.");
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
    setPromoError("");
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await PaymentService.createCheckoutSession(
        cart,
        formData,
        appliedPromo?.promoId || null,
      );
      window.location.href = result.checkoutUrl;
    } catch (err) {
      console.error("Erreur paiement:", err);
      // Erreur spécifique au code promo
      if (err?.response?.data?.error === "Code promo invalide") {
        setAppliedPromo(null);
        setPromoError("Ce code promo n'est plus valide");
        showError("Code promo invalide. Veuillez en saisir un autre.");
      } else {
        showError(
          "Une erreur est survenue lors du paiement. Veuillez réessayer.",
        );
      }
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

  const shipping = shippingRate?.amount ?? null;
  const subtotal = cart.reduce((sum, item) => sum + (item.prix || 0) * item.quantity, 0);
  let discount = 0;
  if (appliedPromo?.discount) {
    const { type, value } = appliedPromo.discount;
    if (type === "percent") discount = subtotal * (value / 100);
    else if (type === "amount") discount = Math.min(value, subtotal);
  }
  const total = shipping !== null ? subtotal - discount + shipping : null;

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
          {/* Contact */}
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

          {/* Livraison */}
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

          {/* Code de réduction */}
          <fieldset className="checkout-fieldset">
            <legend className="checkout-legend">
              <Tag
                size={11}
                style={{
                  display: "inline",
                  marginRight: 5,
                  verticalAlign: "middle",
                }}
              />
              Code de réduction
            </legend>

            {appliedPromo ? (
              <div className="promo-applied">
                <div className="promo-applied-left">
                  <Check size={14} className="promo-applied-icon" />
                  <span className="promo-applied-code">
                    {appliedPromo.code}
                  </span>
                  <span className="promo-applied-label">
                    {appliedPromo.discount?.label}
                  </span>
                </div>
                <div className="promo-applied-meta">
                  {appliedPromo.expiresAt && (
                    <span className="promo-expires">
                      <Clock size={10} />
                      Expire le{" "}
                      {new Date(
                        appliedPromo.expiresAt * 1000,
                      ).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                      })}
                    </span>
                  )}
                  {appliedPromo.usagesLeft !== null &&
                    appliedPromo.usagesLeft <= 10 && (
                      <span className="promo-urgency">
                        {appliedPromo.usagesLeft} utilisation
                        {appliedPromo.usagesLeft > 1 ? "s" : ""} restante
                        {appliedPromo.usagesLeft > 1 ? "s" : ""}
                      </span>
                    )}
                </div>
                <button
                  type="button"
                  className="promo-remove"
                  onClick={handleRemovePromo}
                  aria-label="Retirer"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                className={`promo-input-wrap ${promoError ? "promo-input-wrap--error" : ""}`}
              >
                <input
                  type="text"
                  className="promo-input"
                  placeholder="Code promo"
                  value={promoInput}
                  onChange={(e) => {
                    setPromoInput(e.target.value.toUpperCase());
                    setPromoError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApplyPromo();
                    }
                  }}
                  disabled={promoLoading}
                  autoCapitalize="characters"
                  spellCheck={false}
                />
                <button
                  type="button"
                  className="promo-apply-btn"
                  onClick={handleApplyPromo}
                  disabled={!promoInput.trim() || promoLoading}
                >
                  {promoLoading ? (
                    <Loader size={13} className="promo-spinner" />
                  ) : (
                    "Appliquer"
                  )}
                </button>
              </div>
            )}

            {promoError && <p className="promo-error">{promoError}</p>}
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
                Payer · € {total !== null ? total.toFixed(2) : "…"}
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
              <span>€ {subtotal.toFixed(2)}</span>
            </div>
            {appliedPromo && discount > 0 && (
              <div className="checkout-total-row checkout-total-discount">
                <span>
                  {appliedPromo.discount?.label}{" "}
                  <span className="checkout-promo-tag">
                    {appliedPromo.code}
                  </span>
                </span>
                <span>− € {discount.toFixed(2)}</span>
              </div>
            )}
            <div className="checkout-total-row">
              <span>{shippingRate?.display_name ?? "Livraison"}</span>
              <span>{shipping !== null ? `€ ${shipping.toFixed(2)}` : "…"}</span>
            </div>
            <div className="checkout-total-row checkout-total-final">
              <span>Total</span>
              <span>{total !== null ? `€ ${total.toFixed(2)}` : "…"}</span>
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

import { useStore } from "../services/store";
import { useNavigate } from "react-router-dom";
import { PaymentService } from "../services/api";
import { useState } from "react";

function Checkout() {
  const { cart, cartTotal, clearCart } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
      // Appel à la création de session Stripe
      const result = await PaymentService.createCheckoutSession(cart, formData);
      // Rediriger vers Stripe Checkout
      window.location.href = result.checkoutUrl;
    } catch (err) {
      console.error("Erreur paiement:", err);
      alert("Erreur lors du paiement");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main
        style={{ minHeight: "60vh", display: "flex", alignItems: "center" }}
      >
        <div className="container" style={{ textAlign: "center" }}>
          <h1>Panier vide</h1>
          <p>Vous n'avez aucun article dans votre panier.</p>
          <a href="/" className="btn-primary">
            Retour à la boutique
          </a>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh" }}>
      <section className="section">
        <div className="container" style={{ maxWidth: "800px" }}>
          <h1>Paiement</h1>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "48px",
            }}
          >
            {/* Formulaire */}
            <form onSubmit={handleCheckout}>
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  Nom
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  Adresse
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  style={{ width: "100%" }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "500",
                    }}
                  >
                    Ville
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "500",
                    }}
                  >
                    Code postal
                  </label>
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    required
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "32px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  Pays
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  style={{ width: "100%" }}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ width: "100%" }}
              >
                {loading ? "Traitement..." : "Payer maintenant"}
              </button>
            </form>

            {/* Résumé */}
            <div>
              <h3>Résumé de la commande</h3>
              <div
                style={{
                  border: "1px solid var(--linen-dark)",
                  borderRadius: "var(--radius)",
                  padding: "24px",
                }}
              >
                {cart.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "12px",
                      paddingBottom: "12px",
                      borderBottom: "1px solid var(--linen-dark)",
                    }}
                  >
                    <span>
                      {item.titre} × {item.quantity}
                    </span>
                    <span>€ {(item.prix * item.quantity).toFixed(2)}</span>
                  </div>
                ))}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontFamily: "var(--font-display)",
                    fontSize: "1.2rem",
                    marginTop: "16px",
                    paddingTop: "16px",
                    borderTop: "2px solid var(--text)",
                  }}
                >
                  <span>Total</span>
                  <span>€ {cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Checkout;

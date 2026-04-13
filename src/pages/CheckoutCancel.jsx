// src/pages/CheckoutCancel.jsx
import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";

function CheckoutCancel() {
  return (
    <main
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "480px",
          padding: "48px 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "24px",
          }}
        >
          <XCircle size={56} color="var(--brown-light)" strokeWidth={1.5} />
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2.2rem",
            fontWeight: 300,
            marginBottom: "12px",
            color: "var(--text)",
          }}
        >
          Paiement annulé
        </h1>

        <p
          style={{
            color: "var(--brown-light)",
            marginBottom: "32px",
            lineHeight: 1.7,
          }}
        >
          Vous avez annulé le paiement. Votre panier a été conservé — vous
          pouvez reprendre votre commande quand vous le souhaitez.
        </p>

        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/checkout" className="btn-primary">
            Réessayer le paiement
          </Link>
          <Link to="/" className="btn-outline">
            Retour à la boutique
          </Link>
        </div>
      </div>
    </main>
  );
}

export default CheckoutCancel;

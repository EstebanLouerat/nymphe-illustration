// src/pages/CheckoutSuccess.jsx
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { useStore } from "../services/store";
import { PaymentService } from "../services/api";

function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [order, setOrder] = useState(null);
  const { clearCart } = useStore();

  useEffect(() => {
    // Clear the cart on successful payment
    clearCart();

    // Optionally fetch order details to display them
    if (sessionId) {
      PaymentService.fetchOrderStatus(sessionId).then((data) => {
        if (data) setOrder(data);
      });
    }
  }, [sessionId, clearCart]);

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
          <CheckCircle size={56} color="var(--sage-dark)" strokeWidth={1.5} />
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
          Merci pour votre commande !
        </h1>

        <p
          style={{
            color: "var(--brown-light)",
            marginBottom: "8px",
            lineHeight: 1.7,
          }}
        >
          Votre paiement a été confirmé. Vous recevrez une confirmation par
          e-mail sous peu.
        </p>

        {order?.customerEmail && (
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--brown-light)",
              marginBottom: "32px",
            }}
          >
            Confirmation envoyée à{" "}
            <strong style={{ color: "var(--text)" }}>{order.customerEmail}</strong>
          </p>
        )}

        {!order?.customerEmail && (
          <div style={{ marginBottom: "32px" }} />
        )}

        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/" className="btn-primary">
            Retour à la boutique
          </Link>
          <Link to="/commission" className="btn-outline">
            Commander une illustration
          </Link>
        </div>
      </div>
    </main>
  );
}

export default CheckoutSuccess;

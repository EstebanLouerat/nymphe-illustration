// src/pages/CheckoutCancel.jsx
import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { XCircle } from "lucide-react";
import { StockService } from "../services/stock";
import { useStore } from "../services/store";

function CheckoutCancel() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const loadStock = useStore((s) => s.loadStock);
  const done = useRef(false);

  // Annulation → on rend le stock réservé tout de suite,
  // sans attendre l'expiration de la session Stripe.
  useEffect(() => {
    if (!sessionId || done.current) return;
    done.current = true;
    StockService.releaseSession(sessionId).finally(() => loadStock());
  }, [sessionId, loadStock]);

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
          Vous avez annulé le paiement. Votre panier a été conservé - vous
          pouvez reprendre votre commande quand vous le souhaitez.
        </p>

        <div
          style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
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

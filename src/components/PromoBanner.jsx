import { useState } from "react";
import { X, Tag, Copy } from "lucide-react";
import { useStore } from "../services/store";
import "./PromoBanner.css";

function PromoBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { showToast } = useStore();

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText("BIENVENUE20");
      showToast("Code promo copié !", "success", 3000);
    } catch (err) {
      showToast("Erreur lors de la copie", "error");
    }
  };

  // Masquer la banner à partir du 18 mai 2026
  const expirationDate = new Date(2026, 4, 18); // Mois 0-indexé : 4 = mai
  if (new Date() >= expirationDate) return null;

  if (dismissed) return null;

  return (
    <div className="promo-banner" role="banner">
      <div className="promo-banner-inner">
        <Tag size={13} className="promo-banner-icon" />
        <p className="promo-banner-text">
          <span className="promo-banner-code">
            <span>BIENVENUE20</span>
            <button
              className="promo-banner-copy-btn"
              onClick={handleCopyCode}
              aria-label="Copier le code promo"
              title="Copier le code promo"
            >
              <Copy size={12} />
            </button>
          </span>
          <span className="promo-banner-sep">·</span>
          <span>−20 % sur votre première commande</span>
        </p>
        <button
          className="promo-banner-close"
          onClick={() => setDismissed(true)}
          aria-label="Fermer"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}

export default PromoBanner;

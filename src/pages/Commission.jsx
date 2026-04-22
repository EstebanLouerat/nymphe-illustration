import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FormService } from "../services/api";
import { useStore } from "../services/store";
import { Mail, Instagram, Clock } from "lucide-react";
import "../styles/Commission.css";

function triggerAnimation(elements, className, duration = 500) {
  elements.forEach((el) => {
    if (!el) return;
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
    setTimeout(() => el.classList.remove(className), duration);
  });
}

function Commission() {
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    project_type: "",
    usage: [],
    budget: "",
    deadline: "",
    format: "",
    description: "",
    references: "",
  });
  const [loading, setLoading] = useState(false);
  const [isPhysical, setIsPhysical] = useState(false);
  const { showSuccess, showError } = useStore();

  const priceRefs = useRef([]);
  const featuresRefs = useRef([]);

  // Scroll vers #tarifs si l'ancre est présente dans l'URL
  useEffect(() => {
    if (location.hash === "#tarifs") {
      const el = document.getElementById("tarifs");
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, [location.hash]);

  const handleToggle = () => {
    setIsPhysical((prev) => !prev);
    triggerAnimation(priceRefs.current, "is-animating", 400);
    triggerAnimation(featuresRefs.current, "is-animating", 500);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        usage: checked
          ? [...prev.usage, value]
          : prev.usage.filter((u) => u !== value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await FormService.submitCommission(formData);

    if (result.ok) {
      showSuccess(
        "✦ Votre demande a bien été envoyée ! Je vous réponds dans les 48 heures.",
      );
      setFormData({
        name: "",
        email: "",
        project_type: "",
        usage: [],
        budget: "",
        deadline: "",
        format: "",
        description: "",
        references: "",
      });
    } else {
      showError("Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
    }
    setLoading(false);
  };

  const CARDS = [
    {
      name: "Simple",
      featured: false,
      digital: {
        price: 35,
        features: [
          "1 sujet simple coupé à la taille",
          "Idéal pour les photos de profil ou les petits budgets",
          "Délai : 3 à 4 semaines",
        ],
      },
      physical: {
        price: 50,
        features: [
          "1 sujet simple coupé à la taille",
          "Idéal pour les photos de profil ou les petits budgets",
          "Délai : 3 à 4 semaines",
          "Frais de livraison inclus",
        ],
      },
    },
    {
      name: "Complet",
      featured: true,
      digital: {
        price: 50,
        features: [
          "1 ou plusieurs sujets en entier",
          "Fond plus travaillé",
          "Idéal pour les projets plus ambitieux",
          "Délai : 3 à 4 semaines",
        ],
      },
      physical: {
        price: 65,
        features: [
          "1 ou plusieurs sujets en entier",
          "Fond plus travaillé",
          "Idéal pour les projets plus ambitieux",
          "Délai : 3 à 4 semaines",
          "Frais de livraison inclus",
        ],
      },
    },
  ];

  return (
    <main>
      <div className="page-hero">
        <h1>Commissions</h1>
        <p>Une illustration créée rien que pour vous</p>
      </div>
      <hr className="divider" />

      <div className="commission-intro">
        <h2>Comment ça marche ?</h2>
        <p>
          Je réalise des illustrations sur mesure à l'aquarelle numérique pour
          des particuliers, des éditeurs et des marques. Portraits,
          illustrations botaniques, projets d'identité visuelle… Chaque commande
          est traitée avec soin et dans un dialogue constant avec vous.
        </p>
      </div>

      <div id="creatif-procession" className="process-section">
        <h2>Le processus créatif</h2>
        <div className="process-steps">
          {[
            {
              n: 1,
              t: "Brief",
              p: "Contactez moi par email ou sur Instagram pour me parler de votre projet. Je reviens vers vous sous 48h.",
            },
            {
              n: 2,
              t: "Devis",
              p: "J'envoie un devis personnalisé. Seulement une fois le paiement effectué, la création peut commencer.",
            },
            {
              n: 3,
              t: "Esquisse",
              p: "À chaque étape de la création, je vous partage le travail et je ferai tous les changements nécessaires pour votre satisfaction.",
            },
            {
              n: 4,
              t: "Livraison",
              p: "L'illustration finale est disponible en version numérique ou physique à la demande :)",
            },
          ].map(({ n, t, p }) => (
            <div key={n} className="step">
              <div className="step-number">{n}</div>
              <h3>{t}</h3>
              <p>{p}</p>
            </div>
          ))}
        </div>
      </div>

      <hr className="divider" />

      <div id="tarifs" className="pricing-header">
        <h2>Tarifs indicatifs</h2>

        <div className="offer-toggle-container">
          <p>Reçu final : </p>
          <span className={`toggle-label ${!isPhysical ? "active" : ""}`}>
            Digital
          </span>
          <button
            className={`offer-toggle ${isPhysical ? "physical" : "digital"}`}
            onClick={handleToggle}
            aria-label="Toggle entre livrable digital et livrable physique"
          >
            <span className="toggle-indicator"></span>
          </button>
          <span className={`toggle-label ${isPhysical ? "active" : ""}`}>
            Physique
          </span>
        </div>
      </div>

      <div className="pricing-grid">
        {CARDS.map((card, i) => {
          const offer = isPhysical ? card.physical : card.digital;
          return (
            <div
              key={card.name}
              className={`pricing-card ${card.featured ? "featured" : ""}`}
            >
              <p className="pricing-name">{card.name}</p>
              <p
                className="pricing-price"
                ref={(el) => (priceRefs.current[i] = el)}
              >
                À partir de {offer.price} <span>€</span>
              </p>
              <ul
                className="pricing-features"
                ref={(el) => (featuresRefs.current[i] = el)}
              >
                {offer.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <hr className="divider" />

      <div className="commission-form-wrap">
        <h2>Parlez-moi de votre projet</h2>
        <p>
          Plus vous donnez de détails, plus je pourrai vous proposer une
          illustration qui vous ressemble.
        </p>

        <div className="contact-info">
          <a
            className="contact-link"
            href="mailto:nympheillustration@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="contact-card">
              <Mail size={22} />
              <h4>Email</h4>
              <p>nympheillustration@gmail.com</p>
            </div>
          </a>
          <a
            className="contact-link"
            href="https://www.instagram.com/nympheillustration/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="contact-card">
              <Instagram size={22} />
              <h4>Instagram</h4>
              <p>@nympheillustration</p>
            </div>
          </a>
          <div className="contact-card">
            <Clock size={22} />
            <h4>Réponse sous</h4>
            <p>48 heures</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Commission;

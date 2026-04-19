import { useState } from "react";
import { FormService } from "../services/api";
import { useStore } from "../services/store";
import { Mail, Instagram, Clock } from "lucide-react";

function Commission() {
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
  const { showSuccess, showError } = useStore();

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
              p: "Vous remplissez le formulaire ci-dessous. Je reviens vers vous sous 48h pour affiner le projet.",
            },
            {
              n: 2,
              t: "Devis & acompte",
              p: "J'envoie un devis personnalisé. Après validation, un acompte de 50 % lance la création.",
            },
            {
              n: 3,
              t: "Esquisse",
              p: "Je partage une ou deux esquisses. Vous validez ou demandez des ajustements (2 révisions incluses).",
            },
            {
              n: 4,
              t: "Livraison",
              p: "L'illustration finale est envoyée en haute résolution. Solde payé à la livraison.",
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

      <div
        id="tarifs"
        style={{ padding: "52px 24px 8px", textAlign: "center" }}
      >
        <h2
          style={{
            fontSize: "1.6rem",
            fontWeight: "300",
            marginBottom: "32px",
          }}
        >
          Tarifs indicatifs
        </h2>
      </div>
      <div className="pricing-grid">
        <div className="pricing-card">
          <p className="pricing-label">Petite illustration</p>
          <p className="pricing-name">Vignette</p>
          <p className="pricing-price">
            À partir de 60 <span>€</span>
          </p>
          <ul className="pricing-features">
            <li>Format A6 ou équivalent digital</li>
            <li>1 sujet simple</li>
            <li>Fond uni ou transparent</li>
            <li>2 allers-retours inclus</li>
            <li>Délai : 1–2 semaines</li>
          </ul>
        </div>
        <div className="pricing-card featured">
          <p className="pricing-label">⭑ Le plus demandé</p>
          <p className="pricing-name">Portrait</p>
          <p className="pricing-price">
            À partir de 120 <span>€</span>
          </p>
          <ul className="pricing-features">
            <li>Format A5 ou équivalent digital</li>
            <li>Portrait + éléments botaniques</li>
            <li>Ambiance sur mesure</li>
            <li>2 allers-retours inclus</li>
            <li>Délai : 2–3 semaines</li>
          </ul>
        </div>
        <div className="pricing-card">
          <p className="pricing-label">Projet éditorial</p>
          <p className="pricing-name">Illustration</p>
          <p className="pricing-price">Sur devis</p>
          <ul className="pricing-features">
            <li>Format A4+ ou double page</li>
            <li>Scène complexe / plusieurs sujets</li>
            <li>Droits d'exploitation inclus</li>
            <li>3 allers-retours inclus</li>
            <li>Délai : 3–5 semaines</li>
          </ul>
        </div>
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

        {/* <form id="commission-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="c-name">Prénom & Nom *</label>
              <input
                type="text"
                id="c-name"
                name="name"
                className="form-input"
                placeholder="Marie Dupont"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="c-email">Email *</label>
              <input
                type="email"
                id="c-email"
                name="email"
                className="form-input"
                placeholder="marie@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="c-type">Type de projet *</label>
            <select
              id="c-type"
              name="project_type"
              value={formData.project_type}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionnez un type</option>
              <option value="portrait">Portrait personnel</option>
              <option value="portrait_animal">Portrait d'animal</option>
              <option value="botanique">Illustration botanique</option>
              <option value="editorial">Illustration éditoriale / livre</option>
              <option value="sticker">Set de stickers personnalisés</option>
              <option value="branding">
                Identité visuelle / Logo illustré
              </option>
              <option value="autre">Autre (préciser dans le message)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Usage prévu (plusieurs choix possibles)</label>
            <div className="checkbox-group">
              {[
                { v: "usage_perso", l: "Usage personnel" },
                { v: "impression", l: "Impression / tirage" },
                { v: "commercial", l: "Usage commercial" },
                { v: "web", l: "Web / réseaux sociaux" },
                { v: "editorial", l: "Publication / livre" },
                { v: "cadeau", l: "Cadeau" },
              ].map(({ v, l }) => (
                <label key={v} className="checkbox-item">
                  <input
                    type="checkbox"
                    name="usage"
                    value={v}
                    checked={formData.usage.includes(v)}
                    onChange={handleChange}
                  />
                  {l}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="c-budget">Budget estimé</label>
            <select
              id="c-budget"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
            >
              <option value="">Sélectionnez une fourchette</option>
              <option value="60-100">60 – 100 €</option>
              <option value="100-200">100 – 200 €</option>
              <option value="200-400">200 – 400 €</option>
              <option value="400+">400 € et plus</option>
              <option value="à définir">À définir ensemble</option>
            </select>
            <p className="field-note">
              Le budget est indicatif et sans engagement.
            </p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="c-deadline">Date limite souhaitée</label>
              <input
                type="date"
                id="c-deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
              />
              <p className="field-note">Minimum 3 semaines conseillé.</p>
            </div>
            <div className="form-group">
              <label htmlFor="c-format">Format / support final</label>
              <input
                type="text"
                id="c-format"
                name="format"
                className="form-input"
                placeholder="Ex : A4, fichier numérique…"
                value={formData.format}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="c-desc">Description du projet *</label>
            <textarea
              id="c-desc"
              name="description"
              className="form-input"
              placeholder="Décrivez votre projet : sujet principal, ambiance souhaitée, couleurs préférées…"
              style={{ minHeight: "160px" }}
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="c-refs">Liens de références (optionnel)</label>
            <input
              type="url"
              id="c-refs"
              name="references"
              className="form-input"
              placeholder="https://pinterest.com/votre-tableau"
              value={formData.references}
              onChange={handleChange}
            />
            <p className="field-note">
              Pinterest, Instagram, URL d'images — tout aide à visualiser votre
              idée.
            </p>
          </div>

          <div className="form-submit">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Envoi..." : "Envoyer ma demande de commission"}
            </button>
          </div>
        </form> */}
      </div>
    </main>
  );
}

export default Commission;

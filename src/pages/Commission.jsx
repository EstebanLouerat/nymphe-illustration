import { useState } from "react";
import { FormService } from "../services/api";
import { useStore } from "../services/store";

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
  const [successVisible, setSuccessVisible] = useState(false);
  const { showToast } = useStore();

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
    showToast(result.message);

    if (result.ok) {
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
      setSuccessVisible(true);
      setTimeout(() => setSuccessVisible(false), 5000);
    }
    setLoading(false);
  };

  return (
    <main>
      {/* PAGE HERO */}
      <div className="page-hero">
        <h1>Commissions</h1>
        <p>Une illustration créée rien que pour vous</p>
      </div>
      <hr className="divider" />

      {/* INTRO */}
      <div className="commission-intro">
        <h2>Comment ça marche ?</h2>
        <p>
          Je réalise des illustrations sur mesure à l'aquarelle numérique pour
          des particuliers, des éditeurs et des marques. Portraits,
          illustrations botaniques, projets d'identité visuelle… Chaque commande
          est traitée avec soin et dans un dialogue constant avec vous.
        </p>
      </div>

      {/* PROCESSUS CRÉATIF */}
      <div className="process-section">
        <h2>Le processus créatif</h2>
        <div className="process-steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Brief</h3>
            <p>
              Vous remplissez le formulaire ci-dessous. Je reviens vers vous
              sous 48h pour affiner le projet.
            </p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Devis & acompte</h3>
            <p>
              J'envoie un devis personnalisé. Après validation, un acompte de 50
              % lance la création.
            </p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Esquisse</h3>
            <p>
              Je partage une ou deux esquisses. Vous validez ou demandez des
              ajustements (2 révisions incluses).
            </p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Livraison</h3>
            <p>
              L'illustration finale est envoyée en haute résolution. Solde payé
              à la livraison.
            </p>
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* TARIFS */}
      <div style={{ padding: "52px 24px 8px", textAlign: "center" }}>
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

      {/* FORMULAIRE DE COMMISSION */}
      <div className="commission-form-wrap">
        <h2>Parlez-moi de votre projet</h2>
        <p>
          Plus vous donnez de détails, plus je pourrai vous proposer une
          illustration qui vous ressemble.
        </p>

        <form id="commission-form" onSubmit={handleSubmit}>
          {/* Infos contact */}
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

          {/* Type de projet */}
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

          {/* Usage / destination */}
          <div className="form-group">
            <label>Usage prévu (plusieurs choix possibles)</label>
            <div className="checkbox-group">
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  name="usage"
                  value="usage_perso"
                  checked={formData.usage.includes("usage_perso")}
                  onChange={handleChange}
                />
                Usage personnel
              </label>
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  name="usage"
                  value="impression"
                  checked={formData.usage.includes("impression")}
                  onChange={handleChange}
                />
                Impression / tirage
              </label>
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  name="usage"
                  value="commercial"
                  checked={formData.usage.includes("commercial")}
                  onChange={handleChange}
                />
                Usage commercial
              </label>
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  name="usage"
                  value="web"
                  checked={formData.usage.includes("web")}
                  onChange={handleChange}
                />
                Web / réseaux sociaux
              </label>
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  name="usage"
                  value="editorial"
                  checked={formData.usage.includes("editorial")}
                  onChange={handleChange}
                />
                Publication / livre
              </label>
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  name="usage"
                  value="cadeau"
                  checked={formData.usage.includes("cadeau")}
                  onChange={handleChange}
                />
                Cadeau
              </label>
            </div>
          </div>

          {/* Budget */}
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
              Le budget est indicatif et sans engagement — nous l'affinerons
              ensemble.
            </p>
          </div>

          {/* Deadline */}
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

          {/* Description libre */}
          <div className="form-group">
            <label htmlFor="c-desc">Description du projet *</label>
            <textarea
              id="c-desc"
              name="description"
              className="form-input"
              placeholder="Décrivez votre projet : sujet principal, ambiance souhaitée, couleurs préférées, références visuelles, informations importantes…"
              style={{ minHeight: "160px" }}
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          {/* Références */}
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
        </form>

        {/* Succès */}
        {successVisible && (
          <div className="form-success" style={{ display: "block" }}>
            ✦ Votre demande a bien été envoyée !<br />
            <small style={{ fontSize: "0.8rem", color: "var(--sage-dark)" }}>
              Je vous répondrai dans les 48 heures.
            </small>
          </div>
        )}
      </div>
    </main>
  );
}

export default Commission;

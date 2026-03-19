import { useState } from "react";
import { Mail, Instagram, Clock } from "lucide-react";
import { FormService } from "../services/api";
import { useStore } from "../services/store";

function Contact() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const { showToast } = useStore();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await FormService.submitContact(formData);
    showToast(result.message);

    if (result.ok) {
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        subject: "",
        message: "",
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
        <h1>Contact</h1>
        <p>Une question, une collaboration ? Écrivez-moi.</p>
      </div>
      <hr className="divider" />

      {/* CONTACT CONTENT */}
      <div className="contact-wrap">
        {/* Infos rapides */}
        <div className="contact-info">
          <div className="contact-card">
            <Mail size={22} />
            <h4>Email</h4>
            <p>hello@nymphe-illustration.fr</p>
          </div>
          <div className="contact-card">
            <Instagram size={22} />
            <h4>Instagram</h4>
            <p>@nymphe.illustration</p>
          </div>
          <div className="contact-card">
            <Clock size={22} />
            <h4>Réponse sous</h4>
            <p>48 heures</p>
          </div>
        </div>

        <h2>Envoyez-moi un message</h2>
        <p>
          Pour une commande, une collaboration ou juste dire bonjour — je suis
          ravie de lire vos messages.
        </p>

        <form id="contact-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first-name">Prénom</label>
              <input
                type="text"
                id="first-name"
                name="first_name"
                className="form-input"
                placeholder="Marie"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="last-name">Nom</label>
              <input
                type="text"
                id="last-name"
                name="last_name"
                className="form-input"
                placeholder="Dupont"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="marie@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Sujet</label>
            <input
              type="text"
              id="subject"
              name="subject"
              className="form-input"
              placeholder="Objet de votre message"
              value={formData.subject}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message *</label>
            <textarea
              id="message"
              name="message"
              className="form-input"
              placeholder="Bonjour, je souhaitais…"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-submit">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Envoi..." : "Envoyer le message"}
            </button>
          </div>
        </form>

        {/* Message de succès */}
        {successVisible && (
          <div className="form-success" style={{ display: "block" }}>
            ✦ Merci ! Votre message a bien été envoyé.
            <br />
            <small style={{ fontSize: "0.8rem", color: "var(--sage-dark)" }}>
              Je vous répondrai dans les 48 heures.
            </small>
          </div>
        )}
      </div>
    </main>
  );
}

export default Contact;

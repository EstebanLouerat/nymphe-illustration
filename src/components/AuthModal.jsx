import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { supabase } from "../services/supabase";
import { useStore } from "../services/store";
import "./AuthModal.css";

function AuthModal({ onClose }) {
  const [tab, setTab] = useState("login"); // 'login' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const { showSuccess, showError } = useStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (tab === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage({ type: "error", text: "Email ou mot de passe incorrect." });
      } else {
        showSuccess("Bienvenue !");
        onClose();
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({
          type: "success",
          text: "Vérifiez votre email pour confirmer votre compte.",
        });
      }
    }
    setLoading(false);
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="auth-modal-close"
          onClick={onClose}
          aria-label="Fermer"
        >
          <X size={18} />
        </button>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === "login" ? "active" : ""}`}
            onClick={() => {
              setTab("login");
              setMessage(null);
            }}
          >
            Connexion
          </button>
          <button
            className={`auth-tab ${tab === "signup" ? "active" : ""}`}
            onClick={() => {
              setTab("signup");
              setMessage(null);
            }}
          >
            Créer un compte
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="auth-email">Email</label>
            <input
              type="email"
              id="auth-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="marie@example.com"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Mot de passe</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="auth-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {message && (
            <p className={`auth-message auth-message--${message.type}`}>
              {message.text}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary auth-submit"
            disabled={loading}
          >
            {loading
              ? "Chargement…"
              : tab === "login"
                ? "Se connecter"
                : "Créer mon compte"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthModal;

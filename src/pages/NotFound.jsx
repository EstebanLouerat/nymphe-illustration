import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "4rem", marginBottom: "16px" }}>404</h1>
        <h2>Page non trouvée</h2>
        <p style={{ marginBottom: "32px", color: "var(--brown-light)" }}>
          Désolé, cette page n'existe pas.
        </p>
        <Link to="/" className="btn-primary">
          Retour à l'accueil
        </Link>
      </div>
    </main>
  );
}

export default NotFound;

import { Link } from "react-router-dom";
import { Filter, Instagram } from "lucide-react";
import "./Footer.css";
import Logo from "./Logo";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Logo inverted={true} />
        </div>
        <nav className="footer-links">
          <Link to="/about">À propos</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/commission">Commissions</Link>
        </nav>
        <div className="footer-socials">
          <a href="#" aria-label="Instagram">
            <Instagram size={20} />
          </a>
          {/* <a href="#" aria-label="Pinterest">
            <Pinterest size={20} />
          </a> */}
        </div>
      </div>
      <p className="footer-copy">
        © 2026 Nymphe Illustration — Tous droits réservés
      </p>
    </footer>
  );
}

export default Footer;

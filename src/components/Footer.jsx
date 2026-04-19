import { Link } from "react-router-dom";
import { Filter, Instagram } from "lucide-react";
import { useState, useEffect } from "react";
import "./Footer.css";
import Logo from "./Logo";
import { ContentfulService } from "../services/api";

function Footer() {
  const [snailImage, setSnailImage] = useState(null);

  useEffect(() => {
    const loadSnailImage = async () => {
      const content = await ContentfulService.fetchContent("Snail");
      if (content?.image) {
        setSnailImage(content.image);
      }
    };
    loadSnailImage();
  }, []);

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
        {snailImage && (
          <img
            src={snailImage}
            alt={snailImage.label}
            className="footer-lilou-img"
          />
        )}
      </div>
      <p className="footer-copy">
        © 2026 Nymphe Illustration — Tous droits réservés
      </p>
    </footer>
  );
}

export default Footer;

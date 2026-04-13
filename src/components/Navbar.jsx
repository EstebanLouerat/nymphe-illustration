import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag, Search, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useStore } from "../services/store";
import "./Navbar.css";
import Logo from "./Logo";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toggleCart, cart } = useStore();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="nav-header">
      <div className="nav-inner">
        {/* Logo */}
        <Logo />

        {/* Desktop Links */}
        <nav className="nav-links">
          <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
            Shop
          </Link>
          <Link
            to="/about"
            className={`nav-link ${isActive("/about") ? "active" : ""}`}
          >
            Bio
          </Link>
          <Link
            to="/commission"
            className={`nav-link ${isActive("/commission") ? "active" : ""}`}
          >
            Commission
          </Link>
          <Link
            to="/contact"
            className={`nav-link ${isActive("/contact") ? "active" : ""}`}
          >
            Contact
          </Link>
        </nav>

        {/* Icons */}
        <div className="nav-icons">
          {/* <button className="icon-btn" aria-label="Rechercher">
            <Search size={20} />
          </button>
          <button className="icon-btn" aria-label="Mon compte">
            <User size={20} />
          </button> */}
          <div className="cart-btn-wrap">
            <button
              className="icon-btn"
              id="cart-toggle"
              onClick={(e) => {
                e.stopPropagation();
                toggleCart();
              }}
              aria-label="Panier"
            >
              <ShoppingBag size={20} />
            </button>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="icon-btn hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
        <Link
          to="/"
          className="mobile-link"
          onClick={() => setMobileMenuOpen(false)}
        >
          Shop
        </Link>
        <Link
          to="/about"
          className="mobile-link"
          onClick={() => setMobileMenuOpen(false)}
        >
          Bio
        </Link>
        <Link
          to="/commission"
          className="mobile-link"
          onClick={() => setMobileMenuOpen(false)}
        >
          Commission
        </Link>
        <Link
          to="/contact"
          className="mobile-link"
          onClick={() => setMobileMenuOpen(false)}
        >
          Contact
        </Link>
        <Link
          to="/commission"
          className="mobile-link"
          onClick={() => setMobileMenuOpen(false)}
        >
          Commander
        </Link>
      </div>
    </header>
  );
}

export default Navbar;

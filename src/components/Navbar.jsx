import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag, Search, User } from "lucide-react";
import { useState, useEffect } from "react";
import AuthModal from "./AuthModal";
import { useStore } from "../services/store";
import "./Navbar.css";
import Logo from "./Logo";
import ScrollLink from "./ScrollLink";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toggleCart, cart } = useStore();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const location = useLocation();
  const [authOpen, setAuthOpen] = useState(false);
  const { user } = useStore();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="nav-header">
      <div className="nav-inner">
        {/* Logo */}
        <Logo />

        {/* Desktop Links */}
        <nav className="nav-links">
          <ScrollLink
            to="/"
            className={`nav-link ${isActive("/") ? "active" : ""}`}
          >
            Shop
          </ScrollLink>
          <ScrollLink
            to="/about"
            className={`nav-link ${isActive("/about") ? "active" : ""}`}
          >
            Bio
          </ScrollLink>
          <ScrollLink
            to="/commission"
            className={`nav-link ${isActive("/commission") ? "active" : ""}`}
          >
            Commission
          </ScrollLink>
          <ScrollLink
            to="/contact"
            className={`nav-link ${isActive("/contact") ? "active" : ""}`}
          >
            Contact
          </ScrollLink>
        </nav>

        {/* Icons */}
        <div className="nav-icons">
          {user ? (
            <ScrollLink
              to="/account"
              className="icon-btn"
              aria-label="Mon compte"
            >
              <User size={20} />
            </ScrollLink>
          ) : (
            <button
              className="icon-btn"
              onClick={() => setAuthOpen(true)}
              aria-label="Se connecter"
            >
              <User size={20} />
            </button>
          )}

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

        {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
        <Link
          to="/#shop"
          className="mobile-link"
          onClick={() => {
            // const shopSection = document.getElementById("shop");
            setMobileMenuOpen(false);
            // window.scrollTo(0, shopSection ? shopSection.offsetTop - 80 : 0);
          }}
        >
          Shop
        </Link>
        <Link
          to="/about"
          className="mobile-link"
          onClick={() => {
            setMobileMenuOpen(false);
            window.scrollTo(0, 0);
          }}
        >
          Bio
        </Link>
        <Link
          to="/commission"
          className="mobile-link"
          onClick={() => {
            setMobileMenuOpen(false);
            window.scrollTo(0, 0);
          }}
        >
          Commission
        </Link>
        <Link
          to="/contact"
          className="mobile-link"
          onClick={() => {
            setMobileMenuOpen(false);
            window.scrollTo(0, 0);
          }}
        >
          Contact
        </Link>
        {/* <Link
          to="/commission"
          className="mobile-link"
          onClick={() => setMobileMenuOpen(false)}
        >
          Commander
        </Link> */}
      </div>
    </header>
  );
}

export default Navbar;

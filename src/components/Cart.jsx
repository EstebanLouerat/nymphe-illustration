import { X, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "../services/store";
import "./Cart.css";

function Cart() {
  const { cart, cartOpen, closeCart, removeFromCart, updateCartQuantity } =
    useStore();

  const cartTotal = cart.reduce(
    (sum, item) => sum + (item.prix || 0) * item.quantity,
    0,
  );

  //   console.log("Cart contents:", cart);

  return (
    <>
      {/* Overlay */}
      {cartOpen && (
        <div
          className="cart-overlay"
          onClick={(e) => {
            e.preventDefault();
            closeCart();
          }}
        />
      )}

      {/* Panel */}
      <aside
        className={`cart-panel ${cartOpen ? "open" : ""}`}
        role="dialog"
        aria-label="Panier"
        style={{
          transform: cartOpen ? "translateX(0)" : "translateX(100%)",
          pointerEvents: cartOpen ? "auto" : "none",
        }}
      >
        <div className="cart-header">
          <h2>Votre panier</h2>
          <button
            className="cart-close"
            onClick={closeCart}
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="cart-items-list">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <p>Votre panier est vide</p>
              <a
                href="index.html#galerie"
                onClick={(e) => {
                  e.preventDefault();
                  closeCart();
                }}
              >
                Découvrir les illustrations →
              </a>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-item">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.titre}
                    className="cart-item-img"
                  />
                )}
                <div className="cart-item-info">
                  <h4>{item.titre}</h4>
                  <p className="cart-item-price">€ {item.prix}</p>
                </div>
                <div className="cart-item-qty">
                  <button
                    onClick={() =>
                      updateCartQuantity(item.id, item.quantity - 1)
                    }
                    className="qty-btn"
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateCartQuantity(item.id, item.quantity + 1)
                    }
                    className="qty-btn"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="cart-remove"
                  aria-label="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total:</span>
              <span>€ {cartTotal.toFixed(2)}</span>
            </div>
            <Link
              to="/checkout"
              className="btn-primary"
              style={{ textDecoration: "none", textAlign: "center" }}
              onClick={closeCart}
            >
              Procéder au paiement
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}

export default Cart;

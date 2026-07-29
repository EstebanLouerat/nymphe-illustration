import { X, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "../services/store";
import "./Cart.css";
import ScrollLink from "./ScrollLink";

function Cart() {
  const {
    cart,
    cartOpen,
    closeCart,
    removeFromCart,
    updateCartQuantity,
    stock,
  } = useStore();

  const cartTotal = cart.reduce(
    (sum, item) => sum + (item.prix || 0) * item.quantity,
    0,
  );

  // Un id absent de `stock` = illustration non suivie (stock illimité)
  const availableFor = (id) => (id in stock ? stock[id] : null);
  const blocked = cart.some((item) => {
    const available = availableFor(item.id);
    return available !== null && item.quantity > available;
  });

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
              <ScrollLink
                to="/#galerie"
                onClick={(e) => {
                  e.preventDefault();
                  closeCart();
                }}
              >
                Découvrir les illustrations →
              </ScrollLink>
            </div>
          ) : (
            cart.map((item) => {
              const available = availableFor(item.id);
              const outOfStock = available !== null && available <= 0;
              const atMax = available !== null && item.quantity >= available;

              return (
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
                  {outOfStock ? (
                    <p className="cart-item-stock cart-item-stock--out">
                      Rupture de stock
                    </p>
                  ) : (
                    atMax && (
                      <p className="cart-item-stock">
                        Dernier{available > 1 ? "s" : ""} exemplaire
                        {available > 1 ? "s" : ""} disponible
                        {available > 1 ? "s" : ""}
                      </p>
                    )
                  )}
                </div>
                <div className="cart-item-qty">
                  <button
                    onClick={() =>
                      updateCartQuantity(item.id, item.quantity - 1)
                    }
                    className="qty-btn"
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateCartQuantity(item.id, item.quantity + 1)
                    }
                    className="qty-btn"
                    disabled={atMax}
                    title={atMax ? "Stock maximum atteint" : undefined}
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
              );
            })
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total:</span>
              <span>€ {cartTotal.toFixed(2)}</span>
            </div>
            {blocked && (
              <p className="cart-stock-warning">
                Un article de votre panier n'est plus disponible en quantité
                suffisante. Ajustez la quantité ou retirez-le pour continuer.
              </p>
            )}
            {blocked ? (
              <button className="btn-primary" disabled style={{ width: "100%" }}>
                Procéder au paiement
              </button>
            ) : (
              <Link
                to="/checkout"
                className="btn-primary"
                style={{ textDecoration: "none", textAlign: "center" }}
                onClick={() => {
                  window.scrollTo(0, 0);
                  closeCart();
                }}
              >
                Procéder au paiement
              </Link>
            )}
          </div>
        )}
      </aside>
    </>
  );
}

export default Cart;

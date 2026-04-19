import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Heart, Package, ShoppingBag, User } from "lucide-react";
import { supabase } from "../services/supabase";
import { useStore } from "../services/store";
import { ContentfulService } from "../services/api";
import "../styles/Account.css";

function Account() {
  const { user, favorites, toggleFavorite, showSuccess } = useStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [favProducts, setFavProducts] = useState([]);
  const [tab, setTab] = useState("orders");
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    loadData();
  }, [user]);

  // Resync les produits favoris quand le store change
  useEffect(() => {
    if (!user) return;
    ContentfulService.fetchIllustrations().then((all) => {
      setFavProducts(all.filter((p) => favorites.includes(p.id)));
    });
  }, [favorites]);

  const loadData = async () => {
    setLoading(true);
    const { data: ordersData } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setOrders(ordersData ?? []);

    const all = await ContentfulService.fetchIllustrations();
    setFavProducts(all.filter((p) => favorites.includes(p.id)));
    setLoading(false);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    showSuccess("À bientôt !");
    navigate("/");
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <main className="account-page">
      {/* ── Sidebar ── */}
      <aside className="account-sidebar">
        <div className="account-sidebar-top">
          <div className="account-avatar">
            <User size={24} strokeWidth={1.5} />
          </div>
          <div className="account-identity">
            <p className="account-name">Mon compte</p>
            <p className="account-email">{user?.email}</p>
          </div>
        </div>

        <nav className="account-nav">
          <button
            className={`account-nav-item ${tab === "orders" ? "active" : ""}`}
            onClick={() => setTab("orders")}
          >
            <Package size={16} strokeWidth={1.5} />
            <span>Commandes</span>
            {orders.length > 0 && (
              <span className="account-nav-badge">{orders.length}</span>
            )}
          </button>
          <button
            className={`account-nav-item ${tab === "favorites" ? "active" : ""}`}
            onClick={() => setTab("favorites")}
          >
            <Heart size={16} strokeWidth={1.5} />
            <span>Favoris</span>
            {favorites.length > 0 && (
              <span className="account-nav-badge">{favorites.length}</span>
            )}
          </button>
        </nav>

        {/* Déconnexion tout en bas de la sidebar */}
        <button
          className="account-signout"
          onClick={handleSignOut}
          disabled={signingOut}
        >
          <LogOut size={15} />
          {signingOut ? "Déconnexion…" : "Se déconnecter"}
        </button>
      </aside>

      {/* ── Contenu principal ── */}
      <div className="account-content">
        {loading ? (
          <div className="account-loading">
            <div className="account-loading-dots">
              <span />
              <span />
              <span />
            </div>
          </div>
        ) : (
          <>
            {tab === "orders" && (
              <div className="account-section">
                <h2 className="account-section-title">
                  {orders.length > 0
                    ? `${orders.length} commande${orders.length > 1 ? "s" : ""}`
                    : "Commandes"}
                </h2>

                {orders.length === 0 ? (
                  <div className="account-empty">
                    <ShoppingBag size={44} strokeWidth={1} />
                    <p>Vous n'avez pas encore passé de commande.</p>
                    <Link to="/" className="btn-outline">
                      Découvrir la boutique
                    </Link>
                  </div>
                ) : (
                  <div className="orders-list">
                    {orders.map((order) => (
                      <div key={order.id} className="order-card">
                        <div className="order-card-header">
                          <div>
                            <p className="order-date">
                              {formatDate(order.created_at)}
                            </p>
                            <p className="order-ref">
                              Réf.{" "}
                              {order.stripe_session_id?.slice(-8).toUpperCase()}
                            </p>
                          </div>
                          <div className="order-total-wrap">
                            <span className="order-badge">Confirmée</span>
                            <span className="order-total">
                              € {((order.amount_total ?? 0) / 100).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="order-items">
                          {(order.items ?? []).map((item, i) => (
                            <div key={i} className="order-item">
                              <div className="order-item-img-wrap">
                                {item.image ? (
                                  <img src={item.image} alt={item.titre} />
                                ) : (
                                  <div className="order-item-placeholder" />
                                )}
                                {item.quantity > 1 && (
                                  <span className="order-item-qty">
                                    ×{item.quantity}
                                  </span>
                                )}
                              </div>
                              <div className="order-item-info">
                                <p className="order-item-name">{item.titre}</p>
                                {item.selectedFormat && (
                                  <p className="order-item-meta">
                                    Format {item.selectedFormat}
                                  </p>
                                )}
                                <p className="order-item-price">
                                  € {(item.prix * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "favorites" && (
              <div className="account-section">
                <h2 className="account-section-title">
                  {favProducts.length > 0
                    ? `${favProducts.length} illustration${favProducts.length > 1 ? "s" : ""} sauvegardée${favProducts.length > 1 ? "s" : ""}`
                    : "Favoris"}
                </h2>

                {favProducts.length === 0 ? (
                  <div className="account-empty">
                    <Heart size={44} strokeWidth={1} />
                    <p>Aucun favori pour l'instant.</p>
                    <Link to="/" className="btn-outline">
                      Parcourir les illustrations
                    </Link>
                  </div>
                ) : (
                  <div className="fav-grid">
                    {favProducts.map((item) => (
                      <div key={item.id} className="fav-card">
                        <Link
                          to={`/product/${item.id}`}
                          className="fav-card-img-wrap"
                        >
                          <img src={item.image} alt={item.titre} />
                          <div className="fav-card-overlay">
                            <span>Voir</span>
                          </div>
                        </Link>
                        <div className="fav-card-body">
                          <div className="fav-card-info">
                            <p className="fav-card-name">{item.titre}</p>
                            {item.prix && (
                              <p className="fav-card-price">€ {item.prix}</p>
                            )}
                          </div>
                          <button
                            className="fav-card-remove"
                            aria-label="Retirer des favoris"
                            onClick={() => toggleFavorite(item.id)}
                          >
                            <Heart size={15} fill="currentColor" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default Account;

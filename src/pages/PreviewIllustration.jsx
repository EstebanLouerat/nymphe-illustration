// ============================================================
//  POUR LE SITE PRINCIPAL (nympheillustration.com)
//  src/pages/PreviewIllustration.jsx
//
//  Route : /preview/illustration?id=XXX&preview=true
//  Cette page est chargée dans l'iframe de l'admin split-screen.
//  Elle écoute les messages postMessage de l'admin et met à jour
//  l'affichage en temps réel avant toute sauvegarde dans Contentful.
// ============================================================

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Heart, Truck, Package, CheckCircle } from "lucide-react";
import { ContentfulService } from "../services/api";

// Allowed origin for postMessage (your admin domain)
const ADMIN_ORIGIN =
  import.meta.env.VITE_ADMIN_URL ?? "https://admin.nympheillustration.com";

export default function PreviewIllustration() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const isPreview = searchParams.get("preview") === "true";

  // Saved (Contentful) data
  const [saved, setSaved] = useState(null);
  // Live override from admin postMessage
  const [override, setOverride] = useState(null);

  // The data we actually display = override (live) ?? saved (Contentful)
  const product = override ?? saved;

  // ── Load base data from Contentful ───────────────────────────
  useEffect(() => {
    if (!id) return;
    ContentfulService.fetchIllustrationById(id).then(setSaved);
  }, [id]);

  // ── Listen for live updates from the admin panel ──────────────
  useEffect(() => {
    if (!isPreview) return;

    function onMessage(event) {
      // Security: only accept messages from the admin domain
      if (event.origin !== ADMIN_ORIGIN) return;
      if (event.data?.type !== "NYMPHE_PREVIEW_UPDATE") return;

      const payload = event.data.payload;
      setOverride({
        id: id ?? "preview",
        titre: payload.titre ?? "",
        description: payload.description ?? "",
        prix: payload.prix ?? 0,
        category: payload.category ?? "",
        tag: payload.tag ?? [],
        image: payload.imageAsset ?? null,
      });
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [id, isPreview]);

  // ── Render ────────────────────────────────────────────────────

  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen bg-linen">
        <p className="text-brown-light text-sm animate-pulse">
          Chargement de la preview…
        </p>
      </div>
    );
  }

  const imageUrl = product.image?.url
    ? `${product.image.url}?w=700&fm=webp&q=85`
    : null;

  return (
    <>
      {/* Preview banner */}
      {isPreview && (
        <div
          style={{
            position: "fixed",
            top: 0,
            insetInline: 0,
            zIndex: 9999,
            background: "#5e854e",
            color: "white",
            fontSize: "0.72rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            textAlign: "center",
            padding: "6px 12px",
            fontFamily: "var(--font-body)",
          }}
        >
          ✦ Mode Preview - modifications non sauvegardées
        </div>
      )}

      <main style={{ paddingTop: isPreview ? 32 : 0 }}>
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <span>Accueil</span>
          <span>›</span>
          <span>Galerie</span>
          <span>›</span>
          <span>{product.titre}</span>
        </nav>

        {/* Product layout */}
        <div className="product-page">
          {/* Gallery */}
          <div className="product-gallery">
            <div className="product-gallery-main">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.titre}
                  className="product-img"
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    background: "var(--linen-dark)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--brown-light)",
                    fontSize: "0.8rem",
                  }}
                >
                  Aucune image
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="product-detail">
            {product.category && (
              <p className="product-detail-category">{product.category}</p>
            )}

            <h1
              className="product-detail-title"
              style={{ transition: "all 0.2s ease" }}
            >
              {product.titre || "Sans titre"}
            </h1>

            <p className="product-detail-price">
              {product.prix ? `€ ${product.prix}` : "-"}
            </p>

            <hr className="product-detail-divider" />

            {product.description && (
              <p
                className="product-detail-desc"
                style={{ transition: "all 0.2s ease" }}
              >
                {product.description}
              </p>
            )}

            {/* Tags */}
            {product.tag?.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginBottom: 20,
                }}
              >
                {product.tag.map((t) => (
                  <span
                    key={t}
                    style={{
                      padding: "3px 10px",
                      borderRadius: 99,
                      fontSize: "0.72rem",
                      background: "var(--sage-light)",
                      color: "var(--sage-dark)",
                      border: "1px solid var(--sage)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Format selector (static in preview) */}
            <p className="format-label">Format</p>
            <div className="format-options">
              {["A5 - 14×21 cm", "A4 - 21×29 cm", "A3 - 30×42 cm"].map(
                (f, i) => (
                  <button
                    key={f}
                    className={`format-btn ${i === 0 ? "selected" : ""}`}
                    onClick={(e) => {
                      e.currentTarget.parentElement
                        ?.querySelectorAll(".format-btn")
                        .forEach((b) => b.classList.remove("selected"));
                      e.currentTarget.classList.add("selected");
                    }}
                  >
                    {f}
                  </button>
                ),
              )}
            </div>

            {/* CTA */}
            <div className="product-cta">
              <button
                className="btn-primary"
                style={{ flex: 1, opacity: 0.6, cursor: "default" }}
              >
                Ajouter au panier
              </button>
              <button
                className="btn-wishlist"
                aria-label="Favoris"
                style={{ opacity: 0.6 }}
              >
                <Heart size={20} />
              </button>
            </div>

            {/* Shipping info */}
            <div className="shipping-info">
              {[
                [Truck, "Livraison en 3–5 jours ouvrés"],
                [Package, "Emballage sécurisé, tube ou pochette rigide"],
                [CheckCircle, "Impression signée, édition limitée"],
              ].map(([Icon, text]) => (
                <div key={text} className="shipping-row">
                  <Icon size={16} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

import { useState, useEffect } from "react";
import { ContentfulService } from "../services/api";
import { useStore } from "../services/store";
import Hero from "../components/Hero";
import ProductGrid from "../components/ProductGrid";

function Home() {
  const [heroContent, setHeroContent] = useState(null);
  const { setLoading } = useStore();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const hero = await ContentfulService.fetchContent("Hero Image");
      setHeroContent(hero);
      setLoading(false);
    };
    load();
  }, [setLoading]);

  return (
    <main>
      {heroContent && <Hero content={heroContent} />}
      <ProductGrid />
      <CommissionBanner />
    </main>
  );
}

function CommissionBanner() {
  return (
    <section className="commission-banner" style={{ padding: "80px 24px" }}>
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "72px",
          alignItems: "center",
        }}
      >
        {/* Colonne gauche */}
        <div>
          <p
            style={{
              fontSize: "0.68rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--sage-dark)",
              marginBottom: "18px",
            }}
          >
            Commissions sur mesure
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2.6rem",
              fontWeight: 300,
              color: "var(--text)",
              lineHeight: 1.2,
              marginBottom: "20px",
            }}
          >
            Une illustration <em>rien que</em>
            <br />
            pour vous
          </h2>
          <p
            style={{
              fontSize: "0.88rem",
              color: "var(--brown-light)",
              lineHeight: 1.85,
              marginBottom: "36px",
              maxWidth: "380px",
            }}
          >
            Chaque commande est pensée dans un dialogue constant avec vous, de
            l'esquisse à la livraison.
          </p>

          {/* Étapes */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              marginBottom: "40px",
            }}
          >
            {[
              {
                n: "1",
                title: "Brief",
                desc: "remplissez le formulaire, je reviens sous 48h",
              },
              {
                n: "2",
                title: "Esquisse",
                desc: "validation & retouches incluses",
              },
              {
                n: "3",
                title: "Livraison",
                desc: "fichier haute résolution signé",
              },
            ].map(({ n, title, desc }) => (
              <div
                key={n}
                style={{ display: "flex", alignItems: "center", gap: "14px" }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "var(--sage-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontFamily: "var(--font-display)",
                    fontSize: "0.85rem",
                    color: "var(--green-dark)",
                  }}
                >
                  {n}
                </div>
                <p style={{ fontSize: "0.82rem", color: "var(--brown-light)" }}>
                  <strong style={{ color: "var(--text)", fontWeight: 400 }}>
                    {title}
                  </strong>{" "}
                  — {desc}
                </p>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <a href="/commission" className="btn-primary">
              Commander une commission
            </a>
            <a href="/commission#tarifs" className="btn-outline">
              Voir les tarifs →
            </a>
          </div>
        </div>

        {/* Colonne droite — carte exemple */}
        <div
          style={{
            background: "var(--white)",
            border: "1px solid var(--linen-dark)",
            borderRadius: "var(--radius)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "280px",
              background:
                "linear-gradient(135deg, var(--sage-light) 0%, var(--tan) 60%, var(--sage) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.1rem",
                fontStyle: "italic",
                color: "var(--sage-dark)",
                opacity: 0.6,
              }}
            >
              illustration sur mesure
            </span>
            <span
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "var(--linen)",
                border: "1px solid var(--linen-dark)",
                borderRadius: "99px",
                padding: "5px 14px",
                fontSize: "0.65rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--sage-dark)",
              }}
            >
              ⭑ Le plus demandé
            </span>
          </div>
          <div style={{ padding: "20px 22px" }}>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.4rem",
                fontWeight: 300,
                color: "var(--text)",
                marginBottom: "4px",
              }}
            >
              Illustration personnalisée
            </p>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.1rem",
                color: "var(--brown)",
              }}
            >
              À partir de 120 €
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;

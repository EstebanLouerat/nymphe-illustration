import { useState, useEffect } from "react";
import { ContentfulService } from "../services/api";
import { useStore } from "../services/store";
import Hero from "../components/Hero";
import ProductGrid from "../components/ProductGrid";
import PromoBanner from "../components/PromoBanner";

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
      <PromoBanner />
      <ProductGrid />
      <CommissionBanner />
    </main>
  );
}

function CommissionBanner() {
  const [commissionImg, setCommissionImg] = useState(null);

  useEffect(() => {
    const loadCommissionImg = async () => {
      const content = await ContentfulService.fetchContent(
        "Commission Exemple Image",
      );
      if (content?.image) {
        setCommissionImg(content.image);
      }
    };
    loadCommissionImg();
  }, []);

  return (
    <section className="commission-banner">
      <div className="commission-banner-inner">
        {/* Colonne gauche - texte */}
        <div className="commission-banner-text">
          <p className="commission-banner-eyebrow">Commissions sur mesure</p>

          <h2 className="commission-banner-title">
            Une illustration rien que&nbsp;
            <br className="commission-banner-br" />
            pour vous
          </h2>

          <p className="commission-banner-desc">
            Chaque commande est pensée dans un dialogue constant avec vous, du
            crayonné à la livraison.
          </p>

          {/* Étapes */}
          <ol className="commission-banner-steps">
            {[
              {
                n: "1",
                title: "Brief",
                desc: "contacter moi sur Instagram, je réponds sous 48h",
              },
              {
                n: "2",
                title: "Crayonné",
                desc: "validation & retouches incluses",
              },
              {
                n: "3",
                title: "Livraison",
                desc: "par voie postale ou numérique, à votre convenance",
              },
            ].map(({ n, title, desc }) => (
              <li key={n} className="commission-banner-step">
                <span className="commission-banner-step-num">{n}</span>
                <p className="commission-banner-step-text">
                  <strong>{title}</strong> - {desc}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div className="commission-banner-card">
          <div className="commission-banner-card-img">
            {commissionImg ? (
              <img
                src={commissionImg}
                alt="Exemple de commission personnalisée"
                className="commission-banner-card-image"
              />
            ) : (
              <span className="commission-banner-card-watermark">
                illustration sur mesure
              </span>
            )}
            <span className="commission-banner-card-badge">
              ⭑ Le plus demandé
            </span>
          </div>
          <div className="commission-banner-card-body">
            <p className="commission-banner-card-title">
              Illustration personnalisée
            </p>
            <p className="commission-banner-card-price">À partir de 35 €</p>
          </div>
        </div>

        <div className="commission-banner-ctas">
          <a href="/commission" className="btn-primary">
            Commander une commission
          </a>
          <a href="/commission#tarifs" className="btn-outline">
            Voir les tarifs →
          </a>
        </div>
      </div>
    </section>
  );
}

export default Home;

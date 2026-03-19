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
      <div className="container" style={{ maxWidth: "1000px" }}>
        <h2>Une illustration sur mesure ?</h2>
        <p
          style={{ marginBottom: "32px", fontSize: "1rem", lineHeight: "1.6" }}
        >
          Portraits, illustrations botaniques, projets éditoriaux… Parlons de
          votre projet.
        </p>
        <a href="/commission" className="btn-primary">
          Commander une commission
        </a>
      </div>
    </section>
  );
}

export default Home;

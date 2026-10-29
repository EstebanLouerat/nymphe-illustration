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
    </main>
  );
}

export default Home;

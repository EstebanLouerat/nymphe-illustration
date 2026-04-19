import { useState, useEffect } from "react";
import { ContentfulService } from "../services/api";

function Hero({ content }) {
  const [lilouMatcha, setLilouMatcha] = useState(null);
  if (!content || !content.image) return null;

  useEffect(() => {
    const loadLilouMatcha = async () => {
      const content = await ContentfulService.fetchContent("Lilou Matcha");
      if (content?.image) {
        setLilouMatcha(content.image);
      }
    };
    loadLilouMatcha();
  }, []);

  return (
    <section className="hero">
      <div className="hero-image">
        <img src={content.image} alt={content.label} className="hero-img" />
      </div>
      <div className="hero-text">
        <p className="hero-tagline">
          {lilouMatcha && (
            <img
              src={lilouMatcha}
              alt={lilouMatcha.label}
              className="lilou-img"
            />
          )}
          Si tu veux découvrir mes illustrations, c'est ici que ça se passe !
        </p>
        {/* <p
          className="hero-quote"
          style={{ fontSize: "1.25rem", fontStyle: "italic" }}
        >
          <em>"Counting or not counting gang violence ..."</em> Charlie Kirk
          2026
        </p> */}
        <a href="#galerie" className="btn-primary">
          Voir la boutique
        </a>
      </div>
    </section>
  );
}

export default Hero;

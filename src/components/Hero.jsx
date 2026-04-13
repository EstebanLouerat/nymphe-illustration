import { useState, useEffect } from "react";

function Hero({ content }) {
  if (!content || !content.image) return null;

  return (
    <section className="hero">
      <div className="hero-image">
        <img src={content.image} alt={content.label} className="hero-img" />
      </div>
      <div className="hero-text">
        <p className="hero-tagline">
          <img
            src="img\Lilou et la tasse.png"
            alt={content.label}
            className="lilou-img"
          />
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

import { useState, useEffect } from "react";

function Hero({ content }) {
  if (!content || !content.image) return null;

  return (
    <section className="hero">
      <div className="hero-image">
        <img src={content.image} alt={content.label} className="hero-img" />
      </div>
      <div className="hero-text">
        <p
          className="hero-tagline"
          style={{ fontSize: "1.5rem", marginBottom: "16px" }}
        >
          Je vais y réfléchir
        </p>
        <p
          className="hero-quote"
          style={{ fontSize: "1.25rem", fontStyle: "italic" }}
        >
          <em>"caca"</em> Lilou 2026
        </p>
        <a href="#galerie" className="btn-primary">
          Voir la boutique
        </a>
      </div>
    </section>
  );
}

export default Hero;

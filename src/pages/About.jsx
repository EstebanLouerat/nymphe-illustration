import { Link } from "react-router-dom";

function About() {
  return (
    <main>
      {/* PAGE HERO */}
      <div className="page-hero">
        <h1>À propos</h1>
        <p>L'univers derrière les illustrations</p>
      </div>
      <hr className="divider" />

      {/* ABOUT CONTENT */}
      <div className="about-grid">
        {/* Photo de profil */}
        <aside className="about-photo">
          <img
            src="https://placehold.co/680x900/d4dcbf/6a7e52?text=Photo+portrait"
            alt="Portrait de l'artiste"
          />
        </aside>

        {/* Texte */}
        <div className="about-body">
          <h2>Bonjour, je suis Lilou Mauron</h2>

          <p>
            Je suis illustratrice indépendante basée en France, passionnée par
            la nature, les petites créatures et les instants suspendus. Mon
            travail oscille entre la tendresse du dessin botanique et la poésie
            du monde animal.
          </p>

          <p>
            Formée aux Beaux-Arts de [Ville], j'ai développé un style à
            l'aquarelle qui mêle délicatesse des lavis et précision du trait —
            une esthétique douce, terreuse, ancrée dans le vivant.
          </p>

          <p>
            Sous le nom <strong>Nymphe Illustration</strong>, je crée des
            prints, des stickers et des commissions sur mesure pour des
            particuliers et des éditeurs. Chaque illustration est pensée comme
            une petite fenêtre ouverte sur un monde parallèle, à la fois
            familier et féerique.
          </p>

          <p>
            Quand je ne dessine pas, je jardine, je collectionne les livres de
            botanique anciens et je passe trop de temps à observer les insectes
            dans le jardin.
          </p>

          {/* Tags / disciplines */}
          <div className="about-tags">
            <span className="tag">Aquarelle</span>
            <span className="tag">Botanique</span>
            <span className="tag">Illustration éditoriale</span>
            <span className="tag">Stickers</span>
            <span className="tag">Portraits</span>
            <span className="tag">Entomologie</span>
            <span className="tag">Nature</span>
          </div>

          {/* CTA */}
          <div
            style={{
              marginTop: "36px",
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <Link to="/commission" className="btn-primary">
              Commander une illustration
            </Link>
            <Link to="/contact" className="btn-outline">
              Me contacter
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default About;

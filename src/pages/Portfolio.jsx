// ============================================================
//  pages/Portfolio.jsx
//  Pages du PDF exportées en WebP dans public/media/portfolio/
//  (1000 px et 2000 px de large) + PDF complet en téléchargement.
// ============================================================

const PDF_URL = "/media/portfolio/portfolio-lilou-mauron.pdf";

// Texte alternatif de chaque page, dans l'ordre du PDF
const PAGES = [
  "Couverture : portfolio d'illustrations de Lilou Mauron, 2024-2026",
  "Sommaire : illustrations, peintures, planches de BD, croquis, contacts",
  "Illustrations : Cat Lady Sunday, à l'aquarelle et aux crayons de couleur",
  "Petite fée des bois, Grenouilles et compagnie et Petite biche endormie, à l'aquarelle et aux crayons de couleur",
  "Peintures : planche anatomique du cerf rouge d'Europe",
  "La lucane cerf-volant dans son environnement, peinture à la gouache",
  "Laurier de Madère à la gouache et pivoine blanche à l'aquarelle",
  "Scarabée rhinocéros et scarabée atlas, peintures à la gouache",
  "Actias luna, peinture à la gouache",
  "Planche de bande dessinée, du scénario à la réalisation finale",
  "Croquis d'observation à l'aquarelle et aux crayons de couleur",
  "Croquis de modèles vivants au crayon de papier, poses de 2, 3 et 5 minutes",
  "Contacts : nympheillustration@gmail.com, @nympheillustration sur Instagram, Lilou Mauron sur LinkedIn",
];

const pageSrc = (n, width) =>
  `/media/portfolio/page-${String(n).padStart(2, "0")}-${width}.webp`;

function Portfolio() {
  return (
    <main>
      <div className="page-hero">
        <h1>Portfolio</h1>
        <p>Illustrations, peintures, planches de BD et croquis · 2024-2026</p>
      </div>
      <hr className="divider" />

      <section className="portfolio">
        <div className="portfolio-actions">
          <a href={PDF_URL} download className="btn-primary">
            Télécharger le PDF
          </a>
        </div>

        <ol className="portfolio-pages">
          {PAGES.map((alt, i) => {
            const n = i + 1;
            return (
              <li key={n}>
                <a
                  href={pageSrc(n, 2000)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Agrandir la page ${n}`}
                >
                  <img
                    src={pageSrc(n, 1000)}
                    srcSet={`${pageSrc(n, 1000)} 1000w, ${pageSrc(n, 2000)} 2000w`}
                    sizes="(max-width: 1100px) 100vw, 1052px"
                    width="2000"
                    height="1125"
                    alt={alt}
                    loading={n <= 2 ? "eager" : "lazy"}
                    decoding="async"
                  />
                </a>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}

export default Portfolio;

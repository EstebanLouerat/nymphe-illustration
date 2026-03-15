# Nymphe Illustration — Site Portfolio & Boutique

Palette : vert sauge · lin chaud · tons terreux  
Fonts : Cormorant Garamond (display) + Jost (body)

## Structure du projet

```
nymphe/
├── index.html        → Page d'accueil (hero + galerie nouveautés + banner commission)
├── about.html        → Page À propos / Bio
├── contact.html      → Page Contact (formulaire Formspree)
├── commission.html   → Page Commandes sur mesure (formulaire détaillé + tarifs + processus)
├── styles.css        → Feuille de style globale (responsive, CSS variables)
└── README.md         → Ce fichier
```

## Mise en route

### 1. Remplacez les placeholders d'images

Cherchez dans chaque HTML les balises :
```html
<img src="https://placehold.co/..." />
```
Et remplacez-les par vos vraies illustrations.

### 2. Configurez Formspree (formulaires de contact)

1. Créez un compte gratuit sur [formspree.io](https://formspree.io)
2. Créez **deux formulaires** : un pour Contact, un pour Commission
3. Dans `contact.html`, remplacez `YOUR_FORM_ID` par votre ID
4. Dans `commission.html`, remplacez `YOUR_COMMISSION_FORM_ID` par votre second ID

```html
<!-- contact.html -->
<form action="https://formspree.io/f/xpwzABCD" method="POST">

<!-- commission.html -->
<form action="https://formspree.io/f/xyzXYZab" method="POST">
```

### 3. Personnalisez le contenu

- **`about.html`** : remplacez `[Votre Prénom]` et les textes de présentation
- **Liens réseaux sociaux** : cherchez `href="#"` sur les icônes Instagram/Pinterest
- **Email** : dans `contact.html`, remplacez `hello@nymphe-illustration.fr`
- **Tarifs** : dans `commission.html`, section Pricing — ajustez selon vos vrais prix

## Déploiement gratuit

### Option A — Netlify (recommandé, le plus simple)

1. Rendez-vous sur [netlify.com](https://netlify.com)
2. Créez un compte gratuit
3. Glissez-déposez le dossier `nymphe/` dans l'interface Netlify
4. Votre site est en ligne en moins d'une minute !
5. Configurez un domaine personnalisé dans Settings > Domain management

### Option B — Vercel

1. Installez la CLI : `npm i -g vercel`
2. Dans le dossier du projet : `vercel`
3. Suivez les instructions (projet HTML statique)

### Option C — GitHub Pages

1. Créez un repo GitHub (public ou privé avec plan free)
2. Poussez les fichiers à la racine ou dans `/docs`
3. Activez GitHub Pages dans Settings > Pages
4. Choisissez la branche `main` et le dossier `/(root)` ou `/docs`

## Évolutions possibles

- **Boutique en ligne** : intégration Stripe via [Lemon Squeezy](https://lemonsqueezy.com) ou [Gumroad](https://gumroad.com) (gratuit)
- **CMS headless** : [Contentful](https://contentful.com) ou [Sanity.io](https://sanity.io) pour gérer les illustrations sans toucher au code
- **Conversion React/Next.js** : le site est conçu pour être facilement porté vers Next.js avec Tailwind CSS si vous souhaitez ajouter une logique dynamique

## Notes techniques

- **Aucune dépendance npm** — tout fonctionne en fichiers statiques
- **Lucide Icons** chargé via CDN — pas d'installation nécessaire
- **Google Fonts** chargé via CDN — nécessite une connexion Internet
- Entièrement **responsive** (mobile, tablette, desktop)
- Compatible avec tous les navigateurs modernes

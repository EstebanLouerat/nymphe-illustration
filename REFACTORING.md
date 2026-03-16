# 🎨 Refactoring Nymphe Illustration — Structure Modulaire

## Vue d'ensemble

Le projet a été entièrement refactorisé en une **architecture modulaire** pour une meilleure maintenabilité, scalabilité et organisation.

---

## 📁 Nouvelle Structure

```
website/
├── index.html
├── product.html
├── about.html
├── contact.html
├── commission.html
├── README.md
├── .env.local (⚠️ à ignorer: contient les clés API)
├── .gitignore
│
├── css/ — Stylesheets modulaires
│   ├── styles.css (point d'entrée, importe tous les autres)
│   ├── variables.css (couleurs, typos, dimensions)
│   ├── reset.css
│   ├── animations.css
│   └── components/
│       ├── nav.css
│       ├── cart.css
│       ├── buttons.css
│       ├── cards.css
│       ├── forms.css
│       ├── pages.css
│       ├── product.css
│       └── commission.css
│
├── js/ — JavaScript modulaire
│   ├── config.js (variables de configuration)
│   ├── main.js (point d'entrée pour index.html)
│   ├── product-page.js
│   ├── contact-page.js
│   ├── about-page.js
│   ├── commission-page.js
│   └── modules/
│       ├── cart.js (logique panier)
│       ├── contentful.js (API Contentful)
│       └── ui.js (fonctions UI générales)
│
└── img/ — Assets (dossier pour futures images)
```

---

## 🚀 Améliorations Apportées

### 1. **CSS Modulaire**

- ✅ Séparation des responsabilités
- ✅ Variables CSS centralisées
- ✅ Composants indépendants et réutilisables
- ✅ Plus facile à maintenir et à scaler

### 2. **JavaScript Modulaire**

- ✅ Modules séparés par domaine (cart, contentful, ui)
- ✅ Point d'entrée unique (main.js)
- ✅ Pages spécifiques avec leurs propres scripts
- ✅ Évite les conflits globaux

### 3. **Sécurité**

- ✅ Variables sensibles dans `.env.local` (non pushées)
- ✅ `.gitignore` configuré correctement
- ✅ Anciens fichiers à la racine menacent d'être ignorés

### 4. **Performance**

- ✅ CSS importé via `@import` (combine les fichiers)
- ✅ Lazy loading des modules JS par page
- ✅ Structure optimisée pour le cache navigateur

---

## 🔧 Configuration Contentful

### ✅ Solution Simple: `js/.env.js`

**Étape 1:** Remplissez `js/.env.js` avec vos credentials Contentful:

```javascript
window.ENV = {
  CONTENTFUL_SPACE_ID: "votre_space_id_ici",
  CONTENTFUL_ACCESS_TOKEN: "votre_access_token_ici",
};
```

**Étape 2:** Le fichier est chargé automatiquement **en premier** dans toutes les pages:

```html
<script src="js/.env.js"></script>
<!-- Charge EN PREMIER -->
<script src="js/config.js"></script>
<!-- Puis récupère les variables -->
```

**Étape 3:** `config.js` lit automatiquement les variables:

```javascript
const CONTENTFUL_SPACE_ID = window.ENV.CONTENTFUL_SPACE_ID;
const CONTENTFUL_ACCESS_TOKEN = window.ENV.CONTENTFUL_ACCESS_TOKEN;
```

✅ **Avantages:**

- Simple à configurer (pas de build tool nécessaire)
- `js/.env.js` est ignoré par Git (`.gitignore`)
- Chaque développeur peut avoir ses propres credentials
- Fonctionne en développement et production

⚠️ **Important:** Ne committez JAMAIS `js/.env.js`!

---

## 📚 Guide des Fichiers

### CSS

| Fichier            | Responsabilité                      |
| ------------------ | ----------------------------------- |
| `variables.css`    | Couleurs, polices, dimensions CSS   |
| `reset.css`        | Styles de base, éléments génériques |
| `animations.css`   | Keyframes et transitions            |
| `components/*.css` | Styles par composant visuel         |
| `styles.css`       | Import central de tous les fichiers |

### JS

| Fichier                 | Responsabilité                          |
| ----------------------- | --------------------------------------- |
| `config.js`             | Variables de configuration              |
| `modules/cart.js`       | Logique du panier                       |
| `modules/contentful.js` | Appels API Contentful                   |
| `modules/ui.js`         | Fonctions UI (toggle menu, toast, etc.) |
| `main.js`               | Point d'entrée pour la page d'accueil   |
| `*-page.js`             | Logique spécifique à chaque page        |

---

## 🔌 Utilisation dans les Pages HTML

### Page d'accueil (index.html)

```html
<!-- Configuration -->
<script src="js/config.js"></script>
<!-- Modules -->
<script src="js/modules/cart.js"></script>
<script src="js/modules/contentful.js"></script>
<script src="js/modules/ui.js"></script>
<!-- Point d'entrée -->
<script src="js/main.js"></script>
```

### Pages spécifiques (product.html, contact.html, etc.)

```html
<!-- Configuration -->
<script src="js/config.js"></script>
<!-- Module UI (minimal) -->
<script src="js/modules/ui.js"></script>
<!-- Page-specific logic -->
<script src="js/product-page.js"></script>
```

---

## ♻️ Migration des Anciens Fichiers

Si vous aviez des styles ou scripts à la racine, voici où les placer:

| Ancien       | Nouveau                                   | Raison              |
| ------------ | ----------------------------------------- | ------------------- |
| `styles.css` | `css/styles.css` + `css/components/*.css` | Modulaire           |
| `cart.js`    | `js/modules/cart.js`                      | Organisé en modules |
| `config.js`  | `js/config.js`                            | Chemin centralisé   |

---

## 🛡️ Variables d'Environnement

### `.env.local` (⚠️ N'JAMAIS committer!)

```bash
CONTENTFUL_SPACE_ID=xxx
CONTENTFUL_ACCESS_TOKEN=yyy
```

Ce fichier est ignoré par Git (voir `.gitignore`).

---

## 📦 Extensions Futures

### Ajouter un nouveau composant

1. Créez `css/components/mynewcomponent.css`
2. Importez-le dans `css/styles.css`:

```css
@import url("components/mynewcomponent.css");
```

### Ajouter une nouvelle page

1. Créez `js/mypage-page.js`
2. Liez-la dans la nouvelle page HTML:

```html
<script src="js/config.js"></script>
<script src="js/modules/ui.js"></script>
<script src="js/mypage-page.js"></script>
```

---

## ✅ Checklist de Maintenance

- [ ] `.env.local` rempli avec les credentials
- [ ] `.gitignore` contient `.env.local`, anciens fichiers
- [ ] Tous les styles pointent vers `css/styles.css`
- [ ] Tous les imports JS pointent vers les bons chemins
- [ ] Pas de CSS inline dans le HTML (à part pour exceptions)
- [ ] Pas de JavaScript inline (à part les initialisations critiques)

---

## 💡 Conseils d'Optimisation

### CSS

- Regroupez les styles de composants similaires
- Utilisez les variables CSS pour les valeurs répétées
- Préférez les classes aux IDs

### JavaScript

- Chaque module = une responsabilité claire
- Exposez seulement les fonctions publiques
- Utilisez des noms de variables explicites

### Sécurité

- Ne commitez JAMAIS `.env.local`
- Versionnez un `.env.example` avec des valeurs fictives
- Utilisez des variables d'environnement en production

---

**Version**: 1.0  
**Date**: Mars 2026  
**Mainteneur**: Nymphe Illustration Team

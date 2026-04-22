# Nymphe Illustration WebSite

Stack : React + Vite · Netlify Functions · Contentful CMS · Supabase · Stripe

---

## Stack technique

| Couche      | Outil                                                             |
| ----------- | ----------------------------------------------------------------- |
| Frontend    | React 19, Vite 6, React Router 7                                  |
| Hébergement | Netlify (CI/CD via GitHub)                                        |
| Backend     | Netlify Functions (`checkout`, `webhook`, `orders`, `popularity`) |
| CMS         | Contentful (images, bio, produits)                                |
| Auth & BDD  | Supabase (commandes, favoris, panier)                             |
| Paiement    | Stripe Checkout                                                   |
| Formulaires | Formspree                                                         |

---

## Variables d'environnement

Créer un fichier `.env.local` à la racine :

```env
VITE_CONTENTFUL_SPACE_ID=xxx
VITE_CONTENTFUL_ACCESS_TOKEN=xxx

VITE_SUPABASE_URL=xxx
VITE_SUPABASE_PUBLISHABLE_KEY=xxx

VITE_FORMSPREE_CONTACT_ID=xxx
VITE_FORMSPREE_COMMISSION_ID=xxx

STRIPE_SECRET_KEY=xxx
STRIPE_WEBHOOK_SECRET=xxx
```

> ⚠️ Le préfixe `VITE_` est obligatoire pour les variables exposées au client.  
> Les variables Stripe (sans préfixe) sont réservées aux Netlify Functions.  
> Ne jamais committer `.env.local`.

---

## Développement local

Vite et les Netlify Functions tournent en deux processus séparés :

```bash
# Terminal 1 - frontend
npm run dev

# Terminal 2 - fonctions serverless
npx netlify functions:serve --port 9999
```

Le proxy Vite redirige automatiquement `/api/*` → `http://localhost:9999/.netlify/functions/*`.

---

## Déploiement

Le projet est lié à Netlify via GitHub. Chaque push sur `main` déclenche un build automatique.

```bash
npm run build   # build local (outDir: dist)
```

Les variables d'environnement de production sont à configurer dans **Netlify > Site settings > Environment variables** (un redéploiement est nécessaire après modification).

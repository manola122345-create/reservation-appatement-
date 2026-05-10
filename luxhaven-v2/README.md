# 🏠 LuxHaven — Guide de déploiement complet

## Stack : React 19 + TypeScript + Vite + Tailwind + Supabase + Stripe + Vercel

---

## ÉTAPE 1 — Supabase (base de données)

1. Crée un compte sur https://supabase.com → New Project
2. SQL Editor → New query → colle tout le contenu de `supabase/migrations/001_init.sql` → Run
3. Authentication → Users → Add user → **ton email + mot de passe fort** (c'est ton accès admin)
4. Project Settings → API → copie `Project URL` et `anon public`

---

## ÉTAPE 2 — Variables d'environnement

Copie `.env.example` en `.env.local` et remplis :
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
```

---

## ÉTAPE 3 — GitHub

```bash
git init
git add .
git commit -m "LuxHaven v1.0"
git remote add origin https://github.com/TON_USERNAME/luxhaven.git
git push -u origin main
```

---

## ÉTAPE 4 — Vercel

1. vercel.com → New Project → importe le repo
2. Ajoute les 2 variables d'environnement (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY)
3. Deploy 🚀
Le fichier `vercel.json` gère les routes React automatiquement.

---

## ÉTAPE 5 — Stripe (paiements réels)

1. Crée un compte stripe.com → récupère `sk_live_...`
2. Installe la CLI Supabase : `npm install -g supabase`
3. ```bash
   supabase login
   supabase link --project-ref TON_PROJECT_REF
   supabase secrets set STRIPE_SECRET_KEY=sk_live_...
   supabase functions deploy create-checkout-session
   ```

---

## ÉTAPE 6 — Accès admin

URL : `https://ton-site.vercel.app/admin/login`
→ Connecte-toi avec l'email/mdp créé à l'étape 1

**Depuis l'admin :**
- Ajouter / modifier / supprimer des annonces
- Uploader des photos
- Activer / désactiver une annonce
- Voir et gérer toutes les réservations
- Voir tous les paiements + export CSV

---

## Structure

```
src/
  contexts/AuthContext.tsx    ← session admin sécurisée
  components/
    Navbar.tsx / Footer.tsx / ProtectedRoute.tsx
  pages/
    HomePage.tsx              ← /
    ListingsPage.tsx          ← /listings
    ListingDetailPage.tsx     ← /listings/:id
    BookingPage.tsx           ← /booking/:id
    ConfirmationPage.tsx      ← /confirmation
    AdminLogin.tsx            ← /admin/login (toi seul)
    AdminDashboard.tsx        ← /admin (protégé)
  lib/supabase.ts
  types/index.ts
supabase/
  migrations/001_init.sql     ← SQL à coller dans Supabase
  functions/create-checkout-session/index.ts  ← Stripe
vercel.json                   ← routing React
.env.example                  ← modèle variables
```

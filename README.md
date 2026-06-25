# Vestix — mobile

App mobile native du tracker de patrimoine **Finexa** (web). Marque mobile = **Vestix**.
Même backend, même DA « Émeraude » que le web.

## Stack

- **Expo SDK 54**, React Native 0.81, React 19.1, **TypeScript strict**
- **expo-router** (file-based, dossier `app/`)
- **TanStack Query** v5 (cache + streaming)
- **Reanimated 4** + react-native-worklets
- **react-native-svg**, **expo-linear-gradient**, **expo-secure-store**, **expo-document-picker**
- Polices : Outfit (display) · Hanken Grotesk (UI) · JetBrains Mono (mono) via `@expo-google-fonts/*`

## Démarrer

```bash
npm install                          # legacy-peer-deps activé via .npmrc
npx expo install --check             # vérifier l'alignement SDK 54
npm start                            # bundler Expo
npm run android                      # émulateur / device USB
npm run ios                          # macOS requis
```

Vérifications :

```bash
npx tsc --noEmit                     # typecheck strict
npx expo export --platform android   # valide le bundle sans device
```

## Variables d'env

`.env` à la racine si tu utilises un backend autre que la prod Vercel :

```
EXPO_PUBLIC_API_URL=https://ton-backend.vercel.app
```

## Architecture

```
app/                  écrans expo-router (file-based)
  (tabs)/             onglets bas (index, folio, transactions, budget, more)
  assistant.tsx       chat IA en feuille modale
  product/[id].tsx    page d'un actif
  settings.tsx        réglages (refonte DA)
  …
components/
  ui/                 librairie maison (AppShell, FxCard, FxButton, FxKpi, Donut, Sheet, Tabs, TypingDots, AnimatedNumber…)
  forms/              formulaires (AddAsset wizard, AddTransaction, AddBudgetItem)
    asset/            sous-composants du wizard (TypeGrid, SearchPicker, LotEditor, CsvImport, PresetChips)
  MoreSheet.tsx       feuille « Plus » (hero profil + sections groupées)
lib/
  api.ts              client Finexa API + sendChatStream (XHR streaming)
  auth.ts / auth-context.tsx
  queries.ts          React Query (stats, assets, prices, search, budget, …)
  types.ts            shapes API
  format.ts           eur(), dateFr(), CAT, TYPE_EMOJI
theme/
  tokens.ts           SOURCE DE VÉRITÉ DA — couleurs (oklch web → hex), polices, ombres, dégradés
```

## Backend

Même API que **Finexa web** (`/Financy-Web`), hébergée sur Vercel. Auth Bearer JWT.

- `POST /api/auth/mobile` → login, JWT 30 j (gère la 2FA email)
- `/api/assets`, `/api/transactions`, `/api/budget/items`, `/api/goals`, …
- `/api/search?q=&type=` — recherche titre / crypto / ISIN
- `/api/prices?symbols=` — cours temps réel
- `/api/assistant` — chat streamé (Groq Llama 3.3 70B, finance-only)

Variable d'env requise côté Vercel : `GROQ_API_KEY` (gratuit sans CB sur [console.groq.com](https://console.groq.com)).

## DA Émeraude

`theme/tokens.ts` est la **source de vérité** pour la DA. Ne pas inventer de couleur hors de ce fichier.

Contraintes UI (apprises à coups d'incidents) :

- **Pas de blur** (`backdrop-filter`) sur éléments répétés — fonds OPAQUES (cf. perf glassmorphism)
- Pas d'animation en boucle derrière une zone floutée — blobs de fond statiques
- Texte blanc sur fond accent émeraude, jamais de texte sombre dessus
- Reanimated 4 → plugin `react-native-worklets/plugin` en **dernier** dans `babel.config.js`

## Patterns récurrents

- **Sheets** (feuilles modales du bas) : `components/ui/Sheet.tsx` — auto-height par défaut, `fullHeight` pour les chats, `bodyScroll: false` pour gérer ses propres scroll + footer
- **Stagger animations** : `entering={FadeInUp.duration(N).delay(i * 30)}` sur les rows de liste
- **Press feedback** : `pressed && { opacity: 0.96, transform: [{ scale: 0.985 }] }`
- **Compteurs animés** : `<FxKpi valueNum={n} format={eur} />`
- **Swipe-to-delete** : `Swipeable` de `react-native-gesture-handler` avec `dragX.interpolate` pour faire « suivre » le bouton depuis la droite

## Liens

- Backend : voir [Financy-Web](../Financy-Web)
- Cahier des charges DA : voir `PROMPT.md`
- Instructions Claude Code : voir `CLAUDE.md`

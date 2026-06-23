# Vestix — app mobile (Expo)

App mobile native du tracker de patrimoine **Finexa** (web). Marque mobile = **Vestix**.
Même backend, même DA « Émeraude » que le web.

## Stack
- Expo SDK 56, React Native 0.85, React 19, TypeScript strict.
- expo-router (file-based, dossier `app/`), TanStack Query, react-native-svg,
  expo-linear-gradient, expo-secure-store, reanimated 4 (+ react-native-worklets).
- Polices : Outfit (display) · Hanken Grotesk (UI) · JetBrains Mono (mono) via
  `@expo-google-fonts/*`, chargées dans `app/_layout.tsx`.

## Architecture
- `theme/tokens.ts` — **source de vérité DA** : couleurs (oklch du web converties en hex),
  radius, ombres vertes, polices, dégradés. Ne pas inventer de couleur hors de ce fichier.
- `components/ui/` — librairie : `AppShell` (fond dégradé), `FxCard`, `FxButton`, `FxKpi`,
  `FxBadge`, `FxChip`, `FxPill`, `Donut`, `BottomNav`. Calqués sur les classes `.fx-*` du web.
- `lib/api.ts` — client de l'API Finexa (même backend Vercel). Auth Bearer JWT.
- `lib/auth.ts` — stockage du JWT en expo-secure-store.
- `app/` — écrans (expo-router). `index.tsx` = dashboard de démo (DA témoin).

## Backend = API Finexa existante (NE PAS refaire)
- Login : `POST /api/auth/mobile` → JWT 30 j (gère la 2FA email).
- Toutes les routes acceptent `Authorization: Bearer <jwt>` (helper `getUser` côté serveur).
- Base URL via `EXPO_PUBLIC_API_URL` (défaut = déploiement Vercel).

## Contraintes
- **Perf** : pas de blur (`backdrop-filter`) sur éléments répétés — fonds OPAQUES (leçon web).
  Pas d'animation en boucle derrière une zone floutée. Blobs de fond = statiques.
- **Lisibilité** : texte blanc sur fond accent émeraude, jamais de texte sombre dessus.
- **npm** : `legacy-peer-deps=true` (`.npmrc`) — React 19 vs peers d'expo-router. Utiliser
  `npx expo install <pkg>` pour les modules natifs (versions alignées SDK 56).
- reanimated 4 → plugin `react-native-worklets/plugin` en dernier dans `babel.config.js`.

## Commandes
- `npm start` / `npm run android` / `npm run ios` — dev.
- `npx tsc --noEmit` — typecheck.
- `npx expo export --platform android` — valide le bundle sans device.

Voir `PROMPT.md` pour le cahier des charges complet de la DA.

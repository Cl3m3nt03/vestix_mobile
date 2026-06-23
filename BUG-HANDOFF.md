# Brief debug — Vestix mobile (Expo)

> À lire par un assistant qui va débugger avec une **capture d'écran** du problème.
> Projet = app mobile **Vestix** (Expo SDK 54) du tracker de patrimoine Finexa.

## Le problème signalé (montré sur l'image)

1. **Écran noir sur la page Budget** (`app/(tabs)/budget.tsx`).
2. **La barre de navigation basse « saute » / est bizarre** (glitch visuel, position instable).

L'utilisateur teste sur **téléphone physique via Expo Go** (Android probable).

## Ce qui a déjà été tenté (dernier commit `438fe07`)

- Retiré `animation: 'shift'` des `<Tabs>` (`app/(tabs)/_layout.tsx`) — suspect n°1 pour les
  frames noires + saut de navbar sur Android.
- Ajouté un **ErrorBoundary** racine (`components/ErrorBoundary.tsx`, branché dans
  `app/_layout.tsx`) : si un écran throw, un fallback rouge s'affiche avec le message au lieu
  d'un écran noir. **➜ Demander à l'utilisateur si Budget montre ce fallback + quel message.**
- Juste avant : ajout d'un `<Donut>` de répartition dans Budget (commit `222c547`) — **c'est le
  changement le plus récent sur Budget, donc suspect n°1 du crash**.

## Pistes à creuser en priorité

1. **Le Donut dans Budget** (`app/(tabs)/budget.tsx` lignes ~59-64, composant
   `components/ui/Donut.tsx`). Le Donut marche sur le dashboard (`app/(tabs)/index.tsx`) et
   le portefeuille (`app/(tabs)/folio.tsx`) avec les mêmes props. Vérifier si les `slices`
   budget produisent une valeur qui casse le SVG (`react-native-svg`) : NaN dans
   `strokeDasharray`/`strokeDashoffset`, total nul, une seule slice à 100 %.
2. **Hot-reload corrompu** : un crash précédent (Pokémon, corrigé en `222c547`) peut laisser
   Metro/Expo Go dans un état pourri → écran noir résiduel. Vérifier d'abord avec un
   **`npx expo start -c`** (reload cache vidé) avant de conclure à un bug de code.
3. **Navbar** : barre custom = `components/ui/BottomNav.tsx`, rendue comme `tabBar` custom
   dans `app/(tabs)/_layout.tsx`. Elle utilise `useSafeAreaInsets()` + une ombre
   `shadow.lg` avec offset négatif. Le « saut » peut venir de l'insets safe-area recalculé,
   de l'ombre, ou de la transition d'onglet. Tester sans l'ombre / avec une hauteur fixe.

## Architecture (pour situer)

- **Routing** : expo-router. Onglets dans `app/(tabs)/` (index, folio, transactions, budget,
  more) avec barre basse partagée. Écrans secondaires à la racine `app/` (goals, performance,
  fiscal, bank, assistant, settings, alerts, pokemon, simulator, explorer, product/[id]) —
  ceux-là **n'ont pas** la navbar (full-screen + bouton retour), c'est voulu.
- **Données** : TanStack Query → API Finexa (`EXPO_PUBLIC_API_URL`, backend Next.js déjà
  déployé). Hooks dans `lib/queries.ts`, client dans `lib/api.ts`, auth JWT Bearer dans
  `lib/auth.ts` + `lib/auth-context.tsx`.
- **Design system** : `theme/tokens.ts` (couleurs émeraude, polices Outfit/Hanken/JetBrains,
  ombres). Composants UI dans `components/ui/`. Calqué sur le web (cf. `CLAUDE.md` + `PROMPT.md`).

## Contraintes projet

- **Pas de blur** sur éléments répétés (perf — fonds opaques).
- TypeScript strict. `npx tsc --noEmit` doit rester à 0 erreur.
- `npx expo export --platform android` valide le bundle sans device.
- Commits sans `Co-Authored-By`.

## Reproduire / valider

```bash
npm install --legacy-peer-deps   # si besoin (React 19 vs peers)
npx expo start -c                # reload cache vidé, puis scan QR dans Expo Go
npx tsc --noEmit                 # typecheck
```

## Question clé à poser à l'utilisateur

> Sur Budget, vois-tu un **écran noir** total, ou le **fallback rouge** « Oups, cet écran a
> planté » avec un message ? Si message → le copier, il pointe la vraie cause.

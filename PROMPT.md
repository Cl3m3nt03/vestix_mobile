# Prompt — Application mobile Finexa (Expo) calquée sur la DA web

> À copier-coller comme premier message dans un **nouveau projet / nouveau repo GitHub**.
> Objectif : créer l'app mobile native **Finexa** avec Expo, en gardant **exactement** la
> direction artistique « Finexa Émeraude » du site web existant.

---

## 0. Contexte

Tu démarres un **nouveau repo GitHub vierge** pour l'app **mobile** de **Finexa** — un
tracker de patrimoine personnel (comptes bancaires, portefeuille bourse/PEA/CTO, crypto,
immo, épargne, objectifs, budget). Le **site web existe déjà** (Next.js 14, déployé sur
Vercel) et expose une **API + un backend** (NextAuth, Prisma + Supabase, Enable Banking,
Yahoo Finance / CoinGecko, assistant Gemini).

**L'app mobile ne refait PAS le backend.** Elle consomme l'API du site web existant **à
l'identique** — le backend est **déjà prêt pour le mobile** (auth Bearer JWT + 49 routes
déjà compatibles, voir section 1bis). Tu construis uniquement le **client mobile natif** et
tu reproduis la **direction artistique** du web à l'identique. Si une route API te manque, tu
la listes — tu ne la réinventes pas.

---

## 1bis. Auth & API — DÉJÀ prêtes côté backend (ne rien refaire)

Le backend web expose déjà tout ce qu'il faut pour le mobile. **Réutilise les MÊMES routes.**

**Login mobile :**
- `POST /api/auth/mobile` avec `{ email, password, totpCode? }`.
  - Si 2FA activée et pas de `totpCode` → réponse `{ requires2FA: true }` (un code OTP est
    envoyé par email) → re-poster avec `totpCode`.
  - Succès → `{ token, user: { id, email, name } }`. Le **token est un JWT valable 30 jours**
    (`audience: finexa-mobile`).
- **Stocke ce JWT en `expo-secure-store`.**

**Toutes les requêtes authentifiées :**
- Ajoute le header `Authorization: Bearer <jwt>` sur **chaque** appel API.
- Côté backend, le helper unifié `getUser(req)` (`lib/mobile-auth.ts`) accepte ce Bearer JWT
  exactement comme une session web. **49 routes l'utilisent déjà** → directement consommables :
  `users/me`, `assets`, `assets/[id]` (+ snapshots, import-holdings, upload/extract-pdf),
  `transactions` (+ import, [id]), `goals` (+ [id]), `budget/items` + `budget/income`,
  `expenses`, `bank/*` (institutions, connect, sync, transactions), `portfolio/stats`,
  `performance/*` (holdings, realized, compare), `rebalance`, `fiscal`, `alerts` (+ [id]),
  `assistant` + `assistant/consent`, `global-search`, `holofolio/*` (module Pokémon),
  `2fa/*` (setup, verify, disable), `users/export`, `users/delete-account`, etc.

**Register / mot de passe oublié :** routes existantes aussi (`/api/auth/register` +
`/api/auth/register/verify-2fa`, `/api/auth/forgot-password`, `/api/auth/reset-password`).

**Conséquence : ZÉRO modification backend.** Le mobile est un pur client de l'API existante.
Base URL = `EXPO_PUBLIC_API_URL` (URL du déploiement Vercel).

---

## 1. Stack mobile imposée

- **Expo (SDK le plus récent stable)** + **React Native** + **TypeScript strict**.
- **expo-router** (file-based routing, comme l'App Router web).
- **TanStack Query** (déjà utilisé côté web — garder la même logique de cache/fetch).
- **expo-font** pour charger les 3 polices de la DA.
- **react-native-svg** pour les donuts / graphes / icônes.
- **react-native-reanimated** pour les transitions (sheets, FAB, micro-interactions).
- Auth : reproduire le flux **credentials + OTP email 2FA** via l'API existante, token
  stocké en **expo-secure-store**.
- Graphes : **victory-native** ou **react-native-svg** custom (pas de Recharts, c'est web).
- Cible : **iOS + Android**, build via **EAS**.

Pas de Tailwind RN par défaut : la DA web utilise des **variables CSS + classes `.fx-*`**.
En natif, recrée ces tokens dans un **fichier de thème TS unique** (`theme/tokens.ts`) et un
jeu de **composants UI** (`<FxCard>`, `<FxButton>`, `<FxKpi>`, `<FxBadge>`, `<FxChip>`,
`<FxRail>`/`<BottomNav>`, etc.) qui matchent visuellement le web. (Si tu préfères NativeWind,
tu peux, mais les tokens ci-dessous restent la source de vérité.)

---

## 2. Direction artistique « Finexa Émeraude » — SOURCE DE VÉRITÉ

Reproduis ces tokens **exactement**. Couleurs en **oklch** (gardées telles quelles, RN les
supporte via conversion ; sinon convertis en hex équivalent mais **ne change pas la teinte**).

### Palette
```
--ink        oklch(0.31 0.035 200)   /* texte principal (vert-ardoise foncé) */
--ink-soft   oklch(0.46 0.028 200)   /* texte secondaire */
--ink-faint  oklch(0.60 0.020 200)   /* texte tertiaire / labels */

/* Accent émeraude */
--acc        oklch(0.52 0.14 160)
--acc-2      oklch(0.45 0.14 162)
--acc-3      oklch(0.39 0.12 164)
--acc-br     oklch(0.58 0.14 158)    /* émeraude clair, haut des dégradés */
--acc-wash   oklch(0.94 0.05 160)
--acc-tint   oklch(0.96 0.03 162)    /* fond d'icône / état actif discret */

--pop        oklch(0.72 0.15 62)     /* ambre / premium */
--up         oklch(0.55 0.14 160)    /* hausse / positif */
--down       oklch(0.60 0.16 25)     /* baisse / négatif / danger */
--info       oklch(0.62 0.11 235)
--violet     oklch(0.55 0.13 285)
```

### Surfaces (thème CLAIR — l'app n'est PAS dark)
```
--card         rgba(255,255,255,0.80)   /* fond des cartes — OPAQUE volontairement */
--glass        rgba(255,255,255,0.58)
--glass-2      rgba(255,255,255,0.72)
--glass-strong rgba(255,255,255,0.82)
--glass-hi     rgba(255,255,255,0.90)   /* bordures claires */
--hair         rgba(30,55,45,0.10)      /* séparateurs */
--hair-2       rgba(30,55,45,0.06)
```

### Fond d'écran global (dégradé doux émeraude + bleu)
Reproduire en `LinearGradient` (expo-linear-gradient) + éventuels « blobs » flous très
légers et **statiques** :
```
radial 12% -6%  : oklch(0.955 0.03 165)   (émeraude pâle)
radial 100% 4%  : oklch(0.955 0.025 220)  (bleu pâle)
base            : oklch(0.945 0.008 90)   (crème)
```

### Rayons & ombres
```
--r-lg 26px   --r-md 18px   --r-sm 13px
shadow    : 0 30px 70px -28px rgba(20,60,45,0.38)
shadow-sm : 0 16px 36px -18px rgba(20,60,45,0.30)
shadow-xs : 0 4px 14px -8px  rgba(20,60,45,0.22)
```
(En RN, traduis ces ombres via `shadowColor/shadowOffset/shadowRadius/shadowOpacity` iOS +
`elevation` Android. Garde l'ombre **verte-sombre**, pas noire.)

### Typographie (3 polices Google — charger via expo-font)
```
Outfit          → titres / valeurs / display   (var --font-d, weight 300 & 600)
Hanken Grotesk  → corps / UI                    (var --font-u, défaut)
JetBrains Mono  → labels, tickers, chiffres mono (var --font-m, uppercase letter-spacing)
```
Conventions :
- Titres de carte : Outfit 600, ~18px, `letterSpacing: -0.01em`.
- Grandes valeurs (KPI, prix) : Outfit, **tabular-nums**, `letterSpacing: -0.02em`.
- Labels / éléments mono : JetBrains Mono ~10px, **UPPERCASE**, `letterSpacing: 0.1em`.

---

## 3. Composants UI à recréer (mapping web → natif)

Reproduis le look des classes `.fx-*` du web. Liste minimale :

| Web (`.fx-*`)            | Composant RN            | Notes visuelles |
|--------------------------|-------------------------|-----------------|
| `.fx-card` / `.glass`    | `<FxCard>`              | fond `--card` opaque, bordure `--glass-hi`, radius 26, `shadow-sm`. **PAS de blur.** |
| `.fx-kpi`                | `<FxKpi>`               | label mono + valeur Outfit (tabular-nums) + petite icône carrée `--acc-tint`/`--acc` |
| `.fx-btn`                | `<FxButton>`            | dégradé `linear(150deg, --acc-br → --acc-2)`, blanc, radius 24, ombre émeraude. Variantes `ghost` / `danger` / `sm` / `tiny`. |
| `.fx-badge`              | `<FxBadge>`             | mono uppercase ; variantes `live` (point pulsé `--up`), `premium` (`--pop`), `soft` |
| `.fx-chip`               | `<FxChip>`              | pill ; actif = dégradé émeraude blanc |
| `.fx-pill-up/down`       | `<FxPill dir>`          | hausse `--up` fond vert pâle / baisse `--down` fond rouge pâle, avec flèche |
| `.fx-rail` (desktop)     | **`<BottomNav>`**       | sur mobile le web bascule déjà en **barre du bas** : 4 items primaires + « Plus » ouvrant un bottom-sheet. C'est CE pattern qu'on garde en natif. |
| `.fx-sheet`              | `<BottomSheet>`         | sheet bas, grip, grille 3 colonnes d'actions, item actif dégradé émeraude |
| `.fx-confirm`            | `<ConfirmDialog>`       | dialog centré, icône ronde `--acc-tint` (ou `danger`), 2 boutons |
| `.fx-donut` + `.fx-legend` | `<Donut>` + `<Legend>` | donut SVG interactif, trou central avec valeur Outfit + label mono |
| `.fx-table`             | `<AssetRow>` list       | en natif → FlatList de lignes (logo carré `--acc-tint`, nom, valeur tabular-nums) |
| `.fx-tabs` / `.fx-periods` | `<Segmented>`        | sélecteur segmenté, actif fond blanc (tabs) ou `--ink` (periods) |
| `.fx-ai` (FAB)          | `<AssistantFab>`        | FAB bas-droite, dégradé émeraude, ouvre l'assistant Gemini |
| `.fx-skel`              | `<Skeleton>`            | shimmer `--acc-tint → --glass-2` |

**Navigation mobile** (reproduit le web ≤640px) : barre du bas fixe, radius haut 22px,
4 onglets primaires + bouton « Plus » → bottom-sheet listant le reste (comptes, réglages,
pages secondaires). État actif = **teinte émeraude discrète** (`--acc-tint` fond, `--acc`
texte), **pas** le gros pill dégradé du desktop.

---

## 4. Contrainte PERFORMANCE — à respecter dès le départ

Le web a connu **2 incidents de lag** liés au **glassmorphism** (`backdrop-filter: blur`
répété sur 8-15 cartes + orbes animées en fond). **Leçon appliquée, à NE PAS reproduire :**

- **Pas de blur en temps réel sur des éléments répétés** (cartes, KPIs, lignes de liste).
  Les `.fx-card` du web sont **opaques (`--card` à 0.80)** justement pour ça — fais pareil :
  **fond opaque/semi-opaque, zéro blur.**
- Blur autorisé **uniquement** sur des surfaces **rares et ponctuelles** : backdrop de
  bottom-sheet, dialog de confirmation. Et encore, léger.
- **Aucun élément animé en boucle derrière une zone floutée.** Les « blobs » du fond sont
  **statiques** (pas d'animation infinie).
- Privilégie `transform` (translate/scale) aux changements d'ombre pour les hovers/press
  (composited, pas de repaint).
- Respecte `prefers-reduced-motion` (RN : `AccessibilityInfo.isReduceMotionEnabled`).

---

## 5. Accessibilité (déjà standard côté web, à garder)

- Cibles tactiles ≥ 44px.
- Modaux/sheets : fermeture au backdrop + bouton, focus géré, scroll lock.
- Focus visible / état pressé clair (outline émeraude `--acc` sur le web).
- Contraste : **ne jamais** mettre de texte sombre sur fond accent — **texte blanc** sur
  émeraude (règle héritée du web).

---

## 6. Périmètre fonctionnel (pages à porter)

Reprends les pages du web (mêmes données via l'API) :
**Dashboard** (KPIs patrimoine + graphe d'évolution + donut répartition), **Portfolio /
Assets** (holdings, prix live, DCA), **Transactions**, **Banque** (sync Enable Banking),
**Budget**, **Objectifs (Goals)**, **Patrimoine / répartition**, **Assistant IA** (Gemini),
**Réglages**, **Auth** (login + register + OTP 2FA). *(Bonus existant : module Pokémon /
collection — porter seulement si le reste est fait.)*

---

## 7. Livrables de cette première étape

1. **Initialiser le projet Expo** (TypeScript, expo-router) + structurer le repo
   (`app/`, `components/ui/`, `theme/`, `lib/api/`, `hooks/`).
2. **`theme/tokens.ts`** : tous les tokens de la section 2 (couleurs, radius, ombres, fonts).
3. **Charger les 3 polices** (Outfit, Hanken Grotesk, JetBrains Mono) via expo-font + écran
   de splash tant qu'elles ne sont pas prêtes.
4. **Composants UI de base** : `<FxCard>`, `<FxButton>`, `<FxKpi>`, `<FxBadge>`, `<FxChip>`,
   `<FxPill>`, `<BottomNav>`, `<BottomSheet>` — avec le fond dégradé global en `AppShell`.
5. **Un écran Dashboard de démo** qui assemble ces composants pour **prouver visuellement
   que la DA matche le web** (avant de brancher l'API).
6. **Couche API** (`lib/api/`) : client fetch typé + auth secure-store, prête à pointer vers
   l'URL du backend Vercel (variable d'env `EXPO_PUBLIC_API_URL`).

Commence par **1 → 5** pour valider la DA à l'œil, **puis** brancher l'API.

---

## 8. Règles de travail

- **TypeScript strict**, pas de `any` qui traîne.
- Code commenté en **français** (cohérent avec le repo web).
- Commits conventionnels (`feat:`, `fix:`, `perf:`…), **sans** `Co-Authored-By`.
- Le repo mobile est **autonome** : ne dépend pas du code web, mais **copie fidèlement la DA**.
- En cas de doute sur une couleur/espacement : **la source de vérité est la section 2**, pas
  ton intuition.

---

**Résultat attendu :** une app Expo qui, posée à côté d'une capture du site Finexa, est
**immédiatement reconnaissable comme le même produit** — même émeraude, mêmes cartes de verre
opaques, mêmes polices, même barre de navigation basse, mêmes KPIs et donuts.

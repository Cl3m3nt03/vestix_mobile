/* ============================================================
   VESTIX — Design System « Émeraude » (calqué sur Finexa web)
   Couleurs oklch du web converties en hex (React Native ne gère
   pas oklch). Source de vérité : app/finexa.css du repo web.
   ============================================================ */

export const color = {
  // Texte (vert-ardoise foncé)
  ink:       '#193637',
  inkSoft:   '#465d5e',
  inkFaint:  '#738485',

  // Accent émeraude
  acc:       '#00804c',
  acc2:      '#006b3c',
  acc3:      '#005833',
  accBr:     '#009259', // émeraude clair — haut des dégradés
  accWash:   '#cff6e0',
  accTint:   '#e1f9ec', // fond d'icône / état actif discret

  pop:       '#e68c2c', // ambre / premium
  up:        '#008954', // hausse / positif
  down:      '#ce514d', // baisse / négatif / danger
  info:      '#3590bf',
  violet:    '#6b64ba',

  // Tranches secondaires de donut
  d2:        '#73a6c4',
  d3:        '#e68c2c',
  d4:        '#c0cfc6',

  // Surfaces (thème CLAIR — volontairement OPAQUES, zéro blur, cf. perf)
  card:        'rgba(255,255,255,0.92)',
  glass:       'rgba(255,255,255,0.58)',
  glass2:      'rgba(255,255,255,0.72)',
  glassStrong: 'rgba(255,255,255,0.82)',
  glassHi:     'rgba(255,255,255,0.90)',
  navBar:      '#eef5f1', // barre basse — OPAQUE (Android sans blur : pas de noir au travers)

  hair:   'rgba(30,55,45,0.10)',
  hair2:  'rgba(30,55,45,0.06)',

  white: '#ffffff',
} as const

/* Fond d'écran global (dégradé doux émeraude + bleu + crème) */
export const bgGradient = ['#dff7eb', '#dff5fc', '#efede7'] as const
/* Dégradé du « panneau » (bleu/violet pâle) pour zones secondaires */
export const panelGradient = ['#d4ebff', '#e8e8ff', '#faeee4'] as const
/* Dégradé accent (boutons, états actifs) : --acc-br → --acc-2.
   ⚠️ Émeraude par défaut — reste valable pour les usages STATIQUES (StyleSheet)
   pas encore migrés vers useTheme(). Les surfaces migrées lisent ACCENTS[key]. */
export const accentGradient = ['#009259', '#006b3c'] as const
export const dangerGradient = ['#d8654f', '#c24a3f'] as const

/* ============================================================
   THÈMES D'ACCENT — l'utilisateur choisit la teinte de l'app
   (émeraude par défaut + orange / violet / bleu). Seule la
   FAMILLE ACCENT change ; texte (ink) et surfaces restent fixes.
   ============================================================ */
export type ThemeKey = 'emerald' | 'orange' | 'violet' | 'blue'

export type Accent = {
  acc: string      // accent principal (texte/icône actif, fonds pleins)
  acc2: string     // bas du dégradé
  acc3: string     // teinte la plus sombre
  accBr: string    // haut du dégradé (clair)
  accWash: string  // lavis moyen
  accTint: string  // fond très clair (état actif discret, icônes)
  gradient: readonly [string, string]       // boutons / héros : accBr → acc2
  bg: readonly [string, string, string]     // fond d'écran global (AppShell)
  blob: readonly [string, string]           // 2 blobs décoratifs du fond
}

export const ACCENTS: Record<ThemeKey, Accent> = {
  emerald: { acc: '#00804c', acc2: '#006b3c', acc3: '#005833', accBr: '#009259', accWash: '#cff6e0', accTint: '#e1f9ec', gradient: ['#009259', '#006b3c'], bg: ['#dff7eb', '#dff5fc', '#efede7'], blob: ['#bff0d6', '#cfe4ff'] },
  orange:  { acc: '#e07b1e', acc2: '#c9650f', acc3: '#a8530c', accBr: '#f0a23a', accWash: '#fbe0c4', accTint: '#fdeede', gradient: ['#f0a23a', '#d97014'], bg: ['#fdeede', '#fef1e4', '#efede7'], blob: ['#ffd9a8', '#ffe6c4'] },
  violet:  { acc: '#6b5fd6', acc2: '#574bc0', acc3: '#463aa0', accBr: '#8b7ff0', accWash: '#ddd7f7', accTint: '#ece9fc', gradient: ['#8b7ff0', '#574bc0'], bg: ['#ece9fc', '#efeefb', '#efede7'], blob: ['#cfc8fa', '#dcd6f7'] },
  blue:    { acc: '#2487c9', acc2: '#1a6fab', acc3: '#155a8c', accBr: '#3fa3e0', accWash: '#cbe6f7', accTint: '#e2f1fb', gradient: ['#3fa3e0', '#1a6fab'], bg: ['#e2f1fb', '#e9f4fc', '#efede7'], blob: ['#a9d8f4', '#c4e6f9'] },
}

/* Libellé + pastille pour le sélecteur de thème (page Réglages). */
export const THEME_META: Record<ThemeKey, { label: string; swatch: string }> = {
  emerald: { label: 'Émeraude', swatch: '#00804c' },
  orange:  { label: 'Orange',   swatch: '#e07b1e' },
  violet:  { label: 'Violet',   swatch: '#6b5fd6' },
  blue:    { label: 'Bleu',     swatch: '#2487c9' },
}

export const radius = {
  lg: 26,
  md: 18,
  sm: 13,
  pill: 999,
} as const

/* Ombres — vertes-sombres (pas noires). iOS = shadow*, Android = elevation. */
export const shadow = {
  sm: {
    shadowColor: '#143c2d',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 6,
  },
  xs: {
    shadowColor: '#143c2d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 3,
  },
  lg: {
    shadowColor: '#143c2d',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.22,
    shadowRadius: 40,
    elevation: 12,
  },
} as const

/* Polices (chargées via @expo-google-fonts dans le _layout racine).
   display = Outfit · body = Hanken Grotesk · mono = JetBrains Mono */
export const font = {
  display:     'Outfit_600SemiBold',
  displayLight:'Outfit_300Light',
  body:        'HankenGrotesk_400Regular',
  bodyMed:     'HankenGrotesk_500Medium',
  bodySemi:    'HankenGrotesk_600SemiBold',
  mono:        'JetBrainsMono_400Regular',
  monoSemi:    'JetBrainsMono_600SemiBold',
} as const

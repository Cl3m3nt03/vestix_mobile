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

  hair:   'rgba(30,55,45,0.10)',
  hair2:  'rgba(30,55,45,0.06)',

  white: '#ffffff',
} as const

/* Fond d'écran global (dégradé doux émeraude + bleu + crème) */
export const bgGradient = ['#dff7eb', '#dff5fc', '#efede7'] as const
/* Dégradé du « panneau » (bleu/violet pâle) pour zones secondaires */
export const panelGradient = ['#d4ebff', '#e8e8ff', '#faeee4'] as const
/* Dégradé accent (boutons, états actifs) : --acc-br → --acc-2 */
export const accentGradient = ['#009259', '#006b3c'] as const
export const dangerGradient = ['#d8654f', '#c24a3f'] as const

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

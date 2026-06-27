/**
 * Génère une palette de N couleurs DISTINGUABLES dérivées d'une couleur de base.
 * Sert à colorer les diagrammes (donut, dots de catégories) dans la teinte du
 * thème actif. On reste dans la FAMILLE de la base (décalage de teinte limité)
 * mais on fait varier teinte ET clarté pour que les tranches voisines se
 * différencient bien (le simple dégradé clair→sombre était trop proche).
 */

function hexToRgb(h: string): [number, number, number] {
  const s = h.replace('#', '')
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)]
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

/** RGB (0-255) → HSL (h 0-360, s/l 0-100). */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
  }
  h = (h * 60 + 360) % 360
  const l = (max + min) / 2
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  return [h, s * 100, l * 100]
}

/** HSL → hex. */
function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360
  s = Math.max(0, Math.min(100, s)) / 100
  l = Math.max(0, Math.min(100, l)) / 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255)
}

/** Étalement de teinte total (degrés) autour de la base — reste « dans la famille ». */
const HUE_SPREAD = 86
/** Cycle de clarté pour séparer les tranches voisines. */
const LIGHT_CYCLE = [44, 60, 52, 66, 38]

/** N couleurs distinguables, toutes proches de la teinte de `base`. */
export function rampFrom(base: string, n: number): string[] {
  const [h, s, ] = rgbToHsl(...hexToRgb(base))
  const sat = Math.max(48, Math.min(82, s))
  const out: string[] = []
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1) - 0.5 // -0.5 → +0.5
    const hue = h + t * HUE_SPREAD
    const light = LIGHT_CYCLE[i % LIGHT_CYCLE.length]
    out.push(hslToHex(hue, sat, light))
  }
  return out
}

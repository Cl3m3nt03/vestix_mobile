/**
 * Génère un dégradé de N nuances d'une couleur de base (clair → base → sombre).
 * Sert à colorer les diagrammes (donut, dots de catégories) dans la teinte du
 * thème actif : toutes les tranches sont des variations de l'accent, mais
 * restent distinguables par leur clarté.
 */

function hexToRgb(h: string): [number, number, number] {
  const s = h.replace('#', '')
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)]
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

function mix(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

/** N nuances de `base`, du plus clair au plus sombre (mélange vers blanc/noir). */
export function rampFrom(base: string, n: number): string[] {
  const rgb = hexToRgb(base)
  const light = mix(rgb, [255, 255, 255], 0.62)
  const dark = mix(rgb, [0, 0, 0], 0.42)
  const out: string[] = []
  for (let i = 0; i < n; i++) {
    const p = n === 1 ? 0.5 : i / (n - 1) // 0 → clair, 1 → sombre
    const c = p < 0.5 ? mix(light, rgb, p * 2) : mix(rgb, dark, (p - 0.5) * 2)
    out.push(rgbToHex(c[0], c[1], c[2]))
  }
  return out
}

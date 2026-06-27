import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import { ACCENTS, type Accent, type ThemeKey } from '@/theme/tokens'
import { rampFrom } from './shades'
import { getStoredTheme, saveStoredTheme } from './theme'

/** Nombre de nuances du dégradé de diagrammes (≥ nb max de catégories). */
const RAMP_SIZE = 9

type ThemeState = {
  key: ThemeKey
  accent: Accent
  /** Dégradé de teintes de l'accent — couleurs des diagrammes/catégories. */
  ramp: string[]
  setTheme: (k: ThemeKey) => void
}

const DEFAULT: ThemeKey = 'emerald'

const ThemeContext = createContext<ThemeState>({
  key: DEFAULT,
  accent: ACCENTS[DEFAULT],
  ramp: rampFrom(ACCENTS[DEFAULT].acc, RAMP_SIZE),
  setTheme: () => {},
})

/**
 * Fournit l'accent actif de l'app (émeraude / orange / violet / bleu).
 * Le choix est persisté localement (secure-store). Les composants lisent
 * la teinte via `useTheme().accent` et l'appliquent en style INLINE (les
 * valeurs de StyleSheet sont figées à la compilation, donc non réactives).
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [key, setKey] = useState<ThemeKey>(DEFAULT)

  useEffect(() => {
    getStoredTheme().then((k) => k && setKey(k))
  }, [])

  const setTheme = (k: ThemeKey) => {
    setKey(k)
    saveStoredTheme(k).catch(() => {})
  }

  const ramp = useMemo(() => rampFrom(ACCENTS[key].acc, RAMP_SIZE), [key])

  return (
    <ThemeContext.Provider value={{ key, accent: ACCENTS[key], ramp, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

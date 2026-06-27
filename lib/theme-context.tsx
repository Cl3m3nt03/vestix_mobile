import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { ACCENTS, type Accent, type ThemeKey } from '@/theme/tokens'
import { getStoredTheme, saveStoredTheme } from './theme'

type ThemeState = {
  key: ThemeKey
  accent: Accent
  setTheme: (k: ThemeKey) => void
}

const DEFAULT: ThemeKey = 'emerald'

const ThemeContext = createContext<ThemeState>({
  key: DEFAULT,
  accent: ACCENTS[DEFAULT],
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

  return (
    <ThemeContext.Provider value={{ key, accent: ACCENTS[key], setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

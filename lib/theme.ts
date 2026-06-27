import * as SecureStore from 'expo-secure-store'
import type { ThemeKey } from '@/theme/tokens'

const THEME_KEY = 'vestix.theme'

/** Lit le thème d'accent stocké localement (null si jamais choisi). */
export async function getStoredTheme(): Promise<ThemeKey | null> {
  const v = await SecureStore.getItemAsync(THEME_KEY)
  return v === 'emerald' || v === 'orange' || v === 'violet' || v === 'blue' ? v : null
}

export async function saveStoredTheme(key: ThemeKey) {
  await SecureStore.setItemAsync(THEME_KEY, key)
}

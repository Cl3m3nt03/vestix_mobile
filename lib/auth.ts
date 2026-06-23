import * as SecureStore from 'expo-secure-store'

const TOKEN_KEY = 'vestix.jwt'

/** Stocke le JWT mobile (30 j) renvoyé par POST /api/auth/mobile. */
export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token)
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY)
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY)
}

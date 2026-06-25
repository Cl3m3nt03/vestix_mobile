import { getToken, saveToken, clearToken } from './auth'

/**
 * Client de l'API Vestix = MÊME backend que le web Finexa (Next.js/Vercel).
 * Toutes les routes acceptent `Authorization: Bearer <jwt>` via le helper
 * unifié `getUser(req)` côté serveur. Aucune modif backend nécessaire.
 */
const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'https://finexa-dev.vercel.app'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  })

  if (res.status === 401) await clearToken()

  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) throw new ApiError(res.status, data?.error ?? `HTTP ${res.status}`)
  return data as T
}

export const api = {
  get:   <T>(p: string) => request<T>(p),
  post:  <T>(p: string, body?: unknown) => request<T>(p, { method: 'POST', body: JSON.stringify(body ?? {}) }),
  patch: <T>(p: string, body?: unknown) => request<T>(p, { method: 'PATCH', body: JSON.stringify(body ?? {}) }),
  del:   <T>(p: string) => request<T>(p, { method: 'DELETE' }),
}

// ── Assistant IA (réponse streamée en texte brut, pas JSON) ─────────────────
import type { ChatMessage } from './types'

/**
 * Envoie la conversation à l'API streaming et appelle `onChunk` à chaque
 * morceau de texte reçu (depuis le ReadableStream côté serveur). Résout
 * avec la réponse complète une fois la connexion fermée.
 *
 * Implémentation via XMLHttpRequest car React Native ne supporte pas
 * `response.body.getReader()` de manière fiable cross-platform — XHR a un
 * readyState 3 qui donne le `responseText` progressif.
 */
export function sendChatStream(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    let token: string | null = null
    getToken().then((t) => {
      token = t
      const xhr = new XMLHttpRequest()
      let lastLen = 0

      xhr.onreadystatechange = () => {
        if (xhr.readyState >= 3 && xhr.status === 200) {
          const newText = xhr.responseText.slice(lastLen)
          lastLen = xhr.responseText.length
          if (newText) onChunk(newText)
        }
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            resolve(xhr.responseText)
            return
          }
          if (xhr.status === 401) clearToken()
          try {
            const j = JSON.parse(xhr.responseText)
            if (j.requiresConsent) { reject(new ApiError(403, 'CONSENT_REQUIRED')); return }
            reject(new ApiError(xhr.status, j.error ?? j.message ?? `HTTP ${xhr.status}`))
          } catch {
            reject(new ApiError(xhr.status, `HTTP ${xhr.status}`))
          }
        }
      }
      xhr.onerror = () => reject(new ApiError(0, 'Erreur réseau'))

      xhr.open('POST', `${BASE}/api/assistant`)
      xhr.setRequestHeader('Content-Type', 'application/json')
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      xhr.send(JSON.stringify({ messages }))
    })
  })
}

/** Wrapper non-streaming (rétro-compat) — résout avec la réponse complète. */
export async function sendChat(messages: ChatMessage[]): Promise<string> {
  return sendChatStream(messages, () => {})
}

// ── Auth ──────────────────────────────────────────────────────────────────
type LoginResult =
  | { requires2FA: true }
  | { token: string; user: { id: string; email: string; name: string | null } }

/** POST /api/auth/mobile — login email/mdp (+ code OTP email si 2FA). */
export async function login(email: string, password: string, totpCode?: string): Promise<LoginResult> {
  const res = await fetch(`${BASE}/api/auth/mobile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, totpCode }),
  })
  const data = await res.json()
  if (!res.ok) throw new ApiError(res.status, data?.error ?? 'Échec de connexion')
  if ('token' in data) await saveToken(data.token)
  return data
}

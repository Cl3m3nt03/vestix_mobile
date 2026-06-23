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

// ── Assistant IA (réponse en texte brut, pas JSON) ──────────────────────────
import type { ChatMessage } from './types'

export async function sendChat(messages: ChatMessage[]): Promise<string> {
  const token = await getToken()
  const res = await fetch(`${BASE}/api/assistant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ messages }),
  })
  const text = await res.text()
  if (!res.ok) {
    // 403 consentement requis → JSON ; sinon message d'erreur
    try {
      const j = JSON.parse(text)
      if (j.requiresConsent) throw new ApiError(403, 'CONSENT_REQUIRED')
      throw new ApiError(res.status, j.error ?? j.message ?? `HTTP ${res.status}`)
    } catch (e) {
      if (e instanceof ApiError) throw e
      throw new ApiError(res.status, `HTTP ${res.status}`)
    }
  }
  return text
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

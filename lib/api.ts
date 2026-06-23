import { getToken, saveToken, clearToken } from './auth'

/**
 * Client de l'API Vestix = MÊME backend que le web Finexa (Next.js/Vercel).
 * Toutes les routes acceptent `Authorization: Bearer <jwt>` via le helper
 * unifié `getUser(req)` côté serveur. Aucune modif backend nécessaire.
 */
const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'https://finexa.vercel.app'

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

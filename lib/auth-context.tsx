import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getToken, clearToken } from './auth'

type AuthState = {
  token: string | null
  ready: boolean
  setToken: (t: string | null) => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  token: null,
  ready: false,
  setToken: () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTok] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    getToken().then((t) => {
      setTok(t)
      setReady(true)
    })
  }, [])

  const signOut = async () => {
    await clearToken()
    setTok(null)
  }

  return (
    <AuthContext.Provider value={{ token, ready, setToken: setTok, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

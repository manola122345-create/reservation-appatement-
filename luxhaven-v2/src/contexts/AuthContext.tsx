import { createContext, useContext, useState, ReactNode } from 'react'

// ✅ Authentification locale — aucun service externe requis
// Le mot de passe est stocké dans la variable d'environnement VITE_ADMIN_PASSWORD
// L'email est stocké dans VITE_ADMIN_EMAIL

interface AuthContextType {
  isAdmin: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD as string
const SESSION_KEY = 'luxhaven_admin_session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem(SESSION_KEY) === 'true'
  })
  const [loading] = useState(false)

  const signIn = async (email: string, password: string) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true')
      setIsAdmin(true)
      return { error: null }
    }
    return { error: 'Email ou mot de passe incorrect.' }
  }

  const signOut = () => {
    sessionStorage.removeItem(SESSION_KEY)
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider')
  return ctx
}

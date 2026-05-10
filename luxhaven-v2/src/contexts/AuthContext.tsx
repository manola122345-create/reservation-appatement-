import { createContext, useContext, useState, ReactNode } from 'react'

interface AuthContextType {
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD as string

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('lh_admin') === 'ok'
    } catch {
      return false
    }
  })

  const signIn = async (email: string, password: string) => {
    if (
      email.trim() === (ADMIN_EMAIL || '').trim() &&
      password === (ADMIN_PASSWORD || '')
    ) {
      try { sessionStorage.setItem('lh_admin', 'ok') } catch {}
      setIsAdmin(true)
      return { error: null }
    }
    return { error: 'Email ou mot de passe incorrect.' }
  }

  const signOut = () => {
    try { sessionStorage.removeItem('lh_admin') } catch {}
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ isAdmin, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

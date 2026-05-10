import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function AdminLogin() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await signIn(form.email, form.password)
    if (error) {
      setError('Email ou mot de passe incorrect.')
      setLoading(false)
    } else {
      navigate('/admin')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--lux-navy)] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--lux-gold)] text-[var(--lux-navy)] font-display text-2xl font-bold">
            LH
          </div>
          <p className="mt-3 font-display text-2xl text-white">LuxHaven</p>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Accès administrateur</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-8 shadow-2xl">
          <div className="mb-2 flex items-center gap-2 text-[var(--lux-navy)]">
            <Lock className="h-5 w-5" />
            <h1 className="font-display text-xl">Connexion</h1>
          </div>
          <p className="mb-6 text-xs text-slate-400">Zone réservée. Accès non autorisé interdit.</p>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-slate-400">Email</label>
              <input
                required type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--lux-gold)] transition"
                placeholder="admin@luxhaven.com"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-slate-400">Mot de passe</label>
              <div className="relative mt-1">
                <input
                  required type={showPwd ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-sm outline-none focus:border-[var(--lux-gold)] transition"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="mt-6 w-full rounded-full bg-[var(--lux-gold)] py-3 text-sm font-semibold text-[var(--lux-navy)] transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}

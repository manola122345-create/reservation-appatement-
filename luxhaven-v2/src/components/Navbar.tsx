import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const links = [
  { label: 'Appartements', href: '/listings' },
  { label: 'Colocation', href: '/listings?type=Colocation' },
  { label: 'Court séjour', href: '/listings?type=Courte+durée' },
  { label: 'Long séjour', href: '/listings?type=Longue+durée' },
  { label: 'Contact', href: '/#contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--lux-gold)] text-[var(--lux-navy)] font-display text-lg font-bold">
            LH
          </div>
          <div>
            <p className="font-display text-xl text-[var(--lux-navy)]">LuxHaven</p>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Luxury Rentals</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
          {links.map((l) => (
            <Link key={l.label} to={l.href} className="transition hover:text-[var(--lux-navy)]">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/listings')}
            className="hidden rounded-full bg-[var(--lux-gold)] px-6 py-2 text-sm font-semibold text-[var(--lux-navy)] shadow-lg transition hover:-translate-y-0.5 lg:block"
          >
            Réserver
          </button>
          <button className="lg:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white px-6 py-4 lg:hidden">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.href}
              className="block py-3 text-sm text-slate-600"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={() => { navigate('/listings'); setOpen(false) }}
            className="mt-3 w-full rounded-full bg-[var(--lux-gold)] py-2 text-sm font-semibold text-[var(--lux-navy)]"
          >
            Réserver
          </button>
        </div>
      )}
    </header>
  )
}

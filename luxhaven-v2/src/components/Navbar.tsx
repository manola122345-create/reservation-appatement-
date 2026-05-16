import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const links = (lang: 'fr'|'en') => [
  { label: lang === 'fr' ? 'Appartements' : 'Apartments', href: '/listings' },
  { label: lang === 'fr' ? 'À propos' : 'About', href: '/#about' },
  { label: lang === 'fr' ? 'Équipe' : 'Team', href: '/#team' },
  { label: lang === 'fr' ? 'Services' : 'Services', href: '/#services' },
  { label: 'Contact', href: '/#contact' },
]

interface NavbarProps {
  lang?: 'fr'|'en'
  setLang?: (l: 'fr'|'en') => void
}

export default function Navbar({ lang = 'fr', setLang }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const navLinks = links(lang)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C9A84C] text-[#0A1F44] font-bold text-lg">LH</div>
          <div>
            <p className="font-display text-xl text-[#0A1F44]">LuxHaven</p>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Luxury Rentals</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
          {navLinks.map(l => (
            <a key={l.label} href={l.href} className="transition hover:text-[#0A1F44]">{l.label}</a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {setLang && (
            <div className="hidden lg:flex items-center gap-1 rounded-full border border-slate-200 p-1 text-xs font-semibold">
              <button onClick={() => setLang('fr')} className={`rounded-full px-2.5 py-1 transition ${lang === 'fr' ? 'bg-[#0A1F44] text-white' : 'text-slate-500 hover:text-slate-700'}`}>🇫🇷 FR</button>
              <button onClick={() => setLang('en')} className={`rounded-full px-2.5 py-1 transition ${lang === 'en' ? 'bg-[#0A1F44] text-white' : 'text-slate-500 hover:text-slate-700'}`}>🇬🇧 EN</button>
            </div>
          )}
          <button onClick={() => navigate('/listings')}
            className="hidden rounded-full bg-[#C9A84C] px-6 py-2 text-sm font-semibold text-[#0A1F44] shadow-lg transition hover:-translate-y-0.5 lg:block">
            {lang === 'fr' ? 'Réserver' : 'Book'}
          </button>
          <button className="lg:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white px-6 py-4 lg:hidden">
          {navLinks.map(l => (
            <a key={l.label} href={l.href} className="block py-3 text-sm text-slate-600" onClick={() => setOpen(false)}>{l.label}</a>
          ))}
          {setLang && (
            <div className="flex gap-2 py-3">
              <button onClick={() => setLang('fr')} className={`rounded-full px-3 py-1 text-xs font-semibold border ${lang === 'fr' ? 'bg-[#0A1F44] text-white border-[#0A1F44]' : 'border-slate-200 text-slate-500'}`}>🇫🇷 FR</button>
              <button onClick={() => setLang('en')} className={`rounded-full px-3 py-1 text-xs font-semibold border ${lang === 'en' ? 'bg-[#0A1F44] text-white border-[#0A1F44]' : 'border-slate-200 text-slate-500'}`}>🇬🇧 EN</button>
            </div>
          )}
          <button onClick={() => { navigate('/listings'); setOpen(false) }}
            className="mt-3 w-full rounded-full bg-[#C9A84C] py-2 text-sm font-semibold text-[#0A1F44]">
            {lang === 'fr' ? 'Réserver' : 'Book'}
          </button>
        </div>
      )}
    </header>
  )
}

import { Link } from 'react-router-dom'
import { Phone, Mail } from 'lucide-react'

const links = [
  { label: 'Appartements', href: '/listings' },
  { label: 'Colocation', href: '/listings?type=Colocation' },
  { label: 'Court séjour', href: '/listings?type=Courte+durée' },
  { label: 'Long séjour', href: '/listings?type=Longue+durée' },
  { label: 'Contact', href: '/#contact' },
]

export default function Footer() {
  return (
    <footer className="bg-[var(--lux-navy)] py-12 text-white">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--lux-gold)] text-[var(--lux-navy)] font-display font-bold">
                LH
              </div>
              <div>
                <p className="font-display text-xl">LuxHaven</p>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Luxury Rentals</p>
              </div>
            </div>
            <p className="text-sm text-slate-300">
              Plateforme premium pour appartements d'exception, avec paiement 100% sécurisé.
            </p>
          </div>

          <div>
            <p className="font-display text-lg">Navigation</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {links.map((l) => (
                <li key={l.label}>
                  <Link to={l.href} className="hover:text-white transition">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div id="contact">
            <p className="font-display text-lg">Contact</p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[var(--lux-gold)]" />
                +229 00 00 00 00
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[var(--lux-gold)]" />
                contact@luxhaven.com
              </p>
              <div className="flex gap-3 pt-2">
                {['Instagram', 'LinkedIn', 'Facebook'].map((s) => (
                  <span key={s} className="rounded-full border border-slate-500 px-3 py-1 text-xs cursor-pointer hover:border-[var(--lux-gold)] transition">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-700 pt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} LuxHaven. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}

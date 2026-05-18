import { Send, Mail, Phone, MapPin } from 'lucide-react'
import { CONFIG } from '../config'

interface FooterProps { lang?: 'fr'|'en' }

export default function Footer({ lang = 'fr' }: FooterProps) {
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  return (
    <footer className="bg-[#0A1F44] py-12 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C9A84C] text-[#0A1F44] font-bold">LH</div>
              <div>
                <p className="font-display text-xl">LuxHaven</p>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Luxury Rentals</p>
              </div>
            </div>
            <p className="text-sm text-slate-300">
              {t('Votre partenaire de confiance pour la location d\'appartements haut de gamme.', 'Your trusted partner for luxury apartment rentals.')}
            </p>
            <div className="space-y-1 text-xs text-slate-400 pt-2">
              <p>{t('Numéro d\'entreprise', 'Company number')}: {CONFIG.companyNumber}</p>
            </div>
          </div>

          <div>
            <p className="font-display text-lg">{t('Navigation', 'Navigation')}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {[
                { label: t('Appartements', 'Apartments'), href: '/listings' },
                { label: t('À propos', 'About'), href: '/#about' },
                { label: t('Équipe', 'Team'), href: '/#team' },
                { label: t('Services', 'Services'), href: '/#services' },
                { label: 'Contact', href: '/#contact' },
              ].map(l => (
                <li key={l.label}><a href={l.href} className="hover:text-white transition">{l.label}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-display text-lg">Contact</p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <a href={CONFIG.telegram} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 hover:text-white transition">
                <Send className="h-4 w-4 text-[#229ED9] shrink-0" /> {CONFIG.telegramUsername}
              </a>
              <a href={`mailto:${CONFIG.email}`} className="flex items-center gap-2 hover:text-white transition">
                <Mail className="h-4 w-4 text-[#C9A84C] shrink-0" /> {CONFIG.email}
              </a>
              <a href={`tel:${CONFIG.phone}`} className="flex items-center gap-2 hover:text-white transition">
                <Phone className="h-4 w-4 text-[#C9A84C] shrink-0" /> {CONFIG.phone}
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-[#C9A84C] shrink-0 mt-0.5" />
                <span>{CONFIG.address}</span>
              </div>
              <a href={CONFIG.telegram} target="_blank" rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#229ED9] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5">
                <Send className="h-4 w-4" /> Telegram
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-700 pt-6 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span>© {new Date().getFullYear()} LuxHaven. {t('Tous droits réservés.', 'All rights reserved.')}</span>
          <span>{t('N° entreprise', 'Company no.')}: {CONFIG.companyNumber}</span>
        </div>
      </div>
    </footer>
  )
}

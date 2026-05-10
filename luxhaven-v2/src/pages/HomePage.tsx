import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, CalendarCheck, Users, Search, ShieldCheck, CreditCard, Headset, Star, ArrowUpRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabase'
import { Listing } from '../types'

const categories = [
  { title: 'Longue durée', description: 'Contrats flexibles, services premium inclus.', type: 'Longue durée' },
  { title: 'Courte durée', description: 'Séjours raffinés pour vos escapades urbaines.', type: 'Courte durée' },
  { title: 'Colocation', description: 'Vivez en communauté dans un cadre luxueux.', type: 'Colocation' },
  { title: 'Meublé', description: 'Appartements élégants, prêts à vivre.', type: 'Meublé' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [featured, setFeatured] = useState<Listing[]>([])
  const [search, setSearch] = useState({ location: '', dates: '', guests: '' })

  useEffect(() => {
    supabase.from('listings').select('*').eq('available', true).limit(3).then(({ data }) => {
      if (data) setFeatured(data as Listing[])
    })
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search.location) params.set('location', search.location)
    navigate(`/listings?${params.toString()}`)
  }

  return (
    <div className="bg-white text-slate-900">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[620px] w-full">
        <img src="/images/hero.jpg" alt="Appartement luxueux" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(10,31,68,0.92)] via-[rgba(10,31,68,0.65)] to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-6">
            <div className="max-w-2xl space-y-6">
              <p className="text-sm uppercase tracking-[0.4em] text-[var(--lux-gold)]">Expérience signature</p>
              <h1 className="font-display text-4xl text-white md:text-5xl">
                Trouvez votre chez-vous idéal
              </h1>
              <p className="text-lg text-slate-200">
                LuxHaven réunit les plus beaux appartements haut de gamme avec un paiement en ligne sécurisé.
              </p>
              <form onSubmit={handleSearch} className="grid gap-3 rounded-2xl bg-white/95 p-4 shadow-2xl md:grid-cols-[1.2fr_1fr_0.8fr_auto]">
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
                  <MapPin className="h-5 w-5 shrink-0 text-[var(--lux-gold)]" />
                  <input className="w-full bg-transparent text-sm text-slate-700 outline-none" placeholder="Ville, quartier..." value={search.location} onChange={e => setSearch(s => ({ ...s, location: e.target.value }))} />
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
                  <CalendarCheck className="h-5 w-5 shrink-0 text-[var(--lux-gold)]" />
                  <input className="w-full bg-transparent text-sm text-slate-700 outline-none" placeholder="Dates" value={search.dates} onChange={e => setSearch(s => ({ ...s, dates: e.target.value }))} />
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
                  <Users className="h-5 w-5 shrink-0 text-[var(--lux-gold)]" />
                  <input className="w-full bg-transparent text-sm text-slate-700 outline-none" placeholder="Personnes" value={search.guests} onChange={e => setSearch(s => ({ ...s, guests: e.target.value }))} />
                </div>
                <button type="submit" className="flex items-center justify-center gap-2 rounded-xl bg-[var(--lux-navy)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--lux-navy)]/90">
                  <Search className="h-4 w-4" /> Rechercher
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white py-16">
        <div className="mx-auto w-full max-w-7xl px-6">
          <h2 className="font-display text-3xl text-[var(--lux-navy)]">Nos catégories</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <button key={c.title} onClick={() => navigate(`/listings?type=${encodeURIComponent(c.type)}`)}
                className="rounded-xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-100 text-left transition hover:-translate-y-1 hover:shadow-xl">
                <h3 className="font-display text-xl text-[var(--lux-navy)]">{c.title}</h3>
                <p className="mt-3 text-sm text-slate-600">{c.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-3xl text-[var(--lux-navy)]">Appartements en vedette</h2>
            <button onClick={() => navigate('/listings')} className="flex items-center gap-1 text-sm font-medium text-[var(--lux-navy)] hover:gap-2 transition-all">
              Voir tout <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {featured.length === 0 ? (
              <p className="text-slate-400 col-span-3 text-center py-10">Aucun appartement disponible pour l'instant.</p>
            ) : featured.map((l) => (
              <div key={l.id} className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg shadow-slate-100">
                <div className="relative h-56 overflow-hidden">
                  <img src={l.images[0] || '/images/listing-1.jpg'} alt={l.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  {l.badge && <span className="absolute left-3 top-3 rounded-full bg-[var(--lux-gold)] px-3 py-1 text-xs font-semibold text-[var(--lux-navy)]">{l.badge}</span>}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg text-[var(--lux-navy)]">{l.title}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
                      <Star className="h-3.5 w-3.5 fill-[var(--lux-gold)] text-[var(--lux-gold)]" /> 5.0
                    </div>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                    <MapPin className="h-3.5 w-3.5" /> {l.location}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="font-semibold text-[var(--lux-navy)]">{l.price_label}</p>
                    <button onClick={() => navigate(`/listings/${l.id}`)} className="rounded-full bg-[var(--lux-navy)] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--lux-gold)] hover:text-[var(--lux-navy)]">
                      Voir plus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="bg-white py-16">
        <div className="mx-auto w-full max-w-7xl px-6">
          <h2 className="font-display text-center text-3xl text-[var(--lux-navy)]">Pourquoi LuxHaven ?</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, title: 'Sécurité garantie', desc: 'Tous nos biens sont vérifiés et certifiés par notre équipe.' },
              { icon: CreditCard, title: 'Paiement sécurisé', desc: 'Transactions chiffrées via Stripe. Visa, Mastercard, PayPal acceptés.' },
              { icon: Headset, title: 'Support 24/7', desc: 'Une équipe disponible à tout moment pour vous accompagner.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-slate-100 p-8 text-center shadow-lg shadow-slate-100">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--lux-gold)]/10">
                  <Icon className="h-7 w-7 text-[var(--lux-gold)]" />
                </div>
                <h3 className="mt-4 font-display text-xl text-[var(--lux-navy)]">{title}</h3>
                <p className="mt-2 text-sm text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

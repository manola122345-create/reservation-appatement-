import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MapPin, Star, SlidersHorizontal, Search, Send } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabase'
import { Listing } from '../types'

const TYPES = ['Tous', 'Longue durée', 'Courte durée', 'Colocation', 'Meublé']

export default function ListingsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState(searchParams.get('type') || 'Tous')
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || '')
  const [priceMax, setPriceMax] = useState(10000)

  useEffect(() => {
    fetchListings()
  }, [activeType, priceMax])

  async function fetchListings() {
    setLoading(true)
    let query = supabase.from('listings').select('*').eq('available', true).lte('price_amount', priceMax)
    if (activeType !== 'Tous') query = query.eq('type', activeType)
    const { data } = await query.order('created_at', { ascending: false })
    setListings((data || []) as Listing[])
    setLoading(false)
  }

  const filtered = locationFilter
    ? listings.filter(l => l.location.toLowerCase().includes(locationFilter.toLowerCase()) || l.title.toLowerCase().includes(locationFilter.toLowerCase()))
    : listings

  return (
    <div className="min-h-screen bg-[#F2F1EF] text-slate-900">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="font-display text-3xl text-[var(--lux-navy)]">Nos appartements</h1>
        <p className="mt-1 text-slate-500">{filtered.length} bien{filtered.length > 1 ? 's' : ''} disponible{filtered.length > 1 ? 's' : ''}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          {TYPES.map(t => (
            <button key={t} onClick={() => setActiveType(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${activeType === t ? 'bg-[var(--lux-navy)] text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-[var(--lux-navy)]'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar filtres */}
          <aside className="space-y-6 rounded-2xl border border-slate-200 bg-[#FAF9F7] p-6 shadow-lg shadow-slate-100 h-fit">
            <div>
              <p className="flex items-center gap-2 font-display text-[var(--lux-navy)]">
                <SlidersHorizontal className="h-4 w-4" /> Filtres
              </p>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-slate-400">Recherche</label>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input className="w-full bg-transparent text-sm outline-none" placeholder="Ville, quartier..." value={locationFilter} onChange={e => setLocationFilter(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-slate-400">Prix max / {activeType === 'Longue durée' || activeType === 'Colocation' || activeType === 'Meublé' ? 'mois' : 'nuit'}</label>
              <p className="mt-1 font-semibold text-[var(--lux-navy)]">{priceMax.toLocaleString('fr-FR')} €</p>
              <input type="range" min={100} max={20000} step={100} value={priceMax} onChange={e => setPriceMax(Number(e.target.value))} className="mt-2 w-full accent-[var(--lux-gold)]" />
              <div className="flex justify-between text-xs text-slate-400">
                <span>100€</span><span>20 000€</span>
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-slate-400">Type</label>
              <div className="mt-2 space-y-2">
                {TYPES.map(t => (
                  <label key={t} className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                    <input type="radio" name="type" checked={activeType === t} onChange={() => setActiveType(t)} className="accent-[var(--lux-gold)]" />
                    {t}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Grille */}
          <div>
            {loading ? (
              <div className="flex h-60 items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--lux-gold)] border-t-transparent" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex h-60 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-slate-400">
                <p className="text-lg">Aucun bien trouvé</p>
                <p className="text-sm mt-1">Essaie de modifier tes filtres</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map(l => (
                  <div key={l.id} className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg shadow-slate-100 transition hover:-translate-y-1">
                    <div className="relative h-52 overflow-hidden">
                      <img src={l.images[0] || '/images/listing-1.jpg'} alt={l.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      <div className="absolute left-3 top-3 flex gap-2">
                        {l.badge && <span className="rounded-full bg-[var(--lux-gold)] px-2.5 py-1 text-xs font-semibold text-[var(--lux-navy)]">{l.badge}</span>}
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${l.available ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                          {l.available ? 'Disponible' : 'Réservé'}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between gap-2">
                        <h3 className="font-display text-lg text-[var(--lux-navy)]">{l.title}</h3>
                        <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
                          <Star className="h-3.5 w-3.5 fill-[var(--lux-gold)] text-[var(--lux-gold)]" /> 5.0
                        </div>
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                        <MapPin className="h-3.5 w-3.5" /> {l.location}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">{l.type} · {l.rooms} ch. · {l.surface} m²</p>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="font-semibold text-[var(--lux-navy)]">{l.price_label}</p>
                        <div className="flex gap-1.5">
                          <a href="https://t.me/alicevip4" target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 rounded-full bg-[#229ED9] px-2.5 py-1.5 text-xs font-semibold text-white transition hover:-translate-y-0.5">
                            <Send className="h-3 w-3" />
                          </a>
                          <button onClick={() => navigate(`/listings/${l.id}`)}
                            className="rounded-full bg-[var(--lux-navy)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--lux-gold)] hover:text-[var(--lux-navy)]">
                            Voir
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

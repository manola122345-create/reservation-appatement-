import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MapPin, Star, SlidersHorizontal, Search, Send, Key, Bath } from 'lucide-react'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '../lib/firebase'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import VisitModal from '../components/VisitModal'
import SkeletonCard from '../components/SkeletonCard'
import BookingModal from '../components/BookingModal'
import { CONFIG } from '../config'
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
  const [visitModal, setVisitModal] = useState<{ title: string; location: string } | null>(null)
  const [bookingModal, setBookingModal] = useState<{ title: string; location: string; price: string } | null>(null)

  useEffect(() => { fetchListings() }, [activeType, priceMax])

  async function fetchListings() {
    setLoading(true)
    try {
      const snap = await getDocs(query(collection(db, 'listings'), where('available', '==', true), orderBy('created_at', 'desc')))
      let data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Listing[]
      if (activeType !== 'Tous') data = data.filter(l => l.type === activeType)
      data = data.filter(l => l.price_amount <= priceMax)
      setListings(data)
    } catch { setListings([]) }
    setLoading(false)
  }

  const filtered = locationFilter
    ? listings.filter(l => l.location.toLowerCase().includes(locationFilter.toLowerCase()) || l.title.toLowerCase().includes(locationFilter.toLowerCase()))
    : listings

  return (
    <div className="min-h-screen bg-[#F2F1EF] text-slate-900">
      <Navbar />

      {bookingModal && (
        <BookingModal
          listingTitle={bookingModal.title}
          listingLocation={bookingModal.location}
          priceLabel={bookingModal.price}
          onClose={() => setBookingModal(null)}
        />
      )}
      {visitModal && (
        <VisitModal
          listingTitle={visitModal.title}
          listingLocation={visitModal.location}
          onClose={() => setVisitModal(null)}
        />
      )}

      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="font-display text-3xl text-[#0A1F44]">Nos appartements</h1>
        <p className="mt-1 text-slate-500">{filtered.length} bien{filtered.length > 1 ? 's' : ''} disponible{filtered.length > 1 ? 's' : ''}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          {TYPES.map(t => (
            <button key={t} onClick={() => setActiveType(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${activeType === t ? 'bg-[#0A1F44] text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-[#0A1F44]'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm h-fit">
            <p className="flex items-center gap-2 font-display text-[#0A1F44]">
              <SlidersHorizontal className="h-4 w-4" /> Filtres
            </p>
            <div>
              <label className="text-xs uppercase tracking-widest text-slate-400">Recherche</label>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input className="w-full bg-transparent text-sm outline-none" placeholder="Ville, quartier..."
                  value={locationFilter} onChange={e => setLocationFilter(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-slate-400">Prix max</label>
              <p className="mt-1 font-semibold text-[#0A1F44]">{priceMax.toLocaleString('fr-FR')} €</p>
              <input type="range" min={100} max={20000} step={100} value={priceMax}
                onChange={e => setPriceMax(Number(e.target.value))}
                className="mt-2 w-full accent-[#C9A84C]" />
              <div className="flex justify-between text-xs text-slate-400"><span>100€</span><span>20 000€</span></div>
            </div>
          </aside>

          {/* Grid */}
          <div>
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex h-60 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-slate-400">
                <p className="text-lg">Aucun bien trouvé</p>
                <p className="text-sm mt-1">Essaie de modifier tes filtres</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map(l => {
                  const caution = l.price_amount * 2
                  return (
                    <div key={l.id} className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                      <div className="relative h-52 overflow-hidden">
                        <img src={l.images?.[0] || '/images/listing-1.jpg'} alt={l.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                        <div className="absolute left-3 top-3 flex gap-2">
                          {l.badge && <span className="rounded-full bg-[#C9A84C] px-2.5 py-1 text-xs font-semibold text-[#0A1F44]">{l.badge}</span>}
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">À louer</span>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex justify-between gap-2">
                          <h3 className="font-display text-lg text-[#0A1F44]">{l.title}</h3>
                          <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
                            <Star className="h-3.5 w-3.5 fill-[#C9A84C] text-[#C9A84C]" /> 5.0
                          </div>
                        </div>
                        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                          <MapPin className="h-3.5 w-3.5" /> {l.location}
                        </p>

                        {/* Détails */}
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                          <span>🛏 {l.rooms} ch.</span>
                          {l.bathrooms && <span className="flex items-center gap-0.5"><Bath className="h-3 w-3" /> {l.bathrooms} sdb</span>}
                          <span>📐 {l.surface} m²</span>
                        </div>

                        {/* Caution */}
                        <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                          <Key className="h-3 w-3 text-[#C9A84C]" />
                          <span>Caution: <span className="font-medium text-[#0A1F44]">{caution.toLocaleString('fr-FR')} €</span></span>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <p className="font-semibold text-[#0A1F44]">{l.price_label}</p>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => setVisitModal({ title: l.title, location: l.location })}
                              className="flex items-center gap-1 rounded-full border border-[#229ED9] px-2.5 py-1.5 text-xs font-semibold text-[#229ED9] transition hover:bg-[#229ED9] hover:text-white">
                              📅 Visite
                            </button>
                            <a href={CONFIG.telegram} target="_blank" rel="noreferrer"
                              className="flex items-center gap-1 rounded-full bg-[#229ED9] px-2.5 py-1.5 text-xs font-semibold text-white transition hover:-translate-y-0.5">
                              <Send className="h-3 w-3" />
                            </a>
                            <button onClick={() => setBookingModal({ title: l.title, location: l.location, price: l.price_label })}
                              className="rounded-full bg-[#C9A84C] px-3 py-1.5 text-xs font-semibold text-[#0A1F44] transition hover:-translate-y-0.5">
                              Réserver
                            </button>
                            <button onClick={() => navigate(`/listings/${l.id}`)}
                              className="rounded-full bg-[#0A1F44] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#C9A84C] hover:text-[#0A1F44]">
                              Voir
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

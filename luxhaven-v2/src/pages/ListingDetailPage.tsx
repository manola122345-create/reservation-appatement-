import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Wifi, ParkingCircle, Snowflake, CookingPot, Building2, Shield, Users, CalendarCheck, Star, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabase'
import { Listing } from '../types'

const amenityIcons: Record<string, React.ElementType> = {
  WiFi: Wifi, Parking: ParkingCircle, Climatisation: Snowflake,
  'Cuisine équipée': CookingPot, Balcon: Building2, 'Sécurité 24/7': Shield,
}

export default function ListingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const [dates, setDates] = useState({ start: '', end: '' })
  const [guests, setGuests] = useState(1)

  useEffect(() => {
    if (!id) return
    supabase.from('listings').select('*').eq('id', id).single().then(({ data }) => {
      setListing(data as Listing)
      setLoading(false)
    })
  }, [id])

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--lux-gold)] border-t-transparent" />
    </div>
  )

  if (!listing) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="text-xl text-slate-500">Appartement introuvable.</p>
      <button onClick={() => navigate('/listings')} className="rounded-full bg-[var(--lux-navy)] px-6 py-2 text-white">Retour</button>
    </div>
  )

  const images = listing.images.length > 0 ? listing.images : ['/images/listing-1.jpg', '/images/listing-2.jpg', '/images/listing-3.jpg', '/images/gallery-4.jpg', '/images/gallery-5.jpg']

  const nights = dates.start && dates.end
    ? Math.max(1, Math.round((new Date(dates.end).getTime() - new Date(dates.start).getTime()) / 86400000))
    : 1
  const total = listing.price_amount * (listing.price_unit === 'nuit' ? nights : 1)
  const fees = Math.round(total * 0.08)

  const handleReserve = () => {
    if (!dates.start || !dates.end) { alert('Veuillez sélectionner des dates'); return }
    navigate(`/booking/${listing.id}`, { state: { listing, dates, guests, nights, total: total + fees } })
  }

  return (
    <div className="bg-white text-slate-900">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-slate-500 hover:text-[var(--lux-navy)] transition">
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>

        {/* Gallery */}
        <div className="relative mb-8 overflow-hidden rounded-2xl">
          <div className="hidden gap-2 md:grid md:grid-cols-[2fr_1fr_1fr] md:grid-rows-2 md:h-[440px]">
            {images.slice(0, 5).map((img, i) => (
              <img key={i} src={img} alt="" onClick={() => setImgIdx(i)}
                className={`h-full w-full cursor-pointer object-cover transition hover:brightness-90 ${i === 0 ? 'row-span-2' : ''}`} />
            ))}
          </div>
          <div className="relative md:hidden h-72">
            <img src={images[imgIdx]} alt="" className="h-full w-full object-cover" />
            <button onClick={() => setImgIdx(i => Math.max(0, i - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5"><ChevronLeft className="h-5 w-5" /></button>
            <button onClick={() => setImgIdx(i => Math.min(images.length - 1, i + 1))} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5"><ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* Left */}
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="font-display text-3xl text-[var(--lux-navy)]">{listing.title}</h1>
                <p className="mt-1 flex items-center gap-1 text-slate-500"><MapPin className="h-4 w-4" /> {listing.location}</p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-[var(--lux-gold)]/10 px-3 py-1">
                <Star className="h-4 w-4 fill-[var(--lux-gold)] text-[var(--lux-gold)]" />
                <span className="text-sm font-semibold text-[var(--lux-navy)]">5.0</span>
              </div>
            </div>

            <div className="mt-2 flex gap-3 flex-wrap">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{listing.type}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{listing.rooms} chambre{listing.rooms > 1 ? 's' : ''}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{listing.surface} m²</span>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-8">
              <h2 className="font-display text-xl text-[var(--lux-navy)]">Description</h2>
              <p className="mt-3 text-slate-600 leading-relaxed">{listing.description || 'Appartement haut de gamme entièrement équipé, idéalement situé.'}</p>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-8">
              <h2 className="font-display text-xl text-[var(--lux-navy)]">Équipements</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {listing.amenities.map(a => {
                  const Icon = amenityIcons[a] || Shield
                  return (
                    <div key={a} className="flex items-center gap-2 rounded-xl border border-slate-100 p-3 text-sm text-slate-600">
                      <Icon className="h-4 w-4 text-[var(--lux-gold)] shrink-0" /> {a}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-8">
              <h2 className="font-display text-xl text-[var(--lux-navy)]">Règles de la maison</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>✓ Arrivée après 14h · Départ avant 12h</li>
                <li>✓ Non-fumeur</li>
                <li>✓ Animaux non acceptés</li>
              </ul>
            </div>
          </div>

          {/* Right — sticky booking card */}
          <div className="h-fit rounded-2xl border border-slate-100 p-6 shadow-2xl shadow-slate-200 lg:sticky lg:top-24">
            <p className="font-display text-2xl text-[var(--lux-navy)]">{listing.price_label}</p>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs uppercase text-slate-400">Arrivée</p>
                  <div className="mt-1 flex items-center gap-1">
                    <CalendarCheck className="h-4 w-4 text-[var(--lux-gold)]" />
                    <input type="date" value={dates.start} onChange={e => setDates(d => ({ ...d, start: e.target.value }))} className="w-full bg-transparent text-sm outline-none" />
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs uppercase text-slate-400">Départ</p>
                  <div className="mt-1 flex items-center gap-1">
                    <CalendarCheck className="h-4 w-4 text-[var(--lux-gold)]" />
                    <input type="date" value={dates.end} min={dates.start} onChange={e => setDates(d => ({ ...d, end: e.target.value }))} className="w-full bg-transparent text-sm outline-none" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs uppercase text-slate-400">Personnes</p>
                <div className="mt-1 flex items-center gap-2">
                  <Users className="h-4 w-4 text-[var(--lux-gold)]" />
                  <input type="number" min={1} max={20} value={guests} onChange={e => setGuests(Number(e.target.value))} className="w-full bg-transparent text-sm outline-none" />
                </div>
              </div>
            </div>

            {dates.start && dates.end && (
              <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>{listing.price_label} {listing.price_unit === 'nuit' ? `× ${nights} nuit${nights > 1 ? 's' : ''}` : ''}</span>
                  <span>{total.toLocaleString('fr-FR')} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Frais de service</span>
                  <span>{fees.toLocaleString('fr-FR')} €</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 font-semibold text-[var(--lux-navy)]">
                  <span>Total</span>
                  <span>{(total + fees).toLocaleString('fr-FR')} €</span>
                </div>
              </div>
            )}

            <button onClick={handleReserve}
              className="mt-5 w-full rounded-full bg-[var(--lux-gold)] py-3 text-sm font-semibold text-[var(--lux-navy)] shadow-lg transition hover:-translate-y-0.5">
              Réserver maintenant
            </button>
            <p className="mt-3 text-center text-xs text-slate-400">🔒 Paiement 100% sécurisé via Stripe</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

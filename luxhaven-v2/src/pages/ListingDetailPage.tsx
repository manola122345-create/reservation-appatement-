import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Wifi, ParkingCircle, Snowflake, CookingPot, Building2, Shield,
  Users, CalendarCheck, Star, ArrowLeft, ChevronLeft, ChevronRight, Send, Key, Clock } from 'lucide-react'
import Navbar from '../components/Navbar'
import { CONFIG } from '../config'
import VisitModal from '../components/VisitModal'
import Footer from '../components/Footer'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Listing } from '../types'

const TELEGRAM = CONFIG.telegram

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
    getDoc(doc(db, 'listings', id)).then(snap => {
      if (snap.exists()) setListing({ id: snap.id, ...snap.data() } as Listing)
      setLoading(false)
    })
  }, [id])

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#C9A84C] border-t-transparent" />
    </div>
  )

  if (!listing) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="text-xl text-slate-500">Appartement introuvable.</p>
      <button onClick={() => navigate('/listings')} className="rounded-full bg-[#0A1F44] px-6 py-2 text-white">Retour</button>
    </div>
  )

  const images = listing.images.length > 0
    ? listing.images
    : ['/images/listing-1.jpg', '/images/listing-2.jpg', '/images/listing-3.jpg', '/images/gallery-4.jpg', '/images/gallery-5.jpg']

  const nights = dates.start && dates.end
    ? Math.max(1, Math.round((new Date(dates.end).getTime() - new Date(dates.start).getTime()) / 86400000))
    : 1
  const total = listing.price_amount * (listing.price_unit === 'nuit' ? nights : 1)
  const fees = Math.round(total * 0.08)
  const caution = listing.price_amount * 2

  const sendTelegram = (type: 'visite' | 'reservation') => {
    const msg = encodeURIComponent(
      `🏠 *${type === 'visite' ? 'VISITE' : 'RÉSERVATION'} – LuxHaven*\n\n` +
      `🏡 *Appartement:* ${listing.title}\n` +
      `📍 *Localisation:* ${listing.location}\n` +
      `💶 *Prix:* ${listing.price_label}\n` +
      `${dates.start ? `📅 *Arrivée:* ${dates.start}\n` : ''}` +
      `${dates.end ? `📅 *Départ:* ${dates.end}\n` : ''}` +
      `👥 *Personnes:* ${guests}`
    )
    window.open(`${TELEGRAM}?text=${msg}`, '_blank')
  }

  return (
    <div className="bg-[#F2F1EF] text-slate-900">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-slate-500 hover:text-[#0A1F44] transition">
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
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">À louer</span>
                <h1 className="mt-2 font-display text-3xl text-[#0A1F44]">{listing.title}</h1>
                <p className="mt-1 flex items-center gap-1 text-slate-500"><MapPin className="h-4 w-4" /> {listing.location}</p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-[#C9A84C]/10 px-3 py-1">
                <Star className="h-4 w-4 fill-[#C9A84C] text-[#C9A84C]" />
                <span className="text-sm font-semibold text-[#0A1F44]">5.0</span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{listing.type}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{listing.rooms} chambre{listing.rooms > 1 ? 's' : ''}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{listing.surface} m²</span>
            </div>

            {/* Fiche détaillée */}
            <div className="mt-8 grid grid-cols-2 gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-5 sm:grid-cols-3">
              {[
                { icon: MapPin, label: 'Localisation', value: listing.location },
                { icon: Users, label: 'Chambres', value: `${listing.rooms} chambre${listing.rooms > 1 ? 's' : ''}` },
                { icon: Building2, label: 'Surface', value: `${listing.surface} m²` },
                { icon: Key, label: 'Caution', value: `${caution.toLocaleString('fr-FR')} € (2 mois)` },
                { icon: Clock, label: 'Durée du bail', value: '1 à 5 ans' },
                { icon: CookingPot, label: 'Cuisine', value: 'Entièrement équipée' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-2">
                  <Icon className="h-4 w-4 text-[#C9A84C] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="text-sm font-medium text-[#0A1F44]">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-slate-100 pt-8">
              <h2 className="font-display text-xl text-[#0A1F44]">Description</h2>
              <p className="mt-3 text-slate-600 leading-relaxed">{listing.description || 'Appartement haut de gamme entièrement équipé, idéalement situé.'}</p>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-8">
              <h2 className="font-display text-xl text-[#0A1F44]">Équipements</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {listing.amenities.map(a => {
                  const Icon = amenityIcons[a] || Shield
                  return (
                    <div key={a} className="flex items-center gap-2 rounded-xl border border-slate-100 p-3 text-sm text-slate-600">
                      <Icon className="h-4 w-4 text-[#C9A84C] shrink-0" /> {a}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Conditions de location */}
            <div className="mt-8 border-t border-slate-100 pt-8">
              <h2 className="font-display text-xl text-[#0A1F44]">Conditions de location</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2"><span className="text-[#C9A84C]">✓</span> Loyer : {listing.price_label}</li>
                <li className="flex items-center gap-2"><span className="text-[#C9A84C]">✓</span> Caution : {caution.toLocaleString('fr-FR')} € (2 mois de loyer)</li>
                <li className="flex items-center gap-2"><span className="text-[#C9A84C]">✓</span> Durée minimale : 1 an</li>
                <li className="flex items-center gap-2"><span className="text-[#C9A84C]">✓</span> Durée maximale : 5 ans</li>
                <li className="flex items-center gap-2"><span className="text-[#C9A84C]">✓</span> Revenu requis : 3× le loyer mensuel</li>
                <li className="flex items-center gap-2"><span className="text-slate-400">✗</span> Animaux non acceptés</li>
                <li className="flex items-center gap-2"><span className="text-slate-400">✗</span> Non-fumeur</li>
              </ul>
            </div>
          </div>

          {/* Right sticky */}
          <div className="h-fit rounded-2xl border border-slate-100 p-6 shadow-2xl shadow-slate-200 lg:sticky lg:top-24 space-y-4">
            <p className="font-display text-2xl text-[#0A1F44]">{listing.price_label}</p>
            <p className="text-sm text-slate-500">Caution : <span className="font-semibold text-[#0A1F44]">{caution.toLocaleString('fr-FR')} €</span></p>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs uppercase text-slate-400">Arrivée</p>
                <div className="mt-1 flex items-center gap-1">
                  <CalendarCheck className="h-4 w-4 text-[#C9A84C]" />
                  <input type="date" value={dates.start} onChange={e => setDates(d => ({ ...d, start: e.target.value }))} className="w-full bg-transparent text-sm outline-none" />
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs uppercase text-slate-400">Départ</p>
                <div className="mt-1 flex items-center gap-1">
                  <CalendarCheck className="h-4 w-4 text-[#C9A84C]" />
                  <input type="date" value={dates.end} min={dates.start} onChange={e => setDates(d => ({ ...d, end: e.target.value }))} className="w-full bg-transparent text-sm outline-none" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-xs uppercase text-slate-400">Personnes</p>
              <div className="mt-1 flex items-center gap-2">
                <Users className="h-4 w-4 text-[#C9A84C]" />
                <input type="number" min={1} max={20} value={guests} onChange={e => setGuests(Number(e.target.value))} className="w-full bg-transparent text-sm outline-none" />
              </div>
            </div>

            {dates.start && dates.end && (
              <div className="space-y-2 border-t border-slate-100 pt-3 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>{listing.price_label} {listing.price_unit === 'nuit' ? `× ${nights} nuit${nights > 1 ? 's' : ''}` : ''}</span>
                  <span>{total.toLocaleString('fr-FR')} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Frais de service (8%)</span>
                  <span>{fees.toLocaleString('fr-FR')} €</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 font-semibold text-[#0A1F44]">
                  <span>Total</span>
                  <span>{(total + fees).toLocaleString('fr-FR')} €</span>
                </div>
              </div>
            )}

            <button onClick={() => sendTelegram('visite')}
              className="w-full rounded-full border border-[#229ED9] py-2.5 text-sm font-semibold text-[#229ED9] flex items-center justify-center gap-2 transition hover:bg-[#229ED9] hover:text-white">
              <Send className="h-4 w-4" /> Planifier une visite
            </button>

            <button onClick={() => sendTelegram('reservation')}
              className="w-full rounded-full bg-[#C9A84C] py-3 text-sm font-semibold text-[#0A1F44] shadow-lg flex items-center justify-center gap-2 transition hover:-translate-y-0.5">
              ✅ Réserver maintenant
            </button>

            <p className="text-center text-xs text-slate-400">Via Telegram · @alicevip4</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

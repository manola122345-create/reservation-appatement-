import { useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { MapPin, Lock, CreditCard } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabase'
import { Listing } from '../types'

interface LocationState {
  listing: Listing
  dates: { start: string; end: string }
  guests: number
  nights: number
  total: number
}

export default function BookingPage() {
  const { id } = useParams()
  const { state } = useLocation() as { state: LocationState }
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!state?.listing) {
    navigate('/listings')
    return null
  }

  const { listing, dates, guests, nights, total } = state

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email) { setError('Nom et email obligatoires'); return }
    setLoading(true)
    setError('')

    // 1. Créer la réservation dans Supabase
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        listing_id: listing.id,
        listing_title: listing.title,
        client_name: form.name,
        client_email: form.email,
        client_phone: form.phone,
        date_start: dates.start,
        date_end: dates.end,
        guests,
        nights,
        amount: total,
        status: 'En attente',
        payment_status: 'Non payé',
      })
      .select()
      .single()

    if (bookingError || !booking) {
      setError('Erreur lors de la création de la réservation.')
      setLoading(false)
      return
    }

    // 2. Appeler la Supabase Edge Function pour créer la session Stripe
    const { data: stripeData, error: stripeError } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        bookingId: booking.id,
        listingTitle: listing.title,
        amount: total,
        successUrl: `${window.location.origin}/confirmation`,
        cancelUrl: `${window.location.origin}/listings/${id}`,
      },
    })

    if (stripeError || !stripeData?.url) {
      setError('Erreur paiement. Réessaie ou contacte le support.')
      setLoading(false)
      return
    }

    // 3. Redirection vers Stripe Checkout
    window.location.href = stripeData.url
  }

  return (
    <div className="min-h-screen bg-[#F2F1EF] text-slate-900">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="font-display text-3xl text-[var(--lux-navy)]">Finaliser la réservation</h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Formulaire */}
          <form onSubmit={handlePay} className="space-y-5 rounded-2xl border border-slate-200 bg-[#FAF9F7] p-6 shadow-lg shadow-slate-100">
            <h2 className="font-display text-xl text-[var(--lux-navy)]">Vos informations</h2>

            {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-widest text-slate-400">Nom complet *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--lux-gold)]"
                  placeholder="Jean Dupont" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-slate-400">Email *</label>
                <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--lux-gold)]"
                  placeholder="jean@email.com" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs uppercase tracking-widest text-slate-400">Téléphone</label>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--lux-gold)]"
                  placeholder="+229 00 00 00 00" />
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-[var(--lux-gold)]/40 bg-[var(--lux-gold)]/5 p-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CreditCard className="h-5 w-5 text-[var(--lux-gold)]" />
                <p>Paiement sécurisé via <strong>Stripe</strong>. Vous serez redirigé vers la page de paiement.</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Visa', 'Mastercard', 'PayPal', 'Apple Pay'].map(m => (
                  <span key={m} className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">{m}</span>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full rounded-full bg-[var(--lux-gold)] py-3 text-sm font-semibold text-[var(--lux-navy)] shadow-lg transition hover:-translate-y-0.5 disabled:opacity-60">
              {loading ? 'Traitement...' : `Confirmer et payer — ${total.toLocaleString('fr-FR')} €`}
            </button>
            <p className="flex items-center justify-center gap-1 text-center text-xs text-slate-400">
              <Lock className="h-3 w-3" /> Connexion sécurisée SSL 256-bit
            </p>
          </form>

          {/* Résumé */}
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-[#FAF9F7] p-6 shadow-lg shadow-slate-100 h-fit">
            <img src={listing.images[0] || '/images/listing-1.jpg'} alt={listing.title} className="h-40 w-full rounded-xl object-cover" />
            <h3 className="font-display text-lg text-[var(--lux-navy)]">{listing.title}</h3>
            <p className="flex items-center gap-1 text-sm text-slate-500"><MapPin className="h-3.5 w-3.5" /> {listing.location}</p>
            <div className="space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Arrivée</span><span className="font-medium">{new Date(dates.start).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span>Départ</span><span className="font-medium">{new Date(dates.end).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span>Personnes</span><span className="font-medium">{guests}</span>
              </div>
              {listing.price_unit === 'nuit' && (
                <div className="flex justify-between">
                  <span>{listing.price_label} × {nights} nuit{nights > 1 ? 's' : ''}</span>
                  <span>{(listing.price_amount * nights).toLocaleString('fr-FR')} €</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Frais de service (8%)</span>
                <span>{Math.round(total * 0.08 / 1.08).toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 font-semibold text-[var(--lux-navy)]">
                <span>Total</span><span>{total.toLocaleString('fr-FR')} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

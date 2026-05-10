import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, Download, Home } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabase'
import { Booking } from '../types'

export default function ConfirmationPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<Booking | null>(null)

  const bookingId = searchParams.get('booking_id')
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (!bookingId) return

    // Si Stripe a redirigé ici avec un session_id, mettre à jour le statut
    if (sessionId) {
      supabase.from('bookings')
        .update({ payment_status: 'Payé', status: 'Confirmé', stripe_session_id: sessionId })
        .eq('id', bookingId)
        .then(() => fetchBooking())
    } else {
      fetchBooking()
    }
  }, [bookingId])

  async function fetchBooking() {
    if (!bookingId) return
    const { data } = await supabase.from('bookings').select('*').eq('id', bookingId).single()
    if (data) setBooking(data as Booking)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--lux-gold)]/15">
          <CheckCircle2 className="h-10 w-10 text-[var(--lux-gold)]" />
        </div>
        <h1 className="mt-6 font-display text-3xl text-[var(--lux-navy)]">Réservation confirmée !</h1>
        <p className="mt-3 text-slate-500">Merci pour votre confiance. Un email de confirmation vous a été envoyé.</p>

        {booking && (
          <div className="mt-8 w-full rounded-2xl border border-slate-100 bg-white p-6 text-left shadow-lg">
            <p className="text-xs uppercase tracking-widest text-slate-400">Référence</p>
            <p className="font-mono text-sm font-semibold text-[var(--lux-navy)]">{booking.id.slice(0, 8).toUpperCase()}</p>

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Appartement</span><span className="font-medium">{booking.listing_title}</span>
              </div>
              <div className="flex justify-between">
                <span>Client</span><span className="font-medium">{booking.client_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Arrivée</span><span className="font-medium">{new Date(booking.date_start).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span>Départ</span><span className="font-medium">{new Date(booking.date_end).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 font-semibold text-[var(--lux-navy)]">
                <span>Montant payé</span><span>{booking.amount.toLocaleString('fr-FR')} €</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button onClick={() => window.print()}
            className="flex items-center gap-2 rounded-full border border-[var(--lux-navy)] px-5 py-2.5 text-sm font-medium text-[var(--lux-navy)] transition hover:bg-[var(--lux-navy)] hover:text-white">
            <Download className="h-4 w-4" /> Télécharger
          </button>
          <button onClick={() => navigate('/')}
            className="flex items-center gap-2 rounded-full bg-[var(--lux-gold)] px-5 py-2.5 text-sm font-semibold text-[var(--lux-navy)] transition hover:-translate-y-0.5">
            <Home className="h-4 w-4" /> Accueil
          </button>
        </div>
      </div>
      <Footer />
    </div>
  )
}

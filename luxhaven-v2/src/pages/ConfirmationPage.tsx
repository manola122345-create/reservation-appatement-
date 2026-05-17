import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, Download, Home } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function ConfirmationPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const bookingId = searchParams.get('booking_id') || ''

  return (
    <div className="min-h-screen bg-[#F2F1EF] text-slate-900">
      <Navbar />
      <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#C9A84C]/15">
          <CheckCircle2 className="h-10 w-10 text-[#C9A84C]" />
        </div>
        <h1 className="mt-6 font-display text-3xl text-[#0A1F44]">Réservation confirmée !</h1>
        <p className="mt-3 text-slate-500">
          Merci pour votre confiance. Vous allez être contacté très prochainement.
        </p>

        {bookingId && (
          <div className="mt-8 w-full rounded-2xl border border-slate-100 bg-white p-6 text-left shadow-lg">
            <p className="text-xs uppercase tracking-widest text-slate-400">Référence</p>
            <p className="font-mono text-sm font-semibold text-[#0A1F44]">
              {bookingId.slice(0, 8).toUpperCase()}
            </p>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-full border border-[#0A1F44] px-5 py-2.5 text-sm font-medium text-[#0A1F44] transition hover:bg-[#0A1F44] hover:text-white"
          >
            <Download className="h-4 w-4" /> Télécharger
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 rounded-full bg-[#C9A84C] px-5 py-2.5 text-sm font-semibold text-[#0A1F44] transition hover:-translate-y-0.5"
          >
            <Home className="h-4 w-4" /> Accueil
          </button>
        </div>
      </div>
      <Footer />
    </div>
  )
}

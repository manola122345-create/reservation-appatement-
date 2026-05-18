import { useState } from 'react'
import { X, Send, CalendarCheck, User, Phone, Mail, Users, MessageSquare } from 'lucide-react'
import { CONFIG } from '../config'

interface BookingModalProps {
  listingTitle: string
  listingLocation: string
  priceLabel: string
  onClose: () => void
}

export default function BookingModal({ listingTitle, listingLocation, priceLabel, onClose }: BookingModalProps) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', dateStart: '', dateEnd: '', guests: '1', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const msg = encodeURIComponent(
      `✅ *RÉSERVATION – LuxHaven*\n\n` +
      `🏡 *Appartement:* ${listingTitle}\n` +
      `📍 *Localisation:* ${listingLocation}\n` +
      `💶 *Prix:* ${priceLabel}\n\n` +
      `👤 *Nom:* ${form.name}\n` +
      `📞 *Téléphone:* ${form.phone}\n` +
      `📧 *Email:* ${form.email}\n` +
      `📅 *Arrivée:* ${form.dateStart}\n` +
      `📅 *Départ:* ${form.dateEnd}\n` +
      `👥 *Personnes:* ${form.guests}\n` +
      `${form.message ? `💬 *Message:* ${form.message}` : ''}`
    )
    window.open(`${CONFIG.telegram}?text=${msg}`, '_blank')
    setSent(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-display text-xl text-[#0A1F44]">Réserver cet appartement</h2>
            <p className="text-xs text-slate-500 mt-0.5">{listingTitle} · {priceLabel}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <Send className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="font-display text-xl text-[#0A1F44]">Demande envoyée !</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Votre demande de réservation a été envoyée via Telegram.<br />
              Nous vous contacterons dans les <strong>30 minutes</strong> pour confirmer.
            </p>
            <button onClick={onClose}
              className="mt-2 rounded-full bg-[#0A1F44] px-8 py-2.5 text-sm font-semibold text-white">
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
            <div>
              <label className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-slate-400">
                <User className="h-3 w-3" /> Nom complet *
              </label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#C9A84C]"
                placeholder="Jean Dupont" />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-slate-400">
                <Phone className="h-3 w-3" /> Téléphone *
              </label>
              <input required type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#C9A84C]"
                placeholder="+229 00 00 00 00" />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-slate-400">
                <Mail className="h-3 w-3" /> Email *
              </label>
              <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#C9A84C]"
                placeholder="jean@email.com" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-slate-400">
                  <CalendarCheck className="h-3 w-3" /> Arrivée *
                </label>
                <input required type="date" value={form.dateStart}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm(f => ({ ...f, dateStart: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-slate-400">
                  <CalendarCheck className="h-3 w-3" /> Départ *
                </label>
                <input required type="date" value={form.dateEnd}
                  min={form.dateStart || new Date().toISOString().split('T')[0]}
                  onChange={e => setForm(f => ({ ...f, dateEnd: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]" />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-slate-400">
                <Users className="h-3 w-3" /> Nombre de personnes
              </label>
              <select value={form.guests} onChange={e => setForm(f => ({ ...f, guests: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#C9A84C]">
                {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} personne{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-slate-400">
                <MessageSquare className="h-3 w-3" /> Message (optionnel)
              </label>
              <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                rows={2} placeholder="Questions, besoins spécifiques..."
                className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#C9A84C]" />
            </div>

            <div className="rounded-xl bg-[#229ED9]/8 border border-[#229ED9]/20 p-3 text-xs text-slate-600">
              📱 Votre demande sera envoyée directement sur <strong>Telegram</strong>. Réponse garantie en 30 min.
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 rounded-full border border-slate-200 py-2.5 text-sm text-slate-500 hover:bg-slate-50">
                Annuler
              </button>
              <button type="submit"
                className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#C9A84C] py-2.5 text-sm font-semibold text-[#0A1F44] hover:-translate-y-0.5 transition">
                <Send className="h-4 w-4" /> Envoyer la demande
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

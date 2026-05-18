import { useState } from 'react'
import { X, Send, CalendarCheck, User, Phone, Mail, MessageSquare } from 'lucide-react'
import { CONFIG } from '../config'

interface VisitModalProps {
  listingTitle: string
  listingLocation: string
  onClose: () => void
}

export default function VisitModal({ listingTitle, listingLocation, onClose }: VisitModalProps) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', date: '', notes: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const msg = encodeURIComponent(
      `🏠 *VISITE – LuxHaven*\n\n` +
      `🏡 *Appartement:* ${listingTitle}\n` +
      `📍 *Localisation:* ${listingLocation}\n` +
      `👤 *Nom:* ${form.name}\n` +
      `📞 *Téléphone:* ${form.phone}\n` +
      `📧 *Email:* ${form.email}\n` +
      `📅 *Date souhaitée:* ${form.date}\n` +
      `${form.notes ? `💬 *Notes:* ${form.notes}` : ''}`
    )
    window.open(`${CONFIG.telegram}?text=${msg}`, '_blank')
    setSent(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="font-display text-xl text-[#0A1F44]">Planifier une visite</h2>
            <p className="text-xs text-slate-500 mt-0.5">{listingTitle}</p>
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
            <p className="text-sm text-slate-500">
              Votre demande a été envoyée sur Telegram. Nous vous contacterons dans les 30 minutes.
            </p>
            <button onClick={onClose}
              className="mt-2 rounded-full bg-[#0A1F44] px-6 py-2.5 text-sm font-semibold text-white">
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
            <div className="grid grid-cols-1 gap-4">
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
              <div>
                <label className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-slate-400">
                  <CalendarCheck className="h-3 w-3" /> Date souhaitée *
                </label>
                <input required type="date" value={form.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#C9A84C]" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-slate-400">
                  <MessageSquare className="h-3 w-3" /> Remarques
                </label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2} placeholder="Horaires préférés, questions..."
                  className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#C9A84C]" />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 rounded-full border border-slate-200 py-2.5 text-sm text-slate-500 hover:bg-slate-50">
                Annuler
              </button>
              <button type="submit"
                className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#229ED9] py-2.5 text-sm font-semibold text-white hover:-translate-y-0.5 transition">
                <Send className="h-4 w-4" /> Confirmer
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

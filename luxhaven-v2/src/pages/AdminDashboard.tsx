import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Home, CalendarCheck, CreditCard, LogOut,
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight, UploadCloud, X, Eye
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Listing, Booking } from '../types'

type Tab = 'dashboard' | 'listings' | 'reservations' | 'payments'

const AMENITIES = ['WiFi', 'Parking', 'Climatisation', 'Cuisine équipée', 'Balcon', 'Sécurité 24/7', 'Piscine', 'Gym', 'Terrasse', 'Jacuzzi']
const TYPES = ['Courte durée', 'Longue durée', 'Colocation', 'Meublé'] as const

const EMPTY: typeof EMPTY_FORM = {
  title: '', location: '', type: 'Courte durée',
  price_label: '', price_amount: 0, price_unit: 'nuit',
  description: '', amenities: [], rooms: 1, surface: 30,
  available: true, badge: '', images: [],
}

const EMPTY_FORM = {
  title: '', location: '', type: 'Courte durée' as Listing['type'],
  price_label: '', price_amount: 0, price_unit: 'nuit' as 'nuit'|'mois',
  description: '', amenities: [] as string[], rooms: 1, surface: 30,
  available: true, badge: '', images: [] as string[],
}

function StatusBadge({ status }: { status: Booking['status'] }) {
  const styles: Record<string, string> = {
    'Confirmé': 'bg-emerald-100 text-emerald-700',
    'En attente': 'bg-amber-100 text-amber-600',
    'Annulé': 'bg-red-100 text-red-600',
  }
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-500'}`}>{status}</span>
}

export default function AdminDashboard() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [listings, setListings] = useState<Listing[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL as string || 'Admin'

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [{ data: l }, { data: b }] = await Promise.all([
      supabase.from('listings').select('*').order('created_at', { ascending: false }),
      supabase.from('bookings').select('*').order('created_at', { ascending: false }),
    ])
    setListings((l || []) as Listing[])
    setBookings((b || []) as Booking[])
  }

  const revenue = bookings.filter(b => b.payment_status === 'Payé').reduce((s, b) => s + b.amount, 0)
  const confirmed = bookings.filter(b => b.status === 'Confirmé').length
  const pending = bookings.filter(b => b.status === 'En attente').length
  const activeListings = listings.filter(l => l.available).length

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const path = `listings/${Date.now()}-${file.name.replace(/\s/g, '_')}`
    const { error } = await supabase.storage.from('listing-images').upload(path, file)
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('listing-images').getPublicUrl(path)
      setForm(f => ({ ...f, images: [...f.images, publicUrl] }))
    } else {
      setMsg('Erreur upload: ' + error.message)
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  function removeImage(idx: number) {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))
  }

  async function saveListing() {
    if (!form.title || !form.location || !form.price_amount) {
      setMsg('❌ Titre, localisation et prix sont obligatoires.')
      return
    }
    setSaving(true)
    const priceLabel = `${Number(form.price_amount).toLocaleString('fr-FR')}€ / ${form.price_unit}`
    const payload = { ...form, price_label: priceLabel }
    const { error } = editId
      ? await supabase.from('listings').update(payload).eq('id', editId)
      : await supabase.from('listings').insert(payload)
    if (error) setMsg('❌ Erreur: ' + error.message)
    else {
      setMsg(editId ? '✅ Annonce mise à jour !' : '✅ Annonce publiée !')
      resetForm()
      fetchAll()
    }
    setSaving(false)
  }

  function resetForm() { setForm(EMPTY_FORM); setEditId(null); setShowForm(false) }

  function startEdit(l: Listing) {
    setForm({
      title: l.title, location: l.location, type: l.type,
      price_label: l.price_label, price_amount: l.price_amount, price_unit: l.price_unit,
      description: l.description, amenities: l.amenities, rooms: l.rooms, surface: l.surface,
      available: l.available, badge: l.badge || '', images: l.images,
    })
    setEditId(l.id)
    setShowForm(true)
    setTab('listings')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deleteListing(id: string) {
    if (!confirm('Supprimer cette annonce définitivement ?')) return
    await supabase.from('listings').delete().eq('id', id)
    fetchAll()
  }

  async function toggleAvailable(l: Listing) {
    await supabase.from('listings').update({ available: !l.available }).eq('id', l.id)
    fetchAll()
  }

  async function updateBookingStatus(id: string, status: Booking['status']) {
    await supabase.from('bookings').update({ status }).eq('id', id)
    fetchAll()
  }

  function handleLogout() { signOut(); navigate('/admin/login') }

  function exportCSV() {
    const rows = bookings
      .filter(b => b.payment_status === 'Payé')
      .map(b => `${b.id},${b.client_name},${b.client_email},${b.listing_title},${b.amount},${b.created_at}`)
    const csv = ['ID,Client,Email,Appartement,Montant,Date', ...rows].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'paiements-luxhaven.csv'
    a.click()
  }

  const navItems: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'listings', label: 'Annonces', icon: Home },
    { id: 'reservations', label: 'Réservations', icon: CalendarCheck },
    { id: 'payments', label: 'Paiements', icon: CreditCard },
  ]

  const changeTab = (t: Tab) => { setTab(t); setShowForm(false); setMsg('') }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col bg-[#0A1F44] text-white lg:flex">
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C9A84C] text-[#0A1F44] font-bold text-sm">LH</div>
          <div>
            <p className="font-serif text-lg">LuxHaven</p>
            <p className="text-xs text-slate-400">Administration</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => changeTab(id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition ${tab === id ? 'bg-white/15 text-white font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <p className="mb-3 truncate px-4 text-xs text-slate-400">{adminEmail}</p>
          <button onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-slate-400 hover:bg-white/5 hover:text-white transition">
            <LogOut className="h-4 w-4" /> Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {/* Mobile topbar */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4 lg:hidden">
          <p className="font-serif text-lg text-[#0A1F44]">LuxHaven Admin</p>
          <button onClick={handleLogout}><LogOut className="h-5 w-5 text-slate-500" /></button>
        </div>

        <div className="mx-auto max-w-6xl p-6">
          {/* Mobile nav */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => changeTab(id)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm transition ${tab === id ? 'bg-[#0A1F44] text-white' : 'border border-slate-200 bg-white text-slate-600'}`}>
                <Icon className="h-3.5 w-3.5" />{label}
              </button>
            ))}
          </div>

          {/* Message */}
          {msg && (
            <div className={`mb-4 flex items-center justify-between rounded-xl p-3 text-sm ${msg.startsWith('❌') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
              <span>{msg}</span>
              <button onClick={() => setMsg('')}><X className="h-4 w-4" /></button>
            </div>
          )}

          {/* ─── DASHBOARD ─── */}
          {tab === 'dashboard' && (
            <div className="space-y-6">
              <h1 className="font-serif text-2xl text-[#0A1F44]">Tableau de bord</h1>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'Revenus totaux', value: `${revenue.toLocaleString('fr-FR')} €`, color: 'text-[#C9A84C]' },
                  { label: 'Réservations confirmées', value: confirmed, color: 'text-emerald-600' },
                  { label: 'En attente', value: pending, color: 'text-amber-500' },
                  { label: 'Biens actifs', value: activeListings, color: 'text-[#0A1F44]' },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <p className="text-sm text-slate-500">{s.label}</p>
                    <p className={`mt-2 font-serif text-3xl font-semibold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="font-serif text-xl text-[#0A1F44] mb-4">Réservations récentes</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs uppercase text-slate-400">
                        <th className="pb-3 pr-4">Client</th>
                        <th className="pb-3 pr-4">Appartement</th>
                        <th className="pb-3 pr-4">Montant</th>
                        <th className="pb-3">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 5).map(b => (
                        <tr key={b.id} className="border-t border-slate-50">
                          <td className="py-3 pr-4 font-medium text-[#0A1F44]">{b.client_name}</td>
                          <td className="pr-4 text-slate-600">{b.listing_title}</td>
                          <td className="pr-4 font-semibold">{b.amount.toLocaleString('fr-FR')} €</td>
                          <td><StatusBadge status={b.status} /></td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr><td colSpan={4} className="py-8 text-center text-slate-400">Aucune réservation.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─── LISTINGS ─── */}
          {tab === 'listings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="font-serif text-2xl text-[#0A1F44]">Annonces ({listings.length})</h1>
                <button onClick={() => { resetForm(); setShowForm(true) }}
                  className="flex items-center gap-2 rounded-full bg-[#C9A84C] px-5 py-2 text-sm font-semibold text-[#0A1F44] transition hover:-translate-y-0.5">
                  <Plus className="h-4 w-4" /> Ajouter
                </button>
              </div>

              {showForm && (
                <div className="rounded-2xl border border-[#C9A84C]/30 bg-white p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-serif text-xl text-[#0A1F44]">{editId ? 'Modifier' : 'Nouvelle'} annonce</h2>
                    <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
                  </div>

                  {/* Photos */}
                  <div className="mb-5">
                    <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Photos</p>
                    <div className="flex flex-wrap gap-3">
                      {form.images.map((img, i) => (
                        <div key={i} className="relative h-24 w-32 overflow-hidden rounded-xl">
                          <img src={img} alt="" className="h-full w-full object-cover" />
                          <button onClick={() => removeImage(i)}
                            className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => fileRef.current?.click()}
                        className="flex h-24 w-32 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-[#C9A84C] transition">
                        {uploading
                          ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#C9A84C] border-t-transparent" />
                          : <><UploadCloud className="h-6 w-6" /><span className="text-xs mt-1">Ajouter</span></>}
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      { label: 'Titre *', key: 'title', placeholder: 'Suite Royale Paris' },
                      { label: 'Localisation *', key: 'location', placeholder: 'Paris 8ème, France' },
                    ].map(({ label, key, placeholder }) => (
                      <div key={key}>
                        <label className="text-xs uppercase tracking-widest text-slate-400">{label}</label>
                        <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]"
                          placeholder={placeholder} />
                      </div>
                    ))}

                    <div>
                      <label className="text-xs uppercase tracking-widest text-slate-400">Type</label>
                      <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Listing['type'] }))}
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]">
                        {TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-widest text-slate-400">Unité de prix</label>
                      <select value={form.price_unit} onChange={e => setForm(f => ({ ...f, price_unit: e.target.value as 'nuit'|'mois' }))}
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]">
                        <option value="nuit">Par nuit</option>
                        <option value="mois">Par mois</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-widest text-slate-400">Prix (€) *</label>
                      <input type="number" min="0" value={form.price_amount}
                        onChange={e => setForm(f => ({ ...f, price_amount: Number(e.target.value) }))}
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]"
                        placeholder="1200" />
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-widest text-slate-400">Badge</label>
                      <input value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]"
                        placeholder="Nouveau, Premium..." />
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-widest text-slate-400">Chambres</label>
                      <input type="number" min="1" value={form.rooms}
                        onChange={e => setForm(f => ({ ...f, rooms: Number(e.target.value) }))}
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]" />
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-widest text-slate-400">Surface (m²)</label>
                      <input type="number" min="10" value={form.surface}
                        onChange={e => setForm(f => ({ ...f, surface: Number(e.target.value) }))}
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]" />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs uppercase tracking-widest text-slate-400">Description</label>
                      <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        rows={3} placeholder="Description de l'appartement..."
                        className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]" />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs uppercase tracking-widest text-slate-400">Équipements</label>
                      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
                        {AMENITIES.map(a => (
                          <label key={a} className="flex cursor-pointer items-center gap-1.5 text-sm text-slate-600">
                            <input type="checkbox" checked={form.amenities.includes(a)}
                              onChange={e => setForm(f => ({
                                ...f,
                                amenities: e.target.checked ? [...f.amenities, a] : f.amenities.filter(x => x !== a)
                              }))}
                              className="accent-[#C9A84C]" />
                            {a}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="sm:col-span-2 flex items-center gap-3">
                      <label className="text-xs uppercase tracking-widest text-slate-400">Disponibilité</label>
                      <button type="button" onClick={() => setForm(f => ({ ...f, available: !f.available }))}
                        className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition ${form.available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {form.available ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                        {form.available ? 'Disponible' : 'Indisponible'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button onClick={saveListing} disabled={saving}
                      className="rounded-full bg-[#0A1F44] px-6 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-60">
                      {saving ? 'Enregistrement...' : editId ? 'Mettre à jour' : "Publier l'annonce"}
                    </button>
                    <button onClick={resetForm}
                      className="rounded-full border border-slate-200 px-6 py-2.5 text-sm text-slate-500 hover:bg-slate-50">
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* Table des annonces */}
              <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-400">
                        <th className="px-4 py-3">Annonce</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Prix</th>
                        <th className="px-4 py-3">Statut</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listings.map(l => (
                        <tr key={l.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={l.images[0] || '/images/listing-1.jpg'} alt=""
                                className="h-12 w-16 rounded-lg object-cover" />
                              <span className="font-medium text-[#0A1F44]">{l.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-500">{l.type}</td>
                          <td className="px-4 py-3 font-semibold">{l.price_label}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => toggleAvailable(l)}
                              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition ${l.available ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                              {l.available ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                              {l.available ? 'Actif' : 'Inactif'}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => window.open(`/listings/${l.id}`, '_blank')}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#0A1F44]" title="Voir">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button onClick={() => startEdit(l)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-[#C9A84C]/10 hover:text-[#C9A84C]" title="Modifier">
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button onClick={() => deleteListing(l.id)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500" title="Supprimer">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {listings.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                            Aucune annonce. Commencez par en ajouter une.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─── RÉSERVATIONS ─── */}
          {tab === 'reservations' && (
            <div className="space-y-6">
              <h1 className="font-serif text-2xl text-[#0A1F44]">Réservations ({bookings.length})</h1>
              <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-400">
                        <th className="px-4 py-3">Client</th>
                        <th className="px-4 py-3">Appartement</th>
                        <th className="px-4 py-3">Dates</th>
                        <th className="px-4 py-3">Montant</th>
                        <th className="px-4 py-3">Paiement</th>
                        <th className="px-4 py-3">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(b => (
                        <tr key={b.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                          <td className="px-4 py-3">
                            <p className="font-medium text-[#0A1F44]">{b.client_name}</p>
                            <p className="text-xs text-slate-400">{b.client_email}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{b.listing_title}</td>
                          <td className="px-4 py-3 text-xs text-slate-500">{b.date_start} → {b.date_end}</td>
                          <td className="px-4 py-3 font-semibold">{b.amount.toLocaleString('fr-FR')} €</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${b.payment_status === 'Payé' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                              {b.payment_status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <select value={b.status}
                              onChange={e => updateBookingStatus(b.id, e.target.value as Booking['status'])}
                              className="rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-[#C9A84C]">
                              <option>En attente</option>
                              <option>Confirmé</option>
                              <option>Annulé</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Aucune réservation.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─── PAIEMENTS ─── */}
          {tab === 'payments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="font-serif text-2xl text-[#0A1F44]">Paiements</h1>
                <button onClick={exportCSV}
                  className="rounded-full border border-[#0A1F44] px-4 py-1.5 text-sm text-[#0A1F44] hover:bg-[#0A1F44] hover:text-white transition">
                  Exporter CSV
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'Total encaissé', value: `${revenue.toLocaleString('fr-FR')} €`, color: 'text-[#C9A84C]' },
                  { label: 'Transactions payées', value: bookings.filter(b => b.payment_status === 'Payé').length, color: 'text-emerald-600' },
                  { label: 'Non payés', value: bookings.filter(b => b.payment_status === 'Non payé').length, color: 'text-amber-500' },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">{s.label}</p>
                    <p className={`mt-1 font-serif text-2xl font-semibold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-400">
                        <th className="px-4 py-3">Client</th>
                        <th className="px-4 py-3">Appartement</th>
                        <th className="px-4 py-3">Montant</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(b => (
                        <tr key={b.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium text-[#0A1F44]">{b.client_name}</td>
                          <td className="px-4 py-3 text-slate-600">{b.listing_title}</td>
                          <td className="px-4 py-3 font-semibold">{b.amount.toLocaleString('fr-FR')} €</td>
                          <td className="px-4 py-3 text-slate-500 text-xs">{new Date(b.created_at).toLocaleDateString('fr-FR')}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${b.payment_status === 'Payé' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                              {b.payment_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400">Aucune transaction.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

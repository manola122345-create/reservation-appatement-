import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, CreditCard, Headset, Star, ArrowUpRight, MapPin, Send, Home, BarChart3, Users } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Listing } from '../types'

const TELEGRAM = 'https://t.me/alicevip4'

const stats = [
  { value: '150+', label: 'Biens loués', en: 'Properties rented' },
  { value: '5+', label: "Ans d'expérience", en: 'Years of experience' },
  { value: '98%', label: 'Clients satisfaits', en: 'Satisfied clients' },
]

const categories = [
  { title: 'Longue durée', en: 'Long-term', desc: 'Contrats flexibles, services premium inclus.', type: 'Longue durée' },
  { title: 'Courte durée', en: 'Short-term', desc: 'Séjours raffinés pour vos escapades.', type: 'Courte durée' },
  { title: 'Colocation', en: 'Co-living', desc: 'Vivez en communauté dans un cadre luxueux.', type: 'Colocation' },
  { title: 'Meublé', en: 'Furnished', desc: 'Appartements élégants, prêts à vivre.', type: 'Meublé' },
]

const team = [
  { name: 'Alice Vip', role: 'Directrice & Agent Senior', roleEn: 'Director & Senior Agent', desc: 'Spécialisée dans les biens premium et l\'accompagnement personnalisé. Plus de 5 ans d\'expérience.', langs: 'FR · EN · NL', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600' },
  { name: 'Marc Laurent', role: 'Spécialiste Location', roleEn: 'Rental Specialist', desc: 'Expert du marché locatif haut de gamme avec une passion pour trouver le bien idéal.', langs: 'FR · EN', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600' },
  { name: 'Sophie Martin', role: 'Conseillère Clientèle', roleEn: 'Client Advisor', desc: 'Spécialisée dans l\'accompagnement des clients internationaux et expatriés.', langs: 'FR · EN', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600' },
]

const services = [
  { icon: Home, title: 'Location & Gestion', titleEn: 'Rental & Management', desc: 'Prise en charge complète de la mise en location de votre bien. De la sélection des locataires aux contrats.' },
  { icon: Users, title: 'Accompagnement personnalisé', titleEn: 'Personal Guidance', desc: 'Nous vous guidons à chaque étape — de la première visite à la signature du bail.' },
  { icon: BarChart3, title: 'Estimation gratuite', titleEn: 'Free Valuation', desc: 'Une estimation précise et professionnelle de votre bien, basée sur les données du marché.' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [featured, setFeatured] = useState<Listing[]>([])
  const [lang, setLang] = useState<'fr'|'en'>('fr')
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', interest: '', message: '' })

  useEffect(() => {
    getDocs(query(collection(db, 'listings'), where('available','==',true), limit(3)))
      .then(snap => setFeatured(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Listing[]))
      .catch(() => {})
  }, [])

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault()
    const msg = encodeURIComponent(
      `🏠 *CONTACT – LuxHaven*\n\n` +
      `👤 *Nom:* ${contactForm.name}\n` +
      `📧 *Email:* ${contactForm.email}\n` +
      `${contactForm.phone ? `📞 *Téléphone:* ${contactForm.phone}\n` : ''}` +
      `${contactForm.interest ? `🔍 *Intérêt:* ${contactForm.interest}\n` : ''}` +
      `${contactForm.message ? `💬 *Message:* ${contactForm.message}` : ''}`
    )
    window.open(`https://t.me/alicevip4?text=${msg}`, '_blank')
  }

  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  return (
    <div className="bg-[#F2F1EF] text-slate-900">
      <Navbar lang={lang} setLang={setLang} />

      {/* HERO */}
      <section className="relative h-[680px] w-full">
        <img src="/images/hero.jpg" alt="Appartement luxueux" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(10,31,68,0.93)] via-[rgba(10,31,68,0.65)] to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-6">
            <div className="max-w-2xl space-y-6">
              <p className="text-sm uppercase tracking-[0.4em] text-[#C9A84C]">
                {t('Expérience signature', 'Signature Experience')}
              </p>
              <h1 className="font-display text-4xl text-white md:text-5xl">
                {t('Votre logement idéal commence ici', 'Your ideal home starts here')}
              </h1>
              <p className="text-lg text-slate-200">
                {t(
                  'LuxHaven réunit les plus beaux appartements haut de gamme avec un accompagnement personnalisé à chaque étape.',
                  'LuxHaven brings together the finest luxury apartments with personalized guidance at every step.'
                )}
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <button onClick={() => navigate('/listings')}
                  className="rounded-full bg-[#C9A84C] px-8 py-3 text-sm font-semibold text-[#0A1F44] shadow-lg transition hover:-translate-y-0.5">
                  {t('Voir nos appartements', 'View our apartments')}
                </button>
                <a href="#contact"
                  className="rounded-full border border-white/50 px-8 py-3 text-sm font-medium text-white transition hover:bg-white/10">
                  {t('Nous contacter', 'Contact us')}
                </a>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 pt-4">
                {stats.map(s => (
                  <div key={s.value}>
                    <p className="font-display text-3xl font-bold text-[#C9A84C]">{s.value}</p>
                    <p className="text-xs text-slate-300 mt-0.5">{t(s.label, s.en)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* À PROPOS */}
      <section id="about" className="bg-[#F2F1EF] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#C9A84C]">{t('À propos', 'About us')}</p>
              <h2 className="mt-3 font-display text-3xl text-[#0A1F44]">
                {t("L'expertise qui fait la différence", 'Expertise that makes the difference')}
              </h2>
              <p className="mt-5 text-slate-600 leading-relaxed">
                {t(
                  'LuxHaven est votre partenaire de confiance pour la location d\'appartements haut de gamme. Avec plusieurs années d\'expérience et une connaissance approfondie du marché, nous accompagnons locataires et propriétaires avec professionnalisme et dévouement.',
                  'LuxHaven is your trusted partner for luxury apartment rentals. With years of experience and deep market knowledge, we guide tenants and landlords with professionalism and dedication.'
                )}
              </p>
              <p className="mt-4 text-slate-600 leading-relaxed">
                {t(
                  'Notre équipe de spécialistes est disponible à chaque étape — de la première visite jusqu\'à la signature du bail.',
                  'Our team of specialists is available at every step — from the first viewing to the signing of the lease.'
                )}
              </p>
              <a href="#contact"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0A1F44] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5">
                {t('Prendre rendez-vous', 'Book an appointment')}
              </a>
            </div>
            <div className="relative h-80 lg:h-[420px] overflow-hidden rounded-2xl shadow-2xl">
              <img src="/images/listing-2.jpg" alt="LuxHaven" className="h-full w-full object-cover" />
              <div className="absolute bottom-4 left-4 rounded-xl bg-[#C9A84C] px-4 py-2">
                <p className="font-display text-2xl text-[#0A1F44]">5+</p>
                <p className="text-xs text-[#0A1F44]/80">{t('Ans d\'expérience', 'Years active')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATÉGORIES */}
      <section className="bg-[#ECEAE6] py-16">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-sm uppercase tracking-[0.3em] text-[#C9A84C]">{t('Nos catégories', 'Our categories')}</p>
          <h2 className="mt-3 font-display text-3xl text-[#0A1F44]">{t('Que recherchez-vous ?', 'What are you looking for?')}</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map(c => (
              <button key={c.title} onClick={() => navigate(`/listings?type=${encodeURIComponent(c.type)}`)}
                className="rounded-xl border border-slate-100 bg-white p-6 text-left shadow-lg shadow-slate-100 transition hover:-translate-y-1 hover:shadow-xl">
                <h3 className="font-display text-xl text-[#0A1F44]">{t(c.title, c.en)}</h3>
                <p className="mt-2 text-sm text-slate-500">{c.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* APPARTEMENTS EN VEDETTE */}
      <section className="bg-[#F2F1EF] py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#C9A84C]">{t('Notre offre', 'Our offer')}</p>
              <h2 className="mt-2 font-display text-3xl text-[#0A1F44]">{t('Appartements disponibles', 'Available apartments')}</h2>
            </div>
            <button onClick={() => navigate('/listings')} className="flex items-center gap-1 text-sm font-medium text-[#0A1F44] hover:gap-2 transition-all">
              {t('Voir tout', 'View all')} <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {featured.length === 0 ? (
              <p className="text-slate-400 col-span-3 text-center py-10">{t('Aucun appartement disponible.', 'No apartments available.')}</p>
            ) : featured.map(l => (
              <div key={l.id} className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg shadow-slate-100">
                <div className="relative h-56 overflow-hidden">
                  <img src={l.images[0] || '/images/listing-1.jpg'} alt={l.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  {l.badge && <span className="absolute left-3 top-3 rounded-full bg-[#C9A84C] px-3 py-1 text-xs font-semibold text-[#0A1F44]">{l.badge}</span>}
                  <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-emerald-700">{t('À louer', 'For rent')}</span>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg text-[#0A1F44]">{l.title}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
                      <Star className="h-3.5 w-3.5 fill-[#C9A84C] text-[#C9A84C]" /> 5.0
                    </div>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                    <MapPin className="h-3.5 w-3.5" /> {l.location}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{l.rooms} {t('ch.', 'br.')} · {l.surface} m²</p>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="font-semibold text-[#0A1F44]">{l.price_label}</p>
                    <div className="flex gap-2">
                      <a href={TELEGRAM} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 rounded-full bg-[#229ED9] px-3 py-1.5 text-xs font-semibold text-white transition hover:-translate-y-0.5">
                        <Send className="h-3 w-3" /> Telegram
                      </a>
                      <button onClick={() => navigate(`/listings/${l.id}`)}
                        className="rounded-full bg-[#0A1F44] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#C9A84C] hover:text-[#0A1F44]">
                        {t('Voir', 'View')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ÉQUIPE */}
      <section id="team" className="bg-[#ECEAE6] py-16">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-sm uppercase tracking-[0.3em] text-[#C9A84C]">{t('Notre équipe', 'Our team')}</p>
          <h2 className="mt-3 font-display text-3xl text-[#0A1F44]">{t('Des experts à votre service', 'Experts at your service')}</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map(m => (
              <div key={m.name} className="rounded-2xl border border-slate-200 bg-[#FAF9F7] p-6 shadow-lg shadow-slate-100">
                <img src={m.img} alt={m.name} className="h-20 w-20 rounded-full object-cover" />
                <h3 className="mt-4 font-display text-lg text-[#0A1F44]">{m.name}</h3>
                <p className="text-sm font-medium text-[#C9A84C]">{t(m.role, m.roleEn)}</p>
                <p className="mt-2 text-sm text-slate-500">{m.desc}</p>
                <p className="mt-2 text-xs text-slate-400">🌍 {m.langs}</p>
                <a href={TELEGRAM} target="_blank" rel="noreferrer"
                  className="mt-4 flex items-center gap-1.5 text-sm font-medium text-[#229ED9] hover:underline">
                  <Send className="h-3.5 w-3.5" /> {t('Contacter →', 'Contact →')}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="bg-[#F2F1EF] py-16">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-sm uppercase tracking-[0.3em] text-[#C9A84C]">{t('Nos services', 'Our services')}</p>
          <h2 className="mt-3 font-display text-3xl text-[#0A1F44]">{t('Ce que nous proposons', 'What we offer')}</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {services.map(({ icon: Icon, title, titleEn, desc }) => (
              <div key={title} className="rounded-2xl border border-slate-100 p-8 shadow-lg shadow-slate-100 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#C9A84C]/10">
                  <Icon className="h-7 w-7 text-[#C9A84C]" />
                </div>
                <h3 className="mt-4 font-display text-xl text-[#0A1F44]">{t(title, titleEn)}</h3>
                <p className="mt-2 text-sm text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONFIANCE */}
      <section className="bg-[#ECEAE6] py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, title: t('Biens vérifiés', 'Verified properties'), desc: t('Tous nos appartements sont contrôlés et certifiés.', 'All our apartments are checked and certified.') },
              { icon: CreditCard, title: t('Paiement sécurisé', 'Secure payment'), desc: t('Transactions sécurisées via Stripe.', 'Secure transactions via Stripe.') },
              { icon: Headset, title: t('Support 24/7', 'Support 24/7'), desc: t('Disponibles à tout moment pour vous aider.', 'Available at any time to help you.') },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm">
                <Icon className="mx-auto h-8 w-8 text-[#C9A84C]" />
                <h3 className="mt-3 font-display text-lg text-[#0A1F44]">{title}</h3>
                <p className="mt-1 text-sm text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="bg-[#F2F1EF] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#C9A84C]">{t('Contact', 'Contact')}</p>
              <h2 className="mt-3 font-display text-3xl text-[#0A1F44]">{t('Nous sommes là pour vous', 'We are here for you')}</h2>
              <p className="mt-4 text-slate-500">{t('Une question sur nos biens ? Vous souhaitez planifier une visite ? Contactez-nous directement.', 'A question about our properties? Want to schedule a visit? Contact us directly.')}</p>

              <div className="mt-8 space-y-5">
                <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#229ED9]/10">
                    <Send className="h-5 w-5 text-[#229ED9]" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400">Telegram</p>
                    <a href={TELEGRAM} target="_blank" rel="noreferrer" className="font-medium text-[#0A1F44] hover:text-[#229ED9]">@alicevip4</a>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C9A84C]/10">
                    <Headset className="h-5 w-5 text-[#C9A84C]" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400">Email</p>
                    <a href="mailto:contact@luxhaven.com" className="font-medium text-[#0A1F44]">contact@luxhaven.com</a>
                  </div>
                </div>
              </div>

              <a href={TELEGRAM} target="_blank" rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#229ED9] px-6 py-3 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5">
                <Send className="h-4 w-4" />
                {t('Écrire sur Telegram', 'Message on Telegram')}
              </a>
            </div>

            <form onSubmit={handleContact} className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-8 shadow-lg">
              <h3 className="font-display text-xl text-[#0A1F44]">{t('Envoyer un message', 'Send a message')}</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-widest text-slate-400">{t('Nom complet', 'Full name')} *</label>
                  <input required value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#C9A84C]"
                    placeholder={t('Jean Dupont', 'John Doe')} />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-slate-400">Email *</label>
                  <input required type="email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#C9A84C]"
                    placeholder="jean@email.com" />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-slate-400">{t('Téléphone', 'Phone')}</label>
                <input value={contactForm.phone} onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#C9A84C]"
                  placeholder="+229 00 00 00 00" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-slate-400">{t('Intérêt', 'Interest')}</label>
                <select value={contactForm.interest} onChange={e => setContactForm(f => ({ ...f, interest: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#C9A84C]">
                  <option value="">{t('Sélectionner...', 'Select...')}</option>
                  <option>{t('Louer un appartement', 'Rent an apartment')}</option>
                  <option>{t('Planifier une visite', 'Schedule a visit')}</option>
                  <option>{t('Mettre mon bien en location', 'List my property')}</option>
                  <option>{t('Autre', 'Other')}</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-slate-400">{t('Message', 'Message')}</label>
                <textarea value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                  rows={4} className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#C9A84C]"
                  placeholder={t('Votre message...', 'Your message...')} />
              </div>
              <button type="submit"
                className="w-full rounded-full bg-[#229ED9] py-3 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 flex items-center justify-center gap-2">
                <Send className="h-4 w-4" />
                {t('Envoyer via Telegram', 'Send via Telegram')}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer lang={lang} />
    </div>
  )
}

export interface Listing {
  id: string
  title: string
  location: string
  type: 'Courte durée' | 'Longue durée' | 'Colocation' | 'Meublé'
  price_label: string
  price_amount: number
  price_unit: 'nuit' | 'mois'
  description: string
  images: string[]
  amenities: string[]
  rooms: number
  surface: number
  available: boolean
  badge?: string
  created_at: string
}

export interface Booking {
  id: string
  listing_id: string
  listing_title: string
  client_name: string
  client_email: string
  client_phone?: string
  date_start: string
  date_end: string
  guests: number
  nights: number
  amount: number
  status: 'En attente' | 'Confirmé' | 'Annulé'
  payment_status: 'Non payé' | 'Payé' | 'Remboursé'
  stripe_session_id?: string
  created_at: string
}

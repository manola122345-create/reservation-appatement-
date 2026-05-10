-- ============================================
-- LUXHAVEN — Base de données Supabase
-- ============================================
-- Colle ce SQL dans : Supabase > SQL Editor > New query
-- ============================================

-- TABLE : listings (annonces)
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text not null,
  type text not null check (type in ('Courte durée','Longue durée','Colocation','Meublé')),
  price_label text not null,
  price_amount numeric not null default 0,
  price_unit text not null check (price_unit in ('nuit','mois')),
  description text default '',
  images text[] default '{}',
  amenities text[] default '{}',
  rooms integer not null default 1,
  surface integer not null default 30,
  available boolean not null default true,
  badge text default '',
  created_at timestamptz default now()
);

-- TABLE : bookings (réservations)
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete set null,
  listing_title text not null,
  client_name text not null,
  client_email text not null,
  client_phone text default '',
  date_start date not null,
  date_end date not null,
  guests integer not null default 1,
  nights integer not null default 1,
  amount numeric not null default 0,
  status text not null default 'En attente' check (status in ('En attente','Confirmé','Annulé')),
  payment_status text not null default 'Non payé' check (payment_status in ('Non payé','Payé','Remboursé')),
  stripe_session_id text default '',
  created_at timestamptz default now()
);

-- SÉCURITÉ : Row Level Security (RLS)
alter table public.listings enable row level security;
alter table public.bookings enable row level security;

-- Lecture publique des annonces disponibles
create policy "Lecture publique annonces"
  on public.listings for select
  using (available = true);

-- Admin voit tout (authentifié)
create policy "Admin lit toutes les annonces"
  on public.listings for all
  using (auth.role() = 'authenticated');

create policy "Admin gère les réservations"
  on public.bookings for all
  using (auth.role() = 'authenticated');

-- Les clients peuvent créer une réservation
create policy "Client crée une réservation"
  on public.bookings for insert
  with check (true);

-- STORAGE : bucket pour les images
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict do nothing;

create policy "Images publiques"
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "Admin upload images"
  on storage.objects for insert
  using (bucket_id = 'listing-images' and auth.role() = 'authenticated');

create policy "Admin supprime images"
  on storage.objects for delete
  using (bucket_id = 'listing-images' and auth.role() = 'authenticated');

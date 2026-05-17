-- ============================================
-- LUXHAVEN — Base de données Supabase
-- Colle ce SQL dans : Supabase > SQL Editor > New query > Run
-- ============================================

-- Supprimer les tables si elles existent (pour repartir propre)
drop table if exists public.bookings;
drop table if exists public.listings;

-- TABLE : listings
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text not null,
  type text not null default 'Courte durée',
  price_label text not null default '',
  price_amount numeric not null default 0,
  price_unit text not null default 'nuit',
  description text default '',
  images text[] default '{}',
  amenities text[] default '{}',
  rooms integer not null default 1,
  surface integer not null default 30,
  available boolean not null default true,
  badge text default '',
  created_at timestamptz default now()
);

-- TABLE : bookings
create table public.bookings (
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
  status text not null default 'En attente',
  payment_status text not null default 'Non payé',
  stripe_session_id text default '',
  created_at timestamptz default now()
);

-- DÉSACTIVER RLS complètement (plus simple pour admin solo)
alter table public.listings disable row level security;
alter table public.bookings disable row level security;

-- Vérification : doit afficher les 2 tables
select table_name from information_schema.tables
where table_schema = 'public'
and table_name in ('listings', 'bookings');

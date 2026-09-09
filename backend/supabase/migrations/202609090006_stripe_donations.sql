create type public.donation_frequency as enum ('once', 'monthly');
create type public.donation_status as enum ('pending', 'active', 'succeeded', 'failed', 'canceled');
create type public.donation_payment_status as enum ('succeeded', 'failed', 'refunded');

create table public.donations (
  id uuid primary key default gen_random_uuid(),
  donor_first_name text not null check (char_length(btrim(donor_first_name)) between 1 and 80),
  donor_last_name text not null check (char_length(btrim(donor_last_name)) between 1 and 80),
  donor_email text not null check (char_length(donor_email) between 3 and 160),
  frequency public.donation_frequency not null,
  amount_cents integer not null check (amount_cents between 100 and 1000000),
  currency char(3) not null default 'EUR' check (currency = upper(currency)),
  status public.donation_status not null default 'pending',
  stripe_checkout_session_id text unique,
  stripe_customer_id text,
  stripe_payment_intent_id text unique,
  stripe_subscription_id text unique,
  consent_at timestamptz not null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.donation_payments (
  id uuid primary key default gen_random_uuid(),
  donation_id uuid not null references public.donations(id) on delete restrict,
  provider_payment_id text not null unique,
  amount_cents integer not null check (amount_cents >= 0),
  currency char(3) not null check (currency = upper(currency)),
  status public.donation_payment_status not null,
  receipt_url text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger donations_set_updated_at before update on public.donations
for each row execute function public.set_updated_at();
create trigger donation_payments_set_updated_at before update on public.donation_payments
for each row execute function public.set_updated_at();

create index donations_email_created_idx on public.donations(donor_email, created_at desc);
create index donation_payments_donation_idx on public.donation_payments(donation_id, created_at desc);

alter table public.donations enable row level security;
alter table public.donation_payments enable row level security;

revoke all on public.donations, public.donation_payments from anon, authenticated;

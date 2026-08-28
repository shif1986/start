do $$
begin
  if not exists (
    select 1 from pg_type type
    join pg_namespace namespace on namespace.oid = type.typnamespace
    where namespace.nspname = 'public' and type.typname = 'subscription_interval'
  ) then
    create type public.subscription_interval as enum ('monthly', 'yearly');
  end if;

  if not exists (
    select 1 from pg_type type
    join pg_namespace namespace on namespace.oid = type.typnamespace
    where namespace.nspname = 'public' and type.typname = 'subscription_status'
  ) then
    create type public.subscription_status as enum ('incomplete', 'trialing', 'active', 'past_due', 'canceled', 'unpaid');
  end if;
end;
$$;

create table if not exists public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z0-9_]+$'),
  name text not null check (char_length(name) between 2 and 80),
  interval public.subscription_interval not null,
  price_cents integer not null check (price_cents > 0),
  currency char(3) not null default 'EUR' check (currency = upper(currency)),
  is_active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.subscription_plans(id),
  status public.subscription_status not null default 'incomplete',
  provider text not null check (provider in ('stripe')),
  provider_customer_id text,
  provider_subscription_id text unique,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (current_period_end is null or current_period_start is null or current_period_end > current_period_start)
);

create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
create index if not exists subscriptions_provider_customer_id_idx on public.subscriptions(provider_customer_id)
where provider_customer_id is not null;
create unique index if not exists subscriptions_one_current_per_user_idx
on public.subscriptions(user_id)
where status in ('incomplete', 'trialing', 'active', 'past_due');

drop trigger if exists subscription_plans_set_updated_at on public.subscription_plans;
create trigger subscription_plans_set_updated_at before update on public.subscription_plans
for each row execute function public.set_updated_at();
drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at before update on public.subscriptions
for each row execute function public.set_updated_at();

alter table public.subscription_plans enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "subscription_plans_public_read" on public.subscription_plans;
create policy "subscription_plans_public_read" on public.subscription_plans for select
using (is_active or public.is_admin());
drop policy if exists "subscription_plans_admin_all" on public.subscription_plans;
create policy "subscription_plans_admin_all" on public.subscription_plans for all to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "subscriptions_owner_read" on public.subscriptions;
create policy "subscriptions_owner_read" on public.subscriptions for select to authenticated
using (user_id = auth.uid());
drop policy if exists "subscriptions_admin_all" on public.subscriptions;
create policy "subscriptions_admin_all" on public.subscriptions for all to authenticated
using (public.is_admin()) with check (public.is_admin());

grant select on public.subscription_plans to anon, authenticated;
grant select on public.subscriptions to authenticated;
grant insert, update, delete on public.subscription_plans, public.subscriptions to authenticated;

insert into public.subscription_plans (id, code, name, interval, price_cents, currency, position)
values
  ('50000000-0000-4000-8000-000000000001', 'pro_monthly', 'Pro mensuel', 'monthly', 700, 'EUR', 10),
  ('50000000-0000-4000-8000-000000000002', 'pro_yearly', 'Pro annuel', 'yearly', 8400, 'EUR', 20)
on conflict (code) do update set
  name = excluded.name,
  interval = excluded.interval,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  is_active = true,
  position = excluded.position;

create or replace function public.has_active_professional_subscription()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles profile
    join public.subscriptions subscription on subscription.user_id = profile.id
    where profile.id = auth.uid()
      and profile.account_type = 'professional'
      and subscription.status in ('trialing', 'active')
      and subscription.current_period_end > now()
  );
$$;

revoke all on function public.has_active_professional_subscription() from public;
grant execute on function public.has_active_professional_subscription() to authenticated;

drop policy if exists "listings_owner_insert" on public.listings;
create policy "listings_owner_insert" on public.listings for insert to authenticated
with check (
  owner_id = auth.uid()
  and public.has_active_professional_subscription()
  and status in ('draft', 'pending')
  and not is_featured
  and published_at is null
  and rejection_reason is null
);

create or replace function public.protect_listing_moderation_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.owner_id <> old.owner_id
    or new.is_featured <> old.is_featured
    or new.published_at is distinct from old.published_at
    or new.rejection_reason is distinct from old.rejection_reason then
    raise exception 'Ces champs sont réservés à la modération';
  end if;

  if new.status = old.status then
    return new;
  end if;

  if new.status = 'pending' and not public.has_active_professional_subscription() then
    raise exception 'Un abonnement professionnel actif est requis';
  end if;

  if not (
    (old.status = 'draft' and new.status in ('pending', 'archived'))
    or (old.status = 'pending' and new.status in ('draft', 'archived'))
    or (old.status = 'rejected' and new.status in ('draft', 'archived'))
    or (old.status = 'published' and new.status in ('sold', 'archived'))
    or (old.status = 'sold' and new.status = 'archived')
    or (old.status = 'archived' and new.status = 'draft')
  ) then
    raise exception 'Transition de statut non autorisée';
  end if;

  return new;
end;
$$;

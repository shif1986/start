create extension if not exists pgcrypto with schema extensions;
create extension if not exists unaccent with schema extensions;

create type public.user_role as enum ('user', 'moderator', 'admin');
create type public.listing_status as enum (
  'draft', 'pending', 'published', 'rejected', 'sold', 'archived'
);
create type public.field_type as enum (
  'text', 'textarea', 'number', 'select', 'multi_select', 'checkbox',
  'boolean', 'date', 'price', 'url'
);
create type public.report_reason as enum (
  'scam', 'forbidden_content', 'spam', 'wrong_category', 'counterfeit',
  'already_sold', 'other'
);
create type public.report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9][a-z0-9_-]{2,29}$'),
  display_name text not null check (char_length(display_name) between 2 and 80),
  avatar_url text,
  bio text check (bio is null or char_length(bio) <= 1000),
  city text,
  phone text,
  role public.user_role not null default 'user',
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete restrict,
  name text not null check (char_length(name) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  icon text,
  description text check (description is null or char_length(description) <= 500),
  position integer not null default 0 check (position >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint category_not_own_parent check (parent_id is null or parent_id <> id)
);

create table public.category_fields (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  key text not null check (key ~ '^[a-z][a-z0-9_]{1,49}$'),
  field_type public.field_type not null,
  placeholder text,
  help_text text,
  is_required boolean not null default false,
  is_filterable boolean not null default false,
  position integer not null default 0 check (position >= 0),
  validation jsonb not null default '{}'::jsonb check (jsonb_typeof(validation) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, key)
);

create table public.category_field_options (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references public.category_fields(id) on delete cascade,
  label text not null check (char_length(label) between 1 and 80),
  value text not null check (char_length(value) between 1 and 80),
  position integer not null default 0 check (position >= 0),
  unique (field_id, value)
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  title text not null check (char_length(title) between 5 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text not null check (char_length(description) between 20 and 10000),
  price numeric(12,2) check (price is null or price >= 0),
  currency char(3) not null default 'EUR' check (currency = upper(currency)),
  condition text check (condition is null or char_length(condition) <= 50),
  country_code char(2) not null default 'FR' check (country_code = upper(country_code)),
  city text not null check (char_length(city) between 2 and 100),
  postal_code text check (postal_code is null or char_length(postal_code) <= 12),
  latitude numeric(9,6) check (latitude is null or latitude between -90 and 90),
  longitude numeric(9,6) check (longitude is null or longitude between -180 and 180),
  status public.listing_status not null default 'draft',
  rejection_reason text,
  is_featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_listing_has_date check (status <> 'published' or published_at is not null)
);

create table public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  storage_path text not null unique,
  alt_text text check (alt_text is null or char_length(alt_text) <= 160),
  position integer not null default 0 check (position between 0 and 19),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  created_at timestamptz not null default now(),
  unique (listing_id, position)
);

create table public.listing_field_values (
  listing_id uuid not null references public.listings(id) on delete cascade,
  field_id uuid not null references public.category_fields(id) on delete cascade,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (listing_id, field_id)
);

create table public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  reason public.report_reason not null,
  details text check (details is null or char_length(details) <= 1000),
  status public.report_status not null default 'open',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (reporter_id, listing_id)
);

create index categories_parent_position_idx on public.categories(parent_id, position);
create index category_fields_category_position_idx on public.category_fields(category_id, position);
create index listings_public_catalog_idx on public.listings(status, is_featured desc, published_at desc);
create index listings_owner_created_idx on public.listings(owner_id, created_at desc);
create index listings_category_price_idx on public.listings(category_id, price) where status = 'published';
create index listings_city_lower_idx on public.listings(lower(city)) where status = 'published';
create index listing_images_listing_position_idx on public.listing_images(listing_id, position);
create index reports_status_created_idx on public.reports(status, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger categories_set_updated_at before update on public.categories
for each row execute function public.set_updated_at();
create trigger category_fields_set_updated_at before update on public.category_fields
for each row execute function public.set_updated_at();
create trigger listings_set_updated_at before update on public.listings
for each row execute function public.set_updated_at();
create trigger listing_field_values_set_updated_at before update on public.listing_field_values
for each row execute function public.set_updated_at();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  safe_username text;
begin
  safe_username := lower(regexp_replace(
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1), 'user'),
    '[^a-zA-Z0-9_-]', '', 'g'
  ));
  safe_username := left(coalesce(nullif(safe_username, ''), 'user'), 21) || '-' || left(new.id::text, 8);

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    safe_username,
    left(coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1), 'Utilisateur'), 80)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('moderator', 'admin')
  );
$$;

create or replace function public.is_listing_owner(target_listing_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.listings
    where id = target_listing_id and owner_id = auth.uid()
  );
$$;

create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() and (new.role <> old.role or new.is_verified <> old.is_verified) then
    raise exception 'Seul un administrateur peut modifier le rôle ou la vérification';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_privileges
before update on public.profiles
for each row execute function public.protect_profile_privileges();

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
    or new.rejection_reason is distinct from old.rejection_reason
    or new.status in ('published', 'rejected') then
    raise exception 'Ces champs sont réservés à la modération';
  end if;
  return new;
end;
$$;

create trigger listings_protect_moderation_fields
before update on public.listings
for each row execute function public.protect_listing_moderation_fields();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.category_fields enable row level security;
alter table public.category_field_options enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.listing_field_values enable row level security;
alter table public.favorites enable row level security;
alter table public.reports enable row level security;

create policy "profiles_public_read" on public.profiles for select using (true);
create policy "profiles_owner_update" on public.profiles for update
using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_admin_update" on public.profiles for update
using (public.is_admin()) with check (public.is_admin());

create policy "categories_public_read" on public.categories for select using (is_active or public.is_admin());
create policy "categories_admin_all" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "category_fields_public_read" on public.category_fields for select using (true);
create policy "category_fields_admin_all" on public.category_fields for all using (public.is_admin()) with check (public.is_admin());
create policy "category_options_public_read" on public.category_field_options for select using (true);
create policy "category_options_admin_all" on public.category_field_options for all using (public.is_admin()) with check (public.is_admin());

create policy "listings_public_or_owner_read" on public.listings for select
using (status = 'published' or owner_id = auth.uid() or public.is_admin());
create policy "listings_owner_insert" on public.listings for insert
with check (
  owner_id = auth.uid()
  and status in ('draft', 'pending')
  and not is_featured
  and published_at is null
  and rejection_reason is null
);
create policy "listings_owner_update" on public.listings for update
using (owner_id = auth.uid() or public.is_admin())
with check (owner_id = auth.uid() or public.is_admin());
create policy "listings_owner_delete" on public.listings for delete
using (owner_id = auth.uid() or public.is_admin());

create policy "listing_images_read_visible_listing" on public.listing_images for select
using (exists (select 1 from public.listings l where l.id = listing_id));
create policy "listing_images_owner_write" on public.listing_images for all
using (public.is_listing_owner(listing_id) or public.is_admin())
with check (public.is_listing_owner(listing_id) or public.is_admin());

create policy "listing_values_read_visible_listing" on public.listing_field_values for select
using (exists (select 1 from public.listings l where l.id = listing_id));
create policy "listing_values_owner_write" on public.listing_field_values for all
using (public.is_listing_owner(listing_id) or public.is_admin())
with check (public.is_listing_owner(listing_id) or public.is_admin());

create policy "favorites_owner_read" on public.favorites for select using (user_id = auth.uid());
create policy "favorites_owner_insert" on public.favorites for insert with check (user_id = auth.uid());
create policy "favorites_owner_delete" on public.favorites for delete using (user_id = auth.uid());

create policy "reports_owner_or_admin_read" on public.reports for select
using (reporter_id = auth.uid() or public.is_admin());
create policy "reports_authenticated_insert" on public.reports for insert
with check (reporter_id = auth.uid());
create policy "reports_admin_update" on public.reports for update
using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-images', 'listing-images', true, 8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "listing_images_storage_public_read" on storage.objects for select
using (bucket_id = 'listing-images');
create policy "listing_images_storage_owner_insert" on storage.objects for insert to authenticated
with check (bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "listing_images_storage_owner_update" on storage.objects for update to authenticated
using (bucket_id = 'listing-images' and owner_id = auth.uid()::text)
with check (bucket_id = 'listing-images' and owner_id = auth.uid()::text);
create policy "listing_images_storage_owner_delete" on storage.objects for delete to authenticated
using (bucket_id = 'listing-images' and owner_id = auth.uid()::text);

create or replace function public.search_listings(
  search_query text default null,
  category_slug text default null,
  city_query text default null,
  min_price numeric default null,
  max_price numeric default null,
  sort_order text default 'recent',
  page_size integer default 24,
  page_offset integer default 0
)
returns table (
  id uuid,
  slug text,
  title text,
  price numeric,
  city text,
  condition text,
  published_at timestamptz,
  is_featured boolean,
  category_name text,
  category_slug text,
  image_url text,
  is_favorite boolean
)
language sql
stable
set search_path = ''
as $$
  select
    l.id, l.slug, l.title, l.price, l.city, l.condition, l.published_at,
    l.is_featured, c.name, c.slug,
    case when image.storage_path is null then null
      else '/storage/v1/object/public/listing-images/' || image.storage_path end,
    exists (
      select 1 from public.favorites f
      where f.listing_id = l.id and f.user_id = auth.uid()
    )
  from public.listings l
  join public.categories c on c.id = l.category_id
  left join lateral (
    select li.storage_path from public.listing_images li
    where li.listing_id = l.id order by li.position asc limit 1
  ) image on true
  where l.status = 'published'
    and (search_query is null or extensions.unaccent(l.title || ' ' || l.description) ilike '%' || extensions.unaccent(search_query) || '%')
    and (category_slug is null or c.slug = category_slug)
    and (city_query is null or extensions.unaccent(l.city) ilike '%' || extensions.unaccent(city_query) || '%')
    and (min_price is null or l.price >= min_price)
    and (max_price is null or l.price <= max_price)
  order by
    l.is_featured desc,
    case when sort_order = 'price_asc' then l.price end asc nulls last,
    case when sort_order = 'price_desc' then l.price end desc nulls last,
    case when sort_order = 'recent' then l.published_at end desc,
    l.id
  limit least(greatest(page_size, 1), 100)
  offset greatest(page_offset, 0);
$$;

revoke all on function public.search_listings(text, text, text, numeric, numeric, text, integer, integer) from public;
grant execute on function public.search_listings(text, text, text, numeric, numeric, text, integer, integer) to anon, authenticated;


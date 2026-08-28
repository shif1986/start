create extension if not exists pg_trgm with schema extensions;

create type public.account_type as enum ('customer', 'professional');

alter table public.profiles
  add column account_type public.account_type not null default 'customer';

create table public.profile_contacts (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  phone text check (phone is null or char_length(phone) <= 30),
  public_email text check (public_email is null or char_length(public_email) <= 160),
  updated_at timestamptz not null default now()
);

insert into public.profile_contacts (profile_id, phone)
select id, phone from public.profiles where phone is not null
on conflict (profile_id) do update set phone = excluded.phone;

alter table public.profiles drop column phone;

create trigger profile_contacts_set_updated_at before update on public.profile_contacts
for each row execute function public.set_updated_at();

alter table public.profile_contacts enable row level security;

drop policy if exists "profiles_public_read" on public.profiles;
create policy "profiles_owner_read" on public.profiles for select to authenticated
using (id = auth.uid());
create policy "profiles_admin_read" on public.profiles for select to authenticated
using (public.is_admin());

create policy "profile_contacts_authenticated_read" on public.profile_contacts for select to authenticated
using (true);
create policy "profile_contacts_owner_insert" on public.profile_contacts for insert to authenticated
with check (profile_id = auth.uid());
create policy "profile_contacts_owner_update" on public.profile_contacts for update to authenticated
using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "profile_contacts_admin_all" on public.profile_contacts for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create view public.public_profiles
with (security_barrier = true)
as
select id, username, display_name, avatar_url, bio, city, account_type, is_verified, created_at
from public.profiles;

revoke all on public.public_profiles from public;
grant select on public.public_profiles to anon, authenticated;

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  safe_username text;
  safe_display_name text;
  requested_account_type public.account_type;
begin
  safe_username := lower(regexp_replace(
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1), 'user'),
    '[^a-zA-Z0-9_-]', '', 'g'
  ));
  safe_username := left(coalesce(nullif(safe_username, ''), 'user'), 21) || '-' || left(new.id::text, 8);

  safe_display_name := left(
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1), 'Utilisateur'),
    80
  );
  if char_length(safe_display_name) < 2 then
    safe_display_name := 'Utilisateur';
  end if;

  requested_account_type := case
    when new.raw_user_meta_data ->> 'account_type' = 'professional' then 'professional'::public.account_type
    else 'customer'::public.account_type
  end;

  insert into public.profiles (id, username, display_name, account_type)
  values (new.id, safe_username, safe_display_name, requested_account_type);

  return new;
end;
$$;

drop policy if exists "category_fields_public_read" on public.category_fields;
create policy "category_fields_active_category_read" on public.category_fields for select
using (
  exists (
    select 1 from public.categories category
    where category.id = category_id and (category.is_active or public.is_admin())
  )
);

drop policy if exists "category_options_public_read" on public.category_field_options;
create policy "category_options_active_category_read" on public.category_field_options for select
using (
  exists (
    select 1
    from public.category_fields field
    join public.categories category on category.id = field.category_id
    where field.id = field_id and (category.is_active or public.is_admin())
  )
);

alter table public.listings
  add column subdivision_code text check (subdivision_code is null or char_length(subdivision_code) <= 12),
  add column subdivision_name text check (subdivision_name is null or char_length(subdivision_name) <= 100);

create index listings_country_subdivision_idx
on public.listings(country_code, subdivision_code, published_at desc)
where status = 'published';

create or replace function public.immutable_unaccent(input text)
returns text
language sql
immutable
parallel safe
strict
set search_path = ''
as $$
  select extensions.unaccent(input);
$$;

alter table public.listings
  add column search_document tsvector generated always as (
    to_tsvector('simple', public.immutable_unaccent(title || ' ' || description || ' ' || city))
  ) stored;

create index listings_search_document_idx on public.listings using gin(search_document);

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

update storage.buckets
set public = false
where id = 'listing-images';

create or replace function public.storage_listing_id(object_name text)
returns uuid
language plpgsql
immutable
set search_path = ''
as $$
declare
  folders text[];
begin
  folders := storage.foldername(object_name);
  return folders[2]::uuid;
exception when others then
  return null;
end;
$$;

revoke all on function public.storage_listing_id(text) from public;
grant execute on function public.storage_listing_id(text) to anon, authenticated;

drop policy if exists "listing_images_storage_public_read" on storage.objects;
drop policy if exists "listing_images_storage_owner_insert" on storage.objects;
drop policy if exists "listing_images_storage_owner_update" on storage.objects;
drop policy if exists "listing_images_storage_owner_delete" on storage.objects;

create policy "listing_images_storage_visible_listing_read" on storage.objects for select
using (
  bucket_id = 'listing-images'
  and exists (
    select 1 from public.listings listing
    where listing.id = public.storage_listing_id(name)
  )
);

create policy "listing_images_storage_owner_insert" on storage.objects for insert to authenticated
with check (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (
    select 1 from public.listings listing
    where listing.id = public.storage_listing_id(name) and listing.owner_id = auth.uid()
  )
);

create policy "listing_images_storage_owner_update" on storage.objects for update to authenticated
using (
  bucket_id = 'listing-images'
  and owner_id = auth.uid()::text
  and exists (
    select 1 from public.listings listing
    where listing.id = public.storage_listing_id(name) and listing.owner_id = auth.uid()
  )
)
with check (
  bucket_id = 'listing-images'
  and owner_id = auth.uid()::text
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (
    select 1 from public.listings listing
    where listing.id = public.storage_listing_id(name) and listing.owner_id = auth.uid()
  )
);

create policy "listing_images_storage_owner_delete" on storage.objects for delete to authenticated
using (
  bucket_id = 'listing-images'
  and owner_id = auth.uid()::text
  and exists (
    select 1 from public.listings listing
    where listing.id = public.storage_listing_id(name) and listing.owner_id = auth.uid()
  )
);

insert into public.categories (id, parent_id, name, slug, icon, description, position, is_active)
values
  ('10000000-0000-4000-8000-000000000001', null, 'Véhicules', 'vehicules', 'vehicle', 'Véhicules, équipements et solutions de mobilité.', 10, true),
  ('10000000-0000-4000-8000-000000000002', null, 'Immobilier', 'immobilier', 'building', 'Biens, espaces professionnels et solutions de logement.', 20, true),
  ('10000000-0000-4000-8000-000000000003', null, 'Maison & Jardin', 'maison-jardin', 'home', 'Équipement, aménagement et entretien du cadre de vie.', 30, true),
  ('10000000-0000-4000-8000-000000000004', null, 'Multimédia', 'multimedia', 'computer', 'Équipements numériques, audiovisuels et connectés.', 40, true),
  ('10000000-0000-4000-8000-000000000005', null, 'Services', 'services', 'briefcase', 'Compétences pour les besoins quotidiens et professionnels.', 50, true),
  ('10000000-0000-4000-8000-000000000007', null, 'Emploi', 'emploi', 'work', 'Offres, missions et opportunités professionnelles.', 60, true),
  ('10000000-0000-4000-8000-000000000008', null, 'Mode & Accessoires', 'mode-accessoires', 'fashion', 'Vêtements, bijoux et accessoires.', 70, true),
  ('10000000-0000-4000-8000-000000000009', null, 'Loisirs', 'loisirs', 'culture', 'Sports, culture et activités pour tous les âges.', 80, true),
  ('10000000-0000-4000-8000-000000000010', null, 'Animaux', 'animaux', 'paw', 'Accessoires, équipements et services autorisés.', 90, true),
  ('10000000-0000-4000-8000-000000000011', null, 'Matériel professionnel', 'materiel-professionnel', 'tools', 'Équipements spécialisés pour les professionnels.', 100, true),
  ('10000000-0000-4000-8000-000000000012', null, 'Commerce & Entreprise', 'commerce-entreprise', 'commerce', 'Opportunités et ressources pour entreprendre.', 110, true),
  ('10000000-0000-4000-8000-000000000013', null, 'Agriculture', 'agriculture', 'agriculture', 'Matériel et fournitures agricoles.', 120, true),
  ('10000000-0000-4000-8000-000000000014', null, 'BTP & Industrie', 'btp-industrie', 'industry', 'Machines, matériaux et équipements professionnels.', 130, true),
  ('10000000-0000-4000-8000-000000000015', null, 'Autres annonces', 'autres-annonces', 'more', 'Annonces ne correspondant pas aux autres catégories.', 140, true)
on conflict (id) do update set
  parent_id = excluded.parent_id,
  name = excluded.name,
  slug = excluded.slug,
  icon = excluded.icon,
  description = excluded.description,
  position = excluded.position,
  is_active = excluded.is_active;

create or replace function public.search_listings_v2(
  search_query text default null,
  category_slug text default null,
  country_filter text default null,
  subdivision_filter text default null,
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
  description text,
  price numeric,
  currency char(3),
  city text,
  subdivision_code text,
  subdivision_name text,
  country_code char(2),
  latitude numeric,
  longitude numeric,
  condition text,
  published_at timestamptz,
  is_featured boolean,
  category_name text,
  category_slug text,
  cover_storage_path text,
  is_favorite boolean,
  total_count bigint
)
language sql
stable
set search_path = ''
as $$
  select
    listing.id,
    listing.slug,
    listing.title,
    listing.description,
    listing.price,
    listing.currency,
    listing.city,
    listing.subdivision_code,
    listing.subdivision_name,
    listing.country_code,
    listing.latitude,
    listing.longitude,
    listing.condition,
    listing.published_at,
    listing.is_featured,
    category.name,
    category.slug,
    image.storage_path,
    exists (
      select 1 from public.favorites favorite
      where favorite.listing_id = listing.id and favorite.user_id = auth.uid()
    ),
    count(*) over()
  from public.listings listing
  join public.categories category on category.id = listing.category_id
  left join lateral (
    select listing_image.storage_path
    from public.listing_images listing_image
    where listing_image.listing_id = listing.id
    order by listing_image.position asc
    limit 1
  ) image on true
  where listing.status = 'published'
    and (search_query is null or listing.search_document @@ websearch_to_tsquery('simple', public.immutable_unaccent(search_query)))
    and (category_slug is null or category.slug = category_slug)
    and (country_filter is null or listing.country_code = upper(country_filter))
    and (subdivision_filter is null or listing.subdivision_code = subdivision_filter or listing.subdivision_name = subdivision_filter)
    and (city_query is null or public.immutable_unaccent(listing.city) ilike '%' || public.immutable_unaccent(city_query) || '%')
    and (min_price is null or listing.price >= min_price)
    and (max_price is null or listing.price <= max_price)
  order by
    listing.is_featured desc,
    case when sort_order = 'price_asc' then listing.price end asc nulls last,
    case when sort_order = 'price_desc' then listing.price end desc nulls last,
    case when sort_order = 'recent' then listing.published_at end desc,
    listing.id
  limit least(greatest(page_size, 1), 100)
  offset greatest(page_offset, 0);
$$;

revoke all on function public.search_listings_v2(text, text, text, text, text, numeric, numeric, text, integer, integer) from public;
grant execute on function public.search_listings_v2(text, text, text, text, text, numeric, numeric, text, integer, integer) to anon, authenticated;

create or replace function public.get_listing_detail(listing_slug text)
returns table (
  id uuid,
  owner_id uuid,
  slug text,
  title text,
  description text,
  price numeric,
  currency char(3),
  condition text,
  country_code char(2),
  city text,
  subdivision_code text,
  subdivision_name text,
  latitude numeric,
  longitude numeric,
  status public.listing_status,
  published_at timestamptz,
  category_id uuid,
  category_name text,
  category_slug text,
  images jsonb,
  seller_display_name text,
  seller_username text,
  seller_avatar_url text,
  seller_bio text,
  seller_city text,
  seller_is_verified boolean,
  seller_phone text,
  seller_email text,
  is_favorite boolean
)
language sql
stable
set search_path = ''
as $$
  select
    listing.id,
    listing.owner_id,
    listing.slug,
    listing.title,
    listing.description,
    listing.price,
    listing.currency,
    listing.condition,
    listing.country_code,
    listing.city,
    listing.subdivision_code,
    listing.subdivision_name,
    listing.latitude,
    listing.longitude,
    listing.status,
    listing.published_at,
    category.id,
    category.name,
    category.slug,
    coalesce(images.items, '[]'::jsonb),
    seller.display_name,
    seller.username,
    seller.avatar_url,
    seller.bio,
    seller.city,
    seller.is_verified,
    contact.phone,
    contact.public_email,
    exists (
      select 1 from public.favorites favorite
      where favorite.listing_id = listing.id and favorite.user_id = auth.uid()
    )
  from public.listings listing
  join public.categories category on category.id = listing.category_id
  join public.public_profiles seller on seller.id = listing.owner_id
  left join public.profile_contacts contact on contact.profile_id = listing.owner_id
  left join lateral (
    select jsonb_agg(
      jsonb_build_object(
        'storage_path', listing_image.storage_path,
        'alt_text', listing_image.alt_text,
        'position', listing_image.position,
        'width', listing_image.width,
        'height', listing_image.height
      ) order by listing_image.position
    ) as items
    from public.listing_images listing_image
    where listing_image.listing_id = listing.id
  ) images on true
  where listing.slug = listing_slug
  limit 1;
$$;

revoke all on function public.get_listing_detail(text) from public;
grant execute on function public.get_listing_detail(text) to anon, authenticated;

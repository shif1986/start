create type public.account_status as enum ('active', 'suspended');

alter table public.profiles
  add column account_status public.account_status not null default 'active';

alter table public.profile_contacts
  add column postal_address text
  check (postal_address is null or char_length(postal_address) between 5 and 300);

create or replace function public.is_active_account(target_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles profile
    where profile.id = target_user_id
      and profile.account_status = 'active'
  );
$$;

revoke all on function public.is_active_account(uuid) from public;
grant execute on function public.is_active_account(uuid) to authenticated;

create or replace function public.has_active_professional_subscription(target_user_id uuid)
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
    where profile.id = target_user_id
      and profile.account_type = 'professional'
      and profile.account_status = 'active'
      and subscription.status in ('trialing', 'active')
      and subscription.current_period_end > now()
  );
$$;

create or replace function public.can_read_professional_contact(target_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    public.is_admin()
    or (
      auth.uid() = target_profile_id
      and public.is_active_account(auth.uid())
    )
    or exists (
      select 1
      from public.profiles viewer
      join public.profiles target on target.id = target_profile_id
      where viewer.id = auth.uid()
        and viewer.account_status = 'active'
        and target.account_type = 'professional'
        and target.account_status = 'active'
        and (
          (
            viewer.account_type = 'customer'
            and public.has_active_professional_subscription(target.id)
          )
          or (
            viewer.account_type = 'professional'
            and public.has_active_professional_subscription(viewer.id)
          )
        )
    );
$$;

create or replace function public.has_active_professional_subscription()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_active_professional_subscription(auth.uid());
$$;

create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() and (
    new.role <> old.role
    or new.is_verified <> old.is_verified
    or new.account_type <> old.account_type
    or new.account_status <> old.account_status
  ) then
    raise exception 'Seul un administrateur peut modifier le rôle, le type, la vérification ou la suspension';
  end if;
  return new;
end;
$$;

create table public.listing_comments (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 2 and 2000),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listing_comments_listing_created_idx
on public.listing_comments(listing_id, created_at desc);

create trigger listing_comments_set_updated_at
before update on public.listing_comments
for each row execute function public.set_updated_at();

alter table public.listing_comments enable row level security;

create policy "listing_comments_public_read"
on public.listing_comments for select
using (
  (not is_hidden and exists (
    select 1 from public.listings listing
    where listing.id = listing_id and listing.status = 'published'
  ))
  or author_id = auth.uid()
  or public.is_admin()
);

create policy "listing_comments_active_member_insert"
on public.listing_comments for insert to authenticated
with check (
  author_id = auth.uid()
  and public.is_active_account(auth.uid())
  and not is_hidden
  and exists (
    select 1 from public.listings listing
    where listing.id = listing_id and listing.status = 'published'
  )
);

create policy "listing_comments_owner_update"
on public.listing_comments for update to authenticated
using (author_id = auth.uid() and public.is_active_account(auth.uid()))
with check (author_id = auth.uid() and public.is_active_account(auth.uid()) and not is_hidden);

create policy "listing_comments_owner_delete"
on public.listing_comments for delete to authenticated
using (author_id = auth.uid() and public.is_active_account(auth.uid()));

create policy "listing_comments_admin_all"
on public.listing_comments for all to authenticated
using (public.is_admin()) with check (public.is_admin());

grant select on public.listing_comments to anon, authenticated;
grant insert, update, delete on public.listing_comments to authenticated;

drop policy if exists "listings_owner_insert" on public.listings;
create policy "listings_owner_insert" on public.listings for insert to authenticated
with check (
  owner_id = auth.uid()
  and public.is_active_account(auth.uid())
  and public.has_active_professional_subscription()
  and status in ('draft', 'pending')
  and not is_featured
  and published_at is null
  and rejection_reason is null
);

create or replace function public.require_professional_subscription_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.profiles profile
    where profile.id = new.user_id
      and profile.account_type = 'professional'
      and profile.account_status = 'active'
  ) then
    raise exception 'Un abonnement est réservé à un compte professionnel actif';
  end if;

  return new;
end;
$$;

drop function public.get_listing_detail(text);
create function public.get_listing_detail(listing_slug text)
returns table (
  id uuid, owner_id uuid, slug text, title text, description text, price numeric,
  currency char(3), condition text, country_code char(2), city text,
  subdivision_code text, subdivision_name text, latitude numeric, longitude numeric,
  status public.listing_status, published_at timestamptz, category_id uuid,
  category_name text, category_slug text, images jsonb, seller_display_name text,
  seller_username text, seller_avatar_url text, seller_bio text, seller_city text,
  seller_is_verified boolean, seller_phone text, seller_email text,
  seller_postal_address text, is_favorite boolean
)
language sql
stable
set search_path = ''
as $$
  select
    listing.id, listing.owner_id, listing.slug, listing.title, listing.description,
    listing.price, listing.currency, listing.condition, listing.country_code,
    listing.city, listing.subdivision_code, listing.subdivision_name,
    listing.latitude, listing.longitude, listing.status, listing.published_at,
    category.id, category.name, category.slug,
    coalesce(images.items, '[]'::jsonb), seller.display_name, seller.username,
    seller.avatar_url, seller.bio, seller.city, seller.is_verified,
    contact.phone, contact.public_email, contact.postal_address,
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

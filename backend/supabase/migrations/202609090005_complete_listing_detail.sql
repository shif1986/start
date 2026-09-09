drop function if exists public.get_listing_detail(text);

create function public.get_listing_detail(listing_slug text)
returns table (
  id uuid, owner_id uuid, slug text, title text, description text, price numeric,
  price_unit text, currency char(3), condition text, country_code char(2), city text,
  subdivision_code text, subdivision_name text, latitude numeric, longitude numeric,
  status public.listing_status, published_at timestamptz, category_id uuid,
  category_name text, category_slug text, images jsonb, fields jsonb,
  seller_display_name text, seller_username text, seller_avatar_url text,
  seller_bio text, seller_city text, seller_is_verified boolean,
  seller_phone text, seller_email text, seller_postal_address text,
  is_favorite boolean
)
language sql
stable
set search_path = ''
as $$
  select
    listing.id, listing.owner_id, listing.slug, listing.title, listing.description,
    listing.price, listing.price_unit, listing.currency, listing.condition,
    listing.country_code, listing.city, listing.subdivision_code,
    listing.subdivision_name, listing.latitude, listing.longitude, listing.status,
    listing.published_at, category.id, category.name, category.slug,
    coalesce(images.items, '[]'::jsonb), coalesce(fields.items, '[]'::jsonb),
    seller.display_name, seller.username, seller.avatar_url, seller.bio,
    seller.city, seller.is_verified, contact.phone, contact.public_email,
    contact.postal_address,
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
  left join lateral (
    select jsonb_agg(
      jsonb_build_object(
        'key', field.key,
        'name', field.name,
        'field_type', field.field_type,
        'value', field_value.value,
        'options', coalesce((
          select jsonb_agg(
            jsonb_build_object('label', field_option.label, 'value', field_option.value)
            order by field_option.position
          )
          from public.category_field_options field_option
          where field_option.field_id = field.id
        ), '[]'::jsonb)
      ) order by field.position
    ) as items
    from public.listing_field_values field_value
    join public.category_fields field on field.id = field_value.field_id
    where field_value.listing_id = listing.id
  ) fields on true
  where listing.slug = listing_slug
  limit 1;
$$;

revoke all on function public.get_listing_detail(text) from public;
grant execute on function public.get_listing_detail(text) to anon, authenticated;

notify pgrst, 'reload schema';

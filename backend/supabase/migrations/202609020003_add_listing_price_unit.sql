alter table public.listings
add column if not exists price_unit text not null default 'fixed';

alter table public.listings
drop constraint if exists listings_price_unit_check;

alter table public.listings
add constraint listings_price_unit_check
check (price_unit in ('fixed', 'hour', 'day', 'month', 'quote'));

comment on column public.listings.price_unit is
  'Mode de tarification : prix fixe, par heure, par jour, par mois ou sur devis.';

-- Backfill the public city centre for existing Avignon adverts. New and edited
-- French adverts are geocoded by the application before they are displayed.
update public.listings
set
  latitude = 43.9493,
  longitude = 4.8055,
  subdivision_code = coalesce(subdivision_code, '84'),
  subdivision_name = coalesce(subdivision_name, 'Vaucluse')
where country_code = 'FR'
  and lower(public.immutable_unaccent(city)) = 'avignon'
  and (latitude is null or longitude is null);

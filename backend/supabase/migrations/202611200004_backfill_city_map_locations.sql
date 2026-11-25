-- Existing adverts created before map coordinates were stored. These city
-- centres keep the home map, catalogue map and advert page consistent.
update public.listings
set latitude = 44.8378, longitude = -0.5792,
    subdivision_code = coalesce(subdivision_code, '33'),
    subdivision_name = coalesce(subdivision_name, 'Gironde')
where country_code = 'FR'
  and lower(public.immutable_unaccent(city)) = 'bordeaux'
  and (latitude is null or longitude is null);

update public.listings
set latitude = 45.7640, longitude = 4.8357,
    subdivision_code = coalesce(subdivision_code, '69'),
    subdivision_name = coalesce(subdivision_name, 'Rhone')
where country_code = 'FR'
  and lower(public.immutable_unaccent(city)) = 'lyon'
  and (latitude is null or longitude is null);

update public.listings
set latitude = 43.7102, longitude = 7.2620,
    subdivision_code = coalesce(subdivision_code, '06'),
    subdivision_name = coalesce(subdivision_name, 'Alpes-Maritimes')
where country_code = 'FR'
  and lower(public.immutable_unaccent(city)) = 'nice'
  and (latitude is null or longitude is null);

update public.listings
set latitude = 46.2044, longitude = 6.1432,
    subdivision_name = coalesce(subdivision_name, 'Geneve')
where country_code = 'CH'
  and lower(public.immutable_unaccent(city)) = 'geneve'
  and (latitude is null or longitude is null);

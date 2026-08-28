begin;
select plan(26);

select has_table('public', 'profiles', 'profiles existe');
select has_table('public', 'profile_contacts', 'profile_contacts existe');
select has_table('public', 'categories', 'categories existe');
select has_table('public', 'category_fields', 'category_fields existe');
select has_table('public', 'listings', 'listings existe');
select has_table('public', 'listing_images', 'listing_images existe');
select has_table('public', 'listing_field_values', 'listing_field_values existe');
select has_table('public', 'favorites', 'favorites existe');
select has_table('public', 'reports', 'reports existe');
select has_view('public', 'public_profiles', 'la vue publique des profils existe');

select is(
  (select data_type from information_schema.columns where table_schema = 'public' and table_name = 'listings' and column_name = 'price'),
  'numeric',
  'le prix est un numeric PostgreSQL'
);

select col_is_pk('public', 'listings', 'id', 'listings.id est la clé primaire');
select col_is_pk('public', 'profile_contacts', 'profile_id', 'profile_contacts.profile_id est la clé primaire');
select fk_ok('public', 'listings', 'owner_id', 'auth', 'users', 'id', 'owner_id référence auth.users');
select fk_ok('public', 'listings', 'category_id', 'public', 'categories', 'id', 'category_id référence categories');

select ok((select relrowsecurity from pg_class where oid = 'public.profiles'::regclass), 'RLS est activé sur profiles');
select ok((select relrowsecurity from pg_class where oid = 'public.profile_contacts'::regclass), 'RLS est activé sur profile_contacts');
select ok((select relrowsecurity from pg_class where oid = 'public.listings'::regclass), 'RLS est activé sur listings');
select ok((select relrowsecurity from pg_class where oid = 'public.favorites'::regclass), 'RLS est activé sur favorites');

select has_function('public', 'is_admin', array[]::text[], 'la fonction is_admin existe');
select has_function('public', 'set_updated_at', array[]::text[], 'le trigger updated_at existe');
select has_function('public', 'storage_listing_id', array['text'], 'le parseur de chemin Storage existe');
select has_function(
  'public',
  'search_listings_v2',
  array['text', 'text', 'text', 'text', 'text', 'numeric', 'numeric', 'text', 'integer', 'integer'],
  'la recherche paginée v2 existe'
);
select has_function('public', 'get_listing_detail', array['text'], 'le détail annonce relationnel existe');

select is(
  (select public from storage.buckets where id = 'listing-images'),
  false,
  'le bucket listing-images est privé'
);

select is(
  (select count(*) from public.categories where parent_id is null and is_active),
  14::bigint,
  'les quatorze catégories principales sont disponibles'
);

select * from finish();
rollback;

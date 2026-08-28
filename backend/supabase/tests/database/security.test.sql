begin;
select plan(13);

insert into auth.users (id, email, raw_user_meta_data)
values
  ('20000000-0000-4000-8000-000000000001', 'owner@example.test', '{"display_name":"Propriétaire","account_type":"professional"}'::jsonb),
  ('20000000-0000-4000-8000-000000000002', 'visitor@example.test', '{"display_name":"Visiteur"}'::jsonb);

insert into public.profile_contacts (profile_id, phone, public_email)
values ('20000000-0000-4000-8000-000000000001', '+33 6 00 00 00 00', 'owner@example.test');

insert into public.listings (
  id, owner_id, category_id, title, slug, description, city, subdivision_code, subdivision_name
)
values (
  '30000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000005',
  'Service de test sécurisé',
  'service-de-test-securise',
  'Description suffisamment longue pour valider les règles métier.',
  'Paris',
  '75',
  'Paris'
);

set local role anon;
select is((select count(*) from public.profiles), 0::bigint, 'un visiteur ne lit pas la table profiles');
select is((select count(*) from public.profile_contacts), 0::bigint, 'un visiteur ne lit pas les coordonnées');
select is((select count(*) from public.public_profiles), 2::bigint, 'un visiteur lit uniquement la vue publique');
select is((select count(*) from public.listings), 0::bigint, 'un brouillon est invisible publiquement');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000001', true);
select is((select count(*) from public.profiles), 1::bigint, 'un utilisateur lit son propre profil privé');
select is((select count(*) from public.profile_contacts), 1::bigint, 'un membre authentifié lit les coordonnées de contact');
select is((select count(*) from public.listings), 1::bigint, 'le propriétaire lit son brouillon');
select lives_ok(
  $$update public.listings set status = 'pending' where id = '30000000-0000-4000-8000-000000000001'$$,
  'le propriétaire peut soumettre son brouillon'
);
select throws_ok(
  $$update public.listings set status = 'published' where id = '30000000-0000-4000-8000-000000000001'$$,
  'P0001',
  'Transition de statut non autorisée',
  'le propriétaire ne peut pas publier sans modération'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000002', true);
select is((select count(*) from public.listings), 0::bigint, 'un autre utilisateur ne lit pas le brouillon');
select results_eq(
  $$update public.listings set title = 'Modification interdite' where id = '30000000-0000-4000-8000-000000000001' returning id$$,
  array[]::uuid[],
  'un autre utilisateur ne modifie pas le brouillon'
);
reset role;

select is(
  public.storage_listing_id('20000000-0000-4000-8000-000000000001/30000000-0000-4000-8000-000000000001/image.webp'),
  '30000000-0000-4000-8000-000000000001'::uuid,
  'le chemin Storage contient un identifiant annonce valide'
);
select is(public.storage_listing_id('chemin-invalide.webp'), null::uuid, 'un chemin Storage invalide est rejeté');

select * from finish();
rollback;

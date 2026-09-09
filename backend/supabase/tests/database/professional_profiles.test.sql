begin;
select plan(8);

insert into auth.users (id, email, raw_user_meta_data)
values
  ('a1000000-0000-4000-8000-000000000001', 'profile-pro@example.test', '{"display_name":"Profil pro","account_type":"professional"}'::jsonb),
  ('a1000000-0000-4000-8000-000000000002', 'profile-customer@example.test', '{"display_name":"Profil client"}'::jsonb),
  ('a1000000-0000-4000-8000-000000000003', 'profile-suspended@example.test', '{"display_name":"Profil suspendu","account_type":"professional"}'::jsonb);

update public.profiles
set account_status = 'suspended'
where id = 'a1000000-0000-4000-8000-000000000003';

set local role anon;
select results_eq(
  $$select display_name from public.active_professional_profiles order by display_name$$,
  $$values ('Profil pro'::text)$$,
  'seuls les professionnels actifs ont une page publique'
);
select is((select count(*) from public.profile_contacts), 0::bigint, 'les coordonnées restent privées pour un visiteur');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', 'a1000000-0000-4000-8000-000000000001', true);
select lives_ok(
  $$select public.update_my_profile(
    'profil-pro-public', 'Profil professionnel', 'https://example.test/avatar.webp',
    'Présentation publique', 'Lyon', '+33 6 11 22 33 44',
    'CONTACT@EXAMPLE.TEST', '10 rue du Test, Lyon'
  )$$,
  'un membre actif modifie son propre profil'
);
select is((select username from public.profiles where id = auth.uid()), 'profil-pro-public', 'le nom utilisateur est enregistré');
select is((select role from public.profiles where id = auth.uid()), 'user'::public.user_role, 'le rôle ne peut pas être modifié par le RPC');
select is((select public_email from public.profile_contacts where profile_id = auth.uid()), 'contact@example.test', 'les coordonnées sont enregistrées et normalisées');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', 'a1000000-0000-4000-8000-000000000003', true);
select throws_ok(
  $$select public.update_my_profile('profil-suspendu', 'Profil suspendu', null, null, null, null, null, null)$$,
  'P0001', 'Compte inactif', 'un compte suspendu ne peut pas modifier son profil'
);
reset role;

select is((select count(*) from public.active_professional_profiles where username = 'profil-pro-public'), 1::bigint, 'le profil modifié est accessible par username');
select is((select count(*) from public.active_professional_profiles where id = 'a1000000-0000-4000-8000-000000000002'), 0::bigint, 'un particulier ne possède pas de page professionnelle');

select * from finish();
rollback;

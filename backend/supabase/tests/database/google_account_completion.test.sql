begin;
select plan(5);

insert into auth.users (id, email, raw_user_meta_data, raw_app_meta_data)
values
  (
    '80000000-0000-4000-8000-000000000001',
    'new-google-pro@example.test',
    '{"display_name":"Nouveau pro Google"}'::jsonb,
    '{"provider":"google","providers":["google"]}'::jsonb
  ),
  (
    '80000000-0000-4000-8000-000000000002',
    'new-email-user@example.test',
    '{"display_name":"Nouveau compte e-mail"}'::jsonb,
    '{"provider":"email","providers":["email"]}'::jsonb
  ),
  (
    '80000000-0000-4000-8000-000000000003',
    'old-google-user@example.test',
    '{"display_name":"Ancien compte Google"}'::jsonb,
    '{"provider":"google","providers":["google"]}'::jsonb
  );

update public.profiles
set created_at = now() - interval '31 minutes'
where id = '80000000-0000-4000-8000-000000000003';

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000001","role":"authenticated","app_metadata":{"provider":"google","providers":["google"]}}',
  true
);
select lives_ok(
  $$select public.complete_google_account_type('professional')$$,
  'un nouveau compte Google peut finaliser son choix professionnel'
);
select is(
  (select account_type from public.profiles where id = auth.uid()),
  'professional'::public.account_type,
  'le profil Google est devenu professionnel'
);
select throws_ok(
  $$update public.profiles set account_type = 'customer' where id = auth.uid()$$,
  'P0001',
  'Seul un administrateur peut modifier le rôle, le type, la vérification ou la suspension',
  'la modification directe du type reste interdite'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000002","role":"authenticated","app_metadata":{"provider":"email","providers":["email"]}}',
  true
);
select throws_ok(
  $$select public.complete_google_account_type('professional')$$,
  'P0001',
  'Cette finalisation est réservée aux comptes Google',
  'un compte e-mail ne peut pas utiliser la finalisation Google'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"80000000-0000-4000-8000-000000000003","role":"authenticated","app_metadata":{"provider":"google","providers":["google"]}}',
  true
);
select throws_ok(
  $$select public.complete_google_account_type('professional')$$,
  'P0001',
  'Le type de compte ne peut plus être finalisé',
  'un ancien compte Google ne peut pas changer de type'
);

reset role;
select * from finish();
rollback;

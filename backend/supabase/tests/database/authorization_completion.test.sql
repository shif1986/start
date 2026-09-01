begin;
select plan(9);

insert into auth.users (id, email, raw_user_meta_data)
values
  ('70000000-0000-4000-8000-000000000001', 'completion-pro@example.test', '{"display_name":"Pro complété","account_type":"professional"}'::jsonb),
  ('70000000-0000-4000-8000-000000000002', 'completion-customer@example.test', '{"display_name":"Particulier actif"}'::jsonb),
  ('70000000-0000-4000-8000-000000000003', 'completion-suspended@example.test', '{"display_name":"Particulier suspendu"}'::jsonb),
  ('70000000-0000-4000-8000-000000000004', 'completion-admin@example.test', '{"display_name":"Administrateur"}'::jsonb);

alter table public.profiles disable trigger profiles_protect_privileges;
update public.profiles
set account_status = case
  when id = '70000000-0000-4000-8000-000000000003' then 'suspended'::public.account_status
  else account_status
end,
role = case
  when id = '70000000-0000-4000-8000-000000000004' then 'admin'::public.user_role
  else role
end
where id in (
  '70000000-0000-4000-8000-000000000003',
  '70000000-0000-4000-8000-000000000004'
);
alter table public.profiles enable trigger profiles_protect_privileges;

insert into public.profile_contacts (profile_id, phone, public_email, postal_address)
values
  ('70000000-0000-4000-8000-000000000001', '+33 6 70 00 00 01', 'pro-complete@example.test', '10 rue du Réseau, 75001 Paris'),
  ('70000000-0000-4000-8000-000000000003', '+33 6 70 00 00 03', 'suspended@example.test', '20 rue Suspendue, 69001 Lyon');

insert into public.subscriptions (
  user_id, plan_id, status, provider, provider_subscription_id,
  current_period_start, current_period_end
)
select
  '70000000-0000-4000-8000-000000000001', id, 'active', 'stripe',
  'sub_authorization_completion', now() - interval '1 day', now() + interval '29 days'
from public.subscription_plans
where code = 'pro_monthly';

insert into public.listings (
  id, owner_id, category_id, title, slug, description, city, status, published_at
)
values (
  '71000000-0000-4000-8000-000000000001',
  '70000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000005',
  'Annonce pour autorisations complètes',
  'annonce-autorisations-completes',
  'Description suffisamment longue pour les tests d’autorisation complets.',
  'Paris', 'published', now()
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '70000000-0000-4000-8000-000000000002', true);
select is(
  (select seller_postal_address from public.get_listing_detail('annonce-autorisations-completes')),
  '10 rue du Réseau, 75001 Paris'::text,
  'un particulier actif voit l’adresse postale du professionnel abonné'
);
select lives_ok(
  $$insert into public.listing_comments (listing_id, author_id, body)
    values (
      '71000000-0000-4000-8000-000000000001',
      '70000000-0000-4000-8000-000000000002',
      'Commentaire visible et autorisé.'
    )$$,
  'un particulier actif peut commenter une annonce publiée'
);
reset role;

set local role anon;
select is((select count(*) from public.listing_comments), 1::bigint, 'un visiteur lit les commentaires visibles');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '70000000-0000-4000-8000-000000000003', true);
select is((select count(*) from public.profile_contacts), 0::bigint, 'un compte suspendu ne lit aucun contact');
select throws_ok(
  $$insert into public.listing_comments (listing_id, author_id, body)
    values (
      '71000000-0000-4000-8000-000000000001',
      '70000000-0000-4000-8000-000000000003',
      'Commentaire interdit.'
    )$$,
  '42501', null,
  'un compte suspendu ne peut pas commenter'
);
select throws_ok(
  $$insert into public.listings (owner_id, category_id, title, slug, description, city)
    values (
      '70000000-0000-4000-8000-000000000003',
      '10000000-0000-4000-8000-000000000005',
      'Annonce suspendue interdite',
      'annonce-suspendue-interdite',
      'Description suffisamment longue pour vérifier la suspension.',
      'Lyon'
    )$$,
  '42501', null,
  'un compte suspendu ne peut pas créer une annonce'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '70000000-0000-4000-8000-000000000004', true);
select is((select count(*) from public.profile_contacts), 2::bigint, 'un administrateur lit tous les contacts');
select lives_ok(
  $$update public.listing_comments set is_hidden = true
    where author_id = '70000000-0000-4000-8000-000000000002'$$,
  'un administrateur peut masquer un commentaire'
);
select is((select count(*) from public.listing_comments), 1::bigint, 'un administrateur lit aussi les commentaires masqués');
reset role;

select * from finish();
rollback;

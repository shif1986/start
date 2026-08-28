begin;
select plan(11);

insert into auth.users (id, email, raw_user_meta_data)
values
  ('40000000-0000-4000-8000-000000000001', 'active-pro@example.test', '{"display_name":"Pro actif","account_type":"professional"}'::jsonb),
  ('40000000-0000-4000-8000-000000000002', 'inactive-pro@example.test', '{"display_name":"Pro inactif","account_type":"professional"}'::jsonb),
  ('40000000-0000-4000-8000-000000000003', 'customer@example.test', '{"display_name":"Particulier"}'::jsonb);

insert into public.subscriptions (
  id, user_id, plan_id, status, provider, provider_subscription_id, current_period_start, current_period_end
)
select
  '41000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000001',
  id,
  'active',
  'stripe',
  'sub_test_active',
  now() - interval '1 day',
  now() + interval '29 days'
from public.subscription_plans
where code = 'pro_monthly';

set local role anon;
select is((select count(*) from public.subscription_plans), 2::bigint, 'les offres actives sont publiques');
select is((select count(*) from public.subscriptions), 0::bigint, 'les abonnements privés sont invisibles aux visiteurs');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '40000000-0000-4000-8000-000000000001', true);
select is((select count(*) from public.subscriptions), 1::bigint, 'un membre lit uniquement son abonnement');
select ok(public.has_active_professional_subscription(), 'un professionnel actif possède le droit de publication');
select throws_ok(
  $$insert into public.subscriptions (user_id, plan_id, status, provider, current_period_end)
    select '40000000-0000-4000-8000-000000000001', id, 'active', 'stripe', now() + interval '1 month'
    from public.subscription_plans where code = 'pro_yearly'$$,
  '42501',
  null,
  'le client ne peut pas activer lui-même un abonnement'
);
select lives_ok(
  $$insert into public.listings (owner_id, category_id, title, slug, description, city)
    values (
      '40000000-0000-4000-8000-000000000001',
      '10000000-0000-4000-8000-000000000005',
      'Annonce avec abonnement',
      'annonce-avec-abonnement',
      'Description suffisamment longue pour une annonce autorisée.',
      'Paris'
    )$$,
  'un professionnel actif peut créer une annonce'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '40000000-0000-4000-8000-000000000002', true);
select is((select count(*) from public.subscriptions), 0::bigint, 'un professionnel ne lit pas l’abonnement d’un autre membre');
select isnt(public.has_active_professional_subscription(), true, 'un professionnel sans abonnement ne possède pas le droit');
select throws_ok(
  $$insert into public.listings (owner_id, category_id, title, slug, description, city)
    values (
      '40000000-0000-4000-8000-000000000002',
      '10000000-0000-4000-8000-000000000005',
      'Annonce sans abonnement',
      'annonce-sans-abonnement',
      'Description suffisamment longue pour une annonce refusée.',
      'Paris'
    )$$,
  '42501',
  null,
  'un professionnel sans abonnement ne peut pas créer une annonce'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '40000000-0000-4000-8000-000000000003', true);
select isnt(public.has_active_professional_subscription(), true, 'un particulier ne possède jamais le droit professionnel');
select throws_ok(
  $$insert into public.listings (owner_id, category_id, title, slug, description, city)
    values (
      '40000000-0000-4000-8000-000000000003',
      '10000000-0000-4000-8000-000000000005',
      'Annonce particulier',
      'annonce-particulier',
      'Description suffisamment longue pour une annonce refusée.',
      'Paris'
    )$$,
  '42501',
  null,
  'un particulier ne peut pas créer une annonce'
);
reset role;

select * from finish();
rollback;

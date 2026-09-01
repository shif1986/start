begin;
select plan(12);

insert into auth.users (id, email, raw_user_meta_data)
values
  ('60000000-0000-4000-8000-000000000001', 'active-pro-contact@example.test', '{"display_name":"Pro actif contacts","account_type":"professional"}'::jsonb),
  ('60000000-0000-4000-8000-000000000002', 'expired-pro-contact@example.test', '{"display_name":"Pro expiré contacts","account_type":"professional"}'::jsonb),
  ('60000000-0000-4000-8000-000000000003', 'customer-contact@example.test', '{"display_name":"Particulier contacts"}'::jsonb),
  ('60000000-0000-4000-8000-000000000004', 'other-customer-contact@example.test', '{"display_name":"Autre particulier"}'::jsonb);

insert into public.profile_contacts (profile_id, phone, public_email)
values
  ('60000000-0000-4000-8000-000000000001', '+33 6 00 00 00 01', 'active@example.test'),
  ('60000000-0000-4000-8000-000000000002', '+33 6 00 00 00 02', 'expired@example.test'),
  ('60000000-0000-4000-8000-000000000004', '+33 6 00 00 00 04', 'customer@example.test');

insert into public.subscriptions (
  user_id, plan_id, status, provider, provider_subscription_id,
  current_period_start, current_period_end
)
select
  owner_id,
  plan.id,
  'active',
  'stripe',
  provider_id,
  period_start,
  period_end
from (
  values
    ('60000000-0000-4000-8000-000000000001'::uuid, 'sub_contact_active', now() - interval '1 day', now() + interval '29 days'),
    ('60000000-0000-4000-8000-000000000002'::uuid, 'sub_contact_expired', now() - interval '31 days', now() - interval '1 day')
) subscription(owner_id, provider_id, period_start, period_end)
cross join public.subscription_plans plan
where plan.code = 'pro_monthly';

insert into public.listings (
  id, owner_id, category_id, title, slug, description, city, status, published_at
)
values
  (
    '61000000-0000-4000-8000-000000000001',
    '60000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000005',
    'Annonce du professionnel actif',
    'annonce-professionnel-actif-contacts',
    'Description suffisamment longue pour tester les contacts actifs.',
    'Paris', 'published', now()
  ),
  (
    '61000000-0000-4000-8000-000000000002',
    '60000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000005',
    'Annonce du professionnel expiré',
    'annonce-professionnel-expire-contacts',
    'Description suffisamment longue pour tester les contacts expirés.',
    'Lyon', 'published', now() - interval '30 days'
  );

set local role anon;
select is((select count(*) from public.profile_contacts), 0::bigint, 'un visiteur ne lit aucun contact');
select is(
  (select seller_phone from public.get_listing_detail('annonce-professionnel-actif-contacts')),
  null::text,
  'le RPC masque les contacts au visiteur'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '60000000-0000-4000-8000-000000000003', true);
select results_eq(
  $$select profile_id from public.profile_contacts order by profile_id$$,
  $$values ('60000000-0000-4000-8000-000000000001'::uuid)$$,
  'un particulier lit seulement les contacts du professionnel abonné'
);
select is(
  (select seller_phone from public.get_listing_detail('annonce-professionnel-actif-contacts')),
  '+33 6 00 00 00 01'::text,
  'le RPC montre au particulier le contact du professionnel abonné'
);
select is(
  (select seller_phone from public.get_listing_detail('annonce-professionnel-expire-contacts')),
  null::text,
  'le RPC masque au particulier le contact du professionnel expiré'
);
select is(
  (select count(*) from public.get_listing_detail('annonce-professionnel-expire-contacts')),
  1::bigint,
  'l’annonce publiée reste lisible après expiration'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '60000000-0000-4000-8000-000000000001', true);
select results_eq(
  $$select profile_id from public.profile_contacts order by profile_id$$,
  $$values
      ('60000000-0000-4000-8000-000000000001'::uuid),
      ('60000000-0000-4000-8000-000000000002'::uuid)$$,
  'un professionnel abonné lit les contacts professionnels'
);
select is(
  (select seller_email from public.get_listing_detail('annonce-professionnel-expire-contacts')),
  'expired@example.test'::text,
  'le professionnel abonné accède au contact du professionnel expiré'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '60000000-0000-4000-8000-000000000002', true);
select results_eq(
  $$select profile_id from public.profile_contacts order by profile_id$$,
  $$values ('60000000-0000-4000-8000-000000000002'::uuid)$$,
  'un professionnel expiré lit seulement son propre contact'
);
reset role;

select throws_ok(
  $$insert into public.subscriptions (user_id, plan_id, status, provider, current_period_start, current_period_end)
    select '60000000-0000-4000-8000-000000000003', id, 'active', 'stripe', now(), now() + interval '1 month'
    from public.subscription_plans where code = 'pro_monthly'$$,
  'P0001',
  'Un abonnement est réservé à un compte professionnel actif',
  'un particulier ne peut recevoir aucun abonnement, même via une écriture privilégiée'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '60000000-0000-4000-8000-000000000003', true);
select throws_ok(
  $$insert into public.listings (owner_id, category_id, title, slug, description, city)
    values (
      '60000000-0000-4000-8000-000000000003',
      '10000000-0000-4000-8000-000000000005',
      'Annonce interdite particulier',
      'annonce-interdite-particulier-contacts',
      'Description suffisamment longue pour vérifier le refus particulier.',
      'Paris'
    )$$,
  '42501',
  null,
  'un particulier ne peut créer aucune annonce'
);
reset role;

select is(
  (select count(*) from public.public_profiles where id = '60000000-0000-4000-8000-000000000002'),
  1::bigint,
  'le profil professionnel reste public après expiration'
);

select * from finish();
rollback;

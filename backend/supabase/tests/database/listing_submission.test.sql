begin;
select plan(11);

insert into auth.users (id, email, raw_user_meta_data)
values ('72000000-0000-4000-8000-000000000001', 'direct-publish@example.test', '{"display_name":"Publication directe","account_type":"professional"}'::jsonb);

insert into public.subscriptions (user_id, plan_id, status, provider, provider_subscription_id, current_period_start, current_period_end)
select '72000000-0000-4000-8000-000000000001', id, 'active', 'stripe', 'sub_direct_publish', now(), now() + interval '1 month'
from public.subscription_plans where code = 'pro_monthly';

insert into public.categories (id, name, slug, position)
values ('72000000-0000-4000-8000-000000000002', 'Catégorie publication directe', 'categorie-publication-directe', 999);

insert into public.listings (id, owner_id, category_id, title, slug, description, city, status)
values (
  '72000000-0000-4000-8000-000000000003',
  '72000000-0000-4000-8000-000000000001',
  '72000000-0000-4000-8000-000000000002',
  'Annonce à publier',
  'annonce-a-publier',
  'Description suffisamment longue pour tester la publication directe.',
  'Nice',
  'draft'
);

select has_function('public', 'validate_listing_field_value', array[]::text[], 'la validation des champs dynamiques existe');
select has_function('public', 'validate_listing_submission', array[]::text[], 'la validation avant soumission existe');
select has_column('public', 'listings', 'price_unit', 'l’unité tarifaire est exposée sur les annonces');

select trigger_is(
  'public', 'listing_field_values', 'listing_field_values_validate',
  'public', 'validate_listing_field_value',
  'les valeurs dynamiques sont validées'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '72000000-0000-4000-8000-000000000001', true);

select lives_ok(
  $$update public.listings set status = 'published' where id = '72000000-0000-4000-8000-000000000003'$$,
  'le propriétaire abonné peut publier directement son annonce'
);
select is(
  (select status from public.listings where id = '72000000-0000-4000-8000-000000000003'),
  'published'::public.listing_status,
  'l’annonce devient immédiatement publiée'
);
select isnt(
  (select published_at from public.listings where id = '72000000-0000-4000-8000-000000000003'),
  null,
  'la date de publication est renseignée par le serveur'
);
select lives_ok(
  $$update public.listings set title = 'Annonce publiée modifiée' where id = '72000000-0000-4000-8000-000000000003'$$,
  'le propriétaire peut modifier son annonce publiée'
);
select lives_ok(
  $$insert into public.listings (id, owner_id, category_id, title, slug, description, city, status)
    values (
      '72000000-0000-4000-8000-000000000004',
      '72000000-0000-4000-8000-000000000001',
      '72000000-0000-4000-8000-000000000002',
      'Deuxième annonce à publier',
      'deuxieme-annonce-a-publier',
      'Description suffisamment longue pour tester une deuxième publication.',
      'Nice',
      'draft'
    )$$,
  'le même professionnel peut créer une deuxième annonce'
);
select lives_ok(
  $$update public.listings set status = 'published' where id = '72000000-0000-4000-8000-000000000004'$$,
  'le même professionnel peut publier une deuxième annonce'
);
reset role;

select trigger_is(
  'public', 'listings', 'listings_validate_submission',
  'public', 'validate_listing_submission',
  'la soumission en modération est validée'
);

select * from finish();
rollback;

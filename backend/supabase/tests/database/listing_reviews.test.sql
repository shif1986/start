begin;
select plan(9);

insert into auth.users (id, email, raw_user_meta_data)
values
  ('73000000-0000-4000-8000-000000000001', 'review-owner@example.test', '{"display_name":"Pro évalué","account_type":"professional"}'::jsonb),
  ('73000000-0000-4000-8000-000000000002', 'review-author@example.test', '{"display_name":"Pro auteur","account_type":"professional"}'::jsonb),
  ('73000000-0000-4000-8000-000000000003', 'review-other@example.test', '{"display_name":"Autre membre"}'::jsonb);

insert into public.subscriptions (user_id, plan_id, status, provider, provider_subscription_id, current_period_start, current_period_end)
select subscriber.id, plan.id, 'active', 'stripe', subscriber.provider_id, now(), now() + interval '1 month'
from (values
  ('73000000-0000-4000-8000-000000000001'::uuid, 'sub_review_owner'),
  ('73000000-0000-4000-8000-000000000002'::uuid, 'sub_review_author')
) subscriber(id, provider_id)
cross join public.subscription_plans plan
where plan.code = 'pro_monthly';

insert into public.listings (id, owner_id, category_id, title, slug, description, city, status, published_at)
values
  ('73000000-0000-4000-8000-000000000011', '73000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000005', 'Annonce à évaluer', 'annonce-a-evaluer', 'Description suffisamment longue pour tester les avis persistants.', 'Paris', 'published', now()),
  ('73000000-0000-4000-8000-000000000012', '73000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000005', 'Annonce de l’auteur', 'annonce-de-auteur', 'Description suffisamment longue pour vérifier les avis sur sa propre annonce.', 'Lyon', 'published', now());

select has_table('public', 'listing_reviews', 'la table des avis existe');
select col_has_check('public', 'listing_reviews', 'rating', 'la note est contrôlée par la base');

set local role authenticated;
select set_config('request.jwt.claim.sub', '73000000-0000-4000-8000-000000000002', true);
select lives_ok(
  $$insert into public.listing_reviews (listing_id, author_id, rating, body)
    values ('73000000-0000-4000-8000-000000000011', '73000000-0000-4000-8000-000000000002', 5, 'Très bonne expérience.')$$,
  'un professionnel actif peut évaluer un autre professionnel'
);
select throws_ok(
  $$insert into public.listing_reviews (listing_id, author_id, rating, body)
    values ('73000000-0000-4000-8000-000000000012', '73000000-0000-4000-8000-000000000002', 5, 'Mon propre avis.')$$,
  '42501', null,
  'un professionnel ne peut pas évaluer sa propre annonce'
);
select lives_ok(
  $$update public.listing_reviews set rating = 4, body = 'Avis mis à jour.' where author_id = '73000000-0000-4000-8000-000000000002'$$,
  'l’auteur peut modifier son avis'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '73000000-0000-4000-8000-000000000003', true);
select is((select count(*) from public.listing_reviews), 1::bigint, 'un membre voit les avis publiés');
select is(
  (select count(*) from public.listing_reviews where author_id = '73000000-0000-4000-8000-000000000002'),
  1::bigint,
  'un autre membre ne peut pas supprimer un avis qui ne lui appartient pas'
);
delete from public.listing_reviews where author_id = '73000000-0000-4000-8000-000000000002';
select is((select count(*) from public.listing_reviews), 1::bigint, 'la politique RLS ignore la suppression par un autre membre');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '73000000-0000-4000-8000-000000000002', true);
select lives_ok(
  $$delete from public.listing_reviews where author_id = '73000000-0000-4000-8000-000000000002'$$,
  'l’auteur peut supprimer son avis'
);
reset role;

select * from finish();
rollback;

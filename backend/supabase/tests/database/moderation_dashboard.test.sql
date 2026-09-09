begin;
select plan(10);

insert into auth.users (id, email, raw_user_meta_data) values
('74000000-0000-4000-8000-000000000001', 'moderator@example.test', '{"display_name":"Modérateur"}'::jsonb),
('74000000-0000-4000-8000-000000000002', 'owner-moderation@example.test', '{"display_name":"Pro modéré","account_type":"professional"}'::jsonb),
('74000000-0000-4000-8000-000000000003', 'reporter@example.test', '{"display_name":"Membre signalant"}'::jsonb);
alter table public.profiles disable trigger profiles_protect_privileges;
update public.profiles set role = 'moderator' where id = '74000000-0000-4000-8000-000000000001';
alter table public.profiles enable trigger profiles_protect_privileges;

insert into public.subscriptions(user_id, plan_id, status, provider, provider_subscription_id, current_period_start, current_period_end)
select '74000000-0000-4000-8000-000000000002', id, 'active', 'stripe', 'sub_moderation', now(), now() + interval '1 month' from public.subscription_plans where code = 'pro_monthly';
insert into public.listings(id, owner_id, category_id, title, slug, description, city, status, published_at)
values ('74000000-0000-4000-8000-000000000010', '74000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000005', 'Annonce à modérer', 'annonce-a-moderer', 'Description suffisamment longue pour la modération transactionnelle.', 'Paris', 'published', now());
insert into public.reports(id, reporter_id, listing_id, reason, details) values ('74000000-0000-4000-8000-000000000020', '74000000-0000-4000-8000-000000000003', '74000000-0000-4000-8000-000000000010', 'spam', 'Signalement de test suffisamment détaillé.');
insert into public.listing_reviews(id, listing_id, author_id, rating, body) values ('74000000-0000-4000-8000-000000000030', '74000000-0000-4000-8000-000000000010', '74000000-0000-4000-8000-000000000003', 2, 'Avis à modérer.');

select has_function('public', 'moderate_listing', array['uuid','public.listing_status','text'], 'RPC de modération annonce');
select has_function('public', 'moderate_profile', array['uuid','text','text'], 'RPC de modération profil');
select has_function('public', 'moderate_report', array['uuid','public.report_status','text'], 'RPC de modération signalement');
select has_function('public', 'moderate_review', array['uuid','text','text'], 'RPC de modération avis');

set local role authenticated;
select set_config('request.jwt.claim.sub', '74000000-0000-4000-8000-000000000003', true);
select throws_ok($$select public.moderate_profile('74000000-0000-4000-8000-000000000002', 'suspend', 'Abus confirmé')$$, '42501', 'Accès modération requis', 'un membre ne peut pas modérer');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '74000000-0000-4000-8000-000000000001', true);
select lives_ok($$select public.moderate_profile('74000000-0000-4000-8000-000000000003', 'verify', 'Identité contrôlée')$$, 'le modérateur vérifie un profil');
select lives_ok($$select public.moderate_report('74000000-0000-4000-8000-000000000020', 'resolved', 'Signalement confirmé')$$, 'le modérateur résout un signalement');
select lives_ok($$select public.moderate_review('74000000-0000-4000-8000-000000000030', 'hide', 'Contenu inapproprié')$$, 'le modérateur masque un avis');
select lives_ok($$select public.moderate_listing('74000000-0000-4000-8000-000000000010', 'rejected', 'Annonce non conforme')$$, 'le modérateur refuse une annonce');
select is((select count(*) from public.moderation_audit_log), 4::bigint, 'chaque décision produit une entrée d’audit');
reset role;

select * from finish();
rollback;

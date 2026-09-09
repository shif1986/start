begin;
select plan(9);

insert into auth.users(id, email, raw_user_meta_data) values
('75000000-0000-4000-8000-000000000001', 'report-owner@example.test', '{"display_name":"Pro signalé","account_type":"professional"}'::jsonb),
('75000000-0000-4000-8000-000000000002', 'report-author@example.test', '{"display_name":"Auteur signalement"}'::jsonb),
('75000000-0000-4000-8000-000000000003', 'report-other@example.test', '{"display_name":"Autre membre"}'::jsonb),
('75000000-0000-4000-8000-000000000004', 'report-moderator@example.test', '{"display_name":"Modérateur signalements"}'::jsonb);
alter table public.profiles disable trigger profiles_protect_privileges;
update public.profiles set role = 'moderator' where id = '75000000-0000-4000-8000-000000000004';
alter table public.profiles enable trigger profiles_protect_privileges;
insert into public.subscriptions(user_id, plan_id, status, provider, provider_subscription_id, current_period_start, current_period_end)
select '75000000-0000-4000-8000-000000000001', id, 'active', 'stripe', 'sub_report_owner', now(), now() + interval '1 month' from public.subscription_plans where code = 'pro_monthly';
insert into public.listings(id, owner_id, category_id, title, slug, description, city, status, published_at)
values ('75000000-0000-4000-8000-000000000010', '75000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000005', 'Annonce signalée', 'annonce-signalee', 'Description suffisamment longue pour tester les signalements.', 'Paris', 'published', now());

set local role authenticated;
select set_config('request.jwt.claim.sub', '75000000-0000-4000-8000-000000000002', true);
select lives_ok($$insert into public.reports(reporter_id, listing_id, reason, details) values ('75000000-0000-4000-8000-000000000002', '75000000-0000-4000-8000-000000000010', 'spam', 'Contenu répété et non pertinent.')$$, 'un membre actif crée un signalement');
select throws_ok($$insert into public.reports(reporter_id, listing_id, reason) values ('75000000-0000-4000-8000-000000000002', '75000000-0000-4000-8000-000000000010', 'spam')$$, '23505', null, 'un doublon est refusé');
select is((select count(*) from public.reports), 1::bigint, 'le déclarant lit son signalement');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '75000000-0000-4000-8000-000000000003', true);
select is((select count(*) from public.reports), 0::bigint, 'un autre membre ne lit pas le signalement');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '75000000-0000-4000-8000-000000000001', true);
select throws_ok($$insert into public.reports(reporter_id, listing_id, reason) values ('75000000-0000-4000-8000-000000000001', '75000000-0000-4000-8000-000000000010', 'other')$$, '42501', null, 'le propriétaire ne signale pas sa propre annonce');
select is((select count(*) from public.reports), 0::bigint, 'le propriétaire ne lit pas les signalements reçus');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '75000000-0000-4000-8000-000000000004', true);
select is((select count(*) from public.reports), 1::bigint, 'le modérateur lit les signalements');
select lives_ok($$select public.moderate_report((select id from public.reports limit 1), 'resolved', 'Signalement confirmé')$$, 'le traitement transactionnel réussit');
select is((select count(*) from public.moderation_audit_log where target_type = 'report'), 1::bigint, 'la décision est journalisée');
reset role;

select * from finish();
rollback;

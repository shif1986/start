begin;
select plan(5);

select has_table('public', 'stripe_webhook_events', 'le journal idempotent Stripe existe');

set local role anon;
select is((select count(*) from public.stripe_webhook_events), 0::bigint, 'un visiteur ne lit pas le journal Stripe');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000001', true);
select is((select count(*) from public.stripe_webhook_events), 0::bigint, 'un membre ne lit pas le journal Stripe');
select throws_ok(
  $$insert into public.stripe_webhook_events (id, event_type) values ('evt_forbidden', 'invoice.paid')$$,
  '42501', null, 'un membre ne peut pas fabriquer un événement Stripe'
);
reset role;

insert into public.stripe_webhook_events (id, event_type, processed_at)
values ('evt_test_unique', 'checkout.session.completed', now());
select throws_ok(
  $$insert into public.stripe_webhook_events (id, event_type) values ('evt_test_unique', 'checkout.session.completed')$$,
  '23505', null, 'un événement Stripe ne peut être journalisé deux fois'
);

select * from finish();
rollback;

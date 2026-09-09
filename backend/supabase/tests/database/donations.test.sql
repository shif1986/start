begin;
select plan(7);

select has_table('public', 'donations', 'la table des dons existe');
select has_table('public', 'donation_payments', 'la table des versements existe');

set local role anon;
select is((select count(*) from public.donations), 0::bigint, 'un visiteur ne lit pas les données donateur');
select throws_ok(
  $$insert into public.donations (donor_first_name, donor_last_name, donor_email, frequency, amount_cents, consent_at)
    values ('Ada', 'Test', 'ada@example.test', 'once', 2500, now())$$,
  '42501', null, 'un visiteur ne crée pas directement un don'
);
reset role;

insert into public.donations (id, donor_first_name, donor_last_name, donor_email, frequency, amount_cents, consent_at)
values ('a3000000-0000-4000-8000-000000000001', 'Ada', 'Test', 'ada@example.test', 'once', 2500, now());
select is((select status from public.donations where id = 'a3000000-0000-4000-8000-000000000001'), 'pending'::public.donation_status, 'un don commence en attente');
select throws_ok(
  $$insert into public.donations (donor_first_name, donor_last_name, donor_email, frequency, amount_cents, consent_at)
    values ('Ada', 'Test', 'ada@example.test', 'once', 99, now())$$,
  '23514', null, 'le serveur refuse un montant inférieur à un euro'
);

insert into public.donation_payments (donation_id, provider_payment_id, amount_cents, currency, status)
values ('a3000000-0000-4000-8000-000000000001', 'pi_unique_test', 2500, 'EUR', 'succeeded');
select throws_ok(
  $$insert into public.donation_payments (donation_id, provider_payment_id, amount_cents, currency, status)
    values ('a3000000-0000-4000-8000-000000000001', 'pi_unique_test', 2500, 'EUR', 'succeeded')$$,
  '23505', null, 'un versement Stripe est idempotent'
);

select * from finish();
rollback;

-- Usage ponctuel dans Supabase SQL Editor uniquement.
-- Ne pas transformer ce script en migration et ne pas l'exécuter pour un client réel.
do $$
declare
  test_email constant text := 'REMPLACER_PAR_EMAIL_DU_COMPTE_TEST';
  test_user_id uuid;
  monthly_plan_id uuid;
begin
  select auth_user.id
  into test_user_id
  from auth.users auth_user
  join public.profiles profile on profile.id = auth_user.id
  where lower(auth_user.email) = lower(test_email)
    and profile.account_type = 'professional'
    and coalesce(auth_user.raw_app_meta_data -> 'providers', '[]'::jsonb) @> '["google"]'::jsonb;

  if test_user_id is null then
    raise exception 'Compte Google professionnel de test introuvable';
  end if;

  if exists (
    select 1
    from public.subscriptions subscription
    where subscription.user_id = test_user_id
      and subscription.status in ('incomplete', 'trialing', 'active', 'past_due')
  ) then
    raise exception 'Ce compte possède déjà un abonnement courant';
  end if;

  select plan.id
  into monthly_plan_id
  from public.subscription_plans plan
  where plan.code = 'pro_monthly'
    and plan.is_active;

  if monthly_plan_id is null then
    raise exception 'Le plan pro_monthly actif est introuvable';
  end if;

  insert into public.subscriptions (
    user_id,
    plan_id,
    status,
    provider,
    provider_customer_id,
    provider_subscription_id,
    current_period_start,
    current_period_end
  )
  values (
    test_user_id,
    monthly_plan_id,
    'trialing',
    'stripe',
    'manual_test',
    'manual_test_' || gen_random_uuid()::text,
    now(),
    now() + interval '24 hours'
  );
end;
$$;

select
  subscription.status,
  plan.code,
  subscription.current_period_end
from public.subscriptions subscription
join public.subscription_plans plan on plan.id = subscription.plan_id
where subscription.provider_customer_id = 'manual_test'
order by subscription.created_at desc
limit 1;

-- Retire tous les abonnements accordés par grant_test_subscription.sql.
update public.subscriptions
set
  status = 'canceled',
  canceled_at = now(),
  current_period_end = least(current_period_end, now())
where provider_customer_id = 'manual_test'
  and status in ('incomplete', 'trialing', 'active', 'past_due');

select count(*) as remaining_manual_test_subscriptions
from public.subscriptions
where provider_customer_id = 'manual_test'
  and status in ('incomplete', 'trialing', 'active', 'past_due');

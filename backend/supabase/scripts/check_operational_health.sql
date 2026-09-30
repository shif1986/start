-- Contrôle en lecture seule à exécuter dans SQL Editor avec un compte administrateur.
-- Il ne modifie aucune donnée et n'affiche aucune donnée personnelle.

with metrics as (
  select
    'reports_unreviewed_24h'::text as metric,
    count(*)::bigint as value,
    0::bigint as warning_threshold
  from public.reports
  where status in ('open', 'reviewing')
    and created_at < now() - interval '24 hours'

  union all

  select
    'listings_pending_24h',
    count(*)::bigint,
    0::bigint
  from public.listings
  where status = 'pending'
    and updated_at < now() - interval '24 hours'

  union all

  select
    'stripe_webhooks_failed'::text as metric,
    count(*)::bigint as value,
    0::bigint as warning_threshold
  from public.stripe_webhook_events
  where last_error is not null

  union all

  select
    'stripe_webhooks_stale',
    count(*)::bigint,
    0::bigint
  from public.stripe_webhook_events
  where processed_at is null
    and received_at < now() - interval '10 minutes'

  union all

  select
    'donations_pending_stale',
    count(*)::bigint,
    0::bigint
  from public.donations
  where status = 'pending'
    and created_at < now() - interval '2 hours'

  union all

  select
    'stripe_subscriptions_past_due',
    count(*)::bigint,
    0::bigint
  from public.subscriptions
  where provider = 'stripe'
    and status in ('past_due', 'unpaid')

  union all

  select
    'active_subscriptions_expired',
    count(*)::bigint,
    0::bigint
  from public.subscriptions
  where status in ('trialing', 'active')
    and current_period_end < now()
)
select
  metric,
  value,
  case when value > warning_threshold then 'ALERTE' else 'OK' end as status
from metrics
order by metric;

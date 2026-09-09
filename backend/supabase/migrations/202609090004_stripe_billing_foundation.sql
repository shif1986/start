create table public.stripe_webhook_events (
  id text primary key check (id ~ '^evt_[A-Za-z0-9_]+$'),
  event_type text not null check (char_length(event_type) between 3 and 120),
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  last_error text check (last_error is null or char_length(last_error) <= 1000)
);

alter table public.stripe_webhook_events enable row level security;

revoke all on public.stripe_webhook_events from anon, authenticated;

create index stripe_webhook_events_unprocessed_idx
on public.stripe_webhook_events(received_at)
where processed_at is null;

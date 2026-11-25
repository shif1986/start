create type public.professional_access_duration as enum ('one_year', 'lifetime');

create table public.professional_access_grants (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(btrim(email)) and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  duration public.professional_access_duration not null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  revoked_at timestamptz,
  note text check (note is null or char_length(note) <= 500),
  granted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((duration = 'lifetime' and ends_at is null) or (duration = 'one_year' and ends_at > starts_at))
);

create index professional_access_grants_active_email_idx
  on public.professional_access_grants (email)
  where revoked_at is null;

create trigger professional_access_grants_set_updated_at
before update on public.professional_access_grants
for each row execute function public.set_updated_at();

alter table public.professional_access_grants enable row level security;
revoke all on public.professional_access_grants from public, anon, authenticated;
grant all on public.professional_access_grants to service_role;

create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_mode_activation_allowed boolean := coalesce(current_setting('app.account_mode_activation_user_id', true) = auth.uid()::text, false);
  professional_access_grant_allowed boolean := coalesce(current_setting('app.professional_access_grant_profile_id', true) = new.id::text, false);
begin
  if not public.is_admin() and (
    new.role <> old.role
    or new.is_verified <> old.is_verified
    or new.account_type <> old.account_type
    or new.account_status <> old.account_status
    or (new.account_types is distinct from old.account_types and not (account_mode_activation_allowed or professional_access_grant_allowed))
  ) then
    raise exception 'Seul un administrateur peut modifier le rôle, le type, la vérification ou la suspension';
  end if;
  return new;
end;
$$;

create or replace function public.apply_professional_access_grant(p_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_profile_id uuid;
begin
  select profile.id into target_profile_id
  from public.profiles profile
  join auth.users auth_user on auth_user.id = profile.id
  where lower(auth_user.email) = lower(btrim(p_email))
    and exists (
      select 1 from public.professional_access_grants access_grant
      where access_grant.email = lower(btrim(p_email))
        and access_grant.revoked_at is null
        and access_grant.starts_at <= now()
        and (access_grant.ends_at is null or access_grant.ends_at > now())
    )
  limit 1;

  if target_profile_id is null then return; end if;

  perform set_config('app.professional_access_grant_profile_id', target_profile_id::text, true);
  update public.profiles
  set account_types = case
    when 'professional'::public.account_type = any(account_types) then account_types
    else array_append(account_types, 'professional'::public.account_type)
  end
  where id = target_profile_id;
  perform set_config('app.professional_access_grant_profile_id', '', true);
end;
$$;

create or replace function public.sync_professional_access_grant()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.revoked_at is null and new.starts_at <= now() and (new.ends_at is null or new.ends_at > now()) then
    perform public.apply_professional_access_grant(new.email);
  end if;
  return new;
end;
$$;

create trigger professional_access_grants_sync_profile
after insert or update of email, starts_at, ends_at, revoked_at on public.professional_access_grants
for each row execute function public.sync_professional_access_grant();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  safe_username text;
  safe_display_name text;
  safe_company_name text;
  requested_account_type public.account_type;
  has_professional_grant boolean;
begin
  safe_username := lower(regexp_replace(
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1), 'user'),
    '[^a-zA-Z0-9_-]', '', 'g'
  ));
  safe_username := left(coalesce(nullif(safe_username, ''), 'user'), 21) || '-' || left(new.id::text, 8);
  safe_display_name := left(btrim(coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), nullif(new.raw_user_meta_data ->> 'full_name', ''), nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1), 'Utilisateur')), 80);
  if char_length(safe_display_name) < 2 then safe_display_name := 'Utilisateur'; end if;
  select exists (
    select 1 from public.professional_access_grants access_grant
    where access_grant.email = lower(new.email)
      and access_grant.revoked_at is null
      and access_grant.starts_at <= now()
      and (access_grant.ends_at is null or access_grant.ends_at > now())
  ) into has_professional_grant;
  requested_account_type := case when new.raw_user_meta_data ->> 'account_type' = 'professional' or has_professional_grant then 'professional'::public.account_type else 'customer'::public.account_type end;
  safe_company_name := case when requested_account_type = 'professional'::public.account_type then nullif(left(btrim(new.raw_user_meta_data ->> 'company_name'), 120), '') else null end;
  if safe_company_name is not null and char_length(safe_company_name) < 2 then safe_company_name := null; end if;
  insert into public.profiles (id, username, display_name, company_name, account_type, account_types)
  values (new.id, safe_username, safe_display_name, safe_company_name, requested_account_type, array[requested_account_type]);
  return new;
end;
$$;

create or replace function public.has_active_professional_subscription(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles profile
    join auth.users auth_user on auth_user.id = profile.id
    where profile.id = target_user_id
      and 'professional'::public.account_type = any(profile.account_types)
      and profile.account_status = 'active'
      and (
        exists (
          select 1 from public.subscriptions subscription
          where subscription.user_id = profile.id
            and subscription.status in ('trialing', 'active')
            and subscription.current_period_end > now()
        )
        or exists (
          select 1 from public.professional_access_grants access_grant
          where access_grant.email = lower(auth_user.email)
            and access_grant.revoked_at is null
            and access_grant.starts_at <= now()
            and (access_grant.ends_at is null or access_grant.ends_at > now())
        )
      )
  );
$$;

create or replace function public.has_active_professional_subscription()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$ select public.has_active_professional_subscription(auth.uid()); $$;

create or replace function public.get_my_professional_access_grant()
returns table (grant_id uuid, ends_at timestamptz, duration public.professional_access_duration)
language sql
stable
security definer
set search_path = ''
as $$
  select access_grant.id, access_grant.ends_at, access_grant.duration
  from public.professional_access_grants access_grant
  join auth.users auth_user on lower(auth_user.email) = access_grant.email
  join public.profiles profile on profile.id = auth_user.id
  where auth_user.id = auth.uid()
    and 'professional'::public.account_type = any(profile.account_types)
    and profile.account_status = 'active'
    and access_grant.revoked_at is null
    and access_grant.starts_at <= now()
    and (access_grant.ends_at is null or access_grant.ends_at > now())
  limit 1;
$$;

revoke all on function public.apply_professional_access_grant(text) from public;
grant execute on function public.apply_professional_access_grant(text) to service_role;
revoke all on function public.get_my_professional_access_grant() from public;
grant execute on function public.get_my_professional_access_grant() to authenticated;
revoke all on function public.has_active_professional_subscription(uuid) from public;
grant execute on function public.has_active_professional_subscription(uuid) to authenticated;
revoke all on function public.has_active_professional_subscription() from public;
grant execute on function public.has_active_professional_subscription() to authenticated;

notify pgrst, 'reload schema';

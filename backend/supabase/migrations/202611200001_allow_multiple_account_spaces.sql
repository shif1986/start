alter table public.profiles
  add column if not exists account_types public.account_type[];

update public.profiles
set account_types = array[account_type]
where account_types is null or cardinality(account_types) = 0;

alter table public.profiles
  alter column account_types set default array['customer'::public.account_type],
  alter column account_types set not null;

alter table public.profiles drop constraint if exists profiles_account_types_not_empty;
alter table public.profiles add constraint profiles_account_types_not_empty
  check (cardinality(account_types) > 0 and account_type = any(account_types));

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
begin
  safe_username := lower(regexp_replace(
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1), 'user'),
    '[^a-zA-Z0-9_-]', '', 'g'
  ));
  safe_username := left(coalesce(nullif(safe_username, ''), 'user'), 21) || '-' || left(new.id::text, 8);
  safe_display_name := left(btrim(coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), nullif(new.raw_user_meta_data ->> 'full_name', ''), nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1), 'Utilisateur')), 80);
  if char_length(safe_display_name) < 2 then safe_display_name := 'Utilisateur'; end if;
  requested_account_type := case when new.raw_user_meta_data ->> 'account_type' = 'professional' then 'professional'::public.account_type else 'customer'::public.account_type end;
  safe_company_name := case when requested_account_type = 'professional'::public.account_type then nullif(left(btrim(new.raw_user_meta_data ->> 'company_name'), 120), '') else null end;
  if safe_company_name is not null and char_length(safe_company_name) < 2 then safe_company_name := null; end if;

  insert into public.profiles (id, username, display_name, company_name, account_type, account_types)
  values (new.id, safe_username, safe_display_name, safe_company_name, requested_account_type, array[requested_account_type]);
  return new;
end;
$$;

create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_mode_activation_allowed boolean := coalesce(current_setting('app.account_mode_activation_user_id', true) = auth.uid()::text, false);
begin
  if not public.is_admin() and (
    new.role <> old.role
    or new.is_verified <> old.is_verified
    or new.account_type <> old.account_type
    or new.account_status <> old.account_status
    or (new.account_types is distinct from old.account_types and not account_mode_activation_allowed)
  ) then
    raise exception 'Seul un administrateur peut modifier le rôle, le type, la vérification ou la suspension';
  end if;
  return new;
end;
$$;

create or replace function public.enable_my_account_type(requested_account_type public.account_type)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_account_types public.account_type[];
begin
  if current_user_id is null then raise exception 'Authentification requise'; end if;
  select account_types into current_account_types from public.profiles where id = current_user_id and account_status = 'active' for update;
  if not found then raise exception 'Profil actif introuvable'; end if;
  if requested_account_type = any(current_account_types) then return; end if;

  perform set_config('app.account_mode_activation_user_id', current_user_id::text, true);
  update public.profiles set account_types = array_append(account_types, requested_account_type) where id = current_user_id;
  perform set_config('app.account_mode_activation_user_id', '', true);
end;
$$;

create or replace function public.complete_google_account_type(requested_account_type public.account_type)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  google_is_linked boolean := coalesce((auth.jwt() -> 'app_metadata' -> 'providers') @> '["google"]'::jsonb, false);
begin
  if auth.uid() is null then raise exception 'Authentification requise'; end if;
  if not google_is_linked then raise exception 'Cette finalisation est réservée aux comptes Google'; end if;
  perform public.enable_my_account_type(requested_account_type);
end;
$$;

create or replace function public.has_active_professional_subscription(target_user_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles profile join public.subscriptions subscription on subscription.user_id = profile.id
    where profile.id = target_user_id and 'professional'::public.account_type = any(profile.account_types)
      and profile.account_status = 'active' and subscription.status in ('trialing', 'active') and subscription.current_period_end > now()
  );
$$;

create or replace function public.has_active_professional_subscription()
returns boolean
language sql stable security definer set search_path = ''
as $$ select public.has_active_professional_subscription(auth.uid()); $$;

create or replace function public.can_read_professional_contact(target_profile_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select public.is_admin() or (auth.uid() = target_profile_id and public.is_active_account(auth.uid())) or exists (
    select 1 from public.profiles viewer join public.profiles target on target.id = target_profile_id
    where viewer.id = auth.uid() and viewer.account_status = 'active'
      and 'professional'::public.account_type = any(target.account_types) and target.account_status = 'active'
      and (('customer'::public.account_type = any(viewer.account_types) and public.has_active_professional_subscription(target.id))
        or ('professional'::public.account_type = any(viewer.account_types) and public.has_active_professional_subscription(viewer.id)))
  );
$$;

create or replace function public.require_professional_subscription_owner()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if not exists (select 1 from public.profiles profile where profile.id = new.user_id and 'professional'::public.account_type = any(profile.account_types) and profile.account_status = 'active') then
    raise exception 'Un abonnement est réservé à un compte professionnel actif';
  end if;
  return new;
end;
$$;

create or replace function public.record_professional_contact(p_listing_id uuid, p_channel text)
returns void
language plpgsql security definer set search_path = ''
as $$
declare target_professional_id uuid;
begin
  if p_channel not in ('phone', 'email', 'address') then raise exception 'Type de contact invalide' using errcode = '22023'; end if;
  if not exists (select 1 from public.profiles where id = auth.uid() and 'customer'::public.account_type = any(account_types) and account_status = 'active') then
    raise exception 'Seul un compte particulier actif peut enregistrer ce contact' using errcode = '42501';
  end if;
  select owner_id into target_professional_id from public.listings where id = p_listing_id and status = 'published';
  if target_professional_id is null or not public.can_read_professional_contact(target_professional_id) then raise exception 'Les coordonnées de ce professionnel ne sont pas accessibles' using errcode = '42501'; end if;
  insert into public.professional_contact_clicks (user_id, professional_id, last_listing_id, last_channel, phone_click_count, email_click_count, address_click_count)
  values (auth.uid(), target_professional_id, p_listing_id, p_channel, case when p_channel = 'phone' then 1 else 0 end, case when p_channel = 'email' then 1 else 0 end, case when p_channel = 'address' then 1 else 0 end)
  on conflict (user_id, professional_id) do update set
    last_listing_id = excluded.last_listing_id, click_count = public.professional_contact_clicks.click_count + 1,
    phone_click_count = public.professional_contact_clicks.phone_click_count + case when p_channel = 'phone' then 1 else 0 end,
    email_click_count = public.professional_contact_clicks.email_click_count + case when p_channel = 'email' then 1 else 0 end,
    address_click_count = public.professional_contact_clicks.address_click_count + case when p_channel = 'address' then 1 else 0 end,
    last_channel = excluded.last_channel, last_clicked_at = now();
end;
$$;

create or replace view public.active_professional_profiles with (security_barrier = true) as
select id, case when auth.uid() is not null then username end as username, case when auth.uid() is not null then display_name end as display_name,
  case when auth.uid() is not null then avatar_url end as avatar_url, case when auth.uid() is not null then bio end as bio,
  case when auth.uid() is not null then city end as city, case when auth.uid() is not null then is_verified else false end as is_verified,
  created_at, case when auth.uid() is not null then company_name end as company_name
from public.profiles where 'professional'::public.account_type = any(account_types) and account_status = 'active'::public.account_status;

create or replace function public.update_my_profile(p_username text, p_display_name text, p_company_name text default null, p_avatar_url text default null, p_bio text default null, p_city text default null, p_phone text default null, p_public_email text default null, p_postal_address text default null)
returns void language plpgsql set search_path = ''
as $$
declare current_user_id uuid := auth.uid();
begin
  if current_user_id is null then raise exception 'Authentification requise'; end if;
  if not public.is_active_account(current_user_id) then raise exception 'Compte inactif'; end if;
  update public.profiles set username = lower(btrim(p_username)), display_name = btrim(p_display_name),
    company_name = case when 'professional'::public.account_type = any(account_types) then nullif(btrim(p_company_name), '') else null end,
    avatar_url = nullif(btrim(p_avatar_url), ''), bio = nullif(btrim(p_bio), ''), city = nullif(btrim(p_city), '') where id = current_user_id;
  if not found then raise exception 'Profil introuvable'; end if;
  insert into public.profile_contacts (profile_id, phone, public_email, postal_address)
  values (current_user_id, nullif(btrim(p_phone), ''), nullif(lower(btrim(p_public_email)), ''), nullif(btrim(p_postal_address), ''))
  on conflict (profile_id) do update set phone = excluded.phone, public_email = excluded.public_email, postal_address = excluded.postal_address;
end;
$$;

create or replace function public.complete_registration_identity(p_display_name text, p_company_name text default null)
returns void language plpgsql set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'Authentification requise'; end if;
  if char_length(btrim(p_display_name)) not between 2 and 80 then raise exception 'Nom personnel invalide'; end if;
  update public.profiles set display_name = btrim(p_display_name), company_name = case when 'professional'::public.account_type = any(account_types) then nullif(btrim(p_company_name), '') else null end
  where id = auth.uid() and account_status = 'active'::public.account_status;
  if not found then raise exception 'Profil actif introuvable'; end if;
end;
$$;

revoke all on function public.enable_my_account_type(public.account_type) from public;
grant execute on function public.enable_my_account_type(public.account_type) to authenticated;
revoke all on function public.complete_google_account_type(public.account_type) from public;
grant execute on function public.complete_google_account_type(public.account_type) to authenticated;
revoke all on function public.update_my_profile(text, text, text, text, text, text, text, text, text) from public;
grant execute on function public.update_my_profile(text, text, text, text, text, text, text, text, text) to authenticated;
notify pgrst, 'reload schema';

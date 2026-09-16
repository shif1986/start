alter table public.profiles
add column company_name text
check (company_name is null or char_length(btrim(company_name)) between 2 and 120);

create or replace view public.public_profiles
with (security_barrier = true)
as
select id, username, display_name, avatar_url, bio, city, account_type, is_verified, created_at, company_name
from public.profiles;

create or replace view public.active_professional_profiles
with (security_barrier = true)
as
select id, username, display_name, avatar_url, bio, city, is_verified, created_at, company_name
from public.profiles
where account_type = 'professional'::public.account_type
  and account_status = 'active'::public.account_status;

revoke all on public.public_profiles, public.active_professional_profiles from public;
grant select on public.public_profiles, public.active_professional_profiles to anon, authenticated;

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

  safe_display_name := left(btrim(coalesce(
    nullif(new.raw_user_meta_data ->> 'display_name', ''),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'name', ''),
    split_part(new.email, '@', 1),
    'Utilisateur'
  )), 80);
  if char_length(safe_display_name) < 2 then
    safe_display_name := 'Utilisateur';
  end if;

  requested_account_type := case
    when new.raw_user_meta_data ->> 'account_type' = 'professional' then 'professional'::public.account_type
    else 'customer'::public.account_type
  end;

  safe_company_name := case
    when requested_account_type = 'professional'::public.account_type
      then nullif(left(btrim(new.raw_user_meta_data ->> 'company_name'), 120), '')
    else null
  end;
  if safe_company_name is not null and char_length(safe_company_name) < 2 then
    safe_company_name := null;
  end if;

  insert into public.profiles (id, username, display_name, company_name, account_type)
  values (new.id, safe_username, safe_display_name, safe_company_name, requested_account_type);

  return new;
end;
$$;

drop function public.update_my_profile(text, text, text, text, text, text, text, text);

create function public.update_my_profile(
  p_username text,
  p_display_name text,
  p_company_name text default null,
  p_avatar_url text default null,
  p_bio text default null,
  p_city text default null,
  p_phone text default null,
  p_public_email text default null,
  p_postal_address text default null
)
returns void
language plpgsql
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentification requise';
  end if;

  if not public.is_active_account(current_user_id) then
    raise exception 'Compte inactif';
  end if;

  update public.profiles
  set
    username = lower(btrim(p_username)),
    display_name = btrim(p_display_name),
    company_name = case
      when account_type = 'professional'::public.account_type then nullif(btrim(p_company_name), '')
      else null
    end,
    avatar_url = nullif(btrim(p_avatar_url), ''),
    bio = nullif(btrim(p_bio), ''),
    city = nullif(btrim(p_city), '')
  where id = current_user_id;

  if not found then
    raise exception 'Profil introuvable';
  end if;

  insert into public.profile_contacts (profile_id, phone, public_email, postal_address)
  values (
    current_user_id,
    nullif(btrim(p_phone), ''),
    nullif(lower(btrim(p_public_email)), ''),
    nullif(btrim(p_postal_address), '')
  )
  on conflict (profile_id) do update set
    phone = excluded.phone,
    public_email = excluded.public_email,
    postal_address = excluded.postal_address;
end;
$$;

revoke all on function public.update_my_profile(text, text, text, text, text, text, text, text, text) from public;
grant execute on function public.update_my_profile(text, text, text, text, text, text, text, text, text) to authenticated;

create or replace function public.complete_registration_identity(
  p_display_name text,
  p_company_name text default null
)
returns void
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentification requise';
  end if;

  if char_length(btrim(p_display_name)) not between 2 and 80 then
    raise exception 'Nom personnel invalide';
  end if;

  update public.profiles
  set
    display_name = btrim(p_display_name),
    company_name = case
      when account_type = 'professional'::public.account_type then nullif(btrim(p_company_name), '')
      else null
    end
  where id = auth.uid()
    and account_status = 'active'::public.account_status;

  if not found then
    raise exception 'Profil actif introuvable';
  end if;
end;
$$;

revoke all on function public.complete_registration_identity(text, text) from public;
grant execute on function public.complete_registration_identity(text, text) to authenticated;

notify pgrst, 'reload schema';

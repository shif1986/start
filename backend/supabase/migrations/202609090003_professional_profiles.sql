create view public.active_professional_profiles
with (security_barrier = true)
as
select id, username, display_name, avatar_url, bio, city, is_verified, created_at
from public.profiles
where account_type = 'professional'::public.account_type
  and account_status = 'active'::public.account_status;

revoke all on public.active_professional_profiles from public;
grant select on public.active_professional_profiles to anon, authenticated;

create or replace function public.update_my_profile(
  p_username text,
  p_display_name text,
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
    avatar_url = nullif(btrim(p_avatar_url), ''),
    bio = nullif(btrim(p_bio), ''),
    city = nullif(btrim(p_city), '')
  where id = current_user_id;

  if not found then
    raise exception 'Profil introuvable';
  end if;

  insert into public.profile_contacts (
    profile_id, phone, public_email, postal_address
  ) values (
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

revoke all on function public.update_my_profile(text, text, text, text, text, text, text, text) from public;
grant execute on function public.update_my_profile(text, text, text, text, text, text, text, text) to authenticated;

notify pgrst, 'reload schema';

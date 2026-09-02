create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  oauth_completion_allowed boolean := coalesce(
    current_setting('app.oauth_account_completion_user_id', true) = auth.uid()::text,
    false
  );
begin
  if not public.is_admin() and (
    new.role <> old.role
    or new.is_verified <> old.is_verified
    or (new.account_type <> old.account_type and not oauth_completion_allowed)
    or (to_jsonb(new) -> 'account_status') is distinct from (to_jsonb(old) -> 'account_status')
  ) then
    raise exception 'Seul un administrateur peut modifier le rôle, le type, la vérification ou la suspension';
  end if;
  return new;
end;
$$;

create or replace function public.complete_google_account_type(
  requested_account_type public.account_type
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_account_type public.account_type;
  profile_created_at timestamptz;
  google_is_linked boolean := coalesce(
    (auth.jwt() -> 'app_metadata' -> 'providers') @> '["google"]'::jsonb,
    false
  );
begin
  if current_user_id is null then
    raise exception 'Authentification requise';
  end if;

  if requested_account_type <> 'professional'::public.account_type then
    return;
  end if;

  if not google_is_linked then
    raise exception 'Cette finalisation est réservée aux comptes Google';
  end if;

  select profile.account_type, profile.created_at
  into current_account_type, profile_created_at
  from public.profiles profile
  where profile.id = current_user_id
  for update;

  if not found then
    raise exception 'Profil introuvable';
  end if;

  if current_account_type = 'professional'::public.account_type then
    return;
  end if;

  if current_account_type <> 'customer'::public.account_type
    or profile_created_at < now() - interval '30 minutes'
  then
    raise exception 'Le type de compte ne peut plus être finalisé';
  end if;

  perform set_config('app.oauth_account_completion_user_id', current_user_id::text, true);

  update public.profiles
  set account_type = 'professional'::public.account_type
  where id = current_user_id;
end;
$$;

revoke all on function public.complete_google_account_type(public.account_type) from public;
grant execute on function public.complete_google_account_type(public.account_type) to authenticated;

notify pgrst, 'reload schema';

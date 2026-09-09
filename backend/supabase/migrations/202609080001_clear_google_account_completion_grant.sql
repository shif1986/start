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

  -- Limite l'autorisation spéciale à l'UPDATE interne précédent.
  perform set_config('app.oauth_account_completion_user_id', '', true);
end;
$$;

revoke all on function public.complete_google_account_type(public.account_type) from public;
grant execute on function public.complete_google_account_type(public.account_type) to authenticated;

notify pgrst, 'reload schema';

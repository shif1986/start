create or replace view public.public_profiles
with (security_barrier = true)
as
select
  id,
  case when auth.uid() is not null then username end as username,
  case when auth.uid() is not null then display_name end as display_name,
  case when auth.uid() is not null then avatar_url end as avatar_url,
  case when auth.uid() is not null then bio end as bio,
  case when auth.uid() is not null then city end as city,
  account_type,
  case when auth.uid() is not null then is_verified else false end as is_verified,
  created_at,
  case when auth.uid() is not null then company_name end as company_name
from public.profiles;

create or replace view public.active_professional_profiles
with (security_barrier = true)
as
select
  id,
  case when auth.uid() is not null then username end as username,
  case when auth.uid() is not null then display_name end as display_name,
  case when auth.uid() is not null then avatar_url end as avatar_url,
  case when auth.uid() is not null then bio end as bio,
  case when auth.uid() is not null then city end as city,
  case when auth.uid() is not null then is_verified else false end as is_verified,
  created_at,
  case when auth.uid() is not null then company_name end as company_name
from public.profiles
where account_type = 'professional'::public.account_type
  and account_status = 'active'::public.account_status;

revoke all on public.public_profiles, public.active_professional_profiles from public;
grant select on public.public_profiles, public.active_professional_profiles to anon, authenticated;

notify pgrst, 'reload schema';

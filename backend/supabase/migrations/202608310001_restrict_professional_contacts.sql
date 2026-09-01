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
    join public.subscriptions subscription on subscription.user_id = profile.id
    where profile.id = target_user_id
      and profile.account_type = 'professional'
      and subscription.status in ('trialing', 'active')
      and subscription.current_period_end > now()
  );
$$;

revoke all on function public.has_active_professional_subscription(uuid) from public;

create or replace function public.can_read_professional_contact(target_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    auth.uid() = target_profile_id
    or public.is_admin()
    or exists (
      select 1
      from public.profiles viewer
      join public.profiles target on target.id = target_profile_id
      where viewer.id = auth.uid()
        and target.account_type = 'professional'
        and (
          (
            viewer.account_type = 'customer'
            and public.has_active_professional_subscription(target.id)
          )
          or (
            viewer.account_type = 'professional'
            and public.has_active_professional_subscription(viewer.id)
          )
        )
    );
$$;

revoke all on function public.can_read_professional_contact(uuid) from public;
grant execute on function public.can_read_professional_contact(uuid) to authenticated;

drop policy if exists "profile_contacts_authenticated_read" on public.profile_contacts;
create policy "profile_contacts_authorized_read"
on public.profile_contacts
for select
to authenticated
using (public.can_read_professional_contact(profile_id));

create or replace function public.require_professional_subscription_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.profiles profile
    where profile.id = new.user_id
      and profile.account_type = 'professional'
  ) then
    raise exception 'Un abonnement est réservé à un compte professionnel';
  end if;

  return new;
end;
$$;

drop trigger if exists subscriptions_require_professional_owner on public.subscriptions;
create trigger subscriptions_require_professional_owner
before insert or update of user_id on public.subscriptions
for each row execute function public.require_professional_subscription_owner();

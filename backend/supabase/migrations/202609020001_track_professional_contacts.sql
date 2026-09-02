create table public.professional_contact_clicks (
  user_id uuid not null references auth.users(id) on delete cascade,
  professional_id uuid not null references auth.users(id) on delete cascade,
  last_listing_id uuid references public.listings(id) on delete set null,
  click_count integer not null default 1 check (click_count > 0),
  phone_click_count integer not null default 0 check (phone_click_count >= 0),
  email_click_count integer not null default 0 check (email_click_count >= 0),
  address_click_count integer not null default 0 check (address_click_count >= 0),
  last_channel text not null check (last_channel in ('phone', 'email', 'address')),
  first_clicked_at timestamptz not null default now(),
  last_clicked_at timestamptz not null default now(),
  primary key (user_id, professional_id)
);

alter table public.professional_contact_clicks enable row level security;

create policy "professional_contact_clicks_owner_read"
on public.professional_contact_clicks for select to authenticated
using (user_id = auth.uid());

revoke all on table public.professional_contact_clicks from anon, authenticated;
grant select on table public.professional_contact_clicks to authenticated;

create or replace function public.record_professional_contact(p_listing_id uuid, p_channel text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_professional_id uuid;
begin
  if p_channel not in ('phone', 'email', 'address') then
    raise exception 'Type de contact invalide' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = auth.uid()
      and account_type = 'customer'
      and account_status = 'active'
  ) then
    raise exception 'Seul un compte particulier actif peut enregistrer ce contact' using errcode = '42501';
  end if;

  select owner_id into target_professional_id
  from public.listings
  where id = p_listing_id and status = 'published';

  if target_professional_id is null
     or not public.can_read_professional_contact(target_professional_id) then
    raise exception 'Les coordonnées de ce professionnel ne sont pas accessibles' using errcode = '42501';
  end if;

  insert into public.professional_contact_clicks (
    user_id, professional_id, last_listing_id, last_channel,
    phone_click_count, email_click_count, address_click_count
  ) values (
    auth.uid(), target_professional_id, p_listing_id, p_channel,
    case when p_channel = 'phone' then 1 else 0 end,
    case when p_channel = 'email' then 1 else 0 end,
    case when p_channel = 'address' then 1 else 0 end
  )
  on conflict (user_id, professional_id) do update
  set last_listing_id = excluded.last_listing_id,
      click_count = public.professional_contact_clicks.click_count + 1,
      phone_click_count = public.professional_contact_clicks.phone_click_count + case when p_channel = 'phone' then 1 else 0 end,
      email_click_count = public.professional_contact_clicks.email_click_count + case when p_channel = 'email' then 1 else 0 end,
      address_click_count = public.professional_contact_clicks.address_click_count + case when p_channel = 'address' then 1 else 0 end,
      last_channel = p_channel,
      last_clicked_at = now();
end;
$$;

revoke all on function public.record_professional_contact(uuid, text) from public;
grant execute on function public.record_professional_contact(uuid, text) to authenticated;

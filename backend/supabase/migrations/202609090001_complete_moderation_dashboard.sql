create table public.moderation_audit_log (
  id uuid primary key default gen_random_uuid(),
  moderator_id uuid not null references auth.users(id) on delete restrict,
  action text not null check (char_length(action) between 3 and 80),
  target_type text not null check (target_type in ('listing', 'profile', 'report', 'review')),
  target_id uuid not null,
  reason text not null check (char_length(btrim(reason)) between 5 and 1000),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index moderation_audit_log_created_idx on public.moderation_audit_log(created_at desc);
alter table public.moderation_audit_log enable row level security;
create policy "moderation_audit_admin_read" on public.moderation_audit_log for select to authenticated using (public.is_admin());
revoke all on public.moderation_audit_log from public, anon, authenticated;
grant select on public.moderation_audit_log to authenticated;

create or replace function public.moderate_listing(p_listing_id uuid, p_decision public.listing_status, p_reason text)
returns void language plpgsql security definer set search_path = '' as $$
declare previous_status public.listing_status;
begin
  if not public.is_admin() then raise exception 'Accès modération requis' using errcode = '42501'; end if;
  if p_decision not in ('published', 'rejected', 'archived') then raise exception 'Décision de modération invalide'; end if;
  if char_length(btrim(coalesce(p_reason, ''))) < 5 then raise exception 'Un motif de cinq caractères minimum est requis'; end if;
  select status into previous_status from public.listings where id = p_listing_id for update;
  if not found then raise exception 'Annonce introuvable'; end if;
  update public.listings set status = p_decision,
    published_at = case when p_decision = 'published' then coalesce(published_at, now()) else published_at end,
    rejection_reason = case when p_decision = 'rejected' then btrim(p_reason) else null end
  where id = p_listing_id;
  insert into public.moderation_audit_log(moderator_id, action, target_type, target_id, reason, metadata)
  values (auth.uid(), 'listing.' || p_decision::text, 'listing', p_listing_id, btrim(p_reason), jsonb_build_object('previous_status', previous_status));
end; $$;

create or replace function public.moderate_profile(p_profile_id uuid, p_action text, p_reason text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Accès modération requis' using errcode = '42501'; end if;
  if p_profile_id = auth.uid() then raise exception 'Vous ne pouvez pas modérer votre propre compte'; end if;
  if p_action not in ('verify', 'suspend', 'reactivate') then raise exception 'Action de modération invalide'; end if;
  if char_length(btrim(coalesce(p_reason, ''))) < 5 then raise exception 'Un motif de cinq caractères minimum est requis'; end if;
  update public.profiles set
    is_verified = case when p_action = 'verify' then true else is_verified end,
    account_status = case when p_action = 'suspend' then 'suspended'::public.account_status when p_action = 'reactivate' then 'active'::public.account_status else account_status end
  where id = p_profile_id;
  if not found then raise exception 'Profil introuvable'; end if;
  insert into public.moderation_audit_log(moderator_id, action, target_type, target_id, reason)
  values (auth.uid(), 'profile.' || p_action, 'profile', p_profile_id, btrim(p_reason));
end; $$;

create or replace function public.moderate_report(p_report_id uuid, p_status public.report_status, p_reason text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Accès modération requis' using errcode = '42501'; end if;
  if p_status not in ('reviewing', 'resolved', 'dismissed') then raise exception 'Statut de signalement invalide'; end if;
  if char_length(btrim(coalesce(p_reason, ''))) < 5 then raise exception 'Un motif de cinq caractères minimum est requis'; end if;
  update public.reports set status = p_status, reviewed_by = auth.uid(), reviewed_at = now() where id = p_report_id;
  if not found then raise exception 'Signalement introuvable'; end if;
  insert into public.moderation_audit_log(moderator_id, action, target_type, target_id, reason)
  values (auth.uid(), 'report.' || p_status::text, 'report', p_report_id, btrim(p_reason));
end; $$;

create or replace function public.moderate_review(p_review_id uuid, p_action text, p_reason text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Accès modération requis' using errcode = '42501'; end if;
  if p_action not in ('hide', 'show', 'delete') then raise exception 'Action de modération invalide'; end if;
  if char_length(btrim(coalesce(p_reason, ''))) < 5 then raise exception 'Un motif de cinq caractères minimum est requis'; end if;
  if p_action = 'delete' then delete from public.listing_reviews where id = p_review_id;
  else update public.listing_reviews set is_hidden = (p_action = 'hide') where id = p_review_id;
  end if;
  if not found then raise exception 'Avis introuvable'; end if;
  insert into public.moderation_audit_log(moderator_id, action, target_type, target_id, reason)
  values (auth.uid(), 'review.' || p_action, 'review', p_review_id, btrim(p_reason));
end; $$;

revoke all on function public.moderate_listing(uuid, public.listing_status, text) from public;
revoke all on function public.moderate_profile(uuid, text, text) from public;
revoke all on function public.moderate_report(uuid, public.report_status, text) from public;
revoke all on function public.moderate_review(uuid, text, text) from public;
grant execute on function public.moderate_listing(uuid, public.listing_status, text) to authenticated;
grant execute on function public.moderate_profile(uuid, text, text) to authenticated;
grant execute on function public.moderate_report(uuid, public.report_status, text) to authenticated;
grant execute on function public.moderate_review(uuid, text, text) to authenticated;

notify pgrst, 'reload schema';

drop policy if exists "reports_authenticated_insert" on public.reports;

create policy "reports_active_member_insert"
on public.reports for insert to authenticated
with check (
  reporter_id = auth.uid()
  and public.is_active_account(auth.uid())
  and status = 'open'
  and reviewed_by is null
  and reviewed_at is null
  and exists (
    select 1 from public.listings listing
    where listing.id = listing_id
      and listing.status = 'published'
      and listing.owner_id <> auth.uid()
  )
);

notify pgrst, 'reload schema';

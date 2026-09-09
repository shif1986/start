create table public.listing_reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  body text not null check (char_length(btrim(body)) between 2 and 1200),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (listing_id, author_id)
);

create index listing_reviews_listing_created_idx
on public.listing_reviews(listing_id, created_at desc);

create index listing_reviews_author_created_idx
on public.listing_reviews(author_id, created_at desc);

create trigger listing_reviews_set_updated_at
before update on public.listing_reviews
for each row execute function public.set_updated_at();

alter table public.listing_reviews enable row level security;

create policy "listing_reviews_public_read"
on public.listing_reviews for select
using (
  (not is_hidden and exists (
    select 1 from public.listings listing
    where listing.id = listing_id and listing.status = 'published'
  ))
  or author_id = auth.uid()
  or public.is_admin()
);

create policy "listing_reviews_active_member_insert"
on public.listing_reviews for insert to authenticated
with check (
  author_id = auth.uid()
  and public.is_active_account(auth.uid())
  and not is_hidden
  and exists (
    select 1 from public.listings listing
    where listing.id = listing_id
      and listing.status = 'published'
      and listing.owner_id <> auth.uid()
  )
);

create policy "listing_reviews_author_update"
on public.listing_reviews for update to authenticated
using (author_id = auth.uid() and public.is_active_account(auth.uid()))
with check (
  author_id = auth.uid()
  and public.is_active_account(auth.uid())
  and not is_hidden
  and exists (
    select 1 from public.listings listing
    where listing.id = listing_id
      and listing.status = 'published'
      and listing.owner_id <> auth.uid()
  )
);

create policy "listing_reviews_author_delete"
on public.listing_reviews for delete to authenticated
using (author_id = auth.uid() and public.is_active_account(auth.uid()));

create policy "listing_reviews_admin_all"
on public.listing_reviews for all to authenticated
using (public.is_admin()) with check (public.is_admin());

grant select on public.listing_reviews to anon, authenticated;
grant insert, update, delete on public.listing_reviews to authenticated;

notify pgrst, 'reload schema';

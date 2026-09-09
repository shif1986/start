drop policy if exists "listings_owner_insert" on public.listings;
create policy "listings_owner_insert"
on public.listings for insert to authenticated
with check (
  owner_id = auth.uid()
  and public.is_active_account(auth.uid())
  and public.has_active_professional_subscription()
  and status = 'draft'
  and not is_featured
  and published_at is null
  and rejection_reason is null
);

create or replace function public.validate_listing_field_value()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  listing_category_id uuid;
  expected_category_id uuid;
  expected_type public.field_type;
begin
  select category_id into listing_category_id
  from public.listings where id = new.listing_id;

  select category_id, field_type into expected_category_id, expected_type
  from public.category_fields where id = new.field_id;

  if listing_category_id is null or expected_category_id is null or listing_category_id <> expected_category_id then
    raise exception 'Le champ dynamique ne correspond pas à la catégorie de l’annonce';
  end if;

  if (expected_type in ('text', 'textarea', 'select', 'date', 'url') and jsonb_typeof(new.value) <> 'string')
    or (expected_type in ('number', 'price') and jsonb_typeof(new.value) <> 'number')
    or (expected_type in ('checkbox', 'boolean') and jsonb_typeof(new.value) <> 'boolean')
    or (expected_type = 'multi_select' and jsonb_typeof(new.value) <> 'array')
  then
    raise exception 'La valeur du champ dynamique ne respecte pas son type';
  end if;

  return new;
end;
$$;

drop trigger if exists listing_field_values_validate on public.listing_field_values;
create trigger listing_field_values_validate
before insert or update on public.listing_field_values
for each row execute function public.validate_listing_field_value();

create or replace function public.validate_listing_submission()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'pending' and old.status <> 'pending' and exists (
    select 1
    from public.category_fields field
    where field.category_id = new.category_id
      and field.is_required
      and not exists (
        select 1 from public.listing_field_values field_value
        where field_value.listing_id = new.id and field_value.field_id = field.id
      )
  ) then
    raise exception 'Tous les champs obligatoires de la catégorie doivent être renseignés';
  end if;

  return new;
end;
$$;

drop trigger if exists listings_validate_submission on public.listings;
create trigger listings_validate_submission
before update of status on public.listings
for each row execute function public.validate_listing_submission();

notify pgrst, 'reload schema';

create or replace function public.protect_listing_moderation_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.is_admin() then
    if old.status = 'draft' and new.status = 'published' and new.published_at is null then
      new.published_at := now();
    end if;
    return new;
  end if;

  if new.owner_id <> old.owner_id
    or new.is_featured <> old.is_featured
    or new.published_at is distinct from old.published_at
    or new.rejection_reason is distinct from old.rejection_reason then
    raise exception 'Ces champs sont réservés à la modération';
  end if;

  if new.status = old.status then
    return new;
  end if;

  if new.status in ('pending', 'published') and not public.has_active_professional_subscription() then
    raise exception 'Un abonnement professionnel actif est requis';
  end if;

  if old.status = 'draft' and new.status = 'published' then
    new.published_at := now();
    return new;
  end if;

  if not (
    (old.status = 'draft' and new.status in ('pending', 'archived'))
    or (old.status = 'pending' and new.status in ('draft', 'archived'))
    or (old.status = 'rejected' and new.status in ('draft', 'archived'))
    or (old.status = 'published' and new.status in ('sold', 'archived'))
    or (old.status = 'sold' and new.status = 'archived')
    or (old.status = 'archived' and new.status = 'draft')
  ) then
    raise exception 'Transition de statut non autorisée';
  end if;

  return new;
end;
$$;

create or replace function public.validate_listing_submission()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status in ('pending', 'published') and old.status <> new.status and exists (
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

notify pgrst, 'reload schema';

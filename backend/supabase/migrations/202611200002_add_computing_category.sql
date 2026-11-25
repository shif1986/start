insert into public.categories (id, parent_id, name, slug, icon, description, position, is_active)
values (
  '10000000-0000-4000-8000-000000000016',
  null,
  'Informatique',
  'informatique',
  'computer',
  'Ordinateurs, périphériques, composants et équipements informatiques.',
  45,
  true
)
on conflict (slug) do update set
  name = excluded.name,
  icon = excluded.icon,
  description = excluded.description,
  position = excluded.position,
  is_active = true;

notify pgrst, 'reload schema';

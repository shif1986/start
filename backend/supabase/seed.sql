insert into public.categories (id, parent_id, name, slug, icon, position)
values
  ('10000000-0000-4000-8000-000000000001', null, 'Véhicules', 'vehicules', 'car', 10),
  ('10000000-0000-4000-8000-000000000002', null, 'Immobilier', 'immobilier', 'house', 20),
  ('10000000-0000-4000-8000-000000000003', null, 'Maison', 'maison', 'armchair', 30),
  ('10000000-0000-4000-8000-000000000004', null, 'Électronique', 'electronique', 'laptop', 40),
  ('10000000-0000-4000-8000-000000000005', null, 'Services', 'services', 'wrench', 50),
  ('10000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000001', 'Vélos', 'velos', 'bike', 10)
on conflict (id) do nothing;

insert into public.category_fields (category_id, name, key, field_type, is_required, is_filterable, position)
values
  ('10000000-0000-4000-8000-000000000006', 'Marque', 'marque', 'text', true, true, 10),
  ('10000000-0000-4000-8000-000000000006', 'Taille du cadre', 'taille_cadre', 'select', false, true, 20),
  ('10000000-0000-4000-8000-000000000004', 'Marque', 'marque', 'text', false, true, 10),
  ('10000000-0000-4000-8000-000000000004', 'Stockage', 'stockage', 'select', false, true, 20)
on conflict (category_id, key) do nothing;


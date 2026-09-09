begin;
select plan(4);

insert into auth.users (id, email, raw_user_meta_data)
values ('a2000000-0000-4000-8000-000000000001', 'detail-pro@example.test', '{"display_name":"Pro détail","account_type":"professional"}'::jsonb);

insert into public.category_fields (id, category_id, name, key, field_type, position)
values ('a2100000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000005', 'Intervention urgente', 'urgent', 'boolean', 1);

insert into public.listings (id, owner_id, category_id, title, slug, description, price, price_unit, city, status, published_at)
values ('a2200000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000005', 'Détail complet test', 'detail-complet-test', 'Description assez longue pour la fiche annonce complète.', 75, 'hour', 'Lyon', 'published', now());

insert into public.listing_field_values (listing_id, field_id, value)
values ('a2200000-0000-4000-8000-000000000001', 'a2100000-0000-4000-8000-000000000001', 'true'::jsonb);

set local role anon;
select is((select price_unit from public.get_listing_detail('detail-complet-test')), 'hour'::text, 'la fiche expose l’unité tarifaire');
select is((select jsonb_array_length(fields) from public.get_listing_detail('detail-complet-test')), 1, 'la fiche expose les champs renseignés');
select is((select fields -> 0 ->> 'name' from public.get_listing_detail('detail-complet-test')), 'Intervention urgente', 'le libellé du champ est exposé');
select is((select seller_phone from public.get_listing_detail('detail-complet-test')), null::text, 'les coordonnées restent masquées au visiteur');
reset role;

select * from finish();
rollback;

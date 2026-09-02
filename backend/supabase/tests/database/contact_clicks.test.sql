begin;
select plan(6);

select has_table('public', 'professional_contact_clicks', 'la table des clics de contact existe');
select col_is_pk(
  'public', 'professional_contact_clicks', array['user_id', 'professional_id'],
  'un professionnel est compté une seule fois par particulier'
);
select fk_ok(
  'public', 'professional_contact_clicks', 'user_id', 'auth', 'users', 'id',
  'les clics appartiennent à un utilisateur'
);
select fk_ok(
  'public', 'professional_contact_clicks', 'professional_id', 'auth', 'users', 'id',
  'le professionnel contacté référence un compte'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.professional_contact_clicks'::regclass),
  'RLS est activé sur les clics de contact'
);
select has_function(
  'public', 'record_professional_contact', array['uuid', 'text'],
  'la fonction sécurisée de suivi des clics existe'
);

select * from finish();
rollback;

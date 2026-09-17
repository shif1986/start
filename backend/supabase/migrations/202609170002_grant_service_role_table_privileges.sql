-- Le rôle serveur contourne la RLS mais doit tout de même posséder les droits
-- SQL sur chaque relation. Les installations vierges ne les héritent pas
-- nécessairement des privilèges par défaut du projet.

grant usage on schema public to service_role;

grant all privileges on table
  public.profiles,
  public.profile_contacts,
  public.categories,
  public.category_fields,
  public.category_field_options,
  public.listings,
  public.listing_images,
  public.listing_field_values,
  public.favorites,
  public.reports,
  public.subscription_plans,
  public.subscriptions,
  public.listing_comments,
  public.listing_reviews,
  public.professional_contact_clicks,
  public.moderation_audit_log,
  public.stripe_webhook_events,
  public.donations,
  public.donation_payments
to service_role;

grant select on table
  public.public_profiles,
  public.active_professional_profiles
to service_role;

notify pgrst, 'reload schema';

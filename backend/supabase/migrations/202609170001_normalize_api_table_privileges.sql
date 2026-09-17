-- Les installations Supabase existantes peuvent conserver des privilèges par
-- défaut différents de ceux d'une base recréée en CI. Normaliser explicitement
-- les droits API garantit que les politiques RLS restent le seul filtre métier.

revoke all on table
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
  public.listing_reviews
from anon, authenticated;

grant select on table
  public.profiles,
  public.profile_contacts,
  public.categories,
  public.category_fields,
  public.category_field_options,
  public.listings,
  public.listing_images,
  public.listing_field_values,
  public.favorites,
  public.subscription_plans,
  public.subscriptions,
  public.listing_comments,
  public.listing_reviews
to anon, authenticated;

grant update on table public.profiles to authenticated;
grant insert, update, delete on table public.profile_contacts to authenticated;
grant insert, update, delete on table
  public.categories,
  public.category_fields,
  public.category_field_options,
  public.listings,
  public.listing_images,
  public.listing_field_values,
  public.subscription_plans,
  public.subscriptions,
  public.listing_comments,
  public.listing_reviews
to authenticated;

grant insert, delete on table public.favorites to authenticated;
grant select, insert, update on table public.reports to authenticated;

-- Ces tables ne sont accessibles qu'au travers de fonctions privilégiées ou
-- aux administrateurs selon leurs politiques RLS.
revoke all on table
  public.professional_contact_clicks,
  public.moderation_audit_log,
  public.stripe_webhook_events,
  public.donations,
  public.donation_payments
from anon, authenticated;

grant select on table
  public.professional_contact_clicks,
  public.moderation_audit_log
to authenticated;

notify pgrst, 'reload schema';

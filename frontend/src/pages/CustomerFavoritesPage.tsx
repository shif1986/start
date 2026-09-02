import { useEffect, useMemo, useState } from "react";
import AccountShell from "../components/AccountShell";
import ListingCard from "../components/ListingCard";
import { mockListings } from "../data/mockListings";
import { useAuth } from "../features/auth/context/use-auth";
import { useFavoriteListings } from "../features/favorites/hooks/use-favorite-listings";
import { DEMO_FAVORITES_CHANGED, getDemoFavoriteIds } from "../features/favorites/model/demo-favorites";
import { customerAccountNavigation } from "../features/profiles/model/account-navigation";

export default function CustomerFavoritesPage() {
  const { user } = useAuth();
  const favoritesQuery = useFavoriteListings();
  const [demoFavoriteIds, setDemoFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    const refresh = () => setDemoFavoriteIds(getDemoFavoriteIds(user?.id ?? ""));
    refresh();
    window.addEventListener(DEMO_FAVORITES_CHANGED, refresh);
    return () => window.removeEventListener(DEMO_FAVORITES_CHANGED, refresh);
  }, [user?.id]);

  const favoriteListings = useMemo(() => {
    const demoListings = mockListings
      .filter((listing) => demoFavoriteIds.includes(listing.id))
      .map((listing) => ({ ...listing, isFavorite: true }));
    return [...(favoritesQuery.data ?? []), ...demoListings];
  }, [demoFavoriteIds, favoritesQuery.data]);

  return (
    <AccountShell
      eyebrow="Compte particulier"
      title="Mes favoris"
      description="Retrouvez ici les annonces que vous avez enregistrées."
      navigation={[...customerAccountNavigation]}
    >
      {favoritesQuery.isPending ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5" aria-label="Chargement des favoris">
          {Array.from({ length: 3 }, (_, index) => <span key={index} className="h-[390px] animate-pulse rounded-xl border border-start-cream/10 bg-start-cream/[.04]" aria-hidden="true" />)}
        </div>
      ) : favoritesQuery.isError ? (
        <div className="rounded-2xl border border-network-red/30 bg-network-red/[.06] p-8 text-center" role="alert">Impossible de charger vos favoris. Veuillez réessayer.</div>
      ) : favoriteListings.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-x-5 gap-y-10">
          {favoriteListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-start-cream/20 p-10 text-center text-start-cream/65">
          <h2 className="text-xl font-semibold text-start-cream">Aucun favori enregistré</h2>
          <p className="mt-3">Ajoutez une annonce avec le bouton cœur pour la retrouver ici.</p>
        </div>
      )}
    </AccountShell>
  );
}

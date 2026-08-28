import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Listing } from "../../listings/model/listing.types";
import { getDataSource } from "../../../lib/data-source";
import { useToggleFavorite } from "../hooks/use-toggle-favorite";

export default function FavoriteButton({ listing, placement = "card" }: { listing: Listing; placement?: "card" | "inline" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dataSource = getDataSource();
  const [staticFavorite, setStaticFavorite] = useState(false);
  const favoriteMutation = useToggleFavorite(listing);
  const serverFavorite = favoriteMutation.isPending ? favoriteMutation.variables : Boolean(listing.isFavorite);
  const isFavorite = dataSource === "static" ? staticFavorite : serverFavorite;

  function handleClick() {
    if (dataSource === "static") {
      setStaticFavorite((current) => !current);
      return;
    }

    if (!favoriteMutation.user) {
      const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
      navigate(`/connexion?redirect=${redirect}`);
      return;
    }

    favoriteMutation.mutate(!isFavorite);
  }

  return (
    <>
      <button
        type="button"
        className={`${placement === "card" ? "absolute top-3 right-3 z-20" : "relative z-10"} inline-flex size-11 items-center justify-center rounded-full border bg-[#22221e]/65 text-xl backdrop-blur transition disabled:cursor-wait disabled:opacity-60 ${isFavorite ? "border-network-red/70 text-network-red" : "border-white/50 text-white"}`}
        aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        aria-pressed={isFavorite}
        disabled={favoriteMutation.isPending}
        onClick={handleClick}
      >
        {isFavorite ? "♥" : "♡"}
      </button>
      {favoriteMutation.isError && <span className="sr-only" role="alert">{favoriteMutation.error.message}</span>}
    </>
  );
}

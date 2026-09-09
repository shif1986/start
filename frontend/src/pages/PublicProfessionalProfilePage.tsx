import { Link, useParams } from "react-router-dom";
import ListingCard from "../components/ListingCard";
import ThemedPage from "../components/ThemedPage";
import { useAuth } from "../features/auth/context/use-auth";
import { usePublicProfessionalProfile } from "../features/profiles/hooks/use-public-professional-profile";
import { getDataSource } from "../lib/data-source";

export default function PublicProfessionalProfilePage() {
  const { username = "" } = useParams();
  const { session } = useAuth();
  const isSupabase = getDataSource() === "supabase";
  const profileQuery = usePublicProfessionalProfile(username, Boolean(session), isSupabase);

  if (!isSupabase) return <ThemedPage ambiance="network" className="p-[clamp(24px,5vw,72px)]"><h1>Profil professionnel</h1><p className="mt-4 text-start-cream/60">Les pages publiques sont disponibles lorsque Supabase est activé.</p></ThemedPage>;
  if (profileQuery.isPending) return <div className="min-h-[520px] animate-pulse rounded-2xl bg-start-cream/[.04]" role="status" aria-label="Chargement du professionnel" />;
  if (profileQuery.isError) return <div role="alert" className="grid min-h-[45vh] place-content-center text-center"><h1>Impossible de charger ce professionnel</h1><p className="mt-3 text-start-cream/60">Réessayez dans quelques instants.</p></div>;
  const profile = profileQuery.data;
  if (!profile) return <div className="grid min-h-[45vh] place-content-center gap-4 text-center"><h1>Professionnel introuvable</h1><Link to="/annonces" className="text-start-gold underline">Retour aux annonces</Link></div>;

  return <ThemedPage ambiance="network" className="p-[clamp(20px,5vw,72px)]">
    <header className="grid grid-cols-[auto_1fr] items-center gap-6 rounded-2xl border border-start-cream/10 bg-[#121418] p-[clamp(20px,4vw,44px)] max-sm:grid-cols-1">
      {profile.avatarUrl ? <img src={profile.avatarUrl} alt="" className="size-28 rounded-full object-cover" /> : <span className="grid size-28 place-content-center rounded-full bg-start-gold/15 text-4xl font-bold text-start-gold" aria-hidden="true">{profile.displayName.slice(0, 1).toUpperCase()}</span>}
      <div><span className="text-xs font-bold tracking-[.2em] text-start-gold uppercase">Professionnel {profile.isVerified ? "vérifié" : "du réseau"}</span><h1 className="mt-2 text-[clamp(1.8rem,4vw,3.4rem)]">{profile.displayName}</h1><p className="mt-2 text-start-cream/55">@{profile.username}{profile.city ? ` · ${profile.city}` : ""}</p>{profile.bio && <p className="mt-5 max-w-3xl leading-7 text-start-cream/70">{profile.bio}</p>}</div>
    </header>
    <section className="mt-8 rounded-2xl border border-start-cream/10 bg-[#121418] p-6"><h2 className="text-xl font-semibold">Coordonnées</h2>{profile.contacts && (profile.contacts.phone || profile.contacts.publicEmail || profile.contacts.postalAddress) ? <ul className="mt-4 grid gap-2 text-start-cream/70">{profile.contacts.phone && <li><a className="text-start-gold underline" href={`tel:${profile.contacts.phone}`}>{profile.contacts.phone}</a></li>}{profile.contacts.publicEmail && <li><a className="text-start-gold underline" href={`mailto:${profile.contacts.publicEmail}`}>{profile.contacts.publicEmail}</a></li>}{profile.contacts.postalAddress && <li>{profile.contacts.postalAddress}</li>}</ul> : <p className="mt-3 text-sm text-start-cream/55">{session ? "Aucune coordonnée disponible selon vos droits actuels." : <><Link className="text-start-gold underline" to={`/connexion?redirect=${encodeURIComponent(`/professionnel/${profile.username}`)}`}>Connectez-vous</Link> pour accéder aux coordonnées autorisées.</>}</p>}</section>
    <section className="mt-10"><h2 className="text-2xl font-semibold">Annonces publiées</h2>{profile.listings.length > 0 ? <div className="mt-5 grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">{profile.listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div> : <p className="mt-5 rounded-xl border border-dashed border-start-cream/15 p-6 text-start-cream/55">Ce professionnel n’a aucune annonce publiée.</p>}</section>
  </ThemedPage>;
}

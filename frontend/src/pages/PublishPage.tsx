import ThemedPage from "../components/ThemedPage";
import BrandPattern from "../components/BrandPattern";

export default function PublishPage() {
  return (
    <ThemedPage ambiance="gold" className="p-[clamp(32px,7vw,104px)]">
      <span className="text-xs font-bold tracking-[.22em] text-start-gold uppercase">Rejoindre le réseau</span>
      <h1 className="mt-3 text-[clamp(2.5rem,6vw,5rem)] font-bold tracking-[-.04em]">Publier une annonce</h1>
      <div className="relative isolate mt-12 max-w-4xl overflow-hidden rounded-2xl border border-start-gold/20 bg-[#17191e]/90 p-[clamp(24px,4vw,44px)] shadow-[0_24px_70px_rgba(0,0,0,.2)]">
        <BrandPattern variant="chain" className="-right-24 -bottom-44 -z-10 h-[440px] w-[340px] text-start-gold/[.055] opacity-50 max-sm:opacity-30" />
        <p className="relative max-w-2xl text-lg leading-8 text-start-cream/70">
          Cette étape permettra prochainement de déposer une annonce pour votre
          activité ou votre besoin, avec la validation de la structure et du
          profil associé.
        </p>
        <button type="button" className="relative mt-8 rounded-xl bg-start-gold px-7 py-3.5 font-bold text-start-ink shadow-[0_14px_35px_rgba(199,164,93,.18)] hover:bg-[#d5b66f]">
          Commencer la publication
        </button>
      </div>
    </ThemedPage>
  );
}

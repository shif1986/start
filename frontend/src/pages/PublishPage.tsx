export default function PublishPage() {
  return (
    <div className="rounded-3xl border border-start-cream/10 bg-[#0e121e] p-[clamp(24px,5vw,64px)]">
      <h1 className="font-serif text-[clamp(2.5rem,6vw,5rem)]">Publier une annonce</h1>
      <p className="max-w-3xl text-lg leading-8 text-start-cream/70">
        Cette étape permettra prochainement de déposer une annonce pour votre
        activité ou votre besoin, avec la validation de la structure et du
        profil associé.
      </p>
      <button type="button" className="mt-6 rounded-xl bg-start-gold px-6 py-3 font-bold text-start-ink hover:bg-[#d5b66f]">
        Commencer la publication
      </button>
    </div>
  );
}

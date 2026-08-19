import ThemedPage from "../components/ThemedPage";

export default function ContactPage() {
  return (
    <ThemedPage ambiance="network" className="p-[clamp(32px,7vw,104px)]">
      <span className="text-xs font-bold tracking-[.22em] text-start-gold uppercase">Mise en relation</span>
      <h1 className="mt-3 text-[clamp(2.5rem,6vw,5rem)] font-bold tracking-[-.04em]">Contact</h1>
      <p className="text-lg text-start-cream/70">Nous sommes ravis de vous répondre.</p>
      <form className="mt-14 grid max-w-2xl gap-6 rounded-2xl border border-start-cream/10 bg-[#17191e]/90 p-[clamp(24px,4vw,44px)] shadow-[0_24px_70px_rgba(0,0,0,.22)] max-sm:mt-10">
        <label className="flex flex-col gap-2 font-semibold text-start-cream/75">
          Nom
          <input className="rounded-xl border border-start-cream/15 bg-[#080c12]/70 px-4 py-3 text-start-cream outline-none focus:border-start-gold" type="text" placeholder="Votre nom" />
        </label>
        <label className="flex flex-col gap-2 font-semibold text-start-cream/75">
          Email
          <input className="rounded-xl border border-start-cream/15 bg-[#080c12]/70 px-4 py-3 text-start-cream outline-none focus:border-start-gold" type="email" placeholder="votre@email.com" />
        </label>
        <label className="flex flex-col gap-2 font-semibold text-start-cream/75">
          Message
          <textarea className="resize-y rounded-xl border border-start-cream/15 bg-[#080c12]/70 px-4 py-3 text-start-cream outline-none focus:border-start-gold" rows={5} placeholder="Votre message..." />
        </label>
        <button type="submit" className="w-fit rounded-xl bg-start-gold px-6 py-3 font-bold text-start-ink hover:bg-[#d5b66f]">
          Envoyer
        </button>
      </form>
    </ThemedPage>
  );
}

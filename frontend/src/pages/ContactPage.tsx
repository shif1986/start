export default function ContactPage() {
  return (
    <div className="rounded-3xl border border-start-cream/10 bg-[#0e121e] p-[clamp(24px,5vw,64px)]">
      <h1 className="font-serif text-[clamp(2.5rem,6vw,5rem)]">Contact</h1>
      <p className="text-lg text-start-cream/70">Nous sommes ravis de vous répondre.</p>
      <form className="mt-8 grid max-w-2xl gap-5">
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
    </div>
  );
}

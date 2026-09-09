import { useState } from "react";

type GalleryImage = { src: string; altText: string };

export default function ListingGallery({ images }: { images: GalleryImage[] }) {
  const [index, setIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const current = images[index] ?? images[0];
  if (!current) return null;

  const select = (next: number) => setIndex((next + images.length) % images.length);
  const previous = () => select(index - 1);
  const next = () => select(index + 1);

  return <section aria-label="Galerie de l’annonce" className="mt-8">
    <div
      className="relative aspect-[16/7] min-h-56 overflow-hidden rounded-2xl border border-start-cream/10 bg-[#080c12] shadow-[0_20px_55px_rgba(0,0,0,.24)] outline-none focus-visible:ring-2 focus-visible:ring-start-gold max-md:aspect-[4/3] max-sm:min-h-52"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") { event.preventDefault(); previous(); }
        if (event.key === "ArrowRight") { event.preventDefault(); next(); }
        if (event.key === "Home") { event.preventDefault(); select(0); }
        if (event.key === "End") { event.preventDefault(); select(images.length - 1); }
      }}
      onTouchStart={(event) => setTouchStart(event.touches[0]?.clientX ?? null)}
      onTouchEnd={(event) => {
        if (touchStart === null) return;
        const delta = (event.changedTouches[0]?.clientX ?? touchStart) - touchStart;
        if (Math.abs(delta) >= 40) {
          if (delta < 0) next();
          else previous();
        }
        setTouchStart(null);
      }}
    >
      <img src={current.src} alt={current.altText} className="size-full object-cover brightness-[.92]" />
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080c12]/65 via-transparent to-transparent" aria-hidden="true" />
      {images.length > 1 && <><button type="button" onClick={previous} aria-label="Photo précédente" className="absolute top-1/2 left-3 grid size-11 -translate-y-1/2 place-content-center rounded-full bg-black/65 text-2xl">‹</button><button type="button" onClick={next} aria-label="Photo suivante" className="absolute top-1/2 right-3 grid size-11 -translate-y-1/2 place-content-center rounded-full bg-black/65 text-2xl">›</button></>}
      <span className="absolute right-4 bottom-4 rounded-full bg-black/65 px-3 py-1 text-sm" aria-live="polite">{index + 1} / {images.length}</span>
    </div>
    {images.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto pb-2" aria-label="Miniatures">{images.map((image, imageIndex) => <button key={`${image.src}-${imageIndex}`} type="button" onClick={() => select(imageIndex)} aria-label={`Afficher la photo ${imageIndex + 1}`} aria-current={imageIndex === index ? "true" : undefined} className={`h-20 w-28 shrink-0 overflow-hidden rounded-lg border ${imageIndex === index ? "border-start-gold" : "border-start-cream/15"}`}><img src={image.src} alt="" className="size-full object-cover" /></button>)}</div>}
  </section>;
}

import CategoryCard from "../components/CategoryCard";
import BrandPattern from "../components/BrandPattern";
import { categories } from "../data/categories";
import { mockListings } from "../data/mockListings";

export default function CategoriesPage() {
  return (
    <div className="relative isolate overflow-hidden rounded-3xl bg-[#171a21] px-[clamp(20px,4vw,56px)] py-12">
      <BrandPattern className="-top-28 -left-24 -z-10 h-[620px] w-[410px] -rotate-6 text-start-gold/[.055] max-sm:hidden" />
      <BrandPattern className="-right-28 -bottom-40 -z-10 h-[620px] w-[410px] rotate-6 text-start-gold/[.04] max-sm:hidden" />
      <header className="relative mx-auto mb-10 max-w-3xl text-center">
        <span className="text-xs font-bold tracking-[.22em] text-start-gold uppercase">Explorez le réseau</span>
        <h1 className="mt-3 text-[clamp(2.4rem,5vw,4.5rem)] font-bold tracking-[-.04em] text-start-cream">Toutes les catégories</h1>
        <p className="mt-4 text-start-cream/60">Découvrez les activités, opportunités et initiatives proposées au sein de START Réseau Chrétien.</p>
      </header>
      <div className="relative grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} count={mockListings.filter((listing) => listing.categorySlug === category.slug).length} />
        ))}
      </div>
    </div>
  );
}

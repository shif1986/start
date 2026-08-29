import CategoryCard from "../components/CategoryCard";
import BrandPattern from "../components/BrandPattern";
import { categories } from "../data/categories";
import { mockListings } from "../data/mockListings";
import { useCategories } from "../features/categories/hooks/use-categories";
import { getDataSource } from "../lib/data-source";

export default function CategoriesPage() {
  const dataSource = getDataSource();
  const categoriesQuery = useCategories({ enabled: dataSource === "supabase" });
  const visibleCategories = dataSource === "supabase" ? categoriesQuery.data : categories;

  return (
    <div className="relative isolate overflow-hidden rounded-3xl border border-start-cream/10 bg-[radial-gradient(circle_at_14%_16%,rgba(199,164,93,.11),transparent_30%),linear-gradient(135deg,#171712_0%,#101217_50%,#090c12_100%)] px-[clamp(20px,5vw,72px)] py-[clamp(56px,8vw,112px)] shadow-[inset_0_1px_0_rgba(255,255,255,.025),0_32px_90px_rgba(0,0,0,.18)]">
      <BrandPattern variant="landscape" className="right-0 bottom-0 -z-10 h-[48%] w-full text-start-cream/[.045] opacity-30 max-sm:h-[30%] max-sm:opacity-18" />
      <BrandPattern variant="chain" className="-right-20 -bottom-28 -z-10 h-[720px] w-[520px] text-start-gold/[.04] opacity-25 max-sm:hidden" />
      <header className="relative mx-auto mb-[clamp(48px,7vw,80px)] max-w-3xl text-center">
        <span className="text-xs font-bold tracking-[.22em] text-start-gold uppercase">Explorez le réseau</span>
        <h1 className="mt-3 text-[clamp(1.65rem,3vw,2.8rem)] font-bold tracking-[-.035em] text-start-cream">Toutes les catégories</h1>
        <p className="mt-4 text-start-cream/60">Découvrez les activités, opportunités et initiatives proposées au sein de START Réseau Chrétien.</p>
      </header>
      {dataSource === "supabase" && categoriesQuery.isPending ? (
        <div className="relative grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-x-7 gap-y-12 max-sm:gap-y-8" role="status" aria-label="Chargement des catégories">
          {Array.from({ length: 8 }, (_, index) => <span key={index} className="min-h-72 animate-pulse rounded-2xl border border-start-cream/10 bg-start-cream/[.04]" aria-hidden="true" />)}
        </div>
      ) : dataSource === "supabase" && categoriesQuery.isError ? (
        <div className="rounded-2xl border border-network-red/30 bg-network-red/[.06] p-8 text-center text-start-cream" role="alert">
          Impossible de charger les catégories. Veuillez réessayer dans quelques instants.
        </div>
      ) : visibleCategories?.length ? (
        <div className="relative grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-x-7 gap-y-12 max-sm:gap-y-8">
          {visibleCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              count={dataSource === "static" ? mockListings.filter((listing) => listing.categorySlug === category.slug).length : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-start-cream/20 p-10 text-center text-start-cream/65">
          <h2>Aucune catégorie disponible</h2>
          <p className="mt-2">Les catégories publiées apparaîtront ici.</p>
        </div>
      )}
    </div>
  );
}

import { Link } from "react-router-dom";
import type { Category } from "../data/categories";
import CategoryIcon from "./CategoryIcon";

const blueCategories = new Set(["services", "real-estate", "vehicles", "multimedia", "business", "agriculture"]);
const redCategories = new Set(["jobs", "home-garden", "fashion-accessories", "animals", "construction-industry", "other-listings"]);

export default function CategoryCard({ category, count = 0, compact = false, featured = false }: { category: Category; count?: number; compact?: boolean; featured?: boolean }) {
  const accent = blueCategories.has(category.id) ? "blue" : redCategories.has(category.id) ? "red" : "gold";
  const iconAccent = accent === "blue"
    ? "border-network-blue/70 bg-network-blue shadow-[0_10px_28px_rgba(77,163,255,.22)]"
    : accent === "red"
      ? "border-network-red/70 bg-network-red shadow-[0_10px_28px_rgba(255,77,79,.2)]"
      : "border-start-gold/70 bg-start-gold shadow-[0_10px_28px_rgba(199,164,93,.2)]";
  const textAccent = accent === "blue" ? "text-network-blue" : accent === "red" ? "text-network-red" : "text-network-yellow";

  return (
    <Link
      to={`/annonces?category=${encodeURIComponent(category.slug)}`}
      className={`group relative isolate overflow-hidden rounded-2xl border-start-cream/25 bg-[#14171d] shadow-[0_14px_35px_rgba(34,34,30,.12)] transition duration-300 [border-style:solid] [border-width:.5px] hover:-translate-y-1 hover:border-start-gold/65 ${compact ? "min-h-52" : "min-h-72"} ${featured ? "row-span-2 min-h-[432px] max-lg:row-span-1 max-lg:min-h-64" : ""}`}
    >
      {category.image && <img src={category.image} alt="" className="absolute inset-0 size-full object-cover brightness-[.92] saturate-[.9] transition duration-500 group-hover:scale-105 group-hover:brightness-100" />}
      <span className="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,14,19,.94)_0%,rgba(11,14,19,.68)_24%,rgba(11,14,19,.16)_58%,rgba(11,14,19,.04)_100%)]" />
      <div className={`absolute inset-0 flex flex-col justify-end ${featured ? "p-7 max-sm:p-5" : compact ? "p-5" : "p-6"}`}>
        <span className={`mb-auto inline-flex items-center justify-center rounded-full border text-white ${iconAccent} ${compact ? "size-11" : "size-12"}`}><CategoryIcon name={category.icon} /></span>
        <h3 className={`${featured ? "max-w-xs text-[1.65rem]" : compact ? "text-lg" : "text-xl"} font-extrabold text-start-cream uppercase`}>{category.label}</h3>
        <p className={`mt-2 text-sm font-semibold ${textAccent}`}>{count} annonce{count > 1 ? "s" : ""}</p>
        {!compact && <p className="mt-2 text-sm leading-6 text-start-cream/60">{category.description}</p>}
        {featured && <span className="absolute right-6 bottom-6 inline-flex size-10 items-center justify-center rounded-full border border-start-cream/35 text-lg text-start-cream transition group-hover:border-start-gold group-hover:text-start-gold" aria-hidden="true">→</span>}
      </div>
    </Link>
  );
}

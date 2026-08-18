import { Link } from "react-router-dom";
import type { Category } from "../data/categories";
import CategoryIcon from "./CategoryIcon";

export default function CategoryCard({ category, count = 0, compact = false, featured = false }: { category: Category; count?: number; compact?: boolean; featured?: boolean }) {
  return (
    <Link
      to={`/annonces?category=${encodeURIComponent(category.slug)}`}
      className={`group relative isolate overflow-hidden rounded-2xl border border-start-ink/15 bg-[#14171d] shadow-[0_14px_35px_rgba(34,34,30,.12)] transition duration-300 hover:-translate-y-1 hover:border-start-gold/70 ${compact ? "min-h-52" : "min-h-72"} ${featured ? "row-span-2 min-h-[432px] max-lg:row-span-1 max-lg:min-h-64" : ""}`}
    >
      {category.image && <img src={category.image} alt="" className="absolute inset-0 size-full object-cover brightness-[.92] saturate-[.9] transition duration-500 group-hover:scale-105 group-hover:brightness-100" />}
      <span className="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,14,19,.94)_0%,rgba(11,14,19,.68)_24%,rgba(11,14,19,.16)_58%,rgba(11,14,19,.04)_100%)]" />
      <div className={`absolute inset-0 flex flex-col justify-end ${featured ? "p-7 max-sm:p-5" : compact ? "p-5" : "p-6"}`}>
        <span className={`mb-auto inline-flex items-center justify-center rounded-full border border-start-cream/35 bg-start-gold text-start-cream shadow-lg ${compact ? "size-11" : "size-12"}`}><CategoryIcon name={category.icon} /></span>
        <h3 className={`${featured ? "max-w-xs text-[1.65rem]" : compact ? "text-lg" : "text-xl"} font-extrabold text-start-cream uppercase`}>{category.name}</h3>
        <p className="mt-2 text-sm font-semibold text-start-gold">{count} annonce{count > 1 ? "s" : ""}</p>
        {!compact && <p className="mt-2 text-sm leading-6 text-start-cream/60">{category.description}</p>}
        {featured && <span className="absolute right-6 bottom-6 inline-flex size-10 items-center justify-center rounded-full border border-start-cream/35 text-lg text-start-cream transition group-hover:border-start-gold group-hover:text-start-gold" aria-hidden="true">→</span>}
      </div>
    </Link>
  );
}

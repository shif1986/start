import type { CategoryIcon as CategoryIconName } from "../data/categories";

const paths: Record<CategoryIconName, string> = {
  vehicle: "M5 17h14l-1-7H6z M7 10l2-4h6l2 4 M7 17v2 M17 17v2",
  building: "M4 21V5l8-3 8 3v16 M8 8h2 M14 8h2 M8 12h2 M14 12h2 M10 21v-5h4v5",
  work: "M5 4h14v16H5z M8 2v4 M16 2v4 M8 11h8 M8 15h5",
  briefcase: "M4 8h16v11H4z M9 8V5h6v3 M4 12h16",
  home: "M3 11l9-8 9 8 M5 10v11h14V10 M9 21v-7h6v7",
  fashion: "M8 4l4 3 4-3 5 4-3 4-2-2v10H8V10l-2 2-3-4z",
  computer: "M3 4h18v13H3z M8 21h8 M12 17v4",
  culture: "M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z M7 4v16",
  paw: "M8 11c-2 0-4 2-4 4.5S6 20 8.5 19c2-1 5-1 7 0 2.5 1 4.5-1 4.5-3.5S18 11 16 11c-1.5 0-2.5 1-4 1s-2.5-1-4-1 M7 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4 M17 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4 M3 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3 M21 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3",
  tools: "M14 6l4-4 4 4-4 4 M14 6L4 16l4 4 10-10 M3 21l4-4",
  commerce: "M3 10h18 M5 10v10h14V10 M4 4h16l1 6H3z M9 20v-6h6v6",
  agriculture: "M12 21V9 M12 13c-4 0-7-2-7-6 4 0 7 2 7 6 M12 17c4 0 7-2 7-6-4 0-7 2-7 6 M7 21h10",
  industry: "M3 21V10l6 4v-4l6 4V5h6v16z M7 18h2 M13 18h2 M18 9h3",
  more: "M5 12h.01 M12 12h.01 M19 12h.01",
};

export default function CategoryIcon({ name, className = "size-6" }: { name: CategoryIconName; className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

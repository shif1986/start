import type { CategoryIcon as CategoryIconName } from "../data/categories";

const paths: Record<CategoryIconName, string> = {
  briefcase: "M4 8h16v11H4z M9 8V5h6v3 M4 12h16",
  work: "M5 4h14v16H5z M8 2v4 M16 2v4 M8 11h8 M8 15h5",
  building: "M4 21V5l8-3 8 3v16 M8 8h2 M14 8h2 M8 12h2 M14 12h2 M10 21v-5h4v5",
  home: "M3 11l9-8 9 8 M5 10v11h14V10 M9 21v-7h6v7",
  vehicle: "M5 17h14l-1-7H6z M7 10l2-4h6l2 4 M7 17v2 M17 17v2",
  tools: "M14 6l4-4 4 4-4 4 M14 6L4 16l4 4 10-10 M3 21l4-4",
  computer: "M3 4h18v13H3z M8 21h8 M12 17v4",
  fashion: "M8 4l4 3 4-3 5 4-3 4-2-2v10H8V10l-2 2-3-4z",
  family: "M9 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M17 11a2.5 2.5 0 1 0 0-5 M3 21v-4a6 6 0 0 1 12 0v4 M15 14a5 5 0 0 1 6 5v2",
  culture: "M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z M7 4v16",
  event: "M4 5h16v16H4z M8 2v6 M16 2v6 M4 10h16 M8 14h3",
  heart: "M12 21S3 16 3 9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 7-9 12-9 12z",
  church: "M12 2v5 M9 4h6 M6 22V10h12v12 M3 22h18 M9 22v-6h6v6",
};

export default function CategoryIcon({ name, className = "size-6" }: { name: CategoryIconName; className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

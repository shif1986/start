import { useEffect, useMemo, useState } from "react";
import type { Listing } from "../features/listings/model/listing.types";
import { loadHomeMap, type HomeMapDepartment } from "../features/maps/api/geojson";

type DepartmentMapItem = {
  name: string;
  country: "FR" | "CH";
  d: string;
  count: number;
  x: number;
  y: number;
  hasListings: boolean;
};

type FranceListingsMapProps = {
  listings: Listing[];
  selectedDepartment: string;
  onDepartmentSelect: (department: string) => void;
};

const NETWORK_MARKER_COLORS = ["#4DA3FF", "#FFB33D", "#FF4D4F"] as const;

export default function FranceListingsMap({
  listings,
  selectedDepartment,
  onDepartmentSelect,
}: FranceListingsMapProps) {
  const [departments, setDepartments] = useState<HomeMapDepartment[] | null>(null);
  const [mapDataError, setMapDataError] = useState(false);

  useEffect(() => {
    let isActive = true;
    loadHomeMap()
      .then((payload) => {
        if (isActive) setDepartments(payload);
      })
      .catch(() => {
        if (isActive) setMapDataError(true);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const listingCounts = useMemo(() => {
    const counts = new Map<string, number>();

    listings.forEach((listing) => {
      const country = listing.country === "Suisse" ? "CH" : "FR";
      const area = country === "CH" ? "Suisse" : listing.department;
      const key = `${country}:${area}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    return counts;
  }, [listings]);

  const markerColorsByDepartment = useMemo(() => {
    const activeDepartments = [...listingCounts.keys()].sort((first, second) => first.localeCompare(second, "fr"));
    return new Map(
      activeDepartments.map((departmentName, index) => [
        departmentName,
        NETWORK_MARKER_COLORS[index % NETWORK_MARKER_COLORS.length],
      ]),
    );
  }, [listingCounts]);

  const departmentMap = useMemo<DepartmentMapItem[]>(() => {
    if (!departments) {
      return [];
    }
    return departments.map(({ name, country = "FR", d, x, y }) => {
      const count = listingCounts.get(`${country}:${name}`) ?? 0;
      return { name, country, d, count, x, y, hasListings: count > 0 };
    });
  }, [departments, listingCounts]);

  return (
    <section
      className="france-listings-map relative overflow-hidden bg-transparent p-2 max-sm:p-0"
      aria-label="Carte interactive des annonces en France et en Suisse"
    >
      <div className="france-map-summary absolute top-5 left-5 z-10 flex flex-col bg-transparent px-4 py-3 opacity-65 [text-shadow:0_1px_4px_rgba(0,0,0,.55)] max-sm:top-2 max-sm:left-2 max-sm:px-3 max-sm:py-2">
        <span className="text-xs font-extrabold tracking-[.2em] text-start-gold uppercase max-sm:text-[.6rem]">France &amp; Suisse</span>
        <strong className="text-sm text-start-cream max-sm:text-xs">{listings.length} annonces disponibles</strong>
      </div>

      {!departments && !mapDataError && <div className="absolute inset-0 grid place-items-center" role="status"><span className="size-9 animate-spin rounded-full border-2 border-start-cream/15 border-t-start-gold" aria-hidden="true" /><span className="sr-only">Chargement de la carte</span></div>}
      {mapDataError && <p className="absolute inset-x-8 top-1/2 -translate-y-1/2 rounded-xl border border-network-red/30 bg-[#101318]/90 p-4 text-center text-sm text-start-cream" role="alert">La carte est momentanément indisponible.</p>}

      <svg
        className="block h-auto w-full overflow-visible"
        viewBox="0 0 1000 800"
        preserveAspectRatio="xMidYMid meet"
        role="group"
        aria-label="Carte des départements français et de la Suisse"
      >
        {departmentMap.map(({ name, country, d, hasListings }) => {
          const isSelected = selectedDepartment === name;
          const borderClass = country === "CH" ? "stroke-network-blue" : "stroke-start-gold";

          return (
            <path
              key={`${country}-${name}`}
              d={d}
              className={`cursor-pointer ${borderClass} outline-none transition-all duration-200 ${isSelected ? country === "CH" ? "fill-network-blue/55 [filter:drop-shadow(0_0_10px_rgba(77,163,255,.5))]" : "fill-start-gold/80 [filter:drop-shadow(0_0_10px_rgba(199,164,93,.5))]" : hasListings ? country === "CH" ? "fill-network-blue/20 hover:fill-network-blue/35" : "fill-start-gold/20 hover:fill-start-gold/35" : "fill-start-cream/[.02] hover:fill-start-gold/15"}`}
              onClick={() => onDepartmentSelect(name)}
              style={{ strokeWidth: isSelected ? 2.1 : 1 }}
              role="button"
              aria-label={name}
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onDepartmentSelect(name);
                }
              }}
            />
          );
        })}

        {departmentMap.filter(({ count }) => count > 0).map(({ name, country, count, x, y }) => {
          const isSelected = selectedDepartment === name;
          const markerColor = country === "CH" ? "#4DA3FF" : markerColorsByDepartment.get(`${country}:${name}`) ?? NETWORK_MARKER_COLORS[0];

          return (
            <g
              key={`marker-${country}-${name}`}
              className="cursor-pointer outline-none"
              onClick={() => onDepartmentSelect(name)}
              role="button"
              aria-label={`${name} : ${count} annonce${count > 1 ? "s" : ""}`}
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onDepartmentSelect(name);
                }
              }}
            >
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 23 : 20}
                    fill={markerColor}
                    fillOpacity={isSelected ? 0.88 : 0.76}
                    stroke="#F4EFE599"
                    strokeWidth={isSelected ? 1.5 : 0.9}
                    style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,.32))" }}
                  />
                  <text
                    x={x}
                    y={y + 6}
                    textAnchor="middle"
                    fill="#22221E"
                    stroke="#22221E"
                    strokeWidth={0.35}
                    paintOrder="stroke"
                    fontSize={isSelected ? 17 : 15}
                    fontWeight={700}
                    fontFamily="Inter, sans-serif"
                  >
                    {count}
                  </text>
                </g>
          );
        })}
      </svg>
    </section>
  );
}

import { useId } from "react";

type BrandPatternProps = {
  className?: string;
};

export default function BrandPattern({ className = "" }: BrandPatternProps) {
  const patternId = `start-pattern-${useId().replace(/:/g, "")}`;

  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute select-none ${className}`}
      viewBox="0 0 420 640"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id={patternId} width="132" height="150" patternUnits="userSpaceOnUse">
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="9">
            <path d="M61 39 39 86M71 39l22 47" />
            <circle cx="66" cy="25" r="15" />
            <circle cx="32" cy="101" r="15" />
            <circle cx="100" cy="101" r="15" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

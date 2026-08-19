import { useId } from "react";

type BrandPatternProps = {
  className?: string;
  variant?: "nodes" | "chain" | "constellation" | "landscape";
};

export default function BrandPattern({ className = "", variant = "nodes" }: BrandPatternProps) {
  const patternId = `start-pattern-${useId().replace(/:/g, "")}`;

  if (variant === "landscape") {
    return (
      <svg
        aria-hidden="true"
        className={`pointer-events-none absolute select-none ${className}`}
        viewBox="0 0 840 420"
        fill="none"
        preserveAspectRatio="xMidYMax slice"
      >
        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8">
          <path d="M-25 370 58 318l72 38 74-92 68 38 71-77 72 54 80-108 74 48 72-91 76 45 76-90 92 44" />
          <path d="m58 318 8-91 72-54 66 91m68 38-5 87m76-164-14-91 72-52 14 197m80-108-8-84 66-55 16 187m72-91-8-84 64-51 12 180m76-90-10-82 72-48" />
          <path d="m130 356 75 48 67-102m143-23 82 85 72-145m78-46 76 90 76-90" />
          {[
            [-25, 370], [58, 318], [66, 227], [130, 356], [138, 173], [204, 264], [205, 404],
            [272, 302], [267, 389], [329, 134], [343, 225], [401, 82], [415, 279], [497, 171],
            [489, 87], [497, 364], [553, 32], [569, 219], [641, 128], [633, 44], [647, 263],
            [699, -7], [707, 173], [775, 83], [799, 263], [867, 127],
          ].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="14" />)}
        </g>
        <circle cx="58" cy="318" r="10" fill="#4DA3FF" />
        <circle cx="267" cy="389" r="10" fill="#FFB33D" />
        <circle cx="569" cy="219" r="10" fill="#FF4D4F" />
      </svg>
    );
  }

  const pattern = variant === "chain" ? (
    <pattern id={patternId} width="190" height="190" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)">
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8">
        <path d="M20 95h42m30 0h42m30 0h28" />
        <path d="M77 80 98 43m-21 67 21 37" />
        <circle cx="77" cy="95" r="15" />
        <circle cx="106" cy="30" r="15" />
        <circle cx="106" cy="160" r="15" />
        <circle cx="149" cy="95" r="15" />
      </g>
    </pattern>
  ) : variant === "constellation" ? (
    <pattern id={patternId} width="240" height="210" patternUnits="userSpaceOnUse">
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7">
        <path d="M32 168 92 112l50 28 65-91M92 112 72 42m70 98 66 38" />
        <circle cx="32" cy="168" r="13" />
        <circle cx="92" cy="112" r="15" />
        <circle cx="72" cy="42" r="12" />
        <circle cx="142" cy="140" r="13" />
        <circle cx="207" cy="49" r="15" />
        <circle cx="208" cy="178" r="12" />
      </g>
    </pattern>
  ) : (
    <pattern id={patternId} width="132" height="150" patternUnits="userSpaceOnUse">
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="9">
        <path d="M61 39 39 86M71 39l22 47" />
        <circle cx="66" cy="25" r="15" />
        <circle cx="32" cy="101" r="15" />
        <circle cx="100" cy="101" r="15" />
      </g>
    </pattern>
  );

  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute select-none ${className}`}
      viewBox="0 0 420 640"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {pattern}
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

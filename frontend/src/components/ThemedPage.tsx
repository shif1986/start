import type { ReactNode } from "react";
import BrandPattern from "./BrandPattern";

type ThemedPageProps = {
  children: ReactNode;
  ambiance?: "dark" | "gold" | "network";
  className?: string;
  showPattern?: boolean;
};

const ambianceClasses = {
  dark: "bg-[#0b0d10]",
  gold: "bg-[radial-gradient(circle_at_14%_20%,rgba(199,164,93,.13),transparent_34%),linear-gradient(125deg,#171712_0%,#101217_48%,#090c12_100%)]",
  network: "bg-[radial-gradient(circle_at_85%_15%,rgba(77,163,255,.045),transparent_25%),linear-gradient(145deg,#15181d_0%,#0b0d10_62%,#11130f_100%)]",
};

export default function ThemedPage({ children, ambiance = "dark", className = "", showPattern = true }: ThemedPageProps) {
  return (
    <div className={`themed-page relative isolate min-h-[calc(100svh-170px)] overflow-hidden rounded-3xl border border-start-cream/10 shadow-[inset_0_1px_0_rgba(255,255,255,.025),0_32px_90px_rgba(0,0,0,.18)] max-sm:rounded-none max-sm:border-0 max-sm:shadow-none ${ambianceClasses[ambiance]} ${className}`}>
      <span className="pointer-events-none absolute inset-x-[8%] top-0 -z-10 h-px bg-gradient-to-r from-transparent via-start-gold/30 to-transparent" aria-hidden="true" />
      <span className="pointer-events-none absolute top-[8%] left-[7%] -z-10 size-56 rounded-full bg-start-gold/[.025] blur-3xl" aria-hidden="true" />
      {showPattern && ambiance !== "dark" && (
        <>
          <BrandPattern variant={ambiance === "gold" ? "chain" : "landscape"} className={ambiance === "gold" ? "-top-24 -right-16 -z-10 h-[720px] w-[520px] text-start-cream/[.06] opacity-50 max-sm:opacity-30" : "right-0 bottom-0 -z-10 h-[58%] w-full text-start-cream/[.055] opacity-45 max-sm:opacity-30"} />
          <BrandPattern variant="nodes" className="-bottom-36 -left-20 -z-10 h-[680px] w-[480px] text-start-gold/[.05] opacity-45 max-sm:hidden" />
        </>
      )}
      {showPattern && ambiance === "network" && (
        <>
          <span className="pointer-events-none absolute top-[18%] right-[8%] -z-10 size-2.5 rounded-full bg-[#4da3ff]/75" aria-hidden="true" />
          <span className="pointer-events-none absolute right-[19%] bottom-[14%] -z-10 size-2.5 rounded-full bg-[#ffb33d]/70" aria-hidden="true" />
        </>
      )}
      {children}
    </div>
  );
}

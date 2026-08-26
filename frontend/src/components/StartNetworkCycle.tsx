import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";

type NetworkStep = {
  id: string;
  title: string;
  description: string;
  color: string;
  position: { x: number; y: number };
  icon: ReactNode;
};

const iconClass = "size-7 sm:size-8";

const networkSteps: NetworkStep[] = [
  {
    id: "tax",
    title: "Réduction d’impôt 60 %",
    description:
      "Recevez une facture pour votre abonnement et bénéficiez, lorsque les conditions légales sont remplies, du dispositif fiscal applicable.",
    color: "#e6b83f",
    position: { x: 50, y: 8 },
    icon: <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 3h10l4 4v14H5zM15 3v5h4M8 12h4M8 16h3M15 13l3 5M18 13l-3 5" /></svg>,
  },
  {
    id: "professionals",
    title: "Professionnels",
    description:
      "Développez votre activité et faites connaître vos services auprès d’une communauté chrétienne engagée.",
    color: "#9edb42",
    position: { x: 86, y: 29 },
    icon: <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4.5 21c.5-5 3-7 7.5-7s7 2 7.5 7z" /></svg>,
  },
  {
    id: "individuals",
    title: "Particuliers",
    description:
      "Trouvez des professionnels chrétiens de confiance pour vos besoins et participez à une économie fondée sur la mise en relation et le soutien mutuel.",
    color: "#37c9df",
    position: { x: 86, y: 71 },
    icon: <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 8a8 8 0 0 1 14-2l2 2M20 4v4h-4M20 16a8 8 0 0 1-14 2l-2-2M4 20v-4h4" /><path d="M15 9.5a4 4 0 1 0 0 5M8 11h6M8 14h5" /></svg>,
  },
  {
    id: "development",
    title: "Développement & maintenance",
    description:
      "Une partie des ressources permet de développer, maintenir et améliorer continuellement la plateforme START.",
    color: "#a9df38",
    position: { x: 50, y: 92 },
    icon: <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="12" cy="12" r="3.5" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></svg>,
  },
  {
    id: "mission",
    title: "Humanitaire & Mission",
    description:
      "Contribuer à apporter l’Évangile de Jésus et à soutenir des missions et actions humanitaires.",
    color: "#ef5648",
    position: { x: 14, y: 71 },
    icon: <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M12 21S3 16 3 9.5A4.5 4.5 0 0 1 12 8a4.5 4.5 0 0 1 9 1.5C21 16 12 21 12 21z" /></svg>,
  },
  {
    id: "training",
    title: "Formation & Conférences",
    description:
      "Développer les compétences des entrepreneurs chrétiens grâce à des formations et conférences autour de l’entrepreneuriat et du business du Royaume.",
    color: "#a65cf0",
    position: { x: 14, y: 29 },
    icon: <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m2 9 10-5 10 5-10 5zM6 11.5V17c3 2 9 2 12 0v-5.5M22 9v7" /></svg>,
  },
];

const getConnectionEnd = (position: NetworkStep["position"]) => {
  const dx = position.x - 50;
  const dy = position.y - 50;
  const distance = Math.hypot(dx, dy);
  // The endpoint sits just under the node border, never at its centre.
  const nodeRadius = 6.2;

  return {
    x: position.x - (dx / distance) * nodeRadius,
    y: position.y - (dy / distance) * nodeRadius,
  };
};

export default function StartNetworkCycle() {
  const sectionRef = useRef<HTMLElement>(null);
  const interactionTimerRef = useRef<number | null>(null);
  const entranceTimerRef = useRef<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [hasSequenceStarted, setHasSequenceStarted] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDocumentHidden, setIsDocumentHidden] = useState(document.hidden);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting) {
          setHasEntered(true);
          if (entranceTimerRef.current === null) {
            entranceTimerRef.current = window.setTimeout(() => {
              setHasSequenceStarted(true);
              entranceTimerRef.current = null;
            }, 650);
          }
        } else if (entranceTimerRef.current !== null) {
          window.clearTimeout(entranceTimerRef.current);
          entranceTimerRef.current = null;
        }
      },
      { threshold: 0.32 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (
      !isVisible ||
      !hasSequenceStarted ||
      isPaused ||
      isDocumentHidden ||
      hasCompletedTour
    ) return;
    const timer = window.setTimeout(() => {
      setActiveIndex((current) => {
        if (current >= networkSteps.length - 2) {
          setHasCompletedTour(true);
          return networkSteps.length - 1;
        }
        return current + 1;
      });
    }, 4200);
    return () => window.clearTimeout(timer);
  }, [activeIndex, hasCompletedTour, hasSequenceStarted, isDocumentHidden, isPaused, isVisible]);

  useEffect(() => {
    const handleVisibilityChange = () => setIsDocumentHidden(document.hidden);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => () => {
    if (interactionTimerRef.current !== null) window.clearTimeout(interactionTimerRef.current);
    if (entranceTimerRef.current !== null) window.clearTimeout(entranceTimerRef.current);
  }, []);

  const selectStep = (index: number) => {
    setActiveIndex(index);
    setIsPaused(true);
    if (interactionTimerRef.current !== null) window.clearTimeout(interactionTimerRef.current);
    interactionTimerRef.current = window.setTimeout(() => {
      setIsPaused(false);
      interactionTimerRef.current = null;
    }, 7000);
  };

  const activeStep = networkSteps[activeIndex];

  return (
    <section ref={sectionRef} className={`start-network-cycle ${hasEntered ? "is-entered" : ""}`} aria-labelledby="network-cycle-title">
      <div className="relative z-10 mx-auto max-w-[1240px] px-[clamp(18px,5vw,72px)] py-[clamp(64px,7vw,96px)]">
        <header className="mx-auto max-w-4xl text-center">
          <p className="flex items-center justify-center gap-3 text-[.66rem] font-bold tracking-[.24em] text-start-gold uppercase sm:text-xs"><span className="h-px w-10 bg-gradient-to-r from-transparent to-start-gold" />Le fonctionnement du réseau<span className="h-px w-10 bg-gradient-to-l from-transparent to-start-gold" /></p>
          <h2 id="network-cycle-title" className="mx-auto mt-4 max-w-3xl text-[clamp(1.65rem,3vw,2.8rem)] leading-[1.1] font-bold tracking-[-.04em] text-start-cream">Pourquoi rejoindre <span className="text-start-gold">START Réseau Chrétien&nbsp;?</span></h2>
        </header>

        <div className="mx-auto mt-20 flex max-w-[1040px] justify-center sm:mt-64 lg:mt-72">
          <div className="network-cycle-diagram relative mx-auto aspect-square w-full max-w-[480px]" role="group" aria-label="Les six bénéfices du réseau START">
            <div className="absolute inset-[16%] rounded-full border border-start-gold/20 shadow-[inset_0_0_40px_rgba(199,164,93,.04)]" aria-hidden="true" />
            <svg className="network-cycle-lines absolute inset-0 size-full overflow-visible" viewBox="0 0 100 100" aria-hidden="true">
              {networkSteps.map((step, index) => {
                const end = getConnectionEnd(step.position);
                return <line key={step.id} x1="50" y1="50" x2={end.x} y2={end.y} className={index === activeIndex ? "network-line is-active" : "network-line"} style={{ "--step-color": step.color } as CSSProperties} />;
              })}
            </svg>

            <div className="network-cycle-logo absolute top-1/2 left-1/2 flex size-[38%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-start-gold/65 bg-[#090c11] p-[5.5%] shadow-[0_0_42px_rgba(199,164,93,.2)]">
              <img src="/Logo START_blanc.png" alt="START Réseau Chrétien" className="w-full scale-110" />
            </div>

            {networkSteps.map((step, index) => {
              const active = index === activeIndex;
              return <button key={step.id} data-node={step.id} type="button" aria-pressed={active} aria-label={`Afficher : ${step.title}`} onClick={() => selectStep(index)} className={`network-node absolute flex size-[clamp(48px,7vw,66px)] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-[#0b0e13] transition duration-500 ${active ? "is-active" : "opacity-65 hover:opacity-100"}`} style={{ left: `${step.position.x}%`, top: `${step.position.y}%`, color: step.color, "--step-color": step.color } as CSSProperties}>{step.icon}<span className="network-node-label">{step.title}</span></button>;
            })}

            <div data-active={activeStep.id} className={`network-cycle-copy absolute z-20 w-[min(260px,42vw)] rounded-xl border border-start-cream/10 bg-[#0d1117]/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,.42)] backdrop-blur-md ${hasSequenceStarted ? "is-started" : ""}`} aria-live="polite">
            <span className="text-[.62rem] font-bold tracking-[.18em] text-start-cream/35">{String(activeIndex + 1).padStart(2, "0")} / 06</span>
            <div key={activeStep.id} className="network-step-copy" style={{ "--step-color": activeStep.color } as CSSProperties}>
              <span className="mt-3 block h-px w-10 bg-[var(--step-color)] shadow-[0_0_10px_var(--step-color)]" />
              <h3 className="mt-3 text-[.72rem] font-extrabold leading-[1.4] tracking-[.07em] uppercase" style={{ color: activeStep.color }}>{activeStep.title}</h3>
              <p className="mt-2 text-sm leading-6 text-start-cream/75">{activeStep.description}</p>
            </div>
          </div>
          </div>
        </div>

        <footer className="mx-auto mt-20 max-w-3xl text-center max-sm:mt-16">
          <svg className="mx-auto size-9 text-start-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d="m3 7 4 5 5-8 5 8 4-5-2 12H5z" /></svg>
          <h3 className="mt-3 text-lg font-bold tracking-[.2em] text-start-gold uppercase sm:text-xl">L’argent du Royaume</h3>
          <p className="mt-4 text-sm leading-7 text-start-cream/65 sm:text-base">Faire circuler les ressources au sein du corps du Christ, soutenir son développement et les missions, permettre aux enfants de Dieu de grandir et de prospérer, afin de porter davantage de lumière dans le monde.</p>
          <Link to="/a-propos" className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full border border-start-gold/60 px-6 py-3 text-xs font-bold tracking-[.1em] text-start-gold uppercase transition duration-300 hover:border-start-gold hover:bg-start-gold hover:text-[#090c11] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-start-gold sm:text-sm">
            Découvrir notre vision
          </Link>
        </footer>
      </div>
    </section>
  );
}

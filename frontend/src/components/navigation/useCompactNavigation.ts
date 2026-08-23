import { useEffect, useRef, useState } from "react";
import type { NavigationDisplayState } from "./navigation.types";

export const EXPANDED_SCROLL_THRESHOLD = 24;
export const COMPACT_SCROLL_THRESHOLD = 64;

export function useCompactNavigation(): NavigationDisplayState {
  const [displayState, setDisplayState] =
    useState<NavigationDisplayState>("expanded");
  const displayStateRef = useRef(displayState);

  useEffect(() => {
    displayStateRef.current = displayState;
  }, [displayState]);

  useEffect(() => {
    let animationFrame = 0;

    function updateState() {
      animationFrame = 0;
      const currentState = displayStateRef.current;
      const nextState =
        currentState === "expanded"
          ? window.scrollY >= COMPACT_SCROLL_THRESHOLD
            ? "compact"
            : "expanded"
          : window.scrollY <= EXPANDED_SCROLL_THRESHOLD
            ? "expanded"
            : "compact";

      if (nextState !== currentState) {
        displayStateRef.current = nextState;
        setDisplayState(nextState);
      }
    }

    function handleScroll() {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateState);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateState();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return displayState;
}

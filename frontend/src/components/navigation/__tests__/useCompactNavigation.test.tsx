import { act, fireEvent, render, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  COMPACT_SCROLL_THRESHOLD,
  EXPANDED_SCROLL_THRESHOLD,
  useCompactNavigation,
} from "../useCompactNavigation";

function setScrollPosition(value: number) {
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    value,
  });
}

describe("useCompactNavigation", () => {
  let animationFrames: FrameRequestCallback[];

  beforeEach(() => {
    setScrollPosition(0);
    animationFrames = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      animationFrames.push(callback);
      return animationFrames.length;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
  });

  function flushAnimationFrame() {
    animationFrames.shift()?.(0);
  }

  it("reste développé sous le seuil puis devient compact", () => {
    const { result } = renderHook(() => useCompactNavigation());

    act(() => {
      setScrollPosition(EXPANDED_SCROLL_THRESHOLD + 1);
      fireEvent.scroll(window);
      flushAnimationFrame();
    });
    expect(result.current).toBe("expanded");

    act(() => {
      setScrollPosition(COMPACT_SCROLL_THRESHOLD);
      fireEvent.scroll(window);
      flushAnimationFrame();
    });
    expect(result.current).toBe("compact");
  });

  it("applique une hystérésis et ne clignote pas autour du seuil", () => {
    const { result } = renderHook(() => useCompactNavigation());

    act(() => {
      setScrollPosition(COMPACT_SCROLL_THRESHOLD + 10);
      fireEvent.scroll(window);
      flushAnimationFrame();
    });
    expect(result.current).toBe("compact");

    act(() => {
      setScrollPosition(COMPACT_SCROLL_THRESHOLD - 5);
      fireEvent.scroll(window);
      flushAnimationFrame();
    });
    expect(result.current).toBe("compact");

    act(() => {
      setScrollPosition(EXPANDED_SCROLL_THRESHOLD);
      fireEvent.scroll(window);
      flushAnimationFrame();
    });
    expect(result.current).toBe("expanded");
  });

  it("installe un seul listener passif et le nettoie au démontage", () => {
    const addListener = vi.spyOn(window, "addEventListener");
    const removeListener = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useCompactNavigation());

    const scrollCalls = addListener.mock.calls.filter(([event]) => event === "scroll");
    expect(scrollCalls).toHaveLength(1);
    expect(scrollCalls[0]?.[2]).toEqual({ passive: true });

    const listener = scrollCalls[0]?.[1];
    unmount();
    expect(removeListener).toHaveBeenCalledWith("scroll", listener);
  });

  it("ne déclenche aucun rendu supplémentaire quand l’état final reste identique", () => {
    let renderCount = 0;

    function HookHarness() {
      renderCount += 1;
      useCompactNavigation();
      return null;
    }

    render(<HookHarness />);
    const initialRenderCount = renderCount;

    act(() => {
      setScrollPosition(30);
      fireEvent.scroll(window);
      flushAnimationFrame();
    });
    expect(renderCount).toBe(initialRenderCount);

    act(() => {
      setScrollPosition(COMPACT_SCROLL_THRESHOLD + 1);
      fireEvent.scroll(window);
      flushAnimationFrame();
    });
    const compactRenderCount = renderCount;

    act(() => {
      setScrollPosition(COMPACT_SCROLL_THRESHOLD + 20);
      fireEvent.scroll(window);
      flushAnimationFrame();
    });
    expect(renderCount).toBe(compactRenderCount);
  });
});

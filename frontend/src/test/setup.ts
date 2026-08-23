import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
  document.body.removeAttribute("style");
  document.querySelector("[data-app-content]")?.removeAttribute("inert");
});

Object.defineProperty(window, "scrollTo", {
  configurable: true,
  value: vi.fn(),
});

import { describe, expect, it } from "vitest";
import { canAccessAdmin, resolveAuthDestination } from "./auth-destination";

describe("resolveAuthDestination", () => {
  it("dirige une connexion professionnelle ordinaire vers l'espace professionnel", () => {
    expect(resolveAuthDestination("professional")).toBe("/espace/professionnel");
  });

  it("respecte une demande explicite d'accès à l'administration", () => {
    expect(resolveAuthDestination("professional", "/admin")).toBe("/admin");
  });

  it("empêche un particulier d'entrer dans un parcours professionnel", () => {
    expect(resolveAuthDestination("customer", "/espace/professionnel")).toBe("/espace/particulier");
  });

  it("réserve l’administration aux administrateurs et modérateurs", () => {
    expect(canAccessAdmin("user")).toBe(false);
    expect(canAccessAdmin("moderator")).toBe(true);
    expect(canAccessAdmin("admin")).toBe(true);
  });
});

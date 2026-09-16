import { describe, expect, it } from "vitest";
import { applyPageMetadata, resolvePageMetadata } from "./page-metadata";

describe("resolvePageMetadata", () => {
  it("donne un titre distinct au catalogue et aux catégories", () => {
    expect(resolvePageMetadata("/annonces").title).toContain("Toutes les annonces");
    expect(resolvePageMetadata("/categories").title).toContain("Catégories d’annonces");
  });

  it("n’expose pas l’identité d’un professionnel dans le titre", () => {
    const metadata = resolvePageMetadata("/professionnel/nom-prive");
    expect(metadata.title).toBe("Profil professionnel — START Réseau Chrétien");
    expect(metadata.title).not.toContain("nom-prive");
  });

  it("empêche l’indexation des routes privées", () => {
    expect(resolvePageMetadata("/admin").robots).toBe("noindex,nofollow");
    expect(resolvePageMetadata("/espace/professionnel").robots).toBe("noindex,nofollow");
  });

  it("empêche aussi l’indexation des routes inconnues", () => {
    const metadata = resolvePageMetadata("/route-inexistante");
    expect(metadata.title).toContain("Page introuvable");
    expect(metadata.robots).toBe("noindex,nofollow");
    expect(metadata.canonicalPath).toBeNull();
  });

  it("ajoute une URL canonique seulement avec un domaine HTTPS configuré", () => {
    applyPageMetadata(resolvePageMetadata("/annonces"), "https://example.com/chemin-ignore");
    expect(document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe("https://example.com/annonces");
    expect(document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.content).toBe("https://example.com/annonces");

    applyPageMetadata(resolvePageMetadata("/admin"), "https://example.com");
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.querySelector('meta[property="og:url"]')).toBeNull();
  });
});

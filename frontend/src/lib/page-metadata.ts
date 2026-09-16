export const SITE_NAME = "START Réseau Chrétien";

const defaultDescription =
  "Découvrez les annonces, services et professionnels du réseau START Réseau Chrétien en France et en Suisse.";

export type PageMetadata = {
  title: string;
  description: string;
  robots: "index,follow" | "noindex,nofollow";
  canonicalPath: string | null;
};

const privateRoute = /^\/(admin|espace|auth|connexion|inscription|publier|abonnement)(\/|$)/;

const publicPages: Record<string, Omit<PageMetadata, "canonicalPath">> = {
  "/": {
    title: `${SITE_NAME} — Annonces et professionnels`,
    description: defaultDescription,
    robots: "index,follow",
  },
  "/annonces": {
    title: `Toutes les annonces — ${SITE_NAME}`,
    description: "Parcourez les annonces du réseau en France et en Suisse et trouvez un professionnel, un service ou une opportunité près de chez vous.",
    robots: "index,follow",
  },
  "/categories": {
    title: `Catégories d’annonces — ${SITE_NAME}`,
    description: "Explorez les catégories d’annonces et trouvez les services, biens et opportunités du réseau.",
    robots: "index,follow",
  },
  "/a-propos": {
    title: `Notre vision — ${SITE_NAME}`,
    description: "Découvrez la vision, les valeurs et la mission de START Réseau Chrétien.",
    robots: "index,follow",
  },
  "/don": {
    title: `Faire un don — ${SITE_NAME}`,
    description: "Soutenez le développement du réseau START Réseau Chrétien.",
    robots: "index,follow",
  },
  "/contact": {
    title: `Contact — ${SITE_NAME}`,
    description: "Contactez l’équipe de START Réseau Chrétien.",
    robots: "index,follow",
  },
  "/mentions-legales": { title: `Mentions légales — ${SITE_NAME}`, description: "Consultez les mentions légales de START Réseau Chrétien.", robots: "index,follow" },
  "/confidentialite": { title: `Politique de confidentialité — ${SITE_NAME}`, description: "Consultez la politique de confidentialité de START Réseau Chrétien.", robots: "index,follow" },
  "/conditions-utilisation": { title: `Conditions d’utilisation — ${SITE_NAME}`, description: "Consultez les conditions générales d’utilisation de START Réseau Chrétien.", robots: "index,follow" },
  "/conditions-abonnement": { title: `Conditions d’abonnement — ${SITE_NAME}`, description: "Consultez les conditions d’abonnement de START Réseau Chrétien.", robots: "index,follow" },
  "/cookies": { title: `Politique relative aux cookies — ${SITE_NAME}`, description: "Consultez la politique relative aux cookies de START Réseau Chrétien.", robots: "index,follow" },
};

export function resolvePageMetadata(pathname: string): PageMetadata {
  if (privateRoute.test(pathname)) {
    return {
      title: `Mon espace — ${SITE_NAME}`,
      description: defaultDescription,
      robots: "noindex,nofollow",
      canonicalPath: null,
    };
  }

  const staticPage = publicPages[pathname];
  if (staticPage) {
    return { ...staticPage, canonicalPath: pathname };
  }

  if (pathname.startsWith("/annonce/")) {
    return {
      title: `Annonce — ${SITE_NAME}`,
      description: "Consultez cette annonce et les informations proposées par un membre du réseau.",
      robots: "index,follow",
      canonicalPath: pathname,
    };
  }

  if (pathname.startsWith("/professionnel/")) {
    return {
      title: `Profil professionnel — ${SITE_NAME}`,
      description: "Consultez le profil public d’un professionnel du réseau et découvrez ses annonces.",
      robots: "index,follow",
      canonicalPath: pathname,
    };
  }

  return {
    title: `Page introuvable — ${SITE_NAME}`,
    description: "Cette page n’existe pas ou n’est plus disponible.",
    robots: "noindex,nofollow",
    canonicalPath: null,
  };
}

function setMeta(selector: string, attribute: "name" | "property", key: string, content: string) {
  let element = document.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.append(element);
  }
  element.content = content;
}

export function applyPageMetadata(metadata: PageMetadata, configuredSiteUrl?: string) {
  document.title = metadata.title;
  setMeta('meta[name="description"]', "name", "description", metadata.description);
  setMeta('meta[name="robots"]', "name", "robots", metadata.robots);
  setMeta('meta[property="og:title"]', "property", "og:title", metadata.title);
  setMeta('meta[property="og:description"]', "property", "og:description", metadata.description);
  setMeta('meta[property="og:type"]', "property", "og:type", "website");
  setMeta('meta[property="og:site_name"]', "property", "og:site_name", SITE_NAME);
  setMeta('meta[property="og:locale"]', "property", "og:locale", "fr_FR");
  setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
  setMeta('meta[name="twitter:title"]', "name", "twitter:title", metadata.title);
  setMeta('meta[name="twitter:description"]', "name", "twitter:description", metadata.description);

  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  const siteUrl = configuredSiteUrl?.trim();
  if (!siteUrl || !metadata.canonicalPath) {
    canonical?.remove();
    document.querySelector('meta[property="og:url"]')?.remove();
    document.querySelector('meta[property="og:image"]')?.remove();
    return;
  }

  try {
    const origin = new URL(siteUrl);
    if (origin.protocol !== "https:") throw new Error("HTTPS required");
    const canonicalUrl = new URL(metadata.canonicalPath, `${origin.origin}/`).href;
    const canonicalElement = canonical ?? document.createElement("link");
    canonicalElement.rel = "canonical";
    canonicalElement.href = canonicalUrl;
    if (!canonical) document.head.append(canonicalElement);
    setMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    setMeta('meta[property="og:image"]', "property", "og:image", new URL("/logo-start-couleur-616.png", origin.origin).href);
  } catch {
    canonical?.remove();
    document.querySelector('meta[property="og:url"]')?.remove();
    document.querySelector('meta[property="og:image"]')?.remove();
  }
}

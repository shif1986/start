#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const appSource = await readFile(new URL("../frontend/src/App.tsx", import.meta.url), "utf8");
const netlifySource = await readFile(new URL("../netlify.toml", import.meta.url), "utf8");
const notFoundSource = await readFile(new URL("../frontend/public/404.html", import.meta.url), "utf8");

const appRoutes = [...appSource.matchAll(/<Route\s+path="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((route) => route !== "/" && route !== "*");

const redirects = netlifySource
  .split("[[redirects]]")
  .slice(1)
  .map((block) => ({
    from: block.match(/^\s*from\s*=\s*"([^"]+)"/m)?.[1],
    to: block.match(/^\s*to\s*=\s*"([^"]+)"/m)?.[1],
    status: Number(block.match(/^\s*status\s*=\s*(\d+)/m)?.[1]),
  }));

const spaRedirects = redirects
  .filter((redirect) => redirect.to === "/index.html" && redirect.status === 200)
  .map((redirect) => redirect.from)
  .filter(Boolean);

function routeExample(route) {
  return route.replace(/:[^/]+/g, "verification");
}

function matchesRedirect(route, redirect) {
  const example = routeExample(route);
  if (redirect === example) return true;
  return redirect.endsWith("/*") && example.startsWith(redirect.slice(0, -1));
}

const missingRoutes = appRoutes.filter((route) => !spaRedirects.some((redirect) => matchesRedirect(route, redirect)));
if (missingRoutes.length > 0) {
  throw new Error(`Routes React absentes de netlify.toml : ${missingRoutes.join(", ")}`);
}

const finalRedirect = redirects.at(-1);
if (finalRedirect?.from !== "/*" || finalRedirect.to !== "/404.html" || finalRedirect.status !== 404) {
  throw new Error("Le dernier redirect Netlify doit servir /404.html avec le statut 404.");
}

if (!/<meta\s+name="robots"\s+content="noindex,nofollow"\s*\/>/i.test(notFoundSource)) {
  throw new Error("frontend/public/404.html doit rester en noindex,nofollow.");
}

if (!redirects.some((redirect) => redirect.from === "https://www.startreseauchretien.com/*" && redirect.status === 301)) {
  throw new Error("La redirection permanente de www vers le domaine principal est absente.");
}

console.log(`Configuration Netlify cohérente : ${appRoutes.length} routes React couvertes (${repositoryRoot}).`);

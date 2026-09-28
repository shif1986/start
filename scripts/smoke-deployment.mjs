#!/usr/bin/env node

const rawBaseUrl = process.argv[2] ?? process.env.START_SITE_URL;
const expectSitemap = process.env.START_EXPECT_SITEMAP === "1";
const expectNotFound = process.env.START_EXPECT_404 === "1";
const expectSecurityHeaders = process.env.START_EXPECT_SECURITY_HEADERS === "1";
const expectedCanonicalOrigin = process.env.START_EXPECT_CANONICAL_ORIGIN;
const timeoutMs = Number.parseInt(process.env.START_SMOKE_TIMEOUT_MS ?? "15000", 10);

function fail(message) {
  console.error(`✗ ${message}`);
  process.exitCode = 1;
}

if (!rawBaseUrl) {
  fail("URL manquante. Utilisation : npm run smoke:deployment -- https://exemple.fr");
  process.exit();
}

let baseUrl;
try {
  baseUrl = new URL(rawBaseUrl);
  const localHttp = baseUrl.protocol === "http:" && ["localhost", "127.0.0.1"].includes(baseUrl.hostname);
  if (baseUrl.protocol !== "https:" && !localHttp) throw new Error("HTTPS requis hors environnement local");
  baseUrl.pathname = "/";
  baseUrl.search = "";
  baseUrl.hash = "";
} catch (error) {
  fail(error instanceof Error ? error.message : "URL invalide");
  process.exit();
}

async function request(pathname, expectedType, expectedStatus = 200) {
  const url = new URL(pathname, baseUrl);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": "START-deployment-smoke/1.0" },
      signal: AbortSignal.timeout(timeoutMs),
    });
    const body = await response.text();
    const contentType = response.headers.get("content-type") ?? "";
    if (response.status !== expectedStatus) {
      fail(`${pathname} répond ${response.status} au lieu de ${expectedStatus}`);
      return null;
    }
    if (!contentType.includes(expectedType)) {
      fail(`${pathname} renvoie ${contentType || "un type inconnu"} au lieu de ${expectedType}`);
      return null;
    }
    console.log(`✓ ${pathname} — ${response.status} — ${Math.round(body.length / 1024)} Kio`);
    return { body, headers: response.headers, url: response.url };
  } catch (error) {
    fail(`${pathname} inaccessible : ${error instanceof Error ? error.message : "erreur inconnue"}`);
    return null;
  }
}

for (const pathname of ["/", "/annonces", "/categories", "/contact"]) {
  const result = await request(pathname, "text/html");
  if (result && !result.body.includes('id="root"')) fail(`${pathname} ne contient pas la racine React attendue`);

  if (result && expectSecurityHeaders) {
    const requiredHeaders = {
      "referrer-policy": "strict-origin-when-cross-origin",
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY",
    };
    for (const [name, expectedValue] of Object.entries(requiredHeaders)) {
      if (result.headers.get(name) !== expectedValue) fail(`${pathname} ne renvoie pas ${name}: ${expectedValue}`);
    }
    if (!result.headers.get("strict-transport-security")?.includes("max-age=")) {
      fail(`${pathname} ne renvoie pas Strict-Transport-Security`);
    }
  }
}

const robots = await request("/robots.txt", "text/plain");
if (robots && !/^User-agent:\s*\*/im.test(robots.body)) fail("robots.txt ne contient pas de règle User-agent globale");

if (expectSitemap) {
  const sitemap = await request("/sitemap.xml", "xml");
  if (sitemap && !sitemap.body.includes("<urlset")) fail("sitemap.xml ne contient pas de urlset");
  if (robots && !/^Sitemap:\s*https:\/\//im.test(robots.body)) fail("robots.txt ne référence pas le sitemap HTTPS");

  if (sitemap && expectedCanonicalOrigin) {
    const expectedOrigin = new URL(expectedCanonicalOrigin).origin;
    if (!sitemap.body.includes(`<loc>${expectedOrigin}/</loc>`)) {
      fail(`sitemap.xml ne contient pas l’origine canonique ${expectedOrigin}`);
    }
  }
}

if (expectNotFound) {
  const marker = `verification-404-${Date.now()}`;
  const notFound = await request(`/${marker}`, "text/html", 404);
  if (notFound && !/noindex,nofollow/i.test(notFound.body)) fail("la page HTTP 404 n’est pas en noindex,nofollow");
}

if (!process.exitCode) console.log(`Recette HTTP réussie pour ${baseUrl.origin}.`);

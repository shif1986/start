#!/usr/bin/env node

const rawBaseUrl = process.argv[2] ?? process.env.START_SITE_URL;
const expectSitemap = process.env.START_EXPECT_SITEMAP === "1";
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

async function request(pathname, expectedType) {
  const url = new URL(pathname, baseUrl);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": "START-deployment-smoke/1.0" },
      signal: AbortSignal.timeout(timeoutMs),
    });
    const body = await response.text();
    const contentType = response.headers.get("content-type") ?? "";
    if (!response.ok) {
      fail(`${pathname} répond ${response.status}`);
      return null;
    }
    if (!contentType.includes(expectedType)) {
      fail(`${pathname} renvoie ${contentType || "un type inconnu"} au lieu de ${expectedType}`);
      return null;
    }
    console.log(`✓ ${pathname} — ${response.status} — ${Math.round(body.length / 1024)} Kio`);
    return body;
  } catch (error) {
    fail(`${pathname} inaccessible : ${error instanceof Error ? error.message : "erreur inconnue"}`);
    return null;
  }
}

for (const pathname of ["/", "/annonces", "/categories", "/contact"]) {
  const html = await request(pathname, "text/html");
  if (html && !html.includes('id="root"')) fail(`${pathname} ne contient pas la racine React attendue`);
}

const robots = await request("/robots.txt", "text/plain");
if (robots && !/^User-agent:\s*\*/im.test(robots)) fail("robots.txt ne contient pas de règle User-agent globale");

if (expectSitemap) {
  const sitemap = await request("/sitemap.xml", "xml");
  if (sitemap && !sitemap.includes("<urlset")) fail("sitemap.xml ne contient pas de urlset");
}

if (!process.exitCode) console.log(`Recette HTTP réussie pour ${baseUrl.origin}.`);

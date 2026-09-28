export function jsonResponse(body: unknown, status = 200, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
}

function configuredOrigins() {
  return (Deno.env.get("APP_URLS") ?? Deno.env.get("APP_URL") ?? "")
    .split(",")
    .map((value) => value.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

export function isOriginAllowed(origin: string) {
  const normalized = origin.replace(/\/$/, "");
  const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalized);
  return configuredOrigins().includes(normalized)
    || (Deno.env.get("ALLOW_LOCAL_ORIGINS") === "true" && isLocal);
}

export function corsHeaders(request: Request) {
  const origin = request.headers.get("origin") ?? "";
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
  if (isOriginAllowed(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

export function requireAllowedOrigin(request: Request, headers: HeadersInit) {
  const origin = request.headers.get("origin") ?? "";
  if (!isOriginAllowed(origin)) return jsonResponse({ error: "Origine non autorisée." }, 403, headers);
  return null;
}

export function requirePost(request: Request, headers: HeadersInit) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "POST") return jsonResponse({ error: "Méthode non autorisée." }, 405, headers);
  return null;
}

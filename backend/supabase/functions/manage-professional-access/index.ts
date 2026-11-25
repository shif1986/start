import { corsHeaders, jsonResponse, requireAllowedOrigin, requirePost } from "../_shared/http.ts";
import { createAdminClient, getAuthenticatedUser } from "../_shared/supabase.ts";

type AccessDuration = "one_year" | "lifetime";
type RequestBody = {
  action?: "list" | "grant" | "revoke";
  email?: string;
  duration?: AccessDuration;
  note?: string;
};

function normalizeEmail(value: unknown) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? email : null;
}

function oneYearFromNow() {
  const date = new Date();
  date.setUTCFullYear(date.getUTCFullYear() + 1);
  return date.toISOString();
}

Deno.serve(async (request) => {
  const headers = corsHeaders(request);
  const originResponse = requireAllowedOrigin(request, headers);
  if (originResponse) return originResponse;
  const methodResponse = requirePost(request, headers);
  if (methodResponse) return methodResponse;

  try {
    const user = await getAuthenticatedUser(request);
    const admin = createAdminClient();
    const { data: profile, error: profileError } = await admin.from("profiles")
      .select("role,account_status")
      .eq("id", user.id)
      .single();
    if (profileError) throw profileError;
    if (profile.account_status !== "active" || !["admin", "moderator"].includes(profile.role)) {
      return jsonResponse({ error: "Accès administrateur requis." }, 403, headers);
    }

    const body = await request.json() as RequestBody;
    if (body.action === "list") {
      const { data, error } = await admin.from("professional_access_grants")
        .select("id,email,duration,starts_at,ends_at,revoked_at,note,created_at")
        .order("revoked_at", { ascending: true, nullsFirst: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return jsonResponse({ grants: data ?? [] }, 200, headers);
    }

    const email = normalizeEmail(body.email);
    if (!email) return jsonResponse({ error: "Indiquez une adresse e-mail valide." }, 400, headers);

    if (body.action === "revoke") {
      const { error } = await admin.from("professional_access_grants")
        .update({ revoked_at: new Date().toISOString() })
        .eq("email", email)
        .is("revoked_at", null);
      if (error) throw error;
      return jsonResponse({ revoked: true }, 200, headers);
    }

    if (body.action !== "grant" || (body.duration !== "one_year" && body.duration !== "lifetime")) {
      return jsonResponse({ error: "Durée d’accès invalide." }, 400, headers);
    }

    const note = typeof body.note === "string" ? body.note.trim().slice(0, 500) || null : null;
    const { data: grant, error: grantError } = await admin.from("professional_access_grants")
      .upsert({
        email,
        duration: body.duration,
        starts_at: new Date().toISOString(),
        ends_at: body.duration === "one_year" ? oneYearFromNow() : null,
        revoked_at: null,
        note,
        granted_by: user.id,
      }, { onConflict: "email" })
      .select("id,email,duration,starts_at,ends_at,revoked_at,note,created_at")
      .single();
    if (grantError) throw grantError;

    const { error: applyError } = await admin.rpc("apply_professional_access_grant", { p_email: email });
    if (applyError) throw applyError;
    const { error: auditError } = await admin.from("moderation_audit_log").insert({
      moderator_id: user.id,
      action: "professional_access_granted",
      target_type: "professional_access_grant",
      target_id: grant.id,
      reason: body.duration === "lifetime" ? "Accès professionnel offert à vie" : "Accès professionnel offert pendant un an",
      metadata: { email, duration: body.duration },
    });
    if (auditError) throw auditError;

    return jsonResponse({ grant }, 200, headers);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Impossible de gérer l’accès professionnel offert.";
    const status = message === "Authentification requise" ? 401 : 500;
    return jsonResponse({ error: status === 500 ? "Impossible de gérer l’accès professionnel offert." : message }, status, headers);
  }
});

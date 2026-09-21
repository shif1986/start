import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { AuthError } from "@supabase/supabase-js";
import ThemedPage from "../components/ThemedPage";
import { canAccessAdmin, resolveAuthDestination } from "../features/auth/model/auth-destination";
import { getCurrentProfile } from "../features/profiles/api/get-current-profile";
import { getSupabaseClient } from "../lib/supabase/client";

function safeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : undefined;
}

const authorizationCodeExchanges = new Map<string, Promise<AuthError | null>>();

function exchangeAuthorizationCodeOnce(code: string) {
  const existingExchange = authorizationCodeExchanges.get(code);
  if (existingExchange) return existingExchange;

  const exchange = getSupabaseClient().auth.exchangeCodeForSession(code).then(({ error }) => error);
  authorizationCodeExchanges.set(code, exchange);
  return exchange;
}

function describeAuthorizationCodeError(error: AuthError) {
  if (error.code === "pkce_code_verifier_not_found") {
    return "Ce lien de récupération doit être ouvert dans le même navigateur et le même profil que ceux utilisés pour le demander. Demandez un nouveau lien depuis ce navigateur, puis ouvrez uniquement le dernier e-mail reçu.";
  }
  if (error.code === "flow_state_not_found") {
    return "Ce lien d’authentification a déjà été utilisé ou a expiré. Demandez un nouveau lien puis ouvrez uniquement le dernier e-mail reçu.";
  }

  const detail = import.meta.env.DEV ? ` (${error.code ?? "auth"}: ${error.message})` : "";
  return `Impossible de valider le lien d’authentification.${detail}`;
}

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function completeAuthentication() {
      const callbackError = searchParams.get("error_description") ?? searchParams.get("error");
      if (callbackError) throw new Error(callbackError);

      const client = getSupabaseClient();
      const authorizationCode = searchParams.get("code");
      if (authorizationCode) {
        const exchangeError = await exchangeAuthorizationCodeOnce(authorizationCode);
        if (exchangeError) {
          throw new Error(describeAuthorizationCodeError(exchangeError));
        }
      }

      const { data, error: sessionError } = await client.auth.getSession();
      if (sessionError || !data.session) throw new Error("Le lien est invalide ou a expiré. Recommencez la connexion.");

      const pendingAccountType = sessionStorage.getItem("start-oauth-account-type");
      if (pendingAccountType === "professional") {
        const { error: profileError } = await client.rpc("complete_google_account_type", {
          requested_account_type: pendingAccountType,
        });
        if (profileError) {
          const detail = import.meta.env.DEV ? ` (${profileError.code}: ${profileError.message})` : "";
          throw new Error(`Impossible de finaliser le compte professionnel.${detail}`);
        }
      }
      if (pendingAccountType === "customer" || pendingAccountType === "professional") {
        sessionStorage.removeItem("start-oauth-account-type");
      }

      const pendingIdentity = sessionStorage.getItem("start-oauth-registration-identity");
      if (pendingIdentity) {
        const identity = JSON.parse(pendingIdentity) as { displayName?: string; companyName?: string };
        if (identity.displayName) {
          const { error: identityError } = await client.rpc("complete_registration_identity", {
            p_display_name: identity.displayName,
            p_company_name: identity.companyName || null,
          });
          if (identityError) {
            const detail = import.meta.env.DEV ? ` (${identityError.code}: ${identityError.message})` : "";
            throw new Error(`Impossible d’enregistrer votre identité.${detail}`);
          }
        }
        sessionStorage.removeItem("start-oauth-registration-identity");
      }

      const profile = await getCurrentProfile(data.session.user.id, client);
      const hasAdminIntent = sessionStorage.getItem("start-auth-admin-intent") === "true" || searchParams.get("intent") === "admin";
      if (hasAdminIntent && !canAccessAdmin(profile.role)) {
        sessionStorage.removeItem("start-auth-admin-intent");
        sessionStorage.removeItem("start-oauth-next");
        await client.auth.signOut();
        throw new Error("Accès administrateur refusé : ce compte ne possède pas le rôle administrateur ou modérateur.");
      }
      const storedNext = safeNext(sessionStorage.getItem("start-oauth-next"));
      const rawRequestedNext = safeNext(searchParams.get("next")) ?? storedNext;
      const requestedNext = rawRequestedNext?.startsWith("/admin") && !hasAdminIntent
        ? undefined
        : rawRequestedNext;
      sessionStorage.removeItem("start-auth-admin-intent");
      sessionStorage.removeItem("start-oauth-next");
      const destination = resolveAuthDestination(profile.accountType, requestedNext);

      if (active) navigate(destination, { replace: true });
    }

    void completeAuthentication().catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : "L’authentification n’a pas pu être finalisée.");
    });

    return () => { active = false; };
  }, [navigate, searchParams]);

  return (
    <ThemedPage ambiance="gold" className="grid min-h-[55vh] place-items-center px-5 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-start-cream/10 bg-[#121418]/95 p-8 text-center shadow-[0_28px_80px_rgba(0,0,0,.28)]">
        {error ? <><h1 className="text-2xl font-semibold">Authentification non finalisée</h1><p className="mt-4 rounded-xl border border-red-300/30 bg-red-400/10 px-4 py-3 leading-7 text-start-cream" role="alert">{error}</p><Link className="mt-7 inline-flex min-h-11 items-center rounded-xl bg-start-gold px-6 font-bold text-start-ink" to={error.startsWith("Ce lien") ? "/mot-de-passe-oublie" : "/connexion"}>{error.startsWith("Ce lien") ? "Demander un nouveau lien" : "Revenir à la connexion"}</Link></> : <><h1 className="text-2xl font-semibold">Activation de votre compte…</h1><p className="mt-4 text-start-cream/60" role="status">Nous vérifions votre session et préparons votre espace.</p></>}
      </div>
    </ThemedPage>
  );
}

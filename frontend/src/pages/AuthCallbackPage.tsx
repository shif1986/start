import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ThemedPage from "../components/ThemedPage";
import { getCurrentProfile } from "../features/profiles/api/get-current-profile";
import { getSupabaseClient } from "../lib/supabase/client";

function safeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : undefined;
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
        const { error: exchangeError } = await client.auth.exchangeCodeForSession(authorizationCode);
        if (exchangeError) {
          const detail = import.meta.env.DEV ? ` (${exchangeError.code ?? "auth"}: ${exchangeError.message})` : "";
          throw new Error(`Impossible de valider la connexion Google.${detail}`);
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

      const profile = await getCurrentProfile(data.session.user.id, client);
      const requestedNext = safeNext(searchParams.get("next")) ?? safeNext(sessionStorage.getItem("start-oauth-next"));
      sessionStorage.removeItem("start-oauth-next");
      const destination = profile.accountType === "professional"
        ? requestedNext ?? "/abonnement"
        : requestedNext === "/abonnement" || requestedNext?.startsWith("/espace/professionnel")
          ? "/espace/particulier"
          : requestedNext ?? "/espace/particulier";

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
        {error ? <><h1 className="text-2xl font-semibold">Connexion non finalisée</h1><p className="mt-4 rounded-xl border border-red-300/30 bg-red-400/10 px-4 py-3 leading-7 text-start-cream" role="alert">{error}</p><Link className="mt-7 inline-flex min-h-11 items-center rounded-xl bg-start-gold px-6 font-bold text-start-ink" to="/connexion">Revenir à la connexion</Link></> : <><h1 className="text-2xl font-semibold">Activation de votre compte…</h1><p className="mt-4 text-start-cream/60" role="status">Nous vérifions votre session et préparons votre espace.</p></>}
      </div>
    </ThemedPage>
  );
}

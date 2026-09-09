import type { Database } from "../../../lib/supabase/database.types";

type AccountType = Database["public"]["Enums"]["account_type"];
type UserRole = Database["public"]["Enums"]["user_role"];

export function canAccessAdmin(role: UserRole) {
  return role === "admin" || role === "moderator";
}

export function resolveAuthDestination(accountType: AccountType, requestedNext?: string) {
  if (accountType === "professional") {
    return requestedNext ?? "/espace/professionnel";
  }

  if (requestedNext === "/abonnement" || requestedNext?.startsWith("/espace/professionnel")) {
    return "/espace/particulier";
  }

  return requestedNext ?? "/espace/particulier";
}

import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getDataSource } from "../../../lib/data-source";
import { useCurrentProfile } from "../../profiles/hooks/use-current-profile";
import type { Database } from "../../../lib/supabase/database.types";
import { useAuth } from "../context/use-auth";

type UserRole = Database["public"]["Enums"]["user_role"];
type AccountType = Database["public"]["Enums"]["account_type"];

type ProtectedRouteProps = {
  children: ReactNode;
  roles?: UserRole[];
  accountTypes?: AccountType[];
  unauthorizedTo?: string;
  unauthenticatedTo?: string;
};

export default function ProtectedRoute({ children, roles, accountTypes, unauthorizedTo = "/", unauthenticatedTo }: ProtectedRouteProps) {
  const location = useLocation();
  const { session, isLoading } = useAuth();
  const profileQuery = useCurrentProfile();

  if (getDataSource() === "static") return children;

  if (isLoading || (session && profileQuery.isPending)) {
    return <div className="grid min-h-[45vh] place-content-center text-start-cream/65" role="status">Vérification de votre session…</div>;
  }

  if (!session) {
    if (unauthenticatedTo) return <Navigate to={unauthenticatedTo} replace />;
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    const adminIntent = location.pathname.startsWith("/admin") ? "&admin=true" : "";
    return <Navigate to={`/connexion?redirect=${redirect}${adminIntent}`} replace />;
  }

  const profile = profileQuery.data;
  if (!profile || (roles && !roles.includes(profile.role)) || (accountTypes && !accountTypes.includes(profile.accountType))) {
    return <Navigate to={unauthorizedTo} replace />;
  }

  return children;
}

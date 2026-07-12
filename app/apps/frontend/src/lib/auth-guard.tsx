import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0087CA]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export function PublicRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <>{children}</>;
  }

  if (user) {
    return <Navigate to="/inbox" replace />;
  }

  return <>{children}</>;
}

export function AdminProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, isError } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0087CA]" />
      </div>
    );
  }

  if (!user || isError) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = user.role || "user";
  const plan = user.plan || "free";
  const path = location.pathname;

  // Accès Super Admin : TOUT
  if (role === "superadmin") {
    return <>{children}</>;
  }

  // Accès Utilisateur Premium : Team, Developers, Billing
  if (plan === "premium") {
    const allowed = ["/admin/team", "/admin/developers", "/admin/billing"];
    if (allowed.some((p) => path.startsWith(p))) {
      return <>{children}</>;
    }
  }

  // Accès Utilisateur Classique : Billing uniquement
  if (path.startsWith("/admin/billing")) {
    return <>{children}</>;
  }

  // Sinon redirection vers Inbox
  return <Navigate to="/inbox" replace />;
}

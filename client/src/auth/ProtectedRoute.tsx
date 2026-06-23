import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

// Wrap any route that needs a logged-in user. Pass `role="Admin"` to gate by role (step #6).
export function ProtectedRoute({ children, role }: { children: ReactNode; role?: string }) {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: 32 }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

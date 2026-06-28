import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-4">
        <p className="phb-description text-sm text-[#766649]">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

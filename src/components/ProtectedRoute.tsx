import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
          </div>

          <div className="grid gap-6">
            <div className="h-64 bg-muted rounded-lg animate-pulse"></div>
            <div className="h-32 bg-muted rounded-lg animate-pulse"></div>
            <div className="h-48 bg-muted rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;

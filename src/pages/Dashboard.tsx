import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Redirect based on user role
    if (profile?.role) {
      switch (profile.role) {
        case 'admin':
          navigate("/admin", { replace: true });
          break;
        case 'organizer':
          navigate("/organizer-dashboard", { replace: true });
          break;
        case 'participant':
        case 'team':
          navigate("/participant-dashboard", { replace: true });
          break;
        default:
          // Stay on dashboard for unknown roles
          break;
      }
    }
  }, [user, profile, navigate]);

  // Show loading while redirecting
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">A redirecionar...</p>
        </div>
      </div>
    </div>
  );
}
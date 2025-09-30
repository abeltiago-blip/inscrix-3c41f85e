import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [hasAnyAdmin, setHasAnyAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (user && !loading) {
        try {
          // Verificar se o usuário atual é admin
          const isCurrentUserAdmin = profile?.role === 'admin';
          setIsAdmin(isCurrentUserAdmin);

          // Verificar se existe algum admin no sistema
          const { data: adminUsers } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('role', 'admin')
            .limit(1);

          const hasAdmin = adminUsers && adminUsers.length > 0;
          setHasAnyAdmin(hasAdmin);

          if (!isCurrentUserAdmin && hasAdmin) {
            toast({
              title: "Acesso Negado",
              description: "Não tem permissões de administrador",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Error checking admin access:', error);
          setIsAdmin(false);
          setHasAnyAdmin(true); // Assumir que existe para evitar setup desnecessário
        }
      }
    };

    checkAdminAccess();
  }, [user, profile, loading, toast]);

  if (loading || isAdmin === null || hasAnyAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se não há nenhum admin no sistema, redirecionar para setup
  if (!hasAnyAdmin) {
    return <Navigate to="/admin/setup" replace />;
  }

  // Se o usuário não é admin mas existe admin no sistema, negar acesso
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
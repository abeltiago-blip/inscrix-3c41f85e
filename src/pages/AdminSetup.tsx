import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { promoteFirstUserToAdmin } from "@/utils/adminUtils";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const AdminSetup = () => {
  const [isPromoting, setIsPromoting] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const { toast } = useToast();
  const { profile, user } = useAuth();

  useEffect(() => {
    // Verificar se o usuário atual já é admin
    if (profile?.role === 'admin') {
      setSetupComplete(true);
    }
  }, [profile]);

  const handlePromoteToAdmin = async () => {
    setIsPromoting(true);
    
    try {
      const result = await promoteFirstUserToAdmin();
      
      if (result.success) {
        toast({
          title: "Sucesso!",
          description: result.message,
        });
        setSetupComplete(true);
        
        // Recarregar a página para atualizar o contexto de autenticação
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast({
          title: "Aviso",
          description: result.message,
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error promoting user:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao promover usuário",
        variant: "destructive",
      });
    } finally {
      setIsPromoting(false);
    }
  };

  if (setupComplete || profile?.role === 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Setup Completo!</CardTitle>
            <CardDescription>
              Você já tem permissões de administrador
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild className="w-full">
              <Link to="/admin">Acessar Painel Administrativo</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Setup Administrativo</CardTitle>
          <CardDescription>
            Configure o primeiro administrador da plataforma INSCRIX
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-medium">Primeiro Usuário</span>
            </div>
            <p className="text-sm text-muted-foreground">
              O primeiro usuário registado na plataforma será automaticamente promovido a administrador.
            </p>
          </div>
          
          {user ? (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm">
                <strong>Usuário atual:</strong> {profile?.email || user.email}
              </p>
              <p className="text-sm text-muted-foreground">
                Este usuário será promovido a administrador
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                Por favor, faça login primeiro para continuar com o setup
              </p>
            </div>
          )}

          <Button 
            onClick={handlePromoteToAdmin}
            disabled={isPromoting || !user}
            className="w-full"
          >
            {isPromoting ? "A promover..." : "Promover a Administrador"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Esta ação só pode ser executada uma vez. Depois de ter um administrador, 
            novos administradores devem ser criados através do painel administrativo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetup;
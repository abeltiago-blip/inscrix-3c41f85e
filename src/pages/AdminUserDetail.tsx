import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Shield, ShieldCheck, Mail, Phone, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'admin' | 'organizer' | 'participant' | 'team';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  organization_name?: string;
  team_name?: string;
  bio?: string;
}

export default function AdminUserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || profile?.role !== 'admin') {
      navigate("/admin");
      return;
    }
    if (userId) {
      loadUserProfile();
    }
  }, [userId, user, profile, navigate]);

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar perfil do utilizador",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500 text-white';
      case 'organizer': return 'bg-blue-500 text-white';
      case 'participant': return 'bg-green-500 text-white';
      case 'team': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  if (!userProfile) {
    return <div className="flex items-center justify-center min-h-screen">Utilizador não encontrado</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Detalhes do Utilizador</h1>
            <p className="text-muted-foreground">Informações completas do perfil</p>
          </div>
          <div className="ml-auto">
            <Button onClick={() => navigate(`/admin/user/${userId}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  {userProfile.role === 'admin' && <Shield className="h-5 w-5 text-primary" />}
                  {userProfile.role === 'organizer' && <ShieldCheck className="h-5 w-5 text-primary" />}
                </div>
                {userProfile.first_name} {userProfile.last_name}
              </CardTitle>
              <CardDescription>Informações pessoais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{userProfile.email}</span>
              </div>
              
              {userProfile.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{userProfile.phone}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Registado em {new Date(userProfile.created_at).toLocaleDateString('pt-PT')}</span>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={getRoleBadgeColor(userProfile.role)}>
                  {userProfile.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                  {userProfile.role === 'organizer' && <ShieldCheck className="h-3 w-3 mr-1" />}
                  {userProfile.role.toUpperCase()}
                </Badge>
                <Badge variant={userProfile.is_active ? "default" : "destructive"}>
                  {userProfile.is_active ? "Ativo" : "Inativo"}
                </Badge>
              </div>

              {userProfile.bio && (
                <div>
                  <h4 className="font-medium mb-2">Biografia</h4>
                  <p className="text-sm text-muted-foreground">{userProfile.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações Profissionais</CardTitle>
              <CardDescription>Dados organizacionais e equipas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userProfile.organization_name && (
                <div>
                  <h4 className="font-medium">Organização</h4>
                  <p className="text-sm text-muted-foreground">{userProfile.organization_name}</p>
                </div>
              )}

              {userProfile.team_name && (
                <div>
                  <h4 className="font-medium">Equipa</h4>
                  <p className="text-sm text-muted-foreground">{userProfile.team_name}</p>
                </div>
              )}

              <div>
                <h4 className="font-medium">Última Atualização</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(userProfile.updated_at).toLocaleDateString('pt-PT')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield,
  Bell,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  Key,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Globe,
  Moon,
  Sun,
  Monitor,
  Download,
  Upload,
  RefreshCw,
  Lock,
  Unlock,
  Database,
  Settings2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { SMTPTester } from "@/components/SMTPTester";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [theme, setTheme] = useState('system');

  // Settings state
  const [notifications, setNotifications] = useState({
    email_events: true,
    email_marketing: false,
    sms_events: false,
    push_events: true,
    weekly_digest: true
  });

  const [privacy, setPrivacy] = useState({
    profile_public: false,
    show_participation_history: true,
    allow_event_invitations: true,
    data_analytics: true
  });

  const [security, setSecurity] = useState({
    two_factor_enabled: false,
    login_notifications: true,
    session_timeout: 30
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    loadSettings();
  }, [user, navigate]);

  const loadSettings = async () => {
    try {
      // Load user preferences from database or localStorage
      const savedNotifications = localStorage.getItem('notifications');
      const savedPrivacy = localStorage.getItem('privacy');
      const savedSecurity = localStorage.getItem('security');
      const savedTheme = localStorage.getItem('theme') || 'system';

      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
      if (savedPrivacy) {
        setPrivacy(JSON.parse(savedPrivacy));
      }
      if (savedSecurity) {
        setSecurity(JSON.parse(savedSecurity));
      }
      setTheme(savedTheme);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveNotificationSettings = async () => {
    setLoading(true);
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
      
      toast({
        title: "Configurações guardadas",
        description: "As suas preferências de notificação foram atualizadas",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao guardar configurações",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const savePrivacySettings = async () => {
    setLoading(true);
    try {
      localStorage.setItem('privacy', JSON.stringify(privacy));
      
      toast({
        title: "Configurações guardadas",
        description: "As suas preferências de privacidade foram atualizadas",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao guardar configurações",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSecuritySettings = async () => {
    setLoading(true);
    try {
      localStorage.setItem('security', JSON.stringify(security));
      
      toast({
        title: "Configurações guardadas",
        description: "As suas configurações de segurança foram atualizadas",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao guardar configurações",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({
        title: "Erro",
        description: "As passwords não coincidem",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast({
        title: "Erro",
        description: "A password deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new_password
      });

      if (error) throw error;

      toast({
        title: "Password alterada",
        description: "A sua password foi atualizada com sucesso",
      });

      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error: any) {
      toast({
        title: "Erro ao alterar password",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const changeTheme = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Apply theme logic here if needed
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    toast({
      title: "Tema alterado",
      description: `Tema ${newTheme === 'system' ? 'do sistema' : newTheme === 'dark' ? 'escuro' : 'claro'} aplicado`,
    });
  };

  const exportData = async () => {
    setLoading(true);
    try {
      // Here you would typically call an API to get user data
      const userData = {
        profile: profile,
        settings: {
          notifications,
          privacy,
          security: { ...security, two_factor_enabled: undefined } // Remove sensitive data
        }
      };

      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inscrix-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      toast({
        title: "Dados exportados",
        description: "Os seus dados foram exportados com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao exportar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    setLoading(true);
    try {
      // In a real app, you'd call an API to delete the account
      // For now, just sign out
      await signOut();
      
      toast({
        title: "Conta eliminada",
        description: "A sua conta foi eliminada com sucesso",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Erro ao eliminar conta",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">A carregar configurações...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Configurações</h1>
            <p className="text-muted-foreground">
              Gerir as suas preferências e configurações de conta
            </p>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="notifications" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="privacy">Privacidade</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="appearance">Aparência</TabsTrigger>
            <TabsTrigger value="data">Dados</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificações
                </CardTitle>
                <CardDescription>
                  Configure como e quando quer receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Eventos por Email</Label>
                      <p className="text-xs text-muted-foreground">
                        Receber emails sobre novos eventos e atualizações
                      </p>
                    </div>
                    <Switch
                      checked={notifications.email_events}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, email_events: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Marketing por Email</Label>
                      <p className="text-xs text-muted-foreground">
                        Receber newsletters e promoções especiais
                      </p>
                    </div>
                    <Switch
                      checked={notifications.email_marketing}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, email_marketing: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">SMS</Label>
                      <p className="text-xs text-muted-foreground">
                        Receber notificações importantes por SMS
                      </p>
                    </div>
                    <Switch
                      checked={notifications.sms_events}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, sms_events: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Notificações Push</Label>
                      <p className="text-xs text-muted-foreground">
                        Receber notificações no browser
                      </p>
                    </div>
                    <Switch
                      checked={notifications.push_events}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, push_events: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Resumo Semanal</Label>
                      <p className="text-xs text-muted-foreground">
                        Receber um resumo dos eventos da semana
                      </p>
                    </div>
                    <Switch
                      checked={notifications.weekly_digest}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, weekly_digest: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={saveNotificationSettings} disabled={loading}>
                    {loading ? 'A guardar...' : 'Guardar Configurações'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacidade
                </CardTitle>
                <CardDescription>
                  Controle a visibilidade das suas informações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Perfil Público</Label>
                      <p className="text-xs text-muted-foreground">
                        Permitir que outros utilizadores vejam o seu perfil
                      </p>
                    </div>
                    <Switch
                      checked={privacy.profile_public}
                      onCheckedChange={(checked) => 
                        setPrivacy(prev => ({ ...prev, profile_public: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Histórico de Participação</Label>
                      <p className="text-xs text-muted-foreground">
                        Mostrar os eventos em que participou
                      </p>
                    </div>
                    <Switch
                      checked={privacy.show_participation_history}
                      onCheckedChange={(checked) => 
                        setPrivacy(prev => ({ ...prev, show_participation_history: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Convites para Eventos</Label>
                      <p className="text-xs text-muted-foreground">
                        Permitir que organizadores o convidem para eventos
                      </p>
                    </div>
                    <Switch
                      checked={privacy.allow_event_invitations}
                      onCheckedChange={(checked) => 
                        setPrivacy(prev => ({ ...prev, allow_event_invitations: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Análise de Dados</Label>
                      <p className="text-xs text-muted-foreground">
                        Permitir análise dos seus dados para melhorar o serviço
                      </p>
                    </div>
                    <Switch
                      checked={privacy.data_analytics}
                      onCheckedChange={(checked) => 
                        setPrivacy(prev => ({ ...prev, data_analytics: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={savePrivacySettings} disabled={loading}>
                    {loading ? 'A guardar...' : 'Guardar Configurações'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Alterar Password
                  </CardTitle>
                  <CardDescription>
                    Mantenha a sua conta segura com uma password forte
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_password">Password Atual</Label>
                    <div className="relative">
                      <Input
                        id="current_password"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_password">Nova Password</Label>
                    <div className="relative">
                      <Input
                        id="new_password"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirmar Nova Password</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                    />
                  </div>

                  <Button onClick={changePassword} disabled={loading}>
                    {loading ? 'A alterar...' : 'Alterar Password'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Configurações de Segurança
                  </CardTitle>
                  <CardDescription>
                    Configure opções adicionais de segurança
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Autenticação de Dois Fatores</Label>
                        <p className="text-xs text-muted-foreground">
                          Adicionar uma camada extra de segurança à sua conta
                        </p>
                      </div>
                      <Badge variant={security.two_factor_enabled ? "default" : "secondary"}>
                        {security.two_factor_enabled ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Notificações de Login</Label>
                        <p className="text-xs text-muted-foreground">
                          Receber email quando alguém aceder à sua conta
                        </p>
                      </div>
                      <Switch
                        checked={security.login_notifications}
                        onCheckedChange={(checked) => 
                          setSecurity(prev => ({ ...prev, login_notifications: checked }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Timeout de Sessão (minutos)</Label>
                      <p className="text-xs text-muted-foreground">
                        Terminar sessão automaticamente após inatividade
                      </p>
                      <Input
                        type="number"
                        value={security.session_timeout}
                        onChange={(e) => setSecurity(prev => ({ ...prev, session_timeout: parseInt(e.target.value) }))}
                        min={5}
                        max={480}
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={saveSecuritySettings} disabled={loading}>
                      {loading ? 'A guardar...' : 'Guardar Configurações'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Aparência
                </CardTitle>
                <CardDescription>
                  Personalize a aparência da aplicação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tema</Label>
                  <p className="text-xs text-muted-foreground">
                    Escolha entre tema claro, escuro ou automático
                  </p>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => changeTheme('light')}
                      className="flex items-center gap-2"
                    >
                      <Sun className="h-4 w-4" />
                      Claro
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => changeTheme('dark')}
                      className="flex items-center gap-2"
                    >
                      <Moon className="h-4 w-4" />
                      Escuro
                    </Button>
                    <Button
                      variant={theme === 'system' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => changeTheme('system')}
                      className="flex items-center gap-2"
                    >
                      <Monitor className="h-4 w-4" />
                      Sistema
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Gestão de Dados
                  </CardTitle>
                  <CardDescription>
                    Exporte ou elimine os seus dados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Exportar Dados</h4>
                          <p className="text-sm text-muted-foreground">
                            Descarregue uma cópia dos seus dados
                          </p>
                        </div>
                        <Button onClick={exportData} disabled={loading}>
                          <Download className="h-4 w-4 mr-2" />
                          Exportar
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 border border-red-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-red-600">Eliminar Conta</h4>
                          <p className="text-sm text-muted-foreground">
                            Esta ação é permanente e não pode ser desfeita
                          </p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                Eliminar Conta
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem a certeza que quer eliminar a sua conta? Esta ação é permanente e 
                                todos os seus dados serão removidos, incluindo:
                                <ul className="mt-2 ml-4 list-disc text-sm">
                                  <li>Perfil e informações pessoais</li>
                                  <li>Histórico de inscrições</li>
                                  <li>Eventos criados (se for organizador)</li>
                                  <li>Configurações e preferências</li>
                                </ul>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={deleteAccount}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Sim, eliminar conta
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
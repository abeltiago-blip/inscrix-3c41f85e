import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Send, Calendar, Users, Settings, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import EmailManager from "@/components/EmailManager";

interface EmailStats {
  totalEmailsSent: number;
  emailsThisMonth: number;
  upcomingEvents: number;
  activeRegistrations: number;
}

interface RecentEmail {
  id: string;
  title: string;
  category: string;
  created_at: string;
  metadata: any;
}

export default function AdminEmailCenter() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EmailStats>({
    totalEmailsSent: 0,
    emailsThisMonth: 0,
    upcomingEvents: 0,
    activeRegistrations: 0
  });
  const [recentEmails, setRecentEmails] = useState<RecentEmail[]>([]);
  const [searchEventId, setSearchEventId] = useState("");
  const [searchRegistrationId, setSearchRegistrationId] = useState("");

  useEffect(() => {
    if (!user || profile?.role !== 'admin') {
      navigate("/admin");
      return;
    }
    loadEmailStats();
  }, [user, profile, navigate]);

  const loadEmailStats = async () => {
    try {
      setLoading(true);

      // Get email statistics from notifications
      const [emailsResponse, eventsResponse, registrationsResponse] = await Promise.all([
        supabase
          .from('notifications')
          .select('*', { count: 'exact' })
          .eq('type', 'email'),
        supabase
          .from('events')
          .select('*', { count: 'exact' })
          .eq('status', 'published')
          .gte('start_date', new Date().toISOString()),
        supabase
          .from('registrations')
          .select('*', { count: 'exact' })
          .eq('status', 'active')
      ]);

      // Get emails from this month
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const { count: emailsThisMonth } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('type', 'email')
        .gte('created_at', thisMonth.toISOString());

      // Get recent emails
      const { data: recentEmailsData } = await supabase
        .from('notifications')
        .select('*')
        .eq('type', 'email')
        .order('created_at', { ascending: false })
        .limit(10);

      setStats({
        totalEmailsSent: emailsResponse.count || 0,
        emailsThisMonth: emailsThisMonth || 0,
        upcomingEvents: eventsResponse.count || 0,
        activeRegistrations: registrationsResponse.count || 0
      });

      setRecentEmails(recentEmailsData || []);

    } catch (error) {
      console.error('Error loading email stats:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar estatísticas de email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'confirmation':
        return <Badge variant="default">Confirmação</Badge>;
      case 'payment_confirmation':
        return <Badge className="bg-green-500">Pagamento</Badge>;
      case 'event_reminder':
        return <Badge className="bg-orange-500">Lembrete</Badge>;
      case 'ticket_delivery':
        return <Badge className="bg-blue-500">Bilhete</Badge>;
      default:
        return <Badge variant="secondary">{category}</Badge>;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
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
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Centro de Emails</h1>
            <p className="text-muted-foreground">Gerir emails automáticos e campanhas</p>
          </div>
          <Button variant="outline" onClick={loadEmailStats}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Atualizar Stats
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Emails Enviados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmailsSent}</div>
              <p className="text-xs text-muted-foreground">Total acumulado</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.emailsThisMonth}</div>
              <p className="text-xs text-muted-foreground">Emails enviados</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Eventos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.upcomingEvents}</div>
              <p className="text-xs text-muted-foreground">Com inscrições ativas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Inscrições Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.activeRegistrations}</div>
              <p className="text-xs text-muted-foreground">Total de participantes</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="send" className="space-y-4">
          <TabsList>
            <TabsTrigger value="send">
              <Send className="h-4 w-4 mr-2" />
              Enviar Emails
            </TabsTrigger>
            <TabsTrigger value="history">
              <Mail className="h-4 w-4 mr-2" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="send" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">ID do Evento (Opcional)</label>
                <Input
                  value={searchEventId}
                  onChange={(e) => setSearchEventId(e.target.value)}
                  placeholder="Para enviar para evento específico"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">ID da Inscrição (Opcional)</label>
                <Input
                  value={searchRegistrationId}
                  onChange={(e) => setSearchRegistrationId(e.target.value)}
                  placeholder="Para enviar para inscrição específica"
                />
              </div>
            </div>
            
            <EmailManager 
              eventId={searchEventId || undefined}
              registrationId={searchRegistrationId || undefined}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Emails Recentes</CardTitle>
                <CardDescription>Últimos emails enviados pelo sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEmails.map((email) => (
                    <div key={email.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{email.title}</p>
                          {getCategoryBadge(email.category)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(email.created_at).toLocaleString()}
                        </p>
                        {email.metadata?.registration_id && (
                          <p className="text-xs text-muted-foreground">
                            Inscrição: {email.metadata.registration_id}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {email.metadata?.email_id && (
                          <p className="text-xs text-muted-foreground">
                            ID: {email.metadata.email_id.substring(0, 8)}...
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {recentEmails.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum email encontrado
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Email</CardTitle>
                <CardDescription>Configurar comportamento automático dos emails</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium mb-2">📧 Emails Automáticos</h4>
                  <div className="space-y-2 text-sm">
                    <p>✅ Confirmação de inscrição (automático)</p>
                    <p>✅ Confirmação de pagamento com bilhete (automático)</p>
                    <p>⏰ Lembretes de evento (manual ou agendado)</p>
                    <p>🎫 Entrega de bilhetes (manual)</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium mb-2">⚙️ Configuração do Resend</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Domínio:</strong> Configurado para inscrix.pt</p>
                    <p><strong>From:</strong> noreply@inscrix.pt</p>
                    <p><strong>Templates:</strong> React Email implementados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
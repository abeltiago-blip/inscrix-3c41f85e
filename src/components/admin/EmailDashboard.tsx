import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  Send, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  Users,
  Calendar,
  Activity,
  RefreshCw
} from "lucide-react";

interface EmailStats {
  totalSent: number;
  sentToday: number;
  sentThisWeek: number;
  sentThisMonth: number;
  failedToday: number;
  activeTemplates: number;
  totalTemplates: number;
  recentActivity: Array<{
    id: string;
    template_key: string;
    status: string;
    recipient_email: string;
    created_at: string;
  }>;
}

export default function EmailDashboard() {
  const [stats, setStats] = useState<EmailStats>({
    totalSent: 0,
    sentToday: 0,
    sentThisWeek: 0,
    sentThisMonth: 0,
    failedToday: 0,
    activeTemplates: 0,
    totalTemplates: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadStats = async () => {
    try {
      setLoading(true);
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get email statistics
      const [totalResult, todayResult, weekResult, monthResult, failedTodayResult] = await Promise.all([
        supabase.from('email_logs').select('*', { count: 'exact' }),
        supabase.from('email_logs').select('*', { count: 'exact' }).gte('created_at', today.toISOString()),
        supabase.from('email_logs').select('*', { count: 'exact' }).gte('created_at', weekAgo.toISOString()),
        supabase.from('email_logs').select('*', { count: 'exact' }).gte('created_at', monthAgo.toISOString()),
        supabase.from('email_logs').select('*', { count: 'exact' })
          .gte('created_at', today.toISOString())
          .eq('status', 'failed')
      ]);

      // Get template statistics
      const [templatesResult, activeTemplatesResult] = await Promise.all([
        supabase.from('email_templates').select('*', { count: 'exact' }),
        supabase.from('email_templates').select('*', { count: 'exact' }).eq('is_active', true)
      ]);

      // Get recent activity
      const { data: recentActivity } = await supabase
        .from('email_logs')
        .select('id, template_key, status, recipient_email, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      setStats({
        totalSent: totalResult.count || 0,
        sentToday: todayResult.count || 0,
        sentThisWeek: weekResult.count || 0,
        sentThisMonth: monthResult.count || 0,
        failedToday: failedTodayResult.count || 0,
        activeTemplates: activeTemplatesResult.count || 0,
        totalTemplates: templatesResult.count || 0,
        recentActivity: recentActivity || []
      });

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

  useEffect(() => {
    loadStats();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-800">Enviado</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Falhado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const successRate = stats.sentToday > 0 ? 
    ((stats.sentToday - stats.failedToday) / stats.sentToday) * 100 : 100;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enviados</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.sentThisMonth} este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.sentToday}</div>
            <p className="text-xs text-muted-foreground">
              {stats.failedToday} falhados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            {successRate >= 95 ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-orange-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{successRate.toFixed(1)}%</div>
            <Progress value={successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTemplates}/{stats.totalTemplates}</div>
            <p className="text-xs text-muted-foreground">
              Templates ativos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimos emails enviados pelo sistema</CardDescription>
          </div>
          <button
            onClick={loadStats}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Atualizar"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {activity.template_key}
                      </code>
                      {getStatusBadge(activity.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Para: {activity.recipient_email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleString('pt-PT')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma atividade recente encontrada
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">SMTP (mail.inscrix.pt)</span>
              <Badge className="bg-green-100 text-green-800">Ativo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Templates Database</span>
              <Badge className="bg-green-100 text-green-800">Conectado</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Email Logs</span>
              <Badge className="bg-green-100 text-green-800">Funcionando</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Estatísticas Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Esta Semana</span>
              <span className="font-medium">{stats.sentThisWeek.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Média Diária</span>
              <span className="font-medium">
                {stats.sentThisWeek > 0 ? Math.round(stats.sentThisWeek / 7).toLocaleString() : '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Templates Inativos</span>
              <span className="font-medium text-orange-600">
                {stats.totalTemplates - stats.activeTemplates}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
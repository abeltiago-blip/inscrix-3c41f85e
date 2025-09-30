import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Search, 
  RefreshCw, 
  Send, 
  AlertCircle, 
  Check, 
  X,
  Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EmailLog {
  id: string;
  recipient_email: string;
  recipient_user_id?: string;
  subject: string;
  status: string;
  created_at: string;
  sent_at?: string;
  failed_at?: string;
  error_message?: string;
  template_key: string;
  metadata?: any;
}

export default function EmailManagement() {
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [resendingId, setResendingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchEmailLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('email_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (searchEmail.trim()) {
        query = query.ilike('recipient_email', `%${searchEmail.trim()}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data: logs, error } = await query;

      if (error) throw error;
      setEmailLogs(logs || []);
    } catch (error) {
      console.error('Error fetching email logs:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os logs de email.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resendEmail = async (log: EmailLog) => {
    setResendingId(log.id);
    try {
      // Try to determine what type of email to resend based on template_key
      let emailType = 'confirmation';
      let includeTicket = false;

      if (log.template_key?.includes('payment') || log.template_key?.includes('ticket')) {
        emailType = 'payment_confirmation';
        includeTicket = true;
      }

      // We need a registration ID - try to find it from metadata or use a generic approach
      const registrationId = log.metadata?.registrationId || null;
      let registrations = null;

      if (!registrationId) {
        // If no registration ID, try to find recent registrations for this user
        const { data: registrationsData } = await supabase
          .from('registrations')
          .select('id')
          .eq('participant_email', log.recipient_email)
          .order('created_at', { ascending: false })
          .limit(1);

        registrations = registrationsData;
        if (!registrations || registrations.length === 0) {
          throw new Error('Não foi possível encontrar a inscrição para reenviar o email.');
        }
      }

      const { data, error } = await supabase.functions.invoke('send-registration-email', {
        body: {
          registrationId: registrationId || registrations?.[0]?.id,
          type: emailType,
          includeTicket: includeTicket
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Email Reenviado",
          description: `Email reenviado com sucesso para ${log.recipient_email}`,
        });
        fetchEmailLogs(); // Refresh logs
      } else {
        throw new Error(data.error || 'Falha ao reenviar email');
      }
    } catch (error: any) {
      console.error('Error resending email:', error);
      toast({
        title: "Erro ao Reenviar",
        description: error.message || "Não foi possível reenviar o email.",
        variant: "destructive",
      });
    } finally {
      setResendingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Check className="h-4 w-4" />;
      case 'pending': return <RefreshCw className="h-4 w-4" />;
      case 'failed': return <X className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    fetchEmailLogs();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Gestão de Emails
          </CardTitle>
          <CardDescription>
            Monitorizar e gerir emails enviados pelo sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search-email">Pesquisar por Email</Label>
              <Input
                id="search-email"
                placeholder="exemplo@email.com"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchEmailLogs()}
              />
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="sent">Enviados</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="failed">Falhados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={fetchEmailLogs} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              Pesquisar
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {['sent', 'pending', 'failed'].map((status) => {
              const count = emailLogs.filter(log => log.status === status).length;
              return (
                <div key={status} className="text-center p-3 border rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    {getStatusIcon(status)}
                  </div>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {status === 'sent' ? 'Enviados' : 
                     status === 'pending' ? 'Pendentes' : 'Falhados'}
                  </div>
                </div>
              );
            })}
            <div className="text-center p-3 border rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Mail className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold">{emailLogs.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Logs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Logs de Email</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchEmailLogs}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">A carregar logs...</p>
            </div>
          ) : emailLogs.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhum email encontrado.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {emailLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(log.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{log.recipient_email}</p>
                        <Badge variant={getStatusColor(log.status)} className="text-xs">
                          {log.status === 'sent' ? 'Enviado' : 
                           log.status === 'pending' ? 'Pendente' : 'Falhado'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{log.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString('pt-PT')}
                        {log.sent_at && ` • Enviado: ${new Date(log.sent_at).toLocaleString('pt-PT')}`}
                      </p>
                      {log.error_message && (
                        <div className="flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3 text-destructive" />
                          <p className="text-xs text-destructive">{log.error_message}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.status === 'failed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resendEmail(log)}
                        disabled={resendingId === log.id}
                      >
                        {resendingId === log.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
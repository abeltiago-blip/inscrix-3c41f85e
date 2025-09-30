import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Check, X, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmailLog {
  id: string;
  recipient_email: string;
  subject: string;
  status: string;
  created_at: string;
  error_message?: string;
}

interface EmailStatusNotificationProps {
  registrationIds: string[];
  userEmail: string;
}

export default function EmailStatusNotification({ registrationIds, userEmail }: EmailStatusNotificationProps) {
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEmailLogs = async () => {
    try {
      const { data: logs, error } = await supabase
        .from('email_logs')
        .select('*')
        .eq('recipient_email', userEmail)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setEmailLogs(logs || []);
    } catch (error) {
      console.error('Error fetching email logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const resendEmail = async (registrationId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-registration-email', {
        body: {
          registrationId: registrationId,
          type: 'confirmation',
          includeTicket: false
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Email Reenviado",
          description: "O email de confirmação foi reenviado com sucesso.",
        });
        fetchEmailLogs(); // Refresh logs
      } else {
        throw new Error(data.error || 'Falha ao reenviar email');
      }
    } catch (error: any) {
      console.error('Error resending email:', error);
      toast({
        title: "Erro",
        description: "Não foi possível reenviar o email. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchEmailLogs();
    
    // Set up real-time subscription for new email logs
    const channel = supabase
      .channel('email-logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'email_logs',
          filter: `recipient_email=eq.${userEmail}`
        },
        () => fetchEmailLogs()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userEmail]);

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Status dos Emails
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">A carregar status dos emails...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Status dos Emails
        </CardTitle>
        <CardDescription>
          Estado dos emails enviados para {userEmail}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {emailLogs.length === 0 ? (
          <p className="text-muted-foreground">Nenhum email encontrado.</p>
        ) : (
          emailLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(log.status)}
                <div>
                  <p className="font-medium text-sm">{log.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleString('pt-PT')}
                  </p>
                  {log.error_message && (
                    <p className="text-xs text-destructive mt-1">{log.error_message}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusColor(log.status)}>
                  {log.status === 'sent' ? 'Enviado' : 
                   log.status === 'pending' ? 'Pendente' : 'Falhado'}
                </Badge>
                {log.status === 'failed' && registrationIds.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resendEmail(registrationIds[0])}
                  >
                    Reenviar
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
        
        {registrationIds.length > 0 && (
          <div className="pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchEmailLogs()}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar Status
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
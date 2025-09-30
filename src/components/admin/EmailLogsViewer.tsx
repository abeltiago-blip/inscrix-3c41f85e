import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Filter, 
  RefreshCw, 
  Download, 
  Eye, 
  Search,
  Calendar,
  Mail,
  AlertCircle,
  CheckCircle,
  Clock,
  Send
} from "lucide-react";

interface EmailLog {
  id: string;
  recipient_email: string;
  subject: string;
  template_key: string;
  status: string;
  created_at: string;
  sent_at: string | null;
  failed_at: string | null;
  error_message: string | null;
  provider: string;
  provider_message_id: string | null;
  metadata: any;
}

export default function EmailLogsViewer() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [templateFilter, setTemplateFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const { toast } = useToast();

  const loadLogs = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('email_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      if (templateFilter !== 'all') {
        query = query.eq('template_key', templateFilter);
      }

      if (searchTerm) {
        query = query.or(`recipient_email.ilike.%${searchTerm}%,subject.ilike.%${searchTerm}%`);
      }

      // Date filter
      if (dateFilter !== 'all') {
        const now = new Date();
        let startDate;
        
        switch (dateFilter) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        }
        
        if (startDate) {
          query = query.gte('created_at', startDate.toISOString());
        }
      }

      // Pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;
      
      setLogs(data || []);
      setTotalCount(count || 0);

    } catch (error: any) {
      console.error('Error loading email logs:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar logs de email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [statusFilter, templateFilter, dateFilter, searchTerm, currentPage]);

  const resendEmail = async (log: EmailLog) => {
    try {
      const { error } = await supabase.functions.invoke('send-template-email', {
        body: {
          templateKey: log.template_key,
          recipientEmail: log.recipient_email,
          variables: log.metadata?.variables || {}
        }
      });

      if (error) throw error;

      toast({
        title: "Email Reenviado",
        description: `Email reenviado para ${log.recipient_email}`,
      });

      loadLogs(); // Refresh logs
    } catch (error: any) {
      toast({
        title: "Erro ao Reenviar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportLogs = async () => {
    try {
      const csvContent = logs.map(log => [
        log.created_at,
        log.recipient_email,
        log.subject,
        log.template_key,
        log.status,
        log.provider,
        log.error_message || ''
      ].join(',')).join('\n');

      const header = 'Data,Email,Assunto,Template,Status,Provedor,Erro\n';
      const fullCsv = header + csvContent;

      const blob = new Blob([fullCsv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `email-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      
      toast({
        title: "Export Completo",
        description: "Logs exportados para CSV com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro no Export",
        description: "Erro ao exportar logs",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Enviado
        </Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Falhado
        </Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pendente
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case 'smtp':
        return <Badge variant="outline">SMTP</Badge>;
      case 'resend':
        return <Badge variant="outline">Resend</Badge>;
      default:
        return <Badge variant="secondary">{provider}</Badge>;
    }
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Pesquisa
          </CardTitle>
          <CardDescription>
            Filtrar e pesquisar logs de email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Pesquisar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Email ou assunto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="sent">Enviados</SelectItem>
                  <SelectItem value="failed">Falhados</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Template</Label>
              <Select value={templateFilter} onValueChange={setTemplateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="newsletter_confirmation">Newsletter</SelectItem>
                  <SelectItem value="registration_deadline">Prazo Inscrição</SelectItem>
                  <SelectItem value="event_cancelled">Evento Cancelado</SelectItem>
                  <SelectItem value="results_available">Resultados</SelectItem>
                  <SelectItem value="refund_processed">Reembolso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Período</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Última Semana</SelectItem>
                  <SelectItem value="month">Último Mês</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={loadLogs} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="outline" onClick={exportLogs} disabled={logs.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {loading ? "Carregando..." : `${totalCount} resultado(s) encontrado(s)`}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || loading}
                >
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || loading}
                >
                  Próxima
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Logs de Email
          </CardTitle>
          <CardDescription>
            Histórico detalhado de todos os emails enviados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : logs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Provedor</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(log.created_at).toLocaleDateString('pt-PT')}</div>
                        <div className="text-muted-foreground">
                          {new Date(log.created_at).toLocaleTimeString('pt-PT')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{log.recipient_email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={log.subject}>
                        {log.subject}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {log.template_key}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(log.status)}
                    </TableCell>
                    <TableCell>
                      {getProviderBadge(log.provider)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedLog(log)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Detalhes do Email</DialogTitle>
                              <DialogDescription>
                                Informações detalhadas do email enviado
                              </DialogDescription>
                            </DialogHeader>
                            {selectedLog && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">Destinatário</Label>
                                    <p className="text-sm">{selectedLog.recipient_email}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Status</Label>
                                    <div className="mt-1">{getStatusBadge(selectedLog.status)}</div>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Template</Label>
                                    <p className="text-sm">{selectedLog.template_key}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Provedor</Label>
                                    <div className="mt-1">{getProviderBadge(selectedLog.provider)}</div>
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-sm font-medium">Assunto</Label>
                                  <p className="text-sm bg-gray-50 p-2 rounded">{selectedLog.subject}</p>
                                </div>

                                {selectedLog.error_message && (
                                  <div>
                                    <Label className="text-sm font-medium text-red-600">Erro</Label>
                                    <p className="text-sm bg-red-50 text-red-700 p-2 rounded">
                                      {selectedLog.error_message}
                                    </p>
                                  </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                                  <div>
                                    <Label className="text-sm font-medium">Criado</Label>
                                    <p>{new Date(selectedLog.created_at).toLocaleString('pt-PT')}</p>
                                  </div>
                                  {selectedLog.sent_at && (
                                    <div>
                                      <Label className="text-sm font-medium">Enviado</Label>
                                      <p>{new Date(selectedLog.sent_at).toLocaleString('pt-PT')}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {log.status === 'failed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resendEmail(log)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum log encontrado</p>
              <p className="text-sm">Ajuste os filtros ou verifique se existem emails enviados</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
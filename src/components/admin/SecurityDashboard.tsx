import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Shield, Eye, RefreshCw, Search } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface SecurityEvent {
  id: string;
  event_type: string;
  user_id?: string;
  ip_address?: string | null;
  user_agent?: string | null;
  details: Record<string, any>;
  risk_score: number;
  created_at: string;
}

export const SecurityDashboard: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    eventType: 'all',
    riskLevel: 'all',
    search: ''
  });
  const { toast } = useToast();

  const fetchSecurityEvents = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter.eventType !== 'all') {
        query = query.eq('event_type', filter.eventType);
      }

      if (filter.riskLevel !== 'all') {
        const riskRanges = {
          low: [0, 10],
          medium: [11, 30],
          high: [31, 100]
        };
        const [min, max] = riskRanges[filter.riskLevel as keyof typeof riskRanges];
        query = query.gte('risk_score', min).lte('risk_score', max);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching security events:', error);
        toast({
          title: "Erro",
          description: "Falha ao carregar eventos de segurança",
          variant: "destructive",
        });
        return;
      }

      let filteredData = data || [];
      
      // Client-side search filter
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        filteredData = filteredData.filter(event => 
          event.event_type.toLowerCase().includes(searchLower) ||
          (typeof event.ip_address === 'string' && event.ip_address.toLowerCase().includes(searchLower)) ||
          JSON.stringify(event.details).toLowerCase().includes(searchLower)
        );
      }

      setEvents(filteredData as SecurityEvent[]);
    } catch (error) {
      console.error('Error fetching security events:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar eventos de segurança",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityEvents();
  }, [filter]);

  const getRiskBadgeVariant = (score: number) => {
    if (score >= 31) return "destructive";
    if (score >= 11) return "secondary";
    return "default";
  };

  const getRiskLabel = (score: number) => {
    if (score >= 31) return "Alto";
    if (score >= 11) return "Médio";
    return "Baixo";
  };

  const formatEventType = (type: string) => {
    const eventTypes: Record<string, string> = {
      'login_attempt': 'Tentativa de Login',
      'registration_attempt': 'Tentativa de Registo',
      'payment_attempt': 'Tentativa de Pagamento',
      'suspicious_input': 'Input Suspeito',
      'data_access': 'Acesso aos Dados',
      'financial_data_modified': 'Dados Financeiros Modificados',
      'profile_modified': 'Perfil Modificado',
      'page_view': 'Visualização de Página',
      'rapid_form_submissions': 'Submissões Rápidas'
    };
    return eventTypes[type] || type;
  };

  const getEventTypeStats = () => {
    const stats: Record<string, number> = {};
    events.forEach(event => {
      stats[event.event_type] = (stats[event.event_type] || 0) + 1;
    });
    return Object.entries(stats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const getHighRiskCount = () => {
    return events.filter(event => event.risk_score >= 31).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Dashboard de Segurança</h2>
          <p className="text-muted-foreground">
            Monitorização de eventos de segurança da plataforma
          </p>
        </div>
        <Button onClick={fetchSecurityEvents} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Totais</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 100 eventos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos de Alto Risco</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{getHighRiskCount()}</div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção imediata
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipos Mais Comuns</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {getEventTypeStats().slice(0, 3).map(([type, count]) => (
                <div key={type} className="flex justify-between text-sm">
                  <span>{formatEventType(type)}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Filtre eventos por tipo, nível de risco ou pesquisa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar eventos..."
                value={filter.search}
                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                className="pl-8"
              />
            </div>
            
            <Select
              value={filter.eventType}
              onValueChange={(value) => setFilter(prev => ({ ...prev, eventType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="login_attempt">Tentativas de Login</SelectItem>
                <SelectItem value="registration_attempt">Tentativas de Registo</SelectItem>
                <SelectItem value="payment_attempt">Tentativas de Pagamento</SelectItem>
                <SelectItem value="suspicious_input">Input Suspeito</SelectItem>
                <SelectItem value="financial_data_modified">Dados Financeiros</SelectItem>
                <SelectItem value="profile_modified">Perfis Modificados</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filter.riskLevel}
              onValueChange={(value) => setFilter(prev => ({ ...prev, riskLevel: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nível de risco" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os níveis</SelectItem>
                <SelectItem value="low">Baixo (0-10)</SelectItem>
                <SelectItem value="medium">Médio (11-30)</SelectItem>
                <SelectItem value="high">Alto (31+)</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => setFilter({ eventType: 'all', riskLevel: 'all', search: '' })}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Events List */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos de Segurança</CardTitle>
          <CardDescription>
            Lista detalhada dos eventos de segurança recentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum evento encontrado
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant={getRiskBadgeVariant(event.risk_score)}>
                        {getRiskLabel(event.risk_score)} ({event.risk_score})
                      </Badge>
                      <span className="font-medium">{formatEventType(event.event_type)}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(event.created_at).toLocaleString('pt-PT')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {event.user_id && (
                      <div>
                        <span className="font-medium">Utilizador:</span> {event.user_id}
                      </div>
                    )}
                    {event.ip_address && (
                      <div>
                        <span className="font-medium">IP:</span> {event.ip_address}
                      </div>
                    )}
                  </div>

                  {Object.keys(event.details).length > 0 && (
                    <details className="text-sm">
                      <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">
                        Detalhes do evento
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                        {JSON.stringify(event.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
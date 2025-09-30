import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Trash2, 
  AlertTriangle, 
  Search,
  Calendar,
  MapPin,
  Users,
  Euro,
  Archive,
  Download,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Event {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  status: string;
  start_date: string;
  end_date?: string;
  location: string;
  address: string;
  organizer_id: string;
  max_participants?: number;
  created_at: string;
  slug?: string;
  organizer?: any;
  registrations_count?: number;
  orders_count?: number;
  revenue?: number;
}

interface EventDependencies {
  registrations: number;
  orders: number;
  tickets: number;
  payouts: number;
  revenue: number;
  canDelete: boolean;
  warnings: string[];
}

const AdminEventManagementAdvanced = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [deletingEvent, setDeletingEvent] = useState<string | null>(null);
  const [eventDependencies, setEventDependencies] = useState<EventDependencies | null>(null);
  const [showDependenciesDialog, setShowDependenciesDialog] = useState(false);
  const [forceDelete, setForceDelete] = useState(false);
  const [archiveMode, setArchiveMode] = useState(false);

  // Verificar se é admin
  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
              <p className="text-muted-foreground mb-6">
                Apenas administradores podem aceder a esta página.
              </p>
              <Button onClick={() => navigate('/')}>
                Voltar ao Início
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('events')
        .select(`
          *,
          registrations(count),
          orders(count, total_amount)
        `)
        .order('created_at', { ascending: false });

      const { data: eventsData, error } = await query;
      if (error) throw error;

      // Enrich events with organizer data and statistics
      const eventsWithStats = await Promise.all(
        (eventsData || []).map(async (event) => {
          const { data: organizerData } = await supabase
            .from('profiles')
            .select('first_name, last_name, email, organization_name')
            .eq('user_id', event.organizer_id)
            .single();

          const registrationsCount = event.registrations?.length || 0;
          const ordersCount = event.orders?.length || 0;
          const revenue = event.orders?.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0) || 0;

          return {
            ...event,
            organizer: organizerData,
            registrations_count: registrationsCount,
            orders_count: ordersCount,
            revenue: revenue
          };
        })
      );

      setEvents(eventsWithStats);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar lista de eventos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkEventDependencies = async (eventId: string): Promise<EventDependencies> => {
    try {
      const [
        { data: registrations, error: regError },
        { data: orders, error: ordersError },
        { data: tickets, error: ticketsError },
        { data: payouts, error: payoutsError }
      ] = await Promise.all([
        supabase.from('registrations').select('*').eq('event_id', eventId),
        supabase.from('orders').select('*').eq('event_id', eventId),
        supabase.from('ticket_types').select('*').eq('event_id', eventId),
        supabase.from('payouts').select('*').contains('events_included', [eventId])
      ]);

      if (regError) throw regError;
      if (ordersError) throw ordersError;
      if (ticketsError) throw ticketsError;
      if (payoutsError) throw payoutsError;

      const registrationsCount = registrations?.length || 0;
      const ordersCount = orders?.length || 0;
      const ticketsCount = tickets?.length || 0;
      const payoutsCount = payouts?.length || 0;
      const revenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      const warnings = [];
      if (registrationsCount > 0) {
        warnings.push(`${registrationsCount} inscrições serão eliminadas`);
      }
      if (ordersCount > 0) {
        warnings.push(`${ordersCount} encomendas serão eliminadas`);
      }
      if (revenue > 0) {
        warnings.push(`€${revenue.toFixed(2)} em receita será perdida`);
      }
      if (payoutsCount > 0) {
        warnings.push(`${payoutsCount} pagamentos podem ser afetados`);
      }

      const canDelete = registrationsCount === 0 && ordersCount === 0;

      return {
        registrations: registrationsCount,
        orders: ordersCount,
        tickets: ticketsCount,
        payouts: payoutsCount,
        revenue,
        canDelete,
        warnings
      };

    } catch (error) {
      console.error('Erro ao verificar dependências:', error);
      return {
        registrations: 0,
        orders: 0,
        tickets: 0,
        payouts: 0,
        revenue: 0,
        canDelete: false,
        warnings: ['Erro ao verificar dependências']
      };
    }
  };

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    setDeletingEvent(eventId);
    
    try {
      // Verificar dependências primeiro
      const dependencies = await checkEventDependencies(eventId);
      setEventDependencies(dependencies);
      
      if (!dependencies.canDelete && !forceDelete) {
        setShowDependenciesDialog(true);
        return;
      }

      // Proceder com eliminação
      if (forceDelete) {
        // Eliminar dependências primeiro
        await supabase.from('registrations').delete().eq('event_id', eventId);
        await supabase.from('orders').delete().eq('event_id', eventId);
      }

      // Eliminar tickets e evento
      await supabase.from('ticket_types').delete().eq('event_id', eventId);
      const { error } = await supabase.from('events').delete().eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Evento "${eventTitle}" eliminado com sucesso`,
      });

      // Atualizar lista
      setEvents(prev => prev.filter(event => event.id !== eventId));
      setShowDependenciesDialog(false);
      setForceDelete(false);

    } catch (error) {
      console.error('Erro ao eliminar evento:', error);
      toast({
        title: "Erro",
        description: "Erro ao eliminar evento. Verifique as dependências.",
        variant: "destructive",
      });
    } finally {
      setDeletingEvent(null);
    }
  };

  const handleArchiveEvent = async (eventId: string, eventTitle: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: 'archived' })
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Evento "${eventTitle}" arquivado com sucesso`,
      });

      loadEvents();
    } catch (error) {
      console.error('Erro ao arquivar evento:', error);
      toast({
        title: "Erro",
        description: "Erro ao arquivar evento",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEvents.length === 0) return;

    try {
      for (const eventId of selectedEvents) {
        await supabase.from('events').delete().eq('id', eventId);
      }

      toast({
        title: "Sucesso",
        description: `${selectedEvents.length} eventos eliminados`,
      });

      loadEvents();
      setSelectedEvents([]);
    } catch (error) {
      console.error('Erro na eliminação em massa:', error);
      toast({
        title: "Erro",
        description: "Erro na eliminação em massa",
        variant: "destructive",
      });
    }
  };

  const exportEvents = () => {
    const csvContent = [
      // Header
      [
        'ID', 'Título', 'Categoria', 'Status', 'Data Início', 'Local', 'Organizador',
        'Inscrições', 'Encomendas', 'Receita', 'Data Criação'
      ].join(','),
      // Data
      ...filteredEvents.map(event => [
        event.id,
        event.title,
        event.category,
        event.status,
        new Date(event.start_date).toLocaleDateString('pt-PT'),
        event.location,
        event.organizer ? `${event.organizer.first_name} ${event.organizer.last_name}` : 'N/A',
        event.registrations_count || 0,
        event.orders_count || 0,
        event.revenue?.toFixed(2) || '0.00',
        new Date(event.created_at).toLocaleDateString('pt-PT')
      ].join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `eventos-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = [...new Set(events.map(event => event.category))];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Admin
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Gestão Avançada de Eventos</h1>
            <p className="text-muted-foreground">
              Eliminação segura e gestão completa de eventos
            </p>
          </div>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros e Ações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Pesquisar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="archived">Arquivado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={loadEvents} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>

            {/* Bulk Actions */}
            {selectedEvents.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <span className="text-sm">{selectedEvents.length} eventos selecionados</span>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Selecionados
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedEvents([])}>
                  Limpar Seleção
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={exportEvents}>
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Eventos ({filteredEvents.length})</span>
              <Badge variant="outline">
                {events.filter(e => e.status === 'published').length} Publicados
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Carregando eventos...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum evento encontrado.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Checkbox
                      checked={selectedEvents.includes(event.id)}
                      onCheckedChange={(checked) => {
                        if (checked === true) {
                          setSelectedEvents(prev => [...prev, event.id]);
                        } else {
                          setSelectedEvents(prev => prev.filter(id => id !== event.id));
                        }
                      }}
                    />
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{event.title}</h3>
                        <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                          {event.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(event.start_date).toLocaleDateString('pt-PT')}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {event.registrations_count || 0} inscrições
                        </span>
                        <span className="flex items-center gap-1">
                          <Euro className="h-3 w-3" />
                          €{event.revenue?.toFixed(2) || '0.00'}
                        </span>
                      </div>

                      {event.organizer && (
                        <p className="text-xs text-muted-foreground">
                          Organizador: {event.organizer.first_name} {event.organizer.last_name}
                          {event.organizer.organization_name && ` - ${event.organizer.organization_name}`}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleArchiveEvent(event.id, event.title)}
                        disabled={event.status === 'archived'}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={deletingEvent === event.id}
                          >
                            {deletingEvent === event.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Eliminar Evento</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem a certeza que pretende eliminar permanentemente o evento "{event.title}"?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteEvent(event.id, event.title)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dependencies Dialog */}
        <Dialog open={showDependenciesDialog} onOpenChange={setShowDependenciesDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Verificação de Dependências
              </DialogTitle>
              <DialogDescription>
                Este evento tem dependências que serão afetadas pela eliminação:
              </DialogDescription>
            </DialogHeader>
            
            {eventDependencies && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Inscrições</span>
                        <Badge variant={eventDependencies.registrations > 0 ? 'destructive' : 'default'}>
                          {eventDependencies.registrations}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Encomendas</span>
                        <Badge variant={eventDependencies.orders > 0 ? 'destructive' : 'default'}>
                          {eventDependencies.orders}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Receita</span>
                        <Badge variant={eventDependencies.revenue > 0 ? 'destructive' : 'default'}>
                          €{eventDependencies.revenue.toFixed(2)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Tickets</span>
                        <Badge variant="secondary">
                          {eventDependencies.tickets}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {eventDependencies.warnings.length > 0 && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <h4 className="font-medium text-destructive mb-2">Avisos:</h4>
                    <ul className="text-sm space-y-1">
                      {eventDependencies.warnings.map((warning, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3 text-destructive" />
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="force-delete"
                    checked={forceDelete}
                    onCheckedChange={(checked) => setForceDelete(checked === true)}
                  />
                  <label htmlFor="force-delete" className="text-sm">
                    Eliminar forçadamente (incluindo todas as dependências)
                  </label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowDependenciesDialog(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteEvent(deletingEvent!, '')}
                    disabled={!eventDependencies.canDelete && !forceDelete}
                  >
                    {forceDelete ? 'Eliminar Forçadamente' : 'Eliminar'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminEventManagementAdvanced;
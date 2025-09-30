import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Calendar, 
  MapPin, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  FileText,
  AlertCircle
} from "lucide-react";
import Header from "@/components/Header";
import AdminRoute from "@/components/AdminRoute";

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  category: string;
  subcategory?: string;
  max_participants: number;
  status: string;
  approval_status: string;
  organizer_id: string;
  image_url?: string;
  created_at: string;
  submitted_for_approval_at?: string;
  approved_at?: string;
  approved_by?: string;
  rejection_reason?: string;
  organizer_name?: string;
  organizer_email?: string;
}

const AdminEventApprovals = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const fetchPendingEvents = async () => {
    try {
      setLoading(true);
      
      // First get events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .in('approval_status', ['pending_approval', 'approved', 'rejected'])
        .order('submitted_for_approval_at', { ascending: false });

      if (eventsError) throw eventsError;

      // Then get organizer info for each event
      const eventsWithOrganizers = await Promise.all(
        (eventsData || []).map(async (event) => {
          const { data: organizerData } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('user_id', event.organizer_id)
            .single();

          return {
            ...event,
            organizer_name: organizerData 
              ? `${organizerData.first_name || ''} ${organizerData.last_name || ''}`.trim()
              : 'Nome não disponível',
            organizer_email: organizerData?.email || 'Email não disponível'
          };
        })
      );

      setEvents(eventsWithOrganizers);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      toast.error('Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEvent = async (eventId: string) => {
    try {
      setProcessingAction(eventId);
      
      const { error } = await supabase
        .from('events')
        .update({
          approval_status: 'approved',
          status: 'published',
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', eventId);

      if (error) throw error;

      toast.success('Evento aprovado com sucesso!');
      fetchPendingEvents();
    } catch (error) {
      console.error('Erro ao aprovar evento:', error);
      toast.error('Erro ao aprovar evento');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleRejectEvent = async (eventId: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Por favor, forneça um motivo para a rejeição');
      return;
    }

    try {
      setProcessingAction(eventId);
      
      const { error } = await supabase
        .from('events')
        .update({
          approval_status: 'rejected',
          status: 'draft',
          rejection_reason: rejectionReason,
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', eventId);

      if (error) throw error;

      toast.success('Evento rejeitado');
      setRejectionReason("");
      setSelectedEvent(null);
      fetchPendingEvents();
    } catch (error) {
      console.error('Erro ao rejeitar evento:', error);
      toast.error('Erro ao rejeitar evento');
    } finally {
      setProcessingAction(null);
    }
  };

  const getStatusBadge = (approvalStatus: string, status: string) => {
    switch (approvalStatus) {
      case 'pending_approval':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="h-3 w-3 mr-1" />Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const pendingEvents = events.filter(e => e.approval_status === 'pending_approval');
  const approvedEvents = events.filter(e => e.approval_status === 'approved');
  const rejectedEvents = events.filter(e => e.approval_status === 'rejected');

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Aprovação de Eventos</h1>
            <p className="text-muted-foreground">Gerir aprovações de eventos submetidos pelos organizadores</p>
          </div>

          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pendentes ({pendingEvents.length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Aprovados ({approvedEvents.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Rejeitados ({rejectedEvents.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingEvents.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum evento pendente de aprovação</p>
                  </CardContent>
                </Card>
              ) : (
                pendingEvents.map((event) => (
                  <Card key={event.id} className="border-yellow-200">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="flex items-center gap-2">
                            {event.title}
                            {getStatusBadge(event.approval_status, event.status)}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Organizador: {event.organizer_name} ({event.organizer_email})
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(event.start_date).toLocaleDateString('pt-PT')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>Máx. {event.max_participants || 'Ilimitado'} participantes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{event.category}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>

                      <div className="flex gap-2 pt-4">
                        <Button 
                          onClick={() => handleApproveEvent(event.id)}
                          disabled={processingAction === event.id}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Aprovar
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => setSelectedEvent(event)}
                          disabled={processingAction === event.id}
                          className="flex items-center gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Rejeitar
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => window.open(`/admin/event/${event.id}`, '_blank')}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Visualizar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              {approvedEvents.map((event) => (
                <Card key={event.id} className="border-green-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          {event.title}
                          {getStatusBadge(event.approval_status, event.status)}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Aprovado em: {event.approved_at ? new Date(event.approved_at).toLocaleDateString('pt-PT') : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              {rejectedEvents.map((event) => (
                <Card key={event.id} className="border-red-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          {event.title}
                          {getStatusBadge(event.approval_status, event.status)}
                        </CardTitle>
                        {event.rejection_reason && (
                          <p className="text-sm text-red-600">
                            Motivo: {event.rejection_reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          {/* Rejection Modal */}
          {selectedEvent && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Rejeitar Evento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    Está prestes a rejeitar o evento: <strong>{selectedEvent.title}</strong>
                  </p>
                  <div className="space-y-2">
                    <Label>Motivo da rejeição *</Label>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Explique o motivo da rejeição..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSelectedEvent(null);
                        setRejectionReason("");
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => handleRejectEvent(selectedEvent.id)}
                      disabled={processingAction === selectedEvent.id || !rejectionReason.trim()}
                    >
                      Rejeitar Evento
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminEventApprovals;
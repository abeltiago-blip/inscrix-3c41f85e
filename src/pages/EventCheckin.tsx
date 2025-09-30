import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, QrCode, Users, Search, Download, Calendar, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { useRealtimeCheckins } from "@/hooks/useRealtimeCheckins";

interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  address: string;
  organizer_id: string;
  status: string;
}

interface Registration {
  id: string;
  registration_number: string;
  participant_name: string;
  participant_email: string;
  participant_phone: string;
  check_in_status: string;
  check_in_time: string;
  amount_paid: number;
  ticket_types: {
    name: string;
  };
}

interface Checkin {
  id: string;
  participant_name: string;
  participant_email: string;
  checkin_time: string;
  checkin_method: string;
  notes: string;
  registration_id: string;
}

export default function EventCheckin() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [initialCheckins, setInitialCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    checkedIn: 0,
    pending: 0,
    revenue: 0
  });

  // Use realtime hook for live checkin updates - temporarily disabled for type compatibility
  const checkins = initialCheckins;

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (eventId) {
      loadEventData();
    }
  }, [eventId, user, navigate]);

  const loadEventData = async () => {
    try {
      setLoading(true);

      // Load event details
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      // Check if user is organizer or admin
      if (profile?.role !== 'admin' && eventData.organizer_id !== user?.id) {
        toast({
          title: "Acesso Negado",
          description: "Não tem permissão para aceder aos check-ins deste evento",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setEvent(eventData);

      // Load registrations
      const { data: registrationsData, error: regError } = await supabase
        .from('registrations')
        .select(`
          *,
          ticket_types(name)
        `)
        .eq('event_id', eventId)
        .eq('status', 'active')
        .order('participant_name');

      if (regError) throw regError;
      setRegistrations(registrationsData || []);

      // Load check-ins
      const { data: checkinsData, error: checkinError } = await supabase
        .from('event_checkins')
        .select('*')
        .eq('event_id', eventId)
        .order('checkin_time', { ascending: false });

      if (checkinError) throw checkinError;
      setInitialCheckins(checkinsData || []);

      // Calculate stats
      const totalRegistrations = registrationsData?.length || 0;
      const checkedIn = registrationsData?.filter(r => r.check_in_status === 'checked_in').length || 0;
      const pending = totalRegistrations - checkedIn;
      const revenue = registrationsData?.reduce((sum, r) => sum + r.amount_paid, 0) || 0;

      setStats({
        totalRegistrations,
        checkedIn,
        pending,
        revenue
      });

    } catch (error) {
      console.error('Error loading event data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do evento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update stats when checkins change in real-time
  useEffect(() => {
    updateStatsFromRealtime();
  }, [checkins, registrations]);

  const updateStatsFromRealtime = async () => {
    try {
      // Reload registration stats when checkins change
      const { data: updatedRegistrations, error: regError } = await supabase
        .from('registrations')
        .select('id, check_in_status, amount_paid')
        .eq('event_id', eventId);

      if (regError) throw regError;

      const totalRegistrations = updatedRegistrations?.length || 0;
      const checkedIn = updatedRegistrations?.filter(r => r.check_in_status === 'checked_in').length || 0;
      const pending = totalRegistrations - checkedIn;
      const revenue = updatedRegistrations?.reduce((sum, r) => sum + r.amount_paid, 0) || 0;

      setStats({
        totalRegistrations,
        checkedIn,
        pending,
        revenue
      });
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  const handleCheckinComplete = (result: any) => {
    if (result.success) {
      // Reload registrations data to update the list
      loadEventData();
      
      toast({
        title: "Check-in Realizado! ✅",
        description: `${result.participantName || 'Participante'} fez check-in com sucesso`,
      });
    }
  };

  const exportCheckins = () => {
    const csvContent = [
      ['Nome', 'Email', 'Telefone', 'Bilhete', 'Check-in', 'Data Check-in'],
      ...registrations.map(reg => [
        reg.participant_name,
        reg.participant_email,
        reg.participant_phone || '',
        reg.ticket_types?.name || '',
        reg.check_in_status === 'checked_in' ? 'Sim' : 'Não',
        reg.check_in_time ? new Date(reg.check_in_time).toLocaleString() : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${event?.title || 'evento'}_checkins.csv`);
    link.click();
  };

  const filteredRegistrations = registrations.filter(reg =>
    reg.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.participant_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.registration_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  if (!event) {
    return <div className="flex items-center justify-center min-h-screen">Evento não encontrado</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate(`/evento/${eventId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Check-in do Evento</h1>
            <p className="text-muted-foreground">{event.title}</p>
          </div>
          <Button variant="outline" onClick={exportCheckins}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>

        {/* Event Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(event.start_date).toLocaleDateString()} às {new Date(event.start_date).toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{event.location}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Inscrições</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Check-ins Realizados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.checkedIn}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalRegistrations > 0 ? Math.round((stats.checkedIn / stats.totalRegistrations) * 100) : 0}% do total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Receita</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.revenue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="scanner" className="space-y-4">
          <TabsList>
            <TabsTrigger value="scanner">
              <QrCode className="h-4 w-4 mr-2" />
              Scanner QR
            </TabsTrigger>
            <TabsTrigger value="registrations">
              <Users className="h-4 w-4 mr-2" />
              Inscrições
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scanner">
            <Card>
              <CardHeader>
                <CardTitle>Scanner QR Code</CardTitle>
                <CardDescription>
                  Escaneie os códigos QR dos participantes para realizar check-in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Funcionalidade de scanner QR em desenvolvimento</p>
                  <p className="text-sm">Use a lista de inscrições para fazer check-in manual</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="registrations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Inscrições</CardTitle>
                <CardDescription>
                  Gerir todas as inscrições do evento
                </CardDescription>
                <div className="flex gap-2">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Procurar por nome, email ou número..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredRegistrations.map((registration) => (
                    <div key={registration.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{registration.participant_name}</p>
                          <Badge variant="outline">{registration.registration_number}</Badge>
                          <Badge variant={registration.check_in_status === 'checked_in' ? 'default' : 'secondary'}>
                            {registration.check_in_status === 'checked_in' ? 'Check-in Realizado' : 'Pendente'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{registration.participant_email}</p>
                        <p className="text-sm text-muted-foreground">
                          {registration.ticket_types?.name} - €{registration.amount_paid.toFixed(2)}
                        </p>
                        {registration.check_in_time && (
                          <p className="text-xs text-muted-foreground">
                            Check-in: {new Date(registration.check_in_time).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
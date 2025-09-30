import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Users, 
  Euro, 
  CheckCircle, 
  Clock, 
  XCircle,
  Search,
  Download,
  Edit,
  Save,
  X,
  Calendar,
  MapPin,
  Mail,
  Phone,
  CreditCard,
  FileText,
  AlertTriangle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { validateDocumentByCountry, getDocumentTypeInfo } from "@/utils/documentValidation";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  start_date: string;
  end_date: string;
  location: string;
  address: string;
  organizer_id: string;
  max_participants: number;
  organizer?: any;
}

interface Registration {
  id: string;
  participant_name: string;
  participant_email: string;
  participant_phone: string;
  participant_birth_date: string;
  participant_gender: string;
  participant_document_number: string;
  participant_nationality: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  medical_conditions: string;
  tshirt_size: string;
  registration_number: string;
  amount_paid: number;
  payment_status: string;
  payment_method: string;
  check_in_status: string;
  check_in_time: string;
  bib_number: string;
  status: string;
  created_at: string;
  ticket_type_name?: string;
  voucher_code: string;
  discount_amount: number;
}

interface EventStats {
  totalRegistrations: number;
  paidRegistrations: number;
  pendingPayments: number;
  totalRevenue: number;
  averageTicketPrice: number;
  checkedIn: number;
}

export default function AdminEventManagement() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<EventStats>({
    totalRegistrations: 0,
    paidRegistrations: 0,
    pendingPayments: 0,
    totalRevenue: 0,
    averageTicketPrice: 0,
    checkedIn: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [documentValidation, setDocumentValidation] = useState<{ isValid: boolean; message: string } | null>(null);

  const isAdmin = profile?.role === 'admin';
  const isOrganizer = profile?.role === 'organizer';

  useEffect(() => {
    if (!user || (!isAdmin && !isOrganizer)) {
      navigate("/dashboard");
      return;
    }
    if (eventId) {
      loadEventData();
    }
  }, [eventId, user, profile, navigate]);

  const loadEventData = async () => {
    setLoading(true);
    try {
      // Load event details
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      // Load organizer info separately
      const { data: organizerData } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, phone, organization_name')
        .eq('user_id', eventData.organizer_id)
        .single();

      // Combine event data with organizer info
      const eventWithOrganizer = {
        ...eventData,
        organizer: organizerData || null
      };

      // Check permissions
      if (!isAdmin && eventWithOrganizer.organizer_id !== user?.id) {
        toast({
          title: "Acesso negado",
          description: "Não tem permissões para ver este evento",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setEvent(eventWithOrganizer);

      // Load registrations with ticket type info
      const { data: registrationsData, error: registrationsError } = await supabase
        .from('registrations')
        .select(`
          *,
          ticket_types!inner(name)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (registrationsError) throw registrationsError;

      const formattedRegistrations = (registrationsData || []).map(reg => ({
        ...reg,
        ticket_type_name: reg.ticket_types?.name || 'N/A'
      }));

      setRegistrations(formattedRegistrations);

      // Calculate stats
      const totalRegistrations = formattedRegistrations.length;
      const paidRegistrations = formattedRegistrations.filter(r => r.payment_status === 'paid').length;
      const pendingPayments = totalRegistrations - paidRegistrations;
      const totalRevenue = formattedRegistrations.reduce((sum, r) => sum + (r.amount_paid || 0), 0);
      const averageTicketPrice = totalRegistrations > 0 ? totalRevenue / totalRegistrations : 0;
      const checkedIn = formattedRegistrations.filter(r => r.check_in_status === 'checked_in').length;

      setStats({
        totalRegistrations,
        paidRegistrations,
        pendingPayments,
        totalRevenue,
        averageTicketPrice,
        checkedIn,
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

  const updateRegistration = async (registrationId: string, updates: Partial<Registration>) => {
    if (!isAdmin) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem editar registrations",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('registrations')
        .update(updates)
        .eq('id', registrationId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Registration atualizada com sucesso",
      });

      loadEventData(); // Refresh data
      setIsEditing(false);
      setEditingRegistration(null);
    } catch (error) {
      console.error('Error updating registration:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar registration",
        variant: "destructive",
      });
    }
  };

  const exportRegistrations = () => {
    const csvContent = [
      // Header
      [
        'Número',
        'Nome',
        'Email',
        'Telefone',
        'Data Nascimento',
        'Género',
        'Documento',
        'Nacionalidade',
        'Contacto Emergência',
        'Telefone Emergência',
        'Condições Médicas',
        'Tamanho T-shirt',
        'Tipo Bilhete',
        'Valor Pago',
        'Estado Pagamento',
        'Método Pagamento',
        'Check-in',
        'Dorsal',
        'Data Inscrição'
      ].join(','),
      // Data
      ...filteredRegistrations.map(reg => [
        reg.registration_number,
        reg.participant_name,
        reg.participant_email,
        reg.participant_phone,
        reg.participant_birth_date,
        reg.participant_gender,
        reg.participant_document_number,
        reg.participant_nationality,
        reg.emergency_contact_name,
        reg.emergency_contact_phone,
        reg.medical_conditions || '',
        reg.tshirt_size || '',
        reg.ticket_type_name,
        reg.amount_paid,
        reg.payment_status,
        reg.payment_method,
        reg.check_in_status,
        reg.bib_number || '',
        new Date(reg.created_at).toLocaleDateString('pt-PT')
      ].join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `registrations-${event?.title || 'evento'}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      'paid': { color: 'bg-green-500 text-white', label: 'Pago' },
      'pending': { color: 'bg-yellow-500 text-black', label: 'Pendente' },
      'cancelled': { color: 'bg-red-500 text-white', label: 'Cancelado' },
      'refunded': { color: 'bg-gray-500 text-white', label: 'Reembolsado' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getCheckInStatusBadge = (status: string) => {
    const statusConfig = {
      'checked_in': { color: 'bg-green-500 text-white', label: 'Check-in OK', icon: CheckCircle },
      'not_checked_in': { color: 'bg-gray-500 text-white', label: 'Não fez check-in', icon: Clock },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_checked_in;
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const filteredRegistrations = registrations.filter(reg =>
    reg.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.participant_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.registration_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando dados do evento...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Evento não encontrado</h2>
            <p className="text-muted-foreground mb-4">O evento solicitado não foi encontrado ou não tem permissões para acedê-lo.</p>
            <Button onClick={() => navigate("/dashboard")}>
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate(isAdmin ? "/admin" : "/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(event.start_date).toLocaleDateString('pt-PT')}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {event.location}
              </span>
              <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                {event.status.toUpperCase()}
              </Badge>
            </div>
          </div>
          <Button variant="outline" onClick={() => 
            isAdmin 
              ? navigate(`/admin/event/${eventId}/edit`)
              : navigate(`/edit-event/${eventId}`)
          }>
            <Edit className="h-4 w-4 mr-2" />
            Editar Evento
          </Button>
        </div>

        {/* Event Info and Organizer Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Evento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Categoria</Label>
                    <p className="mt-1">{event.category}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
                    <div className="mt-1">
                      <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                        {event.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Descrição</Label>
                  <p className="mt-1 text-sm">{event.description || 'Sem descrição disponível'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Endereço</Label>
                  <p className="mt-1 text-sm">{event.address}</p>
                </div>
                {event.max_participants && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Máximo de Participantes</Label>
                    <p className="mt-1">{event.max_participants}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Data de Início</Label>
                    <p className="mt-1">{new Date(event.start_date).toLocaleString('pt-PT')}</p>
                  </div>
                  {event.end_date && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Data de Fim</Label>
                      <p className="mt-1">{new Date(event.end_date).toLocaleString('pt-PT')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Organizer Information */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Organizador
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.organizer ? (
                  <>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Nome</Label>
                      <p className="mt-1 font-medium">
                        {event.organizer.first_name} {event.organizer.last_name}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={`mailto:${event.organizer.email}`}
                          className="text-primary hover:underline"
                        >
                          {event.organizer.email}
                        </a>
                      </div>
                    </div>
                    {event.organizer.phone && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Telefone</Label>
                        <div className="mt-1 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a 
                            href={`tel:${event.organizer.phone}`}
                            className="text-primary hover:underline"
                          >
                            {event.organizer.phone}
                          </a>
                        </div>
                      </div>
                    )}
                    {event.organizer.organization_name && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Organização</Label>
                        <p className="mt-1">{event.organizer.organization_name}</p>
                      </div>
                    )}
                    <div className="flex flex-col gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`mailto:${event.organizer.email}?subject=Evento: ${event.title}`, '_blank')}
                        className="w-full"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Contactar Organizador
                      </Button>
                      {isAdmin && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/admin/user/${event.organizer_id}`)}
                          className="w-full"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Ver Perfil Completo
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">Informações do organizador não disponíveis</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Inscritos</p>
                  <p className="text-2xl font-bold">{stats.totalRegistrations}</p>
                </div>
                <Users className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pagos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.paidRegistrations}</p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Por Pagar</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
                </div>
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
                  <p className="text-2xl font-bold">€{stats.totalRevenue.toFixed(2)}</p>
                </div>
                <Euro className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Preço Médio</p>
                  <p className="text-2xl font-bold">€{stats.averageTicketPrice.toFixed(2)}</p>
                </div>
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Check-ins</p>
                  <p className="text-2xl font-bold">{stats.checkedIn}</p>
                </div>
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="registrations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="registrations">Inscrições</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
            <TabsTrigger value="checkins">Check-ins</TabsTrigger>
          </TabsList>

          <TabsContent value="registrations" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gestão de Inscrições</CardTitle>
                    <CardDescription>
                      {stats.totalRegistrations} inscrições registadas
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={exportRegistrations}>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar CSV
                    </Button>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Pesquisar por nome, email ou número..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Inscrição</TableHead>
                      <TableHead>Participante</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Tipo Bilhete</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations.map((registration) => (
                      <TableRow key={registration.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-sm">
                          {registration.registration_number}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{registration.participant_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {registration.participant_gender} • {registration.participant_nationality}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs">
                              <Mail className="h-3 w-3" />
                              {registration.participant_email}
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <Phone className="h-3 w-3" />
                              {registration.participant_phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {registration.ticket_type_name}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          €{registration.amount_paid.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {getPaymentStatusBadge(registration.payment_status)}
                        </TableCell>
                        <TableCell>
                          {getCheckInStatusBadge(registration.check_in_status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedRegistration(registration)}
                            >
                              Ver
                            </Button>
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingRegistration(registration);
                                  setIsEditing(true);
                                }}
                              >
                                Editar
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {filteredRegistrations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma inscrição encontrada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Pagamentos</CardTitle>
                <CardDescription>Estado dos pagamentos das inscrições</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {registrations.map((registration) => (
                    <div key={registration.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">{registration.participant_name}</p>
                            <p className="text-sm text-muted-foreground">{registration.registration_number}</p>
                          </div>
                          <Badge variant="outline">{registration.ticket_type_name}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">€{registration.amount_paid.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{registration.payment_method}</p>
                        </div>
                        {getPaymentStatusBadge(registration.payment_status)}
                        {isAdmin && registration.payment_status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateRegistration(registration.id, { payment_status: 'paid' })}
                          >
                            Marcar como Pago
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checkins" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Check-ins</CardTitle>
                <CardDescription>Estado dos check-ins dos participantes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {registrations.filter(r => r.payment_status === 'paid').map((registration) => (
                    <div key={registration.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{registration.participant_name}</p>
                          <p className="text-sm text-muted-foreground">{registration.registration_number}</p>
                        </div>
                        <Badge variant="outline">{registration.bib_number || 'Sem dorsal'}</Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        {registration.check_in_time && (
                          <div className="text-right text-sm text-muted-foreground">
                            {new Date(registration.check_in_time).toLocaleString('pt-PT')}
                          </div>
                        )}
                        {getCheckInStatusBadge(registration.check_in_status)}
                        {isAdmin && registration.check_in_status === 'not_checked_in' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateRegistration(registration.id, { 
                              check_in_status: 'checked_in',
                              check_in_time: new Date().toISOString()
                            })}
                          >
                            Fazer Check-in
                          </Button>
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

      {/* Registration Detail Modal */}
      <Dialog open={!!selectedRegistration} onOpenChange={() => setSelectedRegistration(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Inscrição</DialogTitle>
            <DialogDescription>
              {selectedRegistration?.registration_number}
            </DialogDescription>
          </DialogHeader>
          {selectedRegistration && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Nome Completo</Label>
                  <p className="text-sm">{selectedRegistration.participant_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm">{selectedRegistration.participant_email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Telefone</Label>
                  <p className="text-sm">{selectedRegistration.participant_phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Data de Nascimento</Label>
                  <p className="text-sm">{new Date(selectedRegistration.participant_birth_date).toLocaleDateString('pt-PT')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Género</Label>
                  <p className="text-sm">{selectedRegistration.participant_gender}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Cartão de Cidadão</Label>
                  <p className="text-sm">{selectedRegistration.participant_document_number}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Nacionalidade</Label>
                  <p className="text-sm">{selectedRegistration.participant_nationality}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tamanho T-shirt</Label>
                  <p className="text-sm">{selectedRegistration.tshirt_size || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Contacto de Emergência</Label>
                  <p className="text-sm">{selectedRegistration.emergency_contact_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedRegistration.emergency_contact_phone}</p>
                </div>
                
                {selectedRegistration.medical_conditions && (
                  <div>
                    <Label className="text-sm font-medium">Condições Médicas</Label>
                    <p className="text-sm">{selectedRegistration.medical_conditions}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Valor Pago</Label>
                    <p className="text-sm font-semibold">€{selectedRegistration.amount_paid.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Estado Pagamento</Label>
                    {getPaymentStatusBadge(selectedRegistration.payment_status)}
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Método Pagamento</Label>
                    <p className="text-sm">{selectedRegistration.payment_method}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Check-in</Label>
                    {getCheckInStatusBadge(selectedRegistration.check_in_status)}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Data da Inscrição</Label>
                  <p className="text-sm">{new Date(selectedRegistration.created_at).toLocaleString('pt-PT')}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Registration Modal */}
      <Dialog open={isEditing} onOpenChange={() => setIsEditing(false)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Inscrição</DialogTitle>
            <DialogDescription>
              Modificar dados da inscrição {editingRegistration?.registration_number}
            </DialogDescription>
          </DialogHeader>
          {editingRegistration && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dados Pessoais</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Nome Completo</Label>
                    <Input
                      id="edit-name"
                      value={editingRegistration.participant_name}
                      onChange={(e) => setEditingRegistration({
                        ...editingRegistration,
                        participant_name: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editingRegistration.participant_email}
                      onChange={(e) => setEditingRegistration({
                        ...editingRegistration,
                        participant_email: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-phone">Telefone</Label>
                    <Input
                      id="edit-phone"
                      value={editingRegistration.participant_phone || ''}
                      onChange={(e) => setEditingRegistration({
                        ...editingRegistration,
                        participant_phone: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-birth-date">Data de Nascimento</Label>
                    <Input
                      id="edit-birth-date"
                      type="date"
                      value={editingRegistration.participant_birth_date ? new Date(editingRegistration.participant_birth_date).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditingRegistration({
                        ...editingRegistration,
                        participant_birth_date: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-gender">Género</Label>
                    <Select 
                      value={editingRegistration.participant_gender || ''} 
                      onValueChange={(value) => setEditingRegistration({
                        ...editingRegistration,
                        participant_gender: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar"/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Masculino">Masculino</SelectItem>
                        <SelectItem value="Feminino">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-nationality">Nacionalidade</Label>
                    <Select 
                      value={editingRegistration.participant_nationality || 'Portugal'} 
                      onValueChange={(value) => {
                        setEditingRegistration({
                          ...editingRegistration,
                          participant_nationality: value
                        });
                        // Reset document validation when nationality changes
                        setDocumentValidation(null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Portugal">Portugal</SelectItem>
                        <SelectItem value="Espanha">Espanha</SelectItem>
                        <SelectItem value="Brasil">Brasil</SelectItem>
                        <SelectItem value="Reino Unido">Reino Unido</SelectItem>
                        <SelectItem value="França">França</SelectItem>
                        <SelectItem value="Alemanha">Alemanha</SelectItem>
                        <SelectItem value="Itália">Itália</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="edit-document">
                      {getDocumentTypeInfo(editingRegistration.participant_nationality || 'Portugal').name}
                    </Label>
                    <Input
                      id="edit-document"
                      value={editingRegistration.participant_document_number || ''}
                      placeholder={getDocumentTypeInfo(editingRegistration.participant_nationality || 'Portugal').placeholder}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEditingRegistration({
                          ...editingRegistration,
                          participant_document_number: value
                        });
                        
                        // Validate document in real time
                        if (value) {
                          const validation = validateDocumentByCountry(value, editingRegistration.participant_nationality || 'Portugal');
                          setDocumentValidation(validation);
                        } else {
                          setDocumentValidation(null);
                        }
                      }}
                    />
                    {documentValidation && !documentValidation.isValid && (
                      <p className="text-sm text-destructive mt-1">{documentValidation.message}</p>
                    )}
                    {documentValidation && documentValidation.isValid && (
                      <p className="text-sm text-green-600 mt-1">Documento válido</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contacto de Emergência</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-emergency-name">Nome</Label>
                    <Input
                      id="edit-emergency-name"
                      value={editingRegistration.emergency_contact_name || ''}
                      onChange={(e) => setEditingRegistration({
                        ...editingRegistration,
                        emergency_contact_name: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-emergency-phone">Telefone</Label>
                    <Input
                      id="edit-emergency-phone"
                      value={editingRegistration.emergency_contact_phone || ''}
                      onChange={(e) => setEditingRegistration({
                        ...editingRegistration,
                        emergency_contact_phone: e.target.value
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Detalhes do Evento</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-tshirt">Tamanho T-shirt</Label>
                    <Select 
                      value={editingRegistration.tshirt_size || ''} 
                      onValueChange={(value) => setEditingRegistration({
                        ...editingRegistration,
                        tshirt_size: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar"/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XS">XS</SelectItem>
                        <SelectItem value="S">S</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="XL">XL</SelectItem>
                        <SelectItem value="XXL">XXL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-bib">Número Dorsal</Label>
                    <Input
                      id="edit-bib"
                      value={editingRegistration.bib_number || ''}
                      onChange={(e) => setEditingRegistration({
                        ...editingRegistration,
                        bib_number: e.target.value
                      })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="edit-medical">Condições Médicas</Label>
                  <Textarea
                    id="edit-medical"
                    value={editingRegistration.medical_conditions || ''}
                    onChange={(e) => setEditingRegistration({
                      ...editingRegistration,
                      medical_conditions: e.target.value
                    })}
                    placeholder="Descreva quaisquer condições médicas relevantes..."
                  />
                </div>
              </div>

              {/* Administrative */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Administrativo</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-payment-status">Estado Pagamento</Label>
                    <Select 
                      value={editingRegistration.payment_status} 
                      onValueChange={(value) => setEditingRegistration({
                        ...editingRegistration,
                        payment_status: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                        <SelectItem value="refunded">Reembolsado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-checkin-status">Estado Check-in</Label>
                    <Select 
                      value={editingRegistration.check_in_status} 
                      onValueChange={(value) => setEditingRegistration({
                        ...editingRegistration,
                        check_in_status: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_checked_in">Não fez check-in</SelectItem>
                        <SelectItem value="checked_in">Check-in realizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button 
                  onClick={() => {
                    // Validate document before saving
                    if (editingRegistration.participant_document_number) {
                      const validation = validateDocumentByCountry(
                        editingRegistration.participant_document_number, 
                        editingRegistration.participant_nationality || 'Portugal'
                      );
                      if (!validation.isValid) {
                        toast({
                          title: "Documento inválido",
                          description: validation.message,
                          variant: "destructive"
                        });
                        return;
                      }
                    }
                    updateRegistration(editingRegistration.id, editingRegistration);
                  }}
                  disabled={documentValidation && !documentValidation.isValid}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
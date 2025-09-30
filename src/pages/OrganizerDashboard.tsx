import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { 
  CalendarPlus, 
  Users, 
  TrendingUp, 
  Eye, 
  Edit,
  BarChart3,
  CheckCircle,
  MapPin,
  Calendar,
  Clock,
  Settings,
  Download,
  UserCheck,
  Euro,
  Activity,
  Receipt,
  CreditCard,
  Banknote,
  Percent,
  PiggyBank,
  FileText,
  AlertCircle,
  Filter,
  RefreshCw,
  MoreHorizontal,
  DollarSign,
  Wallet,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  HandCoins,
  QrCode
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EventCheckinManager } from "@/components/EventCheckinManager";
import { useRealtimeRegistrations } from "@/hooks/useRealtimeRegistrations";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";

interface Event {
  id: string;
  title: string;
  category: string;
  start_date: string;
  end_date: string;
  status: string;
  location: string;
  address: string;
  max_participants: number;
  created_at: string;
  registrations: any[];
}

interface Registration {
  id: string;
  participant_name: string;
  participant_email: string;
  amount_paid: number;
  check_in_status: string;
  payment_status: string;
  registration_number: string;
  created_at: string;
  events: {
    title: string;
  };
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  event_id: string;
  fees_amount: number;
  payment_method: string;
}

interface Transaction {
  id: string;
  transaction_number: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
  platform_fee: number;
  net_amount: number;
}

interface Payout {
  id: string;
  payout_number: string;
  amount: number;
  status: string;
  created_at: string;
  period_start: string;
  period_end: string;
  fees: number;
  net_amount: number;
}

interface Stats {
  totalEvents: number;
  totalRegistrations: number;  
  totalRevenue: number;
  pendingCheckIns: number;
  activeEvents: number;
  avgRegistrationsPerEvent: number;
  totalOrders: number;
  totalTransactions: number;
  totalFees: number;
  pendingPayouts: number;
  netRevenue: number;
  conversionRate: number;
}

export default function OrganizerDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [initialRegistrations, setInitialRegistrations] = useState<Registration[]>([]);
  const [initialOrders, setInitialOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    totalRegistrations: 0,
    totalRevenue: 0,
    pendingCheckIns: 0,
    activeEvents: 0,
    avgRegistrationsPerEvent: 0,
    totalOrders: 0,
    totalTransactions: 0,
    totalFees: 0,
    pendingPayouts: 0,
    netRevenue: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Use realtime hooks for live updates - temporarily disabled for type compatibility
  const registrations = initialRegistrations;
  const orders = initialOrders;

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchOrganizerData();
  }, [user, navigate]);

  const fetchOrganizerData = async () => {
    try {
      setLoading(true);

      // Fetch organizer's events with registration counts
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          id,
          title,
          category,
          start_date,
          end_date,
          status,
          location,
          address,
          max_participants,
          created_at,
          registrations(
            id,
            amount_paid,
            check_in_status,
            payment_status
          )
        `)
        .eq('organizer_id', user!.id)
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      // Fetch recent registrations for organizer's events
      const { data: registrationsData, error: regError } = await supabase
        .from('registrations')
        .select(`
          id,
          participant_name,
          participant_email,
          amount_paid,
          check_in_status,
          payment_status,
          registration_number,
          created_at,
          events!inner(
            title,
            organizer_id
          )
        `)
        .eq('events.organizer_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (regError) throw regError;

      // Fetch orders for organizer's events
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          status,
          payment_status,
          created_at,
          event_id,
          fees_amount,
          payment_method,
          events!inner(organizer_id)
        `)
        .eq('events.organizer_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (ordersError) throw ordersError;

      // Fetch transactions for organizer
      const { data: transactionsData, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (transError) throw transError;

      // Fetch payouts for organizer
      const { data: payoutsData, error: payoutsError } = await supabase
        .from('payouts')
        .select('*')
        .eq('organizer_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (payoutsError) throw payoutsError;

      setEvents(eventsData || []);
      setInitialRegistrations(registrationsData || []);
      setInitialOrders(ordersData || []);
      setTransactions(transactionsData || []);
      setPayouts(payoutsData || []);

      // Calculate comprehensive stats
      let totalRegistrations = 0;
      let totalRevenue = 0;
      let pendingCheckIns = 0;
      let activeEvents = 0;
      let totalFees = 0;

      eventsData?.forEach(event => {
        const regs = event.registrations || [];
        totalRegistrations += regs.length;
        
        if (event.status === 'published') {
          activeEvents++;
        }

        regs.forEach((reg: any) => {
          totalRevenue += parseFloat(String(reg.amount_paid || 0));
          if (reg.check_in_status === 'not_checked_in' && event.status === 'published') {
            pendingCheckIns++;
          }
        });
      });

      // Calculate fees and net revenue
      totalFees = ordersData?.reduce((sum, order) => sum + (order.fees_amount || 0), 0) || 0;
      const netRevenue = totalRevenue - totalFees;
      const pendingPayouts = payoutsData?.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0) || 0;

      const avgRegistrationsPerEvent = eventsData?.length ? 
        Math.round(totalRegistrations / eventsData.length) : 0;

      const conversionRate = eventsData?.length ? 
        Math.round((activeEvents / eventsData.length) * 100) : 0;

      setStats({
        totalEvents: eventsData?.length || 0,
        totalRegistrations,
        totalRevenue,
        pendingCheckIns,
        activeEvents,
        avgRegistrationsPerEvent,
        totalOrders: ordersData?.length || 0,
        totalTransactions: transactionsData?.length || 0,
        totalFees,
        pendingPayouts,
        netRevenue,
        conversionRate
      });

    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "secondary",
      published: "default", 
      cancelled: "destructive",
      completed: "outline"
    } as const;
    
    const labels = {
      draft: "Rascunho",
      published: "Publicado",
      cancelled: "Cancelado", 
      completed: "Concluído"
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const handleCheckIn = async (registrationId: string) => {
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ 
          check_in_status: 'checked_in',
          check_in_time: new Date().toISOString()
        })
        .eq('id', registrationId);

      if (error) throw error;

      toast({
        title: "Check-in realizado",
        description: "Participante registado com sucesso",
      });

      fetchOrganizerData(); // Refresh data
    } catch (error: any) {
      toast({
        title: "Erro no check-in",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || event.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">A carregar painel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Bem-vindo, {profile?.first_name || 'Organizador'}!
            </h1>
            <p className="text-muted-foreground">
              Painel do Organizador - Gerir os seus eventos e participantes
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/create-event")}>
              <CalendarPlus className="h-4 w-4 mr-2" />
              Criar Evento
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          </div>
        </div>

        {/* Primary Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +12% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Líquida</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.netRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Após comissões: €{stats.totalFees.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inscrições</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
              <p className="text-xs text-muted-foreground">
                Média: {stats.avgRegistrationsPerEvent} por evento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos Ativos</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeEvents}</div>
              <p className="text-xs text-muted-foreground">
                {stats.conversionRate}% taxa de publicação
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Eventos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">eventos criados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Check-ins Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingCheckIns}</div>
              <p className="text-xs text-muted-foreground">participantes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Encomendas</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">processadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.pendingPayouts.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">a receber</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="eventos" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="eventos">Eventos</TabsTrigger>
            <TabsTrigger value="inscricoes">Inscrições</TabsTrigger>
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
            <TabsTrigger value="encomendas">Encomendas</TabsTrigger>
            <TabsTrigger value="checkin">Check-in</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="eventos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Meus Eventos</CardTitle>
                <CardDescription>
                  Gerir e acompanhar todos os seus eventos
                </CardDescription>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Pesquisar eventos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="all">Todos os Status</option>
                    <option value="draft">Rascunho</option>
                    <option value="published">Publicados</option>
                    <option value="completed">Concluídos</option>
                    <option value="cancelled">Cancelados</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Ainda não criou nenhum evento.</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => navigate("/create-event")}
                    >
                      Criar Primeiro Evento
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredEvents.map((event) => (
                      <div key={event.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="space-y-2 flex-1">
                            <h3 className="font-semibold text-lg">{event.title}</h3>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(event.start_date).toLocaleDateString('pt-PT')}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {event.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {event.registrations?.length || 0} inscritos
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(event.status)}
                            <div className="text-right">
                              <p className="font-semibold">
                                €{event.registrations?.reduce((sum, reg: any) => sum + (reg.amount_paid || 0), 0).toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">receita</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/event/${event.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/edit-event/${event.id}`)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/event/${event.id}/manage`)}
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Gerir Evento
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inscricoes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Inscrições Recentes</CardTitle>
                <CardDescription>
                  Últimas inscrições nos seus eventos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {registrations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Ainda não há inscrições nos seus eventos.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {registrations.map((registration) => (
                      <div key={registration.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium">{registration.participant_name}</p>
                          <p className="text-sm text-muted-foreground">{registration.participant_email}</p>
                            <p className="text-xs text-muted-foreground">
                              {registration.events?.title} • {registration.registration_number}
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="font-semibold">€{registration.amount_paid.toFixed(2)}</p>
                            <div className="flex gap-1">
                              <Badge variant={registration.payment_status === 'paid' ? 'default' : 'secondary'}>
                                {registration.payment_status}
                              </Badge>
                              <Badge variant={registration.check_in_status === 'checked_in' ? 'default' : 'outline'}>
                                {registration.check_in_status === 'checked_in' ? 'Check-in OK' : 'Pendente'}
                              </Badge>
                            </div>
                          </div>
                          {registration.check_in_status === 'not_checked_in' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleCheckIn(registration.id)}
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Check-in
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financeiro" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Resumo Financeiro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Receita Bruta</span>
                    <span className="font-semibold">€{stats.totalRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-red-600">
                    <span className="text-sm">Comissões</span>
                    <span className="font-semibold">-€{stats.totalFees.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center font-bold">
                      <span>Receita Líquida</span>
                      <span className="text-green-600">€{stats.netRevenue.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Transações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTransactions}</div>
                  <p className="text-xs text-muted-foreground">total processadas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Pendente Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{stats.pendingPayouts.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">a receber</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Transações Recentes</CardTitle>
                <CardDescription>Últimas movimentações financeiras</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Banknote className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{transaction.transaction_number}</p>
                          <p className="text-sm text-muted-foreground capitalize">{transaction.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">€{transaction.amount.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          Taxa: €{transaction.platform_fee?.toFixed(2) || '0.00'}
                        </p>
                        <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="encomendas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Encomendas dos Seus Eventos</CardTitle>
                <CardDescription>Gestão de todas as encomendas</CardDescription>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                  <Button variant="outline" size="sm" onClick={fetchOrganizerData}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualizar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Receipt className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{order.order_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.payment_method || 'Método não especificado'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="font-bold">€{order.total_amount.toFixed(2)}</p>
                    <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                      {order.status}
                    </Badge>
                  </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              Recibo
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checkin" className="space-y-4">
            {events.length > 0 ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <QrCode className="h-5 w-5" />
                      Gestão de Check-in QR
                    </CardTitle>
                    <CardDescription>
                      Scanner QR, geração de códigos e gestão completa de check-ins
                    </CardDescription>
                  </CardHeader>
                </Card>
                
                {events.filter(e => e.status === 'published').map((event) => (
                  <div key={event.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{event.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(event.start_date).toLocaleDateString('pt-PT')}
                      </div>
                    </div>
                    
                    <EventCheckinManager 
                      eventId={event.id}
                      eventTitle={event.title}
                    />
                  </div>
                ))}
                
                {events.filter(e => e.status === 'published').length === 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8 text-muted-foreground">
                        <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum evento publicado disponível para check-in.</p>
                        <p className="text-sm mt-2">Publique um evento para começar a usar o sistema QR.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Ainda não criou nenhum evento.</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => navigate("/create-event")}
                    >
                      Criar Primeiro Evento
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="relatorios" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Relatório de Eventos</CardTitle>
                  <CardDescription>Dados completos dos seus eventos</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Relatório Financeiro</CardTitle>
                  <CardDescription>Análise de receitas e comissões</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Calculator className="h-4 w-4 mr-2" />
                    Exportar PDF
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lista de Participantes</CardTitle>
                  <CardDescription>Todos os participantes registados</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Exportar Excel
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Relatório de Check-ins</CardTitle>
                  <CardDescription>Status de presença dos participantes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Análise de Performance</CardTitle>
                  <CardDescription>Métricas de sucesso dos eventos</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Exportar PDF
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Histórico de Pagamentos</CardTitle>
                  <CardDescription>Todas as transações recebidas</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <HandCoins className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Trophy, 
  User, 
  CreditCard,
  Download,
  CheckCircle,
  XCircle,
  Search,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { useRealtimeRegistrations } from "@/hooks/useRealtimeRegistrations";
import { Input } from "@/components/ui/input";

interface Registration {
  id: string;
  amount_paid: number;
  check_in_status: string;
  payment_status: string;
  registration_number: string;
  created_at: string;
  events: {
    id: string;
    title: string;
    category: string;
    start_date: string;
    end_date: string;
    location: string;
    address: string;
    status: string;
  };
}

interface Result {
  id: string;
  position_overall: number;
  position_category: number;
  position_gender: number;
  finish_time: string | null;
  category: string;
  events: {
    title: string;
    start_date: string;
  };
}

interface Stats {
  totalRegistrations: number;
  totalSpent: number;
  completedEvents: number;
  pendingCheckIns: number;
  avgPosition: number;
}

export default function ParticipantDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [initialRegistrations, setInitialRegistrations] = useState<Registration[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalRegistrations: 0,
    totalSpent: 0,
    completedEvents: 0,
    pendingCheckIns: 0,
    avgPosition: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Use realtime hook for live updates - temporarily disabled for type compatibility
  const registrations = initialRegistrations;

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchParticipantData();
  }, [user, navigate]);

  const fetchParticipantData = async () => {
    try {
      setLoading(true);

      // Fetch registrations
      const { data: registrationsData, error: regError } = await supabase
        .from('registrations')
        .select(`
          id,
          amount_paid,
          check_in_status,
          payment_status,
          registration_number,
          created_at,
          events(
            id,
            title,
            category,
            start_date,
            end_date,
            location,
            address,
            status
          )
        `)
        .eq('participant_id', user!.id)
        .order('created_at', { ascending: false });

      if (regError) throw regError;

      // Fetch results
      const { data: resultsData, error: resultsError } = await supabase
        .from('results')
        .select(`
          id,
          position_overall,
          position_category,
          position_gender,
          finish_time,
          category,
          events(title, start_date)
        `)
        .in('registration_id', registrationsData?.map(r => r.id) || []);

      if (resultsError) throw resultsError;

      setInitialRegistrations(registrationsData || []);
      setResults((resultsData || []).map(result => ({
        ...result,
        finish_time: result.finish_time as string | null
      })));

      // Calculate stats
      const totalSpent = registrationsData?.reduce((sum, reg) => sum + (reg.amount_paid || 0), 0) || 0;
      const completedEvents = registrationsData?.filter(reg => 
        (reg.events as any).status === 'completed'
      ).length || 0;
      const pendingCheckIns = registrationsData?.filter(reg => 
        reg.check_in_status === 'not_checked_in'
      ).length || 0;
      const avgPosition = resultsData?.length ? 
        resultsData.reduce((sum, result) => sum + (result.position_overall || 0), 0) / resultsData.length : 0;

      setStats({
        totalRegistrations: registrationsData?.length || 0,
        totalSpent,
        completedEvents,
        pendingCheckIns,
        avgPosition: Math.round(avgPosition)
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
      active: "default",
      completed: "outline",
      cancelled: "destructive"
    } as const;
    
    const labels = {
      active: "Ativo",
      completed: "Concluído",
      cancelled: "Cancelado"
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      paid: "default",
      pending: "secondary",
      failed: "destructive"
    } as const;
    
    const labels = {
      paid: "Pago",
      pending: "Pendente",
      failed: "Falhado"
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = (reg.events as any).title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (reg.events as any).category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || (reg.events as any).status === filterStatus;
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
              Olá, {profile?.first_name ? `${profile.first_name}${profile.last_name ? ` ${profile.last_name}` : ''}` : 'Participante'}!
            </h1>
            <p className="text-muted-foreground">
              Painel do Participante - Gerir as suas inscrições e resultados
            </p>
          </div>
          <Button onClick={() => navigate("/eventos")}>
            <Search className="h-4 w-4 mr-2" />
            Explorar Eventos
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inscrições</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
              <p className="text-xs text-muted-foreground">eventos inscritos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.totalSpent.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">em inscrições</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos Concluídos</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedEvents}</div>
              <p className="text-xs text-muted-foreground">participações</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Check-ins Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingCheckIns}</div>
              <p className="text-xs text-muted-foreground">eventos próximos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Posição Média</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgPosition || '-'}</div>
              <p className="text-xs text-muted-foreground">classificação geral</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="inscricoes" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inscricoes">Minhas Inscrições</TabsTrigger>
            <TabsTrigger value="resultados">Resultados</TabsTrigger>
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
          </TabsList>

          <TabsContent value="inscricoes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Minhas Inscrições</CardTitle>
                <CardDescription>
                  Histórico de todas as suas inscrições em eventos
                </CardDescription>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
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
                    <option value="published">Publicados</option>
                    <option value="completed">Concluídos</option>
                    <option value="cancelled">Cancelados</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                {filteredRegistrations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Ainda não se inscreveu em nenhum evento.</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => navigate("/eventos")}
                    >
                      Explorar Eventos
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRegistrations.map((registration) => (
                      <div key={registration.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="space-y-2 flex-1">
                            <h3 className="font-semibold text-lg">
                              {(registration.events as any).title}
                            </h3>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date((registration.events as any).start_date).toLocaleDateString('pt-PT')}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {(registration.events as any).location}
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                #{registration.registration_number}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex gap-2">
                              {getStatusBadge((registration.events as any).status)}
                              {getPaymentStatusBadge(registration.payment_status)}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">€{registration.amount_paid}</p>
                              <p className="text-xs text-muted-foreground">
                                Check-in: {registration.check_in_status === 'checked_in' ? 
                                  <span className="text-green-600">Feito</span> : 
                                  <span className="text-orange-600">Pendente</span>
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/event/${(registration.events as any).id}`)}
                          >
                            Ver Evento
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Certificado
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resultados" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Meus Resultados</CardTitle>
                <CardDescription>
                  Classificações e tempos dos eventos que participou
                </CardDescription>
              </CardHeader>
              <CardContent>
                {results.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Ainda não tem resultados disponíveis.</p>
                    <p className="text-sm">Os resultados aparecerão após participar nos eventos.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.map((result) => (
                      <div key={result.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h3 className="font-semibold">{(result.events as any).title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date((result.events as any).start_date).toLocaleDateString('pt-PT')}
                            </p>
                            <Badge variant="outline">{result.category}</Badge>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="text-2xl font-bold text-primary">
                              #{result.position_overall}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Geral: #{result.position_overall} | Categoria: #{result.position_category}
                            </div>
                            {result.finish_time && (
                              <div className="text-sm font-mono">
                                {result.finish_time}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="perfil" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Perfil do Participante</CardTitle>
                <CardDescription>
                  Gerir as suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Nome</label>
                      <p className="text-sm text-muted-foreground">
                        {profile?.first_name} {profile?.last_name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <p className="text-sm text-muted-foreground">{profile?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Telefone</label>
                      <p className="text-sm text-muted-foreground">{profile?.phone || 'Não definido'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <Badge variant={profile?.is_active ? "default" : "destructive"}>
                        {profile?.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button>Editar Perfil</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
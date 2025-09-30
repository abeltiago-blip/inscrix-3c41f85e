import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Settings,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  Activity,
  Database,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  BarChart3,
  CreditCard,
  Receipt,
  Percent,
  HandCoins,
  MessageCircle,
  Bell,
  TrendingDown,
  FileText,
  PiggyBank,
  Banknote,
  Calculator,
  Wallet,
  Euro,
  Settings2,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  Download,
  Filter,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import FeedbackManager from "@/components/admin/FeedbackManager";
import Header from "@/components/Header";
import { SMTPTester } from "@/components/SMTPTester";
import AuthEmailTester from "@/components/AuthEmailTester";
import EmailManagementTabs from "@/components/admin/EmailManagementTabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface User {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'organizer' | 'participant' | 'team';
  is_active: boolean;
  created_at: string;
}

interface Event {
  id: string;
  title: string;
  category: string;
  status: string;
  organizer_id: string;
  start_date: string;
  created_at: string;
  slug?: string;
  organizer?: any;
}

interface Stats {
  totalUsers: number;
  totalEvents: number;
  totalRegistrations: number;
  revenueThisMonth: number;
  totalOrders: number;
  pendingPayouts: number;
  supportTickets: number;
  platformFees: number;
  totalTransactions: number;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  user_id: string;
  event_id: string;
}

interface Transaction {
  id: string;
  transaction_number: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  provider: string;
  is_active: boolean;
  currency: string;
  config: any;
}

interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalEvents: 0,
    totalRegistrations: 0,
    revenueThisMonth: 0,
    totalOrders: 0,
    pendingPayouts: 0,
    supportTickets: 0,
    platformFees: 0,
    totalTransactions: 0
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "participant" as 'admin' | 'organizer' | 'participant' | 'team',
    phone: "",
    organization_name: ""
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (profile?.role !== 'admin') {
      navigate("/dashboard");
      return;
    }
    loadAdminData();
  }, [user, profile, navigate]);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Carregar estatísticas
      const [
        usersResponse, 
        eventsResponse, 
        registrationsResponse,
        ordersResponse,
        transactionsResponse,
        payoutsResponse,
        ticketsResponse
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('events').select('*', { count: 'exact' }),
        supabase.from('registrations').select('amount_paid', { count: 'exact' }),
        supabase.from('orders').select('*', { count: 'exact' }),
        supabase.from('transactions').select('*', { count: 'exact' }),
        supabase.from('payouts').select('*').eq('status', 'pending'),
        supabase.from('support_tickets').select('*').neq('status', 'closed')
      ]);

      // Carregar dados detalhados com informações do organizador
      const [usersData, eventsData, ordersData, transactionsData, paymentMethodsData, ticketsData] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('events').select('*, slug').order('created_at', { ascending: false }).limit(10),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('payment_methods').select('*').order('name'),
        supabase.from('support_tickets').select('*').order('created_at', { ascending: false }).limit(10)
      ]);

      setUsers(usersData.data || []);
      
      // Enrich events with organizer data
      if (eventsData.data) {
        const eventsWithOrganizers = await Promise.all(
          eventsData.data.map(async (event) => {
            const { data: organizerData } = await supabase
              .from('profiles')
              .select('first_name, last_name, email, phone, organization_name')
              .eq('user_id', event.organizer_id)
              .single();
            
            return {
              ...event,
              organizer: organizerData || null
            };
          })
        );
        setEvents(eventsWithOrganizers);
      } else {
        setEvents([]);
      }
      
      setOrders(ordersData.data || []);
      setTransactions(transactionsData.data || []);
      setPaymentMethods(paymentMethodsData.data || []);
      setSupportTickets(ticketsData.data || []);

      // Calcular estatísticas
      const revenue = registrationsResponse.data?.reduce((sum, reg) => sum + (reg.amount_paid || 0), 0) || 0;
      const platformFees = ordersResponse.data?.reduce((sum, order) => sum + (order.fees_amount || 0), 0) || 0;
      const pendingPayouts = payoutsResponse.data?.reduce((sum, payout) => sum + (payout.amount || 0), 0) || 0;

      setStats({
        totalUsers: usersResponse.count || 0,
        totalEvents: eventsResponse.count || 0,
        totalRegistrations: registrationsResponse.count || 0,
        revenueThisMonth: revenue,
        totalOrders: ordersResponse.count || 0,
        pendingPayouts: pendingPayouts,
        supportTickets: ticketsResponse.data?.length || 0,
        platformFees: platformFees,
        totalTransactions: transactionsResponse.count || 0
      });

    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados administrativos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'organizer' | 'participant' | 'team') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Role do utilizador atualizada com sucesso",
      });

      loadAdminData(); // Recarregar dados
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar role do utilizador. Verifique as suas permissões.",
        variant: "destructive",
      });
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Utilizador ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`,
      });

      loadAdminData(); // Recarregar dados
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do utilizador. Verifique as suas permissões.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    if (!confirm(`Tem a certeza que pretende eliminar permanentemente o evento "${eventTitle}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      // Atualizar imediatamente a lista local
      setEvents(prev => prev.filter(event => event.id !== eventId));

      toast({
        title: "Sucesso",
        description: "Evento eliminado com sucesso",
      });

      // Recarregar dados completos
      loadAdminData();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Erro",
        description: "Erro ao eliminar evento. Verifique se não tem inscrições associadas.",
        variant: "destructive",
      });
    }
  };

  const togglePaymentMethod = async (methodId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_active: !currentStatus })
        .eq('id', methodId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Método de pagamento ${!currentStatus ? 'ativado' : 'desativado'}`,
      });

      loadAdminData(); // Recarregar dados
    } catch (error) {
      console.error('Error toggling payment method:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar estado do método de pagamento",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500 text-white';
      case 'organizer': return 'bg-blue-500 text-white';
      case 'participant': return 'bg-green-500 text-white';
      case 'team': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500 text-white';
      case 'draft': return 'bg-yellow-500 text-black';
      case 'cancelled': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const deleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Tem a certeza que pretende eliminar o utilizador ${userEmail}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      // First, deactivate the user in profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (profileError) throw profileError;

      toast({
        title: "Sucesso",
        description: "Utilizador desativado com sucesso",
      });

      loadAdminData(); // Refresh data
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Erro",
        description: "Erro ao eliminar utilizador. Verifique as suas permissões.",
        variant: "destructive",
      });
    }
  };

  const createUser = async () => {
    if (!newUserData.email || !newUserData.password || !newUserData.first_name || !newUserData.last_name) {
      toast({
        title: "Erro",
        description: "Por favor preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (newUserData.password.length < 6) {
      toast({
        title: "Erro",
        description: "A password deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingUser(true);
    
    try {
      // Create user with regular signup (they will receive confirmation email)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUserData.email,
        password: newUserData.password,
        options: {
          data: {
            first_name: newUserData.first_name,
            last_name: newUserData.last_name,
            role: newUserData.role,
            phone: newUserData.phone || null,
            organization_name: newUserData.organization_name || null,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // The profile will be created automatically by the trigger
        // But we can also create it manually to ensure the correct role is set
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: authData.user.id,
            email: newUserData.email,
            first_name: newUserData.first_name,
            last_name: newUserData.last_name,
            role: newUserData.role,
            phone: newUserData.phone || null,
            organization_name: newUserData.organization_name || null,
            is_active: true
          }, {
            onConflict: 'user_id'
          });

        if (profileError) {
          console.warn('Profile creation warning:', profileError);
          // Don't throw here as the trigger might have already created it
        }
      }

      toast({
        title: "Sucesso",
        description: authData.user?.email_confirmed_at 
          ? "Utilizador criado com sucesso" 
          : "Utilizador criado. Um email de confirmação foi enviado.",
      });

      // Reset form
      setNewUserData({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        role: "participant",
        phone: "",
        organization_name: ""
      });
      
      setShowCreateUserModal(false);
      loadAdminData(); // Refresh data
      
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      let errorMessage = "Erro ao criar utilizador";
      
      if (error.message?.includes('already registered')) {
        errorMessage = "Este email já está registado";
      } else if (error.message?.includes('invalid email')) {
        errorMessage = "Email inválido";
      } else if (error.message?.includes('weak password')) {
        errorMessage = "Password muito fraca";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando dados administrativos...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Painel Administrativo</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Gestão completa da plataforma INSCRIX - Bem-vindo, {profile?.first_name}!
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button onClick={() => navigate("/admin/age-groups")} className="flex-1 sm:flex-none">
              <Users className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Escalões</span>
              <span className="sm:hidden">Escalões</span>
            </Button>
             <Button onClick={() => navigate("/admin/categories")} className="flex-1 sm:flex-none">
               <Settings className="h-4 w-4 mr-2" />
               <span className="hidden sm:inline">Categorias</span>
               <span className="sm:hidden">Cat.</span>
             </Button>
            <Button variant="outline" onClick={() => setShowCreateUserModal(true)} className="flex-1 sm:flex-none">
              <Users className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Criar Utilizador</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilizadores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+12% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">+8% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.revenueThisMonth.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+15% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissões</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.platformFees.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">comissões da plataforma</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Suporte</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.supportTickets}</div>
            <p className="text-xs text-muted-foreground">em aberto</p>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas Secundárias */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Encomendas</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">total processadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transações</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">todas as transações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.pendingPayouts.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">a organizadores</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inscrições</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
            <p className="text-xs text-muted-foreground">+23% vs mês anterior</p>
          </CardContent>
        </Card>
      </div>

        {/* Tabs de gestão */}
        <Tabs defaultValue="users" className="space-y-4">
          <div className="relative">
            {/* Desktop TabsList */}
            <TabsList className="hidden lg:grid w-full grid-cols-9">
              <TabsTrigger value="users">Utilizadores</TabsTrigger>
              <TabsTrigger value="events">Eventos</TabsTrigger>
              <TabsTrigger value="financial">Financeiro</TabsTrigger>
              <TabsTrigger value="payments">Pagamentos</TabsTrigger>
              <TabsTrigger value="orders">Encomendas</TabsTrigger>
              <TabsTrigger value="emails">Emails</TabsTrigger>
              <TabsTrigger value="support">Suporte</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>
            
            {/* Mobile TabsList - Scrollable */}
            <div className="lg:hidden">
              <div className="overflow-x-auto scrollbar-hide">
                <TabsList className="inline-flex w-max min-w-full">
                  <TabsTrigger value="users" className="whitespace-nowrap px-6">Utilizadores</TabsTrigger>
                  <TabsTrigger value="events" className="whitespace-nowrap px-6">Eventos</TabsTrigger>
                  <TabsTrigger value="financial" className="whitespace-nowrap px-6">Financeiro</TabsTrigger>
                  <TabsTrigger value="payments" className="whitespace-nowrap px-6">Pagamentos</TabsTrigger>
                  <TabsTrigger value="orders" className="whitespace-nowrap px-6">Encomendas</TabsTrigger>
                  <TabsTrigger value="emails" className="whitespace-nowrap px-6">Emails</TabsTrigger>
                  <TabsTrigger value="support" className="whitespace-nowrap px-6">Suporte</TabsTrigger>
                  <TabsTrigger value="feedback" className="whitespace-nowrap px-6">Feedback</TabsTrigger>
                  <TabsTrigger value="settings" className="whitespace-nowrap px-6">Config</TabsTrigger>
                </TabsList>
              </div>
            </div>
          </div>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Utilizadores</CardTitle>
              <CardDescription>Gerir utilizadores, roles e permissões</CardDescription>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar utilizadores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                 {filteredUsers.map((user) => (
                   <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                     <div className="flex items-center space-x-4">
                       <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                         <Users className="h-5 w-5 text-primary" />
                       </div>
                       <div className="min-w-0 flex-1">
                         <p className="font-medium truncate">{user.first_name} {user.last_name}</p>
                         <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                         <p className="text-xs text-muted-foreground">
                           Registado em {new Date(user.created_at).toLocaleDateString()}
                         </p>
                       </div>
                     </div>
                     <div className="flex flex-wrap items-center gap-2">
                       <Badge className={getRoleBadgeColor(user.role)}>
                         {user.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                         {user.role === 'organizer' && <ShieldCheck className="h-3 w-3 mr-1" />}
                         {user.role.toUpperCase()}
                       </Badge>
                       <Badge variant={user.is_active ? "default" : "destructive"}>
                         {user.is_active ? "Ativo" : "Inativo"}
                       </Badge>
                       
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                             <MoreHorizontal className="h-4 w-4" />
                           </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem onClick={() => navigate(`/admin/user/${user.user_id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/admin/user/${user.user_id}/edit`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleUserStatus(user.user_id, user.is_active)}>
                              {user.is_active ? "Desativar" : "Ativar"}
                            </DropdownMenuItem>
                            <div className="px-2 py-1">
                              <Select onValueChange={(value) => updateUserRole(user.user_id, value as 'admin' | 'organizer' | 'participant' | 'team')}>
                                <SelectTrigger className="w-full h-8">
                                  <SelectValue placeholder="Alterar Role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="participant">Participante</SelectItem>
                                  <SelectItem value="organizer">Organizador</SelectItem>
                                  <SelectItem value="team">Equipa</SelectItem>
                                  <SelectItem value="admin">Administrador</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                         </DropdownMenuContent>
                       </DropdownMenu>
                     </div>
                   </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Eventos</CardTitle>
              <CardDescription>Moderar e gerir todos os eventos da plataforma</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                 {events.map((event) => (
                   <div key={event.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{event.title}</p>
                          <p className="text-sm text-muted-foreground">{event.category}</p>
                          <p className="text-xs text-muted-foreground">
                            Início: {new Date(event.start_date).toLocaleDateString()}
                          </p>
                          {event.organizer && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">Organizador:</span>
                              <span className="text-xs font-medium">
                                {event.organizer.first_name} {event.organizer.last_name}
                              </span>
                              {event.organizer.email && (
                                <span className="text-xs text-muted-foreground">
                                  ({event.organizer.email})
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                     <div className="flex flex-wrap items-center gap-2">
                       <Badge className={getStatusBadgeColor(event.status)}>
                         {event.status.toUpperCase()}
                       </Badge>
                       
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                             <MoreHorizontal className="h-4 w-4" />
                           </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end" className="w-56">
             <DropdownMenuItem onClick={() => navigate(`/admin/event/${event.id}/manage`)}>
               <Eye className="h-4 w-4 mr-2" />
               Gerir Evento
             </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/admin/event/${event.id}/edit`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteEvent(event.id, event.title)}>
                               <Trash2 className="h-4 w-4 mr-2" />
                               Eliminar
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

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão Financeira</CardTitle>
              <CardDescription>Monitorizar receitas, comissões e pagamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Receita Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">€{stats.revenueThisMonth.toFixed(2)}</div>
                    <p className="text-xs text-green-600">+15% este mês</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Comissões Arrecadadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">€{stats.platformFees.toFixed(2)}</div>
                    <p className="text-xs text-green-600">+8% este mês</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Pagamentos Pendentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">€{stats.pendingPayouts.toFixed(2)}</div>
                    <p className="text-xs text-orange-600">A processar</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold">Transações Recentes</h3>
                {transactions.slice(0, 5).map((transaction) => (
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

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pagamento</CardTitle>
              <CardDescription>Gerir formas de pagamento e comissões</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-muted-foreground">{method.provider}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={method.is_active ? 'default' : 'secondary'}>
                        {method.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/admin/payment-method/${method.id}/edit`)}>
                            <Settings2 className="h-4 w-4 mr-2" />
                            Configurar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => togglePaymentMethod(method.id, method.is_active)}>
                            {method.is_active ? 'Desativar' : 'Ativar'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/admin/payment-method/${method.id}/edit`)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar Taxas
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

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Encomendas</CardTitle>
              <CardDescription>Monitorizar e gerir todas as encomendas</CardDescription>
               <div className="flex flex-wrap gap-2 mb-4">
                 <Button variant="outline" size="sm" className="flex-shrink-0">
                   <Filter className="h-4 w-4 mr-2" />
                   Filtrar
                 </Button>
                 <Button variant="outline" size="sm" className="flex-shrink-0">
                   <Download className="h-4 w-4 mr-2" />
                   Exportar
                 </Button>
                 <Button variant="outline" size="sm" onClick={loadAdminData} className="flex-shrink-0">
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
                        <p className="text-sm text-muted-foreground">€{order.total_amount}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Pagamento: {order.payment_status}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/admin/order/${order.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            Gerar Fatura
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <TrendingDown className="h-4 w-4 mr-2" />
                            Reembolsar
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

        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tickets de Suporte</CardTitle>
              <CardDescription>Gerir pedidos de apoio dos utilizadores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supportTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <MessageCircle className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{ticket.ticket_number}</p>
                        <p className="text-sm text-muted-foreground">{ticket.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        ticket.priority === 'urgent' ? 'destructive' :
                        ticket.priority === 'high' ? 'default' : 'secondary'
                      }>
                        {ticket.priority}
                      </Badge>
                      <Badge variant={ticket.status === 'open' ? 'default' : 'secondary'}>
                        {ticket.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Ticket
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Responder
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Resolver
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

        <TabsContent value="emails" className="space-y-4">
          <EmailManagementTabs />
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <FeedbackManager />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SMTPTester />
            <AuthEmailTester />
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Crescimento de Receita</CardTitle>
                <CardDescription>Evolução mensal das receitas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Gráfico de receitas em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Pagamentos</CardTitle>
                <CardDescription>Métodos de pagamento mais utilizados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Gráfico de métodos de pagamento em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Performance de Eventos</CardTitle>
                <CardDescription>Eventos com mais inscrições</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Ranking de eventos em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Atividade de Utilizadores</CardTitle>
                <CardDescription>Registo e atividade mensal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Gráfico de utilizadores em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        </Tabs>

        {/* Create User Modal */}
        <Dialog open={showCreateUserModal} onOpenChange={setShowCreateUserModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Utilizador</DialogTitle>
              <DialogDescription>
                Adicionar um novo utilizador à plataforma
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Nome *</Label>
                  <Input
                    id="first_name"
                    value={newUserData.first_name}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, first_name: e.target.value }))}
                    placeholder="Nome"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Apelido *</Label>
                  <Input
                    id="last_name"
                    value={newUserData.last_name}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, last_name: e.target.value }))}
                    placeholder="Apelido"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                />
                <p className="text-xs text-muted-foreground">
                  O utilizador receberá um email de confirmação
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Mínimo 6 caracteres"
                />
                <p className="text-xs text-muted-foreground">
                  A password deve ter pelo menos 6 caracteres
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={newUserData.phone}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+351 912 345 678"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Tipo de Utilizador *</Label>
                <Select value={newUserData.role} onValueChange={(value) => setNewUserData(prev => ({ ...prev, role: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="participant">Participante</SelectItem>
                    <SelectItem value="organizer">Organizador</SelectItem>
                    <SelectItem value="team">Equipa</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {(newUserData.role === 'organizer' || newUserData.role === 'team') && (
                <div className="space-y-2">
                  <Label htmlFor="organization_name">
                    {newUserData.role === 'organizer' ? 'Nome da Organização' : 'Nome da Equipa'}
                  </Label>
                  <Input
                    id="organization_name"
                    value={newUserData.organization_name}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, organization_name: e.target.value }))}
                    placeholder={newUserData.role === 'organizer' ? 'Ex: EventosDesportivos Lda' : 'Ex: Os Corredores de Braga'}
                  />
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateUserModal(false)}
                  className="flex-1"
                  disabled={isCreatingUser}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={createUser}
                  className="flex-1"
                  disabled={isCreatingUser}
                >
                  {isCreatingUser ? "A criar..." : "Criar Utilizador"}
                </Button>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> O utilizador receberá um email de confirmação. 
                  Após a confirmação, poderá fazer login na plataforma com as credenciais definidas.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;
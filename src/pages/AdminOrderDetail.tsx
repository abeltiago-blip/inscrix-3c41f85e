import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Receipt, User, Calendar, CreditCard, MapPin, Mail, Phone, FileText, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";

interface OrderDetail {
  id: string;
  order_number: string;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  fees_amount: number;
  discount_amount: number;
  status: string;
  payment_status: string;
  payment_method: string;
  payment_provider: string;
  created_at: string;
  payment_date: string;
  notes: string;
  currency: string;
  metadata: any;
  user_id: string;
  event_id: string;
  registration_id: string;
  stripe_payment_intent_id: string;
  stripe_session_id: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  location: string;
  address: string;
  category: string;
}

interface Registration {
  id: string;
  participant_name: string;
  participant_email: string;
  participant_phone: string;
  registration_number: string;
  amount_paid: number;
}

export default function AdminOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || profile?.role !== 'admin') {
      navigate("/admin");
      return;
    }
    if (orderId) {
      loadOrderDetail();
    }
  }, [orderId, user, profile, navigate]);

  const loadOrderDetail = async () => {
    try {
      setLoading(true);

      // Buscar detalhes da encomenda
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      if (orderError) throw orderError;
      if (!orderData) {
        toast({
          title: "Erro",
          description: "Encomenda não encontrada",
          variant: "destructive",
        });
        navigate("/admin");
        return;
      }

      setOrder(orderData);

      // Buscar dados do utilizador
      if (orderData.user_id) {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', orderData.user_id)
          .maybeSingle();

        if (!userError && userData) {
          setUserProfile(userData);
        }
      }

      // Buscar dados do evento
      if (orderData.event_id) {
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', orderData.event_id)
          .maybeSingle();

        if (!eventError && eventData) {
          setEvent(eventData);
        }
      }

      // Buscar dados da inscrição
      if (orderData.registration_id) {
        const { data: registrationData, error: registrationError } = await supabase
          .from('registrations')
          .select('*')
          .eq('id', orderData.registration_id)
          .maybeSingle();

        if (!registrationError && registrationData) {
          setRegistration(registrationData);
        }
      }

    } catch (error) {
      console.error('Error loading order detail:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar detalhes da encomenda",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 text-white">Concluída</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelada</Badge>;
      case 'refunded':
        return <Badge className="bg-orange-500 text-white">Reembolsada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid':
        return <Badge className="bg-green-500 text-white">Pago</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhado</Badge>;
      case 'refunded':
        return <Badge className="bg-orange-500 text-white">Reembolsado</Badge>;
      default:
        return <Badge variant="outline">{paymentStatus}</Badge>;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  if (!order) {
    return <div className="flex items-center justify-center min-h-screen">Encomenda não encontrada</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Detalhes da Encomenda</h1>
            <p className="text-muted-foreground">#{order.order_number}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadOrderDetail}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Gerar Fatura
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações da Encomenda */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Informações da Encomenda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Estado:</span>
                {getStatusBadge(order.status)}
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Pagamento:</span>
                {getPaymentStatusBadge(order.payment_status)}
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Subtotal:</span>
                  <span>€{order.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Taxas:</span>
                  <span>€{order.fees_amount?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Impostos:</span>
                  <span>€{order.tax_amount?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Desconto:</span>
                  <span>-€{order.discount_amount?.toFixed(2) || '0.00'}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>€{order.total_amount.toFixed(2)}</span>
                </div>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Criada em:</span>
                  <span>{new Date(order.created_at).toLocaleString()}</span>
                </div>
                {order.payment_date && (
                  <div className="flex justify-between">
                    <span>Paga em:</span>
                    <span>{new Date(order.payment_date).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Método:</span>
                  <span className="capitalize">{order.payment_method || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fornecedor:</span>
                  <span className="capitalize">{order.payment_provider || 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userProfile ? (
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">{userProfile.first_name} {userProfile.last_name}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span>{userProfile.email}</span>
                    </div>
                    {userProfile.phone && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{userProfile.phone}</span>
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(`/admin/user/${userProfile.user_id}`)}
                  >
                    Ver Perfil Completo
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Informações do cliente não disponíveis</p>
              )}

              {registration && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Dados da Inscrição</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Nome:</span> {registration.participant_name}</p>
                      <p><span className="font-medium">Email:</span> {registration.participant_email}</p>
                      {registration.participant_phone && (
                        <p><span className="font-medium">Telefone:</span> {registration.participant_phone}</p>
                      )}
                      <p><span className="font-medium">Nº Inscrição:</span> {registration.registration_number}</p>
                      <p><span className="font-medium">Valor Pago:</span> €{registration.amount_paid.toFixed(2)}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Informações do Evento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Evento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {event ? (
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(event.start_date).toLocaleString()}</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <MapPin className="h-3 w-3 mt-0.5" />
                      <div>
                        <p>{event.location}</p>
                        <p className="text-muted-foreground">{event.address}</p>
                      </div>
                    </div>
                    <div>
                      <Badge variant="outline">{event.category}</Badge>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(`/evento/${event.id}`)}
                  >
                    Ver Evento
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Informações do evento não disponíveis</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Informações Técnicas */}
        {(order.stripe_payment_intent_id || order.stripe_session_id || order.notes) && (
          <Card>
            <CardHeader>
              <CardTitle>Informações Técnicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.stripe_payment_intent_id && (
                <div>
                  <p className="text-sm font-medium">Stripe Payment Intent ID:</p>
                  <p className="text-sm text-muted-foreground font-mono">{order.stripe_payment_intent_id}</p>
                </div>
              )}
              {order.stripe_session_id && (
                <div>
                  <p className="text-sm font-medium">Stripe Session ID:</p>
                  <p className="text-sm text-muted-foreground font-mono">{order.stripe_session_id}</p>
                </div>
              )}
              {order.notes && (
                <div>
                  <p className="text-sm font-medium">Notas:</p>
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </div>
              )}
              {order.metadata && Object.keys(order.metadata).length > 0 && (
                <div>
                  <p className="text-sm font-medium">Metadata:</p>
                  <pre className="text-xs text-muted-foreground bg-muted p-2 rounded overflow-auto">
                    {JSON.stringify(order.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
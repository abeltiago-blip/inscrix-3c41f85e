import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Download, Calendar, MapPin, Ticket, CreditCard } from "lucide-react";
import Footer from "@/components/Footer";

interface Registration {
  id: string;
  registration_number: string;
  amount_paid: number;
  payment_status: string;
  check_in_status: string;
  participant_name: string;
  created_at: string;
  events: {
    id: string;
    title: string;
    start_date: string;
    location: string;
    category: string;
  };
  ticket_types: {
    name: string;
  };
}

export default function MyOrders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRegistrations();
    }
  }, [user]);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          id,
          registration_number,
          amount_paid,
          payment_status,
          check_in_status,
          participant_name,
          created_at,
          events (
            id,
            title,
            start_date,
            location,
            category
          ),
          ticket_types (
            name
          )
        `)
        .eq('participant_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar inscrições",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: "secondary" as const, label: "Pendente" },
      paid: { variant: "default" as const, label: "Pago" },
      failed: { variant: "destructive" as const, label: "Falhado" },
      refunded: { variant: "outline" as const, label: "Reembolsado" }
    };
    
    const statusInfo = variants[status as keyof typeof variants] || { variant: "secondary" as const, label: status };
    
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };

  const getCheckInStatusBadge = (status: string) => {
    const variants = {
      not_checked_in: { variant: "secondary" as const, label: "Não Verificado" },
      checked_in: { variant: "default" as const, label: "Verificado" },
      no_show: { variant: "destructive" as const, label: "Não Compareceu" }
    };
    
    const statusInfo = variants[status as keyof typeof variants] || { variant: "secondary" as const, label: status };
    
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">A carregar inscrições...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Minhas Inscrições</h1>
            <p className="text-muted-foreground">
              Gerir e acompanhar as suas inscrições em eventos
            </p>
          </div>

          {registrations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16">
                <Ticket className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Nenhuma inscrição encontrada</h2>
                <p className="text-muted-foreground mb-6">
                  Ainda não se inscreveu em nenhum evento. Explore os eventos disponíveis!
                </p>
                <Button asChild>
                  <Link to="/eventos">
                    Explorar Eventos
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {registrations.map((registration) => (
                <Card key={registration.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {(registration.events as any).title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date((registration.events as any).start_date).toLocaleDateString('pt-PT')}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {(registration.events as any).location}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          #{registration.registration_number}
                        </p>
                        <p className="font-semibold">
                          €{parseFloat(registration.amount_paid.toString()).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Tipo de Bilhete</p>
                        <p className="font-medium">{(registration.ticket_types as any).name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Estado do Pagamento</p>
                        {getPaymentStatusBadge(registration.payment_status)}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Check-in</p>
                        {getCheckInStatusBadge(registration.check_in_status)}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-between">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/event/${(registration.events as any).slug || (registration.events as any).title?.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')}`}>
                            Ver Evento
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Bilhete PDF
                        </Button>
                      </div>
                      
                      {registration.payment_status === 'pending' && (
                        <Button size="sm">
                          <CreditCard className="h-4 w-4 mr-1" />
                          Pagar Agora
                        </Button>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                      <p>Inscrito a {new Date(registration.created_at).toLocaleDateString('pt-PT')} às {new Date(registration.created_at).toLocaleTimeString('pt-PT')}</p>
                      <p>Participante: {registration.participant_name}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
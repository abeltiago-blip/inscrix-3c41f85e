import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Home } from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const paymentId = searchParams.get('payment_id');
  const orderId = searchParams.get('order_id');
  const method = searchParams.get('method');
  const isTest = searchParams.get('test') === 'true';

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      if (!orderId) return;

      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          registrations (
            participant_name,
            participant_email,
            event_id,
            events (title, start_date)
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrderDetails(order);
    } catch (error) {
      console.error('Error loading order details:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-green-600">
              Pagamento Confirmado!
            </h1>
            <p className="text-muted-foreground">
              {isTest ? "Pagamento de teste processado com sucesso" : "O seu pagamento foi processado com sucesso"}
            </p>
          </div>

          {loading ? (
            <Card>
              <CardContent className="p-6">
                <p>Carregando detalhes do pedido...</p>
              </CardContent>
            </Card>
          ) : orderDetails ? (
            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Pedido</CardTitle>
                <CardDescription>
                  Pedido #{orderDetails.order_number}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Valor Total</p>
                    <p className="text-muted-foreground">€{orderDetails.total_amount}</p>
                  </div>
                  <div>
                    <p className="font-medium">Método de Pagamento</p>
                    <p className="text-muted-foreground capitalize">
                      {method || orderDetails.payment_method}
                    </p>
                  </div>
                  {paymentId && (
                    <div className="col-span-2">
                      <p className="font-medium">ID do Pagamento</p>
                      <p className="text-muted-foreground text-xs">{paymentId}</p>
                    </div>
                  )}
                </div>

                {orderDetails.registrations && (
                  <div className="pt-4 border-t">
                    <p className="font-medium mb-2">Inscrição</p>
                    <div className="text-sm text-muted-foreground">
                      <p><strong>Evento:</strong> {orderDetails.registrations.events?.title}</p>
                      <p><strong>Participante:</strong> {orderDetails.registrations.participant_name}</p>
                      <p><strong>Email:</strong> {orderDetails.registrations.participant_email}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="font-medium">Pagamento Processado</p>
                  <p className="text-sm text-muted-foreground">
                    O seu pagamento foi confirmado. Receberá um email de confirmação em breve.
                  </p>
                  {paymentId && (
                    <p className="text-xs text-muted-foreground">
                      Referência: {paymentId}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/eventos')} className="flex items-center gap-2">
              Ver Eventos
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Página Inicial
            </Button>
          </div>

          {isTest && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-700">
                <strong>Modo de Teste:</strong> Este foi um pagamento de teste. 
                Nenhuma cobrança real foi efetuada.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
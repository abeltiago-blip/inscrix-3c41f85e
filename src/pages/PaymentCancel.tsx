import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";

export default function PaymentCancel() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const paymentId = searchParams.get('payment_id');
  const orderId = searchParams.get('order_id');
  const method = searchParams.get('method');
  const reason = searchParams.get('reason');
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

  const handleRetryPayment = () => {
    if (orderDetails) {
      navigate('/checkout', { 
        state: { 
          retryOrder: orderDetails 
        } 
      });
    } else {
      navigate('/eventos');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-red-600">
              Pagamento Cancelado
            </h1>
            <p className="text-muted-foreground">
              {reason === 'user_cancelled' 
                ? "Cancelou o processo de pagamento" 
                : "O pagamento não foi concluído"}
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
                    <p className="font-medium">Status</p>
                    <p className="text-red-600 font-medium">Cancelado</p>
                  </div>
                  {method && (
                    <div className="col-span-2">
                      <p className="font-medium">Método Tentado</p>
                      <p className="text-muted-foreground capitalize">{method}</p>
                    </div>
                  )}
                </div>

                {orderDetails.registrations && (
                  <div className="pt-4 border-t">
                    <p className="font-medium mb-2">Inscrição Pendente</p>
                    <div className="text-sm text-muted-foreground">
                      <p><strong>Evento:</strong> {orderDetails.registrations.events?.title}</p>
                      <p><strong>Participante:</strong> {orderDetails.registrations.participant_name}</p>
                      <p><strong>Email:</strong> {orderDetails.registrations.participant_email}</p>
                    </div>
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-700">
                    <strong>Importante:</strong> A sua inscrição não foi confirmada. 
                    Para completar o processo, tente novamente o pagamento.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="font-medium">Pagamento Não Concluído</p>
                  <p className="text-sm text-muted-foreground">
                    O processo de pagamento foi interrompido. Pode tentar novamente quando desejar.
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
            <Button onClick={handleRetryPayment} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Tentar Novamente
            </Button>
            <Button variant="outline" onClick={() => navigate('/eventos')} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Ver Eventos
            </Button>
          </div>

          {isTest && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>Modo de Teste:</strong> Este foi um teste de pagamento. 
                Nenhuma cobrança real seria efetuada.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Download, Mail, Calendar } from "lucide-react";
import Footer from "@/components/Footer";
import EmailStatusNotification from "@/components/EmailStatusNotification";

export default function OrderReceived() {
  const location = useLocation();
  const orderData = location.state?.orderData;

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  if (!orderData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="py-8 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Pedido não encontrado</h2>
            <p className="text-muted-foreground mb-6">
              Não foi possível encontrar os dados do seu pedido.
            </p>
            <Button asChild>
              <Link to="/dashboard">Ir para Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "mbway": return "MB WAY";
      case "card": return "Cartão de Crédito/Débito";
      case "multibanco": return "Multibanco";
      case "transfer": return "Transferência Bancária";
      default: return method;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-green-700 mb-2">
              Inscrição Concluída!
            </h1>
            <p className="text-muted-foreground">
              A tua inscrição foi processada com sucesso. Receberás um email de confirmação em breve.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Detalhes da Inscrição
                </CardTitle>
                <CardDescription>
                  Número do pedido: {orderData.order?.order_number || `#REG-${Date.now().toString().slice(-6)}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {orderData.items.map((item: any) => (
                    <div key={`${item.eventId}-${item.ticketTypeId}`} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{item.eventTitle}</h4>
                          <p className="text-sm text-muted-foreground">{item.eventLocation}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.eventDate).toLocaleDateString('pt-PT')}
                          </p>
                        </div>
                        <Badge variant="secondary">{item.ticketTypeName}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Quantidade: {item.quantity}</span>
                        <span className="font-semibold">€{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <hr />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Pago</span>
                  <span>€{orderData.total.toFixed(2)}</span>
                </div>
                
                {/* Registration Info */}
                {orderData.registrations && orderData.registrations.length > 0 && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Inscrições Criadas</h4>
                    <p className="text-sm text-muted-foreground">
                      {orderData.registrations.length} inscrição(ões) processada(s) com sucesso
                    </p>
                    {orderData.registrations.map((reg: any, index: number) => (
                      <div key={reg.id} className="text-xs mt-1">
                        <Badge variant="outline" className="mr-2">
                          {reg.registration_number || `REG-${index + 1}`}
                        </Badge>
                        {reg.participant_name}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment & Next Steps */}
            <div className="space-y-6">
              {/* Email Status - apenas mostra se houver problemas ou ainda estiver processando */}
              {orderData.registrations && orderData.billingData?.email && orderData.showEmailStatus && (
                <EmailStatusNotification
                  registrationIds={orderData.registrations.map((r: any) => r.id)}
                  userEmail={orderData.billingData.email}
                />
              )}
              <Card>
                <CardHeader>
                  <CardTitle>Método de Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {getPaymentMethodLabel(orderData.paymentMethod)}
                    </Badge>
                  </div>
                  
                  {orderData.paymentMethod === "transfer" && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">Instruções para Transferência Bancária</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>IBAN:</strong> PT50 0000 0000 0000 0000 0000 0</p>
                        <p><strong>Titular:</strong> Inscrix, Lda</p>
                        <p><strong>Valor:</strong> €{orderData.total.toFixed(2)}</p>
                        <p><strong>Referência:</strong> REG{Date.now().toString().slice(-6)}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Por favor, use a referência indicada para identificar o seu pagamento.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Próximos Passos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Email de confirmação</p>
                      <p className="text-sm text-muted-foreground">
                        Receberá um email com todos os detalhes da inscrição
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Bilhete digital</p>
                      <p className="text-sm text-muted-foreground">
                        O seu bilhete estará disponível na área de cliente
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Informações do evento</p>
                      <p className="text-sm text-muted-foreground">
                        Receberá informações adicionais próximo da data do evento
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3">
                <Button asChild className="w-full">
                  <Link to="/dashboard">
                    <Download className="h-4 w-4 mr-2" />
                    Ver Minhas Inscrições
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/eventos">
                    Explorar Mais Eventos
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
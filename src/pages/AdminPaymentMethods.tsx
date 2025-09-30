import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Plus, Settings, CreditCard, Building2 } from "lucide-react";
import { handleError } from "@/utils/errorHandler";

interface PaymentMethod {
  id: string;
  name: string;
  provider: string;
  is_active: boolean;
  currency: string;
  config: any;
  created_at: string;
  updated_at: string;
}

const AdminPaymentMethods = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role !== 'admin') {
      navigate('/');
      return;
    }
    
    loadPaymentMethods();
  }, [profile, navigate]);

  const loadPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('name');

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      handleError(error, 'Load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const togglePaymentMethod = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Método de pagamento atualizado",
        description: `Método ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`,
      });

      loadPaymentMethods();
    } catch (error) {
      handleError(error, 'Toggle payment method');
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'easypay':
        return <CreditCard className="h-4 w-4" />;
      case 'bank_transfer':
        return <Building2 className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'easypay':
        return 'bg-blue-100 text-blue-800';
      case 'bank_transfer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Métodos de Pagamento</h1>
            <p className="text-muted-foreground">
              Gerir métodos de pagamento da plataforma
            </p>
          </div>
          <Button onClick={() => navigate('/admin/payment-methods/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Método
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Métodos de Pagamento Configurados</CardTitle>
            <CardDescription>
              Lista de todos os métodos de pagamento disponíveis na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Método</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Configuração</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentMethods.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getProviderIcon(method.provider)}
                        <span className="font-medium">{method.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getProviderColor(method.provider)}>
                        {method.provider.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={method.is_active ? "default" : "secondary"}>
                        {method.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {method.provider === 'easypay' && (
                        <div className="text-sm">
                          <div>
                            Account ID: {method.config?.account_id ? '✓' : '✗'}
                          </div>
                          <div>
                            API Key: {method.config?.api_key ? '✓' : '✗'}
                          </div>
                          <div>
                            Sandbox: {method.config?.sandbox ? 'Sim' : 'Não'}
                          </div>
                        </div>
                      )}
                      {method.provider === 'bank_transfer' && (
                        <div className="text-sm">
                          <div>
                            IBAN: {method.config?.iban ? '✓' : '✗'}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/payment-methods/${method.id}`)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={method.is_active ? "destructive" : "default"}
                          size="sm"
                          onClick={() => togglePaymentMethod(method.id, method.is_active)}
                        >
                          {method.is_active ? 'Desativar' : 'Ativar'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {paymentMethods.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum método de pagamento configurado</p>
                <Button 
                  className="mt-4"
                  onClick={() => navigate('/admin/payment-methods/new')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Primeiro Método
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* EasyPay Configuration Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Configuração EasyPay</CardTitle>
            <CardDescription>
              Para configurar os pagamentos EasyPay, precisa dos seguintes dados da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Conta de Teste</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• URL da API: https://api.test.easypay.pt</li>
                  <li>• Account ID (fornecido pela EasyPay)</li>
                  <li>• API Key (fornecido pela EasyPay)</li>
                  <li>• Sandbox: Ativado</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Conta de Produção</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• URL da API: https://api.easypay.pt</li>
                  <li>• Account ID (da sua conta real)</li>
                  <li>• API Key (da sua conta real)</li>
                  <li>• Sandbox: Desativado</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPaymentMethods;
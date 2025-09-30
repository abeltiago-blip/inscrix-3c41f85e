import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, CreditCard, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";

interface PaymentMethod {
  id: string;
  name: string;
  provider: string;
  is_active: boolean;
  currency: string;
  config: any; // Using any for JSON data from database
}

export default function AdminPaymentMethodEdit() {
  const { methodId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || profile?.role !== 'admin') {
      navigate("/admin");
      return;
    }
    if (methodId) {
      loadPaymentMethod();
    }
  }, [methodId, user, profile, navigate]);

  const loadPaymentMethod = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('id', methodId)
        .single();

      if (error) throw error;
      setPaymentMethod({
        ...data,
        config: data.config || {} // Ensure config is always an object
      });
    } catch (error) {
      console.error('Error loading payment method:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar método de pagamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!paymentMethod) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({
          name: paymentMethod.name,
          is_active: paymentMethod.is_active,
          currency: paymentMethod.currency,
          config: paymentMethod.config,
        })
        .eq('id', methodId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Método de pagamento atualizado com sucesso",
      });

      navigate("/admin");
    } catch (error) {
      console.error('Error updating payment method:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar método de pagamento",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof PaymentMethod, value: any) => {
    if (!paymentMethod) return;
    setPaymentMethod({ ...paymentMethod, [field]: value });
  };

  const updateConfigField = (field: string, value: any) => {
    if (!paymentMethod) return;
    setPaymentMethod({
      ...paymentMethod,
      config: { ...paymentMethod.config, [field]: value }
    });
  };

  const renderProviderConfig = () => {
    if (!paymentMethod) return null;

    switch (paymentMethod.provider) {
      case 'easypay':
        return (
          <div className="space-y-6">
            {/* Configurações Essenciais */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Credenciais de Acesso</h4>
              <div className="space-y-2">
                <Label htmlFor="account_id">Account ID *</Label>
                <Input
                  id="account_id"
                  type="text"
                  placeholder="00000000-0000-0000-0000-000000000000"
                  value={paymentMethod.config.account_id || ''}
                  onChange={(e) => updateConfigField('account_id', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  UUID fornecido pela EasyPay no seu backoffice
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="api_key">API Key *</Label>
                <Input
                  id="api_key"
                  type="password"
                  placeholder="00000000-0000-0000-0000-000000000000"
                  value={paymentMethod.config.api_key || ''}
                  onChange={(e) => updateConfigField('api_key', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Chave API gerada no backoffice da EasyPay
                </p>
              </div>
            </div>

            {/* Configurações de Ambiente */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Ambiente</h4>
              <div className="flex items-center space-x-2">
                <Switch
                  id="sandbox"
                  checked={paymentMethod.config.sandbox || false}
                  onCheckedChange={(checked) => updateConfigField('sandbox', checked)}
                />
                <Label htmlFor="sandbox">Modo Sandbox (Teste)</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Ative para testes. Desative apenas em produção.
              </p>
            </div>

            {/* URLs de Webhook e Retorno */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">URLs de Sistema</h4>
              <div className="space-y-2">
                <Label htmlFor="webhook_url">URL de Notificação (Webhook)</Label>
                <Input
                  id="webhook_url"
                  type="url"
                  placeholder="https://inscrix.pt/api/webhook/easypay"
                  value={paymentMethod.config.webhook_url || 'https://inscrix.pt/api/webhook/easypay'}
                  onChange={(e) => updateConfigField('webhook_url', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  URL onde a EasyPay enviará notificações de pagamento
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="success_url">URL de Sucesso</Label>
                <Input
                  id="success_url"
                  type="url"
                  placeholder="https://inscrix.pt/payment/success"
                  value={paymentMethod.config.success_url || 'https://inscrix.pt/payment/success'}
                  onChange={(e) => updateConfigField('success_url', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  URL para redirecionar após pagamento com sucesso
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cancel_url">URL de Cancelamento</Label>
                <Input
                  id="cancel_url"
                  type="url"
                  placeholder="https://inscrix.pt/payment/cancel"
                  value={paymentMethod.config.cancel_url || 'https://inscrix.pt/payment/cancel'}
                  onChange={(e) => updateConfigField('cancel_url', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  URL para redirecionar quando o pagamento é cancelado
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="return_url">URL de Retorno</Label>
                <Input
                  id="return_url"
                  type="url"
                  placeholder="https://inscrix.pt/order-received"
                  value={paymentMethod.config.return_url || 'https://inscrix.pt/order-received'}
                  onChange={(e) => updateConfigField('return_url', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  URL geral de retorno após processamento
                </p>
              </div>
            </div>

            {/* Configurações Avançadas */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Configurações Avançadas</h4>
              <div className="space-y-2">
                <Label htmlFor="expiration_time">Tempo de Expiração (minutos)</Label>
                <Input
                  id="expiration_time"
                  type="number"
                  min="1"
                  max="4320"
                  placeholder="1440"
                  value={paymentMethod.config.expiration_time || '1440'}
                  onChange={(e) => updateConfigField('expiration_time', parseInt(e.target.value) || 1440)}
                />
                <p className="text-xs text-muted-foreground">
                  Tempo em minutos para expiração dos pagamentos (padrão: 1440 = 24h)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max_amount">Valor Máximo (€)</Label>
                <Input
                  id="max_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="1000.00"
                  value={paymentMethod.config.max_amount || ''}
                  onChange={(e) => updateConfigField('max_amount', parseFloat(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  Valor máximo por transação
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_amount">Valor Mínimo (€)</Label>
                <Input
                  id="min_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="1.00"
                  value={paymentMethod.config.min_amount || '1.00'}
                  onChange={(e) => updateConfigField('min_amount', parseFloat(e.target.value) || 1)}
                />
                <p className="text-xs text-muted-foreground">
                  Valor mínimo por transação
                </p>
              </div>
            </div>

            {/* Métodos de Pagamento Suportados */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Métodos Suportados</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable_card"
                    checked={paymentMethod.config.enable_card !== false}
                    onCheckedChange={(checked) => updateConfigField('enable_card', checked)}
                  />
                  <Label htmlFor="enable_card" className="text-sm">Cartão</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable_mbway"
                    checked={paymentMethod.config.enable_mbway !== false}
                    onCheckedChange={(checked) => updateConfigField('enable_mbway', checked)}
                  />
                  <Label htmlFor="enable_mbway" className="text-sm">MB WAY</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable_multibanco"
                    checked={paymentMethod.config.enable_multibanco !== false}
                    onCheckedChange={(checked) => updateConfigField('enable_multibanco', checked)}
                  />
                  <Label htmlFor="enable_multibanco" className="text-sm">Multibanco</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable_paypal"
                    checked={paymentMethod.config.enable_paypal !== false}
                    onCheckedChange={(checked) => updateConfigField('enable_paypal', checked)}
                  />
                  <Label htmlFor="enable_paypal" className="text-sm">PayPal</Label>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'bank_transfer':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account_name">Nome da Conta</Label>
              <Input
                id="account_name"
                type="text"
                value={paymentMethod.config.account_name || ''}
                onChange={(e) => updateConfigField('account_name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="iban">IBAN</Label>
              <Input
                id="iban"
                type="text"
                placeholder="PT50 0000 0000 0000 0000 0000 0"
                value={paymentMethod.config.iban || ''}
                onChange={(e) => updateConfigField('iban', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="swift">Código SWIFT</Label>
              <Input
                id="swift"
                type="text"
                value={paymentMethod.config.swift || ''}
                onChange={(e) => updateConfigField('swift', e.target.value)}
              />
            </div>
          </div>
        );
      
      default:
        return <p className="text-sm text-muted-foreground">Nenhuma configuração específica necessária</p>;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  if (!paymentMethod) {
    return <div className="flex items-center justify-center min-h-screen">Método de pagamento não encontrado</div>;
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
            <h1 className="text-3xl font-bold">Configurar Método de Pagamento</h1>
            <p className="text-muted-foreground">{paymentMethod.name}</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configurações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Configurações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Método</Label>
                <Input
                  id="name"
                  value={paymentMethod.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider">Fornecedor</Label>
                <Input
                  id="provider"
                  value={paymentMethod.provider}
                  disabled
                  className="opacity-50"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={paymentMethod.is_active}
                  onCheckedChange={(checked) => updateField('is_active', checked)}
                />
                <Label htmlFor="is_active">Método Ativo</Label>
              </div>


              <div className="space-y-2">
                <Label htmlFor="currency">Moeda</Label>
                <Input
                  id="currency"
                  value={paymentMethod.currency}
                  onChange={(e) => updateField('currency', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configurações Específicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações Específicas
              </CardTitle>
              <CardDescription>
                Configure as chaves e parâmetros específicos do fornecedor
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderProviderConfig()}
            </CardContent>
          </Card>

          {/* Guia de Configuração EasyPay */}
          {paymentMethod.provider === 'easypay' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600">
                  <Shield className="h-5 w-5" />
                  Guia de Configuração EasyPay
                </CardTitle>
                <CardDescription>
                  Instruções para configurar no backoffice da EasyPay
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">1. Acesso ao Backoffice</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Aceda ao backoffice EasyPay</li>
                    <li>• Vá para "Configurações" → "API"</li>
                    <li>• Copie o Account ID e gere uma nova API Key</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">2. Configurar URLs no Backoffice EasyPay</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Vá para "Configurações" → "URLs" no backoffice</li>
                    <li>• Configure as seguintes URLs para <strong>inscrix.pt</strong>:</li>
                  </ul>
                  <div className="text-xs bg-muted p-3 rounded mt-2 space-y-1">
                    <p><strong>Webhook URL:</strong> https://inscrix.pt/api/webhook/easypay</p>
                    <p><strong>Success URL:</strong> https://inscrix.pt/payment/success</p>
                    <p><strong>Cancel URL:</strong> https://inscrix.pt/payment/cancel</p>
                    <p><strong>Return URL:</strong> https://inscrix.pt/order-received</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">3. Configurar Webhooks</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Na secção "Webhooks" do backoffice</li>
                    <li>• Adicione: <code className="bg-muted px-1 rounded">https://inscrix.pt/api/webhook/easypay</code></li>
                    <li>• Selecione eventos: payment_success, payment_failed, payment_pending</li>
                    <li>• Ative as notificações para todos os métodos</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">4. Configuração por Método de Pagamento</h4>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <p className="font-medium">Multibanco:</p>
                      <ul className="text-muted-foreground ml-4 text-xs">
                        <li>• Apenas webhook necessário (referência bancária)</li>
                        <li>• URLs de retorno não aplicáveis</li>
                      </ul>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">MB WAY:</p>
                      <ul className="text-muted-foreground ml-4 text-xs">
                        <li>• Webhook obrigatório para confirmação</li>
                        <li>• Success/Cancel URLs para mobile redirect</li>
                      </ul>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Cartão de Crédito:</p>
                      <ul className="text-muted-foreground ml-4 text-xs">
                        <li>• Success/Cancel URLs obrigatórias</li>
                        <li>• Webhook para confirmação final</li>
                      </ul>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">PayPal:</p>
                      <ul className="text-muted-foreground ml-4 text-xs">
                        <li>• URLs de retorno obrigatórias</li>
                        <li>• Webhook para sincronização</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">5. APIs e Ambientes</h4>
                  <div className="text-sm bg-muted p-3 rounded space-y-1">
                    <p><strong>Sandbox (Teste):</strong> https://api.test.easypay.pt</p>
                    <p><strong>Produção:</strong> https://api.easypay.pt</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Use sempre sandbox primeiro e teste todos os métodos antes de ativar produção
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">5. Teste de Configuração</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Use sempre o modo Sandbox primeiro</li>
                    <li>• Teste cada método de pagamento</li>
                    <li>• Verifique se os webhooks funcionam</li>
                    <li>• Só depois mude para produção</li>
                  </ul>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                  <p className="text-sm text-amber-800">
                    <strong>Importante:</strong> Mantenha as credenciais seguras e nunca as partilhe. 
                    Use sempre HTTPS em produção.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
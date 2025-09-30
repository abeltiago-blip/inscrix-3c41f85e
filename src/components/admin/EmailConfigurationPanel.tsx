import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Settings, 
  Mail, 
  Globe, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Save,
  Eye,
  EyeOff
} from "lucide-react";

interface SMTPConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
  from_email: string;
  from_name: string;
}

interface ResendConfig {
  api_key: string;
  domain: string;
  from_email: string;
  webhook_signing_secret: string;
}

interface WebhookConfig {
  easypay_webhook: string;
  stripe_webhook: string;
  success_url: string;
  cancel_url: string;
  return_url: string;
}

export default function EmailConfigurationPanel() {
  const [activeProvider, setActiveProvider] = useState<'smtp' | 'resend'>('smtp');
  const [showPasswords, setShowPasswords] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [smtpConfig, setSMTPConfig] = useState<SMTPConfig>({
    host: 'mail.inscrix.pt',
    port: 465,
    username: 'hello@inscrix.pt',
    password: '',
    secure: true,
    from_email: 'noreply@inscrix.pt',
    from_name: 'INSCRIX'
  });

  const [resendConfig, setResendConfig] = useState<ResendConfig>({
    api_key: '',
    domain: 'inscrix.pt',
    from_email: 'noreply@inscrix.pt',
    webhook_signing_secret: ''
  });

  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>({
    easypay_webhook: 'https://inscrix.pt/api/webhook/easypay',
    stripe_webhook: 'https://inscrix.pt/api/webhook/stripe',
    success_url: 'https://inscrix.pt/payment/success',
    cancel_url: 'https://inscrix.pt/payment/cancel',
    return_url: 'https://inscrix.pt/order-received'
  });

  // Carregar configurações salvas ao inicializar
  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      // Carregar provedor ativo
      const { data: activeProviderData } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'email_active_provider')
        .eq('category', 'email')
        .single();

      if (activeProviderData?.value && typeof activeProviderData.value === 'string') {
        setActiveProvider(activeProviderData.value as 'smtp' | 'resend');
      }

      // Carregar configurações SMTP
      const { data: smtpData } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'smtp_config')
        .eq('category', 'email')
        .single();

      if (smtpData?.value && typeof smtpData.value === 'object') {
        setSMTPConfig(prev => ({ ...prev, ...(smtpData.value as Partial<SMTPConfig>) }));
      }

      // Carregar configurações do Resend
      const { data: resendData } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'resend_config')
        .eq('category', 'email')
        .single();

      if (resendData?.value && typeof resendData.value === 'object') {
        setResendConfig(prev => ({ ...prev, ...(resendData.value as Partial<ResendConfig>) }));
      }

      // Carregar configurações de webhooks
      const { data: webhookData } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'webhook_config')
        .eq('category', 'email')
        .single();

      if (webhookData?.value && typeof webhookData.value === 'object') {
        setWebhookConfig(prev => ({ ...prev, ...(webhookData.value as Partial<WebhookConfig>) }));
      }
    } catch (error) {
      console.log('Primeiro carregamento de configurações - usando valores padrão');
    }
  };

  const saveConfiguration = async (type: 'smtp' | 'resend' | 'webhooks') => {
    setSaving(true);
    try {
      let config: any;
      let configKey: string;
      
      if (type === 'smtp') {
        config = smtpConfig;
        configKey = 'smtp_config';
        
        // Atualizar provedor ativo para SMTP se selecionado
        if (activeProvider === 'smtp') {
          await supabase
            .from('platform_settings')
            .upsert({
              key: 'email_active_provider',
              value: 'smtp',
              category: 'email',
              description: 'Provedor de email ativo'
            });
        }
      } else if (type === 'resend') {
        config = resendConfig;
        configKey = 'resend_config';
        
        // Atualizar provedor ativo para Resend se selecionado
        if (activeProvider === 'resend') {
          await supabase
            .from('platform_settings')
            .upsert({
              key: 'email_active_provider', 
              value: 'resend',
              category: 'email',
              description: 'Provedor de email ativo'
            });
        }
      } else {
        config = webhookConfig;
        configKey = 'webhook_config';
      }

      // Guardar configuração principal
      const { error } = await supabase
        .from('platform_settings')
        .upsert({
          key: configKey,
          value: config,
          category: 'email',
          description: `Configurações de ${type}`
        });

      if (error) throw error;

      toast({
        title: "✅ Configuração Salva",
        description: `Configurações de ${type.toUpperCase()} foram guardadas com sucesso.`,
      });

      // Recarregar para confirmar
      await loadConfigurations();
      
    } catch (error: any) {
      console.error('Erro ao salvar configuração:', error);
      toast({
        title: "❌ Erro",
        description: `Erro ao salvar configurações: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async (provider: 'smtp' | 'resend') => {
    try {
      if (provider === 'smtp') {
        // Testar conexão SMTP através da função específica
        const { error } = await supabase.functions.invoke('smtp-test-simple', {
          body: { 
            config: smtpConfig,
            test_email: 'teste@inscrix.pt' 
          }
        });

        if (error) throw error;

        toast({
          title: "✅ SMTP Conectado",
          description: `Servidor SMTP ${smtpConfig.host} está a funcionar corretamente.`,
        });
      } else if (provider === 'resend') {
        // Testar API do Resend através de função de email
        const { error } = await supabase.functions.invoke('send-template-email', {
          body: {
            recipientEmail: 'teste@inscrix.pt',
            subject: '🧪 Teste Resend API - INSCRIX',
            htmlContent: '<h2>✅ Teste bem-sucedido!</h2><p>O Resend API está configurado corretamente.</p>',
            test_mode: true,
            force_provider: 'resend',
            resend_config: resendConfig
          }
        });

        if (error) throw error;

        toast({
          title: "✅ Resend API Conectado",
          description: "API do Resend está configurado e a funcionar corretamente.",
        });
      }
    } catch (error: any) {
      console.error(`Erro no teste ${provider}:`, error);
      toast({
        title: `❌ Erro no Teste ${provider.toUpperCase()}`,
        description: error.message || `Falha ao conectar com ${provider.toUpperCase()}.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Provider Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuração do Provedor de Email
          </CardTitle>
          <CardDescription>
            Escolha e configure o provedor de email ativo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="smtp"
                name="provider"
                value="smtp"
                checked={activeProvider === 'smtp'}
                onChange={(e) => setActiveProvider('smtp')}
              />
              <label htmlFor="smtp" className="flex items-center gap-2 cursor-pointer">
                <Mail className="h-4 w-4" />
                SMTP (mail.inscrix.pt)
                {activeProvider === 'smtp' ? (
                  <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                ) : (
                  <Badge variant="secondary">Disponível</Badge>
                )}
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="resend"
                name="provider"
                value="resend"
                checked={activeProvider === 'resend'}
                onChange={(e) => setActiveProvider('resend')}
              />
              <label htmlFor="resend" className="flex items-center gap-2 cursor-pointer">
                <Globe className="h-4 w-4" />
                Resend API
                {activeProvider === 'resend' ? (
                  <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                ) : (
                  <Badge variant="secondary">Disponível</Badge>
                )}
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="email-provider" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="email-provider">Provedor Email</TabsTrigger>
          <TabsTrigger value="webhooks">URLs & Webhooks</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        {/* Email Provider Configuration */}
        <TabsContent value="email-provider" className="space-y-4">
          {activeProvider === 'smtp' ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Configuração SMTP
                </CardTitle>
                <CardDescription>
                  Configurar servidor SMTP para envio de emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-host">Servidor SMTP</Label>
                    <Input
                      id="smtp-host"
                      value={smtpConfig.host}
                      onChange={(e) => setSMTPConfig(prev => ({ ...prev, host: e.target.value }))}
                      placeholder="mail.inscrix.pt"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">Porta</Label>
                    <Input
                      id="smtp-port"
                      type="number"
                      value={smtpConfig.port}
                      onChange={(e) => setSMTPConfig(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                      placeholder="465"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-username">Utilizador</Label>
                    <Input
                      id="smtp-username"
                      value={smtpConfig.username}
                      onChange={(e) => setSMTPConfig(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="hello@inscrix.pt"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="smtp-password"
                        type={showPasswords ? "text" : "password"}
                        value={smtpConfig.password}
                        onChange={(e) => setSMTPConfig(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPasswords(!showPasswords)}
                      >
                        {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-from-email">Email Remetente</Label>
                    <Input
                      id="smtp-from-email"
                      type="email"
                      value={smtpConfig.from_email}
                      onChange={(e) => setSMTPConfig(prev => ({ ...prev, from_email: e.target.value }))}
                      placeholder="noreply@inscrix.pt"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-from-name">Nome Remetente</Label>
                    <Input
                      id="smtp-from-name"
                      value={smtpConfig.from_name}
                      onChange={(e) => setSMTPConfig(prev => ({ ...prev, from_name: e.target.value }))}
                      placeholder="INSCRIX"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="smtp-secure"
                    checked={smtpConfig.secure}
                    onCheckedChange={(checked) => setSMTPConfig(prev => ({ ...prev, secure: checked }))}
                  />
                  <Label htmlFor="smtp-secure">Usar SSL/TLS (Recomendado)</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={() => saveConfiguration('smtp')} 
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Guardando..." : "Guardar SMTP"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => testConnection('smtp')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Testar Conexão
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Configuração Resend
                </CardTitle>
                <CardDescription>
                  Configurar Resend API para envio de emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resend-api-key">API Key</Label>
                  <div className="relative">
                    <Input
                      id="resend-api-key"
                      type={showPasswords ? "text" : "password"}
                      value={resendConfig.api_key}
                      onChange={(e) => setResendConfig(prev => ({ ...prev, api_key: e.target.value }))}
                      placeholder="re_••••••••••••••••••••••••••••••••"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords(!showPasswords)}
                    >
                      {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="resend-domain">Domínio Verificado</Label>
                    <Input
                      id="resend-domain"
                      value={resendConfig.domain}
                      onChange={(e) => setResendConfig(prev => ({ ...prev, domain: e.target.value }))}
                      placeholder="inscrix.pt"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resend-from-email">Email Remetente</Label>
                    <Input
                      id="resend-from-email"
                      type="email"
                      value={resendConfig.from_email}
                      onChange={(e) => setResendConfig(prev => ({ ...prev, from_email: e.target.value }))}
                      placeholder="noreply@inscrix.pt"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resend-webhook-secret">Webhook Signing Secret</Label>
                  <Input
                    id="resend-webhook-secret"
                    type="password"
                    value={resendConfig.webhook_signing_secret}
                    onChange={(e) => setResendConfig(prev => ({ ...prev, webhook_signing_secret: e.target.value }))}
                    placeholder="whsec_••••••••••••••••••••••••••••••••"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={() => saveConfiguration('resend')} 
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Guardando..." : "Guardar Resend"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => testConnection('resend')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Testar API
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Webhooks Configuration */}
        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>URLs e Webhooks</CardTitle>
              <CardDescription>
                Configurar URLs de retorno e webhooks para pagamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="easypay-webhook">Webhook EasyPay</Label>
                  <Input
                    id="easypay-webhook"
                    value={webhookConfig.easypay_webhook}
                    onChange={(e) => setWebhookConfig(prev => ({ ...prev, easypay_webhook: e.target.value }))}
                    placeholder="https://inscrix.pt/api/webhook/easypay"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stripe-webhook">Webhook Stripe</Label>
                  <Input
                    id="stripe-webhook"
                    value={webhookConfig.stripe_webhook}
                    onChange={(e) => setWebhookConfig(prev => ({ ...prev, stripe_webhook: e.target.value }))}
                    placeholder="https://inscrix.pt/api/webhook/stripe"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="success-url">Success URL</Label>
                    <Input
                      id="success-url"
                      value={webhookConfig.success_url}
                      onChange={(e) => setWebhookConfig(prev => ({ ...prev, success_url: e.target.value }))}
                      placeholder="https://inscrix.pt/payment/success"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cancel-url">Cancel URL</Label>
                    <Input
                      id="cancel-url"
                      value={webhookConfig.cancel_url}
                      onChange={(e) => setWebhookConfig(prev => ({ ...prev, cancel_url: e.target.value }))}
                      placeholder="https://inscrix.pt/payment/cancel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="return-url">Return URL</Label>
                    <Input
                      id="return-url"
                      value={webhookConfig.return_url}
                      onChange={(e) => setWebhookConfig(prev => ({ ...prev, return_url: e.target.value }))}
                      placeholder="https://inscrix.pt/order-received"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">💡 Instruções de Configuração</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p><strong>EasyPay:</strong> Configure estas URLs no backoffice da EasyPay</p>
                    <p><strong>Stripe:</strong> Configure o webhook no dashboard do Stripe</p>
                    <p><strong>DNS:</strong> Certifique-se de que o domínio inscrix.pt aponta corretamente</p>
                  </div>
                </div>

                <Button 
                  onClick={() => saveConfiguration('webhooks')} 
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Guardando..." : "Guardar URLs"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Configuration */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações de Segurança
              </CardTitle>
              <CardDescription>
                Configurar políticas de segurança e limitações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Rate Limiting</Label>
                    <p className="text-sm text-muted-foreground">
                      Limitar número de emails por hora
                    </p>
                  </div>
                  <Input className="w-24" placeholder="1000" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Retry Attempts</Label>
                    <p className="text-sm text-muted-foreground">
                      Tentativas de reenvio para emails falhados
                    </p>
                  </div>
                  <Input className="w-24" placeholder="3" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Bounce Handling</Label>
                    <p className="text-sm text-muted-foreground">
                      Processar emails devolvidos automaticamente
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Validation</Label>
                    <p className="text-sm text-muted-foreground">
                      Validar emails antes de envio
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>DKIM Signing</Label>
                    <p className="text-sm text-muted-foreground">
                      Assinar emails com DKIM
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Button className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Guardar Configurações de Segurança
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Mail, Settings, TestTube, Activity, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { SMTPTester } from '@/components/SMTPTester';
import AuthEmailTester from '@/components/AuthEmailTester';
import { FinalEmailTest } from '@/components/FinalEmailTest';
import EmailStatusNotification from '@/components/EmailStatusNotification';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmailStats {
  totalSent: number;
  totalPending: number;
  totalFailed: number;
  sentToday: number;
  successRate: number;
}

interface EmailProviderStatus {
  resend: boolean;
  smtp: boolean;
}

const AdminEmailTest = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [emailStats, setEmailStats] = useState<EmailStats>({
    totalSent: 0,
    totalPending: 0,
    totalFailed: 0,
    sentToday: 0,
    successRate: 0
  });
  
  const [providerStatus, setProviderStatus] = useState<EmailProviderStatus>({
    resend: false,
    smtp: false
  });
  
  const [loading, setLoading] = useState(true);
  const [testingProviders, setTestingProviders] = useState(false);

  // Verificar se é admin
  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
              <p className="text-muted-foreground mb-6">
                Apenas administradores podem aceder a esta página.
              </p>
              <Button onClick={() => navigate('/')}>
                Voltar ao Início
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadEmailStats();
    testProviders();
  }, []);

  const loadEmailStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: logs, error } = await supabase
        .from('email_logs')
        .select('status, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const totalSent = logs?.filter(log => log.status === 'sent').length || 0;
      const totalPending = logs?.filter(log => log.status === 'pending').length || 0;
      const totalFailed = logs?.filter(log => log.status === 'failed').length || 0;
      const sentToday = logs?.filter(log => 
        log.status === 'sent' && 
        log.created_at.startsWith(today)
      ).length || 0;

      const total = totalSent + totalFailed;
      const successRate = total > 0 ? (totalSent / total) * 100 : 0;

      setEmailStats({
        totalSent,
        totalPending, 
        totalFailed,
        sentToday,
        successRate: Math.round(successRate)
      });

    } catch (error) {
      console.error('Erro ao carregar estatísticas de email:', error);
    } finally {
      setLoading(false);
    }
  };

  const testProviders = async () => {
    setTestingProviders(true);
    
    try {
      // Test Resend
      const { data: resendTest } = await supabase.functions.invoke('send-template-email', {
        body: {
          templateKey: 'test',
          recipient: 'test@example.com',
          variables: { test: true },
          provider: 'resend'
        }
      });

      // Test SMTP
      const { data: smtpTest } = await supabase.functions.invoke('smtp-test-simple', {
        body: {
          testEmail: 'test@example.com'
        }
      });

      setProviderStatus({
        resend: resendTest?.success || false,
        smtp: smtpTest?.success || false
      });

    } catch (error) {
      console.error('Erro ao testar providers:', error);
      setProviderStatus({ resend: false, smtp: false });
    } finally {
      setTestingProviders(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Admin
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Centro de Testes de Email</h1>
            <p className="text-muted-foreground">
              Sistema completo de testes e monitorização de emails
            </p>
          </div>
        </div>

        {/* Email Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Enviados</p>
                  <p className="text-2xl font-bold text-green-600">{emailStats.totalSent}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-600">{emailStats.totalPending}</p>
                </div>
                <RefreshCw className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Falhados</p>
                  <p className="text-2xl font-bold text-red-600">{emailStats.totalFailed}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Hoje</p>
                  <p className="text-2xl font-bold">{emailStats.sentToday}</p>
                </div>
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taxa Sucesso</p>
                  <p className="text-2xl font-bold">{emailStats.successRate}%</p>
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Provider Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Status dos Provedores de Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Badge 
                  variant={providerStatus.resend ? "default" : "destructive"}
                  className="flex items-center gap-1"
                >
                  {providerStatus.resend ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  Resend
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={providerStatus.smtp ? "default" : "destructive"}
                  className="flex items-center gap-1"
                >
                  {providerStatus.smtp ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  SMTP
                </Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={testProviders}
                disabled={testingProviders}
              >
                {testingProviders ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <TestTube className="h-4 w-4 mr-2" />}
                Testar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Tabs */}
        <Tabs defaultValue="smtp" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="smtp">SMTP Test</TabsTrigger>
            <TabsTrigger value="auth">Auth Emails</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="monitoring">Monitorização</TabsTrigger>
          </TabsList>

          <TabsContent value="smtp" className="space-y-6">
            <SMTPTester />
          </TabsContent>

          <TabsContent value="auth" className="space-y-6">
            <AuthEmailTester />
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <FinalEmailTest />
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <EmailStatusNotification 
              registrationIds={[]} 
              userEmail="admin@example.com" 
            />
          </TabsContent>
        </Tabs>

        {/* Troubleshooting Information */}
        <Card className="bg-blue-50 border border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">💡 Informações de Troubleshooting</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700 space-y-2">
            <h4 className="font-semibold">Problemas Comuns:</h4>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Verificar se o domínio está validado no Resend</li>
              <li>Confirmar configurações SMTP nos secrets do Supabase</li>
              <li>Verificar limites de rate limiting dos provedores</li>
              <li>Confirmar que os templates estão ativos na base de dados</li>
            </ul>
            
            <h4 className="font-semibold mt-4">Links Úteis:</h4>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><a href="https://resend.com/domains" className="underline" target="_blank" rel="noopener noreferrer">Validação de Domínio Resend</a></li>
              <li><a href="https://resend.com/api-keys" className="underline" target="_blank" rel="noopener noreferrer">API Keys Resend</a></li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminEmailTest;
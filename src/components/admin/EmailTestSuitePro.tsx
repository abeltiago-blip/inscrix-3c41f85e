import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Send, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Settings, 
  AlertCircle,
  TestTube,
  Activity,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface TestResult {
  type: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  timestamp: Date;
  details?: any;
}

interface EmailTemplate {
  id: string;
  name: string;
  template_key: string;
  subject_template: string;
  variables: any;
}

const EmailTestSuitePro = () => {
  const { toast } = useToast();
  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customContent, setCustomContent] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data: templatesData, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTemplates(templatesData || []);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    }
  };

  const addResult = (type: string, status: 'success' | 'error' | 'pending', message: string, details?: any) => {
    const result: TestResult = {
      type,
      status,
      message,
      timestamp: new Date(),
      details
    };
    setResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const testSMTPConnection = async () => {
    addResult('SMTP Connection', 'pending', 'Testando conexão SMTP...');
    
    try {
      const { data, error } = await supabase.functions.invoke('smtp-test-simple', {
        body: { testEmail }
      });

      if (error) throw error;

      if (data.success) {
        addResult('SMTP Connection', 'success', 'Conexão SMTP funcionando corretamente', data.details);
      } else {
        addResult('SMTP Connection', 'error', data.error || 'Falha na conexão SMTP');
      }
    } catch (error: any) {
      addResult('SMTP Connection', 'error', error.message || 'Erro ao testar SMTP');
    }
  };

  const testResendConnection = async () => {
    addResult('Resend Connection', 'pending', 'Testando Resend API...');
    
    try {
      const { data, error } = await supabase.functions.invoke('send-template-email', {
        body: {
          templateKey: 'test',
          recipient: testEmail,
          variables: { test: true, testMessage: 'Teste da API Resend' },
          provider: 'resend'
        }
      });

      if (error) throw error;

      if (data.success) {
        addResult('Resend Connection', 'success', 'API Resend funcionando corretamente');
      } else {
        addResult('Resend Connection', 'error', data.error || 'Falha na API Resend');
      }
    } catch (error: any) {
      addResult('Resend Connection', 'error', error.message || 'Erro ao testar Resend');
    }
  };

  const testTemplate = async () => {
    if (!selectedTemplate) {
      toast({
        title: "Erro",
        description: "Por favor selecione um template",
        variant: "destructive",
      });
      return;
    }

    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    addResult('Template Test', 'pending', `Testando template: ${template.name}...`);

    try {
      // Prepare sample variables
      const sampleVariables: any = {};
      if (template.variables && Array.isArray(template.variables)) {
        template.variables.forEach(variable => {
          switch (variable) {
            case 'firstName':
              sampleVariables.firstName = 'João';
              break;
            case 'eventTitle':
              sampleVariables.eventTitle = 'Evento de Teste INSCRIX';
              break;
            case 'eventDate':
              sampleVariables.eventDate = '25 de Dezembro de 2024';
              break;
            case 'registrationNumber':
              sampleVariables.registrationNumber = 'REG-2024-001234';
              break;
            case 'ticketNumber':
              sampleVariables.ticketNumber = 'TKT-2024-001234';
              break;
            default:
              sampleVariables[variable] = `Valor de teste para ${variable}`;
          }
        });
      }

      const { data, error } = await supabase.functions.invoke('send-template-email', {
        body: {
          templateKey: template.template_key,
          recipient: testEmail,
          variables: sampleVariables
        }
      });

      if (error) throw error;

      if (data.success) {
        addResult('Template Test', 'success', `Template "${template.name}" enviado com sucesso`);
      } else {
        addResult('Template Test', 'error', data.error || 'Falha ao enviar template');
      }
    } catch (error: any) {
      addResult('Template Test', 'error', error.message || 'Erro ao testar template');
    }
  };

  const testCustomEmail = async () => {
    if (!customSubject || !customContent) {
      toast({
        title: "Erro",
        description: "Por favor preencha assunto e conteúdo",
        variant: "destructive",
      });
      return;
    }

    addResult('Custom Email', 'pending', 'Enviando email personalizado...');

    try {
      const { data, error } = await supabase.functions.invoke('send-template-email', {
        body: {
          recipient: testEmail,
          subject: customSubject,
          htmlContent: customContent,
          variables: {}
        }
      });

      if (error) throw error;

      if (data.success) {
        addResult('Custom Email', 'success', 'Email personalizado enviado com sucesso');
      } else {
        addResult('Custom Email', 'error', data.error || 'Falha ao enviar email personalizado');
      }
    } catch (error: any) {
      addResult('Custom Email', 'error', error.message || 'Erro ao enviar email personalizado');
    }
  };

  const runFullTestSuite = async () => {
    if (!testEmail) {
      toast({
        title: "Erro",
        description: "Por favor insira um email para teste",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    
    try {
      addResult('Full Suite', 'pending', 'Iniciando suite completa de testes...');

      // Test SMTP
      await testSMTPConnection();
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Test Resend
      await testResendConnection();
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Test a template if available
      if (templates.length > 0) {
        setSelectedTemplate(templates[0].id);
        await testTemplate();
      }

      addResult('Full Suite', 'success', 'Suite completa de testes concluída');
      
      toast({
        title: "Testes Concluídos",
        description: "Suite completa de testes executada com sucesso",
      });

    } catch (error: any) {
      addResult('Full Suite', 'error', error.message || 'Erro na suite de testes');
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-600">Sucesso</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'pending':
        return <Badge variant="secondary">Processando</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Suite Profissional de Testes de Email
          </CardTitle>
          <CardDescription>
            Sistema abrangente para testar todas as funcionalidades de email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="test-email">Email para Testes *</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="seu-email@exemplo.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={runFullTestSuite} 
                disabled={testing || !testEmail}
                className="w-full"
              >
                {testing ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                Executar Suite Completa
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="individual" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="individual">Testes Individuais</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="custom">Email Personalizado</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Teste SMTP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Testa a conectividade e configuração do servidor SMTP
                </p>
                <Button onClick={testSMTPConnection} disabled={!testEmail}>
                  <Mail className="h-4 w-4 mr-2" />
                  Testar SMTP
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Teste Resend API
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Verifica a funcionalidade da API do Resend
                </p>
                <Button onClick={testResendConnection} disabled={!testEmail}>
                  <Send className="h-4 w-4 mr-2" />
                  Testar Resend
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Teste de Templates</CardTitle>
              <CardDescription>
                Selecione um template para testar com dados de exemplo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template-select">Template</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} ({template.template_key})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTemplate && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Assunto:</strong> {templates.find(t => t.id === selectedTemplate)?.subject_template}
                  </p>
                  <p className="text-sm">
                    <strong>Variáveis:</strong> {templates.find(t => t.id === selectedTemplate)?.variables?.join(', ') || 'Nenhuma'}
                  </p>
                </div>
              )}

              <Button onClick={testTemplate} disabled={!selectedTemplate || !testEmail}>
                <TestTube className="h-4 w-4 mr-2" />
                Testar Template
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Personalizado</CardTitle>
              <CardDescription>
                Envie um email com conteúdo personalizado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-subject">Assunto</Label>
                <Input
                  id="custom-subject"
                  placeholder="Assunto do email de teste..."
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-content">Conteúdo HTML</Label>
                <Textarea
                  id="custom-content"
                  placeholder="<h1>Olá!</h1><p>Este é um email de teste.</p>"
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  rows={8}
                />
              </div>

              <Button 
                onClick={testCustomEmail} 
                disabled={!customSubject || !customContent || !testEmail}
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar Email Personalizado
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Resultados dos Testes</span>
                <Button variant="outline" size="sm" onClick={() => setResults([])}>
                  Limpar Resultados
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <div className="text-center py-8">
                  <TestTube className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum teste executado ainda.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((result, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{result.type}</span>
                          {getStatusBadge(result.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{result.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {result.timestamp.toLocaleString('pt-PT')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailTestSuitePro;
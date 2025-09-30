import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  TestTube, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Mail, 
  Zap,
  Eye,
  Play,
  RefreshCw
} from "lucide-react";

interface TestResult {
  id: string;
  type: string;
  status: 'success' | 'failed' | 'pending';
  message: string;
  timestamp: Date;
  details?: any;
}

export default function EmailTestSuite() {
  const [testEmail, setTestEmail] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const { toast } = useToast();

  // Load templates on component mount
  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const addResult = (type: string, status: 'success' | 'failed' | 'pending', message: string, details?: any) => {
    const result: TestResult = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      status,
      message,
      timestamp: new Date(),
      details
    };
    setResults(prev => [result, ...prev.slice(0, 9)]);
  };

  const testSMTPConnection = async () => {
    setTesting(true);
    addResult('SMTP Connection', 'pending', 'Testando conexão SMTP...');
    
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: Teste demorou mais de 30 segundos')), 30000);
      });

      // Call the dedicated SMTP test function
      const testPromise = supabase.functions.invoke('smtp-test-simple', {
        body: { testEmail }
      });

      // Race between the test and timeout
      const { data, error } = await Promise.race([testPromise, timeoutPromise]) as any;

      if (error) throw new Error(error.message);

      if (data?.success) {
        addResult('SMTP Connection', 'success', `Email de teste enviado para ${testEmail}`);
        toast({
          title: "Teste SMTP Bem-Sucedido", 
          description: "Conexão SMTP funcionando corretamente!",
        });
      } else {
        throw new Error(data?.error || 'Erro desconhecido no teste SMTP');
      }

    } catch (error: any) {
      addResult('SMTP Connection', 'failed', `Erro: ${error.message}`);
      toast({
        title: "Erro no Teste SMTP",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const testTemplate = async () => {
    if (!selectedTemplate) {
      toast({
        title: "Erro",
        description: "Selecione um template para testar",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    const template = templates.find(t => t.id === selectedTemplate);
    addResult('Template Test', 'pending', `Testando template: ${template?.name}`);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-template-email', {
        body: {
          templateKey: template.template_key,
          recipientEmail: testEmail,
          variables: {
            participant_name: 'João Teste',
            event_title: 'Evento de Teste',
            event_date: new Date().toLocaleDateString('pt-PT'),
            event_location: 'Local de Teste',
            registration_number: 'REG-TEST-001',
            currentDate: new Date().toLocaleString('pt-PT')
          }
        }
      });

      if (error) throw new Error(error.message);

      addResult('Template Test', 'success', `Template "${template.name}" testado com sucesso`);
      toast({
        title: "Template Testado",
        description: `Email usando template "${template.name}" enviado!`,
      });

    } catch (error: any) {
      addResult('Template Test', 'failed', `Erro no template: ${error.message}`);
      toast({
        title: "Erro no Teste de Template",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const testCustomEmail = async () => {
    if (!customSubject || !customContent) {
      toast({
        title: "Erro",
        description: "Preencha o assunto e conteúdo do email personalizado",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    addResult('Custom Email', 'pending', 'Enviando email personalizado...');
    
    try {
      const { data, error } = await supabase.functions.invoke('send-template-email', {
        body: {
          templateKey: 'custom_test',
          recipientEmail: testEmail,
          customSubject: customSubject,
          customHtml: customContent,
          variables: {
            currentDate: new Date().toLocaleString('pt-PT')
          }
        }
      });

      if (error) throw new Error(error.message);

      addResult('Custom Email', 'success', 'Email personalizado enviado com sucesso');
      toast({
        title: "Email Personalizado Enviado",
        description: "Email com conteúdo personalizado enviado!",
      });

    } catch (error: any) {
      addResult('Custom Email', 'failed', `Erro: ${error.message}`);
      toast({
        title: "Erro no Email Personalizado",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const runFullTestSuite = async () => {
    if (!testEmail) {
      toast({
        title: "Erro",
        description: "Insira um email de teste válido",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    setResults([]);
    addResult('Full Suite', 'pending', 'Iniciando suite completa de testes...');

    // Test SMTP Connection
    await testSMTPConnection();
    
    // Test first active template if available
    if (templates.length > 0) {
      setSelectedTemplate(templates[0].id);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
      await testTemplate();
    }

    addResult('Full Suite', 'success', 'Suite de testes completa!');
    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <TestTube className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Sucesso</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Falhado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Testando</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Configuração de Teste
          </CardTitle>
          <CardDescription>
            Configure o email de destino para os testes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="test-email">Email de Teste</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="seu.email@exemplo.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            <Button 
              onClick={runFullTestSuite}
              disabled={testing || !testEmail}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Zap className="h-4 w-4 mr-2" />
              Suite Completa
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="smtp" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="smtp">SMTP</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="custom">Personalizado</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
        </TabsList>

        {/* SMTP Test */}
        <TabsContent value="smtp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Teste de Conexão SMTP
              </CardTitle>
              <CardDescription>
                Testar a conectividade e autenticação do servidor SMTP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">ℹ️ Configuração Atual:</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Servidor:</strong> mail.inscrix.pt</p>
                  <p><strong>Porta:</strong> 465 (SSL/TLS)</p>
                  <p><strong>Utilizador:</strong> hello@inscrix.pt</p>
                  <p><strong>Encriptação:</strong> SSL/TLS</p>
                </div>
              </div>

              <Button 
                onClick={testSMTPConnection}
                disabled={testing || !testEmail}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {testing ? "Testando..." : "Testar Conexão SMTP"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Template Test */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Teste de Templates
              </CardTitle>
              <CardDescription>
                Testar templates específicos com dados de exemplo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template-select">Selecionar Template</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um template para testar" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          <span>{template.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTemplate && (
                <div className="bg-gray-50 border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Variáveis de Teste:</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>participant_name:</strong> João Teste</p>
                    <p><strong>event_title:</strong> Evento de Teste</p>
                    <p><strong>event_date:</strong> {new Date().toLocaleDateString('pt-PT')}</p>
                    <p><strong>registration_number:</strong> REG-TEST-001</p>
                  </div>
                </div>
              )}

              <Button 
                onClick={testTemplate}
                disabled={testing || !testEmail || !selectedTemplate}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                {testing ? "Testando..." : "Testar Template"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Email Test */}
        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Personalizado
              </CardTitle>
              <CardDescription>
                Criar e testar um email com conteúdo personalizado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-subject">Assunto</Label>
                <Input
                  id="custom-subject"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Assunto do email de teste"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-content">Conteúdo HTML</Label>
                <Textarea
                  id="custom-content"
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  placeholder="<h1>Olá!</h1><p>Este é um email de teste personalizado.</p>"
                  rows={8}
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">💡 Dica:</h4>
                <p className="text-sm text-yellow-700">
                  Use HTML válido para o conteúdo. Pode incluir variáveis como {`{{currentDate}}`} que serão substituídas automaticamente.
                </p>
              </div>

              <Button 
                onClick={testCustomEmail}
                disabled={testing || !testEmail || !customSubject || !customContent}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {testing ? "Enviando..." : "Enviar Email Personalizado"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results */}
        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Resultados dos Testes</CardTitle>
                <CardDescription>
                  Histórico dos últimos testes realizados
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setResults([])}
              >
                Limpar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.length > 0 ? (
                  results.map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{result.type}</span>
                            {getStatusBadge(result.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {result.message}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {result.timestamp.toLocaleTimeString('pt-PT')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum teste realizado ainda</p>
                    <p className="text-sm">Execute testes para ver os resultados aqui</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
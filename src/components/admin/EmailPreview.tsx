import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, Tablet, Eye, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmailPreviewProps {
  subject: string;
  htmlContent: string;
  variables: string[];
  onTestSend?: (testData: Record<string, string>) => void;
  isLoading?: boolean;
}

const EmailPreview = ({ subject, htmlContent, variables, onTestSend, isLoading }: EmailPreviewProps) => {
  const [deviceType, setDeviceType] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [testData, setTestData] = useState<Record<string, string>>({});
  const [showTestPanel, setShowTestPanel] = useState(false);

  // Dados de exemplo para variáveis comuns
  const defaultSampleData: Record<string, string> = {
    'first_name': 'João',
    'last_name': 'Silva',
    'email': 'joao.silva@exemplo.com',
    'event_title': 'Maratona do Porto 2024',
    'event_date': '15 de Março, 2024',
    'registration_number': 'REG-2024-001234',
    'participant_name': 'João Silva',
    'amount': '€45,00',
    'bib_number': '1234',
    'event_location': 'Porto, Portugal',
    'organizer_name': 'Clube Desportivo Porto',
    'confirmation_url': 'https://inscrix.pt/confirmar/abc123',
    'login_url': 'https://inscrix.pt/entrar',
    'event_url': 'https://inscrix.pt/eventos/maratona-porto-2024'
  };

  const getCurrentTestData = () => {
    const finalData = { ...defaultSampleData };
    
    // Override with custom test data
    Object.keys(testData).forEach(key => {
      if (testData[key]) {
        finalData[key] = testData[key];
      }
    });

    return finalData;
  };

  const renderTemplate = (template: string, data: Record<string, string>) => {
    let rendered = template;
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      rendered = rendered.replace(regex, data[key] || `{{${key}}}`);
    });
    return rendered;
  };

  const currentData = getCurrentTestData();
  const renderedSubject = renderTemplate(subject, currentData);
  const renderedHtml = renderTemplate(htmlContent, currentData);

  const deviceSizes = {
    desktop: 'w-full max-w-4xl',
    tablet: 'w-full max-w-2xl', 
    mobile: 'w-full max-w-sm'
  };

  const handleTestSend = () => {
    if (onTestSend) {
      onTestSend(currentData);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label>Pré-visualização:</Label>
          <div className="flex items-center gap-1 bg-muted rounded-md p-1">
            <Button
              variant={deviceType === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDeviceType('desktop')}
              className="h-8 px-2"
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={deviceType === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDeviceType('tablet')}
              className="h-8 px-2"
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={deviceType === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDeviceType('mobile')}
              className="h-8 px-2"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTestPanel(!showTestPanel)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showTestPanel ? 'Ocultar' : 'Personalizar'} Dados
          </Button>
          {onTestSend && (
            <Button
              variant="default"
              size="sm"
              onClick={handleTestSend}
              disabled={isLoading}
            >
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? 'Enviando...' : 'Testar Envio'}
            </Button>
          )}
        </div>
      </div>

      {/* Test Data Panel */}
      {showTestPanel && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Dados de Teste</CardTitle>
            <CardDescription className="text-xs">
              Personalizem os valores das variáveis para testar o modelo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {variables.map((variable) => (
                <div key={variable} className="space-y-1">
                  <Label className="text-xs font-medium">{variable}</Label>
                  <Input
                    placeholder={defaultSampleData[variable] || `Valor para ${variable}`}
                    value={testData[variable] || ''}
                    onChange={(e) => setTestData(prev => ({ ...prev, [variable]: e.target.value }))}
                    className="h-8 text-xs"
                  />
                </div>
              ))}
            </div>
            {variables.length === 0 && (
              <p className="text-xs text-muted-foreground">Nenhuma variável detectada no modelo</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Email Preview */}
      <div className="flex justify-center">
        <div className={cn(deviceSizes[deviceType], "transition-all duration-300")}>
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <span>Pré-visualização do Email</span>
              </div>
              
              {/* Email Header */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Para:</span>
                  <span>{currentData.email || 'destinatario@exemplo.com'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">De:</span>
                  <span>naoresponder@inscrix.pt</span>
                </div>
                <div className="border-b border-muted"></div>
                <div className="font-medium text-sm">
                  {renderedSubject || 'Assunto do email'}
                </div>
                <div className="border-b border-muted"></div>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              {/* Email Content */}
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: renderedHtml || '<p class="text-muted-foreground">O conteúdo HTML aparecerá aqui...</p>' 
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Variables Summary */}
      {variables.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Variáveis Utilizadas ({variables.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {variables.map((variable) => (
                <Badge key={variable} variant="outline" className="text-xs">
                  {variable}: {currentData[variable] || 'não definido'}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmailPreview;
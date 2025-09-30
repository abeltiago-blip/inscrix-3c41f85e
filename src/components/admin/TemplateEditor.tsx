import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Code, 
  Type, 
  Eye, 
  Copy, 
  Plus, 
  Sparkles,
  FileText,
  Mail
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TemplateEditorProps {
  formData: {
    template_key: string;
    name: string;
    description: string;
    subject_template: string;
    html_template: string;
    variables: string[];
    category: string;
    is_active: boolean;
  };
  onChange: (data: any) => void;
  isEditing?: boolean;
}

const TemplateEditor = ({ formData, onChange, isEditing = false }: TemplateEditorProps) => {
  const [activeTab, setActiveTab] = useState<'html' | 'text'>('html');
  const { toast } = useToast();

  const extractVariables = (text: string): string[] => {
    const regex = /{{([^}]+)}}/g;
    const variables = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      const variable = match[1].trim();
      if (!variables.includes(variable)) {
        variables.push(variable);
      }
    }
    return variables;
  };

  const allVariables = [
    ...extractVariables(formData.subject_template),
    ...extractVariables(formData.html_template)
  ].filter((v, i, arr) => arr.indexOf(v) === i);

  const commonVariables = [
    'first_name', 'last_name', 'email', 'participant_name',
    'event_title', 'event_date', 'event_location', 'registration_number',
    'bib_number', 'amount', 'organizer_name', 'confirmation_url',
    'login_url', 'event_url'
  ];

  const insertVariable = (variable: string, field: 'subject' | 'html') => {
    const variableTag = `{{${variable}}}`;
    
    if (field === 'subject') {
      const newValue = formData.subject_template + ' ' + variableTag;
      onChange({ ...formData, subject_template: newValue });
    } else {
      const newValue = formData.html_template + variableTag;
      onChange({ ...formData, html_template: newValue });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Conteúdo copiado para o clipboard",
    });
  };

  const generateBasicHtmlTemplate = () => {
    const basicTemplate = `<!DOCTYPE html>
<html lang="pt-PT">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{event_title}}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; }
        .footer { background: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
        .button { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        .highlight { background: #e7f3ff; padding: 10px; border-left: 4px solid #007bff; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{event_title}}</h1>
        <p>Informações importantes sobre o vosso evento</p>
    </div>
    
    <div class="content">
        <h2>Olá, {{first_name}}!</h2>
        
        <p>Obrigado pela vossa inscrição no evento <strong>{{event_title}}</strong>.</p>
        
        <div class="highlight">
            <h3>Detalhes do Evento:</h3>
            <p><strong>Data:</strong> {{event_date}}</p>
            <p><strong>Local:</strong> {{event_location}}</p>
            <p><strong>Número de Inscrição:</strong> {{registration_number}}</p>
        </div>
        
        <p>Podem consultar mais informações sobre o evento através da ligação abaixo:</p>
        
        <a href="{{event_url}}" class="button">Ver Evento</a>
        
        <p>Se tiverem alguma questão, não hesitem em contactar-nos.</p>
        
        <p>Obrigado,<br>
        Equipa INSCRIX</p>
    </div>
    
    <div class="footer">
        <p>&copy; 2024 INSCRIX. Todos os direitos reservados.</p>
        <p><a href="https://inscrix.pt" style="color: #ccc;">inscrix.pt</a></p>
    </div>
</body>
</html>`;

    onChange({ ...formData, html_template: basicTemplate });
    toast({
      title: "Modelo gerado!",
      description: "O modelo HTML básico foi inserido. Podem agora personalizar conforme necessário.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template_key">Chave do Template *</Label>
              <Input
                id="template_key"
                value={formData.template_key}
                onChange={(e) => onChange({ ...formData, template_key: e.target.value })}
                placeholder="ex: welcome_email"
                disabled={isEditing}
              />
              <p className="text-xs text-muted-foreground">
                Identificador único (não pode ser alterado após a criação)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onChange({ ...formData, name: e.target.value })}
                placeholder="Nome descritivo do modelo"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => onChange({ ...formData, description: e.target.value })}
              placeholder="Descrição do propósito e uso do modelo"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => onChange({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="authentication">Autenticação</SelectItem>
                  <SelectItem value="registration">Inscrições</SelectItem>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                  <SelectItem value="newsletter">Newsletter</SelectItem>
                  <SelectItem value="event_management">Gestão de Eventos</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="results">Resultados</SelectItem>
                  <SelectItem value="financial">Financeiro</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => onChange({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Modelo Activo</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject Line */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Assunto do Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="subject_template">Linha de Assunto *</Label>
            <div className="flex gap-2">
              <Input
                id="subject_template"
                value={formData.subject_template}
                onChange={(e) => onChange({ ...formData, subject_template: e.target.value })}
                placeholder="Assunto do email (usem {{variavel}} para conteúdo dinâmico)"
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(formData.subject_template)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Variables for Subject */}
          <div className="space-y-2">
            <Label className="text-sm">Variáveis Frequentes:</Label>
            <div className="flex flex-wrap gap-1">
              {['event_title', 'first_name', 'registration_number'].map((variable) => (
                <Button
                  key={variable}
                  variant="outline"
                  size="sm"
                  onClick={() => insertVariable(variable, 'subject')}
                  className="text-xs h-7"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {variable}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Code className="h-5 w-5" />
            Conteúdo do Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="html" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  HTML
                </TabsTrigger>
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Texto
                </TabsTrigger>
              </TabsList>

              <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateBasicHtmlTemplate}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar Modelo Base
                  </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(formData.html_template)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <TabsContent value="html" className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="html_template">Conteúdo HTML *</Label>
                <Textarea
                  id="html_template"
                  value={formData.html_template}
                  onChange={(e) => onChange({ ...formData, html_template: e.target.value })}
                  placeholder="Conteúdo HTML do email (usem {{variavel}} para conteúdo dinâmico)"
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>
            </TabsContent>

            <TabsContent value="text" className="space-y-3">
              <div className="space-y-2">
                <Label>Versão Texto (gerada automaticamente)</Label>
                <Textarea
                  value={formData.html_template.replace(/<[^>]*>/g, '')}
                  readOnly
                  rows={10}
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Esta versão é gerada automaticamente removendo etiquetas HTML. 
                  Será utilizada como alternativa para clientes que não suportam HTML.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Variable Helpers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Inserir Variáveis:</Label>
              <Badge variant="outline" className="text-xs">
                {allVariables.length} variáveis detectadas
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {commonVariables.map((variable) => (
                <Button
                  key={variable}
                  variant="outline"
                  size="sm"
                  onClick={() => insertVariable(variable, 'html')}
                  className="text-xs justify-start h-8"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {variable}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Variables Summary */}
      {allVariables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Variáveis Detectadas ({allVariables.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {allVariables.map((variable) => (
                <Badge key={variable} variant="secondary" className="text-xs">
                  {variable}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TemplateEditor;
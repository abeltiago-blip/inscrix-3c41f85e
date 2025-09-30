import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Edit, Plus, Trash2, Eye, Send, FileText } from "lucide-react";
import TemplateEditor from "./TemplateEditor";
import EmailPreview from "./EmailPreview";

interface EmailTemplate {
  id: string;
  template_key: string;
  name: string;
  description: string;
  subject_template: string;
  html_template: string;
  variables: any;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function EmailTemplateManager() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    template_key: "",
    name: "",
    description: "",
    subject_template: "",
    html_template: "",
    variables: [] as string[],
    category: "system",
    is_active: true
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      template_key: "",
      name: "",
      description: "",
      subject_template: "",
      html_template: "",
      variables: [],
      category: "system",
      is_active: true
    });
    setEditingTemplate(null);
  };

  const openEditDialog = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      template_key: template.template_key,
      name: template.name,
      description: template.description,
      subject_template: template.subject_template,
      html_template: template.html_template,
      variables: template.variables,
      category: template.category,
      is_active: template.is_active
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const extractVariables = (text: string): string[] => {
    const regex = /{{([^}]+)}}/g;
    const variables = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }
    return variables;
  };

  const handleTestSend = async (testData: Record<string, string>) => {
    setTesting(true);
    try {
      // Call edge function to send test email
      const { error } = await supabase.functions.invoke('send-template-email', {
        body: {
          templateKey: formData.template_key || 'test_template',
          recipientEmail: testData.email || 'teste@exemplo.com',
          variables: testData,
          customSubject: formData.subject_template,
          customHtml: formData.html_template
        }
      });

      if (error) throw error;

      toast({
        title: "Email de teste enviado",
        description: `Email enviado para ${testData.email || 'teste@exemplo.com'} com sucesso.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao enviar teste",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!formData.template_key || !formData.name || !formData.subject_template || !formData.html_template) {
      toast({
        title: "Erro",
        description: "Todos os campos obrigatórios devem ser preenchidos.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      // Extract variables from templates
      const subjectVars = extractVariables(formData.subject_template);
      const htmlVars = extractVariables(formData.html_template);
      const allVariables = [...new Set([...subjectVars, ...htmlVars])];

      const templateData = {
        ...formData,
        variables: allVariables
      };

      if (editingTemplate) {
        // Update existing template
        const { error } = await supabase
          .from('email_templates')
          .update(templateData)
          .eq('id', editingTemplate.id);

        if (error) throw error;

        toast({
          title: "Modelo actualizado",
          description: "O modelo de email foi actualizado com sucesso.",
        });
      } else {
        // Create new template
        const { error } = await supabase
          .from('email_templates')
          .insert(templateData);

        if (error) throw error;

        toast({
          title: "Modelo criado",
          description: "O novo modelo de email foi criado com sucesso.",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadTemplates();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (template: EmailTemplate) => {
    if (!confirm(`Têm a certeza que querem eliminar o modelo "${template.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', template.id);

      if (error) throw error;

      toast({
        title: "Modelo eliminado",
        description: "O modelo foi eliminado com sucesso.",
      });
      
      loadTemplates();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (template: EmailTemplate) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .update({ is_active: !template.is_active })
        .eq('id', template.id);

      if (error) throw error;

      toast({
        title: "Modelo actualizado",
        description: `Modelo ${template.is_active ? 'desactivado' : 'activado'} com sucesso.`,
      });
      
      loadTemplates();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      authentication: "bg-blue-100 text-blue-800",
      registration: "bg-green-100 text-green-800",
      onboarding: "bg-purple-100 text-purple-800",
      newsletter: "bg-orange-100 text-orange-800",
      event_management: "bg-red-100 text-red-800",
      marketing: "bg-yellow-100 text-yellow-800",
      results: "bg-indigo-100 text-indigo-800",
      financial: "bg-pink-100 text-pink-800",
      system: "bg-gray-100 text-gray-800"
    };

    return (
      <Badge className={colors[category as keyof typeof colors] || colors.system}>
        {category}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">A carregar modelos...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Modelos de Email
            </CardTitle>
        <CardDescription>
          Gerir modelos de email para diferentes tipos de comunicação
        </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Modelo
            </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {editingTemplate ? (
                    <>
                      <Edit className="h-5 w-5" />
                      Editar Modelo: {editingTemplate.name}
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      Criar Novo Modelo
                    </>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {editingTemplate 
                    ? "Modifiquem o modelo e vejam as alterações em tempo real" 
                    : "Criem um novo modelo com editor avançado e pré-visualização"
                  }
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="editor" className="h-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="editor" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Editor
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Pré-visualização
                  </TabsTrigger>
                </TabsList>

                <div className="mt-4 h-[calc(90vh-12rem)] overflow-hidden">
                  <TabsContent value="editor" className="h-full overflow-y-auto pr-2">
                    <TemplateEditor
                      formData={formData}
                      onChange={setFormData}
                      isEditing={!!editingTemplate}
                    />
                  </TabsContent>

                  <TabsContent value="preview" className="h-full overflow-y-auto pr-2">
                    <EmailPreview
                      subject={formData.subject_template}
                      htmlContent={formData.html_template}
                      variables={[
                        ...extractVariables(formData.subject_template),
                        ...extractVariables(formData.html_template)
                      ].filter((v, i, arr) => arr.indexOf(v) === i)}
                      onTestSend={handleTestSend}
                      isLoading={testing}
                    />
                  </TabsContent>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    {editingTemplate ? 'Última actualização: ' + new Date(editingTemplate.updated_at).toLocaleString() : 'Novo modelo'}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={saving || testing}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSave} 
                      disabled={saving || testing}
                      className="min-w-[100px]"
                    >
                      {saving ? "A guardar..." : editingTemplate ? "Actualizar" : "Criar"}
                    </Button>
                  </div>
                </div>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Chave</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Variáveis</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acções</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{template.name}</div>
                    {template.description && (
                      <div className="text-sm text-muted-foreground">{template.description}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {template.template_key}
                  </code>
                </TableCell>
                <TableCell>
                  {getCategoryBadge(template.category)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {template.variables.slice(0, 3).map((variable) => (
                      <Badge key={variable} variant="outline" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                    {template.variables.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.variables.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={template.is_active}
                      onCheckedChange={() => toggleActive(template)}
                    />
                    <span className="text-sm">
                      {template.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(template)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {templates.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum modelo encontrado. Criem o primeiro modelo para começar.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
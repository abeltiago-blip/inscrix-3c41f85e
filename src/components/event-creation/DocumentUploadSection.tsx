import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Upload, Download, X, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DocumentUploadSectionProps {
  eventId: string;
  eventRegulation?: string;
  onEventRegulationChange: (value: string) => void;
  regulationDocumentUrl?: string;
  onRegulationDocumentUrlChange: (url: string) => void;
  termsAndConditions?: string;
  onTermsAndConditionsChange: (value: string) => void;
  imageRightsClause?: string;
  onImageRightsClauseChange: (value: string) => void;
  liabilityWaiver?: string;
  onLiabilityWaiverChange: (value: string) => void;
}

export function DocumentUploadSection({
  eventId,
  eventRegulation,
  onEventRegulationChange,
  regulationDocumentUrl,
  onRegulationDocumentUrlChange,
  termsAndConditions,
  onTermsAndConditionsChange,
  imageRightsClause,
  onImageRightsClauseChange,
  liabilityWaiver,
  onLiabilityWaiverChange,
}: DocumentUploadSectionProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadDocument = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${eventId}/regulation-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('event-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('event-documents')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload do documento",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    try {
      const uploadedUrl = await uploadDocument(file);
      if (uploadedUrl) {
        onRegulationDocumentUrlChange(uploadedUrl);
        toast({
          title: "Sucesso",
          description: "Documento carregado com sucesso",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer upload do documento",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = async () => {
    if (regulationDocumentUrl && regulationDocumentUrl.includes('event-documents')) {
      try {
        const fileName = regulationDocumentUrl.split('/').slice(-2).join('/');
        await supabase.storage.from('event-documents').remove([fileName]);
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
    onRegulationDocumentUrlChange('');
    toast({
      title: "Sucesso",
      description: "Documento removido",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Regulamento do Evento
          </CardTitle>
          <CardDescription>
            Defina o regulamento específico que os participantes devem aceitar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Pode inserir o texto do regulamento ou fazer upload de um ficheiro PDF. 
              Se ambos estiverem preenchidos, será dada prioridade ao ficheiro PDF.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="event_regulation">Texto do Regulamento</Label>
            <Textarea
              id="event_regulation"
              value={eventRegulation || ''}
              onChange={(e) => onEventRegulationChange(e.target.value)}
              placeholder="Digite o regulamento específico do evento que os participantes devem aceitar..."
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="regulation_document">Documento PDF do Regulamento</Label>
            <div className="flex gap-2">
              <Input
                id="regulation_document"
                type="file"
                accept=".pdf"
                onChange={handleDocumentUpload}
                disabled={uploading}
                className="flex-1"
              />
              {regulationDocumentUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={regulationDocumentUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {regulationDocumentUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={removeDocument}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {regulationDocumentUrl && (
            <div className="space-y-2">
              <Label htmlFor="regulation_url">URL do Documento</Label>
              <div className="flex gap-2">
                <Input
                  id="regulation_url"
                  value={regulationDocumentUrl}
                  onChange={(e) => onRegulationDocumentUrlChange(e.target.value)}
                  placeholder="https://exemplo.com/regulamento.pdf"
                />
                <Button variant="outline" size="sm" asChild>
                  <a href={regulationDocumentUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          )}

          {uploading && (
            <div className="text-center text-muted-foreground">
              A carregar documento...
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Termos e Condições Gerais</CardTitle>
          <CardDescription>
            Termos e condições gerais que se aplicam ao evento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="terms_and_conditions">Termos e Condições</Label>
            <Textarea
              id="terms_and_conditions"
              value={termsAndConditions || ''}
              onChange={(e) => onTermsAndConditionsChange(e.target.value)}
              placeholder="Termos e condições gerais do evento..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cláusulas Legais</CardTitle>
          <CardDescription>
            Autorizações e termos de responsabilidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image_rights_clause">Autorização de Uso de Imagem</Label>
            <Textarea
              id="image_rights_clause"
              value={imageRightsClause || ''}
              onChange={(e) => onImageRightsClauseChange(e.target.value)}
              placeholder="Autorizo a captação e utilização da minha imagem durante o evento..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="liability_waiver">Termo de Responsabilidade</Label>
            <Textarea
              id="liability_waiver"
              value={liabilityWaiver || ''}
              onChange={(e) => onLiabilityWaiverChange(e.target.value)}
              placeholder="Participo no evento por minha conta e risco, eximindo os organizadores..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
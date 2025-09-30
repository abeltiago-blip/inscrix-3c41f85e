import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, FileText } from "lucide-react";
import MarkdownRenderer from "@/components/MarkdownRenderer";

interface RegulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  regulationText?: string;
  documentUrl?: string;
}

export default function RegulationModal({
  isOpen,
  onClose,
  eventTitle,
  regulationText,
  documentUrl
}: RegulationModalProps) {
  const handleDownload = () => {
    if (documentUrl) {
      window.open(documentUrl, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Regulamento - {eventTitle}
          </DialogTitle>
          <DialogDescription>
            Consulte o regulamento do evento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {regulationText && (
            <div className="prose prose-sm max-w-none">
              <MarkdownRenderer 
                content={regulationText}
                className="text-sm leading-relaxed"
              />
            </div>
          )}

          {documentUrl && (
            <div className="flex items-center justify-center p-6 border border-dashed border-border rounded-lg">
              <div className="text-center space-y-2">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Documento do regulamento disponível para download
                </p>
                <Button onClick={handleDownload} className="gap-2">
                  <Download className="h-4 w-4" />
                  Descarregar Regulamento
                </Button>
              </div>
            </div>
          )}

          {!regulationText && !documentUrl && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Nenhum regulamento disponível</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
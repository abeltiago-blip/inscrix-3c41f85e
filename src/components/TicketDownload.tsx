import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, QrCode, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TicketDownloadProps {
  registrationId: string;
  registrationNumber: string;
  participantName: string;
  eventTitle: string;
  className?: string;
}

export default function TicketDownload({ 
  registrationId, 
  registrationNumber,
  participantName,
  eventTitle,
  className 
}: TicketDownloadProps) {
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const generateAndDownloadTicket = async (includeQR: boolean = true) => {
    try {
      setGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('generate-ticket-pdf', {
        body: {
          registrationId: registrationId,
          includeQR: includeQR
        }
      });

      if (error) throw error;

      if (data.success && data.ticket) {
        // Create download link
        const link = document.createElement('a');
        link.href = data.ticket.pdf_data;
        link.download = `bilhete-${registrationNumber}.svg`; // In production: .pdf
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Bilhete Gerado",
          description: "O seu bilhete foi gerado e descarregado com sucesso",
        });
      } else {
        throw new Error(data.error || "Erro ao gerar bilhete");
      }
    } catch (error) {
      console.error('Error generating ticket:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const generateQRCode = async () => {
    try {
      setGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('generate-ticket-qr', {
        body: {
          registrationId: registrationId,
          eventId: (await supabase
            .from('registrations')
            .select('event_id')
            .eq('id', registrationId)
            .single()).data?.event_id
        }
      });

      if (error) throw error;

      if (data.success && data.qr_code) {
        // Create download link for QR code
        const link = document.createElement('a');
        link.href = data.qr_code.url;
        link.download = `qr-code-${registrationNumber}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "QR Code Gerado",
          description: "O código QR foi gerado e descarregado com sucesso",
        });
      } else {
        throw new Error(data.error || "Erro ao gerar QR code");
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Download do Bilhete
        </CardTitle>
        <CardDescription>
          Descarregue o seu bilhete em PDF ou apenas o código QR
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm"><strong>Evento:</strong> {eventTitle}</p>
          <p className="text-sm"><strong>Participante:</strong> {participantName}</p>
          <p className="text-sm"><strong>Nº Inscrição:</strong> {registrationNumber}</p>
        </div>

        <div className="flex flex-col gap-2">
          <Button 
            onClick={() => generateAndDownloadTicket(true)}
            disabled={generating}
            className="w-full"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Descarregar Bilhete Completo
          </Button>

          <Button 
            variant="outline"
            onClick={generateQRCode}
            disabled={generating}
            className="w-full"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <QrCode className="h-4 w-4 mr-2" />
            )}
            Descarregar apenas QR Code
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            <strong>Nota:</strong> Guarde o seu bilhete e apresente-o na entrada do evento. 
            O código QR será usado para fazer o check-in automaticamente.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
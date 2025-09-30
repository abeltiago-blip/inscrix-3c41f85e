import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, CheckCircle, XCircle, Scan, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import QRCodeCheckin from "./QRCodeCheckin";

interface CheckinResult {
  success: boolean;
  message?: string;
  error?: string;
  checkin?: {
    id: string;
    participant_name: string;
    event_title: string;
    ticket_type: string;
    checkin_time: string;
    registration_number: string;
  };
}

interface NativeQRScannerProps {
  eventId: string;
  onCheckinComplete?: (result: CheckinResult) => void;
}

export default function NativeQRScanner({ eventId, onCheckinComplete }: NativeQRScannerProps) {
  const [lastResult, setLastResult] = useState<CheckinResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const { toast } = useToast();

  const isNative = Capacitor.isNativePlatform();

  const scanWithCamera = async () => {
    if (!isNative) {
      toast({
        title: "Funcionalidade Nativa",
        description: "Esta funcionalidade só está disponível no app móvel",
        variant: "destructive",
      });
      return;
    }

    try {
      setScanning(true);
      setLastResult(null);

      // Request camera permissions
      const permissions = await CapacitorCamera.requestPermissions({
        permissions: ['camera']
      });

      if (permissions.camera !== 'granted') {
        throw new Error('Permissão de câmara negada');
      }

      // Take photo for QR scanning
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        promptLabelHeader: 'Scan QR Code',
        promptLabelPicture: 'Tirar Foto',
        promptLabelPhoto: 'Escolher da Galeria',
        promptLabelCancel: 'Cancelar'
      });

      if (image.dataUrl) {
        // In a real implementation, you would decode the QR code from the image
        // For now, we'll simulate the process
        await processQRFromImage(image.dataUrl);
      }
    } catch (error) {
      console.error('Error scanning QR code:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao digitalizar código QR';
      
      setLastResult({
        success: false,
        error: errorMessage
      });

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setScanning(false);
    }
  };

  const processQRFromImage = async (imageData: string) => {
    try {
      // TODO: Implement actual QR code detection from image
      // This would require a QR code detection library for images
      // For demonstration, we'll show how the process would work
      
      toast({
        title: "Funcionalidade em Desenvolvimento",
        description: "A detecção de QR code a partir de imagem será implementada em breve. Use o scanner web por agora.",
        variant: "default",
      });

      // Simulated QR data for demo
      const simulatedQRData = JSON.stringify({
        type: 'checkin',
        registration_id: 'demo-reg-123',
        event_id: eventId,
        participant_email: 'demo@example.com'
      });

      await handleQRDetection(simulatedQRData);
    } catch (error) {
      console.error('Error processing QR from image:', error);
      throw error;
    }
  };

  const handleQRDetection = async (qrData: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('process-checkin', {
        body: {
          qrData: qrData,
          scannerUserId: (await supabase.auth.getUser()).data.user?.id,
        }
      });

      if (error) throw error;

      const result: CheckinResult = data;
      setLastResult(result);

      if (result.success) {
        toast({
          title: "Check-in Realizado",
          description: `${result.checkin?.participant_name} foi registado com sucesso`,
        });
      } else {
        toast({
          title: "Erro no Check-in",
          description: result.error || "Erro desconhecido",
          variant: "destructive",
        });
      }

      onCheckinComplete?.(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      const result: CheckinResult = {
        success: false,
        error: errorMessage
      };
      
      setLastResult(result);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      
      onCheckinComplete?.(result);
    }
  };

  const resetScanner = () => {
    setLastResult(null);
  };

  // If not native, show web scanner
  if (!isNative) {
    return <QRCodeCheckin eventId={eventId} onCheckinComplete={onCheckinComplete} />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Scanner QR Nativo - Check-in
          </CardTitle>
          <CardDescription>
            Use a câmara do dispositivo para digitalizar códigos QR dos bilhetes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Native Scanner Interface */}
          <div className="text-center space-y-4">
            <div className="w-full max-w-md mx-auto aspect-video bg-muted rounded-lg border flex items-center justify-center">
              <div className="text-center">
                <Camera className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Toque no botão para abrir a câmara
                </p>
              </div>
            </div>

            <Button 
              onClick={scanWithCamera} 
              disabled={scanning}
              size="lg"
              className="w-full max-w-md"
            >
              <Scan className="h-5 w-5 mr-2" />
              {scanning ? "A digitalizar..." : "Digitalizar Código QR"}
            </Button>
          </div>

          {/* Platform Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Smartphone className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">App Nativo Detectado</p>
                <p>Está a usar a versão nativa do INSCRIX com acesso completo às funcionalidades do dispositivo.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Last Result */}
      {lastResult && (
        <Alert className={lastResult.success ? "border-green-500" : "border-red-500"}>
          <div className="flex items-center gap-2">
            {lastResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>
              {lastResult.success ? (
                <div className="space-y-2">
                  <p className="font-medium text-green-700">Check-in realizado com sucesso!</p>
                  {lastResult.checkin && (
                    <div className="space-y-1 text-sm">
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          {lastResult.checkin.registration_number}
                        </Badge>
                      </div>
                      <p><strong>Participante:</strong> {lastResult.checkin.participant_name}</p>
                      <p><strong>Evento:</strong> {lastResult.checkin.event_title}</p>
                      <p><strong>Bilhete:</strong> {lastResult.checkin.ticket_type}</p>
                      <p><strong>Hora:</strong> {new Date(lastResult.checkin.checkin_time).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="font-medium text-red-700">Erro no check-in</p>
                  <p className="text-sm">{lastResult.error}</p>
                </div>
              )}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {lastResult && (
        <div className="text-center">
          <Button variant="outline" onClick={resetScanner}>
            Digitalizar Novo Código
          </Button>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, CheckCircle, XCircle, Scan, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import QrScanner from "qr-scanner";

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

interface QRCodeCheckinProps {
  eventId: string;
  onCheckinComplete?: (result: CheckinResult) => void;
}

export default function QRCodeCheckin({ eventId, onCheckinComplete }: QRCodeCheckinProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<CheckinResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    if (!videoRef.current) return;

    try {
      setIsScanning(true);
      setLastResult(null);

      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => handleScan(result.data),
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          returnDetailedScanResult: true,
        }
      );

      await qrScannerRef.current.start();
    } catch (error) {
      console.error('Error starting QR scanner:', error);
      toast({
        title: "Erro",
        description: "Não foi possível aceder à câmara",
        variant: "destructive",
      });
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleScan = async (qrData: string) => {
    if (processing) return;

    setProcessing(true);
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
        
        // Stop scanning briefly to show result
        stopScanner();
        setTimeout(() => {
          if (!processing) { // Only restart if not processing another scan
            startScanner();
          }
        }, 3000);
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
    } finally {
      setProcessing(false);
    }
  };

  const resetScanner = () => {
    setLastResult(null);
    if (!isScanning) {
      startScanner();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Scanner QR Code - Check-in
          </CardTitle>
          <CardDescription>
            Aponte a câmara para o código QR do bilhete para fazer o check-in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camera View */}
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full max-w-md mx-auto rounded-lg border"
              style={{ display: isScanning ? 'block' : 'none' }}
            />
            
            {!isScanning && (
              <div className="w-full max-w-md mx-auto aspect-video bg-muted rounded-lg border flex items-center justify-center">
                <div className="text-center">
                  <Camera className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Câmara não ativa</p>
                </div>
              </div>
            )}

            {processing && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <div className="bg-white rounded-lg p-4 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Processando...</span>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-2 justify-center">
            {!isScanning ? (
              <Button onClick={startScanner} disabled={processing}>
                <Camera className="h-4 w-4 mr-2" />
                Iniciar Scanner
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={stopScanner} disabled={processing}>
                  Parar Scanner
                </Button>
                <Button variant="outline" onClick={resetScanner} disabled={processing}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reiniciar
                </Button>
              </>
            )}
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
    </div>
  );
}
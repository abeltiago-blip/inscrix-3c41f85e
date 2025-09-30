import { useState, useRef, useEffect } from 'react';
import { Camera, X, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import QrScanner from 'qr-scanner';
import { supabase } from '@/integrations/supabase/client';

interface QRCodeData {
  eventId: string;
  qrType: 'checkin' | 'info' | 'feedback';
  timestamp: number;
  organizerId: string;
}

interface ScannedParticipant {
  id: string;
  name: string;
  email: string;
  registration_id?: string;
}

interface QRCodeScannerProps {
  eventId?: string;
  onScanSuccess?: (data: QRCodeData, participant?: ScannedParticipant) => void;
  onClose?: () => void;
  className?: string;
}

export function QRCodeScanner({ 
  eventId, 
  onScanSuccess, 
  onClose,
  className = "" 
}: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScanResult, setLastScanResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.destroy();
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      setIsScanning(true);

      if (!videoRef.current) {
        throw new Error('Video element not available');
      }

      // Check if QrScanner is supported
      const hasCamera = await QrScanner.hasCamera();
      if (!hasCamera) {
        throw new Error('No camera available');
      }

      const scanner = new QrScanner(
        videoRef.current,
        async (result) => {
          if (lastScanResult === result.data) {
            return; // Prevent duplicate scans
          }
          
          setLastScanResult(result.data);
          await handleScanResult(result.data);
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      scannerRef.current = scanner;
      await scanner.start();
      
    } catch (err) {
      console.error('Scanner error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start scanner');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setIsScanning(false);
    setLastScanResult(null);
  };

  const handleScanResult = async (scannedData: string) => {
    try {
      setIsProcessing(true);
      
      // Parse QR code data
      const qrData: QRCodeData = JSON.parse(scannedData);
      
      // Validate QR code structure
      if (!qrData.eventId || !qrData.qrType) {
        throw new Error('Invalid QR code format');
      }

      // If eventId is provided, validate it matches
      if (eventId && qrData.eventId !== eventId) {
        throw new Error('QR code is for a different event');
      }

      // Handle different QR types
      switch (qrData.qrType) {
        case 'checkin':
          await handleCheckinScan(qrData);
          break;
        case 'info':
          await handleInfoScan(qrData);
          break;
        case 'feedback':
          await handleFeedbackScan(qrData);
          break;
        default:
          throw new Error('Unknown QR code type');
      }

      onScanSuccess?.(qrData);
      
    } catch (err) {
      console.error('Scan processing error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to process QR code');
    } finally {
      setIsProcessing(false);
      // Reset scan result after processing
      setTimeout(() => setLastScanResult(null), 2000);
    }
  };

  const handleCheckinScan = async (qrData: QRCodeData) => {
    // Check if participant has registration for this event
    const { data: registrations, error: regError } = await supabase
      .from('registrations')
      .select('*')
      .eq('event_id', qrData.eventId)
      .eq('status', 'active');

    if (regError) {
      throw new Error('Failed to validate registration');
    }

    if (!registrations || registrations.length === 0) {
      throw new Error('No active registrations found for this event');
    }

    // For now, we'll just mark the first registration as checked in
    // In a real app, you'd match by participant ID from the scan
    const registration = registrations[0];

    // Check if already checked in
    const { data: existingCheckin } = await supabase
      .from('event_checkins')
      .select('id')
      .eq('registration_id', registration.id)
      .single();

    if (existingCheckin) {
      toast.warning('Participant already checked in');
      return;
    }

    // Create check-in record
    const { error: checkinError } = await supabase
      .from('event_checkins')
      .insert({
        event_id: qrData.eventId,
        registration_id: registration.id,
        participant_id: registration.participant_id,
        participant_name: registration.participant_name,
        participant_email: registration.participant_email,
        checkin_method: 'qr_scan',
        scanner_user_id: (await supabase.auth.getUser()).data.user?.id
      });

    if (checkinError) {
      throw new Error('Failed to record check-in');
    }

    toast.success(`✅ ${registration.participant_name} checked in successfully!`);
  };

  const handleInfoScan = async (qrData: QRCodeData) => {
    // Navigate to event info page
    window.location.href = `/eventos/${qrData.eventId}`;
  };

  const handleFeedbackScan = async (qrData: QRCodeData) => {
    // Navigate to feedback page - implement when feedback system exists
    toast.info('Sistema de feedback será implementado em breve');
  };

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            QR Code Scanner
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isScanning ? (
          <div className="text-center space-y-4">
            <div className="bg-muted/50 rounded-lg p-8">
              <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                Click to start scanning QR codes
              </p>
            </div>
            <Button onClick={startScanning} className="w-full">
              <Camera className="h-4 w-4 mr-2" />
              Start Scanner
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover"
                playsInline
                muted
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                    <p className="text-sm">Processing...</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={stopScanning} 
                variant="outline" 
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Stop
              </Button>
              <Button 
                onClick={() => {
                  stopScanning();
                  startScanning();
                }} 
                variant="outline"
                size="icon"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Point camera at QR code to scan
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {lastScanResult && (
          <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg">
            <CheckCircle className="h-4 w-4" />
            QR code scanned successfully!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
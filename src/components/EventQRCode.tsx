import { useState } from 'react';
import { QrCode, Download, Share2, RotateCcw, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useQRCode } from '@/hooks/useQRCode';

interface EventQRCodeProps {
  eventId: string;
  eventTitle: string;
  qrType: 'checkin' | 'info' | 'feedback';
  className?: string;
}

const QR_TYPE_LABELS = {
  checkin: 'Check-in',
  info: 'Informações',  
  feedback: 'Feedback'
};

const QR_TYPE_COLORS = {
  checkin: 'bg-green-100 text-green-800',
  info: 'bg-blue-100 text-blue-800',
  feedback: 'bg-purple-100 text-purple-800'
};

export function EventQRCode({ 
  eventId, 
  eventTitle, 
  qrType,
  className = "" 
}: EventQRCodeProps) {
  const [copied, setCopied] = useState(false);
  const { qrCodeUrl, qrCodeData, isGenerating, error, regenerateQRCode } = useQRCode(eventId, qrType);

  const handleDownload = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${eventTitle}-${qrType}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('QR code downloaded!');
  };

  const handleShare = async () => {
    if (!qrCodeUrl) return;

    try {
      // Convert data URL to blob
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const file = new File([blob], `${eventTitle}-${qrType}-qr.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `QR Code - ${eventTitle}`,
          text: `QR Code para ${QR_TYPE_LABELS[qrType]} do evento: ${eventTitle}`,
          files: [file]
        });
        toast.success('QR code shared!');
      } else {
        // Fallback to copying URL
        await handleCopyData();
      }
    } catch (err) {
      console.error('Share failed:', err);
      toast.error('Failed to share QR code');
    }
  };

  const handleCopyData = async () => {
    if (!qrCodeData) return;

    try {
      await navigator.clipboard.writeText(qrCodeData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('QR code data copied to clipboard!');
    } catch (err) {
      console.error('Copy failed:', err);
      toast.error('Failed to copy QR code data');
    }
  };

  if (error) {
    return (
      <Card className={`w-full max-w-sm ${className}`}>
        <CardContent className="pt-6 text-center">
          <div className="text-destructive mb-4">
            <QrCode className="h-12 w-12 mx-auto mb-2" />
            <p className="text-sm">{error}</p>
          </div>
          <Button onClick={regenerateQRCode} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full max-w-sm ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code
          </div>
          <Badge className={QR_TYPE_COLORS[qrType]}>
            {QR_TYPE_LABELS[qrType]}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-white p-4 rounded-lg border">
          {isGenerating ? (
            <div className="aspect-square flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Generating...</p>
              </div>
            </div>
          ) : qrCodeUrl ? (
            <img 
              src={qrCodeUrl} 
              alt={`QR Code - ${QR_TYPE_LABELS[qrType]}`}
              className="w-full h-auto"
            />
          ) : (
            <div className="aspect-square flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <QrCode className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">No QR code available</p>
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <h4 className="font-medium text-sm mb-1">{eventTitle}</h4>
          <p className="text-xs text-muted-foreground">
            {qrType === 'checkin' && 'Scan para fazer check-in no evento'}
            {qrType === 'info' && 'Scan para ver informações do evento'}
            {qrType === 'feedback' && 'Scan para dar feedback do evento'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={handleDownload} 
            variant="outline" 
            size="sm"
            disabled={!qrCodeUrl}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          
          <Button 
            onClick={handleShare} 
            variant="outline" 
            size="sm"
            disabled={!qrCodeUrl}
            className="flex-1"
          >
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleCopyData} 
            variant="ghost" 
            size="sm"
            disabled={!qrCodeData}
            className="flex-1"
          >
            {copied ? (
              <Check className="h-4 w-4 mr-1" />
            ) : (
              <Copy className="h-4 w-4 mr-1" />
            )}
            {copied ? 'Copied!' : 'Copy Data'}
          </Button>
          
          <Button 
            onClick={regenerateQRCode} 
            variant="ghost" 
            size="sm"
            disabled={isGenerating}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
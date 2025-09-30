import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { supabase } from '@/integrations/supabase/client';

interface QRCodeData {
  eventId: string;
  qrType: 'checkin' | 'info' | 'feedback';
  timestamp: number;
  organizerId: string;
}

export function useQRCode(eventId: string, qrType: 'checkin' | 'info' | 'feedback' = 'checkin') {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;
    generateQRCode();
  }, [eventId, qrType]);

  const generateQRCode = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create QR data
      const qrData: QRCodeData = {
        eventId,
        qrType,
        timestamp: Date.now(),
        organizerId: user.id
      };

      const qrDataString = JSON.stringify(qrData);
      
      // Generate QR code image URL
      const qrUrl = await QRCode.toDataURL(qrDataString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Save to database
      const { error: dbError } = await supabase
        .from('event_qr_codes')
        .upsert({
          event_id: eventId,
          qr_type: qrType,
          qr_code_data: qrDataString,
          qr_code_url: qrUrl,
          created_by: user.id,
          is_active: true
        }, {
          onConflict: 'event_id,qr_type'
        });

      if (dbError) {
        console.error('Error saving QR code:', dbError);
      }

      setQrCodeUrl(qrUrl);
      setQrCodeData(qrDataString);
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateQRCode = () => {
    generateQRCode();
  };

  return {
    qrCodeUrl,
    qrCodeData,
    isGenerating,
    error,
    regenerateQRCode
  };
}
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const FinalEmailTest = () => {
  const [status, setStatus] = useState<string>('');
  const [sending, setSending] = useState(false);

  const sendFinalTestEmails = async () => {
    setSending(true);
    setStatus('Enviando 1 teste de cada template redesenhado...');

    // Enviar 1 de cada para o Abel
    const recipient = 'abeltiago@hotmail.com';
    const testEmails = [
      {
        templateKey: 'password_reset',
        variables: {
          user_name: 'Abel Tiago',
          reset_link: 'https://inscrix.com/reset?token=abc123'
        }
      },
      {
        templateKey: 'email_verification',
        variables: {
          user_name: 'Abel Tiago',
          verification_link: 'https://inscrix.com/verify?token=def456'
        }
      },
      {
        templateKey: 'organizer_welcome',
        variables: {
          organizer_name: 'Abel Tiago',
          dashboard_link: 'https://inscrix.com/dashboard'
        }
      },
      {
        templateKey: 'event_published',
        variables: {
          organizer_name: 'Abel Tiago',
          event_name: 'Maratona INSCRIX 2025',
          event_date: '15 de Junho de 2025',
          event_location: 'Lisboa, Portugal',
          event_link: 'https://inscrix.com/eventos/123'
        }
      },
      {
        templateKey: 'team_registration',
        variables: {
          team_captain_name: 'Abel Tiago',
          team_name: 'Equipa INSCRIX',
          event_name: 'Corrida INSCRIX',
          event_date: '20 de Julho de 2025',
          event_location: 'Porto, Portugal',
          event_link: 'https://inscrix.com/eventos/456'
        }
      }
    ];

    let totalSent = 0;
    let totalErrors = 0;

    for (const emailData of testEmails) {
      try {
        setStatus(`Enviando ${emailData.templateKey}...`);
        
        const { data, error } = await supabase.functions.invoke('send-template-email', {
          body: {
            templateKey: emailData.templateKey,
            recipientEmail: recipient,
            variables: emailData.variables
          }
        });

        if (error) {
          console.error(`Erro ao enviar ${emailData.templateKey}:`, error);
          totalErrors++;
        } else {
          console.log(`Email ${emailData.templateKey} enviado:`, data);
          totalSent++;
        }

        // Pausa entre emails
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Erro ao enviar ${emailData.templateKey}:`, error);
        totalErrors++;
      }
    }

    setStatus(`Concluído! ${totalSent} emails enviados, ${totalErrors} erros.`);
    setSending(false);
  };

  // Removed auto-send to stop continuous emails
  
  const handleManualTest = () => {
    sendFinalTestEmails();
  };

  return (
    <Card className="w-full max-w-lg mx-auto mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎨 Templates INSCRIX Finalizados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">🎨 Melhorias aplicadas:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Logo corrigido (URL absoluta)</li>
              <li>• Emojis substituídos por ícones SVG</li>
              <li>• Design sem cantos redondos</li>
              <li>• Cores INSCRIX (azul, verde)</li>
              <li>• Links legais no footer</li>
              <li>• Tipografia Inter consistente</li>
            </ul>
          </div>
          
          <div className="p-3 bg-muted">
            <p className="text-sm font-mono">{status}</p>
          </div>

          <button 
            onClick={handleManualTest}
            disabled={sending}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md disabled:opacity-50"
          >
            {sending ? 'Enviando...' : '📧 Enviar 1 Teste de Cada'}
          </button>

          <div className="text-xs text-muted-foreground">
            <strong>Destinatário:</strong><br/>
            • abeltiago@hotmail.com
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
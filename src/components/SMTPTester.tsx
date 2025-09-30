import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';

export const SMTPTester = () => {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<Array<{
    type: string;
    success: boolean;
    error?: string;
  }>>([]);

  const testEmails = [
    {
      templateKey: 'test_confirmation',
      subject: 'Teste SMTP - Email de Confirmação',
      html: `
        <h2>🧪 Teste do Sistema SMTP INSCRIX</h2>
        <p>Este é um <strong>email de teste</strong> para verificar o funcionamento do servidor SMTP.</p>
        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>✅ Configuração SMTP:</h3>
          <ul>
            <li><strong>Servidor:</strong> mail.inscrix.pt</li>
            <li><strong>Porta:</strong> 465 (SSL/TLS)</li>
            <li><strong>Autenticação:</strong> hello@inscrix.pt</li>
          </ul>
        </div>
        <p>Se recebeu este email, significa que o sistema está a <strong>funcionar corretamente</strong>!</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Email enviado automaticamente pelo sistema INSCRIX<br>
          Data: {{currentDate}}
        </p>
      `
    }
  ];

  const sendTestEmails = async () => {
    if (!email) {
      toast.error('Por favor, insira um email válido');
      return;
    }

    setSending(true);
    setResults([]);
    
    try {
      const testResults = [];
      
      for (const emailTest of testEmails) {
        try {
          const { data, error } = await supabase.functions.invoke('send-template-email', {
            body: {
              templateKey: emailTest.templateKey,
              recipientEmail: email,
              customSubject: emailTest.subject,
              customHtml: emailTest.html,
              variables: {
                currentDate: new Date().toLocaleString('pt-PT')
              }
            }
          });

          if (error) {
            throw new Error(error.message);
          }

          testResults.push({
            type: 'Teste SMTP',
            success: true
          });

          toast.success(`Email de teste enviado para ${email}!`);
          
        } catch (error) {
          testResults.push({
            type: 'Teste SMTP',
            success: false,
            error: error.message
          });
          
          toast.error(`Erro ao enviar: ${error.message}`);
        }
      }
      
      setResults(testResults);
      
    } catch (error) {
      console.error('Erro no teste SMTP:', error);
      toast.error('Erro no sistema de teste');
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Teste do Sistema SMTP
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-email">Email de Teste</Label>
          <Input
            id="test-email"
            type="email"
            placeholder="seu.email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
          <h4 className="font-medium text-blue-800 mb-2">ℹ️ Configuração SMTP Atual:</h4>
          <ul className="text-blue-700 space-y-1">
            <li><strong>Servidor:</strong> mail.inscrix.pt</li>
            <li><strong>Porta:</strong> 465 (SSL/TLS)</li>
            <li><strong>Utilizador:</strong> hello@inscrix.pt</li>
            <li><strong>Estado:</strong> Configurado</li>
          </ul>
        </div>

        <Button 
          onClick={sendTestEmails}
          disabled={sending || !email}
          className="w-full"
        >
          {sending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Enviando teste...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Enviar Email de Teste
            </>
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Resultados:</h4>
            {results.map((result, index) => (
              <div 
                key={index}
                className={`flex items-center gap-2 p-2 rounded text-sm ${
                  result.success 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {result.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span>
                  {result.type}: {result.success ? 'Enviado com sucesso' : result.error}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
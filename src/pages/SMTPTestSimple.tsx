import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import Header from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SMTPTestSimple = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [testEmail, setTestEmail] = useState(profile?.email || '');

  const testSMTP = async () => {
    if (!testEmail) {
      toast({
        title: "Email Necessário",
        description: "Introduza um email para teste",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    setResult(null);

    try {
      console.log('🧪 Iniciando teste SMTP para:', testEmail);
      
      const { data, error } = await supabase.functions.invoke('smtp-test-simple', {
        body: { testEmail }
      });

      if (error) {
        throw error;
      }

      setResult(data);
      
      if (data.success) {
        toast({
          title: "SMTP Funcionando! ✅",
          description: "Email de teste enviado com sucesso",
          variant: "default",
        });
      } else {
        toast({
          title: "Erro no SMTP ❌",
          description: data.error || "Falha no envio",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro no teste SMTP:', error);
      setResult({
        success: false,
        error: error.message || 'Erro desconhecido'
      });
      
      toast({
        title: "Erro no Teste",
        description: "Não foi possível testar o SMTP",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">🧪 Teste SMTP Simples</h1>
          <p className="text-muted-foreground">
            Testar se o SMTP está configurado corretamente
          </p>
        </div>

        {/* Teste SMTP */}
        <Card>
          <CardHeader>
            <CardTitle>Teste de Envio SMTP</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">
                  Email para Teste
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button 
                onClick={testSMTP} 
                disabled={testing || !testEmail} 
                className="h-10"
              >
                {testing ? "A testar..." : "Testar SMTP"}
              </Button>
            </div>

            {result && (
              <div className="mt-6">
                <div className={`p-4 rounded-lg border ${
                  result.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <h3 className={`font-semibold ${
                      result.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.success ? 'SMTP Funcionando!' : 'Problema no SMTP'}
                    </h3>
                  </div>

                  <p className="text-sm mb-3">
                    <strong>Mensagem:</strong> {result.message || result.error}
                  </p>

                  {result.details && (
                    <div className="bg-white p-3 rounded border">
                      <h4 className="font-medium mb-2">Detalhes:</h4>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </div>
                  )}

                  {result.success && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-blue-800 text-sm">
                        ✅ <strong>Verifique o seu email!</strong> Se recebeu o email de teste, 
                        o SMTP está configurado corretamente e pronto a usar.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações sobre Configuração */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Configuração SMTP Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 mb-2">
                <strong>Secrets configurados:</strong>
              </p>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• SMTP_HOST: Configurado ✅</li>
                <li>• SMTP_PORT: Configurado ✅</li>
                <li>• SMTP_USERNAME: Configurado ✅</li>
                <li>• SMTP_PASSWORD: Configurado ✅</li>
              </ul>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <p className="text-amber-800">
                <strong>⚠️ Importante:</strong> Este teste usa SMTP direto via edge function, 
                sem depender do sistema de Auth do Supabase.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SMTPTestSimple;
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface TestResult {
  success: boolean;
  message: string;
  recipient?: string;
  subject?: string;
  error?: string;
}

const AuthEmailTester: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('participant');
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const { toast } = useToast();

  const sendTestAuthEmail = async () => {
    if (!email || !name) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor preencha o email e nome.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      console.log('🧪 Starting test email send...');
      
      // Simulate auth webhook payload
      const webhookPayload = {
        type: 'INSERT',
        table: 'users',
        record: {
          id: 'test-user-' + Date.now(),
          email: email,
          email_confirmed_at: null,
          confirmation_token: 'test-token-' + Math.random().toString(36).substr(2, 9),
          raw_user_meta_data: {
            first_name: name.split(' ')[0],
            last_name: name.split(' ').slice(1).join(' '),
            role: role
          }
        }
      };

      console.log('📤 Invoking send-auth-email edge function...');
      const response = await supabase.functions.invoke('send-auth-email', {
        body: webhookPayload
      });

      console.log('📥 Edge function response:', response);

      if (response.error) {
        console.error('❌ Edge function error:', response.error);
        throw response.error;
      }

      if (!response.data) {
        throw new Error('No data returned from edge function');
      }

      if (!response.data.success) {
        throw new Error(response.data.error || 'Edge function returned success: false');
      }

      const result: TestResult = {
        success: true,
        message: 'Email de confirmação enviado com sucesso!',
        recipient: email,
        subject: response.data.subject || 'Email de confirmação'
      };

      setResults(prev => [result, ...prev]);
      toast({
        title: "✅ Email enviado!",
        description: `Email de confirmação enviado para ${email}`,
      });

      // Clear form
      setEmail('');
      setName('');
      setRole('participant');

    } catch (error: any) {
      console.error('❌ Erro ao enviar email:', error);
      
      let errorMessage = 'Erro desconhecido';
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error.details) {
        errorMessage = error.details;
      }
      
      const result: TestResult = {
        success: false,
        message: 'Erro ao enviar email de confirmação',
        error: errorMessage
      };

      setResults(prev => [result, ...prev]);
      toast({
        title: "❌ Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔐 Teste de Email de Autenticação
        </CardTitle>
        <CardDescription>
          Envie emails de confirmação de conta personalizados para testar o sistema
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="utilizador@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={sending}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              type="text"
              placeholder="João Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={sending}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Tipo de Conta</Label>
          <Select value={role} onValueChange={setRole} disabled={sending}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de conta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="participant">Participante</SelectItem>
              <SelectItem value="organizer">Organizador</SelectItem>
              <SelectItem value="team">Equipa</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={sendTestAuthEmail} 
          disabled={sending || !email || !name}
          className="w-full"
        >
          {sending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            'Enviar Email de Confirmação'
          )}
        </Button>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resultados dos Testes</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {result.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1 space-y-1">
                      <p className={`font-medium ${
                        result.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {result.message}
                      </p>
                      {result.recipient && (
                        <p className="text-sm text-gray-600">
                          <strong>Destinatário:</strong> {result.recipient}
                        </p>
                      )}
                      {result.subject && (
                        <p className="text-sm text-gray-600">
                          <strong>Assunto:</strong> {result.subject}
                        </p>
                      )}
                      {result.error && (
                        <p className="text-sm text-red-600">
                          <strong>Erro:</strong> {result.error}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">ℹ️ Como funciona:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Este teste simula o webhook de autenticação do Supabase</li>
            <li>• O email será enviado via SMTP usando as credenciais configuradas</li>
            <li>• O template inclui link de confirmação e informações da conta</li>
            <li>• Os emails são personalizados conforme o tipo de conta selecionado</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthEmailTester;
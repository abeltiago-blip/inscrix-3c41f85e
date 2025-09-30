import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ConfirmEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [confirming, setConfirming] = useState(true);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      setResult({
        success: false,
        message: 'Link de confirmação inválido ou incompleto'
      });
      setConfirming(false);
      return;
    }

    confirmEmailToken();
  }, [token, email]);

  const confirmEmailToken = async () => {
    try {
      console.log('🔐 Confirmando email:', { token, email });

      // Confirmar o token através do Supabase Auth
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'signup',
        email: email!
      });

      if (error) {
        throw error;
      }

      setResult({
        success: true,
        message: 'Email confirmado com sucesso! A sua conta está agora ativa.'
      });

      toast({
        title: "Email Confirmado! ✅",
        description: "A sua conta foi ativada com sucesso",
        variant: "default",
      });

      // Redirecionar para dashboard após 3 segundos
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (error: any) {
      console.error('❌ Erro na confirmação:', error);
      
      let message = 'Erro ao confirmar o email';
      
      if (error.message?.includes('expired')) {
        message = 'O link de confirmação expirou. Solicite um novo email de confirmação.';
      } else if (error.message?.includes('invalid')) {
        message = 'Link de confirmação inválido. Verifique se copiou o link completo.';
      } else if (error.message?.includes('already confirmed')) {
        message = 'Este email já foi confirmado anteriormente.';
      }

      setResult({
        success: false,
        message
      });

      toast({
        title: "Erro na Confirmação",
        description: message,
        variant: "destructive",
      });
    } finally {
      setConfirming(false);
    }
  };

  const resendConfirmation = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email!
      });

      if (error) throw error;

      toast({
        title: "Email Reenviado",
        description: "Novo email de confirmação enviado",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível reenviar o email",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[600px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Confirmação de Email</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {confirming ? (
              <div className="space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                <p className="text-muted-foreground">
                  A confirmar o seu email...
                </p>
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  {result.success ? (
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  ) : (
                    <XCircle className="h-12 w-12 text-red-600" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <h3 className={`font-semibold ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.success ? 'Confirmação Bem-sucedida!' : 'Erro na Confirmação'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {result.message}
                  </p>
                </div>

                <div className="space-y-2">
                  {result.success ? (
                    <>
                      <p className="text-sm text-green-700">
                        Será redirecionado para o dashboard em alguns segundos...
                      </p>
                      <Button onClick={() => navigate('/dashboard')} className="w-full">
                        Ir para Dashboard
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      {email && (
                        <Button 
                          onClick={resendConfirmation} 
                          variant="outline" 
                          className="w-full"
                        >
                          Reenviar Email de Confirmação
                        </Button>
                      )}
                      <Button onClick={() => navigate('/login')} className="w-full">
                        Voltar ao Login
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConfirmEmail;
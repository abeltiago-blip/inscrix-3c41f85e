import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import AuthEmailTester from '@/components/AuthEmailTester';

const EmailTest = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Only allow admins
  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
              <p className="text-muted-foreground mb-6">
                Apenas administradores podem aceder a esta página.
              </p>
              <Button onClick={() => navigate('/')}>
                Voltar ao Início
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Admin
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Sistema de Emails</h1>
            <p className="text-muted-foreground">
              Teste e configuração do sistema de emails personalizado
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <AuthEmailTester />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            ✅ Problema Resolvido
          </h3>
          <div className="text-blue-700 space-y-2">
            <p><strong>Erro anterior:</strong> "failed to lookup address information: Name or service not known"</p>
            <p><strong>Solução implementada:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Substituído SMTP por Resend API (mais confiável)</li>
              <li>Melhor tratamento de erros nas edge functions</li>
              <li>Sistema de fallback robusto</li>
              <li>Logs detalhados para debugging</li>
            </ul>
            <p className="mt-3">
              <strong>Agora pode:</strong> Criar contas de organizador com qualquer email e receber confirmações automáticas!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTest;
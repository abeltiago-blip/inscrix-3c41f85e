import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Eye, UserCheck, Database, AlertTriangle, Mail } from "lucide-react";

const PoliticaPrivacidade = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Política de Privacidade
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A sua privacidade é fundamental para nós. Saiba como recolhemos, 
            utilizamos e protegemos os seus dados pessoais.
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <Badge variant="secondary">Última atualização: 28 de Agosto de 2024</Badge>
            <Badge variant="outline">RGPD Compliant</Badge>
          </div>
        </div>

        {/* GDPR Notice */}
        <Card className="mb-8 border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Shield className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h3 className="font-semibold text-green-900 mb-2">Conformidade RGPD</h3>
                <p className="text-sm text-green-800">
                  Esta política cumpre integralmente o Regulamento Geral sobre a Proteção de Dados (RGPD) 
                  e a legislação portuguesa aplicável à proteção de dados pessoais.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* 1. Responsável pelo Tratamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                1. Responsável pelo Tratamento de Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Inscrix, Lda.</h4>
                <ul className="space-y-1">
                  <li><strong>Morada:</strong> Rua da Inovação, 123, 4200-180 Porto, Portugal</li>
                  <li><strong>Email:</strong> privacidade@inscrix.pt</li>
                  <li><strong>Telefone:</strong> +351 220 123 456</li>
                  <li><strong>NIF:</strong> 123456789</li>
                </ul>
              </div>
              <p>
                Para questões relacionadas com a proteção de dados, pode contactar o nosso 
                Encarregado de Proteção de Dados através de: dpo@inscrix.pt
              </p>
            </CardContent>
          </Card>

          {/* 2. Dados Recolhidos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                2. Que Dados Recolhemos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">2.1 Dados de Registo</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Nome completo</li>
                  <li>Endereço de email</li>
                  <li>Palavra-passe (encriptada)</li>
                  <li>Número de telefone (opcional)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">2.2 Dados de Participação em Eventos</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Data de nascimento</li>
                  <li>Género</li>
                  <li>Morada</li>
                  <li>Número de documento de identificação</li>
                  <li>Contacto de emergência</li>
                  <li>Informações médicas relevantes (se fornecidas voluntariamente)</li>
                  <li>Preferências de tamanho de roupa</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">2.3 Dados de Utilização</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Endereço IP</li>
                  <li>Tipo de navegador e dispositivo</li>
                  <li>Páginas visitadas e tempo de sessão</li>
                  <li>Cookies e tecnologias similares</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">2.4 Dados de Pagamento</h4>
                <p>
                  <strong>Importante:</strong> Não armazenamos dados de cartão de crédito. 
                  Todos os pagamentos são processados por fornecedores terceiros certificados PCI DSS.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 3. Finalidades do Tratamento */}
          <Card>
            <CardHeader>
              <CardTitle>3. Para que Utilizamos os Seus Dados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">3.1 Prestação de Serviços</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Criar e gerir a sua conta de utilizador</li>
                  <li>Processar inscrições em eventos</li>
                  <li>Comunicar informações sobre eventos</li>
                  <li>Fornecer suporte técnico</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">3.2 Melhoramento dos Serviços</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Analisar padrões de utilização (dados anonimizados)</li>
                  <li>Desenvolver novas funcionalidades</li>
                  <li>Otimizar a experiência do utilizador</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">3.3 Marketing (com consentimento)</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Enviar newsletters e atualizações</li>
                  <li>Informar sobre novos eventos relevantes</li>
                  <li>Comunicações promocionais personalizadas</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 4. Base Legal */}
          <Card>
            <CardHeader>
              <CardTitle>4. Base Legal para o Tratamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <ul className="space-y-2">
                <li><strong>Execução de contrato:</strong> Para prestar os serviços solicitados</li>
                <li><strong>Consentimento:</strong> Para comunicações de marketing</li>
                <li><strong>Interesses legítimos:</strong> Para melhorar os serviços e segurança</li>
                <li><strong>Obrigação legal:</strong> Para cumprimento de requisitos fiscais e legais</li>
              </ul>
            </CardContent>
          </Card>

          {/* 5. Partilha de Dados */}
          <Card>
            <CardHeader>
              <CardTitle>5. Com Quem Partilhamos os Seus Dados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">5.1 Organizadores de Eventos</h4>
                <p>
                  Partilhamos dados necessários com organizadores para gestão de eventos 
                  (nome, contacto, informações de inscrição).
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">5.2 Fornecedores de Serviços</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Processadores de pagamento (Stripe, PayPal)</li>
                  <li>Serviços de email (SendGrid)</li>
                  <li>Serviços de alojamento (AWS)</li>
                  <li>Ferramentas de análise (Google Analytics - dados anonimizados)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">5.3 Autoridades</h4>
                <p>
                  Apenas quando legalmente obrigatório ou para proteger direitos, 
                  propriedade ou segurança.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 6. Retenção de Dados */}
          <Card>
            <CardHeader>
              <CardTitle>6. Período de Conservação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <ul className="space-y-2">
                <li><strong>Dados de conta:</strong> Enquanto a conta estiver ativa + 3 anos</li>
                <li><strong>Dados de eventos:</strong> 7 anos (requisitos fiscais)</li>
                <li><strong>Dados de marketing:</strong> Até retirar o consentimento</li>
                <li><strong>Logs de segurança:</strong> 1 ano</li>
              </ul>
              <p>
                Após estes períodos, os dados são eliminados de forma segura e irreversível.
              </p>
            </CardContent>
          </Card>

          {/* 7. Seus Direitos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                7. Os Seus Direitos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Direito de Acesso</h4>
                  <p>Consultar que dados pessoais processamos</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Direito de Retificação</h4>
                  <p>Corrigir dados incorretos ou incompletos</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Direito ao Apagamento</h4>
                  <p>Solicitar a eliminação dos seus dados</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Direito à Portabilidade</h4>
                  <p>Receber os seus dados em formato legível</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Direito de Oposição</h4>
                  <p>Opor-se ao tratamento dos seus dados</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Direito de Limitação</h4>
                  <p>Restringir o tratamento em certas situações</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="font-semibold mb-2">Como exercer os seus direitos:</p>
                <p>Contacte-nos através de privacidade@inscrix.pt ou através das definições da sua conta.</p>
                <p className="text-xs mt-2">Responderemos no prazo máximo de 30 dias.</p>
              </div>
            </CardContent>
          </Card>

          {/* 8. Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                8. Medidas de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>Implementamos medidas técnicas e organizativas adequadas:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <ul className="space-y-1 list-disc list-inside">
                  <li>Encriptação SSL/TLS</li>
                  <li>Palavras-passe encriptadas</li>
                  <li>Acesso restrito a dados</li>
                  <li>Monitorização de segurança 24/7</li>
                </ul>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Backups regulares e seguros</li>
                  <li>Formação em privacidade para funcionários</li>
                  <li>Auditorias de segurança regulares</li>
                  <li>Planos de resposta a incidentes</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 9. Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>9. Utilização de Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Tipos de Cookies:</h4>
                <ul className="space-y-2">
                  <li><strong>Essenciais:</strong> Necessários para o funcionamento da plataforma</li>
                  <li><strong>Funcionais:</strong> Melhoram a experiência do utilizador</li>
                  <li><strong>Analíticos:</strong> Ajudam-nos a entender como utiliza o site</li>
                  <li><strong>Marketing:</strong> Para comunicações personalizadas (com consentimento)</li>
                </ul>
              </div>
              <p>
                Pode gerir as suas preferências de cookies nas definições do navegador 
                ou através do nosso banner de cookies.
              </p>
            </CardContent>
          </Card>

          {/* 10. Transferências Internacionais */}
          <Card>
            <CardHeader>
              <CardTitle>10. Transferências Internacionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                Os seus dados são processados principalmente dentro da União Europeia. 
                Quando necessário transferir dados para países terceiros, garantimos 
                proteções adequadas através de:
              </p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Cláusulas contratuais padrão aprovadas pela Comissão Europeia</li>
                <li>Decisões de adequação da Comissão</li>
                <li>Certificações de privacidade reconhecidas</li>
              </ul>
            </CardContent>
          </Card>

          {/* 11. Alterações à Política */}
          <Card>
            <CardHeader>
              <CardTitle>11. Alterações a Esta Política</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                Podemos atualizar esta política periodicamente. As alterações significativas 
                serão comunicadas através de:
              </p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Email para utilizadores registados</li>
                <li>Aviso destacado na plataforma</li>
                <li>Atualização da data no topo deste documento</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-semibold mb-2">Dúvidas sobre Privacidade?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Estamos aqui para esclarecer qualquer questão sobre os seus dados.
                </p>
                <div className="flex justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      <Mail className="h-3 w-3 mr-1" />
                      privacidade@inscrix.pt
                    </Badge>
                    <Badge variant="secondary">
                      <Mail className="h-3 w-3 mr-1" />
                      dpo@inscrix.pt
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Pode também apresentar reclamação à Comissão Nacional de Proteção de Dados (CNPD)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PoliticaPrivacidade;
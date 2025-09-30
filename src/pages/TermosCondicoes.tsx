import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, FileText, Shield, AlertTriangle, Mail, Phone } from "lucide-react";

const TermosCondicoes = () => {
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
            Termos e Condições
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Documento regulador de uso e responsabilidades da plataforma Inscrix.
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <Badge variant="secondary">Última atualização: 28 de Agosto de 2024</Badge>
            <Badge variant="outline">Versão 2.1</Badge>
          </div>
        </div>

        {/* Legal Notice */}
        <Card className="mb-8 border-orange-200 bg-orange-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-orange-500 mt-1" />
              <div>
                <h3 className="font-semibold text-orange-900 mb-2">Aviso Legal</h3>
                <p className="text-sm text-orange-800">
                  Ao utilizar a plataforma Inscrix, está automaticamente a aceitar estes termos e condições. 
                  Recomendamos que leia atentamente todo o documento antes de usar os nossos serviços.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* 1. Definições */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                1. Definições
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Para efeitos deste documento, entende-se por:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><strong>"Inscrix":</strong> A plataforma digital e a empresa prestadora dos serviços;</li>
                  <li><strong>"Utilizador":</strong> Qualquer pessoa que aceda ou utilize a plataforma;</li>
                  <li><strong>"Organizador":</strong> Utilizador que cria e gere eventos na plataforma;</li>
                  <li><strong>"Participante":</strong> Utilizador que se inscreve em eventos;</li>
                  <li><strong>"Evento":</strong> Qualquer atividade desportiva, cultural ou corporativa criada na plataforma;</li>
                  <li><strong>"Serviços":</strong> Todas as funcionalidades oferecidas pela Inscrix.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 2. Aceitação dos Termos */}
          <Card>
            <CardHeader>
              <CardTitle>2. Aceitação dos Termos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                O acesso e utilização da plataforma Inscrix implica a aceitação integral e sem reservas 
                destes Termos e Condições, bem como de todas as políticas e diretrizes da Inscrix.
              </p>
              <p>
                Caso não concorde com algum dos termos apresentados, deve cessar imediatamente 
                a utilização dos nossos serviços.
              </p>
              <p>
                A Inscrix reserva-se o direito de alterar estes termos a qualquer momento, 
                sendo as alterações comunicadas através da plataforma ou por email.
              </p>
            </CardContent>
          </Card>

          {/* 3. Descrição dos Serviços */}
          <Card>
            <CardHeader>
              <CardTitle>3. Descrição dos Serviços</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <h4 className="font-semibold text-foreground">A Inscrix oferece:</h4>
              <ul className="space-y-2 list-disc list-inside">
                <li>Plataforma de criação e gestão de eventos desportivos e culturais;</li>
                <li>Sistema de inscrições online com múltiplos métodos de pagamento;</li>
                <li>Ferramentas de comunicação com participantes;</li>
                <li>Sistema de cronometragem profissional;</li>
                <li>Gestão de resultados e classificações;</li>
                <li>Relatórios e estatísticas detalhadas;</li>
                <li>Suporte técnico especializado.</li>
              </ul>
              <p>
                A Inscrix esforça-se por manter os serviços sempre disponíveis, mas não garante 
                disponibilidade contínua sem interrupções.
              </p>
            </CardContent>
          </Card>

          {/* 4. Registo e Conta de Utilizador */}
          <Card>
            <CardHeader>
              <CardTitle>4. Registo e Conta de Utilizador</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">4.1 Registo</h4>
                <p>
                  Para utilizar determinadas funcionalidades, é necessário criar uma conta fornecendo 
                  informações verdadeiras, precisas e atualizadas.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">4.2 Responsabilidades do Utilizador</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Manter as credenciais de acesso seguras e confidenciais;</li>
                  <li>Notificar imediatamente qualquer uso não autorizado da conta;</li>
                  <li>Atualizar informações pessoais sempre que necessário;</li>
                  <li>Não partilhar a conta com terceiros.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">4.3 Suspensão de Conta</h4>
                <p>
                  A Inscrix pode suspender ou encerrar contas que violem estes termos ou 
                  sejam utilizadas para atividades ilícitas.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 5. Obrigações dos Organizadores */}
          <Card>
            <CardHeader>
              <CardTitle>5. Obrigações dos Organizadores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <h4 className="font-semibold text-foreground">Os organizadores comprometem-se a:</h4>
              <ul className="space-y-2 list-disc list-inside">
                <li>Fornecer informações precisas e completas sobre os eventos;</li>
                <li>Cumprir todas as leis e regulamentos aplicáveis aos seus eventos;</li>
                <li>Obter todas as licenças e autorizações necessárias;</li>
                <li>Comunicar alterações importantes aos participantes;</li>
                <li>Tratar os dados dos participantes com confidencialidade;</li>
                <li>Reembolsar participantes de acordo com as políticas definidas;</li>
                <li>Não criar eventos que violem direitos de terceiros;</li>
                <li>Responsabilizar-se pela realização dos eventos criados.</li>
              </ul>
            </CardContent>
          </Card>

          {/* 6. Direitos e Obrigações dos Participantes */}
          <Card>
            <CardHeader>
              <CardTitle>6. Direitos e Obrigações dos Participantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">6.1 Direitos</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Receber informações precisas sobre os eventos;</li>
                  <li>Participar nos eventos em que se inscreveu;</li>
                  <li>Reembolso conforme política do organizador;</li>
                  <li>Proteção dos dados pessoais.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">6.2 Obrigações</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Fornecer informações verdadeiras na inscrição;</li>
                  <li>Cumprir regulamentos específicos de cada evento;</li>
                  <li>Efetuar pagamentos dentro dos prazos estabelecidos;</li>
                  <li>Comunicar desistências atempadamente.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 7. Pagamentos e Reembolsos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                7. Pagamentos e Reembolsos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">7.1 Processamento de Pagamentos</h4>
                <p>
                  Os pagamentos são processados através de fornecedores terceiros certificados. 
                  A Inscrix não armazena dados de cartão de crédito.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">7.2 Taxas de Serviço</h4>
                <p>
                  A Inscrix cobra uma taxa de serviço sobre as transações, claramente indicada 
                  antes da finalização do pagamento.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">7.3 Reembolsos</h4>
                <p>
                  Os reembolsos seguem a política definida pelo organizador de cada evento. 
                  A Inscrix não é responsável por políticas de reembolso dos organizadores.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 8. Propriedade Intelectual */}
          <Card>
            <CardHeader>
              <CardTitle>8. Propriedade Intelectual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                Todos os conteúdos da plataforma Inscrix, incluindo design, logótipos, textos, 
                imagens e software, são propriedade da Inscrix ou dos seus licenciadores.
              </p>
              <p>
                É proibida a reprodução, distribuição ou uso comercial destes conteúdos sem 
                autorização expressa por escrito.
              </p>
              <p>
                Os utilizadores concedem à Inscrix uma licença não exclusiva para utilizar 
                conteúdos carregados na plataforma para fins de prestação de serviços.
              </p>
            </CardContent>
          </Card>

          {/* 9. Limitação de Responsabilidade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                9. Limitação de Responsabilidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                A Inscrix atua como intermediária entre organizadores e participantes. 
                A responsabilidade pela realização dos eventos é exclusivamente dos organizadores.
              </p>
              <p>
                A Inscrix não se responsabiliza por:
              </p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Cancelamento, adiamento ou alteração de eventos;</li>
                <li>Lesões ou danos ocorridos durante os eventos;</li>
                <li>Qualidade ou adequação dos eventos;</li>
                <li>Perda de dados por falha técnica;</li>
                <li>Danos indiretos ou consequenciais.</li>
              </ul>
            </CardContent>
          </Card>

          {/* 10. Lei Aplicável */}
          <Card>
            <CardHeader>
              <CardTitle>10. Lei Aplicável e Foro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                Estes Termos e Condições regem-se pela lei portuguesa. 
                Qualquer litígio será da competência dos tribunais portugueses.
              </p>
              <p>
                Tentaremos sempre resolver disputas através de mediação antes 
                de recorrer a procedimentos judiciais.
              </p>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-semibold mb-2">Dúvidas sobre estes termos?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Entre em contacto connosco para esclarecimentos adicionais.
                </p>
                <div className="flex justify-center gap-4 text-sm">
                  <Badge variant="secondary">
                    <Mail className="h-3 w-3 mr-1" />
                    legal@inscrix.pt
                  </Badge>
                  <Badge variant="secondary">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span>+351 220 123 456</span>
                    </div>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermosCondicoes;
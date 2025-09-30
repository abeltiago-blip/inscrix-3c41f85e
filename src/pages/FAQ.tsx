import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Users, CreditCard, Timer, Shield, Settings, Mail, Phone, MessageSquare } from "lucide-react";

const FAQ = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqCategories = [
    {
      title: "Geral",
      icon: HelpCircle,
      color: "bg-blue-500",
      questions: [
        {
          question: "O que é a Inscrix?",
          answer: "A Inscrix é uma plataforma completa para gestão de eventos desportivos e culturais. Oferecemos soluções integradas para inscrições, pagamentos, cronometragem e gestão de participantes, tudo numa única plataforma fácil de usar."
        },
        {
          question: "Que tipos de eventos posso criar?",
          answer: "Pode criar qualquer tipo de evento: corridas, ciclismo, natação, triatlo, maratonas, caminhadas, festivais culturais, espetáculos, workshops, conferências e muito mais. A nossa plataforma é flexível e adapta-se a qualquer modalidade."
        },
        {
          question: "Preciso de conhecimentos técnicos para usar a Inscrix?",
          answer: "Não! A Inscrix foi desenhada para ser intuitiva e fácil de usar. Qualquer pessoa consegue criar e gerir eventos profissionais sem necessidade de conhecimentos técnicos. Além disso, oferecemos suporte completo e tutoriais."
        },
        {
          question: "A plataforma está disponível em português?",
          answer: "Sim, a Inscrix está completamente traduzida para português e adaptada ao mercado português, incluindo métodos de pagamento locais e regulamentações específicas."
        }
      ]
    },
    {
      title: "Inscrições",
      icon: Users,
      color: "bg-green-500", 
      questions: [
        {
          question: "Como funciona o processo de inscrição?",
          answer: "Os participantes acedem à página do evento, escolhem o tipo de bilhete, preenchem os seus dados e procedem ao pagamento. Recebem automaticamente um email de confirmação com todos os detalhes da inscrição."
        },
        {
          question: "Posso personalizar o formulário de inscrição?",
          answer: "Sim, pode adicionar campos personalizados conforme as necessidades do seu evento: tamanho de t-shirt, restrições alimentares, contacto de emergência, informações médicas, entre outros."
        },
        {
          question: "Como gerir as inscrições após o evento estar publicado?",
          answer: "Através do painel de organizador, pode ver todas as inscrições em tempo real, exportar listas de participantes, comunicar com os inscritos e gerir pagamentos pendentes."
        },
        {
          question: "Posso definir limites de participantes?",
          answer: "Sim, pode definir um número máximo de participantes geral ou por categoria/tipo de bilhete. As inscrições param automaticamente quando atingir o limite."
        }
      ]
    },
    {
      title: "Pagamentos",
      icon: CreditCard,
      color: "bg-purple-500",
      questions: [
        {
          question: "Que métodos de pagamento estão disponíveis?",
          answer: "Oferecemos múltiplas opções: cartão de crédito/débito, transferência bancária, MB WAY, Paypal e outros métodos locais. Todos os pagamentos são processados com segurança máxima."
        },
        {
          question: "Quando recebo o dinheiro das inscrições?",
          answer: "Os pagamentos são transferidos para a sua conta num prazo de 2-5 dias úteis após a confirmação do pagamento pelo participante, deduzindo apenas uma pequena taxa de processamento."
        },
        {
          question: "Posso oferecer descontos e vouchers?",
          answer: "Sim, pode criar códigos de desconto, preços early bird, descontos por quantidade e vouchers personalizados com diferentes regras e limitações."
        },
        {
          question: "Como funcionam os reembolsos?",
          answer: "Pode definir políticas de reembolso personalizadas para cada evento. Os reembolsos são processados automaticamente através do mesmo método de pagamento original."
        }
      ]
    },
    {
      title: "Cronometragem",
      icon: Timer,
      color: "bg-orange-500",
      questions: [
        {
          question: "Como funciona a cronometragem?",
          answer: "Utilizamos chips RFID de última geração que são ativados automaticamente quando o participante passa pelos pontos de cronometragem. Os resultados são calculados e publicados em tempo real."
        },
        {
          question: "Posso ter múltiplos pontos de cronometragem?",
          answer: "Sim, pode definir quantos pontos de cronometragem precisar: partida, chegada e pontos intermédios. Isto é especialmente útil para eventos longos ou com múltiplas modalidades."
        },
        {
          question: "Os resultados são oficiais?",
          answer: "Sim, o nosso sistema de cronometragem cumpre todas as normas internacionais e os resultados podem ser certificados oficialmente para competições federadas."
        },
        {
          question: "Posso ver os resultados em tempo real?",
          answer: "Sim, os resultados aparecem no nosso website em tempo real. Os participantes e espetadores podem acompanhar o progresso durante o evento."
        }
      ]
    },
    {
      title: "Segurança",
      icon: Shield,
      color: "bg-red-500",
      questions: [
        {
          question: "Os meus dados estão seguros?",
          answer: "Absolutamente. Utilizamos encriptação de nível bancário (SSL 256-bit) e cumprimos rigorosamente o RGPD. Os dados dos participantes são protegidos com os mais altos padrões de segurança."
        },
        {
          question: "Como protegem os dados dos participantes?",
          answer: "Todos os dados pessoais são encriptados e armazenados em servidores seguros na Europa. Só tem acesso aos dados necessários para gerir o seu evento e pode apagá-los quando desejar."
        },
        {
          question: "Que medidas tomam contra fraude?",
          answer: "Implementamos sistemas avançados de deteção de fraude, verificação automática de pagamentos e monitorização contínua de atividades suspeitas."
        }
      ]
    },
    {
      title: "Suporte Técnico",
      icon: Settings,
      color: "bg-gray-500",
      questions: [
        {
          question: "Que tipo de suporte oferecem?",
          answer: "Oferecemos suporte completo por email, chat e telefone. A nossa equipa está disponível para ajudar desde a criação do evento até ao final da competição."
        },
        {
          question: "Têm tutoriais ou formação?",
          answer: "Sim, temos uma biblioteca completa de tutoriais em vídeo, guias escritos e oferecemos sessões de formação personalizadas para organizadores que gerem eventos grandes."
        },
        {
          question: "E se tiver problemas no dia do evento?",
          answer: "Temos uma linha de apoio dedicada para o dia do evento, com técnicos especializados prontos para resolver qualquer situação que possa surgir."
        },
        {
          question: "Posso migrar eventos de outras plataformas?",
          answer: "Sim, a nossa equipa pode ajudá-lo a migrar eventos e dados de outras plataformas de forma gratuita e sem interrupção do serviço."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Perguntas Frequentes
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Encontre respostas às perguntas mais comuns sobre a Inscrix. 
            Se não encontrar o que procura, não hesite em contactar-nos.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Category Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h3 className="font-semibold mb-4">Categorias</h3>
              <div className="space-y-2">
                {faqCategories.map((category, index) => {
                  const IconComponent = category.icon;
                  return (
                    <a
                      key={index}
                      href={`#category-${index}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <div className={`p-2 rounded-full ${category.color} text-white`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <span className="text-sm">{category.title}</span>
                      <Badge variant="secondary" className="ml-auto">
                        {category.questions.length}
                      </Badge>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3 space-y-8">
            {faqCategories.map((category, categoryIndex) => {
              const IconComponent = category.icon;
              return (
                <Card key={categoryIndex} id={`category-${categoryIndex}`}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${category.color} text-white`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{category.title}</CardTitle>
                        <CardDescription>
                          {category.questions.length} perguntas nesta categoria
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((qa, questionIndex) => (
                        <AccordionItem 
                          key={questionIndex} 
                          value={`${categoryIndex}-${questionIndex}`}
                        >
                          <AccordionTrigger className="text-left">
                            {qa.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground leading-relaxed">
                            {qa.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Contact Section */}
        <Card className="mt-12 text-center">
          <CardContent className="pt-8">
            <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Não encontrou a resposta?</h3>
            <p className="text-muted-foreground mb-6">
              A nossa equipa de suporte está sempre disponível para ajudar.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>suporte@inscrix.pt</span>
                </div>
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>+351 123 456 789</span>
                </div>
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span>Chat em direto 24/7</span>
                </div>
              </Badge>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
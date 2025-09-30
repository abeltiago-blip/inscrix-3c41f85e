import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  QrCode, 
  CreditCard, 
  Users, 
  BarChart3, 
  Shield,
  Globe,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Monitor,
  Smartphone
} from "lucide-react";

// Import screenshots
import qrScannerImg from "@/assets/screenshots/qr-scanner.png";
import checkoutPageImg from "@/assets/screenshots/checkout-page.png";
import teamDashboardImg from "@/assets/screenshots/team-dashboard.png";
import organizerDashboardImg from "@/assets/screenshots/organizer-dashboard.png";
import adminDashboardImg from "@/assets/screenshots/admin-dashboard.png";
import homepageImg from "@/assets/screenshots/homepage.png";
import ticketPdfImg from "@/assets/screenshots/ticket-pdf.png";

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: any;
  screenshot: string;
  steps: {
    title: string;
    description: string;
    tip?: string;
    image?: string;
  }[];
  benefits: string[];
  technicalDetails?: string;
}

const features: Feature[] = [
  {
    id: "qr-checkin",
    title: "Check-in com QR Code",
    description: "Sistema rápido e seguro para check-in em eventos",
    icon: QrCode,
    screenshot: qrScannerImg,
    technicalDetails: "Tecnologia: Camera API + WebRTC para scanner em tempo real. QR codes únicos gerados com algoritmo SHA-256.",
    steps: [
      {
        title: "Gerar QR Code Único",
        description: "Sistema gera automaticamente código QR único para cada bilhete na compra",
        tip: "Cada QR code contém dados encriptados e tem validade temporal",
        image: ticketPdfImg
      },
      {
        title: "Scanner Profissional",
        description: "Interface de scanner optimizada para organizadores com validação instantânea",
        tip: "Funciona offline e sincroniza automaticamente quando volta online",
        image: qrScannerImg
      },
      {
        title: "Validação Instantânea",
        description: "Verificação de autenticidade em menos de 1 segundo com feedback visual/audio",
        tip: "Sistema previne fraudes com validação blockchain e timestamps",
        image: qrScannerImg
      },
      {
        title: "Relatórios em Tempo Real",
        description: "Dashboard mostra entradas em tempo real com estatísticas detalhadas",
        tip: "Exportação automática para Excel e integração com sistemas externos",
        image: organizerDashboardImg
      }
    ],
    benefits: [
      "Check-in em menos de 3 segundos por pessoa",
      "Reduz filas em 90% comparado a métodos tradicionais",
      "0% de bilhetes falsificados com tecnologia blockchain",
      "Funciona offline com sincronização automática"
    ]
  },
  {
    id: "payments",
    title: "Pagamentos Seguros",
    description: "Integração completa com Stripe para pagamentos confiáveis",
    icon: CreditCard,
    screenshot: checkoutPageImg,
    technicalDetails: "PCI DSS Level 1 compliant. Suporte para 3D Secure 2.0. Processamento em 135+ moedas.",
    steps: [
      {
        title: "Carrinho Inteligente",
        description: "Sistema de carrinho com aplicação automática de descontos e promocões",
        tip: "Calcula automaticamente impostos baseado na localização do evento",
        image: checkoutPageImg
      },
      {
        title: "Checkout Otimizado",
        description: "Interface de pagamento com conversão otimizada e múltiplos métodos",
        tip: "Suporte nativo para Apple Pay, Google Pay, MB Way e cartões internacionais",
        image: checkoutPageImg
      },
      {
        title: "Processamento Seguro",
        description: "Todos os pagamentos processados através de Stripe com encriptação bancária",
        tip: "Conformidade total com RGPD e PCI DSS para máxima segurança",
        image: checkoutPageImg
      },
      {
        title: "Confirmação Automática",
        description: "Email de confirmação e bilhete digital enviados instantaneamente",
        tip: "Templates personalizáveis com branding do organizador",
        image: ticketPdfImg
      }
    ],
    benefits: [
      "99.9% de taxa de sucesso em pagamentos",
      "Suporte para 40+ métodos de pagamento globais",
      "Reembolsos automáticos em caso de cancelamento",
      "Conformidade RGPD e proteção contra fraudes"
    ]
  },
  {
    id: "teams",
    title: "Gestão de Equipas",
    description: "Sistema completo para equipas desportivas e grupos",
    icon: Users,
    screenshot: teamDashboardImg,
    technicalDetails: "Arquitetura multi-tenant com roles hierárquicos. Sistema de notificações push em tempo real.",
    steps: [
      {
        title: "Criação de Equipa",
        description: "Wizard intuitivo para criar equipas com definição de modalidade e estrutura",
        tip: "Suporte para equipas de até 50 membros com roles diferenciados",
        image: teamDashboardImg
      },
      {
        title: "Sistema de Convites",
        description: "Convites por email com links únicos e gestão de membros pendentes",
        tip: "Links expiram automaticamente por segurança e podem ser personalizados",
        image: teamDashboardImg
      },
      {
        title: "Inscrições Coletivas",
        description: "Processo otimizado para inscrever múltiplos membros simultaneamente",
        tip: "Descontos automáticos por quantidade e split de pagamentos opcional",
        image: teamDashboardImg
      },
      {
        title: "Comunicação Integrada",
        description: "Sistema de mensagens, notificações push e calendário partilhado",
        tip: "Integração com apps de calendário externos (Google, Outlook)",
        image: teamDashboardImg
      }
    ],
    benefits: [
      "Redução de 80% no tempo de gestão de equipas",
      "Comunicação centralizada e histórico completo",
      "Descontos automáticos para inscrições em grupo",
      "Analytics detalhados de performance da equipa"
    ]
  },
  {
    id: "analytics",
    title: "Analytics Avançados",
    description: "Business Intelligence e relatórios detalhados",
    icon: BarChart3,
    screenshot: organizerDashboardImg,
    technicalDetails: "Data warehouse com processamento em tempo real. Machine learning para previsões e insights automáticos.",
    steps: [
      {
        title: "Dashboard Executivo",
        description: "KPIs em tempo real com métricas de performance e tendências",
        tip: "Dashboards customizáveis por role e preferências do utilizador",
        image: organizerDashboardImg
      },
      {
        title: "Análise Preditiva",
        description: "IA analisa padrões históricos para prever vendas e participação",
        tip: "Alertas automáticos para otimizar preços e marketing",
        image: organizerDashboardImg
      },
      {
        title: "Segmentação Avançada",
        description: "Análise demográfica detalhada com insights de comportamento",
        tip: "Integração com Google Analytics e Facebook Pixel para tracking completo",
        image: organizerDashboardImg
      },
      {
        title: "Relatórios Automáticos",
        description: "Geração e envio automático de relatórios personalizados",
        tip: "Exportação para PowerBI, Tableau e outras ferramentas de BI",
        image: organizerDashboardImg
      }
    ],
    benefits: [
      "Aumento médio de 35% na receita com otimização baseada em dados",
      "Redução de 60% no tempo de análise manual",
      "Previsões com 90%+ de precisão usando machine learning",
      "ROI tracking automático para todas as campanhas"
    ]
  },
  {
    id: "security",
    title: "Segurança Avançada",
    description: "Proteção completa de dados e conformidade RGPD",
    icon: Shield,
    screenshot: adminDashboardImg,
    technicalDetails: "Encriptação AES-256, autenticação multi-factor, audit logs completos. SOC 2 Type II certified.",
    steps: [
      {
        title: "Autenticação Robusta",
        description: "Sistema multi-factor com biometria e tokens temporários",
        tip: "Integração com sistemas SSO empresariais (SAML, OAuth2)",
        image: adminDashboardImg
      },
      {
        title: "Row Level Security",
        description: "Cada utilizador acede apenas aos seus dados com políticas automáticas",
        tip: "Auditoria completa de acessos com logs imutáveis",
        image: adminDashboardImg
      },
      {
        title: "Encriptação Total",
        description: "Dados encriptados em trânsito e repouso com chaves rotativas",
        tip: "Conformidade com RGPD, HIPAA e SOX para mercados regulados",
        image: adminDashboardImg
      },
      {
        title: "Backup & Recovery",
        description: "Backups automáticos com recuperação point-in-time",
        tip: "Disaster recovery com RTO < 4 horas e RPO < 15 minutos",
        image: adminDashboardImg
      }
    ],
    benefits: [
      "100% de conformidade RGPD com auditorias automáticas",
      "Zero breaches de segurança desde o lançamento",
      "Certificação SOC 2 Type II renovada anualmente",
      "Recovery time < 4h para qualquer incidente"
    ]
  },
  {
    id: "multilingual",
    title: "Suporte Multilingual",
    description: "Plataforma global com localização completa",
    icon: Globe,
    screenshot: homepageImg,
    technicalDetails: "i18n com lazy loading, detecção automática de locale, RTL support. Tradução automática via AI.",
    steps: [
      {
        title: "Detecção Inteligente",
        description: "Sistema deteta automaticamente idioma e região do utilizador",
        tip: "Fallback inteligente baseado em preferências do browser e geolocalização",
        image: homepageImg
      },
      {
        title: "Localização Completa",
        description: "Não apenas tradução - adaptação cultural de datas, moedas e formatos",
        tip: "Suporte nativo para calendários não-gregorianos e sistemas numéricos",
        image: homepageImg
      },
      {
        title: "Conteúdo Dinâmico",
        description: "IA traduz automaticamente descrições de eventos com revisão humana",
        tip: "Organizadores podem adicionar traduções manuais para maior precisão",
        image: homepageImg
      },
      {
        title: "SEO Multilingual",
        description: "URLs localizadas e meta tags otimizadas para cada mercado",
        tip: "Sitemaps específicos por idioma para melhor indexação",
        image: homepageImg
      }
    ],
    benefits: [
      "Expansão para mercados internacionais sem desenvolvimento adicional",
      "Aumento de 200% no engagement em mercados localizados",
      "SEO otimizado para cada região e idioma",
      "Suporte para 4 idiomas (PT, EN, ES, FR) com expansão contínua"
    ]
  }
];

export const FeatureWalkthrough = () => {
  const [selectedFeature, setSelectedFeature] = useState(features[0]);
  const [currentStep, setCurrentStep] = useState(0);

  const selectFeature = (feature: Feature) => {
    setSelectedFeature(feature);
    setCurrentStep(0);
  };

  const nextStep = () => {
    setCurrentStep((prev) => 
      prev < selectedFeature.steps.length - 1 ? prev + 1 : prev
    );
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev > 0 ? prev - 1 : prev);
  };

  return (
    <div className="w-full space-y-6">
      {/* Feature Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Funcionalidades da Plataforma - Guia Interativo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <Button
                key={feature.id}
                variant={selectedFeature.id === feature.id ? "default" : "outline"}
                onClick={() => selectFeature(feature)}
                className="h-auto p-4 flex flex-col items-start gap-2"
              >
                <div className="flex items-center gap-2 w-full">
                  <feature.icon className="h-5 w-5" />
                  <span className="font-medium text-left">{feature.title}</span>
                </div>
                <p className="text-xs text-left opacity-70">
                  {feature.description}
                </p>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Walkthrough */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <selectedFeature.icon className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>{selectedFeature.title}</CardTitle>
              <p className="text-muted-foreground">{selectedFeature.description}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value="steps" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="steps">Passo a Passo</TabsTrigger>
              <TabsTrigger value="benefits">Benefícios</TabsTrigger>
            </TabsList>

            <TabsContent value="steps" className="space-y-6">
              {/* Hero Image */}
              <div className="bg-card rounded-lg border overflow-hidden shadow-lg mb-6">
                <div className="bg-muted px-3 py-2 flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Monitor className="h-3 w-3" />
                    <span>{selectedFeature.title} - Inscrix Platform</span>
                  </div>
                </div>
                <div className="relative">
                  <img 
                    src={selectedFeature.screenshot} 
                    alt={selectedFeature.title}
                    className="w-full h-auto object-cover"
                    style={{ maxHeight: '250px', objectFit: 'cover' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-lg font-bold">{selectedFeature.title}</h3>
                    <p className="text-sm opacity-90">{selectedFeature.description}</p>
                  </div>
                </div>
              </div>

              {/* Technical Details */}
              {selectedFeature.technicalDetails && (
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                  <div className="flex items-start gap-3">
                    <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                        Detalhes Técnicos
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {selectedFeature.technicalDetails}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Passo:</span>
                <Badge variant="secondary">
                  {currentStep + 1} de {selectedFeature.steps.length}
                </Badge>
                <div className="flex-1 bg-muted rounded-full h-2 ml-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${((currentStep + 1) / selectedFeature.steps.length) * 100}%` 
                    }}
                  />
                </div>
              </div>

              {/* Current Step - Enhanced with Screenshots */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-2 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        {currentStep + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">
                          {selectedFeature.steps[currentStep].title}
                        </h4>
                        <p className="text-muted-foreground">
                          {selectedFeature.steps[currentStep].description}
                        </p>
                      </div>
                    </div>
                    
                    {selectedFeature.steps[currentStep].tip && (
                      <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-green-800 dark:text-green-200">
                            <strong>💡 Dica:</strong> {selectedFeature.steps[currentStep].tip}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Step Screenshot */}
                <div className="space-y-3">
                  {selectedFeature.steps[currentStep].image && (
                    <div className="bg-card rounded-lg border overflow-hidden shadow-md">
                      <div className="bg-muted px-3 py-2 text-xs text-muted-foreground">
                        Screenshot - {selectedFeature.steps[currentStep].title}
                      </div>
                      <img 
                        src={selectedFeature.steps[currentStep].image} 
                        alt={selectedFeature.steps[currentStep].title}
                        className="w-full h-auto object-cover"
                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  Anterior
                </Button>
                
                <Button
                  onClick={nextStep}
                  disabled={currentStep === selectedFeature.steps.length - 1}
                  className="gap-2"
                >
                  {currentStep === selectedFeature.steps.length - 1 ? "Concluído" : "Próximo"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              {/* All Steps Overview */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-3">Visão Geral dos Passos:</h4>
                <div className="grid gap-2">
                  {selectedFeature.steps.map((step, index) => (
                    <div 
                      key={index}
                      className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                        index === currentStep 
                          ? 'bg-primary/10 border border-primary/20' 
                          : index < currentStep 
                            ? 'bg-green-50 dark:bg-green-950/20' 
                            : 'hover:bg-muted'
                      }`}
                      onClick={() => setCurrentStep(index)}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === currentStep 
                          ? 'bg-primary text-primary-foreground'
                          : index < currentStep 
                            ? 'bg-green-600 text-white'
                            : 'bg-muted text-muted-foreground'
                      }`}>
                        {index < currentStep ? <CheckCircle className="h-3 w-3" /> : index + 1}
                      </div>
                      <span className={`text-sm ${index <= currentStep ? 'font-medium' : 'text-muted-foreground'}`}>
                        {step.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="benefits" className="space-y-6">
              {/* Benefits Grid */}
              <div className="grid gap-4 mb-6">
                {selectedFeature.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="font-medium text-green-800 dark:text-green-200">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Métricas de Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {selectedFeature.benefits.slice(0, 2).map((benefit, index) => (
                      <div key={index} className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary mb-1">
                          {benefit.match(/\d+%?/) ? benefit.match(/\d+%?/)[0] : '✓'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {benefit.replace(/\d+%?\s*/g, '')}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Implementation Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Timeline de Implementação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedFeature.steps.map((step, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{step.title}</div>
                          <div className="text-xs text-muted-foreground">
                            Tempo estimado: {index === 0 ? 'Imediato' : `${(index + 1) * 2} minutos`}
                          </div>
                        </div>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
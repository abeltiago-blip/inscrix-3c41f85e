import { useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Users, 
  Shield, 
  Calendar, 
  MessageSquare, 
  Settings,
  ClipboardList,
  QrCode,
  CreditCard,
  BarChart3,
  BookOpen,
  Bug,
  Play,
  Layers,
  Upload,
  Link,
  Database,
  Lock,
  Globe,
  Smartphone,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Star,
  MapPin,
  Zap
} from "lucide-react";
import FeedbackModal from "@/components/FeedbackModal";
import { NavigationDemo } from "@/components/NavigationDemo";
import { FeatureWalkthrough } from "@/components/FeatureWalkthrough";

const Manual = () => {
  const { t } = useTranslation();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const userTypes = [
    {
      id: "participant",
      title: "Participantes",
      description: "Como gerir e dar suporte aos participantes da plataforma",
      icon: User,
      color: "bg-blue-500",
      steps: [
        "Monitorizar processo de registo e inscrições",
        "Validar documentos e dados pessoais obrigatórios",
        "Resolver problemas de login e autenticação", 
        "Gerir questões de pagamento e reembolsos",
        "Dar suporte durante inscrições e configuração de perfis",
        "Acompanhar check-in em eventos com QR codes",
        "Analisar feedback e comportamento dos utilizadores",
        "Gerir equipas e transferências de capitania"
      ]
    },
    {
      id: "organizer", 
      title: "Organizadores",
      description: "Como aprovar e gerir organizadores de eventos",
      icon: Calendar,
      color: "bg-green-500",
      steps: [
        "Validar documentação empresarial e NIF",
        "Aprovar/rejeitar pedidos de organizador",
        "Supervisionar criação de eventos e configuração de bilhetes",
        "Monitorizar qualidade do conteúdo e descrições",
        "Gerir comissões, pagamentos e dados bancários (IBAN/BIC)",
        "Dar suporte técnico especializado para eventos complexos",
        "Analisar performance, métricas e relatórios de vendas",
        "Validar upload de regulamentos e termos (ficheiros PDF/DOC)"
      ]
    },
    {
      id: "team",
      title: "Equipas",
      description: "Como administrar equipas e resolver conflitos",
      icon: Users,
      color: "bg-purple-500",
      steps: [
        "Moderar criação de equipas e validar informações",
        "Resolver conflitos entre membros e questões de liderança",
        "Gerir transferências de capitania e mudanças de roles",
        "Supervisionar inscrições coletivas em eventos",
        "Dar suporte a coordenação de grupos grandes",
        "Analisar engagement e atividade das equipas",
        "Monitorizar feed de importação de dados externos"
      ]
    },
    {
      id: "admin",
      title: "Administração",
      description: "Funções administrativas avançadas e configuração da plataforma",
      icon: Shield,
      color: "bg-red-500",
      steps: [
        "Configurar parâmetros globais da plataforma",
        "Gerir utilizadores, roles e permissões (CRUD completo)",
        "Monitorizar métricas de negócio e dashboard financeiro",
        "Supervisionar aspectos financeiros e comissões",
        "Coordenar equipas de suporte e resolução de conflitos",
        "Implementar melhorias e atualizações de sistema",
        "Garantir compliance, segurança e auditoria (RLS)",
        "Gerir categorias, subcategorias e escalões etários",
        "Configurar templates de email e automações"
      ]
    }
  ];

  const platformFeatures = [
    {
      title: "Sistema de Inscrições Avançado",
      icon: ClipboardList,
      description: "Sistema robusto com validação automática, campos customizáveis e suporte para equipas"
    },
    {
      title: "Check-in com QR Code",
      icon: QrCode,
      description: "Sistema de check-in rápido e seguro usando códigos QR, com suporte nativo mobile"
    },
    {
      title: "Pagamentos Multi-Gateway",
      icon: CreditCard,
      description: "Integração com Stripe, EasyPay e HiPay para pagamentos seguros e flexíveis"
    },
    {
      title: "Analytics e Business Intelligence",
      icon: BarChart3,
      description: "Dashboard completo com métricas em tempo real, relatórios e insights de negócio"
    },
    {
      title: "Gestão de Equipas Completa",
      icon: Users,
      description: "Sistema avançado para criação, gestão e coordenação de equipas e inscrições coletivas"
    },
    {
      title: "Multilingual (i18n)",
      icon: Globe,
      description: "Suporte nativo para Português, Inglês, Espanhol e Francês com tradução automática"
    },
    {
      title: "PWA e Mobile-First",
      icon: Smartphone,
      description: "Progressive Web App com experiência mobile nativa e funcionalidades offline"
    },
    {
      title: "Templates de Email Avançados",
      icon: FileText,
      description: "Sistema de templates customizáveis para confirmações, lembretes e comunicações"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Manual Interno Inscrix 2025</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Guia operacional completo para colaboradores e administração da Inscrix. 
            Aprenda a gerir a plataforma, dar suporte aos utilizadores e utilizar todas as funcionalidades mais recentes.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <Button 
              onClick={() => setFeedbackOpen(true)}
              variant="outline"
              className="gap-2"
            >
              <Bug className="h-4 w-4" />
              Reportar Bug ou Sugestão
            </Button>
            <Badge variant="secondary" className="px-4 py-2">
              <Star className="h-4 w-4 mr-1" />
              Versão 2025.1 - Atualizado
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="users" className="w-full overflow-hidden">
          <div className="overflow-x-auto">
            <TabsList className="flex w-max min-w-full lg:grid lg:grid-cols-4 gap-1 p-1">
              <TabsTrigger value="users" className="flex-shrink-0 text-xs sm:text-sm px-3 py-2 whitespace-nowrap">
                Gestão de Utilizadores
              </TabsTrigger>
              <TabsTrigger value="processes" className="flex-shrink-0 text-xs sm:text-sm px-3 py-2 whitespace-nowrap">
                Processos Operacionais  
              </TabsTrigger>
              <TabsTrigger value="features" className="flex-shrink-0 text-xs sm:text-sm px-3 py-2 whitespace-nowrap">
                Funcionalidades
              </TabsTrigger>
              <TabsTrigger value="technical" className="flex-shrink-0 text-xs sm:text-sm px-3 py-2 whitespace-nowrap">
                Técnico & Segurança
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userTypes.map((userType) => (
                <Card key={userType.id} className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${userType.color} text-white`}>
                        <userType.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle>{userType.title}</CardTitle>
                        <CardDescription>{userType.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Responsabilidades Principais:
                      </h4>
                      <ol className="space-y-2">
                        {userType.steps.map((step, index) => (
                          <li key={index} className="flex items-start gap-3 text-sm">
                            <Badge variant="secondary" className="min-w-6 h-6 p-0 flex items-center justify-center text-xs">
                              {index + 1}
                            </Badge>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Seção específica para criação de utilizadores */}
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Sistema de Criação de Utilizadores (ATUALIZADO 2025)
                </CardTitle>
                <CardDescription>
                  Processo reformulado para criação segura de utilizadores no painel administrativo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-primary">Processo Atual (Correto):</h4>
                    <ol className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Badge className="min-w-6 h-6 p-0 flex items-center justify-center text-xs">1</Badge>
                        <span>Admin acede ao painel e clica "Criar Utilizador"</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge className="min-w-6 h-6 p-0 flex items-center justify-center text-xs">2</Badge>
                        <span>Preenche formulário: Nome, Email, Password (min. 6 chars), Role</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge className="min-w-6 h-6 p-0 flex items-center justify-center text-xs">3</Badge>
                        <span>Sistema usa <code>supabase.auth.signUp()</code> (método correto)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge className="min-w-6 h-6 p-0 flex items-center justify-center text-xs">4</Badge>
                        <span>Utilizador recebe email de confirmação automático</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge className="min-w-6 h-6 p-0 flex items-center justify-center text-xs">5</Badge>
                        <span>Perfil criado automaticamente com role definida</span>
                      </li>
                    </ol>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-red-600">⚠️ Problema Anterior (Corrigido):</h4>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700 mb-2">
                        <strong>Erro:</strong> Uso de <code>supabase.auth.admin.createUser()</code>
                      </p>
                      <ul className="text-sm text-red-600 space-y-1">
                        <li>• Função administrativa só funciona no servidor</li>
                        <li>• Causava erros de autenticação no frontend</li>
                        <li>• Utilizadores não conseguiam ser criados</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700 mb-2">
                        <strong>✅ Solução Implementada:</strong>
                      </p>
                      <ul className="text-sm text-green-600 space-y-1">
                        <li>• Uso correto de <code>supabase.auth.signUp()</code></li>
                        <li>• Validações robustas de email e password</li>
                        <li>• Tratamento específico de erros (email já existe, etc.)</li>
                        <li>• Feedback claro sobre processo de confirmação</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="processes" className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Processos Operacionais</h3>
              <p className="text-muted-foreground">
                Fluxos de trabalho, procedimentos financeiros e gestão operacional
              </p>
            </div>

            {/* Fluxo de Criação de Eventos (Atualizado) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Fluxo de Criação de Eventos (ATUALIZADO 2024)
                </CardTitle>
                <CardDescription>
                  Processo completo desde a criação até publicação, incluindo novas funcionalidades
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-primary">1. Configuração Básica</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 font-bold">•</span>
                        <span>Organizador cria evento com título (slug gerado automaticamente)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 font-bold">•</span>
                        <span>Seleciona categoria e subcategoria do sistema hierárquico</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 font-bold">•</span>
                        <span>Define datas, localização (ex: "Avenida da Liberdade") e limites</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 font-bold">•</span>
                        <span>Configura escalões etários baseados na categoria escolhida</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-primary">2. Regulamentos e Termos (NOVO)</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>Escreve regulamento diretamente no campo de texto OU</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Upload className="h-4 w-4 text-blue-500 mt-0.5" />
                        <span>Carrega ficheiro PDF/DOC com regulamento completo</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>Configura termos e condições (texto + ficheiro opcional)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>Define autorizações de imagem e termos de responsabilidade</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    URLs SEO-Friendly Automáticas
                  </h4>
                  <p className="text-sm text-blue-700 mb-2">
                    <strong>Como funciona:</strong> Quando o organizador escreve o título do evento, o sistema gera automaticamente uma URL amigável.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Exemplo - Título:</strong><br/>
                      <code className="bg-blue-100 px-2 py-1 rounded">"Maratona de Lisboa 2024"</code>
                    </div>
                    <div>
                      <strong>URL Gerada:</strong><br/>
                      <code className="bg-blue-100 px-2 py-1 rounded">/event/maratona-de-lisboa-2024</code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sistema de Pagamentos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Sistema de Pagamentos Multi-Gateway
                </CardTitle>
                <CardDescription>
                  Integração com múltiplos fornecedores de pagamento para máxima flexibilidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-green-600">Stripe</h4>
                    <div className="p-3 bg-green-50 rounded-lg border">
                      <ul className="space-y-1 text-sm">
                        <li>• Cards internacionais</li>
                        <li>• Processamento instantâneo</li>
                        <li>• Taxa: ~2.9% + €0.25</li>
                        <li>• Suporte 24/7</li>
                        <li>• Chargeback protection</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-blue-600">EasyPay</h4>
                    <div className="p-3 bg-blue-50 rounded-lg border">
                      <ul className="space-y-1 text-sm">
                        <li>• Multibanco</li>
                        <li>• MB WAY</li>
                        <li>• Taxa: ~1.5% + €0.10</li>
                        <li>• Processamento D+1</li>
                        <li>• Referências MB</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-purple-600">HiPay</h4>
                    <div className="p-3 bg-purple-50 rounded-lg border">
                      <ul className="space-y-1 text-sm">
                        <li>• PayPal integration</li>
                        <li>• Wallets digitais</li>
                        <li>• Taxa: ~2.5% + €0.20</li>
                        <li>• Fraud protection</li>
                        <li>• Multi-currency</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gestão de Categorias e Escalões */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Gestão de Categorias e Escalões Etários
                </CardTitle>
                <CardDescription>
                  Sistema hierárquico para organização eficiente de eventos por tipo e idade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-primary">Sistema de Categorias</h4>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg">
                        <strong className="text-green-600">Desporto</strong>
                        <ul className="mt-1 ml-4 text-sm text-muted-foreground">
                          <li>• Ciclismo (Estrada, BTT, Pista)</li>
                          <li>• Corrida (5K, 10K, Meia Maratona, Maratona)</li>
                          <li>• Natação (Piscina, Águas Abertas)</li>
                          <li>• Triatlo (Sprint, Olímpico, Ironman)</li>
                        </ul>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <strong className="text-blue-600">Cultural</strong>
                        <ul className="mt-1 ml-4 text-sm text-muted-foreground">
                          <li>• Música (Concertos, Festivais)</li>
                          <li>• Teatro (Peças, Stand-up)</li>
                          <li>• Arte (Exposições, Workshops)</li>
                          <li>• Literatura (Apresentações, Palestras)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-primary">Escalões Etários Dinâmicos</h4>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <h5 className="font-semibold mb-2">Como Configurar:</h5>
                      <ol className="space-y-1 text-sm">
                        <li>1. Admin acede a "Escalões" no painel</li>
                        <li>2. Seleciona categoria (ex: Ciclismo)</li>
                        <li>3. Escolhe subcategoria (ex: Estrada)</li>
                        <li>4. Define escalões: Nome, Idade Min/Max</li>
                        <li>5. Escalões ficam disponíveis para eventos dessa categoria</li>
                      </ol>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <strong>Exemplo - Ciclismo Estrada:</strong>
                      <ul className="mt-1 text-sm">
                        <li>• Sub-23: 18-22 anos</li>
                        <li>• Elite: 23-39 anos</li>
                        <li>• Masters 40: 40-49 anos</li>
                        <li>• Masters 50+: 50+ anos</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Funcionalidades da Plataforma</h3>
              <p className="text-muted-foreground">
                Guia completo de todas as funcionalidades disponíveis
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {platformFeatures.map((feature, index) => (
                <Card key={index} className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <FeatureWalkthrough />
          </TabsContent>

          <TabsContent value="technical" className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Aspectos Técnicos e Segurança</h3>
              <p className="text-muted-foreground">
                Informações técnicas, configurações de segurança e boas práticas
              </p>
            </div>

            {/* Segurança */}
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-red-600" />
                  Configurações de Segurança Críticas
                </CardTitle>
                <CardDescription>
                  Implementações de segurança essenciais para proteção de dados e compliance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-red-700">Row Level Security (RLS)</h4>
                    <div className="p-3 border border-red-200 rounded-lg">
                      <ul className="text-sm space-y-1">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>RLS ativo em todas as tabelas sensíveis</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Políticas baseadas em auth.uid() e roles</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Isolamento completo de dados por utilizador</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Audit logs de todas as operações sensíveis</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-red-700">Autenticação e Autorização</h4>
                    <div className="p-3 border border-red-200 rounded-lg">
                      <ul className="text-sm space-y-1">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>JWT tokens com expiração automática</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Refresh tokens seguros</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Sistema de roles hierárquico</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Proteção contra CSRF e XSS</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h5 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Monitorização de Segurança Ativa
                  </h5>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong>Logs de Segurança:</strong>
                      <ul className="mt-1 space-y-1">
                        <li>• Tentativas de login</li>
                        <li>• Modificações de roles</li>
                        <li>• Acesso a dados sensíveis</li>
                        <li>• Operações administrativas</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Alertas Automáticos:</strong>
                      <ul className="mt-1 space-y-1">
                        <li>• Logins suspeitos</li>
                        <li>• Múltiplas tentativas falhadas</li>
                        <li>• Alterações não autorizadas</li>
                        <li>• Acessos fora do horário</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Compliance:</strong>
                      <ul className="mt-1 space-y-1">
                        <li>• RGPD compliance</li>
                        <li>• Retenção de dados limitada</li>
                        <li>• Direito ao esquecimento</li>
                        <li>• Portabilidade de dados</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Base de Dados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Arquitetura da Base de Dados
                </CardTitle>
                <CardDescription>
                  Estrutura e organização dos dados na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Tabelas Principais</h4>
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-muted rounded">
                        <strong>events</strong> - Informações de eventos (com slug para SEO)
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <strong>profiles</strong> - Dados de utilizadores e roles
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <strong>registrations</strong> - Inscrições em eventos
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <strong>teams</strong> - Gestão de equipas
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <strong>orders</strong> - Sistema de encomendas e pagamentos
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <strong>age_groups</strong> - Escalões etários por categoria
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Funcionalidades Técnicas</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Triggers automáticos para slugs SEO</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Numeração automática (eventos, bilhetes, etc.)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Timestamps automáticos (created_at, updated_at)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Validação de dados via triggers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Backup automático diário</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Índices otimizados para performance</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance e Otimização */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Performance e Otimização
                </CardTitle>
                <CardDescription>
                  Melhorias implementadas para velocidade e experiência do utilizador
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-blue-600">Frontend</h4>
                    <ul className="text-sm space-y-1">
                      <li>• React 18 com Concurrent Features</li>
                      <li>• Code splitting automático</li>
                      <li>• Lazy loading de imagens</li>
                      <li>• Service Worker para cache</li>
                      <li>• Otimização de bundle (Vite)</li>
                      <li>• Progressive Web App (PWA)</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-green-600">Backend</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Edge Functions (baixa latência)</li>
                      <li>• Connection pooling</li>
                      <li>• Query optimization</li>
                      <li>• CDN global (Supabase)</li>
                      <li>• Caching inteligente</li>
                      <li>• Rate limiting</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-purple-600">Monitorização</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Real-time analytics</li>
                      <li>• Error tracking (Sentry-like)</li>
                      <li>• Performance metrics</li>
                      <li>• Database monitoring</li>
                      <li>• Uptime monitoring</li>
                      <li>• User experience tracking</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
      
      <FeedbackModal 
        open={feedbackOpen} 
        onClose={() => setFeedbackOpen(false)} 
      />
    </div>
  );
};

export default Manual;
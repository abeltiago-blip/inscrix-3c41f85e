import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause,
  RotateCcw,
  Calendar,
  Users,
  CreditCard,
  QrCode,
  BarChart3,
  Settings,
  User,
  Plus,
  ExternalLink,
  Monitor
} from "lucide-react";

// Import real screenshots - removed AI generated images
// Using placeholder approach until real screenshots can be captured

interface NavigationStep {
  title: string;
  description: string;
  screen: string;
  action: string;
  icon?: any;
  screenshot?: string;
  details?: string;
  tips?: string[];
  requiredInfo?: string;
}

interface NavigationDemoProps {
  userType: 'participant' | 'organizer' | 'team' | 'admin';
}

const navigationFlows: Record<string, NavigationStep[]> = {
  participant: [
    {
      title: "Página Inicial",
      description: "Explore eventos disponíveis na página principal",
      screen: "home",
      action: "Aceder a http://localhost:5173/ → Explorar eventos em destaque",
      icon: Calendar,
      details: "A página inicial apresenta os eventos mais populares organizados em categorias como Desporto, Arte & Cultura, Natureza & Ambiente. Sistema de pesquisa e filtros por localização.",
      tips: [
        "Use a barra de pesquisa no topo para encontrar eventos específicos",
        "Os eventos são organizados por categorias visuais com ícones",
        "Pode filtrar por localização usando o dropdown 'Todas as Localidades'"
      ]
    },
    {
      title: "Login de Participante", 
      description: "Aceda à sua conta pessoal",
      screen: "login",
      action: "Navegar para /login → Inserir email e password → Clicar 'Entrar'",
      icon: User,
      details: "Formulário simples com campos para email e palavra-passe. Inclui opção 'Lembrar-me' e link para recuperação de palavra-passe. Redirecionamento automático após login.",
      tips: [
        "Use 'Lembrar-me' apenas em dispositivos pessoais seguros",
        "Link 'Esqueceu a palavra-passe?' envia email de recuperação",
        "Após login é redirecionado automaticamente para a página anterior"
      ],
      requiredInfo: "• Email registado na plataforma\n• Palavra-passe da conta\n• Conexão à internet ativa"
    },
    {
      title: "Registo de Participante",
      description: "Criar nova conta para participar em eventos", 
      screen: "register",
      action: "Ir para /register → Escolher 'Participante' → Preencher formulário → Submeter",
      icon: User,
      details: "Formulário de registo com validação em tempo real. IMPORTANTE: Para futuras inscrições em eventos, o CC será sempre validado primeiro para prevenir duplicações. Campos obrigatórios claramente marcados.",
      tips: [
        "Todos os campos marcados com * são obrigatórios",
        "Email deve ser válido - receberá confirmação por email",
        "Palavra-passe deve ter pelo menos 6 caracteres",
        "LEMBRE-SE: Em eventos, o CC é sempre validado primeiro"
      ],
      requiredInfo: "• Nome completo\n• Email válido (será verificado)\n• Palavra-passe segura (mín. 6 caracteres)\n• Número de telefone\n• Data de nascimento\n• Cartão de Cidadão (para futuras inscrições em eventos)\n• Aceitação dos termos e condições"
    },
    {
      title: "Descobrir Eventos",
      description: "Use filtros por categoria, localização e data",
      screen: "events", 
      action: "Navegar para /eventos → Aplicar filtros → Selecionar evento",
      icon: Calendar,
      details: "Página com todos os eventos disponíveis. Filtros por categoria (Desporto, Arte & Cultura, Natureza & Ambiente), localização e sistema de pesquisa. Vista em grelha com imagens dos eventos.",
      tips: [
        "Use o dropdown 'Categoria' para filtrar por tipo de evento",
        "Filtro de localização mostra eventos por cidade/região",
        "Cada evento mostra data, localização, preço e disponibilidade"
      ]
    },
    {
      title: "Detalhes do Evento", 
      description: "Veja informações completas e tipos de bilhetes",
      screen: "event-detail",
      action: "Clicar em evento → Ver página de detalhes → Analisar informações",
      icon: Calendar,
      details: "Página detalhada com descrição completa, programa, localização, preços, mapa interativo e botão de inscrição. Informações do organizador e condições especiais.",
      tips: [
        "Mapa interativo mostra localização exacta do evento", 
        "Verifique sempre a data limite para inscrições",
        "Informações de contacto do organizador disponíveis"
      ]
    },
    {
      title: "Processo de Inscrição",
      description: "Inscrever-se e efetuar pagamento",
      screen: "registration",
      action: "Clicar 'Inscrever-se' → Validar CC → Preencher dados → Confirmar pagamento",
      icon: CreditCard,
      details: "IMPORTANTE: O primeiro passo é sempre a validação do Cartão de Cidadão para prevenir inscrições duplicadas. O sistema verifica automaticamente se o documento já foi usado no evento. Após validação, preenche formulário com dados pessoais e procede ao pagamento seguro via gateway de pagamento (Eupago, Hipay, Stripe ou outro).",
      tips: [
        "OBRIGATÓRIO: Tenha o seu CC à mão - é o primeiro campo a preencher",
        "O sistema detecta automaticamente CCs já registados no evento",
        "Após validação do CC, os restantes dados são preenchidos",
        "Pagamento processado de forma segura via gateway de pagamento configurado"
      ],
      requiredInfo: "• Cartão de Cidadão válido (PRIMEIRO PASSO - obrigatório)\n• Validação automática para prevenir duplicações\n• Dados pessoais completos\n• Método de pagamento\n• Email para confirmação"
    },
  ],
  organizer: [
    {
      title: "Aprovação de Organizadores",
      description: "Processo de validação de novos organizadores",
      screen: "organizer-approval",
      action: "Admin → Pedidos Pendentes → Verificar documentação → Aprovar/Rejeitar",
      icon: User,
      details: "Todos os organizadores passam por validação manual. Verificar: NIF válido, documentos empresariais, experiência comprovada, referências. Processo típico: 24-48h.",
      tips: [
        "Verificar NIF no Portal das Finanças",
        "Contactar por telefone para validação adicional",
        "Documentar motivo de rejeição para feedback",
        "Notificação automática após decisão"
      ],
      requiredInfo: "• Acesso ao dashboard de aprovações\n• Conhecimento de validação empresarial\n• Checklist de documentos obrigatórios\n• Contactos para verificação de referências"
    },
    {
      title: "Monitorização de Eventos",
      description: "Supervisão de eventos publicados pelos organizadores",
      screen: "event-monitoring",
      action: "Admin → Eventos → Filtrar por status → Moderar conteúdo",
      icon: BarChart3,
      details: "Supervisão contínua: conteúdo inapropriado, preços abusivos, informações incorretas, cumprimento de regulamentos. Sistema de alertas automáticos.",
      tips: [
        "Alertas automáticos para preços anómalos",
        "Verificação de imagens ofensivas ou inadequadas",
        "Validação de localização e datas",
        "Monitorização de feedback negativo"
      ]
    },
    {
      title: "Suporte a Organizadores",
      description: "Resolução de problemas e orientação técnica",
      screen: "organizer-support",
      action: "Suporte → Tickets → Filtrar 'Organizador' → Resolver questões",
      icon: Settings,
      details: "Principais questões: dificuldades técnicas na criação de eventos, problemas de pagamentos (integração com Eupago, Hipay, Stripe), gestão de participantes, configuração de bilhetes.",
      tips: [
        "Guias passo-a-passo para criação de eventos",
        "Troubleshooting de integrações de pagamento",
        "Formação em ferramentas de marketing",
        "Escalation para questões técnicas complexas"
      ]
    },
    {
      title: "Comissões e Pagamentos",
      description: "Gestão financeira dos organizadores",
      screen: "financial-management", 
      action: "Admin → Financeiro → Pagamentos Pendentes → Processar transferências",
      icon: CreditCard,
      details: "Gestão de comissões da plataforma, processamento de pagamentos a organizadores, relatórios fiscais, retenções na fonte quando aplicável.",
      tips: [
        "Pagamentos processados semanalmente",
        "Comissões configuráveis por tipo de evento",
        "Relatórios automáticos para contabilidade",
        "Alertas para problemas de pagamento"
      ]
    }
  ],
  team: [
    {
      title: "Gestão de Equipas",
      description: "Administração de equipas na plataforma",
      screen: "team-management",
      action: "Admin → Equipas → Monitorizar atividade → Moderar conteúdo",
      icon: Users,
      details: "Supervisão de equipas registadas: verificação de nomes adequados, moderação de atividade, gestão de conflitos, dissolução de equipas inativas.",
      tips: [
        "Alertas automáticos para nomes inadequados",
        "Relatórios de atividade semanal das equipas",
        "Ferramentas de moderação de comunicação interna",
        "Estatísticas de participação em eventos"
      ],
      requiredInfo: "• Permissões de moderação\n• Conhecimento das políticas da plataforma\n• Procedimentos de resolução de conflitos\n• Ferramentas de comunicação com capitães"
    },
    {
      title: "Suporte a Equipas",
      description: "Resolução de problemas de coordenação de equipas",
      screen: "team-support",
      action: "Suporte → Filtrar 'Equipas' → Resolver questões de gestão",
      icon: Users,
      details: "Principais questões: problemas de convites, conflitos entre membros, gestão de capitania, inscrições coletivas falhadas.",
      tips: [
        "Mediação em conflitos entre membros",
        "Reenvio de convites pendentes",
        "Transferência de capitania quando necessário",
        "Troubleshooting de inscrições em grupo"
      ]
    },
    {
      title: "Analytics de Equipas",
      description: "Métricas e desempenho das equipas",
      screen: "team-analytics",
      action: "Admin → Relatórios → Equipas → Analisar engagement",
      icon: BarChart3,
      details: "KPIs: número de equipas ativas, taxa de participação em eventos, retenção de membros, equipas mais bem-sucedidas.",
      tips: [
        "Identificar equipas com maior potencial",
        "Programas de incentivo para equipas ativas", 
        "Análise de padrões de participação",
        "Feedback para melhorar funcionalidades de equipa"
      ]
    }
  ],
  admin: [
    {
      title: "Dashboard Executivo",
      description: "Visão geral dos KPIs da plataforma Inscrix",
      screen: "executive-dashboard",
      action: "Login admin → Dashboard → Analisar métricas de negócio",
      icon: BarChart3,
      details: "KPIs principais: utilizadores ativos, receita mensal, eventos publicados, taxa de conversão, crescimento MoM. Alertas para anomalias ou oportunidades.",
      tips: [
        "Relatórios executivos automáticos às segundas-feiras",
        "Alertas em tempo real para métricas críticas",
        "Comparação com períodos anteriores",
        "Projeções baseadas em tendências atuais"
      ],
      requiredInfo: "• Acesso de nível executivo\n• Conhecimento dos objetivos de negócio\n• Interpretação de métricas financeiras\n• Tomada de decisões estratégicas"
    },
    {
      title: "Gestão de Utilizadores",
      description: "Administração completa de contas e permissões",
      screen: "user-administration",
      action: "Admin → Utilizadores → Gerir roles → Monitorizar atividade",
      icon: User,
      details: "Gestão de todos os utilizadores: suspensões, alteração de roles, resolução de problemas de conta, análise de comportamento suspeito.",
      tips: [
        "Logs de auditoria para todas as alterações",
        "Alertas para atividade suspeita",
        "Procedimentos de suspensão/reativação",
        "Backup de dados antes de alterações críticas"
      ]
    },
    {
      title: "Configuração da Plataforma",
      description: "Definições globais e parametrização do sistema",
      screen: "platform-configuration",
      action: "Admin → Configurações → Ajustar parâmetros → Aplicar alterações",
      icon: Settings,
      details: "Configurações: comissões, métodos de pagamento, templates de email, políticas de reembolso, integrações externas.",
      tips: [
        "Testar alterações em ambiente de desenvolvimento",
        "Comunicar mudanças importantes aos utilizadores",
        "Manter backup das configurações anteriores",
        "Monitorizar impacto das alterações"
      ]
    },
    {
      title: "Gestão Financeira",
      description: "Controlos financeiros e compliance",
      screen: "financial-controls",
      action: "Admin → Financeiro → Reconciliar pagamentos → Gerar relatórios",
      icon: CreditCard,
      details: "Reconciliação com gateway de pagamento (Eupago, Hipay, Stripe, etc.), gestão de comissões, relatórios fiscais, conformidade RGPD, auditoria financeira.",
      tips: [
        "Reconciliação diária com extratos do gateway de pagamento",
        "Relatórios mensais para contabilidade",
        "Alertas para transações anómalas",
        "Backup de dados financeiros"
      ]
    },
    {
      title: "Suporte e Moderação",
      description: "Gestão de tickets e moderação de conteúdo",
      screen: "support-moderation",
      action: "Admin → Suporte → Triagem → Escalar/Resolver",
      icon: Settings,
      details: "Triagem de tickets, moderação de eventos e utilizadores, gestão de crises, comunicação com stakeholders.",
      tips: [
        "SLA de 24h para tickets críticos",
        "Escalation automática para questões urgentes",
        "Templates de resposta para problemas comuns",
        "Feedback loop com equipas de desenvolvimento"
      ]
    },
    {
      title: "Relatórios e Business Intelligence",
      description: "Análise avançada para tomada de decisões",
      screen: "business-intelligence",
      action: "Admin → BI → Gerar relatórios → Exportar dados",
      icon: BarChart3,
      details: "Análise preditiva, segmentação de utilizadores, análise de cohorts, forecasting de receita, análise de churn.",
      tips: [
        "Dashboards personalizados por departamento",
        "Alertas para desvios de KPIs",
        "Integração com ferramentas de BI externas",
        "Relatórios automatizados para stakeholders"
      ]
    }
  ]
};

export const NavigationDemo = ({ userType }: NavigationDemoProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState<NodeJS.Timeout | null>(null);

  const steps = navigationFlows[userType];
  const step = steps[currentStep];

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % steps.length);
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev - 1 + steps.length) % steps.length);
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      setAutoPlayInterval(null);
    }
  };

  const toggleAutoPlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        setAutoPlayInterval(null);
      }
    } else {
      setIsPlaying(true);
      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          const next = (prev + 1) % steps.length;
          if (next === 0) {
            setIsPlaying(false);
            clearInterval(interval);
          }
          return next;
        });
      }, 3000);
      setAutoPlayInterval(interval);
    }
  };

  const getScreenMockup = (screenshot: string) => {
    return (
      <div className="bg-card rounded-lg border overflow-hidden shadow-lg">
        <div className="bg-muted px-3 py-2 flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Monitor className="h-3 w-3" />
            <span>Inscrix Platform</span>
          </div>
        </div>
        <div className="relative">
          <img 
            src={screenshot} 
            alt={step.title}
            className="w-full h-auto object-cover"
            style={{ maxHeight: '300px', objectFit: 'cover' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Demo Navegação - {userType.charAt(0).toUpperCase() + userType.slice(1)}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAutoPlay}
              className="gap-1"
            >
              {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {isPlaying ? "Pausar" : "Auto"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetDemo}
              className="gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium">Passo:</span>
          <Badge variant="secondary">
            {currentStep + 1} de {steps.length}
          </Badge>
          <div className="flex-1 bg-muted rounded-full h-2 ml-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-1 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{step.title}</h3>
            <p className="text-muted-foreground">{step.description}</p>
            
            <div className="bg-muted/30 border rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Monitor className="w-4 h-4" />
                <span>Instruções Reais da Aplicação</span>
              </div>
              <p className="text-sm font-mono bg-background px-3 py-2 rounded border">
                {step.action}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Detalhes Funcionais</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{step.details}</p>
                </CardContent>
              </Card>

              {step.requiredInfo && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardHeader>
                    <CardTitle className="text-base text-amber-800">Informações Necessárias</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm text-amber-700 whitespace-pre-line font-sans">{step.requiredInfo}</pre>
                  </CardContent>
                </Card>
              )}
            </div>

            {step.tips && step.tips.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Dicas Práticas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {step.tips.map((tip, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-primary">✓</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          
          <span className="text-sm text-muted-foreground">
            {step.title}
          </span>
          
          <Button
            variant="outline"
            onClick={nextStep}
            disabled={currentStep === steps.length - 1}
            className="gap-2"
          >
            Próximo
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
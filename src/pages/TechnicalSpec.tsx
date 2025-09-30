import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Settings, 
  BarChart3, 
  CreditCard, 
  Shield, 
  Calendar,
  CheckCircle,
  AlertCircle,
  FileText,
  Target
} from "lucide-react";
import Header from "@/components/Header";

const TechnicalSpec = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Especificação Técnica</h1>
            <p className="text-xl text-muted-foreground mb-6">
              Sistema de Gestão de Eventos - InscriX Platform
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Multi-tenancy</Badge>
              <Badge variant="secondary">Eventos Desportivos</Badge>
              <Badge variant="secondary">Eventos Culturais</Badge>
              <Badge variant="secondary">RGPD Compliance</Badge>
              <Badge variant="secondary">Faturação Certificada</Badge>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="users">Utilizadores</TabsTrigger>
              <TabsTrigger value="admin">Administrador</TabsTrigger>
              <TabsTrigger value="organizer">Organizador</TabsTrigger>
              <TabsTrigger value="data">Dados</TabsTrigger>
              <TabsTrigger value="payments">Pagamentos</TabsTrigger>
              <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            </TabsList>

            {/* Visão Geral */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Objetivos do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Funcionalidades Core</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Gestão multi-nível (Admin + Organizador)
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Eventos desportivos e culturais
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Sistema de bilhetes avançado
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Check-in com QR codes
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Gestão de resultados
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold">Requisitos Técnicos</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-blue-500" />
                          Arquitetura escalável
                        </li>
                        <li className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-blue-500" />
                          Interface intuitiva
                        </li>
                        <li className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-blue-500" />
                          Segurança RGPD
                        </li>
                        <li className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-blue-500" />
                          Integração ERP
                        </li>
                        <li className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-blue-500" />
                          Multi-gateway pagamentos
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Arquitetura do Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Frontend</h4>
                      <ul className="text-sm space-y-1">
                        <li>• React + TypeScript</li>
                        <li>• Tailwind CSS</li>
                        <li>• Shadcn/ui</li>
                        <li>• PWA Ready</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Backend</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Supabase Database</li>
                        <li>• Row Level Security</li>
                        <li>• Edge Functions</li>
                        <li>• Real-time</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Integrações</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Gateways Pagamento</li>
                        <li>• ERPs Faturação</li>
                        <li>• Email Service</li>
                        <li>• Storage Files</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Perfis de Utilizador */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Perfis de Utilizador
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 border-l-4 border-red-500 bg-red-50">
                        <h4 className="font-semibold text-red-900">Administrador</h4>
                        <p className="text-sm text-red-700 mt-1">Controlo total da plataforma</p>
                        <ul className="text-sm text-red-700 mt-2 space-y-1">
                          <li>• Aprova organizadores</li>
                          <li>• Define comissões</li>
                          <li>• Configura integrações</li>
                          <li>• Acesso a relatórios globais</li>
                          <li>• Gestão de categorias</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                        <h4 className="font-semibold text-blue-900">Organizador</h4>
                        <p className="text-sm text-blue-700 mt-1">Gestão dos seus eventos</p>
                        <ul className="text-sm text-blue-700 mt-2 space-y-1">
                          <li>• Cria e gere eventos</li>
                          <li>• Gestão de bilhetes</li>
                          <li>• Controlo de inscrições</li>
                          <li>• Upload de resultados</li>
                          <li>• Emissão de vouchers</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 border-l-4 border-green-500 bg-green-50">
                        <h4 className="font-semibold text-green-900">Staff de Evento</h4>
                        <p className="text-sm text-green-700 mt-1">Check-in e operações</p>
                        <ul className="text-sm text-green-700 mt-2 space-y-1">
                          <li>• Acesso apenas a check-in</li>
                          <li>• Scanner QR codes</li>
                          <li>• Verificação bilhetes</li>
                          <li>• Registo presença</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 border-l-4 border-purple-500 bg-purple-50">
                        <h4 className="font-semibold text-purple-900">Financeiro</h4>
                        <p className="text-sm text-purple-700 mt-1">Relatórios e faturação</p>
                        <ul className="text-sm text-purple-700 mt-2 space-y-1">
                          <li>• Acesso a relatórios</li>
                          <li>• Dados de faturação</li>
                          <li>• Reconciliação</li>
                          <li>• Comissões</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Funcionalidades Admin */}
            <TabsContent value="admin" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Funcionalidades - Administrador
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Dashboard & Relatórios</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• KPIs globais (eventos, inscrições, receitas)</li>
                        <li>• Gráficos de tendências</li>
                        <li>• Relatórios por organizador</li>
                        <li>• Análise de gateway de pagamento</li>
                        <li>• Controlo de comissões</li>
                        <li>• Exportação de dados</li>
                      </ul>
                      
                      <h4 className="font-semibold mt-6">Gestão de Organizadores</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Processo de aprovação</li>
                        <li>• Validação de dados fiscais</li>
                        <li>• Configuração de comissões</li>
                        <li>• Histórico de atividade</li>
                        <li>• Suspensão/ativação</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold">Configurações Globais</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Categorias e subcategorias</li>
                        <li>• Escalões etários</li>
                        <li>• Templates de email</li>
                        <li>• Configuração de branding</li>
                        <li>• Gateways de pagamento</li>
                        <li>• Integrações ERP</li>
                      </ul>
                      
                      <h4 className="font-semibold mt-6">Controlo de Eventos</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Aprovação de eventos</li>
                        <li>• Publicação/despublicação</li>
                        <li>• Travagem de inscrições</li>
                        <li>• Auditoria de alterações</li>
                        <li>• Moderação de conteúdo</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Funcionalidades Organizador */}
            <TabsContent value="organizer" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Funcionalidades - Organizador
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Criação de Eventos</h4>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">Assistente em 5 Passos</p>
                        <ol className="text-sm text-blue-700 mt-2 space-y-1">
                          <li>1. Dados básicos do evento</li>
                          <li>2. Configuração de bilhetes</li>
                          <li>3. Regras e políticas</li>
                          <li>4. Métodos de pagamento</li>
                          <li>5. Revisão e publicação</li>
                        </ol>
                      </div>
                      
                      <h4 className="font-semibold">Gestão de Bilhetes</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Múltiplos tipos de bilhete</li>
                        <li>• Sistema de lotes/early bird</li>
                        <li>• Extras (t-shirt, kits, medalhas)</li>
                        <li>• Vouchers e descontos</li>
                        <li>• Lugares marcados/livres</li>
                        <li>• Boxes de tempo (atletismo)</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold">Gestão de Inscrições</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Tabela filtrável</li>
                        <li>• Exportação CSV/Excel</li>
                        <li>• Comunicação com participantes</li>
                        <li>• Gestão de equipas</li>
                        <li>• Importação em massa</li>
                        <li>• Check-in em tempo real</li>
                      </ul>
                      
                      <h4 className="font-semibold mt-6">Resultados & Comunicação</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Upload CSV/Excel de resultados</li>
                        <li>• Mapeamento automático</li>
                        <li>• Publicação no site do evento</li>
                        <li>• Templates de email</li>
                        <li>• Comunicação antes/após evento</li>
                        <li>• Certificados digitais</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Estrutura de Dados */}
            <TabsContent value="data" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Estrutura de Dados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Entidades Principais</h4>
                      <div className="space-y-3">
                        <div className="p-3 border rounded">
                          <h5 className="font-medium">Organizer</h5>
                          <p className="text-xs text-muted-foreground">id, name, email, fiscal_data, commission_rate, status</p>
                        </div>
                        <div className="p-3 border rounded">
                          <h5 className="font-medium">Event</h5>
                          <p className="text-xs text-muted-foreground">id, organizer_id, title, description, dates, location, category, status</p>
                        </div>
                        <div className="p-3 border rounded">
                          <h5 className="font-medium">TicketType</h5>
                          <p className="text-xs text-muted-foreground">id, event_id, name, price, quantity, extras, time_slots</p>
                        </div>
                        <div className="p-3 border rounded">
                          <h5 className="font-medium">Registration</h5>
                          <p className="text-xs text-muted-foreground">id, event_id, attendee_id, ticket_type, payment_status, qr_code</p>
                        </div>
                        <div className="p-3 border rounded">
                          <h5 className="font-medium">Attendee</h5>
                          <p className="text-xs text-muted-foreground">id, user_id, personal_data, emergency_contact, medical_info</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold">Entidades Complementares</h4>
                      <div className="space-y-3">
                        <div className="p-3 border rounded">
                          <h5 className="font-medium">Team</h5>
                          <p className="text-xs text-muted-foreground">id, event_id, name, captain_id, members</p>
                        </div>
                        <div className="p-3 border rounded">
                          <h5 className="font-medium">Result</h5>
                          <p className="text-xs text-muted-foreground">id, event_id, attendee_id, category, position, time, points</p>
                        </div>
                        <div className="p-3 border rounded">
                          <h5 className="font-medium">Voucher</h5>
                          <p className="text-xs text-muted-foreground">id, code, discount_type, value, usage_limit, valid_until</p>
                        </div>
                        <div className="p-3 border rounded">
                          <h5 className="font-medium">Invoice</h5>
                          <p className="text-xs text-muted-foreground">id, registration_id, amount, tax_data, document_series</p>
                        </div>
                        <div className="p-3 border rounded">
                          <h5 className="font-medium">CheckIn</h5>
                          <p className="text-xs text-muted-foreground">id, registration_id, timestamp, staff_id, location</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pagamentos */}
            <TabsContent value="payments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Pagamentos & Faturação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Gateways de Pagamento</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">MB WAY</Badge>
                          <span className="text-sm">Pagamento instantâneo</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Multibanco</Badge>
                          <span className="text-sm">Referência multicaixa</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Cartão</Badge>
                          <span className="text-sm">Visa/Mastercard</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">PayPal</Badge>
                          <span className="text-sm">Carteira digital</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Transferência</Badge>
                          <span className="text-sm">Bancária (manual)</span>
                        </div>
                      </div>
                      
                      <h4 className="font-semibold mt-6">Fluxo de Pagamento</h4>
                      <ol className="text-sm space-y-1">
                        <li>1. Seleção de bilhetes</li>
                        <li>2. Dados do participante</li>
                        <li>3. Escolha do método</li>
                        <li>4. Processamento seguro</li>
                        <li>5. Confirmação + QR code</li>
                        <li>6. Fatura automática</li>
                      </ol>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold">Integração com ERPs</h4>
                      <div className="space-y-2">
                        <div className="p-3 border rounded">
                          <h5 className="font-medium">Moloni</h5>
                          <p className="text-xs text-muted-foreground">Faturação automática + certificação AT</p>
                        </div>
                        <div className="p-3 border rounded">
                          <h5 className="font-medium">InvoiceXpress</h5>
                          <p className="text-xs text-muted-foreground">Gestão financeira completa</p>
                        </div>
                        <div className="p-3 border rounded">
                          <h5 className="font-medium">PHC</h5>
                          <p className="text-xs text-muted-foreground">ERP empresarial</p>
                        </div>
                      </div>
                      
                      <h4 className="font-semibold mt-6">Funcionalidades</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Séries de documentos por organizador</li>
                        <li>• Recibos e faturas automáticas</li>
                        <li>• Reconciliação de pagamentos</li>
                        <li>• Relatórios fiscais</li>
                        <li>• Cálculo de comissões</li>
                        <li>• Gestão de reembolsos</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Roadmap */}
            <TabsContent value="roadmap" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Roadmap de Implementação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-6">
                    <div className="p-4 border-l-4 border-green-500 bg-green-50">
                      <h4 className="font-semibold text-green-900">Fase 1: MVP Core (Meses 1-2)</h4>
                      <ul className="text-sm text-green-700 mt-2 space-y-1">
                        <li>• ✅ Sistema de utilizadores (Admin/Organizador)</li>
                        <li>• ✅ Criação e gestão de eventos</li>
                        <li>• ✅ Sistema de bilhetes básico</li>
                        <li>• ✅ Inscrições e formulários</li>
                        <li>• ✅ Check-in com QR codes</li>
                        <li>• ✅ Upload de resultados</li>
                        <li>• ✅ Dashboard básico</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                      <h4 className="font-semibold text-blue-900">Fase 2: Faturação & Pagamentos (Mês 3)</h4>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>• 🔄 Integração gateways pagamento</li>
                        <li>• 🔄 Sistema de faturação certificada</li>
                        <li>• 🔄 Integração com ERPs</li>
                        <li>• 🔄 Cálculo de comissões</li>
                        <li>• 🔄 Relatórios financeiros</li>
                        <li>• 🔄 Gestão de vouchers</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50">
                      <h4 className="font-semibold text-yellow-900">Fase 3: Mobile & Integrações (Mês 4)</h4>
                      <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                        <li>• 📱 App mobile de check-in</li>
                        <li>• 📱 PWA para participantes</li>
                        <li>• 🔗 Integração Wiclax (cronometragem)</li>
                        <li>• 🔗 APIs para parceiros</li>
                        <li>• 📊 Relatórios avançados</li>
                        <li>• 🔔 Sistema de notificações</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 border-l-4 border-purple-500 bg-purple-50">
                      <h4 className="font-semibold text-purple-900">Fase 4: Optimizações (Mês 5-6)</h4>
                      <ul className="text-sm text-purple-700 mt-2 space-y-1">
                        <li>• 🌍 Sistema multi-língua</li>
                        <li>• 🎨 Melhorias UX/UI</li>
                        <li>• 📈 Analytics avançados</li>
                        <li>• 🤖 Automações</li>
                        <li>• 🔒 Auditoria completa</li>
                        <li>• 🚀 Otimizações performance</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Segurança & RGPD
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Compliance RGPD</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Gestão de consentimentos</li>
                        <li>• Direito ao esquecimento</li>
                        <li>• Download de dados pessoais</li>
                        <li>• Minimização de dados</li>
                        <li>• Pseudonimização</li>
                        <li>• Logs de acesso</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold">Segurança Técnica</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Autenticação 2FA</li>
                        <li>• ReCAPTCHA</li>
                        <li>• Encriptação dados</li>
                        <li>• Backup automático</li>
                        <li>• SSL/TLS</li>
                        <li>• Rate limiting</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default TechnicalSpec;
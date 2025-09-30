import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, Trophy, Timer, Shield, Heart, Target, Zap } from "lucide-react";

const SobreInscrix = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Sobre a Inscrix
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Transformamos a gestão de eventos desportivos e culturais através da tecnologia, 
            oferecendo soluções completas desde as inscrições até à cronometragem profissional.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Target className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">A Nossa Missão</CardTitle>
            <CardDescription className="text-lg">
              Democratizar o acesso a tecnologia de ponta para organização de eventos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground leading-relaxed">
              Acreditamos que todos os organizadores de eventos, independentemente do tamanho ou orçamento, 
              merecem ter acesso às melhores ferramentas para criar experiências memoráveis. 
              A nossa plataforma integra gestão de inscrições, pagamentos seguros e cronometragem profissional 
              numa solução única e acessível.
            </p>
          </CardContent>
        </Card>

        {/* Values Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Os Nossos Valores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Simplicidade</h3>
                <p className="text-sm text-muted-foreground">
                  Interfaces intuitivas que qualquer pessoa consegue usar
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Shield className="h-10 w-10 text-blue-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Confiabilidade</h3>
                <p className="text-sm text-muted-foreground">
                  Sistemas seguros e estáveis para os momentos mais importantes
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Zap className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Inovação</h3>
                <p className="text-sm text-muted-foreground">
                  Sempre na vanguarda das tecnologias para eventos
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Heart className="h-10 w-10 text-red-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Paixão</h3>
                <p className="text-sm text-muted-foreground">
                  Dedicação total ao sucesso dos nossos clientes
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Services Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">As Nossas Soluções</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>Gestão de Inscrições</CardTitle>
                    <CardDescription>Sistema completo para gerir participantes</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Formulários personalizáveis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Pagamentos seguros integrados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Comunicação automática com participantes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Relatórios detalhados</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Timer className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>Cronometragem Profissional</CardTitle>
                    <CardDescription>Tecnologia de ponta para timing preciso</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Chips RFID de alta precisão</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Resultados em tempo real</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Múltiplos pontos de controlo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Certificados oficiais automáticos</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Integration Section */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Integração Total</CardTitle>
            <CardDescription>
              Uma plataforma, múltiplas funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Eventos Desportivos</h3>
                <p className="text-sm text-muted-foreground">
                  Corridas, ciclismo, natação, triatlo e muito mais
                </p>
              </div>

              <div>
                <div className="bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Eventos Culturais</h3>
                <p className="text-sm text-muted-foreground">
                  Festivais, espetáculos, workshops e conferências
                </p>
              </div>

              <div>
                <div className="bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Eventos Corporativos</h3>
                <p className="text-sm text-muted-foreground">
                  Team buildings, convenções e atividades empresariais
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <div className="bg-primary/5 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-8">Números que Falam por Si</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-sm text-muted-foreground">Eventos Realizados</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">50k+</div>
              <div className="text-sm text-muted-foreground">Participantes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Suporte</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold mb-4">Pronto para o Próximo Nível?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Junte-se a centenas de organizadores que já confiam na Inscrix para criar 
            eventos memoráveis e profissionais.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="secondary" className="px-4 py-2">
              <Timer className="h-4 w-4 mr-2" />
              Setup em 5 minutos
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Shield className="h-4 w-4 mr-2" />
              Dados seguros
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Users className="h-4 w-4 mr-2" />
              Suporte dedicado
            </Badge>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SobreInscrix;
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, TrendingUp, CheckCircle, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";

const OrganizerSection = () => {
  const features = [
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "Cria o teu evento com facilidade",
      description: "Publica o teu evento em poucos passos, com várias opções de personalização à tua disposição."
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Segurança",
      description: "Pagamentos simples e seguros, com múltiplas opções de pagamento disponíveis."
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      title: "Gestão Transparente",
      description: "Os organizadores podem gerir facilmente as inscrições, bilhetes e vendas de forma clara e eficiente."
    },
    {
      icon: <Smartphone className="h-8 w-8 text-primary" />,
      title: "Validar Bilhete",
      description: "Faz a leitura do QR Code do bilhete através da app, de forma simples e rápida."
    }
  ];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            És organizador de eventos?
            <span className="text-primary block">Junta-te à comunidade INSCRIX.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Cria, divulga e gere os teus eventos desportivos com ferramentas simples, estatísticas detalhadas e total controlo sobre inscrições e pagamentos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
            <Link to="/create-event">
              Cria o teu evento
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default OrganizerSection;
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Phone, Mail, Clock, MessageSquare, Users, Headphones, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Contactos = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "geral",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Mensagem enviada!",
      description: "Obrigado pelo seu contacto. Responderemos em breve.",
    });
    
    // Reset form
    setFormData({
      name: "",
      email: "",
      company: "",
      subject: "geral",
      message: ""
    });
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Contactos
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Estamos aqui para ajudar. Entre em contacto connosco através de qualquer um dos 
            canais abaixo ou preencha o formulário para uma resposta personalizada.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  Sede Principal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <div className="font-medium">Morada</div>
                    <div className="text-sm text-muted-foreground">
                      Rua da Inovação, 123<br />
                      4200-180 Porto, Portugal
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Telefone</div>
                    <div className="text-sm text-muted-foreground">+351 220 123 456</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Email Geral</div>
                    <div className="text-sm text-muted-foreground">info@inscrix.pt</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <div className="font-medium">Horário de Funcionamento</div>
                    <div className="text-sm text-muted-foreground">
                      Segunda a Sexta: 9h00 - 18h00<br />
                      Sábado: 9h00 - 13h00<br />
                      Domingo: Encerrado
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Options */}
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Headphones className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Suporte Técnico</span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    Para questões técnicas e ajuda imediata
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>suporte@inscrix.pt</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>+351 220 123 457</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span>Chat disponível 24/7</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Vendas</span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    Para novos projetos e parcerias
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>vendas@inscrix.pt</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>+351 220 123 458</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3 mb-2">
                    <MessageSquare className="h-5 w-5 text-purple-500" />
                    <span className="font-medium">Imprensa</span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    Para jornalistas e comunicação social
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>imprensa@inscrix.pt</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>+351 220 123 459</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Envie-nos uma mensagem</CardTitle>
                <CardDescription>
                  Preencha o formulário e responderemos o mais rapidamente possível
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                        placeholder="O seu nome"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                        placeholder="o.seu.email@exemplo.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="company">Empresa/Organização</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      placeholder="Nome da sua empresa ou organização (opcional)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">Assunto *</Label>
                    <Select 
                      value={formData.subject} 
                      onValueChange={(value) => setFormData({...formData, subject: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o assunto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="geral">Informações Gerais</SelectItem>
                        <SelectItem value="suporte">Suporte Técnico</SelectItem>
                        <SelectItem value="vendas">Vendas e Parcerias</SelectItem>
                        <SelectItem value="cronometragem">Cronometragem</SelectItem>
                        <SelectItem value="eventos">Gestão de Eventos</SelectItem>
                        <SelectItem value="billing">Faturação</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">Mensagem *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      required
                      placeholder="Descreva a sua questão ou pedido..."
                      rows={6}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "A enviar..." : "Enviar Mensagem"}
                  </Button>

                  <p className="text-xs text-muted-foreground">
                    Ao enviar este formulário, aceita os nossos{" "}
                    <Link to="/termosecondicoesinscrix" className="text-primary hover:underline">
                      Termos e Condições
                    </Link>{" "}
                    e{" "}
                    <Link to="/politica-privacidade" className="text-primary hover:underline">
                      Política de Privacidade
                    </Link>.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <Card>
          <CardHeader>
            <CardTitle>Localização</CardTitle>
            <CardDescription>
              Encontre-nos no centro do Porto, numa zona de fácil acesso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Mapa interativo será carregado aqui
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Rua da Inovação, 123 - 4200-180 Porto
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Contactos;
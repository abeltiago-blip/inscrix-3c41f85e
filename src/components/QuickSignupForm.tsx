import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, User, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface QuickSignupFormProps {
  onWelcome?: () => void;
}

const QuickSignupForm = ({ onWelcome }: QuickSignupFormProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) {
      toast({
        title: "Erro",
        description: "Por favor, preenche todos os campos.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    // Simular processo de registo rápido
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Sucesso!",
        description: "Conta criada com sucesso. Bem-vindo à INSCRIX!",
      });
      
      // Trigger welcome modal
      if (onWelcome) {
        setTimeout(() => {
          onWelcome();
        }, 500);
      }
      
      // Navigate to register page for complete profile
      setTimeout(() => {
        navigate("/register", { state: { email, name } });
      }, 2000);
    }, 1000);
  };

  return (
    <section 
      className="py-16 px-4 relative overflow-hidden"
      style={{
        backgroundImage: `url('/lovable-uploads/30e2e28b-6f2a-4b96-b990-3543a93f3b8b.png')`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center top'
      }}
    >
      {/* Overlay for better content readability */}
      <div className="absolute inset-0 bg-background/40 pointer-events-none"></div>
      
      <div className="container mx-auto max-w-4xl relative z-10">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-2xl md:text-3xl font-bold">
              Cria a tua conta e começa a participar em eventos incríveis
            </CardTitle>
            <CardDescription className="text-lg">
              Regista-te gratuitamente e descobre centenas de eventos à tua espera
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="O teu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="O teu email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="px-8 h-12 font-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    "A criar conta..."
                  ) : (
                    <>
                      Criar conta gratuita
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
            
            <p className="text-center text-sm text-muted-foreground mt-6">
              Ao criares uma conta, concordas com os nossos{" "}
              <a href="/termos-condicoes" className="underline hover:text-primary">
                Termos e Condições
              </a>{" "}
              e{" "}
              <a href="/politica-privacidade" className="underline hover:text-primary">
                Política de Privacidade
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default QuickSignupForm;
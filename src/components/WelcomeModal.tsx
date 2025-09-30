import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomeModal = ({ isOpen, onClose }: WelcomeModalProps) => {
  const steps = [
    {
      number: "01",
      title: "Encontra o evento certo para ti",
      description: "Consulta centenas de eventos, de corridas a concertos, de trilhos a palestras, filtrando por tipo, data ou localização."
    },
    {
      number: "02", 
      title: "Inscreve-te em segundos",
      description: "Preenche os teus dados, escolhe a modalidade ou sessão e garante já o teu lugar."
    },
    {
      number: "03",
      title: "Recebe o teu bilhete",
      description: "Depois da inscrição, o bilhete chega automaticamente ao teu e-mail — pronto para apresentar no dia."
    },
    {
      number: "04",
      title: "Consulta os teus resultados",
      description: "Participaste numa prova desportiva? Os teus tempos, classificações e estatísticas ficam disponíveis logo após o evento."
    },
    {
      number: "05",
      title: "Acompanha as tuas participações",
      description: "Mantém o registo de todos os eventos em que estiveste presente — desporto, cultura ou formação — tudo organizado num só perfil."
    },
    {
      number: "06",
      title: "Cria e gere os teus próprios eventos",
      description: "És organizador? Publica eventos, gere inscrições, valida entradas, envia notificações e acompanha estatísticas em tempo real."
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <DialogTitle className="text-2xl">Bem-vindo à INSCRIX!</DialogTitle>
          </div>
          <p className="text-muted-foreground">
            Parabéns pela tua primeira inscrição! Aqui está como funciona a nossa plataforma:
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {steps.map((step) => (
            <Card key={step.number} className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                    {step.number}
                  </div>
                  <CardTitle className="text-base">{step.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {step.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center mt-6">
          <Button onClick={onClose} size="lg">
            Começar a explorar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
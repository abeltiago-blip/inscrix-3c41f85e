import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ParticipantRegisterForm } from "@/components/auth/ParticipantRegisterForm";
import { TeamRegisterForm } from "@/components/auth/TeamRegisterForm";
import { OrganizerRegisterForm } from "@/components/auth/OrganizerRegisterForm";

export default function Register() {
  const [activeTab, setActiveTab] = useState("participant");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['participant', 'team', 'organizer'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 h-8 w-8 z-10"
            onClick={() => navigate(-1)}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardHeader className="text-center pr-12">
            <CardTitle className="text-2xl font-bold text-primary">Criar Conta</CardTitle>
            <CardDescription>
              Escolha o tipo de conta que pretende criar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="participant">Participante</TabsTrigger>
                <TabsTrigger value="team">Equipa</TabsTrigger>
                <TabsTrigger value="organizer">Organizador</TabsTrigger>
              </TabsList>
              
              <TabsContent value="participant" className="mt-6">
                <div className="mb-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Participante:</strong> Conta individual para inscrições em eventos desportivos e culturais.
                  </p>
                </div>
                <ParticipantRegisterForm />
              </TabsContent>
              
              <TabsContent value="team" className="mt-6">
                <div className="mb-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Equipa:</strong> Conta para clubes ou grupos que inscrevem vários participantes em conjunto.
                  </p>
                </div>
                <TeamRegisterForm />
              </TabsContent>
              
              <TabsContent value="organizer" className="mt-6">
                <div className="mb-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Organizador:</strong> Conta para criar e gerir eventos na plataforma Inscrix.
                  </p>
                </div>
                <OrganizerRegisterForm />
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <div className="text-sm text-muted-foreground">
                Já tem conta?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Iniciar sessão
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
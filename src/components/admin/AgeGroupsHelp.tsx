import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, Users, Settings } from "lucide-react";

export function AgeGroupsHelp() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <InfoIcon className="h-5 w-5" />
            Como Gerir Escalões Etários
          </CardTitle>
          <CardDescription>
            Guia para configurar escalões sugeridos para diferentes modalidades desportivas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Users className="h-4 w-4" />
            <AlertTitle>Escalões por Categoria</AlertTitle>
            <AlertDescription>
              Cada categoria desportiva pode ter os seus próprios escalões etários personalizados.
              Os escalões são sugeridos automaticamente quando os organizadores criam eventos.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Campos Obrigatórios</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Categoria:</strong> Modalidade desportiva (ex: Ciclismo)</li>
                <li>• <strong>Nome:</strong> Nome do escalão (ex: "Sub-21 Masculino")</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Campos Opcionais</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Idade Mín/Máx:</strong> Limites etários</li>
                <li>• <strong>Descrição:</strong> Detalhes adicionais</li>
                <li>• <strong>Ordem:</strong> Posição na lista (0 = primeiro)</li>
              </ul>
            </div>
          </div>

          <Alert>
            <Settings className="h-4 w-4" />
            <AlertTitle>Dica</AlertTitle>
            <AlertDescription>
              Use a "Ordem" para controlar como os escalões aparecem na lista de sugestões.
              Escalões com ordem menor (0, 1, 2...) aparecem primeiro.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
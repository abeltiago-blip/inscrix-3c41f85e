import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Link, FileText, Loader2, CheckCircle, XCircle, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FeedImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface TeamFeedData {
  name: string;
  description?: string;
  sport_category?: string;
  location?: string;
  max_members?: number;
  logo_url?: string;
}

export const FeedImporter = ({ isOpen, onClose, onSuccess }: FeedImporterProps) => {
  const [loading, setLoading] = useState(false);
  const [feedUrl, setFeedUrl] = useState('');
  const [csvData, setCsvData] = useState('');
  const [jsonData, setJsonData] = useState('');
  const [importResults, setImportResults] = useState<{
    success: number;
    errors: string[];
  } | null>(null);
  const { toast } = useToast();

  const validateTeamData = (team: any): TeamFeedData | null => {
    if (!team.name || typeof team.name !== 'string') {
      return null;
    }

    return {
      name: team.name.trim(),
      description: team.description?.trim() || undefined,
      sport_category: team.sport_category?.trim() || team.category?.trim() || undefined,
      location: team.location?.trim() || undefined,
      max_members: team.max_members ? parseInt(team.max_members) : 20,
      logo_url: team.logo_url?.trim() || team.image_url?.trim() || undefined,
    };
  };

  const importTeams = async (teams: TeamFeedData[]) => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('Utilizador não autenticado');
    }

    const results = {
      success: 0,
      errors: [] as string[]
    };

    for (const teamData of teams) {
      try {
        const { error } = await supabase
          .from('teams')
          .insert({
            ...teamData,
            captain_user_id: user.data.user.id,
            is_public: true,
            is_active: true
          });

        if (error) {
          results.errors.push(`${teamData.name}: ${error.message}`);
        } else {
          results.success++;
        }
      } catch (err: any) {
        results.errors.push(`${teamData.name}: ${err.message}`);
      }
    }

    return results;
  };

  const handleJsonFeedImport = async () => {
    if (!feedUrl.trim()) {
      toast({
        title: "URL obrigatório",
        description: "Por favor, insira a URL do feed JSON.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(feedUrl);
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      let teams: any[] = [];

      // Suporte para diferentes formatos de JSON
      if (Array.isArray(data)) {
        teams = data;
      } else if (data.teams && Array.isArray(data.teams)) {
        teams = data.teams;
      } else if (data.data && Array.isArray(data.data)) {
        teams = data.data;
      } else {
        throw new Error('Formato JSON não suportado. Esperado: array ou objeto com propriedade "teams"/"data"');
      }

      const validTeams = teams
        .map(validateTeamData)
        .filter((team): team is TeamFeedData => team !== null);

      if (validTeams.length === 0) {
        throw new Error('Nenhuma equipa válida encontrada no feed');
      }

      const results = await importTeams(validTeams);
      setImportResults(results);

      if (results.success > 0) {
        toast({
          title: "Importação concluída",
          description: `${results.success} equipas importadas com sucesso.`
        });
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Erro na importação",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCsvImport = async () => {
    if (!csvData.trim()) {
      toast({
        title: "Dados CSV obrigatórios",
        description: "Por favor, cole os dados CSV.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const nameIndex = headers.findIndex(h => h.includes('name') || h.includes('nome'));
      if (nameIndex === -1) {
        throw new Error('Coluna "name" ou "nome" não encontrada no CSV');
      }

      const teams: TeamFeedData[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        
        if (values[nameIndex]) {
          const team: TeamFeedData = {
            name: values[nameIndex],
            description: values[headers.findIndex(h => h.includes('desc'))] || undefined,
            sport_category: values[headers.findIndex(h => h.includes('category') || h.includes('sport'))] || undefined,
            location: values[headers.findIndex(h => h.includes('location') || h.includes('local'))] || undefined,
            max_members: parseInt(values[headers.findIndex(h => h.includes('max') || h.includes('members'))]) || 20,
          };
          
          teams.push(team);
        }
      }

      if (teams.length === 0) {
        throw new Error('Nenhuma equipa válida encontrada no CSV');
      }

      const results = await importTeams(teams);
      setImportResults(results);

      if (results.success > 0) {
        toast({
          title: "Importação concluída",
          description: `${results.success} equipas importadas com sucesso.`
        });
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Erro na importação CSV",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJsonImport = async () => {
    if (!jsonData.trim()) {
      toast({
        title: "Dados JSON obrigatórios",
        description: "Por favor, cole os dados JSON.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const data = JSON.parse(jsonData);
      let teams: any[] = [];

      if (Array.isArray(data)) {
        teams = data;
      } else if (data.teams && Array.isArray(data.teams)) {
        teams = data.teams;
      } else {
        throw new Error('Formato JSON inválido. Esperado: array ou objeto com propriedade "teams"');
      }

      const validTeams = teams
        .map(validateTeamData)
        .filter((team): team is TeamFeedData => team !== null);

      if (validTeams.length === 0) {
        throw new Error('Nenhuma equipa válida encontrada nos dados JSON');
      }

      const results = await importTeams(validTeams);
      setImportResults(results);

      if (results.success > 0) {
        toast({
          title: "Importação concluída",
          description: `${results.success} equipas importadas com sucesso.`
        });
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Erro na importação JSON",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleCsv = () => {
    const sample = `name,description,sport_category,location,max_members
"Runners Unidos","Equipa de corrida de Lisboa","Atletismo","Lisboa",25
"Cyclists Pro","Grupo de ciclismo profissional","Ciclismo","Porto",15
"Football Stars","Equipa de futebol amadora","Futebol","Coimbra",30`;
    
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exemplo_equipas.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSampleJson = () => {
    const sample = {
      teams: [
        {
          name: "Runners Unidos",
          description: "Equipa de corrida de Lisboa",
          sport_category: "Atletismo",
          location: "Lisboa",
          max_members: 25
        },
        {
          name: "Cyclists Pro",
          description: "Grupo de ciclismo profissional",
          sport_category: "Ciclismo",
          location: "Porto",
          max_members: 15
        }
      ]
    };
    
    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exemplo_equipas.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setFeedUrl('');
    setCsvData('');
    setJsonData('');
    setImportResults(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importar Equipas por Feed
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="json-feed" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="json-feed">
              <Link className="h-4 w-4 mr-2" />
              Feed JSON
            </TabsTrigger>
            <TabsTrigger value="csv">
              <FileText className="h-4 w-4 mr-2" />
              CSV
            </TabsTrigger>
            <TabsTrigger value="json-manual">
              <Upload className="h-4 w-4 mr-2" />
              JSON Manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="json-feed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Importar de Feed JSON</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="feedUrl">URL do Feed JSON</Label>
                  <Input
                    id="feedUrl"
                    placeholder="https://exemplo.com/equipas.json"
                    value={feedUrl}
                    onChange={(e) => setFeedUrl(e.target.value)}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    O feed deve retornar um array de equipas ou objeto com propriedade "teams"
                  </p>
                </div>

                <Button onClick={handleJsonFeedImport} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Link className="h-4 w-4 mr-2" />}
                  Importar do Feed
                </Button>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={downloadSampleJson} size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exemplo JSON
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="csv" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Importar CSV</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="csvData">Dados CSV</Label>
                  <Textarea
                    id="csvData"
                    placeholder="name,description,sport_category,location,max_members&#10;Runners Unidos,Equipa de corrida,Atletismo,Lisboa,25"
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    disabled={loading}
                    rows={8}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Colunas obrigatórias: name (ou nome). Opcionais: description, sport_category, location, max_members
                  </p>
                </div>

                <Button onClick={handleCsvImport} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                  Importar CSV
                </Button>

                <Button variant="outline" onClick={downloadSampleCsv} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exemplo CSV
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="json-manual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Importar JSON Manual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="jsonData">Dados JSON</Label>
                  <Textarea
                    id="jsonData"
                    placeholder='{"teams": [{"name": "Equipa Exemplo", "description": "Descrição", "sport_category": "Futebol", "location": "Lisboa", "max_members": 20}]}'
                    value={jsonData}
                    onChange={(e) => setJsonData(e.target.value)}
                    disabled={loading}
                    rows={10}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Formato: array de equipas ou objeto com propriedade "teams"
                  </p>
                </div>

                <Button onClick={handleJsonImport} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  Importar JSON
                </Button>

                <Button variant="outline" onClick={downloadSampleJson} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exemplo JSON
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Resultados da Importação */}
        {importResults && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {importResults.success > 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Resultados da Importação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {importResults.success > 0 && (
                  <p className="text-green-600">
                    ✅ {importResults.success} equipas importadas com sucesso
                  </p>
                )}
                
                {importResults.errors.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-red-600">❌ Erros encontrados:</p>
                    <ul className="text-sm text-red-600 ml-4 space-y-1">
                      {importResults.errors.slice(0, 10).map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                      {importResults.errors.length > 10 && (
                        <li>... e mais {importResults.errors.length - 10} erros</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};
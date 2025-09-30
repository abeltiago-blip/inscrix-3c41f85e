import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, Users, TrendingUp } from "lucide-react";

interface NewsletterSubscription {
  id: string;
  email: string;
  user_id: string;
  subscribed_at: string;
  is_active: boolean;
  categories: any;
  preferences: any;
  confirmed_at: string;
}

interface NewsletterStats {
  total_subscribers: number;
  active_subscribers: number;
  confirmed_subscribers: number;
  categories_breakdown: Record<string, number>;
}

export default function NewsletterManager() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscription[]>([]);
  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const [newsletterForm, setNewsletterForm] = useState({
    subject: "",
    htmlContent: "",
    categories: ["events", "promotions", "news"] as string[],
    targetLocation: "",
    targetSports: [] as string[],
    targetAgeGroup: "",
    batchSize: 50
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadSubscribers(), loadStats()]);
    setLoading(false);
  };

  const loadSubscribers = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .select('*')
        .order('subscribed_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setSubscribers(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadStats = async () => {
    try {
      // Get subscriber counts
      const { data: allSubscribers, error: subscribersError } = await supabase
        .from('newsletter_subscriptions')
        .select('is_active, confirmed_at, categories');

      if (subscribersError) throw subscribersError;

      const total = allSubscribers?.length || 0;
      const active = allSubscribers?.filter(s => s.is_active).length || 0;
      const confirmed = allSubscribers?.filter(s => s.confirmed_at).length || 0;

      // Calculate categories breakdown
      const categoriesBreakdown: Record<string, number> = {};
      allSubscribers?.forEach(subscriber => {
        if (subscriber.categories && Array.isArray(subscriber.categories)) {
          (subscriber.categories as string[]).forEach(category => {
            categoriesBreakdown[category] = (categoriesBreakdown[category] || 0) + 1;
          });
        }
      });

      setStats({
        total_subscribers: total,
        active_subscribers: active,
        confirmed_subscribers: confirmed,
        categories_breakdown: categoriesBreakdown
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setNewsletterForm(prev => ({ 
        ...prev, 
        categories: [...prev.categories, category] 
      }));
    } else {
      setNewsletterForm(prev => ({ 
        ...prev, 
        categories: prev.categories.filter(c => c !== category) 
      }));
    }
  };

  const handleSportChange = (sport: string, checked: boolean) => {
    if (checked) {
      setNewsletterForm(prev => ({ 
        ...prev, 
        targetSports: [...prev.targetSports, sport] 
      }));
    } else {
      setNewsletterForm(prev => ({ 
        ...prev, 
        targetSports: prev.targetSports.filter(s => s !== sport) 
      }));
    }
  };

  const sendNewsletter = async () => {
    if (!newsletterForm.subject || !newsletterForm.htmlContent) {
      toast({
        title: "Erro",
        description: "Assunto e conteúdo são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-newsletter', {
        body: {
          ...newsletterForm,
          targetLocation: newsletterForm.targetLocation === "all" ? "" : newsletterForm.targetLocation,
          targetAgeGroup: newsletterForm.targetAgeGroup === "all" ? "" : newsletterForm.targetAgeGroup
        }
      });

      if (error) throw error;

      toast({
        title: "Newsletter enviada!",
        description: `Newsletter enviada para ${data.sent_count} subscritores.`,
      });

      // Reset form
      setNewsletterForm({
        subject: "",
        htmlContent: "",
        categories: ["events", "promotions", "news"],
        targetLocation: "",
        targetSports: [],
        targetAgeGroup: "",
        batchSize: 50
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const exportSubscribers = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .select('email, subscribed_at, is_active, categories, preferences')
        .eq('is_active', true)
        .not('confirmed_at', 'is', null);

      if (error) throw error;

      const csv = [
        'Email,Data Subscrição,Categorias,Localização,Desportos',
        ...data.map(sub => [
          sub.email,
          new Date(sub.subscribed_at).toLocaleDateString('pt-PT'),
          Array.isArray(sub.categories) ? (sub.categories as string[]).join(';') : '',
          (sub.preferences as any)?.location || '',
          Array.isArray((sub.preferences as any)?.sports) ? ((sub.preferences as any).sports as string[]).join(';') : ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Exportação concluída",
        description: "Lista de subscritores exportada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Carregando dados da newsletter...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.total_subscribers}</p>
                  <p className="text-sm text-muted-foreground">Total Subscritores</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.active_subscribers}</p>
                  <p className="text-sm text-muted-foreground">Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Mail className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.confirmed_subscribers}</p>
                  <p className="text-sm text-muted-foreground">Confirmados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Send className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {Math.round((stats.confirmed_subscribers / stats.total_subscribers) * 100) || 0}%
                  </p>
                  <p className="text-sm text-muted-foreground">Taxa Confirmação</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="send" className="w-full">
        <TabsList>
          <TabsTrigger value="send">Enviar Newsletter</TabsTrigger>
          <TabsTrigger value="subscribers">Subscritores</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>

        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle>Enviar Newsletter</CardTitle>
              <CardDescription>
                Crie e envie newsletters personalizadas para os subscritores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subject">Assunto *</Label>
                <Input
                  id="subject"
                  value={newsletterForm.subject}
                  onChange={(e) => setNewsletterForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Assunto da newsletter"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="htmlContent">Conteúdo HTML *</Label>
                <Textarea
                  id="htmlContent"
                  value={newsletterForm.htmlContent}
                  onChange={(e) => setNewsletterForm(prev => ({ ...prev, htmlContent: e.target.value }))}
                  placeholder="Conteúdo HTML da newsletter"
                  rows={10}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Categorias Alvo</Label>
                  <div className="space-y-2">
                    {[
                      { id: "events", label: "Eventos" },
                      { id: "promotions", label: "Promoções" },
                      { id: "news", label: "Notícias" },
                      { id: "results", label: "Resultados" }
                    ].map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={category.id}
                          checked={newsletterForm.categories.includes(category.id)}
                          onCheckedChange={(checked) => 
                            handleCategoryChange(category.id, checked as boolean)
                          }
                        />
                        <Label htmlFor={category.id} className="text-sm font-normal">
                          {category.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Desportos Alvo (Opcional)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Corrida", "Ciclismo", "Natação", "Triatlo", 
                      "Futebol", "Basquetebol", "Ténis", "Outros"
                    ].map((sport) => (
                      <div key={sport} className="flex items-center space-x-2">
                        <Checkbox
                          id={sport}
                          checked={newsletterForm.targetSports.includes(sport)}
                          onCheckedChange={(checked) => 
                            handleSportChange(sport, checked as boolean)
                          }
                        />
                        <Label htmlFor={sport} className="text-sm font-normal">
                          {sport}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetLocation">Localização Alvo</Label>
                  <Select 
                    value={newsletterForm.targetLocation} 
                    onValueChange={(value) => setNewsletterForm(prev => ({ ...prev, targetLocation: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as regiões" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Regiões</SelectItem>
                      <SelectItem value="lisboa">Lisboa</SelectItem>
                      <SelectItem value="porto">Porto</SelectItem>
                      <SelectItem value="coimbra">Coimbra</SelectItem>
                      <SelectItem value="braga">Braga</SelectItem>
                      <SelectItem value="faro">Faro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAgeGroup">Grupo Etário</Label>
                  <Select 
                    value={newsletterForm.targetAgeGroup} 
                    onValueChange={(value) => setNewsletterForm(prev => ({ ...prev, targetAgeGroup: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as idades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Idades</SelectItem>
                      <SelectItem value="18-25">18-25 anos</SelectItem>
                      <SelectItem value="26-35">26-35 anos</SelectItem>
                      <SelectItem value="36-45">36-45 anos</SelectItem>
                      <SelectItem value="46-55">46-55 anos</SelectItem>
                      <SelectItem value="55+">55+ anos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batchSize">Tamanho do Lote</Label>
                  <Select 
                    value={newsletterForm.batchSize.toString()} 
                    onValueChange={(value) => setNewsletterForm(prev => ({ ...prev, batchSize: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25 emails/lote</SelectItem>
                      <SelectItem value="50">50 emails/lote</SelectItem>
                      <SelectItem value="100">100 emails/lote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  onClick={sendNewsletter}
                  disabled={sending || !newsletterForm.subject || !newsletterForm.htmlContent}
                >
                  {sending ? "A enviar..." : "Enviar Newsletter"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscribers">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Subscritores</CardTitle>
              <CardDescription>
                Gerir subscritores da newsletter
              </CardDescription>
              <div className="flex justify-end">
                <Button onClick={exportSubscribers} variant="outline">
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Data Subscrição</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Categorias</TableHead>
                    <TableHead>Preferências</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell>{subscriber.email}</TableCell>
                      <TableCell>
                        {new Date(subscriber.subscribed_at).toLocaleDateString('pt-PT')}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <Badge variant={subscriber.is_active ? "default" : "secondary"}>
                            {subscriber.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                          {subscriber.confirmed_at && (
                            <Badge variant="outline" className="text-xs">
                              Confirmado
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(subscriber.categories) ? (subscriber.categories as string[]).map((category) => (
                            <Badge key={category} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          )) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {(subscriber.preferences as any)?.frequency && (
                            <div>Freq: {(subscriber.preferences as any).frequency}</div>
                          )}
                          {(subscriber.preferences as any)?.location && (
                            <div>Local: {(subscriber.preferences as any).location}</div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {subscribers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum subscritor encontrado.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Análises da Newsletter</CardTitle>
              <CardDescription>
                Estatísticas e insights sobre as subscrições
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Distribuição por Categorias</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(stats.categories_breakdown).map(([category, count]) => (
                        <div key={category} className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-primary">{count}</div>
                          <div className="text-sm text-muted-foreground capitalize">{category}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
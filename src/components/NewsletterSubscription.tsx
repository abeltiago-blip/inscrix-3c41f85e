import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, CheckCircle } from "lucide-react";

interface NewsletterSubscriptionProps {
  className?: string;
  compact?: boolean;
}

export default function NewsletterSubscription({ className, compact = false }: NewsletterSubscriptionProps) {
  const [email, setEmail] = useState("");
  const [categories, setCategories] = useState<string[]>(["events", "promotions", "news"]);
  const [frequency, setFrequency] = useState("weekly");
  const [location, setLocation] = useState("");
  const [sports, setSports] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { toast } = useToast();

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setCategories(prev => [...prev, category]);
    } else {
      setCategories(prev => prev.filter(c => c !== category));
    }
  };

  const handleSportChange = (sport: string, checked: boolean) => {
    if (checked) {
      setSports(prev => [...prev, sport]);
    } else {
      setSports(prev => prev.filter(s => s !== sport));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || categories.length === 0) {
      toast({
        title: "Erro",
        description: "Email e pelo menos uma categoria são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('newsletter-subscribe', {
        body: {
          email,
          categories,
          preferences: {
            frequency,
            location: location === "all" ? null : location || null,
            sports,
            age_group: null
          },
          user_id: user?.id || null
        }
      });

      if (error) throw error;

      setSubscribed(true);
      toast({
        title: "Subscrição realizada!",
        description: "Verifique o seu email para confirmar a subscrição.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao subscrever newsletter.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <Card className={className}>
        <CardContent className="pt-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Subscrição Realizada!</h3>
          <p className="text-muted-foreground">
            Verifique o seu email para confirmar a subscrição da newsletter.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className={`flex gap-2 ${className}`}>
        <Input
          type="email"
          placeholder="O seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "A subscrever..." : "Subscrever"}
        </Button>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Newsletter INSCRIX
        </CardTitle>
        <CardDescription>
          Subscreva para receber novidades sobre eventos desportivos, promoções e muito mais!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="O seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Categorias de Interesse *</Label>
            <div className="space-y-2">
              {[
                { id: "events", label: "Novos Eventos Desportivos" },
                { id: "promotions", label: "Promoções e Descontos" },
                { id: "news", label: "Notícias do Desporto" },
                { id: "results", label: "Resultados e Classificações" }
              ].map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.id}
                    checked={categories.includes(category.id)}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequência</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="event-based">Baseado em Eventos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localização (Opcional)</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma região" />
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
          </div>

          <div className="space-y-3">
            <Label>Desportos de Interesse (Opcional)</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Corrida", "Ciclismo", "Natação", "Triatlo", 
                "Futebol", "Basquetebol", "Ténis", "Outros"
              ].map((sport) => (
                <div key={sport} className="flex items-center space-x-2">
                  <Checkbox
                    id={sport}
                    checked={sports.includes(sport)}
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

          <Button
            type="submit"
            className="w-full"
            disabled={loading || categories.length === 0}
          >
            {loading ? "A subscrever..." : "Subscrever Newsletter"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Ao subscrever, aceita receber emails promocionais do INSCRIX. 
            Pode cancelar a subscrição a qualquer momento.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
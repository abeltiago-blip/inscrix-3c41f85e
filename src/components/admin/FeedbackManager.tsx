import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bug, Lightbulb, HelpCircle, Zap } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface Feedback {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  user_id: string | null;
}

const FeedbackManager = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const typeIcons = {
    bug: Bug,
    improvement: Lightbulb,
    feature: Zap,
    question: HelpCircle,
  };

  const typeColors = {
    bug: "bg-red-500",
    improvement: "bg-yellow-500",
    feature: "bg-blue-500",
    question: "bg-green-500",
  };

  const priorityColors = {
    low: "bg-gray-500",
    medium: "bg-yellow-500",
    high: "bg-orange-500",
    critical: "bg-red-500",
  };

  const statusColors = {
    pending: "bg-gray-500",
    in_progress: "bg-blue-500",
    resolved: "bg-green-500",
    rejected: "bg-red-500",
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const { data, error } = await supabase
        .from("user_feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFeedbacks(data || []);
      
      // Initialize admin notes
      const notes: Record<string, string> = {};
      data?.forEach(feedback => {
        notes[feedback.id] = feedback.admin_notes || "";
      });
      setAdminNotes(notes);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      toast({
        title: "Erro ao carregar feedback",
        description: "Não foi possível carregar o feedback dos utilizadores.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFeedbackStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from("user_feedback")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      setFeedbacks(prev =>
        prev.map(feedback =>
          feedback.id === id ? { ...feedback, status } : feedback
        )
      );

      toast({
        title: "Status atualizado",
        description: "O status do feedback foi atualizado com sucesso.",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: "Ocorreu um erro ao atualizar o status.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const updateAdminNotes = async (id: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from("user_feedback")
        .update({ admin_notes: adminNotes[id] })
        .eq("id", id);

      if (error) throw error;

      setFeedbacks(prev =>
        prev.map(feedback =>
          feedback.id === id ? { ...feedback, admin_notes: adminNotes[id] } : feedback
        )
      );

      toast({
        title: "Notas salvas",
        description: "As notas do administrador foram salvas com sucesso.",
      });
    } catch (error) {
      console.error("Error updating admin notes:", error);
      toast({
        title: "Erro ao salvar notas",
        description: "Ocorreu um erro ao salvar as notas.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const getTypeBadge = (type: string) => {
    const Icon = typeIcons[type as keyof typeof typeIcons];
    const color = typeColors[type as keyof typeof typeColors];
    
    return (
      <Badge variant="secondary" className={`${color} text-white`}>
        <Icon className="h-3 w-3 mr-1" />
        {type}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const color = priorityColors[priority as keyof typeof priorityColors];
    return (
      <Badge variant="secondary" className={`${color} text-white`}>
        {priority}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const color = statusColors[status as keyof typeof statusColors];
    const labels = {
      pending: "Pendente",
      in_progress: "Em Progresso",
      resolved: "Resolvido",
      rejected: "Rejeitado",
    };
    
    return (
      <Badge variant="secondary" className={`${color} text-white`}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando feedback...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestão de Feedback dos Utilizadores</CardTitle>
        <CardDescription>
          Gerir bugs reportados, sugestões de melhoria e perguntas dos utilizadores.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {feedbacks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum feedback encontrado.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbacks.map((feedback) => (
                  <TableRow key={feedback.id} className="group">
                    <TableCell>{getTypeBadge(feedback.type)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{feedback.title}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {feedback.description.substring(0, 100)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(feedback.priority)}</TableCell>
                    <TableCell>{getStatusBadge(feedback.status)}</TableCell>
                    <TableCell>
                      {format(new Date(feedback.created_at), "dd/MM/yyyy HH:mm", { locale: pt })}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Select
                          value={feedback.status}
                          onValueChange={(value) => updateFeedbackStatus(feedback.id, value)}
                          disabled={updatingId === feedback.id}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="in_progress">Em Progresso</SelectItem>
                            <SelectItem value="resolved">Resolvido</SelectItem>
                            <SelectItem value="rejected">Rejeitado</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Notas do administrador..."
                            value={adminNotes[feedback.id] || ""}
                            onChange={(e) =>
                              setAdminNotes(prev => ({
                                ...prev,
                                [feedback.id]: e.target.value
                              }))
                            }
                            className="min-h-[60px] text-xs"
                          />
                          <Button
                            size="sm"
                            onClick={() => updateAdminNotes(feedback.id)}
                            disabled={updatingId === feedback.id}
                          >
                            Salvar Notas
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackManager;
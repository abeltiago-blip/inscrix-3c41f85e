import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bug, Lightbulb, HelpCircle, Zap } from "lucide-react";

const feedbackSchema = z.object({
  type: z.enum(["bug", "improvement", "question", "feature"]),
  title: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  description: z.string().min(20, "Descrição deve ter pelo menos 20 caracteres"),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

const FeedbackModal = ({ open, onClose }: FeedbackModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      type: "bug",
      priority: "medium",
      title: "",
      description: "",
    },
  });

  const feedbackTypes = [
    {
      value: "bug" as const,
      label: "Bug Report",
      description: "Reportar um problema ou erro",
      icon: Bug,
      color: "bg-red-500"
    },
    {
      value: "improvement" as const,
      label: "Melhoria",
      description: "Sugestão para melhorar funcionalidade existente",
      icon: Lightbulb,
      color: "bg-yellow-500"
    },
    {
      value: "feature" as const,
      label: "Nova Funcionalidade",
      description: "Sugestão de nova funcionalidade",
      icon: Zap,
      color: "bg-blue-500"
    },
    {
      value: "question" as const,
      label: "Pergunta",
      description: "Dúvida sobre como usar a plataforma",
      icon: HelpCircle,
      color: "bg-green-500"
    }
  ];

  const priorityOptions = [
    { value: "low", label: "Baixa", color: "bg-gray-500" },
    { value: "medium", label: "Média", color: "bg-yellow-500" },
    { value: "high", label: "Alta", color: "bg-orange-500" },
    { value: "critical", label: "Crítica", color: "bg-red-500" }
  ];

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("user_feedback")
        .insert({
          type: data.type,
          title: data.title,
          description: data.description,
          priority: data.priority,
          user_id: user?.id || null,
        });

      if (error) throw error;

      toast({
        title: "Feedback enviado!",
        description: "Obrigado pelo seu feedback. Iremos analisar e responder em breve.",
      });

      form.reset();
      onClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Erro ao enviar feedback",
        description: "Ocorreu um erro. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedType = form.watch("type");
  const selectedPriority = form.watch("priority");
  
  const currentTypeInfo = feedbackTypes.find(t => t.value === selectedType);
  const currentPriorityInfo = priorityOptions.find(p => p.value === selectedPriority);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Enviar Feedback
          </DialogTitle>
          <DialogDescription>
            Ajude-nos a melhorar a plataforma reportando bugs, sugerindo melhorias ou fazendo perguntas.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Feedback</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {feedbackTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-3">
                            <div className={`p-1 rounded ${type.color} text-white`}>
                              <type.icon className="h-3 w-3" />
                            </div>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-muted-foreground">{type.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {currentTypeInfo && (
              <div className="p-3 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1 rounded ${currentTypeInfo.color} text-white`}>
                    <currentTypeInfo.icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{currentTypeInfo.label}</span>
                </div>
                <p className="text-sm text-muted-foreground">{currentTypeInfo.description}</p>
              </div>
            )}

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridade</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {priorityOptions.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="secondary" 
                              className={`${priority.color} text-white text-xs`}
                            >
                              {priority.label}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Título resumido do seu feedback"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição Detalhada</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva detalhadamente o problema, sugestão ou pergunta..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Enviar Feedback"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
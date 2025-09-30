import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, Send, Clock, Users, CheckCircle, AlertCircle, 
  Loader2, RefreshCw, Calendar, Filter 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface EmailManagerProps {
  eventId?: string;
  registrationId?: string;
}

interface EmailResult {
  success: boolean;
  message?: string;
  email_id?: string;
  sent?: number;
  failures?: number;
  results?: any[];
  errors?: any[];
}

export default function EmailManager({ eventId, registrationId }: EmailManagerProps) {
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<EmailResult | null>(null);
  const [emailType, setEmailType] = useState<string>('confirmation');
  const [reminderDays, setReminderDays] = useState(3);
  const [batchSize, setBatchSize] = useState(50);
  const [customMessage, setCustomMessage] = useState('');
  const { toast } = useToast();
  const { profile } = useAuth();

  const isAuthorized = profile?.role === 'admin' || profile?.role === 'organizer';

  const sendRegistrationEmail = async () => {
    if (!registrationId) {
      toast({
        title: "Erro",
        description: "ID da inscrição é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      setSending(true);
      setLastResult(null);

      const { data, error } = await supabase.functions.invoke('send-registration-email', {
        body: {
          registrationId: registrationId,
          type: emailType,
          includeTicket: emailType !== 'confirmation',
          customMessage: customMessage || undefined
        }
      });

      if (error) throw error;

      const result: EmailResult = data;
      setLastResult(result);

      if (result.success) {
        toast({
          title: "Email Enviado",
          description: result.message || "Email enviado com sucesso",
        });
      } else {
        throw new Error(result.message || "Erro ao enviar email");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      setLastResult({
        success: false,
        message: errorMessage
      });

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const sendEventReminders = async () => {
    try {
      setSending(true);
      setLastResult(null);

      const requestBody: any = {
        daysBeforeEvent: reminderDays,
        batchSize: batchSize
      };

      if (eventId) {
        requestBody.eventId = eventId;
      }

      if (registrationId) {
        requestBody.registrationId = registrationId;
      }

      const { data, error } = await supabase.functions.invoke('send-event-reminder', {
        body: requestBody
      });

      if (error) throw error;

      const result: EmailResult = data;
      setLastResult(result);

      if (result.success) {
        toast({
          title: "Lembretes Enviados",
          description: result.message || `${result.sent} lembretes enviados`,
        });
      } else {
        throw new Error(result.message || "Erro ao enviar lembretes");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      setLastResult({
        success: false,
        message: errorMessage
      });

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const resetResults = () => {
    setLastResult(null);
  };

  if (!isAuthorized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Gestão de Emails
          </CardTitle>
          <CardDescription>
            Apenas organizadores e administradores podem gerir emails
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Gestão de Emails
          </CardTitle>
          <CardDescription>
            Envie emails de confirmação, bilhetes e lembretes aos participantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="single" className="space-y-4">
            <TabsList>
              <TabsTrigger value="single">Email Individual</TabsTrigger>
              <TabsTrigger value="reminders">Lembretes</TabsTrigger>
            </TabsList>

            {/* Single Email Tab */}
            <TabsContent value="single" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emailType">Tipo de Email</Label>
                  <Select value={emailType} onValueChange={setEmailType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmation">Confirmação de Inscrição</SelectItem>
                      <SelectItem value="payment_confirmation">Confirmação de Pagamento</SelectItem>
                      <SelectItem value="ticket_delivery">Entrega de Bilhete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationInput">ID da Inscrição</Label>
                  <Input
                    id="registrationInput"
                    value={registrationId || ''}
                    placeholder="Insira o ID da inscrição"
                    disabled={!!registrationId}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customMessage">Mensagem Personalizada (Opcional)</Label>
                <Textarea
                  id="customMessage"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Adicione uma mensagem personalizada..."
                  rows={3}
                />
              </div>

              <Button 
                onClick={sendRegistrationEmail}
                disabled={sending || !registrationId}
                className="w-full"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Enviar Email
              </Button>
            </TabsContent>

            {/* Reminders Tab */}
            <TabsContent value="reminders" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reminderDays">Dias antes do evento</Label>
                  <Select 
                    value={reminderDays.toString()} 
                    onValueChange={(value) => setReminderDays(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 dia antes</SelectItem>
                      <SelectItem value="3">3 dias antes</SelectItem>
                      <SelectItem value="7">7 dias antes</SelectItem>
                      <SelectItem value="14">14 dias antes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batchSize">Tamanho do lote</Label>
                  <Select 
                    value={batchSize.toString()} 
                    onValueChange={(value) => setBatchSize(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25 emails</SelectItem>
                      <SelectItem value="50">50 emails</SelectItem>
                      <SelectItem value="100">100 emails</SelectItem>
                      <SelectItem value="200">200 emails</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Âmbito</Label>
                  <div className="text-sm text-muted-foreground">
                    {eventId ? 'Evento específico' : 'Todos os eventos'}
                  </div>
                </div>
              </div>

              <Button 
                onClick={sendEventReminders}
                disabled={sending}
                className="w-full"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Clock className="h-4 w-4 mr-2" />
                )}
                Enviar Lembretes
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Results */}
      {lastResult && (
        <Card className={lastResult.success ? "border-green-500" : "border-red-500"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {lastResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Resultado do Envio
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetResults}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {lastResult.success ? (
              <div className="space-y-3">
                <p className="text-green-700 font-medium">{lastResult.message}</p>
                
                {lastResult.sent !== undefined && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{lastResult.sent}</div>
                      <div className="text-sm text-green-700">Enviados</div>
                    </div>
                    {lastResult.failures !== undefined && (
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{lastResult.failures}</div>
                        <div className="text-sm text-red-700">Falharam</div>
                      </div>
                    )}
                  </div>
                )}

                {lastResult.email_id && (
                  <div className="text-sm text-muted-foreground">
                    <strong>ID do Email:</strong> {lastResult.email_id}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-red-700 font-medium">Erro no envio</p>
                <p className="text-sm text-muted-foreground">{lastResult.message}</p>
              </div>
            )}

            {/* Show errors if any */}
            {lastResult.errors && lastResult.errors.length > 0 && (
              <div className="mt-4">
                <p className="font-medium text-red-700 mb-2">Erros ({lastResult.errors.length}):</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {lastResult.errors.slice(0, 5).map((error, index) => (
                    <div key={index} className="text-xs bg-red-50 p-2 rounded">
                      <strong>{error.participant_email}:</strong> {error.error}
                    </div>
                  ))}
                  {lastResult.errors.length > 5 && (
                    <div className="text-xs text-muted-foreground">
                      ... e mais {lastResult.errors.length - 5} erros
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
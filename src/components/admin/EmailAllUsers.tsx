import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, Users, UserCheck, Clock, AlertCircle } from "lucide-react";

interface User {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'organizer' | 'participant' | 'team';
  is_active: boolean;
}

export default function EmailAllUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState({ current: 0, total: 0 });
  const { toast } = useToast();

  const [emailForm, setEmailForm] = useState({
    subject: "",
    htmlContent: "",
    targetRoles: ["participant", "organizer"] as string[],
    onlyActive: true,
    batchSize: 10,
    delay: 2000 // 2 seconds between batches
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name, role, is_active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (role: string, checked: boolean) => {
    if (checked) {
      setEmailForm(prev => ({ 
        ...prev, 
        targetRoles: [...prev.targetRoles, role] 
      }));
    } else {
      setEmailForm(prev => ({ 
        ...prev, 
        targetRoles: prev.targetRoles.filter(r => r !== role) 
      }));
    }
  };

  const getFilteredUsers = () => {
    return users.filter(user => {
      if (emailForm.onlyActive && !user.is_active) return false;
      return emailForm.targetRoles.includes(user.role);
    });
  };

  const sendEmailToAllUsers = async () => {
    if (!emailForm.subject || !emailForm.htmlContent) {
      toast({
        title: "Erro",
        description: "Assunto e conteúdo são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const targetUsers = getFilteredUsers();
    if (targetUsers.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhum utilizador corresponde aos critérios selecionados.",
        variant: "destructive",
      });
      return;
    }

    const confirmed = window.confirm(
      `Tem a certeza que pretende enviar este email para ${targetUsers.length} utilizadores?`
    );
    
    if (!confirmed) return;

    setSending(true);
    setSendProgress({ current: 0, total: targetUsers.length });

    let successCount = 0;
    let errorCount = 0;

    try {
      // Send emails in batches to avoid overwhelming the system
      for (let i = 0; i < targetUsers.length; i += emailForm.batchSize) {
        const batch = targetUsers.slice(i, i + emailForm.batchSize);
        
        // Send batch in parallel
        const batchPromises = batch.map(async (user) => {
          try {
            const { error } = await supabase.functions.invoke('send-template-email', {
              body: {
                templateKey: 'admin_broadcast',
                recipientEmail: user.email,
                recipientUserId: user.user_id,
                customSubject: emailForm.subject,
                customHtml: emailForm.htmlContent.replace(
                  /{{first_name}}/g, 
                  user.first_name || 'Utilizador'
                ),
                variables: {
                  first_name: user.first_name || 'Utilizador',
                  last_name: user.last_name || '',
                  full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim()
                }
              }
            });

            if (error) throw error;
            return { success: true, user };
          } catch (error) {
            console.error(`Error sending email to ${user.email}:`, error);
            return { success: false, user, error };
          }
        });

        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result) => {
          if (result.status === 'fulfilled' && result.value.success) {
            successCount++;
          } else {
            errorCount++;
          }
        });

        setSendProgress({ current: i + batch.length, total: targetUsers.length });

        // Add delay between batches if not the last batch
        if (i + emailForm.batchSize < targetUsers.length) {
          await new Promise(resolve => setTimeout(resolve, emailForm.delay));
        }
      }

      toast({
        title: "Envio concluído",
        description: `${successCount} emails enviados com sucesso. ${errorCount > 0 ? `${errorCount} emails falharam.` : ''}`,
        variant: errorCount > 0 ? "destructive" : "default"
      });

      // Reset form on success
      if (errorCount === 0) {
        setEmailForm(prev => ({
          ...prev,
          subject: "",
          htmlContent: ""
        }));
      }

    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
      setSendProgress({ current: 0, total: 0 });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Carregando utilizadores...</div>
        </CardContent>
      </Card>
    );
  }

  const filteredUsers = getFilteredUsers();

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">Total Utilizadores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.is_active).length}</p>
                <p className="text-sm text-muted-foreground">Utilizadores Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Mail className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{filteredUsers.length}</p>
                <p className="text-sm text-muted-foreground">Destinatários Alvo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              {sending ? (
                <Clock className="h-8 w-8 text-orange-500" />
              ) : (
                <Send className="h-8 w-8 text-indigo-500" />
              )}
              <div>
                <p className="text-2xl font-bold">
                  {sending ? `${sendProgress.current}/${sendProgress.total}` : 'Pronto'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {sending ? 'A enviar...' : 'Estado do Envio'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enviar Email para Todos os Utilizadores</CardTitle>
          <CardDescription>
            Envie emails personalizados para todos os utilizadores registados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="subject">Assunto *</Label>
            <Input
              id="subject"
              value={emailForm.subject}
              onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Assunto do email"
              disabled={sending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="htmlContent">Conteúdo HTML *</Label>
            <Textarea
              id="htmlContent"
              value={emailForm.htmlContent}
              onChange={(e) => setEmailForm(prev => ({ ...prev, htmlContent: e.target.value }))}
              placeholder="Conteúdo HTML do email. Use {{first_name}} para personalizar com o nome do utilizador."
              rows={12}
              disabled={sending}
            />
            <p className="text-sm text-muted-foreground">
              Dica: Use <code>{"{{first_name}}"}</code> para personalizar com o nome do utilizador
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Roles Alvo *</Label>
              <div className="space-y-2">
                {[
                  { id: "participant", label: "Participantes", count: users.filter(u => u.role === 'participant' && (emailForm.onlyActive ? u.is_active : true)).length },
                  { id: "organizer", label: "Organizadores", count: users.filter(u => u.role === 'organizer' && (emailForm.onlyActive ? u.is_active : true)).length },
                  { id: "team", label: "Equipas", count: users.filter(u => u.role === 'team' && (emailForm.onlyActive ? u.is_active : true)).length },
                  { id: "admin", label: "Administradores", count: users.filter(u => u.role === 'admin' && (emailForm.onlyActive ? u.is_active : true)).length }
                ].map((role) => (
                  <div key={role.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={role.id}
                        checked={emailForm.targetRoles.includes(role.id)}
                        onCheckedChange={(checked) => 
                          handleRoleChange(role.id, checked as boolean)
                        }
                        disabled={sending}
                      />
                      <Label htmlFor={role.id} className="text-sm font-normal">
                        {role.label}
                      </Label>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {role.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Configurações de Envio</Label>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="onlyActive"
                    checked={emailForm.onlyActive}
                    onCheckedChange={(checked) => 
                      setEmailForm(prev => ({ ...prev, onlyActive: checked as boolean }))
                    }
                    disabled={sending}
                  />
                  <Label htmlFor="onlyActive" className="text-sm font-normal">
                    Apenas utilizadores ativos
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batchSize">Tamanho do lote</Label>
                  <Input
                    id="batchSize"
                    type="number"
                    min="1"
                    max="50"
                    value={emailForm.batchSize}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, batchSize: parseInt(e.target.value) || 10 }))}
                    disabled={sending}
                  />
                  <p className="text-xs text-muted-foreground">
                    Emails por lote (1-50)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delay">Delay entre lotes (ms)</Label>
                  <Input
                    id="delay"
                    type="number"
                    min="1000"
                    max="10000"
                    value={emailForm.delay}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, delay: parseInt(e.target.value) || 2000 }))}
                    disabled={sending}
                  />
                  <p className="text-xs text-muted-foreground">
                    Pausa entre lotes (1000-10000 ms)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {filteredUsers.length === 0 && (
            <div className="flex items-center space-x-2 text-orange-600 bg-orange-50 p-3 rounded">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Nenhum utilizador corresponde aos critérios selecionados.</span>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              onClick={sendEmailToAllUsers}
              disabled={sending || !emailForm.subject || !emailForm.htmlContent || filteredUsers.length === 0 || emailForm.targetRoles.length === 0}
              className="min-w-32"
            >
              {sending ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  A enviar... {sendProgress.current}/{sendProgress.total}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar para {filteredUsers.length} utilizadores
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
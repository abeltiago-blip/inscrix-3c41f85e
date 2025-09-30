import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, 
  AlertTriangle, 
  Users, 
  Euro, 
  Calendar, 
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';

interface Event {
  id: string;
  title: string;
  category: string;
  status: string;
  start_date: string;
  location: string;
  organizer_id: string;
}

interface EventDependencies {
  registrations: number;
  orders: number;
  tickets: number;
  revenue: number;
  canDelete: boolean;
  warnings: string[];
}

interface EventDeletionManagerProps {
  event: Event;
  onEventDeleted: () => void;
}

const EventDeletionManager: React.FC<EventDeletionManagerProps> = ({ event, onEventDeleted }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dependencies, setDependencies] = useState<EventDependencies | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [forceDelete, setForceDelete] = useState(false);

  const checkDependencies = async () => {
    setLoading(true);
    try {
      const [
        { data: registrations },
        { data: orders },
        { data: tickets }
      ] = await Promise.all([
        supabase.from('registrations').select('*').eq('event_id', event.id),
        supabase.from('orders').select('*').eq('event_id', event.id),
        supabase.from('ticket_types').select('*').eq('event_id', event.id)
      ]);

      const registrationsCount = registrations?.length || 0;
      const ordersCount = orders?.length || 0;
      const ticketsCount = tickets?.length || 0;
      const revenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      const warnings = [];
      if (registrationsCount > 0) {
        warnings.push(`${registrationsCount} inscrições serão eliminadas`);
      }
      if (ordersCount > 0) {
        warnings.push(`${ordersCount} encomendas serão eliminadas`);
      }
      if (revenue > 0) {
        warnings.push(`€${revenue.toFixed(2)} em receita será perdida`);
      }

      const canDelete = registrationsCount === 0 && ordersCount === 0;

      const deps = {
        registrations: registrationsCount,
        orders: ordersCount,
        tickets: ticketsCount,
        revenue,
        canDelete,
        warnings
      };

      setDependencies(deps);
      setShowConfirmDialog(true);

    } catch (error) {
      console.error('Erro ao verificar dependências:', error);
      toast({
        title: "Erro",
        description: "Erro ao verificar dependências do evento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!dependencies) return;

    setLoading(true);
    try {
      // Se forceDelete estiver ativo, eliminar dependências primeiro
      if (forceDelete) {
        if (dependencies.registrations > 0) {
          const { error: regError } = await supabase
            .from('registrations')
            .delete()
            .eq('event_id', event.id);
          if (regError) throw regError;
        }

        if (dependencies.orders > 0) {
          const { error: orderError } = await supabase
            .from('orders')
            .delete()
            .eq('event_id', event.id);
          if (orderError) throw orderError;
        }
      }

      // Eliminar ticket types
      if (dependencies.tickets > 0) {
        const { error: ticketError } = await supabase
          .from('ticket_types')
          .delete()
          .eq('event_id', event.id);
        if (ticketError) throw ticketError;
      }

      // Eliminar o evento
      const { error: eventError } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);

      if (eventError) throw eventError;

      toast({
        title: "Sucesso",
        description: `Evento "${event.title}" eliminado com sucesso`,
      });

      setShowConfirmDialog(false);
      onEventDeleted();

    } catch (error) {
      console.error('Erro ao eliminar evento:', error);
      toast({
        title: "Erro",
        description: "Erro ao eliminar evento. Verifique as permissões.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Eliminar Evento
          </CardTitle>
          <CardDescription>
            Verificar dependências e eliminar "{event.title}" permanentemente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Título:</span> {event.title}
              </div>
              <div>
                <span className="font-medium">Categoria:</span> {event.category}
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <Badge className="ml-2" variant={event.status === 'published' ? 'default' : 'secondary'}>
                  {event.status}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Data:</span> {new Date(event.start_date).toLocaleDateString('pt-PT')}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Esta ação é permanente e não pode ser desfeita
              </div>
              <Button
                variant="destructive"
                onClick={checkDependencies}
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Verificar e Eliminar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirmar Eliminação do Evento
            </AlertDialogTitle>
            <AlertDialogDescription>
              Verificação de dependências para "{event.title}":
            </AlertDialogDescription>
          </AlertDialogHeader>

          {dependencies && (
            <div className="space-y-4">
              {/* Dependencies Overview */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">Inscrições</span>
                      </div>
                      <Badge variant={dependencies.registrations > 0 ? 'destructive' : 'default'}>
                        {dependencies.registrations}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">Encomendas</span>
                      </div>
                      <Badge variant={dependencies.orders > 0 ? 'destructive' : 'default'}>
                        {dependencies.orders}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Euro className="h-4 w-4" />
                        <span className="text-sm">Receita</span>
                      </div>
                      <Badge variant={dependencies.revenue > 0 ? 'destructive' : 'default'}>
                        €{dependencies.revenue.toFixed(2)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Pode Eliminar</span>
                      </div>
                      {dependencies.canDelete ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Warnings */}
              {dependencies.warnings.length > 0 && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <h4 className="font-medium text-destructive mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Avisos Importantes:
                  </h4>
                  <ul className="text-sm space-y-1">
                    {dependencies.warnings.map((warning, index) => (
                      <li key={index} className="flex items-center gap-2 text-destructive">
                        <span className="w-1 h-1 bg-destructive rounded-full" />
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Force Delete Option */}
              {!dependencies.canDelete && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="force-delete"
                    checked={forceDelete}
                    onCheckedChange={(checked) => setForceDelete(checked === true)}
                  />
                  <label htmlFor="force-delete" className="text-sm font-medium">
                    Eliminar forçadamente (incluindo todas as dependências)
                  </label>
                </div>
              )}

              {/* Action Buttons */}
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={!dependencies.canDelete && !forceDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  {forceDelete ? 'Eliminar Forçadamente' : 'Confirmar Eliminação'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </div>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventDeletionManager;
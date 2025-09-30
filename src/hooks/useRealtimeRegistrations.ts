import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Registration {
  id: string;
  registration_number: string;
  participant_name: string;
  participant_email: string;
  status: string;
  payment_status: string;
  check_in_status: string;
  event_id: string;
  participant_id: string;
  user_id: string;
  amount_paid: number;
  created_at: string;
  updated_at: string;
}

interface UseRealtimeRegistrationsOptions {
  eventId?: string;
  participantId?: string;
  showToasts?: boolean;
}

export function useRealtimeRegistrations(
  initialRegistrations: Registration[] = [],
  options: UseRealtimeRegistrationsOptions = {}
) {
  const [registrations, setRegistrations] = useState<Registration[]>(initialRegistrations);
  const { toast } = useToast();
  const { eventId, participantId, showToasts = false } = options;

  useEffect(() => {
    setRegistrations(initialRegistrations);
  }, [initialRegistrations]);

  useEffect(() => {
    // Create a channel for real-time updates
    const channel = supabase
      .channel('registrations-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registrations',
          // Filter by event_id or participant_id if provided
          filter: eventId ? `event_id=eq.${eventId}` : participantId ? `participant_id=eq.${participantId}` : undefined,
        },
        (payload) => {
          console.log('Registration realtime update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newRegistration = payload.new as Registration;
            
            // Only add if it matches our filters
            if ((!eventId || newRegistration.event_id === eventId) && 
                (!participantId || newRegistration.participant_id === participantId)) {
              setRegistrations(prev => [newRegistration, ...prev]);
              
              if (showToasts) {
                toast({
                  title: "Nova Inscrição",
                  description: `${newRegistration.participant_name} inscreveu-se`,
                });
              }
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedRegistration = payload.new as Registration;
            const oldRegistration = payload.old as Registration;
            
            setRegistrations(prev => prev.map(reg => 
              reg.id === updatedRegistration.id ? updatedRegistration : reg
            ));
            
            // Show toasts for important status changes
            if (showToasts) {
              if (oldRegistration.payment_status !== updatedRegistration.payment_status) {
                if (updatedRegistration.payment_status === 'paid') {
                  toast({
                    title: "Pagamento Confirmado!",
                    description: `Inscrição de ${updatedRegistration.participant_name} foi paga`,
                    variant: "default",
                  });
                }
              }
              
              if (oldRegistration.check_in_status !== updatedRegistration.check_in_status) {
                if (updatedRegistration.check_in_status === 'checked_in') {
                  toast({
                    title: "Check-in Realizado",
                    description: `${updatedRegistration.participant_name} fez check-in`,
                  });
                }
              }
              
              if (oldRegistration.status !== updatedRegistration.status) {
                if (updatedRegistration.status === 'active') {
                  toast({
                    title: "Inscrição Ativa",
                    description: `Inscrição de ${updatedRegistration.participant_name} está ativa`,
                  });
                } else if (updatedRegistration.status === 'cancelled') {
                  toast({
                    title: "Inscrição Cancelada",
                    description: `Inscrição de ${updatedRegistration.participant_name} foi cancelada`,
                    variant: "destructive",
                  });
                }
              }
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedRegistration = payload.old as Registration;
            setRegistrations(prev => prev.filter(reg => reg.id !== deletedRegistration.id));
            
            if (showToasts) {
              toast({
                title: "Inscrição Removida",
                description: `Inscrição de ${deletedRegistration.participant_name} foi removida`,
                variant: "destructive",
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, participantId, showToasts, toast]);

  return registrations;
}
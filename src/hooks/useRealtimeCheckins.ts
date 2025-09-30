import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EventCheckin {
  id: string;
  event_id: string;
  registration_id: string;
  participant_id: string;
  participant_name: string;  
  participant_email: string;
  checkin_time: string;
  checkin_method: string;
  scanner_user_id?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

interface UseRealtimeCheckinsOptions {
  eventId?: string;
  showToasts?: boolean;
}

export function useRealtimeCheckins(
  initialCheckins: EventCheckin[] = [],
  options: UseRealtimeCheckinsOptions = {}
) {
  const [checkins, setCheckins] = useState<EventCheckin[]>(initialCheckins);
  const { toast } = useToast();
  const { eventId, showToasts = false } = options;

  useEffect(() => {
    setCheckins(initialCheckins);
  }, [initialCheckins]);

  useEffect(() => {
    // Create a channel for real-time updates
    const channel = supabase
      .channel('event-checkins-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_checkins',
          // Filter by event_id if provided
          filter: eventId ? `event_id=eq.${eventId}` : undefined,
        },
        (payload) => {
          console.log('Event checkin realtime update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newCheckin = payload.new as EventCheckin;
            
            // Only add if it matches our filters
            if (!eventId || newCheckin.event_id === eventId) {
              setCheckins(prev => [newCheckin, ...prev]);
              
              if (showToasts) {
                toast({
                  title: "Novo Check-in! ✅",
                  description: `${newCheckin.participant_name} fez check-in`,
                });
              }
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedCheckin = payload.new as EventCheckin;
            
            setCheckins(prev => prev.map(checkin => 
              checkin.id === updatedCheckin.id ? updatedCheckin : checkin
            ));
            
            if (showToasts) {
              toast({
                title: "Check-in Atualizado",
                description: `Dados de check-in de ${updatedCheckin.participant_name} foram atualizados`,
              });
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedCheckin = payload.old as EventCheckin;
            setCheckins(prev => prev.filter(checkin => checkin.id !== deletedCheckin.id));
            
            if (showToasts) {
              toast({
                title: "Check-in Removido",
                description: `Check-in de ${deletedCheckin.participant_name} foi removido`,
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
  }, [eventId, showToasts, toast]);

  return checkins;
}
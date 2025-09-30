import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  user_id: string;
  event_id: string;
  registration_id: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  metadata: any;
}

interface UseRealtimeOrdersOptions {
  userId?: string;
  eventId?: string;
  showToasts?: boolean;
}

export function useRealtimeOrders(
  initialOrders: Order[] = [],
  options: UseRealtimeOrdersOptions = {}
) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const { toast } = useToast();
  const { userId, eventId, showToasts = false } = options;

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  useEffect(() => {
    // Create a channel for real-time updates
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          // Filter by user_id or event_id if provided
          filter: userId ? `user_id=eq.${userId}` : eventId ? `event_id=eq.${eventId}` : undefined,
        },
        (payload) => {
          console.log('Order realtime update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order;
            
            // Only add if it matches our filters
            if ((!userId || newOrder.user_id === userId) && 
                (!eventId || newOrder.event_id === eventId)) {
              setOrders(prev => [newOrder, ...prev]);
              
              if (showToasts) {
                toast({
                  title: "Nova Encomenda",
                  description: `Encomenda ${newOrder.order_number} criada`,
                });
              }
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = payload.new as Order;
            const oldOrder = payload.old as Order;
            
            setOrders(prev => prev.map(order => 
              order.id === updatedOrder.id ? updatedOrder : order
            ));
            
            // Show toast for payment status changes
            if (showToasts && oldOrder.payment_status !== updatedOrder.payment_status) {
              if (updatedOrder.payment_status === 'paid') {
                toast({
                  title: "Pagamento Confirmado!",
                  description: `Encomenda ${updatedOrder.order_number} foi paga`,
                  variant: "default",
                });
              } else if (updatedOrder.payment_status === 'failed') {
                toast({
                  title: "Pagamento Falhado",
                  description: `Encomenda ${updatedOrder.order_number} - pagamento falhou`,
                  variant: "destructive",
                });
              }
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedOrder = payload.old as Order;
            setOrders(prev => prev.filter(order => order.id !== deletedOrder.id));
            
            if (showToasts) {
              toast({
                title: "Encomenda Removida",
                description: `Encomenda ${deletedOrder.order_number} foi removida`,
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
  }, [userId, eventId, showToasts, toast]);

  return orders;
}
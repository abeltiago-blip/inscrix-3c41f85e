import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EasyPayPayment {
  id: string;
  order_id: string;
  easypay_payment_id: string;
  method: string;
  amount: number;
  currency: string;
  status: string;
  easypay_status: string;
  entity?: string;
  reference?: string;
  phone?: string;
  paid_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  metadata: any;
  easypay_response: any;
}

interface UseRealtimePaymentsOptions {
  orderId?: string;
  showToasts?: boolean;
}

export function useRealtimePayments(
  initialPayments: EasyPayPayment[] = [],
  options: UseRealtimePaymentsOptions = {}
) {
  const [payments, setPayments] = useState<EasyPayPayment[]>(initialPayments);
  const { toast } = useToast();
  const { orderId, showToasts = false } = options;

  useEffect(() => {
    setPayments(initialPayments);
  }, [initialPayments]);

  useEffect(() => {
    // Create a channel for real-time updates
    const channel = supabase
      .channel('easypay-payments-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'easypay_payments',
          // Filter by order_id if provided
          filter: orderId ? `order_id=eq.${orderId}` : undefined,
        },
        (payload) => {
          console.log('EasyPay payment realtime update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newPayment = payload.new as EasyPayPayment;
            
            // Only add if it matches our filters
            if (!orderId || newPayment.order_id === orderId) {
              setPayments(prev => [newPayment, ...prev]);
              
              if (showToasts) {
                toast({
                  title: "Novo Pagamento",
                  description: `Pagamento ${newPayment.method} iniciado (€${newPayment.amount})`,
                });
              }
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedPayment = payload.new as EasyPayPayment;
            const oldPayment = payload.old as EasyPayPayment;
            
            setPayments(prev => prev.map(payment => 
              payment.id === updatedPayment.id ? updatedPayment : payment
            ));
            
            // Show toasts for payment status changes
            if (showToasts && oldPayment.status !== updatedPayment.status) {
              if (updatedPayment.status === 'paid') {
                toast({
                  title: "Pagamento Confirmado! 🎉",
                  description: `Pagamento ${updatedPayment.method} de €${updatedPayment.amount} foi confirmado`,
                  variant: "default",
                });
              } else if (updatedPayment.status === 'failed') {
                toast({
                  title: "Pagamento Falhado",
                  description: `Pagamento ${updatedPayment.method} de €${updatedPayment.amount} falhou`,
                  variant: "destructive",
                });
              } else if (updatedPayment.status === 'expired') {
                toast({
                  title: "Pagamento Expirado",
                  description: `Pagamento ${updatedPayment.method} expirou`,
                  variant: "destructive",
                });
              }
            }
            
            // Show toasts for EasyPay webhook updates
            if (showToasts && 
                oldPayment.easypay_status !== updatedPayment.easypay_status &&
                updatedPayment.easypay_response?.webhook_received_at) {
              toast({
                title: "Atualização do Pagamento",
                description: `Status EasyPay: ${updatedPayment.easypay_status}`,
              });
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedPayment = payload.old as EasyPayPayment;
            setPayments(prev => prev.filter(payment => payment.id !== deletedPayment.id));
            
            if (showToasts) {
              toast({
                title: "Pagamento Removido",
                description: `Pagamento ${deletedPayment.easypay_payment_id} foi removido`,
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
  }, [orderId, showToasts, toast]);

  return payments;
}
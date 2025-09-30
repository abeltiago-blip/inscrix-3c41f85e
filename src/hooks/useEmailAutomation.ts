import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmailAutomationOptions {
  enableAutoEmails?: boolean;
  onEmailSent?: (result: any) => void;
  onEmailError?: (error: any) => void;
}

export const useEmailAutomation = (options: EmailAutomationOptions = {}) => {
  const { toast } = useToast();
  const { enableAutoEmails = true, onEmailSent, onEmailError } = options;

  const sendRegistrationConfirmation = useCallback(async (registrationId: string) => {
    if (!enableAutoEmails) return;

    try {
      const { data, error } = await supabase.functions.invoke('send-template-email', {
        body: {
          templateKey: 'registration_confirmation',
          registrationId: registrationId,
          variables: {
            registrationId: registrationId
          }
        }
      });

      if (error) throw error;

      if (data.success) {
        console.log('Registration confirmation email sent:', data);
        onEmailSent?.(data);
      } else {
        throw new Error(data.error || 'Failed to send confirmation email');
      }
    } catch (error) {
      console.error('Error sending registration confirmation:', error);
      onEmailError?.(error);
      
      // Don't show toast for automated emails to avoid spam
      // Only log the error
    }
  }, [enableAutoEmails, onEmailSent, onEmailError]);

  const sendPaymentConfirmation = useCallback(async (registrationId: string) => {
    if (!enableAutoEmails) return;

    try {
      const { data, error } = await supabase.functions.invoke('send-template-email', {
        body: {
          templateKey: 'payment_confirmation',
          registrationId: registrationId,
          variables: {
            registrationId: registrationId,
            includeTicket: true
          }
        }
      });

      if (error) throw error;

      if (data.success) {
        console.log('Payment confirmation email sent:', data);
        onEmailSent?.(data);
        
        // Show toast for payment confirmations as they're important
        toast({
          title: "Email Enviado",
          description: "Email de confirmação de pagamento enviado com bilhete",
        });
      } else {
        throw new Error(data.error || 'Failed to send payment confirmation');
      }
    } catch (error) {
      console.error('Error sending payment confirmation:', error);
      onEmailError?.(error);
    }
  }, [enableAutoEmails, onEmailSent, onEmailError, toast]);

  const sendTicketDelivery = useCallback(async (registrationId: string) => {
    if (!enableAutoEmails) return;

    try {
      const { data, error } = await supabase.functions.invoke('send-template-email', {
        body: {
          templateKey: 'ticket_delivery',
          registrationId: registrationId,
          variables: {
            registrationId: registrationId,
            includeTicket: true
          }
        }
      });

      if (error) throw error;

      if (data.success) {
        console.log('Ticket delivery email sent:', data);
        onEmailSent?.(data);
      } else {
        throw new Error(data.error || 'Failed to send ticket');
      }
    } catch (error) {
      console.error('Error sending ticket:', error);
      onEmailError?.(error);
    }
  }, [enableAutoEmails, onEmailSent, onEmailError]);

  const sendEventReminder = useCallback(async (
    params: {
      eventId?: string;
      registrationId?: string;
      daysBeforeEvent: number;
    }
  ) => {
    if (!enableAutoEmails) return;

    try {
      const { data, error } = await supabase.functions.invoke('send-event-reminder', {
        body: {
          eventId: params.eventId,
          registrationId: params.registrationId,
          daysBeforeEvent: params.daysBeforeEvent,
          batchSize: 50
        }
      });

      if (error) throw error;

      if (data.success) {
        console.log('Event reminder sent:', data);
        onEmailSent?.(data);
        
        if (data.sent > 0) {
          toast({
            title: "Lembretes Enviados",
            description: `${data.sent} lembretes foram enviados com sucesso`,
          });
        }
      } else {
        throw new Error(data.error || 'Failed to send reminders');
      }
    } catch (error) {
      console.error('Error sending event reminder:', error);
      onEmailError?.(error);
    }
  }, [enableAutoEmails, onEmailSent, onEmailError, toast]);

  // Automated triggers for different scenarios
  const triggerRegistrationFlow = useCallback(async (registrationId: string) => {
    // Send immediate confirmation
    await sendRegistrationConfirmation(registrationId);
    
    // Add small delay then check payment status
    setTimeout(async () => {
      try {
        const { data: registration } = await supabase
          .from('registrations')
          .select('payment_status')
          .eq('id', registrationId)
          .single();

        if (registration?.payment_status === 'paid') {
          await sendPaymentConfirmation(registrationId);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 2000);
  }, [sendRegistrationConfirmation, sendPaymentConfirmation]);

  const triggerPaymentFlow = useCallback(async (registrationId: string) => {
    await sendPaymentConfirmation(registrationId);
  }, [sendPaymentConfirmation]);

  return {
    sendRegistrationConfirmation,
    sendPaymentConfirmation,
    sendTicketDelivery,
    sendEventReminder,
    triggerRegistrationFlow,
    triggerPaymentFlow
  };
};
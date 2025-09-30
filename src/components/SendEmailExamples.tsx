import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SendEmailExamples = () => {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const sendExamples = async () => {
    if (sent) {
      toast.error("Exemplos já foram enviados. Esta ação só pode ser executada uma vez.");
      return;
    }

    setSending(true);
    const recipients = ["abeltiago@hotmail.com", "paulo@patusbravus.com"];
    const results = [];

    try {
      for (const email of recipients) {
        console.log(`Enviando exemplos para: ${email}`);
        
        const { data, error } = await supabase.functions.invoke('send-email-examples', {
          body: { targetEmail: email }
        });

        if (error) {
          console.error(`Erro ao enviar para ${email}:`, error);
          results.push({ email, success: false, error: error.message });
        } else {
          console.log(`Exemplos enviados para ${email}:`, data);
          results.push({ email, success: true, data });
        }

        // Pausa entre envios
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      if (successful > 0) {
        toast.success(`Exemplos enviados com sucesso para ${successful} destinatário(s)!`);
        setSent(true);
      }

      if (failed > 0) {
        toast.error(`Falhou o envio para ${failed} destinatário(s)`);
      }

      console.log("Resultados completos:", results);

    } catch (error) {
      console.error("Erro geral:", error);
      toast.error("Erro ao enviar exemplos: " + error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 bg-card border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Enviar Exemplos de Email</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Enviar exemplos dos templates de email para:
        <br />• abeltiago@hotmail.com
        <br />• paulo@patusbravus.com
      </p>
      
      {sent && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
          ✅ Exemplos já foram enviados! Esta ação só pode ser executada uma vez.
        </div>
      )}

      <Button 
        onClick={sendExamples} 
        disabled={sending || sent}
        className="w-full"
      >
        {sending ? "Enviando exemplos..." : sent ? "Exemplos enviados" : "📧 Enviar Exemplos"}
      </Button>
    </div>
  );
};

export default SendEmailExamples;
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🧪 Teste SMTP simples iniciado");
    
    const { testEmail } = await req.json();
    
    if (!testEmail) {
      throw new Error("Email é obrigatório");
    }

    // Configuração SMTP dos secrets
    const smtpHost = Deno.env.get('SMTP_HOST');
    const smtpPort = Deno.env.get('SMTP_PORT');
    const smtpUser = Deno.env.get('SMTP_USERNAME');
    const smtpPass = Deno.env.get('SMTP_PASSWORD');

    console.log("📧 Configuração SMTP:", {
      host: smtpHost,
      port: smtpPort,
      user: smtpUser,
      pass: smtpPass ? '[CONFIGURED]' : '[MISSING]'
    });

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      throw new Error("Configuração SMTP incompleta");
    }

    // Criar cliente SMTP
    const client = new SMTPClient({
      connection: {
        hostname: smtpHost,
        port: parseInt(smtpPort),
        tls: parseInt(smtpPort) === 465,
        auth: {
          username: smtpUser,
          password: smtpPass,
        },
      },
    });

    console.log("📮 Enviando email de teste...");

    // Enviar email de teste
    await client.send({
      from: `INSCRIX Test <${smtpUser}>`,
      to: testEmail,
      subject: `🧪 Teste SMTP INSCRIX - ${new Date().toLocaleTimeString('pt-PT')}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Teste SMTP</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h1 style="color: #2563eb;">✅ SMTP Funcionando!</h1>
            <p><strong>Parabéns!</strong> O sistema SMTP está operacional.</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString('pt-PT')}</p>
            <p><strong>Servidor:</strong> ${smtpHost}:${smtpPort}</p>
            <p><strong>De:</strong> ${smtpUser}</p>
            <p><strong>Para:</strong> ${testEmail}</p>
            <hr style="margin: 20px 0;">
            <p style="color: #666; font-size: 14px;">
              Este é um email de teste do sistema INSCRIX. 
              Se recebeu este email, o SMTP está configurado corretamente.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    await client.close();
    console.log("✅ Email enviado com sucesso!");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email de teste enviado com sucesso!",
        details: {
          to: testEmail,
          server: `${smtpHost}:${smtpPort}`,
          timestamp: new Date().toISOString()
        }
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error) {
    console.error("❌ Erro no teste SMTP:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("📧 Enviando email de confirmação personalizado");
    
    const { email, firstName, lastName, confirmationToken, userId } = await req.json();
    
    if (!email || !confirmationToken) {
      throw new Error("Email e token de confirmação são obrigatórios");
    }

    // Configuração SMTP
    const smtpHost = Deno.env.get('SMTP_HOST');
    const smtpPort = Deno.env.get('SMTP_PORT');
    const smtpUser = Deno.env.get('SMTP_USERNAME');
    const smtpPass = Deno.env.get('SMTP_PASSWORD');

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

    const fullName = `${firstName || ''} ${lastName || ''}`.trim() || 'Utilizador';
    
    // URL de confirmação personalizada
    const confirmationUrl = `https://inscrix.pt/confirm-email?token=${confirmationToken}&email=${encodeURIComponent(email)}`;
    
    console.log("🔗 URL de confirmação:", confirmationUrl);

    // Email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confirme a sua conta INSCRIX</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #2563eb; }
    .logo { font-size: 28px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
    .subtitle { color: #666; font-size: 16px; }
    .content { margin: 30px 0; }
    .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; box-shadow: 0 4px 10px rgba(37,99,235,0.3); }
    .button:hover { background: linear-gradient(135deg, #1d4ed8, #1e40af); }
    .url-box { background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb; word-break: break-all; font-family: monospace; margin: 20px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
    .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 6px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">INSCRIX</div>
      <div class="subtitle">Plataforma de Eventos Desportivos</div>
    </div>
    
    <div class="content">
      <h1>Bem-vindo, ${fullName}! 🎉</h1>
      
      <p>Obrigado por se registar na plataforma INSCRIX. Para completar o seu registo e ativar a sua conta, confirme o seu email clicando no botão abaixo:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${confirmationUrl}" class="button">✅ Confirmar Email</a>
      </div>
      
      <div class="warning">
        <strong>⚠️ Importante:</strong> Este link é válido por 24 horas. Após este período, terá de solicitar um novo email de confirmação.
      </div>
      
      <p><strong>Não consegue clicar no botão?</strong> Copie e cole o link abaixo no seu navegador:</p>
      <div class="url-box">${confirmationUrl}</div>
    </div>
    
    <div class="footer">
      <p><strong>📧 Email:</strong> ${email}</p>
      <p><strong>🕒 Enviado em:</strong> ${new Date().toLocaleString('pt-PT')}</p>
      <hr style="margin: 20px 0;">
      <p>Se não criou esta conta, pode ignorar este email com segurança.</p>
      <p>Para qualquer questão, contacte-nos através do site inscrix.pt</p>
      <p><strong>Equipa INSCRIX</strong><br>
      Sistema de Gestão de Eventos Desportivos</p>
    </div>
  </div>
</body>
</html>`;

    console.log("📮 Enviando email via SMTP...");

    // Enviar email
    await client.send({
      from: `INSCRIX <${smtpUser}>`,
      to: email,
      subject: `🔐 Confirme a sua conta INSCRIX - ${fullName}`,
      html: emailHtml,
    });

    await client.close();
    console.log("✅ Email de confirmação enviado com sucesso!");

    // Log para a base de dados (opcional)
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabase.from('email_logs').insert({
        recipient_email: email,
        recipient_user_id: userId,
        subject: `🔐 Confirme a sua conta INSCRIX - ${fullName}`,
        template_key: 'custom_confirmation',
        status: 'sent',
        sent_at: new Date().toISOString(),
        provider: 'smtp_custom',
        metadata: { 
          confirmation_token: confirmationToken,
          full_name: fullName
        }
      });
      
      console.log("📊 Email registado na base de dados");
    } catch (logError) {
      console.warn("⚠️ Falha ao registar email na BD:", logError.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email de confirmação enviado com sucesso!",
        details: {
          to: email,
          name: fullName,
          timestamp: new Date().toISOString()
        }
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error) {
    console.error("❌ Erro ao enviar email de confirmação:", error);
    
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
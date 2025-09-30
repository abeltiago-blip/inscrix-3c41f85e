import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

// Initialize SMTP client
const smtpClient = new SMTPClient({
  connection: {
    hostname: Deno.env.get("SMTP_HOST")!,
    port: parseInt(Deno.env.get("SMTP_PORT") || "587"),
    tls: true,
    auth: {
      username: Deno.env.get("SMTP_USERNAME")!,
      password: Deno.env.get("SMTP_PASSWORD")!,
    },
  },
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 Send-auth-email function started')
    
    const startTime = Date.now()
    const requestData = await req.json()
    console.log('📨 Request data received:', JSON.stringify(requestData, null, 2))

    // Validate request data
    if (!requestData.record || !requestData.record.email) {
      const errorMsg = 'Missing required email data in request'
      console.error('❌ Validation error:', errorMsg)
      return new Response(JSON.stringify({
        success: false,
        error: errorMsg
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const user = requestData.record
    const userMetadata = user.raw_user_meta_data || {}
    const firstName = userMetadata.first_name || 'Utilizador'
    const lastName = userMetadata.last_name || ''
    const fullName = `${firstName} ${lastName}`.trim()
    const role = userMetadata.role || 'participant'

    console.log('👤 User data:', { email: user.email, fullName, role })

    // Validate SMTP configuration
    const smtpHost = Deno.env.get("SMTP_HOST")
    const smtpUsername = Deno.env.get("SMTP_USERNAME")
    const smtpPassword = Deno.env.get("SMTP_PASSWORD")
    
    if (!smtpHost || !smtpUsername || !smtpPassword) {
      const errorMsg = 'SMTP configuration incomplete. Please check SMTP_HOST, SMTP_USERNAME, and SMTP_PASSWORD'
      console.error('❌ SMTP Config error:', errorMsg)
      return new Response(JSON.stringify({
        success: false,
        error: errorMsg
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    // Generate confirmation link
    const confirmationUrl = `https://inscrix.pt/auth/confirm?token=${user.confirmation_token}&type=signup&redirect_to=https://inscrix.pt/dashboard`
    
    // Generate email subject
    const subject = `🔐 Confirme a sua conta INSCRIX - ${fullName}`

    console.log('🎨 Creating simple email template...')
    
    // Create simple HTML email template (no React dependencies)
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confirme a sua conta INSCRIX</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
    .button { display: inline-block; padding: 12px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">INSCRIX</div>
      <h1>Bem-vindo à plataforma INSCRIX!</h1>
    </div>
    
    <p>Olá <strong>${fullName}</strong>,</p>
    
    <p>Obrigado por se registar na nossa plataforma como <strong>${role === 'participant' ? 'Participante' : role === 'organizer' ? 'Organizador' : 'Equipa'}</strong>.</p>
    
    <p>Para completar o seu registo, confirme o seu email clicando no botão abaixo:</p>
    
    <div style="text-align: center;">
      <a href="${confirmationUrl}" class="button">Confirmar Email</a>
    </div>
    
    <p>Ou copie e cole este link no seu navegador:</p>
    <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">${confirmationUrl}</p>
    
    <div class="footer">
      <p>Se não criou esta conta, pode ignorar este email.</p>
      <p>Este link é válido por 24 horas por motivos de segurança.</p>
      <p>Obrigado,<br>Equipa INSCRIX</p>
    </div>
  </div>
</body>
</html>`

    console.log('📮 Sending email via SMTP...')
    
    try {
      // Send email via SMTP
      await smtpClient.send({
        from: "INSCRIX <noreply@inscrix.pt>",
        to: user.email,
        subject: subject,
        html: emailHtml,
      })
      
      console.log('✅ Email sent successfully via SMTP to:', user.email)
      
      // Use background task for logging to avoid blocking response
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      )

      const logEmailToDatabase = async () => {
        try {
          await supabaseClient.from('email_logs').insert({
            recipient_email: user.email,
            subject: subject,
            template_key: 'auth_confirmation',
            status: 'sent',
            sent_at: new Date().toISOString(),
            provider_message_id: 'smtp_' + Date.now(),
            provider: 'smtp',
            metadata: { 
              user_id: user.id, 
              role: role,
              processing_time_ms: Date.now() - startTime
            }
          })
          console.log('📊 Email logged to database')
        } catch (logError) {
          console.error('⚠️ Failed to log email:', logError)
        }
      }

      // Run logging in background (if available)
      if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
        EdgeRuntime.waitUntil(logEmailToDatabase())
      } else {
        // Fallback for environments without EdgeRuntime
        logEmailToDatabase().catch(console.error)
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Email de confirmação enviado com sucesso via SMTP',
        recipient: user.email,
        subject: subject,
        email_id: 'smtp_' + Date.now(),
        processing_time_ms: Date.now() - startTime
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })

    } catch (emailError) {
      const errorMsg = `SMTP sending error: ${emailError.message}`
      console.error('❌ SMTP error:', errorMsg)
      
      // Log failed email in background
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      )

      const logFailedEmail = async () => {
        try {
          await supabaseClient.from('email_logs').insert({
            recipient_email: user.email,
            subject: subject,
            template_key: 'auth_confirmation',
            status: 'failed',
            failed_at: new Date().toISOString(),
            error_message: errorMsg,
            provider: 'smtp',
            metadata: { 
              user_id: user.id, 
              role: role,
              processing_time_ms: Date.now() - startTime
            }
          })
        } catch (logError) {
          console.error('⚠️ Failed to log failed email:', logError)
        }
      }

      if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
        EdgeRuntime.waitUntil(logFailedEmail())
      } else {
        logFailedEmail().catch(console.error)
      }

      return new Response(JSON.stringify({
        success: false,
        error: errorMsg
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ Error in send-auth-email:', errorMessage)
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      details: error instanceof Error ? error.stack : undefined
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
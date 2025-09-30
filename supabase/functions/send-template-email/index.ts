import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { Resend } from 'npm:resend@4.0.0'
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

// Email client setup with database configuration support
const createEmailClient = async (supabaseClient: any, forceProvider?: string) => {
  try {
    // Buscar provedor ativo da base de dados
    const { data: providerData } = await supabaseClient
      .from('platform_settings')
      .select('value')
      .eq('key', 'email_active_provider')
      .eq('category', 'email')
      .single()

    const activeProvider = forceProvider || providerData?.value || 'resend'
    
    logStep('Loading email configuration', { activeProvider, forceProvider })

    if (activeProvider === 'resend') {
      // Buscar configuração do Resend da base de dados
      const { data: resendConfigData } = await supabaseClient
        .from('platform_settings')
        .select('value')
        .eq('key', 'resend_config')
        .eq('category', 'email')
        .single()

      const resendConfig = resendConfigData?.value
      const resendKey = resendConfig?.api_key || Deno.env.get('RESEND_API_KEY')
      
      if (resendKey) {
        logStep('Using Resend as email provider', { fromDatabase: !!resendConfig })
        return { 
          type: 'resend', 
          client: new Resend(resendKey),
          config: resendConfig 
        }
      } else {
        logStep('Resend API key not found, falling back to SMTP')
      }
    }

    // Buscar configuração SMTP da base de dados (fallback ou escolha explícita)
    const { data: smtpConfigData } = await supabaseClient
      .from('platform_settings')
      .select('value')
      .eq('key', 'smtp_config')
      .eq('category', 'email')
      .single()

    const smtpConfig = smtpConfigData?.value
    const host = smtpConfig?.host || Deno.env.get("SMTP_HOST") || "mail.inscrix.pt"
    const port = parseInt(smtpConfig?.port || Deno.env.get("SMTP_PORT") || "465")
    const username = smtpConfig?.username || Deno.env.get("SMTP_USERNAME") || "noreply@inscrix.pt"
    const password = smtpConfig?.password || Deno.env.get("SMTP_PASSWORD")
    
    if (!password) {
      throw new Error('Neither RESEND_API_KEY nor SMTP credentials configured')
    }
    
    logStep('Using SMTP as email provider', { 
      host, 
      port, 
      username, 
      fromDatabase: !!smtpConfig 
    })
    
    return { 
      type: 'smtp', 
      client: new SMTPClient({
        connection: {
          hostname: host,
          port: port,
          tls: true,
          auth: {
            username: username,
            password: password,
          },
        },
      }),
      config: smtpConfig
    }

  } catch (configError) {
    logStep('Failed to load database config, using environment fallback', { error: configError.message })
    
    // Fallback original para variáveis de ambiente
    const resendKey = Deno.env.get('RESEND_API_KEY')
    
    if (resendKey) {
      return { type: 'resend', client: new Resend(resendKey) }
    }
    
    const host = Deno.env.get("SMTP_HOST") || "mail.inscrix.pt"
    const port = parseInt(Deno.env.get("SMTP_PORT") || "465")
    const username = Deno.env.get("SMTP_USERNAME") || "noreply@inscrix.pt"
    const password = Deno.env.get("SMTP_PASSWORD")
    
    if (!password) {
      throw new Error('Neither RESEND_API_KEY nor SMTP credentials configured')
    }
    
    return { 
      type: 'smtp', 
      client: new SMTPClient({
        connection: {
          hostname: host,
          port: port,
          tls: true,
          auth: {
            username: username,
            password: password,
          },
        },
      })
    }
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : ''
  console.log(`[SEND-TEMPLATE-EMAIL] ${step}${detailsStr}`)
}

// Template variable replacement function
const replaceVariables = (template: string, variables: Record<string, any>): string => {
  let result = template
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, String(value || ''))
  }
  return result
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  )

  try {
    logStep('Template email request received')

    const requestBody = await req.json()
    const { 
      templateKey, 
      template_key,
      recipientEmail, 
      recipient_email,
      recipientUserId, 
      recipient_user_id,
      variables = {},
      template_variables = {},
      customSubject,
      subject_override,
      customHtml,
      html_override,
      htmlContent,
      test_mode = false,
      force_provider,
      resend_config,
      smtp_config
    } = requestBody
    
    // Support both camelCase and snake_case for compatibility
    const finalTemplateKey = templateKey || template_key
    const finalRecipientEmail = recipientEmail || recipient_email
    const finalRecipientUserId = recipientUserId || recipient_user_id
    const finalVariables = Object.keys(variables).length > 0 ? variables : template_variables
    const finalCustomSubject = customSubject || subject_override
    const finalCustomHtml = customHtml || html_override || htmlContent
    
    // Para emails de teste sem template
    if (!finalTemplateKey && !finalRecipientEmail) {
      throw new Error('Template key and recipient email are required')
    }
    
    // Para emails diretos (como testes)
    if (!finalTemplateKey && finalRecipientEmail && finalCustomSubject && finalCustomHtml) {
      logStep('Processing direct email (test mode)', { 
        recipientEmail: finalRecipientEmail, 
        subject: finalCustomSubject,
        test_mode 
      })
    } else if (!finalTemplateKey || !finalRecipientEmail) {
      throw new Error('Template key and recipient email are required for template emails')
    } else {
      logStep('Processing template email', { 
        templateKey: finalTemplateKey, 
        recipientEmail: finalRecipientEmail, 
        variables: finalVariables 
      })
    }

    let subject: string, htmlContentToSend: string

    if (finalCustomSubject && finalCustomHtml) {
      // Use custom content (para testes ou emails diretos)
      subject = replaceVariables(finalCustomSubject, finalVariables)
      htmlContentToSend = replaceVariables(finalCustomHtml, finalVariables)
      logStep('Using custom template content')
    } else if (finalTemplateKey) {
      // Fetch template from database
      const { data: template, error: templateError } = await supabaseClient
        .from('email_templates')
        .select('*')
        .eq('template_key', finalTemplateKey)
        .eq('is_active', true)
        .single()

      if (templateError || !template) {
        throw new Error(`Template '${finalTemplateKey}' not found or inactive`)
      }

      logStep('Template found', { templateId: template.id, templateName: template.name })

      // Replace variables in subject and HTML
      subject = replaceVariables(template.subject_template, finalVariables)
      htmlContentToSend = replaceVariables(template.html_template, finalVariables)
    } else {
      throw new Error('Either template_key or custom subject+html must be provided')
    }

    // Create email log entry (apenas para templates ou quando temos template_key)
    let emailLog = null
    if (finalTemplateKey) {
      const { data: logData, error: logError } = await supabaseClient
        .from('email_logs')
        .insert({
          template_key: finalTemplateKey,
          recipient_email: finalRecipientEmail,
          recipient_user_id: finalRecipientUserId,
          subject,
          status: 'sending',
          metadata: { variables: finalVariables, custom: !!finalCustomSubject, test_mode }
        })
        .select()
        .single()

      if (logError) {
        logStep('Warning: Could not create email log', logError)
      } else {
        emailLog = logData
      }
    }

    // Send email with database configuration support
    const emailService = await createEmailClient(supabaseClient, force_provider);
    
    if (emailService.type === 'resend') {
      logStep('Sending email via Resend');
      
      const { data, error } = await emailService.client.emails.send({
        from: 'INSCRIX <noreply@inscrix.pt>',
        to: finalRecipientEmail,
        subject,
        html: htmlContentToSend,
      });

      if (error) {
        throw new Error(`Resend error: ${error.message}`);
      }
      
      logStep('Email sent successfully via Resend', { messageId: data.id });
      
      // Update email log with success
      if (emailLog) {
        await supabaseClient
          .from('email_logs')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            provider: 'resend',
            provider_message_id: data.id
          })
          .eq('id', emailLog.id);
      }
      
      return new Response(JSON.stringify({
        success: true,
        message: test_mode ? 'Test email sent successfully via Resend' : 'Email sent successfully via Resend',
        messageId: data.id,
        logId: emailLog?.id,
        provider: 'resend'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
      
    } else {
      logStep('Sending email via SMTP fallback');
      
      await emailService.client.send({
        from: "INSCRIX <noreply@inscrix.pt>",
        to: finalRecipientEmail,
        subject,
        content: htmlContentToSend,
        html: htmlContentToSend,
      });

      logStep('Email sent successfully via SMTP');
      
      // Update email log with success  
      if (emailLog) {
        await supabaseClient
          .from('email_logs')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            provider: 'smtp',
            provider_message_id: 'smtp_' + Date.now()
          })
          .eq('id', emailLog.id);
      }
      
      return new Response(JSON.stringify({
        success: true,
        message: test_mode ? 'Test email sent successfully via SMTP' : 'Email sent successfully via SMTP',
        messageId: 'smtp_' + Date.now(),
        logId: emailLog?.id,
        provider: 'smtp'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logStep('ERROR in send-template-email', { message: errorMessage })
    
    // Try to create error log entry with available data
    try {
      const body = await req.clone().json() // Use cloned request to avoid consumption error
      const templateKey = body.templateKey || body.template_key
      const recipientEmail = body.recipientEmail || body.recipient_email
      
      if (recipientEmail && templateKey) {
        await supabaseClient
          .from('email_logs')
          .insert({
            template_key: templateKey,
            recipient_email: recipientEmail,
            subject: 'Failed to process',
            status: 'failed',
            failed_at: new Date().toISOString(),
            error_message: errorMessage
          })
      }
    } catch (logError) {
      logStep('Could not log email error', logError)
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
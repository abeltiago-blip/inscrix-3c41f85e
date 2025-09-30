import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : ''
  console.log(`[NEWSLETTER-CONFIRM] ${step}${detailsStr}`)
}

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  )

  try {
    const url = new URL(req.url)
    const token = url.searchParams.get('token')
    const action = url.searchParams.get('action') || 'confirm'

    if (!token) {
      throw new Error('Token is required')
    }

    logStep('Newsletter confirmation request', { token, action })

    // Find subscription by token
    const { data: subscription, error: findError } = await supabaseClient
      .from('newsletter_subscriptions')
      .select('*')
      .eq('confirmation_token', token)
      .single()

    if (findError || !subscription) {
      throw new Error('Invalid or expired confirmation token')
    }

    if (action === 'unsubscribe') {
      // Unsubscribe
      const { error } = await supabaseClient
        .from('newsletter_subscriptions')
        .update({
          is_active: false,
          unsubscribed_at: new Date().toISOString()
        })
        .eq('id', subscription.id)

      if (error) throw error

      logStep('Newsletter unsubscribed', { email: subscription.email })

      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Subscrição Cancelada - INSCRIX</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .container { text-align: center; background: #f8f9fa; padding: 40px; border-radius: 10px; }
            .success { color: #28a745; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="success">Subscrição Cancelada</h1>
            <p>A sua subscrição da newsletter INSCRIX foi cancelada com sucesso.</p>
            <p>Lamentamos vê-lo partir! Pode voltar a subscrever a qualquer momento.</p>
            <a href="${Deno.env.get('SUPABASE_URL')}" style="background:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Voltar ao INSCRIX</a>
          </div>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
        status: 200
      })
    } else {
      // Confirm subscription
      const { error } = await supabaseClient
        .from('newsletter_subscriptions')
        .update({
          confirmed_at: new Date().toISOString(),
          is_active: true
        })
        .eq('id', subscription.id)

      if (error) throw error

      logStep('Newsletter confirmed', { email: subscription.email })

      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Subscrição Confirmada - INSCRIX</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .container { text-align: center; background: #f8f9fa; padding: 40px; border-radius: 10px; }
            .success { color: #28a745; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="success">Subscrição Confirmada!</h1>
            <p>Obrigado por confirmar a sua subscrição da newsletter INSCRIX!</p>
            <p>Irá receber as nossas novidades sobre eventos desportivos, promoções e muito mais.</p>
            <a href="${Deno.env.get('SUPABASE_URL')}" style="background:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Explorar Eventos</a>
          </div>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
        status: 200
      })
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logStep('ERROR in newsletter-confirm', { message: errorMessage })
    
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Erro - INSCRIX</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
          .container { text-align: center; background: #f8f9fa; padding: 40px; border-radius: 10px; }
          .error { color: #dc3545; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="error">Erro</h1>
          <p>${errorMessage}</p>
          <a href="${Deno.env.get('SUPABASE_URL')}" style="background:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Voltar ao INSCRIX</a>
        </div>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
      status: 400
    })
  }
})
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : ''
  console.log(`[NEWSLETTER-SUBSCRIBE] ${step}${detailsStr}`)
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
    logStep('Newsletter subscription request received')

    const { 
      email, 
      categories = ['events', 'promotions', 'news'],
      preferences = { frequency: 'weekly', location: null, sports: [], age_group: null },
      user_id 
    } = await req.json()
    
    if (!email) {
      throw new Error('Email is required')
    }

    logStep('Processing subscription', { email, categories, preferences })

    // Generate confirmation token
    const confirmationToken = crypto.randomUUID()

    // Check if subscription already exists
    const { data: existingSubscription } = await supabaseClient
      .from('newsletter_subscriptions')
      .select('*')
      .eq('email', email)
      .single()

    let subscription
    if (existingSubscription) {
      // Update existing subscription
      const { data, error } = await supabaseClient
        .from('newsletter_subscriptions')
        .update({
          is_active: true,
          unsubscribed_at: null,
          categories,
          preferences,
          confirmation_token: confirmationToken,
          user_id: user_id || existingSubscription.user_id
        })
        .eq('email', email)
        .select()
        .single()

      if (error) throw error
      subscription = data
      logStep('Updated existing subscription', { id: subscription.id })
    } else {
      // Create new subscription
      const { data, error } = await supabaseClient
        .from('newsletter_subscriptions')
        .insert({
          email,
          user_id,
          categories,
          preferences,
          confirmation_token: confirmationToken,
          is_active: true
        })
        .select()
        .single()

      if (error) throw error
      subscription = data
      logStep('Created new subscription', { id: subscription.id })
    }

    // Send confirmation email
    const confirmationLink = `${Deno.env.get('SUPABASE_URL')}/functions/v1/newsletter-confirm?token=${confirmationToken}`
    
    await supabaseClient.functions.invoke('send-template-email', {
      body: {
        templateKey: 'newsletter_confirmation',
        recipientEmail: email,
        variables: {
          unsubscribe_link: confirmationLink
        }
      }
    })

    logStep('Confirmation email sent')

    return new Response(JSON.stringify({
      success: true,
      message: 'Subscrição registada com sucesso! Verifique o seu email para confirmar.',
      subscription_id: subscription.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logStep('ERROR in newsletter-subscribe', { message: errorMessage })
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
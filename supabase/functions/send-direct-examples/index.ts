import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : ''
  console.log(`[SEND-DIRECT-EXAMPLES] ${step}${detailsStr}`)
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
    logStep('Starting direct email examples sending')

    const { targetEmail }: { targetEmail: string } = await req.json()
    
    if (!targetEmail) {
      throw new Error('Target email is required')
    }

    logStep('Target email provided', { targetEmail })

    const results = []

    try {
      // 1. Password Reset Email
      logStep('Sending password reset email')
      const passwordResetResult = await supabaseClient.functions.invoke('send-template-email', {
        body: {
          templateKey: 'password_reset',
          recipientEmail: targetEmail,
          variables: {
            participant_name: 'João Silva',
            reset_link: 'https://inscrix.com/reset-password?token=example123'
          }
        }
      })
      results.push({ type: 'password_reset', result: passwordResetResult })
      
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 2. Email Verification
      logStep('Sending email verification email')
      const verificationResult = await supabaseClient.functions.invoke('send-template-email', {
        body: {
          templateKey: 'email_verification',
          recipientEmail: targetEmail,
          variables: {
            participant_name: 'João Silva',
            verification_link: 'https://inscrix.com/verify-email?token=example123'
          }
        }
      })
      results.push({ type: 'email_verification', result: verificationResult })
      
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 3. Organizer Welcome
      logStep('Sending organizer welcome email')
      const organizerWelcomeResult = await supabaseClient.functions.invoke('send-template-email', {
        body: {
          templateKey: 'organizer_welcome',
          recipientEmail: targetEmail,
          variables: {
            organizer_name: 'Maria Santos',
            dashboard_link: 'https://inscrix.com/organizer/dashboard'
          }
        }
      })
      results.push({ type: 'organizer_welcome', result: organizerWelcomeResult })
      
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 4. Team Registration
      logStep('Sending team registration email')
      const teamRegistrationResult = await supabaseClient.functions.invoke('send-template-email', {
        body: {
          templateKey: 'team_registration',
          recipientEmail: targetEmail,
          variables: {
            team_captain_name: 'Carlos Ferreira',
            team_name: 'Corredores do Norte',
            event_title: 'Meia Maratona de Lisboa 2024',
            event_date: '15 de Março de 2024',
            event_location: 'Lisboa, Portugal'
          }
        }
      })
      results.push({ type: 'team_registration', result: teamRegistrationResult })
      
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 5. Event Published
      logStep('Sending event published email')
      const eventPublishedResult = await supabaseClient.functions.invoke('send-template-email', {
        body: {
          templateKey: 'event_published',
          recipientEmail: targetEmail,
          variables: {
            organizer_name: 'Ana Costa',
            event_title: 'Triatlo do Porto 2024',
            event_link: 'https://inscrix.com/eventos/triatlo-porto-2024'
          }
        }
      })
      results.push({ type: 'event_published', result: eventPublishedResult })
      
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 6. Registration Deadline
      logStep('Sending registration deadline email')
      const deadlineResult = await supabaseClient.functions.invoke('send-template-email', {
        body: {
          templateKey: 'registration_deadline',
          recipientEmail: targetEmail,
          variables: {
            event_title: 'Ciclismo Serra da Estrela',
            deadline_date: '30 de Abril de 2024',
            event_link: 'https://inscrix.com/eventos/ciclismo-serra-estrela'
          }
        }
      })
      results.push({ type: 'registration_deadline', result: deadlineResult })

    } catch (emailError) {
      logStep('ERROR sending individual email', { error: emailError })
      results.push({ type: 'error', error: emailError.message })
    }

    logStep('All direct email examples sent successfully')

    return new Response(JSON.stringify({
      success: true,
      message: `${results.length} exemplos de email foram enviados para ${targetEmail}`,
      results: results.map(r => ({
        type: r.type,
        success: r.result?.data?.success !== false,
        error: r.result?.error?.message || r.error
      }))
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logStep('ERROR in send-direct-examples', { message: errorMessage })
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
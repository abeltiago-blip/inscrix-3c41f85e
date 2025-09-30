import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : ''
  console.log(`[SEND-EMAIL-EXAMPLES] ${step}${detailsStr}`)
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
    logStep('Starting email examples sending')

    const { targetEmail }: { targetEmail: string } = await req.json()
    
    if (!targetEmail) {
      throw new Error('Target email is required')
    }

    logStep('Target email provided', { targetEmail })

    // Create a mock registration for examples
    const mockRegistration = {
      id: '12345678-1234-1234-1234-123456789012',
      participant_name: 'João Silva',
      participant_email: targetEmail,
      registration_number: 'REG-2024-000001',
      amount_paid: 25.00,
      payment_status: 'completed',
      participant_id: '11111111-1111-1111-1111-111111111111',
      event_id: '22222222-2222-2222-2222-222222222222',
      ticket_type_id: '33333333-3333-3333-3333-333333333333'
    }

    // Insert mock data temporarily
    await supabaseClient.from('registrations').upsert(mockRegistration)
    
    await supabaseClient.from('events').upsert({
      id: mockRegistration.event_id,
      title: 'Corrida do Exemplo INSCRIX 2024',
      description: 'Uma corrida de exemplo para demonstrar o sistema de emails',
      start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      location: 'Lisboa',
      address: 'Parque das Nações, Lisboa',
      organizer_id: '44444444-4444-4444-4444-444444444444',
      category: 'running',
      event_type: 'individual',
      registration_start: new Date().toISOString(),
      registration_end: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'published'
    })

    await supabaseClient.from('ticket_types').upsert({
      id: mockRegistration.ticket_type_id,
      event_id: mockRegistration.event_id,
      name: 'Bilhete Exemplo',
      description: 'Bilhete de exemplo para demonstração',
      price: 25.00,
      currency: 'EUR'
    })

    const results = []

    try {
      // 1. Registration Confirmation Email
      logStep('Sending registration confirmation email')
      const confirmationResult = await supabaseClient.functions.invoke('send-registration-email', {
        body: {
          registrationId: mockRegistration.id,
          type: 'confirmation'
        }
      })
      results.push({ type: 'confirmation', result: confirmationResult })
      
      // Wait a bit to ensure the function completes
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 2. Payment Confirmation Email
      logStep('Sending payment confirmation email')
      const paymentResult = await supabaseClient.functions.invoke('send-registration-email', {
        body: {
          registrationId: mockRegistration.id,
          type: 'payment_confirmation',
          includeTicket: true
        }
      })
      results.push({ type: 'payment_confirmation', result: paymentResult })
      
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 3. Ticket Delivery Email
      logStep('Sending ticket delivery email')
      const ticketResult = await supabaseClient.functions.invoke('send-registration-email', {
        body: {
          registrationId: mockRegistration.id,
          type: 'ticket_delivery',
          includeTicket: true
        }
      })
      results.push({ type: 'ticket_delivery', result: ticketResult })
      
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 4. Event Reminder Email
      logStep('Sending event reminder email')
      const reminderResult = await supabaseClient.functions.invoke('send-event-reminder', {
        body: {
          registrationId: mockRegistration.id,
          daysBeforeEvent: 7
        }
      })
      results.push({ type: 'event_reminder', result: reminderResult })
      
      await new Promise(resolve => setTimeout(resolve, 2000))

    } finally {
      // Clean up mock data
      logStep('Cleaning up mock data')
      await supabaseClient.from('registrations').delete().eq('id', mockRegistration.id)
      await supabaseClient.from('ticket_types').delete().eq('id', mockRegistration.ticket_type_id)  
      await supabaseClient.from('events').delete().eq('id', mockRegistration.event_id)
    }

    logStep('All email examples sent successfully')

    return new Response(JSON.stringify({
      success: true,
      message: `4 exemplos de email foram enviados para ${targetEmail}`,
      results: results.map(r => ({
        type: r.type,
        success: r.result.data?.success || false,
        error: r.result.error?.message
      }))
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logStep('ERROR in send-email-examples', { message: errorMessage })
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
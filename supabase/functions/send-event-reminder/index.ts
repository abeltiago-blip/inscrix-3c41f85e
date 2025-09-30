import React from 'npm:react@18.3.1'
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { EventReminderEmail } from './_templates/event-reminder.tsx'

// SMTP Configuration
const smtpClient = new SMTPClient({
  connection: {
    hostname: Deno.env.get("SMTP_HOST") || "mail.inscrix.pt",
    port: parseInt(Deno.env.get("SMTP_PORT") || "465"),
    tls: true,
    auth: {
      username: Deno.env.get("SMTP_USERNAME") || "",
      password: Deno.env.get("SMTP_PASSWORD") || "",
    },
  },
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReminderRequest {
  eventId?: string
  registrationId?: string
  daysBeforeEvent: number
  batchSize?: number
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : ''
  console.log(`[SEND-EVENT-REMINDER] ${step}${detailsStr}`)
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
    logStep('Reminder function started')

    const requestData: ReminderRequest = await req.json()
    logStep('Reminder request received', requestData)

    let registrations = []

    if (requestData.registrationId) {
      // Send reminder for single registration
      const { data: singleReg, error: singleRegError } = await supabaseClient
        .from('registrations')
        .select(`
          *,
          events(
            id, title, description, start_date, end_date, 
            location, address
          ),
          ticket_types(name)
        `)
        .eq('id', requestData.registrationId)
        .eq('status', 'active')
        .single()

      if (singleRegError || !singleReg) {
        throw new Error('Registration not found')
      }

      registrations = [singleReg]
    } else if (requestData.eventId) {
      // Send reminders for all registrations of an event
      const { data: eventRegs, error: eventRegsError } = await supabaseClient
        .from('registrations')
        .select(`
          *,
          events(
            id, title, description, start_date, end_date, 
            location, address
          ),
          ticket_types(name)
        `)
        .eq('event_id', requestData.eventId)
        .eq('status', 'active')
        .eq('payment_status', 'paid')
        .limit(requestData.batchSize || 50)

      if (eventRegsError) {
        throw new Error('Failed to fetch event registrations')
      }

      registrations = eventRegs || []
    } else {
      // Send reminders for all events happening in X days
      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() + requestData.daysBeforeEvent)
      const targetDateStr = targetDate.toISOString().split('T')[0]

      const { data: upcomingRegs, error: upcomingRegsError } = await supabaseClient
        .from('registrations')
        .select(`
          *,
          events(
            id, title, description, start_date, end_date, 
            location, address
          ),
          ticket_types(name)
        `)
        .eq('status', 'active')
        .eq('payment_status', 'paid')
        .gte('events.start_date', `${targetDateStr}T00:00:00`)
        .lt('events.start_date', `${targetDateStr}T23:59:59`)
        .limit(requestData.batchSize || 100)

      if (upcomingRegsError) {
        throw new Error('Failed to fetch upcoming registrations')
      }

      registrations = upcomingRegs || []
    }

    logStep('Registrations loaded', { count: registrations.length })

    const results = []
    const errors = []

    for (const registration of registrations) {
      try {
        const event = registration.events
        
        // Calculate days until event
        const eventDate = new Date(event.start_date)
        const now = new Date()
        const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        // Skip if event is too far or has passed
        if (daysUntilEvent < 0 || daysUntilEvent > 30) {
          continue
        }

        // Format dates
        const formattedDate = eventDate.toLocaleDateString('pt-PT', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })

        const formattedTime = eventDate.toLocaleTimeString('pt-PT', {
          hour: '2-digit',
          minute: '2-digit'
        })

        // Generate ticket download URL
        const ticketDownloadUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-ticket-pdf?registration=${registration.id}`
        const eventUrl = `https://inscrix.pt/evento/${event.id}`

        // Prepare email data
        const emailData = {
          participantName: registration.participant_name,
          eventTitle: event.title,
          eventDate: formattedDate,
          eventTime: formattedTime,
          eventLocation: event.location,
          eventAddress: event.address,
          registrationNumber: registration.registration_number,
          daysUntilEvent: daysUntilEvent,
          ticketDownloadUrl: ticketDownloadUrl,
          eventUrl: eventUrl,
          checkInInstructions: 'Apresente o seu bilhete ou código QR na entrada do evento'
        }

        // Render email template
        const emailHtml = await renderAsync(
          React.createElement(EventReminderEmail, emailData)
        )

        // Generate subject
        const subject = daysUntilEvent === 1 
          ? `⏰ ${event.title} é amanhã! - ${registration.registration_number}`
          : `⏰ Lembrete: ${event.title} em ${daysUntilEvent} dias - ${registration.registration_number}`

        // Send email via SMTP
        await smtpClient.send({
          from: 'INSCRIX Lembretes <hello@inscrix.pt>',
          to: registration.participant_email,
          subject: subject,
          content: emailHtml,
          html: emailHtml,
        })

        const emailId = 'smtp_' + Date.now() + '_' + registration.id

        // Log notification
        try {
          await supabaseClient
            .from('notifications')
            .insert({
              user_id: registration.participant_id,
              type: 'email',
              category: 'event_reminder',
              title: subject,
              message: `Lembrete enviado para ${registration.participant_email}`,
              metadata: {
                email_id: emailId,
                registration_id: registration.id,
                event_id: event.id,
                days_before_event: daysUntilEvent
              }
            })
        } catch (notificationError) {
          logStep('Failed to log notification', notificationError)
        }

        results.push({
          registration_id: registration.id,
          email_id: emailId,
          participant_email: registration.participant_email,
          event_title: event.title,
          days_until_event: daysUntilEvent
        })

        logStep('Reminder sent', {
          registrationId: registration.id,
          participantEmail: registration.participant_email,
          daysUntilEvent
        })

        // Add small delay between emails to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (emailError) {
        const errorMsg = emailError instanceof Error ? emailError.message : 'Unknown error'
        errors.push({
          registration_id: registration.id,
          participant_email: registration.participant_email,
          error: errorMsg
        })
        logStep('Failed to send reminder', {
          registrationId: registration.id,
          error: errorMsg
        })
      }
    }

    logStep('Batch processing complete', {
      sent: results.length,
      errors: errors.length
    })

    return new Response(JSON.stringify({
      success: true,
      message: `Sent ${results.length} reminders, ${errors.length} failures`,
      sent: results.length,
      failures: errors.length,
      results: results,
      errors: errors.length > 0 ? errors : undefined
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logStep('ERROR in send-event-reminder', { message: errorMessage })
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
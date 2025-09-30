import React from 'npm:react@18.3.1'
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { RegistrationConfirmationEmail } from './_templates/registration-confirmation.tsx'

// SMTP Configuration
const smtpClient = new SMTPClient({
  connection: {
    hostname: Deno.env.get("SMTP_HOST") || "mail.inscrix.pt",
    port: parseInt(Deno.env.get("SMTP_PORT") || "465"),
    tls: true,
    auth: {
      username: Deno.env.get("SMTP_USERNAME") || "hello@inscrix.pt",
      password: Deno.env.get("SMTP_PASSWORD") || "",
    },
  },
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  registrationId: string
  type: 'confirmation' | 'payment_confirmation' | 'ticket_delivery'
  includeTicket?: boolean
  customMessage?: string
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : ''
  console.log(`[SEND-REGISTRATION-EMAIL] ${step}${detailsStr}`)
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
    logStep('Email function started')

    const requestData: EmailRequest = await req.json()
    logStep('Email request received', { 
      registrationId: requestData.registrationId,
      type: requestData.type 
    })

    // Fetch registration details with related data
    const { data: registration, error: regError } = await supabaseClient
      .from('registrations')
      .select(`
        *,
        events(
          id, title, description, start_date, end_date, 
          location, address, organizer_id
        ),
        ticket_types(name, description, price)
      `)
      .eq('id', requestData.registrationId)
      .single()

    if (regError || !registration) {
      throw new Error('Registration not found')
    }

    const event = registration.events
    const ticketType = registration.ticket_types

    logStep('Registration data loaded', {
      participantName: registration.participant_name,
      eventTitle: event?.title
    })

    // Format event date and time
    const eventDate = event?.start_date ? 
      new Date(event.start_date).toLocaleDateString('pt-PT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'Data a confirmar'

    const eventTime = event?.start_date ? 
      new Date(event.start_date).toLocaleTimeString('pt-PT', {
        hour: '2-digit',
        minute: '2-digit'
      }) : 'Hora a confirmar'

    // Generate QR Code if needed
    let qrCodeUrl
    if (requestData.includeTicket !== false) {
      try {
        const { data: qrData } = await supabaseClient.functions.invoke('generate-ticket-qr', {
          body: {
            registrationId: requestData.registrationId,
            eventId: event?.id
          }
        })
        
        if (qrData?.success) {
          qrCodeUrl = qrData.qr_code.url
          logStep('QR code generated for email')
        }
      } catch (qrError) {
        logStep('QR code generation failed', qrError)
        // Continue without QR code
      }
    }

    // Generate ticket download URL (placeholder for now)
    const ticketDownloadUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-ticket-pdf?registration=${requestData.registrationId}`
    const eventUrl = `https://inscrix.pt/evento/${event?.id}`

    // Prepare email data
    const emailData = {
      participantName: registration.participant_name,
      eventTitle: event?.title || 'Evento INSCRIX',
      eventDate: `${eventDate}, ${eventTime}`,
      eventLocation: event?.location || 'Local a confirmar',
      eventAddress: event?.address || 'Morada a confirmar',
      registrationNumber: registration.registration_number,
      ticketType: ticketType?.name || 'Bilhete Standard',
      amountPaid: registration.amount_paid,
      paymentStatus: registration.payment_status,
      ticketDownloadUrl: ticketDownloadUrl,
      qrCodeUrl: qrCodeUrl,
      eventUrl: eventUrl
    }

    // Generate email subject based on type
    let subject = ''
    let fromName = 'INSCRIX'
    
    switch (requestData.type) {
      case 'confirmation':
        subject = `✅ Inscrição confirmada: ${event?.title} - ${registration.registration_number}`
        break
      case 'payment_confirmation':
        subject = `💳 Pagamento confirmado: ${event?.title} - ${registration.registration_number}`
        break
      case 'ticket_delivery':
        subject = `🎫 Seu bilhete: ${event?.title} - ${registration.registration_number}`
        break
      default:
        subject = `INSCRIX: ${event?.title} - ${registration.registration_number}`
    }

    // Render email template
    const emailHtml = await renderAsync(
      React.createElement(RegistrationConfirmationEmail, emailData)
    )

    logStep('Email template rendered')

    // Send email via SMTP
    try {
      await smtpClient.send({
        from: `${fromName} <hello@inscrix.pt>`,
        to: registration.participant_email,
        subject: subject,
        html: emailHtml,
      });

      logStep('Email sent successfully via SMTP', {
        recipient: registration.participant_email
      })

    // Log email in database (optional)
    try {
      await supabaseClient
        .from('notifications')
        .insert({
          user_id: registration.participant_id,
          type: 'email',
          category: requestData.type,
          title: subject,
          message: `Email enviado para ${registration.participant_email}`,
          metadata: {
            email_id: 'smtp_' + Date.now(),
            registration_id: requestData.registrationId,
            event_id: event?.id,
            email_type: requestData.type
          }
        })
      
      logStep('Email logged in notifications')
    } catch (notificationError) {
      logStep('Failed to log email notification', notificationError)
      // Continue - this is not critical
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Email sent successfully',
      email_id: 'smtp_' + Date.now(),
      recipient: registration.participant_email,
      subject: subject
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

    } catch (emailError) {
      logStep('Failed to send email via SMTP', emailError)
      throw new Error(`Failed to send email: ${emailError.message}`)
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logStep('ERROR in send-registration-email', { message: errorMessage })
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
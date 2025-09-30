import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

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

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : ''
  console.log(`[SEND-NEWSLETTER] ${step}${detailsStr}`)
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
    logStep('Newsletter send request received')

    const { 
      subject, 
      htmlContent,
      categories = ['events', 'promotions', 'news'],
      targetLocation = null,
      targetSports = [],
      targetAgeGroup = null,
      batchSize = 50
    } = await req.json()
    
    if (!subject || !htmlContent) {
      throw new Error('Subject and HTML content are required')
    }

    logStep('Processing newsletter send', { subject, categories, targetLocation, targetSports, targetAgeGroup })

    // Build query for subscribers
    let query = supabaseClient
      .from('newsletter_subscriptions')
      .select('email, user_id, preferences')
      .eq('is_active', true)
      .not('confirmed_at', 'is', null)

    // Filter by categories (subscribers must have at least one matching category)
    categories.forEach(category => {
      query = query.contains('categories', [category])
    })

    const { data: subscribers, error: subscribersError } = await query

    if (subscribersError) {
      throw new Error(`Failed to fetch subscribers: ${subscribersError.message}`)
    }

    if (!subscribers || subscribers.length === 0) {
      logStep('No subscribers found for criteria')
      return new Response(JSON.stringify({
        success: true,
        message: 'No subscribers found matching the criteria',
        sent_count: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Filter subscribers based on preferences
    let filteredSubscribers = subscribers.filter(subscriber => {
      const prefs = subscriber.preferences || {}
      
      // Filter by location
      if (targetLocation && prefs.location && prefs.location !== targetLocation) {
        return false
      }
      
      // Filter by sports
      if (targetSports.length > 0 && prefs.sports && prefs.sports.length > 0) {
        const hasMatchingSport = targetSports.some(sport => prefs.sports.includes(sport))
        if (!hasMatchingSport) return false
      }
      
      // Filter by age group
      if (targetAgeGroup && prefs.age_group && prefs.age_group !== targetAgeGroup) {
        return false
      }
      
      return true
    })

    logStep('Filtered subscribers', { 
      total: subscribers.length, 
      filtered: filteredSubscribers.length 
    })

    if (filteredSubscribers.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No subscribers found matching the preference criteria',
        sent_count: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Send emails in batches
    let sentCount = 0
    let failedCount = 0
    const errors: string[] = []

    for (let i = 0; i < filteredSubscribers.length; i += batchSize) {
      const batch = filteredSubscribers.slice(i, i + batchSize)
      logStep(`Processing batch ${Math.floor(i / batchSize) + 1}`, { 
        batchSize: batch.length, 
        progress: `${i + batch.length}/${filteredSubscribers.length}` 
      })

      // Send emails for this batch
      const batchPromises = batch.map(async (subscriber) => {
        try {
          // Add unsubscribe link to content
          const unsubscribeToken = crypto.randomUUID()
          const unsubscribeLink = `${Deno.env.get('SUPABASE_URL')}/functions/v1/newsletter-confirm?token=${unsubscribeToken}&action=unsubscribe`
          
          // Update subscriber with unsubscribe token
          await supabaseClient
            .from('newsletter_subscriptions')
            .update({ confirmation_token: unsubscribeToken })
            .eq('email', subscriber.email)

          const emailWithUnsubscribe = `
            ${htmlContent}
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #666; text-align: center;">
              Recebeu este email porque subscreveu a newsletter INSCRIX.<br>
              <a href="${unsubscribeLink}" style="color: #666;">Cancelar subscrição</a>
            </p>
          `

          const response = await supabaseClient.functions.invoke('send-template-email', {
            body: {
              templateKey: 'newsletter',
              recipientEmail: subscriber.email,
              recipientUserId: subscriber.user_id,
              customSubject: subject,
              customHtml: emailWithUnsubscribe,
              variables: {
                unsubscribe_link: unsubscribeLink
              }
            }
          })

          if (response.error) {
            throw new Error(response.error.message)
          }

          return { success: true, email: subscriber.email }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          errors.push(`${subscriber.email}: ${errorMessage}`)
          return { success: false, email: subscriber.email, error: errorMessage }
        }
      })

      const batchResults = await Promise.allSettled(batchPromises)
      
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.success) {
          sentCount++
        } else {
          failedCount++
        }
      })

      // Add delay between batches to avoid rate limiting
      if (i + batchSize < filteredSubscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    logStep('Newsletter send completed', { 
      sent: sentCount, 
      failed: failedCount, 
      errors: errors.length 
    })

    return new Response(JSON.stringify({
      success: true,
      message: `Newsletter sent successfully`,
      sent_count: sentCount,
      failed_count: failedCount,
      total_subscribers: filteredSubscribers.length,
      errors: errors.slice(0, 10) // Only return first 10 errors
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logStep('ERROR in send-newsletter', { message: errorMessage })
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
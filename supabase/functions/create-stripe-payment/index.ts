import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  eventId: string;
  ticketTypeId: string;
  registrationId: string;
  amount: number;
  currency?: string;
  successUrl?: string;
  cancelUrl?: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-STRIPE-PAYMENT] ${step}${detailsStr}`);
};

// Rate limiting for payment attempts
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const checkRateLimit = (identifier: string, maxRequests = 3, windowMs = 60000): boolean => {
  const now = Date.now();
  const record = requestCounts.get(identifier);
  
  if (!record || now > record.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    // Get authenticated user (optional for guest purchases)
    const authHeader = req.headers.get("Authorization");
    let userId = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
      if (!userError && userData.user) {
        userId = userData.user.id;
        logStep("User authenticated", { userId });
      }
    }

    const requestData: PaymentRequest = await req.json();
    logStep("Payment request received", requestData);

    // Security validations
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    
    // Strict rate limiting for payment attempts
    if (!checkRateLimit(clientIP, 3, 60000)) {
      logStep("Payment rate limit exceeded", { clientIP });
      throw new Error("Too many payment attempts. Please try again later.");
    }

    // Validate request data
    if (!requestData.registrationId || !requestData.amount || !requestData.eventId) {
      throw new Error("Missing required payment information");
    }

    // Validate amount is reasonable (between 1€ and 10000€)
    if (requestData.amount < 1 || requestData.amount > 10000) {
      throw new Error("Invalid payment amount");
    }

    // Get Stripe configuration
    const { data: stripeConfig, error: configError } = await supabaseClient
      .from('payment_methods')
      .select('*')
      .eq('provider', 'stripe')
      .eq('is_active', true)
      .single();

    if (configError || !stripeConfig) {
      logStep("Stripe not configured", { configError });
      throw new Error("Stripe payment method not configured or inactive");
    }

    const stripeSecretKey = stripeConfig.config?.secret_key;
    if (!stripeSecretKey) {
      throw new Error("Stripe secret key not configured");
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Fetch registration details
    const { data: registration, error: registrationError } = await supabaseClient
      .from('registrations')
      .select(`
        *,
        events(title, description),
        ticket_types(name, description)
      `)
      .eq('id', requestData.registrationId)
      .single();

    if (registrationError || !registration) {
      throw new Error("Registration not found");
    }

    // Get or create Stripe customer
    let customerId;
    const customerEmail = registration.participant_email;
    
    if (customerEmail) {
      const customers = await stripe.customers.list({ 
        email: customerEmail, 
        limit: 1 
      });
      
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Existing Stripe customer found", { customerId });
      } else {
        const customer = await stripe.customers.create({
          email: customerEmail,
          name: registration.participant_name,
          phone: registration.participant_phone,
          metadata: {
            user_id: userId || 'guest',
            registration_id: requestData.registrationId
          }
        });
        customerId = customer.id;
        logStep("New Stripe customer created", { customerId });
      }
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: [
        {
          price_data: {
            currency: requestData.currency || 'eur',
            product_data: {
              name: `${registration.events?.title} - ${registration.ticket_types?.name}`,
              description: registration.events?.description || '',
              metadata: {
                event_id: requestData.eventId,
                ticket_type_id: requestData.ticketTypeId,
                registration_id: requestData.registrationId
              }
            },
            unit_amount: Math.round(requestData.amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: requestData.successUrl || `${req.headers.get("origin")}/order-received?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: requestData.cancelUrl || `${req.headers.get("origin")}/checkout?cancelled=true`,
      metadata: {
        registration_id: requestData.registrationId,
        event_id: requestData.eventId,
        ticket_type_id: requestData.ticketTypeId,
        user_id: userId || 'guest'
      }
    });

    logStep("Stripe session created", { sessionId: session.id });

    // Create order record
    const orderData = {
      user_id: userId,
      event_id: requestData.eventId,
      registration_id: requestData.registrationId,
      stripe_session_id: session.id,
      total_amount: requestData.amount,
      subtotal: requestData.amount,
      currency: requestData.currency || 'eur',
      status: 'pending',
      payment_status: 'pending',
      payment_method: 'stripe',
      payment_provider: 'stripe',
      fees_amount: Math.round(requestData.amount * (stripeConfig.fees_percentage / 100) + stripeConfig.fees_fixed, 2)
    };

    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      logStep("Error creating order", { orderError });
      throw new Error("Failed to create order record");
    }

    // Update registration with Stripe session ID
    await supabaseClient
      .from('registrations')
      .update({ 
        stripe_session_id: session.id,
        payment_method: 'stripe'
      })
      .eq('id', requestData.registrationId);

    logStep("Order created successfully", { orderId: order.id });

    // Send automatic confirmation email
    try {
      const emailResponse = await supabaseClient.functions.invoke('send-registration-email', {
        body: {
          registrationId: requestData.registrationId,
          type: 'confirmation',
          includeTicket: false
        }
      });

      if (emailResponse.error) {
        logStep("Email sending failed", emailResponse.error);
      } else {
        logStep("Confirmation email sent successfully", { emailId: emailResponse.data?.email_id });
      }
    } catch (emailError) {
      logStep("Error sending confirmation email", emailError);
      // Don't fail the payment if email fails
    }

    return new Response(JSON.stringify({
      success: true,
      session_id: session.id,
      url: session.url,
      order_id: order.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-stripe-payment", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PurchaseRequest {
  eventId: string;
  ticketTypeId: string;
  participantName: string;
  participantEmail: string;
  participantPhone?: string;
  participantGender?: string;
  participantBirthDate?: string;
  participantDocumentNumber?: string;
  participantNif?: string;
  participantNationality?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalConditions?: string;
  teamName?: string;
  tshirtSize?: string;
  paymentMethod: string;
}

// Security validation functions
const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/\0/g, '') // Remove null bytes
    .slice(0, 1000); // Limit length
};

const sanitizeLongText = (text: string): string => {
  if (!text) return '';
  return text
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/\0/g, '')
    .slice(0, 2000); // Allow longer text but still limit
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

const detectSuspiciousInput = (input: string): boolean => {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /\bexec\b/i,
    /\bunion\b.*\bselect\b/i,
    /\binsert\b.*\binto\b/i,
    /\bdelete\b.*\bfrom\b/i,
    /\bdrop\b.*\btable\b/i,
  ];
  return suspiciousPatterns.some(pattern => pattern.test(input));
};

// Rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const checkRateLimit = (identifier: string, maxRequests = 5, windowMs = 60000): boolean => {
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

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-TICKET-PURCHASE] ${step}${detailsStr}`);
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

    const requestData: PurchaseRequest = await req.json();
    logStep("Request data received", { eventId: requestData.eventId, ticketTypeId: requestData.ticketTypeId });

    // Security validations
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    
    // Rate limiting check
    if (!checkRateLimit(clientIP, 5, 60000)) {
      logStep("Rate limit exceeded", { clientIP });
      throw new Error("Too many requests. Please try again later.");
    }

    // Validate and sanitize inputs
    const sanitizedName = sanitizeInput(requestData.participantName);
    const sanitizedEmail = sanitizeInput(requestData.participantEmail);
    
    if (!validateEmail(sanitizedEmail)) {
      throw new Error("Invalid email format");
    }
    
    if (!sanitizedName || sanitizedName.length < 2) {
      throw new Error("Invalid participant name");
    }
    
    // Check for suspicious patterns
    const fieldsToCheck = [
      requestData.participantName,
      requestData.participantEmail,
      requestData.medicalConditions,
      requestData.teamName,
      requestData.emergencyContactName
    ].filter(Boolean);
    
    if (fieldsToCheck.some(detectSuspiciousInput)) {
      logStep("Suspicious input detected", { clientIP });
      throw new Error("Invalid input detected");
    }

    // Validate event exists and is published
    const { data: event, error: eventError } = await supabaseClient
      .from('events')
      .select('*')
      .eq('id', requestData.eventId)
      .eq('status', 'published')
      .single();

    if (eventError || !event) {
      logStep("Event not found or not published", { eventError });
      throw new Error("Event not found or not available for registration");
    }

    // Validate ticket type
    const { data: ticketType, error: ticketError } = await supabaseClient
      .from('ticket_types')
      .select('*')
      .eq('id', requestData.ticketTypeId)
      .eq('event_id', requestData.eventId)
      .eq('is_active', true)
      .single();

    if (ticketError || !ticketType) {
      logStep("Ticket type not found", { ticketError });
      throw new Error("Ticket type not found or not available");
    }

    // Check if event registration is still open
    const now = new Date();
    const registrationEnd = new Date(event.registration_end);
    if (now > registrationEnd) {
      throw new Error("Registration period has ended for this event");
    }

    // Check max participants if set
    if (event.max_participants) {
      const { count: currentRegistrations } = await supabaseClient
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', requestData.eventId)
        .eq('status', 'active');

      if (currentRegistrations && currentRegistrations >= event.max_participants) {
        throw new Error("Event is fully booked");
      }
    }

    // Check for duplicate document number in the same event
    if (requestData.participantDocumentNumber) {
      const { data: existingRegistration } = await supabaseClient
        .from('registrations')
        .select('id')
        .eq('event_id', requestData.eventId)
        .eq('participant_document_number', requestData.participantDocumentNumber)
        .eq('status', 'active')
        .maybeSingle();

      if (existingRegistration) {
        throw new Error("Este documento já está registado neste evento");
      }
    }

    // Generate a unique registration number
    const registrationNumber = `REG-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    // Calculate amount (using current price, could be early bird or regular)
    const currentPrice = ticketType.early_bird_end_date && new Date() <= new Date(ticketType.early_bird_end_date) 
      ? (ticketType.early_bird_price || ticketType.price) 
      : ticketType.price;

    // Create registration record with sanitized data
    const registrationData = {
      event_id: requestData.eventId,
      ticket_type_id: requestData.ticketTypeId,
      participant_id: userId,
      participant_name: sanitizedName,
      participant_email: sanitizedEmail,
      participant_phone: requestData.participantPhone ? sanitizeInput(requestData.participantPhone) : null,
      participant_gender: requestData.participantGender,
      participant_birth_date: requestData.participantBirthDate,
      participant_document_number: requestData.participantDocumentNumber ? sanitizeInput(requestData.participantDocumentNumber) : null,
      participant_nif: requestData.participantNif ? sanitizeInput(requestData.participantNif) : null,
      participant_nationality: sanitizeInput(requestData.participantNationality || 'Portugal'),
      emergency_contact_name: requestData.emergencyContactName ? sanitizeInput(requestData.emergencyContactName) : null,
      emergency_contact_phone: requestData.emergencyContactPhone ? sanitizeInput(requestData.emergencyContactPhone) : null,
      medical_conditions: requestData.medicalConditions ? sanitizeLongText(requestData.medicalConditions) : null,
      team_name: requestData.teamName ? sanitizeInput(requestData.teamName) : null,
      tshirt_size: requestData.tshirtSize,
      registration_number: registrationNumber,
      amount_paid: currentPrice,
      payment_method: requestData.paymentMethod,
      payment_status: requestData.paymentMethod === 'bank_transfer' ? 'pending' : 'pending',
      status: 'active'
    };

    const { data: registration, error: registrationError } = await supabaseClient
      .from('registrations')
      .insert(registrationData)
      .select()
      .single();

    if (registrationError) {
      logStep("Registration creation failed", { registrationError });
      throw new Error("Failed to create registration");
    }

    logStep("Registration created successfully", { registrationId: registration.id });

    // Return success response with registration details and payment instructions
    const response = {
      success: true,
      registration: {
        id: registration.id,
        registration_number: registrationNumber,
        event_title: event.title,
        ticket_type: ticketType.name,
        amount: currentPrice,
        currency: ticketType.currency,
        payment_method: requestData.paymentMethod,
        payment_status: registration.payment_status
      },
      payment_instructions: requestData.paymentMethod === 'bank_transfer' ? {
        message: "Transferência bancária criada com sucesso",
        details: "Irá receber as instruções de pagamento por email em breve. O registo será confirmado após receção do pagamento.",
        account_info: "IBAN: PT50 0000 0000 0000 0000 0000 0",
        reference: registrationNumber,
        amount: currentPrice,
        currency: ticketType.currency
      } : null
    };

    // Send automatic confirmation email
    try {
      const emailResponse = await supabaseClient.functions.invoke('send-registration-email', {
        body: {
          registrationId: registration.id,
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
      // Don't fail the registration if email fails
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-ticket-purchase", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
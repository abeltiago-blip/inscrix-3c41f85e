import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EasyPayRegistrationRequest {
  eventId: string;
  ticketTypeId: string;
  participantData: {
    participantName: string;
    participantEmail: string;
    participantPhone?: string;
    participantGender?: string;
    participantBirthDate?: string;
    participantDocumentNumber?: string;
    participantNationality?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    medicalConditions?: string;
    teamName?: string;
    tshirtSize?: string;
  };
  paymentMethod: 'multibanco' | 'mbway' | 'cc' | 'dd';
  totalAmount: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Creating EasyPay registration...");

    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { eventId, ticketTypeId, participantData, paymentMethod, totalAmount }: EasyPayRegistrationRequest = await req.json();

    // Validate required fields
    if (!eventId || !ticketTypeId || !participantData.participantName || !participantData.participantEmail || !totalAmount) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate MB WAY phone requirement
    if (paymentMethod === 'mbway' && !participantData.participantPhone) {
      return new Response(
        JSON.stringify({ error: "Telefone é obrigatório para MB WAY" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Create Supabase client for user session
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid user" }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Get event and ticket type details
    const { data: event, error: eventError } = await supabaseAdmin
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return new Response(
        JSON.stringify({ error: "Event not found" }),
        { status: 404, headers: corsHeaders }
      );
    }

    const { data: ticketType, error: ticketError } = await supabaseAdmin
      .from("ticket_types")
      .select("*")
      .eq("id", ticketTypeId)
      .eq("event_id", eventId)
      .single();

    if (ticketError || !ticketType) {
      return new Response(
        JSON.stringify({ error: "Ticket type not found" }),
        { status: 404, headers: corsHeaders }
      );
    }

    // Create registration
    const { data: registration, error: registrationError } = await supabaseAdmin
      .from("registrations")
      .insert({
        event_id: eventId,
        ticket_type_id: ticketTypeId,
        participant_id: user.id,
        user_id: user.id,
        participant_name: participantData.participantName,
        participant_email: participantData.participantEmail,
        participant_phone: participantData.participantPhone,
        participant_gender: participantData.participantGender,
        participant_birth_date: participantData.participantBirthDate || null,
        participant_document_number: participantData.participantDocumentNumber,
        participant_nationality: participantData.participantNationality || 'Portugal',
        emergency_contact_name: participantData.emergencyContactName,
        emergency_contact_phone: participantData.emergencyContactPhone,
        medical_conditions: participantData.medicalConditions,
        team_name: participantData.teamName,
        tshirt_size: participantData.tshirtSize,
        amount_paid: totalAmount,
        payment_status: 'pending',
        status: 'pending'
      })
      .select()
      .single();

    if (registrationError) {
      console.error("Registration error:", registrationError);
      return new Response(
        JSON.stringify({ error: "Error creating registration" }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        registration_id: registration.id,
        event_id: eventId,
        user_id: user.id,
        total_amount: totalAmount,
        subtotal: totalAmount,
        currency: 'EUR',
        status: 'pending',
        payment_status: 'pending',
        payment_method: `easypay_${paymentMethod}`,
        payment_provider: 'easypay'
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order error:", orderError);
      return new Response(
        JSON.stringify({ error: "Error creating order" }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Now create the EasyPay payment
    const { data: easypayResponse, error: easypayError } = await supabaseUser.functions.invoke('create-easypay-payment', {
      body: {
        orderId: order.id,
        method: paymentMethod,
        amount: totalAmount,
        phone: participantData.participantPhone,
        currency: 'EUR'
      }
    });

    if (easypayError) {
      console.error("EasyPay error:", easypayError);
      // Update registration and order status to failed
      await supabaseAdmin
        .from("registrations")
        .update({ status: 'cancelled', payment_status: 'failed' })
        .eq("id", registration.id);

      await supabaseAdmin
        .from("orders")
        .update({ status: 'cancelled', payment_status: 'failed' })
        .eq("id", order.id);

      return new Response(
        JSON.stringify({ error: "Error creating EasyPay payment" }),
        { status: 500, headers: corsHeaders }
      );
    }

    console.log("EasyPay registration created successfully");

    return new Response(JSON.stringify({
      success: true,
      registration: registration,
      order: order,
      payment: easypayResponse,
      instructions: easypayResponse.instructions || null
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error("Error creating EasyPay registration:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckinRequest {
  qrData: string;
  scannerUserId?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-CHECKIN] ${step}${detailsStr}`);
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
    logStep("Checkin function started");

    // Get authenticated user (scanner)
    const authHeader = req.headers.get("Authorization");
    let scannerUserId = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
      if (!userError && userData.user) {
        scannerUserId = userData.user.id;
        logStep("Scanner authenticated", { scannerUserId });
      }
    }

    const requestData: CheckinRequest = await req.json();
    logStep("Checkin request received", { 
      hasQrData: !!requestData.qrData,
      scannerUserId: scannerUserId || requestData.scannerUserId 
    });

    // Parse QR code data
    let qrPayload;
    try {
      qrPayload = JSON.parse(requestData.qrData);
    } catch (parseError) {
      throw new Error("Invalid QR code format");
    }

    if (qrPayload.type !== 'checkin') {
      throw new Error("Invalid QR code type");
    }

    const { registration_id, event_id, participant_email } = qrPayload;

    if (!registration_id || !event_id) {
      throw new Error("Missing registration or event information in QR code");
    }

    // Validate registration exists and is active
    const { data: registration, error: regError } = await supabaseClient
      .from('registrations')
      .select(`
        *,
        events(id, title, start_date, end_date, status, organizer_id),
        ticket_types(name)
      `)
      .eq('id', registration_id)
      .eq('event_id', event_id)
      .eq('status', 'active')
      .single();

    if (regError || !registration) {
      throw new Error("Registration not found or not active");
    }

    // Check if event is published and ongoing
    const event = registration.events;
    if (event.status !== 'published') {
      throw new Error("Event is not published");
    }

    const now = new Date();
    const eventStart = new Date(event.start_date);
    const eventEnd = event.end_date ? new Date(event.end_date) : new Date(eventStart.getTime() + 24 * 60 * 60 * 1000); // Default 24h duration

    // Allow check-in 2 hours before event starts and until event ends
    const checkinStart = new Date(eventStart.getTime() - 2 * 60 * 60 * 1000);
    
    if (now < checkinStart) {
      throw new Error("Check-in not yet available for this event");
    }
    
    if (now > eventEnd) {
      throw new Error("Check-in period has ended for this event");
    }

    // Check if already checked in
    const { data: existingCheckin } = await supabaseClient
      .from('event_checkins')
      .select('*')
      .eq('registration_id', registration_id)
      .eq('event_id', event_id)
      .single();

    if (existingCheckin) {
      return new Response(JSON.stringify({
        success: false,
        error: "Already checked in",
        checkin: {
          time: existingCheckin.checkin_time,
          method: existingCheckin.checkin_method
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Verify scanner has permission (must be organizer or admin)
    const actualScannerUserId = scannerUserId || requestData.scannerUserId;
    if (actualScannerUserId) {
      const { data: scannerProfile } = await supabaseClient
        .from('profiles')
        .select('role, user_id')
        .eq('user_id', actualScannerUserId)
        .single();

      const isAuthorized = 
        scannerProfile?.role === 'admin' || 
        (scannerProfile?.role === 'organizer' && event.organizer_id === actualScannerUserId);

      if (!isAuthorized) {
        throw new Error("Not authorized to perform check-ins for this event");
      }
    }

    // Create check-in record
    const checkinData = {
      event_id: event_id,
      registration_id: registration_id,
      participant_id: registration.participant_id,
      participant_name: registration.participant_name,
      participant_email: registration.participant_email,
      scanner_user_id: actualScannerUserId,
      checkin_method: 'qr_scan',
      latitude: requestData.latitude,
      longitude: requestData.longitude,
      notes: requestData.notes,
      checkin_time: new Date().toISOString()
    };

    const { data: checkin, error: checkinError } = await supabaseClient
      .from('event_checkins')
      .insert(checkinData)
      .select()
      .single();

    if (checkinError) {
      logStep("Error creating checkin", { checkinError });
      throw new Error("Failed to create check-in record");
    }

    // Update registration check-in status
    await supabaseClient
      .from('registrations')
      .update({ 
        check_in_status: 'checked_in',
        check_in_time: new Date().toISOString()
      })
      .eq('id', registration_id);

    logStep("Check-in successful", { checkinId: checkin.id });

    return new Response(JSON.stringify({
      success: true,
      message: "Check-in successful",
      checkin: {
        id: checkin.id,
        participant_name: registration.participant_name,
        event_title: event.title,
        ticket_type: registration.ticket_types?.name,
        checkin_time: checkin.checkin_time,
        registration_number: registration.registration_number
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in process-checkin", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
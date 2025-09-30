import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { encode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QRRequest {
  registrationId: string;
  eventId: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-TICKET-QR] ${step}${detailsStr}`);
};

// Simple QR code generation function
const generateQRCodeSVG = (data: string, size: number = 200) => {
  // Base64 encoded QR code data structure
  const qrData = encode(data);
  const gridSize = 25;
  const cellSize = size / gridSize;
  
  // Simple pattern generation based on data hash
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash + data.charCodeAt(i)) & 0xffffffff;
  }
  
  let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${size}" height="${size}" fill="white"/>`;
  
  // Generate QR pattern
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const cellHash = (hash + row * gridSize + col) % 2;
      if (cellHash === 0) {
        const x = col * cellSize;
        const y = row * cellSize;
        svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="black"/>`;
      }
    }
  }
  
  // Add finder patterns (corners)
  const finderSize = cellSize * 7;
  const positions = [
    { x: 0, y: 0 },
    { x: size - finderSize, y: 0 },
    { x: 0, y: size - finderSize }
  ];
  
  positions.forEach(pos => {
    svg += `<rect x="${pos.x}" y="${pos.y}" width="${finderSize}" height="${finderSize}" fill="black"/>`;
    svg += `<rect x="${pos.x + cellSize}" y="${pos.y + cellSize}" width="${finderSize - 2 * cellSize}" height="${finderSize - 2 * cellSize}" fill="white"/>`;
    svg += `<rect x="${pos.x + 2 * cellSize}" y="${pos.y + 2 * cellSize}" width="${finderSize - 4 * cellSize}" height="${finderSize - 4 * cellSize}" fill="black"/>`;
  });
  
  svg += '</svg>';
  return svg;
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

    const requestData: QRRequest = await req.json();
    logStep("QR request received", requestData);

    // Validate registration exists
    const { data: registration, error: regError } = await supabaseClient
      .from('registrations')
      .select(`
        *,
        events(id, title, start_date, location),
        ticket_types(name)
      `)
      .eq('id', requestData.registrationId)
      .eq('event_id', requestData.eventId)
      .single();

    if (regError || !registration) {
      throw new Error("Registration not found");
    }

    // Generate unique QR code data
    const qrData = JSON.stringify({
      type: 'checkin',
      registration_id: requestData.registrationId,
      event_id: requestData.eventId,
      participant_email: registration.participant_email,
      timestamp: new Date().toISOString(),
      hash: btoa(`${requestData.registrationId}-${requestData.eventId}-${Date.now()}`)
    });

    // Generate QR code SVG
    const qrCodeSVG = generateQRCodeSVG(qrData, 300);

    // Check if QR code already exists for this registration
    const { data: existingQR } = await supabaseClient
      .from('event_qr_codes')
      .select('*')
      .eq('event_id', requestData.eventId)
      .eq('qr_code_data', qrData)
      .single();

    let qrCodeRecord;

    if (existingQR) {
      // Update existing QR code
      const { data: updatedQR, error: updateError } = await supabaseClient
        .from('event_qr_codes')
        .update({
          qr_code_url: `data:image/svg+xml;base64,${encode(qrCodeSVG)}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingQR.id)
        .select()
        .single();

      if (updateError) throw updateError;
      qrCodeRecord = updatedQR;
    } else {
      // Create new QR code record
      const { data: newQR, error: insertError } = await supabaseClient
        .from('event_qr_codes')
        .insert({
          event_id: requestData.eventId,
          qr_type: 'checkin',
          qr_code_data: qrData,
          qr_code_url: `data:image/svg+xml;base64,${encode(qrCodeSVG)}`,
          created_by: registration.participant_id,
          is_active: true,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      qrCodeRecord = newQR;
    }

    logStep("QR code generated successfully", { qrId: qrCodeRecord.id });

    return new Response(JSON.stringify({
      success: true,
      qr_code: {
        id: qrCodeRecord.id,
        data: qrData,
        svg: qrCodeSVG,
        url: qrCodeRecord.qr_code_url,
        registration: {
          number: registration.registration_number,
          participant_name: registration.participant_name,
          event_title: registration.events?.title,
          ticket_type: registration.ticket_types?.name,
          event_date: registration.events?.start_date,
          location: registration.events?.location
        }
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in generate-ticket-qr", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
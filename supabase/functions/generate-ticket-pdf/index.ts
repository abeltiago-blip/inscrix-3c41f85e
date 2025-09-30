import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { encode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PDFRequest {
  registrationId: string;
  includeQR?: boolean;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-TICKET-PDF] ${step}${detailsStr}`);
};

// Simple SVG to simulate QR code
const generateQRCodeSVG = (data: string, size: number = 150) => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash + data.charCodeAt(i)) & 0xffffffff;
  }
  
  const gridSize = 21;
  const cellSize = size / gridSize;
  
  let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${size}" height="${size}" fill="white"/>`;
  
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
  svg += '</svg>';
  return svg;
};

// Generate PDF-like content as SVG (simplified for demo)
const generateTicketSVG = (ticketData: any, qrCode?: string) => {
  const width = 595; // A4 width in points
  const height = 400; // Ticket height
  
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
  
  // Background
  svg += `<rect width="${width}" height="${height}" fill="#f8f9fa" stroke="#dee2e6" stroke-width="2"/>`;
  
  // Header
  svg += `<rect x="0" y="0" width="${width}" height="80" fill="#007bff"/>`;
  svg += `<text x="30" y="35" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">INSCRIX</text>`;
  svg += `<text x="30" y="60" fill="white" font-family="Arial, sans-serif" font-size="12">Bilhete Eletrónico</text>`;
  
  // Event info
  let yPos = 120;
  svg += `<text x="30" y="${yPos}" fill="#212529" font-family="Arial, sans-serif" font-size="20" font-weight="bold">${ticketData.event_title}</text>`;
  
  yPos += 35;
  svg += `<text x="30" y="${yPos}" fill="#6c757d" font-family="Arial, sans-serif" font-size="14">📅 ${ticketData.event_date}</text>`;
  
  yPos += 25;
  svg += `<text x="30" y="${yPos}" fill="#6c757d" font-family="Arial, sans-serif" font-size="14">📍 ${ticketData.event_location}</text>`;
  
  // Participant info
  yPos += 40;
  svg += `<text x="30" y="${yPos}" fill="#212529" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Participante</text>`;
  
  yPos += 25;
  svg += `<text x="30" y="${yPos}" fill="#212529" font-family="Arial, sans-serif" font-size="14">${ticketData.participant_name}</text>`;
  
  yPos += 20;
  svg += `<text x="30" y="${yPos}" fill="#6c757d" font-family="Arial, sans-serif" font-size="12">${ticketData.participant_email}</text>`;
  
  // Ticket info
  yPos += 30;
  svg += `<text x="30" y="${yPos}" fill="#212529" font-family="Arial, sans-serif" font-size="14">Bilhete: ${ticketData.ticket_type}</text>`;
  
  yPos += 20;
  svg += `<text x="30" y="${yPos}" fill="#6c757d" font-family="Arial, sans-serif" font-size="12">Nº: ${ticketData.registration_number}</text>`;
  
  // QR Code
  if (qrCode) {
    const qrSize = 120;
    const qrX = width - qrSize - 30;
    const qrY = 120;
    
    svg += `<rect x="${qrX - 10}" y="${qrY - 10}" width="${qrSize + 20}" height="${qrSize + 20}" fill="white" stroke="#dee2e6"/>`;
    svg += qrCode.replace('<svg', `<svg x="${qrX}" y="${qrY}"`);
    svg += `<text x="${qrX + qrSize/2}" y="${qrY + qrSize + 20}" text-anchor="middle" fill="#6c757d" font-family="Arial, sans-serif" font-size="10">Código para Check-in</text>`;
  }
  
  // Footer
  svg += `<line x1="30" y1="${height - 60}" x2="${width - 30}" y2="${height - 60}" stroke="#dee2e6"/>`;
  svg += `<text x="30" y="${height - 35}" fill="#6c757d" font-family="Arial, sans-serif" font-size="10">Este bilhete é válido apenas para o evento especificado.</text>`;
  svg += `<text x="30" y="${height - 20}" fill="#6c757d" font-family="Arial, sans-serif" font-size="10">Apresente este bilhete na entrada do evento.</text>`;
  
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
    logStep("PDF generation started");

    const requestData: PDFRequest = await req.json();
    logStep("PDF request received", requestData);

    // Fetch registration details with event and ticket type
    const { data: registration, error: regError } = await supabaseClient
      .from('registrations')
      .select(`
        *,
        events(id, title, description, start_date, location, address),
        ticket_types(name, description)
      `)
      .eq('id', requestData.registrationId)
      .single();

    if (regError || !registration) {
      throw new Error("Registration not found");
    }

    logStep("Registration data loaded", { 
      registrationNumber: registration.registration_number,
      eventTitle: registration.events?.title 
    });

    // Prepare ticket data
    const ticketData = {
      event_title: registration.events?.title || 'Evento',
      event_date: registration.events?.start_date ? 
        new Date(registration.events.start_date).toLocaleDateString('pt-PT', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Data a confirmar',
      event_location: registration.events?.location || 'Local a confirmar',
      participant_name: registration.participant_name,
      participant_email: registration.participant_email,
      ticket_type: registration.ticket_types?.name || 'Bilhete Standard',
      registration_number: registration.registration_number,
      amount_paid: registration.amount_paid
    };

    // Generate QR code if requested
    let qrCodeSVG;
    if (requestData.includeQR !== false) { // Default true
      const qrData = JSON.stringify({
        type: 'checkin',
        registration_id: requestData.registrationId,
        event_id: registration.event_id,
        participant_email: registration.participant_email,
        timestamp: new Date().toISOString()
      });
      
      qrCodeSVG = generateQRCodeSVG(qrData, 120);
    }

    // Generate ticket SVG
    const ticketSVG = generateTicketSVG(ticketData, qrCodeSVG);
    
    // Convert SVG to base64 (in real implementation, you'd use a proper PDF library)
    const ticketBase64 = encode(ticketSVG);

    logStep("Ticket generated successfully");

    // In a real implementation, you would:
    // 1. Use a proper PDF library like jsPDF or Puppeteer
    // 2. Generate actual PDF content
    // 3. Store the PDF in Supabase Storage
    // 4. Return download URL

    return new Response(JSON.stringify({
      success: true,
      ticket: {
        registration_id: requestData.registrationId,
        registration_number: registration.registration_number,
        participant_name: registration.participant_name,
        event_title: registration.events?.title,
        // For demo, returning SVG as base64. In production, return PDF
        pdf_data: `data:image/svg+xml;base64,${ticketBase64}`,
        // In production, return actual PDF URL:
        // pdf_url: 'https://storage.supabase.co/path/to/ticket.pdf'
        generated_at: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in generate-ticket-pdf", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
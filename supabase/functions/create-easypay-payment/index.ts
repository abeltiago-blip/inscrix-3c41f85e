import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EasyPayPaymentRequest {
  orderId: string;
  method: 'multibanco' | 'mbway' | 'cc' | 'dd';
  amount: number;
  phone?: string; // For MB WAY
  currency?: string;
}

interface EasyPayApiResponse {
  id: string;
  method: string;
  status: string;
  customer?: {
    entity?: string;
    reference?: string;
    value?: number;
  };
  messages?: Array<{
    field: string;
    message: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Creating EasyPay payment...");

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

    const { orderId, method, amount, phone, currency = 'EUR' }: EasyPayPaymentRequest = await req.json();

    if (!orderId || !method || !amount) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: orderId, method, amount" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Get EasyPay configuration
    const { data: paymentMethods, error: paymentMethodError } = await supabaseAdmin
      .from("payment_methods")
      .select("config")
      .eq("provider", "easypay")
      .eq("is_active", true)
      .single();

    if (paymentMethodError || !paymentMethods) {
      console.error("EasyPay payment method not configured:", paymentMethodError);
      return new Response(
        JSON.stringify({ error: "EasyPay not configured" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const config = paymentMethods.config as {
      account_id: string;
      api_key: string;
      sandbox: boolean;
      success_url?: string;
      cancel_url?: string;
      webhook_url?: string;
    };

    // Get EASYPAY_API_KEY from environment
    const apiKey = Deno.env.get("EASYPAY_API_KEY") || config.api_key;
    const accountId = config.account_id;
    const baseUrl = config.sandbox 
      ? "https://api.test.easypay.pt" 
      : "https://api.easypay.pt";

    if (!apiKey || !accountId) {
      return new Response(
        JSON.stringify({ error: "EasyPay API credentials not configured" }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Prepare EasyPay API request
    const easypayPayload: any = {
      type: "sale",
      currency: currency,
      value: amount,
      method: method,
      account: {
        id: accountId
      },
      key: `order-${orderId}-${Date.now()}`, // Unique key for this payment
    };

    // Add return URLs for methods that support them
    if (method === 'cc' || method === 'dd') {
      // Credit card and direct debit need return URLs
      if (config.success_url) {
        easypayPayload.success_url = `${config.success_url}?payment_id={id}&order_id=${orderId}&method=${method}`;
      }
      if (config.cancel_url) {
        easypayPayload.cancel_url = `${config.cancel_url}?payment_id={id}&order_id=${orderId}&method=${method}&reason=user_cancelled`;
      }
    }

    // Add method-specific fields
    if (method === 'mbway' && phone) {
      easypayPayload.customer = {
        phone: phone
      };
      // MB WAY can also benefit from return URLs for mobile redirect
      if (config.success_url) {
        easypayPayload.success_url = `${config.success_url}?payment_id={id}&order_id=${orderId}&method=${method}`;
      }
      if (config.cancel_url) {
        easypayPayload.cancel_url = `${config.cancel_url}?payment_id={id}&order_id=${orderId}&method=${method}&reason=timeout`;
      }
    }

    console.log("EasyPay request payload:", JSON.stringify(easypayPayload, null, 2));

    // Make request to EasyPay API
    const easypayResponse = await fetch(`${baseUrl}/2.0/single`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "AccountId": accountId,
        "ApiKey": apiKey,
      },
      body: JSON.stringify(easypayPayload),
    });

    const easypayData: EasyPayApiResponse = await easypayResponse.json();
    console.log("EasyPay response:", JSON.stringify(easypayData, null, 2));

    if (!easypayResponse.ok) {
      console.error("EasyPay API error:", easypayData);
      return new Response(
        JSON.stringify({ 
          error: "EasyPay API error", 
          details: easypayData.messages || easypayData 
        }),
        { status: easypayResponse.status, headers: corsHeaders }
      );
    }

    // Calculate expiration date (24 hours for most methods, 30 minutes for MB WAY)
    const expirationHours = method === 'mbway' ? 0.5 : 24;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    // Save payment details to database
    const { data: easypayPayment, error: insertError } = await supabaseAdmin
      .from("easypay_payments")
      .insert({
        order_id: orderId,
        easypay_payment_id: easypayData.id,
        method: method,
        amount: amount,
        currency: currency,
        entity: easypayData.customer?.entity,
        reference: easypayData.customer?.reference,
        phone: method === 'mbway' ? phone : null,
        status: easypayData.status === 'ok' ? 'pending' : 'failed',
        easypay_status: easypayData.status,
        easypay_response: easypayData,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error saving EasyPay payment:", insertError);
      return new Response(
        JSON.stringify({ error: "Database error" }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Update order metadata with EasyPay payment ID
    const { error: orderUpdateError } = await supabaseAdmin
      .from("orders")
      .update({
        metadata: {
          easypay_payment_id: easypayData.id,
          easypay_method: method,
        },
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId);

    if (orderUpdateError) {
      console.error("Error updating order:", orderUpdateError);
    }

    // Prepare response based on method
    let response: any = {
      success: true,
      payment_id: easypayData.id,
      method: method,
      amount: amount,
      currency: currency,
      expires_at: expiresAt.toISOString(),
    };

    if (method === 'multibanco') {
      response = {
        ...response,
        entity: easypayData.customer?.entity,
        reference: easypayData.customer?.reference,
        instructions: {
          entity: easypayData.customer?.entity,
          reference: easypayData.customer?.reference,
          amount: easypayData.customer?.value || amount,
          message: "Use estes dados para fazer o pagamento via Multibanco"
        }
      };
    } else if (method === 'mbway') {
      response = {
        ...response,
        phone: phone,
        instructions: {
          message: "Autorize o pagamento na sua aplicação MB WAY",
          phone: phone
        }
      };
    }

    console.log("EasyPay payment created successfully:", response);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error("Error creating EasyPay payment:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
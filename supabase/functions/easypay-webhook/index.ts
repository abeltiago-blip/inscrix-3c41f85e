import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("EasyPay webhook received");

    // Initialize Supabase client with service role key
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

    const body = await req.text();
    console.log("Webhook body:", body);

    // Parse the webhook payload
    let webhookData;
    try {
      webhookData = JSON.parse(body);
    } catch (parseError) {
      console.error("Error parsing webhook body:", parseError);
      return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
    }

    console.log("Parsed webhook data:", webhookData);

    // Extract payment information from EasyPay webhook
    const { id: paymentId, status, key, value } = webhookData;

    if (!paymentId || !status) {
      console.error("Missing required fields in webhook");
      return new Response("Missing required fields", { status: 400, headers: corsHeaders });
    }

    // Update order status based on EasyPay payment status
    let orderStatus;
    let paymentStatus;

    switch (status) {
      case "success":
      case "paid":
        orderStatus = "confirmed";
        paymentStatus = "paid";
        break;
      case "pending":
        orderStatus = "pending";
        paymentStatus = "pending";
        break;
      case "failed":
      case "error":
        orderStatus = "cancelled";
        paymentStatus = "failed";
        break;
      default:
        console.warn("Unknown payment status:", status);
        orderStatus = "pending";
        paymentStatus = "pending";
    }

    // Find the EasyPay payment record
    const { data: easypayPayments, error: findPaymentError } = await supabaseAdmin
      .from("easypay_payments")
      .select("*, orders(*)")
      .eq("easypay_payment_id", paymentId);

    if (findPaymentError) {
      console.error("Error finding EasyPay payment:", findPaymentError);
      return new Response("Database error", { status: 500, headers: corsHeaders });
    }

    if (!easypayPayments || easypayPayments.length === 0) {
      console.warn("No EasyPay payment found for ID:", paymentId);
      return new Response("Payment not found", { status: 404, headers: corsHeaders });
    }

    const easypayPayment = easypayPayments[0];
    const order = easypayPayment.orders;
    console.log("Found EasyPay payment:", easypayPayment.id, "for order:", order.id);

    // Update EasyPay payment record
    const { error: paymentUpdateError } = await supabaseAdmin
      .from("easypay_payments")
      .update({
        status: paymentStatus,
        easypay_status: status,
        paid_at: status === "success" || status === "paid" ? new Date().toISOString() : null,
        easypay_response: {
          ...easypayPayment.easypay_response,
          webhook_data: webhookData,
          webhook_received_at: new Date().toISOString()
        },
        metadata: {
          ...easypayPayment.metadata,
          webhook_received: new Date().toISOString(),
          final_status: status,
          final_value: value,
          final_key: key
        },
        updated_at: new Date().toISOString()
      })
      .eq("id", easypayPayment.id);

    if (paymentUpdateError) {
      console.error("Error updating EasyPay payment:", paymentUpdateError);
      return new Response("Payment update error", { status: 500, headers: corsHeaders });
    }

    // Update order status and payment information
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        status: orderStatus,
        payment_status: paymentStatus,
        payment_date: status === "success" || status === "paid" ? new Date().toISOString() : null,
        metadata: {
          ...order.metadata,
          easypay_webhook_received: new Date().toISOString(),
          easypay_final_status: status,
          easypay_value: value,
          easypay_key: key
        },
        updated_at: new Date().toISOString()
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("Error updating order:", updateError);
      return new Response("Update error", { status: 500, headers: corsHeaders });
    }

    // If payment is successful, update registration status
    if (orderStatus === "confirmed") {
      const { error: regUpdateError } = await supabaseAdmin
        .from("registrations")
        .update({
          payment_status: "paid",
          status: "active",
          updated_at: new Date().toISOString()
        })
        .eq("id", order.registration_id);

      if (regUpdateError) {
        console.error("Error updating registration:", regUpdateError);
        // Don't fail the webhook for this error, just log it
      }

      console.log("Payment confirmed, registration updated");
    }

    console.log("Webhook processed successfully");
    return new Response("OK", { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response("Internal server error", { status: 500, headers: corsHeaders });
  }
});
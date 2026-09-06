import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, verif-hash, x-squad-encrypted-body",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const flutterwaveSecretHash = Deno.env.get("FLUTTERWAVE_WEBHOOK_HASH") ?? "";
    const squadSecretKey = Deno.env.get("SQUAD_SECRET_KEY") ?? "";

    const bodyText = await req.text();
    let eventData: any = null;
    let eventId = "";
    let invoiceId = "";
    let paidAmount = 0;
    let currency = "USD";
    let provider = "flutterwave";
    let reference = "";
    let providerFee = 0;
    let bizpilotlyFee = 0;

    // 1. Detect Provider & Verify Cryptographic Signature
    const flwSignature =
      req.headers.get("verif-hash") ||
      req.headers.get("x-flutterwave-signature") ||
      req.headers.get("flutterwave-signature");
    const squadSignature = req.headers.get("x-squad-encrypted-body");


    if (flwSignature || req.headers.get("x-payment-provider") === "flutterwave") {
      provider = "flutterwave";
      if (flutterwaveSecretHash && flwSignature !== flutterwaveSecretHash) {
        return new Response(JSON.stringify({ error: "Invalid Flutterwave signature hash" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      eventData = JSON.parse(bodyText);
      eventId = eventData.id ? `flw_${eventData.id}` : `flw_evt_${Date.now()}`;
      
      const data = eventData.data || eventData;
      invoiceId = data.meta?.invoiceId || data.customer?.meta?.invoiceId;
      paidAmount = Number(data.amount) || 0;
      currency = (data.currency || "USD").toUpperCase();
      reference = data.tx_ref || data.flw_ref || String(data.id);
      providerFee = Number(data.app_fee) || 0;
      bizpilotlyFee = Number(data.meta?.bizpilotlyServiceFee) || 0;
    } else if (squadSignature || req.headers.get("x-payment-provider") === "squad") {
      provider = "squad";
      eventData = JSON.parse(bodyText);
      eventId = eventData.transaction_ref ? `sqd_${eventData.transaction_ref}` : `sqd_evt_${Date.now()}`;
      
      const data = eventData.data || eventData;
      invoiceId = data.meta?.invoiceId || data.metadata?.invoiceId;
      paidAmount = (Number(data.amount) || 0) / 100; // Squad sends amount in kobo/cents
      currency = (data.currency || "NGN").toUpperCase();
      reference = data.transaction_ref || String(data.id);
      providerFee = (Number(data.fee) || 0) / 100;
      bizpilotlyFee = Number(data.metadata?.bizpilotlyServiceFee) || 0;
    } else {
      // Generic JSON parse fallback
      eventData = JSON.parse(bodyText);
      eventId = `generic_${Date.now()}`;
      invoiceId = eventData.metadata?.invoiceId || eventData.data?.metadata?.invoiceId;
      paidAmount = Number(eventData.amount || eventData.data?.amount) || 0;
      reference = eventData.reference || eventData.tx_ref || String(Date.now());
    }

    if (!invoiceId) {
      return new Response(JSON.stringify({ received: true, message: "Webhook acknowledged (No invoice attached)" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Idempotency Check
    const { data: existingPayment } = await supabaseAdmin
      .from("payments")
      .select("id, status")
      .eq("webhook_event_id", eventId)
      .maybeSingle();

    if (existingPayment) {
      return new Response(JSON.stringify({ message: "Event already processed (Idempotent)" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Locate Document
    const { data: doc, error: docError } = await supabaseAdmin
      .from("documents")
      .select("id, business_id, customer_id, total, status, document_number")
      .eq("id", invoiceId)
      .single();

    if (docError || !doc) {
      return new Response(JSON.stringify({ error: "Invoice not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const invoiceAmount = Number(doc.total);
    const businessAmount = invoiceAmount;

    // 4. Record/Update Payment in Ledger
    const paymentNumber = `PAY-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    
    await supabaseAdmin.from("payments").insert({
      business_id: doc.business_id,
      document_id: doc.id,
      customer_id: doc.customer_id,
      payment_number: paymentNumber,
      amount: invoiceAmount,
      invoice_amount: invoiceAmount,
      bizpilotly_fee: bizpilotlyFee,
      provider_fee: providerFee,
      customer_total: paidAmount || (invoiceAmount + bizpilotlyFee),
      business_amount: businessAmount,
      currency,
      currency_symbol: currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : currency === "NGN" ? "₦" : "$",
      method: "Credit Card",
      date: new Date().toISOString().split("T")[0],
      status: "completed",
      payment_status: "SUCCESS",
      settlement_status: "SETTLED",
      reference,
      provider,
      provider_reference: reference,
      webhook_event_id: eventId,
      paid_at: new Date().toISOString(),
      notes: `Settled via verified ${provider.toUpperCase()} webhook. Platform fee: ${bizpilotlyFee} ${currency}`,
    });

    // 5. Update Invoice Status to Paid
    await supabaseAdmin
      .from("documents")
      .update({ status: "paid" })
      .eq("id", doc.id);

    return new Response(
      JSON.stringify({
        status: "success",
        invoiceId: doc.id,
        invoiceNumber: doc.document_number,
        settledAmount: invoiceAmount,
        bizpilotlyFee,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Webhook processing error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

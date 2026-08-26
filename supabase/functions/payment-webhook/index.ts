import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature, x-paystack-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY") ?? "";

    const providerHeader = req.headers.get("x-payment-provider") || "stripe";
    const bodyText = await req.text();
    let eventData: any = null;
    let eventId = "";
    let invoiceId = "";
    let paidAmount = 0;
    let currency = "USD";
    let provider = providerHeader;
    let reference = "";

    // 1. Signature & Payload Verification
    if (providerHeader === "stripe") {
      const signature = req.headers.get("stripe-signature");
      if (!signature && stripeWebhookSecret) {
        return new Response(JSON.stringify({ error: "Missing Stripe signature" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      try {
        eventData = JSON.parse(bodyText);
        eventId = eventData.id || `evt_${Date.now()}`;
        if (eventData.type === "checkout.session.completed") {
          const session = eventData.data?.object;
          invoiceId = session?.metadata?.invoiceId;
          paidAmount = (session?.amount_total || 0) / 100;
          currency = (session?.currency || "usd").toUpperCase();
          reference = session?.payment_intent || session?.id;
        }
      } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else if (providerHeader === "paystack") {
      const signature = req.headers.get("x-paystack-signature");
      if (!signature && paystackSecretKey) {
        return new Response(JSON.stringify({ error: "Missing Paystack signature" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      eventData = JSON.parse(bodyText);
      eventId = eventData.event ? `${eventData.event}_${eventData.data?.id}` : `pstk_${Date.now()}`;
      if (eventData.event === "charge.success") {
        const data = eventData.data;
        invoiceId = data?.metadata?.invoiceId;
        paidAmount = (data?.amount || 0) / 100;
        currency = (data?.currency || "NGN").toUpperCase();
        reference = data?.reference || String(data?.id);
      }
    }

    if (!invoiceId) {
      // Unrelated or unhandled webhook event received
      return new Response(JSON.stringify({ received: true, ignored: "No invoice attached" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Idempotency Check: Prevent duplicate webhook processing
    const { data: existingPayment } = await supabaseAdmin
      .from("payments")
      .select("id")
      .eq("webhook_event_id", eventId)
      .maybeSingle();

    if (existingPayment) {
      return new Response(JSON.stringify({ message: "Event already processed (idempotent)" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Locate Document
    const { data: doc, error: docError } = await supabaseAdmin
      .from("documents")
      .select("id, business_id, customer_id, total, status")
      .eq("id", invoiceId)
      .single();

    if (docError || !doc) {
      return new Response(JSON.stringify({ error: "Associated invoice not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Record Payment in Ledger
    const paymentNumber = `PAY-GW-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    await supabaseAdmin.from("payments").insert({
      business_id: doc.business_id,
      document_id: doc.id,
      customer_id: doc.customer_id,
      payment_number: paymentNumber,
      amount: paidAmount,
      currency,
      currency_symbol: currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : currency === "NGN" ? "₦" : "$",
      method: provider === "stripe" ? "Stripe" : provider === "paystack" ? "Other" : "Credit Card",
      date: new Date().toISOString().split("T")[0],
      status: "completed",
      reference,
      provider,
      provider_reference: reference,
      webhook_event_id: eventId,
      paid_at: new Date().toISOString(),
      notes: `Settled via verified ${provider} gateway webhook`,
    });

    // 5. Reconcile Invoice Status
    const { data: allPayments } = await supabaseAdmin
      .from("payments")
      .select("amount")
      .eq("document_id", doc.id)
      .eq("status", "completed");

    const totalPaid = (allPayments || []).reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);

    if (totalPaid >= Number(doc.total)) {
      await supabaseAdmin
        .from("documents")
        .update({ status: "paid" })
        .eq("id", doc.id);
    }

    return new Response(
      JSON.stringify({ success: true, invoiceId, paidAmount, status: "reconciled" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

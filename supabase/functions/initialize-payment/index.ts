import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Fee calculation constants
const DEFAULT_FEE_PERCENTAGE = 0.005; // 0.5%
const CAPS: Record<string, number> = {
  NGN: 10000,
  USD: 10,
  GBP: 10,
  EUR: 10,
};

function calculateServiceFee(amount: number, currency: string): number {
  const cleanCurrency = (currency || "USD").toUpperCase();
  const rawFee = amount * DEFAULT_FEE_PERCENTAGE;
  const cap = CAPS[cleanCurrency] || 10;
  return Math.round((Math.min(rawFee, cap) + Number.EPSILON) * 100) / 100;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const flutterwaveSecretKey = Deno.env.get("FLUTTERWAVE_SECRET_KEY") ?? "";
    const squadSecretKey = Deno.env.get("SQUAD_SECRET_KEY") ?? "";

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();

    const {
      action = "initialize",
      provider = "flutterwave",
      invoiceId,
      customerEmail,
      customerName,
      successUrl,
      cancelUrl,
      reference: queryRef,
    } = body;

    // Handle verification action
    if (action === "verify" && queryRef) {
      if (provider === "flutterwave" && flutterwaveSecretKey) {
        const verifyRes = await fetch(`https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${queryRef}`, {
          headers: { Authorization: `Bearer ${flutterwaveSecretKey}` },
        });
        const verifyData = await verifyRes.json();
        return new Response(JSON.stringify(verifyData.data || {}), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ isSuccessful: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!invoiceId) {
      return new Response(JSON.stringify({ error: "Missing invoiceId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Authoritative Server-Side Document & Business Lookup
    const { data: doc, error: docError } = await supabaseAdmin
      .from("documents")
      .select("id, document_number, total, currency, status, business_id, customer_id")
      .eq("id", invoiceId)
      .single();

    if (docError || !doc) {
      return new Response(JSON.stringify({ error: "Invoice not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (doc.status === "paid") {
      return new Response(JSON.stringify({ error: "Invoice has already been settled." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: business } = await supabaseAdmin
      .from("businesses")
      .select("id, name, country, flutterwave_subaccount_id, squad_submerchant_id")
      .eq("id", doc.business_id)
      .single();

    const invoiceAmount = Number(doc.total);
    const currency = (doc.currency || "USD").toUpperCase();
    const serviceFee = calculateServiceFee(invoiceAmount, currency);
    const txRef = `BP-${doc.document_number.replace(/[^a-zA-Z0-9]/g, "")}-${Date.now()}`;

    // 2. Initialize with Selected Provider (Server-Side)
    let checkoutUrl = "";
    let sessionId = "";

    if (provider === "flutterwave" && flutterwaveSecretKey) {
      const payload: any = {
        tx_ref: txRef,
        amount: invoiceAmount + serviceFee,
        currency,
        redirect_url: successUrl || `https://bizpilotly.com/invoice/${doc.id}?status=success`,
        customer: {
          email: customerEmail || "customer@bizpilotly.com",
          name: customerName || "Valued Client",
        },
        customizations: {
          title: `Invoice #${doc.document_number}`,
          description: `Settlement for Invoice #${doc.document_number} by ${business?.name || "BizPilotly"}`,
          logo: "https://bizpilotly.com/brand/logo-mark.png",
        },
        meta: {
          invoiceId: doc.id,
          businessId: doc.business_id,
          invoiceAmount,
          bizpilotlyServiceFee: serviceFee,
        },
      };

      // Add subaccount split if business has active Flutterwave subaccount
      if (business?.flutterwave_subaccount_id) {
        payload.subaccounts = [
          {
            id: business.flutterwave_subaccount_id,
            transaction_charge_type: "flat_subaccount",
            transaction_charge: invoiceAmount,
          },
        ];
      }

      const flwRes = await fetch("https://api.flutterwave.com/v3/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${flutterwaveSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const flwData = await flwRes.json();
      if (flwData.status === "success" && flwData.data?.link) {
        checkoutUrl = flwData.data.link;
        sessionId = txRef;
      }
    } else if (provider === "squad" && squadSecretKey) {
      const payload: any = {
        amount: Math.round((invoiceAmount + serviceFee) * 100), // Squad expects kobo/cents
        email: customerEmail || "customer@bizpilotly.com",
        currency,
        initiate_type: "inline",
        transaction_ref: txRef,
        callback_url: successUrl || `https://bizpilotly.com/invoice/${doc.id}?status=success`,
        pass_charge: true,
        metadata: {
          invoiceId: doc.id,
          businessId: doc.business_id,
          invoiceAmount,
          bizpilotlyServiceFee: serviceFee,
        },
      };

      if (business?.squad_submerchant_id) {
        payload.sub_merchant_id = business.squad_submerchant_id;
      }

      const sqdRes = await fetch("https://api-d.squadco.com/transaction/initiate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${squadSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const sqdData = await sqdRes.json();
      if (sqdData.status === 200 && sqdData.data?.checkout_url) {
        checkoutUrl = sqdData.data.checkout_url;
        sessionId = txRef;
      }
    }

    // Fallback URL if gateway API keys are pending
    if (!checkoutUrl) {
      checkoutUrl = `https://checkout.${provider}.com/pay/${txRef}`;
      sessionId = txRef;
    }

    // 3. Record Pending Transaction in Internal Payments Ledger
    await supabaseAdmin.from("payments").insert({
      business_id: doc.business_id,
      document_id: doc.id,
      customer_id: doc.customer_id,
      payment_number: `PAY-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      amount: invoiceAmount,
      invoice_amount: invoiceAmount,
      bizpilotly_fee: serviceFee,
      provider_fee: 0,
      customer_total: invoiceAmount + serviceFee,
      business_amount: invoiceAmount,
      currency,
      currency_symbol: currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : currency === "NGN" ? "₦" : "$",
      method: "Credit Card",
      date: new Date().toISOString().split("T")[0],
      status: "pending",
      payment_status: "PENDING",
      settlement_status: "PENDING",
      provider,
      provider_reference: txRef,
      checkout_reference: txRef,
      notes: `Initialized ${provider.toUpperCase()} checkout session with BizPilotly service fee (${serviceFee} ${currency})`,
    });

    return new Response(
      JSON.stringify({
        checkoutUrl,
        sessionId,
        reference: txRef,
        provider,
        invoiceAmount,
        bizpilotlyServiceFee: serviceFee,
        totalPayable: invoiceAmount + serviceFee,
        currency,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

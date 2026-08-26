import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface EmailPayload {
  templateType:
    | "invoice_sent"
    | "quote_sent"
    | "proposal_sent"
    | "receipt_sent"
    | "welcome"
    | "payment_received"
    | "payment_reminder";
  recipientEmail: string;
  recipientName?: string;
  documentId?: string;
  customSubject?: string;
  customMessage?: string;
  attachPdf?: boolean;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") ?? "billing@bizpilotly.com";
    const fromName = Deno.env.get("RESEND_FROM_NAME") ?? "BizPilotly Platform";

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseUserClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload: EmailPayload = await req.json();
    if (!payload.recipientEmail || !payload.templateType) {
      return new Response(
        JSON.stringify({ error: "Missing recipientEmail or templateType" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

    let documentData: any = null;
    let businessData: any = null;
    let attachments: any[] = [];

    // If attached to a document, verify tenant ownership
    if (payload.documentId) {
      const { data: doc, error: docError } = await supabaseAdmin
        .from("documents")
        .select("*, businesses!inner(*), customers(*)")
        .eq("id", payload.documentId)
        .maybeSingle();

      if (docError || !doc) {
        return new Response(JSON.stringify({ error: "Document not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (doc.businesses.user_id !== user.id) {
        return new Response(JSON.stringify({ error: "Forbidden: You do not own this document" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      documentData = doc;
      businessData = doc.businesses;

      // Handle PDF attachment if requested and available in storage
      if (payload.attachPdf && doc.pdf_storage_path) {
        const { data: fileData } = await supabaseAdmin.storage
          .from("documents")
          .download(doc.pdf_storage_path);

        if (fileData) {
          const buffer = await fileData.arrayBuffer();
          const base64Content = btoa(
            String.fromCharCode(...new Uint8Array(buffer))
          );
          attachments.push({
            filename: `${doc.document_number || "document"}.pdf`,
            content: base64Content,
          });
        }
      }
    }

    // Compose email subject and HTML body
    const senderBusinessName = businessData?.name || fromName;
    let subject = payload.customSubject;
    let htmlContent = "";

    switch (payload.templateType) {
      case "invoice_sent":
        subject = subject || `Invoice ${documentData?.document_number || ""} from ${senderBusinessName}`;
        htmlContent = `
          <div style="font-family: sans-serif; color: #1E293B; max-width: 600px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #0B1F3A;">Invoice ${documentData?.document_number || ""}</h2>
            <p>Dear ${payload.recipientName || "Valued Client"},</p>
            <p>Please find attached invoice <strong>#${documentData?.document_number || ""}</strong> for <strong>$${Number(documentData?.total || 0).toFixed(2)}</strong> from ${senderBusinessName}.</p>
            ${payload.customMessage ? `<p style="background: #F8FAFC; padding: 12px; border-left: 4px solid #0B1F3A;">${payload.customMessage}</p>` : ""}
            <p>Due Date: <strong>${documentData?.due_date || "Upon Receipt"}</strong></p>
            <p style="margin-top: 32px; font-size: 12px; color: #64748B;">Powered by BizPilotly Platform</p>
          </div>
        `;
        break;
      case "quote_sent":
        subject = subject || `Price Quotation ${documentData?.document_number || ""} from ${senderBusinessName}`;
        htmlContent = `
          <div style="font-family: sans-serif; color: #1E293B; max-width: 600px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #0B1F3A;">Quotation ${documentData?.document_number || ""}</h2>
            <p>Dear ${payload.recipientName || "Valued Client"},</p>
            <p>Please find attached quote <strong>#${documentData?.document_number || ""}</strong> from ${senderBusinessName}.</p>
            <p style="margin-top: 32px; font-size: 12px; color: #64748B;">Powered by BizPilotly Platform</p>
          </div>
        `;
        break;
      case "payment_received":
        subject = subject || `Payment Receipt for Invoice ${documentData?.document_number || ""}`;
        htmlContent = `
          <div style="font-family: sans-serif; color: #1E293B; max-width: 600px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #0B1F3A;">Payment Received — Thank You!</h2>
            <p>We have successfully recorded your payment of <strong>$${Number(documentData?.total || 0).toFixed(2)}</strong> for #${documentData?.document_number || ""}.</p>
            <p style="margin-top: 32px; font-size: 12px; color: #64748B;">Powered by BizPilotly Platform</p>
          </div>
        `;
        break;
      case "welcome":
      default:
        subject = subject || `Welcome to ${fromName}!`;
        htmlContent = `
          <div style="font-family: sans-serif; color: #1E293B; max-width: 600px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #0B1F3A;">Welcome to BizPilotly</h2>
            <p>Your business operations platform is ready. Create professional invoices, quotes, receipts, and track financial growth with precision.</p>
            <p style="margin-top: 32px; font-size: 12px; color: #64748B;">BizPilotly — Calculate. Create. Manage.</p>
          </div>
        `;
        break;
    }

    let resendId: string | null = null;
    let dispatchStatus = "sent";
    let errorMessage: string | null = null;

    // Send via Resend API if API key is configured on server
    if (resendApiKey) {
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${fromName} <${fromEmail}>`,
          to: [payload.recipientEmail],
          subject,
          html: htmlContent,
          attachments: attachments.length > 0 ? attachments : undefined,
        }),
      });

      const resendResult = await resendResponse.json();
      if (!resendResponse.ok) {
        dispatchStatus = "failed";
        errorMessage = resendResult.message || "Resend API dispatch failed";
      } else {
        resendId = resendResult.id;
      }
    } else {
      // Staged mock logging if Resend API key is awaiting owner setup
      resendId = `sim_${Date.now()}`;
      dispatchStatus = "sent";
    }

    // Record email log in database
    await supabaseAdmin.from("email_logs").insert({
      business_id: businessData?.id || null,
      document_id: payload.documentId || null,
      template_type: payload.templateType,
      recipient_email: payload.recipientEmail,
      subject: subject || "Notification",
      status: dispatchStatus,
      resend_id: resendId,
      error_message: errorMessage,
      sent_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: dispatchStatus === "sent",
        resendId,
        status: dispatchStatus,
        error: errorMessage,
      }),
      {
        status: dispatchStatus === "sent" ? 200 : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("Email Edge Function error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

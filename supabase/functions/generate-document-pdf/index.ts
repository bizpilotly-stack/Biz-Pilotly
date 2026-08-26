import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import { jsPDF } from "npm:jspdf@4.2.1";
import autoTable from "npm:jspdf-autotable@5.0.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function formatCurrencyAmount(amount: number, currencyCode = "USD", customSymbol?: string) {
  const symbol =
    customSymbol ||
    (currencyCode === "USD"
      ? "$"
      : currencyCode === "EUR"
      ? "€"
      : currencyCode === "GBP"
      ? "£"
      : currencyCode === "NGN"
      ? "₦"
      : "$");
  const rounded = Math.round((Math.max(0, Number(amount) || 0) + Number.EPSILON) * 100) / 100;
  return `${symbol}${rounded.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function sanitizeFilename(str: string) {
  return str.replace(/[^a-zA-Z0-9-_]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function renderServerPdf(doc: any): Uint8Array {
  const docTypeLabels: Record<string, string> = {
    invoice: "TAX INVOICE",
    quote: "PRICE QUOTATION",
    receipt: "PAYMENT RECEIPT",
    proposal: "BUSINESS PROPOSAL",
  };

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const brandNavy = [11, 31, 58] as const;
  const textDark = [30, 41, 59] as const;
  const textMuted = [100, 116, 139] as const;
  const borderLight = [226, 232, 240] as const;
  const bgSubtle = [248, 250, 252] as const;

  let currentY = margin;

  // 1. Header Branding
  const businessName = doc.business_snapshot?.name || doc.businesses?.name || "My Business Studio";
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.setTextColor(...brandNavy);
  pdf.text(businessName, margin, currentY + 6);

  pdf.setFontSize(16);
  pdf.setTextColor(...brandNavy);
  const typeTitle = docTypeLabels[doc.type] || String(doc.type).toUpperCase();
  pdf.text(typeTitle, pageWidth - margin, currentY + 6, { align: "right" });
  currentY += 12;

  const tagline = doc.business_snapshot?.tagline || doc.businesses?.tagline;
  if (tagline) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(...textMuted);
    pdf.text(tagline, margin, currentY);
    currentY += 5;
  }

  // Divider
  pdf.setDrawColor(...borderLight);
  pdf.setLineWidth(0.4);
  pdf.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 6;

  // 2. Metadata Grid (Issued from / Billed to / Details)
  const colWidth = (contentWidth - 10) / 2;

  // Issued from
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(...textMuted);
  pdf.text("ISSUED FROM:", margin, currentY);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(...textDark);
  pdf.text(businessName, margin, currentY + 5);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(...textMuted);
  let fromY = currentY + 9;
  const bEmail = doc.business_snapshot?.email || doc.businesses?.email;
  const bPhone = doc.business_snapshot?.phone || doc.businesses?.phone;
  const bAddr = doc.business_snapshot?.address || doc.businesses?.address;

  if (bEmail) {
    pdf.text(bEmail, margin, fromY);
    fromY += 4;
  }
  if (bPhone) {
    pdf.text(bPhone, margin, fromY);
    fromY += 4;
  }
  if (bAddr) {
    const splitAddr = pdf.splitTextToSize(bAddr, colWidth);
    pdf.text(splitAddr, margin, fromY);
    fromY += splitAddr.length * 4;
  }

  // Client Details
  let clientY = fromY + 4;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(...textMuted);
  pdf.text("BILLED TO (CLIENT):", margin, clientY);

  const clientName = doc.client_snapshot?.name || doc.customers?.name || "Valued Client";
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(...textDark);
  pdf.text(clientName, margin, clientY + 5);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(...textMuted);
  let clientInfoY = clientY + 9;
  const cCompany = doc.client_snapshot?.company || doc.customers?.company;
  const cEmail = doc.client_snapshot?.email || doc.customers?.email;
  const cPhone = doc.client_snapshot?.phone || doc.customers?.phone;
  const cAddr = doc.client_snapshot?.address || doc.customers?.address;

  if (cCompany) {
    pdf.text(cCompany, margin, clientInfoY);
    clientInfoY += 4;
  }
  if (cEmail) {
    pdf.text(cEmail, margin, clientInfoY);
    clientInfoY += 4;
  }
  if (cPhone) {
    pdf.text(cPhone, margin, clientInfoY);
    clientInfoY += 4;
  }
  if (cAddr) {
    const splitAddr = pdf.splitTextToSize(cAddr, colWidth);
    pdf.text(splitAddr, margin, clientInfoY);
    clientInfoY += splitAddr.length * 4;
  }

  // Right Details Card
  const rightColX = margin + colWidth + 10;
  pdf.setFillColor(...bgSubtle);
  pdf.roundedRect(rightColX, currentY - 2, colWidth, 42, 2, 2, "F");
  pdf.setDrawColor(...borderLight);
  pdf.roundedRect(rightColX, currentY - 2, colWidth, 42, 2, 2, "D");

  let metaY = currentY + 4;
  const drawMetaRow = (label: string, value: string) => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(...textMuted);
    pdf.text(label, rightColX + 5, metaY);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(...textDark);
    pdf.text(value, rightColX + colWidth - 5, metaY, { align: "right" });
    metaY += 6.5;
  };

  drawMetaRow("Document Number:", doc.document_number || "DRAFT");
  drawMetaRow("Issue Date:", doc.issue_date || "N/A");
  if (doc.due_date && (doc.type === "invoice" || doc.type === "receipt")) {
    drawMetaRow("Payment Due:", doc.due_date);
  }
  if (doc.valid_until && doc.type === "quote") {
    drawMetaRow("Quote Valid Until:", doc.valid_until);
  }
  drawMetaRow("Status:", String(doc.status || "draft").toUpperCase());
  drawMetaRow("Currency:", `${doc.currency || "USD"} (${doc.currency_symbol || "$"})`);

  currentY = Math.max(clientInfoY + 4, currentY + 46);

  if (doc.title) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(...brandNavy);
    pdf.text(`Subject: ${doc.title}`, margin, currentY);
    currentY += 6;
  }

  // 3. Line Items Table
  const items = doc.document_items || [];
  const tableData = items.map((item: any, idx: number) => [
    String(idx + 1),
    item.description || "Item / Service",
    String(item.quantity ?? 1),
    formatCurrencyAmount(item.unit_price ?? 0, doc.currency, doc.currency_symbol),
    formatCurrencyAmount(item.amount ?? 0, doc.currency, doc.currency_symbol),
  ]);

  autoTable(pdf, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["#", "Description", "Qty", "Unit Price", "Amount"]],
    body: tableData.length > 0 ? tableData : [["1", "General Service", "1", "$0.00", "$0.00"]],
    theme: "grid",
    headStyles: {
      fillColor: [11, 31, 58],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      cellPadding: 3,
    },
    bodyStyles: {
      textColor: [30, 41, 59],
      fontSize: 8.5,
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 18, halign: "center" },
      3: { cellWidth: 28, halign: "right" },
      4: { cellWidth: 32, halign: "right", fontStyle: "bold" },
    },
    styles: {
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
  });

  const finalY = (pdf as any).lastAutoTable?.finalY || currentY + 30;
  currentY = finalY + 6;

  // 4. Totals Summary
  const totalsWidth = 70;
  const totalsX = pageWidth - margin - totalsWidth;

  let totY = currentY;
  const drawTotalRow = (label: string, amount: number, isBold = false) => {
    pdf.setFont("helvetica", isBold ? "bold" : "normal");
    pdf.setFontSize(isBold ? 10 : 8.5);
    pdf.setTextColor(isBold ? brandNavy[0] : textMuted[0], isBold ? brandNavy[1] : textMuted[1], isBold ? brandNavy[2] : textMuted[2]);
    pdf.text(label, totalsX, totY);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(isBold ? 10 : 8.5);
    pdf.setTextColor(isBold ? brandNavy[0] : textDark[0], isBold ? brandNavy[1] : textDark[1], isBold ? brandNavy[2] : textDark[2]);
    pdf.text(
      formatCurrencyAmount(amount, doc.currency, doc.currency_symbol),
      pageWidth - margin,
      totY,
      { align: "right" }
    );
    totY += isBold ? 6 : 5;
  };

  drawTotalRow("Subtotal:", Number(doc.subtotal) || 0);

  if (Number(doc.discount_rate) > 0) {
    drawTotalRow(`Discount (${doc.discount_rate}%):`, -Number(doc.discount_amount || 0));
  }

  if (Number(doc.tax_rate) > 0) {
    drawTotalRow(`Tax / VAT (${doc.tax_rate}%):`, Number(doc.tax_amount || 0));
  }

  pdf.setDrawColor(...borderLight);
  pdf.line(totalsX, totY - 1, pageWidth - margin, totY - 1);
  totY += 2;

  drawTotalRow("Total Amount Due:", Number(doc.total) || 0, true);

  // 5. Payment Details, Notes & Terms
  const notesWidth = contentWidth - totalsWidth - 10;
  let notesY = currentY;

  const paymentDetails = doc.payment_details;
  if (paymentDetails?.bankName || paymentDetails?.accountNumber) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.setTextColor(...brandNavy);
    pdf.text("Settlement / Payment Instructions:", margin, notesY);
    notesY += 4.5;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...textDark);
    if (paymentDetails.bankName) {
      pdf.text(`Bank: ${paymentDetails.bankName}`, margin, notesY);
      notesY += 3.5;
    }
    if (paymentDetails.accountName) {
      pdf.text(`Account Name: ${paymentDetails.accountName}`, margin, notesY);
      notesY += 3.5;
    }
    if (paymentDetails.accountNumber) {
      pdf.text(`Account / IBAN: ${paymentDetails.accountNumber}`, margin, notesY);
      notesY += 3.5;
    }
    const routing = paymentDetails.routingOrIban || paymentDetails.routingCode;
    if (routing) {
      pdf.text(`Routing / SWIFT: ${routing}`, margin, notesY);
      notesY += 3.5;
    }
    notesY += 2;
  }

  if (doc.notes) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.setTextColor(...brandNavy);
    pdf.text("Notes & Instructions:", margin, notesY);
    notesY += 4.5;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...textMuted);
    const splitNotes = pdf.splitTextToSize(doc.notes, notesWidth);
    pdf.text(splitNotes, margin, notesY);
    notesY += splitNotes.length * 3.5 + 2;
  }

  if (doc.terms) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.setTextColor(...brandNavy);
    pdf.text("Terms & Conditions:", margin, notesY);
    notesY += 4.5;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...textMuted);
    const splitTerms = pdf.splitTextToSize(doc.terms, notesWidth);
    pdf.text(splitTerms, margin, notesY);
  }

  // Footer Pagination
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(...textMuted);
    pdf.text(
      `Generated by BizPilotly Platform — Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  }

  return pdf.output("arraybuffer") as unknown as Uint8Array;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Authenticate user from JWT
    const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseUserClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized / Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { documentId } = await req.json();
    if (!documentId) {
      return new Response(JSON.stringify({ error: "Missing documentId parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Privileged client scoped for storage write & metadata update
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

    // 2. Fetch document and verify tenant ownership
    const { data: document, error: docError } = await supabaseAdmin
      .from("documents")
      .select(`
        *,
        businesses!inner (
          id,
          user_id,
          name,
          tagline,
          email,
          phone,
          address
        ),
        customers (
          id,
          name,
          company,
          email,
          phone,
          address
        ),
        document_items (
          id,
          description,
          quantity,
          unit_price,
          amount,
          sort_order
        )
      `)
      .eq("id", documentId)
      .maybeSingle();

    if (docError || !document) {
      return new Response(JSON.stringify({ error: "Document not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Strict multi-tenant verification: business.user_id === user.id
    if (document.businesses.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Forbidden: You do not own this document" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const businessId = document.businesses.id;
    const clientName = sanitizeFilename(
      document.client_snapshot?.name || document.customers?.name || "Client"
    );
    const docNumber = sanitizeFilename(document.document_number || "DOC");
    const filename = `${docNumber}-${clientName}.pdf`;
    const storagePath = `business/${businessId}/documents/${document.id}/${filename}`;

    // 3. Cache Check: If stored PDF is current, return fresh signed URL directly
    const isCurrent =
      document.pdf_storage_path &&
      document.pdf_generated_at &&
      new Date(document.pdf_generated_at) >= new Date(document.updated_at);

    if (isCurrent) {
      const { data: signedData, error: signError } = await supabaseAdmin.storage
        .from("documents")
        .createSignedUrl(document.pdf_storage_path, 900); // 15 min validity

      if (!signError && signedData?.signedUrl) {
        return new Response(
          JSON.stringify({
            downloadUrl: signedData.signedUrl,
            filename,
            cached: true,
            storagePath: document.pdf_storage_path,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // 4. Render Server PDF
    const pdfBytes = renderServerPdf(document);

    // 5. Upload to private Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from("documents")
      .upload(storagePath, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return new Response(
        JSON.stringify({ error: `Storage upload failed: ${uploadError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 6. Update document metadata
    const generatedAt = new Date().toISOString();
    const newVersion = (document.pdf_version || 1) + 1;

    await supabaseAdmin
      .from("documents")
      .update({
        pdf_storage_path: storagePath,
        pdf_generated_at: generatedAt,
        pdf_version: newVersion,
      })
      .eq("id", document.id);

    // 7. Create temporary signed URL
    const { data: signedData, error: signError } = await supabaseAdmin.storage
      .from("documents")
      .createSignedUrl(storagePath, 900);

    if (signError || !signedData?.signedUrl) {
      return new Response(
        JSON.stringify({ error: "Failed to generate signed URL" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        downloadUrl: signedData.signedUrl,
        filename,
        cached: false,
        storagePath,
        generatedAt,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("Unhandled error in generate-document-pdf Edge Function:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

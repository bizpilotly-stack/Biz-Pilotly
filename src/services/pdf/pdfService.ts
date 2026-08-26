import { supabase } from '../supabase';
import { BusinessDocument } from '../../types';

export interface StoredPdfResult {
  storagePath: string;
  filename: string;
  downloadUrl: string;
  generatedAt?: string;
  cached?: boolean;
}

class PdfService {
  private readonly BUCKET_NAME = 'documents';

  /**
   * Lazily loads the client-side vector renderer for anonymous visitors.
   */
  async renderDocumentBlob(doc: BusinessDocument): Promise<{ blob: Blob; filename: string }> {
    const { renderDocumentPdf, generateDocumentPdfFilename } = await import('./pdfRenderer');
    const pdf = renderDocumentPdf(doc);
    const blob = pdf.output('blob');
    const filename = generateDocumentPdfFilename(doc);
    return { blob, filename };
  }

  /**
   * Triggers client-side browser download for anonymous visitors without requiring an account.
   */
  async downloadDocumentLocally(doc: BusinessDocument): Promise<void> {
    const { blob, filename } = await this.renderDocumentBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /**
   * Invokes the Supabase Edge Function to generate, upload to private storage, and return a signed URL.
   */
  async getSecureDownloadUrl(documentId: string): Promise<{ downloadUrl: string; filename: string }> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('You must be logged in to download server-generated PDFs.');
    }

    const { data, error } = await supabase.functions.invoke('generate-document-pdf', {
      body: { documentId },
    });

    if (error) {
      console.error('Edge Function error generating PDF:', error);
      throw new Error(error.message || 'Failed to generate server PDF');
    }

    if (!data?.downloadUrl) {
      throw new Error(data?.error || 'Invalid response from PDF generation server');
    }

    return {
      downloadUrl: data.downloadUrl,
      filename: data.filename || `document-${documentId}.pdf`,
    };
  }

  /**
   * Alias for cloud PDF generation through Supabase Edge Function.
   */
  async generateAndStorePdf(documentId: string): Promise<StoredPdfResult> {
    const res = await this.getSecureDownloadUrl(documentId);
    return {
      storagePath: `business/documents/${documentId}/${res.filename}`,
      filename: res.filename,
      downloadUrl: res.downloadUrl,
    };
  }

  /**
   * Removes associated PDF from Supabase Storage when a document is deleted.
   */
  async deletePdfFromStorage(storagePath: string): Promise<void> {
    if (!storagePath) return;
    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .remove([storagePath]);

    if (error) {
      console.warn('Warning: could not delete PDF from storage:', error.message);
    }
  }
}

export const pdfService = new PdfService();

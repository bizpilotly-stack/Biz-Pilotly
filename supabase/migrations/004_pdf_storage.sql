-- ==============================================================================
-- BIZPILOTLY DATABASE MIGRATION 004: Document PDF Storage & File Infrastructure
-- ==============================================================================

-- 1. Add PDF storage fields to public.documents
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS pdf_storage_path TEXT,
ADD COLUMN IF NOT EXISTS pdf_generated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS pdf_version INTEGER NOT NULL DEFAULT 1;

-- 2. Create dedicated private Storage Bucket for business documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('documents', 'documents', false, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE
SET
    public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['application/pdf'];

-- 3. Row Level Security Policies on storage.objects for 'documents' bucket
-- Storage Path Structure: business/{business_id}/documents/{document_id}/{filename}.pdf

-- SELECT policy: authenticated users can only download PDFs belonging to their businesses
DROP POLICY IF EXISTS "documents_storage_select_own" ON storage.objects;
CREATE POLICY "documents_storage_select_own" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'documents' AND
        (storage.foldername(name))[2]::uuid IN (
            SELECT id FROM public.businesses WHERE user_id = auth.uid()
        )
    );

-- INSERT policy: authenticated users can only upload PDFs into their business folder
DROP POLICY IF EXISTS "documents_storage_insert_own" ON storage.objects;
CREATE POLICY "documents_storage_insert_own" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'documents' AND
        (storage.foldername(name))[2]::uuid IN (
            SELECT id FROM public.businesses WHERE user_id = auth.uid()
        )
    );

-- UPDATE policy: authenticated users can only replace/update PDFs in their business folder
DROP POLICY IF EXISTS "documents_storage_update_own" ON storage.objects;
CREATE POLICY "documents_storage_update_own" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'documents' AND
        (storage.foldername(name))[2]::uuid IN (
            SELECT id FROM public.businesses WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        bucket_id = 'documents' AND
        (storage.foldername(name))[2]::uuid IN (
            SELECT id FROM public.businesses WHERE user_id = auth.uid()
        )
    );

-- DELETE policy: authenticated users can only delete PDFs from their business folder
DROP POLICY IF EXISTS "documents_storage_delete_own" ON storage.objects;
CREATE POLICY "documents_storage_delete_own" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'documents' AND
        (storage.foldername(name))[2]::uuid IN (
            SELECT id FROM public.businesses WHERE user_id = auth.uid()
        )
    );

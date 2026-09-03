-- ==============================================================================
-- BIZPILOTLY DATABASE MIGRATION 007: Document System & Workflow Enhancements
-- Adds support for Estimate & Contract document types, rich lifecycle statuses,
-- document relationship tracking, and prefix configurations.
-- ==============================================================================

-- 1. Update Document Types & Statuses Constraints on documents table
ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_type_check;
ALTER TABLE public.documents ADD CONSTRAINT documents_type_check 
    CHECK (type IN ('invoice', 'quote', 'estimate', 'proposal', 'contract', 'receipt'));

ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_status_check;
ALTER TABLE public.documents ADD CONSTRAINT documents_status_check 
    CHECK (status IN (
        'draft', 
        'sent', 
        'viewed', 
        'accepted', 
        'rejected', 
        'signed', 
        'declined', 
        'paid', 
        'partially_paid',
        'pending_confirmation', 
        'overdue', 
        'expired', 
        'cancelled'
    ));

-- 2. Add prefix columns to businesses table for Estimate and Contract
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS estimate_prefix TEXT NOT NULL DEFAULT 'EST';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS contract_prefix TEXT NOT NULL DEFAULT 'CON';

-- 3. Update document_sequences constraint
ALTER TABLE public.document_sequences DROP CONSTRAINT IF EXISTS document_sequences_doc_type_check;
ALTER TABLE public.document_sequences ADD CONSTRAINT document_sequences_doc_type_check 
    CHECK (doc_type IN ('invoice', 'quote', 'estimate', 'proposal', 'contract', 'receipt'));

-- 4. Update Atomic Next Number Generation Function
CREATE OR REPLACE FUNCTION public.get_next_document_number(
    p_business_id UUID,
    p_doc_type TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_prefix TEXT;
    v_year INTEGER;
    v_next_num INTEGER;
    v_formatted_num TEXT;
BEGIN
    -- Verify caller owns the business
    IF NOT EXISTS (
        SELECT 1 FROM public.businesses
        WHERE id = p_business_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Caller does not own business %', p_business_id;
    END IF;

    v_year := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;
    
    SELECT
        CASE p_doc_type
            WHEN 'invoice' THEN COALESCE(invoice_prefix, 'INV')
            WHEN 'quote' THEN COALESCE(quote_prefix, 'QTE')
            WHEN 'estimate' THEN COALESCE(estimate_prefix, 'EST')
            WHEN 'proposal' THEN COALESCE(proposal_prefix, 'PROP')
            WHEN 'contract' THEN COALESCE(contract_prefix, 'CON')
            WHEN 'receipt' THEN COALESCE(receipt_prefix, 'REC')
            ELSE 'DOC'
        END
    INTO v_prefix
    FROM public.businesses
    WHERE id = p_business_id;

    IF v_prefix IS NULL THEN
        v_prefix := CASE p_doc_type
            WHEN 'invoice' THEN 'INV'
            WHEN 'quote' THEN 'QTE'
            WHEN 'estimate' THEN 'EST'
            WHEN 'proposal' THEN 'PROP'
            WHEN 'contract' THEN 'CON'
            WHEN 'receipt' THEN 'REC'
            ELSE 'DOC'
        END;
    END IF;

    -- Atomically upsert and increment sequence counter
    INSERT INTO public.document_sequences (business_id, doc_type, fiscal_year, current_val)
    VALUES (p_business_id, p_doc_type, v_year, 1)
    ON CONFLICT (business_id, doc_type, fiscal_year)
    DO UPDATE SET
        current_val = public.document_sequences.current_val + 1,
        updated_at = NOW()
    RETURNING current_val INTO v_next_num;

    v_formatted_num := v_prefix || '-' || v_year || '-' || LPAD(v_next_num::TEXT, 4, '0');

    -- Ensure no collision with already created documents
    WHILE EXISTS (
        SELECT 1 FROM public.documents
        WHERE business_id = p_business_id AND document_number = v_formatted_num
    ) LOOP
        UPDATE public.document_sequences
        SET current_val = current_val + 1, updated_at = NOW()
        WHERE business_id = p_business_id AND doc_type = p_doc_type AND fiscal_year = v_year
        RETURNING current_val INTO v_next_num;

        v_formatted_num := v_prefix || '-' || v_year || '-' || LPAD(v_next_num::TEXT, 4, '0');
    END LOOP;

    RETURN v_formatted_num;
END;
$$;

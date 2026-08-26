-- ==============================================================================
-- BIZPILOTLY DATABASE MIGRATION 006: Sequential Document Number Automation
-- ==============================================================================

-- 1. Document Sequences Table (Concurrency-Safe Per-Business Counters)
CREATE TABLE IF NOT EXISTS public.document_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    doc_type TEXT NOT NULL CHECK (doc_type IN ('invoice', 'quote', 'receipt', 'proposal')),
    fiscal_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
    current_val INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_business_doctype_year UNIQUE (business_id, doc_type, fiscal_year)
);

CREATE INDEX IF NOT EXISTS idx_doc_sequences_lookup ON public.document_sequences(business_id, doc_type, fiscal_year);

ALTER TABLE public.document_sequences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "document_sequences_select_own" ON public.document_sequences;
CREATE POLICY "document_sequences_select_own" ON public.document_sequences
    FOR SELECT USING (
        business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "document_sequences_all_own" ON public.document_sequences;
CREATE POLICY "document_sequences_all_own" ON public.document_sequences
    FOR ALL USING (
        business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
    )
    WITH CHECK (
        business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
    );

-- 2. Concurrency-Safe Atomic Next Number Generation Function
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

    -- Get business prefix for this document type
    v_year := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;
    
    SELECT
        CASE p_doc_type
            WHEN 'invoice' THEN COALESCE(invoice_prefix, 'INV')
            WHEN 'quote' THEN COALESCE(quote_prefix, 'QTE')
            WHEN 'receipt' THEN COALESCE(receipt_prefix, 'REC')
            WHEN 'proposal' THEN COALESCE(proposal_prefix, 'PROP')
            ELSE 'DOC'
        END
    INTO v_prefix
    FROM public.businesses
    WHERE id = p_business_id;

    IF v_prefix IS NULL THEN
        v_prefix := CASE p_doc_type
            WHEN 'invoice' THEN 'INV'
            WHEN 'quote' THEN 'QTE'
            WHEN 'receipt' THEN 'REC'
            WHEN 'proposal' THEN 'PROP'
            ELSE 'DOC'
        END;
    END IF;

    -- Atomically upsert and increment sequence counter with row locking
    INSERT INTO public.document_sequences (business_id, doc_type, fiscal_year, current_val)
    VALUES (p_business_id, p_doc_type, v_year, 1)
    ON CONFLICT (business_id, doc_type, fiscal_year)
    DO UPDATE SET
        current_val = public.document_sequences.current_val + 1,
        updated_at = NOW()
    RETURNING current_val INTO v_next_num;

    -- If existing documents already exist with higher sequence, align counter
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

-- ==============================================================================
-- BIZPILOTLY — MIGRATION 007: BUSINESS BRANDING & EXTENDED PREFIXES
-- Adds primary brand color and estimate/contract prefix support to businesses table
-- ==============================================================================

ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#0B1F3A';

ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS estimate_prefix TEXT DEFAULT 'EST';

ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS contract_prefix TEXT DEFAULT 'CON';

-- Ensure document type check allows 'estimate' and 'contract'
ALTER TABLE public.documents
DROP CONSTRAINT IF EXISTS documents_type_check;

ALTER TABLE public.documents
ADD CONSTRAINT documents_type_check 
CHECK (type IN ('invoice', 'quote', 'receipt', 'proposal', 'contract', 'estimate'));

-- ============================================================================
-- BIZPILOTLY MIGRATION 009: Global Multi-Provider Payment Engine
-- Flutterwave + Squad Provider Routing, Subaccount Onboarding & Global Fee Engine
-- ============================================================================

-- 1. PLATFORM-WIDE PAYMENT & FEE CONFIGURATION
CREATE TABLE IF NOT EXISTS public.platform_payment_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Provider Enablement & Priority
    flutterwave_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    flutterwave_priority INTEGER NOT NULL DEFAULT 1,
    
    squad_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    squad_priority INTEGER NOT NULL DEFAULT 2,
    
    stripe_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    stripe_priority INTEGER NOT NULL DEFAULT 3,
    
    -- BizPilotly Platform Service Fee Configuration (0.5% Standard)
    fee_percentage NUMERIC NOT NULL DEFAULT 0.005 CHECK (fee_percentage >= 0 AND fee_percentage <= 0.20),
    
    -- Currency Caps
    cap_ngn NUMERIC NOT NULL DEFAULT 10000.00,
    cap_usd NUMERIC NOT NULL DEFAULT 10.00,
    cap_gbp NUMERIC NOT NULL DEFAULT 10.00,
    cap_eur NUMERIC NOT NULL DEFAULT 10.00,
    
    -- Optional Minimums
    min_ngn NUMERIC NOT NULL DEFAULT 0.00,
    min_usd NUMERIC NOT NULL DEFAULT 0.00,
    min_gbp NUMERIC NOT NULL DEFAULT 0.00,
    min_eur NUMERIC NOT NULL DEFAULT 0.00,
    
    -- Fee Payer Rules (Customer by default)
    platform_fee_payer TEXT NOT NULL DEFAULT 'customer' CHECK (platform_fee_payer IN ('customer', 'merchant')),
    gateway_fee_payer TEXT NOT NULL DEFAULT 'customer' CHECK (gateway_fee_payer IN ('customer', 'merchant')),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial default platform settings if not exists
INSERT INTO public.platform_payment_settings (
    flutterwave_enabled, flutterwave_priority,
    squad_enabled, squad_priority,
    fee_percentage,
    cap_ngn, cap_usd, cap_gbp, cap_eur,
    min_ngn, min_usd, min_gbp, min_eur
)
SELECT true, 1, true, 2, 0.005, 10000.00, 10.00, 10.00, 10.00, 0.00, 0.00, 0.00, 0.00
WHERE NOT EXISTS (SELECT 1 FROM public.platform_payment_settings);

ALTER TABLE public.platform_payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read platform fee config"
    ON public.platform_payment_settings
    FOR SELECT
    USING (true);

CREATE POLICY "Only platform admins can modify platform fee config"
    ON public.platform_payment_settings
    FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 2. BUSINESS PAYMENT PROVIDER ONBOARDING & SUBACCOUNT CONFIGURATION
CREATE TABLE IF NOT EXISTS public.business_payment_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('flutterwave', 'squad', 'stripe')),
    
    -- Provider References
    provider_account_id TEXT,
    provider_subaccount_id TEXT,
    
    -- Geography & Banking
    merchant_country TEXT NOT NULL DEFAULT 'NG',
    settlement_country TEXT NOT NULL DEFAULT 'NG',
    settlement_currency TEXT NOT NULL DEFAULT 'NGN',
    
    -- Onboarding Lifecycle Status
    onboarding_status TEXT NOT NULL DEFAULT 'NOT_STARTED' CHECK (
        onboarding_status IN ('NOT_STARTED', 'PENDING', 'VERIFICATION_REQUIRED', 'ACTIVE', 'RESTRICTED', 'SUSPENDED')
    ),
    provider_status TEXT NOT NULL DEFAULT 'active',
    
    -- Capability Flags
    capabilities JSONB DEFAULT '{"card_payments": true, "bank_transfers": true, "split_settlement": true}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uq_business_provider UNIQUE (business_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_bpc_business ON public.business_payment_configs(business_id);
CREATE INDEX IF NOT EXISTS idx_bpc_provider ON public.business_payment_configs(provider);
CREATE INDEX IF NOT EXISTS idx_bpc_status ON public.business_payment_configs(onboarding_status);

ALTER TABLE public.business_payment_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can view their payment configs"
    ON public.business_payment_configs
    FOR SELECT
    USING (
        public.is_admin() OR
        business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
    );

CREATE POLICY "Business owners can modify their payment configs"
    ON public.business_payment_configs
    FOR ALL
    USING (
        public.is_admin() OR
        business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
    )
    WITH CHECK (
        public.is_admin() OR
        business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
    );

-- 3. EXTEND BUSINESSES TABLE FOR PROVIDER PREFERENCE & COUNTRY
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'NG',
ADD COLUMN IF NOT EXISTS preferred_payment_provider TEXT DEFAULT 'auto' CHECK (
    preferred_payment_provider IN ('auto', 'flutterwave', 'squad', 'stripe')
),
ADD COLUMN IF NOT EXISTS flutterwave_subaccount_id TEXT,
ADD COLUMN IF NOT EXISTS squad_submerchant_id TEXT;

-- 4. EXTEND PAYMENTS LEDGER FOR FULL FINANCIAL & SETTLEMENT ACCOUNTING
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS merchant_country TEXT DEFAULT 'NG',
ADD COLUMN IF NOT EXISTS customer_country TEXT DEFAULT 'NG',
ADD COLUMN IF NOT EXISTS invoice_currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS payment_currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS settlement_currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS invoice_amount NUMERIC NOT NULL DEFAULT 0 CHECK (invoice_amount >= 0),
ADD COLUMN IF NOT EXISTS bizpilotly_fee NUMERIC NOT NULL DEFAULT 0 CHECK (bizpilotly_fee >= 0),
ADD COLUMN IF NOT EXISTS provider_fee NUMERIC NOT NULL DEFAULT 0 CHECK (provider_fee >= 0),
ADD COLUMN IF NOT EXISTS customer_total NUMERIC NOT NULL DEFAULT 0 CHECK (customer_total >= 0),
ADD COLUMN IF NOT EXISTS business_amount NUMERIC NOT NULL DEFAULT 0 CHECK (business_amount >= 0),
ADD COLUMN IF NOT EXISTS settlement_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
    settlement_status IN ('PENDING', 'SETTLED', 'FAILED', 'REVERSED')
),
ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
    payment_status IN ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'CHARGEBACK')
);

-- Index for payment analytics & settlements
CREATE INDEX IF NOT EXISTS idx_payments_settlement_status ON public.payments(settlement_status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_status ON public.payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_currency ON public.payments(currency);

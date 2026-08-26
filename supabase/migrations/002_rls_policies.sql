-- ==============================================================================
-- BIZPILOTLY DATABASE MIGRATION 002: Row Level Security (RLS) Policies
-- ==============================================================================

-- 1. Enable RLS on All Tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- PROFILES POLICIES (Users manage their own single profile)
-- ==============================================================================
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own" ON public.profiles
    FOR DELETE USING (auth.uid() = id);

-- ==============================================================================
-- BUSINESSES POLICIES (Users manage businesses they own)
-- ==============================================================================
DROP POLICY IF EXISTS "businesses_select_own" ON public.businesses;
CREATE POLICY "businesses_select_own" ON public.businesses
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "businesses_insert_own" ON public.businesses;
CREATE POLICY "businesses_insert_own" ON public.businesses
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "businesses_update_own" ON public.businesses;
CREATE POLICY "businesses_update_own" ON public.businesses
    FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "businesses_delete_own" ON public.businesses;
CREATE POLICY "businesses_delete_own" ON public.businesses
    FOR DELETE USING (user_id = auth.uid());

-- ==============================================================================
-- CUSTOMERS POLICIES (Scoped through business.user_id = auth.uid())
-- ==============================================================================
DROP POLICY IF EXISTS "customers_select_own" ON public.customers;
CREATE POLICY "customers_select_own" ON public.customers
    FOR SELECT USING (
        business_id IN (
            SELECT id FROM public.businesses WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "customers_insert_own" ON public.customers;
CREATE POLICY "customers_insert_own" ON public.customers
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT id FROM public.businesses WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "customers_update_own" ON public.customers;
CREATE POLICY "customers_update_own" ON public.customers
    FOR UPDATE USING (
        business_id IN (
            SELECT id FROM public.businesses WHERE user_id = auth.uid()
        )
    ) WITH CHECK (
        business_id IN (
            SELECT id FROM public.businesses WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "customers_delete_own" ON public.customers;
CREATE POLICY "customers_delete_own" ON public.customers
    FOR DELETE USING (
        business_id IN (
            SELECT id FROM public.businesses WHERE user_id = auth.uid()
        )
    );

-- ==============================================================================
-- DOCUMENTS POLICIES (Scoped through business.user_id = auth.uid())
-- ==============================================================================
DROP POLICY IF EXISTS "documents_select_own" ON public.documents;
CREATE POLICY "documents_select_own" ON public.documents
    FOR SELECT USING (
        business_id IN (
            SELECT id FROM public.businesses WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "documents_insert_own" ON public.documents;
CREATE POLICY "documents_insert_own" ON public.documents
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT id FROM public.businesses WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "documents_update_own" ON public.documents;
CREATE POLICY "documents_update_own" ON public.documents
    FOR UPDATE USING (
        business_id IN (
            SELECT id FROM public.businesses WHERE user_id = auth.uid()
        )
    ) WITH CHECK (
        business_id IN (
            SELECT id FROM public.businesses WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "documents_delete_own" ON public.documents;
CREATE POLICY "documents_delete_own" ON public.documents
    FOR DELETE USING (
        business_id IN (
            SELECT id FROM public.businesses WHERE user_id = auth.uid()
        )
    );

-- ==============================================================================
-- DOCUMENT ITEMS POLICIES (Scoped through document -> business -> auth.uid())
-- ==============================================================================
DROP POLICY IF EXISTS "document_items_select_own" ON public.document_items;
CREATE POLICY "document_items_select_own" ON public.document_items
    FOR SELECT USING (
        document_id IN (
            SELECT d.id FROM public.documents d
            JOIN public.businesses b ON d.business_id = b.id
            WHERE b.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "document_items_insert_own" ON public.document_items;
CREATE POLICY "document_items_insert_own" ON public.document_items
    FOR INSERT WITH CHECK (
        document_id IN (
            SELECT d.id FROM public.documents d
            JOIN public.businesses b ON d.business_id = b.id
            WHERE b.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "document_items_update_own" ON public.document_items;
CREATE POLICY "document_items_update_own" ON public.document_items
    FOR UPDATE USING (
        document_id IN (
            SELECT d.id FROM public.documents d
            JOIN public.businesses b ON d.business_id = b.id
            WHERE b.user_id = auth.uid()
        )
    ) WITH CHECK (
        document_id IN (
            SELECT d.id FROM public.documents d
            JOIN public.businesses b ON d.business_id = b.id
            WHERE b.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "document_items_delete_own" ON public.document_items;
CREATE POLICY "document_items_delete_own" ON public.document_items
    FOR DELETE USING (
        document_id IN (
            SELECT d.id FROM public.documents d
            JOIN public.businesses b ON d.business_id = b.id
            WHERE b.user_id = auth.uid()
        )
    );

-- ==============================================================================
-- PAYMENTS POLICIES (Scoped through business.user_id = auth.uid())
-- ==============================================================================
DROP POLICY IF EXISTS "payments_select_own" ON public.payments;
CREATE POLICY "payments_select_own" ON public.payments
    FOR SELECT USING (
        business_id IN (
            SELECT id FROM public.businesses WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "payments_insert_own" ON public.payments;
CREATE POLICY "payments_insert_own" ON public.payments
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT id FROM public.businesses WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "payments_update_own" ON public.payments;
CREATE POLICY "payments_update_own" ON public.payments
    FOR UPDATE USING (
        business_id IN (
            SELECT id FROM public.businesses WHERE user_id = auth.uid()
        )
    ) WITH CHECK (
        business_id IN (
            SELECT id FROM public.businesses WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "payments_delete_own" ON public.payments;
CREATE POLICY "payments_delete_own" ON public.payments
    FOR DELETE USING (
        business_id IN (
            SELECT id FROM public.businesses WHERE user_id = auth.uid()
        )
    );

-- ==============================================================================
-- EXPENSES POLICIES (Scoped through business.user_id = auth.uid())
-- ==============================================================================
DROP POLICY IF EXISTS "expenses_select_own" ON public.expenses;
CREATE POLICY "expenses_select_own" ON public.expenses
    FOR SELECT USING (
        business_id IN (
            SELECT id FROM public.businesses WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "expenses_insert_own" ON public.expenses;
CREATE POLICY "expenses_insert_own" ON public.expenses
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT id FROM public.businesses WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "expenses_update_own" ON public.expenses;
CREATE POLICY "expenses_update_own" ON public.expenses
    FOR UPDATE USING (
        business_id IN (
            SELECT id FROM public.businesses WHERE user_id = auth.uid()
        )
    ) WITH CHECK (
        business_id IN (
            SELECT id FROM public.businesses WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "expenses_delete_own" ON public.expenses;
CREATE POLICY "expenses_delete_own" ON public.expenses
    FOR DELETE USING (
        business_id IN (
            SELECT id FROM public.businesses WHERE user_id = auth.uid()
        )
    );

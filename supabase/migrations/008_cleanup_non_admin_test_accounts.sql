-- ============================================================================
-- BIZPILOTLY MIGRATION 008: Safe Test Account Reset (Preserving Admin)
-- ============================================================================

-- Function to safely purge non-admin test accounts and cascade clean data
CREATE OR REPLACE FUNCTION public.cleanup_test_accounts(preserve_admin_email TEXT DEFAULT NULL)
RETURNS TABLE (
    deleted_users_count INT,
    preserved_admin_count INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted_count INT := 0;
    v_preserved_count INT := 0;
    v_admin_ids UUID[];
BEGIN
    -- 1. Identify all admin user IDs from user_roles
    SELECT ARRAY_AGG(user_id)
    INTO v_admin_ids
    FROM public.user_roles
    WHERE role IN ('admin', 'super_admin');

    -- If a specific admin email is also specified, ensure that user ID is protected
    IF preserve_admin_email IS NOT NULL AND preserve_admin_email <> '' THEN
        v_admin_ids := ARRAY(
            SELECT DISTINCT unnest(v_admin_ids || ARRAY(
                SELECT id FROM auth.users WHERE email ILIKE preserve_admin_email
            ))
        );
    END IF;

    -- Count preserved admin users
    SELECT COUNT(*)
    INTO v_preserved_count
    FROM auth.users
    WHERE id = ANY(v_admin_ids);

    -- 2. Delete non-admin user accounts from auth.users (cascades cleanly through public tables)
    WITH deleted AS (
        DELETE FROM auth.users
        WHERE NOT (id = ANY(v_admin_ids))
        RETURNING id
    )
    SELECT COUNT(*) INTO v_deleted_count FROM deleted;

    -- 3. Record platform audit log for cleanup event
    INSERT INTO public.admin_audit_logs (
        actor_user_id,
        action,
        target_type,
        metadata
    )
    SELECT 
        COALESCE(v_admin_ids[1], gen_random_uuid()),
        'TEST_ACCOUNTS_RESET',
        'SYSTEM_MAINTENANCE',
        jsonb_build_object(
            'deleted_count', v_deleted_count,
            'preserved_admin_count', v_preserved_count,
            'executed_at', NOW()
        )
    WHERE ARRAY_LENGTH(v_admin_ids, 1) > 0;

    RETURN QUERY SELECT v_deleted_count, v_preserved_count;
END;
$$;

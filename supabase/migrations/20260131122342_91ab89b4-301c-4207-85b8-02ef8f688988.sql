-- Allow admin users to review share token access logs without opening access to regular users.
-- The current "No direct * access" policies are RESTRICTIVE and permanently deny access.
-- With RLS enabled, dropping those deny-all policies keeps default-deny behavior.

-- Ensure RLS is enabled (should already be enabled, but keep idempotent)
ALTER TABLE public.share_token_access_log ENABLE ROW LEVEL SECURITY;

-- Remove deny-all policies (SELECT/INSERT/UPDATE/DELETE). Default-deny will still apply.
DROP POLICY IF EXISTS "No direct read access" ON public.share_token_access_log;
DROP POLICY IF EXISTS "No direct insert access" ON public.share_token_access_log;
DROP POLICY IF EXISTS "No direct update access" ON public.share_token_access_log;
DROP POLICY IF EXISTS "No direct delete access" ON public.share_token_access_log;

-- Grant SELECT only to admins (checked via SECURITY DEFINER function)
CREATE POLICY "Admins can view share token access logs"
ON public.share_token_access_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

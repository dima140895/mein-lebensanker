-- Fix RLS policies for profiles table
-- The issue: policies are RESTRICTIVE (can only deny) instead of PERMISSIVE (can grant)
-- This means no SELECT access is being granted properly

-- Drop and recreate the profiles SELECT policy as PERMISSIVE (default)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Fix RLS policies for person_profiles table
DROP POLICY IF EXISTS "Users can view their own person profiles" ON public.person_profiles;
CREATE POLICY "Users can view their own person profiles"
ON public.person_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Fix RLS policies for share_token_access_log table
-- Only admins should be able to view access logs
DROP POLICY IF EXISTS "Admins can view share token access logs" ON public.share_token_access_log;
CREATE POLICY "Admins can view share token access logs"
ON public.share_token_access_log
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
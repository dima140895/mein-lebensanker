-- Re-enable FORCE RLS on all tables
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.person_profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.vorsorge_data FORCE ROW LEVEL SECURITY;
ALTER TABLE public.share_tokens FORCE ROW LEVEL SECURITY;
ALTER TABLE public.share_token_access_log FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles FORCE ROW LEVEL SECURITY;

-- Fix 1: profiles INSERT policy
-- handle_new_user trigger runs as SECURITY DEFINER (postgres role) where auth.uid() is NULL
-- Allow privileged roles (triggers/SECURITY DEFINER) to insert if user_id is set
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  OR (user_id IS NOT NULL AND current_user NOT IN ('anon', 'authenticated'))
);

-- Fix 2: share_token_access_log INSERT policy
-- validate_share_token and validate_share_token_with_pin (SECURITY DEFINER) need to insert logs
-- Only allow inserts from privileged roles (SECURITY DEFINER functions)
DROP POLICY IF EXISTS "Deny user inserts to access log" ON public.share_token_access_log;
CREATE POLICY "System can insert access logs"
ON public.share_token_access_log FOR INSERT
WITH CHECK (
  current_user NOT IN ('anon', 'authenticated')
);
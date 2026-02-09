
-- Fix: Convert user access policies from RESTRICTIVE to PERMISSIVE on all tables.
-- PostgreSQL requires at least one PERMISSIVE policy to grant access;
-- RESTRICTIVE policies only further restrict. With all RESTRICTIVE, nothing passes.

-- ============ vorsorge_data ============
DROP POLICY IF EXISTS "Users can view their own data" ON public.vorsorge_data;
CREATE POLICY "Users can view their own data"
ON public.vorsorge_data FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own data" ON public.vorsorge_data;
CREATE POLICY "Users can insert their own data"
ON public.vorsorge_data FOR INSERT TO authenticated
WITH CHECK (
  (auth.uid() = user_id) AND (
    (section_key = '_encryption_verifier'::text) OR
    (user_has_access(auth.uid()) AND (
      (person_profile_id IS NULL) OR
      (EXISTS (SELECT 1 FROM person_profiles WHERE person_profiles.id = vorsorge_data.person_profile_id AND person_profiles.user_id = auth.uid()))
    ))
  )
);

DROP POLICY IF EXISTS "Users can update their own data" ON public.vorsorge_data;
CREATE POLICY "Users can update their own data"
ON public.vorsorge_data FOR UPDATE TO authenticated
USING (
  (auth.uid() = user_id) AND (
    (section_key = '_encryption_verifier'::text) OR
    (user_has_access(auth.uid()) AND (
      (person_profile_id IS NULL) OR
      (EXISTS (SELECT 1 FROM person_profiles WHERE person_profiles.id = vorsorge_data.person_profile_id AND person_profiles.user_id = auth.uid()))
    ))
  )
);

DROP POLICY IF EXISTS "Users can delete their own data" ON public.vorsorge_data;
CREATE POLICY "Users can delete their own data"
ON public.vorsorge_data FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- ============ profiles ============
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
CREATE POLICY "Users can delete their own profile"
ON public.profiles FOR DELETE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  OR (user_id IS NOT NULL AND current_user NOT IN ('anon', 'authenticated'))
);

-- ============ person_profiles ============
DROP POLICY IF EXISTS "Users can view their own person profiles" ON public.person_profiles;
CREATE POLICY "Users can view their own person profiles"
ON public.person_profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own person profiles" ON public.person_profiles;
CREATE POLICY "Users can create their own person profiles"
ON public.person_profiles FOR INSERT TO authenticated
WITH CHECK ((auth.uid() = user_id) AND user_has_access(auth.uid()));

DROP POLICY IF EXISTS "Users can update their own person profiles" ON public.person_profiles;
CREATE POLICY "Users can update their own person profiles"
ON public.person_profiles FOR UPDATE TO authenticated
USING ((auth.uid() = user_id) AND user_has_access(auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own person profiles" ON public.person_profiles;
CREATE POLICY "Users can delete their own person profiles"
ON public.person_profiles FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- ============ share_tokens ============
DROP POLICY IF EXISTS "Users can view their own share tokens" ON public.share_tokens;
CREATE POLICY "Users can view their own share tokens"
ON public.share_tokens FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own share tokens" ON public.share_tokens;
CREATE POLICY "Users can create their own share tokens"
ON public.share_tokens FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own share tokens" ON public.share_tokens;
CREATE POLICY "Users can update their own share tokens"
ON public.share_tokens FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own share tokens" ON public.share_tokens;
CREATE POLICY "Users can delete their own share tokens"
ON public.share_tokens FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- ============ user_roles ============
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- ============ share_token_access_log ============
DROP POLICY IF EXISTS "Admins can view share token access logs" ON public.share_token_access_log;
CREATE POLICY "Admins can view share token access logs"
ON public.share_token_access_log FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can view access logs for their own tokens" ON public.share_token_access_log;
CREATE POLICY "Users can view access logs for their own tokens"
ON public.share_token_access_log FOR SELECT TO authenticated
USING (user_owns_token_hash(auth.uid(), token_hash));

DROP POLICY IF EXISTS "System can insert access logs" ON public.share_token_access_log;
CREATE POLICY "System can insert access logs"
ON public.share_token_access_log FOR INSERT
WITH CHECK (current_user NOT IN ('anon', 'authenticated'));

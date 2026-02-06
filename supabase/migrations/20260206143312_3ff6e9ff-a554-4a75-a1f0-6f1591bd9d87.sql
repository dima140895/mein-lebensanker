
-- ============================================================
-- Fix: Convert all RESTRICTIVE "allow" RLS policies to PERMISSIVE
-- Ensures proper access control for all tables
-- ============================================================

-- ==================== profiles ====================
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ==================== person_profiles ====================
DROP POLICY IF EXISTS "Users can view their own person profiles" ON public.person_profiles;
DROP POLICY IF EXISTS "Users can create their own person profiles" ON public.person_profiles;
DROP POLICY IF EXISTS "Users can update their own person profiles" ON public.person_profiles;
DROP POLICY IF EXISTS "Users can delete their own person profiles" ON public.person_profiles;

CREATE POLICY "Users can view their own person profiles"
  ON public.person_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own person profiles"
  ON public.person_profiles FOR INSERT
  TO authenticated
  WITH CHECK ((auth.uid() = user_id) AND user_has_access(auth.uid()));

CREATE POLICY "Users can update their own person profiles"
  ON public.person_profiles FOR UPDATE
  TO authenticated
  USING ((auth.uid() = user_id) AND user_has_access(auth.uid()));

CREATE POLICY "Users can delete their own person profiles"
  ON public.person_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ==================== vorsorge_data ====================
DROP POLICY IF EXISTS "Users can view their own data" ON public.vorsorge_data;
DROP POLICY IF EXISTS "Users can insert their own data" ON public.vorsorge_data;
DROP POLICY IF EXISTS "Users can update their own data" ON public.vorsorge_data;
DROP POLICY IF EXISTS "Users can delete their own data" ON public.vorsorge_data;

CREATE POLICY "Users can view their own data"
  ON public.vorsorge_data FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own data"
  ON public.vorsorge_data FOR INSERT
  TO authenticated
  WITH CHECK ((auth.uid() = user_id) AND user_has_access(auth.uid()));

CREATE POLICY "Users can update their own data"
  ON public.vorsorge_data FOR UPDATE
  TO authenticated
  USING ((auth.uid() = user_id) AND user_has_access(auth.uid()));

CREATE POLICY "Users can delete their own data"
  ON public.vorsorge_data FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ==================== share_tokens ====================
DROP POLICY IF EXISTS "Users can view their own share tokens" ON public.share_tokens;
DROP POLICY IF EXISTS "Users can create their own share tokens" ON public.share_tokens;
DROP POLICY IF EXISTS "Users can update their own share tokens" ON public.share_tokens;
DROP POLICY IF EXISTS "Users can delete their own share tokens" ON public.share_tokens;

CREATE POLICY "Users can view their own share tokens"
  ON public.share_tokens FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own share tokens"
  ON public.share_tokens FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own share tokens"
  ON public.share_tokens FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own share tokens"
  ON public.share_tokens FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ==================== user_roles ====================
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ==================== share_token_access_log ====================
DROP POLICY IF EXISTS "Admins can view share token access logs" ON public.share_token_access_log;
DROP POLICY IF EXISTS "Users can view access logs for their own tokens" ON public.share_token_access_log;
DROP POLICY IF EXISTS "Deny all deletes to access log" ON public.share_token_access_log;
DROP POLICY IF EXISTS "Deny all updates to access log" ON public.share_token_access_log;
DROP POLICY IF EXISTS "Deny user inserts to access log" ON public.share_token_access_log;

-- PERMISSIVE SELECT policies (OR'd: admins or token owners)
CREATE POLICY "Admins can view share token access logs"
  ON public.share_token_access_log FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view access logs for their own tokens"
  ON public.share_token_access_log FOR SELECT
  TO authenticated
  USING (user_owns_token_hash(auth.uid(), token_hash));

-- RESTRICTIVE deny policies (correct syntax: AS RESTRICTIVE before FOR)
CREATE POLICY "Deny all deletes to access log"
  ON public.share_token_access_log
  AS RESTRICTIVE
  FOR DELETE
  USING (false);

CREATE POLICY "Deny all updates to access log"
  ON public.share_token_access_log
  AS RESTRICTIVE
  FOR UPDATE
  USING (false);

CREATE POLICY "Deny user inserts to access log"
  ON public.share_token_access_log
  AS RESTRICTIVE
  FOR INSERT
  WITH CHECK (false);

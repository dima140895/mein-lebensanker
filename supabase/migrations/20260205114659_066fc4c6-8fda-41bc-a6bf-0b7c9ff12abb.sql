-- Enable pgcrypto extension for digest function
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Recreate the helper function with correct syntax
CREATE OR REPLACE FUNCTION public.user_owns_token_hash(_user_id uuid, _token_hash text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.share_tokens
    WHERE user_id = _user_id
      AND encode(extensions.digest(token::bytea, 'sha256'), 'hex') = _token_hash
  )
$$;

-- Add policy for users to view their own token access logs
DROP POLICY IF EXISTS "Users can view access logs for their own tokens" ON public.share_token_access_log;

CREATE POLICY "Users can view access logs for their own tokens"
ON public.share_token_access_log
FOR SELECT
TO authenticated
USING (public.user_owns_token_hash(auth.uid(), token_hash));
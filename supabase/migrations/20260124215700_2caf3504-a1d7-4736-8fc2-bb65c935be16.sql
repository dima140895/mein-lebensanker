-- Add RLS policy for admins to bypass payment check on profiles
-- This ensures admin privileges are enforced server-side, not just client-side

-- First, create a helper function to check if user has paid OR is admin
CREATE OR REPLACE FUNCTION public.user_has_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE(
      (SELECT has_paid FROM public.profiles WHERE user_id = _user_id),
      false
    )
    OR 
    public.has_role(_user_id, 'admin')
$$;

-- Set default expiration for share_tokens to 90 days from creation
-- This ensures tokens expire by default for better security
ALTER TABLE public.share_tokens 
  ALTER COLUMN expires_at SET DEFAULT (now() + interval '90 days');

-- Update the validate_share_token function to also check is_active
CREATE OR REPLACE FUNCTION public.validate_share_token(_token text)
RETURNS TABLE(user_id uuid, is_valid boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    st.user_id,
    (st.is_active = true AND (st.expires_at IS NULL OR st.expires_at > now())) AS is_valid
  FROM public.share_tokens st
  WHERE st.token = _token;
END;
$$;
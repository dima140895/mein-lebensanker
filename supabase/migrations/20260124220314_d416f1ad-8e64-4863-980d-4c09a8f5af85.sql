-- Create audit log table for token access attempts
CREATE TABLE public.share_token_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL, -- Store hash of token, not token itself for security
  accessed_at timestamp with time zone NOT NULL DEFAULT now(),
  was_valid boolean NOT NULL,
  was_rate_limited boolean NOT NULL DEFAULT false
);

-- Create index for efficient rate limit queries
CREATE INDEX idx_token_access_log_hash_time 
ON public.share_token_access_log(token_hash, accessed_at DESC);

-- Enable RLS (no policies needed - only accessed via SECURITY DEFINER functions)
ALTER TABLE public.share_token_access_log ENABLE ROW LEVEL SECURITY;

-- Update validate function with rate limiting and audit logging
CREATE OR REPLACE FUNCTION public.validate_share_token(_token text)
RETURNS TABLE(user_id uuid, is_valid boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _token_hash text;
  _recent_attempts int;
  _result_user_id uuid;
  _result_is_valid boolean;
BEGIN
  -- Create hash of token for logging (never log actual token)
  _token_hash := encode(sha256(_token::bytea), 'hex');
  
  -- Check rate limit: max 10 attempts per token hash per minute
  SELECT COUNT(*) INTO _recent_attempts
  FROM public.share_token_access_log
  WHERE token_hash = _token_hash
    AND accessed_at > now() - interval '1 minute';
  
  IF _recent_attempts >= 10 THEN
    -- Log the rate-limited attempt
    INSERT INTO public.share_token_access_log (token_hash, was_valid, was_rate_limited)
    VALUES (_token_hash, false, true);
    
    -- Return empty result (rate limited)
    RETURN;
  END IF;
  
  -- Perform the actual validation
  SELECT 
    st.user_id,
    (st.is_active = true AND (st.expires_at IS NULL OR st.expires_at > now()))
  INTO _result_user_id, _result_is_valid
  FROM public.share_tokens st
  WHERE st.token = _token;
  
  -- Log the access attempt
  INSERT INTO public.share_token_access_log (token_hash, was_valid, was_rate_limited)
  VALUES (_token_hash, COALESCE(_result_is_valid, false), false);
  
  -- Return result only if token exists
  IF _result_user_id IS NOT NULL THEN
    RETURN QUERY SELECT _result_user_id, _result_is_valid;
  END IF;
END;
$$;

-- Cleanup function for old audit logs (keeps last 30 days)
CREATE OR REPLACE FUNCTION public.cleanup_token_access_logs()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.share_token_access_log
  WHERE accessed_at < now() - interval '30 days';
$$;
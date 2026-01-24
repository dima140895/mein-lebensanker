-- Add PIN column to share_tokens table
ALTER TABLE public.share_tokens 
ADD COLUMN pin_hash text NULL;

-- Create function to hash PIN (using pgcrypto)
CREATE OR REPLACE FUNCTION public.hash_pin(_pin text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT encode(sha256(_pin::bytea), 'hex')
$$;

-- Create function to validate token with PIN
CREATE OR REPLACE FUNCTION public.validate_share_token_with_pin(_token text, _pin text)
RETURNS TABLE(user_id uuid, is_valid boolean, requires_pin boolean, pin_valid boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _token_hash text;
  _recent_attempts int;
  _result_user_id uuid;
  _result_is_valid boolean;
  _stored_pin_hash text;
  _requires_pin boolean;
  _pin_valid boolean;
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
    (st.is_active = true AND (st.expires_at IS NULL OR st.expires_at > now())),
    st.pin_hash
  INTO _result_user_id, _result_is_valid, _stored_pin_hash
  FROM public.share_tokens st
  WHERE st.token = _token;
  
  -- Determine if PIN is required
  _requires_pin := _stored_pin_hash IS NOT NULL;
  
  -- Check PIN if required
  IF _requires_pin AND _pin IS NOT NULL THEN
    _pin_valid := (_stored_pin_hash = public.hash_pin(_pin));
  ELSIF _requires_pin AND _pin IS NULL THEN
    _pin_valid := false;
  ELSE
    _pin_valid := true; -- No PIN required
  END IF;
  
  -- Log the access attempt
  INSERT INTO public.share_token_access_log (token_hash, was_valid, was_rate_limited)
  VALUES (_token_hash, COALESCE(_result_is_valid AND _pin_valid, false), false);
  
  -- Return result only if token exists
  IF _result_user_id IS NOT NULL THEN
    RETURN QUERY SELECT _result_user_id, _result_is_valid, _requires_pin, _pin_valid;
  END IF;
END;
$$;
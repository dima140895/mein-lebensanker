-- Add failed_attempts column to share_tokens table
ALTER TABLE public.share_tokens ADD COLUMN IF NOT EXISTS failed_attempts integer NOT NULL DEFAULT 0;

-- Update validate_share_token_with_pin function to handle 6-digit PIN and 3-attempt lockout
CREATE OR REPLACE FUNCTION public.validate_share_token_with_pin(_token text, _pin text)
 RETURNS TABLE(user_id uuid, is_valid boolean, requires_pin boolean, pin_valid boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _token_hash text;
  _recent_attempts int;
  _result_user_id uuid;
  _result_is_valid boolean;
  _stored_pin_hash text;
  _requires_pin boolean;
  _pin_valid boolean;
  _token_id uuid;
  _current_failed_attempts int;
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
  
  -- Perform the actual validation and get failed_attempts
  SELECT 
    st.id,
    st.user_id,
    (st.is_active = true AND (st.expires_at IS NULL OR st.expires_at > now())),
    st.pin_hash,
    st.failed_attempts
  INTO _token_id, _result_user_id, _result_is_valid, _stored_pin_hash, _current_failed_attempts
  FROM public.share_tokens st
  WHERE st.token = _token;
  
  -- If token has 3+ failed attempts, mark as invalid (locked out)
  IF _current_failed_attempts >= 3 THEN
    _result_is_valid := false;
  END IF;
  
  -- Determine if PIN is required
  _requires_pin := _stored_pin_hash IS NOT NULL;
  
  -- Check PIN if required (now 6 digits)
  IF _requires_pin AND _pin IS NOT NULL THEN
    _pin_valid := (_stored_pin_hash = public.hash_pin(_pin));
    
    -- If PIN is invalid and token exists, increment failed_attempts
    IF NOT _pin_valid AND _token_id IS NOT NULL THEN
      UPDATE public.share_tokens 
      SET failed_attempts = failed_attempts + 1,
          is_active = CASE WHEN failed_attempts + 1 >= 3 THEN false ELSE is_active END
      WHERE id = _token_id;
      
      -- Re-check if now locked out
      IF _current_failed_attempts + 1 >= 3 THEN
        _result_is_valid := false;
      END IF;
    ELSIF _pin_valid AND _token_id IS NOT NULL THEN
      -- Reset failed attempts on successful PIN entry
      UPDATE public.share_tokens 
      SET failed_attempts = 0
      WHERE id = _token_id;
    END IF;
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
$function$;
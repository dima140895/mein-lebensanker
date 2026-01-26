-- Fix: Increase rate limit from 10 to 30 attempts per minute to avoid false positives
-- when loading RelativesView (which makes multiple RPC calls in parallel)

CREATE OR REPLACE FUNCTION public.validate_share_token(_token text)
 RETURNS TABLE(user_id uuid, is_valid boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  _token_hash text;
  _recent_attempts int;
  _result_user_id uuid;
  _result_is_valid boolean;
BEGIN
  -- Create hash of token for logging (never log actual token)
  _token_hash := encode(sha256(_token::bytea), 'hex');
  
  -- Check rate limit: max 30 attempts per token hash per minute (increased from 10)
  SELECT COUNT(*) INTO _recent_attempts
  FROM public.share_token_access_log
  WHERE token_hash = _token_hash
    AND accessed_at > now() - interval '1 minute';
  
  IF _recent_attempts >= 30 THEN
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

-- Also update validate_share_token_with_pin with the same rate limit
CREATE OR REPLACE FUNCTION public.validate_share_token_with_pin(_token text, _pin text)
 RETURNS TABLE(user_id uuid, is_valid boolean, requires_pin boolean, pin_valid boolean, remaining_attempts integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  _token_hash text;
  _recent_attempts int;
  _result_user_id uuid;
  _result_is_valid boolean;
  _stored_pin_hash text;
  _stored_pin_salt text;
  _requires_pin boolean;
  _pin_valid boolean;
  _token_id uuid;
  _current_failed_attempts int;
  _remaining_attempts int;
BEGIN
  -- Create hash of token for logging (never log actual token)
  _token_hash := encode(sha256(_token::bytea), 'hex');
  
  -- Check rate limit: max 30 attempts per token hash per minute (increased from 10)
  SELECT COUNT(*) INTO _recent_attempts
  FROM public.share_token_access_log
  WHERE token_hash = _token_hash
    AND accessed_at > now() - interval '1 minute';
  
  IF _recent_attempts >= 30 THEN
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
    st.pin_salt,
    st.failed_attempts
  INTO _token_id, _result_user_id, _result_is_valid, _stored_pin_hash, _stored_pin_salt, _current_failed_attempts
  FROM public.share_tokens st
  WHERE st.token = _token;
  
  -- Calculate remaining attempts (3 max - current failed)
  _remaining_attempts := GREATEST(0, 3 - _current_failed_attempts);
  
  -- If token has 3+ failed attempts, mark as invalid (locked out)
  IF _current_failed_attempts >= 3 THEN
    _result_is_valid := false;
    _remaining_attempts := 0;
  END IF;
  
  -- Determine if PIN is required
  _requires_pin := _stored_pin_hash IS NOT NULL;
  
  -- Check PIN if required
  IF _requires_pin AND _pin IS NOT NULL THEN
    -- Use secure hash if salt exists, otherwise fall back to legacy hash
    IF _stored_pin_salt IS NOT NULL THEN
      _pin_valid := (_stored_pin_hash = public.hash_pin_secure(_pin, _stored_pin_salt));
    ELSE
      -- Legacy fallback for existing tokens without salt
      _pin_valid := (_stored_pin_hash = public.hash_pin(_pin));
    END IF;
    
    -- If PIN is invalid and token exists, increment failed_attempts
    IF NOT _pin_valid AND _token_id IS NOT NULL THEN
      UPDATE public.share_tokens 
      SET failed_attempts = failed_attempts + 1,
          is_active = CASE WHEN failed_attempts + 1 >= 3 THEN false ELSE is_active END
      WHERE id = _token_id;
      
      -- Update remaining attempts after this failure
      _remaining_attempts := GREATEST(0, 3 - (_current_failed_attempts + 1));
      
      -- Re-check if now locked out
      IF _current_failed_attempts + 1 >= 3 THEN
        _result_is_valid := false;
        _remaining_attempts := 0;
      END IF;
    ELSIF _pin_valid AND _token_id IS NOT NULL THEN
      -- Reset failed attempts on successful PIN entry
      UPDATE public.share_tokens 
      SET failed_attempts = 0
      WHERE id = _token_id;
      _remaining_attempts := 3;
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
    RETURN QUERY SELECT _result_user_id, _result_is_valid, _requires_pin, _pin_valid, _remaining_attempts;
  END IF;
END;
$$;

-- Clean up existing rate-limited entries to allow immediate access
DELETE FROM public.share_token_access_log 
WHERE was_rate_limited = true 
  AND accessed_at > now() - interval '2 minutes';
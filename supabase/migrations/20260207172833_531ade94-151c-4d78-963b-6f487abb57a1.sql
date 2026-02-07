
-- 1. Create a bcrypt-based PIN hashing function (much stronger than 10x SHA-512)
CREATE OR REPLACE FUNCTION public.hash_pin_bcrypt(_pin text, _salt text)
 RETURNS text
 LANGUAGE sql
 VOLATILE
 SET search_path TO 'public'
AS $function$
  -- bcrypt with work factor 12 (~250ms per hash, ~4 hashes/sec)
  -- Concatenate pin + salt for additional entropy before bcrypt
  SELECT extensions.crypt(_pin || _salt, extensions.gen_salt('bf', 12))
$function$;

-- 2. Update validate_share_token_with_pin to:
--    a) Support both bcrypt and legacy SHA-512 hashes
--    b) Auto-migrate legacy hashes to bcrypt on successful validation
--    c) Add random timing jitter to prevent timing attacks
CREATE OR REPLACE FUNCTION public.validate_share_token_with_pin(_token text, _pin text)
 RETURNS TABLE(user_id uuid, is_valid boolean, requires_pin boolean, pin_valid boolean, remaining_attempts integer)
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
  _stored_pin_salt text;
  _requires_pin boolean;
  _pin_valid boolean;
  _token_id uuid;
  _current_failed_attempts int;
  _remaining_attempts int;
  _is_bcrypt boolean;
BEGIN
  -- Add random jitter (50-200ms) to normalize response times and prevent timing attacks
  PERFORM pg_sleep(0.05 + random() * 0.15);

  -- Create hash of token for logging (never log actual token)
  _token_hash := encode(sha256(_token::bytea), 'hex');
  
  -- Check rate limit: max 30 attempts per token hash per minute
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
  _remaining_attempts := GREATEST(0, 3 - COALESCE(_current_failed_attempts, 0));
  
  -- If token has 3+ failed attempts, mark as invalid (locked out)
  IF COALESCE(_current_failed_attempts, 0) >= 3 THEN
    _result_is_valid := false;
    _remaining_attempts := 0;
  END IF;
  
  -- Determine if PIN is required
  _requires_pin := _stored_pin_hash IS NOT NULL;
  
  -- Check PIN if required
  IF _requires_pin AND _pin IS NOT NULL THEN
    -- Detect hash format: bcrypt hashes start with '$2'
    _is_bcrypt := (_stored_pin_hash LIKE '$2%');
    
    IF _is_bcrypt THEN
      -- Bcrypt verification
      _pin_valid := (_stored_pin_hash = extensions.crypt(_pin || COALESCE(_stored_pin_salt, ''), _stored_pin_hash));
    ELSIF _stored_pin_salt IS NOT NULL THEN
      -- Legacy secure hash with salt (10x SHA-512)
      _pin_valid := (_stored_pin_hash = public.hash_pin_secure(_pin, _stored_pin_salt));
    ELSE
      -- Legacy fallback for very old tokens without salt
      _pin_valid := (_stored_pin_hash = public.hash_pin(_pin));
    END IF;
    
    -- If PIN is invalid and token exists, increment failed_attempts
    IF NOT _pin_valid AND _token_id IS NOT NULL THEN
      UPDATE public.share_tokens 
      SET failed_attempts = failed_attempts + 1,
          is_active = CASE WHEN failed_attempts + 1 >= 3 THEN false ELSE is_active END
      WHERE id = _token_id;
      
      -- Update remaining attempts after this failure
      _remaining_attempts := GREATEST(0, 3 - (COALESCE(_current_failed_attempts, 0) + 1));
      
      -- Re-check if now locked out
      IF COALESCE(_current_failed_attempts, 0) + 1 >= 3 THEN
        _result_is_valid := false;
        _remaining_attempts := 0;
      END IF;
    ELSIF _pin_valid AND _token_id IS NOT NULL THEN
      -- Reset failed attempts on successful PIN entry
      UPDATE public.share_tokens 
      SET failed_attempts = 0
      WHERE id = _token_id;
      _remaining_attempts := 3;
      
      -- Auto-migrate legacy hash to bcrypt on successful validation
      IF NOT _is_bcrypt AND _stored_pin_salt IS NOT NULL THEN
        UPDATE public.share_tokens
        SET pin_hash = public.hash_pin_bcrypt(_pin, _stored_pin_salt)
        WHERE id = _token_id;
      END IF;
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
$function$;

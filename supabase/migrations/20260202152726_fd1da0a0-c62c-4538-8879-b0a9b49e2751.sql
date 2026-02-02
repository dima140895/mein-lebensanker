-- Update the get_encryption_info_by_token function to also return the pin_salt from the share_token
DROP FUNCTION IF EXISTS public.get_encryption_info_by_token(text, text);

CREATE OR REPLACE FUNCTION public.get_encryption_info_by_token(_token text, _pin text DEFAULT NULL::text)
 RETURNS TABLE(encryption_salt text, encrypted_password_recovery text, is_encrypted boolean, encrypted_recovery_key text, pin_salt text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _user_id UUID;
  _authorized BOOLEAN;
  _token_encrypted_recovery_key text;
  _token_pin_salt text;
BEGIN
  -- Validate token AND PIN (when configured)
  SELECT vt.user_id, (vt.is_valid AND vt.pin_valid)
  INTO _user_id, _authorized
  FROM public.validate_share_token_with_pin(_token, _pin) vt;

  IF _user_id IS NULL OR NOT COALESCE(_authorized, false) THEN
    RETURN;
  END IF;

  -- Get the encrypted_recovery_key and pin_salt from share_tokens
  SELECT st.encrypted_recovery_key, st.pin_salt 
  INTO _token_encrypted_recovery_key, _token_pin_salt
  FROM public.share_tokens st
  WHERE st.token = _token;

  RETURN QUERY
  SELECT
    p.encryption_salt,
    p.encrypted_password_recovery,
    COALESCE(p.is_encrypted, false) AS is_encrypted,
    _token_encrypted_recovery_key AS encrypted_recovery_key,
    _token_pin_salt AS pin_salt
  FROM public.profiles p
  WHERE p.user_id = _user_id;
END;
$function$;
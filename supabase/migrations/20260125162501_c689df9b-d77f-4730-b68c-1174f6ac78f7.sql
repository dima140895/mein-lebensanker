-- Function to get encryption info by token (for relatives to decrypt data)
CREATE OR REPLACE FUNCTION public.get_encryption_info_by_token(_token text)
RETURNS TABLE(encryption_salt text, encrypted_password_recovery text, is_encrypted boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _is_valid BOOLEAN;
BEGIN
  -- Validate token first
  SELECT vt.user_id, vt.is_valid INTO _user_id, _is_valid
  FROM public.validate_share_token(_token) vt;
  
  IF _user_id IS NULL OR NOT _is_valid THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    p.encryption_salt,
    p.encrypted_password_recovery,
    COALESCE(p.is_encrypted, false) as is_encrypted
  FROM public.profiles p
  WHERE p.user_id = _user_id;
END;
$$;
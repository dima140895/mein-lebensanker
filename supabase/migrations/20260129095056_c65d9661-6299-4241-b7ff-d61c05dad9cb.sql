-- Require PIN for token-based access when a share token has a PIN set.
-- This prevents bypassing the PIN by directly calling token RPCs.

CREATE OR REPLACE FUNCTION public.get_encryption_info_by_token(_token text, _pin text DEFAULT NULL)
RETURNS TABLE(encryption_salt text, encrypted_password_recovery text, is_encrypted boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _user_id UUID;
  _authorized BOOLEAN;
BEGIN
  -- Validate token AND PIN (when configured)
  SELECT vt.user_id, (vt.is_valid AND vt.pin_valid)
  INTO _user_id, _authorized
  FROM public.validate_share_token_with_pin(_token, _pin) vt;

  IF _user_id IS NULL OR NOT COALESCE(_authorized, false) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    p.encryption_salt,
    p.encrypted_password_recovery,
    COALESCE(p.is_encrypted, false) AS is_encrypted
  FROM public.profiles p
  WHERE p.user_id = _user_id;
END;
$function$;


CREATE OR REPLACE FUNCTION public.get_shared_sections_by_token(_token text, _pin text DEFAULT NULL)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _user_id UUID;
  _authorized BOOLEAN;
  _shared_sections text[];
BEGIN
  SELECT vt.user_id, (vt.is_valid AND vt.pin_valid)
  INTO _user_id, _authorized
  FROM public.validate_share_token_with_pin(_token, _pin) vt;

  IF _user_id IS NULL OR NOT COALESCE(_authorized, false) THEN
    RETURN NULL;
  END IF;

  SELECT st.shared_sections INTO _shared_sections
  FROM public.share_tokens st
  WHERE st.token = _token;

  RETURN _shared_sections;
END;
$function$;


CREATE OR REPLACE FUNCTION public.get_profiles_by_token(_token text, _pin text DEFAULT NULL)
RETURNS TABLE(profile_id uuid, profile_name text, birth_date date)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _user_id UUID;
  _authorized BOOLEAN;
  _shared_profile_ids uuid[];
  _shared_profile_sections jsonb;
BEGIN
  SELECT vt.user_id, (vt.is_valid AND vt.pin_valid)
  INTO _user_id, _authorized
  FROM public.validate_share_token_with_pin(_token, _pin) vt;

  IF _user_id IS NULL OR NOT COALESCE(_authorized, false) THEN
    RETURN;
  END IF;

  SELECT st.shared_profile_ids, st.shared_profile_sections
  INTO _shared_profile_ids, _shared_profile_sections
  FROM public.share_tokens st
  WHERE st.token = _token;

  IF _shared_profile_sections IS NOT NULL AND _shared_profile_sections != '{}'::jsonb THEN
    RETURN QUERY
    SELECT
      pp.id AS profile_id,
      pp.name AS profile_name,
      pp.birth_date
    FROM public.person_profiles pp
    WHERE pp.user_id = _user_id
      AND _shared_profile_sections ? pp.id::text
    ORDER BY pp.created_at ASC;
  ELSE
    RETURN QUERY
    SELECT
      pp.id AS profile_id,
      pp.name AS profile_name,
      pp.birth_date
    FROM public.person_profiles pp
    WHERE pp.user_id = _user_id
      AND (
        _shared_profile_ids IS NULL
        OR array_length(_shared_profile_ids, 1) IS NULL
        OR pp.id = ANY(_shared_profile_ids)
      )
    ORDER BY pp.created_at ASC;
  END IF;
END;
$function$;


CREATE OR REPLACE FUNCTION public.get_vorsorge_data_by_token(_token text, _pin text DEFAULT NULL)
RETURNS TABLE(section_key text, data jsonb, is_for_partner boolean, person_profile_id uuid, profile_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _user_id UUID;
  _authorized BOOLEAN;
  _shared_sections text[];
  _shared_profile_ids uuid[];
  _shared_profile_sections jsonb;
BEGIN
  SELECT vt.user_id, (vt.is_valid AND vt.pin_valid)
  INTO _user_id, _authorized
  FROM public.validate_share_token_with_pin(_token, _pin) vt;

  IF _user_id IS NULL OR NOT COALESCE(_authorized, false) THEN
    RETURN;
  END IF;

  SELECT st.shared_sections, st.shared_profile_ids, st.shared_profile_sections
  INTO _shared_sections, _shared_profile_ids, _shared_profile_sections
  FROM public.share_tokens st
  WHERE st.token = _token;

  IF _shared_profile_sections IS NOT NULL AND _shared_profile_sections != '{}'::jsonb THEN
    RETURN QUERY
    SELECT
      vd.section_key,
      vd.data,
      COALESCE(vd.is_for_partner, false) AS is_for_partner,
      vd.person_profile_id,
      pp.name AS profile_name
    FROM public.vorsorge_data vd
    LEFT JOIN public.person_profiles pp ON pp.id = vd.person_profile_id
    WHERE vd.user_id = _user_id
      AND vd.person_profile_id IS NOT NULL
      AND _shared_profile_sections ? vd.person_profile_id::text
      AND vd.section_key = ANY(
        SELECT jsonb_array_elements_text(_shared_profile_sections -> vd.person_profile_id::text)
      );
  ELSE
    RETURN QUERY
    SELECT
      vd.section_key,
      vd.data,
      COALESCE(vd.is_for_partner, false) AS is_for_partner,
      vd.person_profile_id,
      pp.name AS profile_name
    FROM public.vorsorge_data vd
    LEFT JOIN public.person_profiles pp ON pp.id = vd.person_profile_id
    WHERE vd.user_id = _user_id
      AND vd.section_key = ANY(_shared_sections)
      AND (
        _shared_profile_ids IS NULL
        OR array_length(_shared_profile_ids, 1) IS NULL
        OR vd.person_profile_id = ANY(_shared_profile_ids)
      );
  END IF;
END;
$function$;


CREATE OR REPLACE FUNCTION public.get_shared_profile_sections_by_token(_token text, _pin text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _owner_user_id UUID;
  _authorized BOOLEAN;
  _shared_profile_sections jsonb;
  _shared_sections text[];
  _shared_profile_ids uuid[];
  _result jsonb;
  _pp_id uuid;
BEGIN
  SELECT vt.user_id, (vt.is_valid AND vt.pin_valid)
  INTO _owner_user_id, _authorized
  FROM public.validate_share_token_with_pin(_token, _pin) vt;

  IF _owner_user_id IS NULL OR NOT COALESCE(_authorized, false) THEN
    RETURN NULL;
  END IF;

  SELECT st.shared_sections, st.shared_profile_ids, st.shared_profile_sections
  INTO _shared_sections, _shared_profile_ids, _shared_profile_sections
  FROM public.share_tokens st
  WHERE st.token = _token;

  IF _shared_profile_sections IS NOT NULL AND _shared_profile_sections != '{}'::jsonb THEN
    RETURN _shared_profile_sections;
  END IF;

  _result := '{}'::jsonb;

  FOR _pp_id IN
    SELECT pp.id
    FROM public.person_profiles pp
    WHERE pp.user_id = _owner_user_id
      AND (
        _shared_profile_ids IS NULL
        OR array_length(_shared_profile_ids, 1) IS NULL
        OR pp.id = ANY(_shared_profile_ids)
      )
  LOOP
    _result := _result || jsonb_build_object(_pp_id::text, to_jsonb(_shared_sections));
  END LOOP;

  RETURN _result;
END;
$function$;


CREATE OR REPLACE FUNCTION public.get_profile_by_token(_token text, _pin text DEFAULT NULL)
RETURNS TABLE(full_name text, partner_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _user_id UUID;
  _authorized BOOLEAN;
BEGIN
  SELECT vt.user_id, (vt.is_valid AND vt.pin_valid)
  INTO _user_id, _authorized
  FROM public.validate_share_token_with_pin(_token, _pin) vt;

  IF _user_id IS NULL OR NOT COALESCE(_authorized, false) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT p.full_name, p.partner_name
  FROM public.profiles p
  WHERE p.user_id = _user_id;
END;
$function$;

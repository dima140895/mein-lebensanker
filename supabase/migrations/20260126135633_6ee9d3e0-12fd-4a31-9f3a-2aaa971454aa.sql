-- Add a new JSONB column to store per-profile section permissions
-- Structure: { "profile_id": ["section1", "section2"], ... }
ALTER TABLE public.share_tokens
ADD COLUMN shared_profile_sections jsonb NULL;

-- Add a comment explaining the column
COMMENT ON COLUMN public.share_tokens.shared_profile_sections IS 'JSONB mapping of profile_id to array of sections that should be shared for that profile. If NULL, uses legacy shared_sections/shared_profile_ids columns.';

-- Update get_vorsorge_data_by_token to support the new per-profile sections structure
CREATE OR REPLACE FUNCTION public.get_vorsorge_data_by_token(_token text)
 RETURNS TABLE(section_key text, data jsonb, is_for_partner boolean, person_profile_id uuid, profile_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _user_id UUID;
  _is_valid BOOLEAN;
  _shared_sections text[];
  _shared_profile_ids uuid[];
  _shared_profile_sections jsonb;
BEGIN
  -- Validate token first
  SELECT vt.user_id, vt.is_valid INTO _user_id, _is_valid
  FROM public.validate_share_token(_token) vt;
  
  IF _user_id IS NULL OR NOT _is_valid THEN
    RETURN;
  END IF;
  
  -- Get shared sections, profile IDs, and per-profile sections for this token
  SELECT st.shared_sections, st.shared_profile_ids, st.shared_profile_sections 
  INTO _shared_sections, _shared_profile_ids, _shared_profile_sections
  FROM public.share_tokens st
  WHERE st.token = _token;
  
  -- If new per-profile sections structure exists, use it
  IF _shared_profile_sections IS NOT NULL AND _shared_profile_sections != '{}'::jsonb THEN
    RETURN QUERY
    SELECT 
      vd.section_key, 
      vd.data, 
      COALESCE(vd.is_for_partner, false) as is_for_partner,
      vd.person_profile_id,
      pp.name as profile_name
    FROM public.vorsorge_data vd
    LEFT JOIN public.person_profiles pp ON pp.id = vd.person_profile_id
    WHERE vd.user_id = _user_id
      AND vd.person_profile_id IS NOT NULL
      AND _shared_profile_sections ? vd.person_profile_id::text
      AND vd.section_key = ANY(
        SELECT jsonb_array_elements_text(_shared_profile_sections -> vd.person_profile_id::text)
      );
  ELSE
    -- Legacy behavior: use shared_sections and shared_profile_ids
    RETURN QUERY
    SELECT 
      vd.section_key, 
      vd.data, 
      COALESCE(vd.is_for_partner, false) as is_for_partner,
      vd.person_profile_id,
      pp.name as profile_name
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

-- Update get_profiles_by_token to support the new per-profile sections structure
CREATE OR REPLACE FUNCTION public.get_profiles_by_token(_token text)
 RETURNS TABLE(profile_id uuid, profile_name text, birth_date date)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _user_id UUID;
  _is_valid BOOLEAN;
  _shared_profile_ids uuid[];
  _shared_profile_sections jsonb;
BEGIN
  -- Validate token first
  SELECT vt.user_id, vt.is_valid INTO _user_id, _is_valid
  FROM public.validate_share_token(_token) vt;
  
  IF _user_id IS NULL OR NOT _is_valid THEN
    RETURN;
  END IF;
  
  -- Get shared profile IDs and per-profile sections for this token
  SELECT st.shared_profile_ids, st.shared_profile_sections 
  INTO _shared_profile_ids, _shared_profile_sections
  FROM public.share_tokens st
  WHERE st.token = _token;
  
  -- If new per-profile sections structure exists, use it
  IF _shared_profile_sections IS NOT NULL AND _shared_profile_sections != '{}'::jsonb THEN
    RETURN QUERY
    SELECT 
      pp.id as profile_id,
      pp.name as profile_name,
      pp.birth_date
    FROM public.person_profiles pp
    WHERE pp.user_id = _user_id
      AND _shared_profile_sections ? pp.id::text
    ORDER BY pp.created_at ASC;
  ELSE
    -- Legacy behavior: use shared_profile_ids
    RETURN QUERY
    SELECT 
      pp.id as profile_id,
      pp.name as profile_name,
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

-- Create a new function to get shared sections per profile (for documents edge function)
CREATE OR REPLACE FUNCTION public.get_shared_profile_sections_by_token(_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _user_id UUID;
  _is_valid BOOLEAN;
  _shared_profile_sections jsonb;
  _shared_sections text[];
  _shared_profile_ids uuid[];
  _result jsonb;
BEGIN
  -- Validate token first
  SELECT vt.user_id, vt.is_valid INTO _user_id, _is_valid
  FROM public.validate_share_token(_token) vt;
  
  IF _user_id IS NULL OR NOT _is_valid THEN
    RETURN NULL;
  END IF;
  
  -- Get token settings
  SELECT st.shared_sections, st.shared_profile_ids, st.shared_profile_sections 
  INTO _shared_sections, _shared_profile_ids, _shared_profile_sections
  FROM public.share_tokens st
  WHERE st.token = _token;
  
  -- If new structure exists, return it
  IF _shared_profile_sections IS NOT NULL AND _shared_profile_sections != '{}'::jsonb THEN
    RETURN _shared_profile_sections;
  END IF;
  
  -- Build legacy structure from old columns
  _result := '{}'::jsonb;
  
  -- Get all applicable profiles
  FOR _user_id IN 
    SELECT pp.id FROM public.person_profiles pp
    WHERE pp.user_id = _user_id
      AND (
        _shared_profile_ids IS NULL 
        OR array_length(_shared_profile_ids, 1) IS NULL 
        OR pp.id = ANY(_shared_profile_ids)
      )
  LOOP
    _result := _result || jsonb_build_object(_user_id::text, to_jsonb(_shared_sections));
  END LOOP;
  
  RETURN _result;
END;
$function$;
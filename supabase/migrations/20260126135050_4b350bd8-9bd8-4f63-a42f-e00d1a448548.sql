-- Add shared_profile_ids column to share_tokens table
-- This allows users to specify which profile's data should be shared
ALTER TABLE public.share_tokens
ADD COLUMN shared_profile_ids uuid[] NULL;

-- Add a comment explaining the column
COMMENT ON COLUMN public.share_tokens.shared_profile_ids IS 'Array of person_profile IDs whose data should be shared. If NULL, all profiles are shared.';

-- Update the get_vorsorge_data_by_token function to filter by shared profiles
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
BEGIN
  -- Validate token first
  SELECT vt.user_id, vt.is_valid INTO _user_id, _is_valid
  FROM public.validate_share_token(_token) vt;
  
  IF _user_id IS NULL OR NOT _is_valid THEN
    RETURN;
  END IF;
  
  -- Get shared sections and profile IDs for this token
  SELECT st.shared_sections, st.shared_profile_ids INTO _shared_sections, _shared_profile_ids
  FROM public.share_tokens st
  WHERE st.token = _token;
  
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
END;
$function$;

-- Update the get_profiles_by_token function to filter by shared profiles
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
BEGIN
  -- Validate token first
  SELECT vt.user_id, vt.is_valid INTO _user_id, _is_valid
  FROM public.validate_share_token(_token) vt;
  
  IF _user_id IS NULL OR NOT _is_valid THEN
    RETURN;
  END IF;
  
  -- Get shared profile IDs for this token
  SELECT st.shared_profile_ids INTO _shared_profile_ids
  FROM public.share_tokens st
  WHERE st.token = _token;
  
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
END;
$function$;
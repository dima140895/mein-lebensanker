-- Drop existing functions first
DROP FUNCTION IF EXISTS public.get_vorsorge_data_by_token(text);
DROP FUNCTION IF EXISTS public.get_profile_by_token(text);

-- Create improved function to get vorsorge data with person_profile_id
CREATE OR REPLACE FUNCTION public.get_vorsorge_data_by_token(_token text)
RETURNS TABLE(
  section_key text,
  data jsonb,
  is_for_partner boolean,
  person_profile_id uuid,
  profile_name text
)
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
    vd.section_key, 
    vd.data, 
    COALESCE(vd.is_for_partner, false) as is_for_partner,
    vd.person_profile_id,
    pp.name as profile_name
  FROM public.vorsorge_data vd
  LEFT JOIN public.person_profiles pp ON pp.id = vd.person_profile_id
  WHERE vd.user_id = _user_id;
END;
$$;

-- Create improved function to get all person profiles by token
CREATE OR REPLACE FUNCTION public.get_profiles_by_token(_token text)
RETURNS TABLE(
  profile_id uuid,
  profile_name text,
  birth_date date
)
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
    pp.id as profile_id,
    pp.name as profile_name,
    pp.birth_date
  FROM public.person_profiles pp
  WHERE pp.user_id = _user_id
  ORDER BY pp.created_at ASC;
END;
$$;

-- Keep the old function for backwards compatibility
CREATE OR REPLACE FUNCTION public.get_profile_by_token(_token text)
RETURNS TABLE(
  full_name text,
  partner_name text
)
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
  SELECT p.full_name, p.partner_name
  FROM public.profiles p
  WHERE p.user_id = _user_id;
END;
$$;
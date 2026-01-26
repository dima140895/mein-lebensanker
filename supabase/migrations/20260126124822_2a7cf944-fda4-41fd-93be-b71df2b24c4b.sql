-- Add column to store which sections are shared per token
ALTER TABLE public.share_tokens 
ADD COLUMN shared_sections text[] DEFAULT ARRAY['personal', 'assets', 'digital', 'wishes', 'documents', 'contacts'];

-- Update the function to filter by shared sections
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
BEGIN
  -- Validate token first
  SELECT vt.user_id, vt.is_valid INTO _user_id, _is_valid
  FROM public.validate_share_token(_token) vt;
  
  IF _user_id IS NULL OR NOT _is_valid THEN
    RETURN;
  END IF;
  
  -- Get shared sections for this token
  SELECT st.shared_sections INTO _shared_sections
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
    AND vd.section_key = ANY(_shared_sections);
END;
$function$;

-- Create function to get shared sections by token
CREATE OR REPLACE FUNCTION public.get_shared_sections_by_token(_token text)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _user_id UUID;
  _is_valid BOOLEAN;
  _shared_sections text[];
BEGIN
  -- Validate token first
  SELECT vt.user_id, vt.is_valid INTO _user_id, _is_valid
  FROM public.validate_share_token(_token) vt;
  
  IF _user_id IS NULL OR NOT _is_valid THEN
    RETURN NULL;
  END IF;
  
  -- Get shared sections for this token
  SELECT st.shared_sections INTO _shared_sections
  FROM public.share_tokens st
  WHERE st.token = _token;
  
  RETURN _shared_sections;
END;
$function$;
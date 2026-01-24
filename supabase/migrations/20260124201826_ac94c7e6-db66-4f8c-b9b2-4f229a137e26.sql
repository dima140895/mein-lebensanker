-- Create table for share tokens (relatives access)
CREATE TABLE public.share_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  label TEXT, -- Optional label like "Für meine Tochter"
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.share_tokens ENABLE ROW LEVEL SECURITY;

-- Users can manage their own share tokens
CREATE POLICY "Users can view their own share tokens" 
ON public.share_tokens 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own share tokens" 
ON public.share_tokens 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own share tokens" 
ON public.share_tokens 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own share tokens" 
ON public.share_tokens 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to validate share token (for anonymous access)
CREATE OR REPLACE FUNCTION public.validate_share_token(_token TEXT)
RETURNS TABLE(user_id UUID, is_valid BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    st.user_id,
    (st.is_active AND (st.expires_at IS NULL OR st.expires_at > now())) AS is_valid
  FROM public.share_tokens st
  WHERE st.token = _token;
END;
$$;

-- Create function to get vorsorge data by share token (for anonymous access)
CREATE OR REPLACE FUNCTION public.get_vorsorge_data_by_token(_token TEXT)
RETURNS TABLE(
  section_key TEXT,
  data JSONB,
  is_for_partner BOOLEAN
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
  SELECT vd.section_key, vd.data, vd.is_for_partner
  FROM public.vorsorge_data vd
  WHERE vd.user_id = _user_id;
END;
$$;

-- Create function to get profile info by share token (limited info for relatives)
CREATE OR REPLACE FUNCTION public.get_profile_by_token(_token TEXT)
RETURNS TABLE(
  full_name TEXT,
  partner_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _is_valid BOOLEAN;
BEGIN
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

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_share_tokens_updated_at
BEFORE UPDATE ON public.share_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
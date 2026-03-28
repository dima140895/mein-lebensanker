
-- Family access table
CREATE TABLE public.familienzugang (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  member_email text NOT NULL,
  member_id uuid,
  rolle text NOT NULL DEFAULT 'lesen' CHECK (rolle IN ('lesen', 'mitbearbeiten')),
  status text NOT NULL DEFAULT 'eingeladen' CHECK (status IN ('eingeladen', 'aktiv')),
  invitation_token text NOT NULL DEFAULT encode(extensions.gen_random_bytes(32), 'hex'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, member_email)
);

ALTER TABLE public.familienzugang ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.familienzugang FORCE ROW LEVEL SECURITY;

-- Owner can see their invitations
CREATE POLICY "Owners can view their family members"
  ON public.familienzugang FOR SELECT TO authenticated
  USING (auth.uid() = owner_id);

-- Members can see invitations to them
CREATE POLICY "Members can view their family access"
  ON public.familienzugang FOR SELECT TO authenticated
  USING (auth.uid() = member_id);

-- Owner can insert
CREATE POLICY "Owners can invite family members"
  ON public.familienzugang FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Owner can update
CREATE POLICY "Owners can update family access"
  ON public.familienzugang FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id);

-- System can update (for accepting invitations)
CREATE POLICY "System can update family access"
  ON public.familienzugang FOR UPDATE TO public
  USING (CURRENT_USER NOT IN ('anon', 'authenticated'));

-- Owner can delete
CREATE POLICY "Owners can delete family members"
  ON public.familienzugang FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);

-- Deny anonymous
CREATE POLICY "Deny anonymous access to familienzugang"
  ON public.familienzugang FOR SELECT TO anon
  USING (false);

-- Trigger for updated_at
CREATE TRIGGER update_familienzugang_updated_at
  BEFORE UPDATE ON public.familienzugang
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to accept invitation
CREATE OR REPLACE FUNCTION public.accept_family_invitation(_token text, _user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _updated boolean;
BEGIN
  UPDATE public.familienzugang
  SET member_id = _user_id, status = 'aktiv'
  WHERE invitation_token = _token
    AND status = 'eingeladen'
    AND member_id IS NULL;
  
  GET DIAGNOSTICS _updated = ROW_COUNT;
  RETURN _updated > 0;
END;
$$;

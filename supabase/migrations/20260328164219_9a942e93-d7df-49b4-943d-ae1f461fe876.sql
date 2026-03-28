
-- Create referrals table
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id uuid NOT NULL,
  referral_code text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  clicks integer NOT NULL DEFAULT 0,
  conversions integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals FORCE ROW LEVEL SECURITY;

-- Users can read their own referrals
CREATE POLICY "Users can view their own referrals"
ON public.referrals FOR SELECT TO authenticated
USING (auth.uid() = referrer_user_id);

-- Deny anonymous access
CREATE POLICY "Deny anonymous access to referrals"
ON public.referrals FOR SELECT TO anon
USING (false);

-- Deny user inserts (system only)
CREATE POLICY "Deny user inserts to referrals"
ON public.referrals FOR INSERT TO authenticated
WITH CHECK (false);

-- Deny user updates (system only)
CREATE POLICY "Deny user updates to referrals"
ON public.referrals FOR UPDATE TO authenticated
USING (false);

-- Deny user deletes
CREATE POLICY "Deny user deletes from referrals"
ON public.referrals FOR DELETE TO authenticated
USING (false);

-- System can insert referrals
CREATE POLICY "System can insert referrals"
ON public.referrals FOR INSERT TO public
WITH CHECK (CURRENT_USER NOT IN ('anon', 'authenticated'));

-- System can update referrals (for click/conversion tracking)
CREATE POLICY "System can update referrals"
ON public.referrals FOR UPDATE TO public
USING (CURRENT_USER NOT IN ('anon', 'authenticated'));

-- Trigger: auto-create referral for new users
CREATE OR REPLACE FUNCTION public.handle_new_referral()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.referrals (referrer_user_id)
  VALUES (NEW.user_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_create_referral
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_referral();

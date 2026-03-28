
-- Function to increment referral clicks (used by edge function)
CREATE OR REPLACE FUNCTION public.increment_referral_clicks(_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.referrals SET clicks = clicks + 1 WHERE referral_code = _code;
END;
$$;

-- Function to increment referral conversions (used by verify-payment)
CREATE OR REPLACE FUNCTION public.increment_referral_conversions(_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.referrals SET conversions = conversions + 1 WHERE referral_code = _code;
END;
$$;

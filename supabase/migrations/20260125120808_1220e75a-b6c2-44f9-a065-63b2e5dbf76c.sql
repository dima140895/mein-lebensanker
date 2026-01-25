-- Create function to validate profile limit
CREATE OR REPLACE FUNCTION public.validate_person_profile_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _max_profiles INTEGER;
  _current_count INTEGER;
BEGIN
  -- Get user's max_profiles from profiles table
  SELECT COALESCE(max_profiles, 1) INTO _max_profiles
  FROM public.profiles
  WHERE user_id = NEW.user_id;

  -- If no profile found, default to 1
  IF _max_profiles IS NULL THEN
    _max_profiles := 1;
  END IF;

  -- Count existing profiles for this user
  SELECT COUNT(*) INTO _current_count
  FROM public.person_profiles
  WHERE user_id = NEW.user_id;

  -- Check if adding a new profile would exceed the limit
  IF _current_count >= _max_profiles THEN
    RAISE EXCEPTION 'Profile limit reached. Maximum allowed: %. Current: %.', _max_profiles, _current_count
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to enforce limit on INSERT
CREATE TRIGGER enforce_person_profile_limit
  BEFORE INSERT ON public.person_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_person_profile_limit();
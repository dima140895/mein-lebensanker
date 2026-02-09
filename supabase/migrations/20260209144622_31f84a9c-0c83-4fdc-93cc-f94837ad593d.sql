-- Remove FORCE RLS from profiles so the SECURITY DEFINER trigger can insert
-- Normal RLS still applies to all non-owner roles (anon, authenticated)
ALTER TABLE public.profiles NO FORCE ROW LEVEL SECURITY;

-- Also fix person_profiles if needed (same trigger pattern)
ALTER TABLE public.person_profiles NO FORCE ROW LEVEL SECURITY;

-- Re-insert missing profiles for any existing auth users
INSERT INTO public.profiles (user_id, email)
SELECT id, email FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles)
ON CONFLICT DO NOTHING;
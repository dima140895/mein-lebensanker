
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_new_user boolean DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_focus text DEFAULT null;

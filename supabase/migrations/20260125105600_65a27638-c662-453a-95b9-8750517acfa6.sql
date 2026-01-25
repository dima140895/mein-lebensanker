-- Erweitere profiles um max_profiles (Anzahl erlaubte Profile) und purchased_tier
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS max_profiles integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS purchased_tier text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS has_update_subscription boolean DEFAULT false;

-- Erstelle person_profiles Tabelle für einzelne Personenprofile
CREATE TABLE public.person_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  birth_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT person_profiles_user_id_name_unique UNIQUE (user_id, name)
);

-- Erweitere vorsorge_data um person_profile_id (optional)
ALTER TABLE public.vorsorge_data 
ADD COLUMN IF NOT EXISTS person_profile_id uuid REFERENCES public.person_profiles(id) ON DELETE CASCADE;

-- Index für schnelle Abfragen
CREATE INDEX IF NOT EXISTS idx_person_profiles_user_id ON public.person_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_vorsorge_data_person_profile ON public.vorsorge_data(person_profile_id);

-- RLS für person_profiles
ALTER TABLE public.person_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own person profiles"
ON public.person_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own person profiles"
ON public.person_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own person profiles"
ON public.person_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own person profiles"
ON public.person_profiles FOR DELETE
USING (auth.uid() = user_id);

-- Trigger für updated_at
CREATE TRIGGER update_person_profiles_updated_at
BEFORE UPDATE ON public.person_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Fix upsert conflicts for vorsorge_data (used by profile name/birthdate sync)
-- PostgREST upsert requires a UNIQUE constraint matching onConflict columns.

ALTER TABLE public.vorsorge_data
ADD CONSTRAINT vorsorge_data_user_section_profile_unique
UNIQUE (user_id, section_key, person_profile_id);

-- Helpful index for common reads in the app
CREATE INDEX IF NOT EXISTS idx_vorsorge_data_user_profile
ON public.vorsorge_data (user_id, person_profile_id);

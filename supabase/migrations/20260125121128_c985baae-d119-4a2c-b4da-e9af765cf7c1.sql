-- Drop the old unique constraint that doesn't account for person_profile_id
-- This was causing conflicts when saving data for different profiles
ALTER TABLE public.vorsorge_data
DROP CONSTRAINT IF EXISTS vorsorge_data_user_id_section_key_is_for_partner_key;
-- Remove the has_update_subscription column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS has_update_subscription;
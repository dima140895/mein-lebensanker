-- Add column to store password encrypted with recovery key
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS encrypted_password_recovery TEXT;
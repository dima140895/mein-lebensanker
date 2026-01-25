-- Add encryption fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS encryption_salt TEXT,
ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT false;

-- Add comment explaining the columns
COMMENT ON COLUMN public.profiles.encryption_salt IS 'Salt for PBKDF2 key derivation (not sensitive)';
COMMENT ON COLUMN public.profiles.is_encrypted IS 'Whether user has enabled E2E encryption';
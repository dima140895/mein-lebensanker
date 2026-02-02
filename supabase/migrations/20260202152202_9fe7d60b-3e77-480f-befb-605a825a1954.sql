-- Add column to store the encryption password encrypted with the PIN
ALTER TABLE public.share_tokens
ADD COLUMN encrypted_recovery_key text;

-- Add comment for documentation
COMMENT ON COLUMN public.share_tokens.encrypted_recovery_key IS 'Recovery key encrypted with the PIN hash, allowing relatives to decrypt data using only the PIN';
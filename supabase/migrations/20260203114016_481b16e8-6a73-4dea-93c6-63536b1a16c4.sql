-- Add explicit deny policies for share_token_access_log to prevent any user modifications
-- The table should only be written to by SECURITY DEFINER functions (validate_share_token, validate_share_token_with_pin)

-- Deny all INSERT operations from users (only SECURITY DEFINER functions can insert)
CREATE POLICY "Deny user inserts to access log"
ON public.share_token_access_log
FOR INSERT
TO authenticated, anon
WITH CHECK (false);

-- Deny all UPDATE operations (logs should never be modified)
CREATE POLICY "Deny all updates to access log"
ON public.share_token_access_log
FOR UPDATE
TO authenticated, anon
USING (false);

-- Deny all DELETE operations (logs should never be deleted by users)
CREATE POLICY "Deny all deletes to access log"
ON public.share_token_access_log
FOR DELETE
TO authenticated, anon
USING (false);
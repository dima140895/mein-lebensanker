-- Add RLS policies to share_token_access_log table
-- This table is only accessed via SECURITY DEFINER functions, so we block all direct access

-- Policy to block all SELECT access (only internal functions should access this)
CREATE POLICY "No direct read access"
ON public.share_token_access_log
FOR SELECT
USING (false);

-- Policy to block all INSERT access (only internal functions should insert)
CREATE POLICY "No direct insert access"
ON public.share_token_access_log
FOR INSERT
WITH CHECK (false);

-- Policy to block all UPDATE access
CREATE POLICY "No direct update access"
ON public.share_token_access_log
FOR UPDATE
USING (false);

-- Policy to block all DELETE access
CREATE POLICY "No direct delete access"
ON public.share_token_access_log
FOR DELETE
USING (false);
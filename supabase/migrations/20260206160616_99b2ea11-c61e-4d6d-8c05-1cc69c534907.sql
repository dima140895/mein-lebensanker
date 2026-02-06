-- Add explicit DENY policies for INSERT, UPDATE, DELETE on user_roles
-- to prevent any possibility of privilege escalation

-- Deny all inserts to user_roles (only managed by admin/backend)
CREATE POLICY "Deny user inserts to roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Deny all updates to user_roles
CREATE POLICY "Deny user updates to roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (false);

-- Deny all deletes from user_roles
CREATE POLICY "Deny user deletes from roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (false);
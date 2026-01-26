-- Add payment status enforcement to vorsorge_data INSERT policy
-- This ensures only paid users (or admins) can insert/update their data

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can insert their own data" ON public.vorsorge_data;

-- Create new INSERT policy with payment check
CREATE POLICY "Users can insert their own data" 
ON public.vorsorge_data 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND public.user_has_access(auth.uid())
);

-- Drop existing UPDATE policy
DROP POLICY IF EXISTS "Users can update their own data" ON public.vorsorge_data;

-- Create new UPDATE policy with payment check
CREATE POLICY "Users can update their own data" 
ON public.vorsorge_data 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  AND public.user_has_access(auth.uid())
);

-- Also add payment check to person_profiles INSERT to prevent profile creation without payment
DROP POLICY IF EXISTS "Users can create their own person profiles" ON public.person_profiles;

CREATE POLICY "Users can create their own person profiles" 
ON public.person_profiles 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND public.user_has_access(auth.uid())
);

-- Add payment check to person_profiles UPDATE
DROP POLICY IF EXISTS "Users can update their own person profiles" ON public.person_profiles;

CREATE POLICY "Users can update their own person profiles" 
ON public.person_profiles 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  AND public.user_has_access(auth.uid())
);
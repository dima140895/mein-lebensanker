
-- Fix: Validate person_profile_id ownership in vorsorge_data INSERT and UPDATE policies
-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own data" ON public.vorsorge_data;
DROP POLICY IF EXISTS "Users can update their own data" ON public.vorsorge_data;

-- Recreate INSERT policy with person_profile_id ownership check
CREATE POLICY "Users can insert their own data"
ON public.vorsorge_data
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND public.user_has_access(auth.uid())
  AND (
    person_profile_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.person_profiles
      WHERE id = person_profile_id
        AND user_id = auth.uid()
    )
  )
);

-- Recreate UPDATE policy with person_profile_id ownership check
CREATE POLICY "Users can update their own data"
ON public.vorsorge_data
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  AND public.user_has_access(auth.uid())
  AND (
    person_profile_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.person_profiles
      WHERE id = person_profile_id
        AND user_id = auth.uid()
    )
  )
);

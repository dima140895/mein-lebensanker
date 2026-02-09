-- Allow inserting and updating the encryption verifier regardless of payment status

DROP POLICY IF EXISTS "Users can insert their own data" ON public.vorsorge_data;
CREATE POLICY "Users can insert their own data" 
  ON public.vorsorge_data 
  AS RESTRICTIVE
  FOR INSERT 
  WITH CHECK (
    (auth.uid() = user_id) 
    AND (
      section_key = '_encryption_verifier'
      OR (
        user_has_access(auth.uid()) 
        AND (
          person_profile_id IS NULL 
          OR EXISTS (
            SELECT 1 FROM person_profiles 
            WHERE person_profiles.id = vorsorge_data.person_profile_id 
            AND person_profiles.user_id = auth.uid()
          )
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can update their own data" ON public.vorsorge_data;
CREATE POLICY "Users can update their own data" 
  ON public.vorsorge_data 
  AS RESTRICTIVE
  FOR UPDATE 
  USING (
    (auth.uid() = user_id) 
    AND (
      section_key = '_encryption_verifier'
      OR (
        user_has_access(auth.uid()) 
        AND (
          person_profile_id IS NULL 
          OR EXISTS (
            SELECT 1 FROM person_profiles 
            WHERE person_profiles.id = vorsorge_data.person_profile_id 
            AND person_profiles.user_id = auth.uid()
          )
        )
      )
    )
  );
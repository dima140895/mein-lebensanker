
-- Allow family members to read owner's pflege entries
CREATE POLICY "Family members can view owner pflege entries"
  ON public.pflege_eintraege FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.familienzugang
      WHERE familienzugang.owner_id = pflege_eintraege.user_id
        AND familienzugang.member_id = auth.uid()
        AND familienzugang.status = 'aktiv'
    )
  );

-- Allow family members to read owner's symptom checkins
CREATE POLICY "Family members can view owner symptom checkins"
  ON public.symptom_checkins FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.familienzugang
      WHERE familienzugang.owner_id = symptom_checkins.user_id
        AND familienzugang.member_id = auth.uid()
        AND familienzugang.status = 'aktiv'
    )
  );

-- Allow family members with 'mitbearbeiten' role to insert pflege entries for owner
CREATE POLICY "Family editors can insert pflege entries"
  ON public.pflege_eintraege FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.familienzugang
      WHERE familienzugang.owner_id = pflege_eintraege.user_id
        AND familienzugang.member_id = auth.uid()
        AND familienzugang.status = 'aktiv'
        AND familienzugang.rolle = 'mitbearbeiten'
    )
  );

-- Allow family editors to insert symptom checkins for owner
CREATE POLICY "Family editors can insert symptom checkins"
  ON public.symptom_checkins FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.familienzugang
      WHERE familienzugang.owner_id = symptom_checkins.user_id
        AND familienzugang.member_id = auth.uid()
        AND familienzugang.status = 'aktiv'
        AND familienzugang.rolle = 'mitbearbeiten'
    )
  );

-- Allow family members to read owner's profile name
CREATE POLICY "Family members can view owner profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.familienzugang
      WHERE familienzugang.owner_id = profiles.user_id
        AND familienzugang.member_id = auth.uid()
        AND familienzugang.status = 'aktiv'
    )
  );


CREATE TABLE public.symptom_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  energie integer NOT NULL CHECK (energie >= 1 AND energie <= 10),
  schmerz integer NOT NULL CHECK (schmerz >= 1 AND schmerz <= 10),
  schlaf integer NOT NULL CHECK (schlaf >= 1 AND schlaf <= 10),
  stimmung integer NOT NULL CHECK (stimmung >= 1 AND stimmung <= 10),
  notiz text,
  checkin_datum date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, checkin_datum)
);

ALTER TABLE public.symptom_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_checkins FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own symptom checkins"
  ON public.symptom_checkins FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own symptom checkins"
  ON public.symptom_checkins FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own symptom checkins"
  ON public.symptom_checkins FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own symptom checkins"
  ON public.symptom_checkins FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Deny anonymous access to symptom_checkins"
  ON public.symptom_checkins FOR SELECT TO anon
  USING (false);

CREATE TRIGGER update_symptom_checkins_updated_at
  BEFORE UPDATE ON public.symptom_checkins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

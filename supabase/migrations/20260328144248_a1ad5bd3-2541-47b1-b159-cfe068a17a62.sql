
-- Pflege-Tagebuch entries
CREATE TABLE public.pflege_eintraege (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  person_name text NOT NULL DEFAULT '',
  stimmung integer NOT NULL CHECK (stimmung >= 1 AND stimmung <= 5),
  mahlzeiten text,
  aktivitaeten text,
  besonderheiten text,
  naechste_schritte text,
  eintrags_datum date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, eintrags_datum)
);

ALTER TABLE public.pflege_eintraege ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pflege_eintraege FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pflege entries"
  ON public.pflege_eintraege FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pflege entries"
  ON public.pflege_eintraege FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pflege entries"
  ON public.pflege_eintraege FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pflege entries"
  ON public.pflege_eintraege FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Deny anonymous access to pflege_eintraege"
  ON public.pflege_eintraege FOR SELECT TO anon
  USING (false);

CREATE TRIGGER update_pflege_eintraege_updated_at
  BEFORE UPDATE ON public.pflege_eintraege
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Medikamente table
CREATE TABLE public.medikamente (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  dosierung text,
  einnahmezeiten text,
  arzt text,
  aktiv boolean NOT NULL DEFAULT true,
  notizen text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.medikamente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medikamente FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own medikamente"
  ON public.medikamente FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medikamente"
  ON public.medikamente FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medikamente"
  ON public.medikamente FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medikamente"
  ON public.medikamente FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Deny anonymous access to medikamente"
  ON public.medikamente FOR SELECT TO anon
  USING (false);

CREATE TRIGGER update_medikamente_updated_at
  BEFORE UPDATE ON public.medikamente
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

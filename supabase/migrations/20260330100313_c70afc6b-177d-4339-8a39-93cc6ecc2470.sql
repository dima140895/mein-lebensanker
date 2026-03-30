
-- Create pflege_personen table
CREATE TABLE IF NOT EXISTS public.pflege_personen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  geburtsjahr integer,
  beziehung text,
  notizen text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pflege_personen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pflege_personen FORCE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Deny anonymous access to pflege_personen"
  ON public.pflege_personen FOR SELECT TO anon USING (false);

CREATE POLICY "Users can view their own pflege_personen"
  ON public.pflege_personen FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pflege_personen"
  ON public.pflege_personen FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pflege_personen"
  ON public.pflege_personen FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pflege_personen"
  ON public.pflege_personen FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER set_pflege_personen_updated_at
  BEFORE UPDATE ON public.pflege_personen
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

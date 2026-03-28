
-- Persistent rate limiting table
CREATE TABLE public.rate_limit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action text NOT NULL,
  window_start timestamptz NOT NULL DEFAULT date_trunc('minute', now()),
  count integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(identifier, action, window_start)
);

CREATE INDEX idx_rate_limit_window ON public.rate_limit_log(window_start);

-- RLS: service_role only
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_log FORCE ROW LEVEL SECURITY;

-- Deny all client access
CREATE POLICY "Deny anon access to rate_limit_log"
ON public.rate_limit_log FOR SELECT TO anon USING (false);

CREATE POLICY "Deny authenticated access to rate_limit_log"
ON public.rate_limit_log FOR SELECT TO authenticated USING (false);

CREATE POLICY "Deny authenticated insert to rate_limit_log"
ON public.rate_limit_log FOR INSERT TO authenticated WITH CHECK (false);

CREATE POLICY "Deny authenticated update to rate_limit_log"
ON public.rate_limit_log FOR UPDATE TO authenticated USING (false);

CREATE POLICY "Deny authenticated delete to rate_limit_log"
ON public.rate_limit_log FOR DELETE TO authenticated USING (false);

-- System (service_role) can do everything
CREATE POLICY "System can select rate_limit_log"
ON public.rate_limit_log FOR SELECT TO public
USING (CURRENT_USER NOT IN ('anon', 'authenticated'));

CREATE POLICY "System can insert rate_limit_log"
ON public.rate_limit_log FOR INSERT TO public
WITH CHECK (CURRENT_USER NOT IN ('anon', 'authenticated'));

CREATE POLICY "System can update rate_limit_log"
ON public.rate_limit_log FOR UPDATE TO public
USING (CURRENT_USER NOT IN ('anon', 'authenticated'));

CREATE POLICY "System can delete rate_limit_log"
ON public.rate_limit_log FOR DELETE TO public
USING (CURRENT_USER NOT IN ('anon', 'authenticated'));

-- Rate limit check function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier text,
  p_action text,
  p_max_count integer,
  p_window_minutes integer DEFAULT 1
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_window timestamptz := date_trunc('minute', now()) - ((p_window_minutes - 1) * interval '1 minute');
  v_count integer;
BEGIN
  SELECT COALESCE(SUM(count), 0) INTO v_count
  FROM rate_limit_log
  WHERE identifier = p_identifier
    AND action = p_action
    AND window_start >= v_window;

  IF v_count >= p_max_count THEN
    RETURN false;
  END IF;

  INSERT INTO rate_limit_log (identifier, action, window_start, count)
  VALUES (p_identifier, p_action, date_trunc('minute', now()), 1)
  ON CONFLICT (identifier, action, window_start)
  DO UPDATE SET count = rate_limit_log.count + 1;

  RETURN true;
END;
$$;

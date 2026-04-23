
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text UNIQUE,
  event_type text NOT NULL,
  user_id uuid,
  stripe_customer_id text,
  stripe_subscription_id text,
  previous_status text,
  new_status text,
  previous_plan text,
  new_plan text,
  previous_active_modules text[],
  new_active_modules text[],
  raw_payload jsonb,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_swh_user ON public.stripe_webhook_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_swh_event_type ON public.stripe_webhook_events(event_type, created_at DESC);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny anonymous access to stripe_webhook_events"
ON public.stripe_webhook_events FOR SELECT TO anon USING (false);

CREATE POLICY "Admins can view webhook events"
ON public.stripe_webhook_events FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Deny user inserts to webhook events"
ON public.stripe_webhook_events FOR INSERT TO authenticated WITH CHECK (false);

CREATE POLICY "Deny user updates to webhook events"
ON public.stripe_webhook_events FOR UPDATE TO authenticated USING (false);

CREATE POLICY "Deny user deletes from webhook events"
ON public.stripe_webhook_events FOR DELETE TO authenticated USING (false);

CREATE POLICY "System can insert webhook events"
ON public.stripe_webhook_events FOR INSERT TO public
WITH CHECK (CURRENT_USER <> ALL (ARRAY['anon'::name, 'authenticated'::name]));

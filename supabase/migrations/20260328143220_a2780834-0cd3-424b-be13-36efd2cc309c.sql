
-- Create subscriptions table for the new pricing model
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan text NOT NULL CHECK (plan IN ('anker', 'plus', 'familie')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'canceled', 'past_due', 'incomplete')),
  stripe_subscription_id text,
  stripe_customer_id text,
  trial_end timestamp with time zone,
  current_period_end timestamp with time zone,
  active_modules text[] DEFAULT ARRAY['vorsorge']::text[],
  max_profiles integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Deny anonymous access to subscriptions"
  ON public.subscriptions FOR SELECT TO anon
  USING (false);

CREATE POLICY "Deny user inserts to subscriptions"
  ON public.subscriptions FOR INSERT TO authenticated
  WITH CHECK (false);

CREATE POLICY "Deny user updates to subscriptions"
  ON public.subscriptions FOR UPDATE TO authenticated
  USING (false);

CREATE POLICY "Deny user deletes from subscriptions"
  ON public.subscriptions FOR DELETE TO authenticated
  USING (false);

-- System/service role can insert and update (edge functions use service role)
CREATE POLICY "System can insert subscriptions"
  ON public.subscriptions FOR INSERT TO public
  WITH CHECK (CURRENT_USER NOT IN ('anon', 'authenticated'));

CREATE POLICY "System can update subscriptions"
  ON public.subscriptions FOR UPDATE TO public
  USING (CURRENT_USER NOT IN ('anon', 'authenticated'));

-- Updated_at trigger
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

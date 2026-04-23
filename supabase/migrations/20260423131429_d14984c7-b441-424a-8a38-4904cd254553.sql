
CREATE OR REPLACE FUNCTION public.user_had_canceled_paid_plan(_user_id uuid)
RETURNS TABLE(plan text, canceled_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT plan, canceled_at
  FROM (
    -- Source 1: webhook event log (most reliable — captures the transition)
    SELECT
      COALESCE(previous_plan, new_plan) AS plan,
      created_at AS canceled_at
    FROM public.stripe_webhook_events
    WHERE user_id = _user_id
      AND (
        event_type = 'customer.subscription.deleted'
        OR (event_type = 'customer.subscription.updated'
            AND new_status IN ('canceled', 'past_due', 'unpaid')
            AND COALESCE(previous_plan, new_plan) IN ('plus', 'familie'))
      )
      AND COALESCE(previous_plan, new_plan) IN ('plus', 'familie')

    UNION ALL

    -- Source 2: legacy fallback — current subscription row that ended on a paid plan
    SELECT s.plan, s.updated_at
    FROM public.subscriptions s
    WHERE s.user_id = _user_id
      AND s.status IN ('canceled', 'past_due', 'unpaid')
      AND s.plan IN ('plus', 'familie')
  ) sources
  ORDER BY canceled_at DESC
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.user_had_canceled_paid_plan(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.user_had_canceled_paid_plan(uuid) TO authenticated;

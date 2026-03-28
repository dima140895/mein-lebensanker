
-- Reminder preferences table
CREATE TABLE public.reminder_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  daily_checkin_enabled boolean NOT NULL DEFAULT false,
  daily_checkin_time time NOT NULL DEFAULT '09:00',
  weekly_summary_enabled boolean NOT NULL DEFAULT false,
  email_unsubscribed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.reminder_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_preferences FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prefs" ON public.reminder_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own prefs" ON public.reminder_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own prefs" ON public.reminder_preferences FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Deny anon access to reminder_preferences" ON public.reminder_preferences FOR SELECT TO anon USING (false);
CREATE POLICY "System can select reminder_preferences" ON public.reminder_preferences FOR SELECT TO public USING (CURRENT_USER NOT IN ('anon', 'authenticated'));
CREATE POLICY "System can update reminder_preferences" ON public.reminder_preferences FOR UPDATE TO public USING (CURRENT_USER NOT IN ('anon', 'authenticated'));

-- Sent reminders tracking (for one-time reminders like upgrade)
CREATE TABLE public.sent_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reminder_type text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, reminder_type)
);

ALTER TABLE public.sent_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sent_reminders FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sent reminders" ON public.sent_reminders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Deny anon access to sent_reminders" ON public.sent_reminders FOR SELECT TO anon USING (false);
CREATE POLICY "System can insert sent_reminders" ON public.sent_reminders FOR INSERT TO public WITH CHECK (CURRENT_USER NOT IN ('anon', 'authenticated'));
CREATE POLICY "System can select sent_reminders" ON public.sent_reminders FOR SELECT TO public USING (CURRENT_USER NOT IN ('anon', 'authenticated'));

-- Updated_at trigger for reminder_preferences
CREATE TRIGGER update_reminder_preferences_updated_at
  BEFORE UPDATE ON public.reminder_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

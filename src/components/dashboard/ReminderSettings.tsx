import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner';

const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const h = String(i).padStart(2, '0');
  return { value: `${h}:00`, label: `${h}:00 Uhr` };
});

const ReminderSettings = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [dailyEnabled, setDailyEnabled] = useState(false);
  const [dailyTime, setDailyTime] = useState('09:00');
  const [weeklyEnabled, setWeeklyEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    const { data } = await supabase
      .from('reminder_preferences')
      .select('*')
      .eq('user_id', user!.id)
      .maybeSingle();

    if (data) {
      setDailyEnabled(data.daily_checkin_enabled);
      setDailyTime(data.daily_checkin_time?.substring(0, 5) || '09:00');
      setWeeklyEnabled(data.weekly_summary_enabled);
    }
    setLoading(false);
  };

  const savePreferences = async (updates: Record<string, unknown>) => {
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from('reminder_preferences')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('reminder_preferences')
          .update({ ...updates, email_unsubscribed: false })
          .eq('user_id', user!.id);
      } else {
        await supabase.from('reminder_preferences').insert({
          user_id: user!.id,
          daily_checkin_enabled: dailyEnabled,
          daily_checkin_time: dailyTime,
          weekly_summary_enabled: weeklyEnabled,
          ...updates,
        });
      }
      toast.success(language === 'de' ? 'Einstellungen gespeichert' : 'Settings saved');
    } catch {
      toast.error(language === 'de' ? 'Fehler beim Speichern' : 'Save failed');
    }
    setSaving(false);
  };

  const handleDailyToggle = (checked: boolean) => {
    setDailyEnabled(checked);
    savePreferences({ daily_checkin_enabled: checked });
  };

  const handleTimeChange = (time: string) => {
    setDailyTime(time);
    savePreferences({ daily_checkin_time: time });
  };

  const handleWeeklyToggle = (checked: boolean) => {
    setWeeklyEnabled(checked);
    savePreferences({ weekly_summary_enabled: checked });
  };

  if (loading) return <div className="animate-pulse h-32 bg-muted rounded-lg" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5 text-primary" />
          {language === 'de' ? 'E-Mail-Erinnerungen' : 'Email Reminders'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Daily Check-in */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {language === 'de' ? 'Tägliche Check-in Erinnerung' : 'Daily Check-in Reminder'}
              </Label>
              <p className="text-xs text-muted-foreground">
                {language === 'de'
                  ? 'Erinnert dich an deinen täglichen Symptom-Check-in'
                  : 'Reminds you of your daily symptom check-in'}
              </p>
            </div>
            <Switch checked={dailyEnabled} onCheckedChange={handleDailyToggle} disabled={saving} />
          </div>
          {dailyEnabled && (
            <div className="ml-6 flex items-center gap-2">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">
                {language === 'de' ? 'Uhrzeit:' : 'Time:'}
              </Label>
              <Select value={dailyTime} onValueChange={handleTimeChange} disabled={saving}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-xs">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Weekly Summary */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              {language === 'de' ? 'Wöchentliche Pflege-Zusammenfassung' : 'Weekly Care Summary'}
            </Label>
            <p className="text-xs text-muted-foreground">
              {language === 'de'
                ? 'Jeden Sonntag um 18:00 Uhr eine Zusammenfassung deiner Woche'
                : 'Weekly summary every Sunday at 6 PM'}
            </p>
          </div>
          <Switch checked={weeklyEnabled} onCheckedChange={handleWeeklyToggle} disabled={saving} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ReminderSettings;

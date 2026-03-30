import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/browserClient';
import { queryKeys } from '@/lib/queryKeys';
import { startOfWeek, format, addDays } from 'date-fns';
import { de as deLocale } from 'date-fns/locale';

const DAY_LABELS_DE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const DAY_LABELS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const WeeklySummary = () => {
  const { user } = useAuth();
  const { language } = useLanguage();

  const monday = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 1 }), []);
  const mondayStr = format(monday, 'yyyy-MM-dd');
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const todayIdx = useMemo(() => {
    const diff = Math.floor((Date.now() - monday.getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(diff, 6);
  }, [monday]);

  const { data, isError } = useQuery({
    queryKey: [...queryKeys.symptomCheckins(user?.id ?? ''), 'weekly-summary-v2', mondayStr],
    queryFn: async () => {
      const [checkinsRes, pflegeRes] = await Promise.all([
        supabase
          .from('symptom_checkins')
          .select('checkin_datum')
          .eq('user_id', user!.id)
          .gte('checkin_datum', mondayStr),
        supabase
          .from('pflege_eintraege')
          .select('eintrags_datum')
          .eq('user_id', user!.id)
          .gte('eintrags_datum', mondayStr),
      ]);
      return {
        checkinDates: new Set((checkinsRes.data ?? []).map(c => c.checkin_datum)),
        pflegeDates: new Set((pflegeRes.data ?? []).map(p => p.eintrags_datum)),
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 15,
  });

  // Silently hide on error or no data
  if (isError || !data) return null;

  const { checkinDates, pflegeDates } = data;

  // Build day info
  const dayLabels = language === 'de' ? DAY_LABELS_DE : DAY_LABELS_EN;
  const days = Array.from({ length: 7 }, (_, i) => {
    const dateStr = format(addDays(monday, i), 'yyyy-MM-dd');
    const hasActivity = checkinDates.has(dateStr) || pflegeDates.has(dateStr);
    const isFuture = i > todayIdx;
    const isPast = i < todayIdx;
    const isToday = i === todayIdx;
    return { label: dayLabels[i], hasActivity, isFuture, isPast, isToday, dateStr };
  });

  // Count past days (including today) with activity
  const pastDaysCount = todayIdx + 1;
  const filledCount = days.filter((d, i) => i <= todayIdx && d.hasActivity).length;

  // If zero activity at all, hide
  if (filledCount === 0) return null;

  // Streak message
  const todayName = format(new Date(), 'EEEE', { locale: language === 'de' ? deLocale : undefined });
  const subtitle = `Mo–${todayName.charAt(0).toUpperCase() + todayName.slice(1)}`;

  let streakMessage: string;
  let streakHighlight = false;
  if (filledCount === pastDaysCount) {
    streakMessage = language === 'de' ? 'Perfekte Woche bisher — weiter so!' : 'Perfect week so far — keep it up!';
    streakHighlight = true;
  } else if (filledCount >= 3) {
    streakMessage = language === 'de'
      ? `${filledCount} von ${pastDaysCount} Tagen diese Woche`
      : `${filledCount} of ${pastDaysCount} days this week`;
  } else {
    streakMessage = language === 'de'
      ? 'Fang noch heute an — der Verlauf lohnt sich.'
      : 'Start today — tracking is worth it.';
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">
          {language === 'de' ? 'Diese Woche' : 'This Week'}
        </h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>

      {/* Day dots */}
      <div className="flex gap-2 mt-3 justify-center sm:justify-start">
        {days.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors ${
                d.hasActivity
                  ? 'bg-primary'
                  : d.isFuture
                    ? 'border border-dashed border-border'
                    : 'border-2 border-border'
              }`}
            >
              {d.hasActivity && (
                <span className="text-primary-foreground text-[10px] font-bold">✓</span>
              )}
            </div>
            <span
              className={`text-[10px] font-medium ${
                d.hasActivity
                  ? 'text-primary'
                  : d.isFuture
                    ? 'text-muted-foreground/50'
                    : 'text-muted-foreground'
              }`}
            >
              {d.label}
            </span>
          </div>
        ))}
      </div>

      {/* Streak message */}
      <p className={`text-sm mt-3 ${streakHighlight ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
        {streakMessage}
      </p>
    </motion.div>
  );
};

export default WeeklySummary;

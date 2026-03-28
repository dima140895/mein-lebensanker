import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/browserClient';
import { queryKeys } from '@/lib/queryKeys';
import { startOfWeek, format, addDays, isEqual, parseISO } from 'date-fns';

const MOODS = ['', '😢', '😕', '😐', '🙂', '😊'];
const DAY_LABELS_DE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const DAY_LABELS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const WeeklySummary = () => {
  const { user } = useAuth();
  const { language } = useLanguage();

  const monday = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 1 }), []);
  const mondayStr = format(monday, 'yyyy-MM-dd');
  const todayIdx = useMemo(() => {
    const diff = Math.floor((Date.now() - monday.getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(diff, 6);
  }, [monday]);

  const { data, isLoading } = useQuery({
    queryKey: [...queryKeys.symptomCheckins(user?.id ?? ''), 'weekly-summary', mondayStr],
    queryFn: async () => {
      const [checkinsRes, pflegeRes] = await Promise.all([
        supabase
          .from('symptom_checkins')
          .select('energie,schmerz,schlaf,stimmung,checkin_datum')
          .eq('user_id', user!.id)
          .gte('checkin_datum', mondayStr)
          .order('checkin_datum', { ascending: true }),
        supabase
          .from('pflege_eintraege')
          .select('eintrags_datum,stimmung,person_name')
          .eq('user_id', user!.id)
          .gte('eintrags_datum', mondayStr)
          .order('eintrags_datum', { ascending: false }),
      ]);
      return {
        checkins: checkinsRes.data ?? [],
        pflege: pflegeRes.data ?? [],
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 15,
  });

  if (isLoading || !data) return null;

  const { checkins, pflege } = data;
  const hasCheckins = checkins.length > 0;
  const hasPflege = pflege.length > 0;

  // Nothing to show
  if (!hasCheckins && !hasPflege) return null;

  const dayLabels = language === 'de' ? DAY_LABELS_DE : DAY_LABELS_EN;

  // Build day-dot map for checkins
  const checkinDates = new Set(checkins.map((c: any) => c.checkin_datum));
  const dots = Array.from({ length: 7 }, (_, i) => {
    const day = format(addDays(monday, i), 'yyyy-MM-dd');
    return { label: dayLabels[i], filled: checkinDates.has(day), future: i > todayIdx };
  });

  // Averages (only if 3+ entries)
  const canAvg = checkins.length >= 3;
  const avg = (key: string) => {
    const sum = checkins.reduce((a: number, c: any) => a + (c[key] ?? 0), 0);
    return (sum / checkins.length).toFixed(1);
  };

  const lastPflege = pflege[0];
  const lastPflegeDate = lastPflege
    ? format(parseISO(lastPflege.eintrags_datum + 'T00:00:00'), language === 'de' ? 'dd.MM.' : 'MM/dd')
    : '';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
      <h2 className="font-serif text-xl text-forest mb-3">
        {language === 'de' ? 'Diese Woche' : 'This Week'}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Symptom Check-ins Card */}
        {hasCheckins && (
          <div className="rounded-xl bg-primary/5 p-4 space-y-3">
            <p className="text-sm font-medium text-foreground font-body">
              {checkins.length} {language === 'de' ? 'von' : 'of'} 7 Check-ins
            </p>

            {/* Day dots */}
            <div className="flex gap-1.5 items-center">
              {dots.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted-foreground font-body">{d.label}</span>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      d.filled
                        ? 'bg-primary'
                        : d.future
                          ? 'bg-muted/50'
                          : 'bg-muted-foreground/20'
                    }`}
                    aria-label={d.filled ? (language === 'de' ? 'Eintrag vorhanden' : 'Entry exists') : (language === 'de' ? 'Kein Eintrag' : 'No entry')}
                  />
                </div>
              ))}
            </div>

            {/* Averages */}
            {canAvg && (
              <p className="text-xs text-muted-foreground font-body">
                Ø {language === 'de' ? 'Energie' : 'Energy'} {avg('energie')}/10 · Ø {language === 'de' ? 'Schmerz' : 'Pain'} {avg('schmerz')}/10
              </p>
            )}
          </div>
        )}

        {/* Pflege Card */}
        {hasPflege && (
          <div className="rounded-xl bg-accent/10 p-4 space-y-2">
            <p className="text-sm font-medium text-foreground font-body">
              {pflege.length} {language === 'de' ? 'Pflege-Einträge' : 'Care entries'}
            </p>
            {lastPflege && (
              <p className="text-xs text-muted-foreground font-body">
                {language === 'de' ? 'Zuletzt' : 'Last'}: {lastPflegeDate}, {language === 'de' ? 'Stimmung' : 'Mood'} {MOODS[lastPflege.stimmung] || ''}
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default WeeklySummary;

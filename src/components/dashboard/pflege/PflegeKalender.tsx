import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Loader2, CalendarHeart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isToday } from 'date-fns';
import { de as deLocale } from 'date-fns/locale';
import { getMoodColor, getMoodLabel } from './pflegeMoodConfig';

interface CalendarEntry {
  eintrags_datum: string;
  stimmung: number;
  person_name: string;
  mahlzeiten: string | null;
  aktivitaeten: string | null;
  besonderheiten: string | null;
  naechste_schritte: string | null;
}

interface PflegeKalenderProps {
  onSelectDate?: (date: string) => void;
  activePersonName?: string;
}

const PflegeKalender = ({ onSelectDate, activePersonName = '' }: PflegeKalenderProps) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const t = {
    de: {
      weekdays: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
      today: 'Heute',
      noEntry: 'Kein Eintrag an diesem Tag',
      mood: 'Stimmung',
      meals: 'Mahlzeiten',
      activities: 'Aktivitäten',
      incidents: 'Besonderheiten',
      nextSteps: 'Nächste Schritte',
    },
    en: {
      weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      today: 'Today',
      noEntry: 'No entry on this day',
      mood: 'Mood',
      meals: 'Meals',
      activities: 'Activities',
      incidents: 'Incidents',
      nextSteps: 'Next Steps',
    },
  };

  const texts = t[language];

  useEffect(() => {
    const fetchMonthEntries = async () => {
      if (!user) return;
      setLoading(true);
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

      let query = supabase
        .from('pflege_eintraege')
        .select('eintrags_datum, stimmung, person_name, mahlzeiten, aktivitaeten, besonderheiten, naechste_schritte')
        .eq('user_id', user.id)
        .gte('eintrags_datum', start)
        .lte('eintrags_datum', end)
        .order('eintrags_datum', { ascending: true });

      if (activePersonName) {
        query = query.eq('person_name', activePersonName);
      }

      const { data } = await query;

      if (data) setEntries(data as CalendarEntry[]);
      setLoading(false);
    };

    fetchMonthEntries();
  }, [user, currentMonth, activePersonName]);

  const entryMap = useMemo(() => {
    const map: Record<string, CalendarEntry> = {};
    entries.forEach((e) => { map[e.eintrags_datum] = e; });
    return map;
  }, [entries]);

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Pad start (Monday = 0)
    const startDay = (getDay(monthStart) + 6) % 7;
    const padding = Array(startDay).fill(null);

    return [...padding, ...allDays];
  }, [currentMonth]);

  const monthLabel = format(currentMonth, language === 'de' ? 'MMMM yyyy' : 'MMMM yyyy', {
    locale: language === 'de' ? deLocale : undefined,
  });

  const handleDayClick = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const entry = entryMap[dateStr];
    setSelectedEntry(entry || null);
  };

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-sans text-lg font-semibold text-foreground capitalize">{monthLabel}</h3>
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="border border-border rounded-xl overflow-hidden bg-card">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 bg-muted/50">
          {texts.weekdays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              if (!day) return <div key={`pad-${i}`} className="aspect-square border-t border-r border-border/50" />;

              const dateStr = format(day, 'yyyy-MM-dd');
              const entry = entryMap[dateStr];
              const isSelected = selectedEntry?.eintrags_datum === dateStr;
              const today = isToday(day);

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square border-t border-r border-border/50 flex flex-col items-center justify-center gap-0.5 text-sm transition-colors relative ${
                    isSelected
                      ? 'bg-primary/10 ring-2 ring-inset ring-primary'
                      : entry
                        ? 'hover:bg-primary/5 cursor-pointer'
                        : 'hover:bg-muted/30'
                  }`}
                >
                  <span className={`text-xs sm:text-sm ${today ? 'font-bold text-primary' : 'text-foreground'}`}>
                    {format(day, 'd')}
                  </span>
                  {entry && (
                    <span className={`w-3 h-3 rounded-full ${getMoodColor(entry.stimmung)}`} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Empty state for month */}
      {!loading && entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <CalendarHeart className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-sans text-xl text-foreground mb-2">{language === 'de' ? 'Kein Eintrag in diesem Monat' : 'No entries this month'}</h3>
          <p className="text-sm text-muted-foreground max-w-xs font-body">{language === 'de' ? 'Erstelle heute den ersten Eintrag.' : 'Create your first entry today.'}</p>
          {onSelectDate && (
            <Button onClick={() => onSelectDate(format(new Date(), 'yyyy-MM-dd'))} className="mt-6 rounded-lg min-h-[44px]">
              {language === 'de' ? 'Heutigen Eintrag erstellen' : 'Create today\'s entry'}
            </Button>
          )}
        </div>
      )}

      {/* Selected Entry Detail */}
      {selectedEntry && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{MOODS[selectedEntry.stimmung - 1]}</span>
              <div>
                <CardTitle className="text-sm font-semibold">{selectedEntry.person_name}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(selectedEntry.eintrags_datum + 'T00:00:00'), language === 'de' ? 'dd. MMMM yyyy' : 'MMMM dd, yyyy', {
                    locale: language === 'de' ? deLocale : undefined,
                  })}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {selectedEntry.mahlzeiten && (
              <div><span className="font-medium text-foreground">{texts.meals}:</span> <span className="text-muted-foreground">{selectedEntry.mahlzeiten}</span></div>
            )}
            {selectedEntry.aktivitaeten && (
              <div><span className="font-medium text-foreground">{texts.activities}:</span> <span className="text-muted-foreground">{selectedEntry.aktivitaeten}</span></div>
            )}
            {selectedEntry.besonderheiten && (
              <div><span className="font-medium text-foreground">{texts.incidents}:</span> <span className="text-muted-foreground">{selectedEntry.besonderheiten}</span></div>
            )}
            {selectedEntry.naechste_schritte && (
              <div><span className="font-medium text-foreground">{texts.nextSteps}:</span> <span className="text-muted-foreground">{selectedEntry.naechste_schritte}</span></div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PflegeKalender;

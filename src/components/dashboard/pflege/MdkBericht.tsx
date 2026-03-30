import { useState, useMemo, useRef } from 'react';
import { Loader2, Printer, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format, subWeeks } from 'date-fns';
import { de as deLocale } from 'date-fns/locale';
import PflegePersonSelector from './PflegePersonSelector';

const MOODS = ['', '😢', '😕', '😐', '🙂', '😊'];

const PERIOD_OPTIONS = [
  { weeks: 2, de: 'Letzte 2 Wochen', en: 'Last 2 weeks' },
  { weeks: 4, de: 'Letzte 4 Wochen', en: 'Last 4 weeks' },
  { weeks: 8, de: 'Letzte 8 Wochen', en: 'Last 8 weeks' },
];

interface MdkBerichtProps {
  activePersonName?: string;
}

const MdkBericht = ({ activePersonName = '' }: MdkBerichtProps) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const printRef = useRef<HTMLDivElement>(null);
  const [periodWeeks, setPeriodWeeks] = useState(4);
  const selectedPerson = activePersonName;

  const startDate = useMemo(() => format(subWeeks(new Date(), periodWeeks), 'yyyy-MM-dd'), [periodWeeks]);
  const endDate = format(new Date(), 'yyyy-MM-dd');

  const { data, isLoading } = useQuery({
    queryKey: [...queryKeys.pflegeEintraege(user?.id ?? ''), 'mdk', startDate, selectedPerson],
    queryFn: async () => {
      let pflegeQuery = supabase
        .from('pflege_eintraege')
        .select('*')
        .eq('user_id', user!.id)
        .gte('eintrags_datum', startDate)
        .order('eintrags_datum', { ascending: true });

      if (selectedPerson && selectedPerson !== '__all__') {
        pflegeQuery = pflegeQuery.eq('person_name', selectedPerson);
      }

      const [pflegeRes, medsRes] = await Promise.all([
        pflegeQuery,
        supabase
          .from('medikamente')
          .select('name,dosierung,einnahmezeiten,aktiv,person_name')
          .eq('user_id', user!.id)
          .eq('aktiv', true),
      ]);

      const pflege = pflegeRes.data ?? [];
      let meds = medsRes.data ?? [];
      if (selectedPerson && selectedPerson !== '__all__') {
        meds = meds.filter(m => m.person_name === selectedPerson || !m.person_name);
      }

      return { pflege, meds };
    },
    enabled: !!user,
  });

  const t = {
    de: {
      title: 'MDK-Bericht',
      subtitle: 'Zusammenfassung für den Medizinischen Dienst',
      period: 'Zeitraum',
      person: 'Person',
      avgMood: 'Durchschnittliche Stimmung',
      daysWithEntries: 'Tage mit Einträgen',
      daysWithout: 'Tage ohne Einträge',
      totalDays: 'Gesamttage',
      medications: 'Aktive Medikamente',
      noMeds: 'Keine aktiven Medikamente dokumentiert',
      incidents: 'Besonderheiten (chronologisch)',
      noIncidents: 'Keine Besonderheiten im Zeitraum dokumentiert',
      noData: 'Keine Pflegeeinträge im gewählten Zeitraum',
      print: 'Drucken / PDF',
      dosierung: 'Dosierung',
      zeiten: 'Einnahmezeiten',
      generatedOn: 'Erstellt am',
      meals: 'Mahlzeiten',
      activities: 'Aktivitäten',
      nextSteps: 'Nächste Schritte',
    },
    en: {
      title: 'MDK Report',
      subtitle: 'Summary for the Medical Assessment Service',
      period: 'Period',
      person: 'Person',
      avgMood: 'Average Mood',
      daysWithEntries: 'Days with entries',
      daysWithout: 'Days without entries',
      totalDays: 'Total days',
      medications: 'Active Medications',
      noMeds: 'No active medications documented',
      incidents: 'Notable Events (chronological)',
      noIncidents: 'No notable events documented in this period',
      noData: 'No care entries in selected period',
      print: 'Print / PDF',
      dosierung: 'Dosage',
      zeiten: 'Schedule',
      generatedOn: 'Generated on',
      meals: 'Meals',
      activities: 'Activities',
      nextSteps: 'Next steps',
    },
  };

  const texts = t[language];

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const pflege = data?.pflege ?? [];
  const meds = data?.meds ?? [];

  // Calculate stats
  const totalDays = periodWeeks * 7;
  const uniqueDays = new Set(pflege.map(p => p.eintrags_datum)).size;
  const daysWithout = totalDays - uniqueDays;
  const avgMood = pflege.length > 0
    ? (pflege.reduce((sum, p) => sum + p.stimmung, 0) / pflege.length).toFixed(1)
    : '–';
  const avgMoodEmoji = pflege.length > 0 ? MOODS[Math.round(Number(avgMood))] || '' : '';

  const incidents = pflege.filter(p => p.besonderheiten?.trim());

  const formatDate = (d: string) => {
    const date = new Date(d + 'T00:00:00');
    return format(date, language === 'de' ? 'dd.MM.yyyy' : 'MM/dd/yyyy', {
      locale: language === 'de' ? deLocale : undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center print:hidden">
        <PflegePersonSelector value={selectedPerson} onChange={setSelectedPerson} showAllOption className="w-full sm:w-auto" />
        <div className="flex gap-2">
          {PERIOD_OPTIONS.map(opt => (
            <button
              key={opt.weeks}
              onClick={() => setPeriodWeeks(opt.weeks)}
              className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                periodWeeks === opt.weeks
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/30 border border-border text-foreground hover:border-primary'
              }`}
            >
              {opt[language]}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={handlePrint} className="ml-auto min-h-[44px] print:hidden">
          <Printer className="h-4 w-4 mr-2" />
          {texts.print}
        </Button>
      </div>

      {/* Printable Report */}
      <div ref={printRef} className="space-y-6 print:space-y-4">
        {/* Header */}
        <div className="text-center border-b border-border pb-4 print:pb-2">
          <h2 className="text-xl font-semibold text-foreground">{texts.title}</h2>
          <p className="text-sm text-muted-foreground">{texts.subtitle}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {texts.period}: {formatDate(startDate)} – {formatDate(endDate)}
            {selectedPerson && selectedPerson !== '__all__' && ` · ${texts.person}: ${selectedPerson}`}
          </p>
        </div>

        {pflege.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">{texts.noData}</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card>
                <CardContent className="py-4 px-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{avgMoodEmoji} {avgMood}</p>
                  <p className="text-xs text-muted-foreground mt-1">{texts.avgMood}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4 px-4 text-center">
                  <p className="text-2xl font-bold text-primary">{uniqueDays}</p>
                  <p className="text-xs text-muted-foreground mt-1">{texts.daysWithEntries}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4 px-4 text-center">
                  <p className="text-2xl font-bold text-muted-foreground">{daysWithout}</p>
                  <p className="text-xs text-muted-foreground mt-1">{texts.daysWithout}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4 px-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{totalDays}</p>
                  <p className="text-xs text-muted-foreground mt-1">{texts.totalDays}</p>
                </CardContent>
              </Card>
            </div>

            {/* Medications */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">{texts.medications}</h3>
              {meds.length === 0 ? (
                <p className="text-sm text-muted-foreground">{texts.noMeds}</p>
              ) : (
                <div className="space-y-2">
                  {meds.map(med => (
                    <Card key={med.name} className="border-border">
                      <CardContent className="py-3 px-4">
                        <p className="text-sm font-medium text-foreground">{med.name}</p>
                        {med.dosierung && <p className="text-xs text-muted-foreground">{texts.dosierung}: {med.dosierung}</p>}
                        {med.einnahmezeiten && <p className="text-xs text-muted-foreground">{texts.zeiten}: {med.einnahmezeiten}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Incidents */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">{texts.incidents}</h3>
              {incidents.length === 0 ? (
                <p className="text-sm text-muted-foreground">{texts.noIncidents}</p>
              ) : (
                <div className="space-y-2">
                  {incidents.map((entry, i) => (
                    <Card key={entry.id || i} className="border-border">
                      <CardContent className="py-3 px-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm">{MOODS[entry.stimmung]}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(entry.eintrags_datum)}</span>
                          {entry.person_name && <span className="text-xs text-muted-foreground">· {entry.person_name}</span>}
                        </div>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{entry.besonderheiten}</p>
                        {entry.mahlzeiten && <p className="text-xs text-muted-foreground mt-1">{texts.meals}: {entry.mahlzeiten}</p>}
                        {entry.aktivitaeten && <p className="text-xs text-muted-foreground">{texts.activities}: {entry.aktivitaeten}</p>}
                        {entry.naechste_schritte && <p className="text-xs text-muted-foreground">{texts.nextSteps}: {entry.naechste_schritte}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <p className="text-[10px] text-muted-foreground text-center pt-4 border-t border-border">
          {texts.generatedOn}: {format(new Date(), language === 'de' ? 'dd.MM.yyyy, HH:mm' : 'MM/dd/yyyy, HH:mm', {
            locale: language === 'de' ? deLocale : undefined,
          })} · Mein Lebensanker
        </p>
      </div>
    </div>
  );
};

export default MdkBericht;

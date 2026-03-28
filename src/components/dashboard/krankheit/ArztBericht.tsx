import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Loader2, Printer, Download, TrendingUp, TrendingDown, Minus,
  FileText, ArrowRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { format, subDays, subMonths, differenceInDays, eachDayOfInterval, parseISO } from 'date-fns';
import { de as deLocale } from 'date-fns/locale';
import { usePdfExport } from '@/hooks/usePdfExport';

interface Checkin {
  id: string;
  energie: number;
  schmerz: number;
  schlaf: number;
  stimmung: number;
  notiz: string | null;
  checkin_datum: string;
}

interface Medikament {
  id: string;
  name: string;
  dosierung: string | null;
  einnahmezeiten: string | null;
  arzt: string | null;
}

type Period = '2w' | '4w' | '3m';

const ArztBericht = () => {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [meds, setMeds] = useState<Medikament[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('4w');
  const reportRef = useRef<HTMLDivElement>(null);

  const t = language === 'de' ? {
    title: 'Arztbericht',
    subtitle: 'Symptom-Verlaufsbericht',
    createdOn: 'Erstellt am',
    period: 'Zeitraum',
    createdWith: 'Erstellt mit Mein Lebensanker (mein-lebensanker.de)',
    p2w: 'Letzte 2 Wochen',
    p4w: 'Letzte 4 Wochen',
    p3m: 'Letzte 3 Monate',
    summary: 'Zusammenfassung',
    trend: 'Verlaufsgrafik',
    scale: 'Skala 1 (sehr schlecht) bis 5 (sehr gut)',
    findings: 'Auffälligkeiten',
    worstDay: 'Schlechtester Tag',
    bestDay: 'Bester Tag',
    missedDays: 'Tage ohne Check-in in diesem Zeitraum',
    medications: 'Aktuelle Medikamente',
    noMeds: 'Keine Medikamente hinterlegt.',
    notes: 'Notizen',
    name: 'Name',
    dosierung: 'Dosierung',
    einnahmezeiten: 'Einnahmezeiten',
    arzt: 'Arzt',
    energie: 'Energie',
    schmerz: 'Schmerz',
    schlaf: 'Schlaf',
    stimmung: 'Stimmung',
    avg: 'Ø',
    print: 'Drucken',
    pdf: 'Als PDF',
    emptyTitle: 'Noch nicht genug Daten',
    emptyText: (count: number) =>
      `Du brauchst mindestens 5 Check-ins für einen aussagekräftigen Bericht. Du hast aktuell ${count}. Noch ${5 - count} weitere — dann kannst du deinen Arzt mit echten Daten überraschen.`,
    patientLabel: 'Patient:in',
  } : {
    title: 'Doctor Report',
    subtitle: 'Symptom Progress Report',
    createdOn: 'Created on',
    period: 'Period',
    createdWith: 'Created with Mein Lebensanker (mein-lebensanker.de)',
    p2w: 'Last 2 weeks',
    p4w: 'Last 4 weeks',
    p3m: 'Last 3 months',
    summary: 'Summary',
    trend: 'Progress Chart',
    scale: 'Scale 1 (very poor) to 5 (very good)',
    findings: 'Notable Findings',
    worstDay: 'Worst day',
    bestDay: 'Best day',
    missedDays: 'Days without check-in in this period',
    medications: 'Current Medications',
    noMeds: 'No medications recorded.',
    notes: 'Notes',
    name: 'Name',
    dosierung: 'Dosage',
    einnahmezeiten: 'Schedule',
    arzt: 'Doctor',
    energie: 'Energy',
    schmerz: 'Pain',
    schlaf: 'Sleep',
    stimmung: 'Mood',
    avg: 'Avg',
    print: 'Print',
    pdf: 'Export PDF',
    emptyTitle: 'Not enough data yet',
    emptyText: (count: number) =>
      `You need at least 5 check-ins for a meaningful report. You have ${count} so far. ${5 - count} more to go — then you can surprise your doctor with real data.`,
    patientLabel: 'Patient',
  };

  // Data loading
  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      const since = format(subMonths(new Date(), 3), 'yyyy-MM-dd');
      const [checkinsRes, medsRes] = await Promise.all([
        supabase
          .from('symptom_checkins')
          .select('id, energie, schmerz, schlaf, stimmung, notiz, checkin_datum')
          .eq('user_id', user.id)
          .gte('checkin_datum', since)
          .order('checkin_datum', { ascending: true }),
        supabase
          .from('medikamente')
          .select('id, name, dosierung, einnahmezeiten, arzt')
          .eq('user_id', user.id)
          .eq('aktiv', true),
      ]);
      if (checkinsRes.data) setCheckins(checkinsRes.data as Checkin[]);
      if (medsRes.data) setMeds(medsRes.data as Medikament[]);
      setLoading(false);
    };
    load();
  }, [user]);

  // Filter checkins by period
  const filteredCheckins = useMemo(() => {
    const now = new Date();
    const cutoff = period === '2w' ? subDays(now, 14) : period === '4w' ? subDays(now, 28) : subMonths(now, 3);
    const cutoffStr = format(cutoff, 'yyyy-MM-dd');
    return checkins.filter(c => c.checkin_datum >= cutoffStr);
  }, [checkins, period]);

  // Calculations
  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const metrics = useMemo(() => {
    if (filteredCheckins.length === 0) return null;
    const keys = ['energie', 'schmerz', 'schlaf', 'stimmung'] as const;
    const mid = Math.floor(filteredCheckins.length / 2);
    const firstHalf = filteredCheckins.slice(0, mid);
    const secondHalf = filteredCheckins.slice(mid);

    return keys.map(key => {
      const allVals = filteredCheckins.map(c => c[key]);
      const average = avg(allVals);
      const firstAvg = avg(firstHalf.map(c => c[key]));
      const secondAvg = avg(secondHalf.map(c => c[key]));
      const diff = secondAvg - firstAvg;
      const trend: 'up' | 'down' | 'stable' = diff > 0.3 ? 'up' : diff < -0.3 ? 'down' : 'stable';
      return { key, average, trend };
    });
  }, [filteredCheckins]);

  const findings = useMemo(() => {
    if (filteredCheckins.length === 0) return null;
    const totalScore = (c: Checkin) => c.energie + c.schlaf + c.stimmung - c.schmerz;
    const sorted = [...filteredCheckins].sort((a, b) => totalScore(a) - totalScore(b));
    const worst = sorted[0];
    const best = sorted[sorted.length - 1];

    const now = new Date();
    const cutoff = period === '2w' ? subDays(now, 14) : period === '4w' ? subDays(now, 28) : subMonths(now, 3);
    const totalDays = differenceInDays(now, cutoff) + 1;
    const checkinDates = new Set(filteredCheckins.map(c => c.checkin_datum));
    const allDays = eachDayOfInterval({ start: cutoff, end: now });
    const missedDays = allDays.filter(d => !checkinDates.has(format(d, 'yyyy-MM-dd'))).length;

    return { worst, best, missedDays, totalDays };
  }, [filteredCheckins, period]);

  const notesEntries = useMemo(() =>
    filteredCheckins.filter(c => c.notiz && c.notiz.trim().length > 0),
  [filteredCheckins]);

  const formatDateShort = (d: string) =>
    format(parseISO(d), language === 'de' ? 'dd.MM.' : 'MM/dd');

  const formatDateLong = (d: string) =>
    format(parseISO(d), language === 'de' ? 'dd.MM.yyyy' : 'yyyy-MM-dd');

  const periodLabel = period === '2w' ? t.p2w : period === '4w' ? t.p4w : t.p3m;

  // PDF export
  const exportPdf = usePdfExport({
    contentRef: reportRef,
    documentTitle: 'Arztbericht',
    toastMessages: {
      preparing: language === 'de' ? 'PDF wird erstellt…' : 'Creating PDF…',
      success: language === 'de' ? 'PDF erstellt!' : 'PDF created!',
      error: language === 'de' ? 'Fehler beim PDF-Erstellen' : 'Error creating PDF',
    },
  });

  const handlePrint = () => window.print();

  const metricLabels: Record<string, string> = {
    energie: t.energie,
    schmerz: t.schmerz,
    schlaf: t.schlaf,
    stimmung: t.stimmung,
  };

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Empty state
  if (filteredCheckins.length < 5) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-serif text-xl text-foreground mb-2">{t.emptyTitle}</h3>
        <p className="text-sm text-muted-foreground max-w-xs font-body">
          {t.emptyText(filteredCheckins.length)}
        </p>
      </div>
    );
  }

  const chartData = filteredCheckins.map(c => ({
    date: formatDateShort(c.checkin_datum),
    [t.energie]: c.energie,
    [t.schmerz]: c.schmerz,
    [t.schlaf]: c.schlaf,
    [t.stimmung]: c.stimmung,
  }));

  const fromDate = formatDateLong(filteredCheckins[0].checkin_datum);
  const toDate = formatDateLong(filteredCheckins[filteredCheckins.length - 1].checkin_datum);
  const today = format(new Date(), language === 'de' ? 'dd.MM.yyyy' : 'yyyy-MM-dd');

  return (
    <div className="space-y-6">
      {/* Period selector + action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex gap-2 flex-wrap">
          {(['2w', '4w', '3m'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium min-h-[44px] transition-colors ${
                period === p
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-primary text-primary hover:bg-primary/10'
              }`}
            >
              {p === '2w' ? t.p2w : p === '4w' ? t.p4w : t.p3m}
            </button>
          ))}
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={handlePrint} className="min-h-[44px]">
            <Printer className="h-4 w-4 mr-2" />
            {t.print}
          </Button>
          <Button size="sm" onClick={exportPdf} className="min-h-[44px]">
            <Download className="h-4 w-4 mr-2" />
            {t.pdf}
          </Button>
        </div>
      </div>

      {/* Report preview */}
      <div ref={reportRef}>
        <Card className="bg-card rounded-2xl shadow-card print:shadow-none print:border-0">
          <CardContent className="p-6 sm:p-8 space-y-8" data-pdf-section>
            {/* Header */}
            <div className="space-y-1">
              <h2 className="font-serif text-2xl text-foreground">{t.subtitle}</h2>
              {profile?.full_name && (
                <p className="text-sm text-foreground">{t.patientLabel}: {profile.full_name}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {t.createdOn} {today} | {t.period}: {fromDate} – {toDate}
              </p>
              <p className="text-xs text-muted-foreground">{t.createdWith}</p>
            </div>

            {/* Section 1: Summary metrics */}
            <div data-pdf-section>
              <h3 className="font-serif text-lg text-foreground mb-3">{t.summary}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {metrics?.map(m => (
                  <div key={m.key} className="text-center p-4 rounded-xl border border-border bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">{t.avg} {metricLabels[m.key]}</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl font-bold text-foreground">{m.average.toFixed(1)}</span>
                      <TrendIcon trend={m.trend} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Chart */}
            <div data-pdf-section>
              <h3 className="font-serif text-lg text-foreground mb-1">{t.trend}</h3>
              <p className="text-xs text-muted-foreground mb-3">{t.scale}</p>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis domain={[1, 5]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                        fontSize: '0.75rem',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.7rem' }} />
                    <Line type="monotone" dataKey={t.energie} stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey={t.schmerz} stroke="#e57373" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey={t.schlaf} stroke="#7986cb" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey={t.stimmung} stroke="#81c784" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Section 3: Findings */}
            {findings && (
              <div data-pdf-section>
                <h3 className="font-serif text-lg text-foreground mb-2">{t.findings}</h3>
                <ul className="space-y-1.5 text-sm text-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>{t.worstDay}: {formatDateLong(findings.worst.checkin_datum)} — {t.energie} {findings.worst.energie}/5, {t.schmerz} {findings.worst.schmerz}/5</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>{t.bestDay}: {formatDateLong(findings.best.checkin_datum)}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>{t.missedDays}: {findings.missedDays}</span>
                  </li>
                </ul>
              </div>
            )}

            {/* Section 4: Medications */}
            <div data-pdf-section>
              <h3 className="font-serif text-lg text-foreground mb-2">{t.medications}</h3>
              {meds.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.noMeds}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4 text-muted-foreground font-medium">{t.name}</th>
                        <th className="text-left py-2 pr-4 text-muted-foreground font-medium">{t.dosierung}</th>
                        <th className="text-left py-2 pr-4 text-muted-foreground font-medium">{t.einnahmezeiten}</th>
                        <th className="text-left py-2 text-muted-foreground font-medium">{t.arzt}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {meds.map(m => (
                        <tr key={m.id} className="border-b border-border/50">
                          <td className="py-2 pr-4 text-foreground">{m.name}</td>
                          <td className="py-2 pr-4 text-foreground">{m.dosierung || '—'}</td>
                          <td className="py-2 pr-4 text-foreground">{m.einnahmezeiten || '—'}</td>
                          <td className="py-2 text-foreground">{m.arzt || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Section 5: Notes */}
            {notesEntries.length > 0 && (
              <div data-pdf-section>
                <h3 className="font-serif text-lg text-foreground mb-2">{t.notes}</h3>
                <ul className="space-y-1 text-sm">
                  {notesEntries.map(c => (
                    <li key={c.id} className="text-foreground">
                      <span className="text-muted-foreground">{formatDateLong(c.checkin_datum)}:</span>{' '}
                      {c.notiz}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ArztBericht;

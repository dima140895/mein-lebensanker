import { useState, useEffect, useRef } from 'react';
import { Loader2, Printer } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { de as deLocale } from 'date-fns/locale';

interface Checkin {
  id: string;
  energie: number;
  schmerz: number;
  schlaf: number;
  stimmung: number;
  notiz: string | null;
  checkin_datum: string;
}

const MeinVerlauf = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [entries, setEntries] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const t = {
    de: {
      chart: 'Verlauf der letzten 30 Tage',
      recent: 'Letzte Einträge',
      date: 'Datum',
      energie: 'Energie',
      schmerz: 'Schmerz',
      schlaf: 'Schlaf',
      stimmung: 'Stimmung',
      notiz: 'Notiz',
      noData: 'Noch keine Check-in-Daten vorhanden',
      noDataDesc: 'Starte mit Deinem ersten Tages-Check-in.',
      report: 'Arzttermin-Zusammenfassung',
      generateReport: 'Arzttermin-Zusammenfassung erstellen',
      print: 'Drucken',
      close: 'Schließen',
      period: 'Zeitraum',
      avg: 'Durchschnitt',
      notable: 'Auffällige Tage',
      summary: (avg: { e: string; s: string; sl: string; st: string }, days: number) =>
        `In den letzten ${days} Tagen war Ihre Energie durchschnittlich bei ${avg.e}/10, das Schmerzniveau bei ${avg.s}/10 (höher = weniger Schmerz), die Schlafqualität bei ${avg.sl}/10 und die Stimmung bei ${avg.st}/10.`,
      lowDay: (date: string, metric: string, val: number) => `${date}: ${metric} besonders niedrig (${val}/10)`,
      highDay: (date: string, metric: string, val: number) => `${date}: ${metric} besonders hoch (${val}/10)`,
    },
    en: {
      chart: 'Last 30 days trend',
      recent: 'Recent entries',
      date: 'Date',
      energie: 'Energy',
      schmerz: 'Pain',
      schlaf: 'Sleep',
      stimmung: 'Mood',
      notiz: 'Note',
      noData: 'No check-in data yet',
      noDataDesc: 'Start with your first daily check-in.',
      report: 'Doctor Visit Summary',
      generateReport: 'Generate doctor visit summary',
      print: 'Print',
      close: 'Close',
      period: 'Period',
      avg: 'Average',
      notable: 'Notable days',
      summary: (avg: { e: string; s: string; sl: string; st: string }, days: number) =>
        `Over the last ${days} days, your energy averaged ${avg.e}/10, pain level ${avg.s}/10 (higher = less pain), sleep quality ${avg.sl}/10, and mood ${avg.st}/10.`,
      lowDay: (date: string, metric: string, val: number) => `${date}: ${metric} notably low (${val}/10)`,
      highDay: (date: string, metric: string, val: number) => `${date}: ${metric} notably high (${val}/10)`,
    },
  };

  const texts = t[language];

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      setLoading(true);
      const since = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      const { data } = await supabase
        .from('symptom_checkins')
        .select('*')
        .eq('user_id', user.id)
        .gte('checkin_datum', since)
        .order('checkin_datum', { ascending: true });

      if (data) setEntries(data as Checkin[]);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const formatDate = (d: string) =>
    format(new Date(d + 'T00:00:00'), language === 'de' ? 'dd.MM.' : 'MM/dd', {
      locale: language === 'de' ? deLocale : undefined,
    });

  const formatDateLong = (d: string) =>
    format(new Date(d + 'T00:00:00'), language === 'de' ? 'dd. MMMM yyyy' : 'MMMM dd, yyyy', {
      locale: language === 'de' ? deLocale : undefined,
    });

  // Report logic
  const generateReport = () => {
    setShowReport(true);
  };

  const avg = (arr: number[]) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : '0';

  const getOutliers = () => {
    if (entries.length < 3) return [];
    const metrics = [
      { key: 'energie' as const, label: texts.energie },
      { key: 'schmerz' as const, label: texts.schmerz },
      { key: 'schlaf' as const, label: texts.schlaf },
      { key: 'stimmung' as const, label: texts.stimmung },
    ];

    const outliers: string[] = [];
    metrics.forEach(({ key, label }) => {
      const values = entries.map((e) => e[key]);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const std = Math.sqrt(values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length);
      if (std < 0.5) return;

      entries.forEach((e) => {
        const val = e[key];
        if (val <= mean - 1.5 * std) {
          outliers.push(texts.lowDay(formatDateLong(e.checkin_datum), label, val));
        } else if (val >= mean + 1.5 * std) {
          outliers.push(texts.highDay(formatDateLong(e.checkin_datum), label, val));
        }
      });
    });
    return outliers;
  };

  const handlePrint = () => {
    if (reportRef.current) {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      printWindow.document.write(`
        <html><head><title>${texts.report}</title>
        <style>body{font-family:system-ui,sans-serif;padding:2rem;color:#333;line-height:1.6}
        h1{font-size:1.5rem;margin-bottom:0.5rem}h2{font-size:1.1rem;margin-top:1.5rem}
        ul{padding-left:1.2rem}li{margin:0.3rem 0}p{margin:0.5rem 0}
        .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin:1rem 0}
        .metric{text-align:center;padding:0.5rem;border:1px solid #ddd;border-radius:0.5rem}
        .metric .val{font-size:1.5rem;font-weight:bold}.metric .lbl{font-size:0.8rem;color:#666}</style></head>
        <body>${reportRef.current.innerHTML}</body></html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground font-medium">{texts.noData}</p>
        <p className="text-sm text-muted-foreground mt-1">{texts.noDataDesc}</p>
      </div>
    );
  }

  const chartData = entries.map((e) => ({
    date: formatDate(e.checkin_datum),
    [texts.energie]: e.energie,
    [texts.schmerz]: e.schmerz,
    [texts.schlaf]: e.schlaf,
    [texts.stimmung]: e.stimmung,
  }));

  const recentEntries = [...entries].reverse().slice(0, 10);
  const outliers = getOutliers();
  const averages = {
    e: avg(entries.map((e) => e.energie)),
    s: avg(entries.map((e) => e.schmerz)),
    sl: avg(entries.map((e) => e.schlaf)),
    st: avg(entries.map((e) => e.stimmung)),
  };

  return (
    <div className="space-y-6">
      {/* Chart */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">{texts.chart}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] sm:h-64 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 11 }} />
                <YAxis domain={[1, 10]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    fontSize: '0.8rem',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                <Line type="monotone" dataKey={texts.energie} stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey={texts.schmerz} stroke="#e57373" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey={texts.schlaf} stroke="#7986cb" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey={texts.stimmung} stroke="#81c784" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Entries Table */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">{texts.recent}</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">{texts.date}</TableHead>
                  <TableHead className="text-xs text-center">⚡</TableHead>
                  <TableHead className="text-xs text-center">😣</TableHead>
                  <TableHead className="text-xs text-center">😴</TableHead>
                  <TableHead className="text-xs text-center">😊</TableHead>
                  <TableHead className="text-xs">{texts.notiz}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEntries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="text-xs whitespace-nowrap">{formatDateLong(e.checkin_datum)}</TableCell>
                    <TableCell className="text-xs text-center font-medium">{e.energie}</TableCell>
                    <TableCell className="text-xs text-center font-medium">{e.schmerz}</TableCell>
                    <TableCell className="text-xs text-center font-medium">{e.schlaf}</TableCell>
                    <TableCell className="text-xs text-center font-medium">{e.stimmung}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">{e.notiz || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Doctor Summary Button */}
      <Button onClick={generateReport} variant="outline" className="w-full min-h-[44px]">
        <Printer className="h-4 w-4 mr-2" />
        {texts.generateReport}
      </Button>

      {/* Report Modal */}
      {showReport && (
        <Card className="border-2 border-primary/20 bg-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-serif">{texts.report}</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-1.5" />
                {texts.print}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowReport(false)}>
                {texts.close}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div ref={reportRef} className="space-y-4 text-sm">
              <div>
                <h2 className="font-semibold text-foreground">{texts.report}</h2>
                <p className="text-muted-foreground">
                  {texts.period}: {formatDateLong(entries[0].checkin_datum)} — {formatDateLong(entries[entries.length - 1].checkin_datum)} ({entries.length} {language === 'de' ? 'Einträge' : 'entries'})
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: '⚡', label: texts.energie, val: averages.e },
                  { icon: '😣', label: texts.schmerz, val: averages.s },
                  { icon: '😴', label: texts.schlaf, val: averages.sl },
                  { icon: '😊', label: texts.stimmung, val: averages.st },
                ].map((m) => (
                  <div key={m.label} className="text-center p-3 rounded-lg border border-border">
                    <span className="text-lg">{m.icon}</span>
                    <p className="text-xl font-bold text-foreground mt-1">{m.val}</p>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                  </div>
                ))}
              </div>

              <p className="text-foreground leading-relaxed">
                {texts.summary(averages, entries.length)}
              </p>

              {outliers.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{texts.notable}</h3>
                  <ul className="space-y-1">
                    {outliers.map((o, i) => (
                      <li key={i} className="text-muted-foreground text-sm">• {o}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MeinVerlauf;

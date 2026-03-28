import { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronUp, Trash2, Loader2, BookHeart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de as deLocale } from 'date-fns/locale';
import { trackEvent } from '@/lib/analytics';
import ReferralCard from '@/components/ReferralCard';

const MOODS = ['😢', '😕', '😐', '🙂', '😊'];

interface PflegeEintrag {
  id: string;
  person_name: string;
  stimmung: number;
  mahlzeiten: string | null;
  aktivitaeten: string | null;
  besonderheiten: string | null;
  naechste_schritte: string | null;
  eintrags_datum: string;
  created_at: string;
}

const PflegeTagebuch = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [entries, setEntries] = useState<PflegeEintrag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [todayExists, setTodayExists] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [showReferral, setShowReferral] = useState(false);
  // Form state
  const [personName, setPersonName] = useState('');
  const [stimmung, setStimmung] = useState(3);
  const [mahlzeiten, setMahlzeiten] = useState('');
  const [aktivitaeten, setAktivitaeten] = useState('');
  const [besonderheiten, setBesonderheiten] = useState('');
  const [naechsteSchritte, setNaechsteSchritte] = useState('');

  const t = {
    de: {
      addEntry: 'Heutigen Eintrag hinzufügen',
      alreadyExists: 'Heute wurde bereits ein Eintrag erstellt',
      personName: 'Name der pflegebedürftigen Person',
      mood: 'Stimmung heute',
      meals: 'Mahlzeiten',
      mealsPlaceholder: 'Was wurde heute gegessen?',
      activities: 'Aktivitäten',
      activitiesPlaceholder: 'Spaziergänge, Besuche, Übungen...',
      incidents: 'Besonderheiten / Vorfälle',
      incidentsPlaceholder: 'Auffälligkeiten, Vorfälle...',
      nextSteps: 'Nächste Schritte',
      nextStepsPlaceholder: 'Arzttermine, Anrufe, Erledigungen...',
      save: 'Eintrag speichern',
      saving: 'Speichern...',
      cancel: 'Abbrechen',
      noEntries: 'Noch keine Einträge vorhanden',
      noEntriesDesc: 'Starte mit Deinem ersten Pflege-Tagebucheintrag.',
      delete: 'Löschen',
      saved: 'Eintrag gespeichert',
      deleted: 'Eintrag gelöscht',
      error: 'Fehler beim Speichern',
    },
    en: {
      addEntry: 'Add today\'s entry',
      alreadyExists: 'An entry for today already exists',
      personName: 'Name of the person being cared for',
      mood: 'Mood today',
      meals: 'Meals',
      mealsPlaceholder: 'What was eaten today?',
      activities: 'Activities',
      activitiesPlaceholder: 'Walks, visits, exercises...',
      incidents: 'Incidents / Notes',
      incidentsPlaceholder: 'Anything notable...',
      nextSteps: 'Next Steps',
      nextStepsPlaceholder: 'Appointments, calls, tasks...',
      save: 'Save entry',
      saving: 'Saving...',
      cancel: 'Cancel',
      noEntries: 'No entries yet',
      noEntriesDesc: 'Start with your first care journal entry.',
      delete: 'Delete',
      saved: 'Entry saved',
      deleted: 'Entry deleted',
      error: 'Error saving',
    },
  };

  const texts = t[language];

  const fetchEntries = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('pflege_eintraege')
      .select('*')
      .eq('user_id', user.id)
      .order('eintrags_datum', { ascending: false });

    if (!error && data) {
      setEntries(data as PflegeEintrag[]);
      const today = format(new Date(), 'yyyy-MM-dd');
      setTodayExists(data.some((e: any) => e.eintrags_datum === today));

      // Pre-fill person name from most recent entry
      if (data.length > 0 && !personName) {
        setPersonName((data[0] as any).person_name || '');
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEntries();
  }, [user]);

  const handleSave = async () => {
    if (!user || !personName.trim()) return;
    setSaving(true);

    const { error } = await supabase.from('pflege_eintraege').insert({
      user_id: user.id,
      person_name: personName.trim(),
      stimmung,
      mahlzeiten: mahlzeiten.trim() || null,
      aktivitaeten: aktivitaeten.trim() || null,
      besonderheiten: besonderheiten.trim() || null,
      naechste_schritte: naechsteSchritte.trim() || null,
      eintrags_datum: format(new Date(), 'yyyy-MM-dd'),
    });

    if (error) {
      toast.error(texts.error);
    } else {
      // Track first entry
      if (entries.length === 0) {
        trackEvent('Erster_Pflegeeintrag');
      }
      toast.success(texts.saved);
      setShowForm(false);
      setMahlzeiten('');
      setAktivitaeten('');
      setBesonderheiten('');
      setNaechsteSchritte('');
      setStimmung(3);
      fetchEntries();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('pflege_eintraege').delete().eq('id', id);
    if (!error) {
      toast.success(texts.deleted);
      fetchEntries();
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return format(date, language === 'de' ? 'dd. MMMM yyyy' : 'MMMM dd, yyyy', {
      locale: language === 'de' ? deLocale : undefined,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Entry Button */}
      {!showForm && (
        <Button
          onClick={() => setShowForm(true)}
          disabled={todayExists}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          {todayExists ? texts.alreadyExists : texts.addEntry}
        </Button>
      )}

      {/* Entry Form */}
      {showForm && (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>{texts.personName} *</Label>
              <Input value={personName} onChange={(e) => setPersonName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>{texts.mood}</Label>
              <div className="flex gap-2">
                {MOODS.map((emoji, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setStimmung(i + 1)}
                    className={`text-2xl sm:text-3xl p-2 rounded-lg transition-all ${
                      stimmung === i + 1
                        ? 'bg-primary/10 ring-2 ring-primary scale-110'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{texts.meals}</Label>
              <Textarea value={mahlzeiten} onChange={(e) => setMahlzeiten(e.target.value)} placeholder={texts.mealsPlaceholder} rows={2} />
            </div>

            <div className="space-y-2">
              <Label>{texts.activities}</Label>
              <Textarea value={aktivitaeten} onChange={(e) => setAktivitaeten(e.target.value)} placeholder={texts.activitiesPlaceholder} rows={2} />
            </div>

            <div className="space-y-2">
              <Label>{texts.incidents}</Label>
              <Textarea value={besonderheiten} onChange={(e) => setBesonderheiten(e.target.value)} placeholder={texts.incidentsPlaceholder} rows={2} />
            </div>

            <div className="space-y-2">
              <Label>{texts.nextSteps}</Label>
              <Textarea value={naechsteSchritte} onChange={(e) => setNaechsteSchritte(e.target.value)} placeholder={texts.nextStepsPlaceholder} rows={2} />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving || !personName.trim()} className="w-full sm:w-auto min-h-[44px]">
                {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{texts.saving}</> : texts.save}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="w-full sm:w-auto min-h-[44px]">{texts.cancel}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entry List */}
      {entries.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookHeart className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-serif text-xl text-foreground mb-2">{language === 'de' ? 'Noch kein Eintrag' : 'No entries yet'}</h3>
          <p className="text-sm text-muted-foreground max-w-xs font-body">{language === 'de' ? 'Dokumentiere den heutigen Tag — Stimmung, Mahlzeiten, Besonderheiten.' : 'Document today — mood, meals, and notable events.'}</p>
          <Button onClick={() => setShowForm(true)} className="mt-6 rounded-lg min-h-[44px]">
            <Plus className="h-4 w-4 mr-2" />
            {language === 'de' ? 'Ersten Eintrag erstellen' : 'Create first entry'}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const isExpanded = expandedEntry === entry.id;
            return (
              <Card key={entry.id} className="border-border">
                <CardHeader
                  className="cursor-pointer py-3 px-4"
                  onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{MOODS[entry.stimmung - 1]}</span>
                      <div>
                        <CardTitle className="text-sm font-medium">{entry.person_name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{formatDate(entry.eintrags_datum)}</p>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0 pb-4 px-4 space-y-3 text-sm">
                    {entry.mahlzeiten && (
                      <div>
                        <p className="font-medium text-foreground">{texts.meals}</p>
                        <p className="text-muted-foreground whitespace-pre-wrap">{entry.mahlzeiten}</p>
                      </div>
                    )}
                    {entry.aktivitaeten && (
                      <div>
                        <p className="font-medium text-foreground">{texts.activities}</p>
                        <p className="text-muted-foreground whitespace-pre-wrap">{entry.aktivitaeten}</p>
                      </div>
                    )}
                    {entry.besonderheiten && (
                      <div>
                        <p className="font-medium text-foreground">{texts.incidents}</p>
                        <p className="text-muted-foreground whitespace-pre-wrap">{entry.besonderheiten}</p>
                      </div>
                    )}
                    {entry.naechste_schritte && (
                      <div>
                        <p className="font-medium text-foreground">{texts.nextSteps}</p>
                        <p className="text-muted-foreground whitespace-pre-wrap">{entry.naechste_schritte}</p>
                      </div>
                    )}
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-2" onClick={() => handleDelete(entry.id)}>
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />{texts.delete}
                    </Button>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PflegeTagebuch;

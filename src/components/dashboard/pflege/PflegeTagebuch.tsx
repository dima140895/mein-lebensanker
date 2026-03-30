import { useState, useEffect, useMemo } from 'react';
import { Plus, ChevronDown, ChevronUp, Trash2, Loader2, BookHeart, Pencil } from 'lucide-react';
import PflegeFirstEntryFlow from './PflegeFirstEntryFlow';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de as deLocale } from 'date-fns/locale';
import { trackEvent } from '@/lib/analytics';
import ReferralCard from '@/components/ReferralCard';
import PflegePersonSelector from '@/components/dashboard/pflege/PflegePersonSelector';

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
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PflegeEintrag | null>(null);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [showReferral, setShowReferral] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState('');
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
      edit: 'Bearbeiten',
      editTitle: 'Eintrag bearbeiten',
      updated: 'Eintrag aktualisiert',
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
      edit: 'Edit',
      editTitle: 'Edit entry',
      updated: 'Entry updated',
      noEntries: 'No entries yet',
      noEntriesDesc: 'Start with your first care journal entry.',
      delete: 'Delete',
      saved: 'Entry saved',
      deleted: 'Entry deleted',
      error: 'Error saving',
    },
  };

  const texts = t[language];

  const { data: entries = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.pflegeEintraege(user?.id ?? ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pflege_eintraege')
        .select('*')
        .eq('user_id', user!.id)
        .order('eintrags_datum', { ascending: false });
      if (error) throw error;
      return (data as PflegeEintrag[]) || [];
    },
    enabled: !!user,
  });

  const today = format(new Date(), 'yyyy-MM-dd');

  // Filter entries by selected person
  const filteredEntries = useMemo(() => {
    if (!selectedPerson || selectedPerson === '__all__') return entries;
    return entries.filter(e => e.person_name === selectedPerson);
  }, [entries, selectedPerson]);

  // Pre-fill person name from selected person or most recent entry
  useEffect(() => {
    if (entries.length > 0 && !personName) {
      const prefill = (selectedPerson && selectedPerson !== '__all__') ? selectedPerson : entries[0].person_name || '';
      setPersonName(prefill);
    }
  }, [entries, selectedPerson]);

  const createMutation = useMutation({
    mutationFn: async (newEintrag: {
      user_id: string;
      person_name: string;
      stimmung: number;
      mahlzeiten: string | null;
      aktivitaeten: string | null;
      besonderheiten: string | null;
      naechste_schritte: string | null;
      eintrags_datum: string;
    }) => {
      const { data, error } = await supabase
        .from('pflege_eintraege')
        .insert(newEintrag)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onMutate: async (newEintrag) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.pflegeEintraege(user!.id) });
      const previousData = queryClient.getQueryData(queryKeys.pflegeEintraege(user!.id));
      queryClient.setQueryData(queryKeys.pflegeEintraege(user!.id), (old: PflegeEintrag[] | undefined) =>
        [{ ...newEintrag, id: 'temp-' + Date.now(), created_at: new Date().toISOString() } as PflegeEintrag, ...(old || [])]
      );
      return { previousData };
    },
    onError: (_err, _newEintrag, context) => {
      queryClient.setQueryData(queryKeys.pflegeEintraege(user!.id), context?.previousData);
      toast.error(texts.error);
    },
    onSuccess: () => {
      if (entries.length === 0) {
        trackEvent('Erster_Pflegeeintrag');
        setShowReferral(true);
      }
      toast.success(texts.saved);
      resetForm();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pflegeEintraege(user!.id) });
      queryClient.invalidateQueries({ queryKey: ['pflege-personen', user!.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('pflege_eintraege').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.pflegeEintraege(user!.id) });
      const previousData = queryClient.getQueryData(queryKeys.pflegeEintraege(user!.id));
      queryClient.setQueryData(queryKeys.pflegeEintraege(user!.id), (old: PflegeEintrag[] | undefined) =>
        (old || []).filter((e) => e.id !== id)
      );
      return { previousData };
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(queryKeys.pflegeEintraege(user!.id), context?.previousData);
    },
    onSuccess: () => {
      toast.success(texts.deleted);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pflegeEintraege(user!.id) });
      queryClient.invalidateQueries({ queryKey: ['pflege-personen', user!.id] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updated: { id: string; person_name: string; stimmung: number; mahlzeiten: string | null; aktivitaeten: string | null; besonderheiten: string | null; naechste_schritte: string | null }) => {
      const { id, ...fields } = updated;
      const { error } = await supabase.from('pflege_eintraege').update(fields).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(texts.updated);
      resetForm();
    },
    onError: () => {
      toast.error(texts.error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pflegeEintraege(user!.id) });
      queryClient.invalidateQueries({ queryKey: ['pflege-personen', user!.id] });
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingEntry(null);
    setMahlzeiten('');
    setAktivitaeten('');
    setBesonderheiten('');
    setNaechsteSchritte('');
    setStimmung(3);
  };

  const startEdit = (entry: PflegeEintrag) => {
    setEditingEntry(entry);
    setPersonName(entry.person_name);
    setStimmung(entry.stimmung);
    setMahlzeiten(entry.mahlzeiten || '');
    setAktivitaeten(entry.aktivitaeten || '');
    setBesonderheiten(entry.besonderheiten || '');
    setNaechsteSchritte(entry.naechste_schritte || '');
    setShowForm(true);
    setExpandedEntry(null);
  };

  const handleSave = () => {
    if (!user || !personName.trim()) return;

    if (editingEntry) {
      updateMutation.mutate({
        id: editingEntry.id,
        person_name: personName.trim(),
        stimmung,
        mahlzeiten: mahlzeiten.trim() || null,
        aktivitaeten: aktivitaeten.trim() || null,
        besonderheiten: besonderheiten.trim() || null,
        naechste_schritte: naechsteSchritte.trim() || null,
      });
    } else {
      createMutation.mutate({
        user_id: user.id,
        person_name: personName.trim(),
        stimmung,
        mahlzeiten: mahlzeiten.trim() || null,
        aktivitaeten: aktivitaeten.trim() || null,
        besonderheiten: besonderheiten.trim() || null,
        naechste_schritte: naechsteSchritte.trim() || null,
        eintrags_datum: format(new Date(), 'yyyy-MM-dd'),
      });
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
      {/* Person Filter */}
      {entries.length > 0 && !showForm && (
        <PflegePersonSelector
          value={selectedPerson}
          onChange={(val) => {
            setSelectedPerson(val);
            if (val && val !== '__all__') setPersonName(val);
          }}
          showAllOption
          className="mb-2"
        />
      )}

      {/* Add Entry Button */}
      {!showForm && (
        <Button
          onClick={() => {
            if (selectedPerson && selectedPerson !== '__all__') setPersonName(selectedPerson);
            setShowForm(true);
          }}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          {texts.addEntry}
        </Button>
      )}

      {/* Entry Form */}
      {showForm && (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>{texts.personName} *</Label>
              <PflegePersonSelector value={personName} onChange={setPersonName} />
            </div>

            <div className="space-y-2">
              <Label>{texts.mood}</Label>
              <div className="flex gap-2" role="radiogroup" aria-label={texts.mood}>
                {MOODS.map((emoji, i) => {
                  const moodLabels = language === 'de'
                    ? ['Sehr schlecht', 'Schlecht', 'Neutral', 'Gut', 'Sehr gut']
                    : ['Very bad', 'Bad', 'Neutral', 'Good', 'Very good'];
                  return (
                    <button
                      key={i}
                      type="button"
                      role="radio"
                      aria-checked={stimmung === i + 1}
                      aria-label={`${moodLabels[i]}`}
                      onClick={() => setStimmung(i + 1)}
                      className={`text-2xl sm:text-3xl p-2 rounded-lg transition-all ${
                        stimmung === i + 1
                          ? 'bg-primary/10 ring-2 ring-primary scale-110'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {emoji}
                    </button>
                  );
                })}
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
              <Button onClick={handleSave} disabled={(createMutation.isPending || updateMutation.isPending) || !personName.trim()} className="w-full sm:w-auto min-h-[44px]">
                {(createMutation.isPending || updateMutation.isPending) ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{texts.saving}</> : texts.save}
              </Button>
              <Button variant="outline" onClick={resetForm} className="w-full sm:w-auto min-h-[44px]">{texts.cancel}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entry List */}
      {filteredEntries.length === 0 && !showForm ? (
        entries.length === 0 ? (
          <PflegeFirstEntryFlow
            onSave={(data) => {
              if (!user) return;
              createMutation.mutate({
                user_id: user.id,
                person_name: data.personName,
                stimmung: data.stimmung,
                mahlzeiten: data.mahlzeiten || null,
                aktivitaeten: data.aktivitaeten || null,
                besonderheiten: data.besonderheiten || null,
                naechste_schritte: data.naechsteSchritte || null,
                eintrags_datum: format(new Date(), 'yyyy-MM-dd'),
              });
            }}
            isSaving={createMutation.isPending}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookHeart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-sans text-xl text-foreground mb-2">{language === 'de' ? 'Keine Einträge für diese Person' : 'No entries for this person'}</h3>
            <p className="text-sm text-muted-foreground max-w-xs font-body">{language === 'de' ? 'Erstelle einen neuen Eintrag für diese Person.' : 'Create a new entry for this person.'}</p>
            <Button onClick={() => setShowForm(true)} className="mt-6 rounded-lg min-h-[44px]">
              <Plus className="h-4 w-4 mr-2" />
              {language === 'de' ? 'Eintrag erstellen' : 'Create entry'}
            </Button>
          </div>
        )
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => {
            const isExpanded = expandedEntry === entry.id;
            return (
              <Card key={entry.id} className="border-border">
                <CardHeader
                  className="cursor-pointer py-3 px-4"
                  onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                  role="button"
                  aria-expanded={isExpanded}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedEntry(isExpanded ? null : entry.id); } }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl" aria-hidden="true">{MOODS[entry.stimmung - 1]}</span>
                      <div>
                        <CardTitle className="text-sm font-medium">{entry.person_name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{formatDate(entry.eintrags_datum)}</p>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
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
                    <div className="flex gap-2 mt-2">
                      <Button variant="ghost" size="sm" className="hover:bg-muted" onClick={() => startEdit(entry)}>
                        <Pencil className="h-3.5 w-3.5 mr-1.5" />{texts.edit}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => deleteMutation.mutate(entry.id)} aria-label={`${texts.delete} ${entry.person_name} ${formatDate(entry.eintrags_datum)}`}>
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />{texts.delete}
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {showReferral && <ReferralCard />}
    </div>
  );
};

export default PflegeTagebuch;

import { useState, useEffect } from 'react';
import { Plus, Pill, X, Loader2, ToggleRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Medikament {
  id: string;
  name: string;
  dosierung: string | null;
  einnahmezeiten: string | null;
  arzt: string | null;
  aktiv: boolean;
  notizen: string | null;
}

const PflegeMedikamente = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [dosierung, setDosierung] = useState('');
  const [einnahmezeiten, setEinnahmezeiten] = useState('');
  const [arzt, setArzt] = useState('');

  const t = {
    de: {
      addMed: 'Medikament hinzufügen',
      name: 'Medikamentenname *',
      namePlaceholder: 'z.B. Ibuprofen',
      dosierung: 'Dosierung',
      dosierungPlaceholder: 'z.B. 400mg',
      einnahmezeiten: 'Einnahmezeiten',
      einnahmezeitenPlaceholder: 'z.B. Morgens und Abends',
      arzt: 'Verschreibender Arzt',
      arztPlaceholder: 'z.B. Dr. Müller',
      save: 'Speichern',
      saving: 'Speichern...',
      cancel: 'Abbrechen',
      setInactive: 'Inaktiv setzen',
      setActive: 'Wieder aktivieren',
      noMeds: 'Noch keine Medikamente eingetragen',
      noMedsDesc: 'Erfasse die aktuellen Medikamente der pflegebedürftigen Person.',
      active: 'Aktiv',
      inactive: 'Inaktiv',
      showInactive: 'Inaktive anzeigen',
      hideInactive: 'Inaktive ausblenden',
      saved: 'Medikament gespeichert',
      updated: 'Medikament aktualisiert',
      error: 'Fehler',
    },
    en: {
      addMed: 'Add medication',
      name: 'Medication name *',
      namePlaceholder: 'e.g. Ibuprofen',
      dosierung: 'Dosage',
      dosierungPlaceholder: 'e.g. 400mg',
      einnahmezeiten: 'Schedule',
      einnahmezeitenPlaceholder: 'e.g. Morning and Evening',
      arzt: 'Prescribing doctor',
      arztPlaceholder: 'e.g. Dr. Smith',
      save: 'Save',
      saving: 'Saving...',
      cancel: 'Cancel',
      setInactive: 'Set inactive',
      setActive: 'Reactivate',
      noMeds: 'No medications recorded',
      noMedsDesc: 'Record the current medications of the person being cared for.',
      active: 'Active',
      inactive: 'Inactive',
      showInactive: 'Show inactive',
      hideInactive: 'Hide inactive',
      saved: 'Medication saved',
      updated: 'Medication updated',
      error: 'Error',
    },
  };

  const texts = t[language];

  const { data: meds = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.medikamente(user?.id ?? ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medikamente')
        .select('*')
        .eq('user_id', user!.id)
        .order('aktiv', { ascending: false })
        .order('name', { ascending: true });
      if (error) throw error;
      return (data as Medikament[]) || [];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (newMed: {
      user_id: string;
      name: string;
      dosierung: string | null;
      einnahmezeiten: string | null;
      arzt: string | null;
    }) => {
      const { data, error } = await supabase.from('medikamente').insert(newMed).select().single();
      if (error) throw error;
      return data;
    },
    onMutate: async (newMed) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.medikamente(user!.id) });
      const prev = queryClient.getQueryData(queryKeys.medikamente(user!.id));
      queryClient.setQueryData(queryKeys.medikamente(user!.id), (old: Medikament[] | undefined) =>
        [{ ...newMed, id: 'temp-' + Date.now(), aktiv: true } as unknown as Medikament, ...(old || [])]
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      queryClient.setQueryData(queryKeys.medikamente(user!.id), ctx?.prev);
      toast.error(texts.error);
    },
    onSuccess: () => {
      toast.success(texts.saved);
      setShowForm(false);
      setName(''); setDosierung(''); setEinnahmezeiten(''); setArzt('');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medikamente(user!.id) });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, aktiv }: { id: string; aktiv: boolean }) => {
      const { error } = await supabase.from('medikamente').update({ aktiv: !aktiv }).eq('id', id);
      if (error) throw error;
    },
    onMutate: async ({ id, aktiv }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.medikamente(user!.id) });
      const prev = queryClient.getQueryData(queryKeys.medikamente(user!.id));
      queryClient.setQueryData(queryKeys.medikamente(user!.id), (old: Medikament[] | undefined) =>
        (old || []).map((m) => m.id === id ? { ...m, aktiv: !aktiv } : m)
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      queryClient.setQueryData(queryKeys.medikamente(user!.id), ctx?.prev);
    },
    onSuccess: () => {
      toast.success(texts.updated);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medikamente(user!.id) });
    },
  });

  const handleSave = () => {
    if (!user || !name.trim()) return;
    createMutation.mutate({
      user_id: user.id,
      name: name.trim(),
      dosierung: dosierung.trim() || null,
      einnahmezeiten: einnahmezeiten.trim() || null,
      arzt: arzt.trim() || null,
    });
  };

  const activeMeds = meds.filter((m) => m.aktiv);
  const inactiveMeds = meds.filter((m) => !m.aktiv);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top actions */}
      <div className="flex flex-wrap gap-2">
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            {texts.addMed}
          </Button>
        )}
        {inactiveMeds.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => setShowInactive(!showInactive)}>
            <ToggleRight className="h-4 w-4 mr-1.5" />
            {showInactive ? texts.hideInactive : texts.showInactive}
          </Button>
        )}
      </div>

      {/* Add Form */}
      {showForm && (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>{texts.name}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={texts.namePlaceholder} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{texts.dosierung}</Label>
                <Input value={dosierung} onChange={(e) => setDosierung(e.target.value)} placeholder={texts.dosierungPlaceholder} />
              </div>
              <div className="space-y-2">
                <Label>{texts.einnahmezeiten}</Label>
                <Input value={einnahmezeiten} onChange={(e) => setEinnahmezeiten(e.target.value)} placeholder={texts.einnahmezeitenPlaceholder} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{texts.arzt}</Label>
              <Input value={arzt} onChange={(e) => setArzt(e.target.value)} placeholder={texts.arztPlaceholder} />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button onClick={handleSave} disabled={createMutation.isPending || !name.trim()} className="w-full sm:w-auto min-h-[44px]">
                {createMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{texts.saving}</> : texts.save}
              </Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setName(''); setDosierung(''); setEinnahmezeiten(''); setArzt(''); }} className="w-full sm:w-auto min-h-[44px]">
                {texts.cancel}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Medications */}
      {activeMeds.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Pill className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-serif text-xl text-foreground mb-2">{language === 'de' ? 'Keine Medikamente hinterlegt' : 'No medications recorded'}</h3>
          <p className="text-sm text-muted-foreground max-w-xs font-body">{language === 'de' ? 'Füge Medikamente hinzu um den Überblick zu behalten.' : 'Add medications to keep track.'}</p>
          <Button onClick={() => setShowForm(true)} className="mt-6 rounded-lg min-h-[44px]">
            <Plus className="h-4 w-4 mr-2" />
            {language === 'de' ? 'Medikament hinzufügen' : 'Add medication'}
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {activeMeds.map((med) => (
            <Card key={med.id} className="border-border">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Pill className="h-4 w-4 text-primary flex-shrink-0" />
                    <CardTitle className="text-sm font-semibold">{med.name}</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">{texts.active}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-4 px-4 space-y-1.5 text-sm">
                {med.dosierung && <p className="text-muted-foreground"><span className="font-medium text-foreground">{texts.dosierung}:</span> {med.dosierung}</p>}
                {med.einnahmezeiten && <p className="text-muted-foreground"><span className="font-medium text-foreground">{texts.einnahmezeiten}:</span> {med.einnahmezeiten}</p>}
                {med.arzt && <p className="text-muted-foreground"><span className="font-medium text-foreground">{texts.arzt}:</span> {med.arzt}</p>}
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground mt-2" onClick={() => toggleMutation.mutate({ id: med.id, aktiv: med.aktiv })}>
                  <X className="h-3 w-3 mr-1" />{texts.setInactive}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Inactive Medications */}
      {showInactive && inactiveMeds.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground">{texts.inactive}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {inactiveMeds.map((med) => (
              <Card key={med.id} className="border-border opacity-60">
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Pill className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <CardTitle className="text-sm font-semibold text-muted-foreground">{med.name}</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs">{texts.inactive}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-4 px-4">
                  <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => toggleMutation.mutate({ id: med.id, aktiv: med.aktiv })}>
                    {texts.setActive}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PflegeMedikamente;

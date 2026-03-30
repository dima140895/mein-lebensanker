import { useState } from 'react';
import { Plus, Pill, X, Loader2, ToggleRight, Bell, Clock } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import PflegePersonSelector from './PflegePersonSelector';

interface Medikament {
  id: string;
  name: string;
  dosierung: string | null;
  einnahmezeiten: string | null;
  arzt: string | null;
  aktiv: boolean;
  notizen: string | null;
  erinnerung_aktiv: boolean;
  erinnerung_zeiten: string[] | null;
  person_name: string | null;
}

interface PflegeMedikamenteProps {
  activePersonName?: string;
}

const PflegeMedikamente = ({ activePersonName = '' }: PflegeMedikamenteProps) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const selectedPerson = activePersonName;

  // Form state
  const [name, setName] = useState('');
  const [dosierung, setDosierung] = useState('');
  const [einnahmezeiten, setEinnahmezeiten] = useState('');
  const [arzt, setArzt] = useState('');
  const [erinnerungAktiv, setErinnerungAktiv] = useState(false);
  const [erinnerungZeiten, setErinnerungZeiten] = useState<string[]>([]);

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
      reminderSection: 'Erinnerungen',
      reminderToggle: 'E-Mail-Erinnerung aktivieren',
      reminderHint: 'Du erhältst eine E-Mail wenn es Zeit für dieses Medikament ist.',
      addTime: '+ Zeit hinzufügen',
      reminderActive: 'Erinnerung',
      upgradeNeeded: 'Anker Plus',
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
      reminderSection: 'Reminders',
      reminderToggle: 'Enable email reminder',
      reminderHint: 'You will receive an email when it\'s time for this medication.',
      addTime: '+ Add time',
      reminderActive: 'Reminder',
      upgradeNeeded: 'Anker Plus',
    },
  };

  const texts = t[language];

  // Check subscription for reminder access
  const { data: subscription } = useQuery({
    queryKey: queryKeys.subscription(user?.id ?? ''),
    queryFn: async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('plan, status')
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .limit(1)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const hasPlusAccess = subscription && ['plus', 'familie'].includes(subscription.plan);

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
      return (data as unknown as Medikament[]) || [];
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
      erinnerung_aktiv: boolean;
      erinnerung_zeiten: string[];
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
      resetForm();
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

  const toggleReminderMutation = useMutation({
    mutationFn: async ({ id, erinnerung_aktiv }: { id: string; erinnerung_aktiv: boolean }) => {
      const { error } = await supabase.from('medikamente').update({ erinnerung_aktiv }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(texts.updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.medikamente(user!.id) });
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setName('');
    setDosierung('');
    setEinnahmezeiten('');
    setArzt('');
    setErinnerungAktiv(false);
    setErinnerungZeiten([]);
  };

  const handleSave = () => {
    if (!user || !name.trim()) return;
    createMutation.mutate({
      user_id: user.id,
      name: name.trim(),
      dosierung: dosierung.trim() || null,
      einnahmezeiten: einnahmezeiten.trim() || null,
      arzt: arzt.trim() || null,
      erinnerung_aktiv: hasPlusAccess ? erinnerungAktiv : false,
      erinnerung_zeiten: hasPlusAccess ? erinnerungZeiten : [],
      person_name: selectedPerson || null,
    } as any);
  };

  const addReminderTime = () => {
    if (erinnerungZeiten.length < 3) {
      setErinnerungZeiten([...erinnerungZeiten, '08:00']);
    }
  };

  const updateReminderTime = (index: number, value: string) => {
    const updated = [...erinnerungZeiten];
    updated[index] = value;
    setErinnerungZeiten(updated);
  };

  const removeReminderTime = (index: number) => {
    setErinnerungZeiten(erinnerungZeiten.filter((_, i) => i !== index));
  };

  const filteredMeds = selectedPerson
    ? meds.filter(m => (m as any).person_name === selectedPerson)
    : meds;
  const activeMeds = filteredMeds.filter((m) => m.aktiv);
  const inactiveMeds = filteredMeds.filter((m) => !m.aktiv);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Person selector */}
      <PflegePersonSelector value={selectedPerson} onChange={setSelectedPerson} />

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

            {/* Reminder section */}
            <div className="border-t border-border pt-4 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">{texts.reminderSection}</span>
                {!hasPlusAccess && (
                  <Badge variant="outline" className="text-xs bg-amber-light/50 text-amber border-amber/30">
                    {texts.upgradeNeeded}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="reminder-toggle" className="text-sm font-normal text-foreground cursor-pointer">
                  {texts.reminderToggle}
                </Label>
                <Switch
                  id="reminder-toggle"
                  checked={erinnerungAktiv}
                  onCheckedChange={(checked) => {
                    if (!hasPlusAccess) return;
                    setErinnerungAktiv(checked);
                    if (checked && erinnerungZeiten.length === 0) {
                      setErinnerungZeiten(['08:00']);
                    }
                  }}
                  disabled={!hasPlusAccess}
                />
              </div>

              {erinnerungAktiv && hasPlusAccess && (
                <div className="mt-3 space-y-2">
                  {erinnerungZeiten.map((zeit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <Input
                        type="time"
                        value={zeit}
                        onChange={(e) => updateReminderTime(index, e.target.value)}
                        className="w-32"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeReminderTime(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {erinnerungZeiten.length < 3 && (
                    <Button type="button" variant="ghost" size="sm" onClick={addReminderTime} className="text-xs text-primary">
                      {texts.addTime}
                    </Button>
                  )}
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-2">{texts.reminderHint}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button onClick={handleSave} disabled={createMutation.isPending || !name.trim()} className="w-full sm:w-auto min-h-[44px]">
                {createMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{texts.saving}</> : texts.save}
              </Button>
              <Button variant="outline" onClick={resetForm} className="w-full sm:w-auto min-h-[44px]">
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
          <h3 className="font-sans text-xl text-foreground mb-2">{language === 'de' ? 'Keine Medikamente hinterlegt' : 'No medications recorded'}</h3>
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
                    <div>
                      <CardTitle className="text-sm font-semibold">{med.name}</CardTitle>
                      {(med as any).person_name && !selectedPerson && (
                        <p className="text-xs text-muted-foreground">{(med as any).person_name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {med.erinnerung_aktiv && (
                      <Badge variant="outline" className="text-xs bg-amber-light/50 text-amber border-amber/30">
                        <Bell className="h-3 w-3 mr-1" />
                        {texts.reminderActive}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">{texts.active}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4 px-4 space-y-1.5 text-sm">
                {med.dosierung && <p className="text-muted-foreground"><span className="font-medium text-foreground">{texts.dosierung}:</span> {med.dosierung}</p>}
                {med.einnahmezeiten && <p className="text-muted-foreground"><span className="font-medium text-foreground">{texts.einnahmezeiten}:</span> {med.einnahmezeiten}</p>}
                {med.arzt && <p className="text-muted-foreground"><span className="font-medium text-foreground">{texts.arzt}:</span> {med.arzt}</p>}
                {med.erinnerung_aktiv && med.erinnerung_zeiten && med.erinnerung_zeiten.length > 0 && (
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">{texts.reminderSection}:</span>{' '}
                    {med.erinnerung_zeiten.map(z => z.substring(0, 5)).join(', ')} Uhr
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => toggleMutation.mutate({ id: med.id, aktiv: med.aktiv })}>
                    <X className="h-3 w-3 mr-1" />{texts.setInactive}
                  </Button>
                  {hasPlusAccess && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`text-xs ${med.erinnerung_aktiv ? 'text-amber' : 'text-muted-foreground'}`}
                      onClick={() => toggleReminderMutation.mutate({ id: med.id, erinnerung_aktiv: !med.erinnerung_aktiv })}
                    >
                      <Bell className="h-3 w-3 mr-1" />
                      {med.erinnerung_aktiv ? (language === 'de' ? 'Erinnerung aus' : 'Reminder off') : (language === 'de' ? 'Erinnerung an' : 'Reminder on')}
                    </Button>
                  )}
                </div>
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

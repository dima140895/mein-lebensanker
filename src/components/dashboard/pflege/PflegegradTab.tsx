import { useState, useEffect } from 'react';
import { CheckCircle2, Calculator, Edit2, Trash2, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import PflegegradRechner from '@/components/PflegegradRechner';
import PflegePersonSelector from './PflegePersonSelector';

const pflegegradInfo: Record<number, { de: string; en: string; leistungDe: string; leistungEn: string }> = {
  1: {
    de: 'Geringe Beeinträchtigung der Selbstständigkeit.',
    en: 'Minor impairment of independence.',
    leistungDe: '125 €/Monat Entlastungsbetrag',
    leistungEn: '€125/month relief amount',
  },
  2: {
    de: 'Erhebliche Beeinträchtigung der Selbstständigkeit.',
    en: 'Considerable impairment of independence.',
    leistungDe: '332 € Pflegegeld oder 761 € Sachleistungen/Monat',
    leistungEn: '€332 care allowance or €761 in-kind services/month',
  },
  3: {
    de: 'Schwere Beeinträchtigung der Selbstständigkeit.',
    en: 'Severe impairment of independence.',
    leistungDe: '573 € Pflegegeld oder 1.432 € Sachleistungen/Monat',
    leistungEn: '€573 care allowance or €1,432 in-kind services/month',
  },
  4: {
    de: 'Schwerste Beeinträchtigung der Selbstständigkeit.',
    en: 'Most severe impairment of independence.',
    leistungDe: '765 € Pflegegeld oder 1.778 € Sachleistungen/Monat',
    leistungEn: '€765 care allowance or €1,778 in-kind services/month',
  },
  5: {
    de: 'Schwerste Beeinträchtigung mit besonderen Anforderungen.',
    en: 'Most severe impairment with special demands.',
    leistungDe: '947 € Pflegegeld oder 2.200 € Sachleistungen/Monat',
    leistungEn: '€947 care allowance or €2,200 in-kind services/month',
  },
};

interface SavedPflegegrad {
  grad: number;
  datum: string;
  punkte?: number;
  quelle: 'manuell' | 'rechner';
  person_name?: string;
}

const PFLEGE_SECTION_KEY_BASE = '_pflege_pflegegrad';

const PflegegradTab = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isDE = language === 'de';

  const [savedGrad, setSavedGrad] = useState<SavedPflegegrad | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'overview' | 'manual' | 'rechner' | null>(null);
  const [selectedPerson, setSelectedPerson] = useState('');

  const sectionKey = selectedPerson
    ? `${PFLEGE_SECTION_KEY_BASE}_${selectedPerson.replace(/[^a-zA-Z0-9äöüÄÖÜß_-]/g, '_')}`
    : PFLEGE_SECTION_KEY_BASE;

  // Load saved pflegegrad
  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      setSavedGrad(null);
      setMode(null);
      try {
        const { data, error } = await supabase
          .from('vorsorge_data')
          .select('data')
          .eq('user_id', user.id)
          .eq('section_key', sectionKey)
          .is('person_profile_id', null)
          .maybeSingle();

        if (error) throw error;
        if (data?.data) {
          setSavedGrad(data.data as unknown as SavedPflegegrad);
        }
      } catch (error) {
        logger.error('Error loading pflegegrad:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, sectionKey]);

  const savePflegegrad = async (grad: SavedPflegegrad) => {
    if (!user) return;
    try {
      // Try update first, then insert if not exists
      const { data: existing } = await supabase
        .from('vorsorge_data')
        .select('id')
        .eq('user_id', user.id)
        .eq('section_key', PFLEGE_SECTION_KEY)
        .is('person_profile_id', null)
        .maybeSingle();

      let error;
      if (existing) {
        ({ error } = await supabase
          .from('vorsorge_data')
          .update({
            data: grad as unknown as Json,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id));
      } else {
        const insertRow: { user_id: string; section_key: string; data: Json } = {
          user_id: user.id,
          section_key: PFLEGE_SECTION_KEY,
          data: grad as unknown as Json,
        };
        ({ error } = await supabase
          .from('vorsorge_data')
          .insert(insertRow));
      }

      if (error) throw error;
      setSavedGrad(grad);
      setMode('overview');
      toast.success(isDE ? 'Pflegegrad gespeichert' : 'Care level saved');
    } catch (error) {
      logger.error('Error saving pflegegrad:', error);
      toast.error(isDE ? 'Fehler beim Speichern' : 'Error saving');
    }
  };

  const deletePflegegrad = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('vorsorge_data')
        .delete()
        .eq('user_id', user.id)
        .eq('section_key', PFLEGE_SECTION_KEY)
        .is('person_profile_id', null);

      if (error) throw error;
      setSavedGrad(null);
      setMode(null);
      toast.success(isDE ? 'Pflegegrad entfernt' : 'Care level removed');
    } catch (error) {
      logger.error('Error deleting pflegegrad:', error);
      toast.error(isDE ? 'Fehler beim Löschen' : 'Error deleting');
    }
  };

  const handleRechnerSave = (result: { grad: number; datum: string; punkte: number }) => {
    savePflegegrad({
      grad: result.grad,
      datum: result.datum,
      punkte: result.punkte,
      quelle: 'rechner',
    });
  };

  const gradColors: Record<number, string> = {
    1: 'text-yellow-600 dark:text-yellow-400',
    2: 'text-orange-500 dark:text-orange-400',
    3: 'text-orange-600 dark:text-orange-500',
    4: 'text-red-500 dark:text-red-400',
    5: 'text-red-700 dark:text-red-500',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If a pflegegrad is saved and we're in overview mode (or no mode set)
  if (savedGrad && mode !== 'manual' && mode !== 'rechner') {
    return (
      <div className="space-y-6">
        {/* Saved Pflegegrad Display */}
        <Card className="border-primary/20 overflow-hidden">
          <div className="bg-primary/5 p-6 sm:p-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              {isDE ? 'Aktueller Pflegegrad' : 'Current Care Level'}
            </p>
            <p className={`text-6xl sm:text-7xl font-sans font-bold ${gradColors[savedGrad.grad] || 'text-foreground'}`}>
              {savedGrad.grad}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {isDE ? 'Erfasst am' : 'Recorded on'} {new Date(savedGrad.datum).toLocaleDateString(isDE ? 'de-DE' : 'en-US')}
              {savedGrad.quelle === 'rechner' && savedGrad.punkte !== undefined && (
                <> · {savedGrad.punkte} {isDE ? 'Punkte (Selbsteinschätzung)' : 'Points (self-assessment)'}</>
              )}
              {savedGrad.quelle === 'manuell' && (
                <> · {isDE ? 'Manuell eingetragen' : 'Manually entered'}</>
              )}
            </p>
          </div>
          <CardContent className="p-5 sm:p-6 space-y-4">
            {pflegegradInfo[savedGrad.grad] && (
              <>
                <div className="flex gap-3 items-start">
                  <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">
                    {isDE ? pflegegradInfo[savedGrad.grad].de : pflegegradInfo[savedGrad.grad].en}
                  </p>
                </div>
                <div className="flex gap-3 items-start bg-accent/5 rounded-lg p-3">
                  <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      {isDE ? 'Mögliche Leistungen:' : 'Possible benefits:'}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {isDE ? pflegegradInfo[savedGrad.grad].leistungDe : pflegegradInfo[savedGrad.grad].leistungEn}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setMode('manual')}
            className="flex-1 gap-2"
          >
            <Edit2 className="h-4 w-4" />
            {isDE ? 'Ändern' : 'Change'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setMode('rechner')}
            className="flex-1 gap-2"
          >
            <Calculator className="h-4 w-4" />
            {isDE ? 'Neu berechnen' : 'Recalculate'}
          </Button>
          <Button
            variant="ghost"
            onClick={deletePflegegrad}
            className="gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Rechner mode
  if (mode === 'rechner') {
    return (
      <PflegegradRechner
        showCTA="dashboard"
        onSave={handleRechnerSave}
        onClose={() => setMode(savedGrad ? 'overview' : null)}
      />
    );
  }

  // Manual selection mode
  if (mode === 'manual') {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="font-sans text-xl font-semibold text-foreground">
            {isDE ? 'Pflegegrad eintragen' : 'Enter Care Level'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isDE
              ? 'Wähle den festgestellten Pflegegrad aus:'
              : 'Select the established care level:'}
          </p>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map(grad => (
            <button
              key={grad}
              type="button"
              onClick={() => {
                savePflegegrad({
                  grad,
                  datum: new Date().toISOString().split('T')[0],
                  quelle: 'manuell',
                });
              }}
              className={`flex flex-col items-center justify-center p-4 sm:p-6 rounded-xl border-2 border-border 
                hover:border-primary hover:bg-primary/5 transition-all cursor-pointer`}
            >
              <span className={`text-3xl sm:text-4xl font-sans font-bold ${gradColors[grad]}`}>
                {grad}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                {isDE ? `Grad ${grad}` : `Level ${grad}`}
              </span>
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          onClick={() => setMode(savedGrad ? 'overview' : null)}
          className="w-full"
        >
          {isDE ? 'Zurück' : 'Back'}
        </Button>
      </div>
    );
  }

  // Initial choice: no pflegegrad saved yet
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="font-sans text-xl font-semibold text-foreground">
          {isDE ? 'Pflegegrad' : 'Care Level'}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {isDE
            ? 'Wurde bereits ein Pflegegrad festgestellt oder möchtest Du eine Einschätzung vornehmen?'
            : 'Has a care level already been established, or would you like to get an estimate?'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Option 1: Already have a care level */}
        <Card
          className="border-border hover:border-primary/50 transition-all cursor-pointer group"
          onClick={() => setMode('manual')}
        >
          <CardContent className="p-6 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">
                {isDE ? 'Pflegegrad ist bekannt' : 'Care level is known'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {isDE
                  ? 'Trage den bereits festgestellten Pflegegrad direkt ein.'
                  : 'Enter the already established care level directly.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Option 2: Calculate / estimate */}
        <Card
          className="border-border hover:border-primary/50 transition-all cursor-pointer group"
          onClick={() => setMode('rechner')}
        >
          <CardContent className="p-6 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
              <Calculator className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">
                {isDE ? 'Pflegegrad einschätzen' : 'Estimate care level'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {isDE
                  ? 'Beantworte Fragen und erhalte eine erste Einschätzung.'
                  : 'Answer questions and get an initial estimate.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PflegegradTab;

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, HeartHandshake, Stethoscope, ArrowRight, Lock, Zap, CheckCircle2, Circle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSectionStatus } from '@/hooks/useSectionStatus';
import { supabase } from '@/integrations/supabase/browserClient';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { DashboardModule } from './DashboardSidebar';

interface DashboardHomeProps {
  onNavigate: (module: DashboardModule) => void;
  userPlan: string | null;
  onLockedClick: (module: DashboardModule) => void;
}

const STIMMUNG_EMOJI = ['', '😢', '😕', '😐', '🙂', '😊'];

const getGreeting = (lang: 'de' | 'en') => {
  const h = new Date().getHours();
  if (lang === 'de') {
    if (h < 12) return 'Guten Morgen';
    if (h < 18) return 'Guten Tag';
    return 'Guten Abend';
  }
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const SECTION_LABELS: Record<string, { de: string; en: string }> = {
  personal: { de: 'Persönliche Daten', en: 'Personal Data' },
  assets: { de: 'Vermögen & Finanzen', en: 'Assets & Finances' },
  digital: { de: 'Digitaler Nachlass', en: 'Digital Legacy' },
  wishes: { de: 'Wünsche & Verfügungen', en: 'Wishes & Directives' },
  documents: { de: 'Dokumente', en: 'Documents' },
  contacts: { de: 'Kontakte', en: 'Contacts' },
};

const DashboardHome = ({ onNavigate, userPlan, onLockedClick }: DashboardHomeProps) => {
  const { language } = useLanguage();
  const { user, profile } = useAuth();
  const { sectionStatus, progressPercent, filledCount, totalCount, isComplete, loading: statusLoading } = useSectionStatus();

  const [lastPflege, setLastPflege] = useState<any>(null);
  const [todayCheckin, setTodayCheckin] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);

  const isPlusOrHigher = userPlan === 'plus' || userPlan === 'familie';
  const onboardingFocus = profile?.onboarding_focus;

  useEffect(() => {
    if (!user || !isPlusOrHigher) { setDataLoading(false); return; }
    const load = async () => {
      const [pflegeRes, checkinRes] = await Promise.all([
        supabase.from('pflege_eintraege').select('eintrags_datum,stimmung').eq('user_id', user.id).order('eintrags_datum', { ascending: false }).limit(1),
        supabase.from('symptom_checkins').select('energie,stimmung,checkin_datum').eq('user_id', user.id).eq('checkin_datum', new Date().toISOString().split('T')[0]).limit(1),
      ]);
      setLastPflege(pflegeRes.data?.[0] || null);
      setTodayCheckin(checkinRes.data?.[0] || null);
      setDataLoading(false);
    };
    load();
  }, [user, isPlusOrHigher]);

  // Least-filled sections for "next steps"
  const nextSteps = useMemo(() => {
    if (statusLoading || isComplete) return [];
    return Object.entries(sectionStatus)
      .filter(([, filled]) => !filled)
      .slice(0, 2)
      .map(([key]) => ({ key, label: SECTION_LABELS[key]?.[language] || key }));
  }, [sectionStatus, statusLoading, isComplete, language]);

  const userName = profile?.full_name?.split(' ')[0] || '';
  const greeting = getGreeting(language);

  const t = {
    de: {
      subtitle: 'Hier ist dein aktueller Stand.',
      vorsorge: 'Meine Vorsorge',
      complete: 'Vollständig!',
      continueBtn: 'Weiter ausfüllen',
      pflege: 'Pflege-Begleiter',
      pflegeEmpty: 'Noch kein Eintrag — wie geht es heute?',
      pflegeLastEntry: 'Letzter Eintrag',
      pflegeAdd: 'Eintrag hinzufügen',
      pflegeUnlock: 'Pflege-Begleiter freischalten',
      krankheit: 'Krankheits-Begleiter',
      krankheitDone: 'Heute eingecheckt',
      krankheitPending: 'Noch kein Check-in heute',
      krankheitEnergy: 'Energie',
      krankheitStart: 'Check-in starten',
      krankheitUnlock: 'Krankheits-Begleiter freischalten',
      nextSteps: 'Was als nächstes?',
      upgrade: 'Jetzt upgraden',
      locked: 'In Anker Plus enthalten',
      sectionOf: 'von',
    },
    en: {
      subtitle: 'Here\'s your current status.',
      vorsorge: 'My Planning',
      complete: 'Complete!',
      continueBtn: 'Continue',
      pflege: 'Care Companion',
      pflegeEmpty: 'No entries yet — how are things today?',
      pflegeLastEntry: 'Last entry',
      pflegeAdd: 'Add entry',
      pflegeUnlock: 'Unlock Care Companion',
      krankheit: 'Health Companion',
      krankheitDone: 'Checked in today',
      krankheitPending: 'No check-in today',
      krankheitEnergy: 'Energy',
      krankheitStart: 'Start check-in',
      krankheitUnlock: 'Unlock Health Companion',
      nextSteps: 'What\'s next?',
      upgrade: 'Upgrade now',
      locked: 'Included in Anker Plus',
      sectionOf: 'of',
    },
  };
  const tx = t[language];

  // Card order based on onboarding focus
  const cardOrder = useMemo(() => {
    const cards: ('vorsorge' | 'pflege' | 'krankheit')[] = ['vorsorge', 'pflege', 'krankheit'];
    if (onboardingFocus === 'pflege') return ['pflege', 'vorsorge', 'krankheit'] as typeof cards;
    if (onboardingFocus === 'krankheit') return ['krankheit', 'vorsorge', 'pflege'] as typeof cards;
    return cards;
  }, [onboardingFocus]);

  const renderVorsorgeCard = (delay: number) => (
    <motion.div key="vorsorge" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className="border-l-4 border-l-primary hover:shadow-card transition-shadow cursor-pointer h-full" onClick={() => onNavigate('vorsorge')}>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base font-semibold">{tx.vorsorge}</CardTitle>
              <span className="text-xs text-muted-foreground">
                {statusLoading ? '...' : isComplete ? tx.complete : `${filledCount} ${tx.sectionOf} ${totalCount}`}
              </span>
            </div>
            {isComplete && <CheckCircle2 className="h-5 w-5 text-primary" />}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={statusLoading ? 0 : progressPercent} className="h-2" />
          {!isComplete && (
            <Button variant="ghost" size="sm" className="w-full text-primary hover:text-primary hover:bg-primary/5 gap-1.5">
              {tx.continueBtn} <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderPflegeCard = (delay: number) => (
    <motion.div key="pflege" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      {isPlusOrHigher ? (
        <Card className="border-l-4 border-l-accent hover:shadow-card transition-shadow cursor-pointer h-full" onClick={() => onNavigate('pflege')}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <HeartHandshake className="h-5 w-5 text-accent" />
              </div>
              <CardTitle className="text-base font-semibold">{tx.pflege}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {dataLoading ? (
              <p className="text-sm text-muted-foreground">...</p>
            ) : lastPflege ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{tx.pflegeLastEntry}</p>
                  <p className="text-sm font-medium">{new Date(lastPflege.eintrags_datum).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US')}</p>
                </div>
                <span className="text-2xl">{STIMMUNG_EMOJI[lastPflege.stimmung] || '😐'}</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{tx.pflegeEmpty}</p>
            )}
            <Button variant="ghost" size="sm" className="w-full text-accent hover:text-accent hover:bg-accent/5 gap-1.5">
              {tx.pflegeAdd} <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-l-4 border-l-accent/30 h-full opacity-80 cursor-pointer" onClick={() => onLockedClick('pflege')}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <HeartHandshake className="h-5 w-5 text-muted-foreground/50" />
                </div>
                <CardTitle className="text-base font-semibold text-muted-foreground/60">{tx.pflege}</CardTitle>
              </div>
              <Lock className="h-4 w-4 text-muted-foreground/40" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground/60 mb-2">{tx.locked}</p>
            <Button variant="outline" size="sm" className="text-xs h-7 gap-1 border-accent/30 text-accent">
              {tx.pflegeUnlock} <ArrowRight className="h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );

  const renderKrankheitCard = (delay: number) => (
    <motion.div key="krankheit" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      {isPlusOrHigher ? (
        <Card className="border-l-4 border-l-[hsl(var(--sage))] hover:shadow-card transition-shadow cursor-pointer h-full" onClick={() => onNavigate('krankheit')}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[hsl(var(--sage))]/10 flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-[hsl(var(--sage-dark))]" />
              </div>
              <CardTitle className="text-base font-semibold">{tx.krankheit}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {dataLoading ? (
              <p className="text-sm text-muted-foreground">...</p>
            ) : todayCheckin ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{tx.krankheitDone}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Zap className="h-3.5 w-3.5 text-accent" />
                  <span className="font-medium">{todayCheckin.energie}/10</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Circle className="h-4 w-4 text-muted-foreground/40" />
                <span className="text-sm text-muted-foreground">{tx.krankheitPending}</span>
              </div>
            )}
            <Button variant="ghost" size="sm" className="w-full text-[hsl(var(--sage-dark))] hover:text-[hsl(var(--sage-dark))] hover:bg-[hsl(var(--sage))]/5 gap-1.5">
              {todayCheckin ? tx.krankheit : tx.krankheitStart} <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-l-4 border-l-[hsl(var(--sage))]/30 h-full opacity-80 cursor-pointer" onClick={() => onLockedClick('krankheit')}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-muted-foreground/50" />
                </div>
                <CardTitle className="text-base font-semibold text-muted-foreground/60">{tx.krankheit}</CardTitle>
              </div>
              <Lock className="h-4 w-4 text-muted-foreground/40" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground/60 mb-2">{tx.locked}</p>
            <Button variant="outline" size="sm" className="text-xs h-7 gap-1 border-[hsl(var(--sage))]/30 text-[hsl(var(--sage-dark))]">
              {tx.krankheitUnlock} <ArrowRight className="h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );

  const cardRenderers: Record<string, (d: number) => JSX.Element> = {
    vorsorge: renderVorsorgeCard,
    pflege: renderPflegeCard,
    krankheit: renderKrankheitCard,
  };

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
          {greeting}{userName ? `, ${userName}` : ''}.
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{tx.subtitle}</p>
      </motion.div>

      {/* Status Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cardOrder.map((key, i) => cardRenderers[key](0.05 + i * 0.05))}
      </div>

      {/* Next Steps */}
      {nextSteps.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{tx.nextSteps}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {nextSteps.map((step) => (
                <button
                  key={step.key}
                  onClick={() => onNavigate('vorsorge')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/5 transition-colors text-left group"
                >
                  <Circle className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors flex-shrink-0" />
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors">{step.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary ml-auto transition-colors" />
                </button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardHome;

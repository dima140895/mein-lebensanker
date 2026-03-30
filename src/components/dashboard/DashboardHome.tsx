import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList, HeartHandshake, Stethoscope, ArrowRight, Lock, Zap, CheckCircle2, Circle, Anchor, ShieldCheck, Shield, Link2, CheckCircle, Heart, Activity, Plus, User, FileText, X, Share2, ChevronRight } from 'lucide-react';
import { useEncryption } from '@/contexts/EncryptionContext';
import { EncryptionPasswordDialog } from '@/components/EncryptionPasswordDialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfiles } from '@/contexts/ProfileContext';
import { useSectionStatus } from '@/hooks/useSectionStatus';
import { supabase } from '@/integrations/supabase/browserClient';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { relativesDatum } from '@/lib/utils';
import type { DashboardModule } from './DashboardSidebar';
import WeeklySummary from './WeeklySummary';

interface DashboardHomeProps {
  onNavigate: (module: DashboardModule) => void;
  userPlan: string | null;
  onLockedClick: (module: DashboardModule) => void;
}

import { getMoodColor, getMoodLabel } from '@/components/dashboard/pflege/pflegeMoodConfig';

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
  const { isEncryptionEnabled, isLoading: encryptionLoading } = useEncryption();
  const { sectionCompletion, sectionStatus, progressPercent, filledCount, totalCount, isComplete, loading: statusLoading } = useSectionStatus();
  const { personProfiles, activeProfileId, activeProfile, setActiveProfileId, canAddProfile } = useProfiles();
  const [, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [showProfileWizard, setShowProfileWizard] = useState(false);

  const [lastPflege, setLastPflege] = useState<any>(null);
  const [pflegePersonenNames, setPflegePersonenNames] = useState<string[]>([]);
  const [todayPflegeExists, setTodayPflegeExists] = useState(false);
  const [todayCheckin, setTodayCheckin] = useState<any>(null);
  const [lastCheckin, setLastCheckin] = useState<any>(null);
  const [checkinCount, setCheckinCount] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [showEncryptionSetup, setShowEncryptionSetup] = useState(false);
  const [hasShareToken, setHasShareToken] = useState(false);
  const [shareReminderDismissed, setShareReminderDismissed] = useState(() =>
    typeof window !== 'undefined' && sessionStorage.getItem('share_reminder_dismissed') === 'true'
  );
  const [arztberichtHintDismissed, setArztberichtHintDismissed] = useState(() => {
    if (typeof window === 'undefined') return true;
    return false;
  });

  const isPlusOrHigher = userPlan === 'plus' || userPlan === 'familie';
  const onboardingFocus = profile?.onboarding_focus;

  useEffect(() => {
    if (!user) { setDataLoading(false); return; }
    // Check localStorage for arztbericht hint
    setArztberichtHintDismissed(localStorage.getItem('arztbericht_hint_shown_' + user.id) === 'true');
    const load = async () => {
      const shareTokenRes = await supabase.from('share_tokens').select('id').eq('user_id', user.id).eq('is_active', true).limit(1);
      setHasShareToken((shareTokenRes.data?.length ?? 0) > 0);
      if (isPlusOrHigher) {
        const [pflegeRes, checkinRes, checkinCountRes, pflegePersonenRes, lastCheckinRes] = await Promise.all([
          supabase.from('pflege_eintraege').select('eintrags_datum,stimmung,person_name').eq('user_id', user.id).order('eintrags_datum', { ascending: false }).limit(1),
          supabase.from('symptom_checkins').select('energie,stimmung,checkin_datum').eq('user_id', user.id).eq('checkin_datum', new Date().toISOString().split('T')[0]).limit(1),
          supabase.from('symptom_checkins').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          (supabase as any).from('pflege_personen').select('name').eq('user_id', user.id).order('created_at', { ascending: true }),
          supabase.from('symptom_checkins').select('checkin_datum,energie').eq('user_id', user.id).order('checkin_datum', { ascending: false }).limit(1),
        ]);
        setLastPflege(pflegeRes.data?.[0] || null);
        const todayStr = new Date().toISOString().split('T')[0];
        setTodayPflegeExists(pflegeRes.data?.[0]?.eintrags_datum === todayStr);
        setTodayCheckin(checkinRes.data?.[0] || null);
        setCheckinCount(checkinCountRes.count ?? 0);
        setPflegePersonenNames((pflegePersonenRes.data || []).map((p: any) => p.name));
        setLastCheckin(lastCheckinRes.data?.[0] || null);
      }
      setDataLoading(false);
    };
    load();
  }, [user, isPlusOrHigher]);

  // Guided onboarding tasks
  const onboardingTasks = useMemo(() => {
    const tasks = [
      {
        id: 'personal',
        titel: { de: 'Persönliche Daten ausfüllen', en: 'Fill in personal data' },
        beschreibung: { de: 'Name, Adresse, Geburtsdatum', en: 'Name, address, date of birth' },
        done: (sectionCompletion?.personal ?? 0) === 100,
        module: 'vorsorge' as DashboardModule,
        section: 'personal',
      },
      {
        id: 'contacts',
        titel: { de: 'Notfallkontakt hinterlegen', en: 'Add emergency contact' },
        beschreibung: { de: 'Wer soll im Ernstfall erreichbar sein?', en: 'Who should be reachable in an emergency?' },
        done: (sectionCompletion?.contacts ?? 0) === 100,
        module: 'vorsorge' as DashboardModule,
        section: 'contacts',
      },
      {
        id: 'wishes',
        titel: { de: 'Letzte Wünsche dokumentieren', en: 'Document final wishes' },
        beschreibung: { de: 'Beerdigung, Organe, persönliche Wünsche', en: 'Burial, organs, personal wishes' },
        done: (sectionCompletion?.wishes ?? 0) === 100,
        module: 'vorsorge' as DashboardModule,
        section: 'wishes',
      },
      {
        id: 'share',
        titel: { de: 'Freigabe-Link erstellen', en: 'Create sharing link' },
        beschreibung: { de: 'Damit Angehörige im Ernstfall Zugriff haben', en: 'So relatives have access in an emergency' },
        done: hasShareToken,
        module: 'vorsorge' as DashboardModule,
        section: 'share',
      },
      {
        id: 'encryption',
        titel: { de: 'Verschlüsselung aktivieren', en: 'Enable encryption' },
        beschreibung: { de: 'Schütze deine Daten mit einem eigenen Passwort', en: 'Protect your data with your own password' },
        done: isEncryptionEnabled,
        module: 'settings' as DashboardModule,
        section: null,
      },
    ];
    return tasks;
  }, [sectionCompletion, hasShareToken, isEncryptionEnabled]);

  const doneCount = onboardingTasks.filter(t => t.done).length;
  const allTasksDone = doneCount === onboardingTasks.length;
  const nextTask = onboardingTasks.find(t => !t.done);

  // Show onboarding section only if user < 30 days old and not all done
  const isNewEnough = useMemo(() => {
    if (!user?.created_at) return false;
    const created = new Date(user.created_at);
    const daysSince = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince < 30;
  }, [user?.created_at]);

  const showOnboardingTasks = isNewEnough && !allTasksDone && !statusLoading && !dataLoading;

  const isMultiProfile = (profile?.max_profiles || 1) > 1 && personProfiles.length >= 2;
  const isOwnProfile = activeProfile && profile?.full_name && activeProfile.name === profile.full_name;

  // Build greeting based on active profile
  const greeting = getGreeting(language);
  const greetingLine = useMemo(() => {
    if (!isMultiProfile || !activeProfile) {
      const firstName = profile?.full_name?.split(' ')[0] || '';
      return firstName ? `${greeting}, ${firstName}.` : `${greeting}.`;
    }
    if (isOwnProfile) {
      const firstName = profile?.full_name?.split(' ')[0] || activeProfile.name;
      return `${greeting}, ${firstName}.`;
    }
    // Foreign profile — skip greeting, show profile label
    return language === 'de' ? `Profil: ${activeProfile.name}` : `Profile: ${activeProfile.name}`;
  }, [greeting, profile?.full_name, activeProfile, isMultiProfile, isOwnProfile, language]);

  const userName = profile?.full_name?.split(' ')[0] || '';

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
      krankheit: 'Mein Check-in',
      krankheitDone: 'Heute eingecheckt',
      krankheitPending: 'Wie geht es mir heute?',
      krankheitEnergy: 'Energie',
      krankheitStart: 'Check-in starten',
      krankheitUnlock: 'Krankheits-Begleiter freischalten',
      fuerMich: 'Für mich',
      ichPflege: 'Ich pflege',
      pflegstDu: 'Pflegst du jemanden?',
      pflegeInviteDesc: 'Dokumentiere Medikamente, Stimmung und Arzttermine für einen Angehörigen.',
      pflegeStarten: 'Pflege starten',
      nextSteps: 'Was als nächstes?',
      upgrade: 'Jetzt upgraden',
      locked: 'In Anker Plus enthalten',
      sectionOf: 'von',
      discover: 'Entdecken',
      pflegePassive: 'Pflegeeinträge und Verlauf dokumentieren.',
      krankheitPassive: 'Symptome und Verlauf dokumentieren.',
      vorsorgePassive: 'Vorsorge-Dokumente ausfüllen und sichern.',
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
      krankheit: 'My Check-in',
      krankheitDone: 'Checked in today',
      krankheitPending: 'How am I feeling today?',
      krankheitEnergy: 'Energy',
      krankheitStart: 'Start check-in',
      krankheitUnlock: 'Unlock Health Companion',
      fuerMich: 'For me',
      ichPflege: 'I care for',
      pflegstDu: 'Caring for someone?',
      pflegeInviteDesc: 'Document medications, mood and appointments for a loved one.',
      pflegeStarten: 'Start caring',
      nextSteps: 'What\'s next?',
      upgrade: 'Upgrade now',
      locked: 'Included in Anker Plus',
      sectionOf: 'of',
      discover: 'Discover',
      pflegePassive: 'Document care entries and progress.',
      krankheitPassive: 'Document symptoms and progress.',
      vorsorgePassive: 'Fill out and secure planning documents.',
    },
  };
  const tx = t[language];

  // Card order based on onboarding focus
  const cardOrder = useMemo(() => {
    const cards: ('vorsorge' | 'pflege' | 'krankheit')[] = ['vorsorge', 'pflege', 'krankheit'];
    if (onboardingFocus === 'pflege') return ['pflege', 'krankheit', 'vorsorge'] as typeof cards;
    if (onboardingFocus === 'krankheit') return ['krankheit', 'pflege', 'vorsorge'] as typeof cards;
    return cards;
  }, [onboardingFocus]);

  // Only show passive state if module has NO data yet AND is not the user's focus
  const isPassive = (module: string) => {
    if (!onboardingFocus || onboardingFocus === 'vorsorge') return false;
    if (module === onboardingFocus) return false;
    // If user has started using the module, don't show passive
    if (module === 'vorsorge' && filledCount > 0) return false;
    if (module === 'krankheit' && checkinCount > 0) return false;
    return true;
  };

  const renderVorsorgeCard = (delay: number) => {
    const passive = isPassive('vorsorge');
    const percent = progressPercent;
    // State A: nothing filled, State B: in progress, State C: complete
    const stateA = !statusLoading && filledCount === 0;
    const stateC = !statusLoading && isComplete;
    const stateB = !statusLoading && !stateA && !stateC;

    const cardBorder = stateC
      ? 'border border-[#C8DDD1] bg-[#F8FBF9]'
      : stateB
      ? 'border border-[#E5E0D8] border-l-2 border-l-[#437059]'
      : 'border border-[#E5E0D8]';
    const badgeBg = stateC ? 'bg-[#E8F0EC]' : stateA ? 'bg-muted' : 'bg-primary/10';

    return (
      <motion.div key="vorsorge" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
        <Card
          className={`rounded-2xl shadow-card hover:-translate-y-0.5 hover:shadow-soft transition-all duration-200 cursor-pointer h-full min-h-[120px] ${cardBorder} bg-card ${stateC ? '!bg-[#F8FBF9]' : ''}`}
          onClick={() => onNavigate('vorsorge')}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${passive ? 'bg-muted' : badgeBg}`}>
                <ClipboardList className={`h-5 w-5 ${passive ? 'text-muted-foreground' : 'text-primary'}`} />
              </div>
              <div className="flex-1">
                <CardTitle className={`text-base font-semibold font-body ${passive ? 'text-foreground' : 'text-forest'}`}>{tx.vorsorge}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {passive ? (
              <>
                <p className="text-sm text-muted-foreground">{tx.vorsorgePassive}</p>
                <span className="text-xs text-muted-foreground hover:text-foreground transition-colors">{tx.discover} <ChevronRight className="inline h-3.5 w-3.5 ml-0.5" /></span>
              </>
            ) : statusLoading ? (
              <p className="text-sm text-muted-foreground">...</p>
            ) : stateA ? (
              <>
                <p className="text-sm text-muted-foreground">{tx.vorsorgePassive}</p>
                <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">{tx.discover} <ChevronRight className="inline h-3.5 w-3.5 ml-0.5" /></span>
              </>
            ) : stateB ? (
              <>
                <p className="text-sm text-muted-foreground">
                  {filledCount} {tx.sectionOf} {totalCount} {language === 'de' ? 'Sektionen ausgefüllt' : 'sections completed'}
                </p>
                <div className="mt-3 bg-[#E5E0D8] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#437059] h-1.5 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                </div>
                <span className="text-sm text-[#437059] font-medium mt-3 inline-block cursor-pointer">
                  {language === 'de' ? 'Weiter ausfüllen' : 'Continue'} <ChevronRight className="inline h-3.5 w-3.5 ml-0.5" />
                </span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-[#437059]" />
                  <span className="text-sm text-[#437059] font-medium">{language === 'de' ? 'Vollständig' : 'Complete'}</span>
                </div>
                <span className="text-sm text-muted-foreground mt-2 inline-block cursor-pointer">
                  {language === 'de' ? 'Ansehen' : 'View'} <ChevronRight className="inline h-3.5 w-3.5 ml-0.5" />
                </span>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderPflegeCard = (delay: number) => {
    const passive = isPassive('pflege');
    return (
      <motion.div key="pflege" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
        {isPlusOrHigher ? (
          <Card
            className={`rounded-2xl shadow-card hover:-translate-y-0.5 hover:shadow-soft transition-all duration-200 cursor-pointer h-full border border-[#E8C99A]/60 border-l-2 border-l-[#C4813A] bg-card`}
            onClick={() => onNavigate('pflege')}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${passive ? 'bg-muted' : 'bg-accent/10'}`}>
                  <HeartHandshake className={`h-5 w-5 ${passive ? 'text-muted-foreground' : 'text-accent'}`} />
                </div>
                <div>
                  <CardTitle className={`text-base font-semibold font-body ${passive ? 'text-foreground' : 'text-forest'}`}>{tx.pflege}</CardTitle>
                  {passive && <p className="text-sm text-muted-foreground mt-1">{tx.pflegePassive}</p>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {passive ? (
                <span className="text-xs text-muted-foreground hover:text-foreground transition-colors">{tx.discover}</span>
              ) : (
                <>
                  {dataLoading ? (
                    <p className="text-sm text-muted-foreground">...</p>
                  ) : lastPflege ? (
                    <div>
                      {pflegePersonenNames.length > 1 ? (
                        <div className="mb-2">
                          <p className="text-xs text-muted-foreground">{pflegePersonenNames.join(' · ')}</p>
                          <p className="text-xs text-muted-foreground">{pflegePersonenNames.length} {language === 'de' ? 'Personen werden gepflegt' : 'persons being cared for'}</p>
                        </div>
                      ) : pflegePersonenNames.length === 1 ? (
                        <p className="text-xs text-muted-foreground mb-1">{pflegePersonenNames[0]} · {language === 'de' ? 'letzter Eintrag' : 'last entry'}: {new Date(lastPflege.eintrags_datum).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US')}</p>
                      ) : null}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">{tx.pflegeLastEntry}</p>
                          <p className="text-sm font-medium">{new Date(lastPflege.eintrags_datum).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US')}</p>
                        </div>
                        <span className={`w-3 h-3 rounded-full ${getMoodColor(lastPflege.stimmung)}`} />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {pflegePersonenNames.length > 0
                        ? (language === 'de' ? `Noch kein Eintrag für ${pflegePersonenNames[0]}` : `No entry yet for ${pflegePersonenNames[0]}`)
                        : tx.pflegeEmpty}
                    </p>
                  )}
                  <Button variant="ghost" size="sm" className="w-full text-accent hover:text-accent hover:bg-accent/5 gap-1.5 min-h-[44px]">
                    {pflegePersonenNames.length > 0
                      ? (language === 'de' ? `Wie geht es ${pflegePersonenNames[0]} heute?` : `How is ${pflegePersonenNames[0]} today?`)
                      : (language === 'de' ? 'Wie geht es deinem Angehörigen heute?' : 'How is your loved one today?')}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-l-4 border-l-accent/30 bg-card rounded-2xl shadow-card h-full opacity-80 cursor-pointer" onClick={() => onLockedClick('pflege')}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <HeartHandshake className="h-5 w-5 text-muted-foreground/50" />
                  </div>
                  <CardTitle className="text-base font-semibold font-body text-charcoal-light/60">{tx.pflege}</CardTitle>
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
  };

  const renderKrankheitCard = (delay: number) => {
    const passive = isPassive('krankheit');
    // State A: never used, State B: used but not today, State C: checked in today
    const stateA = !dataLoading && checkinCount === 0;
    const stateC = !dataLoading && !!todayCheckin;
    const stateB = !dataLoading && !stateA && !stateC;

    const cardBorder = stateC
      ? 'border border-[#C8DDD1] bg-[#F8FBF9]'
      : stateB
      ? 'border border-[#E5E0D8] border-l-2 border-l-[#437059]'
      : 'border border-[#E5E0D8]';
    const badgeBg = stateC ? 'bg-[#E8F0EC]' : stateA ? 'bg-muted' : 'bg-sage-light';

    return (
      <motion.div key="krankheit" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
        {isPlusOrHigher ? (
          <Card
            className={`rounded-2xl shadow-card hover:-translate-y-0.5 hover:shadow-soft transition-all duration-200 cursor-pointer h-full min-h-[120px] ${cardBorder} ${stateC ? '!bg-[#F8FBF9]' : 'bg-card'}`}
            onClick={() => {
              if (stateC) {
                setSearchParams({ module: 'krankheit', tab: 'verlauf' });
              } else {
                onNavigate('krankheit');
              }
            }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${passive ? 'bg-muted' : badgeBg}`}>
                  <Stethoscope className={`h-5 w-5 ${passive ? 'text-muted-foreground' : 'text-sage-dark'}`} />
                </div>
                <div className="flex-1">
                  <CardTitle className={`text-base font-semibold font-body ${passive ? 'text-foreground' : 'text-forest'}`}>{tx.krankheit}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {passive ? (
                <>
                  <p className="text-sm text-muted-foreground">{tx.krankheitPassive}</p>
                  <span className="text-xs text-muted-foreground hover:text-foreground transition-colors">{tx.discover} <ChevronRight className="inline h-3.5 w-3.5 ml-0.5" /></span>
                </>
              ) : dataLoading ? (
                <p className="text-sm text-muted-foreground">...</p>
              ) : stateA ? (
                <>
                  <p className="text-sm text-muted-foreground">{tx.krankheitPassive}</p>
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">{tx.discover} <ChevronRight className="inline h-3.5 w-3.5 ml-0.5" /></span>
                </>
              ) : stateB ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {language === 'de' ? 'Heute noch kein Check-in' : 'No check-in today yet'}
                  </p>
                  {lastCheckin && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === 'de' ? 'Zuletzt' : 'Last'}: {relativesDatum(lastCheckin.checkin_datum)}
                    </p>
                  )}
                  <span className="text-sm text-[#437059] font-medium mt-2 inline-block cursor-pointer">
                    {language === 'de' ? 'Check-in starten' : 'Start check-in'} <ChevronRight className="inline h-3.5 w-3.5 ml-0.5" />
                  </span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-[#437059]" />
                    <span className="text-sm text-[#437059] font-medium">
                      {language === 'de' ? 'Heute erledigt' : 'Done today'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === 'de' ? 'Energie' : 'Energy'} {todayCheckin.energie}/5
                  </p>
                  <span className="text-sm text-muted-foreground mt-2 inline-block cursor-pointer">
                    {language === 'de' ? 'Verlauf ansehen' : 'View history'} <ChevronRight className="inline h-3.5 w-3.5 ml-0.5" />
                  </span>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-l-4 border-l-sage/30 bg-card rounded-2xl shadow-card h-full opacity-80 cursor-pointer" onClick={() => onLockedClick('krankheit')}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Stethoscope className="h-5 w-5 text-muted-foreground/50" />
                  </div>
                  <CardTitle className="text-base font-semibold font-body text-charcoal-light/60">{tx.krankheit}</CardTitle>
                </div>
                <Lock className="h-4 w-4 text-muted-foreground/40" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground/60 mb-2">{tx.locked}</p>
              <Button variant="outline" size="sm" className="text-xs h-7 gap-1 border-sage/30 text-sage-dark font-body min-h-[44px]">
                {tx.krankheitUnlock} <ArrowRight className="h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    );
  };

  const cardRenderers: Record<string, (d: number) => JSX.Element> = {
    vorsorge: renderVorsorgeCard,
    pflege: renderPflegeCard,
    krankheit: renderKrankheitCard,
  };

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-sans text-2xl sm:text-3xl font-semibold text-foreground tracking-[-0.02em]">
            {greetingLine}
          </h1>
          {isMultiProfile && !isOwnProfile && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-light text-amber font-medium">
              {language === 'de' ? 'Familienprofil' : 'Family profile'}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1 font-body">{tx.subtitle}</p>
      </motion.div>

      {/* Profile Switcher — prominent horizontal pills */}
      {isMultiProfile && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground mr-1">
              {language === 'de' ? 'Profil:' : 'Profile:'}
            </span>
            {personProfiles.map((p) => {
              const isActive = p.id === activeProfileId;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveProfileId(p.id)}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition-all min-h-[32px] ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/30 border border-border text-foreground hover:border-primary'
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
            {canAddProfile && (
              <button
                onClick={() => onNavigate('settings')}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="h-3 w-3" />
                {language === 'de' ? 'Profil hinzufügen' : 'Add profile'}
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Start prompt — adapted to onboarding focus */}
      {!statusLoading && !dataLoading && (() => {
        // Determine what to show based on focus
        const focus = onboardingFocus || 'vorsorge';
        
        // For vorsorge: show only when 0%
        if (focus === 'vorsorge' && progressPercent > 0) return null;
        // For pflege: show only when no entries yet
        if (focus === 'pflege' && lastPflege) return null;
        // For krankheit: show only when no checkin today
        if (focus === 'krankheit' && todayCheckin) return null;

        const configs = {
          vorsorge: {
            icon: <Anchor className="h-12 w-12 text-muted-foreground mb-4" />,
            title: { de: 'Bereit? Lass uns beginnen.', en: 'Ready? Let\'s begin.' },
            desc: { de: 'Deine Vorsorge-Dokumentation dauert etwa 20 Minuten und gibt dir und deiner Familie echte Sicherheit.', en: 'Your planning documentation takes about 20 minutes and gives you and your family real peace of mind.' },
            cta: { de: 'Vorsorge jetzt starten', en: 'Start planning now' },
            module: 'vorsorge' as DashboardModule,
            note: null as { de: string; en: string; module: DashboardModule } | null,
          },
          pflege: {
            icon: <Heart className="h-12 w-12 text-accent mb-4" />,
            title: { de: 'Dokumentiere den ersten Tag.', en: 'Document the first day.' },
            desc: { de: 'Stimmung, Mahlzeiten, Medikamente — in 3 Minuten.', en: 'Mood, meals, medications — in 3 minutes.' },
            cta: { de: 'Ersten Pflegeeintrag erstellen', en: 'Create first care entry' },
            module: 'pflege' as DashboardModule,
            note: { de: 'Vorsorge kannst du jederzeit nachholen', en: 'You can always catch up on planning', module: 'vorsorge' as DashboardModule },
          },
          krankheit: {
            icon: <Activity className="h-12 w-12 text-sage-dark mb-4" />,
            title: { de: 'Wie geht es dir heute?', en: 'How are you today?' },
            desc: { de: '60 Sekunden. 4 Fragen. Danach siehst du deinen Verlauf.', en: '60 seconds. 4 questions. Then you\'ll see your trend.' },
            cta: { de: 'Ersten Check-in starten', en: 'Start first check-in' },
            module: 'krankheit' as DashboardModule,
            note: { de: 'Vorsorge kannst du jederzeit nachholen', en: 'You can always catch up on planning', module: 'vorsorge' as DashboardModule },
          },
        };

        const cfg = configs[focus as keyof typeof configs] || configs.vorsorge;

        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="bg-primary/5 border-primary/20 rounded-2xl shadow-card">
              <CardContent className="flex flex-col items-center text-center py-8 px-6">
                {cfg.icon}
                <h3 className="font-sans text-xl text-foreground mb-2">{cfg.title[language]}</h3>
                <p className="text-sm text-muted-foreground max-w-xs font-body">{cfg.desc[language]}</p>
                <Button onClick={() => onNavigate(cfg.module)} className="mt-6 rounded-lg min-h-[44px]">
                  {cfg.cta[language]}
                </Button>
                {cfg.note && (
                  <button
                    onClick={() => onNavigate(cfg.note!.module)}
                    className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {cfg.note[language]}
                  </button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })()}

      {/* Share Reminder Banner — when progress >= 80% and no share token */}
      {progressPercent >= 80 && !hasShareToken && !shareReminderDismissed && !dataLoading && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="bg-amber-light/60 border border-amber/30 rounded-2xl p-4 flex items-start gap-3">
            <Share2 className="h-5 w-5 text-amber flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                {language === 'de' ? 'Deine Familie kann noch nicht zugreifen.' : 'Your family can\'t access your data yet.'}
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {language === 'de'
                  ? 'Du hast deine Vorsorge ausgefüllt — aber noch keinen Freigabe-Link erstellt. Im Ernstfall weiß deine Familie sonst nicht wo alles ist.'
                  : 'You\'ve filled out your planning — but haven\'t created a sharing link yet. In an emergency, your family won\'t know where everything is.'}
              </p>
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setSearchParams({ module: 'vorsorge', section: 'share' });
                    onNavigate('vorsorge');
                  }}
                  className="bg-amber hover:bg-amber/90 text-white text-xs px-3 py-1.5 rounded-lg min-h-[32px]"
                >
                  {language === 'de' ? 'Link jetzt erstellen' : 'Create link now'}
                </Button>
                <button
                  onClick={() => {
                    sessionStorage.setItem('share_reminder_dismissed', 'true');
                    setShareReminderDismissed(true);
                  }}
                  className="text-muted-foreground text-xs hover:text-foreground transition-colors"
                >
                  {language === 'de' ? 'Später' : 'Later'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* GRUPPE 1 — Für mich */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5">
          <User className="h-3 w-3 text-[#437059]" />
          <span className="text-xs font-medium uppercase tracking-widest text-[#437059]">{tx.fuerMich}</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {renderVorsorgeCard(0.05)}
          {renderKrankheitCard(0.1)}
        </div>
      </div>

      {/* GRUPPE 2 — Ich pflege */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5">
          <Heart className="h-3 w-3 text-[#C4813A]" />
          <span className="text-xs font-medium uppercase tracking-widest text-[#C4813A]">{tx.ichPflege}</span>
        </div>
        {isPlusOrHigher || !userPlan ? (
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {renderPflegeCard(0.15)}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {renderPflegeCard(0.15)}
          </div>
        )}
      </div>

      {/* Weekly Summary — Plus/Familie only */}
      {isPlusOrHigher && <WeeklySummary />}

      {/* Arztbericht Hint — after 14 check-ins */}
      {isPlusOrHigher && checkinCount >= 14 && !arztberichtHintDismissed && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3 relative">
            <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                {language === 'de' ? 'Du hast genug Daten für einen Arztbericht.' : 'You have enough data for a doctor report.'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'de'
                  ? `${checkinCount} Check-ins dokumentiert — dein Arzt sieht jetzt deinen vollständigen Verlauf.`
                  : `${checkinCount} check-ins documented — your doctor can now see your complete progress.`}
              </p>
              <Button
                size="sm"
                onClick={() => {
                  setSearchParams({ module: 'krankheit', tab: 'arztbericht' });
                  onNavigate('krankheit');
                }}
                className="mt-3 text-xs px-3 py-1.5 rounded-lg min-h-[32px]"
              >
                {language === 'de' ? 'Bericht erstellen' : 'Create report'}
              </Button>
            </div>
            <button
              onClick={() => {
                localStorage.setItem('arztbericht_hint_shown_' + user!.id, 'true');
                setArztberichtHintDismissed(true);
              }}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}



      {/* Encryption — positive hint in settings style */}
      {!encryptionLoading && !isEncryptionEnabled && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
            <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground font-body">
                {language === 'de' ? 'Persönlicher Datenschutz' : 'Personal Data Protection'}
              </p>
              <p className="text-xs text-muted-foreground font-body mt-0.5">
                {language === 'de'
                  ? 'Mit einem eigenen Passwort verschlüsselst du deine Daten so, dass selbst wir keinen Zugriff haben.'
                  : 'With your own password, you encrypt your data so that even we cannot access it.'}
              </p>
            </div>
            <button
              onClick={() => setShowEncryptionSetup(true)}
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors whitespace-nowrap font-body"
            >
              {language === 'de' ? 'Jetzt einrichten' : 'Set up now'}
            </button>
          </div>
        </motion.div>
      )}

      <EncryptionPasswordDialog
        open={showEncryptionSetup}
        onOpenChange={setShowEncryptionSetup}
        mode="setup"
      />
    </div>
  );
};

export default DashboardHome;

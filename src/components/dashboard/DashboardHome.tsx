import { motion } from 'framer-motion';
import { ClipboardList, HeartHandshake, Stethoscope, Bell, CheckCircle, ArrowRight, Lock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSectionStatus } from '@/hooks/useSectionStatus';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { DashboardModule } from './DashboardSidebar';

interface DashboardHomeProps {
  onNavigate: (module: DashboardModule) => void;
  userPlan: string | null;
  onLockedClick: (module: DashboardModule) => void;
}

const DashboardHome = ({ onNavigate, userPlan, onLockedClick }: DashboardHomeProps) => {
  const { language } = useLanguage();
  const { profile } = useAuth();
  const { progressPercent, filledCount, totalCount, isComplete, loading: statusLoading } = useSectionStatus();

  const isPlusOrHigher = userPlan === 'plus' || userPlan === 'familie';

  const t = {
    de: {
      greeting: 'Willkommen zurück',
      vorsorgeTitle: 'Meine Vorsorge',
      vorsorgeDesc: 'Dein Fortschritt',
      complete: 'Vollständig!',
      continueBtn: 'Weiter ausfüllen',
      pflegeTitle: 'Pflege-Begleiter',
      pflegeDesc: 'Noch keine Einträge',
      pflegeActive: 'Letzter Eintrag: Heute',
      krankheitTitle: 'Krankheits-Begleiter',
      krankheitDesc: 'Noch keine Check-ins',
      krankheitActive: 'Letzter Check-in: Heute',
      remindersTitle: 'Erinnerungen',
      remindersDesc: 'Keine anstehenden Erinnerungen',
      locked: 'In Anker Plus enthalten',
      openModule: 'Öffnen',
      upgrade: 'Upgraden',
    },
    en: {
      greeting: 'Welcome back',
      vorsorgeTitle: 'My Planning',
      vorsorgeDesc: 'Your progress',
      complete: 'Complete!',
      continueBtn: 'Continue',
      pflegeTitle: 'Care Companion',
      pflegeDesc: 'No entries yet',
      pflegeActive: 'Last entry: Today',
      krankheitTitle: 'Health Companion',
      krankheitDesc: 'No check-ins yet',
      krankheitActive: 'Last check-in: Today',
      remindersTitle: 'Reminders',
      remindersDesc: 'No upcoming reminders',
      locked: 'Included in Anker Plus',
      openModule: 'Open',
      upgrade: 'Upgrade',
    },
  };

  const texts = t[language];
  const userName = profile?.full_name?.split(' ')[0] || '';

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
          {texts.greeting}{userName ? `, ${userName}` : ''}
        </h1>
      </motion.div>

      {/* Module Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Vorsorge Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="border-border hover:shadow-card transition-shadow cursor-pointer h-full" onClick={() => onNavigate('vorsorge')}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-sage-light flex items-center justify-center">
                    <ClipboardList className="h-5 w-5 text-sage-dark" />
                  </div>
                  <CardTitle className="text-base font-semibold">{texts.vorsorgeTitle}</CardTitle>
                </div>
                {isComplete && <CheckCircle className="h-5 w-5 text-primary" />}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{texts.vorsorgeDesc}</span>
                <span className={`font-medium ${isComplete ? 'text-primary' : 'text-foreground'}`}>
                  {statusLoading ? '...' : isComplete ? texts.complete : `${filledCount}/${totalCount}`}
                </span>
              </div>
              <Progress value={statusLoading ? 0 : progressPercent} className="h-2" />
              <Button variant="ghost" size="sm" className="w-full text-primary hover:text-primary hover:bg-primary/5 gap-1.5">
                {texts.continueBtn}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pflege Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card
            className={`border-border h-full transition-shadow ${isPlusOrHigher ? 'hover:shadow-card cursor-pointer' : 'opacity-75'}`}
            onClick={() => isPlusOrHigher ? onNavigate('pflege') : onLockedClick('pflege')}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${isPlusOrHigher ? 'bg-amber-light' : 'bg-muted'}`}>
                    <HeartHandshake className={`h-5 w-5 ${isPlusOrHigher ? 'text-amber' : 'text-muted-foreground/50'}`} />
                  </div>
                  <CardTitle className={`text-base font-semibold ${!isPlusOrHigher ? 'text-muted-foreground/60' : ''}`}>
                    {texts.pflegeTitle}
                  </CardTitle>
                </div>
                {!isPlusOrHigher && <Lock className="h-4 w-4 text-muted-foreground/40" />}
              </div>
            </CardHeader>
            <CardContent>
              {isPlusOrHigher ? (
                <p className="text-sm text-muted-foreground">{texts.pflegeDesc}</p>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground/60">{texts.locked}</p>
                  <Button variant="outline" size="sm" className="text-xs h-7 gap-1">
                    {texts.upgrade} <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Krankheit Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card
            className={`border-border h-full transition-shadow ${isPlusOrHigher ? 'hover:shadow-card cursor-pointer' : 'opacity-75'}`}
            onClick={() => isPlusOrHigher ? onNavigate('krankheit') : onLockedClick('krankheit')}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${isPlusOrHigher ? 'bg-sage-light' : 'bg-muted'}`}>
                    <Stethoscope className={`h-5 w-5 ${isPlusOrHigher ? 'text-sage-dark' : 'text-muted-foreground/50'}`} />
                  </div>
                  <CardTitle className={`text-base font-semibold ${!isPlusOrHigher ? 'text-muted-foreground/60' : ''}`}>
                    {texts.krankheitTitle}
                  </CardTitle>
                </div>
                {!isPlusOrHigher && <Lock className="h-4 w-4 text-muted-foreground/40" />}
              </div>
            </CardHeader>
            <CardContent>
              {isPlusOrHigher ? (
                <p className="text-sm text-muted-foreground">{texts.krankheitDesc}</p>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground/60">{texts.locked}</p>
                  <Button variant="outline" size="sm" className="text-xs h-7 gap-1">
                    {texts.upgrade} <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Reminders Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-border h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-light flex items-center justify-center">
                  <Bell className="h-5 w-5 text-amber" />
                </div>
                <CardTitle className="text-base font-semibold">{texts.remindersTitle}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{texts.remindersDesc}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardHome;

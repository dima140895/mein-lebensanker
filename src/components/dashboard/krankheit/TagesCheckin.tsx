import { useState, useEffect, useMemo } from 'react';
import { Check, Pencil, Loader2, Clock, Zap, AlertCircle, Moon, Smile, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';
import { motion } from 'framer-motion';
import { trackEvent } from '@/lib/analytics';

interface CheckinData {
  id: string;
  energie: number;
  schmerz: number;
  schlaf: number;
  stimmung: number;
  notiz: string | null;
  checkin_datum: string;
}

const TagesCheckin = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [streakMessage, setStreakMessage] = useState('');

  // Form state
  const [energie, setEnergie] = useState(5);
  const [schmerz, setSchmerz] = useState(5);
  const [schlaf, setSchlaf] = useState(5);
  const [stimmung, setStimmung] = useState(5);
  const [notiz, setNotiz] = useState('');

  const today = format(new Date(), 'yyyy-MM-dd');

  const t = {
    de: {
      timer: 'Dauert ca. 60 Sekunden',
      greeting: 'Wie geht es Dir heute?',
      greetingSub: 'Dein täglicher Check-in — schnell und unkompliziert.',
      energie: 'Energie',
      energieLow: 'Erschöpft',
      energieHigh: 'Energiegeladen',
      energieLabel: (v: number) => v <= 3 ? 'Erschöpft' : v <= 6 ? 'Ok' : 'Energiegeladen',
      schmerz: 'Schmerz',
      schmerzLow: 'Kein Schmerz',
      schmerzHigh: 'Starker Schmerz',
      schmerzLabel: (v: number) => v <= 3 ? 'Kaum/Keine' : v <= 6 ? 'Leichte Schmerzen' : 'Starke Schmerzen',
      schlaf: 'Schlaf',
      schlafLow: 'Sehr schlecht',
      schlafHigh: 'Sehr gut',
      schlafLabel: (v: number) => v <= 3 ? 'Schlecht' : v <= 6 ? 'Ok' : 'Sehr gut',
      stimmung: 'Stimmung',
      stimmungLow: 'Niedergeschlagen',
      stimmungHigh: 'Sehr gut',
      stimmungLabel: (v: number) => v <= 3 ? 'Niedrig' : v <= 6 ? 'Neutral' : 'Gut',
      notizPlaceholder: 'Etwas Besonderes heute? (optional)',
      notizHint: 'Diese Notiz erscheint später im Arztbericht.',
      save: 'Check-in speichern',
      saving: 'Speichern...',
      edit: 'Eintrag bearbeiten',
      done: 'Heute bereits eingecheckt ✓',
      doneSub: 'Hier sind Deine heutigen Werte:',
      notiz: 'Notiz',
      saved: 'Check-in gespeichert!',
      updated: 'Check-in aktualisiert!',
      error: 'Fehler beim Speichern',
      successMessage: 'Gut gemacht! 💪',
      firstCheckin: 'Erster Check-in gespeichert! Der Verlauf beginnt jetzt.',
      streak: (n: number) => `${n} Tage in Folge — weiter so!`,
    },
    en: {
      timer: 'Takes about 60 seconds',
      greeting: 'How are you feeling today?',
      greetingSub: 'Your daily check-in — quick and simple.',
      energie: 'Energy',
      energieLow: 'Exhausted',
      energieHigh: 'Energized',
      energieLabel: (v: number) => v <= 3 ? 'Exhausted' : v <= 6 ? 'Ok' : 'Energized',
      schmerz: 'Pain',
      schmerzLow: 'No pain',
      schmerzHigh: 'Severe pain',
      schmerzLabel: (v: number) => v <= 3 ? 'Little/None' : v <= 6 ? 'Mild pain' : 'Severe pain',
      schlaf: 'Sleep',
      schlafLow: 'Very poor',
      schlafHigh: 'Very good',
      schlafLabel: (v: number) => v <= 3 ? 'Poor' : v <= 6 ? 'Ok' : 'Very good',
      stimmung: 'Mood',
      stimmungLow: 'Low',
      stimmungHigh: 'Very good',
      stimmungLabel: (v: number) => v <= 3 ? 'Low' : v <= 6 ? 'Neutral' : 'Good',
      notizPlaceholder: 'Anything special today? (optional)',
      notizHint: 'This note will appear in your doctor report later.',
      save: 'Save check-in',
      saving: 'Saving...',
      edit: 'Edit entry',
      done: 'Already checked in today ✓',
      doneSub: 'Here are your values for today:',
      notiz: 'Note',
      saved: 'Check-in saved!',
      updated: 'Check-in updated!',
      error: 'Error saving',
      successMessage: 'Well done! 💪',
      firstCheckin: 'First check-in saved! Your trend starts now.',
      streak: (n: number) => `${n} days in a row — keep it up!`,
    },
  };

  const texts = t[language];

  const { data: todayCheckin, isLoading: loading } = useQuery({
    queryKey: [...queryKeys.symptomCheckins(user?.id ?? ''), 'today', today],
    queryFn: async () => {
      const { data } = await supabase
        .from('symptom_checkins')
        .select('*')
        .eq('user_id', user!.id)
        .eq('checkin_datum', today)
        .maybeSingle();
      return (data as CheckinData) || null;
    },
    enabled: !!user,
  });

  // Fetch recent checkins for streak calculation
  const { data: recentCheckins = [] } = useQuery({
    queryKey: [...queryKeys.symptomCheckins(user?.id ?? ''), 'recent'],
    queryFn: async () => {
      const { data } = await supabase
        .from('symptom_checkins')
        .select('checkin_datum')
        .eq('user_id', user!.id)
        .order('checkin_datum', { ascending: false })
        .limit(60);
      return (data || []).map(d => d.checkin_datum);
    },
    enabled: !!user,
  });

  // Calculate streak
  const streak = useMemo(() => {
    if (recentCheckins.length === 0) return 0;
    let count = 0;
    // Start from today or yesterday depending on whether today is checked in
    const dates = new Set(recentCheckins);
    let checkDate = today;
    if (!dates.has(checkDate)) {
      // If saving just happened, today might not be in cache yet — count from yesterday
      checkDate = format(subDays(new Date(), 1), 'yyyy-MM-dd');
      if (!dates.has(checkDate)) return 0;
    }
    while (dates.has(checkDate)) {
      count++;
      checkDate = format(subDays(new Date(checkDate + 'T00:00:00'), 1), 'yyyy-MM-dd');
    }
    return count;
  }, [recentCheckins, today]);

  // Sync form state when data loads
  useEffect(() => {
    if (todayCheckin) {
      setEnergie(todayCheckin.energie);
      setSchmerz(todayCheckin.schmerz);
      setSchlaf(todayCheckin.schlaf);
      setStimmung(todayCheckin.stimmung);
      setNotiz(todayCheckin.notiz || '');
    }
  }, [todayCheckin]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        user_id: user!.id,
        energie,
        schmerz,
        schlaf,
        stimmung,
        notiz: notiz.trim() || null,
        checkin_datum: today,
      };

      if (todayCheckin) {
        const { error } = await supabase.from('symptom_checkins').update(payload).eq('id', todayCheckin.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('symptom_checkins').insert(payload);
        if (error) throw error;

        // Track first ever check-in
        const { count } = await supabase
          .from('symptom_checkins')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user!.id);
        if (count !== null && count <= 1) {
          trackEvent('Erster_Checkin');
        }
      }
    },
    onSuccess: () => {
      // Determine streak message
      const isFirst = !todayCheckin && recentCheckins.length === 0;
      const newStreak = streak + (todayCheckin ? 0 : 1); // Adding today
      if (isFirst) {
        setStreakMessage(texts.firstCheckin);
      } else if (newStreak >= 2) {
        setStreakMessage(texts.streak(newStreak));
      } else {
        setStreakMessage('');
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        toast.success(todayCheckin ? texts.updated : texts.saved);
        setEditing(false);
        queryClient.invalidateQueries({ queryKey: queryKeys.symptomCheckins(user!.id) });
      }, 2000);
    },
    onError: () => {
      toast.error(texts.error);
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Success animation overlay
  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 space-y-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.1 }}
          className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center"
        >
          <Check className="h-10 w-10 text-primary" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl font-sans font-bold text-foreground"
        >
          {texts.successMessage}
        </motion.p>
        {streakMessage && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-primary font-medium"
          >
            {streakMessage}
          </motion.p>
        )}
      </motion.div>
    );
  }

  // Already checked in today - show read-only summary
  if (todayCheckin && !editing) {
    const metrics = [
      { icon: <Zap className="h-5 w-5 text-primary" />, label: texts.energie, value: todayCheckin.energie, desc: texts.energieLabel(todayCheckin.energie) },
      { icon: <AlertCircle className="h-5 w-5 text-destructive" />, label: texts.schmerz, value: todayCheckin.schmerz, desc: texts.schmerzLabel(todayCheckin.schmerz) },
      { icon: <Moon className="h-5 w-5 text-accent" />, label: texts.schlaf, value: todayCheckin.schlaf, desc: texts.schlafLabel(todayCheckin.schlaf) },
      { icon: <Smile className="h-5 w-5 text-primary" />, label: texts.stimmung, value: todayCheckin.stimmung, desc: texts.stimmungLabel(todayCheckin.stimmung) },
    ];

    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm">
            <CheckCircle className="h-4 w-4" />
            {texts.done}
          </div>
          <p className="text-sm text-muted-foreground">{texts.doneSub}</p>
          {streak >= 2 && (
            <p className="text-xs text-primary font-medium">{texts.streak(streak)}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {metrics.map((item) => (
            <Card key={item.label} className="border-border bg-card rounded-2xl">
              <CardContent className="py-4 px-4 flex flex-col items-center text-center">
                {item.icon}
                <p className="text-xs text-muted-foreground mt-1.5 font-body">{item.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{item.value}<span className="text-sm font-normal text-muted-foreground">/10</span></p>
                <p className="text-xs text-muted-foreground font-body">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {todayCheckin.notiz && (
          <Card className="border-border">
            <CardContent className="py-3 px-4">
              <p className="text-xs text-muted-foreground font-medium mb-1">{texts.notiz}</p>
              <p className="text-sm text-foreground">{todayCheckin.notiz}</p>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="min-h-[44px]">
            <Pencil className="h-4 w-4 mr-2" />
            {texts.edit}
          </Button>
        </div>
      </div>
    );
  }

  // Check-in form
  const sliderFields: SliderFieldProps[] = [
    { icon: <Zap className="h-5 w-5 text-primary" />, label: texts.energie, value: energie, onChange: setEnergie, lowLabel: texts.energieLow, highLabel: texts.energieHigh },
    { icon: <AlertCircle className="h-5 w-5 text-destructive" />, label: texts.schmerz, value: schmerz, onChange: setSchmerz, lowLabel: texts.schmerzLow, highLabel: texts.schmerzHigh, isSchmerz: true },
    { icon: <Moon className="h-5 w-5 text-accent" />, label: texts.schlaf, value: schlaf, onChange: setSchlaf, lowLabel: texts.schlafLow, highLabel: texts.schlafHigh },
    { icon: <Smile className="h-5 w-5 text-primary" />, label: texts.stimmung, value: stimmung, onChange: setStimmung, lowLabel: texts.stimmungLow, highLabel: texts.stimmungHigh },
  ];

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      {/* Timer hint */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        {texts.timer}
      </div>

      <div className="text-center space-y-2">
        <h2 className="font-sans text-2xl font-semibold text-foreground">{texts.greeting}</h2>
        <p className="text-sm text-muted-foreground font-body">{texts.greetingSub}</p>
      </div>

      <div className="space-y-8">
        {sliderFields.map((field) => (
          <SliderField key={field.label} {...field} />
        ))}

        {/* Note field */}
        <div className="space-y-2">
          <Textarea
            value={notiz}
            onChange={(e) => setNotiz(e.target.value)}
            placeholder={texts.notizPlaceholder}
            className="resize-none min-h-[80px] max-h-[120px] text-sm rounded-xl border-border"
          />
          <p className="text-xs text-muted-foreground">{texts.notizHint}</p>
        </div>
      </div>

      <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="w-full h-12 text-base min-h-[44px] rounded-xl">
        {saveMutation.isPending ? (
          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{texts.saving}</>
        ) : (
          texts.save
        )}
      </Button>
    </div>
  );
};

// Slider field subcomponent
interface SliderFieldProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (v: number) => void;
  lowLabel: string;
  highLabel: string;
  isSchmerz?: boolean;
}

const SliderField = ({ icon, label, value, onChange, lowLabel, highLabel, isSchmerz }: SliderFieldProps) => {
  // Dynamic color for pain: low=good (green), high=bad (red)
  const getValueColor = () => {
    if (!isSchmerz) return 'text-primary';
    if (value <= 3) return 'text-green-600';
    if (value <= 6) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <Label className="text-sm font-medium font-body text-foreground">{label}</Label>
        </div>
        <span className={`text-2xl font-bold ${getValueColor()}`}>{value}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={1}
        max={10}
        step={1}
        className="py-2 min-h-[44px]"
      />
      <div className="flex justify-between">
        <span className="text-xs text-muted-foreground">{lowLabel}</span>
        <span className="text-xs text-muted-foreground">{highLabel}</span>
      </div>
    </div>
  );
};

export default TagesCheckin;

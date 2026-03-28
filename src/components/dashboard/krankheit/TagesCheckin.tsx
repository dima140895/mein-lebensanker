import { useState, useEffect } from 'react';
import { Check, Pencil, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [todayCheckin, setTodayCheckin] = useState<CheckinData | null>(null);
  const [editing, setEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form state
  const [energie, setEnergie] = useState(5);
  const [schmerz, setSchmerz] = useState(5);
  const [schlaf, setSchlaf] = useState(5);
  const [stimmung, setStimmung] = useState(5);
  const [notiz, setNotiz] = useState('');

  const t = {
    de: {
      greeting: 'Wie geht es Dir heute?',
      greetingSub: 'Dein täglicher Check-in dauert nur 60 Sekunden.',
      energie: 'Energie heute',
      energieLabel: (v: number) => v <= 3 ? 'Erschöpft' : v <= 6 ? 'Ok' : 'Energiegeladen',
      schmerz: 'Schmerzniveau',
      schmerzLabel: (v: number) => v <= 3 ? 'Starke Schmerzen' : v <= 6 ? 'Leichte Schmerzen' : 'Kaum/Keine',
      schlaf: 'Schlafqualität letzte Nacht',
      schlafLabel: (v: number) => v <= 3 ? 'Schlecht' : v <= 6 ? 'Ok' : 'Sehr gut',
      stimmung: 'Stimmung heute',
      stimmungLabel: (v: number) => v <= 3 ? 'Niedrig' : v <= 6 ? 'Neutral' : 'Gut',
      notiz: 'Notiz für heute',
      notizPlaceholder: 'Optional: Was beschäftigt Dich heute?',
      save: 'Check-in speichern',
      saving: 'Speichern...',
      edit: 'Bearbeiten',
      done: 'Check-in erledigt ✓',
      doneSub: 'Du hast heute bereits eingecheckt. Hier sind Deine Werte:',
      saved: 'Check-in gespeichert!',
      updated: 'Check-in aktualisiert!',
      error: 'Fehler beim Speichern',
      successMessage: 'Gut gemacht! 💪',
    },
    en: {
      greeting: 'How are you feeling today?',
      greetingSub: 'Your daily check-in takes only 60 seconds.',
      energie: 'Energy today',
      energieLabel: (v: number) => v <= 3 ? 'Exhausted' : v <= 6 ? 'Ok' : 'Energized',
      schmerz: 'Pain level',
      schmerzLabel: (v: number) => v <= 3 ? 'Severe pain' : v <= 6 ? 'Mild pain' : 'Little/None',
      schlaf: 'Sleep quality last night',
      schlafLabel: (v: number) => v <= 3 ? 'Poor' : v <= 6 ? 'Ok' : 'Very good',
      stimmung: 'Mood today',
      stimmungLabel: (v: number) => v <= 3 ? 'Low' : v <= 6 ? 'Neutral' : 'Good',
      notiz: 'Note for today',
      notizPlaceholder: 'Optional: What\'s on your mind today?',
      save: 'Save check-in',
      saving: 'Saving...',
      edit: 'Edit',
      done: 'Check-in done ✓',
      doneSub: 'You already checked in today. Here are your values:',
      saved: 'Check-in saved!',
      updated: 'Check-in updated!',
      error: 'Error saving',
      successMessage: 'Well done! 💪',
    },
  };

  const texts = t[language];

  const fetchToday = async () => {
    if (!user) return;
    setLoading(true);
    const today = format(new Date(), 'yyyy-MM-dd');
    const { data } = await supabase
      .from('symptom_checkins')
      .select('*')
      .eq('user_id', user.id)
      .eq('checkin_datum', today)
      .maybeSingle();

    if (data) {
      setTodayCheckin(data as CheckinData);
      setEnergie(data.energie);
      setSchmerz(data.schmerz);
      setSchlaf(data.schlaf);
      setStimmung(data.stimmung);
      setNotiz(data.notiz || '');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchToday();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const payload = {
      user_id: user.id,
      energie,
      schmerz,
      schlaf,
      stimmung,
      notiz: notiz.trim() || null,
      checkin_datum: format(new Date(), 'yyyy-MM-dd'),
    };

    let error;
    if (todayCheckin) {
      ({ error } = await supabase
        .from('symptom_checkins')
        .update(payload)
        .eq('id', todayCheckin.id));
    } else {
      ({ error } = await supabase.from('symptom_checkins').insert(payload));
    }

    if (error) {
      toast.error(texts.error);
    } else {
      // Show success animation
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        toast.success(todayCheckin ? texts.updated : texts.saved);
        setEditing(false);
        fetchToday();
      }, 1500);
    }
    setSaving(false);
  };

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
          className="text-xl font-serif font-bold text-foreground"
        >
          {texts.successMessage}
        </motion.p>
      </motion.div>
    );
  }

  // Already checked in today - show summary
  if (todayCheckin && !editing) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm">
            <Check className="h-4 w-4" />
            {texts.done}
          </div>
          <p className="text-sm text-muted-foreground">{texts.doneSub}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: '⚡', label: texts.energie, value: todayCheckin.energie, labelFn: texts.energieLabel },
            { icon: '😣', label: texts.schmerz, value: todayCheckin.schmerz, labelFn: texts.schmerzLabel },
            { icon: '😴', label: texts.schlaf, value: todayCheckin.schlaf, labelFn: texts.schlafLabel },
            { icon: '😊', label: texts.stimmung, value: todayCheckin.stimmung, labelFn: texts.stimmungLabel },
          ].map((item) => (
             <Card key={item.label} className="border-border bg-card rounded-2xl shadow-card">
              <CardContent className="py-4 px-4 text-center">
                <span className="text-2xl">{item.icon}</span>
                <p className="text-xs text-charcoal-light mt-1 font-body">{item.label}</p>
                <p className="text-2xl font-bold text-forest mt-1">{item.value}<span className="text-sm font-normal text-charcoal-light">/10</span></p>
                <p className="text-xs text-charcoal-light font-body">{item.labelFn(item.value)}</p>
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
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            {texts.edit}
          </Button>
        </div>
      </div>
    );
  }

  // Check-in form
  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <div className="text-center space-y-2">
      <h2 className="font-serif text-2xl font-semibold text-forest">{texts.greeting}</h2>
        <p className="text-sm text-charcoal-light font-body">{texts.greetingSub}</p>
      </div>

      <div className="space-y-8">
        {/* Energie */}
        <SliderField
          icon="⚡"
          label={texts.energie}
          value={energie}
          onChange={setEnergie}
          description={texts.energieLabel(energie)}
        />

        {/* Schmerz */}
        <SliderField
          icon="😣"
          label={texts.schmerz}
          value={schmerz}
          onChange={setSchmerz}
          description={texts.schmerzLabel(schmerz)}
        />

        {/* Schlaf */}
        <SliderField
          icon="😴"
          label={texts.schlaf}
          value={schlaf}
          onChange={setSchlaf}
          description={texts.schlafLabel(schlaf)}
        />

        {/* Stimmung */}
        <SliderField
          icon="😊"
          label={texts.stimmung}
          value={stimmung}
          onChange={setStimmung}
          description={texts.stimmungLabel(stimmung)}
        />

        {/* Notiz */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">{texts.notiz}</Label>
          <Textarea
            value={notiz}
            onChange={(e) => setNotiz(e.target.value)}
            placeholder={texts.notizPlaceholder}
            rows={3}
            className="resize-none"
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full h-12 text-base min-h-[44px]">
        {saving ? (
          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{texts.saving}</>
        ) : (
          texts.save
        )}
      </Button>
    </div>
  );
};

// Slider field subcomponent
const SliderField = ({
  icon,
  label,
  value,
  onChange,
  description,
}: {
  icon: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  description: string;
}) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <Label className="text-sm font-medium font-body text-forest">{label}</Label>
      </div>
      <div className="text-right">
         <span className="text-xl font-bold text-forest">{value}</span>
        <span className="text-sm text-charcoal-light">/10</span>
      </div>
    </div>
    <Slider
      value={[value]}
      onValueChange={([v]) => onChange(v)}
      min={1}
      max={10}
      step={1}
      className="py-2"
    />
    <p className="text-xs text-charcoal-light text-center font-body">{description}</p>
  </div>
);

export default TagesCheckin;

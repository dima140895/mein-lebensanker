import { useState } from 'react';
import { Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import PflegePersonSelector from './PflegePersonSelector';

const MOOD_OPTIONS = [
  { emoji: '😞', de: 'Schwer', en: 'Hard', value: 1 },
  { emoji: '😕', de: 'Anstrengend', en: 'Tough', value: 2 },
  { emoji: '😐', de: 'Okay', en: 'Okay', value: 3 },
  { emoji: '😊', de: 'Gut', en: 'Good', value: 4 },
  { emoji: '😄', de: 'Sehr gut', en: 'Great', value: 5 },
];

interface PflegeFirstEntryFlowProps {
  onSave: (data: {
    personName: string;
    stimmung: number;
    mahlzeiten: string;
    aktivitaeten: string;
    besonderheiten: string;
    naechsteSchritte: string;
  }) => void;
  isSaving: boolean;
}

const PflegeFirstEntryFlow = ({ onSave, isSaving }: PflegeFirstEntryFlowProps) => {
  const { language } = useLanguage();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [personName, setPersonName] = useState('');
  const [mahlzeiten, setMahlzeiten] = useState('');
  const [besonderheiten, setBesonderheiten] = useState('');
  const [aktivitaeten, setAktivitaeten] = useState('');
  const [naechsteSchritte, setNaechsteSchritte] = useState('');
  const [showMore, setShowMore] = useState(false);

  const t = {
    de: {
      headline: 'Wie war heute?',
      desc: 'Dein erster Pflegeeintrag dauert 3 Minuten.\nDu kannst so viel oder so wenig eingeben wie du möchtest.',
      hint: 'Klick auf eine Stimmung um zu starten',
      person: 'Für wen ist der Eintrag?',
      meals: 'Mahlzeiten',
      mealsPlaceholder: 'Was wurde gegessen?',
      incidents: 'Besonderheiten',
      incidentsPlaceholder: 'Was war heute anders?',
      moreFields: 'Weitere Felder',
      lessFields: 'Weniger Felder',
      activities: 'Aktivitäten',
      activitiesPlaceholder: 'Spaziergänge, Besuche, Übungen...',
      nextSteps: 'Nächste Schritte',
      nextStepsPlaceholder: 'Arzttermine, Anrufe, Erledigungen...',
      save: 'Eintrag speichern',
      saving: 'Speichern...',
    },
    en: {
      headline: 'How was today?',
      desc: 'Your first care entry takes 3 minutes.\nYou can add as much or as little as you like.',
      hint: 'Click a mood to get started',
      person: 'Who is this entry for?',
      meals: 'Meals',
      mealsPlaceholder: 'What was eaten today?',
      incidents: 'Notable events',
      incidentsPlaceholder: 'What was different today?',
      moreFields: 'More fields',
      lessFields: 'Less fields',
      activities: 'Activities',
      activitiesPlaceholder: 'Walks, visits, exercises...',
      nextSteps: 'Next steps',
      nextStepsPlaceholder: 'Appointments, calls, tasks...',
      save: 'Save entry',
      saving: 'Saving...',
    },
  };

  const texts = t[language];

  const handleSave = () => {
    if (!personName.trim() || selectedMood === null) return;
    onSave({
      personName: personName.trim(),
      stimmung: selectedMood,
      mahlzeiten: mahlzeiten.trim(),
      aktivitaeten: aktivitaeten.trim(),
      besonderheiten: besonderheiten.trim(),
      naechsteSchritte: naechsteSchritte.trim(),
    });
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-card rounded-2xl border border-border p-8 text-center">
        <Heart className="h-10 w-10 text-primary mx-auto mb-4" />
        <h3 className="font-semibold text-xl text-foreground">{texts.headline}</h3>
        <p className="text-sm text-muted-foreground mt-2 mb-6 whitespace-pre-line">{texts.desc}</p>

        {/* Mood quick-select */}
        <div className="flex gap-2 justify-center flex-wrap">
          {MOOD_OPTIONS.map((mood) => (
            <button
              key={mood.value}
              onClick={() => setSelectedMood(mood.value)}
              className={`rounded-xl px-3 py-2 text-sm border transition-all cursor-pointer ${
                selectedMood === mood.value
                  ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                  : 'bg-muted/30 border-border hover:border-primary hover:bg-accent'
              }`}
            >
              <span className="text-lg mr-1">{mood.emoji}</span>
              {mood[language]}
            </button>
          ))}
        </div>

        {selectedMood === null && (
          <p className="text-xs text-muted-foreground mt-3">{texts.hint}</p>
        )}

        {/* Form slides in after mood selection */}
        <AnimatePresence>
          {selectedMood !== null && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 space-y-4 text-left"
            >
              <div className="space-y-2">
                <Label>{texts.person} *</Label>
                <PflegePersonSelector value={personName} onChange={setPersonName} />
              </div>

              <div className="space-y-2">
                <Label>{texts.meals}</Label>
                <Textarea
                  value={mahlzeiten}
                  onChange={(e) => setMahlzeiten(e.target.value)}
                  placeholder={texts.mealsPlaceholder}
                  rows={2}
                  className="border-2 border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label>{texts.incidents}</Label>
                <Textarea
                  value={besonderheiten}
                  onChange={(e) => setBesonderheiten(e.target.value)}
                  placeholder={texts.incidentsPlaceholder}
                  rows={2}
                  className="border-2 border-primary"
                />
              </div>

              {/* Collapsible extra fields */}
              <button
                onClick={() => setShowMore(!showMore)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showMore ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {showMore ? texts.lessFields : texts.moreFields}
              </button>

              <AnimatePresence>
                {showMore && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <Label>{texts.activities}</Label>
                      <Textarea
                        value={aktivitaeten}
                        onChange={(e) => setAktivitaeten(e.target.value)}
                        placeholder={texts.activitiesPlaceholder}
                        rows={2}
                        className="border-2 border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{texts.nextSteps}</Label>
                      <Textarea
                        value={naechsteSchritte}
                        onChange={(e) => setNaechsteSchritte(e.target.value)}
                        placeholder={texts.nextStepsPlaceholder}
                        rows={2}
                        className="border-2 border-primary rounded-xl"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                onClick={handleSave}
                disabled={isSaving || !personName.trim()}
                className="w-full rounded-xl py-3 min-h-[44px] mt-2"
              >
                {isSaving ? texts.saving : texts.save}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PflegeFirstEntryFlow;

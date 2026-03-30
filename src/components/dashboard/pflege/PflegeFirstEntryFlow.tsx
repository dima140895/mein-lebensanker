import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { de as deLocale } from 'date-fns/locale';
import { MOOD_CONFIG, getMoodPill } from './pflegeMoodConfig';

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
  activePersonName?: string;
}

const PflegeFirstEntryFlow = ({ onSave, isSaving, activePersonName = '' }: PflegeFirstEntryFlowProps) => {
  const { language } = useLanguage();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [personName, setPersonName] = useState(activePersonName);
  const [mahlzeiten, setMahlzeiten] = useState('');
  const [besonderheiten, setBesonderheiten] = useState('');
  const [aktivitaeten, setAktivitaeten] = useState('');
  const [naechsteSchritte, setNaechsteSchritte] = useState('');
  const [showMore, setShowMore] = useState(false);

  const isDE = language === 'de';
  const todayLabel = format(new Date(), isDE ? 'EEEE, dd. MMMM yyyy' : 'EEEE, MMMM dd, yyyy', {
    locale: isDE ? deLocale : undefined,
  });

  const t = {
    de: {
      question: personName ? `Wie war heute für ${personName}?` : 'Wie war heute?',
      hint: 'Wähle eine Stimmung um den Eintrag zu starten.\nDu kannst danach weitere Details hinzufügen.',
      person: 'Für wen ist der Eintrag?',
      personPlaceholder: 'z.B. Walter oder Mutter',
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
      question: personName ? `How was today for ${personName}?` : 'How was today?',
      hint: 'Select a mood to start the entry.\nYou can add more details afterwards.',
      person: 'Who is this entry for?',
      personPlaceholder: 'e.g. Walter or Mother',
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

  const selectedMoodConfig = selectedMood !== null ? getMoodPill(selectedMood) : null;

  return (
    <div className="max-w-lg mx-auto mt-6">
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-8">
        {/* Date */}
        <p className="text-sm font-medium text-[#262E38] capitalize">{todayLabel}</p>
        <div className="border-b border-[#E5E0D8] pb-4 mb-5" />

        {/* Question */}
        <p className="text-base text-[#262E38] font-medium">{texts.question}</p>

        {/* Mood buttons */}
        {selectedMood === null ? (
          <>
            <div className="flex gap-2 mt-3 flex-wrap">
              {MOOD_CONFIG.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className="border border-[#E5E0D8] rounded-lg px-4 py-2 text-sm text-[#262E38] hover:border-[#437059] hover:bg-[#E8F0EC] transition-all cursor-pointer flex items-center gap-2 min-h-[44px]"
                >
                  <span className={`w-2 h-2 rounded-full ${mood.color}`} />
                  {mood[language]}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 whitespace-pre-line">{texts.hint}</p>
          </>
        ) : (
          /* Selected mood pill */
          <div className="mt-3">
            <button
              onClick={() => setSelectedMood(null)}
              className={`inline-flex items-center gap-1.5 ${selectedMoodConfig!.pillBg} ${selectedMoodConfig!.pillText} text-xs px-2.5 py-1 rounded-full cursor-pointer hover:opacity-80 transition-opacity`}
            >
              <span className={`w-2 h-2 rounded-full ${selectedMoodConfig!.color}`} />
              {selectedMoodConfig![language]}
            </button>
          </div>
        )}

        {/* Form after mood selection */}
        <AnimatePresence>
          {selectedMood !== null && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 space-y-4 text-left"
            >
              {!activePersonName && (
                <div className="space-y-2">
                  <Label>{texts.person} *</Label>
                  <Input
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    placeholder={texts.personPlaceholder}
                  />
                </div>
              )}

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
                        className="border-2 border-primary"
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

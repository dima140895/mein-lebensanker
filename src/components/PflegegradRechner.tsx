import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Calculator, AlertTriangle, Info, CheckCircle2, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

const bereiche = [
  {
    titel: 'Mobilität',
    titelEn: 'Mobility',
    beschreibung: 'Positionswechsel, Fortbewegen, Treppensteigen',
    beschreibungEn: 'Changing position, moving around, climbing stairs',
    gewichtung: 10,
    items: [
      { frage: 'Positionswechsel im Bett', frageEn: 'Changing position in bed', gewicht: 1 },
      { frage: 'Stabile Sitzposition halten', frageEn: 'Maintaining a stable sitting position', gewicht: 1 },
      { frage: 'Aufstehen aus dem Bett/Stuhl', frageEn: 'Getting up from bed/chair', gewicht: 2 },
      { frage: 'Fortbewegen innerhalb der Wohnung', frageEn: 'Moving around in the home', gewicht: 2 },
      { frage: 'Treppensteigen', frageEn: 'Climbing stairs', gewicht: 3 },
    ],
  },
  {
    titel: 'Kognitive/kommunikative Fähigkeiten',
    titelEn: 'Cognitive/Communication Skills',
    beschreibung: 'Gedächtnis, Orientierung, Entscheidungen treffen',
    beschreibungEn: 'Memory, orientation, making decisions',
    gewichtung: 15,
    items: [
      { frage: 'Örtliche Orientierung', frageEn: 'Spatial orientation', gewicht: 2 },
      { frage: 'Personen erkennen', frageEn: 'Recognizing people', gewicht: 2 },
      { frage: 'Entscheidungen treffen', frageEn: 'Making decisions', gewicht: 2 },
      { frage: 'Sachverhalte verstehen', frageEn: 'Understanding situations', gewicht: 2 },
    ],
  },
  {
    titel: 'Verhaltensweisen & psychische Problemlagen',
    titelEn: 'Behavior & Psychological Issues',
    beschreibung: 'Ängste, Unruhe, Schlafstörungen',
    beschreibungEn: 'Anxiety, restlessness, sleep disorders',
    gewichtung: 15,
    items: [
      { frage: 'Motorisch geprägte Verhaltensauffälligkeiten', frageEn: 'Motor-driven behavioral abnormalities', gewicht: 3 },
      { frage: 'Nächtliche Unruhe', frageEn: 'Nighttime restlessness', gewicht: 2 },
      { frage: 'Selbstschädigendes Verhalten', frageEn: 'Self-harming behavior', gewicht: 4 },
    ],
  },
  {
    titel: 'Selbstversorgung',
    titelEn: 'Self-Care',
    beschreibung: 'Körperpflege, Essen, Toilettengang',
    beschreibungEn: 'Personal hygiene, eating, toileting',
    gewichtung: 40,
    items: [
      { frage: 'Körperpflege (Waschen, Duschen)', frageEn: 'Personal hygiene (washing, showering)', gewicht: 2 },
      { frage: 'An-/Auskleiden', frageEn: 'Dressing/undressing', gewicht: 2 },
      { frage: 'Essen und Trinken', frageEn: 'Eating and drinking', gewicht: 3 },
      { frage: 'Toilettengang', frageEn: 'Toileting', gewicht: 2 },
    ],
  },
  {
    titel: 'Umgang mit krankheitsbedingten Anforderungen',
    titelEn: 'Managing Disease-Related Demands',
    beschreibung: 'Medikamente, Arztbesuche, Verbände',
    beschreibungEn: 'Medications, doctor visits, bandages',
    gewichtung: 20,
    items: [
      { frage: 'Medikamente einnehmen', frageEn: 'Taking medication', gewicht: 2 },
      { frage: 'Arztbesuche wahrnehmen', frageEn: 'Attending doctor appointments', gewicht: 1 },
      { frage: 'Umgang mit medizinischen Hilfsmitteln', frageEn: 'Handling medical aids', gewicht: 2 },
    ],
  },
  {
    titel: 'Gestaltung des Alltagslebens',
    titelEn: 'Organizing Daily Life',
    beschreibung: 'Soziale Kontakte, Tagesstruktur, Hobbys',
    beschreibungEn: 'Social contacts, daily structure, hobbies',
    gewichtung: 0, // Sonderregel: fließt nicht direkt ein, dient zur Gesamtschau
    items: [
      { frage: 'Gestaltung des Tagesablaufs', frageEn: 'Structuring the day', gewicht: 1 },
      { frage: 'Kontakte außerhalb der Wohnung', frageEn: 'Contacts outside the home', gewicht: 2 },
      { frage: 'Teilnahme an Aktivitäten', frageEn: 'Participating in activities', gewicht: 2 },
    ],
  },
];

const antwortOptionen = [
  { wert: 0, labelDe: 'Selbstständig', labelEn: 'Independent' },
  { wert: 1, labelDe: 'Überwiegend selbstständig', labelEn: 'Mostly independent' },
  { wert: 2, labelDe: 'Überwiegend unselbstständig', labelEn: 'Mostly dependent' },
  { wert: 3, labelDe: 'Unselbstständig', labelEn: 'Fully dependent' },
];

const pflegegradInfo: Record<number, { de: string; en: string; leistungDe: string; leistungEn: string }> = {
  0: {
    de: 'Kein Pflegegrad. Die Selbstständigkeit ist nicht oder nur gering beeinträchtigt.',
    en: 'No care level. Independence is not or only slightly impaired.',
    leistungDe: 'Keine Leistungen',
    leistungEn: 'No benefits',
  },
  1: {
    de: 'Geringe Beeinträchtigung der Selbstständigkeit. Anspruch auf Beratung und Entlastungsleistungen.',
    en: 'Minor impairment of independence. Entitled to counseling and relief services.',
    leistungDe: '125 €/Monat Entlastungsbetrag',
    leistungEn: '€125/month relief amount',
  },
  2: {
    de: 'Erhebliche Beeinträchtigung. Anspruch auf Pflegegeld oder Pflegesachleistungen.',
    en: 'Considerable impairment. Entitled to care allowance or care services.',
    leistungDe: '332 € Pflegegeld oder 761 € Sachleistungen/Monat',
    leistungEn: '€332 care allowance or €761 in-kind services/month',
  },
  3: {
    de: 'Schwere Beeinträchtigung. Deutlich erhöhter Pflegebedarf.',
    en: 'Severe impairment. Significantly increased care needs.',
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
    de: 'Schwerste Beeinträchtigung mit besonderen Anforderungen an die pflegerische Versorgung.',
    en: 'Most severe impairment with special demands on nursing care.',
    leistungDe: '947 € Pflegegeld oder 2.200 € Sachleistungen/Monat',
    leistungEn: '€947 care allowance or €2,200 in-kind services/month',
  },
};

interface PflegegradRechnerProps {
  onSave?: (result: { grad: number; datum: string; punkte: number }) => void;
  showCTA?: 'landing' | 'dashboard';
  onClose?: () => void;
}

const PflegegradRechner = ({ onSave, showCTA = 'landing', onClose }: PflegegradRechnerProps) => {
  const { language } = useLanguage();
  const isDE = language === 'de';

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);

  const totalSteps = bereiche.length;
  const currentBereich = bereiche[step];
  const progress = showResult ? 100 : ((step) / totalSteps) * 100;

  const setAnswer = (bereichIdx: number, itemIdx: number, value: number) => {
    setAnswers(prev => ({ ...prev, [`${bereichIdx}-${itemIdx}`]: value }));
  };

  const allCurrentAnswered = currentBereich?.items.every((_, itemIdx) =>
    answers[`${step}-${itemIdx}`] !== undefined
  ) ?? false;

  const berechneErgebnis = useMemo(() => {
    // Calculate weighted score per area
    const areaScores: number[] = bereiche.map((bereich, bIdx) => {
      const maxPossible = bereich.items.reduce((sum, item) => sum + item.gewicht * 3, 0);
      if (maxPossible === 0) return 0;
      const actual = bereich.items.reduce((sum, item, iIdx) => {
        const answer = answers[`${bIdx}-${iIdx}`] ?? 0;
        return sum + answer * item.gewicht;
      }, 0);
      return (actual / maxPossible) * 100;
    });

    // Weighted total (area 6 "Alltagsleben" uses Sonderregel: average of other areas)
    const gewichtungen = [10, 15, 15, 40, 20, 0];
    let weightedTotal = 0;
    for (let i = 0; i < 5; i++) {
      weightedTotal += (areaScores[i] * gewichtungen[i]) / 100;
    }
    // Sonderregel: Alltagsleben adds to total as a bonus (max 5 points)
    const alltagScore = areaScores[5];
    weightedTotal += (alltagScore * 5) / 100;

    // Clamp to 0-100
    const total = Math.min(100, Math.max(0, weightedTotal));

    let grad = 0;
    if (total > 90) grad = 5;
    else if (total >= 71) grad = 4;
    else if (total >= 48) grad = 3;
    else if (total >= 27) grad = 2;
    else if (total >= 12.5) grad = 1;

    return { grad, punkte: Math.round(total * 10) / 10 };
  }, [answers]);

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleBack = () => {
    if (showResult) {
      setShowResult(false);
    } else if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        grad: berechneErgebnis.grad,
        datum: new Date().toISOString().split('T')[0],
        punkte: berechneErgebnis.punkte,
      });
    }
  };

  const gradColors: Record<number, string> = {
    0: 'text-green-600 dark:text-green-400',
    1: 'text-yellow-600 dark:text-yellow-400',
    2: 'text-orange-500 dark:text-orange-400',
    3: 'text-orange-600 dark:text-orange-500',
    4: 'text-red-500 dark:text-red-400',
    5: 'text-red-700 dark:text-red-500',
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-body text-muted-foreground">
            {showResult
              ? (isDE ? 'Ergebnis' : 'Result')
              : `${isDE ? 'Bereich' : 'Area'} ${step + 1} / ${totalSteps}`}
          </span>
          <span className="text-xs font-body text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        {!showResult ? (
          <motion.div
            key={`step-${step}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Current area header */}
            <div className="mb-6">
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-foreground">
                {isDE ? currentBereich.titel : currentBereich.titelEn}
              </h3>
              <p className="text-sm text-muted-foreground font-body mt-1">
                {isDE ? currentBereich.beschreibung : currentBereich.beschreibungEn}
              </p>
            </div>

            {/* Items */}
            <div className="space-y-5">
              {currentBereich.items.map((item, itemIdx) => {
                const key = `${step}-${itemIdx}`;
                const currentValue = answers[key];

                return (
                  <Card key={itemIdx} className="border-border/50">
                    <CardContent className="p-4 sm:p-5">
                      <p className="font-body text-sm font-medium text-foreground mb-3">
                        {isDE ? item.frage : item.frageEn}
                      </p>
                      <RadioGroup
                        value={currentValue !== undefined ? String(currentValue) : undefined}
                        onValueChange={(val) => setAnswer(step, itemIdx, parseInt(val))}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                      >
                        {antwortOptionen.map((opt) => (
                          <Label
                            key={opt.wert}
                            htmlFor={`${key}-${opt.wert}`}
                            className={`flex items-center gap-2.5 rounded-lg border p-3 cursor-pointer transition-all text-sm font-body ${
                              currentValue === opt.wert
                                ? 'border-primary bg-primary/5 dark:bg-primary/10 text-foreground'
                                : 'border-border/50 hover:border-border text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <RadioGroupItem
                              value={String(opt.wert)}
                              id={`${key}-${opt.wert}`}
                            />
                            {isDE ? opt.labelDe : opt.labelEn}
                          </Label>
                        ))}
                      </RadioGroup>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8 gap-3">
              <Button
                variant="outline"
                onClick={step === 0 && onClose ? onClose : handleBack}
                disabled={step === 0 && !onClose}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                {isDE ? 'Zurück' : 'Back'}
              </Button>
              <Button
                onClick={handleNext}
                disabled={!allCurrentAnswered}
                className="gap-2"
              >
                {step === totalSteps - 1
                  ? (isDE ? 'Ergebnis berechnen' : 'Calculate result')
                  : (isDE ? 'Weiter' : 'Next')}
                {step === totalSteps - 1
                  ? <Calculator className="h-4 w-4" />
                  : <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Result display */}
            <Card className="border-border/50 overflow-hidden">
              <div className="bg-primary/5 dark:bg-primary/10 p-6 sm:p-8 text-center">
                <p className="text-sm font-body text-muted-foreground mb-2">
                  {isDE ? 'Geschätzter Pflegegrad' : 'Estimated Care Level'}
                </p>
                <p className={`text-6xl sm:text-7xl font-serif font-bold ${gradColors[berechneErgebnis.grad]}`}>
                  {berechneErgebnis.grad === 0 ? '—' : berechneErgebnis.grad}
                </p>
                <p className="text-sm font-body text-muted-foreground mt-2">
                  {berechneErgebnis.punkte} / 100 {isDE ? 'Punkte' : 'Points'}
                </p>
              </div>
              <CardContent className="p-5 sm:p-6 space-y-4">
                {/* Info */}
                <div className="flex gap-3 items-start">
                  <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-body text-foreground">
                      {isDE ? pflegegradInfo[berechneErgebnis.grad].de : pflegegradInfo[berechneErgebnis.grad].en}
                    </p>
                  </div>
                </div>

                {/* Benefits */}
                {berechneErgebnis.grad > 0 && (
                  <div className="flex gap-3 items-start bg-accent/5 dark:bg-accent/10 rounded-lg p-3">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-body text-muted-foreground mb-0.5">
                        {isDE ? 'Mögliche Leistungen:' : 'Possible benefits:'}
                      </p>
                      <p className="text-sm font-body font-medium text-foreground">
                        {isDE ? pflegegradInfo[berechneErgebnis.grad].leistungDe : pflegegradInfo[berechneErgebnis.grad].leistungEn}
                      </p>
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="flex gap-3 items-start bg-destructive/5 dark:bg-destructive/10 rounded-lg p-3">
                  <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-body text-muted-foreground">
                    {isDE
                      ? 'Dies ist eine unverbindliche Einschätzung. Die offizielle Begutachtung erfolgt durch den Medizinischen Dienst (MD).'
                      : 'This is a non-binding estimate. The official assessment is carried out by the Medical Service (MD).'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* CTAs */}
            <div className="mt-6 space-y-3">
              {showCTA === 'dashboard' && onSave && (
                <Button onClick={handleSave} className="w-full gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {isDE ? 'Pflegegrad im Profil speichern' : 'Save care level to profile'}
                </Button>
              )}

              {showCTA === 'landing' && (
                <Button
                  onClick={() => window.location.href = '/dashboard?register=true'}
                  className="w-full gap-2"
                >
                  {isDE ? 'Jetzt Vorsorge + Pflege in Lebensanker organisieren' : 'Start organizing care with Lebensanker'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}

              <Button variant="outline" onClick={handleBack} className="w-full gap-2">
                <ChevronLeft className="h-4 w-4" />
                {isDE ? 'Antworten überprüfen' : 'Review answers'}
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  setAnswers({});
                  setStep(0);
                  setShowResult(false);
                }}
                className="w-full text-muted-foreground"
              >
                {isDE ? 'Neu starten' : 'Start over'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PflegegradRechner;

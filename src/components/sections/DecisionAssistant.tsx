import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ChevronRight, ChevronLeft, SkipForward, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Answer {
  questionKey: string;
  value: string;
}

const DecisionAssistant = () => {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  const t = {
    de: {
      title: 'Entscheidungs-Vorbereitung',
      intro: 'Diese Fragen sollen Dir helfen, über Deine Wünsche nachzudenken. Es gibt keine richtigen oder falschen Antworten. Du kannst jederzeit Fragen überspringen, Antworten ändern oder Bereiche leer lassen.',
      normalNote: 'Es ist völlig normal, nicht auf alles eine Antwort zu haben. Unklarheit und offene Fragen gehören dazu.',
      skip: 'Überspringen',
      next: 'Weiter',
      back: 'Zurück',
      finish: 'Abschließen',
      placeholder: 'Deine Gedanken hierzu...',
      summaryTitle: 'Deine Gedanken',
      summaryIntro: 'Hier sind Deine bisherigen Überlegungen. Du kannst sie jederzeit ändern.',
      restart: 'Erneut durchgehen',
      questions: [
        {
          key: 'values',
          question: 'Welche Werte oder Prinzipien sind Dir in Deinem Leben besonders wichtig?',
          hint: 'Es gibt hier kein Richtig oder Falsch. Es geht um das, was für Dich zählt.',
        },
        {
          key: 'memories',
          question: 'Gibt es Erinnerungen, Geschichten oder Erfahrungen, die Du gerne weitergeben möchtest?',
          hint: 'Das können kleine Alltagsmomente oder große Lebensereignisse sein.',
        },
        {
          key: 'communication',
          question: 'Wie stellst Du Dir vor, dass Deine Wünsche kommuniziert werden?',
          hint: 'Manche bevorzugen schriftliche Dokumente, andere persönliche Gespräche.',
        },
        {
          key: 'rituals',
          question: 'Gibt es Rituale, Traditionen oder Zeremonien, die Dir wichtig sind – oder die Du bewusst nicht möchtest?',
          hint: 'Beide Richtungen sind gleichwertig. Es geht um Deine Vorstellungen.',
        },
        {
          key: 'emotional',
          question: 'Was wünschst Du Dir, dass Deine Angehörigen über Dich wissen oder in Erinnerung behalten?',
          hint: 'Dies kann alles sein – von Charaktereigenschaften bis zu Lieblingsgeschichten.',
        },
        {
          key: 'practical',
          question: 'Gibt es praktische Dinge, die Du geregelt wissen möchtest?',
          hint: 'Das können konkrete Gegenstände, Orte oder Aufgaben sein.',
        },
        {
          key: 'support',
          question: 'Welche Art von Unterstützung wünschst Du Dir – oder möchtest Du bewusst nicht?',
          hint: 'Manche Menschen schätzen enge Begleitung, andere bevorzugen Unabhängigkeit.',
        },
        {
          key: 'openQuestions',
          question: 'Gibt es Fragen, die für Dich noch offen sind und die Du gerne klären würdest?',
          hint: 'Es ist völlig normal, offene Fragen zu haben. Das Dokumentieren kann der erste Schritt sein.',
        },
      ],
    },
    en: {
      title: 'Decision Preparation',
      intro: "These questions are designed to help you think about your wishes. There are no right or wrong answers. You can skip questions, change answers, or leave sections blank at any time.",
      normalNote: "It's completely normal not to have an answer to everything. Uncertainty and open questions are part of the process.",
      skip: 'Skip',
      next: 'Next',
      back: 'Back',
      finish: 'Finish',
      placeholder: 'Your thoughts on this...',
      summaryTitle: 'Your Thoughts',
      summaryIntro: "Here are your reflections so far. You can change them at any time.",
      restart: 'Go through again',
      questions: [
        {
          key: 'values',
          question: 'What values or principles are particularly important to you in your life?',
          hint: "There's no right or wrong here. It's about what matters to you.",
        },
        {
          key: 'memories',
          question: 'Are there memories, stories, or experiences you would like to pass on?',
          hint: 'These can be small everyday moments or major life events.',
        },
        {
          key: 'communication',
          question: 'How do you envision your wishes being communicated?',
          hint: 'Some prefer written documents, others personal conversations.',
        },
        {
          key: 'rituals',
          question: 'Are there rituals, traditions, or ceremonies that are important to you – or that you consciously do not want?',
          hint: "Both directions are equally valid. It's about your preferences.",
        },
        {
          key: 'emotional',
          question: 'What do you wish your loved ones to know or remember about you?',
          hint: 'This can be anything – from character traits to favorite stories.',
        },
        {
          key: 'practical',
          question: 'Are there practical things you would like to have arranged?',
          hint: 'These can be specific objects, places, or tasks.',
        },
        {
          key: 'support',
          question: 'What kind of support do you wish for – or consciously do not want?',
          hint: 'Some people appreciate close companionship, others prefer independence.',
        },
        {
          key: 'openQuestions',
          question: 'Are there questions that are still open for you and that you would like to clarify?',
          hint: "It's completely normal to have open questions. Documenting them can be the first step.",
        },
      ],
    },
  };

  const texts = t[language];
  const currentQuestion = texts.questions[currentIndex];

  const getCurrentAnswer = () => {
    const found = answers.find(a => a.questionKey === currentQuestion?.key);
    return found?.value || '';
  };

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => {
      const existing = prev.findIndex(a => a.questionKey === currentQuestion.key);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { questionKey: currentQuestion.key, value };
        return updated;
      }
      return [...prev, { questionKey: currentQuestion.key, value }];
    });
  };

  const handleNext = () => {
    if (currentIndex < texts.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setShowSummary(false);
  };

  if (showSummary) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-2">{texts.summaryTitle}</h2>
          <p className="text-muted-foreground">{texts.summaryIntro}</p>
        </div>

        <div className="space-y-4">
          {texts.questions.map((q, i) => {
            const answer = answers.find(a => a.questionKey === q.key)?.value;
            return (
              <div key={q.key} className="rounded-xl border border-border bg-card p-4">
                <p className="font-medium text-foreground mb-2">{q.question}</p>
                <p className="text-muted-foreground italic">
                  {answer || '–'}
                </p>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center">
          <Button variant="outline" onClick={handleRestart}>
            {texts.restart}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="font-serif text-2xl font-bold text-foreground mb-4">{texts.title}</h2>
        <p className="text-muted-foreground leading-relaxed">{texts.intro}</p>
      </div>

      <div className="rounded-xl bg-sage-light/30 border border-sage/20 p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-sage-dark flex-shrink-0 mt-0.5" />
        <p className="text-sm text-sage-dark">{texts.normalNote}</p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2">
        {texts.questions.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-8 rounded-full transition-colors ${
              i === currentIndex ? 'bg-primary' : i < currentIndex ? 'bg-sage' : 'bg-border'
            }`}
          />
        ))}
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="rounded-xl border border-border bg-card p-6 space-y-4"
        >
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-serif text-lg font-semibold text-foreground mb-2">
                {currentQuestion.question}
              </p>
              <p className="text-sm text-muted-foreground italic">{currentQuestion.hint}</p>
            </div>
          </div>

          <Textarea
            value={getCurrentAnswer()}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder={texts.placeholder}
            rows={4}
            className="resize-none"
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {texts.back}
        </Button>

        <Button variant="ghost" onClick={handleSkip}>
          <SkipForward className="mr-2 h-4 w-4" />
          {texts.skip}
        </Button>

        <Button onClick={handleNext}>
          {currentIndex === texts.questions.length - 1 ? texts.finish : texts.next}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default DecisionAssistant;

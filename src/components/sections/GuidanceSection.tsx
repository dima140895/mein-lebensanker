import { motion } from 'framer-motion';
import { Clock, Heart, Calendar, CalendarDays } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const GuidanceSection = () => {
  const { language } = useLanguage();

  const t = {
    de: {
      title: 'Orientierung für Angehörige',
      intro: 'Dieser Leitfaden bietet sanfte Orientierungspunkte – keine Pflichten oder Fristen. Jeder Mensch und jede Situation ist anders. Nimm Dir die Zeit, die Du brauchst.',
      phases: [
        {
          icon: Clock,
          title: 'Erste 24–48 Stunden',
          emotional: 'In den ersten Stunden steht alles still. Schock, Trauer und Überforderung sind völlig normal. Es ist in Ordnung, nicht zu funktionieren.',
          points: [
            'Viele empfinden es als hilfreich, nahestehende Menschen zu informieren',
            'Manche entscheiden sich dafür, erste Gespräche mit Angehörigen zu führen',
            'Wenn es sich richtig anfühlt, kann ein Arzt oder eine Ärztin hinzugezogen werden',
            'Es ist völlig in Ordnung, sich Unterstützung zu holen – von Familie, Freunden oder professionellen Begleitern',
          ],
        },
        {
          icon: Heart,
          title: 'Erste 7 Tage',
          emotional: 'Die erste Woche bringt oft viele Entscheidungen mit sich. Es ist normal, sich überfordert zu fühlen. Nicht alles muss sofort geklärt werden.',
          points: [
            'Manche empfinden es als entlastend, organisatorische Aufgaben aufzuteilen',
            'Wenn es sich richtig anfühlt, können Gespräche mit Bestattungsinstituten beginnen',
            'Viele finden es hilfreich, wichtige Dokumente zusammenzusuchen',
            'Es ist völlig normal, Pausen zu brauchen und nicht alles auf einmal zu erledigen',
          ],
        },
        {
          icon: Calendar,
          title: 'Erste 30 Tage',
          emotional: 'Nach der ersten akuten Phase beginnt oft eine Zeit der Reflexion. Trauer kommt in Wellen – das ist normal und gesund.',
          points: [
            'Manche entscheiden sich dafür, finanzielle Angelegenheiten zu ordnen',
            'Wenn es sich richtig anfühlt, können Versicherungen und Verträge geprüft werden',
            'Viele empfinden es als hilfreich, digitale Konten und Abonnements zu dokumentieren',
            'Es ist in Ordnung, professionelle Unterstützung bei rechtlichen Fragen zu suchen',
          ],
        },
        {
          icon: CalendarDays,
          title: 'Erste 6 Monate',
          emotional: 'Mit der Zeit findet sich langsam ein neuer Alltag. Die Trauer bleibt, aber sie verändert sich. Jeder geht seinen eigenen Weg.',
          points: [
            'Manche empfinden es als hilfreich, längerfristige Angelegenheiten anzugehen',
            'Wenn es sich richtig anfühlt, können Erinnerungsstücke sortiert werden',
            'Viele finden Trost darin, Rituale oder Gedenken zu gestalten',
            'Es ist völlig normal, auch nach Monaten noch Unterstützung zu brauchen',
          ],
        },
      ],
      closing: 'Dieser Leitfaden ersetzt keine professionelle Beratung. Bei rechtlichen, steuerlichen oder medizinischen Fragen wende Dich an die entsprechenden Fachstellen.',
    },
    en: {
      title: 'Guidance for Loved Ones',
      intro: "This guide offers gentle orientation points – no obligations or deadlines. Every person and situation is different. Take the time you need.",
      phases: [
        {
          icon: Clock,
          title: 'First 24–48 Hours',
          emotional: "In the first hours, everything stands still. Shock, grief, and overwhelm are completely normal. It's okay not to function.",
          points: [
            'Many find it helpful to inform close people',
            'Some choose to have initial conversations with family members',
            'If it feels right, a doctor can be consulted',
            "It's perfectly okay to get support – from family, friends, or professional companions",
          ],
        },
        {
          icon: Heart,
          title: 'First 7 Days',
          emotional: "The first week often brings many decisions. It's normal to feel overwhelmed. Not everything needs to be resolved immediately.",
          points: [
            'Some find it relieving to divide organizational tasks',
            'If it feels right, conversations with funeral homes can begin',
            'Many find it helpful to gather important documents',
            "It's completely normal to need breaks and not do everything at once",
          ],
        },
        {
          icon: Calendar,
          title: 'First 30 Days',
          emotional: 'After the initial acute phase, a time of reflection often begins. Grief comes in waves – this is normal and healthy.',
          points: [
            'Some choose to organize financial matters',
            'If it feels right, insurances and contracts can be reviewed',
            'Many find it helpful to document digital accounts and subscriptions',
            "It's okay to seek professional support for legal questions",
          ],
        },
        {
          icon: CalendarDays,
          title: 'First 6 Months',
          emotional: 'Over time, a new routine slowly emerges. The grief remains, but it changes. Everyone walks their own path.',
          points: [
            'Some find it helpful to address longer-term matters',
            'If it feels right, keepsakes can be sorted',
            'Many find comfort in creating rituals or memorials',
            "It's completely normal to still need support after months",
          ],
        },
      ],
      closing: 'This guide does not replace professional advice. For legal, tax, or medical questions, please consult the appropriate professionals.',
    },
  };

  const texts = t[language];

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

      <Accordion type="single" collapsible className="w-full space-y-3">
        {texts.phases.map((phase, i) => {
          const Icon = phase.icon;
          return (
            <AccordionItem
              key={i}
              value={`phase-${i}`}
              className="rounded-xl border border-border bg-card px-6"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-sage-light flex items-center justify-center">
                    <Icon className="h-5 w-5 text-sage-dark" />
                  </div>
                  <span className="font-serif text-lg font-semibold text-foreground">{phase.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="ml-14 space-y-4">
                  <p className="text-muted-foreground italic border-l-2 border-sage pl-4">{phase.emotional}</p>
                  <ul className="space-y-2">
                    {phase.points.map((point, j) => (
                      <li key={j} className="flex items-start gap-2 text-foreground">
                        <span className="text-sage-dark mt-1.5">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <div className="rounded-xl bg-amber-light/30 border border-amber/20 p-4 text-center">
        <p className="text-sm text-amber">{texts.closing}</p>
      </div>
    </motion.div>
  );
};

export default GuidanceSection;

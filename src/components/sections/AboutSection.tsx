import { motion } from 'framer-motion';
import { Heart, Shield, MessageCircle, Users, XCircle, Scale, Stethoscope, Building } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const AboutSection = () => {
  const { language } = useLanguage();

  const t = {
    de: {
      title: 'Was ist dieses Tool?',
      intro: 'Dieses Tool ist Dein persönlicher Begleiter für die organisatorische Vorsorge. Es hilft Dir, wichtige Informationen zu sammeln und zu strukturieren – in Deinem eigenen Tempo, ohne Druck.',
      isTitle: 'Das ist dieses Tool:',
      is: [
        { icon: Heart, text: 'Ein persönliches Organisations- und Übersichtstool' },
        { icon: Shield, text: 'Eine Hilfe zur Vorbereitung für den Fall der Fälle' },
        { icon: Users, text: 'Eine Möglichkeit, Deine Angehörigen im Ernstfall zu entlasten' },
        { icon: MessageCircle, text: 'Eine strukturierte Grundlage für Gespräche mit Familie oder Fachstellen' },
      ],
      isNotTitle: 'Das ist dieses Tool nicht:',
      isNot: [
        { icon: Scale, text: 'Kein Testament und keine rechtliche Beratung' },
        { icon: Building, text: 'Keine notarielle Beratung' },
        { icon: XCircle, text: 'Keine steuerliche Beratung' },
        { icon: Stethoscope, text: 'Kein Ersatz für Ärzte oder medizinische Beratung' },
      ],
      closing: 'Es ist völlig normal, dieses Thema aufzuschieben. Dass Du hier bist, zeigt, dass Du Verantwortung übernimmst – und das ist ein wertvoller Schritt.',
    },
    en: {
      title: 'What is this tool?',
      intro: 'This tool is your personal companion for organizational preparation. It helps you collect and structure important information – at your own pace, without pressure.',
      isTitle: 'This tool is:',
      is: [
        { icon: Heart, text: 'A personal organization and overview tool' },
        { icon: Shield, text: 'An aid for preparation, just in case' },
        { icon: Users, text: 'A way to ease the burden on your loved ones in an emergency' },
        { icon: MessageCircle, text: 'A structured foundation for conversations with family or professionals' },
      ],
      isNotTitle: 'This tool is not:',
      isNot: [
        { icon: Scale, text: 'Not a will and not legal advice' },
        { icon: Building, text: 'Not notarial advice' },
        { icon: XCircle, text: 'Not tax advice' },
        { icon: Stethoscope, text: 'Not a substitute for doctors or medical advice' },
      ],
      closing: "It's completely normal to put off this topic. The fact that you're here shows that you're taking responsibility – and that's a valuable step.",
    },
  };

  const texts = t[language];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="font-serif text-2xl font-bold text-foreground mb-4">{texts.title}</h2>
        <p className="text-muted-foreground leading-relaxed">{texts.intro}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* What it IS */}
        <div className="rounded-xl border border-sage/30 bg-sage-light/30 p-6">
          <h3 className="font-serif text-lg font-semibold text-sage-dark mb-4">{texts.isTitle}</h3>
          <ul className="space-y-3">
            {texts.is.map((item, i) => {
              const Icon = item.icon;
              return (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 h-8 w-8 rounded-lg bg-sage/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-sage-dark" />
                  </div>
                  <span className="text-foreground">{item.text}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* What it IS NOT */}
        <div className="rounded-xl border border-amber/30 bg-amber-light/30 p-6">
          <h3 className="font-serif text-lg font-semibold text-amber mb-4">{texts.isNotTitle}</h3>
          <ul className="space-y-3">
            {texts.isNot.map((item, i) => {
              const Icon = item.icon;
              return (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 h-8 w-8 rounded-lg bg-amber/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-amber" />
                  </div>
                  <span className="text-foreground">{item.text}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="rounded-xl bg-cream-dark/50 border border-border p-6 text-center">
        <p className="text-muted-foreground italic leading-relaxed">{texts.closing}</p>
      </div>
    </motion.div>
  );
};

export default AboutSection;

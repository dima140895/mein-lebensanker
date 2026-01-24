import { motion } from 'framer-motion';
import { Shield, Heart, FileCheck, Lock, Eye, Users, FolderOpen, CheckCircle, List } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const LearnMoreSection = () => {
  const { language } = useLanguage();

  const sections = language === 'de' 
    ? [
        {
          icon: Shield,
          title: 'Sicher & privat',
          subtitle: 'Deine Daten gehören Dir – und nur Dir.',
          description: 'Wir verstehen, dass Vorsorge ein sehr persönliches Thema ist. Deshalb haben wir höchste Sicherheitsstandards implementiert, um Deine sensiblen Informationen zu schützen.',
          features: [
            { icon: Lock, text: 'Ende-zu-Ende-Verschlüsselung aller Daten' },
            { icon: Eye, text: 'Kein Zugriff durch Dritte – auch nicht durch uns' },
            { icon: Shield, text: 'Sichere Speicherung in europäischen Rechenzentren' },
          ],
          color: 'sage',
        },
        {
          icon: Heart,
          title: 'Für Deine Liebsten',
          subtitle: 'Teile gezielt, was wichtig ist.',
          description: 'Du entscheidest, wer welche Informationen sehen darf. Mit unseren Freigabe-Links kannst Du bestimmte Bereiche gezielt mit Angehörigen teilen – jederzeit widerrufbar.',
          features: [
            { icon: Users, text: 'Individuelle Freigabe-Links für verschiedene Personen' },
            { icon: Eye, text: 'Du behältst die volle Kontrolle über alle Zugriffsrechte' },
            { icon: Heart, text: 'Entlaste Deine Liebsten in schwierigen Situationen' },
          ],
          color: 'amber',
        },
        {
          icon: FileCheck,
          title: 'Strukturiert & klar',
          subtitle: 'Alles an einem Ort – übersichtlich organisiert.',
          description: 'Unsere durchdachte Struktur hilft Dir, alle wichtigen Informationen systematisch zu erfassen. So vergisst Du nichts Wichtiges und behältst den Überblick.',
          features: [
            { icon: FolderOpen, text: 'Sechs übersichtliche Bereiche für alle Lebensbereiche' },
            { icon: List, text: 'Hilfreiche Leitfragen führen Dich durch jeden Bereich' },
            { icon: CheckCircle, text: 'Fortschrittsanzeige zeigt Dir, was noch offen ist' },
          ],
          color: 'sage',
        },
      ]
    : [
        {
          icon: Shield,
          title: 'Secure & private',
          subtitle: 'Your data belongs to you – and only you.',
          description: 'We understand that planning ahead is a very personal matter. That\'s why we\'ve implemented the highest security standards to protect your sensitive information.',
          features: [
            { icon: Lock, text: 'End-to-end encryption of all data' },
            { icon: Eye, text: 'No third-party access – not even by us' },
            { icon: Shield, text: 'Secure storage in European data centers' },
          ],
          color: 'sage',
        },
        {
          icon: Heart,
          title: 'For your loved ones',
          subtitle: 'Share selectively what matters.',
          description: 'You decide who can see which information. With our sharing links, you can share specific areas with family members – revocable at any time.',
          features: [
            { icon: Users, text: 'Individual sharing links for different people' },
            { icon: Eye, text: 'You maintain full control over all access rights' },
            { icon: Heart, text: 'Ease the burden on your loved ones in difficult times' },
          ],
          color: 'amber',
        },
        {
          icon: FileCheck,
          title: 'Structured & clear',
          subtitle: 'Everything in one place – clearly organized.',
          description: 'Our well-thought-out structure helps you systematically capture all important information. So you don\'t forget anything important and keep an overview.',
          features: [
            { icon: FolderOpen, text: 'Six clear sections for all areas of life' },
            { icon: List, text: 'Helpful guiding questions lead you through each section' },
            { icon: CheckCircle, text: 'Progress display shows what\'s still open' },
          ],
          color: 'sage',
        },
      ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
    },
  };

  return (
    <section id="learn-more" className="py-20 bg-gradient-to-b from-background to-cream/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block rounded-full bg-sage-light px-4 py-1.5 text-sm font-medium text-sage-dark mb-4">
            {language === 'de' ? 'Mehr erfahren' : 'Learn more'}
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            {language === 'de' ? 'Warum Du uns vertrauen kannst' : 'Why you can trust us'}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'de' 
              ? 'Wir haben diese Plattform mit dem Ziel entwickelt, Dir die Vorsorge so einfach und sicher wie möglich zu machen.'
              : 'We developed this platform with the goal of making planning ahead as easy and secure as possible for you.'}
          </p>
        </motion.div>

        {/* Feature Sections */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-12"
        >
          {sections.map((section, index) => {
            const Icon = section.icon;
            const isEven = index % 2 === 0;
            
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 items-center`}
              >
                {/* Content */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                      section.color === 'sage' ? 'bg-sage-light' : 'bg-amber-light'
                    }`}>
                      <Icon className={`h-7 w-7 ${
                        section.color === 'sage' ? 'text-sage-dark' : 'text-amber'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-foreground">
                        {section.title}
                      </h3>
                      <p className={`text-sm font-medium ${
                        section.color === 'sage' ? 'text-sage-dark' : 'text-amber'
                      }`}>
                        {section.subtitle}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {section.description}
                  </p>
                </div>

                {/* Features Card */}
                <div className="flex-1 w-full">
                  <div className={`rounded-2xl border p-6 ${
                    section.color === 'sage' 
                      ? 'border-sage/20 bg-sage-light/30' 
                      : 'border-amber/20 bg-amber-light/30'
                  }`}>
                    <ul className="space-y-4">
                      {section.features.map((feature, featureIndex) => {
                        const FeatureIcon = feature.icon;
                        return (
                          <li key={featureIndex} className="flex items-start gap-3">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                              section.color === 'sage' ? 'bg-sage-light' : 'bg-amber-light'
                            }`}>
                              <FeatureIcon className={`h-4 w-4 ${
                                section.color === 'sage' ? 'text-sage-dark' : 'text-amber'
                              }`} />
                            </div>
                            <span className="text-foreground font-medium pt-1">
                              {feature.text}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default LearnMoreSection;

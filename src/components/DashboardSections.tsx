import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Wallet, 
  Globe, 
  Heart, 
  FileText, 
  Phone,
  Info,
  Compass,
  MessageCircle,
  Link2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const sections = [
  { 
    icon: User, 
    key: 'personal', 
    gradient: 'from-sage-light to-sage-light/60',
    iconBg: 'bg-sage-dark/10',
    iconColor: 'text-sage-dark',
    accent: 'group-hover:shadow-sage-dark/20'
  },
  { 
    icon: Wallet, 
    key: 'assets', 
    gradient: 'from-amber-light to-amber-light/60',
    iconBg: 'bg-amber/10',
    iconColor: 'text-amber',
    accent: 'group-hover:shadow-amber/20'
  },
  { 
    icon: Globe, 
    key: 'digital', 
    gradient: 'from-primary/10 to-primary/5',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    accent: 'group-hover:shadow-primary/20'
  },
  { 
    icon: Heart, 
    key: 'wishes', 
    gradient: 'from-rose-100 to-rose-50',
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-600',
    accent: 'group-hover:shadow-rose-500/20'
  },
  { 
    icon: FileText, 
    key: 'documents', 
    gradient: 'from-slate-100 to-slate-50',
    iconBg: 'bg-slate-500/10',
    iconColor: 'text-slate-600',
    accent: 'group-hover:shadow-slate-500/20'
  },
  { 
    icon: Phone, 
    key: 'contacts', 
    gradient: 'from-cyan-100 to-cyan-50',
    iconBg: 'bg-cyan-600/10',
    iconColor: 'text-cyan-700',
    accent: 'group-hover:shadow-cyan-500/20'
  },
];

const infoSections = [
  { 
    icon: Info, 
    key: 'about', 
    gradient: 'from-violet-100 to-violet-50',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-600',
    accent: 'group-hover:shadow-violet-500/20'
  },
  { 
    icon: Compass, 
    key: 'guidance', 
    gradient: 'from-emerald-100 to-emerald-50',
    iconBg: 'bg-emerald-600/10',
    iconColor: 'text-emerald-700',
    accent: 'group-hover:shadow-emerald-500/20'
  },
  { 
    icon: MessageCircle, 
    key: 'decision', 
    gradient: 'from-orange-100 to-orange-50',
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-600',
    accent: 'group-hover:shadow-orange-500/20'
  },
  { 
    icon: Link2, 
    key: 'share', 
    gradient: 'from-indigo-100 to-indigo-50',
    iconBg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-600',
    accent: 'group-hover:shadow-indigo-500/20'
  },
];

// Simple fade animation - starts visible to prevent flicker
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.05,
    },
  },
};

const fadeInVariants = {
  hidden: { 
    opacity: 0, 
    y: 15,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const,
    },
  },
};

const DashboardSections = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const texts = {
    de: {
      badge: 'Deine Vorsorge',
      title: 'Alles an einem Ort',
      description: 'Halte Deine wichtigsten Informationen strukturiert fest – damit Deine Liebsten im Ernstfall nicht im Ungewissen stehen.',
    },
    en: {
      badge: 'Your Planning',
      title: 'Everything in One Place',
      description: 'Keep your most important information organized – so your loved ones are not left in the dark in case of emergency.',
    },
  };

  const tx = texts[language];

  const handleSectionClick = (sectionKey: string) => {
    navigate(`/dashboard?section=${sectionKey}`);
  };

  const SectionCard = ({ section, index }: { 
    section: typeof sections[0], 
    index: number
  }) => {
    const Icon = section.icon;
    return (
      <motion.div
        variants={fadeInVariants}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        onClick={() => handleSectionClick(section.key)}
        className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br ${section.gradient} p-6 shadow-sm transition-all duration-300 hover:shadow-xl ${section.accent}`}
      >
        {/* Decorative background element */}
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/20 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-white/30" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl ${section.iconBg} transition-transform duration-300 group-hover:scale-110`}>
              <Icon className={`h-7 w-7 ${section.iconColor}`} />
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/60 backdrop-blur-sm opacity-50 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="h-4 w-4 text-foreground/70 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
          
          <h3 className="mt-5 font-serif text-xl font-semibold text-foreground">
            {t(`section.${section.key}`)}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t(`section.${section.key}Desc`)}
          </p>
          
          <div className="mt-5 flex items-center gap-2">
            <span className="text-sm font-medium text-foreground/80 transition-colors group-hover:text-foreground">
              {t('action.start')}
            </span>
            <Sparkles className="h-3.5 w-3.5 text-foreground/40 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <section id="sections" className="relative pt-8 pb-20 md:pt-12 md:pb-28 overflow-hidden bg-background">
      <div className="container mx-auto px-4">
        {/* Main Sections Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="inline-block rounded-full bg-sage-light px-4 py-1.5 text-sm font-medium text-sage-dark mb-4">
            {tx.badge}
          </span>
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            {tx.title}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {tx.description}
          </p>
        </motion.div>

        <motion.div 
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {sections.map((section, index) => (
            <SectionCard 
              key={section.key} 
              section={section} 
              index={index}
            />
          ))}
        </motion.div>

        {/* Info & Tools Sections */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 mt-20 text-center"
        >
          <span className="inline-block rounded-full bg-muted px-4 py-1.5 text-sm font-medium text-muted-foreground">
            {t('dashboard.helpfulTools')}
          </span>
          <h3 className="mt-4 font-serif text-2xl font-bold text-foreground md:text-3xl">
            {t('dashboard.orientationSupport')}
          </h3>
        </motion.div>

        <motion.div 
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {infoSections.map((section, index) => (
            <SectionCard 
              key={section.key} 
              section={section} 
              index={index}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default DashboardSections;

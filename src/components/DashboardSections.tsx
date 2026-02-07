import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Wallet, 
  Globe, 
  Heart, 
  FileText, 
  Phone,
  
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
    icon: Compass, 
    key: 'guidance', 
    gradient: 'from-emerald-100 to-emerald-50',
    iconBg: 'bg-emerald-600/10',
    iconColor: 'text-emerald-700',
    accent: 'group-hover:shadow-emerald-500/20'
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

// Get stagger delay class based on index
const getStaggerClass = (index: number) => {
  const delays = ['stagger-delay-1', 'stagger-delay-2', 'stagger-delay-3', 'stagger-delay-4', 'stagger-delay-5', 'stagger-delay-6'];
  return delays[index % delays.length];
};

const DashboardSections = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const texts = {
    de: {
      badge: 'Deine Vorsorge',
      title: 'Alles an einem Ort',
      description: 'Halte Deine wichtigsten Informationen strukturiert fest – damit Deine Liebsten im Ernstfall nicht im Ungewissen bleiben.',
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

  const SectionCard = ({ section, index, dataTourAttr }: { 
    section: typeof sections[0], 
    index: number,
    dataTourAttr?: string
  }) => {
    const Icon = section.icon;
    return (
      <div
        onClick={() => handleSectionClick(section.key)}
        className={`group relative cursor-pointer overflow-hidden rounded-xl md:rounded-2xl border border-border/50 bg-gradient-to-br ${section.gradient} p-4 md:p-6 shadow-card transition-all duration-300 ease-out hover:shadow-elevated hover:-translate-y-1 hover:border-border ${section.accent} animate-stagger-fade-in ${getStaggerClass(index)} h-full flex flex-col`}
        data-tour={dataTourAttr}
      >
        {/* Decorative background element */}
        <div className="absolute -right-6 -top-6 md:-right-8 md:-top-8 h-16 w-16 md:h-24 md:w-24 rounded-full bg-white/20 blur-2xl transition-all duration-700 ease-out group-hover:scale-[2] group-hover:bg-white/25" />
        
        <div className="relative z-10 flex flex-col flex-1">
          <div className="flex items-start justify-between">
            <div className={`inline-flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-lg md:rounded-xl ${section.iconBg} transition-transform duration-300 group-hover:scale-110`}>
              <Icon className={`h-5 w-5 md:h-7 md:w-7 ${section.iconColor}`} />
            </div>
            <div className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full bg-white/60 backdrop-blur-sm opacity-50 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-foreground/70 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
          
          <h3 className="mt-3 md:mt-5 font-serif text-base md:text-xl font-semibold text-foreground">
            {t(`section.${section.key}`)}
          </h3>
          <p className="mt-1 md:mt-2 text-xs md:text-sm leading-relaxed text-muted-foreground line-clamp-2 flex-1">
            {t(`section.${section.key}Desc`)}
          </p>
          
          <div className="mt-3 md:mt-5 flex items-center gap-2">
            <span className="text-xs md:text-sm font-medium text-foreground/80 transition-colors group-hover:text-foreground">
              {t('action.start')}
            </span>
            <Sparkles className="h-3 w-3 md:h-3.5 md:w-3.5 text-foreground/40 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="sections" className="relative pt-6 pb-12 md:pt-12 md:pb-28 overflow-hidden bg-muted/40">
      <div className="container mx-auto px-6 sm:px-4">
        {/* Main Sections Header */}
        <div
          key={`main-header-${language}`}
          className="mb-8 md:mb-16 text-center animate-fade-in-up"
        >
          <span className="inline-block rounded-full bg-sage-light px-3 py-1 md:px-4 md:py-1.5 text-xs md:text-sm font-medium text-sage-dark mb-3 md:mb-4">
            {tx.badge}
          </span>
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground">
            {tx.title}
          </h2>
          <p className="mx-auto mt-3 md:mt-5 max-w-2xl text-sm md:text-base lg:text-lg leading-relaxed text-muted-foreground px-2">
            {tx.description}
          </p>
        </div>

        <div 
          key={`main-${language}`}
          className="grid gap-3 md:gap-5 grid-cols-2 lg:grid-cols-3"
          data-tour="dashboard-tiles"
        >
          {sections.map((section, index) => (
            <SectionCard 
              key={`${language}-${section.key}`} 
              section={section} 
              index={index}
              dataTourAttr={section.key === 'documents' ? 'documents-tile' : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DashboardSections;
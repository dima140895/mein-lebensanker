import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 rounded-full bg-secondary p-1">
      <button
        onClick={() => setLanguage('de')}
        className={`relative px-3 py-1.5 text-sm font-medium transition-colors ${
          language === 'de' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {language === 'de' && (
          <motion.div
            layoutId="language-toggle"
            className="absolute inset-0 rounded-full bg-primary"
            transition={{ type: 'spring', duration: 0.4 }}
          />
        )}
        <span className="relative z-10">DE</span>
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`relative px-3 py-1.5 text-sm font-medium transition-colors ${
          language === 'en' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {language === 'en' && (
          <motion.div
            layoutId="language-toggle"
            className="absolute inset-0 rounded-full bg-primary"
            transition={{ type: 'spring', duration: 0.4 }}
          />
        )}
        <span className="relative z-10">EN</span>
      </button>
    </div>
  );
};

export default LanguageToggle;

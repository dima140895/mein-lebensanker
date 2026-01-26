import { forwardRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageToggle = forwardRef<HTMLDivElement>((_, ref) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div ref={ref} className="flex items-center gap-1 rounded-full bg-secondary p-1">
      <button
        onClick={() => setLanguage('de')}
        className={`relative px-3 py-1.5 text-sm font-medium transition-all duration-200 rounded-full ${
          language === 'de' 
            ? 'bg-primary text-primary-foreground' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        DE
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`relative px-3 py-1.5 text-sm font-medium transition-all duration-200 rounded-full ${
          language === 'en' 
            ? 'bg-primary text-primary-foreground' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        EN
      </button>
    </div>
  );
});

LanguageToggle.displayName = 'LanguageToggle';

export default LanguageToggle;

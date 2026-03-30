import { Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Disclaimer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-white/10 bg-[#2C4A3E]">
      <div className="container mx-auto px-5 sm:px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-start gap-2.5 md:gap-3 text-xs md:text-sm text-muted-foreground">
          <Shield className="mt-0.5 h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0 text-primary" />
          <p className="leading-relaxed">
            {t('disclaimer.text')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Disclaimer;

import { Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Disclaimer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-cream-dark/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-start gap-3 text-sm text-muted-foreground">
          <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
          <p className="leading-relaxed">
            {t('disclaimer.text')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Disclaimer;

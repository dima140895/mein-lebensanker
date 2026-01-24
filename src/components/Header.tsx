import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import LanguageToggle from './LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';

const Header = () => {
  const { t } = useLanguage();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md"
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-serif text-xl font-semibold text-foreground">
            Vorsorge
          </span>
        </div>
        
        <nav className="flex items-center gap-6">
          <a
            href="#sections"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('nav.dashboard')}
          </a>
          <LanguageToggle />
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;

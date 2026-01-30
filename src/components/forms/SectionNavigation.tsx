import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

// Define the order of data sections
const sectionOrder = ['personal', 'assets', 'digital', 'wishes', 'documents', 'contacts'] as const;
type SectionKey = typeof sectionOrder[number];

interface SectionNavigationProps {
  currentSection: SectionKey;
}

const SectionNavigation = ({ currentSection }: SectionNavigationProps) => {
  const { language } = useLanguage();
  const [, setSearchParams] = useSearchParams();

  const t = {
    de: {
      backTo: 'Zurück zu',
      nextTo: 'Weiter zu',
      sections: {
        personal: 'Persönliche Daten',
        assets: 'Vermögen',
        digital: 'Digital',
        wishes: 'Wünsche',
        documents: 'Dokumente',
        contacts: 'Kontakte',
      },
    },
    en: {
      backTo: 'Back to',
      nextTo: 'Next to',
      sections: {
        personal: 'Personal',
        assets: 'Assets',
        digital: 'Digital',
        wishes: 'Wishes',
        documents: 'Documents',
        contacts: 'Contacts',
      },
    },
  };

  const texts = t[language];
  const currentIndex = sectionOrder.indexOf(currentSection);
  const prevSection = currentIndex > 0 ? sectionOrder[currentIndex - 1] : null;
  const nextSection = currentIndex < sectionOrder.length - 1 ? sectionOrder[currentIndex + 1] : null;

  const navigateTo = (section: SectionKey) => {
    setSearchParams({ section });
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6 mt-6 border-t border-border">
      {prevSection ? (
        <Button
          variant="outline"
          onClick={() => navigateTo(prevSection)}
          className="flex items-center gap-2 order-2 sm:order-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="truncate">
            {texts.backTo} {texts.sections[prevSection]}
          </span>
        </Button>
      ) : (
        <div className="hidden sm:block" />
      )}
      
      {nextSection ? (
        <Button
          variant="default"
          onClick={() => navigateTo(nextSection)}
          className="flex items-center gap-2 order-1 sm:order-2"
        >
          <span className="truncate">
            {texts.nextTo} {texts.sections[nextSection]}
          </span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      ) : (
        <div className="hidden sm:block" />
      )}
    </div>
  );
};

export default SectionNavigation;

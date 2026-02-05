import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Share2, CheckCircle2 } from 'lucide-react';
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
      shareNow: 'Jetzt für Angehörige freigeben',
      shareDescription: 'Du hast alle Bereiche ausgefüllt! Teile Deine Daten jetzt sicher mit Deinen Vertrauenspersonen.',
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
      shareNow: 'Share with relatives now',
      shareDescription: 'You\'ve completed all sections! Share your data securely with your trusted persons.',
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
  const isLastSection = currentSection === 'contacts';

  const navigateTo = (section: SectionKey | 'share') => {
    setSearchParams({ section });
  };

  return (
    <div className="space-y-4 pt-6 mt-6 border-t border-border">
      {/* Share CTA for last section */}
      {isLastSection && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                {texts.shareDescription}
              </p>
            </div>
            <Button
              onClick={() => navigateTo('share')}
              className="w-full sm:w-auto gap-2"
              size="lg"
            >
              <Share2 className="h-4 w-4" />
              {texts.shareNow}
            </Button>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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
    </div>
  );
};

export default SectionNavigation;

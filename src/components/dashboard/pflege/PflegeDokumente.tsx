import { FileText, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PflegeDokumente = () => {
  const { language } = useLanguage();
  const [, setSearchParams] = useSearchParams();

  const t = {
    de: {
      title: 'Pflege-Dokumente',
      hint: 'Pflegebescheid, MDK-Gutachten und weitere Dokumente findest Du im Bereich',
      linkText: 'Meine Vorsorge → Dokumente',
      goToDocs: 'Zu den Dokumenten',
      importantTitle: 'Wichtige Dokumente bei Pflegestufe',
      docs: [
        { name: 'Pflegebescheid / Pflegegrad-Bescheid', desc: 'Offizieller Bescheid der Pflegekasse über den zuerkannten Pflegegrad.' },
        { name: 'MDK-Gutachten', desc: 'Gutachten des Medizinischen Dienstes zur Begutachtung der Pflegebedürftigkeit.' },
        { name: 'Pflegevertrag', desc: 'Vertrag mit dem Pflegedienst oder der Pflegeeinrichtung.' },
        { name: 'Vorsorgevollmacht', desc: 'Bevollmächtigung einer Vertrauensperson für Entscheidungen.' },
        { name: 'Patientenverfügung', desc: 'Festlegung medizinischer Maßnahmen im Voraus.' },
        { name: 'Betreuungsverfügung', desc: 'Wunsch-Betreuer für den Fall einer gerichtlichen Betreuung.' },
      ],
    },
    en: {
      title: 'Care Documents',
      hint: 'Care certificates, medical assessments and other documents can be found in',
      linkText: 'My Planning → Documents',
      goToDocs: 'Go to Documents',
      importantTitle: 'Important documents for care level',
      docs: [
        { name: 'Care Level Certificate', desc: 'Official certificate from the care insurance about the assigned care level.' },
        { name: 'Medical Assessment', desc: 'Assessment by the medical service regarding the need for care.' },
        { name: 'Care Contract', desc: 'Contract with the care service or care facility.' },
        { name: 'Power of Attorney', desc: 'Authorization of a trusted person for decisions.' },
        { name: 'Advance Directive', desc: 'Specification of medical measures in advance.' },
        { name: 'Care Directive', desc: 'Preferred guardian in case of court-appointed guardianship.' },
      ],
    },
  };

  const texts = t[language];

  const goToDocuments = () => {
    setSearchParams({ module: 'vorsorge', section: 'documents' });
  };

  return (
    <div className="space-y-6">
      {/* Hint Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-6 text-center space-y-3">
          <FileText className="h-10 w-10 text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">
            {texts.hint} <span className="font-medium text-foreground">{texts.linkText}</span>
          </p>
          <Button onClick={goToDocuments} className="gap-2">
            {texts.goToDocs}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Important Documents List */}
      <div>
        <h3 className="font-serif text-lg font-semibold text-foreground mb-4">{texts.importantTitle}</h3>
        <div className="space-y-3">
          {texts.docs.map((doc, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-lg border border-border bg-card">
              <FileText className="h-5 w-5 text-sage-dark flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">{doc.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{doc.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PflegeDokumente;

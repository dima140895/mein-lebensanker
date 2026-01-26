import { useState, useEffect } from 'react';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProfiles } from '@/contexts/ProfileContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/browserClient';

interface SectionStatus {
  key: string;
  filled: boolean;
  label: string;
}

const StatusCheck = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { activeProfile } = useProfiles();
  const [sectionStatuses, setSectionStatuses] = useState<SectionStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const sectionLabels = {
    de: {
      personal: 'Persönliche Daten',
      assets: 'Vermögen',
      digital: 'Digitales',
      wishes: 'Wünsche',
      documents: 'Dokumente',
      contacts: 'Kontakte',
    },
    en: {
      personal: 'Personal Data',
      assets: 'Assets',
      digital: 'Digital',
      wishes: 'Wishes',
      documents: 'Documents',
      contacts: 'Contacts',
    },
  };

  const t = {
    de: {
      title: 'Status-Check',
      subtitle: 'Was fehlt noch?',
      complete: 'Vollständig ausgefüllt!',
      progress: 'Fortschritt',
      missing: 'Noch offen',
      filled: 'Erledigt',
    },
    en: {
      title: 'Status Check',
      subtitle: 'What\'s missing?',
      complete: 'Fully completed!',
      progress: 'Progress',
      missing: 'Still open',
      filled: 'Done',
    },
  };

  const texts = t[language];
  const labels = sectionLabels[language];

  useEffect(() => {
    const checkSections = async () => {
      if (!user || !activeProfile) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('vorsorge_data')
          .select('section_key, data')
          .eq('user_id', user.id)
          .eq('person_profile_id', activeProfile.id);

        if (error) throw error;

        const sectionsToCheck = ['personal', 'assets', 'digital', 'wishes', 'documents', 'contacts'];
        
        const statuses: SectionStatus[] = sectionsToCheck.map(key => {
          const sectionData = data?.find(d => d.section_key === key);
          const hasData = sectionData && sectionData.data && Object.keys(sectionData.data).length > 0;
          
          return {
            key,
            filled: !!hasData,
            label: labels[key as keyof typeof labels],
          };
        });

        setSectionStatuses(statuses);
      } catch (error) {
        console.error('Error checking sections:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSections();
  }, [user, activeProfile, language]);

  const filledCount = sectionStatuses.filter(s => s.filled).length;
  const totalCount = sectionStatuses.length;
  const progressPercent = totalCount > 0 ? (filledCount / totalCount) * 100 : 0;
  const isComplete = filledCount === totalCount && totalCount > 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="animate-pulse h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={isComplete ? 'border-primary/50 bg-primary/5' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
              isComplete ? 'bg-primary text-primary-foreground' : 'bg-amber-light'
            }`}>
              {isComplete ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{texts.title}</CardTitle>
              <CardDescription>{texts.subtitle}</CardDescription>
            </div>
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {filledCount}/{totalCount}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{texts.progress}</span>
            <span className="font-medium">{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {isComplete ? (
          <div className="flex items-center gap-2 text-primary font-medium">
            <CheckCircle className="h-5 w-5" />
            {texts.complete}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {sectionStatuses.map(status => (
              <div
                key={status.key}
                className={`flex items-center gap-2 text-sm py-1.5 px-2 rounded ${
                  status.filled 
                    ? 'text-primary bg-primary/5' 
                    : 'text-muted-foreground'
                }`}
              >
                {status.filled ? (
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 flex-shrink-0" />
                )}
                <span className={status.filled ? 'line-through opacity-70' : ''}>
                  {status.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusCheck;

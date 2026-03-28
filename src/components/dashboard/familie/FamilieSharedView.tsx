import { useState, useEffect } from 'react';
import { Loader2, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { de as deLocale } from 'date-fns/locale';

const MOODS = ['😢', '😕', '😐', '🙂', '😊'];

interface SharedOwner {
  owner_id: string;
  rolle: string;
}

interface FamilieSharedViewProps {
  sharedOwners: SharedOwner[];
}

const FamilieSharedView = ({ sharedOwners }: FamilieSharedViewProps) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [ownerData, setOwnerData] = useState<Record<string, any>>({});
  const [expandedOwner, setExpandedOwner] = useState<string | null>(null);

  const t = {
    de: {
      noShared: 'Keine geteilten Familien',
      noSharedDesc: 'Du wurdest noch nicht zu einer Familie eingeladen.',
      rolle: 'Rolle',
      lesen: 'Nur lesen',
      mitbearbeiten: 'Mitbearbeiten',
      pflegeEntries: 'Pflege-Tagebuch',
      symptomCheckins: 'Gesundheits-Check-ins',
      noEntries: 'Keine Einträge vorhanden',
      meals: 'Mahlzeiten',
      activities: 'Aktivitäten',
      incidents: 'Besonderheiten',
      nextSteps: 'Nächste Schritte',
      energie: 'Energie',
      schmerz: 'Schmerz',
      schlaf: 'Schlaf',
      stimmung: 'Stimmung',
      ownerLabel: 'Daten von',
    },
    en: {
      noShared: 'No shared families',
      noSharedDesc: 'You haven\'t been invited to a family yet.',
      rolle: 'Role',
      lesen: 'Read only',
      mitbearbeiten: 'Can edit',
      pflegeEntries: 'Care Journal',
      symptomCheckins: 'Health Check-ins',
      noEntries: 'No entries available',
      meals: 'Meals',
      activities: 'Activities',
      incidents: 'Incidents',
      nextSteps: 'Next Steps',
      energie: 'Energy',
      schmerz: 'Pain',
      schlaf: 'Sleep',
      stimmung: 'Mood',
      ownerLabel: 'Data from',
    },
  };
  const texts = t[language];

  useEffect(() => {
    const fetchOwnerData = async () => {
      if (sharedOwners.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const data: Record<string, any> = {};

      for (const owner of sharedOwners) {
        // Get owner's profile name
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('user_id', owner.owner_id)
          .maybeSingle();

        // Get recent pflege entries (last 5)
        const { data: pflegeData } = await supabase
          .from('pflege_eintraege')
          .select('*')
          .eq('user_id', owner.owner_id)
          .order('eintrags_datum', { ascending: false })
          .limit(5);

        // Get recent symptom checkins (last 5)
        const { data: symptomData } = await supabase
          .from('symptom_checkins')
          .select('*')
          .eq('user_id', owner.owner_id)
          .order('checkin_datum', { ascending: false })
          .limit(5);

        data[owner.owner_id] = {
          name: profileData?.full_name || profileData?.email || 'Unbekannt',
          rolle: owner.rolle,
          pflege: pflegeData || [],
          symptome: symptomData || [],
        };
      }

      setOwnerData(data);
      setLoading(false);
    };

    fetchOwnerData();
  }, [sharedOwners]);

  const formatDate = (d: string) =>
    format(new Date(d + 'T00:00:00'), language === 'de' ? 'dd. MMM yyyy' : 'MMM dd, yyyy', {
      locale: language === 'de' ? deLocale : undefined,
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (sharedOwners.length === 0) {
    return (
      <div className="text-center py-16">
        <Eye className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground font-medium">{texts.noShared}</p>
        <p className="text-sm text-muted-foreground mt-1">{texts.noSharedDesc}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(ownerData).map(([ownerId, data]) => {
        const isExpanded = expandedOwner === ownerId;
        return (
          <Card key={ownerId} className="border-border">
            <CardHeader
              className="cursor-pointer py-3 px-4"
              onClick={() => setExpandedOwner(isExpanded ? null : ownerId)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">{data.name}</CardTitle>
                  <Badge variant="outline" className="text-xs mt-1">
                    {data.rolle === 'lesen' ? texts.lesen : texts.mitbearbeiten}
                  </Badge>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0 pb-4 px-4 space-y-6">
                {/* Pflege entries */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {texts.pflegeEntries}
                  </h4>
                  {data.pflege.length === 0 ? (
                    <p className="text-xs text-muted-foreground">{texts.noEntries}</p>
                  ) : (
                    <div className="space-y-2">
                      {data.pflege.map((entry: any) => (
                        <div key={entry.id} className="p-3 rounded-lg border border-border bg-muted/30 text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{MOODS[entry.stimmung - 1]}</span>
                            <span className="font-medium text-foreground">{entry.person_name}</span>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {formatDate(entry.eintrags_datum)}
                            </span>
                          </div>
                          {entry.mahlzeiten && (
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">{texts.meals}:</span> {entry.mahlzeiten}
                            </p>
                          )}
                          {entry.besonderheiten && (
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">{texts.incidents}:</span> {entry.besonderheiten}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Symptom checkins */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {texts.symptomCheckins}
                  </h4>
                  {data.symptome.length === 0 ? (
                    <p className="text-xs text-muted-foreground">{texts.noEntries}</p>
                  ) : (
                    <div className="space-y-2">
                      {data.symptome.map((checkin: any) => (
                        <div key={checkin.id} className="p-3 rounded-lg border border-border bg-muted/30 text-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(checkin.checkin_datum)}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-center">
                            <div>
                              <p className="text-xs text-muted-foreground">⚡ {texts.energie}</p>
                              <p className="font-bold text-foreground">{checkin.energie}/10</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">😣 {texts.schmerz}</p>
                              <p className="font-bold text-foreground">{checkin.schmerz}/10</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">😴 {texts.schlaf}</p>
                              <p className="font-bold text-foreground">{checkin.schlaf}/10</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">😊 {texts.stimmung}</p>
                              <p className="font-bold text-foreground">{checkin.stimmung}/10</p>
                            </div>
                          </div>
                          {checkin.notiz && (
                            <p className="text-xs text-muted-foreground mt-2">{checkin.notiz}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default FamilieSharedView;

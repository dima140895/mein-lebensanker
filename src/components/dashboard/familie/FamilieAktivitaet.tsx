import { useMemo } from 'react';
import { Users, HeartHandshake, Stethoscope } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { Button } from '@/components/ui/button';
import { format, formatDistanceToNow, subDays } from 'date-fns';
import { de as deLocale } from 'date-fns/locale';

const MOODS = ['', '😢', '😕', '😐', '🙂', '😊'];

interface FamilieAktivitaetProps {
  onNavigate?: (module: string) => void;
}

interface ActivityItem {
  id: string;
  type: 'pflege' | 'checkin';
  date: string;
  createdAt: string;
  personName?: string;
  stimmung?: number;
  besonderheiten?: string;
  energie?: number;
  schmerz?: number;
}

const FamilieAktivitaet = ({ onNavigate }: FamilieAktivitaetProps) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const thirtyDaysAgo = useMemo(() => format(subDays(new Date(), 30), 'yyyy-MM-dd'), []);

  const { data, isLoading } = useQuery({
    queryKey: [...queryKeys.pflegeEintraege(user?.id ?? ''), 'family-activity'],
    queryFn: async () => {
      const [pflegeRes, checkinRes] = await Promise.all([
        supabase
          .from('pflege_eintraege')
          .select('id,eintrags_datum,created_at,person_name,stimmung,besonderheiten')
          .eq('user_id', user!.id)
          .gte('eintrags_datum', thirtyDaysAgo)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('symptom_checkins')
          .select('id,checkin_datum,created_at,stimmung,energie,schmerz')
          .eq('user_id', user!.id)
          .gte('checkin_datum', thirtyDaysAgo)
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      const pflege: ActivityItem[] = (pflegeRes.data ?? []).map(p => ({
        id: p.id,
        type: 'pflege' as const,
        date: p.eintrags_datum,
        createdAt: p.created_at,
        personName: p.person_name,
        stimmung: p.stimmung,
        besonderheiten: p.besonderheiten,
      }));

      const checkins: ActivityItem[] = (checkinRes.data ?? []).map(c => ({
        id: c.id,
        type: 'checkin' as const,
        date: c.checkin_datum,
        createdAt: c.created_at,
        energie: c.energie,
        schmerz: c.schmerz,
        stimmung: c.stimmung,
      }));

      return [...pflege, ...checkins]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);
    },
    enabled: !!user,
  });

  const t = {
    de: {
      title: 'Letzte Aktivität',
      empty: 'Noch keine gemeinsame Aktivität',
      emptyDesc: 'Sobald ein Familienmitglied einen Eintrag hinzufügt, erscheint er hier.',
      createEntry: 'Pflegeeintrag erstellen →',
      pflege: 'Pflegeeintrag',
      checkin: 'Symptom-Check-in',
      added: 'hinzugefügt',
      energie: 'Energie',
      schmerz: 'Schmerz',
    },
    en: {
      title: 'Recent Activity',
      empty: 'No shared activity yet',
      emptyDesc: 'When a family member adds an entry, it will appear here.',
      createEntry: 'Create care entry →',
      pflege: 'Care entry',
      checkin: 'Symptom check-in',
      added: 'added',
      energie: 'Energy',
      schmerz: 'Pain',
    },
  };
  const texts = t[language];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const items = data ?? [];

  if (items.length === 0) {
    return (
      <div className="text-center py-12 space-y-3">
        <Users className="h-8 w-8 text-muted-foreground mx-auto" />
        <p className="text-sm font-semibold text-foreground">{texts.empty}</p>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">{texts.emptyDesc}</p>
        {onNavigate && (
          <Button size="sm" onClick={() => onNavigate('pflege')} className="mt-4">
            {texts.createEntry}
          </Button>
        )}
      </div>
    );
  }

  const getInitials = (item: ActivityItem) => {
    if (item.type === 'pflege' && item.personName) {
      return item.personName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    }
    return item.type === 'pflege' ? 'PE' : 'SC';
  };

  const getRelativeTime = (dateStr: string) => {
    return formatDistanceToNow(new Date(dateStr), {
      addSuffix: true,
      locale: language === 'de' ? deLocale : undefined,
    });
  };

  const getPreview = (item: ActivityItem) => {
    if (item.type === 'pflege') {
      const mood = MOODS[item.stimmung ?? 0] || '';
      const text = item.besonderheiten?.trim().slice(0, 40) || '';
      return `${mood}${text ? ` ${text}${(item.besonderheiten?.length ?? 0) > 40 ? '…' : ''}` : ''}`;
    }
    return `${texts.energie} ${item.energie}/10 · ${texts.schmerz} ${item.schmerz}/10`;
  };

  return (
    <div>
      <h3 className="text-base font-semibold text-foreground mb-4">{texts.title}</h3>
      <div className="divide-y divide-border">
        {items.map(item => (
          <button
            key={`${item.type}-${item.id}`}
            onClick={() => onNavigate?.(item.type === 'pflege' ? 'pflege' : 'krankheit')}
            className="flex items-start gap-3 py-3 w-full text-left hover:bg-muted/30 rounded-lg transition-colors px-1 -mx-1"
          >
            <div className="w-8 h-8 rounded-full bg-sage-light flex items-center justify-center flex-shrink-0">
              {item.type === 'pflege'
                ? <HeartHandshake className="h-3.5 w-3.5 text-primary" />
                : <Stethoscope className="h-3.5 w-3.5 text-primary" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {item.type === 'pflege' && item.personName
                  ? `${item.personName} — ${texts.pflege} ${texts.added}`
                  : `${item.type === 'pflege' ? texts.pflege : texts.checkin} ${texts.added}`
                }
              </p>
              <p className="text-xs text-muted-foreground">{getRelativeTime(item.createdAt)}</p>
              {getPreview(item) && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{getPreview(item)}</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FamilieAktivitaet;

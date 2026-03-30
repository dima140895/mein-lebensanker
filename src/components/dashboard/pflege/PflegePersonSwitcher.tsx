import { Plus, UserPlus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

export interface PflegePerson {
  id: string;
  name: string;
  geburtsjahr: number | null;
  beziehung: string | null;
  notizen?: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface PflegePersonSwitcherProps {
  personen: PflegePerson[];
  aktivePerson: PflegePerson | null;
  onSelect: (person: PflegePerson) => void;
  onAddClick: () => void;
  canAdd: boolean;
}

const getInitials = (name: string) => {
  return name
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() || '')
    .slice(0, 2)
    .join('');
};

const PflegePersonSwitcher = ({ personen, aktivePerson, onSelect, onAddClick, canAdd }: PflegePersonSwitcherProps) => {
  const { language } = useLanguage();
  const isDE = language === 'de';

  if (personen.length === 0) {
    return (
      <div className="px-4 py-4 border-b border-[#E5E0D8] bg-[#FDFAF5] rounded-t-xl">
        <p className="text-sm text-muted-foreground mb-2">
          {isDE ? 'Für wen pflegst du? Lege eine Person an.' : 'Who do you care for? Add a person.'}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddClick}
          className="gap-1.5 min-h-[44px] border-[#C4813A]/40 text-[#8B5A1A] hover:bg-[#F5E8D4]/50"
        >
          <UserPlus className="h-4 w-4" />
          {isDE ? 'Person anlegen →' : 'Add person →'}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap overflow-x-auto px-4 py-3 border-b border-[#E5E0D8] bg-[#FDFAF5] rounded-t-xl scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
      {personen.map((person) => {
        const isActive = aktivePerson?.id === person.id;
        return (
          <button
            key={person.id}
            onClick={() => onSelect(person)}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all whitespace-nowrap min-h-[36px] ${
              isActive
                ? 'bg-[#F5E8D4] border border-[#E8C99A] text-[#8B5A1A]'
                : 'bg-white border border-[#E5E0D8] text-muted-foreground hover:border-[#C4813A]/40 cursor-pointer'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                isActive ? 'bg-[#C4813A]/20 text-[#8B5A1A]' : 'bg-muted text-muted-foreground'
              }`}
            >
              {getInitials(person.name)}
            </span>
            {person.name}
          </button>
        );
      })}
      {canAdd && (
        <button
          onClick={onAddClick}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-muted-foreground border border-dashed border-[#E5E0D8] hover:border-[#C4813A]/40 transition-all whitespace-nowrap min-h-[36px]"
        >
          <Plus className="h-3 w-3" />
          {isDE ? 'Person' : 'Person'}
        </button>
      )}
    </div>
  );
};

export default PflegePersonSwitcher;

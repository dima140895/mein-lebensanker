import { useState, useMemo } from 'react';
import { Users, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PflegePersonSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const PflegePersonSelector = ({ value, onChange, className = '' }: PflegePersonSelectorProps) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isDE = language === 'de';
  const [showNewInput, setShowNewInput] = useState(false);
  const [newName, setNewName] = useState('');

  // Gather unique person names from pflege_eintraege and medikamente
  const { data: personNames = [] } = useQuery({
    queryKey: ['pflege-personen', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const namesSet = new Set<string>();

      // From pflege_eintraege
      const { data: eintraege } = await supabase
        .from('pflege_eintraege')
        .select('person_name')
        .eq('user_id', user.id);
      eintraege?.forEach(e => {
        if (e.person_name?.trim()) namesSet.add(e.person_name.trim());
      });

      // From medikamente
      const { data: meds } = await supabase
        .from('medikamente')
        .select('person_name')
        .eq('user_id', user.id);
      meds?.forEach(m => {
        const name = (m as any).person_name;
        if (name?.trim()) namesSet.add(name.trim());
      });

      return Array.from(namesSet).sort();
    },
    enabled: !!user,
    staleTime: 30000,
  });

  const handleAddNew = () => {
    const trimmed = newName.trim();
    if (trimmed) {
      onChange(trimmed);
      setNewName('');
      setShowNewInput(false);
    }
  };

  if (showNewInput) {
    return (
      <div className={`flex gap-2 ${className}`}>
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={isDE ? 'Name der Person' : 'Person name'}
          className="flex-1"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddNew();
            if (e.key === 'Escape') setShowNewInput(false);
          }}
        />
        <Button size="sm" onClick={handleAddNew} disabled={!newName.trim()}>
          {isDE ? 'OK' : 'OK'}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setShowNewInput(false)}>
          ✕
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex gap-2 items-center ${className}`}>
      <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      {personNames.length > 0 ? (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={isDE ? 'Person auswählen' : 'Select person'} />
          </SelectTrigger>
          <SelectContent>
            {personNames.map(name => (
              <SelectItem key={name} value={name}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <span className="text-sm text-muted-foreground flex-1">
          {value || (isDE ? 'Noch keine Person angelegt' : 'No person added yet')}
        </span>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 flex-shrink-0"
        onClick={() => setShowNewInput(true)}
        title={isDE ? 'Neue Person hinzufügen' : 'Add new person'}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PflegePersonSelector;

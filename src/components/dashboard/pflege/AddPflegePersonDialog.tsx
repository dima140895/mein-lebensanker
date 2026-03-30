import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface PflegePerson {
  id: string;
  name: string;
  geburtsjahr: number | null;
  beziehung: string | null;
}

interface AddPflegePersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPersonAdded?: (person: PflegePerson) => void;
}

const BEZIEHUNGEN = ['Mutter', 'Vater', 'Partner/in', 'Sonstiges'];

const AddPflegePersonDialog = ({ open, onOpenChange, onPersonAdded }: AddPflegePersonDialogProps) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const isDE = language === 'de';

  const [name, setName] = useState('');
  const [beziehung, setBeziehung] = useState<string | null>(null);
  const [geburtsjahr, setGeburtsjahr] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user || !name.trim()) return;
    setSaving(true);
    try {
      const { data, error } = await (supabase as any)
        .from('pflege_personen')
        .insert({
          user_id: user.id,
          name: name.trim(),
          beziehung: beziehung || null,
          geburtsjahr: geburtsjahr ? parseInt(geburtsjahr) : null,
        })
        .select()
        .single();
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: queryKeys.pflegePersonen(user.id) });
      toast.success(isDE ? 'Person hinzugefügt' : 'Person added');
      onPersonAdded?.(data as PflegePerson);
      resetAndClose();
    } catch (err) {
      toast.error(isDE ? 'Fehler beim Hinzufügen' : 'Error adding person');
    } finally {
      setSaving(false);
    }
  };

  const resetAndClose = () => {
    setName('');
    setBeziehung(null);
    setGeburtsjahr('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isDE ? 'Person hinzufügen' : 'Add person'}</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {isDE ? 'Für wen pflegst du?' : 'Who do you care for?'}
          </p>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>{isDE ? 'Name *' : 'Name *'}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isDE ? 'z.B. Walter oder Mutter' : 'e.g. Walter or Mother'}
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) handleSave(); }}
            />
          </div>

          <div className="space-y-2">
            <Label>{isDE ? 'Beziehung (optional)' : 'Relationship (optional)'}</Label>
            <div className="grid grid-cols-2 gap-2">
              {BEZIEHUNGEN.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBeziehung(beziehung === b ? null : b)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all min-h-[44px] ${
                    beziehung === b
                      ? 'bg-[#F5E8D4] border-[#C4813A] text-[#8B5A1A]'
                      : 'bg-white border-[#E5E0D8] text-muted-foreground hover:border-[#C4813A]/40'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{isDE ? 'Geburtsjahr (optional)' : 'Birth year (optional)'}</Label>
            <Input
              type="number"
              min="1900"
              max="2010"
              value={geburtsjahr}
              onChange={(e) => setGeburtsjahr(e.target.value)}
              placeholder={isDE ? 'z.B. 1944' : 'e.g. 1944'}
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="w-full rounded-xl py-2.5 min-h-[44px]"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {isDE ? 'Hinzufügen' : 'Add'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPflegePersonDialog;

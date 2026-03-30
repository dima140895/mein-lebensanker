import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Pencil, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import AddPflegePersonDialog from '@/components/dashboard/pflege/AddPflegePersonDialog';

interface PflegePerson {
  id: string;
  name: string;
  geburtsjahr: number | null;
  beziehung: string | null;
}

const getInitials = (name: string) =>
  name.split(/\s+/).map(w => w[0]?.toUpperCase() || '').slice(0, 2).join('');

const PflegePersonenManagement = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const isDE = language === 'de';
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { data: personen = [], isLoading } = useQuery({
    queryKey: queryKeys.pflegePersonen(user?.id ?? ''),
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('pflege_personen')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data as PflegePerson[]) || [];
    },
    enabled: !!user,
  });

  const { data: subscription } = useQuery({
    queryKey: queryKeys.subscription(user?.id ?? ''),
    queryFn: async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('plan, status')
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .limit(1)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const planLimit = subscription?.plan === 'familie' ? 5 : 2;
  const canAdd = personen.length < planLimit;

  const handleDelete = async () => {
    if (!deletingId || !user) return;
    setDeleteLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('pflege_personen')
        .delete()
        .eq('id', deletingId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: queryKeys.pflegePersonen(user.id) });
      toast.success(isDE ? 'Person gelöscht' : 'Person deleted');
    } catch {
      toast.error(isDE ? 'Fehler beim Löschen' : 'Error deleting');
    } finally {
      setDeleteLoading(false);
      setDeletingId(null);
    }
  };

  const deletingPerson = personen.find(p => p.id === deletingId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-sans text-lg font-semibold text-foreground">
          {isDE ? 'Pflegepersonen' : 'Care Recipients'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isDE ? `${personen.length} von ${planLimit} Personen` : `${personen.length} of ${planLimit} persons`}
        </p>
      </div>

      <div className="space-y-3">
        {personen.map((person) => (
          <Card key={person.id} className="border bg-white">
            <CardContent className="flex items-center gap-3 py-4 px-4">
              <span className="w-10 h-10 rounded-full bg-[#F5E8D4] text-[#8B5A1A] font-bold text-sm flex items-center justify-center shrink-0">
                {getInitials(person.name)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{person.name}</p>
                <p className="text-xs text-muted-foreground">
                  {[person.beziehung, person.geburtsjahr ? `*${person.geburtsjahr}` : null].filter(Boolean).join(' · ') || (isDE ? 'Keine Details' : 'No details')}
                </p>
              </div>
              <button
                onClick={() => setDeletingId(person.id)}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors p-2"
                title={isDE ? 'Löschen' : 'Delete'}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        ))}

        {canAdd && (
          <button
            onClick={() => setShowAddDialog(true)}
            className="w-full rounded-xl border border-dashed border-[#E5E0D8] hover:border-[#C4813A]/40 p-4 text-sm text-muted-foreground flex items-center justify-center gap-2 transition-all min-h-[44px]"
          >
            <Plus className="h-4 w-4" />
            {isDE ? 'Weitere Person hinzufügen' : 'Add another person'}
          </button>
        )}
      </div>

      <AddPflegePersonDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isDE ? 'Person löschen?' : 'Delete person?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {isDE
                ? `Wenn du ${deletingPerson?.name || 'diese Person'} löschst, werden alle zugehörigen Einträge und Medikamente ebenfalls gelöscht.`
                : `If you delete ${deletingPerson?.name || 'this person'}, all associated entries and medications will also be deleted.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isDE ? 'Abbrechen' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isDE ? 'Endgültig löschen' : 'Delete permanently'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PflegePersonenManagement;

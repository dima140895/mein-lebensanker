import { useState, useEffect } from 'react';
import { User, Plus, ChevronDown, Check, Pencil, Trash2 } from 'lucide-react';
import { useProfiles } from '@/contexts/ProfileContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/browserClient';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

const ProfileSwitcher = () => {
  const { language } = useLanguage();
  const { profile } = useAuth();
  const {
    personProfiles,
    activeProfileId,
    activeProfile,
    setActiveProfileId,
    createProfile,
    updateProfile,
    deleteProfile,
    canAddProfile,
  } = useProfiles();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<string | null>(null);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileBirthDate, setNewProfileBirthDate] = useState('');

  const texts = {
    de: {
      switchProfile: 'Profil wechseln',
      addProfile: 'Profil hinzufügen',
      editProfile: 'Profil bearbeiten',
      createProfile: 'Neues Profil erstellen',
      profileName: 'Name',
      birthDate: 'Geburtsdatum',
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      maxReached: 'Maximale Anzahl Profile erreicht',
      profileCreated: 'Profil erstellt',
      profileUpdated: 'Profil aktualisiert',
      profileDeleted: 'Profil gelöscht',
      confirmDelete: 'Profil wirklich löschen?',
      profiles: 'Profile',
    },
    en: {
      switchProfile: 'Switch Profile',
      addProfile: 'Add Profile',
      editProfile: 'Edit Profile',
      createProfile: 'Create New Profile',
      profileName: 'Name',
      birthDate: 'Birth Date',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      maxReached: 'Maximum profiles reached',
      profileCreated: 'Profile created',
      profileUpdated: 'Profile updated',
      profileDeleted: 'Profile deleted',
      confirmDelete: 'Really delete profile?',
      profiles: 'Profiles',
    },
  };

  const t = texts[language];

  // Don't show if user only has 1 max profile (single package)
  if (!profile?.has_paid || profile.max_profiles <= 1) {
    return null;
  }

  const handleCreateProfile = async () => {
    if (!newProfileName.trim()) return;
    
    const result = await createProfile(newProfileName.trim(), newProfileBirthDate || undefined);
    if (result) {
      // Also save personal data with the name and birth date
      const personalData = {
        fullName: newProfileName.trim(),
        birthDate: newProfileBirthDate || '',
        address: '',
        phone: '',
        trustedPerson1: '',
        trustedPerson1Phone: '',
        trustedPerson2: '',
        trustedPerson2Phone: '',
        emergencyContact: '',
        emergencyPhone: '',
        notes: '',
      };
      
      await supabase
        .from('vorsorge_data')
        .upsert({
          user_id: result.user_id,
          section_key: 'personal',
          data: personalData as unknown as Json,
          person_profile_id: result.id,
          is_for_partner: false,
        }, {
          onConflict: 'user_id,section_key,person_profile_id'
        });
      
      toast.success(t.profileCreated);
      setDialogOpen(false);
      setNewProfileName('');
      setNewProfileBirthDate('');
      setActiveProfileId(result.id);
    }
  };

  const handleEditProfile = async () => {
    if (!editingProfile || !newProfileName.trim()) return;
    
    await updateProfile(editingProfile, newProfileName.trim(), newProfileBirthDate || undefined);
    toast.success(t.profileUpdated);
    setDialogOpen(false);
    setEditingProfile(null);
    setNewProfileName('');
    setNewProfileBirthDate('');
  };

  const handleDeleteProfile = async (id: string) => {
    if (personProfiles.length <= 1) return; // Don't allow deleting last profile
    
    await deleteProfile(id);
    toast.success(t.profileDeleted);
  };

  const openCreateDialog = () => {
    setEditingProfile(null);
    setNewProfileName('');
    setNewProfileBirthDate('');
    setDialogOpen(true);
  };

  const openEditDialog = (profileId: string) => {
    const p = personProfiles.find(pr => pr.id === profileId);
    if (p) {
      setEditingProfile(profileId);
      setNewProfileName(p.name);
      setNewProfileBirthDate(p.birth_date || '');
      setDialogOpen(true);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
          >
            <User className="h-4 w-4" />
            <span className="max-w-[100px] truncate">
              {activeProfile?.name || t.switchProfile}
            </span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 bg-popover">
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            {t.profiles} ({personProfiles.length}/{profile?.max_profiles})
          </div>
          <DropdownMenuSeparator />
          
          {personProfiles.map((p) => (
            <DropdownMenuItem
              key={p.id}
              className="flex items-center justify-between group"
              onClick={() => setActiveProfileId(p.id)}
            >
              <div className="flex items-center gap-2">
                {p.id === activeProfileId && (
                  <Check className="h-4 w-4 text-primary" />
                )}
                {p.id !== activeProfileId && (
                  <div className="w-4" />
                )}
                <span className={p.id === activeProfileId ? 'font-medium' : ''}>
                  {p.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditDialog(p.id);
                }}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            </DropdownMenuItem>
          ))}
          
          {canAddProfile && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                {t.addProfile}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingProfile ? t.editProfile : t.createProfile}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="profileName">{t.profileName}</Label>
              <Input
                id="profileName"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder="Max Mustermann"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">{t.birthDate}</Label>
              <Input
                id="birthDate"
                type="date"
                value={newProfileBirthDate}
                onChange={(e) => setNewProfileBirthDate(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            {editingProfile && personProfiles.length > 1 && (
              <Button
                variant="destructive"
                onClick={() => {
                  handleDeleteProfile(editingProfile);
                  setDialogOpen(false);
                }}
                className="mr-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t.delete}
              </Button>
            )}
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t.cancel}
            </Button>
            <Button onClick={editingProfile ? handleEditProfile : handleCreateProfile}>
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileSwitcher;

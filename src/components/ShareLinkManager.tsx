import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link2, Plus, Trash2, Copy, Check, ExternalLink, Shield, Lock, Share2, Eye, Info, ShieldX, User, Wallet, Smartphone, Heart, FileText, Users, UserCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useEncryption } from '@/contexts/EncryptionContext';
import { useProfiles, PersonProfile } from '@/contexts/ProfileContext';
import { supabase } from '@/integrations/supabase/browserClient';
import { encryptData } from '@/lib/encryption';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Checkbox } from '@/components/ui/checkbox';

interface ShareToken {
  id: string;
  token: string;
  label: string | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  pin_hash: string | null;
  failed_attempts: number;
  shared_sections: string[] | null;
  shared_profile_ids: string[] | null;
  shared_profile_sections: Record<string, string[]> | null;
}

// Per-profile section selection: { profileId: ['personal', 'assets', ...] }
type ProfileSectionSelection = Record<string, SectionKey[]>;

const ALL_SECTIONS = ['personal', 'assets', 'digital', 'wishes', 'documents', 'contacts'] as const;
type SectionKey = typeof ALL_SECTIONS[number];

const ShareLinkManager = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { personProfiles } = useProfiles();
  const { isEncryptionEnabled, encryptionSalt } = useEncryption();
  const [tokens, setTokens] = useState<ShareToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pin, setPIN] = useState('');
  // Per-profile section selection state
  const [profileSections, setProfileSections] = useState<ProfileSectionSelection>({});
  // Which profiles are expanded in the UI
  const [expandedProfiles, setExpandedProfiles] = useState<string[]>([]);

  const sectionLabels = {
    de: {
      personal: 'Persönliche Daten',
      assets: 'Vermögen',
      digital: 'Digital',
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

  const sectionIcons: Record<SectionKey, React.ReactNode> = {
    personal: <User className="h-4 w-4" />,
    assets: <Wallet className="h-4 w-4" />,
    digital: <Smartphone className="h-4 w-4" />,
    wishes: <Heart className="h-4 w-4" />,
    documents: <FileText className="h-4 w-4" />,
    contacts: <Users className="h-4 w-4" />,
  };

  const t = {
    de: {
      title: 'Angehörigen-Zugang',
      description: 'Erstelle einen Zugangslink, den Du mit Deinen Angehörigen teilen kannst. Der Link ermöglicht nur Lesezugriff.',
      create: 'Neuen Link erstellen',
      label: 'Bezeichnung (optional)',
      labelPlaceholder: 'z.B. Für meine Tochter',
      noLinks: 'Noch keine Zugangslinks erstellt.',
      copied: 'Link kopiert!',
      copy: 'Kopieren',
      open: 'Öffnen',
      delete: 'Löschen',
      deleted: 'Link gelöscht',
      created: 'Zugangslink erstellt',
      securityNote: 'Jeder mit diesem Link und PIN kann Deine Übersicht einsehen. Teile ihn nur mit Personen, denen Du vertraust.',
      createdAt: 'Erstellt am',
      pinDescription: 'Angehörige müssen diesen 6-stelligen PIN eingeben. Nach 3 Fehlversuchen wird der Link gesperrt.',
      enterPIN: 'PIN festlegen (erforderlich)',
      pinRequired: 'Bitte gib einen 6-stelligen PIN ein',
      protected: 'Geschützt',
      blocked: 'Gesperrt',
      blockedReason: '3x falscher PIN',
      inactive: 'Inaktiv',
      howItWorksTitle: 'So funktioniert der Angehörigen-Zugang',
      howItWorksStep1Title: 'Link erstellen',
      howItWorksStep1Desc: 'Erstelle einen persönlichen Zugangslink – mit zwingendem PIN-Schutz für mehr Sicherheit.',
      howItWorksStep2Title: 'Link teilen',
      howItWorksStep2Desc: 'Sende den Link per E-Mail, Messenger oder gib ihn persönlich weiter. Bei PIN-Schutz teile den PIN separat mit.',
      howItWorksStep3Title: 'Übersicht einsehen',
      howItWorksStep3Desc: 'Deine Angehörigen können alle Informationen lesen, aber nichts ändern. Sie sehen eine ruhige, übersichtliche Darstellung.',
      whatTheySeeTile: 'Was Deine Angehörigen sehen',
      whatTheySeeDesc: 'Eine beruhigende Übersicht aller von Dir hinterlegten Informationen – persönliche Daten, Vermögenswerte, digitale Konten, persönliche Wünsche, Dokumentenstandorte und wichtige Kontakte.',
      importantNote: 'Wichtiger Hinweis',
      importantNoteDesc: 'Die Übersicht dient nur der Orientierung und hat keine rechtliche Wirkung. Sie ersetzt keine notarielle, rechtliche oder steuerliche Beratung.',
      selectSections: 'Bereiche auswählen',
      selectSectionsDesc: 'Wähle aus, welche Informationen Du mit diesem Link teilen möchtest.',
      selectAll: 'Alle auswählen',
      selectNone: 'Alle abwählen',
      atLeastOne: 'Bitte wähle mindestens einen Bereich aus',
      sharedSections: 'Geteilte Bereiche',
      selectProfiles: 'Profile auswählen',
      selectProfilesDesc: 'Wähle aus, für welche Profile die Daten geteilt werden sollen.',
      allProfiles: 'Alle Profile',
      atLeastOneProfile: 'Bitte wähle mindestens ein Profil aus',
      sharedProfiles: 'Geteilte Profile',
    },
    en: {
      title: 'Relatives Access',
      description: 'Create an access link to share with your loved ones. The link allows read-only access.',
      create: 'Create New Link',
      label: 'Label (optional)',
      labelPlaceholder: 'e.g., For my daughter',
      noLinks: 'No access links created yet.',
      copied: 'Link copied!',
      copy: 'Copy',
      open: 'Open',
      delete: 'Delete',
      deleted: 'Link deleted',
      created: 'Access link created',
      securityNote: 'Anyone with this link and PIN can view your overview. Only share it with people you trust.',
      createdAt: 'Created on',
      pinDescription: 'Relatives must enter this 6-digit PIN. After 3 failed attempts, the link will be locked.',
      enterPIN: 'Set PIN (required)',
      pinRequired: 'Please enter a 6-digit PIN',
      protected: 'Protected',
      blocked: 'Blocked',
      blockedReason: '3x wrong PIN',
      inactive: 'Inactive',
      howItWorksTitle: 'How Relatives Access Works',
      howItWorksStep1Title: 'Create a Link',
      howItWorksStep1Desc: 'Create a personal access link – with mandatory PIN protection for added security.',
      howItWorksStep2Title: 'Share the Link',
      howItWorksStep2Desc: 'Send the link via email, messenger, or share it in person. If PIN-protected, share the PIN separately.',
      howItWorksStep3Title: 'View Overview',
      howItWorksStep3Desc: 'Your loved ones can read all information but cannot make changes. They see a calm, clear presentation.',
      whatTheySeeTile: 'What Your Loved Ones See',
      whatTheySeeDesc: 'A reassuring overview of all your recorded information – personal data, assets, digital accounts, personal wishes, document locations, and important contacts.',
      importantNote: 'Important Note',
      importantNoteDesc: 'This overview is for orientation only and has no legal effect. It does not replace notarial, legal, or tax advice.',
      selectSections: 'Select Sections',
      selectSectionsDesc: 'Choose which information you want to share with this link.',
      selectAll: 'Select all',
      selectNone: 'Deselect all',
      atLeastOne: 'Please select at least one section',
      sharedSections: 'Shared sections',
      selectProfiles: 'Select Profiles',
      selectProfilesDesc: 'Choose which profiles\' data you want to share.',
      allProfiles: 'All profiles',
      atLeastOneProfile: 'Please select at least one profile',
      sharedProfiles: 'Shared profiles',
    },
  };

  const texts = t[language];

  const loadTokens = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('share_tokens')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTokens(data as ShareToken[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTokens();
  }, [user]);

  // Initialize profile sections when profiles load or dialog opens
  useEffect(() => {
    if (personProfiles.length > 0 && Object.keys(profileSections).length === 0) {
      initializeProfileSections();
    }
  }, [personProfiles]);

  const initializeProfileSections = () => {
    const initial: ProfileSectionSelection = {};
    personProfiles.forEach(p => {
      initial[p.id] = [...ALL_SECTIONS];
    });
    setProfileSections(initial);
    setExpandedProfiles(personProfiles.map(p => p.id));
  };

  const toggleProfileEnabled = (profileId: string) => {
    setProfileSections(prev => {
      const newState = { ...prev };
      if (profileId in newState) {
        delete newState[profileId];
      } else {
        newState[profileId] = [...ALL_SECTIONS];
      }
      return newState;
    });
  };

  const toggleProfileSection = (profileId: string, section: SectionKey) => {
    setProfileSections(prev => {
      const current = prev[profileId] || [];
      const updated = current.includes(section)
        ? current.filter(s => s !== section)
        : [...current, section];
      return { ...prev, [profileId]: updated };
    });
  };

  const selectAllSectionsForProfile = (profileId: string) => {
    setProfileSections(prev => ({ ...prev, [profileId]: [...ALL_SECTIONS] }));
  };

  const deselectAllSectionsForProfile = (profileId: string) => {
    setProfileSections(prev => ({ ...prev, [profileId]: [] }));
  };

  const toggleExpandProfile = (profileId: string) => {
    setExpandedProfiles(prev => 
      prev.includes(profileId) 
        ? prev.filter(id => id !== profileId)
        : [...prev, profileId]
    );
  };

  const selectAllProfiles = () => {
    const all: ProfileSectionSelection = {};
    personProfiles.forEach(p => {
      all[p.id] = profileSections[p.id] || [...ALL_SECTIONS];
    });
    setProfileSections(all);
  };

  const deselectAllProfiles = () => {
    setProfileSections({});
  };

  // Check if any profile has at least one section selected
  const hasValidSelection = () => {
    const enabledProfiles = Object.keys(profileSections);
    if (enabledProfiles.length === 0) return false;
    return enabledProfiles.some(id => (profileSections[id] || []).length > 0);
  };

  const createToken = async () => {
    if (!user) return;
    
    // Validate PIN - now always required
    if (pin.length !== 6) {
      toast.error(texts.pinRequired);
      return;
    }

    // Validate at least one profile with sections is selected
    if (!hasValidSelection()) {
      toast.error(texts.atLeastOne);
      return;
    }
    
    setCreating(true);

    // Build the shared_profile_sections object
    const sharedProfileSections: Record<string, string[]> = {};
    Object.entries(profileSections).forEach(([profileId, sections]) => {
      if (sections.length > 0) {
        sharedProfileSections[profileId] = sections;
      }
    });

    // Create the token with new per-profile sections structure
    const { data, error } = await supabase
      .from('share_tokens')
      .insert({
        user_id: user.id,
        label: newLabel.trim() || null,
        shared_profile_sections: sharedProfileSections,
        // Keep legacy columns null for new tokens using the new structure
        shared_sections: null,
        shared_profile_ids: null,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating token:', error);
      toast.error(language === 'de' ? 'Fehler beim Erstellen' : 'Error creating link');
      setCreating(false);
      return;
    }
    
    // PIN is now always required - generate salt, hash with secure function, and update
    if (pin.length === 6 && data) {
      // Generate a random salt for this token
      const randomBytes = new Uint8Array(16);
      crypto.getRandomValues(randomBytes);
      const pinSalt = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Use the secure hash function with salt
      const { data: hashData } = await supabase
        .rpc('hash_pin_secure', { _pin: pin, _salt: pinSalt });
      
      if (hashData) {
        const updateData: { pin_hash: string; pin_salt: string; encrypted_recovery_key?: string } = { 
          pin_hash: hashData, 
          pin_salt: pinSalt 
        };
        
        // If encryption is enabled and unlocked, encrypt the current encryption password with the PIN
        // This allows relatives to decrypt data automatically after entering the correct PIN
        if (isEncryptionEnabled && encryptionSalt) {
          try {
            // Get the current encryption password from session storage
            const currentEncryptionPassword = sessionStorage.getItem('vorsorge_encryption_key');
            
            if (currentEncryptionPassword) {
              // Encrypt the actual encryption password with the PIN
              const encryptedPasswordForPin = await encryptData(
                currentEncryptionPassword, 
                pin, 
                pinSalt
              );
              updateData.encrypted_recovery_key = encryptedPasswordForPin;
            }
          } catch (err) {
            logger.error('Error encrypting password for PIN:', err);
          }
        }
        
        await supabase
          .from('share_tokens')
          .update(updateData)
          .eq('id', data.id);
        
        data.pin_hash = hashData;
      }
    }
    
    if (data) {
      setTokens(prev => [data as ShareToken, ...prev]);
      toast.success(texts.created);
      setNewLabel('');
      setPIN('');
      initializeProfileSections();
      setDialogOpen(false);
    }
    setCreating(false);
  };

  const deleteToken = async (id: string) => {
    const { error } = await supabase
      .from('share_tokens')
      .delete()
      .eq('id', id);

    if (!error) {
      setTokens(prev => prev.filter(t => t.id !== id));
      toast.success(texts.deleted);
    }
  };

  const copyLink = async (token: string, id: string) => {
    const link = `${window.location.origin}/fuer-angehoerige/${token}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(id);
    toast.success(texts.copied);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">{texts.title}</h2>
          <p className="mt-1 text-muted-foreground">{texts.description}</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {texts.create}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{texts.create}</DialogTitle>
              <DialogDescription>
                {texts.securityNote}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{texts.label}</Label>
                <Input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder={texts.labelPlaceholder}
                />
              </div>

              {/* Per-Profile Section Selection */}
              <div className="rounded-lg border border-border p-4 space-y-4">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4" />
                    {texts.selectProfiles}
                  </Label>
                  <p className="text-sm text-muted-foreground">{texts.selectProfilesDesc}</p>
                </div>
                
                {personProfiles.length > 1 && (
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={selectAllProfiles}
                    >
                      {texts.selectAll}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={deselectAllProfiles}
                    >
                      {texts.selectNone}
                    </Button>
                  </div>
                )}

                <div className="space-y-3">
                  {personProfiles.map((profile) => {
                    const isEnabled = profile.id in profileSections;
                    const isExpanded = expandedProfiles.includes(profile.id);
                    const selectedCount = (profileSections[profile.id] || []).length;
                    
                    return (
                      <div 
                        key={profile.id} 
                        className={`rounded-lg border transition-colors ${
                          isEnabled ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                      >
                        {/* Profile Header */}
                        <div 
                          className="flex items-center justify-between p-3 cursor-pointer"
                          onClick={() => isEnabled && toggleExpandProfile(profile.id)}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={isEnabled}
                              onCheckedChange={() => toggleProfileEnabled(profile.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex items-center gap-2">
                              <UserCircle className="h-4 w-4" />
                              <span className="font-medium text-sm">{profile.name}</span>
                              {isEnabled && (
                                <span className="text-xs text-muted-foreground">
                                  ({selectedCount}/{ALL_SECTIONS.length} {texts.sharedSections})
                                </span>
                              )}
                            </div>
                          </div>
                          {isEnabled && (
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                        
                        {/* Section Selection (Expanded) */}
                        {isEnabled && isExpanded && (
                          <div className="px-3 pb-3 pt-0 space-y-3">
                            <div className="flex gap-2">
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={() => selectAllSectionsForProfile(profile.id)}
                              >
                                {texts.selectAll}
                              </Button>
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={() => deselectAllSectionsForProfile(profile.id)}
                              >
                                {texts.selectNone}
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              {ALL_SECTIONS.map((section) => {
                                const isSelected = (profileSections[profile.id] || []).includes(section);
                                return (
                                  <label
                                    key={section}
                                    className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors text-sm ${
                                      isSelected
                                        ? 'border-primary/50 bg-primary/10'
                                        : 'border-border hover:border-muted-foreground/50'
                                    }`}
                                  >
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={() => toggleProfileSection(profile.id, section)}
                                    />
                                    <span className="flex items-center gap-1.5">
                                      {sectionIcons[section]}
                                      {sectionLabels[language][section]}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* PIN Protection - Now mandatory */}
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-4">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    {texts.enterPIN}
                  </Label>
                  <p className="text-sm text-muted-foreground">{texts.pinDescription}</p>
                </div>
                
                <InputOTP
                  maxLength={6}
                  value={pin}
                  onChange={setPIN}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              
              <Button onClick={createToken} disabled={creating || pin.length !== 6 || !hasValidSelection()} className="w-full">
                {creating ? '...' : texts.create}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* How it works section */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <h3 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          {texts.howItWorksTitle}
        </h3>
        
        <div className="grid gap-4 md:grid-cols-3">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-sage-light/30">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <h4 className="font-medium text-foreground mb-1">{texts.howItWorksStep1Title}</h4>
            <p className="text-sm text-muted-foreground">{texts.howItWorksStep1Desc}</p>
          </div>
          
          {/* Step 2 */}
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-sage-light/30">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Share2 className="h-5 w-5 text-primary" />
            </div>
            <h4 className="font-medium text-foreground mb-1">{texts.howItWorksStep2Title}</h4>
            <p className="text-sm text-muted-foreground">{texts.howItWorksStep2Desc}</p>
          </div>
          
          {/* Step 3 */}
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-sage-light/30">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Eye className="h-5 w-5 text-primary" />
            </div>
            <h4 className="font-medium text-foreground mb-1">{texts.howItWorksStep3Title}</h4>
            <p className="text-sm text-muted-foreground">{texts.howItWorksStep3Desc}</p>
          </div>
        </div>
        
        {/* What they see */}
        <div className="rounded-lg bg-cream-dark/50 p-4 space-y-2">
          <h4 className="font-medium text-foreground">{texts.whatTheySeeTile}</h4>
          <p className="text-sm text-muted-foreground">{texts.whatTheySeeDesc}</p>
        </div>
        
        {/* Important note */}
        <div className="rounded-lg bg-amber-light/30 border border-amber/20 p-4 flex items-start gap-3">
          <Shield className="h-5 w-5 text-amber flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber">{texts.importantNote}</h4>
            <p className="text-sm text-amber/80">{texts.importantNoteDesc}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-amber-light/30 border border-amber/20 p-4 flex items-start gap-3">
        <Shield className="h-5 w-5 text-amber flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber">{texts.securityNote}</p>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">...</div>
      ) : tokens.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <Link2 className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{texts.noLinks}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tokens.map((token) => {
            const isBlocked = token.failed_attempts >= 3;
            const isInactive = !token.is_active && !isBlocked;
            
            return (
              <div
                key={token.id}
                className={`flex items-center justify-between gap-4 rounded-xl border p-4 ${
                  isBlocked 
                    ? 'border-destructive/30 bg-destructive/5' 
                    : isInactive 
                      ? 'border-muted bg-muted/30' 
                      : 'border-border bg-card'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-foreground truncate">
                      {token.label || `Link ${token.token.slice(0, 8)}...`}
                    </p>
                    {isBlocked ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                        <ShieldX className="h-3 w-3" />
                        {texts.blocked} ({texts.blockedReason})
                      </span>
                    ) : isInactive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {texts.inactive}
                      </span>
                    ) : token.pin_hash ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-sage-light px-2 py-0.5 text-xs font-medium text-sage-dark">
                        <Lock className="h-3 w-3" />
                        {texts.protected}
                      </span>
                    ) : null}
                  </div>
                  
                  {/* Show per-profile sections (new structure) */}
                  {token.shared_profile_sections && Object.keys(token.shared_profile_sections).length > 0 && (
                    <div className="space-y-1 mt-2">
                      {Object.entries(token.shared_profile_sections).map(([profileId, sections]) => {
                        const profile = personProfiles.find(p => p.id === profileId);
                        if (!profile) return null;
                        return (
                          <div key={profileId} className="flex flex-wrap items-center gap-1">
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground bg-primary/10 px-1.5 py-0.5 rounded">
                              <UserCircle className="h-3 w-3" />
                              {profile.name}:
                            </span>
                            {(sections as string[]).map((section) => (
                              <span 
                                key={section}
                                className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded"
                              >
                                {sectionIcons[section as SectionKey]}
                                {sectionLabels[language][section as SectionKey]}
                              </span>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Legacy: Show shared sections (old structure) */}
                  {!token.shared_profile_sections && token.shared_sections && token.shared_sections.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {token.shared_sections.map((section) => (
                        <span 
                          key={section}
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded"
                        >
                          {sectionIcons[section as SectionKey]}
                          {sectionLabels[language][section as SectionKey]}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Legacy: Show shared profiles (old structure) */}
                  {!token.shared_profile_sections && token.shared_profile_ids && token.shared_profile_ids.length > 0 && personProfiles.length > 1 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="text-xs text-muted-foreground mr-1">{texts.sharedProfiles}:</span>
                      {token.shared_profile_ids.map((profileId) => {
                        const profile = personProfiles.find(p => p.id === profileId);
                        return profile ? (
                          <span 
                            key={profileId}
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-primary/10 px-1.5 py-0.5 rounded"
                          >
                            <UserCircle className="h-3 w-3" />
                            {profile.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {texts.createdAt} {formatDate(token.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyLink(token.token, token.id)}
                    disabled={isBlocked}
                  >
                    {copiedId === token.id ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/fuer-angehoerige/${token.token}`, '_blank')}
                    disabled={isBlocked}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteToken(token.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default ShareLinkManager;

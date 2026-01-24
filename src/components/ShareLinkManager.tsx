import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link2, Plus, Trash2, Copy, Check, ExternalLink, Shield, Lock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/browserClient';
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
import { Switch } from '@/components/ui/switch';

interface ShareToken {
  id: string;
  token: string;
  label: string | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  pin_hash: string | null;
}

const ShareLinkManager = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [tokens, setTokens] = useState<ShareToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [usePIN, setUsePIN] = useState(false);
  const [pin, setPIN] = useState('');

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
      securityNote: 'Jeder mit diesem Link kann Deine Übersicht einsehen. Teile ihn nur mit Personen, denen Du vertraust.',
      createdAt: 'Erstellt am',
      pinProtection: 'PIN-Schutz aktivieren',
      pinDescription: 'Angehörige müssen einen 4-stelligen PIN eingeben',
      enterPIN: 'PIN festlegen',
      pinRequired: 'Bitte gib einen 4-stelligen PIN ein',
      protected: 'Geschützt',
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
      securityNote: 'Anyone with this link can view your overview. Only share it with people you trust.',
      createdAt: 'Created on',
      pinProtection: 'Enable PIN protection',
      pinDescription: 'Relatives must enter a 4-digit PIN',
      enterPIN: 'Set PIN',
      pinRequired: 'Please enter a 4-digit PIN',
      protected: 'Protected',
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

  const createToken = async () => {
    if (!user) return;
    
    // Validate PIN if enabled
    if (usePIN && pin.length !== 4) {
      toast.error(texts.pinRequired);
      return;
    }
    
    setCreating(true);

    // First create the token
    const { data, error } = await supabase
      .from('share_tokens')
      .insert({
        user_id: user.id,
        label: newLabel.trim() || null,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating token:', error);
      toast.error('Fehler beim Erstellen');
      setCreating(false);
      return;
    }
    
    // If PIN is enabled, hash and update
    if (usePIN && pin.length === 4 && data) {
      const { data: hashData } = await supabase
        .rpc('hash_pin', { _pin: pin });
      
      if (hashData) {
        await supabase
          .from('share_tokens')
          .update({ pin_hash: hashData })
          .eq('id', data.id);
        
        data.pin_hash = hashData;
      }
    }
    
    if (data) {
      setTokens(prev => [data as ShareToken, ...prev]);
      toast.success(texts.created);
      setNewLabel('');
      setPIN('');
      setUsePIN(false);
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
          <DialogContent>
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
              
              {/* PIN Protection Toggle */}
              <div className="rounded-lg border border-border p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      {texts.pinProtection}
                    </Label>
                    <p className="text-sm text-muted-foreground">{texts.pinDescription}</p>
                  </div>
                  <Switch
                    checked={usePIN}
                    onCheckedChange={setUsePIN}
                  />
                </div>
                
                {usePIN && (
                  <div className="space-y-2">
                    <Label>{texts.enterPIN}</Label>
                    <InputOTP
                      maxLength={4}
                      value={pin}
                      onChange={setPIN}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                )}
              </div>
              
              <Button onClick={createToken} disabled={creating || (usePIN && pin.length !== 4)} className="w-full">
                {creating ? '...' : texts.create}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
          {tokens.map((token) => (
            <div
              key={token.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground truncate">
                    {token.label || `Link ${token.token.slice(0, 8)}...`}
                  </p>
                  {token.pin_hash && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-sage-light px-2 py-0.5 text-xs font-medium text-sage-dark">
                      <Lock className="h-3 w-3" />
                      {texts.protected}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {texts.createdAt} {formatDate(token.created_at)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyLink(token.token, token.id)}
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
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ShareLinkManager;

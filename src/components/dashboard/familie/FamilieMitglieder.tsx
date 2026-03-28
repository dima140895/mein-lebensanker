import { useState, useEffect } from 'react';
import { Plus, Trash2, Mail, UserCheck, Clock, Loader2, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de as deLocale } from 'date-fns/locale';

interface FamilyMember {
  id: string;
  member_email: string;
  rolle: string;
  status: string;
  created_at: string;
}

const FamilieMitglieder = () => {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [rolle, setRolle] = useState<string>('lesen');
  const [userPlan, setUserPlan] = useState<string | null>(null);

  const t = {
    de: {
      invite: 'Neues Mitglied einladen',
      email: 'E-Mail-Adresse',
      emailPlaceholder: 'name@beispiel.de',
      rolle: 'Rolle',
      lesen: 'Nur lesen',
      mitbearbeiten: 'Mitbearbeiten',
      send: 'Einladung senden',
      sending: 'Wird gesendet...',
      cancel: 'Abbrechen',
      remove: 'Entfernen',
      noMembers: 'Noch keine Familienmitglieder',
      noMembersDesc: 'Lade Familienmitglieder ein, um gemeinsam Vorsorge und Pflege zu dokumentieren.',
      invited: 'Eingeladen',
      active: 'Aktiv',
      since: 'Seit',
      memberCount: (current: number, max: number) => `${current} von ${max} Mitgliedern`,
      sent: 'Einladung wurde versendet',
      removed: 'Mitglied entfernt',
      error: 'Fehler beim Senden',
      limitReached: 'Mitglieder-Limit erreicht',
      alreadyInvited: 'Diese Person wurde bereits eingeladen',
    },
    en: {
      invite: 'Invite new member',
      email: 'Email address',
      emailPlaceholder: 'name@example.com',
      rolle: 'Role',
      lesen: 'Read only',
      mitbearbeiten: 'Can edit',
      send: 'Send invitation',
      sending: 'Sending...',
      cancel: 'Cancel',
      remove: 'Remove',
      noMembers: 'No family members yet',
      noMembersDesc: 'Invite family members to collaborate on care and planning documentation.',
      invited: 'Invited',
      active: 'Active',
      since: 'Since',
      memberCount: (current: number, max: number) => `${current} of ${max} members`,
      sent: 'Invitation sent',
      removed: 'Member removed',
      error: 'Error sending invitation',
      limitReached: 'Member limit reached',
      alreadyInvited: 'This person has already been invited',
    },
  };
  const texts = t[language];

  const fetchMembers = async () => {
    if (!user) return;
    setLoading(true);

    const [{ data: membersData }, { data: sub }] = await Promise.all([
      supabase
        .from('familienzugang')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('subscriptions')
        .select('plan')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle(),
    ]);

    if (membersData) setMembers(membersData as FamilyMember[]);
    if (sub) setUserPlan(sub.plan);
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, [user]);

  const maxMembers = userPlan === 'familie' ? 10 : userPlan === 'plus' ? 5 : 0;

  const handleInvite = async () => {
    if (!user || !email.trim()) return;
    setSending(true);

    const { error } = await supabase.functions.invoke('send-family-invite', {
      body: {
        memberEmail: email.trim().toLowerCase(),
        rolle,
        ownerName: profile?.full_name || 'Jemand',
      },
    });

    if (error) {
      const msg = error.message || '';
      if (msg.includes('Already invited') || msg.includes('409')) {
        toast.error(texts.alreadyInvited);
      } else if (msg.includes('limit')) {
        toast.error(texts.limitReached);
      } else {
        toast.error(texts.error);
      }
    } else {
      toast.success(texts.sent);
      setShowForm(false);
      setEmail('');
      setRolle('lesen');
      fetchMembers();
    }
    setSending(false);
  };

  const handleRemove = async (id: string) => {
    const { error } = await supabase.from('familienzugang').delete().eq('id', id);
    if (!error) {
      toast.success(texts.removed);
      fetchMembers();
    }
  };

  const formatDate = (d: string) =>
    format(new Date(d), language === 'de' ? 'dd. MMM yyyy' : 'MMM dd, yyyy', {
      locale: language === 'de' ? deLocale : undefined,
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Member count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {texts.memberCount(members.length, maxMembers)}
        </p>
        {!showForm && members.length < maxMembers && (
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            {texts.invite}
          </Button>
        )}
      </div>

      {/* Invite Form */}
      {showForm && (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>{texts.email}</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={texts.emailPlaceholder}
              />
            </div>
            <div className="space-y-2">
              <Label>{texts.rolle}</Label>
              <Select value={rolle} onValueChange={setRolle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lesen">{texts.lesen}</SelectItem>
                  <SelectItem value="mitbearbeiten">{texts.mitbearbeiten}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleInvite} disabled={sending || !email.trim()}>
                {sending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{texts.sending}</>
                ) : (
                  <><Mail className="h-4 w-4 mr-2" />{texts.send}</>
                )}
              </Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setEmail(''); }}>
                {texts.cancel}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      {members.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">{texts.noMembers}</p>
          <p className="text-sm text-muted-foreground mt-1">{texts.noMembersDesc}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <Card key={member.id} className="border-border">
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      member.status === 'aktiv' ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      {member.status === 'aktiv' ? (
                        <UserCheck className="h-4 w-4 text-primary" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{member.member_email}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className={`text-xs ${
                          member.status === 'aktiv'
                            ? 'bg-primary/5 text-primary border-primary/20'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {member.status === 'aktiv' ? texts.active : texts.invited}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {member.rolle === 'lesen' ? texts.lesen : texts.mitbearbeiten}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemove(member.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FamilieMitglieder;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import StaticNav from '@/components/StaticNav';
import LandingFooter from '@/components/landing/LandingFooter';
import AuthForm from '@/components/AuthForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const FamilyInvitation = () => {
  const { token } = useParams<{ token: string }>();
  const { user, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'login' | 'accepting' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  const t = {
    de: {
      title: 'Familieneinladung',
      loginFirst: 'Bitte melde Dich an oder erstelle ein Konto, um die Einladung anzunehmen.',
      accepting: 'Einladung wird angenommen...',
      success: 'Einladung angenommen!',
      successDesc: 'Du hast jetzt Zugang zur Familienfreigabe. Du findest die geteilten Daten im Dashboard unter "Familie".',
      toDashboard: 'Zum Dashboard',
      error: 'Einladung konnte nicht angenommen werden',
      invalidToken: 'Dieser Einladungslink ist ungültig oder wurde bereits verwendet.',
    },
    en: {
      title: 'Family Invitation',
      loginFirst: 'Please sign in or create an account to accept the invitation.',
      accepting: 'Accepting invitation...',
      success: 'Invitation accepted!',
      successDesc: 'You now have access to the family sharing. You can find the shared data in the Dashboard under "Family".',
      toDashboard: 'Go to Dashboard',
      error: 'Could not accept the invitation',
      invalidToken: 'This invitation link is invalid or has already been used.',
    },
  };
  const texts = t[language];

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setStatus('login');
      return;
    }

    // Accept the invitation
    const accept = async () => {
      setStatus('accepting');
      const { data, error } = await supabase.rpc('accept_family_invitation', {
        _token: token || '',
        _user_id: user.id,
      });

      if (error || !data) {
        setStatus('error');
        setErrorMsg(texts.invalidToken);
      } else {
        setStatus('success');
      }
    };

    accept();
  }, [user, authLoading, token]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StaticNav />
      <main className="flex-1 pt-16 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <h1 className="font-serif text-2xl font-bold text-foreground text-center mb-6">
            {texts.title}
          </h1>

          {status === 'loading' || status === 'accepting' ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">{texts.accepting}</p>
              </CardContent>
            </Card>
          ) : status === 'login' ? (
            <div className="space-y-4">
              <p className="text-center text-muted-foreground text-sm">{texts.loginFirst}</p>
              <AuthForm />
            </div>
          ) : status === 'success' ? (
            <Card className="border-primary/20">
              <CardContent className="py-8 text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Check className="h-8 w-8 text-primary" />
                </div>
                <h2 className="font-serif text-xl font-bold text-foreground">{texts.success}</h2>
                <p className="text-sm text-muted-foreground">{texts.successDesc}</p>
                <Button onClick={() => navigate('/dashboard?module=familie')} className="mt-4">
                  {texts.toDashboard}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-destructive/20">
              <CardContent className="py-8 text-center space-y-4">
                <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
                <h2 className="font-serif text-lg font-bold text-foreground">{texts.error}</h2>
                <p className="text-sm text-muted-foreground">{errorMsg}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <LandingFooter />
    </div>
  );
};

export default FamilyInvitation;

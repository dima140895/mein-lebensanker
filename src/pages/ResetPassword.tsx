import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/browserClient';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checking, setChecking] = useState(true);

  const t = {
    de: {
      title: 'Neues Passwort setzen',
      password: 'Neues Passwort',
      confirmPassword: 'Passwort bestätigen',
      submit: 'Passwort ändern',
      success: 'Passwort erfolgreich geändert!',
      successMessage: 'Du kannst Dich jetzt mit Deinem neuen Passwort anmelden.',
      goToLogin: 'Zur Anmeldung',
      error: 'Fehler',
      passwordMismatch: 'Passwörter stimmen nicht überein',
      invalidSession: 'Ungültiger oder abgelaufener Link',
      invalidSessionDesc: 'Bitte fordere einen neuen Link an.',
      backToHome: 'Zur Startseite',
    },
    en: {
      title: 'Set New Password',
      password: 'New Password',
      confirmPassword: 'Confirm Password',
      submit: 'Change Password',
      success: 'Password changed successfully!',
      successMessage: 'You can now sign in with your new password.',
      goToLogin: 'Go to Login',
      error: 'Error',
      passwordMismatch: 'Passwords do not match',
      invalidSession: 'Invalid or expired link',
      invalidSessionDesc: 'Please request a new reset link.',
      backToHome: 'Back to Home',
    },
  };

  const texts = t[language];

  useEffect(() => {
    const checkSession = async () => {
      // Check if there's a token_hash in URL (from our custom recovery email)
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      
      if (tokenHash && type === 'recovery') {
        // Verify the token via Supabase
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery',
        });
        
        if (!error) {
          setIsValidSession(true);
          setChecking(false);
          return;
        } else {
          console.error('Recovery token verification failed:', error.message);
        }
      }

      // Fallback: check if we already have a valid session (e.g. from action_link)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsValidSession(true);
      }
      setChecking(false);
    };

    checkSession();

    // Listen for auth state changes (recovery flow via action_link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsValidSession(true);
          setChecking(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error(texts.passwordMismatch);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      setSuccess(true);
      toast.success(texts.success);
      
      // Sign out after password change
      await supabase.auth.signOut();
    } catch (error) {
      toast.error(texts.error, {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">{language === 'de' ? 'Laden...' : 'Loading...'}</div>
        </main>
      </div>
    );
  }

  if (!isValidSession && !success) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md text-center"
          >
            <div className="rounded-xl border border-border bg-card p-8 shadow-elevated">
              <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
                {texts.invalidSession}
              </h2>
              <p className="text-muted-foreground mb-6">{texts.invalidSessionDesc}</p>
              <Button onClick={() => navigate('/')}>
                {texts.backToHome}
              </Button>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md text-center"
          >
            <div className="rounded-xl border border-border bg-card p-8 shadow-elevated">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                {texts.success}
              </h2>
              <p className="text-muted-foreground mb-6">{texts.successMessage}</p>
              <Button onClick={() => navigate('/dashboard')}>
                {texts.goToLogin}
              </Button>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="rounded-xl border border-border bg-card p-8 shadow-elevated">
            <h2 className="font-serif text-2xl font-bold text-center text-foreground mb-6">
              {texts.title}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  {texts.password}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  {texts.confirmPassword}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '...' : texts.submit}
              </Button>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ResetPassword;

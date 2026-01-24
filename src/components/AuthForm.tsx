import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/browserClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface AuthFormProps {
  onSuccess?: () => void;
  defaultMode?: 'login' | 'register';
}

const AuthForm = ({ onSuccess, defaultMode = 'login' }: AuthFormProps) => {
  const { signUp, signIn } = useAuth();
  const { language } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const t = {
    de: {
      login: 'Anmelden',
      register: 'Registrieren',
      email: 'E-Mail-Adresse',
      password: 'Passwort',
      noAccount: 'Noch kein Konto?',
      hasAccount: 'Bereits ein Konto?',
      createAccount: 'Konto erstellen',
      loginNow: 'Jetzt anmelden',
      success: 'Erfolgreich!',
      error: 'Fehler',
      welcomeBack: 'Willkommen zurück!',
      accountCreated: 'Konto wurde erstellt!',
      forgotPassword: 'Passwort vergessen?',
      forgotTitle: 'Passwort zurücksetzen',
      forgotDesc: 'Gib Deine E-Mail-Adresse ein und wir senden Dir einen Link zum Zurücksetzen.',
      sendResetLink: 'Link senden',
      resetLinkSent: 'Link gesendet!',
      resetLinkSentDesc: 'Überprüfe Dein E-Mail-Postfach für den Reset-Link.',
      backToLogin: 'Zurück zur Anmeldung',
    },
    en: {
      login: 'Sign In',
      register: 'Sign Up',
      email: 'Email Address',
      password: 'Password',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      createAccount: 'Create Account',
      loginNow: 'Sign in now',
      success: 'Success!',
      error: 'Error',
      welcomeBack: 'Welcome back!',
      accountCreated: 'Account created!',
      forgotPassword: 'Forgot password?',
      forgotTitle: 'Reset Password',
      forgotDesc: 'Enter your email address and we will send you a reset link.',
      sendResetLink: 'Send Reset Link',
      resetLinkSent: 'Link sent!',
      resetLinkSentDesc: 'Check your email inbox for the reset link.',
      backToLogin: 'Back to login',
    },
  };

  const texts = t[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success(texts.welcomeBack);
        onSuccess?.();
      } else if (mode === 'register') {
        const { error } = await signUp(email, password);
        if (error) throw error;
        toast.success(texts.accountCreated);
        onSuccess?.();
      }
    } catch (error) {
      toast.error(texts.error, { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast.success(texts.resetLinkSent, {
        description: texts.resetLinkSentDesc,
      });
      
      // Go back to login after sending
      setMode('login');
    } catch (error) {
      toast.error(texts.error, {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Forgot password view
  if (mode === 'forgot') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="rounded-xl border border-border bg-card p-8 shadow-elevated">
          <button
            type="button"
            onClick={() => setMode('login')}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {texts.backToLogin}
          </button>

          <h2 className="font-serif text-2xl font-bold text-center text-foreground mb-2">
            {texts.forgotTitle}
          </h2>
          <p className="text-center text-muted-foreground text-sm mb-6">
            {texts.forgotDesc}
          </p>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                {texts.email}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '...' : texts.sendResetLink}
            </Button>
          </form>
        </div>
      </motion.div>
    );
  }

  // Login/Register view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="rounded-xl border border-border bg-card p-8 shadow-elevated">
        <h2 className="font-serif text-2xl font-bold text-center text-foreground mb-6">
          {mode === 'login' ? texts.login : texts.register}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              {texts.email}
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">
                {texts.password}
              </Label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs text-primary hover:underline"
                >
                  {texts.forgotPassword}
                </button>
              )}
            </div>
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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '...' : mode === 'login' ? texts.login : texts.register}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {mode === 'login' ? texts.noAccount : texts.hasAccount}{' '}
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-primary font-medium hover:underline"
          >
            {mode === 'login' ? texts.createAccount : texts.loginNow}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AuthForm;

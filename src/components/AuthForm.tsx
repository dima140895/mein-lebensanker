import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/browserClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';



interface AuthFormProps {
  onSuccess?: () => void;
  defaultMode?: 'login' | 'register';
  onVerifyModeChange?: (isVerifying: boolean) => void;
}

const AuthForm = ({ onSuccess, defaultMode = 'login', onVerifyModeChange }: AuthFormProps) => {
  const { signUp, signIn } = useAuth();
  const { language } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'verify'>(defaultMode);

  // Notify parent when verify mode changes
  const handleModeChange = (newMode: 'login' | 'register' | 'forgot' | 'verify') => {
    setMode(newMode);
    onVerifyModeChange?.(newMode === 'verify');
  };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      verifyTitle: 'Bestätige Deine E-Mail',
      verifyDesc: 'Wir haben Dir eine E-Mail an',
      verifyDesc2: 'gesendet. Klicke auf den Link in der E-Mail, um Dein Konto zu aktivieren.',
      checkSpam: 'Nicht erhalten? Prüfe auch Deinen Spam-Ordner.',
      resendEmail: 'Erneut senden',
      emailResent: 'E-Mail erneut gesendet!',
      emailNotConfirmed: 'Bitte bestätige zuerst Deine E-Mail-Adresse.',
      confirmPassword: 'Passwort bestätigen',
      passwordMismatch: 'Passwörter stimmen nicht überein',
      passwordsMatch: 'Passwörter stimmen überein',
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
      verifyTitle: 'Verify Your Email',
      verifyDesc: 'We sent an email to',
      verifyDesc2: 'Click the link in the email to activate your account.',
      checkSpam: "Didn't receive it? Check your spam folder.",
      resendEmail: 'Resend Email',
      emailResent: 'Email resent!',
      emailNotConfirmed: 'Please confirm your email address first.',
      confirmPassword: 'Confirm Password',
      passwordMismatch: 'Passwords do not match',
      passwordsMatch: 'Passwords match',
    },
  };

  const texts = t[language];

  const sendVerificationEmail = async (userEmail: string) => {
    try {
      const confirmationUrl = `${window.location.origin}/verify-email`;
      
      // Use supabase client to invoke edge function (handles correct URL automatically)
      const { error } = await supabase.functions.invoke('send-verification-email', {
        body: {
          email: userEmail,
          confirmationUrl,
        },
      });

      if (error) {
        logger.error('Failed to send verification email:', error);
      }
    } catch (err) {
      logger.error('Error sending verification email:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          // Check if email is not confirmed
          if (error.message.includes('Email not confirmed')) {
            toast.error(texts.emailNotConfirmed);
            handleModeChange('verify');
            return;
          }
          throw error;
        }
        toast.success(texts.welcomeBack);
        onSuccess?.();
      } else if (mode === 'register') {
        // Validate passwords match
        if (password !== confirmPassword) {
          toast.error(texts.passwordMismatch);
          setLoading(false);
          return;
        }
        
        const { error } = await signUp(email, password);
        if (error) throw error;
        
        // Send custom verification email via Resend
        await sendVerificationEmail(email);
        
        toast.success(texts.accountCreated);
        handleModeChange('verify');
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
      // Use custom edge function to send recovery email via Resend
      // (built-in auth emails don't reliably deliver to all providers like web.de)
      const { error } = await supabase.functions.invoke('send-recovery-email', {
        body: {
          email,
          redirectTo: `${window.location.origin}/reset-password`,
        },
      });
      
      if (error) throw error;
      
      toast.success(texts.resetLinkSent, {
        description: texts.resetLinkSentDesc,
      });
      
      // Go back to login after sending
      handleModeChange('login');
    } catch (error) {
      toast.error(texts.error, {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      // Resend using our custom edge function
      await sendVerificationEmail(email);
      toast.success(texts.emailResent);
    } catch (error) {
      toast.error(texts.error, {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Email verification view
  if (mode === 'verify') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="rounded-xl border border-border bg-card p-8 shadow-elevated text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          
          <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
            {texts.verifyTitle}
          </h2>
          
          <p className="text-muted-foreground mb-1">
            {texts.verifyDesc}
          </p>
          <p className="font-medium text-foreground mb-1">
            {email}
          </p>
          <p className="text-muted-foreground mb-6">
            {texts.verifyDesc2}
          </p>
          
          <p className="text-sm text-muted-foreground mb-4">
            {texts.checkSpam}
          </p>
          
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={handleResendEmail}
              disabled={loading}
              className="w-full"
            >
              {loading ? '...' : texts.resendEmail}
            </Button>
            
          </div>
        </div>
      </motion.div>
    );
  }

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
            onClick={() => handleModeChange('login')}
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
                  onClick={() => handleModeChange('forgot')}
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

          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                {texts.confirmPassword}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Real-time password match indicator */}
              {confirmPassword && (
                <div className={`flex items-center gap-1.5 text-xs mt-1.5 ${
                  password === confirmPassword 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-destructive'
                }`}>
                  {password === confirmPassword ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>{texts.passwordsMatch}</span>
                    </>
                  ) : (
                    <>
                      <X className="h-3.5 w-3.5" />
                      <span>{texts.passwordMismatch}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '...' : mode === 'login' ? texts.login : texts.register}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {mode === 'login' ? texts.noAccount : texts.hasAccount}{' '}
          <button
            type="button"
            onClick={() => handleModeChange(mode === 'login' ? 'register' : 'login')}
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

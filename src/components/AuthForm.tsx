import { useState, useEffect, useRef } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Check, X, Anchor, Shield, MapPin, Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/browserClient';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import StaticNav from '@/components/StaticNav';
import LandingFooter from '@/components/landing/LandingFooter';

interface AuthFormProps {
  onSuccess?: () => void;
  defaultMode?: 'login' | 'register';
  onVerifyModeChange?: (isVerifying: boolean) => void;
  /** When true, skip the built-in StaticNav + Footer wrapper (e.g. when rendered inside Dashboard) */
  embedded?: boolean;
}

const AuthForm = ({ onSuccess, defaultMode = 'login', onVerifyModeChange, embedded = false }: AuthFormProps) => {
  const { signUp, signIn } = useAuth();
  const { language } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'verify' | 'mfa'>(defaultMode);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [mfaChallengeId, setMfaChallengeId] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');

  const handleModeChange = (newMode: 'login' | 'register' | 'forgot' | 'verify' | 'mfa') => {
    setMode(newMode);
    onVerifyModeChange?.(newMode === 'verify' || newMode === 'mfa');
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const t = {
    de: {
      login: 'Anmelden',
      register: 'Registrieren',
      email: 'E-Mail-Adresse',
      password: 'Passwort',
      noAccount: 'Noch kein Konto?',
      hasAccount: 'Bereits registriert?',
      createAccount: 'Jetzt registrieren →',
      loginNow: 'Hier anmelden →',
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
      accountExists: 'Es existiert bereits ein Konto mit dieser E-Mail-Adresse. Bitte melde Dich an.',
      welcomeHeadline: 'Willkommen zurück.',
      welcomeSub: 'Deine Daten warten auf dich.',
      registerHeadline: 'Jetzt starten.',
      registerSub: 'Kostenlos — kein Abo-Zwang beim Start.',
      backToHome: '← Zurück zur Startseite',
      mfaTitle: 'Zwei-Faktor-Authentifizierung',
      mfaDesc: 'Bitte gib den Code aus deiner Authenticator-App ein',
      mfaVerify: 'Bestätigen',
      mfaInvalid: 'Ungültiger Code — bitte prüfe deine Authenticator-App.',
      mfaOtherEmail: 'Andere E-Mail verwenden',
    },
    en: {
      login: 'Sign In',
      register: 'Sign Up',
      email: 'Email Address',
      password: 'Password',
      noAccount: "Don't have an account?",
      hasAccount: 'Already registered?',
      createAccount: 'Sign up now →',
      loginNow: 'Sign in here →',
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
      accountExists: 'An account with this email already exists. Please sign in.',
      welcomeHeadline: 'Welcome back.',
      welcomeSub: 'Your data is waiting for you.',
      registerHeadline: 'Get started.',
      registerSub: 'Free — no subscription required to start.',
      backToHome: '← Back to home',
      mfaTitle: 'Two-Factor Authentication',
      mfaDesc: 'Please enter the code from your authenticator app',
      mfaVerify: 'Verify',
      mfaInvalid: 'Invalid code — please check your authenticator app.',
      mfaOtherEmail: 'Use a different email',
    },
  };

  const texts = t[language];

  const sendVerificationEmail = async (userEmail: string) => {
    try {
      const confirmationUrl = `${window.location.origin}/verify-email`;
      const { error } = await supabase.functions.invoke('send-verification-email', {
        body: { email: userEmail, confirmationUrl },
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
        const { error, data } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            toast.error(texts.emailNotConfirmed);
            handleModeChange('verify');
            return;
          }
          throw error;
        }

        // Check if MFA is required after successful password auth
        const { data: factorsData } = await supabase.auth.mfa.listFactors();
        const verifiedFactors = factorsData?.totp?.filter(f => f.status === 'verified') ?? [];
        if (verifiedFactors.length > 0) {
          // MFA is enabled — need to challenge
          const factorId = verifiedFactors[0].id;
          const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
          if (challengeError) throw challengeError;
          setMfaFactorId(factorId);
          setMfaChallengeId(challengeData.id);
          setMfaCode('');
          handleModeChange('mfa');
          return;
        }

        toast.success(texts.welcomeBack);
        onSuccess?.();
      } else if (mode === 'register') {
        const allMet = password.length >= 6
          && /[A-Z]/.test(password)
          && /[a-z]/.test(password)
          && /[0-9]/.test(password)
          && /[^A-Za-z0-9]/.test(password);

        if (!allMet) {
          setPasswordError(true);
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          toast.error(texts.passwordMismatch);
          setLoading(false);
          return;
        }

        setPasswordError(false);
        const { error, userExists } = await signUp(email, password);
        if (error) throw error;

        if (userExists) {
          toast.info(texts.accountExists);
          handleModeChange('login');
          setLoading(false);
          return;
        }

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

  // Poll for email verification
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (mode !== 'verify' || !email) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    pollingRef.current = setInterval(async () => {
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error) {
          setVerified(true);
          if (pollingRef.current) clearInterval(pollingRef.current);
          pollingRef.current = null;

          toast.success(
            language === 'de' ? 'E-Mail bestätigt!' : 'Email verified!',
            { description: language === 'de' ? 'Du wirst jetzt weitergeleitet...' : 'Redirecting now...' }
          );

          setTimeout(() => {
            onSuccess?.();
          }, 1500);
        }
      } catch {
        // Ignore polling errors
      }
    }, 3000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [mode, email, password, language]);

  // Shared input classes
  const inputClassName = "w-full pl-10 pr-10 py-3 rounded-lg border border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/10 font-body text-base bg-card text-foreground placeholder:text-muted-foreground/50 transition-all duration-200";

  // Wrapper with background
  const PageWrapper = ({ children }: { children: React.ReactNode }) => {
    if (embedded) {
      return (
        <div
          className="flex-1 flex items-center justify-center px-4 py-12"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 60% 50% at 80% 20%, rgba(122,158,142,0.12) 0%, transparent 60%),
              radial-gradient(ellipse 40% 60% at 10% 80%, rgba(196,129,58,0.07) 0%, transparent 50%)
            `,
          }}
        >
          {children}
        </div>
      );
    }
    return (
      <div className="min-h-screen flex flex-col">
        <StaticNav minimal />
        <div
          className="flex-1 flex items-center justify-center px-4 py-12 pt-24"
          style={{
            backgroundColor: 'hsl(var(--background))',
            backgroundImage: `
              radial-gradient(ellipse 60% 50% at 80% 20%, rgba(122,158,142,0.12) 0%, transparent 60%),
              radial-gradient(ellipse 40% 60% at 10% 80%, rgba(196,129,58,0.07) 0%, transparent 50%)
            `,
          }}
        >
          {children}
        </div>
        <LandingFooter />
      </div>
    );
  };

  // Logo component
  const LogoHeader = () => (
    <div className="flex flex-col items-center mb-8">
      <div className="w-12 h-12 rounded-full bg-forest flex items-center justify-center mb-3">
        <Anchor className="h-6 w-6 text-white" />
      </div>
      <span className="font-serif text-xl text-forest">Mein Lebensanker</span>
    </div>
  );

  // Trust badges
  const TrustBadges = () => (
    <div className="flex items-center justify-center gap-4 mt-6 text-xs text-muted-foreground font-body">
      <span className="flex items-center gap-1">
        <Shield className="h-3.5 w-3.5" />
        DSGVO
      </span>
      <span className="text-border">·</span>
      <span className="flex items-center gap-1">
        <MapPin className="h-3.5 w-3.5" />
        Deutschland
      </span>
      <span className="text-border">·</span>
      <span className="flex items-center gap-1">
        <Check className="h-3.5 w-3.5" />
        Sicher
      </span>
    </div>
  );

  // Email verification view
  if (mode === 'verify') {
    return (
      <PageWrapper>
        <div className="w-full max-w-md mx-auto animate-fade-in-up">
          <div className="bg-card rounded-2xl shadow-[0_8px_40px_rgba(44,74,62,0.12)] px-6 sm:px-8 py-8 sm:py-10 text-center">
            <LogoHeader />

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              {verified ? (
                <Check className="h-8 w-8 text-green-600" />
              ) : (
                <Mail className="h-8 w-8 text-primary" />
              )}
            </div>

            <h2 className="font-serif text-2xl text-forest mb-2">
              {verified
                ? (language === 'de' ? 'E-Mail bestätigt!' : 'Email verified!')
                : texts.verifyTitle}
            </h2>

            {verified ? (
              <p className="text-muted-foreground font-body mb-4">
                {language === 'de' ? 'Du wirst gleich weitergeleitet...' : 'Redirecting now...'}
              </p>
            ) : (
              <>
                <p className="text-muted-foreground font-body mb-1">
                  {texts.verifyDesc}
                </p>
                <p className="font-medium text-forest font-body mb-1">
                  {email}
                </p>
                <p className="text-muted-foreground font-body mb-6">
                  {texts.verifyDesc2}
                </p>

                <p className="text-sm text-muted-foreground font-body mb-4">
                  {texts.checkSpam}
                </p>

                <Button
                  variant="outline"
                  onClick={handleResendEmail}
                  disabled={loading}
                  className="w-full min-h-[44px] rounded-lg font-body"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : texts.resendEmail}
                </Button>
              </>
            )}

            <TrustBadges />
          </div>
        </div>
      </PageWrapper>
    );
  }

  // Forgot password view
  if (mode === 'forgot') {
    return (
      <PageWrapper>
        <div className="w-full max-w-md mx-auto animate-fade-in-up">
           <div className="bg-card rounded-2xl shadow-[0_8px_40px_rgba(44,74,62,0.12)] px-6 sm:px-8 py-8 sm:py-10">
            <LogoHeader />

            <button
              type="button"
              onClick={() => handleModeChange('login')}
              className="flex items-center text-sm text-muted-foreground hover:text-primary mb-4 font-body min-h-[44px] transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {texts.backToLogin}
            </button>

            <h2 className="font-serif text-2xl text-forest mb-2">
              {texts.forgotTitle}
            </h2>
            <p className="text-sm text-muted-foreground mb-6 font-body">
              {texts.forgotDesc}
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium font-body text-forest">
                  {texts.email}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClassName}
                    placeholder={language === 'de' ? 'name@beispiel.de' : 'name@example.com'}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full min-h-[44px] rounded-lg font-body font-medium text-base bg-primary hover:bg-forest active:scale-[0.98] transition-all duration-200"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : texts.sendResetLink}
              </Button>
            </form>

            <TrustBadges />
          </div>
        </div>
      </PageWrapper>
    );
  }

  // Login/Register view
  return (
    <PageWrapper>
      <div className="w-full max-w-md mx-auto animate-fade-in-up">
        <div className="bg-card rounded-2xl shadow-[0_8px_40px_rgba(44,74,62,0.12)] px-6 sm:px-8 py-8 sm:py-10">
          <LogoHeader />

          {/* Tab navigation */}
          <div className="flex border-b border-border mb-6">
            <button
              type="button"
              onClick={() => handleModeChange('login')}
              className={`flex-1 pb-3 text-sm font-body font-medium transition-colors ${
                mode === 'login'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-forest'
              }`}
            >
              {language === 'de' ? 'Anmelden' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('register')}
              className={`flex-1 pb-3 text-sm font-body font-medium transition-colors ${
                mode === 'register'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-forest'
              }`}
            >
              {language === 'de' ? 'Registrieren' : 'Sign Up'}
            </button>
          </div>

          {/* Headline */}
          <h2 className="font-serif text-2xl text-forest mb-1">
            {mode === 'login' ? texts.welcomeHeadline : texts.registerHeadline}
          </h2>
          <p className="text-sm text-muted-foreground font-body mb-6">
            {mode === 'login' ? texts.welcomeSub : texts.registerSub}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium font-body text-forest">
                {texts.email}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClassName}
                  placeholder={language === 'de' ? 'name@beispiel.de' : 'name@example.com'}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium font-body text-forest">
                  {language === 'de' ? 'Passwort' : 'Password'}
                </Label>
                {mode === 'login' && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => handleModeChange('forgot')}
                          className="text-xs text-muted-foreground hover:text-primary font-body transition-colors"
                        >
                          {texts.forgotPassword}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>{language === 'de' ? 'Du erhältst eine E-Mail zum Zurücksetzen Deines Anmelde-Passworts.' : 'You will receive an email to reset your login password.'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(false); }}
                  className={inputClassName}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-forest transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password requirements - register only */}
              {mode === 'register' && (password.length > 0 || passwordError) && (
                <div className={`mt-2.5 rounded-lg border p-3 space-y-1.5 transition-colors ${
                  passwordError
                    ? 'border-destructive/50 bg-destructive/5'
                    : 'border-border bg-muted/30'
                }`}>
                  <p className={`text-xs font-medium mb-1 font-body ${
                    passwordError ? 'text-destructive' : 'text-muted-foreground'
                  }`}>
                    {passwordError
                      ? (language === 'de' ? 'Bitte erfülle alle Passwort-Anforderungen:' : 'Please meet all password requirements:')
                      : (language === 'de' ? 'Passwort-Anforderungen:' : 'Password requirements:')}
                  </p>
                  {[
                    { met: password.length >= 6, label: language === 'de' ? 'Mindestens 6 Zeichen' : 'At least 6 characters' },
                    { met: /[A-Z]/.test(password), label: language === 'de' ? 'Ein Großbuchstabe' : 'One uppercase letter' },
                    { met: /[a-z]/.test(password), label: language === 'de' ? 'Ein Kleinbuchstabe' : 'One lowercase letter' },
                    { met: /[0-9]/.test(password), label: language === 'de' ? 'Eine Zahl' : 'One number' },
                    { met: /[^A-Za-z0-9]/.test(password), label: language === 'de' ? 'Ein Sonderzeichen (z.\u00A0B. !@#$%)' : 'One special character (e.g. !@#$%)' },
                  ].map((req, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-body">
                      {req.met ? (
                        <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
                      ) : (
                        <X className={`h-3.5 w-3.5 shrink-0 ${passwordError ? 'text-destructive' : 'text-muted-foreground/50'}`} />
                      )}
                      <span className={req.met ? 'text-green-600' : passwordError ? 'text-destructive' : 'text-muted-foreground'}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm password - register only */}
            {mode === 'register' && (
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm font-medium font-body text-forest">
                  {texts.confirmPassword}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClassName}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-forest transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && (
                  <div className={`flex items-center gap-1.5 text-xs mt-1.5 font-body ${
                    password === confirmPassword ? 'text-green-600' : 'text-destructive'
                  }`}>
                    {password === confirmPassword ? (
                      <><Check className="h-3.5 w-3.5" /><span>{texts.passwordsMatch}</span></>
                    ) : (
                      <><X className="h-3.5 w-3.5" /><span>{texts.passwordMismatch}</span></>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full min-h-[44px] rounded-lg font-body font-medium text-base bg-primary hover:bg-forest active:scale-[0.98] transition-all duration-200 mt-6"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                mode === 'login' ? texts.login : texts.register
              )}
            </Button>
          </form>

          {/* Trust badges */}
          <TrustBadges />

          {/* Switch mode */}
          <div className="mt-4 text-center text-sm text-muted-foreground font-body">
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
      </div>
    </PageWrapper>
  );
};

export default AuthForm;

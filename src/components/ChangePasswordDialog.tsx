import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Key, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ChangePasswordDialog = ({ open, onOpenChange }: ChangePasswordDialogProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const t = {
    de: {
      title: 'Passwort ändern',
      description: 'Gib Dein neues Passwort ein. Das Passwort muss mindestens 6 Zeichen lang sein.',
      newPassword: 'Neues Passwort',
      confirmPassword: 'Passwort bestätigen',
      newPasswordPlaceholder: 'Mindestens 6 Zeichen',
      confirmPasswordPlaceholder: 'Passwort wiederholen',
      submit: 'Passwort ändern',
      cancel: 'Abbrechen',
      success: 'Passwort erfolgreich geändert',
      successDescription: 'Dein Passwort wurde aktualisiert.',
      error: 'Fehler beim Ändern des Passworts',
      passwordMismatch: 'Die Passwörter stimmen nicht überein.',
      passwordTooShort: 'Das Passwort muss mindestens 6 Zeichen lang sein.',
    },
    en: {
      title: 'Change Password',
      description: 'Enter your new password. The password must be at least 6 characters long.',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      newPasswordPlaceholder: 'At least 6 characters',
      confirmPasswordPlaceholder: 'Repeat password',
      submit: 'Change Password',
      cancel: 'Cancel',
      success: 'Password changed successfully',
      successDescription: 'Your password has been updated.',
      error: 'Error changing password',
      passwordMismatch: 'Passwords do not match.',
      passwordTooShort: 'Password must be at least 6 characters long.',
    },
  };

  const texts = t[language];

  const schema = z.object({
    newPassword: z.string().min(6, texts.passwordTooShort),
    confirmPassword: z.string().min(6, texts.passwordTooShort),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: texts.passwordMismatch,
    path: ['confirmPassword'],
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) {
        toast({
          title: texts.error,
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: texts.success,
        description: texts.successDescription,
      });
      reset();
      onOpenChange(false);
    } catch {
      toast({
        title: texts.error,
        description: language === 'de' ? 'Ein unerwarteter Fehler ist aufgetreten.' : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="font-serif">{texts.title}</DialogTitle>
              <DialogDescription className="text-sm">
                {texts.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">{texts.newPassword}</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder={texts.newPasswordPlaceholder}
                {...register('newPassword')}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-destructive">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{texts.confirmPassword}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={texts.confirmPasswordPlaceholder}
                {...register('confirmPassword')}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              {texts.cancel}
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {texts.submit}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;

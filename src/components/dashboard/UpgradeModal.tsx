import { Lock, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { DashboardModule } from './DashboardSidebar';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lockedModule: DashboardModule | null;
}

const moduleInfo: Record<string, { de: { name: string; desc: string; plan: string }; en: { name: string; desc: string; plan: string } }> = {
  pflege: {
    de: { name: 'Pflege-Begleiter', desc: 'Begleite Pflegesituationen strukturiert — von der Organisation bis zur Dokumentation.', plan: 'Anker Plus' },
    en: { name: 'Care Companion', desc: 'Manage care situations systematically — from organization to documentation.', plan: 'Anker Plus' },
  },
  krankheit: {
    de: { name: 'Krankheits-Begleiter', desc: 'Dokumentiere Symptome, Arztbesuche und Behandlungen übersichtlich.', plan: 'Anker Plus' },
    en: { name: 'Health Companion', desc: 'Track symptoms, doctor visits and treatments clearly.', plan: 'Anker Plus' },
  },
  familie: {
    de: { name: 'Familie', desc: 'Verwalte bis zu 10 Profile und teile die Vorsorge mit Deiner Familie.', plan: 'Anker Familie' },
    en: { name: 'Family', desc: 'Manage up to 10 profiles and share planning with your family.', plan: 'Anker Familie' },
  },
};

const UpgradeModal = ({ open, onOpenChange, lockedModule }: UpgradeModalProps) => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  if (!lockedModule || !moduleInfo[lockedModule]) return null;

  const info = moduleInfo[lockedModule][language];

  const t = {
    de: {
      included: 'Dieses Modul ist enthalten in',
      upgrade: 'Jetzt upgraden — ab €9/Monat',
      later: 'Vielleicht später',
    },
    en: {
      included: 'This module is included in',
      upgrade: 'Upgrade now — from €9/month',
      later: 'Maybe later',
    },
  };

  const texts = t[language];

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate('/dashboard?section=upgrade');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl shadow-elevated bg-white">
        <DialogHeader className="text-center items-center">
          <div className="h-14 w-14 rounded-2xl bg-amber-light/30 border border-accent/20 flex items-center justify-center mb-2">
            <Lock className="h-7 w-7 text-accent" />
          </div>
          <DialogTitle className="font-serif text-xl text-forest">{info.name}</DialogTitle>
          <DialogDescription className="text-sm text-charcoal-light mt-1 font-body">
            {info.desc}
          </DialogDescription>
        </DialogHeader>

        <div className="text-center space-y-4 pt-2">
          <p className="text-sm text-charcoal-light font-body">
            {texts.included} <span className="font-semibold text-primary">{info.plan}</span>
          </p>

          <Button onClick={handleUpgrade} className="w-full gap-2 bg-accent hover:bg-accent/90 text-white rounded-lg min-h-[44px] font-body font-medium">
            {texts.upgrade}
            <ArrowRight className="h-4 w-4" />
          </Button>

          <button onClick={() => onOpenChange(false)} className="text-sm text-charcoal-light hover:text-forest transition-colors font-body">
            {texts.later}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;

import { HeartHandshake, Stethoscope, Users, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import type { DashboardModule } from './DashboardSidebar';

interface PlaceholderModuleProps {
  module: DashboardModule;
}

const moduleConfig: Record<string, {
  icon: typeof HeartHandshake;
  de: { title: string; desc: string };
  en: { title: string; desc: string };
  color: string;
}> = {
  pflege: {
    icon: HeartHandshake,
    de: { title: 'Pflege-Begleiter', desc: 'Dieses Modul wird bald verfügbar sein. Hier kannst Du Pflegesituationen dokumentieren, Termine verwalten und den Überblick behalten.' },
    en: { title: 'Care Companion', desc: 'This module will be available soon. Here you can document care situations, manage appointments and keep track.' },
    color: 'bg-amber-light text-amber',
  },
  krankheit: {
    icon: Stethoscope,
    de: { title: 'Krankheits-Begleiter', desc: 'Dieses Modul wird bald verfügbar sein. Hier kannst Du Symptome, Arztbesuche und Behandlungen dokumentieren.' },
    en: { title: 'Health Companion', desc: 'This module will be available soon. Here you can document symptoms, doctor visits and treatments.' },
    color: 'bg-sage-light text-sage-dark',
  },
  familie: {
    icon: Users,
    de: { title: 'Familie', desc: 'Dieses Modul wird bald verfügbar sein. Hier kannst Du bis zu 10 Profile verwalten und die Vorsorge mit Deiner Familie teilen.' },
    en: { title: 'Family', desc: 'This module will be available soon. Here you can manage up to 10 profiles and share planning with your family.' },
    color: 'bg-primary/10 text-primary',
  },
};

const PlaceholderModule = ({ module }: PlaceholderModuleProps) => {
  const { language } = useLanguage();
  const config = moduleConfig[module];

  if (!config) return null;

  const Icon = config.icon;
  const texts = config[language];

  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Card className="max-w-md w-full border-dashed border-2 border-border bg-card/50">
        <CardContent className="flex flex-col items-center text-center py-12 px-6 space-y-4">
          <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${config.color}`}>
            <Icon className="h-8 w-8" />
          </div>
          <h2 className="font-sans text-2xl font-bold text-foreground">{texts.title}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">{texts.desc}</p>
          <div className="flex items-center gap-2 text-primary text-sm font-medium pt-2">
            <Sparkles className="h-4 w-4" />
            {language === 'de' ? 'Kommt bald' : 'Coming soon'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlaceholderModule;

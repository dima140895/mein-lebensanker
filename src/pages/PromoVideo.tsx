import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Share2, MessageCircle, Mail, Copy, Check, Presentation } from 'lucide-react';
import Logo from '@/components/Logo';
import ExplainerSlideshow from '@/components/ExplainerSlideshow';
import { useLanguage } from '@/contexts/LanguageContext';

const PromoVideo = () => {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('slideshow');

  const shareUrl = 'https://mein-lebensanker.lovable.app/promo';
  const shareText = language === 'de' 
    ? 'Schau Dir das an – ein Tool, das uns hilft, wichtige Dinge für die Zukunft zu organisieren. Für Dich und die Menschen, die Dir wichtig sind. 🌿'
    : 'Check this out – a tool that helps us organize important things for the future. For you and the people who matter to you. 🌿';

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`, '_blank');
  };

  const shareEmail = () => {
    const subject = language === 'de' ? 'Mein Lebensanker – Für Dich und die Menschen, die Dir wichtig sind' : 'Mein Lebensanker – For you and the people who matter';
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`, '_blank');
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <a href="/" className="inline-flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <Logo size="sm" />
          <span className="font-semibold">Mein Lebensanker</span>
        </a>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {language === 'de' ? 'So funktioniert Mein Lebensanker' : 'How Mein Lebensanker Works'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {language === 'de' 
              ? 'Eine kurze Einführung in alle wichtigen Funktionen'
              : 'A quick introduction to all important features'}
          </p>
        </div>

        {/* Slideshow */}
        <ExplainerSlideshow />

        {/* Share Section */}
        <div className="mt-12 text-center">
          <h2 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            {language === 'de' ? 'Mit Deinen Eltern teilen' : 'Share with your parents'}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {language === 'de' 
              ? 'Zeige Deinen Eltern, wie einfach es ist, wichtige Informationen sicher zu organisieren.'
              : 'Show your parents how easy it is to organize important information securely.'}
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Button
              onClick={shareWhatsApp}
              className="gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white"
              size="lg"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </Button>
            <Button
              onClick={shareEmail}
              variant="secondary"
              size="lg"
              className="gap-2"
            >
              <Mail className="w-5 h-5" />
              E-Mail
            </Button>
            <Button
              onClick={copyLink}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
              {copied ? (language === 'de' ? 'Kopiert!' : 'Copied!') : (language === 'de' ? 'Link kopieren' : 'Copy link')}
            </Button>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-card rounded-2xl p-8 shadow-lg border">
          <Logo size="lg" className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Mein Lebensanker</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {language === 'de'
              ? 'Organisiere wichtige Informationen für Dich und Deine Familie – sicher, einfach und privat.'
              : 'Organize important information for you and your family – secure, simple, and private.'}
          </p>
          <Button asChild size="lg" className="gap-2">
            <a href="/">
              {language === 'de' ? 'Jetzt kostenlos starten' : 'Start for free'}
            </a>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Mein Lebensanker. {language === 'de' ? 'Alle Rechte vorbehalten.' : 'All rights reserved.'}</p>
      </footer>
    </div>
  );
};

export default PromoVideo;

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Share2, Download, MessageCircle, Mail, Copy, Check } from 'lucide-react';
import Logo from '@/components/Logo';
import promoVideo from '@/assets/promo-video-generations.mp4';
import { useLanguage } from '@/contexts/LanguageContext';

const PromoVideo = () => {
  const { language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = 'https://mein-lebensanker.lovable.app/promo';
  const shareText = language === 'de' 
    ? 'Schau dir das an – ein Tool, das uns hilft, wichtige Dinge für die Zukunft zu organisieren. Für Dich und die Menschen, die Dir wichtig sind. 🌿'
    : 'Check this out – a tool that helps us organize important things for the future. For you and the people who matter to you. 🌿';

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

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

  const downloadVideo = () => {
    const link = document.createElement('a');
    link.href = promoVideo;
    link.download = 'mein-lebensanker-promo.mp4';
    link.click();
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
        {/* Video Card */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black">
          {/* Brand Overlay - Top */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
            <Logo size="sm" />
            <span className="font-semibold text-foreground text-sm">Mein Lebensanker</span>
          </div>

          {/* Video */}
          <video
            ref={videoRef}
            src={promoVideo}
            className="w-full aspect-video object-cover"
            onEnded={handleVideoEnd}
            onClick={togglePlay}
            playsInline
          />

          {/* Play Button Overlay */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
            >
              <div className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl hover:scale-105 transition-transform">
                <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
              </div>
            </button>
          )}

          {/* Brand Overlay - Bottom */}
          <div className="absolute bottom-4 right-4 z-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg">
              <p className="text-xs text-muted-foreground">
                {language === 'de' ? 'Für Dich und die Menschen, die Dir wichtig sind' : 'For you and the people who matter'}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={togglePlay}
            className="gap-2"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? (language === 'de' ? 'Pause' : 'Pause') : (language === 'de' ? 'Abspielen' : 'Play')}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={downloadVideo}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            {language === 'de' ? 'Herunterladen' : 'Download'}
          </Button>
        </div>

        {/* Share Section */}
        <div className="mt-10 text-center">
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

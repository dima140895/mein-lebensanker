import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Server, CreditCard } from 'lucide-react';

const LandingHero = () => {
  const navigate = useNavigate();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[hsl(var(--warm-white))]">
      {/* Subtle gradient blobs */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[70%] rounded-full opacity-[0.07]" style={{ background: 'radial-gradient(circle, hsl(152 28% 36%) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[50%] rounded-full opacity-[0.05]" style={{ background: 'radial-gradient(circle, hsl(160 28% 23%) 0%, transparent 70%)' }} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16 relative z-10">
        <div className="max-w-2xl">
          {/* Small tag */}
          <div className="inline-flex items-center gap-2 bg-[hsl(var(--forest))]/5 border border-[hsl(var(--forest))]/10 rounded-full px-4 py-1.5 mb-8 animate-fade-in">
            <span className="text-xs font-semibold text-[hsl(var(--forest))] font-body tracking-wide uppercase">Vorsorge · Pflege · Begleitung</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[hsl(var(--forest))] leading-[1.1] mb-6 animate-fade-in-up">
            Für die Momente,{' '}
            <span className="relative">
              die das Leben
              <span className="absolute -bottom-1 left-0 w-full h-2 bg-[hsl(var(--amber))]/20 rounded-full" />
            </span>{' '}
            verändern.
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-[hsl(var(--forest))]/70 leading-relaxed mb-10 font-body max-w-xl animate-fade-in-up stagger-delay-2">
            Mein Lebensanker begleitet dich — von der ruhigen Vorsorge heute 
            bis zur aktiven Unterstützung wenn Pflege, Krankheit oder Verlust 
            plötzlich zum Alltag werden.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-12 animate-fade-in-up stagger-delay-3">
            <Button
              onClick={() => navigate('/dashboard?register=true')}
              className="bg-[hsl(var(--forest))] hover:bg-[hsl(var(--forest))]/90 text-white font-body text-base rounded-full px-8 h-12 shadow-lg hover:shadow-xl transition-all"
            >
              Jetzt kostenlos starten →
            </Button>
            <Button
              onClick={() => scrollTo('journey')}
              variant="outline"
              className="border-[hsl(var(--forest))]/20 text-[hsl(var(--forest))] hover:bg-[hsl(var(--forest))]/5 font-body text-base rounded-full px-8 h-12"
            >
              Wie es funktioniert
            </Button>
          </div>

          {/* Trust icons */}
          <div className="flex flex-wrap gap-6 text-sm text-[hsl(var(--forest))]/50 font-body animate-fade-in-up stagger-delay-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>DSGVO-konform</span>
            </div>
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              <span>Server in Deutschland</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span>Kein Abo-Zwang beim Start</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;

import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Anchor } from 'lucide-react';

const LandingCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 sm:py-32 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <Anchor className="h-10 w-10 text-[hsl(var(--forest))]/20 mx-auto mb-6" />
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[hsl(var(--forest))] mb-4 leading-tight">
          Der beste Moment war gestern.{' '}
          <span className="text-[hsl(var(--amber))]">Der zweitbeste ist jetzt.</span>
        </h2>
        <p className="text-[hsl(var(--forest))]/60 font-body text-lg mb-10 max-w-xl mx-auto">
          Starte in 10 Minuten, ohne Druck, in deinem eigenen Tempo.
        </p>
        <Button
          onClick={() => navigate('/dashboard?register=true')}
          className="bg-[hsl(var(--forest))] hover:bg-[hsl(var(--forest))]/90 text-white font-body text-base rounded-full px-10 h-12 shadow-lg hover:shadow-xl transition-all"
        >
          Jetzt kostenlos starten →
        </Button>
      </div>
    </section>
  );
};

export default LandingCTA;

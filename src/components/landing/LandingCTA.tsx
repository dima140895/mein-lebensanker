import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Anchor } from 'lucide-react';

const LandingCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 sm:py-32 bg-card">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <Anchor className="h-10 w-10 text-primary/20 mx-auto mb-6" />
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
          Der beste Moment war gestern.{' '}
          <span className="text-accent">Der zweitbeste ist jetzt.</span>
        </h2>
        <p className="text-muted-foreground font-body text-lg mb-10 max-w-xl mx-auto">
          Starte in 10 Minuten, ohne Druck, in deinem eigenen Tempo.
        </p>
        <Button
          onClick={() => navigate('/dashboard?register=true')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-body text-base rounded-full px-10 h-12 shadow-lg hover:shadow-xl transition-all"
        >
          Jetzt kostenlos starten →
        </Button>
      </div>
    </section>
  );
};

export default LandingCTA;

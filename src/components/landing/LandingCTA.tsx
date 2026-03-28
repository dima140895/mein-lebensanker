import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Anchor } from 'lucide-react';

const LandingCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 sm:py-32 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <Anchor className="h-10 w-10 text-[#2C4A3E]/20 mx-auto mb-6" />
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C4A3E] mb-4 leading-tight">
          Der beste Moment war gestern.{' '}
          <span className="text-[#C4813A]">Der zweitbeste ist jetzt.</span>
        </h2>
        <p className="text-[#2C4A3E]/60 font-body text-lg mb-10 max-w-xl mx-auto">
          Beginne heute mit deiner Vorsorge. Deine Angehörigen werden es dir danken.
        </p>
        <Button
          onClick={() => navigate('/dashboard?register=true')}
          className="bg-[#2C4A3E] hover:bg-[#1e352c] text-white font-body text-base rounded-full px-10 h-12 shadow-lg hover:shadow-xl transition-all"
        >
          Jetzt kostenlos starten →
        </Button>
      </div>
    </section>
  );
};

export default LandingCTA;

import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ValuePropositions from '@/components/ValuePropositions';
import DashboardSections from '@/components/DashboardSections';
import Disclaimer from '@/components/Disclaimer';

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <DashboardSections />
        <ValuePropositions />
      </main>
      <Disclaimer />
    </div>
  );
};

export default Index;

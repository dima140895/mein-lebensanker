import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import WhatIsThisTool from "@/components/WhatIsThisTool";
import DashboardSections from "@/components/DashboardSections";
import Disclaimer from "@/components/Disclaimer";
import Footer from "@/components/Footer";
import treeOfLifeImage from '@/assets/tree-of-life.png';

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background overflow-x-clip">
      <Header />
      <main className="relative flex-1">
        {/* Radial gradient spanning hero + explanation section */}
        <div
          className="absolute top-0 right-0 w-full h-[200vh] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 35% at 85% 35%, hsl(140 15% 92% / 0.5) 0%, transparent 70%)',
          }}
        />

        {/* Tree of Life - positioned on page level to span hero + explanation section seamlessly */}
        <div className="absolute right-[-10%] md:right-[-12%] lg:right-[-8%] top-0 w-[70%] sm:w-[65%] md:w-[65%] lg:w-[75%] pointer-events-none" style={{ height: '140vh' }}>
          <div
            aria-hidden="true"
            className="w-full h-full bg-no-repeat bg-[center_20%] bg-cover opacity-40 sm:opacity-50 md:opacity-60 lg:opacity-90"
            style={{
              backgroundImage: `url(${treeOfLifeImage})`,
              maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 10%, rgba(0,0,0,0.2) 20%, rgba(0,0,0,0.5) 35%, rgba(0,0,0,0.8) 50%, black 65%), linear-gradient(to bottom, black 0%, black 80%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 10%, rgba(0,0,0,0.2) 20%, rgba(0,0,0,0.5) 35%, rgba(0,0,0,0.8) 50%, black 65%), linear-gradient(to bottom, black 0%, black 80%, transparent 100%)',
              maskComposite: 'intersect',
              WebkitMaskComposite: 'source-in',
            }}
          />
        </div>

        <HeroSection />
        <WhatIsThisTool />
        <DashboardSections />
      </main>
      <Disclaimer />
      <Footer />
    </div>
  );
};

export default Index;

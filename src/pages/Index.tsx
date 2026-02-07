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
        {/* Layer 1 (z-0): Radial gradient background */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: 'radial-gradient(ellipse 60% 35% at 85% 35%, hsl(140 15% 92% / 0.5) 0%, transparent 70%)',
          }}
        />

        {/* Layer 2 (z-10): Tree of Life spanning hero + explanation section */}
        <div className="absolute z-10 right-[-5%] sm:right-[-10%] md:right-[-12%] lg:right-[-8%] top-0 w-[70%] sm:w-[55%] md:w-[55%] lg:w-[75%] pointer-events-none" style={{ height: '140vh' }}>
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

        {/* Layer 3 (z-20): All content on top */}
        <div className="relative z-20">
          <HeroSection />
          <WhatIsThisTool />
        </div>

        <DashboardSections />
      </main>
      <Disclaimer />
      <Footer />
    </div>
  );
};

export default Index;

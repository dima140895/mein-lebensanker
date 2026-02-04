import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import WhatIsThisTool from "@/components/WhatIsThisTool";
import DashboardSections from "@/components/DashboardSections";
import Disclaimer from "@/components/Disclaimer";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
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

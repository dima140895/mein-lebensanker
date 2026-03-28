import LandingNav from '@/components/landing/LandingNav';
import LandingHero from '@/components/landing/LandingHero';
import LandingJourney from '@/components/landing/LandingJourney';
import LandingModules from '@/components/landing/LandingModules';
import LandingPricing from '@/components/landing/LandingPricing';
import LandingPflegegrad from '@/components/landing/LandingPflegegrad';
import LandingPersonas from '@/components/landing/LandingPersonas';
import LandingFAQ from '@/components/landing/LandingFAQ';
import LandingCTA from '@/components/landing/LandingCTA';
import LandingFooter from '@/components/landing/LandingFooter';
import CookieConsent from '@/components/CookieConsent';

const Index = () => {
  return (
    <div className="min-h-screen overflow-x-clip">
      <LandingNav />
      <LandingHero />
      <LandingJourney />
      <LandingModules />
      <LandingPflegegrad />
      <LandingPricing />
      <LandingPersonas />
      <LandingFAQ />
      <LandingCTA />
      <LandingFooter />
      <CookieConsent />
    </div>
  );
};

export default Index;

import { useEffect } from 'react';
import StaticNav from '@/components/StaticNav';
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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Mein Lebensanker",
  "applicationCategory": "HealthApplication",
  "operatingSystem": "Web, iOS, Android",
  "offers": [
    {
      "@type": "Offer",
      "name": "Anker",
      "price": "49",
      "priceCurrency": "EUR",
      "priceValidUntil": "2027-12-31"
    },
    {
      "@type": "Offer",
      "name": "Anker Plus",
      "price": "9",
      "priceCurrency": "EUR",
      "description": "Monatliches Abonnement"
    }
  ],
  "description": "Digitale Plattform für Vorsorge, Pflegebegleitung und Krankheitsdokumentation",
  "inLanguage": "de",
  "url": "https://mein-lebensanker.de"
};

const Index = () => {
  useEffect(() => {
    document.title = 'Mein Lebensanker — Vorsorge, Pflege & Begleitung';
  }, []);

  return (
    <div className="min-h-screen overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StaticNav landingMode />
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

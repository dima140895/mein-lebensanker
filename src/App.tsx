import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster"; // v2
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useSearchParams } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { FormProvider } from "@/contexts/FormContext";
import { EncryptionProvider } from "@/contexts/EncryptionContext";
import Index from "./pages/Index";
import CookieConsent from "./components/CookieConsent";
import { EncryptionReminder } from "./components/EncryptionReminder";
import OfflineBanner from "./components/OfflineBanner";
import { supabase } from "@/integrations/supabase/client";

/** Captures ?ref= referral codes from the URL, stores them, and tracks clicks */
const ReferralCapture = () => {
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref && /^[a-f0-9]{12}$/.test(ref)) {
      localStorage.setItem("referral_code", ref);
      // Track click (fire-and-forget)
      supabase.functions.invoke("track-referral-click", {
        body: { referralCode: ref },
      }).catch(() => {});
    }
  }, [searchParams]);
  return null;
};

// Lazy load all routes except the landing page
const Dashboard = lazy(() => import("./pages/Dashboard"));
const LearnMore = lazy(() => import("./pages/LearnMore"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const RelativesView = lazy(() => import("./pages/RelativesView"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const Datenschutz = lazy(() => import("./pages/Datenschutz"));
const Impressum = lazy(() => import("./pages/Impressum"));
const Nutzungsbedingungen = lazy(() => import("./pages/Nutzungsbedingungen"));
const Datensicherheit = lazy(() => import("./pages/Datensicherheit"));
const Sicherheitsgrenzen = lazy(() => import("./pages/Sicherheitsgrenzen"));
const PromoVideo = lazy(() => import("./pages/PromoVideo"));
const NotFound = lazy(() => import("./pages/NotFound"));
const InstallApp = lazy(() => import("./pages/InstallApp"));
const InstagramDownload = lazy(() => import("./pages/InstagramDownload"));
const MarketingFlyer = lazy(() => import("./pages/MarketingFlyer"));
const SecurityAuditReport = lazy(() => import("./pages/SecurityAuditReport"));
const RLSDocumentation = lazy(() => import("./pages/RLSDocumentation"));
const DevDocumentation = lazy(() => import("./pages/DevDocumentation"));
const FamilyInvitation = lazy(() => import("./pages/FamilyInvitation"));
const Abmelden = lazy(() => import("./pages/Abmelden"));
const Partner = lazy(() => import("./pages/Partner"));
const Security = lazy(() => import("./pages/Security"));
const VorsorgeAssistant = lazy(() => import("./components/VorsorgeAssistant"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <EncryptionProvider>
          <ProfileProvider>
            <FormProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <ReferralCapture />
                  <OfflineBanner />
                  <Suspense fallback={null}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/mehr-erfahren" element={<LearnMore />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/payment-success" element={<PaymentSuccess />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/verify-email" element={<VerifyEmail />} />
                      <Route path="/datenschutz" element={<Datenschutz />} />
                      <Route path="/impressum" element={<Impressum />} />
                      <Route path="/datensicherheit" element={<Datensicherheit />} />
                      <Route path="/sicherheitsgrenzen" element={<Sicherheitsgrenzen />} />
                      <Route path="/promo" element={<PromoVideo />} />
                      <Route path="/installieren" element={<InstallApp />} />
                      <Route path="/instagram-download" element={<InstagramDownload />} />
                      <Route path="/marketing-flyer" element={<MarketingFlyer />} />
                      <Route path="/fuer-angehoerige/:token" element={<RelativesView />} />
                      <Route path="/security-audit-report" element={<SecurityAuditReport />} />
                      <Route path="/rls-documentation" element={<RLSDocumentation />} />
                      <Route path="/dev-dokumentation" element={<DevDocumentation />} />
                      <Route path="/familie-einladung/:token" element={<FamilyInvitation />} />
                      <Route path="/abmelden" element={<Abmelden />} />
                      <Route path="/partner" element={<Partner />} />
                      <Route path="/security" element={<Security />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                  <CookieConsent />
                  <EncryptionReminder />
                  <Suspense fallback={null}>
                    <VorsorgeAssistant />
                  </Suspense>
                </BrowserRouter>
              </TooltipProvider>
            </FormProvider>
          </ProfileProvider>
        </EncryptionProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;

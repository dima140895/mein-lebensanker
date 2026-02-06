import { Toaster } from "@/components/ui/toaster"; // v2
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { FormProvider } from "@/contexts/FormContext";
import { EncryptionProvider } from "@/contexts/EncryptionContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import LearnMore from "./pages/LearnMore";
import PaymentSuccess from "./pages/PaymentSuccess";
import RelativesView from "./pages/RelativesView";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Datenschutz from "./pages/Datenschutz";
import Impressum from "./pages/Impressum";
import Datensicherheit from "./pages/Datensicherheit";
import Sicherheitsgrenzen from "./pages/Sicherheitsgrenzen";
import PromoVideo from "./pages/PromoVideo";
import NotFound from "./pages/NotFound";
import InstallApp from "./pages/InstallApp";
import InstagramDownload from "./pages/InstagramDownload";
import SecurityAuditReport from "./pages/SecurityAuditReport";
import RLSDocumentation from "./pages/RLSDocumentation";
import CookieConsent from "./components/CookieConsent";
import { EncryptionReminder } from "./components/EncryptionReminder";
import VorsorgeAssistant from "./components/VorsorgeAssistant";

const queryClient = new QueryClient();

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
                    <Route path="/fuer-angehoerige/:token" element={<RelativesView />} />
                    <Route path="/security-audit-report" element={<SecurityAuditReport />} />
                    <Route path="/rls-documentation" element={<RLSDocumentation />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <CookieConsent />
                  <EncryptionReminder />
                  <VorsorgeAssistant />
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

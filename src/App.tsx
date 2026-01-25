import { Toaster } from "@/components/ui/toaster"; // v2
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import LearnMore from "./pages/LearnMore";
import PaymentSuccess from "./pages/PaymentSuccess";
import RelativesView from "./pages/RelativesView";
import ResetPassword from "./pages/ResetPassword";
import Datenschutz from "./pages/Datenschutz";
import Impressum from "./pages/Impressum";
import NotFound from "./pages/NotFound";
import CookieConsent from "./components/CookieConsent";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <ProfileProvider>
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
                <Route path="/datenschutz" element={<Datenschutz />} />
                <Route path="/impressum" element={<Impressum />} />
                <Route path="/fuer-angehoerige/:token" element={<RelativesView />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <CookieConsent />
            </BrowserRouter>
          </TooltipProvider>
        </ProfileProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;

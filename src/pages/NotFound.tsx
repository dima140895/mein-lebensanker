import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { logger } from "@/lib/logger";
import StaticNav from "@/components/StaticNav";
import LandingFooter from "@/components/landing/LandingFooter";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    logger.warn("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <StaticNav minimal />
      <main className="flex-1 pt-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-sans font-bold text-foreground">404</h1>
          <p className="mb-4 text-xl text-muted-foreground font-body">Seite nicht gefunden</p>
          <Link to="/" className="text-primary underline hover:text-primary/90 font-body">
            Zurück zur Startseite
          </Link>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
};

export default NotFound;

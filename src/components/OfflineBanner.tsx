import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Sticky banner that appears when the user loses internet connectivity.
 * Disappears automatically when online again — no dismiss button needed.
 *
 * Future enhancement: When an IndexedDB offline cache is added, update the
 * message to "Änderungen werden gespeichert und synchronisiert sobald du
 * wieder online bist." to reflect queued-write behaviour.
 */
const OfflineBanner = () => {
  const isOnline = useOnlineStatus();
  const { language } = useLanguage();

  if (isOnline) return null;

  const message =
    language === 'de'
      ? 'Keine Internetverbindung — gespeicherte Daten sind noch verfügbar.'
      : 'No internet connection — saved data is still available.';

  return (
    <div
      className="sticky top-0 z-[60] w-full bg-accent/10 border-b border-accent/20 px-4 py-2.5 animate-fade-in"
      role="alert"
      aria-live="polite"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 text-sm font-body text-accent">
        <WifiOff className="h-4 w-4 flex-shrink-0" />
        <span>{message}</span>
      </div>
    </div>
  );
};

export default OfflineBanner;

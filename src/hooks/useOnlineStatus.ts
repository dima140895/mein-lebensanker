import { useState, useEffect } from 'react';

/**
 * Custom hook that tracks the browser's online/offline status.
 * Uses native browser events (window 'online'/'offline').
 *
 * Future enhancement: Could be combined with IndexedDB-based offline cache
 * to queue Supabase writes while offline and replay them on reconnect.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return isOnline;
}

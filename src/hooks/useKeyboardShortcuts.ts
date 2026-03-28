import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

export function useKeyboardShortcuts() {
  const [, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' ||
          target.isContentEditable) return;

      if ((e.metaKey || e.ctrlKey) && e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'v':
            e.preventDefault();
            setSearchParams({ module: 'vorsorge' });
            break;
          case 'p':
            e.preventDefault();
            setSearchParams({ module: 'pflege' });
            break;
          case 'k':
            e.preventDefault();
            setSearchParams({ module: 'krankheit' });
            break;
          case 'e':
            e.preventDefault();
            setSearchParams({ module: 'einstellungen' });
            break;
          case 'h':
            e.preventDefault();
            setSearchParams({});
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchParams, isMobile]);
}

// Simple event-based system for triggering section status refresh
type Listener = () => void;
const listeners: Set<Listener> = new Set();

export const sectionStatusEvents = {
  subscribe: (listener: Listener): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  emit: () => {
    listeners.forEach(listener => listener());
  },
};

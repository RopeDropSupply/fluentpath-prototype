import { useSyncExternalStore } from 'react';

/** Minimal hash router: works on any static host without redirect rules. */
function subscribe(callback: () => void) {
  window.addEventListener('hashchange', callback);
  return () => window.removeEventListener('hashchange', callback);
}

const read = () => window.location.hash.replace(/^#\/?/, '');

export function useRoute(): string[] {
  const path = useSyncExternalStore(subscribe, read);
  return path.split('/').filter(Boolean);
}

export function navigate(href: string) {
  window.location.hash = href.replace(/^#/, '');
}

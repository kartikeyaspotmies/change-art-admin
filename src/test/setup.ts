/**
 * Vitest global setup.
 *
 * Loaded via `setupFiles` in vite.config.ts. Wires React Testing Library's
 * cleanup, jest-dom matchers, and lightweight browser globals that JSDOM
 * doesn't provide out of the box.
 */

import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

// JSDOM does not implement matchMedia; provide a noop stub for theme tests.
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// JSDOM does not implement IntersectionObserver; minimal stub for tables/virtual lists.
if (typeof window !== 'undefined' && !('IntersectionObserver' in window)) {
  class MockIntersectionObserver {
    public observe(): void {}
    public unobserve(): void {}
    public disconnect(): void {}
    public takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
    public readonly root: Element | null = null;
    public readonly rootMargin: string = '';
    public readonly thresholds: ReadonlyArray<number> = [];
  }
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: MockIntersectionObserver,
  });
}

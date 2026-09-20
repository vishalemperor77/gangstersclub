import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/react';

// Keep the waitFor timeout well below the Vitest test timeout (15s in
// vite.config.js). When both are equal the test-level timeout wins the race and
// a real failure ("Found multiple elements with the text: …") is reported as the
// misleading "Test timed out in 5000ms".
configure({ asyncUtilTimeout: 4000 });

// jsdom does not implement these browser APIs; the app uses them on mount
// (window.scrollTo in App, IntersectionObserver in <Reveal>). Overwrite
// scrollTo outright: jsdom's own stub logs "Not implemented" on every call.
if (!window.IntersectionObserver) {
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
window.scrollTo = () => {};

// Deterministic offline fetch: every api.js request resolves 200 with `{}`.
// Pages must degrade gracefully on empty payloads — which is exactly what we
// want to smoke-test without a live backend or network flakiness.
globalThis.fetch = async () =>
  new Response(JSON.stringify({}), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

/**
 * Node 26 can expose a global `localStorage` value as undefined when no
 * `--localstorage-file` is configured. Vitest already provides jsdom storage;
 * expose that instance only when the runtime has not done so.
 */
if (typeof globalThis.localStorage === 'undefined' && typeof window.localStorage !== 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: window.localStorage
  });
}

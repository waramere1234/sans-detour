import "@testing-library/jest-dom";

// Node 25 ships a native `localStorage` that requires `--localstorage-file`
// and otherwise exposes a no-op object lacking standard Storage methods. It
// shadows jsdom's Storage when running under Vitest. We replace it with a
// minimal in-memory implementation so tests against localStorage behave like
// a real browser.
function createMemoryStorage(): Storage {
  let store = new Map<string, string>();
  return {
    get length() { return store.size; },
    clear() { store.clear(); },
    getItem(key: string) { return store.has(key) ? store.get(key)! : null; },
    key(index: number) { return Array.from(store.keys())[index] ?? null; },
    removeItem(key: string) { store.delete(key); },
    setItem(key: string, value: string) { store.set(key, String(value)); },
  } as Storage;
}

const memoryLocalStorage = createMemoryStorage();
const memorySessionStorage = createMemoryStorage();

Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: memoryLocalStorage,
});
Object.defineProperty(globalThis, "sessionStorage", {
  configurable: true,
  value: memorySessionStorage,
});
if (typeof window !== "undefined") {
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: memoryLocalStorage,
  });
  Object.defineProperty(window, "sessionStorage", {
    configurable: true,
    value: memorySessionStorage,
  });
}

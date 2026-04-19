
/**
 * Persistence wrapper.
 *
 * In the authoring sandbox, `window.persistentStorage` is provided.
 * In production (Vercel / GitHub Pages / anywhere else), it is not —
 * so we transparently fall back to `localStorage` with the same
 * async API so callers never change.
 */

type Persistence = {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
};

declare global {
  interface Window {
    persistentStorage?: {
      setItem(key: string, value: string): Promise<void>;
      getItem(key: string): Promise<string | null>;
      removeItem(key: string): Promise<void>;
      clear(): Promise<void>;
    };
  }
}

const hasSandboxStorage =
  typeof window !== 'undefined' && !!window.persistentStorage;

const hasLocalStorage = (() => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const k = '__tt_probe__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
})();

// In-memory fallback (SSR / private modes where localStorage throws)
const memoryStore = new Map<string, string>();

export const persistence: Persistence = {
  async setItem(key, value) {
    if (hasSandboxStorage) return window.persistentStorage!.setItem(key, value);
    if (hasLocalStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
    memoryStore.set(key, value);
  },
  async getItem(key) {
    if (hasSandboxStorage) return window.persistentStorage!.getItem(key);
    if (hasLocalStorage) return window.localStorage.getItem(key);
    return memoryStore.has(key) ? (memoryStore.get(key) as string) : null;
  },
  async removeItem(key) {
    if (hasSandboxStorage) return window.persistentStorage!.removeItem(key);
    if (hasLocalStorage) {
      window.localStorage.removeItem(key);
      return;
    }
    memoryStore.delete(key);
  },
  async clear() {
    if (hasSandboxStorage) return window.persistentStorage!.clear();
    if (hasLocalStorage) {
      window.localStorage.clear();
      return;
    }
    memoryStore.clear();
  },
};

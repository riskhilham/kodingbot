/**
 * KodingBot: Petualangan Pulau Algoritma
 * Safe Storage Abstraction with In-Memory Fallback
 * 
 * Protects against DOMException / SecurityError when running inside sandboxed iframes
 * (e.g. Learning Management Systems, educational portals, or embeds without 'allow-same-origin').
 */

const memoryStore = {};

function checkLocalStorageSupport() {
  try {
    if (typeof window === 'undefined') return false;
    // In sandboxed iframes without 'allow-same-origin', even accessing window.localStorage throws SecurityError
    const storage = window.localStorage;
    if (!storage) return false;
    const testKey = '__kb_storage_probe__';
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

const isSupported = checkLocalStorageSupport();

export const safeStorage = {
  getItem(key) {
    try {
      if (isSupported) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      // Fall through to memory store
    }
    return Object.prototype.hasOwnProperty.call(memoryStore, key) ? memoryStore[key] : null;
  },

  setItem(key, value) {
    try {
      if (isSupported) {
        window.localStorage.setItem(key, String(value));
        return;
      }
    } catch (e) {
      // Fall through to memory store
    }
    memoryStore[key] = String(value);
  },

  removeItem(key) {
    try {
      if (isSupported) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      // Fall through
    }
    delete memoryStore[key];
  },

  clear() {
    try {
      if (isSupported) {
        window.localStorage.clear();
      }
    } catch (e) {
      // Fall through
    }
    for (const k in memoryStore) {
      if (Object.prototype.hasOwnProperty.call(memoryStore, k)) {
        delete memoryStore[k];
      }
    }
  }
};

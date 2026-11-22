// Persistence. IndexedDB in the browser, with a localStorage fallback and an
// in-memory backend for tests. Characters, history and replay data are kept in
// separate stores so they can be reset independently.

const DB_NAME = 'team-leyla-survival';
const DB_VERSION = 1;
const STORES = ['characters', 'history', 'meta'];

function idbBackend() {
  let dbp = null;
  const open = () => {
    if (dbp) return dbp;
    dbp = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('characters')) db.createObjectStore('characters', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('history')) db.createObjectStore('history', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      req.onblocked = () => reject(new Error('Database blocked'));
    });
    return dbp;
  };
  const tx = async (store, mode, fn) => {
    const db = await open();
    return new Promise((resolve, reject) => {
      const t = db.transaction(store, mode);
      const s = t.objectStore(store);
      let result;
      const r = fn(s);
      if (r) r.onsuccess = () => { result = r.result; };
      t.oncomplete = () => resolve(result);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error || new Error('Transaction aborted'));
    });
  };
  return {
    name: 'indexeddb',
    all: (store) => tx(store, 'readonly', (s) => s.getAll()),
    put: (store, value, key) => tx(store, 'readwrite', (s) => (key === undefined ? s.put(value) : s.put(value, key))),
    get: (store, key) => tx(store, 'readonly', (s) => s.get(key)),
    del: (store, key) => tx(store, 'readwrite', (s) => s.delete(key)),
    clear: (store) => tx(store, 'readwrite', (s) => s.clear()),
  };
}

export function memoryBackend() {
  const data = Object.fromEntries(STORES.map((s) => [s, new Map()]));
  const clone = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
  return {
    name: 'memory',
    all: async (store) => [...data[store].values()].map(clone),
    put: async (store, value, key) => { data[store].set(key === undefined ? value.id : key, clone(value)); },
    get: async (store, key) => clone(data[store].get(key)),
    del: async (store, key) => { data[store].delete(key); },
    clear: async (store) => { data[store].clear(); },
  };
}

function localBackend() {
  const k = (store) => `tls_${store}`;
  const read = (store) => { try { return JSON.parse(localStorage.getItem(k(store)) || '{}'); } catch { return {}; } };
  const write = (store, obj) => localStorage.setItem(k(store), JSON.stringify(obj));
  return {
    name: 'localstorage',
    all: async (store) => Object.values(read(store)),
    put: async (store, value, key) => { const o = read(store); o[key === undefined ? value.id : key] = value; write(store, o); },
    get: async (store, key) => read(store)[key],
    del: async (store, key) => { const o = read(store); delete o[key]; write(store, o); },
    clear: async (store) => write(store, {}),
  };
}

export async function createStorage(forced) {
  let b = forced;
  if (!b) {
    try {
      if (typeof indexedDB === 'undefined') throw new Error('no idb');
      b = idbBackend();
      await b.all('meta'); // probe
    } catch {
      try { localStorage.setItem('tls_probe', '1'); b = localBackend(); }
      catch { b = memoryBackend(); }
    }
  }
  return new Store(b);
}

export class Store {
  constructor(backend) { this.b = backend; }
  get kind() { return this.b.name; }
  async characters() { const l = await this.b.all('characters'); return l.sort((a, c) => (a.created || 0) - (c.created || 0)); }
  saveCharacter(c) { return this.b.put('characters', c); }
  deleteCharacter(id) { return this.b.del('characters', id); }
  async replaceCharacters(list) { await this.b.clear('characters'); for (const c of list) await this.b.put('characters', c); }
  async history() { const l = await this.b.all('history'); return l.sort((a, c) => (c.date || 0) - (a.date || 0)); }
  addHistory(rec) { return this.b.put('history', rec); }
  clearHistory() { return this.b.clear('history'); }
  async getSave() { return (await this.b.get('meta', 'save')) || null; }
  setSave(state) { return this.b.put('meta', state, 'save'); }
  clearSave() { return this.b.del('meta', 'save'); }
  async getReplay() { return (await this.b.get('meta', 'replay')) || null; }
  setReplay(r) { return this.b.put('meta', r, 'replay'); }
  resetReplay() { return this.b.del('meta', 'replay'); }
  async getSettings() { return (await this.b.get('meta', 'settings')) || {}; }
  setSettings(s) { return this.b.put('meta', s, 'settings'); }
}

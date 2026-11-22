// Seeded random number generation (mulberry32). The RNG state is a single
// uint32 stored inside the game state, so a saved game resumes exactly.

export function hashSeed(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

const SEED_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function makeSeed(source = Math.random) {
  let s = '';
  for (let i = 0; i < 6; i++) s += SEED_CHARS[Math.floor(source() * SEED_CHARS.length)];
  return s;
}

export function cleanSeed(s) {
  return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
}

// An Rng wraps a holder object ({ rng: uint32 }) so the state lives in the save.
export class Rng {
  constructor(holder) { this.h = holder; }
  next() {
    let t = (this.h.rng = (this.h.rng + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  int(n) { return Math.floor(this.next() * n); }
  range(a, b) { return a + this.int(b - a + 1); }
  chance(p) { return this.next() < p; }
  pick(arr) { return arr.length ? arr[this.int(arr.length)] : undefined; }
  // weighted pick: items with .w or via weightFn
  weighted(items, weightFn) {
    let total = 0;
    const ws = items.map((it) => { const w = Math.max(0, weightFn ? weightFn(it) : it.w); total += w; return w; });
    if (total <= 0) return items.length ? items[this.int(items.length)] : undefined;
    let r = this.next() * total;
    for (let i = 0; i < items.length; i++) { r -= ws[i]; if (r < 0) return items[i]; }
    return items[items.length - 1];
  }
  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = this.int(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
}

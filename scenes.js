// Code-generated pixel-art scenes (96x54 grid, crisp SVG). No image files,
// no external assets. Each scene name maps to a template plus parameters.
import { avatarInner, avatarBg } from './avatar.js';
import { hashSeed, Rng } from './rng.js';

const W = 96, H = 54;

function canvas(seed) {
  const parts = [];
  const rng = new Rng({ rng: hashSeed(String(seed)) });
  const g = {
    rng,
    r(x, y, w, h, c, o) { if (w <= 0 || h <= 0) return; parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"${o != null ? ` opacity="${o}"` : ''}/>`); },
    raw(s) { parts.push(s); },
    bands(y0, y1, cols) { const n = cols.length, h = (y1 - y0) / n; cols.forEach((c, i) => g.r(0, Math.round(y0 + i * h), W, Math.ceil(h) + 1, c)); },
    dither(x, y, w, h, c, step = 2) { for (let j = 0; j < h; j++) for (let i = (j % 2); i < w; i += step) g.r(x + i, y + j, 1, 1, c); },
    stars(n, maxY = 20) { for (let i = 0; i < n; i++) g.r(rng.int(W), rng.int(maxY), 1, 1, rng.chance(0.3) ? '#ffe9a8' : '#cfd8ff', 0.5 + rng.next() * 0.5); },
    windows(x, y, w, h, col, lit = 0.35, litC = '#ffd166', sx = 3, sy = 3) {
      for (let j = y + 1; j < y + h - 1; j += sy) for (let i = x + 1; i < x + w - 1; i += sx) g.r(i, j, 1, 1, rng.chance(lit) ? litC : col);
    },
    out() { return parts.join(''); },
  };
  return g;
}

// ---------- props ----------
const P = {
  building(g, x, w, h, c, base = 38, lit = 0.3) { g.r(x, base - h, w, h, c); g.windows(x, base - h, w, h, shade(c, -0.25), lit); g.r(x, base - h, w, 1, shade(c, 0.15)); },
  lamp(g, x, base = 44) { g.r(x, base - 16, 1, 16, '#3a3a48'); g.r(x - 1, base - 17, 3, 1, '#3a3a48'); g.r(x - 1, base - 16, 3, 1, '#ffe8a3', 0.9); g.r(x - 3, base - 15, 7, 6, '#ffe8a3', 0.08); },
  car(g, x, y, c, wreck = false) { g.r(x, y + 2, 12, 4, c); g.r(x + 2, y, 7, 2, c); g.r(x + 3, y, 2, 2, '#9fc5e8'); g.r(x + 6, y, 2, 2, '#9fc5e8'); g.r(x + 1, y + 6, 3, 2, '#111'); g.r(x + 8, y + 6, 3, 2, '#111'); if (wreck) { g.r(x + 9, y + 1, 2, 1, '#555'); g.r(x + 3, y + 3, 2, 1, '#2a2a2a'); } },
  bin(g, x, y) { g.r(x, y, 4, 6, '#2f5d3a'); g.r(x - 1, y, 6, 1, '#244a2e'); },
  shelf(g, x, y, w, h) { g.r(x, y, w, h, '#8d99ae'); for (let j = y + 1; j < y + h; j += 3) { g.r(x, j + 2, w, 1, '#5c677d'); for (let i = x + 1; i < x + w - 1; i += 2) g.r(i, j, 1, 2, ['#e63946', '#f4a261', '#2a9d8f', '#e9c46a', '#457b9d'][(i + j) % 5]); } },
  crate(g, x, y, s = 6, c = '#a0743c') { g.r(x, y, s, s, c); g.r(x, y, s, 1, shade(c, 0.2)); g.r(x, y + Math.floor(s / 2), s, 1, shade(c, -0.25)); g.r(x + Math.floor(s / 2), y, 1, s, shade(c, -0.25)); },
  bed(g, x, y, c = '#dfe7ec') { g.r(x, y + 3, 14, 3, '#9aa5b1'); g.r(x, y, 14, 3, c); g.r(x, y, 4, 2, '#ffffff'); g.r(x, y + 6, 1, 2, '#5c677d'); g.r(x + 13, y + 6, 1, 2, '#5c677d'); },
  door(g, x, y, w = 6, h = 12, c = '#5b3a29') { g.r(x, y, w, h, c); g.r(x + w - 2, y + Math.floor(h / 2), 1, 1, '#e9c46a'); },
  window(g, x, y, w, h, sky = '#1d3557') { g.r(x - 1, y - 1, w + 2, h + 2, '#2b2b36'); g.r(x, y, w, h, sky); g.r(x + Math.floor(w / 2), y, 1, h, '#2b2b36'); },
  pipe(g, y, c = '#6c757d') { g.r(0, y, W, 2, c); g.r(0, y, W, 1, shade(c, 0.2)); for (let i = 4; i < W; i += 14) g.r(i, y - 1, 2, 4, shade(c, -0.25)); },
  tree(g, x, base, h, c = '#2d6a4f', trunk = '#5e3b23') { g.r(x, base - Math.floor(h / 3), 2, Math.floor(h / 3), trunk); for (let i = 0; i < 4; i++) { const w = 3 + i * 2; g.r(x + 1 - Math.floor(w / 2), base - h + i * Math.floor(h / 5), w, Math.floor(h / 5) + 1, i % 2 ? shade(c, -0.12) : c); } },
  pine(g, x, base, h, c = '#1b4332') { g.r(x, base - 3, 1, 3, '#4a2c1a'); for (let i = 0; i < h; i++) { const w = 1 + Math.floor(i * 0.6) * 2; g.r(x - Math.floor(w / 2), base - 3 - h + i, w, 1, i % 3 === 0 ? shade(c, 0.12) : c); } },
  tent(g, x, base, c = '#e76f51') { for (let i = 0; i < 7; i++) g.r(x + 6 - i, base - 7 + i, i * 2 + 1, 1, i % 2 ? shade(c, -0.1) : c); g.r(x + 5, base - 4, 3, 4, '#2b1d14'); },
  fire(g, x, base) { g.r(x, base - 1, 6, 1, '#5e3b23'); g.r(x + 1, base - 4, 4, 3, '#f77f00'); g.r(x + 2, base - 6, 2, 2, '#fcbf49'); g.r(x + 2, base - 3, 2, 2, '#fff3b0'); g.r(x - 6, base - 10, 18, 10, '#f77f00', 0.08); },
  rail(g, y) { g.r(0, y, W, 1, '#8d99ae'); g.r(0, y + 3, W, 1, '#8d99ae'); for (let i = 0; i < W; i += 4) g.r(i, y - 0, 2, 4, '#5e3b23', 0.8); },
  wagon(g, x, y, c = '#7f5539') { g.r(x, y, 20, 9, c); g.r(x, y, 20, 1, shade(c, 0.2)); g.r(x + 8, y + 2, 4, 7, shade(c, -0.25)); g.r(x + 2, y + 9, 3, 2, '#222'); g.r(x + 15, y + 9, 3, 2, '#222'); },
  sandbags(g, x, y, w) { for (let j = 0; j < 2; j++) for (let i = x + (j % 2) * 2; i < x + w; i += 4) g.r(i, y + j * 2, 4, 2, j % 2 ? '#a68a64' : '#bfa37a'); },
  barrier(g, x, y, w) { for (let i = 0; i < w; i += 2) g.r(x + i, y, 2, 2, (i / 2) % 2 ? '#e63946' : '#f1faee'); g.r(x, y + 2, 1, 4, '#555'); g.r(x + w - 1, y + 2, 1, 4, '#555'); },
  water(g, y, c = '#1d4e89', h = H) { g.r(0, y, W, h - y, c); for (let i = 0; i < 18; i++) g.r(g.rng.int(W), y + 1 + g.rng.int(Math.max(1, h - y - 2)), 3 + g.rng.int(4), 1, shade(c, 0.25), 0.7); },
  boat(g, x, y, c = '#2a9d8f') { g.r(x, y + 3, 24, 3, c); g.r(x + 1, y + 6, 22, 1, shade(c, -0.3)); g.r(x + 4, y, 14, 3, '#e9c46a'); g.windows(x + 4, y, 14, 3, '#264653', 0.5, '#ffd166', 3, 3); g.r(x + 18, y - 3, 1, 3, '#333'); },
  ship(g, x, y) { g.r(x, y + 8, 44, 6, '#f1faee'); g.r(x + 2, y + 14, 40, 2, '#1d3557'); g.r(x + 6, y + 3, 30, 5, '#e9ecef'); g.windows(x + 6, y + 3, 30, 5, '#457b9d', 0.4); g.r(x + 14, y - 2, 6, 5, '#e63946'); g.r(x + 14, y - 2, 6, 1, '#222'); },
  shopfront(g, x, y, w, c) { g.r(x, y, w, 12, '#2b2d42'); g.r(x, y, w, 3, c); g.r(x + 1, y + 4, w - 2, 7, '#3d5a80'); g.r(x + 1, y + 4, w - 2, 1, '#98c1d9', 0.6); },
  console(g, x, y, w) { g.r(x, y, w, 6, '#343a40'); g.r(x, y, w, 1, '#495057'); for (let i = x + 1; i < x + w - 1; i += 3) g.r(i, y + 2, 2, 1, g.rng.chance(0.5) ? '#06d6a0' : '#ef476f'); },
  porthole(g, x, y) { g.r(x - 1, y - 1, 6, 6, '#adb5bd'); g.r(x, y, 4, 4, '#1d3557'); g.r(x, y, 2, 1, '#a8dadc', 0.6); },
  table(g, x, y, c = '#f8f9fa') { g.r(x, y, 10, 2, c); g.r(x + 1, y + 2, 1, 4, '#6c757d'); g.r(x + 8, y + 2, 1, 4, '#6c757d'); },
  rock(g, x, y, w, h, c = '#5c5d67') { g.r(x, y, w, h, c); g.r(x + 1, y, w - 2, 1, shade(c, 0.2)); g.r(x, y + h - 1, w, 1, shade(c, -0.3)); },
  cabin(g, x, base, w = 30, h = 14) { g.r(x, base - h, w, h, '#7f5539'); for (let j = base - h; j < base; j += 2) g.r(x, j, w, 1, '#6b4429'); for (let i = 0; i < 7; i++) g.r(x - 2 + i * 2, base - h - 7 + i, w + 4 - i * 4, 1, '#432818'); g.r(x + 4, base - 9, 5, 4, '#ffd166'); g.r(x + w - 11, base - 9, 5, 4, '#ffd166', 0.5); P.door(g, x + 13, base - 10, 5, 10, '#432818'); },
  tower(g, x, base) { g.r(x, base - 34, 1, 34, '#5e3b23'); g.r(x + 10, base - 34, 1, 34, '#5e3b23'); for (let j = base - 30; j < base; j += 6) g.r(x, j, 11, 1, '#7f5539'); g.r(x - 2, base - 40, 15, 6, '#7f5539'); g.r(x - 3, base - 42, 17, 2, '#432818'); g.r(x + 2, base - 39, 3, 3, '#ffd166', 0.7); },
  antenna(g, x, base) { g.r(x, base - 26, 1, 26, '#adb5bd'); for (let j = base - 24; j < base; j += 4) { g.r(x - 2, j, 5, 1, '#adb5bd', 0.6); } g.r(x - 1, base - 27, 3, 1, '#e63946'); },
  helicopter(g, x, y) { g.r(x, y + 2, 14, 5, '#556b2f'); g.r(x + 14, y + 3, 8, 2, '#556b2f'); g.r(x - 4, y, 22, 1, '#333'); g.r(x + 2, y + 3, 4, 2, '#9fc5e8'); },
};

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(c * (1 + amt))));
  return '#' + ((1 << 24) | (f(n >> 16) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).slice(1);
}

// ---------- templates ----------
function cityBase(g, { sky = ['#1b1f3b', '#2c2f5a', '#5a3d6b', '#b45f4c'], ground = '#3a3a44', lit = 0.25 } = {}) {
  g.bands(0, 34, sky); g.stars(14, 12);
  for (let x = -2; x < W; ) { const w = 7 + g.rng.int(9), h = 10 + g.rng.int(18); P.building(g, x, w, h, ['#22223b', '#2b2d42', '#1f2937', '#3d405b'][g.rng.int(4)], 36, lit); x += w + g.rng.int(2); }
  g.r(0, 36, W, 3, '#6c757d'); g.r(0, 39, W, H - 39, ground);
}
function road(g, y = 46) { for (let i = 2; i < W; i += 10) g.r(i, y, 5, 1, '#e9c46a', 0.8); }
function interior(g, { wall = '#3d405b', wall2, floor = '#5c4b3b', floorY = 38, trim = '#2b2d42', checker = false } = {}) {
  g.r(0, 0, W, floorY, wall); if (wall2) for (let i = 0; i < W; i += 6) g.r(i, 0, 3, floorY, wall2, 0.35);
  g.r(0, floorY - 2, W, 2, trim);
  g.r(0, floorY, W, H - floorY, floor);
  if (checker) for (let j = floorY; j < H; j += 3) for (let i = (j / 3) % 2 ? 0 : 3; i < W; i += 6) g.r(i, j, 3, 3, shade(floor, -0.15));
  else for (let j = floorY + 2; j < H; j += 4) g.r(0, j, W, 1, shade(floor, -0.15));
}
function lights(g, y, c = '#f1faee', n = 4) { for (let i = 0; i < n; i++) { const x = Math.round((i + 0.5) * W / n) - 4; g.r(x, y, 8, 1, c); g.r(x - 2, y + 1, 12, 12, c, 0.05); } }
function forestBase(g, { sky = ['#0b132b', '#1c2541', '#3a506b', '#5bc0be'], ground = '#2d4a22', far = '#1b2f2a', near = '#16302b' } = {}) {
  g.bands(0, 36, sky); g.stars(16, 14);
  for (let x = 0; x < W; x += 3) P.pine(g, x + g.rng.int(2), 36, 10 + g.rng.int(6), far);
  g.r(0, 36, W, H - 36, ground);
  g.dither(0, 37, W, 3, shade(ground, -0.2), 3);
  for (let x = -2; x < W; x += 7 + g.rng.int(5)) P.pine(g, x, 44 + g.rng.int(3), 16 + g.rng.int(8), near);
}
function shipInterior(g, { wall = '#e9ecef', floor = '#7b2d26', trim = '#b08968', portholes = true } = {}) {
  interior(g, { wall, floor, trim, floorY: 38 });
  g.r(0, 4, W, 1, trim, 0.7); if (portholes) for (let x = 8; x < W; x += 20) P.porthole(g, x, 12);
}
function seaBase(g, { sky = ['#03045e', '#023e8a', '#0077b6', '#48cae4'], sea = '#03045e', horizon = 30 } = {}) {
  g.bands(0, horizon, sky); g.stars(14, 12); P.water(g, horizon, sea);
}

const SCENES = {
  // ---- city ----
  street: (g) => { cityBase(g); road(g); P.lamp(g, 14); P.lamp(g, 70); P.car(g, 30, 40, '#9d0208', true); P.car(g, 52, 41, '#457b9d', true); P.bin(g, 86, 37); },
  checkpoint: (g) => { cityBase(g, { lit: 0.08 }); road(g); P.sandbags(g, 6, 40, 24); P.sandbags(g, 64, 40, 26); P.barrier(g, 34, 39, 28); P.car(g, 70, 44, '#556b2f', true); P.antenna(g, 20, 40); },
  railyard: (g) => { cityBase(g, { lit: 0.15, ground: '#4a4e57' }); P.rail(g, 44); P.rail(g, 50); P.wagon(g, 4, 34, '#7f5539'); P.wagon(g, 28, 34, '#264653'); P.wagon(g, 70, 34, '#9d0208'); P.lamp(g, 56, 40); },
  station: (g) => { g.bands(0, 34, ['#0d1b2a', '#1b263b', '#2b3a55', '#415a77']); g.stars(18, 14); g.r(14, 12, 68, 26, '#6d6875'); g.r(14, 12, 68, 2, '#8e8a96'); for (let i = 0; i < 5; i++) { g.r(20 + i * 12, 18, 8, 20, '#22223b'); g.r(21 + i * 12, 19, 6, 6, '#ffd166', 0.7); } g.r(42, 4, 12, 9, '#6d6875'); g.r(45, 6, 6, 6, '#f1faee'); g.r(47, 7, 1, 3, '#222'); g.r(48, 8, 2, 1, '#222'); g.r(0, 38, W, H - 38, '#3a3a44'); P.sandbags(g, 2, 40, 22); P.sandbags(g, 72, 40, 22); for (const x of [6, 88]) { g.r(x, 10, 1, 28, '#555'); g.r(x - 2, 9, 5, 2, '#fffbe6'); g.r(x - 10, 11, 22, 26, '#fffbe6', 0.06); } },
  platform: (g) => { interior(g, { wall: '#2b2d42', floor: '#6c757d', floorY: 40 }); lights(g, 2, '#fff3b0'); g.r(0, 14, W, 22, '#adb5bd'); g.r(0, 14, W, 2, '#e63946'); for (let x = 2; x < W; x += 12) { g.r(x, 19, 8, 7, '#264653'); g.r(x + 1, 20, 6, 3, '#ffd166', 0.5); } g.r(0, 40, W, 2, '#e9c46a'); },
  canal: (g) => { cityBase(g, { ground: '#4f5d2f' }); g.r(0, 39, W, 4, '#7f6f5b'); P.water(g, 43, '#284b63'); P.boat(g, 52, 38, '#2a9d8f'); P.tree(g, 10, 39, 14); P.lamp(g, 36, 40); },
  motorway: (g) => { g.bands(0, 30, ['#2b2d42', '#5c4d7d', '#b5838d', '#e5989b']); for (let x = 0; x < W; x += 9 + g.rng.int(6)) P.building(g, x, 6 + g.rng.int(6), 6 + g.rng.int(10), '#3d405b', 30, 0.15); g.r(0, 30, W, H - 30, '#2b2d42'); g.r(0, 32, W, 10, '#6c757d'); g.r(0, 32, W, 1, '#adb5bd'); for (let x = 6; x < W; x += 24) g.r(x, 42, 4, 12, '#495057'); for (let i = 0; i < 5; i++) P.car(g, 2 + i * 19, 33, ['#e63946', '#457b9d', '#e9c46a', '#2a9d8f', '#f4a261'][i], true); },
  alley: (g) => { g.bands(0, 20, ['#14213d', '#22223b']); g.r(0, 0, 26, H, '#4a3b36'); g.r(70, 0, 26, H, '#3e322d'); g.windows(0, 4, 26, 30, '#2a201c', 0.15, '#ffd166', 5, 6); g.windows(70, 4, 26, 30, '#2a201c', 0.15, '#ffd166', 5, 6); for (let j = 8; j < 34; j += 8) g.r(66, j, 6, 1, '#555'); g.r(26, 40, 44, H - 40, '#2f2f36'); P.bin(g, 30, 34); P.bin(g, 36, 35); P.bin(g, 60, 34); g.r(26, 20, 44, 20, '#1b1b25'); g.dither(26, 20, 44, 20, '#2a2a38', 3); },
  supermarket: (g) => { interior(g, { wall: '#dee2e6', floor: '#adb5bd', checker: true, trim: '#e63946' }); g.r(0, 4, W, 3, '#e63946'); lights(g, 0, '#ffffff', 5); P.shelf(g, 4, 14, 22, 24); P.shelf(g, 36, 14, 22, 24); P.shelf(g, 68, 14, 22, 24); },
  depot: (g) => { interior(g, { wall: '#495057', floor: '#343a40', trim: '#ffc300' }); for (let x = 0; x < W; x += 12) g.r(x, 0, 2, 38, '#343a40'); for (let i = 0; i < 3; i++) { const x = 4 + i * 31; g.r(x, 18, 26, 18, '#c1121f'); g.r(x, 18, 26, 2, '#e5383b'); g.windows(x, 20, 26, 6, '#264653', 0.3, '#ffd166', 4, 3); g.windows(x, 28, 26, 6, '#264653', 0.1, '#ffd166', 4, 3); g.r(x + 3, 36, 4, 2, '#111'); g.r(x + 19, 36, 4, 2, '#111'); } },
  apartment: (g) => { interior(g, { wall: '#6d597a', wall2: '#b56576', floor: '#7f5539' }); P.window(g, 10, 8, 18, 14, '#14213d'); g.r(10, 8, 18, 14, '#f77f00', 0.15); P.door(g, 76, 24, 8, 14); g.r(36, 28, 24, 8, '#355070'); g.r(36, 26, 24, 3, '#4f6d8a'); g.r(60, 30, 6, 6, '#8d6e63'); g.r(62, 26, 2, 4, '#f1faee'); },
  hospital: (g) => { interior(g, { wall: '#d8f3dc', floor: '#b7e4c7', checker: true, trim: '#52b788' }); lights(g, 0, '#ffffff', 4); P.bed(g, 6, 28); P.bed(g, 40, 28); g.r(26, 6, 1, 30, '#adb5bd'); g.r(26, 6, 10, 26, '#74c69d', 0.7); g.r(70, 10, 18, 14, '#1b4332'); g.r(72, 12, 4, 4, '#e63946'); g.r(73, 11, 2, 6, '#e63946'); g.r(71, 13, 6, 2, '#e63946'); },
  lab: (g) => { interior(g, { wall: '#caf0f8', floor: '#90a4ae', checker: true, trim: '#00b4d8' }); lights(g, 0, '#ffffff', 3); g.r(4, 26, 40, 4, '#495057'); g.r(4, 30, 40, 8, '#6c757d'); for (let i = 8; i < 40; i += 6) { g.r(i, 22, 2, 4, ['#06d6a0', '#ef476f', '#ffd166'][i % 3]); } g.r(56, 10, 16, 28, '#e9ecef'); g.r(58, 12, 12, 10, '#bde0fe'); g.r(76, 18, 14, 10, '#212529'); g.r(77, 19, 12, 7, '#4cc9f0', 0.6); },
  police: (g) => { interior(g, { wall: '#1d3557', floor: '#495057', trim: '#a8dadc' }); for (let i = 0; i < 6; i++) { g.r(4 + i * 7, 12, 6, 26, '#6c757d'); g.r(5 + i * 7, 14, 4, 1, '#adb5bd'); } g.r(52, 10, 40, 28, '#343a40'); for (let x = 52; x < 92; x += 3) g.r(x, 10, 1, 28, '#adb5bd'); g.r(60, 22, 20, 2, '#212529'); },
  warehouse: (g) => { interior(g, { wall: '#5c5346', floor: '#3e3a35', trim: '#383026' }); for (let x = 0; x < W; x += 16) g.r(x, 0, 2, 38, '#2e2a24'); g.r(0, 6, W, 2, '#2e2a24'); for (let i = 0; i < 9; i++) P.crate(g, 4 + (i % 5) * 18 + g.rng.int(3), 26 - Math.floor(i / 5) * 8, 8); P.crate(g, 70, 32, 6, '#7f5539'); },
  mall: (g) => { interior(g, { wall: '#ffe5d9', floor: '#d8e2dc', checker: true, trim: '#9d8189' }); lights(g, 0, '#ffffff', 5); P.shopfront(g, 2, 14, 26, '#e63946'); P.shopfront(g, 68, 14, 26, '#2a9d8f'); for (let i = 0; i < 12; i++) g.r(32 + i * 3, 34 - i * 2, 4, 2, '#adb5bd'); g.r(30, 10, 36, 1, '#9d8189'); },
  tunnel: (g) => { g.r(0, 0, W, H, '#0b0c10'); for (let i = 0; i < 6; i++) { const w = 90 - i * 14, h = 44 - i * 7; g.r(48 - w / 2, 6 + i * 4, w, 2, shade('#3a3a44', -i * 0.1)); g.r(48 - w / 2, 6 + i * 4, 2, h, '#2b2b33'); g.r(48 + w / 2 - 2, 6 + i * 4, 2, h, '#2b2b33'); } g.r(0, 44, W, H - 44, '#1f1f26'); for (let i = 0; i < 10; i++) { g.r(30 + i * 1, 44 + i, 2, 1, '#8d99ae'); g.r(64 - i * 1, 44 + i, 2, 1, '#8d99ae'); } g.r(46, 22, 4, 3, '#ffd166', 0.6); },
  sewer: (g) => { g.r(0, 0, W, H, '#1a1d1a'); g.r(4, 4, 88, 40, '#2c332b'); g.r(8, 2, 80, 4, '#2c332b'); for (let x = 4; x < 92; x += 6) g.r(x, 4, 3, 2, '#3a4438'); g.r(0, 38, W, 4, '#3a4438'); P.water(g, 42, '#3d5a3a'); g.r(70, 6, 2, 32, '#6c757d'); for (let j = 8; j < 38; j += 4) g.r(68, j, 6, 1, '#6c757d'); },
  interior: (g) => { interior(g, { wall: '#5e548e', floor: '#6b4f3a' }); P.window(g, 12, 8, 14, 12); g.r(36, 26, 30, 3, '#8d6e63'); g.r(36, 29, 2, 9, '#5d4037'); g.r(64, 29, 2, 9, '#5d4037'); P.door(g, 80, 24, 8, 14); },

  // ---- forest ----
  forest: (g) => { forestBase(g); },
  campsite: (g) => { forestBase(g); P.tent(g, 16, 46, '#e76f51'); P.tent(g, 60, 47, '#2a9d8f'); P.fire(g, 42, 48); g.r(36, 48, 4, 2, '#5e3b23'); },
  cabin: (g) => { forestBase(g, { near: '#14281f' }); P.cabin(g, 32, 44); },
  river: (g) => { forestBase(g); P.water(g, 42, '#1d4e89'); for (let x = 20; x < 76; x += 12) P.rock(g, x, 42 + g.rng.int(4), 5, 3); },
  lake: (g) => { g.bands(0, 28, ['#0b132b', '#1c2541', '#3a506b', '#6fffe9']); g.stars(14, 12); for (let x = 0; x < W; x += 3) P.pine(g, x, 30, 8 + g.rng.int(6), '#1b2f2a'); P.water(g, 30, '#14365a'); g.r(36, 40, 26, 2, '#7f5539'); g.r(40, 42, 1, 6, '#5e3b23'); g.r(58, 42, 1, 6, '#5e3b23'); },
  cave: (g) => { g.r(0, 0, W, H, '#3a3335'); for (let i = 0; i < 40; i++) g.r(g.rng.int(W), g.rng.int(H), 3, 2, '#4a4245'); g.r(24, 10, 48, 44, '#0e0b0c'); g.r(28, 6, 40, 6, '#0e0b0c'); g.r(18, 16, 6, 38, '#2a2425'); g.r(72, 16, 6, 38, '#2a2425'); for (let i = 30; i < 66; i += 7) g.r(i, 10, 2, 4 + (i % 3), '#5a5052'); g.r(0, 48, W, 6, '#262022'); },
  outpost: (g) => { forestBase(g); g.r(30, 30, 36, 14, '#8a6d4b'); g.r(28, 28, 40, 2, '#5e3b23'); g.r(36, 34, 6, 5, '#ffd166', 0.6); P.door(g, 50, 32, 6, 12, '#5e3b23'); P.antenna(g, 72, 44); },
  ranger: (g) => { forestBase(g); g.r(20, 26, 50, 18, '#6b705c'); g.r(18, 24, 54, 2, '#3a3d33'); g.windows(20, 26, 50, 10, '#283618', 0.6, '#ffd166', 6, 4); P.door(g, 40, 32, 7, 12, '#283618'); P.tower(g, 78, 44); g.r(82, 1, 1, 3, '#e63946'); },
  road: (g) => { forestBase(g); g.r(0, 44, W, 6, '#6f5e4b'); g.dither(0, 44, W, 6, '#7f6f5b', 3); P.car(g, 40, 39, '#264653', true); g.r(52, 37, 2, 2, '#adb5bd', 0.6); },
  bunker: (g) => { forestBase(g); g.r(22, 30, 52, 16, '#4a5240'); for (let i = 0; i < 8; i++) g.r(22 + i * 6, 28 - (i % 3), 8, 3, '#3a5a2a'); g.r(38, 34, 20, 12, '#6c757d'); g.r(40, 36, 16, 10, '#495057'); g.r(47, 38, 2, 2, '#e9c46a'); },
  ridge: (g) => { g.bands(0, 30, ['#22223b', '#4a4e69', '#9a8c98', '#f2e9e4']); for (let x = 0; x < W; x += 4) g.r(x, 22 + Math.floor(6 * Math.sin(x / 9)), 4, 30, '#3d405b'); g.r(0, 38, 60, 16, '#5c5d67'); g.r(60, 44, 36, 10, '#2b2d42'); g.dither(0, 38, 60, 4, '#6c6d78', 3); for (let x = 64; x < W; x += 6) P.pine(g, x, 50, 10, '#1b2f2a'); },
  mine: (g) => { g.r(0, 0, W, H, '#2b2321'); for (let x = 6; x < W; x += 22) { g.r(x, 6, 3, 40, '#7f5539'); g.r(x + 16, 6, 3, 40, '#7f5539'); g.r(x, 6, 19, 3, '#6b4429'); } g.r(0, 46, W, H - 46, '#3a302b'); P.rail(g, 48); g.r(40, 40, 14, 6, '#6c757d'); g.r(42, 46, 3, 2, '#222'); g.r(50, 46, 3, 2, '#222'); g.r(10, 14, 2, 2, '#ffd166'); g.r(8, 12, 6, 6, '#ffd166', 0.1); },
  gorge: (g) => { g.bands(0, 40, ['#14213d', '#1d3557', '#457b9d', '#a8dadc']); g.r(0, 20, 22, H - 20, '#4a4e57'); g.r(74, 20, 22, H - 20, '#3d4048'); g.r(22, 46, 52, 8, '#0b132b'); for (let i = 0; i < 52; i += 2) g.r(22 + i, 21 + Math.floor(3 * Math.sin((i / 52) * Math.PI)), 2, 1, '#a0743c'); g.r(22, 18, 52, 1, '#8d6e63'); P.pine(g, 8, 20, 12, '#1b4332'); P.pine(g, 86, 20, 12, '#1b4332'); },
  lookout: (g) => { forestBase(g); P.tower(g, 42, 46); },
  swamp: (g) => { g.bands(0, 32, ['#1b2421', '#2d3a32', '#445c4a', '#6a8a6f']); for (let x = 0; x < W; x += 10) { g.r(x + 4, 10, 2, 28, '#2e2b24'); g.r(x, 10, 10, 3, '#3a4a33'); } P.water(g, 38, '#2f3e2b'); for (let x = 6; x < W; x += 14) g.r(x, 37, 6, 2, '#4f6d3a'); g.r(0, 20, W, 18, '#c0d6c0', 0.12); },
  meadow: (g) => { g.bands(0, 32, ['#14213d', '#3a506b', '#e0aaff', '#ffd6a5']); for (let x = 0; x < W; x += 3) P.pine(g, x, 32, 6 + g.rng.int(4), '#2d4a22'); g.r(0, 32, W, H - 32, '#6a994e'); for (let i = 0; i < 60; i++) g.r(g.rng.int(W), 33 + g.rng.int(20), 1, 1, ['#ffd166', '#ef476f', '#f1faee'][g.rng.int(3)]); },

  // ---- ship ----
  stateroom: (g) => { shipInterior(g, { wall: '#f8edeb', floor: '#6d597a' }); P.bed(g, 8, 28, '#ffffff'); g.r(8, 26, 14, 2, '#cdb4db'); g.r(52, 24, 12, 14, '#b08968'); g.r(53, 25, 10, 2, '#e9c46a', 0.5); P.door(g, 80, 24, 8, 14, '#b08968'); },
  restaurant: (g) => { shipInterior(g, { wall: '#7b2d26', floor: '#3c1518', trim: '#e9c46a', portholes: true }); for (const x of [24, 48, 72]) { g.r(x, 0, 1, 6, '#e9c46a'); g.r(x - 4, 6, 9, 3, '#ffd166'); g.r(x - 8, 8, 17, 10, '#ffd166', 0.06); } for (let i = 0; i < 4; i++) P.table(g, 6 + i * 23, 32); },
  galley: (g) => { interior(g, { wall: '#ced4da', floor: '#6c757d', checker: true, trim: '#adb5bd' }); lights(g, 0, '#ffffff', 4); g.r(2, 26, 92, 4, '#adb5bd'); g.r(2, 30, 92, 8, '#868e96'); for (let x = 8; x < 90; x += 14) { g.r(x, 20, 8, 6, '#495057'); g.r(x + 2, 18, 4, 2, '#343a40'); } for (let x = 4; x < 90; x += 10) g.r(x, 8, 2, 6, '#495057'); },
  engine: (g) => { interior(g, { wall: '#3d3d3d', floor: '#2b2b2b', trim: '#ffc300' }); P.pipe(g, 6, '#9a6f45'); P.pipe(g, 12, '#6c757d'); for (let i = 0; i < 3; i++) { const x = 6 + i * 30; g.r(x, 18, 22, 20, '#495057'); g.r(x + 2, 20, 18, 2, '#ffc300'); g.r(x + 4, 26, 4, 4, '#e63946', 0.7); g.r(x + 12, 26, 6, 8, '#343a40'); } },
  corridor: (g) => { shipInterior(g, { wall: '#e9ecef', floor: '#6a040f', portholes: false }); lights(g, 0, '#fff3b0', 4); for (let x = 4; x < W; x += 18) { P.door(g, x, 22, 8, 16, '#b08968'); g.r(x + 2, 18, 4, 2, '#e9c46a'); } },
  deck: (g) => { seaBase(g, { horizon: 26 }); g.r(0, 36, W, H - 36, '#b08968'); for (let j = 38; j < H; j += 3) g.r(0, j, W, 1, '#9c6644'); g.r(0, 30, W, 1, '#f1faee'); for (let x = 0; x < W; x += 6) g.r(x, 30, 1, 6, '#f1faee'); g.r(0, 34, W, 1, '#f1faee'); },
  flooded: (g) => { shipInterior(g, { wall: '#adb5bd', floor: '#495057' }); g.r(0, 30, W, H - 30, '#1d4e89', 0.85); for (let i = 0; i < 16; i++) g.r(g.rng.int(W), 30 + g.rng.int(20), 4, 1, '#a8dadc', 0.6); g.r(0, 30, W, 1, '#a8dadc', 0.8); P.crate(g, 60, 26, 6, '#a0743c'); },
  lifeboats: (g) => { seaBase(g, { horizon: 30 }); g.r(0, 40, W, H - 40, '#e9ecef'); g.r(0, 40, W, 2, '#adb5bd'); for (let x = 6; x < W; x += 30) { g.r(x, 22, 22, 6, '#f77f00'); g.r(x + 2, 20, 18, 2, '#f8f9fa'); g.r(x + 2, 14, 1, 8, '#6c757d'); g.r(x + 19, 14, 1, 8, '#6c757d'); g.r(x, 13, 22, 1, '#6c757d'); } },
  shipbridge: (g) => { g.bands(0, 24, ['#03045e', '#023e8a', '#0077b6']); P.water(g, 18, '#03045e', 24); g.r(0, 24, W, H - 24, '#343a40'); for (let x = 0; x < W; x += 16) g.r(x, 0, 2, 24, '#212529'); P.console(g, 6, 32, 30); P.console(g, 60, 32, 30); g.r(44, 28, 8, 10, '#495057'); g.r(46, 26, 4, 2, '#b08968'); g.r(0, 38, W, H - 38, '#212529'); },
  casino: (g) => { shipInterior(g, { wall: '#3c096c', floor: '#240046', trim: '#ffd60a', portholes: false }); for (let x = 4; x < 40; x += 9) { g.r(x, 18, 7, 20, '#7b2cbf'); g.r(x + 1, 20, 5, 4, '#ffd60a'); g.r(x + 2, 21, 1, 2, '#e63946'); g.r(x + 4, 21, 1, 2, '#06d6a0'); } g.r(52, 28, 38, 6, '#1b4332'); g.r(50, 34, 42, 4, '#5a189a'); lights(g, 0, '#ffd60a', 3); },
  theatre: (g) => { interior(g, { wall: '#370617', floor: '#1b0a0a', trim: '#e9c46a' }); g.r(10, 4, 76, 26, '#03071e'); g.r(10, 4, 8, 26, '#9d0208'); g.r(78, 4, 8, 26, '#9d0208'); g.r(10, 4, 76, 4, '#9d0208'); g.r(10, 30, 76, 4, '#6a040f'); for (let j = 38; j < H; j += 4) for (let i = 4; i < W; i += 5) g.r(i, j, 4, 3, '#9d0208'); },
  pool: (g) => { seaBase(g, { horizon: 24 }); g.r(0, 30, W, H - 30, '#e9ecef'); g.r(14, 36, 60, 14, '#4cc9f0'); for (let i = 0; i < 10; i++) g.r(16 + g.rng.int(56), 37 + g.rng.int(12), 4, 1, '#bde0fe'); g.r(78, 40, 14, 3, '#ffb703'); g.r(2, 40, 10, 3, '#ffb703'); },
  hold: (g) => { interior(g, { wall: '#495057', floor: '#343a40', trim: '#ffc300' }); for (let x = 0; x < W; x += 12) g.r(x, 0, 2, 38, '#2b2d42'); P.car(g, 6, 30, '#e63946'); P.car(g, 24, 30, '#2a9d8f'); for (let i = 0; i < 6; i++) P.crate(g, 50 + (i % 3) * 14, 24 + Math.floor(i / 3) * 7, 7, '#6c757d'); },
  medbay: (g) => { shipInterior(g, { wall: '#e0fbfc', floor: '#98c1d9', portholes: true }); P.bed(g, 6, 28); P.bed(g, 42, 28); g.r(76, 18, 14, 20, '#ffffff'); g.r(80, 22, 6, 2, '#e63946'); g.r(82, 20, 2, 6, '#e63946'); },
  sea: (g) => { seaBase(g, { sky: ['#000814', '#001d3d', '#003566', '#ffc300'], horizon: 32 }); g.r(0, 32, W, 1, '#ffc300', 0.4); P.boat(g, 34, 38, '#f77f00'); },
  shore: (g) => { g.bands(0, 28, ['#ffcdb2', '#ffb4a2', '#e5989b', '#b5838d']); for (let x = 0; x < W; x += 8 + g.rng.int(6)) P.building(g, x, 6 + g.rng.int(5), 5 + g.rng.int(10), '#6d6875', 28, 0.2); g.r(0, 28, W, 6, '#e9c46a'); P.water(g, 34, '#264653'); g.r(60, 26, 2, 8, '#333'); g.r(58, 25, 6, 2, '#e63946'); },
  dock: (g) => { seaBase(g, { horizon: 28 }); g.r(0, 38, W, H - 38, '#7f5539'); for (let x = 0; x < W; x += 5) g.r(x, 38, 1, H - 38, '#5e3b23'); P.ship(g, 26, 14); },
};

// Zombie sprite (facing left), 9x14
const ZOMBIE = ['...gggg..', '..gggggg.', '..grggrg.', '..gggggg.', '..gkkkg..', '...gggg..', 'ggsssss..', '..sssss..', 'ggsssss..', '..sssss..', '..ppppp..', '..pp.pp..', '..pp.pp..', '..kk.kk..'];
const ZSHIRTS = ['#6c757d', '#9d0208', '#264653', '#e9c46a', '#7b2cbf', '#e9ecef', '#2a9d8f'];

function zombie(g, x, y, shirt, i) {
  let s = `<g class="zb" style="animation-delay:${(i * 0.37) % 2}s">`;
  ZOMBIE.forEach((row, j) => { for (let k = 0; k < row.length; k++) { const ch = row[k]; if (ch === '.') continue; const c = ch === 'g' ? '#7fa65a' : ch === 'r' ? '#ff2d2d' : ch === 'k' ? '#1c1c1c' : ch === 's' ? shirt : '#3a3f55'; s += `<rect x="${x + k}" y="${y + j}" width="1" height="1" fill="${c}"/>`; } });
  return s + '</g>';
}

const LIGHT = {
  night: '<rect width="96" height="54" fill="#0a1033" opacity="0.38"/>',
  dim: '<rect width="96" height="54" fill="#000" opacity="0.32"/>',
  dark: '<rect width="96" height="54" fill="#000" opacity="0.62"/><radialGradient id="vg"><stop offset="0.25" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.8"/></radialGradient><rect width="96" height="54" fill="url(#vg)"/>',
  dusk: '<rect width="96" height="54" fill="#f77f00" opacity="0.14"/>',
  fire: '<rect class="flicker" width="96" height="54" fill="#f77f00" opacity="0.22"/><rect y="40" width="96" height="14" fill="#d00000" opacity="0.2"/>',
  alert: '<rect class="alert" width="96" height="54" fill="#d00000" opacity="0.18"/>',
  fog: '<rect width="96" height="54" fill="#dfe7ec" opacity="0.22"/><rect y="30" width="96" height="24" fill="#dfe7ec" opacity="0.18"/>',
  storm: '<rect width="96" height="54" fill="#0b132b" opacity="0.35"/>',
};

export function sceneSVG(scene, party = [], { stage = 0, cls = '' } = {}) {
  const name = SCENES[scene?.bg] ? scene.bg : 'street';
  const g = canvas(name + ':' + (stage % 7));
  try { SCENES[name](g, scene || {}); } catch { /* keep partial drawing */ }
  let out = g.out();
  // zombies on the right
  const z = Math.min(6, scene?.z || 0);
  for (let i = 0; i < z; i++) out += zombie(g, 86 - i * 9 - (i % 2) * 2, 36 + (i % 2) * 2, ZSHIRTS[(i + stage) % ZSHIRTS.length], i);
  // cast portraits standing at the bottom left (alive only)
  const cast = party.slice(0, 6);
  cast.forEach((c, i) => {
    const x = 3 + i * 11, y = 37;
    out += `<g class="hero" style="animation-delay:${i * 0.2}s"><rect x="${x + 2}" y="${y + 10}" width="6" height="5" fill="${avatarBg(c.avatar)}"/><rect x="${x + 2}" y="${y + 14}" width="6" height="1" fill="#000" opacity="0.3"/><svg x="${x}" y="${y}" width="10" height="10" viewBox="0 0 16 16">${avatarInner(c.avatar, false)}</svg></g>`;
  });
  if (scene?.light && LIGHT[scene.light]) out += LIGHT[scene.light];
  if (scene?.fx === 'water') out += '<rect y="44" width="96" height="10" fill="#1d4e89" opacity="0.55"/>';
  if (scene?.weather === 'rain') { for (let i = 0; i < 40; i++) out += `<rect class="rain" style="animation-delay:${(i % 10) / 10}s" x="${(i * 17) % 96}" y="${(i * 7) % 40}" width="1" height="3" fill="#a8dadc" opacity="0.5"/>`; }
  return `<svg class="scene ${cls}" viewBox="0 0 96 54" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges" role="img" aria-label="${name} scene">${out}</svg>`;
}

export const SCENE_NAMES = Object.keys(SCENES);

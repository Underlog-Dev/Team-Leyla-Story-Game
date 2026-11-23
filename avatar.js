// Pixel-art square head avatars, rendered as crisp SVG on a 16x16 grid.
// Every feature is an index into an option list, so avatars store as tiny JSON.

const SKINS = ['#ffe3c8', '#f8cba6', '#eeb48b', '#dc9c6e', '#c98552', '#ad6d3e', '#905631', '#734125', '#58311c', '#3f2414'];
const HAIR_COLOURS = ['#1c1b20', '#3b2417', '#6b3e1f', '#8f3b1b', '#d0661f', '#e8c35a', '#f3e7bb', '#9b9aa3', '#ecebf2', '#3a6fd8', '#e468a8', '#3fae5a', '#7d4cc9', '#c22b2b'];
const EYE_COLOURS = ['#2b1b12', '#4f86c6', '#3d8b4f', '#8a5a2b', '#6d6d7a', '#9b3fc4'];
const HAT_COLOURS = ['#c0392b', '#2e5fa8', '#2f8a4a', '#1f1f24', '#e6b422', '#e8e8ee', '#7a4b2a', '#d45fa0', '#5b6b2f'];
const BGS = ['#2b2d42', '#3d5a80', '#1b4332', '#6a040f', '#3c096c', '#7f5539', '#264653', '#e76f51', '#5f0f40', '#1d3557', '#495057', '#2a9d8f'];

// Hair masks: rows 0..15, 'H' = hair colour, 'h' = darker shade, '.' = nothing.
const HAIRSTYLES = {
  'Bald': [],
  'Buzz cut': ['', '', '', '..hHhHhHhHhHhH..', '..h..........h..'],
  'Short': ['', '', '...HHHHHHHHHH...', '..HHHHHHHHHHHH..', '..HHHhHHHHhHHH..', '..HH........HH..', '..H..........H..'],
  'Spiky': ['....H..H..H.....', '...HH.HHH.HH.H..', '..HHHHHHHHHHHH..', '..HHHhHHHHhHHH..', '..HHHHHHHHHHHH..', '..H..........H..'],
  'Side part': ['', '', '...HHHHHHHHHH...', '..HHHHHHHHHHHH..', '..HHHHHHhHHHHH..', '..HHHHHHH...HH..', '..HH.........H..'],
  'Fringe': ['', '', '...HHHHHHHHHH...', '..HHHHHHHHHHHH..', '..HHHHHHHHHHHH..', '..HHHhHHHHhHHH..', '..H.H.H..H.H.H..'],
  'Bob': ['', '', '...HHHHHHHHHH...', '.HHHHHHHHHHHHHH.', '.HHHHHHHHHHHHHH.', '.HHH........HHH.', '.HH..........HH.', '.HH..........HH.', '.HH..........HH.', '.hH..........Hh.', '.hH..........Hh.', '.hh..........hh.'],
  'Long': ['', '', '...HHHHHHHHHH...', '.HHHHHHHHHHHHHH.', '.HHHHHHHHHHHHHH.', '.HHH........HHH.', '.HH..........HH.', '.HH..........HH.', '.HH..........HH.', '.HH..........HH.', '.HH..........HH.', '.hH..........Hh.', '.hH..........Hh.', '.hH..........Hh.', '.hh..........hh.', '.hh..........hh.'],
  'Ponytail': ['', '', '...HHHHHHHHHH...', '..HHHHHHHHHHHH..', '..HHHHHHHHHHHHH.', '..HH........HHHH', '..H..........HHH', '.............HHh', '.............hHh', '..............hh', '..............h.'],
  'Curly': ['', '...H.HH.HH.HH...', '..HHHHHHHHHHHH..', '.HHHhHHhHHhHHHH.', '.HhHHhHHhHHhHHH.', '.HH.H......H.HH.', '.HH..........HH.', '.H............H.'],
  'Afro': ['...HHHHHHHHHH...', '.HHHHhHHHHhHHHH.', 'HHhHHHHhHHHHhHHH', 'HHHHHhHHHHhHHHHH', 'HHHHHHHHHHHHHHHH', 'HHH..........HHH', 'HH............HH', 'HH............HH', '.h............h.'],
  'Mohawk': ['.......HH.......', '......HHHH......', '......HhhH......', '..h...HHHH...h..', '..h....HH....h..'],
  'Top bun': ['......HHHH......', '......HhhH......', '...HHHHHHHHHH...', '..HHHHHHHHHHHH..', '..HHHHHHHHHHHH..', '..HH........HH..'],
  'Braids': ['', '', '...HHHHHHHHHH...', '..HHHHHHHHHHHH..', '..HHHHHhHHHHHH..', '.HHH........HHH.', '.H............H.', '.h............h.', '.H............H.', '.h............h.', '.H............H.', '.h............h.', '.H............H.', '.h............h.', '.H............H.'],
  'Undercut': ['', '..HHHHHHHHH.....', '..HHHHHHHHHHH...', '..HHHHHHHHHHHH..', '..hhhhhhhhhhhh..', '..h..........h..'],
  'Messy': ['', '...H..H...H.....', '..HHHHHHHHHHHH..', '.HHHhHHHHhHHHHH.', '..HHHHH.HHHHHH..', '..HH.H.....H.H..', '..H..........H..'],
};
const HAIR_KEYS = Object.keys(HAIRSTYLES);

const EYES = ['Normal', 'Dots', 'Wide', 'Sleepy', 'Happy', 'Angry', 'Wink', 'Side-eye'];
const MOUTHS = ['Smile', 'Neutral', 'Grin', 'Shocked', 'Smirk', 'Frown'];
const BEARDS = ['None', 'Stubble', 'Full beard', 'Goatee', 'Long beard', 'Chinstrap', 'Soul patch'];
const STACHES = ['None', 'Classic', 'Thin', 'Handlebar', 'Walrus', 'Horseshoe'];
const EYEWEAR = ['None', 'Round glasses', 'Square glasses', 'Sunglasses', 'Aviators', 'Goggles', 'Eyepatch', 'Monocle'];
const HATS = ['None', 'Cap', 'Beanie', 'Cowboy hat', 'Hard hat', 'Headband', 'Bandana', 'Top hat', 'Bucket hat', 'Helmet', 'Headphones', 'Party hat', 'Flower crown', 'Chef hat'];
const ACCS = ['None', 'Earring', 'Scar', 'Plaster', 'Freckles', 'Blush', 'Face paint', 'Face mask', 'Mole', 'Nose ring'];

export const AVATAR_OPTIONS = [
  { key: 'skin', label: 'Skin tone', count: SKINS.length, name: (i) => `Tone ${i + 1}` },
  { key: 'hair', label: 'Hairstyle', count: HAIR_KEYS.length, name: (i) => HAIR_KEYS[i] },
  { key: 'hairColour', label: 'Hair colour', count: HAIR_COLOURS.length, name: (i) => ['Black', 'Dark brown', 'Brown', 'Auburn', 'Ginger', 'Blonde', 'Platinum', 'Grey', 'White', 'Blue', 'Pink', 'Green', 'Purple', 'Red'][i] },
  { key: 'eyes', label: 'Eyes', count: EYES.length, name: (i) => EYES[i] },
  { key: 'eyeColour', label: 'Eye colour', count: EYE_COLOURS.length, name: (i) => ['Brown', 'Blue', 'Green', 'Hazel', 'Grey', 'Violet'][i] },
  { key: 'mouth', label: 'Mouth', count: MOUTHS.length, name: (i) => MOUTHS[i] },
  { key: 'beard', label: 'Beard', count: BEARDS.length, name: (i) => BEARDS[i] },
  { key: 'stache', label: 'Moustache', count: STACHES.length, name: (i) => STACHES[i] },
  { key: 'facialColour', label: 'Facial hair colour', count: HAIR_COLOURS.length, name: (i) => ['Black', 'Dark brown', 'Brown', 'Auburn', 'Ginger', 'Blonde', 'Platinum', 'Grey', 'White', 'Blue', 'Pink', 'Green', 'Purple', 'Red'][i] },
  { key: 'eyewear', label: 'Glasses', count: EYEWEAR.length, name: (i) => EYEWEAR[i] },
  { key: 'hat', label: 'Headwear', count: HATS.length, name: (i) => HATS[i] },
  { key: 'hatColour', label: 'Headwear colour', count: HAT_COLOURS.length, name: (i) => ['Red', 'Blue', 'Green', 'Black', 'Yellow', 'White', 'Brown', 'Pink', 'Olive'][i] },
  { key: 'acc', label: 'Accessory', count: ACCS.length, name: (i) => ACCS[i] },
  { key: 'bg', label: 'Background', count: BGS.length, name: (i) => `Colour ${i + 1}` },
];

export function defaultAvatar() {
  return { skin: 2, hair: 2, hairColour: 1, eyes: 0, eyeColour: 0, mouth: 0, beard: 0, stache: 0, facialColour: 1, eyewear: 0, hat: 0, hatColour: 0, acc: 0, bg: 0 };
}

export function randomAvatar(rand = Math.random) {
  const a = {};
  for (const o of AVATAR_OPTIONS) a[o.key] = Math.floor(rand() * o.count);
  // keep randoms tasteful: facial hair and odd eyewear less often
  if (rand() < 0.6) a.beard = 0;
  if (rand() < 0.6) a.stache = 0;
  if (rand() < 0.5) a.eyewear = 0;
  if (rand() < 0.45) a.hat = 0;
  if (rand() < 0.5) a.acc = 0;
  if (rand() < 0.7) a.hairColour = Math.floor(rand() * 9);
  a.facialColour = a.hairColour;
  return a;
}

export function normaliseAvatar(a) {
  const out = defaultAvatar();
  if (a && typeof a === 'object') {
    for (const o of AVATAR_OPTIONS) {
      const v = Number(a[o.key]);
      if (Number.isInteger(v) && v >= 0 && v < o.count) out[o.key] = v;
    }
  }
  return out;
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(c * (1 + amt))));
  const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

export function avatarGrid(av) {
  const a = normaliseAvatar(av);
  const g = Array.from({ length: 16 }, () => Array(16).fill(null));
  const px = (x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) g[y][x] = c; };
  const rect = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, c); };
  const skin = SKINS[a.skin];
  const skinD = shade(skin, -0.14), skinDD = shade(skin, -0.3), skinL = shade(skin, 0.08);
  const hairC = HAIR_COLOURS[a.hairColour], hairD = shade(hairC, -0.3);
  const fC = HAIR_COLOURS[a.facialColour], fD = shade(fC, -0.25);
  const hatC = HAT_COLOURS[a.hatColour], hatD = shade(hatC, -0.3);
  const ink = '#1a1420';

  // head
  rect(2, 3, 12, 12, skin);
  rect(3, 4, 4, 2, skinL);
  rect(13, 3, 1, 12, skinD);
  rect(2, 14, 12, 1, skinD);
  // ears
  px(1, 8, skinD); px(1, 9, skinD); px(14, 8, skinD); px(14, 9, skinD);
  // nose
  px(7, 10, skinD); px(8, 10, skinDD);

  // mouth
  const m = MOUTHS[a.mouth];
  const lip = shade(skin, -0.42);
  if (m === 'Smile') { rect(6, 12, 4, 1, lip); px(5, 11, lip); px(10, 11, lip); }
  else if (m === 'Neutral') rect(6, 12, 4, 1, lip);
  else if (m === 'Grin') { rect(5, 12, 6, 1, '#f4f1ea'); px(4, 11, lip); px(11, 11, lip); rect(5, 13, 6, 1, lip); }
  else if (m === 'Shocked') { rect(7, 12, 2, 2, ink); }
  else if (m === 'Smirk') { rect(6, 12, 3, 1, lip); px(9, 11, lip); }
  else if (m === 'Frown') { rect(6, 12, 4, 1, lip); px(5, 13, lip); px(10, 13, lip); }

  // eyes
  const iris = EYE_COLOURS[a.eyeColour];
  const e = EYES[a.eyes];
  const W = '#ffffff';
  if (e === 'Normal') { px(4, 8, W); px(5, 8, iris); px(10, 8, iris); px(11, 8, W); }
  else if (e === 'Dots') { px(5, 8, ink); px(10, 8, ink); }
  else if (e === 'Wide') { rect(4, 7, 2, 2, W); rect(10, 7, 2, 2, W); px(5, 8, iris); px(10, 8, iris); }
  else if (e === 'Sleepy') { rect(4, 8, 2, 1, ink); rect(10, 8, 2, 1, ink); rect(4, 7, 2, 1, skinD); rect(10, 7, 2, 1, skinD); }
  else if (e === 'Happy') { px(4, 8, ink); px(5, 7, ink); px(6, 8, ink); px(9, 8, ink); px(10, 7, ink); px(11, 8, ink); }
  else if (e === 'Angry') { px(4, 8, W); px(5, 8, iris); px(10, 8, iris); px(11, 8, W); px(4, 6, ink); px(5, 7, ink); px(11, 6, ink); px(10, 7, ink); }
  else if (e === 'Wink') { px(4, 8, W); px(5, 8, iris); rect(10, 8, 2, 1, ink); }
  else if (e === 'Side-eye') { px(4, 8, iris); px(5, 8, W); px(10, 8, iris); px(11, 8, W); rect(4, 7, 2, 1, skinD); rect(10, 7, 2, 1, skinD); }

  // accessories (under facial hair and glasses)
  const acc = ACCS[a.acc];
  if (acc === 'Earring') { px(1, 10, '#f2c94c'); }
  else if (acc === 'Scar') { px(11, 9, '#b0505a'); px(12, 10, '#b0505a'); px(11, 11, '#b0505a'); }
  else if (acc === 'Plaster') { rect(10, 10, 3, 1, '#e9c79a'); px(11, 10, '#d6a874'); }
  else if (acc === 'Freckles') { px(4, 10, skinDD); px(6, 11, skinDD); px(10, 10, skinDD); px(11, 11, skinDD); px(3, 11, skinDD); px(12, 10, skinDD); }
  else if (acc === 'Blush') { rect(3, 10, 2, 1, '#e98a9a'); rect(11, 10, 2, 1, '#e98a9a'); }
  else if (acc === 'Face paint') { rect(3, 9, 3, 1, '#2e5fa8'); rect(10, 9, 3, 1, '#2e5fa8'); rect(3, 10, 2, 1, '#c0392b'); rect(11, 10, 2, 1, '#c0392b'); }
  else if (acc === 'Mole') { px(10, 11, skinDD); }
  else if (acc === 'Nose ring') { px(8, 11, '#d9d9e3'); }

  // beard
  const b = BEARDS[a.beard];
  if (b === 'Stubble') { for (let y = 11; y <= 14; y++) for (let x = 3; x <= 12; x++) if ((x + y) % 2 === 0 && !(y === 12 && x >= 6 && x <= 9)) px(x, y, shade(fC, 0.15)); }
  else if (b === 'Full beard' || b === 'Long beard') {
    rect(2, 10, 1, 5, fC); rect(13, 10, 1, 5, fD); rect(2, 11, 12, 4, fC); rect(6, 12, 4, 1, lip); rect(3, 14, 10, 1, fD);
    px(2, 9, fC); px(13, 9, fD);
    if (b === 'Long beard') { rect(3, 15, 10, 1, fC); px(5, 15, fD); px(9, 15, fD); }
  }
  else if (b === 'Goatee') { rect(6, 13, 4, 2, fC); px(7, 14, fD); }
  else if (b === 'Chinstrap') { rect(2, 9, 1, 5, fC); rect(13, 9, 1, 5, fD); rect(3, 14, 10, 1, fC); }
  else if (b === 'Soul patch') { rect(7, 13, 2, 1, fC); }

  // moustache
  const s = STACHES[a.stache];
  if (s === 'Classic') rect(5, 11, 6, 1, fC);
  else if (s === 'Thin') rect(6, 11, 4, 1, fD);
  else if (s === 'Handlebar') { rect(5, 11, 6, 1, fC); px(4, 10, fC); px(11, 10, fC); }
  else if (s === 'Walrus') { rect(5, 11, 6, 2, fC); rect(6, 12, 4, 1, fD); }
  else if (s === 'Horseshoe') { rect(5, 11, 6, 1, fC); rect(5, 12, 1, 3, fC); rect(10, 12, 1, 3, fC); }

  if (acc === 'Face mask') { rect(3, 10, 10, 4, '#a9d6e5'); rect(3, 11, 10, 1, '#89c2d9'); px(2, 10, '#e8f4f8'); px(13, 10, '#e8f4f8'); }

  // hair
  const mask = HAIRSTYLES[HAIR_KEYS[a.hair]];
  mask.forEach((row, y) => { for (let x = 0; x < row.length; x++) { if (row[x] === 'H') px(x, y, hairC); else if (row[x] === 'h') px(x, y, hairD); } });

  // eyewear
  const ew = EYEWEAR[a.eyewear];
  const frame = '#222033';
  if (ew === 'Round glasses' || ew === 'Square glasses') {
    const f = ew === 'Round glasses' ? '#8a6d3b' : frame;
    rect(3, 7, 4, 1, f); rect(3, 9, 4, 1, f); px(3, 8, f); px(6, 8, f);
    rect(9, 7, 4, 1, f); rect(9, 9, 4, 1, f); px(9, 8, f); px(12, 8, f);
    rect(7, 8, 2, 1, f);
    if (ew === 'Round glasses') { px(3, 7, skin); px(6, 7, skin); px(9, 7, skin); px(12, 7, skin); px(3, 9, skin); px(6, 9, skin); px(9, 9, skin); px(12, 9, skin); }
    px(2, 8, f); px(13, 8, f);
  } else if (ew === 'Sunglasses') {
    rect(3, 7, 4, 2, '#111'); rect(9, 7, 4, 2, '#111'); rect(7, 7, 2, 1, '#111'); px(2, 7, '#111'); px(13, 7, '#111'); px(4, 7, '#555a70'); px(10, 7, '#555a70');
  } else if (ew === 'Aviators') {
    rect(3, 7, 4, 2, '#3b2f2f'); rect(9, 7, 4, 2, '#3b2f2f'); rect(4, 9, 2, 1, '#3b2f2f'); rect(10, 9, 2, 1, '#3b2f2f'); rect(7, 7, 2, 1, '#d4af37'); px(2, 7, '#d4af37'); px(13, 7, '#d4af37'); px(4, 7, '#c27c4a'); px(10, 7, '#c27c4a');
  } else if (ew === 'Goggles') {
    rect(2, 6, 12, 1, '#5b4636'); rect(3, 7, 4, 3, '#5b4636'); rect(9, 7, 4, 3, '#5b4636'); rect(4, 8, 2, 1, '#7fd1d8'); rect(10, 8, 2, 1, '#7fd1d8'); px(4, 7, '#bdf1f5'); px(10, 7, '#bdf1f5');
  } else if (ew === 'Eyepatch') {
    rect(9, 7, 4, 3, '#111'); for (let x = 2; x <= 13; x++) if (x < 9 || x > 12) px(x, x < 9 ? 6 : 6, '#111');
  } else if (ew === 'Monocle') {
    rect(9, 7, 4, 1, '#d4af37'); rect(9, 9, 4, 1, '#d4af37'); px(9, 8, '#d4af37'); px(12, 8, '#d4af37'); px(12, 10, '#d4af37'); px(12, 11, '#d4af37');
  }

  // hats
  const h = HATS[a.hat];
  if (h === 'Cap') { rect(2, 1, 12, 3, hatC); rect(3, 0, 10, 1, hatC); rect(8, 4, 8, 1, hatD); px(7, 1, '#ffffff'); px(8, 1, '#ffffff'); }
  else if (h === 'Beanie') { rect(2, 1, 12, 4, hatC); rect(2, 4, 12, 1, hatD); rect(6, 0, 4, 1, hatD); for (let x = 3; x < 13; x += 2) px(x, 2, hatD); }
  else if (h === 'Cowboy hat') { rect(4, 0, 8, 3, hatC); rect(0, 3, 16, 1, hatC); rect(4, 2, 8, 1, hatD); px(0, 2, hatC); px(15, 2, hatC); rect(1, 4, 14, 1, hatD); }
  else if (h === 'Hard hat') { rect(3, 0, 10, 4, '#f2c230'); rect(1, 4, 14, 1, '#d4a514'); rect(7, 0, 2, 4, '#ffe066'); }
  else if (h === 'Headband') { rect(2, 5, 12, 1, hatC); px(14, 5, hatC); px(15, 6, hatC); px(14, 7, hatD); }
  else if (h === 'Bandana') { rect(2, 1, 12, 4, hatC); rect(3, 0, 10, 1, hatC); px(5, 2, '#ffffff'); px(9, 3, '#ffffff'); px(12, 2, '#ffffff'); px(14, 4, hatC); px(15, 5, hatD); px(14, 6, hatD); }
  else if (h === 'Top hat') { rect(4, 0, 8, 4, '#1b1b22'); rect(4, 3, 8, 1, hatC); rect(1, 4, 14, 1, '#1b1b22'); }
  else if (h === 'Bucket hat') { rect(3, 0, 10, 4, hatC); rect(1, 4, 14, 2, hatD); rect(3, 5, 10, 1, hatD); }
  else if (h === 'Helmet') { rect(2, 1, 12, 4, '#556b2f'); rect(3, 0, 10, 1, '#556b2f'); rect(1, 4, 14, 1, '#3d4f22'); px(5, 2, '#6b8740'); px(10, 1, '#6b8740'); px(8, 3, '#3d4f22'); }
  else if (h === 'Headphones') { rect(3, 1, 10, 1, '#2b2b33'); px(2, 2, '#2b2b33'); px(13, 2, '#2b2b33'); rect(0, 7, 2, 4, hatC); rect(14, 7, 2, 4, hatC); rect(1, 3, 1, 4, '#2b2b33'); rect(14, 3, 1, 4, '#2b2b33'); }
  else if (h === 'Party hat') { px(7, 0, '#ffe066'); rect(7, 1, 2, 1, hatC); rect(6, 2, 4, 1, '#ffe066'); rect(5, 3, 6, 1, hatC); rect(4, 4, 8, 1, '#ffe066'); }
  else if (h === 'Flower crown') { const fl = ['#ff6fa8', '#ffe066', '#ffffff', '#ff8c42', '#c77dff']; for (let x = 2; x <= 13; x++) px(x, 3, x % 2 ? '#3fae5a' : fl[x % 5]); px(4, 2, fl[0]); px(8, 2, fl[1]); px(11, 2, fl[4]); }
  else if (h === 'Chef hat') { rect(3, 0, 10, 4, '#f7f7fa'); rect(2, 1, 12, 2, '#f7f7fa'); rect(3, 4, 10, 1, '#d8d8e2'); px(6, 1, '#e0e0ea'); px(10, 2, '#e0e0ea'); }

  return { grid: g, bg: BGS[a.bg] };
}

export function avatarInner(av, bg = true) {
  const { grid, bg: bgc } = avatarGrid(av);
  let rects = '';
  for (let y = 0; y < 16; y++) {
    let x = 0;
    while (x < 16) {
      const c = grid[y][x];
      if (!c) { x++; continue; }
      let w = 1;
      while (x + w < 16 && grid[y][x + w] === c) w++;
      rects += `<rect x="${x}" y="${y}" width="${w}" height="1" fill="${c}"/>`;
      x += w;
    }
  }
  const back = bg ? `<rect width="16" height="16" fill="${bgc}"/>` : '';
  return back + rects;
}

export function avatarSVG(av, { size = 64, bg = true, cls = '' } = {}) {
  return `<svg class="px-avatar ${cls}" viewBox="0 0 16 16" width="${size}" height="${size}" shape-rendering="crispEdges" aria-hidden="true">${avatarInner(av, bg)}</svg>`;
}
export function avatarBg(av) { return avatarGrid(av).bg; }

// Personality tags affect dialogue only. Roles (in characters.js) affect gameplay.
export const TRAITS = ['Funny', 'Intelligent', 'Brave', 'Nervous', 'Kind', 'Reckless', 'Practical', 'Mysterious', 'Nature lover', 'Gamer', 'Sarcastic', 'Loyal', 'Foodie'];
export const ROLE_LIST = ['Medic', 'Engineer', 'Fighter', 'Scout', 'Leader', 'Athlete'];

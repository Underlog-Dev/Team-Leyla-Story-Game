// Character data: creation, validation, export and import. Pure functions.
import { normaliseAvatar, randomAvatar, TRAITS, ROLE_LIST, AVATAR_OPTIONS } from './avatar.js';
import { hashSeed } from './rng.js';

export const MAX_CHARACTERS = 30;
export const MAX_TRAITS = 3;

export function newId() {
  const r = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return 'c_' + r.replace(/-/g, '').slice(0, 16);
}

export function cleanName(n) {
  return String(n || '').replace(/[\u0000-\u001f<>{}]/g, '').replace(/\s+/g, ' ').trim().slice(0, 18);
}

// Older characters had roles mixed into their tags; pick a sensible role for them.
export function guessRole(traits = [], key = '') {
  const map = { Medic: 'Medic', Engineer: 'Engineer', Leader: 'Leader', Brave: 'Fighter', 'Nature lover': 'Scout', Reckless: 'Athlete', Practical: 'Engineer', Intelligent: 'Medic', Gamer: 'Fighter' };
  for (const t of traits) if (map[t]) return map[t];
  return ROLE_LIST[hashSeed(String(key)) % ROLE_LIST.length];
}

export function makeCharacter({ name, avatar, traits = [], role, description = '', id, created } = {}) {
  const cid = id || newId();
  return {
    id: cid,
    name: cleanName(name) || 'Survivor',
    avatar: normaliseAvatar(avatar),
    role: ROLE_LIST.includes(role) ? role : guessRole(traits || [], cid),
    traits: [...new Set((traits || []).filter((t) => TRAITS.includes(t)))].slice(0, MAX_TRAITS),
    description: String(description || '').replace(/[<>{}]/g, '').slice(0, 160),
    created: created || Date.now(),
  };
}

export function validateCharacter(c) {
  if (!c || typeof c !== 'object') return null;
  if (typeof c.name !== 'string' || !cleanName(c.name)) return null;
  const id = typeof c.id === 'string' && /^[A-Za-z0-9_-]{3,40}$/.test(c.id) ? c.id : undefined;
  return makeCharacter({ ...c, id, created: Number(c.created) || Date.now() });
}

const RANDOM_NAMES = ['Alex', 'Sam', 'Jordan', 'Riley', 'Casey', 'Morgan', 'Jamie', 'Taylor', 'Charlie', 'Frankie', 'Robin', 'Kai', 'Nico', 'Remy', 'Sasha', 'Quinn', 'Ellis', 'Billie', 'Drew', 'Harper', 'Max', 'Rowan', 'Toni', 'Jules'];
export function randomCharacter(existingNames = [], rand = Math.random) {
  const free = RANDOM_NAMES.filter((n) => !existingNames.includes(n));
  const name = free.length ? free[Math.floor(rand() * free.length)] : 'Survivor ' + (existingNames.length + 1);
  const pool = TRAITS.slice();
  const tr = [];
  const n = 1 + Math.floor(rand() * 2);
  for (let i = 0; i < n && pool.length; i++) tr.push(pool.splice(Math.floor(rand() * pool.length) % pool.length, 1)[0]);
  const role = ROLE_LIST[Math.floor(rand() * ROLE_LIST.length) % ROLE_LIST.length];
  return makeCharacter({ name, avatar: randomAvatar(rand), traits: tr, role });
}

export function exportLibrary(list) {
  return JSON.stringify({ format: 'team-leyla-survival-characters', version: 1, exported: new Date().toISOString(), characters: list }, null, 2);
}

export function parseImport(text) {
  let data;
  try { data = JSON.parse(text); } catch { return { characters: [], error: 'That file is not a valid character backup (it could not be read as JSON).' }; }
  const arr = Array.isArray(data) ? data : data && Array.isArray(data.characters) ? data.characters : null;
  if (!arr) return { characters: [], error: 'No characters were found in that file.' };
  const characters = arr.map(validateCharacter).filter(Boolean);
  if (!characters.length) return { characters: [], error: 'The file contained no valid characters.' };
  return { characters, skipped: arr.length - characters.length };
}

// mode 'merge': keep existing, add incoming (same id updates in place), cap at MAX.
// mode 'replace': incoming becomes the library (capped).
export function mergeLibrary(existing, incoming, mode = 'merge') {
  if (mode === 'replace') { const list = incoming.slice(0, MAX_CHARACTERS); return { list, added: list.length, dropped: incoming.length - list.length }; }
  const byId = new Map(existing.map((c) => [c.id, c]));
  let added = 0, updated = 0, dropped = 0;
  for (const c of incoming) {
    if (byId.has(c.id)) { byId.set(c.id, { ...c, created: byId.get(c.id).created }); updated++; }
    else if (byId.size < MAX_CHARACTERS) { byId.set(c.id, c); added++; }
    else dropped++;
  }
  return { list: [...byId.values()], added, updated, dropped };
}

// The default Team Leyla crew. Everyone can be edited or deleted in the library.
function av(o) {
  const out = {};
  for (const opt of AVATAR_OPTIONS) {
    const v = o[opt.key];
    if (typeof v === 'string') { let k = 0; while (k < opt.count && opt.name(k) !== v) k++; out[opt.key] = k < opt.count ? k : 0; }
    else out[opt.key] = Number.isInteger(v) ? v : 0;
  }
  return out;
}
const F = (o) => av({ beard: 'None', stache: 'None', ...o });
export const STARTER_CREW = [
  { name: 'Leyla', role: 'Leader', traits: ['Brave', 'Funny'], description: 'The leader and host. Keeps everyone organised. Mostly. Bravo makes it very hard.', avatar: F({ skin: 1, hair: 'Long fringe', hairColour: 'Black', eyes: 'Lashes', eyeColour: 'Brown', mouth: 'Smile', bg: 7 }) },
  { name: 'Bravo', role: 'Fighter', traits: ['Funny', 'Reckless'], description: 'A six-foot talking cartoon cat in a suit. Silly, takes everything literally, and every now and then a surprise hero.', avatar: av({ skin: 'Grey-blue fur', hair: 'Short', hairColour: 'Grey-blue', eyes: 'Normal', eyeColour: 'Green', mouth: 'Smirk', hat: 'Cat ears', hatColour: 'Grey-blue', acc: 'Whiskers', outfit: 'Suit & bow tie', bg: 9 }) },
  { name: 'Chris', role: 'Engineer', traits: ['Intelligent', 'Practical', 'Funny'], description: 'Clever, practical engineer. Can build or fix almost anything. Has opinions about everyone else\'s decisions.', avatar: av({ skin: 1, hair: 'Messy', hairColour: 'Brown going grey', eyes: 'Normal', eyeColour: 'Brown', mouth: 'Smile', beard: 'Short beard', facialColour: 'Dark brown', bg: 1 }) },
  { name: 'Hyrisha', role: 'Athlete', traits: ['Kind', 'Funny'], description: 'Sweet, caring and very fast. Always looking out for everyone. Her hair stays perfect, even in total chaos.', avatar: F({ skin: 1, hair: 'Long wavy', hairColour: 'Brown', eyes: 'Happy', mouth: 'Smile', bg: 8 }) },
  { name: 'Hiwi', role: 'Medic', traits: ['Kind', 'Intelligent'], description: 'The celebrity of the group and a brilliant medic. Will take a selfie at the worst possible moment.', avatar: F({ skin: 9, hair: 'Long', hairColour: 'Black', eyes: 'Lashes', eyeColour: 'Brown', mouth: 'Smile', bg: 11 }) },
  { name: 'Dardan', role: 'Scout', traits: ['Nature lover', 'Practical'], description: 'A farmer who knows animals, plants and the outdoors. Treats every disaster like a normal day on the farm.', avatar: av({ skin: 1, hair: 'Short', hairColour: 'Dark brown', eyes: 'Normal', eyeColour: 'Hazel', mouth: 'Neutral', beard: 'Full beard', facialColour: 'Dark brown', bg: 2 }) },
  { name: 'Sonila', role: 'Scout', traits: ['Kind', 'Brave'], description: 'Kind, brave nail technician and sharp-eyed scout. Looks after everyone, even in total chaos.', avatar: F({ skin: 1, hair: 'Long', hairColour: 'Brown', eyes: 'Lashes', eyeColour: 'Brown', mouth: 'Smirk', bg: 6 }) },
  { name: 'Isma', role: 'Medic', traits: ['Sarcastic', 'Kind', 'Loyal'], description: 'Sarcastic, loyal and suspicious of outsiders. Blocks people on TikTok live for fun. Insists it is Chris\'s birthday.', avatar: F({ skin: 1, hair: 'Bald', eyes: 'Lashes', eyeColour: 'Brown', mouth: 'Smile', hat: 'Headscarf', hatColour: 'Plum', bg: 1 }) },
  { name: 'Doa', role: 'Engineer', traits: ['Kind', 'Intelligent', 'Funny'], description: 'Sweet, clever and funny. Loves baking and can fix almost anything. Brings baking into everything.', avatar: F({ skin: 1, hair: 'Bald', eyes: 'Happy', mouth: 'Grin', hat: 'Headscarf', hatColour: 'Black', bg: 5 }) },
  { name: 'Toddy', role: 'Athlete', traits: ['Funny', 'Reckless'], description: 'Bucket hat on, no plan, full speed. Acts first, thinks later. Far too confident in terrible plans.', avatar: av({ skin: 3, hair: 'Bald', hairColour: 'Dark brown', eyes: 'Normal', eyeColour: 'Brown', mouth: 'Grin', beard: 'Goatee', stache: 'Thin', facialColour: 'Dark brown', hat: 'Bucket hat', hatColour: 'Blue', bg: 10 }) },
  { name: 'Hatice', role: 'Medic', traits: ['Kind', 'Nature lover'], description: 'Lovely, kind and a nature lover. Never goes anywhere without her cat, Kheria. Kheria comes first.', avatar: F({ skin: 1, hair: 'Long', hairColour: 'Black', eyes: 'Lashes', eyeColour: 'Brown', mouth: 'Smile', acc: 'Blush', bg: 4 }) },
  { name: 'Gaza', role: 'Fighter', traits: ['Brave', 'Gamer'], description: 'Thousands of hours of Call of Duty Mobile. Thinks that counts as real combat training. No respawns, Gaza.', avatar: av({ skin: 2, hair: 'Buzz cut', hairColour: 'Black', eyes: 'Angry', eyeColour: 'Brown', mouth: 'Neutral', hat: 'Helmet', acc: 'Face paint', outfit: 'Army', bg: 2 }) },
  { name: 'Loni', role: 'Fighter', traits: ['Brave', 'Reckless'], description: 'Always ready for a fight. His hair goes up when one starts. Volunteers before hearing the plan.', avatar: av({ skin: 1, hair: 'Huge spiky', hairColour: 'Turquoise', eyes: 'Angry', eyeColour: 'Green', mouth: 'Grin', bg: 3 }) },
  { name: 'Ikram', role: 'Scout', traits: ['Mysterious', 'Collector'], description: 'Nobody knows where he came from. Collects Pokémon cards. Knows things he really should not know.', avatar: av({ skin: 4, hair: 'Short', hairColour: 'Black', eyes: 'Normal', mouth: 'Neutral', hat: 'Cap', hatColour: 'Black', acc: 'Silhouette', bg: 10 }) },
];
export function starterCrew(existingNames = []) {
  return STARTER_CREW.filter((c) => !existingNames.includes(c.name)).map((c, i) => makeCharacter({ ...c, id: 'c_starter_' + c.name.toLowerCase().replace(/[^a-z]/g, ''), created: Date.now() + i }));
}

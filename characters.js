// Character data: creation, validation, export and import. Pure functions.
import { normaliseAvatar, randomAvatar, TRAITS, ROLE_LIST } from './avatar.js';
import { hashSeed } from './rng.js';

export const MAX_CHARACTERS = 20;
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

// A ready-made crew for players who just want to jump in.
export const STARTER_CREW = [
  { name: 'Mo', role: 'Medic', traits: ['Kind', 'Nervous'], description: 'Night-shift nurse. Has seen worse. Probably.', avatar: { skin: 6, hair: 3, hairColour: 0, eyes: 0, eyeColour: 0, mouth: 0, beard: 2, stache: 0, facialColour: 0, eyewear: 1, hat: 0, hatColour: 0, acc: 7, bg: 5 } },
  { name: 'Bex', role: 'Engineer', traits: ['Sarcastic', 'Practical'], description: 'Can fix anything with tape and swearing.', avatar: { skin: 1, hair: 8, hairColour: 4, eyes: 7, eyeColour: 2, mouth: 4, beard: 0, stache: 0, facialColour: 4, eyewear: 5, hat: 0, hatColour: 4, acc: 4, bg: 2 } },
  { name: 'Tank', role: 'Fighter', traits: ['Brave', 'Loyal'], description: 'Ex-bouncer. Has a soft spot for dogs.', avatar: { skin: 8, hair: 0, hairColour: 0, eyes: 5, eyeColour: 0, mouth: 1, beard: 2, stache: 0, facialColour: 0, eyewear: 3, hat: 0, hatColour: 3, acc: 2, bg: 3 } },
  { name: 'Skye', role: 'Scout', traits: ['Nature lover', 'Mysterious'], description: 'Always somehow knows the way.', avatar: { skin: 3, hair: 7, hairColour: 5, eyes: 0, eyeColour: 1, mouth: 4, beard: 0, stache: 0, facialColour: 5, eyewear: 0, hat: 8, hatColour: 2, acc: 0, bg: 1 } },
  { name: 'Captain Jo', role: 'Leader', traits: ['Brave', 'Practical'], description: 'Ran a Scout troop for twenty years. Nothing scares her.', avatar: { skin: 0, hair: 6, hairColour: 7, eyes: 5, eyeColour: 4, mouth: 1, beard: 0, stache: 0, facialColour: 7, eyewear: 1, hat: 1, hatColour: 1, acc: 0, bg: 9 } },
  { name: 'Zippy', role: 'Athlete', traits: ['Funny', 'Reckless'], description: 'Marathon runner. Will not stop talking about it.', avatar: { skin: 4, hair: 3, hairColour: 1, eyes: 4, eyeColour: 3, mouth: 2, beard: 0, stache: 0, facialColour: 1, eyewear: 0, hat: 5, hatColour: 0, acc: 5, bg: 11 } },
  { name: 'Dex', role: 'Fighter', traits: ['Gamer', 'Funny'], description: 'Has played every zombie game. Thinks this is one.', avatar: { skin: 2, hair: 11, hairColour: 10, eyes: 7, eyeColour: 5, mouth: 4, beard: 0, stache: 0, facialColour: 1, eyewear: 0, hat: 10, hatColour: 7, acc: 0, bg: 4 } },
  { name: 'Nana Pat', role: 'Medic', traits: ['Kind', 'Foodie'], description: 'Retired midwife. Carries biscuits at all times.', avatar: { skin: 1, hair: 12, hairColour: 8, eyes: 4, eyeColour: 1, mouth: 0, beard: 0, stache: 0, facialColour: 8, eyewear: 1, hat: 0, hatColour: 5, acc: 5, bg: 8 } },
];
export function starterCrew(existingNames = []) {
  return STARTER_CREW.filter((c) => !existingNames.includes(c.name)).map((c, i) => makeCharacter({ ...c, id: 'c_starter_' + c.name.toLowerCase().replace(/[^a-z]/g, ''), created: Date.now() + i }));
}

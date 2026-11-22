// Character data: creation, validation, export and import. Pure functions.
import { normaliseAvatar, randomAvatar, TRAITS } from './avatar.js';

export const MAX_CHARACTERS = 20;
export const MAX_TRAITS = 3;

export function newId() {
  const r = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return 'c_' + r.replace(/-/g, '').slice(0, 16);
}

export function cleanName(n) {
  return String(n || '').replace(/[\u0000-\u001f<>{}]/g, '').replace(/\s+/g, ' ').trim().slice(0, 18);
}

export function makeCharacter({ name, avatar, traits = [], description = '', id, created } = {}) {
  return {
    id: id || newId(),
    name: cleanName(name) || 'Survivor',
    avatar: normaliseAvatar(avatar),
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
  return makeCharacter({ name, avatar: randomAvatar(rand), traits: tr });
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

// Branching story engine. Pure logic: no DOM. All randomness flows through the
// seeded Rng whose state lives in the game state, so saves resume exactly.
import { Rng, hashSeed } from './rng.js';
import { POOL } from './kit.js';
import { initBanter, remember, sceneBanter, griefBanter, reactionBanter, mishapBanter, returnBanter, returnHint } from './banter.js';
import { CHAOS_BY_ID, SITUATION, ZNAMES } from './chaos.js';
import { pickMishap, mishapText, envOf } from './mishaps.js';
import { buildRecap } from './recap.js';
import { canTurn, pickEncounter, encounterText, REACT as RETURN_REACT, MISHAP_CALLBACK, HINTS } from './returners.js';
import { characterOptions, OPTION_BY_ID, personaKey, petOf, signLine, renameText } from './persona.js';
const optionById = (id) => CHAOS_BY_ID[id] || OPTION_BY_ID[id];

export const MAX_HP = 3;
export const MAX_PARTY = 20;

export const ROLES = {
  Medic: 'Healing items heal 1 extra. Can sometimes save someone from dying of their wounds.',
  Engineer: 'Unlocks repair and build options. Fewer injuries from hazards.',
  Fighter: 'When zombies attack, deaths and infections are less likely.',
  Scout: 'Finds items a bit more often when searching.',
  Leader: 'Keeps the group calm: noise builds up more slowly.',
  Athlete: 'Harder to catch: much less likely to be bitten when attacked.',
};

export const DIFFICULTY = {
  easy: { label: 'Easy', danger: 0.85, death: 0.75, item: 1.05, slots: 7, clock: 10, infect: 6, cureFind: 0.24, ambient: 0.04, blurb: 'Enjoy the story. Start with a weapon and some first aid, more time, gentler odds, cures easier to find. People can still die.' },
  medium: { label: 'Medium', danger: 1, death: 1, item: 0.85, slots: 6, clock: 0, infect: 6, cureFind: 0.14, ambient: 0.06, blurb: 'The intended challenge. A few basics to start with.' },
  hard: { label: 'Hard', danger: 1.45, death: 1.9, item: 0.6, slots: 5, clock: -8, infect: 6, cureFind: 0.07, ambient: 0.13, blurb: 'Brutal. An empty backpack, less time, cures are rare. Possible, barely.' },
};
const diffOf = (s) => DIFFICULTY[s.diff] || DIFFICULTY.medium;
export function infectDelay(s) { return diffOf(s).infect; }
const hasRole = (s, role) => alive(s).some((c) => c.role === role);
export const SPECIAL_CATS = new Set(['emergency', 'finale', 'turn', 'timeout', 'chain', 'opening', 'travel']);
const BAD_KINDS = new Set(['hurt', 'danger', 'death', 'infect']);

// ---------- helpers ----------
const evIndex = new WeakMap();
export function eventById(adv, id) {
  let m = evIndex.get(adv);
  if (!m) { m = new Map(adv.events.map((e) => [e.id, e])); evIndex.set(adv, m); }
  return m.get(id);
}
const rngOf = (s) => new Rng(s);
const alive = (s) => s.party.filter((c) => c.alive);
const charById = (s, id) => s.party.find((c) => c.id === id);
const hasTrait = (c, t) => (c.traits || []).includes(t);
const arr = (v) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
export function hpLabel(hp) { return ['Dead', 'Critically injured', 'Injured', 'Healthy'][Math.max(0, Math.min(3, hp))]; }
export function invQty(s, id) { const e = s.inv.find((i) => i.id === id); return e ? e.qty : 0; }
export function hasItem(s, id) { return invQty(s, id) > 0; }
function hasTagItem(s, adv, tag) { return s.inv.some((i) => i.qty > 0 && (adv.items[i.id]?.tags || []).includes(tag)); }

function parseRole(r) {
  // 'a', 'b?', 'a:Funny' (preference), 'a=Medic' (required trait), 't!' (supplied by trigger)
  const m = /^([a-z])(\?|!)?(?:([:=])(.+))?$/.exec(r);
  if (!m) throw new Error('Bad role ' + r);
  return { key: m[1], optional: m[2] === '?', supplied: m[2] === '!', pref: m[3] === ':' ? m[4] : null, req: m[3] === '=' ? m[4] : null };
}

export function progressOf(s, adv) {
  return Math.min(1, s.stage / (adv.targetStages || 32));
}

// ---------- new game ----------
export function newGame(adv, characters, seed, { replay = null, useReplay = true, difficulty = 'medium', today = null } = {}) {
  if (!characters.length) throw new Error('Select at least one character');
  characters = characters.slice(0, MAX_PARTY);
  const s = {
    v: 1, adv: adv.id, seed, rng: hashSeed(seed + ':' + adv.id), stage: 1,
    party: characters.map((c) => ({ id: c.id, name: c.name, avatar: c.avatar, description: c.description || '', role: c.role || null, traits: [...(c.role ? [c.role] : []), ...(c.traits || [])], hp: MAX_HP, alive: true, involve: 0, danger: 0, infected: null, cause: null, diedAt: null })),
    inv: [], flags: {}, npcs: [], loc: adv.zones[0][0], zone: 0, zoneStages: 0, zoneQuota: adv.zoneQuota ? adv.zoneQuota[0][0] : 3,
    diff: DIFFICULTY[difficulty] ? difficulty : 'medium', heat: 0,
    clock: adv.clock.start + (DIFFICULTY[difficulty]?.clock || 0), seen: [], pending: [], cur: null, last: null, lastCat: null, lastEm: null, recentDeaths: [],
    log: { decisions: [], discoveries: [], itemsUsed: [], funny: [], heroic: [], deaths: [], locations: [adv.zones[0][0]] },
    finished: false, ending: null, phase: 'normal', rw: {}, started: Date.now(), npcData: {}, today,
  };
  if (replay && useReplay) s.rw = replayWeights(adv, replay);
  const r = rngOf(s);
  // zone quotas decided by the seed
  s.quotas = adv.zones.map((z, i) => { const q = adv.zoneQuota?.[i] || [3, 5]; return r.range(q[0], q[1]); });
  s.zoneQuota = s.quotas[0];
  initBanter(s, r); s.bt.zname = r.pick(ZNAMES);
  if (replay?.mishaps) s.bt.avoidMishaps = replay.mishaps.slice(0, 30);
  if (replay?.returns) s.bt.avoidReturns = replay.returns.slice(0, 10);
  for (const [id, q] of (adv.startKit?.[s.diff] || [])) { const d = adv.items[id]; if (d) s.inv.push({ id, qty: q || d.qty || 1 }); }
  const opening = r.weighted(adv.events.filter((e) => e.cat === 'opening' && reqOK(s, adv, e.req) && castable(s, e)), (e) => (e.w || 1) * (s.rw[e.id] ?? 1));
  s.pending.push({ id: opening.id });
  nextStage(s, adv, true);
  return s;
}

// ---------- requirements ----------
function reqOK(s, adv, req) {
  if (!req) return true;
  for (const f of arr(req.flags)) if (!s.flags[f]) return false;
  for (const f of arr(req.not)) if (s.flags[f]) return false;
  for (const i of arr(req.items)) if (!hasItem(s, i)) return false;
  for (const i of arr(req.noItems)) if (hasItem(s, i)) return false;
  for (const t of arr(req.tags)) if (!hasTagItem(s, adv, t)) return false;
  if (req.anyItems && !arr(req.anyItems).some((i) => hasItem(s, i) || hasTagItem(s, adv, i))) return false;
  const al = alive(s);
  if (req.minAlive && al.length < req.minAlive) return false;
  if (req.maxAlive && al.length > req.maxAlive) return false;
  if (req.injured && !al.some((c) => c.hp < MAX_HP)) return false;
  if (req.trait && !al.some((c) => hasTrait(c, req.trait))) return false;
  if (req.infected && !al.some((c) => c.infected && !c.infected.resolved)) return false;
  if (req.minClock !== undefined && s.clock < req.minClock) return false;
  if (req.minStage && s.stage < req.minStage) return false;
  if (req.companion && !companionsFor(s, adv, req).length) return false;
  // memories of earlier moments in this game (who did what)
  const M = s.bt?.mem || {};
  const memAlive = (k) => { const m = M[k]; return m && s.party.find((c) => c.id === m.who)?.alive; };
  if (req.mem && !arr(req.mem).every(memAlive)) return false;
  if (req.memOk && !(memAlive(req.memOk) && M[req.memOk].ok)) return false;
  for (const k of arr(req.nomem)) if (M[k]) return false;
  if (req.memAge && !(M[req.memAge[0]] && s.stage - M[req.memAge[0]].stage >= req.memAge[1])) return false;
  if (req.anyInv && !s.inv.some((i) => i.qty > 0)) return false;
  if (req.npcIs) { const d = s.npcData?.[req.npcIs[0]]; if (!s.npcs.includes(req.npcIs[0]) || !d || !arr(req.npcIs[1]).includes(d.loyalty)) return false; }
  return true;
}

// ---------- companions (NPCs who travel with the group) ----------
export function companionsFor(s, adv, req = {}) {
  const want = req.companion === true || req.companion === undefined ? null : arr(req.companion);
  return (s.npcs || []).filter((id) => {
    const look = adv.npcs?.[id]; const d = s.npcData?.[id];
    if (!look || !d) return false;
    if (want && !want.includes(d.loyalty)) return false;
    if (req.companionHuman && look.kind) return false;
    if (req.joinedFor && s.stage - d.joined < req.joinedFor) return false;
    return true;
  });
}
function rollLoyalty(s, adv, id) {
  const look = adv.npcs?.[id] || {};
  const r = rngOf(s).next();
  const t = look.kind ? 0 : look.traitor ?? 0.15;
  const l = look.loyal ?? 0.5;
  return r < t ? 'traitor' : r < t + l ? 'loyal' : 'ordinary';
}
export function npcName(adv, id) { return adv.npcs?.[id]?.name || id; }
function filterLoyalty(s, os, npcId) {
  if (!os.some((o) => o.loyalty)) return os;
  const L = s.npcData?.[npcId]?.loyalty || 'ordinary';
  return os.filter((o) => !o.loyalty || arr(o.loyalty).includes(L));
}

function castable(s, e) {
  const roles = (e.cast || []).map(parseRole);
  const need = roles.filter((r) => !r.optional && !r.supplied);
  const al = alive(s);
  if (need.length > al.length) return false;
  for (const r of need) if (r.req && r.req !== '@infected' && !al.some((c) => hasTrait(c, r.req))) return false;
  return true;
}

// ---------- casting ----------
function castEvent(s, e, given = {}) {
  // try the authored role order first; if that fails, fill required roles first
  const roles = (e.cast || []).map(parseRole);
  return castWith(s, roles, given) || castWith(s, [...roles.filter((x) => !x.optional), ...roles.filter((x) => x.optional)], given);
}

function castWith(s, roles, given) {
  const r = rngOf(s);
  const cast = {};
  const used = new Set();
  for (const [k, id] of Object.entries(given)) { const c = charById(s, id); if (c && c.alive) { cast[k] = id; used.add(id); } }
  for (const role of roles) {
    if (cast[role.key]) continue;
    if (role.supplied) { if (!role.optional) return null; continue; }
    let pool = alive(s).filter((c) => !used.has(c.id));
    if (role.req === '@infected') pool = pool.filter((c) => c.infected && c.infected.resolved !== 'cured');
    else if (role.req) pool = pool.filter((c) => hasTrait(c, role.req));
    if (!pool.length) { if (role.optional) continue; return null; }
    const pick = r.weighted(pool, (c) => (1 / Math.pow(1 + c.involve, 2)) * (role.pref && hasTrait(c, role.pref) ? 5 : 1));
    cast[role.key] = pick.id; used.add(pick.id);
  }
  return cast;
}

// ---------- text ----------
function nameOf(s, id) { const c = charById(s, id); return c ? c.name : 'someone'; }
function pickVariant(s, list) {
  // prefer a variant not yet shown in this game
  s.usedText ||= [];
  const fresh = list.filter((t) => !s.usedText.includes(t.slice(0, 40)));
  const t = rngOf(s).pick(fresh.length ? fresh : list);
  s.usedText.push(t.slice(0, 40));
  if (s.usedText.length > 400) s.usedText.splice(0, 100);
  return t;
}

export function fill(s, adv, text, ctx = {}) {
  if (Array.isArray(text)) text = text.length > 1 ? pickVariant(s, text) : text[0];
  if (!text) return '';
  text = renameText(s, String(text));
  const al = alive(s);
  const W = adv.words || {};
  return String(text).replace(/\{(@?\w+)\}/g, (m, k) => {
    if (ctx.tok && ctx.tok[k] !== undefined && ctx.tok[k] !== '') return String(ctx.tok[k]);
    if (k[0] === '@') return nameOf(s, s.bt?.mem?.[k.slice(1)]?.who);
    if (k === 'z' || k === 'zs' || k === 'goal' || k === 'place' || k === 'critter') return W[k] || k;
    if (k === 'Z' || k === 'Zs') { const w = W[k.toLowerCase()] || 'zombie'; return w[0].toUpperCase() + w.slice(1); }
    if (k === 'zname') return s.bt?.zname || 'Kevin';
    if (k === 'signs') return signLine(s) || 'Nobody actually knows anyone\'s birthday. Suspicious.';
    if (k === 'pet' || k === 'pettype') { const c = charById(s, ctx.cast?.v || ctx.cast?.me || ctx.me); const p = petOf(c || {}); return k === 'pet' ? p.pet : p.type; }
    if (k === 'weapon') { const it = s.inv.find((i) => i.qty > 0 && (adv.items[i.id]?.tags || []).some((t) => t === 'melee' || t === 'gun')); return it ? adv.items[it.id].name.toUpperCase() : 'BIG STICK'; }
    if (k === 'snack') { const id = ctx.cast?.me || ctx.cast?.b || ctx.cast?.a; return s.bt?.snack?.[id] || 'biscuits'; }
    if (k === 'team') return al.length === 1 ? al[0].name : 'the group';
    if (k === 'Team') return al.length === 1 ? al[0].name : 'The group';
    if (k === 'loc') return adv.locations[s.loc]?.name || '';
    if (k === 'loot' || k === 'item') return ctx.itemName || 'something useful';
    if (k === 'dead') return ctx.dead || 'them';
    if (k === 'clock') return formatClock(adv, s.clock);
    if (k === 'npc') return ctx.npc || 'the stranger';
    if (k === 'survivors' && ctx.survivors) return ctx.survivors;
    if (k === 'fallen' && ctx.fallen) return ctx.fallen;
    if (k === 'r' && ctx.cast && !ctx.cast.r && ctx.resolving) pickTarget(s, 'r', ctx);
    const id = (ctx.cast || {})[k] || (k === 'me' ? ctx.me : k === 'other' ? ctx.other : null);
    if (id) return nameOf(s, id);
    return al.length ? al[0].name : 'someone';
  });
}

export function formatClock(adv, units) {
  const u = Math.max(0, units);
  const mins = u * (adv.clock.unit || 15);
  const h = Math.floor(mins / 60), m = mins % 60;
  return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
}

// ---------- probabilities ----------
export const MAX_HEAT = 8;
export function dangerScale(s, adv) {
  let f = 0.8 + 0.45 * progressOf(s, adv) + 0.09 * Math.min(MAX_HEAT, s.heat || 0);
  const n = alive(s).length;
  if (n === 1) f *= 0.75; // a lone survivor is harder to spot
  if (n > 6) f *= 1 + SIZE_DANGER * (n - 6); // a big crowd is loud and hard to keep safe
  return f;
}
// How many extra people a single accident or attack can reach in a big group
export const SIZE_DANGER = 0.05, SIZE_EM = 0.07;
export function spread(s) { const n = alive(s).length; return { hurt: Math.max(0, (n - 2) * 0.32), em: Math.max(0, (n - 3) * 0.15) + Math.max(0, n - 6) * SIZE_EM }; }

export function effectiveOutcomes(s, adv, outcomes, ev) {
  const os = outcomes.map((o) => ({ ...o }));
  const D = diffOf(s);
  const fixed = ev && (ev.cat === 'finale' || ev.cat === 'timeout' || ev.cat === 'turn' || ev.noScale);
  // per-kind multipliers from difficulty, noise and the team's roles
  const base = fixed ? 0.75 + 0.25 * D.danger : dangerScale(s, adv) * D.danger;
  const m = { hurt: base, danger: base, infect: base, death: base * D.death };
  const em = ev && ev.cat === 'emergency';
  if (em && hasRole(s, 'Fighter')) { m.death *= 0.65; m.infect *= 0.65; m.hurt *= 0.85; }
  if (em) { const t = charById(s, s.cur?.cast?.t || ''); if (t && t.alive && t.role === 'Athlete') m.death *= 0.5; }
  if (ev && ev.cat === 'hazard' && hasRole(s, 'Engineer')) m.hurt *= 0.75;
  let itemMul = D.item * (hasRole(s, 'Scout') ? 1.15 : 1);
  const T = os.reduce((a, o) => a + o.p, 0);
  for (const o of os) { if (BAD_KINDS.has(o.k)) o.p *= m[o.k]; else if (o.k === 'item') o.p *= itemMul; }
  // renormalise: keep the bad share (capped), share the rest among the good outcomes
  const B0 = outcomes.filter((o) => BAD_KINDS.has(o.k)).reduce((a, o) => a + o.p, 0);
  let B = os.filter((o) => BAD_KINDS.has(o.k)).reduce((a, o) => a + o.p, 0);
  const G = os.filter((o) => !BAD_KINDS.has(o.k)).reduce((a, o) => a + o.p, 0);
  if (B > T * 0.92) { const k = (T * 0.92) / B; for (const o of os) if (BAD_KINDS.has(o.k)) o.p *= k; B = T * 0.92; }
  if (G > 0) { const k = (T - B) / G; for (const o of os) if (!BAD_KINDS.has(o.k)) o.p *= k; }
  else if (B > 0) { const k = T / B; for (const o of os) o.p *= k; }
  void B0;
  if (fixed) return os;
  // ambient danger: no path is ever completely safe, and it grows over the story
  if (!em && ev && ev.cat !== 'chain') {
    const amb = (D.ambient || 0) * (0.6 + 0.8 * progressOf(s, adv)) * (hasRole(s, 'Leader') ? 0.8 : 1);
    if (amb > 0) {
      const tot = os.reduce((a, o) => a + o.p, 0);
      for (const o of os) o.p *= (tot - amb * tot) / tot;
      os.push({ p: amb * tot, k: 'danger', t: POOL.danger, fx: [['em', 'r']], ambient: true });
    }
  }
  // grace period: outright deaths are much rarer in the opening stages
  if (s.stage <= (adv.graceStages ?? 6)) {
    let moved = 0;
    for (const o of os) if (o.k === 'death') { const np = o.p * 0.35; moved += o.p - np; o.p = np; }
    const hurt = os.find((o) => o.k === 'hurt') || os.find((o) => o.k === 'good' || o.k === 'neutral');
    if (hurt) hurt.p += moved;
  }
  return os;
}

export function riskSummary(os, adv) {
  const T = os.reduce((a, o) => a + o.p, 0) || 1;
  const sum = (k) => os.filter((o) => o.k === k).reduce((a, o) => a + o.p, 0) / T;
  const out = [];
  const item = sum('item'), hurt = sum('hurt'), danger = sum('danger'), death = sum('death'), infect = sum('infect');
  const pct = (v) => Math.round(v * 100);
  if (pct(item)) out.push({ k: 'item', label: `${pct(item)}% item`, p: item });
  if (pct(hurt)) out.push({ k: 'hurt', label: `${pct(hurt)}% injury`, p: hurt });
  if (pct(danger)) out.push({ k: 'danger', label: `${pct(danger)}% danger`, p: danger });
  if (pct(infect)) out.push({ k: 'infect', label: `${pct(infect)}% infection`, p: infect });
  if (pct(death)) out.push({ k: 'death', label: `${pct(death)}% fatal`, p: death });
  // time: what this option usually costs (or saves) on top of the normal 10 minutes
  if (adv) {
    const t = os.reduce((a, o) => a + o.p * (o.fx || []).filter((f) => f[0] === 'time').reduce((x, f) => x + f[1], 0), 0) / T;
    const mins = Math.round((Math.abs(t) * (adv.clock?.unit || 10)) / 5) * 5;
    if (mins >= 5) out.push({ k: 'time', label: t < 0 ? `⏱ +${mins} min extra` : `⏱ saves ${mins} min`, p: 0 });
  }
  return out;
}

// ---------- stage flow ----------
function pickChoices(s, adv, e, cast = {}) {
  const idx = [];
  const cond = [], base = [];
  e.choices.forEach((c, i) => { if (!reqOK(s, adv, c.req)) return; if (c.req?.infected && !cast.t) return; (c.req ? cond : base).push(i); });
  const chosen = cond.slice(0, e.maxCond ?? 2);
  for (const i of base) { if (chosen.length >= 5) break; chosen.push(i); }
  chosen.sort((a, b) => a - b);
  idx.push(...chosen);
  return idx;
}

// Options that move the story along (endings, chains, companions) are never swapped out.
const STORY_FX = new Set(['flag', 'next', 'later', 'npc', 'end', 'cure', 'npcleave']);
// Sometimes one normal option is swapped for a ridiculous one.
function pickChaos(s, adv, e, cast, ci) {
  const sit = SITUATION[e.cat];
  if (!sit || !adv.chaos || e.companion || e.fewChoices || ci.length < 5 || s.stage <= 1 || e.id.includes('_cx_')) return null;
  if (e.choices.some((c) => c.o.some((o) => o.loyalty))) return null;
  const r = rngOf(s);
  let rate = sit === 'em' ? 0.3 : 0.42;
  if (s.stage - (s.bt.lastChaos ?? -9) <= 1) rate *= 0.4;
  if (!r.chance(rate)) return null;
  const al = alive(s);
  const sceneSeen = (x) => x.o.some((o) => (o.fx || []).some((f) => f[0] === 'nextcx' && (s.seen.includes(`${adv.id}_cx_ch_${f[1]}`) || s.pending.some((p) => p.id === `${adv.id}_cx_ch_${f[1]}`))));
  const fits = (x) => (!x.env || x.env.includes(envOf(adv))) && (x.sits.includes(sit) || (e.cat === 'humour' && x.sits.includes('people'))) && reqOK(s, adv, x.req) && (sit !== 'em' || cast.t) && !sceneSeen(x);
  s.bt.copt ||= {};
  const pool = [
    ...adv.chaos.filter((x) => fits(x) && (!x.notT || al.length >= 2)).map((x) => ({ x, who: null })),
    // decisions tied to a specific, living character (and not too often for the same person)
    ...characterOptions(s).filter(({ x, who }) => fits(x) && !(x.notT && who === cast.t) && s.stage - (s.bt.copt[who] ?? -9) >= 4),
  ];
  const words = (t) => String(t).toLowerCase().replace(/\{\w+\}/g, '').match(/[a-z]{4,}/g) || [];
  const have = ci.map((i) => new Set(words(e.choices[i].l)));
  const pool2 = pool.filter(({ x }) => { const w = words(x.l); return !have.some((h) => w.filter((k) => h.has(k)).length >= Math.max(2, Math.ceil(w.length * 0.6))); });
  if (!pool2.length) return null;
  const { x, who } = r.weighted(pool2, ({ x, who }) => (who ? 1.4 : x.w || 1) / (1 + 3 * (s.bt.chaosSeen[x.id] || 0)));
  // the volunteer is named on the option, so chat knows who they are sending
  if (who) { cast.v = who; s.bt.copt[who] = s.stage; }
  else {
    const cands = al.filter((c) => !(x.notT && c.id === cast.t));
    if (!cands.length) return null;
    cast.v = r.weighted(cands, (c) => (1 / (1 + c.involve * 0.5)) * ((x.vpref || []).some((t) => hasTrait(c, t)) ? 4 : 1) * ((x.vpersona || []).includes(personaKey(c)) ? 8 : 1)).id;
  }
  // replace one option, but never the safest one
  let slot;
  if (e.cat === 'travel') slot = ci.length - 1;
  else {
    const bad = ci.map((i) => { const c = e.choices[i]; if (c.req || c.o.some((o) => (o.fx || []).some((f) => STORY_FX.has(f[0])))) return -1; const os = effectiveOutcomes(s, adv, c.o, e); const T = os.reduce((a, o) => a + o.p, 0) || 1; return os.filter((o) => BAD_KINDS.has(o.k)).reduce((a, o) => a + o.p, 0) / T; });
    const safest = bad.indexOf(Math.min(...bad.filter((b) => b >= 0)));
    const opts = bad.map((b, k) => k).filter((k) => bad[k] >= 0 && k !== safest);
    if (!opts.length) return null;
    slot = r.pick(opts);
  }
  s.bt.chaosSeen[x.id] = (s.bt.chaosSeen[x.id] || 0) + 1;
  s.bt.lastChaos = s.stage;
  return { x, slot };
}

function renderEvent(s, adv, e, cast) {
  const r = rngOf(s);
  // trait-specific choice performer
  for (const c of [...e.choices, { req: e.req }]) {
    if (c.req?.trait && !cast.x) {
      const cands = alive(s).filter((ch) => hasTrait(ch, c.req.trait));
      if (cands.length) cast.x = (cands.find((ch) => Object.values(cast).includes(ch.id)) || r.pick(cands)).id;
    }
  }
  for (const id of Object.values(cast)) { const c = charById(s, id); if (c) c.involve++; }
  let npcId = null;
  const usesNpc = e.companion || e.choices.some((c) => c.req?.companion || c.o.some((o) => o.loyalty));
  if (usesNpc) { const req = e.req?.companion ? e.req : (e.choices.find((c) => c.req?.companion)?.req || {}); const pool = companionsFor(s, adv, req); if (pool.length) npcId = r.pick(pool); }
  if (!s.bt) { initBanter(s, r); s.bt.zname = r.pick(ZNAMES); }
  const ctx = { cast, npc: npcId ? npcName(adv, npcId) : undefined };
  const text = fill(s, adv, e.text, ctx);
  const say = [];
  for (const line of e.say || []) {
    const [role, t, trait] = line;
    const id = cast[role];
    if (!id) continue;
    const c = charById(s, id);
    if (!c || !c.alive) continue;
    if (trait && !hasTrait(c, trait)) continue;
    say.push({ who: id, text: fill(s, adv, t, ctx) });
  }
  // reactions to deaths in the previous stage: serious, no jokes
  let react = '';
  const H = { alive, fill, r };
  if (s.recentDeaths.length) {
    const al = alive(s);
    if (al.length) {
      const sp = r.weighted(al, (c) => (hasTrait(c, 'Kind') || hasTrait(c, 'Loyal') ? 3 : 1));
      const dead = s.recentDeaths.map((id) => nameOf(s, id)).join(' and ');
      react = fill(s, adv, adv.deathLines || ['{me} goes quiet. Nobody says {dead}\'s name, but everyone is thinking it.'], { me: sp.id, dead });
      say.push(...griefBanter(s, adv, H, dead));
    }
    s.recentDeaths = [];
  } else {
    // banter between the survivors: conversations, running jokes, callbacks
    say.push(...sceneBanter(s, adv, H, e, { hasSay: say.length > 0 }));
  }
  // now and then, a hint that a lost teammate is still out there
  if (s.bt) say.push(...returnHint(s, adv, H, returnable(s)));
  const ci = pickChoices(s, adv, e, cast);
  const chaos = pickChaos(s, adv, e, cast, ci);
  const choices = ci.map((i) => {
    const c = e.choices[i];
    const os = effectiveOutcomes(s, adv, c.o, e);
    const trust = c.o.some((o) => o.loyalty);
    const sp = spread(s);
    const tag = (rk) => rk.map((x) => (x.k === 'hurt' && sp.hurt >= 0.5 ? { ...x, label: x.label + ' (several)' } : x.k === 'danger' && sp.em >= 0.5 ? { ...x, label: x.label + ' (more may come)' } : x));
    return { i, label: fill(s, adv, c.l, ctx), desc: fill(s, adv, c.d, ctx), risk: c.hideRisk ? [] : trust ? [{ k: 'trust', label: '❓ depends who you trust', p: 0 }] : tag(riskSummary(os, adv)), special: !!c.badge || !!(c.req && (c.req.items || c.req.tags || c.req.anyItems || c.req.trait || c.req.flags || c.req.infected || c.req.companion || c.req.mem)) };
  });
  if (chaos) {
    const os = effectiveOutcomes(s, adv, chaos.x.o, e);
    const sp = spread(s);
    const spreads = chaos.x.o.some((o) => (o.fx || []).some((f) => f[0] === 'hurt' && f[1] === 'r'));
    const rk = riskSummary(os, adv).map((x) => (x.k === 'hurt' && spreads && sp.hurt >= 0.5 ? { ...x, label: x.label + ' (several)' } : x));
    const scene = chaos.x.o.some((o) => (o.fx || []).some((f) => f[0] === 'nextcx'));
    if (scene) rk.push({ k: 'scene', label: '🎬 opens a scene', p: 0 });
    choices[chaos.slot] = { i: -1, chaos: chaos.x.id, tag: chaos.x.tag || 'chaos', who: cast.v, label: fill(s, adv, chaos.x.l, ctx), desc: fill(s, adv, chaos.x.d, ctx), risk: rk, special: false };
  }
  const loc = adv.locations[s.loc];
  const sc = e.scene || {};
  s.cur = {
    npc: npcId,
    id: e.id, cat: e.cat, title: fill(s, adv, e.title || loc?.name || '', ctx), cast, text, say, react, choices,
    scene: { bg: sc.bg || loc?.scene || 'street', z: sc.z ?? (e.cat === 'emergency' ? 2 : 0), light: sc.light || loc?.light || null, props: sc.props || null, cast: [...new Set(Object.values(cast))].filter((id) => charById(s, id)?.alive), npcs: [...new Set([...(e.npc || []), ...s.npcs])].filter((id) => adv.npcs?.[id]).slice(0, 3).map((id) => ({ id, ...adv.npcs[id] })) },
    travel: e.cat === 'travel' ? e._travel : null,
  };
}

function travelEvent(s, adv) {
  const nextZone = adv.zones[s.zone + 1];
  const here = adv.locations[s.loc];
  const choices = nextZone.map((lid) => {
    const L = adv.locations[lid];
    const t = L.travel;
    const o = t.o || adv.travelOutcomes[t.risk || 'med'];
    return { l: t.l, d: t.d, o: o.map((x) => ({ ...x, fx: [...(x.fx || []), ['move', lid], ['time', t.time ?? { low: -2, med: -1, high: 0 }[t.risk || 'med']]] })) };
  });
  choices.push({ l: adv.restChoice.l, d: adv.restChoice.d, o: adv.restChoice.o.map((x) => ({ ...x, fx: [...(x.fx || []), ['rest']] })) });
  choices.push({ l: adv.scavengeChoice.l, d: adv.scavengeChoice.d, o: adv.scavengeChoice.o.map((x) => ({ ...x, fx: [...(x.fx || []), ['scavenge']] })) });
  return { id: '_travel_' + s.zone, cat: 'travel', title: 'On the move', text: adv.travelText, cast: ['a'], say: adv.travelSay || [], choices, scene: { bg: here.scene }, _travel: true };
}

function chooseNextEvent(s, adv) {
  const r = rngOf(s);
  // infection turning
  const inf = alive(s).find((c) => c.infected && (c.infected.resolved === false || c.infected.resolved === 'restrained') && s.stage >= c.infected.at + infectDelay(s));
  if (inf) {
    if (alive(s).length === 1) { die(s, inf, 'turned into one of the infected', { deaths: [], adv }); s.flags._end = true; return { e: eventById(adv, adv.fillerEvent), given: {} }; }
    s.pending = s.pending.filter((p) => !(p.id === adv.revealEvent && p.cast?.t === inf.id));
    return { e: eventById(adv, adv.turnEvent), given: { t: inf.id } };
  }
  if (s.phase === 'normal' && s.stage >= (adv.maxStages || 40) - adv.finale.length + 1) s.pending = s.pending.filter((p) => eventById(adv, p.id)?.cat === 'turn');
  while (s.pending.length) {
    const p = s.pending.shift();
    const e = eventById(adv, p.id);
    if (!e) continue;
    if (e.req && !reqOK(s, adv, e.req) && e.cat !== 'finale') continue;
    if (e.id === adv.revealEvent) { const t = charById(s, p.cast?.t); if (!t || !t.alive || !t.infected || t.infected.resolved) continue; }
    return { e, given: p.cast || {} };
  }
  if (s.clock <= 0 && !s.flags._timeout && adv.timeoutEvent) { s.flags._timeout = true; s.phase = 'timeout'; return { e: eventById(adv, adv.timeoutEvent), given: {} }; }
  const last = s.zone >= adv.zones.length - 1;
  if (s.zoneStages >= s.zoneQuota) {
    if (last || s.stage >= (adv.maxStages || 40) - adv.finale.length) {
      s.phase = 'finale';
      s.loc = adv.finaleLoc; s.log.locations.push(adv.finaleLoc);
      const [first, ...rest] = adv.finale;
      s.pending.push(...rest.map((id) => ({ id })));
      return { e: eventById(adv, first), given: {} };
    }
    const tv = travelEvent(s, adv);
    return { e: tv, given: {} };
  }
  if (s.phase === 'normal' && s.stage >= (adv.maxStages || 40) - adv.finale.length) { s.zoneStages = s.zoneQuota; s.zone = adv.zones.length - 1; return chooseNextEvent(s, adv); }
  const prog = progressOf(s, adv);
  const pool = eligibleEvents(s, adv);
  if (!pool.length) return { e: eventById(adv, adv.fillerEvent), given: {} };
  const e = r.weighted(pool, (e) => {
    let w = e.w || 1;
    if (e.loc !== '*') w *= 2.6;
    if (e.req && (e.req.flags || e.req.items || e.req.anyItems)) w *= 1.8; // payoffs of earlier decisions
    w *= s.rw[e.id] ?? 1;
    if (e.cat === s.lastCat) w *= 0.45;
    if (e.cat === 'humour' && s.lastCat === 'humour') w *= 0.3;
    if (e.cat === 'zombie' || e.cat === 'hazard') w *= 0.6 + prog;
    if (e.cat === 'humour' || e.cat === 'interaction') w *= 1.15 - prog * 0.4;
    return w;
  });
  return { e, given: {} };
}

export function eligibleEvents(s, adv) {
  return adv.events.filter((e) => !SPECIAL_CATS.has(e.cat)
    && (e.loc === '*' || arr(e.loc).includes(s.loc))
    && (!e.stage || (s.stage >= e.stage[0] && s.stage <= e.stage[1]))
    && (e.repeat || !s.seen.includes(e.id))
    && reqOK(s, adv, e.req) && castable(s, e));
}
export { reqOK };

function nextStage(s, adv, first = false) {
  if (!first) {
    s.stage++;
  }
  if (!alive(s).length) return finish(s, adv);
  if (s.flags._end) return finish(s, adv);
  for (let guard = 0; guard < 20; guard++) {
    const { e, given } = chooseNextEvent(s, adv);
    if (s.flags._end || !alive(s).length) return finish(s, adv);
    const cast = castEvent(s, e, given);
    if (!cast) { if (e.cat === 'finale') return finish(s, adv); continue; }
    if (!e._travel) s.seen.push(e.id);
    s.lastCat = e.cat;
    renderEvent(s, adv, e, cast);
    if (e.cat === 'travel' || e._travel) s.cur.travelDef = e.choices.map((c) => c);
    return s;
  }
  // should never happen; fall back to filler
  const f = eventById(adv, adv.fillerEvent);
  renderEvent(s, adv, f, castEvent(s, f, {}) || {});
  return s;
}

function currentEventDef(s, adv) {
  if (s.cur.cat === 'travel') return { id: s.cur.id, cat: 'travel', choices: s.cur.travelDef };
  return eventById(adv, s.cur.id);
}

// ---------- effects ----------
function pickTarget(s, who, ctx) {
  if (who === 'r') {
    if (ctx.r && charById(s, ctx.r)?.alive) return [charById(s, ctx.r)];
    const al = alive(s);
    if (!al.length) return [];
    const c = rngOf(s).weighted(al, (c) => 1 / Math.pow(1 + c.danger, 2));
    ctx.r = c.id; ctx.cast.r = c.id;
    return [c];
  }
  if (who === 'all') return alive(s);
  if (who && who[0] === '%') { const c = alive(s).find((c) => personaKey(c) === who.slice(1)); return c ? [c] : []; }
  if (who && who[0] === '@') { const m = s.bt?.mem?.[who.slice(1)]; const c = m && charById(s, m.who); return c && c.alive ? [c] : pickTarget(s, 'r', ctx); }
  if (who === 'injured') { const inj = alive(s).filter((c) => c.hp < MAX_HP).sort((a, b) => a.hp - b.hp); return inj.slice(0, 1); }
  const id = ctx.cast[who];
  const c = id && charById(s, id);
  return c && c.alive ? [c] : [];
}

function die(s, c, cause, ctx) {
  if (!c.alive) return;
  c.alive = false; c.hp = 0; c.cause = cause || 'succumbed to their injuries'; c.diedAt = s.stage;
  c.diedLoc = s.loc; c.turnable = canTurn(c.cause);
  s.log.deaths.push({ id: c.id, name: c.name, cause: c.cause, stage: s.stage, loc: adv_locName(s, ctx), turnable: c.turnable });
  s.recentDeaths.push(c.id);
  ctx.deaths.push(c.id);
}
function adv_locName(s, ctx) { return ctx.adv?.locations[s.loc]?.name || ''; }

export function packSlots(s) { return (DIFFICULTY[s.diff] || DIFFICULTY.medium).slots || 6; }
function addItem(s, adv, id, qty, ctx) {
  const d = adv.items[id];
  if (!d) return false;
  const e = s.inv.find((i) => i.id === id);
  // the backpack only has so many slots: a new kind of item needs a free one
  if (!e && s.inv.length >= packSlots(s) && ctx.resolving && id !== adv.cureItem) { ctx.leftBehind = (ctx.leftBehind || []).concat(d.name); ctx.itemName = d.name; return true; }
  const q = qty || d.qty || 1;
  if (e) { if (d.unique) return false; e.qty = Math.min(d.max || 99, e.qty + q); }
  else s.inv.push({ id, qty: q });
  s.log.discoveries.push({ stage: s.stage, item: id, name: d.name });
  ctx.itemName = d.name;
  ctx.gained.push(id);
  return true;
}

function lootFor(s, adv, ctx) {
  const r = rngOf(s);
  const L = adv.locations[s.loc];
  const table = (L && L.loot) || adv.defaultLoot;
  const cands = table.filter((id) => { const d = adv.items[id]; if (!d) return false; const q = invQty(s, id); return !(d.unique && q > 0) && q < (d.max || 99); });
  const id = cands.length ? r.pick(cands) : r.pick(adv.defaultLoot);
  // finds are single items: stacks only come from special places
  const q = Math.min(adv.items[id]?.qty || 1, adv.items[id]?.tags?.includes('gun') ? 2 : 1);
  if (!addItem(s, adv, id, q, ctx)) { addItem(s, adv, adv.defaultLoot[0], 1, ctx); }
}

function consume(s, id, n = 1) {
  const e = s.inv.find((i) => i.id === id);
  if (!e) return;
  e.qty -= n;
  if (e.qty <= 0) s.inv = s.inv.filter((i) => i !== e);
}

function moveTo(s, lid) { s.loc = lid; s.zone++; s.zoneStages = -1; s.zoneQuota = s.quotas[s.zone]; s.log.locations.push(lid); }

function applyFx(s, adv, fx, ctx) {
  const r = rngOf(s);
  for (const f of fx || []) {
    const [op, a1, a2, a3] = f;
    switch (op) {
      case 'loot': lootFor(s, adv, ctx); break;
      case 'item': addItem(s, adv, a1, a2, ctx); break;
      case 'use': if (a1 === 'tag') { const it = s.inv.find((i) => (adv.items[i.id]?.tags || []).includes(a2)); if (it) { s.log.itemsUsed.push({ stage: s.stage, item: it.id, name: adv.items[it.id].name }); consume(s, it.id, 1); } } else if (hasItem(s, a1)) { s.log.itemsUsed.push({ stage: s.stage, item: a1, name: adv.items[a1].name }); consume(s, a1, a2 || 1); } break;
      case 'lose': { if (s.inv.length) { const it = r.pick(s.inv); ctx.itemName = adv.items[it.id].name; consume(s, it.id, it.qty); ctx.lost.push(it.id); } break; }
      case 'hurt': {
        const targets = pickTarget(s, a1, ctx);
        if (a1 === 'r' && targets.length) {
          const x = spread(s).hurt; let extra = Math.floor(x) + (r.chance(x % 1) ? 1 : 0);
          const others = r.shuffle(alive(s).filter((c) => c !== targets[0]));
          while (extra-- > 0 && others.length) { const o = others.pop(); targets.push(o); ctx.extraHurt.push(o.id); }
        }
        for (const c of targets) {
          c.hp -= a2 || 1; c.danger++; ctx.hurt.push(c.id);
          if (c.hp <= 0) {
            const medic = alive(s).find((x) => x.role === 'Medic' && x !== c);
            if (medic && r.chance(0.45)) { c.hp = 1; ctx.saved = (ctx.saved || []).concat(`${medic.name} keeps ${c.name} alive with some desperate first aid.`); }
            else die(s, c, a3 || 'succumbed to their injuries', ctx);
          }
        }
        break;
      }
      case 'heal': for (const c of pickTarget(s, a1 || 'injured', ctx)) { c.hp = Math.min(MAX_HP, c.hp + (a2 || 1)); ctx.healed.push(c.id); } break;
      case 'bite': for (const c of pickTarget(s, a1, ctx)) die(s, c, 'bitten by the infected', ctx); break;
      case 'kill': for (const c of pickTarget(s, a1, ctx)) { if (a3 === 'hero') { s.flags.sacrifice = true; s.log.heroic.push({ stage: s.stage, text: `${c.name} ${a2}` }); } die(s, c, a2, ctx); } break;
      case 'infect': for (const c of pickTarget(s, a1, ctx)) { if (!c.infected) { c.infected = { at: s.stage, resolved: false }; c.danger++; if (adv.revealEvent) s.pending.push({ id: adv.revealEvent, cast: { t: c.id } }); } } break;
      case 'restrain': for (const c of pickTarget(s, a1, ctx)) if (c.infected && !c.infected.resolved) c.infected.resolved = 'restrained'; break;
      case 'useany': { const it = s.inv.find((i) => (adv.items[i.id]?.tags || []).some((t) => arr(a1).includes(t))); if (it) { s.log.itemsUsed.push({ stage: s.stage, item: it.id, name: adv.items[it.id].name }); consume(s, it.id, 1); } break; }
      case 'cure': for (const c of alive(s)) { if (c.infected && c.infected.resolved !== 'cured') c.infected = { ...c.infected, resolved: 'cured' }; } break;
      case 'conceal': break;
      case 'em': {
        const tgt = pickTarget(s, a1 || 'r', ctx)[0];
        if (tgt) {
          const opts = adv.emergencies.filter((id) => id !== s.lastEm); const id = r.pick(opts.length ? opts : adv.emergencies); s.lastEm = id; tgt.danger++; s.pending.unshift({ id, cast: { t: tgt.id } }); ctx.danger = true;
          // in a big group, more of them come
          const x = spread(s).em; let extra = Math.floor(x) + (r.chance(x % 1) ? 1 : 0);
          const others = r.shuffle(alive(s).filter((c) => c !== tgt));
          while (extra-- > 0 && others.length) { const o = others.pop(); const id2 = r.pick(adv.emergencies); s.pending.splice(1, 0, { id: id2, cast: { t: o.id } }); ctx.wave = (ctx.wave || 0) + 1; }
        }
        break;
      }
      case 'next': s.pending.unshift({ id: a1, cast: { ...ctx.cast } }); break;
      case 'nextcx': s.pending.unshift({ id: `${adv.id}_cx_ch_${a1}`, cast: { ...ctx.cast } }); break;
      case 'later': s.pending.push({ id: a1, cast: { ...ctx.cast } }); break;
      case 'flag': s.flags[a1] = a2 === undefined ? true : a2; break;
      case 'unflag': delete s.flags[a1]; break;
      case 'npc': if (!s.npcs.includes(a1)) { s.npcs.push(a1); s.npcData ||= {}; if (!s.npcData[a1]) s.npcData[a1] = { loyalty: rollLoyalty(s, adv, a1), joined: s.stage }; else s.npcData[a1].joined = s.stage; } s.flags['npc_' + a1] = true; break;
      case 'npcleave': { const id = a1 || ctx.npcId; if (id) { s.npcs = s.npcs.filter((n) => n !== id); delete s.flags['npc_' + id]; if (s.npcData?.[id]) { s.npcData[id].left = s.stage; s.npcData[id].revealed = a2 || s.npcData[id].revealed; } } break; }
      case 'npcsteal': { for (let k = 0; k < (a1 || 1) && s.inv.length; k++) { const it = r.pick(s.inv); ctx.lost.push(it.id); consume(s, it.id, it.qty); } break; }
      case 'npcdie': { const id = ctx.npcId; if (id) { s.npcs = s.npcs.filter((n) => n !== id); delete s.flags['npc_' + id]; if (s.npcData?.[id]) { s.npcData[id].died = s.stage; s.npcData[id].cause = a1; } s.log.heroic.push({ stage: s.stage, text: `${npcName(adv, id)} ${a1}` }); } break; }
      case 'reveal': { const id = ctx.npcId; if (id && s.npcData?.[id]) s.npcData[id].revealed = true; break; }
      case 'npcgone': s.npcs = s.npcs.filter((n) => n !== a1); delete s.flags['npc_' + a1]; break;
      case 'time': s.clock += a1; break;
      case 'move': moveTo(s, a1); break;
      case 'moveRandom': { const z = adv.zones[s.zone + 1]; if (z && z.length) moveTo(s, r.pick(z)); break; }
      case 'mem': { // ['mem', key, who, ok]
        const c = a2 && a2[0] === '@' ? charById(s, s.bt?.mem?.[a2.slice(1)]?.who) : a2 && a2[0] === '%' ? pickTarget(s, a2, ctx)[0] : pickTarget(s, a2 || 'r', ctx)[0];
        if (c) remember(s, a1, c.id, a3 === undefined ? true : !!a3);
        break;
      }
      case 'rest': s.zoneStages = s.zoneQuota - 1; break;
      case 'scavenge': s.zoneStages = s.zoneQuota - 2; break;
      case 'shortcut': s.zoneStages += a1 || 1; break;
      case 'funny': ctx.funny = true; break;
      case 'hero': ctx.hero = true; break;
      case 'end': s.flags._end = true; break;
      default: throw new Error('Unknown effect ' + op);
    }
  }
}

// ---------- ridiculous accidents ----------
// Rarely, an injury or death that a decision ALREADY caused turns out to have a
// ridiculous cause. Only single-person injuries in ordinary scenes qualify, never
// story moments (sacrifices, finales, betrayals) and never someone who was fine.
const MISHAP_OK_FX = new Set(['hurt', 'bite', 'kill', 'time', 'em', 'lose', 'use', 'useany', 'funny', 'mem', 'move', 'moveRandom', 'shortcut', 'rest', 'scavenge']);
export const MISHAP_RATE = { hurt: 0.08, death: 0.05, max: 3, maxDeaths: 1, gap: 4 };
const FLEE_WORDS = /run|flee|escape|sprint|dash|bolt|leg it|get out|climb|jump|hide|door|back off|retreat|rush|charge|go for it|race|chase/i;
// ---------- returning dead ----------
// A teammate who died earlier in this story may come back as one of the infected
// and be the one behind an injury or death that a decision ALREADY caused.
export const RETURN_RATE = { chance: 0.12, wait: 5, gap: 3, max: 3, times: 2, putDown: 0.6 };
function accidentVictim(s, ev, o, ctx, { allowFinale = false } = {}) {
  if (!s.bt || !['hurt', 'death'].includes(o.k)) return null;
  const blocked = ['moral', 'turn', 'timeout', 'rescue', 'opening'].concat(allowFinale ? [] : ['finale']);
  if (!ev || ev.major || blocked.includes(ev.cat)) return null;
  if (!(o.fx || []).every((f) => MISHAP_OK_FX.has(f[0]) && !(f[0] === 'kill' && f[3] === 'hero'))) return null;
  const main = ctx.hurt.filter((id) => !ctx.extraHurt.includes(id));
  const victims = [...new Set([...main, ...ctx.deaths.filter((id) => !ctx.extraHurt.includes(id))])];
  if (victims.length !== 1) return null;
  const c = charById(s, victims[0]);
  if (!c || (c.infected && c.infected.resolved === false)) return null;
  return c;
}
// Teammates who could come back now: dead a while, could have turned, not put to rest.
export function returnable(s) {
  return s.party.filter((c) => !c.alive && c.turnable && c.diedAt != null && s.stage - c.diedAt >= RETURN_RATE.wait
    && (!c.zombie || (c.zombie.state === 'risen' && c.zombie.times < RETURN_RATE.times && s.stage - c.zombie.last >= RETURN_RATE.gap)));
}
function tryReturn(s, adv, ev, o, label, ctx) {
  const c = accidentVictim(s, ev, o, ctx, { allowFinale: true });
  if (!c) return null;
  const list = (s.bt.returns ||= []);
  if (list.length >= RETURN_RATE.max) return null;
  const pool = returnable(s).filter((d) => d.id !== c.id);
  if (!pool.length) return null;
  const r = rngOf(s);
  if (!r.chance(RETURN_RATE.chance)) return null;
  const d = r.pick(pool);
  const death = !c.alive;
  const others = alive(s).filter((x) => x.id !== c.id);
  const again = (d.zombie?.times || 0) > 0;
  const same = d.diedLoc === s.loc;
  const flee = ev.cat === 'emergency' || ev.cat === 'finale' || FLEE_WORDS.test(label || '');
  let e = pickEncounter(s, r, { flee, again, same, env: envOf(adv) });
  if (e && !others.length && /\{a\}/.test(e.lead)) e = null;
  if (!e) return null;
  const a = others.length ? r.pick(others) : null;
  // put down for good, or gone again (a second appearance always ends it)
  const putDown = !!a && (again || r.chance(RETURN_RATE.putDown));
  const z = (d.zombie ||= { state: 'risen', times: 0, last: 0, hurt: [], killed: [] });
  z.times++; z.last = s.stage; (death ? z.killed : z.hurt).push(c.id);
  if (putDown) z.state = 'gone';
  const dloc = adv.locations?.[d.diedLoc]?.name || s.log.deaths.find((x) => x.id === d.id)?.loc || 'where they fell';
  const tok = { d: d.name, v: c.name, a: a ? a.name : 'someone', dloc };
  let text = fill(s, adv, encounterText(e, r, death, putDown), { ...ctx, tok });
  const dm = (s.bt.mishaps || []).find((m) => m.who === d.id && m.death);
  const callback = dm && MISHAP_CALLBACK[dm.id] ? fill(s, adv, MISHAP_CALLBACK[dm.id], { ...ctx, tok }) : '';
  if (death) {
    c.cause = `was killed by ${d.name}, who came back as one of the infected`;
    const x = [...s.log.deaths].reverse().find((y) => y.id === c.id);
    if (x) { x.cause = c.cause; x.by = d.id; }
  }
  (s.bt.returnIds ||= []).push(e.id);
  list.push({ id: e.id, dead: d.id, who: c.id, stage: s.stage, death, putDown });
  s.log.returns = list;
  remember(s, 'returned', d.id, putDown);
  return { kind: 'return', id: e.id, dead: d.id, who: c.id, death, putDown, text, callback, tok, short: `${d.name} came back` };
}

function tryMishap(s, adv, ev, o, label, ctx) {
  const c = accidentVictim(s, ev, o, ctx);
  if (!c) return null;
  const death = !c.alive;
  const list = (s.bt.mishaps ||= []);
  if (list.length >= MISHAP_RATE.max || (death && list.filter((m) => m.death).length >= MISHAP_RATE.maxDeaths)) return null;
  if (list.length && s.stage - list[list.length - 1].stage < MISHAP_RATE.gap) return null;
  const r = rngOf(s);
  if (!r.chance(death ? MISHAP_RATE.death : MISHAP_RATE.hurt)) return null;
  const flee = ev.cat === 'emergency' || death || FLEE_WORDS.test(label || '');
  const m = pickMishap(s, adv, r, { flee, death });
  if (!m) return null;
  const W = adv.words || {};
  const tok = { v: c.name, ZSU: String(W.zs || 'zombies').toUpperCase() };
  const text = fill(s, adv, mishapText(m, r, death), { ...ctx, tok });
  if (death) {
    c.cause = m.short;
    const d = [...s.log.deaths].reverse().find((x) => x.id === c.id);
    if (d) { d.cause = m.short; d.mishap = true; }
  }
  (s.bt.mishapIds ||= []).push(m.id);
  list.push({ id: m.id, who: c.id, stage: s.stage, death, short: m.short });
  if (!death) remember(s, 'mishap', c.id, false);
  s.log.funny.push({ stage: s.stage, text, mishap: true });
  return { id: m.id, who: c.id, death, text, short: m.short, r: m.r, tok };
}

function resolveOutcome(s, adv, ev, o, label, meta = {}) {
  const r = rngOf(s);
  const ctx = { cast: { ...s.cur.cast }, deaths: [], hurt: [], healed: [], gained: [], lost: [], extraHurt: [], adv, resolving: true, npcId: s.cur.npc, npc: s.cur.npc ? npcName(adv, s.cur.npc) : undefined };
  // in a chaos scene, the 'someone else' is never the volunteer themselves
  if (meta.chaos && ctx.cast.v) { const others = alive(s).filter((c) => c.id !== ctx.cast.v); if (others.length) { const c = r.weighted(others, (c) => 1 / Math.pow(1 + c.danger, 2)); ctx.r = c.id; ctx.cast.r = c.id; } }
  applyFx(s, adv, o.fx, ctx);
  let text = fill(s, adv, o.t, ctx);
  const returned = meta.chaos ? null : tryReturn(s, adv, ev, o, label, ctx);
  const mishap = meta.chaos || returned ? null : tryMishap(s, adv, ev, o, label, ctx);
  if (mishap) text = mishap.text;
  if (returned) text = returned.text;
  if (ctx.saved) text += ' ' + ctx.saved.join(' ');
  // while someone is infected, the team might stumble on a cure
  const sick = alive(s).filter((c) => c.infected && c.infected.resolved === false && c.infected.at < s.stage);
  if (sick.length && adv.cureItem && !hasItem(s, adv.cureItem) && r.chance(diffOf(s).cureFind)) {
    const finder = r.pick(alive(s).filter((c) => !sick.includes(c)).length ? alive(s).filter((c) => !sick.includes(c)) : alive(s));
    addItem(s, adv, adv.cureItem, 1, ctx);
    text += ` And then a stroke of luck: ${finder.name} finds a ${adv.items[adv.cureItem].name}! Use it from the backpack to save ${sick[0].name}.`;
  }
  if (ctx.extraHurt.length) { const n = ctx.extraHurt.map((id) => nameOf(s, id)); text += ` In the chaos, ${listNames(n)} ${n.length > 1 ? 'are' : 'is'} hurt too.`; }
  if (ctx.wave) text += ` And ${ctx.wave > 1 ? 'more of them are' : 'another one is'} coming.`;
  if (ctx.leftBehind) text += ` But the backpack is full (${packSlots(s)} slots), so the ${listNames(ctx.leftBehind)} had to be left behind.`;
  // noise: bad outcomes draw more infected; quiet choices let it settle
  const bad = ['hurt', 'danger', 'death', 'infect'].includes(o.k);
  const calm = hasRole(s, 'Leader') ? 0.55 : 1;
  s.heat = Math.max(0, Math.min(MAX_HEAT, (s.heat || 0) + (bad ? (o.k === 'danger' ? 1.5 : 1) * calm : -0.75)));
  if (ctx.funny) s.log.funny.push({ stage: s.stage, text });
  if (ctx.hero) s.log.heroic.push({ stage: s.stage, text });
  const major = ev && (['moral', 'rescue', 'finale', 'timeout', 'turn', 'emergency', 'travel'].includes(ev.cat) || ev.major);
  s.log.decisions.push({ stage: s.stage, event: s.cur.id, title: s.cur.title, choice: label, result: text, major: !!major });
  // the group remembers what happened, for callbacks later
  if (s.bt) {
    if (ctx.hero) { const who = ctx.cast.v || ctx.cast.t || ctx.cast.a; if (who) remember(s, 'hero', who); }
    const hurt1 = ctx.hurt.find((id) => charById(s, id)?.alive);
    if (hurt1 && (!s.bt.mem.hurt || s.stage - s.bt.mem.hurt.stage > 8)) remember(s, 'hurt', hurt1);
    if (ctx.deaths.length) remember(s, 'lost', ctx.deaths[0]);
    const vol = meta.chaos && ctx.cast.v && charById(s, ctx.cast.v)?.alive ? ctx.cast.v : null;
    if (vol && !(o.fx || []).some((f) => f[0] === 'nextcx')) {
      if (['hurt', 'danger', 'death'].includes(o.k)) remember(s, 'blunder', vol, false);
      else if (o.k === 'good' || o.k === 'item') remember(s, 'clutch', vol, true);
    }
  }
  const H = { alive, fill, r };
  const rsay = s.bt ? reactionBanter(s, adv, H, { kind: o.k, cat: ev?.cat, chaos: !!meta.chaos, searched: !!meta.searched, hurtId: ctx.hurt.find((id) => charById(s, id)?.alive), itemName: ctx.gained.length ? adv.items[ctx.gained[0]].name : '', deaths: ctx.deaths.length > 0 }) : [];
  const say = returned ? returnBanter(s, adv, H, returned) : mishap ? mishapBanter(s, adv, H, mishap) : rsay;
  // for the end-of-story recap: who did what
  if (s.bt) {
    const T = (s.bt.tally ||= {});
    for (const id of ctx.hurt) { (T.wounds ||= {})[id] = (T.wounds[id] || 0) + 1; }
    const who = meta.silly ? ctx.cast.v : null;
    if (who) (s.log.acts ||= []).push({ stage: s.stage, who, label: fill(s, adv, label, ctx), kind: o.k, p: meta.p ?? 1 });
    if (meta.chaos || mishap || returned) {
      const q = (s.log.quotes ||= []);
      for (const l of say) if (l.who && /^\(?[^"]{0,30}"/.test(l.text)) q.push({ who: l.who, text: l.text });
      for (const m of text.matchAll(/(?:^|\n)([A-Z][\w' -]{1,20}): ("[^"\n]{6,140}")/g)) { const c = s.party.find((p) => p.name === m[1].trim()); if (c) q.push({ who: c.id, text: m[2] }); }
      if (q.length > 60) q.splice(0, q.length - 60);
    }
  }
  s.last = { choice: label, text, say, mishap: mishap ? mishap.short : null, returned: returned ? returned.dead : null, chaos: !!meta.chaos, deaths: ctx.deaths.map((id) => nameOf(s, id)), hurt: ctx.hurt.map((id) => nameOf(s, id)), healed: ctx.healed.map((id) => nameOf(s, id)), gained: ctx.gained.map((id) => adv.items[id].name), lost: ctx.lost.map((id) => adv.items[id].name), left: ctx.leftBehind || [], kind: o.k };
  s.clock -= 1;
  s.zoneStages++;
  const wasFinale = ev && ev.cat === 'finale';
  if (wasFinale && !s.pending.some((p) => eventById(adv, p.id)?.cat === 'finale')) s.flags._end = true;
  if (ev && ev.cat === 'timeout') s.flags._end = s.flags._end || !s.flags.continueAfterTimeout;
  nextStage(s, adv);
  // someone can turn during the move to the next stage: drop their reaction
  if (s.last?.say) s.last.say = s.last.say.filter((l) => !l.who || charById(s, l.who)?.alive);
  return s;
}

export function choose(s, adv, displayIndex) {
  if (s.finished) throw new Error('Game finished');
  const ev = currentEventDef(s, adv);
  const ch = s.cur.choices[displayIndex];
  if (!ch) throw new Error('Invalid choice');
  const c = ch.chaos ? optionById(ch.chaos) : ev.choices[ch.i];
  const os = effectiveOutcomes(s, adv, c.o, ev);
  const o = rngOf(s).weighted(filterLoyalty(s, os, s.cur.npc), (x) => x.p);
  const tot = os.reduce((a, x) => a + x.p, 0) || 1;
  return resolveOutcome(s, adv, ev, o, ch.label, { chaos: !!ch.chaos || String(s.cur.id).includes('_cx_ch_'), searched: /search|look|raid|check|explore/i.test(ch.label), p: o.p / tot, silly: !!ch.chaos });
}

// ---------- items ----------
export function findItemUse(s, adv, itemId) {
  const ev = currentEventDef(s, adv);
  const d = adv.items[itemId];
  if (!ev || !d || !ev.uses) return null;
  const keys = [itemId, ...(d.tags || [])];
  for (const k of keys) { const u = ev.uses[k]; if (u && reqOK(s, adv, u.req)) return u; }
  return null;
}

// Make room in the backpack. Dropping does not use up a stage.
export function dropItem(s, adv, itemId) {
  const e = s.inv.find((i) => i.id === itemId);
  if (!e) return false;
  s.inv = s.inv.filter((i) => i !== e);
  s.log.itemsUsed.push({ stage: s.stage, item: itemId, name: adv.items[itemId].name, dropped: true });
  return true;
}

// Can this item do something right now? Used to show usable items in colour.
// Returns a short reason, or null if it would do nothing here.
export function itemUsable(s, adv, itemId) {
  if (s.finished || !hasItem(s, itemId)) return null;
  const d = adv.items[itemId];
  if (!d) return null;
  const tags = d.tags || [];
  // unlocks one of the options on screen
  const ev = currentEventDef(s, adv);
  const opt = (s.cur?.choices || []).findIndex((c) => {
    if (c.i < 0 || !ev?.choices?.[c.i]) return false;
    const q = ev.choices[c.i].req || {};
    return arr(q.items).includes(itemId) || arr(q.tags).some((t) => tags.includes(t)) || (q.anyItems && arr(q.anyItems).some((t) => tags.includes(t)));
  });
  if (opt >= 0) return { why: 'option', i: opt };
  if (findItemUse(s, adv, itemId)) return { why: 'here' };
  if (d.anytime === 'heal' && alive(s).some((c) => c.hp < MAX_HP)) return { why: 'heal' };
  if (d.anytime === 'recharge' && hasItem(s, d.target)) return { why: 'recharge' };
  const sick = alive(s).some((c) => c.infected && !['cured', 'dead'].includes(c.infected.resolved));
  if (d.anytime === 'cure' && sick) return { why: 'cure' };
  if (sick && tags.some((t) => t === 'melee' || t === 'gun')) return { why: 'mercy' };
  return null;
}

export function useItem(s, adv, itemId) {
  if (s.finished) return { ok: false, msg: 'The adventure is over.' };
  if (!hasItem(s, itemId)) return { ok: false, msg: 'You do not have that item.' };
  const d = adv.items[itemId];
  const u = findItemUse(s, adv, itemId);
  if (u) {
    const ev = currentEventDef(s, adv);
    s.log.itemsUsed.push({ stage: s.stage, item: itemId, name: d.name, secret: true });
    consume(s, itemId, u.consume ?? 1);
    const os = u.o ? effectiveOutcomes(s, adv, u.o, ev) : [{ p: 1, k: u.k || 'good', t: u.t, fx: u.fx }];
    const o = rngOf(s).weighted(filterLoyalty(s, os, s.cur.npc), (x) => x.p);
    resolveOutcome(s, adv, ev, o, `Used: ${d.name}`);
    return { ok: true, advanced: true };
  }
  if (d.anytime === 'heal') {
    const inj = alive(s).filter((c) => c.hp < MAX_HP).sort((a, b) => a.hp - b.hp)[0];
    if (!inj) return { ok: false, msg: 'Nobody needs patching up right now. Save it for later.' };
    inj.hp = Math.min(MAX_HP, inj.hp + (d.heal || 1) + (hasRole(s, 'Medic') ? 1 : 0));
    consume(s, itemId, 1);
    s.log.itemsUsed.push({ stage: s.stage, item: itemId, name: d.name });
    return { ok: true, advanced: false, msg: `${inj.name} is patched up (${inj.hp}/${MAX_HP} health).` };
  }
  if (d.anytime === 'recharge') {
    if (!hasItem(s, d.target)) return { ok: false, msg: 'This item cannot be used in this situation.' };
    const t = s.inv.find((i) => i.id === d.target);
    t.qty = Math.min(adv.items[d.target].max || 9, t.qty + (d.amount || 3));
    consume(s, itemId, 1);
    s.log.itemsUsed.push({ stage: s.stage, item: itemId, name: d.name });
    return { ok: true, advanced: false, msg: `${adv.items[d.target].name} recharged (${t.qty} uses).` };
  }
  if (d.anytime === 'cure') {
    const inf = alive(s).find((c) => c.infected && c.infected.resolved !== 'cured' && c.infected.resolved !== 'dead');
    if (!inf) return { ok: false, msg: 'This item cannot be used in this situation.' };
    inf.infected.resolved = 'cured';
    consume(s, itemId, 1);
    s.log.itemsUsed.push({ stage: s.stage, item: itemId, name: d.name });
    s.log.heroic.push({ stage: s.stage, text: `The ${d.name} stopped ${inf.name}'s infection.` });
    return { ok: true, advanced: false, msg: `${inf.name} injects the ${d.name}. The fever breaks. The infection is gone.` };
  }
  return { ok: false, msg: 'This item cannot be used in this situation.' };
}

export function mercyKill(s, adv, charId) {
  const c = charById(s, charId);
  if (!c || !c.alive || !c.infected || ['cured', 'dead'].includes(c.infected.resolved)) return { ok: false, msg: 'Nobody here needs that.' };
  const it = s.inv.find((i) => (adv.items[i.id]?.tags || []).some((t) => t === 'melee' || t === 'gun'));
  if (!it) return { ok: false, msg: 'You need a weapon to do that.' };
  s.log.itemsUsed.push({ stage: s.stage, item: it.id, name: adv.items[it.id].name });
  consume(s, it.id, 1);
  die(s, c, 'was put down by the group before the infection could take hold', { deaths: [], adv });
  c.infected.resolved = 'dead';
  s.log.decisions.push({ stage: s.stage, event: 'mercy', title: 'Infected', choice: `Put ${c.name} down`, result: `${c.name} was put down before they could turn.`, major: true });
  if (!alive(s).length) finish(s, adv);
  return { ok: true, msg: `${c.name} is gone. It was quick.` };
}

// ---------- endings ----------
export function endingContext(s, adv) {
  const al = alive(s);
  return {
    s, alive: al.length, total: s.party.length, dead: s.party.length - al.length,
    all: al.length === s.party.length, none: al.length === 0,
    flag: (f) => !!s.flags[f], has: (i) => hasItem(s, i),
    infected: al.some((c) => c.infected && !['cured', 'dead'].includes(c.infected.resolved)),
    timeout: !!s.flags._timeout, reached: !!s.flags.reached, sacrifice: !!s.flags.sacrifice, npcs: s.npcs,
  };
}

function finish(s, adv) {
  s.finished = true;
  s.cur = null;
  const ctx = endingContext(s, adv);
  const e = adv.endings.find((x) => x.when(ctx)) || adv.endings[adv.endings.length - 1];
  const names = (list) => list.map((c) => c.name);
  const al = s.party.filter((c) => c.alive), dd = s.party.filter((c) => !c.alive);
  const ftxt = (t) => fill(s, adv, typeof t === 'function' ? t(ctx) : t, { survivors: listNames(names(al)), fallen: listNames(names(dd)) });
  s.ending = { id: e.id, title: e.title, cat: e.cat, objective: !!(typeof e.objective === 'function' ? e.objective(ctx) : e.objective), text: ftxt(e.text) };
  return s;
}

export function companionSummary(s, adv) {
  return Object.entries(s.npcData || {}).map(([id, d]) => ({ id, name: npcName(adv, id), loyalty: d.loyalty, died: !!d.died, cause: d.cause || null, left: d.left != null && !d.died, stayed: s.npcs.includes(id) }));
}

export function listNames(n) {
  if (!n.length) return 'no one';
  if (n.length === 1) return n[0];
  return n.slice(0, -1).join(', ') + ' and ' + n[n.length - 1];
}

// ---------- replay history ----------
export function replayWeights(adv, replay) {
  const w = {};
  const runs = replay.runs?.[adv.id] || 0;
  const seen = replay.seen?.[adv.id] || {};
  for (const e of adv.events) {
    if (e.essential) continue;
    const r = seen[e.id];
    if (!r) { w[e.id] = runs ? 1.6 : 1; continue; }
    const ago = runs - r.last;
    let f = ago <= 1 ? 0.22 : ago === 2 ? 0.45 : ago === 3 ? 0.7 : 1;
    f /= 1 + 0.05 * Math.min(r.count, 10);
    w[e.id] = f;
  }
  return w;
}

export function updateReplay(replay, s) {
  const rp = replay ? JSON.parse(JSON.stringify(replay)) : { runs: {}, seen: {}, endings: {}, recent: [] };
  rp.runs ||= {}; rp.seen ||= {}; rp.endings ||= {}; rp.recent ||= [];
  const n = (rp.runs[s.adv] || 0) + 1;
  rp.runs[s.adv] = n;
  const seen = (rp.seen[s.adv] ||= {});
  for (const id of new Set(s.seen)) { const r = (seen[id] ||= { count: 0, last: 0 }); r.count++; r.last = n; }
  if (s.ending) { const en = (rp.endings[s.adv] ||= {}); en[s.ending.id] = (en[s.ending.id] || 0) + 1; }
  rp.recent.unshift({ adv: s.adv, seed: s.seed, ending: s.ending?.id, date: Date.now() });
  rp.recent = rp.recent.slice(0, 20);
  rp.mishaps = [...(s.bt?.mishapIds || []), ...(rp.mishaps || [])].slice(0, 30);
  rp.returns = [...(s.bt?.returnIds || []), ...(rp.returns || [])].slice(0, 10);
  return rp;
}

export function historyRecord(s, adv) {
  return {
    id: 'h_' + s.started + '_' + s.seed, adv: s.adv, advTitle: adv.title, date: Date.now(), seed: s.seed,
    diff: s.diff,
    party: s.party.map((c) => ({ id: c.id, name: c.name, avatar: c.avatar, role: c.role, alive: c.alive, hp: c.hp, cause: c.cause, infected: !!(c.infected && c.alive && c.infected.resolved !== 'cured') })),
    ending: s.ending, objective: s.ending?.objective, stages: s.stage,
    survivors: s.party.filter((c) => c.alive).length, deaths: s.party.filter((c) => !c.alive).length,
    decisions: s.log.decisions.map((d) => ({ stage: d.stage, choice: d.choice, major: d.major, title: d.title })),
    events: s.seen.slice(), discoveries: s.log.discoveries, itemsUsed: s.log.itemsUsed, funny: s.log.funny, heroic: s.log.heroic, deathLog: s.log.deaths, npcs: s.npcs, companions: companionSummary(s, adv),
    recap: s.bt ? buildRecap(s) : null,
  };
}

export function statsFrom(history) {
  const total = history.length;
  const escapes = history.filter((h) => h.objective).length;
  const endings = new Set(history.map((h) => h.adv + ':' + h.ending?.id));
  const perAdv = {};
  for (const h of history) perAdv[h.advTitle] = (perAdv[h.advTitle] || 0) + 1;
  const most = Object.entries(perAdv).sort((a, b) => b[1] - a[1])[0];
  const chars = {};
  for (const h of history) for (const p of h.party) { const c = (chars[p.id] ||= { name: p.name, avatar: p.avatar, played: 0, survived: 0 }); c.played++; if (p.alive) c.survived++; c.name = p.name; c.avatar = p.avatar; }
  return { total, escapes, endingsFound: endings.size, most: most ? most[0] : '—', chars: Object.values(chars).sort((a, b) => b.played - a.played) };
}

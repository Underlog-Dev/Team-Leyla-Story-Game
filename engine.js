// Branching story engine. Pure logic: no DOM. All randomness flows through the
// seeded Rng whose state lives in the game state, so saves resume exactly.
import { Rng, hashSeed } from './rng.js';

export const MAX_HP = 3;
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
export function newGame(adv, characters, seed, { replay = null, useReplay = true } = {}) {
  if (!characters.length) throw new Error('Select at least one character');
  const s = {
    v: 1, adv: adv.id, seed, rng: hashSeed(seed + ':' + adv.id), stage: 1,
    party: characters.map((c) => ({ id: c.id, name: c.name, avatar: c.avatar, traits: c.traits || [], hp: MAX_HP, alive: true, involve: 0, danger: 0, infected: null, cause: null, diedAt: null })),
    inv: [], flags: {}, npcs: [], loc: adv.zones[0][0], zone: 0, zoneStages: 0, zoneQuota: adv.zoneQuota ? adv.zoneQuota[0][0] : 3,
    clock: adv.clock.start, seen: [], pending: [], cur: null, last: null, lastCat: null, lastEm: null, recentDeaths: [],
    log: { decisions: [], discoveries: [], itemsUsed: [], funny: [], heroic: [], deaths: [], locations: [adv.zones[0][0]] },
    finished: false, ending: null, phase: 'normal', rw: {}, started: Date.now(),
  };
  if (replay && useReplay) s.rw = replayWeights(adv, replay);
  const r = rngOf(s);
  // zone quotas decided by the seed
  s.quotas = adv.zones.map((z, i) => { const q = adv.zoneQuota?.[i] || [3, 5]; return r.range(q[0], q[1]); });
  s.zoneQuota = s.quotas[0];
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
  return true;
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
export function fill(s, adv, text, ctx = {}) {
  if (Array.isArray(text)) text = rngOf(s).pick(text);
  if (!text) return '';
  const al = alive(s);
  return String(text).replace(/\{(\w+)\}/g, (m, k) => {
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
export function dangerScale(s, adv) { return 0.8 + 0.45 * progressOf(s, adv); }

export function effectiveOutcomes(s, adv, outcomes, ev) {
  const os = outcomes.map((o) => ({ ...o }));
  if (ev && (ev.cat === 'finale' || ev.cat === 'timeout' || ev.cat === 'turn' || ev.noScale)) return os;
  const B = os.filter((o) => BAD_KINDS.has(o.k)).reduce((a, o) => a + o.p, 0);
  const T = os.reduce((a, o) => a + o.p, 0);
  if (B <= 0 || B >= T) return os;
  const f = dangerScale(s, adv);
  const nb = Math.min(B * f, T * 0.92);
  const scaleBad = nb / B, scaleGood = (T - nb) / (T - B);
  for (const o of os) o.p = o.p * (BAD_KINDS.has(o.k) ? scaleBad : scaleGood);
  // grace period: outright deaths are much rarer in the opening stages
  if (s.stage <= (adv.graceStages ?? 6)) {
    let moved = 0;
    for (const o of os) if (o.k === 'death') { const np = o.p * 0.35; moved += o.p - np; o.p = np; }
    const hurt = os.find((o) => o.k === 'hurt') || os.find((o) => o.k === 'good' || o.k === 'neutral');
    if (hurt) hurt.p += moved;
  }
  return os;
}

export function riskSummary(os) {
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

function renderEvent(s, adv, e, cast) {
  const r = rngOf(s);
  // trait-specific choice performer
  for (const c of e.choices) {
    if (c.req?.trait && !cast.x) {
      const cands = alive(s).filter((ch) => hasTrait(ch, c.req.trait));
      if (cands.length) cast.x = (cands.find((ch) => Object.values(cast).includes(ch.id)) || r.pick(cands)).id;
    }
  }
  for (const id of Object.values(cast)) { const c = charById(s, id); if (c) c.involve++; }
  const ctx = { cast };
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
  // banter: occasional trait quip, never right after a death
  if (!s.recentDeaths.length && e.cat !== 'emergency' && e.cat !== 'finale' && e.cat !== 'turn' && adv.quips && r.chance(adv.quipRate ?? 0.33)) {
    const al = alive(s);
    if (al.length) {
      const sp = r.weighted(al, (c) => 1 / (1 + c.involve));
      const keys = (sp.traits || []).filter((t) => adv.quips[t]);
      const pool = keys.length && r.chance(0.75) ? adv.quips[r.pick(keys)] : adv.quips.Any;
      if (pool && pool.length) {
        const other = al.filter((c) => c.id !== sp.id);
        const line = r.pick(pool);
        if (!/\{other\}/.test(line) || other.length) {
          say.push({ who: sp.id, text: fill(s, adv, line, { me: sp.id, other: other.length ? r.pick(other).id : null }), quip: true });
          sp.involve += 0.5;
        }
      }
    }
  }
  // reactions to deaths in the previous stage
  let react = '';
  if (s.recentDeaths.length) {
    const al = alive(s);
    if (al.length) {
      const sp = r.weighted(al, (c) => (hasTrait(c, 'Kind') || hasTrait(c, 'Loyal') ? 3 : 1));
      const dead = s.recentDeaths.map((id) => nameOf(s, id)).join(' and ');
      react = fill(s, adv, adv.deathLines || ['{me} goes quiet. Nobody says {dead}\'s name, but everyone is thinking it.'], { me: sp.id, dead });
    }
    s.recentDeaths = [];
  }
  const ci = pickChoices(s, adv, e, cast);
  const choices = ci.map((i) => {
    const c = e.choices[i];
    const os = effectiveOutcomes(s, adv, c.o, e);
    return { i, label: fill(s, adv, c.l, ctx), desc: fill(s, adv, c.d, ctx), risk: c.hideRisk ? [] : riskSummary(os), special: !!(c.req && (c.req.items || c.req.tags || c.req.anyItems || c.req.trait || c.req.flags || c.req.infected)) };
  });
  const loc = adv.locations[s.loc];
  const sc = e.scene || {};
  s.cur = {
    id: e.id, cat: e.cat, title: fill(s, adv, e.title || loc?.name || '', ctx), cast, text, say, react, choices,
    scene: { bg: sc.bg || loc?.scene || 'street', z: sc.z ?? (e.cat === 'emergency' ? 2 : 0), light: sc.light || loc?.light || null, props: sc.props || null, cast: Object.values(cast).filter((id) => charById(s, id)?.alive) },
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
  const inf = alive(s).find((c) => c.infected && !c.infected.resolved && s.stage >= c.infected.at + (adv.turnDelay || 4));
  if (inf && adv.turnEvent) { inf.infected.resolved = 'pending'; return { e: eventById(adv, adv.turnEvent), given: { t: inf.id } }; }
  if (s.phase === 'normal' && s.stage >= (adv.maxStages || 40) - adv.finale.length + 1) s.pending = s.pending.filter((p) => eventById(adv, p.id)?.cat === 'turn');
  while (s.pending.length) {
    const p = s.pending.shift();
    const e = eventById(adv, p.id);
    if (!e) continue;
    if (e.req && !reqOK(s, adv, e.req) && e.cat !== 'finale') continue;
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
  if (who === 'injured') { const inj = alive(s).filter((c) => c.hp < MAX_HP).sort((a, b) => a.hp - b.hp); return inj.slice(0, 1); }
  const id = ctx.cast[who];
  const c = id && charById(s, id);
  return c && c.alive ? [c] : [];
}

function die(s, c, cause, ctx) {
  if (!c.alive) return;
  c.alive = false; c.hp = 0; c.cause = cause || 'succumbed to their injuries'; c.diedAt = s.stage;
  s.log.deaths.push({ id: c.id, name: c.name, cause: c.cause, stage: s.stage, loc: adv_locName(s, ctx) });
  s.recentDeaths.push(c.id);
  ctx.deaths.push(c.id);
}
function adv_locName(s, ctx) { return ctx.adv?.locations[s.loc]?.name || ''; }

function addItem(s, adv, id, qty, ctx) {
  const d = adv.items[id];
  if (!d) return false;
  const e = s.inv.find((i) => i.id === id);
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
  if (!addItem(s, adv, id, 0, ctx)) { addItem(s, adv, adv.defaultLoot[0], 0, ctx); }
}

function consume(s, id, n = 1) {
  const e = s.inv.find((i) => i.id === id);
  if (!e) return;
  e.qty -= n;
  if (e.qty <= 0) s.inv = s.inv.filter((i) => i !== e);
}

function applyFx(s, adv, fx, ctx) {
  const r = rngOf(s);
  for (const f of fx || []) {
    const [op, a1, a2, a3] = f;
    switch (op) {
      case 'loot': lootFor(s, adv, ctx); break;
      case 'item': addItem(s, adv, a1, a2, ctx); break;
      case 'use': if (a1 === 'tag') { const it = s.inv.find((i) => (adv.items[i.id]?.tags || []).includes(a2)); if (it) { s.log.itemsUsed.push({ stage: s.stage, item: it.id, name: adv.items[it.id].name }); consume(s, it.id, 1); } } else if (hasItem(s, a1)) { s.log.itemsUsed.push({ stage: s.stage, item: a1, name: adv.items[a1].name }); consume(s, a1, a2 || 1); } break;
      case 'lose': { if (s.inv.length) { const it = r.pick(s.inv); ctx.itemName = adv.items[it.id].name; consume(s, it.id, it.qty); ctx.lost.push(it.id); } break; }
      case 'hurt': for (const c of pickTarget(s, a1, ctx)) { c.hp -= a2 || 1; c.danger++; ctx.hurt.push(c.id); if (c.hp <= 0) die(s, c, a3 || 'succumbed to their injuries', ctx); } break;
      case 'heal': for (const c of pickTarget(s, a1 || 'injured', ctx)) { c.hp = Math.min(MAX_HP, c.hp + (a2 || 1)); ctx.healed.push(c.id); } break;
      case 'bite': for (const c of pickTarget(s, a1, ctx)) die(s, c, 'bitten by the infected', ctx); break;
      case 'kill': for (const c of pickTarget(s, a1, ctx)) { if (a3 === 'hero') { s.flags.sacrifice = true; s.log.heroic.push({ stage: s.stage, text: `${c.name} ${a2}` }); } die(s, c, a2, ctx); } break;
      case 'infect': for (const c of pickTarget(s, a1, ctx)) { if (!c.infected) { c.infected = { at: s.stage, resolved: false }; c.danger++; } } break;
      case 'cure': for (const c of alive(s)) { if (c.infected && c.infected.resolved !== 'cured') c.infected = { ...c.infected, resolved: 'cured' }; } break;
      case 'conceal': for (const c of pickTarget(s, a1, ctx)) { if (c.infected) c.infected.resolved = 'concealed'; s.flags.concealed = true; } break;
      case 'em': { const tgt = pickTarget(s, a1 || 'r', ctx)[0]; if (tgt) { const opts = adv.emergencies.filter((id) => id !== s.lastEm); const id = r.pick(opts.length ? opts : adv.emergencies); s.lastEm = id; tgt.danger++; s.pending.unshift({ id, cast: { t: tgt.id } }); ctx.danger = true; } break; }
      case 'next': s.pending.unshift({ id: a1, cast: { ...ctx.cast } }); break;
      case 'later': s.pending.push({ id: a1, cast: { ...ctx.cast } }); break;
      case 'flag': s.flags[a1] = a2 === undefined ? true : a2; break;
      case 'unflag': delete s.flags[a1]; break;
      case 'npc': if (!s.npcs.includes(a1)) s.npcs.push(a1); s.flags['npc_' + a1] = true; break;
      case 'npcgone': s.npcs = s.npcs.filter((n) => n !== a1); delete s.flags['npc_' + a1]; break;
      case 'time': s.clock += a1; break;
      case 'move': s.loc = a1; s.zone++; s.zoneStages = -1; s.zoneQuota = s.quotas[s.zone]; s.log.locations.push(a1); break;
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

function resolveOutcome(s, adv, ev, o, label) {
  const ctx = { cast: { ...s.cur.cast }, deaths: [], hurt: [], healed: [], gained: [], lost: [], adv, resolving: true };
  applyFx(s, adv, o.fx, ctx);
  const text = fill(s, adv, o.t, ctx);
  if (ctx.funny) s.log.funny.push({ stage: s.stage, text });
  if (ctx.hero) s.log.heroic.push({ stage: s.stage, text });
  const major = ev && (['moral', 'rescue', 'finale', 'timeout', 'turn', 'emergency', 'travel'].includes(ev.cat) || ev.major);
  s.log.decisions.push({ stage: s.stage, event: s.cur.id, title: s.cur.title, choice: label, result: text, major: !!major });
  s.last = { choice: label, text, deaths: ctx.deaths.map((id) => nameOf(s, id)), hurt: ctx.hurt.map((id) => nameOf(s, id)), healed: ctx.healed.map((id) => nameOf(s, id)), gained: ctx.gained.map((id) => adv.items[id].name), lost: ctx.lost.map((id) => adv.items[id].name), kind: o.k };
  if (s.cur.cat === 'turn') { for (const c of s.party) if (c.infected && c.infected.resolved === 'pending') c.infected.resolved = c.alive ? 'concealed' : 'dead'; }
  s.clock -= 1;
  s.zoneStages++;
  const wasFinale = ev && ev.cat === 'finale';
  if (wasFinale && !s.pending.some((p) => eventById(adv, p.id)?.cat === 'finale')) s.flags._end = true;
  if (ev && ev.cat === 'timeout') s.flags._end = s.flags._end || !s.flags.continueAfterTimeout;
  nextStage(s, adv);
  return s;
}

export function choose(s, adv, displayIndex) {
  if (s.finished) throw new Error('Game finished');
  const ev = currentEventDef(s, adv);
  const ch = s.cur.choices[displayIndex];
  if (!ch) throw new Error('Invalid choice');
  const c = ev.choices[ch.i];
  const os = effectiveOutcomes(s, adv, c.o, ev);
  const o = rngOf(s).weighted(os, (x) => x.p);
  return resolveOutcome(s, adv, ev, o, ch.label);
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
    const o = rngOf(s).weighted(os, (x) => x.p);
    resolveOutcome(s, adv, ev, o, `Used: ${d.name}`);
    return { ok: true, advanced: true };
  }
  if (d.anytime === 'heal') {
    const inj = alive(s).filter((c) => c.hp < MAX_HP).sort((a, b) => a.hp - b.hp)[0];
    if (!inj) return { ok: false, msg: 'Nobody needs patching up right now. Save it for later.' };
    inj.hp = Math.min(MAX_HP, inj.hp + (d.heal || 1));
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

// ---------- endings ----------
export function endingContext(s, adv) {
  const al = alive(s);
  return {
    s, alive: al.length, total: s.party.length, dead: s.party.length - al.length,
    all: al.length === s.party.length, none: al.length === 0,
    flag: (f) => !!s.flags[f], has: (i) => hasItem(s, i),
    infected: al.some((c) => c.infected && (c.infected.resolved === 'concealed' || c.infected.resolved === false || c.infected.resolved === 'pending')),
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
  return rp;
}

export function historyRecord(s, adv) {
  return {
    id: 'h_' + s.started + '_' + s.seed, adv: s.adv, advTitle: adv.title, date: Date.now(), seed: s.seed,
    party: s.party.map((c) => ({ id: c.id, name: c.name, avatar: c.avatar, alive: c.alive, hp: c.hp, cause: c.cause, infected: !!(c.infected && c.alive && c.infected.resolved !== 'cured') })),
    ending: s.ending, objective: s.ending?.objective, stages: s.stage,
    survivors: s.party.filter((c) => c.alive).length, deaths: s.party.filter((c) => !c.alive).length,
    decisions: s.log.decisions.map((d) => ({ stage: d.stage, choice: d.choice, major: d.major, title: d.title })),
    events: s.seen.slice(), discoveries: s.log.discoveries, itemsUsed: s.log.itemsUsed, funny: s.log.funny, heroic: s.log.heroic, deathLog: s.log.deaths, npcs: s.npcs,
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

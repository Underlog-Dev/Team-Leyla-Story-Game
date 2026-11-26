// End-of-story recap: awards and a line for every character, built only from
// what actually happened in this playthrough. Categories with nothing to say
// are left out.
import { personaKey } from './persona.js';
import { Rng, hashSeed } from './rng.js';

// What each crew member's running gag adds up to (n = lines they said).
const PERSONA_STAT = {
  leyla: (n) => `Tried to keep ${n} conversations under control`,
  bravo: (n) => `Took ${n} things far too literally`,
  chris: (n) => `Did the maths ${n} times (mostly right)`,
  hyrisha: (n) => `Checked everyone was okay ${n} times`,
  hiwi: (n) => `Tried to film ${n} near-death moments`,
  dardan: (n) => `Compared ${n} disasters to farm life`,
  sonila: (n) => `Looked after everyone ${n} times`,
  isma: (n) => `Threatened to block ${n} things`,
  doa: (n) => `Brought up baking ${n} times`,
  toddy: (n) => `Suggested ${n} terrible plans`,
  hatice: (n) => `Checked on Kheria ${n} times`,
  gaza: (n) => `Made ${n} Call of Duty comparisons`,
  loni: (n) => `Volunteered for ${n} fights`,
  ikram: (n) => `Knew ${n} things he really shouldn't have`,
  budz: (n) => `Made ${n} epic fantasy references`,
};
const cap = (t) => String(t || '').charAt(0).toUpperCase() + String(t || '').slice(1);
const top = (obj = {}, ok = () => true) => Object.entries(obj).filter(([id, n]) => n > 0 && ok(id)).sort((a, b) => b[1] - a[1])[0];

export function buildRecap(s) {
  const r = new Rng({ rng: hashSeed('recap:' + s.seed + ':' + s.stage) });
  const by = (id) => s.party.find((c) => c.id === id);
  const nm = (id) => by(id)?.name || 'Someone';
  const T = s.bt?.tally || {};
  const acts = s.log.acts || [];
  const mish = s.bt?.mishaps || [];
  const awards = [];
  const add = (title, who, text) => { if (who && by(who)) awards.push({ title, who, name: nm(who), text }); };
  // spread the awards around: someone who already has one goes to the back of the queue
  const won = (id) => awards.filter((a) => a.who === id).length;

  // most heroic: heroic moments and clutch saves
  const heroCount = {};
  for (const k of ['hero', 'clutch']) for (const [id, n] of Object.entries(T[k] || {})) heroCount[id] = (heroCount[id] || 0) + n * (k === 'hero' ? 2 : 1);
  const h = top(heroCount);
  if (h) { const a = T.hero?.[h[0]] || 0, b = T.clutch?.[h[0]] || 0; add('Most heroic', h[0], [a && `${a} heroic moment${a === 1 ? '' : 's'}`, b && `${b} clutch save${b === 1 ? '' : 's'}`].filter(Boolean).join(', ')); }

  // most questionable decision: a silly choice that went badly
  const bad = acts.filter((a) => ['hurt', 'danger', 'death'].includes(a.kind));
  if (bad.length) { const a = bad.sort((x, y) => won(x.who) - won(y.who) || x.p - y.p)[0]; add('Most questionable decision', a.who, `"${a.label}"`); }

  // most unexpected success: the least likely silly choice that worked
  const wins = acts.filter((a) => ['good', 'item'].includes(a.kind) && a.p <= 0.5);
  if (wins.length) { const a = wins.sort((x, y) => won(x.who) - won(y.who) || x.p - y.p)[0]; add('Most unexpected success', a.who, `"${a.label}" actually worked`); }

  // luckiest: targeted the most and still standing
  const alive = s.party.filter((c) => c.alive);
  const lucky = alive.filter((c) => (c.danger || 0) >= 3).sort((a, b) => b.danger - a.danger || b.hp - a.hp)[0];
  if (lucky) add('Luckiest', lucky.id, `In danger ${lucky.danger} times and still standing`);

  // most embarrassing: a ridiculous accident they survived
  const emb = mish.filter((m) => !m.death && by(m.who));
  if (emb.length) { const m = emb[0]; add('Most embarrassing', m.who, cap(m.short)); }

  // most chaotic: picked for the most silly decisions
  const cx = {};
  for (const a of acts) cx[a.who] = (cx[a.who] || 0) + 1;
  const c = Object.entries(cx).filter(([, n]) => n >= 2).sort((a, b) => won(a[0]) - won(b[0]) || b[1] - a[1])[0];
  if (c && c[1] >= 2) add('Most chaotic', c[0], `Volunteered for ${c[1]} ridiculous plans`);

  // most ridiculous death
  const rd = mish.find((m) => m.death);
  if (rd) add('Most ridiculous death', rd.who, cap(rd.short));

  // funniest quote
  const q = (s.log.quotes || []).filter((x) => by(x.who) && x.text.length < 120);
  if (q.length) { const fresh = q.filter((x) => !won(x.who)); const x = r.pick(fresh.length ? fresh : q); add('Funniest quote', x.who, x.text); }

  // everyone: how they ended up, and one thing they will be remembered for
  const people = s.party.map((p) => {
    const k = personaKey(p);
    const lines = s.bt?.count?.[p.id] || 0;
    const notes = [];
    if (k && PERSONA_STAT[k] && lines >= 3) notes.push(PERSONA_STAT[k](lines));
    if ((T.hero?.[p.id] || 0) >= 2) notes.push(`${T.hero[p.id]} heroic moments`);
    const wounds = T.wounds?.[p.id] || 0;
    if (p.alive && wounds >= 3) notes.push(`Survived ${wounds} injuries`);
    if (p.alive && p.hp === 1) notes.push('Made it out on their last bit of health');
    if (cx[p.id] >= 3) notes.push(`Volunteered for ${cx[p.id]} ridiculous plans`);
    const status = p.alive ? (p.infected && p.infected.resolved !== 'cured' ? 'Survived... infected' : 'Survived') : 'Deceased';
    return { id: p.id, name: p.name, alive: p.alive, status, cause: p.alive ? '' : cap(p.cause || 'Unknown'), note: notes[0] || '' };
  });
  return { awards, people };
}

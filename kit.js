// Authoring helpers for adventure content. Events are plain data; these helpers
// only cut down boilerplate. Outcome kinds drive the honest risk labels:
//   item  = an item is found        hurt  = someone loses health
//   danger= an emergency is triggered death = someone dies outright
//   good / neutral / bad / funny = no risk label

export const O = (p, k, t, fx = []) => ({ p, k, t, fx });
export const C = (l, d, o, extra = {}) => ({ l, d, o, ...extra });
export const U = (t, fx = [], extra = {}) => ({ t, fx, ...extra });

const POOL = {
  item: ['{r} digs out {loot} and stuffs it into the backpack.', 'Not everything was taken. {r} comes back holding {loot}.', 'Under the mess, {r} finds {loot}.', 'Jackpot. {r} finds {loot}.'],
  hurt: ['{r} slices a palm open on a jagged edge.', '{r} twists an ankle on the rubble.', 'Something heavy topples onto {r}.', '{r} slips and lands hard on one shoulder.'],
  danger: ['Something moves in the dark. It is heading straight for {r}!', 'A shape lunges out of cover toward {r}!', '{r} turns a corner into a snarling face!'],
  none: ['Nothing useful. Just dust and silence.', 'Picked clean. Someone got here first.', 'A waste of time, but nobody got hurt.'],
  safe: ['Slow and steady. Nothing goes wrong.', '{Team} moves on carefully and quietly.', 'No trouble. For once, the quiet way works.'],
};

// Search / explore: chance of loot, injury and an emergency. Costs time.
export function search(l, d, { item = 0.5, hurt = 0.12, danger = 0, time = -1, t = {}, extra = {} } = {}) {
  const o = [];
  if (item) o.push(O(item, 'item', t.item || POOL.item, [['loot'], ['time', time]]));
  if (hurt) o.push(O(hurt, 'hurt', t.hurt || POOL.hurt, [['hurt', 'r', 1], ['time', time]]));
  if (danger) o.push(O(danger, 'danger', t.danger || POOL.danger, [['em', 'r'], ['time', time]]));
  const rest = Math.max(0, 1 - item - hurt - danger);
  if (rest > 0.001) o.push(O(rest, 'neutral', t.none || POOL.none, [['time', time]]));
  return C(l, d, o, extra);
}

// Careful / safe: no risk, may cost time, may grant a small flag.
export function safe(l, d, { t, time = -1, fx = [], extra = {} } = {}) {
  return C(l, d, [O(1, 'neutral', t || POOL.safe, [['time', time], ...fx])], extra);
}

// Rush / risky: saves time, chance of injury or danger.
export function rush(l, d, { hurt = 0.18, danger = 0.08, time = 1, t = {}, fx = [], extra = {} } = {}) {
  const o = [];
  if (hurt) o.push(O(hurt, 'hurt', t.hurt || POOL.hurt, [['hurt', 'r', 1], ['time', time], ...fx]));
  if (danger) o.push(O(danger, 'danger', t.danger || POOL.danger, [['em', 'r'], ...fx]));
  o.push(O(1 - hurt - danger, 'good', t.ok || ['{Team} pushes through fast and gains precious time.', 'Risky, but it works. Time saved.'], [['time', time], ...fx]));
  return C(l, d, o, extra);
}

// Generic multi-outcome choice with explicit outcomes
export const pick = C;

// Travel outcome tables by risk level (used by the generated travel stage)
export function travelTables(text) {
  return {
    low: [O(0.9, 'neutral', text.lowOk), O(0.1, 'hurt', text.hurt, [['hurt', 'r', 1]])],
    med: [O(0.72, 'neutral', text.medOk), O(0.16, 'hurt', text.hurt, [['hurt', 'r', 1]]), O(0.12, 'danger', text.danger, [['em', 'r']])],
    high: [O(0.58, 'good', text.highOk), O(0.22, 'hurt', text.hurt, [['hurt', 'r', 1]]), O(0.2, 'danger', text.danger, [['em', 'r']])],
  };
}

export const GENERIC_QUIPS = {
  Funny: ['"Good news: I have finally found a way to skip leg day. Running from zombies."', '"If I turn, I want everyone to know I would make a very polite zombie."', '"Rate this apocalypse out of ten? Two. The customer service is terrible."', '"Can we all agree that whoever invented zombies owes us an apology?"'],
  Sarcastic: ['"Oh good. More screaming. My favourite."', '"What a lovely day for a walk through certain death."', '"Remind me to leave a one-star review of the end of the world."'],
  Nervous: ['"Did anyone else hear that? No? Just me? Great. Fantastic."', '"I am fine. I am totally fine. My hands are shaking for fun."', '"Can we please walk faster. And quieter. Both. Please."'],
  Brave: ['"Stay behind me. If anything comes, it gets me first."', '"We are not dying today. Not on my watch."'],
  Gamer: ['"This is basically the tutorial level. Boss fight is later."', '"If I had a save point right now, I would absolutely use it."', '"Rookie mistake, {other}. Never split the party. Everybody knows that."'],
  Leader: ['"Listen up. Eyes open, mouths shut, nobody wanders off."', '"Keep moving. We stop when we are safe, not before."'],
  Kind: ['"{other}, you okay? You can lean on me if you need to."', '"Everyone drink some water. Little things keep us alive."'],
  Reckless: ['"Honestly? I think we could take them. Like, all of them."', '"What is the worst that could happen? Actually, do not answer that."'],
  Practical: ['"Count your supplies. Know what you have before you need it."', '"Tie your laces properly. You do not want to trip at the wrong moment."'],
  Intelligent: ['"They are attracted to sound. Statistically, the shouting is not helping."', '"Interesting. They seem slower when it is cold. Noted."'],
  Mysterious: ['"I have seen worse than this." (Nobody asks. Nobody wants to know.)', '"Trust me. I know a thing or two about disappearing."'],
  'Nature lover': ['"The birds stopped singing a minute ago. That is never a good sign."', '"Look, even now the moss is still growing. Life finds a way."'],
  Loyal: ['"Whatever happens, we stick together. All of us."', '"I have got your back, {other}. Always."'],
  Engineer: ['"Everything here is held together by hope and cheap screws."', '"Give me ten minutes and some tape and I could fix half this city."'],
  Medic: ['"If anyone is bleeding, tell me now, not later. Later is worse."', '"Keep your wounds clean. Infection kills more people than you think."'],
  Foodie: ['"If we survive this, the first thing I am doing is eating an entire pizza."', '"I would trade my left shoe for a hot cup of tea right now."'],
  Any: ['"Does anyone actually know where we are going?"', '"I keep thinking about my bed. My lovely, safe bed."', '"Note to self: never complain about Mondays ever again."', '"I am starting to really hate the smell of this place."', '"When this is over, we are all getting matching t-shirts."'],
};

export const GENERIC_DEATH_LINES = [
  '{me} keeps looking back at where {dead} fell. Nobody jokes for a while.',
  'The silence after losing {dead} is heavier than any backpack. {me} wipes their eyes and keeps walking.',
  '{me} whispers a promise to {dead}: they will make it out, for both of them.',
  'No one says it out loud, but everyone counts the group again. One fewer. {me} takes the lead without a word.',
];

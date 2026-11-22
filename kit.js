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

// ---------------------------------------------------------------------------
// Companion scenes. Every companion who joins has a hidden nature, rolled when
// they join: loyal, ordinary or traitor. Outcomes tagged with `loyalty` only
// happen for a companion of that nature, so the player sees "depends who you
// trust" instead of numbers. Text uses {npc} for the companion's name.
const L = (p, loyalty, k, t, fx = []) => ({ p, k, t, fx, loyalty });

export function companionEvents(A, place) {
  const E = (id, o) => ({ id: `${A}_${id}`, ...o });
  return [
    E('comp_watch', {
      cat: 'interaction', loc: '*', req: { companion: true, joinedFor: 2 }, companion: true, title: `Night Watch`,
      text: [`Everyone is exhausted. {Team} finds a quiet corner of {loc} to rest for an hour. {npc} offers to keep watch while everyone else sleeps.`],
      cast: ['a', 'b?'], say: [['a', `"An hour. Just one hour of sleep."`], ['b', `"Do we trust {npc} with the watch? Honestly?"`, 'Sarcastic'], ['b', `"Thank you, {npc}. Wake us if anything moves."`, 'Kind']],
      choices: [
        C(`Let {npc} keep watch alone`, `Everyone sleeps properly.`, [
          L(1, 'loyal', 'good', `{npc} keeps watch all night and wakes everyone gently. Real, deep sleep. Everyone feels stronger.`, [['heal', 'all', 1], ['time', -2]]),
          L(0.8, 'ordinary', 'good', `{npc} dozes off halfway through, but nothing comes. Everyone wakes rested.`, [['heal', 'injured', 1], ['time', -2]]),
          L(0.2, 'ordinary', 'bad', `{npc} falls asleep on watch. Something wanders in and {r} wakes up just in time to be grabbed.`, [['em', 'r'], ['time', -2]]),
          L(0.5, 'traitor', 'bad', `{Team} wakes to an open door and a much lighter backpack. {npc} is gone, and so are the supplies.`, [['npcsteal', 2], ['npcleave', null, 'traitor'], ['time', -2]]),
          L(0.3, 'traitor', 'bad', `{r} wakes to {npc} kneeling over them with a knife, going through their pockets. A scream, a struggle, a slash, and {npc} bolts into the dark.`, [['hurt', 'r', 2, 'was attacked in their sleep by a companion they trusted'], ['npcsteal', 1], ['npcleave', null, 'traitor'], ['time', -2]]),
          L(0.2, 'traitor', 'good', `{npc} keeps watch and nothing happens. Everyone rests. Whatever {npc} was planning, it was not tonight.`, [['heal', 'injured', 1], ['time', -2]]),
        ]),
        C(`Take turns: {a} watches with {npc}`, `Two pairs of eyes. Nobody alone.`, [
          L(1, ['loyal', 'ordinary'], 'good', `{a} and {npc} swap stories through the night. Everyone else sleeps well.`, [['heal', 'injured', 1], ['time', -2]]),
          L(0.7, 'traitor', 'bad', `At 3am, {a} catches {npc} creeping toward the backpack. Caught red-handed, {npc} runs off into the dark with nothing.`, [['npcleave', null, 'traitor'], ['time', -2]]),
          L(0.3, 'traitor', 'hurt', `At 3am, {npc} turns on {a} with a rock. {a} fights them off, bleeding, and {npc} flees.`, [['hurt', 'a', 1], ['npcleave', null, 'traitor'], ['time', -2]]),
        ]),
        safe(`One of your own keeps watch`, `{a} watches. {npc} sleeps with everyone else.`, { time: -2, fx: [['heal', 'injured', 1]], t: `{a} keeps watch all night. Nothing happens. Nobody is quite sure if that proves anything.` }),
        safe(`No rest. Keep moving.`, `Tired but safe.`, { time: 0, t: `Bleary-eyed, {team} pushes on.` }),
        C(`Sleep with the backpack as a pillow`, `Rest, but keep the supplies close.`, [
          L(1, ['loyal', 'ordinary'], 'good', `Everyone sleeps. The backpack stays put.`, [['heal', 'injured', 1], ['time', -2]]),
          L(0.6, 'traitor', 'bad', `{a} wakes to {npc} gently tugging the backpack out from under their head. {npc} runs, empty-handed, into the dark.`, [['npcleave', null, 'traitor'], ['time', -2]]),
          L(0.4, 'traitor', 'good', `Nothing happens. The backpack stays put. Everyone rests.`, [['heal', 'injured', 1], ['time', -2]]),
        ]),
      ],
    }),
    E('comp_scout', {
      cat: 'interaction', loc: '*', req: { companion: true, companionHuman: true }, companion: true, title: `Going Ahead`,
      text: [`{npc} stops and points into the shadows ahead. "I'll scout ahead and look for supplies. Faster on my own. Give me ten minutes."`],
      cast: ['a', 'b?'], say: [['a', `"Ten minutes. Then we come looking."`], ['b', `"Or we all go together. Just saying."`, 'Practical']],
      choices: [
        C(`Let {npc} go alone`, `Trust them.`, [
          L(0.7, 'loyal', 'item', `{npc} comes back grinning with {loot}, and news of a safe path ahead.`, [['loot'], ['time', 1]]),
          L(0.3, 'loyal', 'item', `{npc} comes back with {loot} and a fresh scratch. "Long story. You should see the other guy."`, [['loot']]),
          L(0.7, 'ordinary', 'item', `{npc} returns after twenty minutes with {loot}.`, [['loot'], ['time', -1]]),
          L(0.3, 'ordinary', 'neutral', `{npc} comes back empty-handed. "Nothing. Sorry."`, [['time', -1]]),
          L(0.6, 'traitor', 'bad', `Ten minutes. Twenty. An hour. {npc} never comes back. They were never planning to.`, [['npcleave', null, 'traitor'], ['time', -2]]),
          L(0.4, 'traitor', 'item', `{npc} comes back with {loot} and a strange look on their face.`, [['loot'], ['time', -1]]),
        ]),
        C(`Go together`, `Slower, but nobody wanders off.`, [
          L(0.6, ['loyal', 'ordinary', 'traitor'], 'item', `Together, {team} and {npc} search the area and find {loot}.`, [['loot'], ['time', -1]]),
          L(0.4, ['loyal', 'ordinary', 'traitor'], 'neutral', `Nothing out there but trouble. Everyone heads back.`, [['time', -1]]),
        ]),
        C(`Give {npc} the backpack to carry while they scout`, `Free up your hands. Total trust.`, [
          L(1, 'loyal', 'item', `{npc} brings the backpack back heavier: {loot} added.`, [['loot']]),
          L(1, 'ordinary', 'item', `{npc} brings the backpack back with {loot} inside.`, [['loot'], ['time', -1]]),
          L(0.85, 'traitor', 'bad', `{npc} smiles, shoulders the backpack, and disappears. With everything.`, [['npcsteal', 3], ['npcleave', null, 'traitor'], ['time', -1]]),
          L(0.15, 'traitor', 'item', `{npc} comes back with the backpack. Somehow, nothing is missing. This time.`, [['loot']]),
        ]),
        safe(`Say no. Everyone stays together.`, `No splitting up.`, { time: 0, t: `{npc} shrugs. "Your call."` }),
        search(`Send {a} to scout instead`, `Someone you know better.`, { item: 0.5, hurt: 0.1, danger: 0.1 }),
      ],
    }),
    E('comp_betray', {
      cat: 'moral', loc: '*', req: { companion: 'traitor', companionHuman: true, joinedFor: 4 }, companion: true, stage: [8, 40], w: 2, major: true, title: `True Colours`,
      text: [`{a} turns round just in time to see {npc} swing the backpack onto their shoulder and back away toward the exit. Their face is completely calm. "Nothing personal," says {npc}. "Only room for one where I'm going."`],
      cast: ['a', 'b?'], say: [['a', `"{npc}?! We trusted you!"`], ['b', `"I KNEW it. I knew it!"`, 'Sarcastic'], ['b', `"Please. We need those supplies."`, 'Kind']],
      choices: [
        C(`Chase {npc}`, `Get the backpack back.`, [O(0.5, 'good', `{a} tackles {npc} at the doorway. The backpack is ripped free, and {npc} runs off into the dark, empty-handed.`, [['npcleave', null, 'traitor'], ['hero']]), O(0.3, 'hurt', `{npc} swings the backpack into {a}'s face and escapes with half the supplies.`, [['hurt', 'a', 1], ['npcsteal', 1], ['npcleave', null, 'traitor']]), O(0.2, 'bad', `{npc} is faster. Gone, with everything.`, [['npcsteal', 3], ['npcleave', null, 'traitor']])]),
        C(`Talk {npc} down`, `Maybe there is still a person in there.`, [O(0.4, 'good', `{npc} hesitates, drops the backpack, and walks away without a word.`, [['npcleave', null, 'traitor']]), O(0.6, 'bad', `{npc} laughs and leaves with the backpack.`, [['npcsteal', 2], ['npcleave', null, 'traitor']])]),
        C(`Let {npc} go`, `Not worth a fight.`, [O(1, 'bad', `{npc} disappears. So do some of the supplies.`, [['npcsteal', 2], ['npcleave', null, 'traitor']])]),
        C(`Block the exit`, `Nobody leaves.`, [O(0.5, 'good', `{Team} stands shoulder to shoulder in the doorway. {npc} drops the bag and climbs out a window instead.`, [['npcleave', null, 'traitor']]), O(0.5, 'hurt', `{npc} pulls a knife and slashes {r} on the way out.`, [['hurt', 'r', 1], ['npcsteal', 1], ['npcleave', null, 'traitor']])]),
        C(`Throw something at {npc}`, `Anything within reach.`, [O(0.5, 'funny', `A tin can bounces off {npc}'s head. They drop the bag in surprise and flee, rubbing their head.`, [['funny'], ['npcleave', null, 'traitor']]), O(0.5, 'bad', `It misses. {npc} is gone, with the supplies.`, [['npcsteal', 2], ['npcleave', null, 'traitor']])]),
      ],
    }),
    E('comp_knife', {
      cat: 'moral', loc: '*', req: { companion: 'traitor', companionHuman: true, joinedFor: 5 }, companion: true, essential: false, stage: [10, 40], title: `In the Dark`,
      text: [`In the dead of night, {a} wakes to a shadow standing over {b}. It is {npc}. There is a knife in their hand, and {b} is still asleep.`],
      scene: { light: 'dark' }, cast: ['a', 'b'], say: [['a', `"{npc}! What are you DOING?"`]],
      choices: [
        C(`Shout to wake {b}`, `Loud. Now.`, [O(0.6, 'hurt', `{b} jolts awake and rolls away. The knife catches an arm instead of a throat. {npc} flees into the night.`, [['hurt', 'b', 1], ['npcleave', null, 'traitor']]), O(0.3, 'good', `{b} wakes and dodges. {npc} stumbles, drops the knife and runs.`, [['npcleave', null, 'traitor'], ['hero']]), O(0.1, 'death', `The shout comes a second too late.`, [['kill', 'b', 'was killed in their sleep by a companion who betrayed the group'], ['npcleave', null, 'traitor']])]),
        C(`{a} tackles {npc}`, `Dive at them.`, [O(0.55, 'good', `{a} crashes into {npc}. The knife skitters away. {npc} scrambles up and runs.`, [['npcleave', null, 'traitor'], ['hero']]), O(0.35, 'hurt', `{a} tackles {npc} but takes a slash across the hand.`, [['hurt', 'a', 1], ['npcleave', null, 'traitor'], ['hero']]), O(0.1, 'death', `{npc} is stronger than {a}. Much stronger.`, [['kill', 'a', 'was killed by a companion they caught in the act of betrayal'], ['npcleave', null, 'traitor']])]),
        C(`Throw something at {npc}`, `A boot, a torch, anything.`, [O(0.5, 'good', `A boot to the head. {npc} reels back. Everyone wakes and {npc} runs.`, [['npcleave', null, 'traitor'], ['funny']]), O(0.4, 'hurt', `It misses. {npc} slashes at {b}, who wakes just in time to take it on the arm.`, [['hurt', 'b', 1], ['npcleave', null, 'traitor']]), O(0.1, 'death', `It misses completely.`, [['kill', 'b', 'was killed in their sleep by a companion who betrayed the group'], ['npcleave', null, 'traitor']])]),
        C(`Talk calmly to {npc}`, `"Put the knife down. Let's talk."`, [O(0.4, 'good', `{npc} stares for a long moment, then lowers the knife and walks out into the night.`, [['npcleave', null, 'traitor']]), O(0.45, 'hurt', `{npc} lunges. {b} wakes up screaming, cut but alive. {npc} runs.`, [['hurt', 'b', 2], ['npcleave', null, 'traitor']]), O(0.15, 'death', `{npc} does not want to talk.`, [['kill', 'b', 'was killed in their sleep by a companion who betrayed the group'], ['npcleave', null, 'traitor']])]),
        C(`Grab the backpack and run with {b}`, `Drag {b} out and away.`, [O(0.5, 'hurt', `{a} hauls {b} up and out of the door. {npc} slashes once, catching {b}'s shoulder, then gives up.`, [['hurt', 'b', 1], ['npcleave', null, 'traitor']]), O(0.5, 'good', `{a} yanks {b} awake and they bolt. {npc} does not follow.`, [['npcleave', null, 'traitor']])]),
      ],
      uses: {
        gun: U(`{a} raises the gun. "Drop it." {npc} drops the knife, backs away, and disappears into the dark.`, [['npcleave', null, 'traitor'], ['hero']], { consume: 0 }),
        melee: U(`{a} swings first. {npc} reels back, drops the knife and flees.`, [['npcleave', null, 'traitor'], ['hero']]),
        spray: U(`A blast of spray in {npc}'s face. They stagger out into the night, coughing.`, [['npcleave', null, 'traitor']]),
        light: U(`{a} snaps a light on, straight into {npc}'s eyes. Everyone wakes. {npc} runs.`, [['npcleave', null, 'traitor']]),
      },
    }),
    E('comp_find', {
      cat: 'item', loc: '*', req: { companion: 'loyal', joinedFor: 2 }, companion: true, title: `A Good Friend`,
      text: [`{npc} has been quiet for a while. Then they hold up something they found while everyone else was busy, looking pleased with themselves.`],
      cast: ['a'], say: [['a', `"{npc}, you absolute legend."`]],
      choices: [
        C(`Take what {npc} found`, `Gratefully.`, [O(1, 'item', `{npc} hands over {loot}. "Thought you might need this."`, [['loot']])]),
        C(`Ask {npc} where they found it`, `There might be more.`, [O(0.6, 'item', `"Back there. There's more." There is: {loot}.`, [['loot'], ['loot'], ['time', -1]]), O(0.4, 'item', `"Lucky find." {npc} hands over {loot}.`, [['loot']])]),
        C(`Tell {npc} to keep it`, `They found it. It is theirs.`, [O(1, 'good', `{npc} looks touched. "We're a team now." They pack it away for when it is needed.`, [['loot']])]),
        C(`Ask {npc} to teach you how they spot things`, `A survival lesson.`, [O(1, 'good', `{npc} explains where people hide things. {a} immediately spots {loot} nearby.`, [['loot'], ['time', -1]])]),
        safe(`Keep moving`, `No time to stop.`, { t: `{npc} tucks it into the backpack as they walk.`, fx: [['loot']] }),
      ],
    }),
    E('comp_medic', {
      cat: 'interaction', loc: '*', req: { companion: ['loyal', 'ordinary'], companionHuman: true, injured: true }, companion: true, title: `Patched Up`,
      text: [`{npc} notices {a} wincing and stops everyone. "Sit down. Let me look at that before it gets worse."`],
      cast: ['a'], say: [['a', `"It is fine. It is just a scratch."`]],
      choices: [
        C(`Let {npc} patch everyone up`, `Takes a little time.`, [O(1, 'good', `{npc} is surprisingly good at this. Wounds cleaned, bandages tight.`, [['heal', 'injured', 1], ['heal', 'injured', 1], ['time', -1]])]),
        C(`Just a quick fix for the worst wound`, `Fast.`, [O(1, 'good', `Thirty seconds of work, and the worst injury is under control.`, [['heal', 'injured', 1]])]),
        safe(`Refuse and keep going`, `Pride is a powerful painkiller.`, { time: 0, t: `{npc} rolls their eyes. "Suit yourself."` }),
        C(`Ask {npc} to show you how`, `Learn something.`, [O(1, 'good', `{npc} shows everyone how to clean a wound properly. It might save a life later.`, [['heal', 'injured', 1], ['time', -1]])]),
        C(`Thank {npc} properly`, `They have earned it.`, [O(1, 'good', `{npc} goes a bit red. "Somebody has to look after you lot." They patch {a} up anyway.`, [['heal', 'injured', 1]])]),
      ],
    }),
  ];
}

// The "companion jumps in" option added to every emergency.
export const companionRescue = C(`{npc} throws themselves in the way`, `Your companion jumps between {t} and the danger.`, [
  L(0.5, 'loyal', 'good', `{npc} slams into it shoulder-first and drags {t} clear. "GO!" Both of them make it.`, [['hero']]),
  L(0.3, 'loyal', 'good', `{npc} takes the blow meant for {t}, staggers, and gets back up. Bruised, bleeding, grinning.`, [['hero']]),
  L(0.2, 'loyal', 'good', `{npc} shoves {t} out of the way and is pulled down instead. {npc} does not get back up. {t} is alive because of them.`, [['npcdie', 'died saving the group from the infected'], ['hero']]),
  L(0.45, 'ordinary', 'good', `{npc} hesitates, then leaps in. It is messy, but {t} gets away.`),
  L(0.35, 'ordinary', 'hurt', `{npc} tries, but it is too strong. {t} gets clear, hurt.`, [['hurt', 't', 1]]),
  L(0.2, 'ordinary', 'bad', `{npc} freezes, then runs. {t} fights free alone, hurt. {npc} does not come back.`, [['hurt', 't', 1], ['npcleave', null, 'coward']]),
  L(0.6, 'traitor', 'bad', `{npc} steps forward, then steps back, grabs a bag in the chaos, and runs. {t} is left to fight alone.`, [['hurt', 't', 1], ['npcsteal', 1], ['npcleave', null, 'traitor']]),
  L(0.4, 'traitor', 'good', `{npc} saves {t}, but only because they need the group, for now.`),
], { req: { companion: true } });

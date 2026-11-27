// Returning dead: a teammate who died earlier in THIS story comes back as one of
// the infected. It never adds risk: it only changes WHO caused an injury or death
// that a decision had already caused. Works for any zombie story.
//   {d} = the returning teammate   {v} = the person hurt or killed
//   {a} = another survivor          {dloc} = where {d} died   {z}/{zs} = zombie words

// Can this death realistically come back? (No bodies lost at sea, nobody who was
// put down or taken away, nobody who isn't in this story.)
const NO_RETURN = /put down|quarantine|lost in the (cold )?(water|sea)|into the sea|cold sea|overboard|never be found|blown up|burned/i;
export function canTurn(cause) { return !NO_RETURN.test(cause || ''); }

const R = (id, lead, opt = {}) => ({ id, lead, ...opt });
// opt: where: 'same' (only where they died) | 'other' (only somewhere else)
//      again: true (only for a second appearance)   flee: true (only while running)
export const ENCOUNTERS = [
  R('door', `{v} opens the door, and standing right there, swaying, is {d}. Or what used to be {d}. It lunges before {v} can even say the name.`),
  R('voice', `A groan drifts out of a dark room. Everyone freezes, because they know that voice. {d} staggers out of the dark and goes straight for {v}.`),
  R('clothes', `{v} spots a familiar jacket in the shadows and only has a second to realise whose it is. {d} is on {v} before the thought finishes.`),
  R('hesitate', `A {z} stumbles towards the group. {v} raises a hand to stop it, then sees the face. It's {d}. {v} hesitates, just for a heartbeat. That is all it takes.`),
  R('ankle', `Something under the car grabs {v}'s ankle and pulls. When {v} looks down, {d} is looking back up.`, { env: ['city'] }),
  R('bush', `The bushes rustle. Out of them crawls {d}, covered in leaves and very much not alive, and gets a grip on {v}'s leg.`, { env: ['forest'] }),
  R('cabin', `{v} checks one of the cabins and finds {d} sitting on the bed, perfectly still. Then not still at all.`, { env: ['ship'] }),
  R('rescue', `{v} hears someone calling weakly for help and runs to save them. It's {d}. {d} is not calling for help. {d} is just hungry.`),
  R('argument', `{v} and {a} are in the middle of a proper argument about which way to go when {d} interrupts it. By biting.`),
  R('following', `"Has anyone else noticed that {z} keeps following us?" {a} asks. Everyone turns. It's {d}. It has been following them for ages. It goes for {v}.`, { where: 'other' }),
  R('never_left', `This is where they lost {d}. And {d} never left. {d} is still here, waiting, and goes for {v} the moment the door opens.`, { where: 'same' }),
  R('followed', `{d} died back at {dloc}. Somehow, {d} has followed the group all the way here, and now {d} has caught up with {v}.`, { where: 'other' }),
  R('crowd', `In the middle of a crowd of {zs}, one face is familiar. {d}. And {d} is heading straight for {v}, faster than {d} ever moved alive.`),
  R('photo', `{v} is looking at an old photo of the group, with {d} grinning in the middle of it, when a hand lands on {v}'s shoulder. It's {d}'s hand.`),
  R('wave', `{d} is standing in the distance. For a stupid second, {v} waves. {d} does not wave back. {d} runs.`),
  R('stairs', `Footsteps on the stairs. Slow. Dragging. Then {d} comes round the corner, and {v} is the closest.`),
  R('sleep', `During a short rest, {v} wakes up to someone leaning over them. "{d}? You're..." No, {d} isn't.`),
  R('vent', `Something has been scratching in the vents for a while. It drops out right on top of {v}. It's {d}.`, { env: ['city', 'ship'] }),
  R('mirror', `{v} catches a glimpse of {d} in a broken mirror, standing right behind them. {v} turns round too late.`),
  R('last', `It's almost over. Freedom is right there. And then {d} steps out in front of {v}, one last time.`, { flee: true }),
  R('again', `It's {d} again. Of course it's {d} again. This time {d} gets hold of {v}.`, { again: true }),
  R('again2', `"Is that..." "Yes. It's {d}. AGAIN." {d} has tracked the group the whole way and finally reaches {v}.`, { again: true }),
  R('again3', `They thought they'd lost {d} for good. They were wrong. {d} comes out of nowhere and goes for {v}.`, { again: true }),
];

// How it ends: put down for good, or gone again (and maybe back later).
const HURT_TAIL = [` {v} tears free, hurt but alive.`, ` {v} gets away with an injury and a look on their face nobody will forget.`, ` {v} is hurt, but the others drag them clear.`];
const DEATH_TAIL = [` Nobody can get {v} free in time.`, ` By the time the others get there, it is too late for {v}.`];
const PUT_DOWN = [` {a} does what has to be done. {d} is finally at rest.`, ` {a} puts {d} down for good. Nobody says anything for a long time.`, ` It takes {a} three tries, but {d} goes down and stays down this time.`];
const ESCAPES = [` Before anyone can stop it, {d} staggers off into the dark. They'll see {d} again. Probably.`, ` {d} lurches away round the corner and is gone. For now.`];

// Reactions: shock and grief, but this lot are still this lot.
export const REACT = [
  [['a', '"Oh, for goodness\' sake. We lost you ages ago, {d}!"']],
  [['a', '"{d} is somehow more useful now than when they were alive."'], ['b', '"Not helping."']],
  [['a', '"Even as a zombie, {d} is STILL following us around."']],
  [['a', '"I knew {d} wouldn\'t take being out of the game well."']],
  [['a', '"{d} is dead and STILL causing problems."']],
  [['a', '"Great. Now we\'ve got to deal with {d} twice."']],
  [['a', '"That\'s the fastest I\'ve ever seen {d} move."'], ['b', '"Don\'t. Just... don\'t."']],
  [['a', '"How has {d} managed to get MORE annoying since dying?"']],
  [['a', '"Someone tell {d} they\'re not on the team anymore."']],
  [['a', '"Apparently dying wasn\'t enough to get rid of {d}."']],
  [['-', 'Nobody speaks for a moment.'], ['a', '"That was {d}. That was actually {d}."'], ['b', '"It wasn\'t. Not anymore."']],
  [['a', '"I couldn\'t do it. I looked at {d} and I just... couldn\'t."'], ['b', '"None of us could. It\'s okay."']],
  [['a', '"I really hoped we\'d never see {d} again. I didn\'t mean it like THIS."']],
  [['a', '"{d}, you absolute idiot. You couldn\'t even stay dead properly."'], ['-', 'It comes out as half a laugh and half a sob.']],
  [['a', '"Well. {d} always said they\'d come back for us."'], ['b', '"That was a THREAT?"']],
  [['a', '"Did {d} recognise us?"'], ['b', '"No."'], ['a', '"...Good. I think."']],
  [['a', '"Can we all agree we never talk about this?"'], ['b', '"We\'re going to talk about it every day."']],
  [['a', '"I still owe {d} a fiver."'], ['b', '"I think that debt\'s cancelled now."']],
];
// When the original death was one of the ridiculous accidents.
export const MISHAP_CALLBACK = {
  banana: `Zombie {d} lunges, steps on something slippery, and goes down again. Some things never change.`,
  pulldoor: `Zombie {d} has to get through a door to reach them. It pushes. It's a pull door. It pushes harder.`,
  glassdoor: `Zombie {d} walks into a glass door on the way. Twice.`,
  laces: `Zombie {d}'s shoelaces are STILL undone.`,
  trousers: `Zombie {d}'s trousers are, once again, on their way down.`,
  fence: `There's still a scrap of {d}'s underwear on that fence.`,
  celebrate: `Zombie {d} looks almost pleased with itself. It celebrated too early again.`,
  speech: `Zombie {d} opens its mouth like it's about to make a speech. Everyone flinches.`,
  sneeze: `Zombie {d} sneezes. Nobody knew zombies could sneeze.`,
  carslide: `Zombie {d} tries to climb over a car bonnet to get to them, slides off and lands on its face.`,
  window: `Zombie {d} tries to come through a window. It's closed. It's always closed.`,
  stairs: `Zombie {d} misses the last step on the way down.`,
  handbrake: `Zombie {d} is still clutching a car key.`,
  forgotjump: `Zombie {d} runs at a low wall and forgets to jump. Again.`,
  shortcut: `Zombie {d} came the "shortcut" way.`,
};
// A hint that someone is still out there.
export const HINTS = [
  `Somewhere behind them, something groans. It sounds horribly like {d}.`,
  `For a second, {a} could swear they saw {d}'s jacket in the shadows. Probably nothing.`,
  `A {z} shuffles across the far end of the street. Something about the way it walks is very familiar.`,
  `{a} stops. "Did anyone else just hear {d}'s laugh?" Nobody answers.`,
];

export function pickEncounter(s, r, { flee, again, same, env }) {
  const used = new Set([...(s.bt?.returnIds || []), ...(s.bt?.avoidReturns || [])]);
  const ok = (e) => (!e.env || e.env.includes(env)) && (!e.flee || flee) && (!!e.again === !!again) && (!e.where || (e.where === 'same') === same);
  let pool = ENCOUNTERS.filter((e) => ok(e) && !used.has(e.id));
  if (!pool.length) pool = ENCOUNTERS.filter((e) => ok(e) && !(s.bt?.returnIds || []).includes(e.id));
  return pool.length ? r.pick(pool) : null;
}
export function encounterText(e, r, death, putDown) {
  return e.lead + r.pick(death ? DEATH_TAIL : HURT_TAIL) + r.pick(putDown ? PUT_DOWN : ESCAPES);
}

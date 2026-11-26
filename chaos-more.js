// More ridiculous options and unexpected comedy stages. Most options in a stage
// stay genuine strategies: these replace one of them now and then. The funny
// option is never automatically wrong, and the sensible one is never guaranteed.
// env: only in that kind of setting (city / forest / ship), from adv.words.place.
import { O, C, safe, rush, search } from './kit.js';

const X = (id, sits, l, d, o, opt = {}) => ({ id, sits, l, d, o, ...opt });
const lines = (...a) => a;

export const MORE_CHAOS = [
  X('stare', ['blocker'], `{v} challenges it to a staring contest`, `Whoever blinks first loses. It might not have eyelids.`, [
    O(0.4, 'good', lines(`{v} plants their feet and stares. The {z} stares back. Ten seconds. Thirty. A full minute.\nThen the {z} slowly turns away and shuffles off, defeated.\n{v}: "Nobody out-stares me. NOBODY."`), [['mem', 'stare', 'v', 1], ['funny']]),
    O(0.3, 'neutral', lines(`The contest goes on. And on. {v}'s eyes are watering. The {z} does not blink. It does not have to.\nEveryone else just walks round while it is busy.\n{v}: "I'm calling it a draw."`), [['time', -1], ['funny']]),
    O(0.3, 'danger', lines(`{v} blinks first. The {z} takes this as a win, and claims its prize: {v}.`), [['em', 'v'], ['mem', 'stare', 'v', 0]]),
  ], { vpref: ['Brave', 'Reckless', 'Mysterious'] }),

  X('apologise', ['blocker'], `{v} apologises to it. Sincerely.`, `For everything. The apocalypse. The noise. All of it.`, [
    O(0.35, 'good', lines(`{v}: "Listen. I'm sorry. About all of this. It's been a rough year for everyone."\nThe {z} pauses. It almost seems... moved. It wanders away to think about it.`), [['funny']]),
    O(0.35, 'neutral', lines(`{v} apologises. Then apologises for apologising. Then apologises for taking so long.\nIt takes ages. It does not help. But nobody gets hurt.`), [['time', -1], ['funny']]),
    O(0.3, 'danger', lines(`{v}: "I just want to say, I'm really sorry for..."\nThe {z} does not accept the apology. It goes for {v}.`), [['em', 'v']]),
  ], { vpref: ['Kind', 'Nervous'] }),

  X('mannequin', ['blocker', 'hazard'], `Everyone freezes and pretends to be shop mannequins`, `Strike a pose. Hold it. Do NOT laugh.`, [
    O(0.45, 'good', lines(`{Team} freezes in a row of dramatic poses. {v} does a fashion point.\nThe {z} shuffles right past them, inspects a real mannequin very closely, and leaves.\n{v} (barely moving lips): "We should do this professionally."`), [['time', 1], ['funny']]),
    O(0.3, 'neutral', lines(`It works, but the {z} stays for twenty minutes, staring at the window display. Everyone's arms are shaking by the end.`), [['time', -2], ['funny']]),
    O(0.25, 'danger', lines(`{r} is holding a pose that is just slightly too ambitious, and wobbles. The {z} notices the wobbling mannequin and goes for {r}.`), [['em', 'r']]),
  ], { env: ['city', 'ship'] }),

  X('wheeliebin', ['blocker', 'em', 'hazard'], `{v} hides in a wheelie bin`, `It smells. It is also excellent cover.`, [
    O(0.5, 'good', lines(`{v} dives into a wheelie bin and pulls the lid shut. The {z} sniffs, decides the bin smells worse than {v}, and leaves.\n{v} (from the bin): "I'm going to need a shower. Possibly three."`), [['funny']]),
    O(0.25, 'hurt', lines(`{v} hides in the wheelie bin. The bin is on a slope. The bin starts rolling. It does not stop for a while.`), [['hurt', 'v', 1], ['funny']]),
    O(0.25, 'item', lines(`{v} hides in the bin and, while waiting, finds {loot} at the bottom of it.\n{v}: "Do NOT ask what else is in here."`), [['loot']]),
  ], { env: ['city', 'ship'], notT: true }),

  X('reverse', ['blocker'], `Try reverse psychology on it`, `"Whatever you do, do NOT walk away."`, [
    O(0.4, 'good', lines(`{v}: "Please. Whatever you do. Do NOT leave."\nThe {z} stares. Then, very slowly, it leaves.\n{v}: "Works on my little brother too."`), [['funny']]),
    O(0.35, 'neutral', lines(`{v}: "Definitely don't go left."\nThe {z} goes nowhere. It doesn't understand reverse psychology. Or psychology. Everyone goes round.`), [['time', -1], ['funny']]),
    O(0.25, 'danger', lines(`{v}: "Whatever you do, don't come over here!"\nThe {z} does exactly what it was told not to. It comes for {r}.`), [['em', 'r']]),
  ], { vpref: ['Intelligent', 'Sarcastic', 'Funny'] }),

  X('worstdriver', ['travel'], `Let the least qualified person drive`, `{v} has never driven anything. Not even a trolley. (Random route.)`, [
    O(0.4, 'good', lines(`{v} gets behind the wheel. "Which one is the go pedal?"\nNobody answers. {v} floors it anyway and, somehow, takes the fastest route anyone has ever seen.\n{v}: "I'm a natural."`), [['moveRandom'], ['time', 2], ['funny']]),
    O(0.35, 'neutral', lines(`{v} drives at four miles an hour the entire way, indicating at every turn, even though there is nobody else on the road.\nEveryone arrives eventually. Very eventually.`), [['moveRandom'], ['time', -2], ['funny']]),
    O(0.25, 'hurt', lines(`{v} confuses the brake with the accelerator, then the accelerator with the brake, then both with the horn. The car ends up in a hedge. {r} ends up in the windscreen.`), [['moveRandom'], ['hurt', 'r', 1], ['funny']]),
  ], { env: ['city'], vpref: ['Nervous', 'Reckless'] }),

  X('upsidemap', ['travel'], `Follow {v}'s map. Don't check which way up it is.`, `Confidence is everything. (Random route.)`, [
    O(0.35, 'good', lines(`{v} leads the way with total confidence. Halfway there, someone notices the map is upside down. But it was a shortcut anyway.\n{v}: "I meant to do that."`), [['moveRandom'], ['time', 1], ['funny']]),
    O(0.45, 'neutral', lines(`{v} leads everyone in a big, confident circle.\n{r}: "{v}. The map is upside down."\n{v}: "So technically we went the right way for upside-down people."`), [['moveRandom'], ['time', -2], ['funny']]),
    O(0.2, 'danger', lines(`The upside-down route leads straight into a nest of {zs}. They come for {r}.`), [['moveRandom'], ['em', 'r']]),
  ]),

  X('loudest', ['search'], `Let {v} pick what to take, using "gut feeling"`, `They will not explain the gut feeling.`, [
    O(0.45, 'item', lines(`{v} walks past everything useful, stops at a random cupboard, and pulls out {loot}.\n{v}: "The gut never lies."`), [['loot'], ['time', -1]]),
    O(0.35, 'neutral', lines(`{v}'s gut says "that one". It is a box of novelty mugs. Every single one says WORLD'S BEST DAD.\n{v}: "My gut is having a weird day."`), [['time', -1], ['funny']]),
    O(0.2, 'hurt', lines(`{v}'s gut says to reach into the dark gap behind the shelf. Something in there disagrees.`), [['hurt', 'v', 1], ['time', -1]]),
  ]),

  X('ventsing', ['hazard', 'search'], `Send the smallest person through the vent`, `{v} drew the short straw. Literally. (They were the short straw.)`, [
    O(0.5, 'item', lines(`{v} wriggles through the vent, disappears for a worrying amount of time, and comes back out covered in dust and holding {loot}.\n{v}: "Never again. But also, look what I found."`), [['loot'], ['time', -1]]),
    O(0.3, 'neutral', lines(`{v} gets stuck halfway. It takes three people, a lot of pulling and one undignified POP to get them out.`), [['time', -2], ['funny']]),
    O(0.2, 'hurt', lines(`The vent gives way and {v} drops through the ceiling of the next room, straight onto a table.`), [['hurt', 'v', 1], ['funny']]),
  ]),
];

// ---------- unexpected things that happen ----------
// Small, funny stages: most give the team something to decide, and some give
// items, injuries or an advantage. Each one happens at most once per game.
export function moreEvents(adv) {
  const A = adv.id;
  const env = adv.env || adv.words?.place || 'any';
  const E = (id, envs, o) => ({ id: `${A}_fx_${id}`, cat: 'humour', loc: '*', w: 0.7, envs, ...o });
  const all = [
    E('vending', ['city', 'ship'], {
      title: `The Last Vending Machine`,
      text: [`A vending machine glows in the dark, still working. There is exactly one snack left in it. Everyone sees it at the same time.`],
      cast: ['a', 'b'], say: [['a', `"That one's mine. I saw it first."`], ['b', `"You did NOT see it first."`]],
      choices: [
        C(`Rock, paper, scissors for it`, `The only fair way.`, [O(0.7, 'good', `{a} and {b} go best of three. Then best of five. {b} wins with a very controversial scissors. They share it anyway. Everyone feels a bit better.`, [['heal', 'injured', 1], ['funny']]), O(0.3, 'neutral', `The argument gets so heated that by the time it is settled, the snack has gone out of date. Somehow.`, [['time', -1], ['funny']])]),
        C(`Shake the machine until it drops`, `Classic technique.`, [O(0.45, 'item', `{a} shakes it. The snack drops. So does {loot} that was stuck behind it!`, [['loot']]), O(0.35, 'hurt', `The machine wobbles, tips, and lands on {a}'s foot. The snack does not drop.`, [['hurt', 'a', 1], ['funny']]), O(0.2, 'danger', `The rattling is VERY loud. Something comes for {r}.`, [['em', 'r']])]),
        C(`Split it equally between everyone`, `One crisp each. Fair is fair.`, [O(1, 'good', `Everyone gets exactly one crisp. It is the best crisp anyone has ever eaten.`, [['funny']])]),
        safe(`Leave it. No time.`, `It is just a snack.`),
        search(`Search the room while everyone argues`, `Someone has to be sensible.`, { item: 0.45, hurt: 0.05 }),
      ],
    }),
    E('chicken', ['any'], {
      title: `The Chicken Lady`,
      text: [`A survivor is sitting on a crate, completely calm, holding a chicken. The chicken is wearing a tiny jumper.\n"This is Princess," they say. "She's the only one I trust."`],
      cast: ['a', 'b?'], say: [['a', `"Hello. Is that... a chicken?"`], ['b', `"Why does the chicken have a jumper and I don't?"`]],
      choices: [
        C(`Ask if they can spare anything`, `Politely. Very politely. The chicken is watching.`, [O(0.6, 'item', `The survivor looks at Princess. Princess clucks. The survivor hands over {loot}.\n"Princess likes you."`, [['loot']]), O(0.4, 'neutral', `Princess does not like you. The survivor says no. You do not argue with Princess.`, [['time', -1], ['funny']])]),
        C(`Ask the chicken for directions`, `Princess seems to know things.`, [O(0.45, 'good', `{a} asks the chicken. The chicken turns and stares down one road. The survivor nods: "That way's clear." It is.`, [['shortcut', 1], ['funny']]), O(0.55, 'neutral', `Princess pecks {a}'s shoelace. That is the whole answer.`, [['time', -1], ['funny']])]),
        C(`Invite them to come along`, `Safety in numbers. And chickens.`, [O(0.5, 'neutral', `"No thank you. Princess doesn't like crowds." They wave goodbye. Princess does not.`, [['funny']]), O(0.5, 'good', `They cannot come, but they tell {team} exactly where the danger is ahead. Very useful. Princess clucks in agreement.`, [['time', 1]])]),
        safe(`Back away slowly from the chicken`, `Something about that chicken is not right.`),
        rush(`Keep going. No time for chickens.`, `There is never time for chickens.`, { hurt: 0.08, danger: 0.05 }),
      ],
    }),
    E('horn', ['city'], {
      title: `The Horn`,
      text: [`Every abandoned car on the street is silent. The team needs to get past them quietly. {a} is leaning on one, catching their breath.`],
      cast: ['a', 'b?'], say: [['b', `"{a}. Whatever you do. Don't touch the..."`]],
      choices: [
        C(`Very, VERY carefully stand up`, `Slowly. Gently.`, [O(0.55, 'good', `{a} stands up so slowly it takes a full minute. Nothing beeps. Everyone breathes again.`, [['funny']]), O(0.45, 'danger', `{a} stands up perfectly. Then sits back down by accident. HOOOONK. It is the loudest, most embarrassing horn in the city. Everything comes for {r}.`, [['em', 'r'], ['funny']])]),
        C(`Use the car alarm as a distraction on purpose`, `Set it off, then run the other way.`, [O(0.6, 'good', `HOOOONK. Every {z} on the street heads for the car, while {team} goes the other way. It works brilliantly.`, [['time', 1]]), O(0.4, 'danger', `HOOOONK. Most of them go to the car. One goes for {r}.`, [['em', 'r']])]),
        search(`Check the cars for supplies first`, `Glove boxes, boots, under seats.`, { item: 0.5, hurt: 0.1, danger: 0.1 }),
        safe(`Keep moving, quietly`, `Hands off every car.`),
        rush(`Sprint down the middle of the road`, `Fast and exposed.`, { hurt: 0.15, danger: 0.12 }),
      ],
    }),
    E('outfit', ['any'], {
      title: `Dressing Up`,
      text: [`A box of abandoned clothes. Warm, clean and dry. Unfortunately it is all fancy dress: a banana costume, a pirate hat, a wedding dress and a full-body dinosaur suit.`],
      cast: ['a', 'b'], say: [['a', `"I'm cold enough to wear the banana."`], ['b', `"You're not wearing the banana."`]],
      choices: [
        C(`{a} wears the dinosaur suit`, `Warm. Padded. Ridiculous.`, [O(0.6, 'good', `{a} zips up the dinosaur suit. It is warm, it is padded, and every {z} that sees it seems genuinely confused.\n{a}: "I'm never taking this off."`, [['heal', 'a', 1], ['funny']]), O(0.4, 'hurt', `{a} cannot see properly in the dinosaur head and walks straight off a step.`, [['hurt', 'a', 1], ['funny']])]),
        C(`{b} wears the banana. As a joke.`, `It stops being a joke very fast.`, [O(0.5, 'neutral', `{b} wears the banana. Nobody can take {b} seriously for the rest of the stage. Morale, though, is excellent.`, [['funny']]), O(0.5, 'good', `The banana is surprisingly warm. {b} refuses to take it off and, honestly, nobody blames them.`, [['heal', 'b', 1], ['funny']])]),
        C(`Use the clothes as bandages`, `Practical. Very unfunny.`, [O(1, 'good', `The wedding dress makes excellent bandages. Someone feels much better.`, [['heal', 'injured', 1]])]),
        search(`Dig through the rest of the box`, `There might be something useful under the tutu.`, { item: 0.45, hurt: 0.05 }),
        safe(`Leave it all. Keep moving.`, `Dignity intact.`),
      ],
    }),
    E('valuable', ['any'], {
      title: `Treasure`,
      text: [`{a} pulls a heavy metal case out from under a desk. It is locked. It looks VERY important.`],
      cast: ['a', 'b'], say: [['a', `"This could be anything. Weapons. Medicine. GOLD."`], ['b', `"Or it could be paperwork."`]],
      choices: [
        C(`Spend ages breaking it open`, `It has to be worth it.`, [O(0.35, 'item', `Twenty minutes, one broken nail and a lot of swearing later, it opens. Inside: {loot}. Worth it.`, [['loot'], ['time', -2]]), O(0.65, 'neutral', `Twenty minutes later it finally opens. Inside: a signed photo of a weatherman and a single, very old sandwich.\n{a}: "...I'm keeping the photo."`, [['time', -2], ['funny']])]),
        C(`Carry it unopened. Open it later.`, `Heavy, but exciting.`, [O(0.5, 'neutral', `{a} lugs the case around for ages, gets tired, and leaves it on a wall. Nobody will ever know what was in it.`, [['time', -1], ['funny']]), O(0.5, 'hurt', `{a} drops it on their own foot. Twice.`, [['hurt', 'a', 1], ['funny']])]),
        C(`Ask {b} to guess the code`, `Birthdays? 1234? 0000?`, [O(0.3, 'item', `{b}: "1234." Click. Nobody can believe it. Inside: {loot}.`, [['loot']]), O(0.7, 'neutral', `{b} tries every code they can think of. It does not open. It will never open.`, [['time', -1], ['funny']])]),
        safe(`Leave the mystery box`, `Some mysteries are best left alone.`),
        search(`Search the rest of the office instead`, `Desks, drawers, cupboards.`, { item: 0.45, hurt: 0.08 }),
      ],
    }),
    E('headphones', ['any'], {
      title: `Bad Music`,
      text: [`A {z} sways in the middle of the path, wearing a big pair of headphones. Tinny pop music is still leaking out of them. It is nodding along. It has no idea anyone is here.`],
      cast: ['a', 'b?'], say: [['a', `"Is it... vibing?"`], ['b', `"It's VIBING."`]],
      choices: [
        safe(`Sneak past while it is distracted`, `It cannot hear a thing.`, { time: 0 }),
        C(`Steal its headphones`, `They look expensive.`, [O(0.45, 'good', `{a} creeps up and lifts the headphones off. The {z} keeps nodding to music that is no longer there. {a} is very pleased.`, [['funny']]), O(0.55, 'danger', `The music stops. The {z} looks round, deeply offended, straight at {a}.`, [['em', 'a']])]),
        C(`Turn the volume all the way up`, `It will never hear you coming.`, [O(0.5, 'good', `{a} turns it up to max. Every {z} nearby hears the music and shambles towards it, while {team} slips away.`, [['time', 1]]), O(0.5, 'danger', `The music is SO loud now that every {z} nearby comes over, including the one heading for {r}.`, [['em', 'r']])]),
        search(`Search the area while it is busy`, `It is not going to notice.`, { item: 0.5, hurt: 0.05, danger: 0.08 }),
        C(`Dance past it, in time to the music`, `If you can't beat them...`, [O(0.5, 'good', `{Team} dances past in perfect time. The {z} nods approvingly.`, [['funny']]), O(0.5, 'hurt', `{a} misses the beat, trips over a kerb and lands hard.`, [['hurt', 'a', 1], ['funny']])]),
      ],
    }),
    E('frontseat', ['city'], {
      title: `Shotgun`,
      text: [`A working car! Keys in the ignition! There is just one problem: everyone wants the front seat.`],
      cast: ['a', 'b'], say: [['a', `"SHOTGUN!"`], ['b', `"You can't call shotgun in an APOCALYPSE!"`]],
      choices: [
        C(`Settle it fairly: a sprint to the car`, `First one to touch the door wins.`, [O(0.5, 'good', `{a} and {b} sprint. {b} wins by a nose, and the car pulls off faster than anyone has moved all day.`, [['time', 2], ['funny']]), O(0.5, 'hurt', `{a} and {b} reach the door at the same time and collide. Hard.`, [['hurt', 'a', 1], ['time', 1], ['funny']])]),
        C(`New rule: nobody gets the front seat`, `Everyone in the back. All of them.`, [O(1, 'neutral', `Everyone squeezes into the back seat. The front seat stays empty. Nobody is happy. The car drives on anyway.`, [['time', 1], ['funny']])]),
        C(`Let them argue while someone else just drives`, `Problem solved.`, [O(0.6, 'good', `While {a} and {b} argue, someone quietly gets in, starts it, and drives off with both of them chasing. They get in eventually.`, [['time', 1], ['funny']]), O(0.4, 'danger', `The arguing draws an audience. One comes for {r}.`, [['em', 'r']])]),
        search(`Check the car before anyone gets in`, `Boot, glove box, under the seats.`, { item: 0.5, hurt: 0.05, danger: 0.08 }),
        safe(`Leave the car. It's too loud.`, `Walking is quieter.`),
      ],
    }),
    E('rumble', ['any'], {
      title: `The Noise`,
      text: [`Total silence. Then, from somewhere very close, a long, deep, terrible growl. Everybody freezes. Then another one.`],
      cast: ['a', 'b'], say: [['b', `"What WAS that?"`], ['a', `(very quietly) "...No idea."`]],
      choices: [
        C(`Everyone grab a weapon and get ready`, `It sounded BIG.`, [O(0.7, 'neutral', `Everyone stands ready, hearts pounding. Then the growl comes again. It is {a}'s stomach.\n{a}: "...I skipped lunch."`, [['time', -1], ['funny']]), O(0.3, 'danger', `It was {a}'s stomach. But all that tense shuffling attracted something real. It comes for {r}.`, [['em', 'r']])]),
        C(`Feed {a} immediately`, `Everyone knows it was {a}'s stomach.`, [O(0.7, 'good', `{a} eats a cereal bar in three bites. The growling stops. Everyone can concentrate again.`, [['heal', 'a', 1], ['funny']]), O(0.3, 'neutral', `{a} eats something. The stomach is not satisfied. It growls the whole way.`, [['funny']])]),
        safe(`Back away from the noise`, `Whatever it was, avoid it.`),
        search(`Look for whatever made that noise`, `Bravely. Very bravely.`, { item: 0.4, hurt: 0.05, danger: 0.05 }),
        rush(`Run from the noise`, `Nobody waits to find out.`, { hurt: 0.15, danger: 0.05 }),
      ],
    }),
    E('autodoor', ['city', 'ship'], {
      title: `The Door That Hates {a}`,
      text: [`An automatic door slides open for everyone. Except {a}. Every time {a} steps up to it, it stays firmly shut.`],
      cast: ['a', 'b?'], say: [['a', `"WHY DOESN'T IT LIKE ME?"`], ['b', `"It knows something we don't."`]],
      choices: [
        C(`Everyone waves their arms at the sensor`, `Group effort.`, [O(0.7, 'good', `Everyone waves at once. The door gives up and opens. {a} walks through very slowly, glaring at it.`, [['funny']]), O(0.3, 'danger', `All that waving gets noticed by the wrong audience. Something comes for {r}.`, [['em', 'r']])]),
        C(`{a} crawls under the sensor`, `It can't refuse what it can't see.`, [O(0.6, 'good', `{a} commando-crawls through. Victory. Dignity: zero.`, [['funny']]), O(0.4, 'hurt', `The door closes on {a} halfway. It does not apologise.`, [['hurt', 'a', 1], ['funny']])]),
        C(`Prise it open by hand`, `The doors are not that heavy.`, [O(0.6, 'good', `It takes two people and a lot of grunting, but the door opens.`, [['time', -1]]), O(0.4, 'hurt', `The door snaps shut on {r}'s fingers.`, [['hurt', 'r', 1]])]),
        safe(`Find a different way in`, `There's always a back door.`),
        search(`Search round the side while you're here`, `Bins, side rooms, staff areas.`, { item: 0.45, hurt: 0.08 }),
      ],
    }),
    E('note', ['any'], {
      title: `A Note for Survivors`,
      text: [`A note is pinned to a door: "TO ANY SURVIVORS: The safest way out is..." and that is it. The rest has been torn off.`],
      cast: ['a', 'b'], say: [['a', `"WHY would you tear off THAT bit?"`], ['b', `"Maybe they wanted us to work for it."`]],
      choices: [
        search(`Look for the rest of the note`, `It has to be nearby.`, { item: 0.4, hurt: 0.08, t: { item: [`{a} finds the other half of the note under a mat. It says: "...is to bring snacks." Taped to it is {loot}.`], none: [`{a} finds the other half of the note. It says "...not this way, obviously." Very helpful.`] } }),
        C(`Write your own note for the next survivors`, `Pay it forward.`, [O(1, 'neutral', `{b} writes: "TO ANY SURVIVORS: The safest way out is" and then tears it off.\n{a}: "WHY?"\n{b}: "Tradition."`, [['funny']])]),
        C(`Go through the door anyway`, `The note was on it. It must mean something.`, [O(0.5, 'good', `Behind the door is a clear route out. Maybe that was the safest way.`, [['shortcut', 1]]), O(0.5, 'danger', `Behind the door: the reason the note was torn off. It goes for {r}.`, [['em', 'r']])]),
        safe(`Ignore it and move on`, `Notes are not to be trusted.`),
        rush(`Go the other way, quickly`, `If that way was safe, why tear it off?`, { hurt: 0.12, danger: 0.08 }),
      ],
    }),
    E('cool', ['any'], {
      title: `Looking Cool`,
      text: [`{a} has found a pair of sunglasses and a long coat. {a} has decided that, from now on, they are the cool one.`],
      cast: ['a', 'b'], say: [['a', `"I'll take it from here." (puts on sunglasses)`], ['b', `"It's night time."`]],
      choices: [
        C(`Let {a} lead, coat and all`, `Maybe the confidence will help.`, [O(0.45, 'good', `{a} walks ahead like they are in a music video. Somehow, it actually makes everyone braver, and the next stretch goes perfectly.`, [['time', 1], ['funny']]), O(0.55, 'hurt', `{a} cannot see anything in sunglasses at night and walks straight into a lamp post.`, [['hurt', 'a', 1], ['funny']])]),
        C(`Make {a} take the sunglasses off`, `Safety first. Cool second.`, [O(1, 'neutral', `{a} takes them off with a sigh. "Fine. But I'm keeping the coat." The coat is very warm, actually.`, [['funny']])]),
        C(`Everyone puts on sunglasses`, `If you can't beat them.`, [O(0.5, 'neutral', `The whole group walks on in sunglasses, very slowly, very carefully, looking absolutely amazing.`, [['time', -1], ['funny']]), O(0.5, 'danger', `Nobody can see anything. Something walks right up to {r}.`, [['em', 'r']])]),
        search(`Search the rest of the wardrobe`, `There might be more than coats.`, { item: 0.45, hurt: 0.05 }),
        safe(`Leave {a} to it and keep moving`, `Some battles aren't worth it.`, { time: 0 }),
      ],
    }),
    E('kayak', ['forest'], {
      title: `The Canoe`,
      text: [`A canoe sits on the riverbank with one paddle. The river is going exactly the right way. Everyone has very strong opinions about canoes.`],
      cast: ['a', 'b'], say: [['a', `"I've done this before."`], ['b', `"You've done this on a lake. In a holiday brochure."`]],
      choices: [
        C(`Pile into the canoe`, `Fast, if nobody stands up.`, [O(0.45, 'good', `Somehow everyone fits, nobody stands up, and the river carries {team} a long way in no time at all.`, [['time', 2], ['funny']]), O(0.35, 'hurt', `{a} stands up to point at something. The canoe flips. Everyone is soaked, and {r} gets bashed against a rock.`, [['hurt', 'r', 1], ['funny']]), O(0.2, 'neutral', `The canoe goes round and round in circles for ten minutes. One paddle. Of course.`, [['time', -1], ['funny']])]),
        C(`Use the canoe as a raft for the bags only`, `Walk alongside it.`, [O(0.7, 'good', `It works perfectly. Nobody has to carry anything for a while.`, [['time', 1]]), O(0.3, 'neutral', `The canoe floats off without anyone. With the bags. {a} wades in after it.`, [['time', -1], ['funny']])]),
        safe(`Walk along the bank`, `Slow and dry.`),
        search(`Check the riverbank for supplies`, `Fishermen leave things behind.`, { item: 0.45, hurt: 0.08 }),
        rush(`Wade straight across`, `Wet, quick and risky.`, { hurt: 0.2, danger: 0.05 }),
      ],
    }),
  ];
  return all.filter((e) => e.envs.includes('any') || e.envs.includes(env)).map(({ envs, ...e }) => e);
}

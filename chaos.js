// Chaos options: ridiculous decisions that viewers vote for on purpose.
// They are mixed into ordinary stages (replacing one normal option), always
// play out properly, and can come back later as payoffs and callbacks.
// Outcome kinds keep the risk labels honest, exactly like normal options.
import { O, C, safe, rush, search } from './kit.js';

// {v} is the volunteer chosen when the option appears (so chat can see who it is).
// fx 'mem' records who did what, for callbacks and payoff events later.
const X = (id, sits, l, d, o, opt = {}) => ({ id, sits, l, d, o, ...opt });
const lines = (...a) => a; // readability helper for text variants

export const CHAOS = [
  // ---------- something is blocking the way ----------
  X('negotiate', ['blocker'], `Send {v} to negotiate with it`, `Diplomacy has never been tried. There is probably a reason. (A whole scene.)`, [
    O(0.8, 'neutral', lines(`{v} straightens up, walks over and clears their throat.\n{v}: "Excuse me. Can we talk?"\nThe {z} stops. Tilts its head. It is... listening?\nNegotiations are open.`), [['nextcx', 'talks']]),
    O(0.2, 'danger', lines(`{v}: "Let's start with some trust exercises."\nTalks break down immediately. Mostly because it lunges at {v}.`), [['mem', 'negotiate', 'v', 0], ['em', 'v']]),
  ], { vpref: ['Funny', 'Intelligent', 'Mysterious', 'Brave'], vpersona: ['bravo'], req: { nomem: 'negotiate' } }),

  X('negotiate2', ['blocker'], `Send {@negotiate} to negotiate again`, `They have experience now. Sort of.`, [
    O(0.45, 'good', lines(`{@negotiate}: "We meet again. Different {z}, same rules."\nIt sways. {@negotiate} stares it down. The {z} blinks first and wanders off.\n{@negotiate}: "Undefeated." (They are not undefeated.)`), [['mem', 'negotiate', '@negotiate', 1], ['funny']]),
    O(0.25, 'neutral', lines(`{@negotiate} opens with a joke. The {z} does not laugh. Tough crowd. {Team} goes round.`), [['time', -1], ['funny']]),
    O(0.3, 'danger', lines(`{@negotiate}: "Remember me?"\nIt does not remember {@negotiate}. It does not want to talk. It wants {@negotiate}.`), [['mem', 'negotiate', '@negotiate', 0], ['em', '@negotiate']]),
  ], { req: { mem: 'negotiate' }, w: 2.5 }),

  X('zwalk', ['blocker'], `Everyone pretends to be {zs} and casually walks past`, `Arms out. Groan a bit. Commit to the bit.`, [
    O(0.45, 'good', lines(`Arms out. Groaning. Dead eyes. {Team} shuffles past in a perfect line.\nThe {z} watches them go... and gives a small, respectful groan back.\n{v} (under breath): "Nobody. Break. Character."`, `It should not work. It completely works. {v} even adds a little limp for realism, and the {z} lets the whole group shuffle by.`), [['mem', 'zwalk', 'v', 1], ['time', 1], ['funny']]),
    O(0.35, 'danger', lines(`Halfway past, {r} sneezes.\nThe {z} turns. It is not fooled. It was never fooled.`, `It is going well until {r} starts groaning a little TOO enthusiastically. The {z} looks almost offended, and lunges.`), [['em', 'r'], ['mem', 'zwalk', 'r', 0]]),
    O(0.2, 'neutral', lines(`It works too well. A second {z} joins the line and shuffles along with {team} for three streets before wandering off.\n{v}: "...Should we have said bye?"`), [['mem', 'zwalk', 'v', 1], ['time', -1], ['funny']]),
  ], { req: { nomem: 'zwalk' } }),

  X('zwalk2', ['blocker'], `Do the zombie walk again`, `It worked last time. {@zwalk} has been practising.`, [
    O(0.55, 'good', lines(`The second performance is even better. {@zwalk} adds a dramatic drool. The {z} does not even look up.\n{@zwalk}: "Thank you. Thank you. No autographs."`), [['time', 1], ['funny']]),
    O(0.3, 'danger', lines(`Sequels are never as good. The {z} sees straight through it and goes for {r}.`), [['em', 'r']]),
    O(0.15, 'neutral', lines(`Everyone does the walk. Everyone is slightly embarrassed. It works, slowly.`), [['time', -1]]),
  ], { req: { memOk: 'zwalk' }, w: 2 }),

  X('playdead', ['blocker'], `Everyone lies down and plays dead`, `If it thinks you are already dead, why would it bother?`, [
    O(0.35, 'good', lines(`{Team} drops to the floor. Total stillness.\nThe {z} shuffles over, sniffs {v}'s ear for a horribly long time... and wanders off.\n{v}: "I am never washing that ear again. For different reasons."`), [['mem', 'playdead', 'v', 1], ['funny']]),
    O(0.25, 'neutral', lines(`Everyone lies down. The {z} lies down too.\nNobody knows what is happening. Twenty minutes later it gets up and leaves, and so does everyone else, very confused.`), [['mem', 'playdead', 'v', 1], ['time', -2], ['funny']]),
    O(0.3, 'danger', lines(`{r} plays dead brilliantly. Too brilliantly: the {z} decides they look like lunch.`), [['em', 'r'], ['mem', 'playdead', 'r', 0]]),
    O(0.1, 'hurt', lines(`The {z} steps right on {v}'s hand on its way past.\n{v} (through gritted teeth): "...still... dead..."`), [['hurt', 'v', 1], ['mem', 'playdead', 'v', 1], ['funny']]),
  ]),

  X('name', ['blocker'], `{v} names it {zname} and tries to make friends`, `It does look like a {zname}. Maybe it is friendly?`, [
    O(0.5, 'good', lines(`{v}: "Hello {zname}. Who's a good {z}? You are."\n{zname} tilts its head... and wanders off down a side street.\n{v}: "He'll be back. I can feel it."`), [['flag', 'cx_named'], ['mem', 'namer', 'v', 1], ['funny']]),
    O(0.35, 'danger', lines(`{v}: "Easy, {zname}. Easy..."\n{zname} is not easy. {zname} lunges straight at {v}.`), [['flag', 'cx_named'], ['mem', 'namer', 'v', 0], ['em', 'v']]),
    O(0.15, 'hurt', lines(`{v} reaches out to pat {zname} on the head. {zname} snaps at the air and {v} falls backwards over a bin.\n{v}: "He's just shy!"`), [['flag', 'cx_named'], ['mem', 'namer', 'v', 0], ['hurt', 'v', 1]]),
  ], { vpref: ['Kind', 'Funny', 'Nature lover'], req: { not: 'cx_named', nomem: 'namer' } }),

  X('shoe', ['blocker'], `{v} throws a shoe at it`, `A distraction. Or a declaration of war.`, [
    O(0.4, 'good', lines(`{v} pulls off a shoe and launches it. It bounces off the {z}'s head with a hollow BONK.\nIt turns to chase the shoe. {Team} slips past.\n{v}: "Goodbye, shoe. You were a good shoe."`), [['mem', 'shoe', 'v', 1], ['funny']]),
    O(0.25, 'neutral', lines(`The shoe misses by a mile and lands on a roof.\n{v}: "...My aim is better in my head."\n{Team} goes the long way round, with {v} hopping.`), [['mem', 'shoe', 'v', 0], ['time', -1], ['funny']]),
    O(0.35, 'danger', lines(`BONK. Direct hit. The {z} is now VERY interested in where that shoe came from. It comes for {v}.`), [['mem', 'shoe', 'v', 0], ['em', 'v']]),
  ], { vpref: ['Reckless', 'Funny'], req: { nomem: 'shoe' } }),

  X('lullaby', ['blocker'], `{v} sings it a lullaby`, `Maybe it is just tired?`, [
    O(0.35, 'good', lines(`{v} starts singing, very softly. The {z} sways. Its eyes droop. It slumps against a wall.\nEveryone tiptoes past during the second verse.\n{v} (whispering): "Works on my little cousin too."`), [['mem', 'sing', 'v', 1], ['funny']]),
    O(0.25, 'neutral', lines(`The {z} does not fall asleep. But it does sway along. Everyone sneaks past while it is enjoying the music.`), [['mem', 'sing', 'v', 1], ['time', -1], ['funny']]),
    O(0.4, 'danger', lines(`{v} hits a high note. The {z} hates the high note. EVERY {z} nearby hates the high note. They come for {r}.`), [['mem', 'sing', 'v', 0], ['em', 'r']]),
  ], { vpref: ['Kind', 'Funny'] }),

  X('duck', ['blocker', 'hazard'], `Squeeze the rubber duck at it`, `It has come to this.`, [
    O(0.6, 'good', lines(`SQUEAK.\nThe {z} freezes. Its head turns slowly towards the tiny yellow duck. {v} lobs it down the street. SQUEAK. It follows. {v} runs to grab it back afterwards.\nIt works. It actually works.`), [['time', 1], ['funny']]),
    O(0.25, 'neutral', lines(`SQUEAK.\nNothing. {v} squeaks it again, sadly. {Team} goes the long way round.`), [['time', -1]]),
    O(0.15, 'danger', lines(`SQUEAK. Every {z} in the area turns round at once. Oh no.`), [['em', 'r']]),
  ], { req: { items: ['duck'] }, w: 2 }),

  X('danceoff', ['blocker'], `Challenge it to a dance-off`, `Winner gets to not be eaten. (A whole scene.)`, [
    O(0.85, 'neutral', lines(`{v} steps forward and points dramatically at the {z}.\n{v}: "You. Me. Dance-off. Right now."\nSomebody starts beatboxing. The {z}... sways. It accepts.`), [['nextcx', 'dance']]),
    O(0.15, 'danger', lines(`{v}: "Dance-off!"\nThe {z} does not dance. The {z} lunges at {v}.`), [['em', 'v']]),
  ], { vpref: ['Funny', 'Reckless'], vpersona: ['toddy', 'hyrisha', 'bravo'] }),

  X('talent', ['blocker', 'people'], `Distract them with a talent show`, `The show must go on. (A whole scene.)`, [
    O(0.9, 'neutral', lines(`{v} jumps onto a bin.\n{v}: "LADIES AND GENTLEMEN. AND {Zs}."\nSomehow, everyone stops to watch. The show has begun.`), [['nextcx', 'talent']]),
    O(0.1, 'danger', lines(`{v} jumps onto a bin to announce the show. The bin collapses. Everything comes for {r}.`), [['em', 'r']]),
  ], { vpref: ['Funny', 'Brave'], vpersona: ['leyla', 'hiwi'] }),

  X('bribe', ['blocker'], `Bribe it with your snacks`, `Everyone has a price.`, [
    O(0.45, 'good', lines(`{v} holds out a biscuit. The {z} stares at it. Then at {v}. Then it takes the biscuit and wanders off with it, like it has somewhere to be.\n{v}: "Everyone has a price."`), [['funny']]),
    O(0.3, 'danger', lines(`It does not want the biscuit. It wants the hand holding the biscuit.`), [['em', 'v']]),
    O(0.25, 'neutral', lines(`It eats the biscuit. Then it waits for another one. And another. Ten biscuits later, {team} finally sneaks past.\n{v}: "That was the good packet."`), [['time', -1], ['funny']]),
  ], { vpersona: ['doa', 'hyrisha'] }),

  X('bindisguise', ['blocker', 'hazard'], `Disguise {v} as a bin`, `Nobody looks twice at a bin.`, [
    O(0.45, 'good', lines(`{v} puts a bin over their head. Two eye holes. Total commitment.\nThe {z} walks right past the bin. The bin waddles away. Everyone follows the bin.`), [['funny'], ['time', 1]]),
    O(0.3, 'neutral', lines(`{v} gets stuck in the bin. It takes four people and ten minutes to get them out.\n{v} (muffled): "THIS IS FINE."`), [['time', -1], ['funny']]),
    O(0.25, 'danger', lines(`The bin is very convincing. Unfortunately, the {z} is very hungry, and bins sometimes have food in them. It knocks the bin over. It goes for {r}.`), [['em', 'r']]),
  ], { vpersona: ['bravo', 'toddy'] }),

  X('peekaboo', ['blocker'], `Play peekaboo with it`, `It works on babies.`, [
    O(0.35, 'good', lines(`{v} hides behind a car.\n{v}: "Peekaboo!"\nThe {z} jumps. Actually jumps. Then it gets confused, wanders round the car the wrong way, and gets lost.`), [['funny']]),
    O(0.4, 'danger', lines(`{v}: "Peeka..."\nIt does not wait for the boo.`), [['em', 'v']]),
    O(0.25, 'neutral', lines(`Peekaboo goes on for an uncomfortably long time. Nobody is sure who is winning. {Team} eventually sneaks off.`), [['time', -1], ['funny']]),
  ]),

  X('meeting', ['hazard', 'people'], `Call an emergency team meeting about it`, `With minutes. And an agenda.`, [
    O(0.55, 'neutral', lines(`{v}: "Item one: the problem. Item two: who caused the problem. Item three: snacks."\nThe meeting runs over. They always do.`), [['time', -2], ['funny']]),
    O(0.3, 'good', lines(`It is the most organised anyone has been all day. Somebody writes it on a wall. A plan actually comes out of it.\n{v}: "Meeting adjourned."`), [['heal', 'injured', 1]]),
    O(0.15, 'danger', lines(`Item four is interrupted by something walking into the meeting. It goes for {r}.`), [['em', 'r']]),
  ], { vpersona: ['leyla', 'isma'] }),

  X('nottoday', ['hazard'], `Yell "NOT TODAY!" and charge at the problem`, `Motivational. Possibly stupid.`, [
    O(0.5, 'good', lines(`{v}: "NOT! TODAY!"\nEveryone charges. It is loud, it is messy, and somehow everyone gets through.`), [['time', 1], ['funny']]),
    O(0.4, 'hurt', lines(`{v}: "NOT TODAY!"\nThe problem: "Yes today." {r} gets hurt.`), [['hurt', 'r', 1], ['funny']]),
    O(0.1, 'danger', lines(`The yelling works great. On every {z} in earshot. They come for {r}.`), [['em', 'r']]),
  ], { vpersona: ['loni', 'toddy'] }),

  X('interview', ['people'], `Give them a proper job interview first`, `"Where do you see yourself in five minutes?"`, [
    O(0.5, 'neutral', lines(`{v}: "So. Tell me about your strengths."\nIt is a long interview. Everyone learns a lot. Nobody gets the job.`), [['time', -1], ['funny']]),
    O(0.3, 'good', lines(`{v}: "Biggest weakness?"\n"Honestly? Zombies."\n{v}: "Same. You're hired."\nIt is weirdly bonding. Spirits lift.`), [['heal', 'injured', 1], ['funny']]),
    O(0.2, 'danger', lines(`The interview takes so long that something else turns up uninvited. It goes for {r}.`), [['em', 'r']]),
  ], { vpersona: ['isma', 'sonila'] }),

  X('conga', ['travel'], `Travel in a conga line`, `Morale first, safety second. (Random route.)`, [
    O(0.5, 'good', lines(`{v} starts the conga. Everyone joins. Da-da-da-da-da-da-da HEY! It is ridiculous and it is the happiest anyone has been all day.`), [['moveRandom'], ['heal', 'injured', 1]]),
    O(0.3, 'hurt', lines(`The conga goes round a corner too fast. {r} gets flung into a hedge.`), [['moveRandom'], ['hurt', 'r', 1], ['funny']]),
    O(0.2, 'danger', lines(`The conga picks up an extra member at the back. Nobody invited it. It goes for {r}.`), [['moveRandom'], ['em', 'r']]),
  ]),

  X('trolley', ['travel'], `Everyone rides in shopping trolleys`, `Fast. Uncontrollable. Glorious. (Random route.)`, [
    O(0.45, 'good', lines(`Three trolleys. One hill. Zero brakes. {Team} screams the whole way down and arrives in record time.`), [['moveRandom'], ['time', 2], ['funny']]),
    O(0.4, 'hurt', lines(`The trolleys go fast. The trolleys do not go straight. {r} comes off worst.`), [['moveRandom'], ['hurt', 'r', 1], ['funny']]),
    O(0.15, 'danger', lines(`The squeaking wheels can be heard for miles. Something follows the noise to {r}.`), [['moveRandom'], ['em', 'r']]),
  ], { vpersona: ['toddy'] }),

  // ---------- someone is in immediate danger ----------
  X('rap', ['em'], `{v} drops a freestyle rap at it`, `Bars. In a crisis.`, [
    O(0.4, 'good', lines(`{v}: "Yo! Step back, you're rotten and slow / I'm alive, you're not, so it's time to GO!"\nThe {z} is so confused it lets go of {t}.`), [['funny'], ['hero']]),
    O(0.4, 'hurt', lines(`The rap is bad. The {z} is unimpressed, and it takes it out on {t}.`), [['hurt', 't', 1]]),
    O(0.2, 'death', lines(`The beat drops. So does {t}. The rap did not help.`), [['bite', 't']]),
  ], { notT: true, vpersona: ['loni', 'gaza'] }),
  X('scream', ['em'], `{v} screams back at it, even louder`, `Fight fear with volume.`, [
    O(0.45, 'good', lines(`{v} lets out a scream so loud it echoes for miles.\nThe {z} actually flinches and backs away from {t}.\n{t}: "...Thanks? I think I'm deaf now."`), [['mem', 'scream', 'v', 1], ['hero'], ['funny']]),
    O(0.35, 'hurt', lines(`The scream startles it, but not enough. It still catches {t} on the way past.`), [['hurt', 't', 1], ['mem', 'scream', 'v', 0]]),
    O(0.2, 'death', lines(`It does not work. The scream just tells every {z} nearby where the party is. {t} does not get away.`), [['bite', 't']]),
  ], { vpref: ['Reckless', 'Funny', 'Brave'], notT: true }),

  X('hug', ['em'], `{v} tries to hug it`, `Everyone deserves love. Probably.`, [
    O(0.3, 'good', lines(`{v} opens their arms wide and walks towards it. The {z} has absolutely no idea what is happening. While it stands there, baffled, {t} escapes.\n{v}: "I think it needed that."`), [['mem', 'hug', 'v', 1], ['funny']]),
    O(0.55, 'hurt', lines(`The {z} accepts the hug. Then it accepts {v}'s shoulder. With its teeth.\n{v}: "OKAY, HUG OVER!"`), [['hurt', 'v', 1], ['mem', 'hug', 'v', 0]]),
    O(0.15, 'death', lines(`{v}: "Bring it in!"\nIt brings it in. All the way in. Nobody can pull {v} free in time.`), [['kill', 'v', 'tried to hug a zombie']]),
  ], { vpref: ['Kind', 'Loyal'], notT: true }),

  X('throwall', ['em'], `Throw EVERYTHING in the backpack at it`, `Every single thing. You will probably lose something.`, [
    O(0.55, 'good', lines(`Bottles, bandages, a sock, half a sandwich. {Team} unloads the whole backpack at it. Something heavy hits the right spot and {t} gets away.\nNot everything is coming back, though.`), [['lose'], ['funny']]),
    O(0.3, 'hurt', lines(`Everything is thrown. Almost nothing hits. It still gets a swipe at {t}.`), [['lose'], ['hurt', 't', 1]]),
    O(0.15, 'death', lines(`The backpack hits it in the face. It does not even blink. {t} does not get away.`), [['bite', 't']]),
  ], { req: { anyInv: true } }),

  X('lamppost', ['em'], `{t} stands perfectly still and pretends to be a lamp post`, `Be the lamp post.`, [
    O(0.4, 'good', lines(`{t} freezes, arms stiff, chin up. Fully committing to being a lamp post.\nThe {z} sniffs {t}. Licks {t}. And wanders off.\n{t}: "...I need a shower. A long one."`), [['funny']]),
    O(0.4, 'hurt', lines(`Unfortunately, {zs} do not care about lamp posts. It bites the lamp post.`), [['hurt', 't', 1]]),
    O(0.2, 'death', lines(`It turns out that being a lamp post is not a survival strategy. {t} is caught standing still.`), [['bite', 't']]),
  ]),

  X('duckem', ['em'], `Squeeze the rubber duck!`, `SQUEAK!`, [
    O(0.65, 'good', lines(`SQUEAK!\nThe {z} snaps round towards the noise, and {t} rolls clear.\n{t}: "Saved by a DUCK. I will never live this down."`), [['funny'], ['hero']]),
    O(0.35, 'hurt', lines(`SQUEAK! It looks at the duck. Then it looks back at {t}, slightly annoyed.`), [['hurt', 't', 1]]),
  ], { req: { items: ['duck'] }, w: 2 }),

  // ---------- an obstacle or hazard ----------
  X('runup', ['hazard'], `Do a dramatic run-up and jump it`, `Like an action movie. With worse knees.`, [
    O(0.5, 'good', lines(`{v} takes a long run-up, yells "PARKOUR!", and flies across. Everyone else follows, slightly less dramatically.`), [['time', 1], ['funny']]),
    O(0.4, 'hurt', lines(`{r} takes a long run-up, jumps... and lands face first.\n{r}: "I meant to do that."`), [['hurt', 'r', 1], ['funny']]),
    O(0.1, 'neutral', lines(`Everyone takes a run-up. Everyone stops right at the edge. Nobody jumps. {Team} finds another way.`), [['time', -1]]),
  ], { vpref: ['Reckless', 'Gamer', 'Funny'] }),

  X('tester', ['hazard', 'search'], `Send {v} to test it first`, `Someone has to go first. It might as well be {v}.`, [
    O(0.45, 'good', lines(`{v} edges forward, very slowly... and nothing bad happens.\n{v}: "I'm alive!"\nEveryone else: "Oh. Great. Cool."\n{v}: "Why do you all sound disappointed?"`), [['mem', 'tester', 'v', 1], ['funny']]),
    O(0.45, 'hurt', lines(`{v} edges forward. It goes wrong immediately.\n{v} (from somewhere below): "IT IS NOT SAFE. FOR THE RECORD."`), [['hurt', 'v', 1], ['mem', 'tester', 'v', 0]]),
    O(0.1, 'neutral', lines(`{v} refuses to go first. A long argument follows. Nobody goes first. {Team} finds another way.`), [['time', -1]]),
  ]),

  X('holdhands', ['hazard'], `Hold hands and cross together, singing for courage`, `If we go down, we go down in harmony.`, [
    O(0.5, 'good', lines(`{Team} holds hands and edges across, singing very quietly. It is ridiculous. It works. Morale has never been higher.`), [['mem', 'sing', 'v', 1], ['funny']]),
    O(0.3, 'hurt', lines(`Someone slips, and because everyone is holding hands, EVERYONE slips. {r} comes off worst.`), [['hurt', 'r', 1], ['funny']]),
    O(0.2, 'danger', lines(`The singing gets louder with confidence. Something hears it, and it comes for {r}.`), [['em', 'r']]),
  ]),

  X('ignore', ['hazard'], `Ignore the problem and hope it goes away`, `Bold. Unproven.`, [
    O(0.5, 'neutral', lines(`{Team} sits down and waits for the problem to go away.\nIt does not go away.\nTwenty minutes later, everyone gets up and deals with it anyway.`), [['time', -2], ['funny']]),
    O(0.25, 'good', lines(`{Team} ignores it. Somehow, when anyone looks again, there is a way through.\n{v}: "Manifesting. It works."`), [['funny']]),
    O(0.25, 'hurt', lines(`Ignoring it did not make it go away. It made {r} walk straight into it.`), [['hurt', 'r', 1]]),
  ]),

  // ---------- searching a place ----------
  X('takeduck', ['search'], `Take the rubber duck. Trust me.`, `{v} has spotted a rubber duck and is weirdly determined.`, [
    O(1, 'item', lines(`{v} picks up a small yellow rubber duck and tucks it carefully into the backpack.\n{v}: "It's important."\nNobody asks why. {v} could not explain it anyway.`, `{v} holds up a rubber duck.\n{v}: "We're taking her."\n"Why?"\n{v}: "Because I said so. And because I have a feeling."`), [['item', 'duck'], ['flag', 'cx_duck'], ['mem', 'duck', 'v', 1], ['funny']]),
  ], { req: { noItems: ['duck'], not: 'cx_duck' }, w: 1.6 }),

  X('lick', ['search'], `{v} licks it to check if it is safe`, `Science.`, [
    O(0.35, 'item', lines(`{v} gives it a long, thoughtful lick.\n{v}: "Safe."\nNobody knows how {v} knows. But underneath it: {loot}.`), [['loot'], ['mem', 'lick', 'v', 1], ['funny']]),
    O(0.4, 'neutral', lines(`{v} licks it.\n{v}: "Tastes like batteries and regret."\nNothing useful here. Everyone pretends they did not see that.`), [['mem', 'lick', 'v', 1], ['funny']]),
    O(0.25, 'hurt', lines(`{v} licks it. {v} immediately regrets licking it, and is sick behind a bin.`), [['hurt', 'v', 1], ['mem', 'lick', 'v', 0], ['funny']]),
  ], { vpref: ['Reckless', 'Funny', 'Foodie'], req: { nomem: 'lick' } }),

  X('detective', ['search'], `{v} searches it like a TV detective`, `Dramatic pauses included.`, [
    O(0.5, 'item', lines(`{v} narrows their eyes. Crouches. Picks up a speck of dust.\n{v}: "Someone was here. And they left behind... {loot}."\nIt is actually right.`), [['loot']]),
    O(0.3, 'neutral', lines(`{v}: "The clues all point to... nothing. There is nothing here."\nDramatic music plays, but only inside {v}'s head.`), [['time', -1], ['funny']]),
    O(0.2, 'danger', lines(`{v} is so busy monologuing that nobody notices the {z} until it grabs for {r}.`), [['em', 'r']]),
  ], { vpref: ['Intelligent', 'Mysterious'] }),

  X('hello', ['search'], `Shout "HELLO?" into the dark`, `Every horror film says no. Do it anyway.`, [
    O(0.35, 'neutral', lines(`{v}: "HELLO?"\nNothing answers. Which is somehow worse.`), [['funny']]),
    O(0.45, 'danger', lines(`{v}: "HELLO?"\nSomething answers. With a groan. And footsteps. Heading for {r}.`), [['em', 'r']]),
    O(0.2, 'item', lines(`{v}: "HELLO?"\nSomething falls off a shelf in fright. It is {loot}. Result.`), [['loot'], ['funny']]),
  ], { vpref: ['Reckless', 'Nervous'] }),

  X('sixth', ['search'], `Let {v} use their "sixth sense" to find stuff`, `{v} insists they can FEEL where the good stuff is.`, [
    O(0.45, 'item', lines(`{v} closes their eyes, spins slowly, and points.\nThey are pointing straight at {loot}. Everyone is quietly unsettled.`), [['loot']]),
    O(0.35, 'neutral', lines(`{v} spins, points, and walks confidently into a wall.\n{v}: "The sixth sense is recharging."`), [['time', -1], ['funny']]),
    O(0.2, 'hurt', lines(`{v} follows the sixth sense straight off a step and onto their face.`), [['hurt', 'v', 1], ['funny']]),
  ], { vpref: ['Mysterious', 'Nature lover'] }),

  // ---------- people, arguments, decisions ----------
  X('starsign', ['people'], `Ask everyone their star sign before deciding`, `Vital information.`, [
    O(0.6, 'neutral', lines(`{v}: "Before we decide anything: star signs. I already know them all."\n{signs}\n{v}: "So, based on that... we are doomed."\nAfter a heated debate, the moment has passed. Everyone moves on.`), [['time', -1], ['funny']]),
    O(0.4, 'good', lines(`{v}: "Hold on. Let me check the stars."\n{signs}\n{v}: "Okay, the stars say we're fine."\nNobody knows how {v} knew all that. But everyone feels a bit better.`), [['funny']]),
  ], { vpref: ['Funny', 'Mysterious'] }),

  X('rps', ['people'], `Settle it with rock, paper, scissors`, `The fairest way to make life-or-death decisions.`, [
    O(0.65, 'neutral', lines(`{v} and {r} go best of three. Then best of five. Then best of seven.\n{r}: "Scissors beats rock if you believe hard enough!"\n{v}: "THAT IS NOT THE RULES."\nBy the time anyone wins, the moment has passed.`), [['time', -1], ['funny']]),
    O(0.35, 'good', lines(`One round of rock, paper, scissors later, it is decided. Nobody argues with the sacred hand game.`), [['funny']]),
  ]),

  X('speech', ['people', 'hazard'], `Let {v} give a motivational speech first`, `They have been preparing for this moment their whole life.`, [
    O(0.45, 'good', lines(`{v} climbs onto a box.\n{v}: "Friends. Survivors. People I mostly like."\nIt is a surprisingly good speech. Spirits lift. Someone even stops limping.`), [['heal', 'injured', 1], ['mem', 'speech', 'v', 1]]),
    O(0.25, 'neutral', lines(`{v}: "Four score and... no, wait, that is someone else's."\nIt goes on for twenty minutes. Nobody remembers any of it.`), [['time', -2], ['mem', 'speech', 'v', 0], ['funny']]),
    O(0.3, 'danger', lines(`The speech is so good, so loud and so long that it draws an audience. A hungry one. It goes for {r}.`), [['em', 'r'], ['mem', 'speech', 'v', 0]]),
  ], { vpref: ['Brave', 'Loyal', 'Funny'], req: { nomem: 'speech' } }),

  X('dance', ['people'], `{v} settles it with a dance-off`, `Like civilised people.`, [
    O(0.4, 'item', lines(`{v} throws down some moves. Wild, terrible, confident moves.\nNobody knows who won, but everyone is laughing, and somebody hands over {loot} as a prize.`), [['loot'], ['mem', 'dance', 'v', 1], ['funny']]),
    O(0.4, 'neutral', lines(`{v} dances. Nobody joins in. {v} keeps dancing for a long, long time, out of pure stubbornness.`), [['time', -1], ['mem', 'dance', 'v', 1], ['funny']]),
    O(0.2, 'hurt', lines(`{v} attempts the worm. {v} pulls a muscle doing the worm.`), [['hurt', 'v', 1], ['mem', 'dance', 'v', 0], ['funny']]),
  ], { vpref: ['Funny', 'Reckless', 'Gamer'] }),

  X('vote', ['people'], `Hold a vote, then ignore the result`, `Democracy in action.`, [
    O(1, 'neutral', lines(`Everyone votes. It is a draw. {v} declares themselves the winner anyway.\n{r}: "That is not how voting works!"\n{v}: "It is now."`), [['time', -1], ['funny']]),
  ]),

  // ---------- choosing a route ----------
  X('vibes', ['travel'], `Let {v} navigate using vibes`, `No map. No plan. Just vibes. (Random route.)`, [
    O(0.4, 'good', lines(`{v} closes their eyes, sniffs the air, and points.\nIncredibly, it is a shortcut.\n{v}: "The vibes never lie."`), [['moveRandom'], ['time', 1], ['mem', 'vibes', 'v', 1], ['funny']]),
    O(0.35, 'neutral', lines(`{v} leads with total confidence. An hour later, {team} walks past the same bin for the third time.\n{v}: "The vibes are... shy."`), [['moveRandom'], ['time', -2], ['mem', 'vibes', 'v', 0], ['funny']]),
    O(0.25, 'danger', lines(`The vibes lead {team} straight into trouble. Something comes for {r}.`), [['moveRandom'], ['em', 'r'], ['mem', 'vibes', 'v', 0]]),
  ], { vpref: ['Mysterious', 'Reckless', 'Nature lover'] }),

  X('critter', ['travel'], `Follow the first {critter} you see`, `Animals know things. Probably. (Random route.)`, [
    O(0.4, 'good', lines(`A {critter} hops off. {Team} follows it. Somehow it leads them the right way.\n{v}: "Nature knows."`), [['moveRandom'], ['time', 1], ['funny']]),
    O(0.4, 'neutral', lines(`The {critter} leads {team} in a big circle, then sits on a bin looking very pleased with itself.`), [['moveRandom'], ['time', -2], ['funny']]),
    O(0.2, 'hurt', lines(`The {critter} goes through a hedge. So does {r}. The hedge wins.`), [['moveRandom'], ['hurt', 'r', 1], ['funny']]),
  ], { vpref: ['Nature lover'] }),

  X('singalong', ['travel'], `Start a road-trip sing-along`, `Keep spirits up. Keep the volume down. (You won't.) (Random route.)`, [
    O(0.5, 'good', lines(`{v} starts a song. Everyone joins in. It is out of tune, far too loud, and genuinely the best ten minutes anyone has had in days.`), [['moveRandom'], ['heal', 'injured', 1], ['mem', 'sing', 'v', 1]]),
    O(0.5, 'danger', lines(`{v} starts a song. It is very catchy. It is also very loud, and something follows the music all the way to {r}.`), [['moveRandom'], ['em', 'r'], ['mem', 'sing', 'v', 0]]),
  ], { vpref: ['Funny', 'Kind', 'Loyal'], req: { nomem: 'sing' } }),
];
export const CHAOS_BY_ID = Object.fromEntries(CHAOS.map((c) => [c.id, c]));

// Which kind of chaos fits which kind of stage.
export const SITUATION = { zombie: 'blocker', emergency: 'em', hazard: 'hazard', exploration: 'search', item: 'search', humour: 'search', interaction: 'people', rescue: 'people', moral: 'people', travel: 'travel' };

export const ZNAMES = ['Kevin', 'Steve', 'Brenda', 'Trevor', 'Susan', 'Doug', 'Linda', 'Keith', 'Big Dave', 'Sandra', 'Colin', 'Margaret', 'Nigel', 'Barbara'];

// ---------- payoff events: earlier chaos comes back ----------
export function comedyEvents(A) {
  const E = (id, o) => ({ id: `${A}_${id}`, ...o });
  return [
    E('cx_named', {
      cat: 'humour', loc: '*', req: { flags: ['cx_named'], mem: 'namer', memAge: ['namer', 3] }, w: 3, title: `{zname} Is Back`,
      text: [`A familiar shape shuffles out of the gloom. Same blank stare. Same lopsided walk. It is {zname}.`, `Something about the {z} ahead is familiar. The tilt of the head. The confused shuffle. Oh no. It is {zname}.`],
      cast: ['a', 'b?'], say: [['a', `"Is that... {zname}?"`], ['b', `"{@namer}. Your friend is back."`]],
      choices: [
        C(`Wave at {zname}`, `Maybe it remembers you.`, [O(0.4, 'good', `Everyone waves. {zname} tilts its head... and slowly lifts one arm, like it is waving back. Then it shuffles away.\nNobody says anything, but everyone is a little bit emotional.`, [['funny'], ['unflag', 'cx_named']]), O(0.45, 'danger', `{zname} does remember. {zname} remembers that {team} is food. It goes for {r}.`, [['em', 'r'], ['unflag', 'cx_named']]), O(0.15, 'hurt', `{zname} lurches forward for a hug, or a bite. Nobody waits to find out, and {r} trips running away.`, [['hurt', 'r', 1], ['unflag', 'cx_named']])]),
        C(`Let {@namer} handle it. It is their {z}.`, `They have a bond.`, [O(0.5, 'good', `{@namer} steps forward.\n{@namer}: "{zname}. Go home."\n{zname} stares. Then, unbelievably, it turns and shuffles away.\n{@namer}: "He always listened to me."`, [['funny'], ['unflag', 'cx_named']]), O(0.5, 'danger', `{@namer}: "{zname}, it's me!"\n{zname} does not care who it is. It lunges at {@namer}.`, [['em', '@namer'], ['unflag', 'cx_named']])], { req: { mem: 'namer' } }),
        C(`Say a few words, then put {zname} to rest`, `It is the kind thing to do. Probably.`, [O(1, 'good', `{a}: "{zname}. You were a {z}. A good {z}. Mostly."\nIt is quick. It is weirdly emotional. Somebody sniffs.`, [['use', 'tag', 'melee'], ['unflag', 'cx_named']])], { req: { tags: ['melee'] } }),
        rush(`Run. Nobody look back at {zname}.`, `Fast and heartless.`, { hurt: 0.15, danger: 0.1, fx: [['unflag', 'cx_named']] }),
        safe(`Sneak past while {zname} is distracted`, `{zname} is chewing something. Do not ask what.`, { time: -1, fx: [['unflag', 'cx_named']] }),
        C(`Throw something to lead {zname} away`, `Fetch, {zname}. Fetch.`, [O(0.6, 'good', `{a} throws a can. {zname} shuffles after it with real enthusiasm.\n{a}: "Good boy."`, [['unflag', 'cx_named'], ['funny']]), O(0.4, 'danger', `{zname} ignores the can completely and comes straight for {r}.`, [['em', 'r'], ['unflag', 'cx_named']])]),
        C(`Hide and watch what {zname} does`, `Study it. For science.`, [O(0.7, 'neutral', `{zname} stands still for ten minutes, then walks into a wall, then wanders off. Fascinating. Pointless, but fascinating.`, [['time', -1], ['unflag', 'cx_named'], ['funny']]), O(0.3, 'danger', `{zname} sniffs the air and turns slowly towards {r}'s hiding place.`, [['em', 'r'], ['unflag', 'cx_named']])]),
      ],
    }),
    E('cx_duckday', {
      cat: 'humour', loc: '*', req: { items: ['duck'], memAge: ['duck', 3] }, w: 3, title: `The Duck's Big Moment`,
      text: [`A crowd of {zs} blocks the only way forward. They are twitchy, restless, and turning towards every little sound. Every. Little. Sound.`],
      cast: ['a', 'b?'], say: [['a', `"Is anyone else thinking about the duck?"`], ['b', `"I can't believe I'm thinking about the duck."`]],
      choices: [
        C(`Use the duck. This is its moment.`, `It has all been leading to this.`, [O(0.85, 'good', `{a} holds the rubber duck up high, like a sacred relic.\nSQUEAK.\nEvery single {z} turns. {a} hurls the duck as far as possible. SQUEAK. Squeak. squeak. The whole crowd shambles after it.\nThe way is clear.\n{a}: "Nobody say a word. Just know that the duck was right."`, [['use', 'duck'], ['time', 2], ['funny'], ['hero']]), O(0.15, 'danger', `SQUEAK. They all turn... towards {team}. Not the duck. The duck has betrayed us.`, [['use', 'duck'], ['em', 'r']])], { req: { items: ['duck'] } }),
        safe(`Find a long way round`, `Slow, but nobody squeaks.`, { time: -2 }),
        rush(`Sprint through the gap`, `There is a gap. Probably.`, { hurt: 0.25, danger: 0.15 }),
        search(`Search the buildings nearby for another way`, `Maybe something useful too.`, { item: 0.4, hurt: 0.1, danger: 0.15 }),
        C(`Make a distraction with something else`, `Anything except the duck.`, [O(0.55, 'good', `A thrown bottle smashes down the street and the crowd lurches after it.`, [['time', 1]]), O(0.45, 'danger', `The noise works on most of them. Not all of them. One comes for {r}.`, [['em', 'r']])]),
        C(`Wait for them to move on`, `They will wander off eventually. Right?`, [O(0.65, 'neutral', `It takes ages, but they drift away.`, [['time', -2]]), O(0.35, 'danger', `They do not wander off. They wander closer, towards {r}.`, [['em', 'r']])]),
      ],
    }),
    E('cx_talks', {
      cat: 'humour', loc: '*', req: { mem: 'negotiate', memAge: ['negotiate', 4] }, w: 3, title: `Peace Talks, Part Two`,
      text: [`Three {zs} stand in a rough line across the path, like a tiny, rotten committee. Slowly, everyone turns to look at {@negotiate}.`],
      cast: ['a', 'b?'], say: [['a', `"{@negotiate}. This is your moment."`], ['b', `"Please don't let them talk for forty minutes."`]],
      choices: [
        C(`Send {@negotiate} to negotiate. Again.`, `Experience counts. Right?`, [O(0.45, 'good', `{@negotiate}: "Gentlemen. I'm sure you remember my colleague."\nNobody knows who the colleague is. The committee shuffles apart anyway.\n{@negotiate}: "Respect. That is what that was."`, [['funny'], ['time', 1]]), O(0.15, 'neutral', `{@negotiate} talks. The committee sways. A stalemate. {Team} goes round.`, [['time', -1], ['funny']]), O(0.4, 'danger', `{@negotiate}: "Let's keep this civil."\nIt does not stay civil. They go for {@negotiate}.`, [['em', '@negotiate']])], { req: { mem: 'negotiate' } }),
        safe(`Go the long way round`, `No talking. No committee.`, { time: -2 }),
        rush(`Barge straight through them`, `Fast, loud and very stupid.`, { hurt: 0.3, danger: 0.2 }),
        C(`Distract them`, `A thrown can, a loud noise.`, [O(0.6, 'good', `The committee turns towards the noise as one. {Team} slips past.`, [['time', 1]]), O(0.4, 'danger', `Two of them turn. One does not. It goes for {r}.`, [['em', 'r']])]),
        search(`Look around for something useful first`, `While they are busy being a committee.`, { item: 0.45, hurt: 0.05, danger: 0.2 }),
        C(`Wait for them to get bored`, `Committees never last long.`, [O(0.7, 'neutral', `Eventually the meeting breaks up and they wander off. Typical.`, [['time', -2], ['funny']]), O(0.3, 'danger', `The meeting moves on to new business: {r}.`, [['em', 'r']])]),
      ],
    }),
    E('cx_shoe', {
      cat: 'humour', loc: '*', req: { mem: 'shoe', memAge: ['shoe', 3] }, w: 3, title: `The Shoe`,
      text: [`A {z} staggers into view. It is wearing one shoe. It is {@shoe}'s shoe.`],
      cast: ['a', 'b?'], say: [['a', `"{@shoe}... is that...?"`], ['b', `"It is. It REALLY is."`]],
      choices: [
        C(`Get the shoe back`, `It is a matter of principle.`, [O(0.5, 'good', `A short, undignified scuffle later, the shoe is back where it belongs. {@shoe} has never been happier.`, [['heal', '@shoe', 1], ['funny']]), O(0.5, 'danger', `The {z} is VERY attached to the shoe now. It goes for {r}.`, [['em', 'r']])]),
        C(`Throw the OTHER shoe at it`, `Commit to the bit.`, [O(0.5, 'good', `The second shoe flies. Direct hit. The {z} falls over a bin. {@shoe} is now fully barefoot, and fully at peace.`, [['funny'], ['time', 1]]), O(0.5, 'danger', `Now it is angry AND fashionable. It comes for {r}.`, [['em', 'r']])]),
        safe(`Let it keep the shoe`, `It has suffered enough. So has {@shoe}.`, { time: -1 }),
        rush(`Run past it`, `Fast. Shoe-less, for some.`, { hurt: 0.2, danger: 0.1 }),
        C(`Hide until it passes`, `Quietly mourn the shoe.`, [O(0.7, 'neutral', `It shuffles past. Clip-clop. Clip-clop. {@shoe} watches it go in silence.`, [['time', -1], ['funny']]), O(0.3, 'danger', `It stops right next to {r}'s hiding place, like it can smell its old owner's friends.`, [['em', 'r']])]),
      ],
    }),
  ];
}

// ---------- playable chaos scenes: a silly choice opens a whole stage ----------
export function chainEvents(A) {
  const E = (id, o) => ({ id: `${A}_cx_ch_${id}`, cat: 'chain', loc: '*', cast: ['v!', 'b?', 'c?'], ...o });
  return [
    E('talks', {
      title: `The Negotiation`,
      text: [`{v} and the {z} face each other across an upturned crate, like a proper business meeting. Everyone else watches from behind a wall. It is {v}'s move.`],
      say: [['b', `"This is the stupidest thing we have ever done."`], ['c', `"Shh! It's getting good."`]],
      choices: [
        C(`Offer it a biscuit`, `Everyone likes biscuits.`, [O(0.45, 'good', `{v} slides a biscuit across the crate. The {z} stares at it. Picks it up. And wanders off with it, like it has somewhere to be.\n{v}: "Pleasure doing business."`, [['mem', 'negotiate', 'v', 1], ['funny']]), O(0.2, 'neutral', `It eats the biscuit. Then it just stands there, waiting for another. Everyone sneaks round it.`, [['mem', 'negotiate', 'v', 0], ['time', -1], ['funny']]), O(0.35, 'danger', `It does not want the biscuit. It wants the hand holding the biscuit.`, [['mem', 'negotiate', 'v', 0], ['em', 'v']])]),
        C(`Compliment its outfit`, `Flattery gets you everywhere.`, [O(0.35, 'good', `{v}: "Love the rags. Very distressed. Very now."\nThe {z} looks down at itself. It seems... pleased? It shuffles off, standing a little taller.`, [['mem', 'negotiate', 'v', 1], ['funny']]), O(0.4, 'neutral', `{v} compliments its shoes, its hair and its "energy". It does not understand compliments. It does not understand anything. Everyone goes round.`, [['mem', 'negotiate', 'v', 0], ['time', -1], ['funny']]), O(0.25, 'danger', `{v}: "Is that a new jacket?"\nIt is not a new jacket. It is someone else's jacket. And it is coming for {v}.`, [['mem', 'negotiate', 'v', 0], ['em', 'v']])]),
        C(`Threaten it with legal action`, `{v} does not have a lawyer.`, [O(0.3, 'good', `{v}: "I'll have you know my lawyer is VERY good."\nThe {z} does not know what a lawyer is. But it does not like the sound of one. It leaves.`, [['mem', 'negotiate', 'v', 1], ['funny']]), O(0.3, 'neutral', `{v} reads it its rights. All of them. It takes a while.`, [['mem', 'negotiate', 'v', 0], ['time', -1], ['funny']]), O(0.4, 'danger', `{v}: "See you in court!"\nIt would rather see {v} in its mouth.`, [['mem', 'negotiate', 'v', 0], ['em', 'v']])]),
        C(`Tell it a joke`, `Break the ice.`, [O(0.4, 'good', `{v}: "Why did the zombie skip school? He felt rotten."\nThe {z} makes a noise. Was that... a laugh? It wanders off, still making the noise.`, [['mem', 'negotiate', 'v', 1], ['funny']]), O(0.25, 'neutral', `{v} tells the joke. Silence. The worst silence. Even the {z} looks embarrassed for {v}. Everyone quietly leaves.`, [['mem', 'negotiate', 'v', 0], ['time', -1], ['funny']]), O(0.35, 'danger', `The joke is so bad it attracts others. They come for {r}.`, [['mem', 'negotiate', 'v', 0], ['em', 'r']])]),
        C(`Agree to disagree and back away slowly`, `Know when to walk away.`, [O(0.85, 'neutral', `{v}: "Let's... take this offline."\n{v} backs away, very slowly, and everyone goes the long way round.`, [['mem', 'negotiate', 'v', 0], ['time', -1], ['funny']]), O(0.15, 'danger', `Never turn your back on a negotiation. It goes for {v}.`, [['mem', 'negotiate', 'v', 0], ['em', 'v']])]),
      ],
    }),
    E('dance', {
      title: `The Dance-Off`,
      text: [`{v} faces the {z}. Somebody starts beatboxing. The {z} sways from side to side. Is it... dancing? It is dancing. It is {v}'s turn.`],
      say: [['b', `"Is this actually happening?"`], ['c', `"Do the worm. DO THE WORM."`]],
      choices: [
        C(`The worm`, `The classic.`, [O(0.45, 'good', `{v} drops to the floor and does the worm. It is magnificent. The {z} has never seen anything like it. It shuffles away, defeated.`, [['mem', 'dance', 'v', 1], ['funny']]), O(0.35, 'hurt', `{v} does the worm. {v} pulls something doing the worm.\n{v}: "Still counts!"`, [['mem', 'dance', 'v', 0], ['hurt', 'v', 1], ['funny']]), O(0.2, 'danger', `The worm brings {v} face-to-face with the {z}'s feet. That is too close.`, [['mem', 'dance', 'v', 0], ['em', 'v']])]),
        C(`The robot`, `Stiff. Precise. Terrifying.`, [O(0.4, 'good', `{v} does the robot. The {z} does the robot back. Then it robots away down the street. Nobody knows what just happened.`, [['mem', 'dance', 'v', 1], ['funny']]), O(0.4, 'neutral', `The {z} does the robot back. Then {v} does it again. They are stuck in a robot-off for twenty minutes.`, [['mem', 'dance', 'v', 1], ['time', -2], ['funny']]), O(0.2, 'danger', `Robot arms are very easy to grab.`, [['em', 'v']])]),
        C(`Moonwalk away from it`, `Smooth AND tactical.`, [O(0.55, 'good', `{v} moonwalks backwards, all the way out of danger. Everyone else moonwalks after. Smoothest escape ever.`, [['mem', 'dance', 'v', 1], ['time', 1], ['funny']]), O(0.3, 'hurt', `{v} moonwalks straight into a bin and goes over backwards.`, [['hurt', 'v', 1], ['funny']]), O(0.15, 'danger', `Moonwalking is slow. It catches up with {r}.`, [['em', 'r']])]),
        C(`A slow, emotional interpretive dance`, `About loss. And hope. And snacks.`, [O(0.4, 'neutral', `It is beautiful. Everyone is moved. Even the {z} seems moved. Twenty minutes pass.`, [['mem', 'dance', 'v', 1], ['time', -2], ['funny']]), O(0.35, 'good', `The {z} watches the whole thing, then turns and walks away very slowly, like it needs to process its feelings.`, [['mem', 'dance', 'v', 1], ['funny']]), O(0.25, 'danger', `The dance includes a lot of reaching out towards the {z}. It reaches back. For {v}.`, [['em', 'v']])]),
        C(`Get everyone to join in`, `Group routine. No rehearsal.`, [O(0.5, 'good', `Everyone joins in. It is a full routine. Nobody knows the steps. It does not matter. The {z} gives up and leaves.`, [['mem', 'dance', 'v', 1], ['heal', 'injured', 1], ['funny']]), O(0.15, 'hurt', `Too many people, not enough space. {r} gets kicked in the shin.`, [['hurt', 'r', 1], ['funny']]), O(0.35, 'danger', `The party gets too loud. More guests arrive. They come for {r}.`, [['em', 'r']])]),
      ],
    }),
    E('talent', {
      title: `Apocalypse's Got Talent`,
      text: [`Somehow, the group is now putting on a talent show for a small crowd of {zs}. They are swaying. They are hungry. They are waiting. What is the first act?`],
      say: [['b', `"I can't believe this is working."`], ['c', `"It is not working yet. Do SOMETHING."`]],
      choices: [
        C(`{v} does a magic trick`, `"Pick a card. Any card."`, [O(0.45, 'good', `{v}: "Is THIS your card?"\nIt is not their card. They do not have cards. But they are completely mesmerised, and everyone else sneaks off behind them.`, [['time', 1], ['funny']]), O(0.3, 'neutral', `The trick goes wrong. Cards everywhere. The crowd just sways. Everyone backs off the stage slowly.`, [['time', -1], ['funny']]), O(0.25, 'danger', `{v}: "For my next trick, I will make myself disappear!"\n{v} does not disappear. The crowd comes for {r}.`, [['em', 'r']])]),
        C(`{v} does stand-up comedy`, `Tough crowd. Literally dead.`, [O(0.35, 'good', `{v}: "So, the apocalypse. Am I right? Anyone else's commute been a nightmare?"\nA groan. A good groan? The crowd drifts off, satisfied.`, [['funny']]), O(0.4, 'neutral', `Not one laugh. Not one. {v} keeps going anyway for ten minutes out of pure pride.`, [['time', -1], ['funny']]), O(0.25, 'danger', `{v} picks on someone in the front row. Never pick on the front row. It goes for {v}.`, [['em', 'v']])]),
        C(`Juggling, with whatever is in the backpack`, `Something might not come back.`, [O(0.5, 'good', `Bottles, bandages, a torch, a sock. It is genuinely impressive. One thing goes into the crowd and never comes back, but the show is a hit, and everyone slips away.`, [['lose'], ['time', 1], ['funny']]), O(0.3, 'hurt', `{v} juggles. The heaviest item lands on {r}'s head.`, [['hurt', 'r', 1], ['funny']]), O(0.2, 'danger', `Something rolls into the crowd. The crowd rolls towards {r}.`, [['em', 'r']])], { req: { anyInv: true } }),
        C(`A dramatic poetry reading`, `Deep. Dark. Long.`, [O(0.5, 'neutral', `{v}: "Ode to a Shuffling Man."\nIt has nine verses. Half the crowd falls asleep. The other half wanders off. So does half the group.`, [['time', -2], ['funny']]), O(0.35, 'good', `The poem is so moving that the crowd just... stands there. Swaying. Everyone tiptoes away while they are lost in it.`, [['funny']]), O(0.15, 'danger', `The poem ends with a scream for dramatic effect. The crowd takes it badly. It comes for {r}.`, [['em', 'r']])]),
        C(`{v}'s mystery act`, `Nobody knows what it is. Not even {v}.`, [O(0.4, 'good', `Nobody can describe what {v} did. There were noises. There was a chair. The crowd fled. So did everyone else. It worked.`, [['funny'], ['hero']]), O(0.3, 'hurt', `The mystery act involves fire. Nobody approved the fire. {v} singes their eyebrows.`, [['hurt', 'v', 1], ['funny']]), O(0.3, 'danger', `The mystery act is just {v} screaming. The crowd screams back. It comes for {r}.`, [['em', 'r']])]),
        C(`Bow, say goodnight and run`, `Leave them wanting more.`, [O(0.8, 'neutral', `{v}: "You've been a lovely audience. Goodnight!"\nEveryone bows, and legs it.`, [['time', -1]]), O(0.2, 'danger', `They want an encore. They want it from {r}.`, [['em', 'r']])]),
      ],
    }),
    E('build', {
      title: `{v}'s Contraption`,
      text: [`{v} lays it all out: tape, wire, a battery, a spring and something that might once have been a toaster. "I can make ONE thing. Choose wisely."`],
      say: [['b', `"Can it be a car?"`], ['v', `"It cannot be a car."`]],
      choices: [
        C(`A noise-maker to lure them away`, `Bleeps, bloops and a timer.`, [O(0.65, 'good', `{v} sets it down and sets the timer. Thirty seconds later it starts bleeping at full volume three streets away. Everything shuffles towards it. The path is clear.\n{v}: "Engineering."`, [['time', 1], ['mem', 'clutch', 'v', 1]]), O(0.35, 'danger', `The timer is set wrong. It goes off immediately, right next to {r}.`, [['em', 'r'], ['mem', 'blunder', 'v', 0]])]),
        C(`A zip-line across the gap`, `Wire, a belt and courage.`, [O(0.5, 'good', `Everyone zips across one by one, screaming with joy. It is the fastest anyone has moved all day.`, [['time', 2], ['mem', 'clutch', 'v', 1], ['funny']]), O(0.5, 'hurt', `The zip-line works perfectly for everyone except {r}, who finds the one weak bit.`, [['hurt', 'r', 1], ['mem', 'blunder', 'v', 0], ['funny']])]),
        C(`A "zombie detector"`, `Science. Allegedly.`, [O(0.35, 'item', `It is a stick with a bell on it. It does not detect anything. But while building it, {v} found {loot}.`, [['loot'], ['funny']]), O(0.45, 'neutral', `It is a stick with a bell on it. It does not detect anything. {v} is very proud of it anyway and carries it for the rest of the day.`, [['time', -1], ['funny']]), O(0.2, 'danger', `The bell rings. It does detect something: the {z} it just attracted. It goes for {r}.`, [['em', 'r']])]),
        C(`Armour made of saucepans`, `Pots for the people.`, [O(0.5, 'good', `Everyone gets a saucepan helmet. It is not pretty. It works. Somebody's wound gets padded and wrapped properly too.`, [['heal', 'injured', 1], ['funny']]), O(0.3, 'neutral', `The armour clanks so much nobody can sneak anywhere. Everyone takes it off again.`, [['time', -1], ['funny']]), O(0.2, 'hurt', `A saucepan falls off the top of the pile onto {r}'s foot.`, [['hurt', 'r', 1], ['funny']])]),
        C(`Let {r} "help"`, `What could possibly go wrong?`, [O(0.2, 'good', `Somehow {r}'s "help" makes it BETTER. {v} is furious about it.\n{v}: "That should not have worked."`, [['time', 1], ['funny']]), O(0.4, 'neutral', `{r} helps by holding things in the wrong place for twenty minutes. Nothing gets built.`, [['time', -2], ['funny']]), O(0.4, 'hurt', `{r} touches the wrong wire.\n{v}: "NOT THAT WIRE!"`, [['hurt', 'r', 1], ['funny']])]),
      ],
    }),
    E('photo', {
      title: `The Perfect Shot`,
      text: [`{v} holds the phone up high. Everyone squeezes in. Behind them, something is shuffling closer. "Okay! What's the pose?"`],
      say: [['b', `"Can we hurry up?"`], ['v', `"You can't rush art."`]],
      choices: [
        C(`Peace signs and big smiles`, `Classic. Wholesome.`, [O(0.5, 'neutral', `Perfect. Iconic. It took nine attempts because someone kept blinking.`, [['time', -1], ['funny']]), O(0.3, 'good', `It is genuinely a lovely photo. For a second, everyone forgets where they are. Spirits lift.`, [['heal', 'injured', 1]]), O(0.2, 'danger', `Nine attempts was too many. Something has arrived in the background. It goes for {r}.`, [['em', 'r']])]),
        C(`Everyone does their best scared face`, `Ironic. Or not.`, [O(0.4, 'good', `Everyone pulls their scariest scared face. The {z} in the background sees it, gets scared too, and leaves.`, [['funny']]), O(0.2, 'neutral', `Nobody is pretending. Those are real scared faces. Great photo though.`, [['time', -1], ['funny']]), O(0.4, 'danger', `The scared faces turn into real screaming. Something comes for {r}.`, [['em', 'r']])]),
        C(`Get the {z} in the background`, `For the fans.`, [O(0.4, 'good', `The {z} photobombs perfectly. It even seems to pose. Then it loses interest and wanders off.\n{v}: "Thank you for your service."`, [['funny']]), O(0.45, 'danger', `{v}: "Little closer... little closer..."\nIt gets a lot closer. It goes for {r}.`, [['em', 'r']]), O(0.15, 'hurt', `The {z} gets into the shot, and its elbow gets into {r}'s face.`, [['hurt', 'r', 1]])]),
        C(`Flash ON`, `Maximum brightness.`, [O(0.5, 'good', `FLASH. The {z} recoils, completely blinded, and stumbles away. Accidentally, a genius move.\n{v}: "I meant to do that."`, [['time', 1], ['hero'], ['funny']]), O(0.5, 'danger', `FLASH. Every {z} in the area now knows exactly where everyone is. They come for {r}.`, [['em', 'r']])]),
        C(`Group hug pose`, `Wholesome. Slow.`, [O(0.55, 'good', `Everyone squeezes in for a group hug. It turns into a real one. Everyone needed that.`, [['heal', 'injured', 1]]), O(0.45, 'danger', `The group hug lasts slightly too long. Something joins it. It goes for {r}.`, [['em', 'r']])]),
      ],
    }),
    E('bake', {
      title: `The Great Apocalypse Bake Off`,
      text: [`{v} lays out what has been found: flour, sugar, half a jar of jam and one very suspicious tin. "Right. I can fix this. Pick a recipe."`],
      say: [['b', `"There's no oven."`], ['v', `"That's never stopped me."`]],
      choices: [
        C(`A flour bomb`, `Throw it. All of it.`, [O(0.55, 'good', `{v} hurls the whole bag. FOOMPH. A white cloud fills the street. Everyone sneaks through it, coughing, completely covered in flour.\n{v}: "Like a snow day."`, [['time', 1], ['funny']]), O(0.15, 'neutral', `The bag does not burst. It just bounces. {v} is devastated.`, [['time', -1], ['funny']]), O(0.3, 'danger', `The flour cloud goes everywhere. Including into everyone's eyes. Something finds {r} in the white-out.`, [['em', 'r']])]),
        C(`Emergency scones`, `Comfort food saves lives.`, [O(0.6, 'good', `Somehow, using a car bonnet as a hot plate, {v} makes scones. They are warm. They are perfect. Everyone feels better.`, [['heal', 'injured', 1], ['funny']]), O(0.25, 'neutral', `The scones are... rocks. Sweet rocks. Everyone eats one to be polite.`, [['time', -1], ['funny']]), O(0.15, 'danger', `The smell of warm scones drifts for miles. Something hungry follows it to {r}.`, [['em', 'r']])]),
        C(`A caramel trap`, `Sticky. Sweet. Deadly.`, [O(0.45, 'good', `{v} spreads hot caramel across the path. The {z} walks into it and gets completely stuck. It will be there for days.\n{v}: "Salted. For extra cruelty."`, [['time', 1], ['funny']]), O(0.35, 'hurt', `Hot caramel is VERY hot. {v} finds this out the hard way.`, [['hurt', 'v', 1]]), O(0.2, 'danger', `{r} steps in the caramel trap. Then something steps towards {r}.`, [['em', 'r']])]),
        C(`A bribe cake`, `Everyone loves cake.`, [O(0.4, 'good', `{v} leaves a little cake on a wall. The {z} picks it up, sniffs it, and wanders off with it like it is going to a party.`, [['funny']]), O(0.2, 'neutral', `The cake is ignored. {v} is offended on its behalf.`, [['time', -1], ['funny']]), O(0.4, 'danger', `It does not want cake. It wants the baker. It goes for {v}.`, [['em', 'v']])]),
        C(`Let {r} taste-test the suspicious tin`, `For science.`, [O(0.4, 'neutral', `It is peaches. Just peaches. {r} is weirdly disappointed.`, [['funny']]), O(0.25, 'item', `It is not food. It is {loot}, hidden in a tin. Who does that?!`, [['loot'], ['funny']]), O(0.35, 'hurt', `It was NOT peaches. {r} is sick behind a bin.`, [['hurt', 'r', 1], ['funny']])]),
      ],
    }),
    E('toddy', {
      title: `{v}'s Plan`,
      text: [`{v} draws the plan in the dirt with a stick. It is mostly arrows. One arrow just says "THEN WIN". "Okay. Step one. You choose."`],
      say: [['b', `"This is going to go so badly."`], ['v', `"That's the spirit."`]],
      choices: [
        C(`Jump off something high`, `Step one is always a jump.`, [O(0.45, 'good', `{v} takes a run-up, leaps off a wall, and lands perfectly. Everyone follows. Somehow it is a massive shortcut.\n{v}: "TOLD YOU."`, [['time', 2], ['mem', 'clutch', 'v', 1], ['funny']]), O(0.55, 'hurt', `{v} jumps. {v} lands badly. Everyone else takes the stairs.\n{v}: "Step one complete."`, [['hurt', 'v', 1], ['mem', 'blunder', 'v', 0], ['funny']])]),
        C(`Use a shopping trolley`, `Steering optional.`, [O(0.4, 'good', `{v} piles everyone's bags into a trolley and pushes it downhill at full speed. It works brilliantly. Mostly.`, [['time', 1], ['funny']]), O(0.4, 'hurt', `The trolley goes left. {r} goes right. Into a wall.`, [['hurt', 'r', 1], ['mem', 'blunder', 'v', 0], ['funny']]), O(0.2, 'danger', `The trolley wheels squeal for the whole street. Something comes for {r}.`, [['em', 'r'], ['mem', 'blunder', 'v', 0]])]),
        C(`Throw {v}'s hat as a distraction`, `The ultimate sacrifice.`, [O(0.45, 'good', `{v} throws the hat. Every {z} turns to look at it. Everyone slips past. {v} runs back for the hat afterwards, obviously.`, [['funny'], ['mem', 'clutch', 'v', 1]]), O(0.2, 'neutral', `{v} goes to throw the hat... and cannot do it. They just stand there, holding it.\n{v}: "I can't. I CAN'T."`, [['time', -1], ['funny']]), O(0.35, 'danger', `The hat lands right next to {r}. So does everyone's attention.`, [['em', 'r'], ['mem', 'blunder', 'v', 0]])]),
        C(`Sprint. Just sprint.`, `The whole plan, really.`, [O(0.5, 'good', `Everyone sprints. Lungs burning. And it works.\n{v}: "Simple plans are the best plans."`, [['time', 1]]), O(0.3, 'hurt', `{r} trips over {v}'s plan, which is still drawn in the dirt.`, [['hurt', 'r', 1], ['funny']]), O(0.2, 'danger', `Sprinting is loud. Something sprints back at {r}.`, [['em', 'r']])]),
        C(`Abandon the plan`, `Do something sensible for once.`, [O(0.9, 'neutral', `{v}: "Fine. FINE. But it would have worked."\nEveryone takes the slow, safe way round.`, [['time', -1]]), O(0.1, 'danger', `Even the sensible way goes wrong. Something comes for {r}.\n{v}: "SEE?!"`, [['em', 'r']])]),
      ],
    }),
    E('cod', {
      title: `Squad Up`,
      text: [`{v} crouches behind a wall and makes hand signals nobody understands. "Okay, squad. Callouts. What's the play?"`],
      say: [['b', `"What does that hand signal mean?"`], ['v', `"It means trust me."`]],
      choices: [
        C(`Flank left`, `Classic manoeuvre.`, [O(0.5, 'good', `Everyone flanks left. It actually works: round the side, past them, gone.\n{v}: "Textbook."`, [['time', 1], ['mem', 'clutch', 'v', 1]]), O(0.3, 'hurt', `There is a fence on the left. {r} finds it with their face.`, [['hurt', 'r', 1], ['funny']]), O(0.2, 'danger', `There is a {z} on the left too. It goes for {r}.`, [['em', 'r']])]),
        C(`"DROP SHOT!"`, `Everyone hits the floor.`, [O(0.35, 'good', `Everyone throws themselves flat. The {z} walks straight over the top of them without noticing. Nobody breathes for a full minute.`, [['funny']]), O(0.35, 'neutral', `Everyone hits the floor. Nothing happens. Everyone gets back up, slightly muddier.\n{v}: "Worth it."`, [['time', -1], ['funny']]), O(0.3, 'danger', `Lying on the ground is not a good look when something wants to bite you. It goes for {r}.`, [['em', 'r']])]),
        C(`Throw a "grenade"`, `It is a tin of beans.`, [O(0.55, 'good', `{v}: "Frag out!"\nA tin of beans sails through the air and clangs off a car. Everything turns to look. Everyone slips past.`, [['time', 1], ['funny']]), O(0.45, 'danger', `The tin of beans bounces off the {z}'s head. It is now looking straight at {r}.`, [['em', 'r']])]),
        C(`Rush B`, `No hesitation.`, [O(0.4, 'good', `Everyone rushes B. Nobody knows where B is. It somehow works anyway.`, [['time', 2], ['funny']]), O(0.4, 'hurt', `In real life, rushing B is very tiring, and {r} takes a knock on the way.`, [['hurt', 'r', 1]]), O(0.2, 'danger', `B is full of {zs}. They go for {r}.`, [['em', 'r']])]),
        C(`Camp in a corner`, `Campers win games.`, [O(0.75, 'neutral', `{v} camps. Everyone camps. It takes forever, but eventually the coast is clear.\n{v}: "Campers win games."`, [['time', -2]]), O(0.25, 'danger', `The corner is not a great corner. Something finds {r}.`, [['em', 'r']])]),
      ],
    }),
  ];
}

// A duck can always be squeezed in an emergency, from the backpack.
const DUCK_USE = { consume: 0, o: [O(0.65, 'good', `SQUEAK!\nThe {z} snaps round towards the noise, and {t} rolls clear.\n{t}: "Saved by a DUCK."`, [['funny']]), O(0.35, 'hurt', `SQUEAK! It looks at the duck, then back at {t}, slightly annoyed.`, [['hurt', 't', 1]])] };

// Called on every adventure: shared items, payoff events, duck uses, words.
export function addComedy(adv) {
  adv.words = { z: 'zombie', zs: 'zombies', goal: 'safety', place: 'place', critter: 'pigeon', ...(adv.words || {}) };
  adv.items.duck = { name: `Rubber Duck`, icon: 'duck', desc: `Small, yellow and squeaky. Completely useless. Probably. (Squeeze it during an attack.)`, tags: ['squeaky'], qty: 1, max: 1, unique: true };
  adv.events.push(...comedyEvents(adv.id), ...chainEvents(adv.id));
  for (const e of adv.events) if (e.cat === 'emergency') e.uses = { ...(e.uses || {}), duck: DUCK_USE };
  adv.chaos = CHAOS;
  return adv;
}

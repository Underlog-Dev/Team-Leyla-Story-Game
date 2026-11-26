// Ridiculous accidents. Rarely, when a decision has ALREADY caused an injury or a
// death, the cause turns out to be something completely ridiculous. The decision
// still mattered (the same person is hurt, it is just funnier how it happened).
// Reusable for any survival story: entries are tagged by setting and situation.
//   env:  'any' | 'city' | 'forest' | 'ship'      sit: 'any' | 'flee' (running from danger)
//   short: what happened, used for causes of death, the recap and callbacks
//   lead: the accident itself. A tail is added for an injury or a death.
//   r: optional reaction lines just for this accident (only when the person survives)
const M = (id, env, sit, short, lead, opt = {}) => ({ id, env: [].concat(env), sit, short, lead, ...opt });

export const MISHAPS = [
  // ---------- doors, windows, glass ----------
  M('pulldoor', 'any', 'flee', 'ran face-first into a pull door', `{v} sprints for the exit and slams straight into the door. It says PULL. In big letters.`, { r: [['b', '"It\'s a pull door."'], ['v', '"I KNOW THAT NOW."']] }),
  M('glassdoor', 'city', 'flee', 'ran into a very clean glass door', `{v} bolts for the street and runs full speed into a glass door that is, unfortunately, spotless.`, { r: [['b', '"In fairness, it was VERY clean."']] }),
  M('window', 'any', 'flee', 'tried to dive through a closed window', `{v} takes a run-up and dives dramatically at the window. The window is closed. The window wins.`, { r: [['v', '"It looked open."'], ['b', '"It had a CURTAIN on it."']] }),
  M('revolving', 'city', 'flee', 'got stuck in a revolving door', `{v} panics in the revolving door and goes round. And round. And round. Everyone else is already outside watching.`, { hurtOnly: true, r: [['b', '"How many times is that?"'], ['c', '"Seven."']] }),
  M('autodoor', 'city', 'flee', 'was ignored by an automatic door', `The automatic door opens for everyone. Then it closes, firmly, in {v}'s face.`, { hurtOnly: true, r: [['v', '"WHY DOESN\'T IT LIKE ME?"']] }),
  M('wrongside', 'any', 'any', 'barricaded the wrong side of the door', `{v} heroically barricades the door with a heavy cabinet. From the outside. On the same side as the {zs}.`, { r: [['b', '"{v}. Which side are you on?"'], ['v', '"...Oh no."']] }),
  M('lockedout', 'any', 'flee', 'locked themselves outside the safe room', `{v} slams the safe-room door shut behind everyone, perfectly. Unfortunately, {v} is still outside it.`),
  M('doorhandle', 'any', 'flee', 'got their belt loop caught on a door handle', `{v} sprints past a door and stops dead, caught by the belt loop on the handle, legs still going like a cartoon.`),
  M('outside', 'any', 'any', 'locked the door while everyone was outside', `{v} proudly announces the door is locked. Everyone is outside. The keys are inside.`, { hurtOnly: true, r: [['v', '"Don\'t worry, I\'ve locked the door."'], ['b', '"We are OUTSIDE."']] }),
  M('catflap', 'any', 'flee', 'tried to escape through a cat flap', `{v} attempts to escape through a cat flap. Head and one arm make it. Nothing else does.`),
  M('fridge', 'city', 'any', 'got trapped in a supermarket display freezer', `{v} hides in a display freezer. The lid clicks shut. It does not open from the inside.`),
  M('cupboard', 'any', 'flee', 'hid in a cupboard that already had a zombie in it', `{v} dives into a cupboard and pulls the door shut. It is quite cosy. It is also already occupied by a {z}.`),
  M('bed', 'any', 'flee', 'got stuck under a bed', `{v} slides under a bed to hide. It is a very low bed. {v} is now part of the bed.`),
  M('wardrobe', 'any', 'flee', 'hid in a wardrobe full of coat hangers', `{v} hides in a wardrobe. Every coat hanger in it falls down at once, like a xylophone of doom.`),
  M('wheeliebin', 'city', 'flee', 'hid in a wheelie bin that rolled downhill', `{v} hides in a wheelie bin. The bin is on a hill. The bin starts rolling.`),
  // ---------- noise ----------
  M('bluetooth', 'any', 'any', 'accidentally connected to a Bluetooth speaker while hiding', `While hiding in total silence, {v}'s phone connects to a Bluetooth speaker somewhere nearby and starts blasting music.`, { noise: true, r: [['b', '"TURN IT OFF!"'], ['v', '"I\'M TRYING! It\'s on SHUFFLE!"']] }),
  M('sneeze', 'any', 'flee', 'sneezed while pretending to be dead', `{v} plays dead perfectly. Then the dust gets up their nose. ACHOO.`, { noise: true, r: [['b', '"You were SO close."']] }),
  M('squeakytoy', 'any', 'any', 'stepped on a squeaky toy while sneaking', `Sneaking in perfect silence, {v} steps on a child's squeaky toy. SQUEEEAK. Every head in the area turns.`, { noise: true }),
  M('crisps', 'any', 'any', 'tried to quietly open a packet of crisps', `{v} tries to open a packet of crisps quietly. It is the loudest noise anyone has heard since the world ended.`, { noise: true, r: [['b', '"Was that worth it?"'], ['v', '"They\'re cheese and onion. So yes."']] }),
  M('walkie', 'any', 'any', 'broadcast their own hiding place over a walkie-talkie', `{v} presses the walkie-talkie button by accident and announces, loud and clear, exactly where everyone is hiding.`, { noise: true }),
  M('carhorn', 'city', 'flee', 'pressed the car horn while hiding in a car', `{v} hides in a parked car and leans back, very slowly, onto the horn. HOOOOONK.`, { noise: true, r: [['b', '"Of all the buttons, {v}."']] }),
  M('ringtone', 'any', 'any', 'had their ringtone go off while hiding', `{v}'s phone picks this exact moment to get a notification. Their ringtone is a duck quacking. Loudly.`, { noise: true }),
  M('hiccups', 'any', 'flee', 'got hiccups while hiding', `{v} is perfectly hidden. Then: *hic*. *HIC*. *HIIIC*.`, { noise: true }),
  M('stomach', 'any', 'flee', 'had their stomach rumble at the worst moment', `It is silent. The {z} is right there. And then {v}'s stomach makes a noise like a whale.`, { noise: true }),
  M('kettle', 'any', 'any', 'accidentally switched on a whistling kettle', `{v} leans on a counter and switches on a kettle. It starts whistling, louder and louder.`, { noise: true }),
  M('alarm', 'city', 'any', 'set off a car alarm by leaning on it', `{v} leans on a car to catch their breath. WEE-OO WEE-OO WEE-OO.`, { noise: true }),
  M('foghorn', 'ship', 'any', 'leaned on the ship\'s foghorn button', `{v} leans against the wall for a rest. Right on the foghorn button. BWAAAAAAAMP.`, { noise: true }),
  M('speech', 'any', 'flee', 'started a heroic speech and got interrupted', `{v} turns to face the danger and begins a dramatic speech. "My friends, if this is our final..." They do not get to the end.`),
  M('celebrate', 'any', 'flee', 'celebrated too early', `{v} punches the air. "WE MADE IT!" There is another {z} directly behind {v}.`, { r: [['b', '"Never celebrate early. NEVER."']] }),
  M('selfie', 'any', 'any', 'stopped for a selfie at the worst possible moment', `{v} stops to take a quick photo. The flash goes off. The flash goes off in a {z}'s face.`, { noise: true }),
  M('karaoke', 'ship', 'any', 'switched on the karaoke machine', `{v} leans on a switch in the ship's bar and the karaoke machine roars to life at full volume.`, { noise: true }),
  M('whistle', 'any', 'any', 'tested a rescue whistle in the wrong place', `{v} finds a rescue whistle and, without thinking, tests it. Everything within a mile hears the test.`, { noise: true }),
  // ---------- trips, slips and falls ----------
  M('banana', 'any', 'flee', 'slipped on a banana peel while escaping', `{v} is sprinting for safety when they step squarely on a banana peel. Feet up. Down hard.`, { r: [['b', '"A BANANA? Where did a banana even come from?!"']] }),
  M('laces', 'any', 'flee', 'tripped over their own shoelaces during a heroic escape', `{v} is mid-heroic escape when they tread on their own shoelace and go flying.`, { r: [['b', '"Double knots, {v}. DOUBLE KNOTS."']] }),
  M('forgotjump', 'any', 'flee', 'forgot to jump while jumping over something', `{v} runs at the obstacle, ready to vault it, and simply forgets to jump. Straight into it.`),
  M('trousers', 'any', 'flee', 'had their trousers fall down while running', `{v} is running from the horde when their trousers fall down. All the way down.`, { r: [['b', '"Nobody look! NOBODY LOOK!"'], ['c', '"I already looked."']] }),
  M('fence', 'any', 'flee', 'got their underwear caught on a fence', `{v} vaults a fence and does not make it. Their underwear is caught on the top. They are just... hanging there.`, { r: [['b', '"Should we help?"'], ['c', '"I think we give them a moment."'], ['a', '"THE {ZSU} ARE COMING!"']] }),
  M('carslide', 'city', 'flee', 'tried an action-movie slide across a car bonnet', `{v} attempts an action-movie slide across a car bonnet, gets halfway, sticks, and falls off the far side.`, { r: [['v', '"That works in films."'], ['b', '"Films use a STUNT DOUBLE."']] }),
  M('trolley', 'city', 'any', 'was knocked over by a runaway shopping trolley', `A runaway shopping trolley comes out of nowhere and takes {v} out at the knees.`),
  M('skateboard', 'city', 'flee', 'stepped on a skateboard', `{v} steps onto an abandoned skateboard mid-escape and rolls, arms flailing, in completely the wrong direction.`),
  M('marbles', 'any', 'flee', 'slipped on a box of spilled marbles', `{v} runs straight through a spill of children's marbles and briefly becomes a cartoon character.`),
  M('mop', 'any', 'flee', 'slipped on a freshly mopped floor', `A yellow sign says WET FLOOR. {v} does not read the sign.`),
  M('rake', 'forest', 'any', 'stepped on a rake', `{v} steps on a rake. The handle swings up and smacks {v} right in the face.`),
  M('rakes2', 'forest', 'any', 'stepped on two rakes in a row', `{v} steps on a rake. Then, while recovering, steps on another rake.`),
  M('log', 'forest', 'flee', 'tripped over a very obvious log', `{v} looks back to check on the others and trips over the biggest log in the forest.`),
  M('mud', 'forest', 'flee', 'got both boots stuck in mud', `{v}'s boots sink into the mud. {v} keeps running. The boots stay.`),
  M('stream', 'forest', 'flee', 'tried to leap a stream and landed in the middle', `{v} leaps for the far bank of the stream with total confidence and lands perfectly in the middle of it.`),
  M('vine', 'forest', 'flee', 'tried to swing on a vine like in the films', `{v} grabs a hanging vine to swing across like an action hero. The vine was not attached to anything.`),
  M('tent', 'forest', 'flee', 'got tangled in a collapsed tent', `{v} runs straight through an abandoned campsite and ends up wrapped in a collapsed tent like a burrito.`),
  M('hammock', 'forest', 'any', 'tried to rest in a hammock and flipped over', `{v} lies down in an old hammock for a second. It flips. {v} lands face down in the pine needles.`),
  M('deck', 'ship', 'flee', 'slipped on a wet deck', `The deck is soaking wet. {v} hits it at full speed and slides about twenty metres on their back.`),
  M('porthole', 'ship', 'flee', 'got stuck trying to squeeze through a porthole', `{v} decides to escape through a porthole. Portholes are very small. {v} is not.`),
  M('lifejacket', 'ship', 'any', 'inflated a lifejacket indoors', `{v} pulls the cord on a lifejacket to see if it works. It works. In a very narrow corridor. {v} is now wedged in place.`),
  M('ladder', 'ship', 'flee', 'climbed a ladder the wrong way up', `{v} scrambles up a ladder in a panic, facing the wrong way, and misses every other rung.`),
  M('buffet', 'ship', 'flee', 'slipped on the buffet', `{v} sprints through the ship's restaurant and hits a puddle of old soup at full speed.`),
  M('pool', 'ship', 'flee', 'ran straight into the swimming pool', `{v} is so busy looking back at the {zs} that they run straight off the edge of the swimming pool.`),
  M('stairs', 'any', 'flee', 'missed the last step', `{v} takes the stairs three at a time, which goes brilliantly until the last one.`),
  M('escalator', 'city', 'flee', 'ran up the down escalator', `{v} sprints up the escalator. It is the down escalator. And it is still working.`),
  M('trapdoor', 'any', 'any', 'stood on the one loose floorboard', `{v} finds the only loose floorboard in the entire building, with both feet.`),
  M('spin', 'any', 'flee', 'spun round to look cool and got dizzy', `{v} spins round dramatically to face the danger, overdoes it, and spins straight into a wall.`),
  M('chair', 'any', 'any', 'leaned back on a chair', `{v} leans back on a chair to look relaxed. Everyone told {v} not to do that, for years.`),
  // ---------- vehicles ----------
  M('handbrake', 'city', 'flee', 'forgot to release the handbrake', `{v} jumps into the getaway car, floors it, and the car does not move. The handbrake is still on. The engine screams. So does everyone else.`),
  M('passenger', 'city', 'flee', 'got into the passenger seat when nobody was driving', `{v} leaps into the escape car, slams the door, and shouts "GO!" Nobody is in the driver's seat. {v} is in the passenger seat.`, { r: [['b', '"WHO DID YOU THINK WAS DRIVING?!"']] }),
  M('reverse', 'city', 'flee', 'put the car in reverse', `{v} gets the car started and slams it into gear. Reverse. Straight back into the problem.`),
  M('seatbelt', 'city', 'flee', 'got tangled in a seatbelt', `{v} tries to leap out of the car and is held firmly in place by the seatbelt, which they forgot was on.`),
  M('bike', 'city', 'flee', 'grabbed a bike with no chain', `{v} jumps on an abandoned bike and pedals furiously. There is no chain. The pedals spin. The bike does not move.`),
  M('scooter', 'city', 'flee', 'tried to escape on a kids\' scooter', `{v} escapes on a child's scooter. It is pink. It has tassels. It is very, very slow.`),
  M('golfbuggy', 'ship', 'flee', 'crashed a golf buggy into a buffet', `{v} commandeers a deck buggy and drives it straight into a dessert table.`),
  M('quadbike', 'forest', 'flee', 'stalled a quad bike in front of everyone', `{v} jumps on a quad bike, revs it heroically, and stalls it. Then stalls it again.`),
  M('boat', 'forest', 'flee', 'pushed off in a rowing boat that was still tied up', `{v} leaps into a rowing boat and shoves off. The boat is still tied to the jetty. It travels one metre.`),
  M('lifeboat', 'ship', 'flee', 'lowered the lifeboat with themselves on the wrong end', `{v} heroically lowers a lifeboat, with only one end of the ropes, and slides down it like a playground slide.`),
  M('trolleyride', 'city', 'flee', 'rode a shopping trolley down a hill with no brakes', `{v} jumps in a shopping trolley for a quick getaway down the hill. There are no brakes. There is a wall.`),
  // ---------- items and tools ----------
  M('grenadepin', 'any', 'flee', 'threw the pin instead of the firework', `{v} pulls the pin on a firework flare, throws it with real power, and looks down. {v} threw the pin. The flare is still in {v}'s hand.`),
  M('extinguisher', 'any', 'any', 'blinded themselves with a fire extinguisher', `{v} grabs a fire extinguisher as a weapon and squeezes the handle. It is pointing the wrong way.`, { r: [['b', '"You were holding it BACKWARDS."'], ['v', '"I can\'t SEE anything!"']] }),
  M('torch', 'any', 'any', 'shone a torch into their own eyes', `{v} checks if the torch works by looking straight into it. It works. {v} cannot see anything now.`),
  M('map', 'any', 'any', 'held the map upside down', `{v} confidently leads everyone the wrong way for ten minutes, holding the map upside down the entire time.`, { noise: true, hurtOnly: true }),
  M('backpack', 'any', 'flee', 'got their backpack stuck in a doorway', `{v} squeezes through a gap. {v} makes it. The overstuffed backpack does not, and pulls {v} straight back.`),
  M('umbrella', 'any', 'any', 'opened an umbrella as a shield', `{v} opens an umbrella as a shield. It is a cocktail umbrella. It does not help.`),
  M('tape', 'any', 'any', 'taped their own hands together', `{v} tries to bandage a wound with tape in a hurry and ends up taping both hands together.`),
  M('glue', 'city', 'any', 'stuck their hand to a shelf with superglue', `{v} grabs a tube from the shelf, squeezes, and is now permanently attached to the shelf.`),
  M('fireworks', 'any', 'any', 'set off a box of fireworks', `{v} finds a box of fireworks and "just checks them". The whole box goes off at once.`, { noise: true }),
  M('trap', 'forest', 'any', 'set their own trap off', `{v} carefully sets a trap for the {zs}, explains it proudly to everyone, then steps in it.`, { r: [['v', '"It WORKS, though."']] }),
  M('rope', 'any', 'flee', 'tied the escape rope to themselves instead of the post', `{v} ties the escape rope with great care. To {v}'s own ankle. Then throws the other end down.`),
  M('flare', 'any', 'any', 'lit a flare indoors', `{v} lights a flare to see better. Indoors. It fills the room with red smoke and sets off every alarm.`, { noise: true }),
  M('binoculars', 'any', 'any', 'looked through binoculars the wrong way round', `{v} scans for danger with the binoculars, the wrong way round, and announces that everything is "really far away". It is not.`, { noise: true }),
  M('compass', 'any', 'any', 'followed a compass towards the fridge', `{v}'s compass leads everyone confidently north. It was pointing at a fridge magnet in {v}'s pocket.`, { noise: true, hurtOnly: true }),
  M('sling', 'forest', 'any', 'hit themselves with their own slingshot', `{v} pulls the slingshot back as far as it will go and lets go of the wrong bit.`),
  M('crowbar', 'any', 'any', 'hit themselves with their own crowbar', `{v} heaves on a crowbar with everything they have. The crate pops open. The crowbar flies back into {v}'s face.`),
  // ---------- hiding and disguises ----------
  M('mannequin', 'city', 'any', 'rescued a mannequin instead of a survivor', `{v} heroically drags a survivor out of a shop window, carries them to safety, and finds out it is a mannequin. While the real danger catches up.`),
  M('mannequin2', 'city', 'flee', 'pretended to be a mannequin and wobbled', `{v} freezes among the shop mannequins. Totally still. Then wobbles. Then knocks over every mannequin like dominoes.`),
  M('bush', 'forest', 'flee', 'hid in a bush full of nettles', `{v} dives into the nearest bush to hide. It is a nettle bush. A big one.`),
  M('treehide', 'forest', 'flee', 'climbed a tree and could not get down', `{v} scrambles up a tree to escape. Climbing up was easy. Coming down is a whole new problem.`),
  M('pinecone', 'forest', 'any', 'was hit by a falling pinecone', `A pinecone the size of a fist drops from a very tall tree, straight onto {v}'s head.`),
  M('deer', 'forest', 'any', 'was headbutted by a deer', `A terrified deer bursts out of the trees and headbutts {v} on its way past.`),
  M('geese', 'forest', 'any', 'was chased by a goose', `A goose. An absolutely furious goose. It goes straight for {v}. The {zs} watch.`),
  M('swan', 'forest', 'any', 'was attacked by a swan', `{v} wanders too close to the lake. A swan rises up, wings out, and everyone learns why you do not do that.`),
  M('seagull', 'ship', 'any', 'had a seagull steal their snack and their dignity', `A seagull dive-bombs {v} for their snack and takes the snack, a chunk of hair and {v}'s balance with it.`),
  M('pigeon', 'city', 'any', 'was startled by a pigeon', `A pigeon flutters up right in {v}'s face. {v} screams, panics and falls over a bench.`),
  M('deckchair', 'ship', 'any', 'tried to put up a deckchair', `{v} tries to unfold a deckchair for a quick rest. The deckchair wins.`),
  M('lostlife', 'ship', 'flee', 'hid in a lifeboat cover that collapsed', `{v} hides under a lifeboat cover. The cover gives way and {v} drops straight into the boat below.`),
  // ---------- confidence and stupidity ----------
  M('intimidate', 'any', 'flee', 'tried to intimidate a zombie that did not care', `{v} puffs up, roars and beats their chest at the {z}. The {z} does not care. At all. It just keeps coming.`),
  M('fakeinjury', 'any', 'any', 'faked an injury to get out of something, then actually got injured', `{v} fakes a limp to get out of going first. While limping dramatically, {v} trips over their own fake limp.`, { r: [['b', '"Karma, {v}."']] }),
  M('shortcut', 'any', 'flee', 'took a shortcut straight into a room full of zombies', `{v} shouts "SHORTCUT!" and goes through a side door. It is a room. It is full. Of {zs}.`),
  M('coolshades', 'any', 'any', 'wore sunglasses in the dark to look cool', `{v} puts on sunglasses to look cool. It is night time. {v} walks straight into a lamp post.`),
  M('backflip', 'any', 'any', 'attempted a celebratory backflip', `{v} celebrates with a backflip. {v} has never done a backflip before. That remains true.`),
  M('kickdoor', 'any', 'any', 'tried to kick a door open like in the films', `{v} kicks the door like an action hero. It does not open. {v}'s foot has a very bad time.`),
  M('karate', 'any', 'flee', 'attempted karate learned from a film', `{v} drops into a karate stance from a film. It is not a real stance. It does not help.`),
  M('helpdoor', 'any', 'any', 'held the door open for a zombie', `Out of pure habit, {v} holds the door open for the person behind them. It is not a person.`, { r: [['b', '"Did you just hold the door for it?!"'], ['v', '"I was raised POLITE!"']] }),
  M('wave', 'any', 'any', 'waved at a zombie thinking it was a friend', `{v} waves happily at a familiar figure in the distance. "Hiya!" It is not a friend.`),
  M('countdown', 'any', 'flee', 'counted down to three and went on two', `{v} shouts "On three! One, two..." and goes on two. Alone. Straight into the danger.`),
  M('soapbox', 'any', 'any', 'stood on a box that was full of air', `{v} climbs onto a box to get a better look. It is an empty cardboard box. It folds instantly.`),
  M('yawn', 'any', 'any', 'yawned so loudly it echoed', `{v} lets out the biggest, loudest yawn of their life at exactly the wrong moment.`, { noise: true }),
  M('cheered', 'any', 'flee', 'stopped to high-five someone mid-escape', `{v} stops mid-escape to high-five a teammate. The teammate is busy running. {v} is left with their hand in the air.`),
  M('ownhat', 'any', 'flee', 'went back for their hat', `{v}'s hat blows off. {v} goes back for it. Of course {v} goes back for it.`),
];

// Endings for an accident: how it finishes when someone is hurt or killed.
const HURT_TAIL = [` {v} gets up, bruised, scraped and deeply embarrassed.`, ` {v} limps on, hurt, and refuses to talk about it.`, ` {v} survives. Their dignity does not.`, ` It hurts. A lot. Mostly {v}'s pride, but also {v}.`];
const DEATH_TAIL = [` It is the last mistake {v} ever makes. The {zs} are there before anyone can help.`, ` By the time anyone reaches {v}, it is far too late.`, ` Nobody can get to {v} in time. It is a ridiculous way to go. It is still a terrible loss.`];

// How the others react (shock, then the friends they are).
export const HURT_REACT = [
  [['a', '"Did {v} just..."'], ['b', '"Yep."'], ['a', '"In the middle of THIS?"']],
  [['a', '"Are you okay, {v}?"'], ['v', '"Don\'t."'], ['a', '"I didn\'t say anything."'], ['v', '"You were GOING to."']],
  [['a', '"Nobody is allowed to tell anyone about this."'], ['b', '"I\'m telling everyone."']],
  [['-', 'Nobody laughs. For about two seconds.'], ['a', '(wheezing) "Sorry. I\'m so sorry. Are you okay?"']],
  [['v', '"That was... on purpose."'], ['a', '"Was it?"'], ['v', '"...No."']],
  [['a', '"I want it on record that I saw that."'], ['v', '"Please don\'t."'], ['a', '"It\'s on the record, {v}."']],
  [['a', '"We are in a ZOMBIE APOCALYPSE and THAT is what got you?"'], ['v', '"I am aware."']],
  [['-', 'Somebody snorts. Then everybody does.'], ['v', '"I\'M HURT."'], ['a', '"We know! We\'re sorry! Hold still!"']],
];
export const DEATH_REACT = [
  [['a', '"Of all the things that could have got {v}..."'], ['b', '"Nobody is allowed to tell anyone about this."']],
  [['-', 'Silence.'], ['a', '"That is not how I thought {v} would go."'], ['b', '"{v} would have found it funny."'], ['a', '"...{v} would have found it hilarious."']],
  [['a', '"Did that really just..."'], ['b', '"Yeah."'], ['a', '"We tell everyone {v} went down fighting. Agreed?"'], ['b', '"Agreed."']],
  [['a', '"I can\'t believe it. I actually can\'t believe it."'], ['b', '"Keep moving. We grieve later. And we never, ever laugh about this."'], ['-', 'Somebody laughs anyway, then cries. Then everyone moves on, very quietly.']],
];

// Context for an accident: setting, and whether someone is running from danger.
export function envOf(adv) { return adv.env || adv.words?.place || 'any'; }

// Pick an accident that fits and has not happened this game (or in recent games).
export function pickMishap(s, adv, r, { flee = false, death = false } = {}) {
  const env = envOf(adv);
  const used = new Set([...(s.bt?.mishapIds || []), ...(s.bt?.avoidMishaps || [])]);
  let pool = MISHAPS.filter((m) => (m.env.includes('any') || m.env.includes(env)) && (m.sit === 'any' || flee) && !(death && m.hurtOnly) && !used.has(m.id));
  if (!pool.length) pool = MISHAPS.filter((m) => (m.env.includes('any') || m.env.includes(env)) && !(death && m.hurtOnly) && !(s.bt?.mishapIds || []).includes(m.id));
  if (!pool.length) return null;
  // setting-specific accidents are a little more likely, so they feel like they belong
  return r.weighted(pool, (m) => (m.env.includes(env) ? 2 : 1) * (m.sit === 'flee' && flee ? 1.5 : 1));
}
// For noise and wrong turns, the danger comes to them.
const NOISE_HURT = [` A {z} comes to see what the fuss is and gets a hand on {v} before the others drag them clear.`, ` Two {zs} arrive to investigate. {v} gets out, but not in one piece.`, ` Something comes running. {v} is the closest, and comes off worst.`];
const NOISE_DEATH = [` Every {z} nearby comes running, and {v} is the closest.`, ` The {zs} find {v} first. Nobody can get there in time.`];
export function mishapText(m, r, death) { return m.lead + r.pick(m.noise ? (death ? NOISE_DEATH : NOISE_HURT) : death ? DEATH_TAIL : HURT_TAIL); }

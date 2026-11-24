// ADVENTURE 2: DEADWOOD FOREST — wilderness outbreak, reach the ranger station beacon.
import { addComedy } from './chaos.js';
import { O, C, U, search, safe, rush, travelTables, GENERIC_QUIPS, GENERIC_DEATH_LINES, companionEvents, companionRescue, infectionEvents, roleEvents } from './kit.js';

const A = 'dwf';
const E = (id, o) => ({ id: `${A}_${id}`, ...o });

const items = {
  flashlight: { name: `Head Torch`, icon: 'torch', desc: `A camping head torch. Each use drains the battery.`, tags: ['light'], qty: 3, max: 6 },
  batteries: { name: `AA Batteries`, icon: 'battery', desc: `Recharges the head torch (+3 uses). Use it from the backpack any time.`, anytime: 'recharge', target: 'flashlight', amount: 3, qty: 1, max: 4 },
  first_aid: { name: `First Aid Kit`, icon: 'medkit', desc: `Restores 2 health to your most injured survivor. Use any time.`, tags: ['medical'], anytime: 'heal', heal: 2, qty: 1, max: 3 },
  bandages: { name: `Bandages`, icon: 'bandage', desc: `Restores 1 health to your most injured survivor. Use any time.`, tags: ['medical'], anytime: 'heal', heal: 1, qty: 2, max: 6 },
  trail_mix: { name: `Trail Mix`, icon: 'food', desc: `Nuts, raisins and suspicious chocolate. Restores 1 health. Animals love it.`, tags: ['food'], anytime: 'heal', heal: 1, qty: 1, max: 5 },
  berries: { name: `Wild Berries`, icon: 'berries', desc: `Safe, sweet blackberries. Restores 1 health.`, tags: ['food'], anytime: 'heal', heal: 1, qty: 2, max: 6 },
  hatchet: { name: `Hatchet`, icon: 'axe', desc: `A camping hatchet. Chops wood and worse. Wears out after a few uses.`, tags: ['melee', 'tool'], qty: 3, max: 3, unique: true },
  rifle: { name: `Hunting Rifle`, icon: 'rifle', desc: `An old bolt-action rifle. Quantity is rounds left. Loud enough to echo for miles.`, tags: ['gun'], qty: 2, max: 6 },
  bear_spray: { name: `Bear Spray`, icon: 'spray', desc: `Capsaicin spray. Stops a charging bear. Probably stops other things too.`, tags: ['spray'], qty: 2, max: 3 },
  flare_gun: { name: `Flare Gun`, icon: 'flare', desc: `An orange flare pistol. A signal visible for miles, and very loud.`, tags: ['signal', 'noise', 'light'], qty: 1, max: 3 },
  whistle: { name: `Safety Whistle`, icon: 'generic', desc: `Ear-splitting. Useful for distractions.`, tags: ['noise'], qty: 1, max: 1, unique: true },
  rope: { name: `Climbing Rope`, icon: 'rope', desc: `Thirty metres of rope.`, tags: ['rope'], qty: 1, max: 1, unique: true },
  map: { name: `Trail Map`, icon: 'map', desc: `Laminated park map with the ranger station circled in red.`, tags: ['map'], qty: 1, max: 1, unique: true },
  compass: { name: `Compass`, icon: 'compass', desc: `Points north. In a forest, that is everything.`, tags: ['map'], qty: 1, max: 1, unique: true },
  fuse: { name: `Beacon Fuse`, icon: 'fuse', desc: `A heavy ceramic fuse labelled "EMERGENCY BEACON — SPARE".`, tags: ['beacon'], qty: 1, max: 1, unique: true },
  fuel: { name: `Jerrycan of Fuel`, icon: 'fuel', desc: `Five litres of petrol. Enough to run a generator for a while.`, tags: ['fuel'], qty: 1, max: 1, unique: true },
  keycard: { name: `Ranger Keycard`, icon: 'card', desc: `Opens Parks Service doors and lockers.`, tags: ['key'], qty: 1, max: 1, unique: true },
  radio: { name: `CB Radio`, icon: 'radio', desc: `A handheld radio on channel 9. Range is poor in the trees.`, tags: ['radio', 'signal'], qty: 1, max: 1, unique: true },
  antidote: { name: `Field Antiviral`, icon: 'syringe', desc: `Military autoinjector from the bunker. "EXPERIMENTAL — POST-EXPOSURE". Use from the backpack.`, tags: ['cure'], anytime: 'cure', qty: 1, max: 1, unique: true },
  files: { name: `Project Deadwood Files`, icon: 'book', desc: `Classified files from the bunker. They explain exactly where the outbreak started.`, tags: ['secret'], qty: 1, max: 1, unique: true },
};

const L = (name, scene, loot, travel, extra = {}) => ({ name, scene, loot, travel, ...extra });
const locations = {
  campsite: L(`Pinecrest Campsite`, 'campsite', ['flashlight', 'trail_mix', 'bandages', 'map', 'whistle']),
  lake: L(`Mirror Lake`, 'lake', ['rope', 'trail_mix', 'flashlight', 'bear_spray'], { l: `Follow the shore of Mirror Lake`, d: `Flat, open and quiet. Long way round though.`, risk: 'low' }),
  trail: L(`Old Logging Trail`, 'forest', ['hatchet', 'compass', 'bandages', 'batteries', 'fuel'], { l: `Take the old logging trail`, d: `Overgrown but direct. Thick trees on both sides.`, risk: 'med' }),
  cabins: L(`Holiday Cabins`, 'cabin', ['first_aid', 'trail_mix', 'batteries', 'radio'], { l: `Cut through the holiday cabins`, d: `Supplies inside, maybe. Doors hanging open.`, risk: 'high' }),
  river: L(`Blackwater River`, 'river', ['rope', 'bandages', 'flashlight', 'trail_mix'], { l: `Head down to Blackwater River`, d: `Follow the water downstream. Easy to navigate, hard to cross.`, risk: 'med' }),
  ridge: L(`Eagle Ridge`, 'ridge', ['compass', 'flare_gun', 'bandages'], { l: `Climb over Eagle Ridge`, d: `High ground and a view of everything. Steep and exposed.`, risk: 'high', time: 1 }),
  swamp: L(`Deadwood Marsh`, 'swamp', ['berries', 'rope', 'bear_spray'], { l: `Wade through Deadwood Marsh`, d: `Slow, wet, foggy. Nothing can see you. You cannot see it either.`, risk: 'low' }, { light: 'fog' }),
  cave: L(`Hollow Caves`, 'cave', ['flashlight', 'batteries', 'rope'], { l: `Shelter in the Hollow Caves`, d: `A cave system that cuts under the hill. Dark and echoey.`, risk: 'high', time: 1 }, { light: 'dark' }),
  mine: L(`Old Silver Mine`, 'mine', ['hatchet', 'fuel', 'batteries', 'flashlight'], { l: `Go through the old silver mine`, d: `Abandoned tunnels, rusty rails, and old machinery.`, risk: 'med' }, { light: 'dim' }),
  outpost: L(`Ranger Outpost 7`, 'outpost', ['first_aid', 'radio', 'flare_gun', 'keycard', 'fuse', 'fuel'], { l: `Make for Ranger Outpost 7`, d: `A small ranger hut with a radio mast. Might have supplies.`, risk: 'med' }),
  gorge: L(`Hangman's Gorge`, 'gorge', ['rope', 'trail_mix', 'bandages'], { l: `Cross at Hangman's Gorge`, d: `An old rope bridge over a long drop. The fastest way over.`, risk: 'high', time: 1 }),
  road: L(`Forest Road`, 'road', ['fuel', 'first_aid', 'flashlight', 'bear_spray'], { l: `Follow the forest road`, d: `A gravel road with abandoned cars. Easy walking, easy to be seen.`, risk: 'med' }),
  bunker: L(`The Hidden Bunker`, 'bunker', ['first_aid', 'batteries', 'fuse', 'flashlight'], { l: `Search for the bunker on the old map`, d: `A concrete door in the hillside. Nobody is meant to know it is there.`, risk: 'low' }),
  lookout: L(`Fire Lookout Tower`, 'lookout', ['flare_gun', 'radio', 'fuel', 'bandages'], { l: `Climb to the fire lookout`, d: `A tall wooden tower. You will see the ranger station from the top.`, risk: 'med' }),
  meadow: L(`Wildflower Meadow`, 'meadow', ['berries', 'trail_mix', 'bandages', 'fuel'], { l: `Cross the wildflower meadow`, d: `Open grass right up to the station. Nowhere to hide.`, risk: 'high', time: 1 }),
  lumber: L(`Lumber Camp`, 'cabin', ['fuel', 'hatchet', 'rope', 'first_aid'], { l: `Pass through the lumber camp`, d: `Sawmill and bunkhouses. Lots of tools, lots of hiding places.`, risk: 'low' }),
  station: L(`Emergency Ranger Station`, 'ranger', []),
};

const events = [
  // ---------------- OPENINGS ----------------
  E('open_campfire', {
    cat: 'opening', loc: 'campsite', essential: true, title: `Campfire Stories`,
    text: [`The campfire crackles. {a} is halfway through a ghost story when the tent at the edge of the clearing starts to shake. The family who were camped there earlier stumble out. They are moving wrong. Their eyes are milky white.`],
    cast: ['a', 'b?'], say: [['a', `"...and that is why you never camp at Pinecrest. Wait. What is that?"`], ['b', `"Is this part of the story? Please say this is part of the story."`, 'Nervous'], ['b', `"Those are not campers. Everyone up. Quietly."`, 'Leader']],
    choices: [
      C(`Grab the backpacks and run into the trees`, `Leave the fire burning and go.`, [O(0.7, 'neutral', `Everyone grabs a bag and melts into the dark forest. The camp is lost, but nobody is.`, [['time', 1]]), O(0.3, 'danger', `One of them is faster than it looks. It lunges at {r}!`, [['em', 'r']])]),
      search(`Grab supplies from the camp first`, `Torches, food, the map. You will need them.`, { item: 0.75, hurt: 0, danger: 0.15, t: { danger: `Too slow. One of them reaches {r} by the food box!` } }),
      C(`Throw burning logs at them`, `Fire scares everything. Probably.`, [O(0.6, 'good', `The burning logs make them stagger back. {Team} grabs a bag and slips away.`, [['item', 'flashlight']]), O(0.4, 'hurt', `A log rolls back toward {r}. Burnt boots and a scorched leg.`, [['hurt', 'r', 1]])]),
      safe(`Hide behind the log pile`, `Let them stumble past in the dark.`, { time: -1, t: `Breath held behind the logs. They shuffle past toward the lake.` }),
      C(`Try to talk to them`, `Maybe they are just sick. Or drunk.`, [O(0.5, 'funny', `"Excuse me, are you okay?" asks {a}. The answer is a long, wet growl. {Team} runs.`, [['funny']]), O(0.5, 'danger', `They are not okay. One goes straight for {r}.`, [['em', 'r']])]),
    ],
  }),
  E('open_morning', {
    cat: 'opening', loc: 'campsite', essential: true, title: `Too Quiet`,
    text: [`Morning at Pinecrest Campsite. No birdsong. No other campers. Every tent is empty, zipped open. On the noticeboard, someone has scrawled: FOREST INFECTED. RANGER STATION — BEACON — GO EAST.`],
    cast: ['a', 'b?'], say: [['a', `"Where is everyone?"`], ['b', `"This is literally how every horror film starts. Literally."`, 'Gamer'], ['b', `"No birds. Something is very wrong."`, 'Nature lover']],
    choices: [
      search(`Search the empty tents`, `People leave things behind when they run.`, { item: 0.7, hurt: 0, danger: 0.1 }),
      C(`Read the rest of the noticeboard`, `There might be more information.`, [O(1, 'item', `A park map is pinned underneath, with the ranger station circled. {a} takes it.`, [['item', 'map']])]),
      safe(`Leave immediately, heading east`, `Follow the message. No delays.`, { time: 1, t: `{Team} heads east into the trees. The sun is barely up.` }),
      C(`Check the camp shop`, `Supplies, maps and snacks.`, [O(0.55, 'item', `The shop is unlocked. {Team} takes {loot}.`, [['loot']]), O(0.45, 'danger', `The shopkeeper is still behind the counter. He comes over the top at {r}.`, [['em', 'r']])]),
      C(`Shout to see if anyone is still here`, `Someone might be hiding.`, [O(0.4, 'good', `A voice answers from a tree: a teenage camp counsellor, who throws down a whistle and points east before climbing higher.`, [['item', 'whistle']]), O(0.6, 'danger', `Something answers. Not with words. It comes for {r}.`, [['em', 'r']])]),
    ],
  }),
  E('open_radio', {
    cat: 'opening', loc: 'campsite', essential: true, title: `Channel Nine`,
    text: [`The camp radio crackles in the night: "All park visitors, this is Ranger Dale. There is an outbreak. Do not approach anyone acting strangely. Make your way to the Emergency Ranger Station. The beacon there will call rescue. I repeat, the beacon—" Static. Then screaming.`],
    cast: ['a', 'b?'], say: [['a', `"The ranger station. That is where we go."`], ['b', `"He screamed. Why did he scream?"`, 'Nervous'], ['b', `"Right. Boots on. Bags packed. Two minutes."`, 'Practical']],
    choices: [
      search(`Pack everything properly`, `Torch, food, first aid. Do it right.`, { item: 0.7, hurt: 0, t: { item: `In the bottom of a bag: {loot}. Good.` } }),
      C(`Try to answer the radio`, `Ranger Dale might still be there.`, [O(0.5, 'good', `"...hear me? Beacon needs power. Fuse or fuel. Find one." Then nothing. Important to know.`, [['flag', 'knows_power']]), O(0.5, 'neutral', `Nothing but static.`)]),
      safe(`Leave in the dark`, `Every minute counts.`, { time: 1, t: `{Team} creeps out of the campsite by moonlight.` }),
      C(`Wait for daylight`, `The forest at night is a death trap.`, [O(0.7, 'neutral', `A tense night in the tent. At dawn, {team} sets off, rested.`, [['time', -2]]), O(0.3, 'danger', `Something unzips the tent at 3am. It reaches for {r}.`, [['em', 'r'], ['time', -1]])]),
      C(`Take the radio with you`, `It is heavy, but it could be useful.`, [O(1, 'item', `The radio comes off its mount. {loot} added to the backpack.`, [['item', 'radio']])]),
    ],
  }),

  // ---------------- CAMPSITE ----------------
  E('camp_raccoon', {
    cat: 'humour', loc: 'campsite', title: `The Thief`,
    text: [`A raccoon is sitting on top of the cool box, holding a whole packet of biscuits, staring at {team} like they are the intruders.`],
    cast: ['a', 'b?'], say: [['a', `"That is our breakfast."`], ['b', `"It has tiny hands. I cannot fight something with tiny hands."`, 'Funny']],
    choices: [
      C(`Chase it off`, `Wave your arms and shout.`, [O(0.5, 'funny', `The raccoon drops the biscuits and flees, hissing insults.`, [['item', 'trail_mix'], ['funny']]), O(0.5, 'hurt', `The raccoon does not flee. {r} gets scratched. It is just a raccoon scratch. Probably.`, [['hurt', 'r', 1], ['funny']])]),
      C(`Bribe it with something else`, `Trade for the biscuits.`, [O(1, 'funny', `The raccoon considers the offer, accepts, and leaves the biscuits behind. Business.`, [['item', 'trail_mix'], ['funny']])]),
      safe(`Let it have the biscuits`, `It has earned them.`, { t: `The raccoon eats every biscuit while maintaining eye contact.` }),
      search(`Search the rest of the camp while it is distracted`, `Use the time well.`, { item: 0.6, hurt: 0 }),
      C(`Take a photo of it`, `For the memories.`, [O(1, 'funny', `{a} takes the photo. The raccoon poses. It is the best photo anyone has ever taken.`, [['funny']])]),
    ],
  }),

  // ---------------- MIRROR LAKE ----------------
  E('lake_jetty', {
    cat: 'exploration', loc: 'lake', title: `The Jetty`,
    text: [`Mirror Lake lies perfectly still under the mist. A wooden jetty juts out into the water with a canoe tied to the end. On the far shore, the trail continues east.`],
    scene: { light: 'fog' }, cast: ['a', 'b?'], say: [['a', `"A canoe. We could paddle straight across."`], ['b', `"Water is good. They cannot swim. Can they swim?"`, 'Nervous']],
    choices: [
      C(`Paddle the canoe across the lake`, `Faster than walking round.`, [O(0.6, 'good', `The canoe glides across the glassy water. A shortcut and a moment of peace.`, [['time', 2], ['shortcut', 1]]), O(0.25, 'funny', `{a} paddles in a circle for ten minutes. Eventually, everyone gets across.`, [['funny']]), O(0.15, 'danger', `Halfway across, a hand rises out of the water and grabs the side of the canoe near {r}!`, [['em', 'r']])]),
      search(`Search the boathouse`, `Life jackets, ropes, fishing gear.`, { item: 0.6, hurt: 0.05, danger: 0.1 }),
      safe(`Walk round the shore`, `Stay on dry land.`),
      C(`Fill water bottles and rest`, `Clean water and a sit-down.`, [O(0.8, 'good', `Cold, clean water. Everyone feels better.`, [['heal', 'injured', 1], ['time', -1]]), O(0.2, 'danger', `Something in the reeds has been watching. It comes for {r}.`, [['em', 'r']])]),
      C(`Skim stones to calm everyone down`, `Morale matters.`, [O(1, 'funny', `{a} gets seven bounces. Everyone is weirdly proud. Then they move on.`, [['funny'], ['time', -1]])]),
    ],
  }),
  E('lake_birdwatcher', {
    npc: ['pemberton'],
    cat: 'rescue', loc: 'lake', title: `The Birdwatcher`,
    text: [`A man in a hide by the lake is peering through enormous binoculars, completely unaware of the apocalypse. "Shh! A great crested grebe!" His name is Pemberton. He has been in the hide since Thursday.`],
    cast: ['a', 'b?:Nature lover'], say: [['b', `"Oh! A grebe! Where?"`, 'Nature lover'], ['a', `"Pemberton, there are zombies."`]],
    choices: [
      C(`Bring Pemberton with you`, `He cannot stay here alone.`, [O(1, 'funny', `Pemberton packs up his flask and joins. He narrates every bird he sees in a whisper. He also has a compass.`, [['npc', 'pemberton'], ['item', 'compass'], ['funny']])], { major: true }),
      C(`Borrow his binoculars to scout`, `Those things could see the ranger station.`, [O(1, 'good', `Through the binoculars: the ranger station's radio mast, far to the east, and a clear path along the shore.`, [['time', 1]])]),
      C(`Explain the situation slowly`, `Make sure he understands.`, [O(0.5, 'good', `Pemberton goes pale. "Ah. That explains the chap who tried to eat my sandwich." He gives {team} {loot} and hurries off.`, [['loot']]), O(0.5, 'funny', `Pemberton nods, then whispers: "Fascinating. Is it a new species?" He refuses to leave.`, [['funny']])]),
      safe(`Leave him to it`, `He seems happy.`, { t: `Pemberton waves without lowering his binoculars.` }),
      C(`Share some food with him`, `He has been there since Thursday.`, [O(1, 'good', `Pemberton is so grateful he gives {team} his spare first aid kit.`, [['item', 'first_aid']])]),
    ],
  }),

  // ---------------- LOGGING TRAIL ----------------
  E('trail_tree', {
    cat: 'hazard', loc: 'trail', title: `Fallen Giant`,
    text: [`A huge pine has fallen across the logging trail, roots and all. It is taller than a bus lying on its side. Going round means bushwhacking through thick undergrowth.`],
    cast: ['a', 'b?'], say: [['a', `"Over, under, or around?"`], ['b', `"I vote we just sit down and cry a bit first."`, 'Funny']],
    choices: [
      rush(`Climb over the trunk`, `It is slippery, but quick.`, { hurt: 0.2, danger: 0, time: 1, t: { hurt: `{r} slips on the mossy bark and lands hard on the other side.`, ok: `Up, over, and down. Easy.` } }),
      C(`Crawl under the roots`, `There is a gap under the root ball.`, [O(0.6, 'neutral', `A muddy crawl, but everyone gets through.`, [['funny']]), O(0.4, 'danger', `Something was already sheltering under the roots. It grabs {r}!`, [['em', 'r']])]),
      safe(`Go the long way around`, `Through the brambles.`, { time: -2, t: `Scratched by brambles, stung by nettles, but safe.` }),
      C(`Chop a path with the hatchet`, `Cut through the branches.`, [O(1, 'good', `The hatchet makes short work of the branches. A clean path through.`, [['use', 'hatchet'], ['time', 1]])], { req: { items: ['hatchet'] } }),
      search(`Search the hollow in the trunk`, `Animals and people stash things in hollow trees.`, { item: 0.4, hurt: 0.15, t: { hurt: `A wasp nest. {r} is stung several times.`, item: `Inside the hollow: {loot}, wrapped in a plastic bag.` } }),
      C(`Look for a different trail`, `There might be a parallel path.`, [O(0.5, 'good', `A deer track runs alongside. Narrow, but clear.`), O(0.5, 'neutral', `No other trail. Back to the tree.`, [['time', -1]])]),
    ],
  }),
  E('trail_hunter', {
    npc: ['wade'],
    cat: 'interaction', loc: 'trail', req: { not: ['npc_wade'] }, title: `Wade`,
    text: [`A man in camouflage steps out from behind a tree, rifle raised. "Easy. Name's Wade. I hunt these woods." He lowers the gun. "I know a quick way to the ranger station. But I'm not going alone."`],
    cast: ['a', 'b?'], say: [['b', `"He has very shifty eyes."`, 'Sarcastic'], ['b', `"A local guide? We should trust him."`, 'Kind']],
    choices: [
      C(`Let Wade guide you`, `He knows the forest.`, [O(1, 'good', `Wade leads the way at a brisk pace. He knows every path.`, [['npc', 'wade'], ['time', 1]])], { major: true }),
      C(`Ask Wade to give you some ammunition`, `He has spare rounds on his belt.`, [O(0.6, 'item', `Wade grunts and hands over his old rifle. "Got another." {Team} gets {loot}.`, [['item', 'rifle']]), O(0.4, 'neutral', `"Get your own," says Wade, and walks off.`)]),
      safe(`Politely decline`, `You do not know him.`, { t: `Wade shrugs and disappears into the trees. He leaves no tracks at all.` }),
      C(`Ask what he knows about the outbreak`, `Locals hear things.`, [O(1, 'good', `"Started at the old military site in the hills," Wade says. "There's a bunker up there. Government stuff." He spits.`, [['flag', 'knows_bunker']])]),
      C(`Trade with him`, `He has a well-stocked pack.`, [O(1, 'item', `Wade trades {team} {loot} for some food.`, [['loot']])]),
    ],
  }),

  // ---------------- HOLIDAY CABINS ----------------
  E('cabins_search', {
    cat: 'exploration', loc: 'cabins', title: `Cabin Number Four`,
    text: [`A row of holiday cabins, each with a welcome mat and a cheerful painted name. "Bear Necessities." "Pine Dining." "Log Cabin Fever." The door of the fourth cabin is ajar. A television is still flickering inside.`],
    scene: { z: 1 }, cast: ['a', 'b?'], say: [['b', `"Log Cabin Fever. Whoever named these deserves what is happening."`, 'Sarcastic'], ['a', `"Check each one. Quickly."`]],
    choices: [
      search(`Search every cabin`, `Thorough, slow and risky.`, { item: 0.75, hurt: 0.05, danger: 0.2, time: -1 }),
      search(`Search just the first cabin`, `Quick look, then go.`, { item: 0.45, hurt: 0, danger: 0.08 }),
      safe(`Walk past without stopping`, `Not worth it.`),
      C(`Look through the windows first`, `See what is inside before going in.`, [O(0.7, 'good', `Cabin four is empty. Cabin two has a first aid box on the wall. {Team} takes it.`, [['item', 'first_aid']]), O(0.3, 'danger', `A face appears at the window, inches from {r}'s nose.`, [['em', 'r']])]),
      C(`Turn off the TV`, `The noise is drawing them in.`, [O(0.6, 'good', `The TV goes dark. The forest falls silent again. A car key sits on the table.`, [['item', 'fuel']]), O(0.4, 'danger', `The owner is watching the TV. Turning it off makes him very upset. He goes for {r}.`, [['em', 'r'], ['funny']])]),
    ],
  }),
  E('cabins_hazel', {
    npc: ['hazel'],
    cat: 'rescue', loc: 'cabins', title: `Hazel`,
    text: [`An old woman sits on the porch of the last cabin, knitting. A shotgun leans against her chair. "Hazel," she says. "Lived here forty years. Seen bears, fires and floods. This is new." She does not stop knitting.`],
    cast: ['a', 'b?:Kind'], say: [['b', `"Come with us, Hazel. It is not safe."`, 'Kind'], ['a', `"Do you know the way to the ranger station?"`]],
    choices: [
      C(`Ask Hazel for help`, `She knows these woods.`, [O(1, 'good', `"Ranger station is east past the ridge. Beacon needs power. Dale kept a spare fuse in the old bunker. Go on." She hands over a jar of herbal salve.`, [['flag', 'knows_bunker'], ['flag', 'knows_power'], ['heal', 'injured', 1]])]),
      C(`Invite Hazel to come along`, `There is safety in numbers.`, [O(0.4, 'good', `"Oh, go on then." Hazel packs her shotgun and knitting. She is faster than anyone expected.`, [['npc', 'hazel']]), O(0.6, 'neutral', `"I'll stay," says Hazel. "Someone needs to look after the cabins." She gives everyone a hug.`)]),
      C(`Ask Hazel to patch up the wounded`, `She has survived forty years out here.`, [O(1, 'good', `Hazel cleans and stitches every scratch with frightening speed.`, [['heal', 'all', 1], ['time', -1]])]),
      safe(`Wave and move on`, `She seems fine.`, { t: `"Mind the bears!" Hazel calls after them.` }),
      C(`Trade with Hazel`, `She has supplies.`, [O(1, 'item', `Hazel trades {loot} for news from the campsite.`, [['loot']])]),
    ],
  }),

  // ---------------- BLACKWATER RIVER ----------------
  E('river_cross', {
    cat: 'hazard', loc: 'river', title: `The Crossing`,
    text: [`Blackwater River runs fast and brown after last night's rain. The bridge has been washed away. Stepping stones poke out of the water, slick with algae. On the far bank, the trail continues.`],
    cast: ['a', 'b?:Brave'], say: [['b', `"I will go first and test the stones."`, 'Brave'], ['a', `"One slip and that current takes you."`]],
    choices: [
      rush(`Hop across the stepping stones`, `Quick feet, good balance.`, { hurt: 0.25, danger: 0, time: 1, t: { hurt: `{r} slips and is dragged ten metres before scrambling out, battered.` } }),
      C(`Wade across holding hands`, `Slower but steadier.`, [O(0.8, 'neutral', `A cold, wet chain of people. Everyone reaches the other side.`), O(0.2, 'hurt', `The current pulls {r} under for a terrifying second.`, [['hurt', 'r', 1]])]),
      C(`Rig a rope line`, `Tie it off and cross safely.`, [O(1, 'good', `The rope holds firm. Everyone crosses without a slip.`, [['time', 1]])], { req: { items: ['rope'] } }),
      safe(`Walk upstream to find a better crossing`, `It costs time.`, { time: -2, t: `An hour upstream, a fallen tree makes a perfect bridge.` }),
      C(`Build a raft from driftwood`, `Float down and across.`, [O(0.4, 'good', `The raft holds just long enough. Wet, but across and further downstream.`, [['time', 1], ['funny']]), O(0.6, 'hurt', `The raft falls apart in the middle of the river. {r} gets the worst of it.`, [['hurt', 'r', 1], ['funny']])]),
      C(`Look for a fallen tree to cross on`, `Search the bank for a natural bridge.`, [O(0.5, 'good', `A mossy trunk spans the river just upstream. Slippery, but solid.`), O(0.5, 'neutral', `No tree. Back to the stepping stones, half an hour later.`, [['time', -1]])]),
    ],
  }),
  E('river_fisher', {
    cat: 'zombie', loc: 'river', title: `Gone Fishing`,
    text: [`A fisherman stands waist-deep in the river, motionless, his rod floating beside him. He is facing upstream. Slowly, very slowly, he begins to turn round.`],
    scene: { z: 1 }, cast: ['a', 'b?'], say: [['b', `"Is he... fishing? Still?"`, 'Funny'], ['a', `"Back away from the water."`]],
    choices: [
      safe(`Back away quietly`, `He is in the river. Let him stay there.`, { time: -1 }),
      C(`Throw a rock to send him downstream`, `Knock him off balance.`, [O(0.6, 'good', `The current takes him. He floats away downstream, still turning.`, [['funny']]), O(0.4, 'danger', `He staggers out of the river, straight at {r}.`, [['em', 'r']])]),
      C(`Grab his tackle box from the bank`, `Fishing kits have knives, line and hooks.`, [O(0.6, 'item', `{a} snatches the tackle box. Inside: {loot}.`, [['loot']]), O(0.4, 'danger', `He lunges out of the water as {a} reaches for it. Straight at {r}.`, [['em', 'r']])]),
      rush(`Run past along the bank`, `He is slow in the water.`, { hurt: 0.1, danger: 0.12 }),
      C(`Wait for him to drift away`, `Patience.`, [O(0.7, 'neutral', `He bobs downstream eventually. Fishing is a slow sport.`, [['time', -1]]), O(0.3, 'danger', `He does not drift. He wades out, toward {r}.`, [['em', 'r']])]),
    ],
  }),

  // ---------------- EAGLE RIDGE ----------------
  E('ridge_view', {
    cat: 'exploration', loc: 'ridge', title: `On the Ridge`,
    text: [`From the top of Eagle Ridge, the whole forest spreads out below. Smoke rises in several places. Far to the east, a red light blinks on a radio mast: the Emergency Ranger Station. Between here and there, the trees are moving with figures.`],
    scene: { light: 'dusk' }, cast: ['a', 'b?'], say: [['a', `"There it is. The station."`], ['b', `"That is a LOT of trees. And a lot of them."`, 'Nervous']],
    choices: [
      C(`Plan the route from up here`, `Memorise the safest path.`, [O(1, 'good', `{Team} traces a clear path east, avoiding the worst of the crowds.`, [['time', 1], ['flag', 'scouted']])]),
      C(`Fire a flare to signal for help`, `Someone might see it.`, [O(0.5, 'good', `The flare arcs over the forest. Far away, a helicopter turns toward it, then away. But someone saw.`, [['use', 'flare_gun'], ['flag', 'heli_seen']]), O(0.5, 'danger', `The flare is seen by everything in the valley. Things climb toward {r}.`, [['use', 'flare_gun'], ['em', 'r']])], { req: { items: ['flare_gun'] } }),
      search(`Search the old weather station`, `A rusted hut sits on the summit.`, { item: 0.6, hurt: 0.1 }),
      safe(`Rest at the top`, `Nothing can sneak up on you here.`, { time: -1, fx: [['heal', 'injured', 1]], t: `A rare safe moment. Everyone sits and breathes.` }),
      rush(`Slide down the scree on the far side`, `The fastest way down.`, { hurt: 0.28, danger: 0, time: 2, t: { hurt: `The scree slides out from under {r}. A long, bruising tumble.`, ok: `A thrilling slide down the scree, landing in a heap at the bottom. Huge time saved.` } }),
      C(`Use the radio from up here`, `High ground means better signal.`, [O(0.7, 'good', `"Ranger station's beacon still works. Get it powered and they will come." A park voice, faint but real.`, [['flag', 'knows_power']]), O(0.3, 'neutral', `Static, but less static than usual.`)], { req: { items: ['radio'] } }),
      C(`Shout for help from the summit`, `Your voices will carry for miles up here.`, [O(0.3, 'good', `A faint voice answers from the east: "Station's still standing! Hurry!"`, [['flag', 'knows_power']]), O(0.7, 'danger', `Something answers, much closer. It climbs toward {r}.`, [['em', 'r']])]),
    ],
  }),
  E('ridge_eagle', {
    cat: 'humour', loc: 'ridge', title: `The Eagle`,
    text: [`A huge golden eagle lands on a rock right next to {a}, folds its wings, and stares. It seems to have decided {a} is its friend now.`],
    cast: ['a', 'b?'], say: [['a', `"Do not move. Do not move. Is it going to eat me?"`], ['b', `"It has chosen you. You are the eagle's person now."`, 'Funny']],
    choices: [
      C(`Stay very still`, `Let it decide.`, [O(1, 'funny', `After a long minute, the eagle nods (it definitely nodded) and flies off. {a} has never felt so honoured.`, [['funny']])]),
      C(`Offer it some food`, `Make a friend.`, [O(1, 'funny', `The eagle takes the food, then drops a dead rabbit at {a}'s feet. A gift. Nobody knows what to do with it.`, [['use', 'tag', 'food'], ['funny']])], { req: { tags: ['food'] } }),
      safe(`Slowly back away`, `Eagles have very big claws.`),
      C(`Follow where it flies`, `Birds know the land.`, [O(0.6, 'good', `It flies east, low over a hidden path. {Team} follows it down the ridge.`, [['time', 1]]), O(0.4, 'neutral', `It flies over a cliff. That is not a path for people.`)]),
      C(`Try to stroke it`, `Bad idea. Probably.`, [O(0.4, 'funny', `The eagle allows exactly one stroke. Then it leaves forever.`, [['funny']]), O(0.6, 'hurt', `The eagle does not allow it. {a} has a new scar to show people.`, [['hurt', 'a', 1], ['funny']])]),
      C(`Name the eagle`, `It deserves a name.`, [O(1, 'funny', `{a} names it Sir Talon. Sir Talon does not acknowledge this, and flies away.`, [['funny']])]),
    ],
  }),

  // ---------------- DEADWOOD MARSH ----------------
  E('swamp_fog', {
    cat: 'hazard', loc: 'swamp', title: `The Fog`,
    text: [`Fog rolls across Deadwood Marsh until {team} can barely see their own hands. The water is knee-deep and freezing. Somewhere out in the white, something is splashing. Coming closer. Then stopping.`],
    scene: { light: 'fog', z: 1 }, cast: ['a', 'b?'], say: [['a', `"Stay close. Hold onto each other."`], ['b', `"I cannot see my feet. I do not want to see my feet."`, 'Nervous']],
    choices: [
      C(`Keep walking in a line`, `Hold onto the person in front.`, [O(0.65, 'neutral', `Step by step through the fog. The splashing fades behind.`), O(0.35, 'danger', `A shape looms out of the fog, right beside {r}!`, [['em', 'r']])]),
      safe(`Stand completely still`, `Let it pass.`, { time: -1, t: `Ten minutes of silence. The splashing moves away.` }),
      C(`Use the compass`, `Walk a straight line out.`, [O(1, 'good', `Due east, straight as an arrow, out of the marsh.`, [['time', 1]])], { req: { tags: ['map'] } }),
      C(`Climb onto a fallen log and wait`, `Get out of the water.`, [O(0.7, 'neutral', `The fog lifts after a while. The way is clear.`, [['time', -1]]), O(0.3, 'hurt', `The log rolls. {r} goes into the freezing water.`, [['hurt', 'r', 1]])]),
      rush(`Run for it`, `Splash as fast as you can.`, { hurt: 0.15, danger: 0.15, time: 1 }),
      C(`Follow the sound of running water`, `A stream will lead out of the marsh.`, [O(0.6, 'good', `The trickle leads to firmer ground and out of the fog.`), O(0.4, 'hurt', `The trickle leads into deeper water. {r} goes under and comes up gasping.`, [['hurt', 'r', 1]])]),
    ],
  }),
  E('swamp_quicksand', {
    cat: 'hazard', loc: 'swamp', title: `Sinking`,
    text: [`{a} steps forward and sinks. Up to the knee. Then the thigh. The mud is pulling down, and the more {a} struggles, the faster it pulls.`],
    cast: ['a', 'b?'], say: [['a', `"Help! It is pulling me down!"`], ['b', `"Do not struggle! Lie back! Spread out!"`, 'Intelligent']],
    choices: [
      C(`Pull {a} out together`, `Everyone grab an arm.`, [O(0.7, 'good', `With a horrible sucking sound, {a} pops out of the mud, minus both boots.`, [['funny']]), O(0.3, 'hurt', `They pull too hard. {a}'s shoulder pops out.`, [['hurt', 'a', 1]])]),
      C(`Tell {a} to lie back and float`, `Spread the weight.`, [O(0.8, 'good', `{a} lies back like a starfish and slowly floats free.`, [['funny']]), O(0.2, 'hurt', `{a} panics and swallows a mouthful of mud before getting out.`, [['hurt', 'a', 1]])]),
      C(`Throw the rope`, `Haul {a} out properly.`, [O(1, 'good', `The rope makes it easy. {a} slides out like a seal.`)], { req: { items: ['rope'] } }),
      C(`Lay branches across the mud`, `Make a platform.`, [O(0.75, 'good', `A mat of branches gives {a} something to climb onto.`, [['time', -1]]), O(0.25, 'danger', `While everyone gathers branches, something rises out of the mud near {r}.`, [['em', 'r']])]),
      C(`Hold out a long stick`, `The classic method.`, [O(0.6, 'good', `{a} grabs the stick and is dragged free. Classic.`), O(0.4, 'hurt', `The stick snaps. {a} sinks deeper and is pulled out exhausted.`, [['hurt', 'a', 1]])]),
      C(`Tell {a} to wriggle out slowly`, `Small movements, one leg at a time.`, [O(0.65, 'good', `Inch by inch, {a} works free. Exhausted, filthy, and free.`, [['time', -1]]), O(0.35, 'hurt', `{a} strains a muscle wriggling free.`, [['hurt', 'a', 1]])]),
    ],
  }),

  // ---------------- HOLLOW CAVES ----------------
  E('cave_dark', {
    cat: 'hazard', loc: 'cave', title: `Into the Dark`,
    text: [`The Hollow Caves swallow the daylight within ten steps. Water drips. The air is cold and smells of earth. Somewhere deep below, there is a faint, rhythmic scraping.`],
    scene: { light: 'dark', z: 1 }, cast: ['a', 'b?'], say: [['a', `"Torch on. Stay together."`], ['b', `"I would like to formally say that I hate this."`, 'Sarcastic']],
    choices: [
      C(`Light the way with the head torch`, `See where you are going.`, [O(0.75, 'good', `The beam reveals a clear passage, and painted arrows from old cavers pointing east.`, [['use', 'flashlight'], ['time', 1]]), O(0.25, 'danger', `The beam catches movement. Something charges toward {r}.`, [['use', 'flashlight'], ['em', 'r']])], { req: { items: ['flashlight'] } }),
      C(`Feel your way along the wall`, `Slow and blind.`, [O(0.55, 'neutral', `Inch by inch through the dark. Eventually, daylight ahead.`, [['time', -1]]), O(0.25, 'hurt', `{r} walks straight into a stalactite.`, [['hurt', 'r', 1], ['funny']]), O(0.2, 'danger', `A cold hand touches {r}'s in the dark. Not a friendly one.`, [['em', 'r']])]),
      C(`Follow the airflow`, `Feel the breeze. It leads outside.`, [O(0.7, 'good', `The breeze leads to a narrow exit on the far side of the hill.`, [['time', 1]]), O(0.3, 'hurt', `The breeze comes from a crack too small to fit through. {r} gets stuck for a while trying.`, [['hurt', 'r', 1], ['funny']])]),
      safe(`Turn back and go over the hill`, `No caves, thanks.`, { time: -2 }),
      C(`Investigate the scraping`, `Know what is down there.`, [O(0.4, 'item', `It is a trapped caver's helmet lamp, scraping on rock in the wind. Next to it: {loot}.`, [['loot']]), O(0.6, 'danger', `It is not the wind. It turns toward {r}.`, [['em', 'r']])]),
      C(`Light a torch from dry branches`, `An old-fashioned fire torch.`, [O(0.6, 'good', `The flaming branch lights the way. Shadows dance, but nothing moves.`), O(0.4, 'hurt', `The torch flares up. {r} burns a hand.`, [['hurt', 'r', 1]])]),
    ],
  }),
  E('cave_paintings', {
    cat: 'exploration', loc: 'cave', title: `The Paintings`,
    text: [`Deep in the cave, the torchlight reveals ancient paintings on the walls: hunters, deer, and figures with arms outstretched, walking in a line. Next to them, much newer, in red spray paint: "THEY CAME FROM THE BUNKER."`],
    scene: { light: 'dark' }, cast: ['a', 'b?:Intelligent'], say: [['b', `"These paintings are thousands of years old. The graffiti is not."`, 'Intelligent'], ['a', `"Bunker? What bunker?"`]],
    choices: [
      C(`Photograph and study the graffiti`, `Someone left a message on purpose.`, [O(1, 'good', `Under the words is a rough map: a bunker in the hills, near the forest road.`, [['flag', 'knows_bunker']])]),
      search(`Search the campsite someone left here`, `Sleeping bag, stove, rucksack.`, { item: 0.7, hurt: 0, danger: 0.1 }),
      safe(`Keep moving`, `No time for art.`),
      C(`Add your own message to the wall`, `Leave a sign for others.`, [O(1, 'funny', `{a} writes: "WE WERE HERE. IT WAS RUBBISH. GO EAST." Future survivors will appreciate it.`, [['funny']])]),
      C(`Listen at the deeper tunnel`, `Is anything down there?`, [O(0.5, 'neutral', `Silence. Total silence. That is almost worse.`), O(0.5, 'danger', `Footsteps. Coming up fast toward {r}.`, [['em', 'r']])]),
    ],
  }),

  // ---------------- SILVER MINE ----------------
  E('mine_cart', {
    cat: 'humour', loc: 'mine', title: `Mine Cart`,
    text: [`An old mine cart sits on rusty rails at the top of a long slope. The rails disappear into the dark, heading roughly east. {a} has the exact expression of someone about to make a terrible decision.`],
    scene: { light: 'dim' }, cast: ['a', 'b?'], say: [['a', `"It is basically a rollercoaster."`], ['b', `"It is basically a coffin with wheels."`, 'Sarcastic'], ['b', `"Mine cart level! Every good game has one!"`, 'Gamer']],
    choices: [
      C(`Everyone ride the mine cart`, `What could go wrong?`, [O(0.5, 'funny', `The ride of a lifetime. Screaming, sparks, and an exit right on the far side of the mountain. Huge shortcut.`, [['time', 2], ['shortcut', 1], ['funny']]), O(0.35, 'hurt', `The cart derails at the bottom. Everyone flies out. {r} lands worst.`, [['hurt', 'r', 1], ['time', 1], ['funny']]), O(0.15, 'danger', `The cart crashes into a group of infected miners at the bottom. One drags at {r}!`, [['em', 'r'], ['funny']])]),
      C(`Send the cart down empty as a distraction`, `Use the noise.`, [O(0.7, 'good', `The cart screeches into the dark. Every groan in the mine follows it. Path clear.`, [['time', 1]]), O(0.3, 'neutral', `The cart gets stuck halfway down. Anticlimactic.`)]),
      safe(`Walk down the rails`, `Slow and sensible.`),
      search(`Search the mine office`, `Lamps, tools, maybe fuel.`, { item: 0.65, hurt: 0.05, danger: 0.1 }),
      C(`Check the cart for supplies`, `Miners kept things in odd places.`, [O(0.5, 'item', `Under a tarp in the cart: {loot}.`, [['loot']]), O(0.5, 'neutral', `Just rocks. Very shiny rocks, though.`, [['funny']])]),
    ],
  }),
  E('mine_collapse', {
    cat: 'hazard', loc: 'mine', title: `Cave-In`,
    text: [`A deep groan runs through the mine. Dust trickles from the ceiling. The old wooden props are bowing. Then a beam cracks like a gunshot.`],
    scene: { light: 'dim' }, cast: ['a', 'b?:Engineer'], say: [['b', `"Those props will not hold. We have maybe a minute."`, 'Engineer'], ['a', `"RUN!"`]],
    choices: [
      rush(`Sprint for the exit ahead`, `Forward, fast.`, { hurt: 0.25, danger: 0, time: 1, t: { hurt: `Rocks rain down. {r} is struck by falling stone but keeps running.`, ok: `The tunnel collapses behind {team} with a roar. Everyone made it.` } }),
      C(`Run back the way you came`, `The known route.`, [O(0.7, 'neutral', `Back out into daylight as the tunnel caves in. A long detour now.`, [['time', -2]]), O(0.3, 'hurt', `A beam swings down and catches {r}.`, [['hurt', 'r', 1], ['time', -2]])]),
      C(`Shelter in a side alcove`, `Solid rock might hold.`, [O(0.6, 'neutral', `The alcove holds. Afterwards, a narrow gap leads on.`), O(0.4, 'hurt', `The alcove is not as solid as it looked. {r} is buried up to the waist and dug out.`, [['hurt', 'r', 1]])]),
      C(`Shore up the beam with a cart`, `Wedge it in place.`, [O(0.5, 'good', `The cart jams under the beam. It holds just long enough.`, [['hero']]), O(0.5, 'hurt', `{a} pushes the cart into place but is clipped by falling rock.`, [['hurt', 'a', 1], ['hero']])]),
      C(`Dive under the conveyor belt`, `The metal frame might protect you.`, [O(0.65, 'good', `The steel frame takes the impact. Everyone crawls out the other side.`), O(0.35, 'hurt', `{r} is pinned for a moment and has to be dragged free.`, [['hurt', 'r', 1]])]),
    ],
  }),

  // ---------------- OUTPOST 7 ----------------
  E('outpost_dale', {
    npc: ['dale'],
    cat: 'rescue', loc: 'outpost', title: `Ranger Dale`, major: true,
    text: [`Inside Ranger Outpost 7, a ranger is slumped against the radio desk, his leg wrapped in a blood-soaked bandage. "Dale," he gasps. "I made the broadcast. Beacon at the main station needs power. Fuse or generator fuel. My keycard opens the locker there."`],
    scene: { bg: 'outpost' }, cast: ['a', 'b?:Medic'], say: [['b', `"Let me look at that leg. It is not a bite. It is a bad cut."`, 'Medic'], ['a', `"We will get you to the station, Dale."`]],
    choices: [
      C(`Carry Dale with you`, `Leave no one behind.`, [O(0.7, 'good', `Dale leans on {a}'s shoulder. Slow going, but he knows every shortcut.`, [['npc', 'dale'], ['item', 'keycard'], ['flag', 'knows_power'], ['time', -1], ['hero']]), O(0.3, 'hurt', `Carrying Dale is brutal work. {a} strains their back, but Dale is coming.`, [['npc', 'dale'], ['item', 'keycard'], ['flag', 'knows_power'], ['hurt', 'a', 1]])], { major: true }),
      C(`Take his keycard and promise to send help`, `He is too slow to carry.`, [O(1, 'neutral', `Dale presses the card into {a}'s hand. "Beacon. Power. Go." He does not ask them to stay.`, [['item', 'keycard'], ['flag', 'knows_power'], ['flag', 'left_dale']])]),
      C(`Treat his wound properly`, `Use your supplies on him.`, [O(1, 'good', `Dale's leg is cleaned and bound. He can walk. "Thank you. Take this. And this." Keycard and flare gun.`, [['use', 'tag', 'medical'], ['npc', 'dale'], ['item', 'keycard'], ['item', 'flare_gun'], ['flag', 'knows_power']])], { req: { tags: ['medical'] } }),
      C(`Use his radio`, `Call for help directly.`, [O(0.5, 'good', `Dale talks you through it. "Station control, this is 7." Nobody answers, but the battery for the beacon is confirmed dead. Power is needed.`, [['flag', 'knows_power'], ['item', 'keycard']]), O(0.5, 'neutral', `The radio is smashed. Dale shakes his head and gives you his keycard.`, [['item', 'keycard']])]),
      search(`Raid the outpost supplies`, `Rangers keep good kit.`, { item: 0.8, hurt: 0, danger: 0.08 }),
      safe(`Leave him`, `You cannot afford to slow down.`, { t: `Dale watches them go. He does not say anything. He does not need to.`, fx: [['flag', 'left_dale']] }),
    ],
  }),
  E('outpost_siege', {
    cat: 'zombie', loc: 'outpost', title: `Under Siege`,
    text: [`The outpost windows are boarded up, but hands are already reaching through the gaps. More shapes are coming out of the trees. The radio mast creaks. There is a back door, a ladder to the roof, and a storeroom with a padlock.`],
    scene: { z: 4 }, cast: ['a', 'b?'], say: [['a', `"We cannot hold this place."`], ['b', `"Then we do not hold it. We leave."`, 'Practical']],
    choices: [
      rush(`Out the back door, now`, `Run before they surround the place.`, { hurt: 0.15, danger: 0.15, time: 1 }),
      C(`Climb to the roof and wait`, `They cannot climb ladders.`, [O(0.6, 'neutral', `From the roof, {team} watches them circle and then lose interest.`, [['time', -2]]), O(0.4, 'hurt', `The roof is rotten. {r} puts a foot through it.`, [['hurt', 'r', 1], ['time', -1]])]),
      C(`Break the storeroom padlock`, `There might be supplies inside.`, [O(0.6, 'item', `The lock pops. Inside: {loot}.`, [['loot']]), O(0.4, 'danger', `The noise draws them to the storeroom window. One reaches through for {r}.`, [['em', 'r']])]),
      C(`Hold the windows`, `Push them back from inside.`, [O(0.5, 'good', `Shoulder to shoulder, {team} holds the boards until the crowd thins.`, [['hero'], ['time', -1]]), O(0.5, 'hurt', `A board breaks. {r} is clawed before it is pushed back.`, [['hurt', 'r', 1]])]),
      C(`Turn on the outpost siren`, `Send them running? Or drawing more in?`, [O(0.4, 'funny', `The siren is so loud the infected actually stagger away from it. {Team} sneaks out.`, [['funny']]), O(0.6, 'danger', `The siren calls every infected for miles. One gets through to {r}.`, [['em', 'r']])]),
    ],
  }),

  // ---------------- GORGE ----------------
  E('gorge_bridge', {
    cat: 'hazard', loc: 'gorge', title: `The Rope Bridge`,
    text: [`A rope bridge spans Hangman's Gorge, swaying in the wind. Half the planks are rotten. Far below, a river roars over rocks. Behind {team}, the trees rustle with approaching footsteps.`],
    scene: { z: 2 }, cast: ['a', 'b?:Nervous'], say: [['b', `"Nope. No. Absolutely not. ...Okay. Okay. Fine."`, 'Nervous'], ['a', `"One at a time. Do not look down."`]],
    choices: [
      C(`Cross one at a time`, `Spread the weight.`, [O(0.65, 'good', `One by one, step by careful step. Everyone makes it.`), O(0.35, 'hurt', `A plank snaps under {r}, who catches the ropes and hauls up, bruised.`, [['hurt', 'r', 1]])]),
      rush(`Everyone run across together`, `No time. Go!`, { hurt: 0.3, danger: 0, time: 1, t: { hurt: `The bridge bucks under everyone's weight. {r} slams into the ropes.` } }),
      C(`Cut the bridge after crossing`, `Nothing follows you over.`, [O(0.7, 'good', `Across, then the hatchet. The bridge falls into the gorge. The pursuers are stranded.`, [['use', 'tag', 'tool'], ['flag', 'cut_bridge'], ['time', 1]]), O(0.3, 'hurt', `Cutting the bridge, {r} nearly goes with it.`, [['use', 'tag', 'tool'], ['hurt', 'r', 1], ['flag', 'cut_bridge']])], { req: { tags: ['tool'] } }),
      safe(`Find another way down`, `Climb down into the gorge and up the far side.`, { time: -3, t: `An exhausting climb down and back up, but solid rock is solid rock.` }),
      C(`Tie a safety line first`, `Rope from one side to the other.`, [O(1, 'good', `A safety line makes all the difference. Everyone crosses clipped on.`, [['time', -1]])], { req: { items: ['rope'] } }),
      C(`Hold them off while the others cross`, `One stays back to guard.`, [O(0.6, 'good', `{a} guards the bridgehead, then crosses last as the first figures emerge from the trees.`, [['hero']]), O(0.4, 'danger', `They arrive faster than expected. One grabs {a}!`, [['em', 'a']])], { req: { minAlive: 2 } }),
      C(`Test each plank before stepping`, `Slow and careful.`, [O(0.8, 'good', `Plank by plank, testing each one. Slow, but nobody falls.`, [['time', -1]]), O(0.2, 'danger', `It takes so long the pursuers catch up. One grabs at {r} on the last plank!`, [['em', 'r']])]),
      C(`Crawl across on hands and knees`, `Low centre of gravity.`, [O(0.75, 'funny', `It is undignified, but everyone makes it. {a} narrates the crawl like a wildlife documentary.`, [['funny']]), O(0.25, 'hurt', `A splinter the size of a pencil goes into {r}'s palm.`, [['hurt', 'r', 1]])]),
    ],
  }),
  E('gorge_ledge', {
    cat: 'exploration', loc: 'gorge', title: `The Ledge`,
    text: [`On a ledge just below the cliff edge is a climber's bag, still clipped to an anchor. The climber is nowhere to be seen. The ledge is two metres down. The drop beyond it is two hundred.`],
    cast: ['a', 'b?:Brave'], say: [['b', `"I can reach it. Hold my legs."`, 'Brave'], ['a', `"That is a long way down."`]],
    choices: [
      C(`Lower someone down to get it`, `Hold on tight.`, [O(0.6, 'item', `{a} dangles over the drop and grabs the bag: {loot}.`, [['loot'], ['hero']]), O(0.4, 'hurt', `The ledge crumbles. {a} is hauled back up, scraped raw.`, [['hurt', 'a', 1]])]),
      C(`Use the rope to reach it safely`, `Climb down properly.`, [O(1, 'item', `Clipped into the anchor, it is easy. The bag holds {loot}.`, [['loot']])], { req: { items: ['rope'] } }),
      safe(`Leave it`, `Not worth anybody's life.`),
      C(`Hook it with a long branch`, `Fish for it from up top.`, [O(0.5, 'item', `After ten minutes of fishing, the bag comes up: {loot}.`, [['loot'], ['time', -1]]), O(0.5, 'neutral', `The bag tumbles into the gorge. Gone.`, [['time', -1]])]),
      C(`Look for the climber`, `They might be hurt nearby.`, [O(0.5, 'neutral', `No sign of them. Just a note in the bag: "Gone for help. Back soon." From three days ago.`), O(0.5, 'danger', `The climber is nearby. Behind {r}. Not alive.`, [['em', 'r']])]),
      C(`Throw a stone to test the ledge`, `See if it is solid before anyone goes down.`, [O(1, 'neutral', `The stone hits the ledge and a chunk falls away into the gorge. Good thing nobody stood on it.`)]),
    ],
  }),

  // ---------------- FOREST ROAD ----------------
  E('road_truck', {
    cat: 'exploration', loc: 'road', title: `The Logging Truck`,
    text: [`A logging truck lies across the forest road, its load of trunks spilled like matchsticks. The cab door is open. A jerrycan is strapped to the side. Nearby, a family car sits with its boot open.`],
    scene: { z: 1 }, cast: ['a', 'b?:Engineer'], say: [['b', `"That jerrycan. That could power a generator."`, 'Engineer'], ['a', `"Careful. These logs could still roll."`]],
    choices: [
      C(`Take the jerrycan`, `Fuel could power the beacon generator.`, [O(0.75, 'item', `{a} unstraps the jerrycan: {loot}. It is heavy, but it might save everyone.`, [['item', 'fuel']]), O(0.25, 'hurt', `A log shifts as {a} reaches for it. {r} is caught by a rolling trunk, but the fuel is safe.`, [['item', 'fuel'], ['hurt', 'r', 1]])]),
      search(`Search the family car`, `Holiday luggage, first aid, snacks.`, { item: 0.6, hurt: 0, danger: 0.1 }),
      C(`Check the truck cab`, `Drivers keep radios and kit.`, [O(0.5, 'item', `The driver's CB radio and a first aid kit: {loot}.`, [['item', 'radio']]), O(0.5, 'danger', `The driver is still at the wheel. He lunges across the seat at {r}.`, [['em', 'r']])]),
      safe(`Climb over the logs and keep walking`, `No time to scavenge.`),
      C(`Try to start the car`, `Drive the rest of the way?`, [O(0.3, 'good', `It starts! A mile of bumpy forest road before it runs out of petrol.`, [['time', 2]]), O(0.7, 'neutral', `Flat battery.`, [['time', -1]])]),
    ],
  }),
  E('road_roadblock', {
    npc: ['camper', 'camper'],
    cat: 'moral', loc: 'road', title: `The Roadblock`,
    text: [`A group of campers has built a roadblock from cars across the forest road. They are armed with fishing knives and fear. "Nobody passes!" shouts their leader. "Could be infected. Turn around."`],
    cast: ['a', 'b?'], say: [['a', `"We are not infected. We are heading for the ranger station."`], ['b', `"They are scared. Talk to them gently."`, 'Kind']],
    choices: [
      C(`Show them you are not bitten`, `Roll up your sleeves.`, [O(0.7, 'good', `After a careful check, they let {team} through and share {loot}.`, [['loot']]), O(0.3, 'neutral', `They are too scared to believe anything. You have to go round.`, [['time', -2]])]),
      C(`Hide anyone who is injured`, `They will panic if they see wounds.`, [O(0.6, 'good', `Jackets over the cuts, smiles on faces. They let you through.`), O(0.4, 'hurt', `They spot a bandage. A thrown rock catches {r} as {team} retreats.`, [['hurt', 'r', 1], ['time', -2]])]),
      safe(`Go round through the trees`, `Avoid confrontation.`, { time: -2 }),
      C(`Warn them about the beacon`, `They could come with you.`, [O(0.5, 'good', `They listen. They will follow later. They give {team} {loot} as thanks.`, [['loot']]), O(0.5, 'neutral', `"Beacon? Never heard of it." They do not move.`)]),
      C(`Bluff: "We are the rescue team!"`, `Confidence is everything.`, [O(0.5, 'funny', `{a} announces themselves as Search and Rescue with total confidence. It works. Nobody knows how.`, [['funny'], ['time', 1]]), O(0.5, 'bad', `"Where are your uniforms, then?" Busted. Long way round.`, [['time', -2], ['funny']])]),
    ],
  }),

  // ---------------- BUNKER ----------------
  E('bunker_door', {
    cat: 'exploration', loc: 'bunker', title: `The Bunker Door`,
    text: [`Half-buried in the hillside is a steel door with faded stencilling: PROJECT DEADWOOD — AUTHORISED PERSONNEL ONLY. A keypad glows faintly. The door is not quite closed.`],
    cast: ['a', 'b?:Intelligent'], say: [['b', `"Project Deadwood. That is not a coincidence."`, 'Intelligent'], ['a', `"The door is open. Someone left in a hurry."`]],
    choices: [
      C(`Go inside and explore`, `Whatever is in there, you need to know.`, [O(0.6, 'good', `The corridor beyond is lit by emergency lights. Down the stairs is a lab.`, [['next', 'dwf_bunker_lab']]), O(0.4, 'danger', `A figure in a hazmat suit staggers out of the darkness toward {r}.`, [['em', 'r']])]),
      search(`Search the guard hut outside`, `A small hut by the door.`, { item: 0.65, hurt: 0, danger: 0.08 }),
      safe(`Leave it closed`, `Some doors should stay shut.`),
      C(`Use the ranger keycard`, `Parks Service cards might work here.`, [O(1, 'good', `Beep. The door slides fully open, and the lights come on. Straight down to the lab.`, [['next', 'dwf_bunker_lab']])], { req: { items: ['keycard'] } }),
      C(`Shout into the bunker`, `Is anyone alive in there?`, [O(0.3, 'good', `A voice answers: "Get away from here!" A scientist throws out a pack with {loot} and slams the door.`, [['loot']]), O(0.7, 'danger', `Something answers. It comes up the stairs fast, toward {r}.`, [['em', 'r']])]),
      C(`Look for an air vent to peek through`, `See what is inside first.`, [O(0.6, 'good', `Through the vent: an empty corridor and a lab beyond. {Team} slips inside.`, [['next', 'dwf_bunker_lab']]), O(0.4, 'neutral', `Through the vent: total darkness and a smell that makes everyone step back.`)]),
    ],
  }),
  E('bunker_lab', {
    cat: 'chain', loc: 'bunker', title: `Project Deadwood`, major: true,
    text: [`The lab is wrecked. Broken glass, overturned cages, a whiteboard covered in formulas. On a desk: a folder stamped CLASSIFIED, a crate of military autoinjectors, and a spare beacon fuse in a labelled box. The emergency lights flicker.`],
    scene: { bg: 'lab', light: 'dim' }, cast: ['a', 'b?:Intelligent'], say: [['b', `"This is it. This is where it started."`, 'Intelligent'], ['a', `"Grab what we need. Fast."`]],
    choices: [
      C(`Take the beacon fuse`, `This is what powers the beacon.`, [O(1, 'item', `The fuse is heavy and solid. With this, the beacon can work.`, [['item', 'fuse']])]),
      C(`Take an autoinjector`, `"Post-exposure." It might stop an infection.`, [O(1, 'item', `One autoinjector, carefully wrapped: {loot}.`, [['item', 'antidote']])]),
      C(`Take the classified files`, `The world needs to know what happened here.`, [O(1, 'item', `{a} stuffs the folder into the backpack. It explains everything.`, [['item', 'files'], ['flag', 'has_files']])]),
      C(`Grab everything and run`, `Greedy and risky.`, [O(0.55, 'item', `Fuse, injector, files. Everything. And out before anything stirs.`, [['item', 'fuse'], ['item', 'antidote'], ['item', 'files'], ['flag', 'has_files']]), O(0.45, 'danger', `The cages were not all empty. Something lunges for {r} as {team} grabs the last box.`, [['item', 'fuse'], ['item', 'antidote'], ['item', 'files'], ['flag', 'has_files'], ['em', 'r']])]),
      C(`Seal the door and stay here for good`, `Forget the beacon. This place has air, water and a steel door.`, [O(1, 'good', `{Team} decides. No more running. The steel door swings shut and the bolts slide home, one by one.`, [['flag', 'bunker_haven'], ['end']])], { major: true }),
    ],
  }),

  // ---------------- LOOKOUT ----------------
  E('lookout_climb', {
    cat: 'exploration', loc: 'lookout', title: `The Fire Lookout`,
    text: [`The fire lookout tower rises thirty metres above the trees. At the top, a little cabin with windows on every side. From up there, you could see the whole valley, and the ranger station.`],
    cast: ['a', 'b?'], say: [['a', `"That is a lot of ladder."`], ['b', `"If I fall, tell my cat I loved her."`, 'Funny']],
    choices: [
      C(`Climb to the top`, `See everything.`, [O(0.7, 'good', `At the top: the ranger station, clear as day. And a supply box: {loot}.`, [['loot'], ['flag', 'scouted'], ['time', -1]]), O(0.3, 'hurt', `A rung breaks. {r} drops two metres before catching the rail.`, [['hurt', 'r', 1], ['time', -1]])]),
      C(`Signal from the tower with the flare gun`, `The highest point in the forest.`, [O(0.8, 'good', `The flare bursts high over the trees. A distant helicopter rocks its wings in reply. Someone knows you are coming.`, [['use', 'flare_gun'], ['flag', 'heli_seen']]), O(0.2, 'danger', `The flare is seen. By rescue, maybe. By the infected, definitely. They swarm the tower's base, and one reaches {r}.`, [['use', 'flare_gun'], ['flag', 'heli_seen'], ['em', 'r']])], { req: { items: ['flare_gun'] } }),
      safe(`Skip the tower`, `Time matters more than views.`, { time: 1, fx: [], t: `{Team} presses on through the trees.` }),
      search(`Search the base of the tower`, `Rangers keep a storage box at the bottom.`, { item: 0.55, hurt: 0, danger: 0.1 }),
      C(`Use the tower's fire radio`, `There might still be power.`, [O(0.5, 'good', `"Station beacon needs power. Repeat. Fuse or fuel." Somebody is still out there.`, [['flag', 'knows_power'], ['flag', 'heli_seen']]), O(0.5, 'neutral', `Dead. The radio is just a plastic box now.`)]),
      C(`Send one person up while the others guard`, `Faster, safer.`, [O(0.7, 'good', `{a} climbs up, spots the station and a clear path, and comes back down.`, [['flag', 'scouted'], ['time', 1]]), O(0.3, 'danger', `While {a} is up the tower, something comes out of the trees for {r}.`, [['em', 'r']])]),
    ],
  }),

  // ---------------- MEADOW ----------------
  E('meadow_open', {
    cat: 'zombie', loc: 'meadow', title: `Open Ground`,
    text: [`The wildflower meadow stretches half a mile in every direction, golden and beautiful. Dotted across it, standing perfectly still among the flowers, are dozens of infected. Like scarecrows. Waiting.`],
    scene: { z: 5, light: 'dusk' }, cast: ['a', 'b?'], say: [['a', `"They are not moving. Why are they not moving?"`], ['b', `"Sleeping? Do zombies sleep? I hope they sleep."`, 'Nervous']],
    choices: [
      C(`Crawl through the long grass`, `Low and slow.`, [O(0.7, 'neutral', `A long crawl on bellies through the flowers. None of them move.`, [['time', -1]]), O(0.3, 'danger', `{r} sneezes. Every head turns. One comes for {r}.`, [['em', 'r'], ['funny']])]),
      rush(`Sprint straight across`, `Before they wake up.`, { hurt: 0.15, danger: 0.25, time: 1 }),
      safe(`Go round through the trees`, `Avoid the meadow entirely.`, { time: -2 }),
      C(`Create a distraction at the far end`, `Lure them away first.`, [O(0.75, 'good', `A thrown rock, a clatter, and every head turns away. {Team} slips past.`), O(0.25, 'danger', `They turn toward the noise, and then back, at {r}.`, [['em', 'r']])]),
      C(`Pick some berries from the hedgerow on the way`, `Food is food.`, [O(0.6, 'item', `A handful of blackberries: {loot}.`, [['item', 'berries']]), O(0.4, 'danger', `The hedgerow rustles. One of them was in it. It grabs at {r}.`, [['em', 'r']])]),
    ],
  }),

  // ---------------- LUMBER CAMP ----------------
  E('lumber_saw', {
    cat: 'exploration', loc: 'lumber', title: `The Sawmill`,
    text: [`The lumber camp is silent. A huge circular saw sits still in the sawmill. The generator shed next to it smells of petrol. In the bunkhouse, a radio is playing country music to nobody.`],
    cast: ['a', 'b?:Engineer'], say: [['b', `"That generator. If there is fuel in that shed..."`, 'Engineer'], ['a', `"Look for anything that runs on petrol."`]],
    choices: [
      search(`Search the generator shed`, `Fuel, tools, spare parts.`, { item: 0.7, hurt: 0.08, danger: 0.08, t: { item: `On the shelf: {loot}.` } }),
      search(`Search the bunkhouse`, `Beds, lockers, the radio.`, { item: 0.6, hurt: 0, danger: 0.12 }),
      safe(`Keep moving`, `Lumber camps are full of sharp things.`),
      C(`Turn the radio off`, `It is attracting attention.`, [O(0.6, 'good', `Silence. Then the soft sound of {team} sneaking away.`), O(0.4, 'danger', `Somebody was dancing to it. They are not happy it stopped. They go for {r}.`, [['em', 'r'], ['funny']])]),
      C(`Start the big saw as a distraction`, `The noise will draw them all here while you leave.`, [O(0.7, 'good', `The saw screams into life. Every infected in the valley heads for the camp. {Team} heads the other way.`, [['time', 1]]), O(0.3, 'hurt', `The saw kicks a plank across the shed. It hits {r}.`, [['hurt', 'r', 1]])]),
    ],
  }),

  // ---------------- ANYWHERE ----------------
  E('any_bear', {
    cat: 'hazard', loc: '*', title: `The Bear`,
    text: [`A brown bear steps onto the path ahead. Not a zombie bear. A normal, living, enormous bear. It looks at {team}. It looks unimpressed. It stands up on its hind legs.`],
    cast: ['a', 'b?:Nature lover'], say: [['b', `"Stay calm. Do not run. Talk to it gently. Back away slowly."`, 'Nature lover'], ['a', `"I forgot bears existed. Why did I forget bears existed?"`]],
    choices: [
      C(`Back away slowly, talking calmly`, `The textbook way.`, [O(0.8, 'good', `The bear watches them go, then drops to all fours and wanders off.`), O(0.2, 'hurt', `The bear huffs and bluff-charges. {r} trips over backwards.`, [['hurt', 'r', 1]])]),
      C(`Make yourselves look big`, `Arms up, jackets open, shout.`, [O(0.6, 'funny', `Everyone waves their arms like a deranged choir. The bear is embarrassed for them and leaves.`, [['funny']]), O(0.4, 'hurt', `The bear is not intimidated. It swipes at {r}.`, [['hurt', 'r', 2]])]),
      C(`Use the bear spray`, `This is literally what it is for.`, [O(1, 'good', `One blast and the bear crashes off into the trees, sneezing furiously.`, [['use', 'bear_spray']])], { req: { items: ['bear_spray'] } }),
      rush(`Run!`, `Everyone run in different directions.`, { hurt: 0.3, danger: 0.05, time: 0, t: { hurt: `You cannot outrun a bear. It catches {r} with one paw before losing interest.`, ok: `Somehow, the bear does not chase. Everyone regroups, gasping.` } }),
      C(`Throw it some food`, `Bears are food-motivated.`, [O(1, 'good', `The bear sits down with the food like a picnic. {Team} tiptoes away.`, [['use', 'tag', 'food']])], { req: { tags: ['food'] } }),
      C(`Play dead`, `Lie down and stay very still.`, [O(0.6, 'funny', `The bear sniffs {a}'s hair for an uncomfortable minute and leaves.`, [['funny']]), O(0.4, 'hurt', `The bear sits on {a}. Briefly. It is enough.`, [['hurt', 'a', 1], ['funny']])]),
      C(`Lure it toward the infected`, `Let nature take its course.`, [O(0.5, 'good', `The bear finds some infected in the trees and is VERY upset about it. Problem solved, twice.`, [['hero']]), O(0.5, 'hurt', `The bear has no interest in the plan. It swats {r}.`, [['hurt', 'r', 1]])]),
    ],
  }),
  E('any_shambler', {
    cat: 'zombie', loc: '*', title: `In the Trees`,
    text: [`An infected hiker stands between two trees, swaying gently, still wearing a backpack with a water bottle in the side pocket. It has not noticed {team}.`],
    scene: { z: 1 }, cast: ['a', 'b?'], say: [['b', `"It still has its backpack. That is just sad."`, 'Kind'], ['b', `"We could take it. Easy."`, 'Reckless']],
    choices: [
      C(`Sneak around it`, `Wide circle through the trees.`, [O(0.7, 'neutral', `A wide, silent circle. It never turns.`), O(0.3, 'danger', `A twig snaps under {r}. It turns.`, [['em', 'r']])]),
      C(`Take it down and grab the backpack`, `Quick and quiet.`, [O(0.55, 'item', `Over quickly. The backpack holds {loot}.`, [['loot'], ['hero']]), O(0.3, 'hurt', `It fights hard. {r} is scratched, not bitten.`, [['hurt', 'r', 1]]), O(0.15, 'danger', `It spins round and grabs {r}!`, [['em', 'r']])]),
      C(`Distract it with a thrown pinecone`, `The classic.`, [O(0.75, 'good', `Pinecone, rustle, distraction. It shuffles off after the noise.`), O(0.25, 'danger', `The pinecone bounces off its head. It turns to {r}, offended.`, [['em', 'r'], ['funny']])]),
      safe(`Wait for it to wander off`, `Patience.`, { time: -1 }),
      C(`Take it down with the hatchet`, `One swing.`, [O(1, 'item', `Clean and quick. The backpack holds {loot}.`, [['use', 'tag', 'melee'], ['loot']])], { req: { tags: ['melee'] } }),
      C(`Go a completely different way`, `Detour through the undergrowth.`, [O(1, 'neutral', `Thorns, nettles and a very long detour.`, [['time', -2]])]),
    ],
  }),
  E('any_horde', {
    cat: 'zombie', loc: '*', stage: [8, 40], title: `The Stampede`,
    text: [`The ground trembles. Birds explode out of the treetops. Through the trunks comes a tide of infected, hundreds of them, moving through the forest like a slow wave. Straight toward {team}.`],
    scene: { z: 6, light: 'dusk' }, cast: ['a', 'b?'], say: [['a', `"Up! Get up a tree! NOW!"`], ['b', `"I cannot climb trees! I have never climbed a tree!"`, 'Nervous']],
    choices: [
      C(`Climb the nearest trees`, `Get above them.`, [O(0.65, 'neutral', `Clinging to branches, {team} watches the horde pass beneath for twenty minutes.`, [['time', -2]]), O(0.35, 'hurt', `{r} cannot climb high enough fast enough and is clawed before getting up.`, [['hurt', 'r', 1], ['time', -2]])]),
      rush(`Run ahead of them`, `Outrun the wave.`, { hurt: 0.15, danger: 0.25, time: 1 }),
      C(`Hide in a hollow under a fallen tree`, `Get under cover.`, [O(0.6, 'neutral', `Squashed in the hollow, {team} waits while feet thud past inches away.`, [['time', -2]]), O(0.4, 'danger', `One of them stumbles into the hollow. Right onto {r}.`, [['em', 'r']])]),
      C(`Lead them off with noise`, `Whistle, flare, anything loud.`, [O(0.85, 'good', `The noise pulls the whole horde off course. {Team} slips away behind them.`, [['use', 'tag', 'noise'], ['time', 1]]), O(0.15, 'danger', `Most follow the noise. Not all. One comes for {r}.`, [['use', 'tag', 'noise'], ['em', 'r']])], { req: { tags: ['noise'] } }),
      C(`Lie flat in the ferns`, `They might walk straight past.`, [O(0.55, 'neutral', `Ferns, mud, silence. Somehow, they walk straight past.`, [['time', -1]]), O(0.45, 'danger', `Someone treads right on {r}.`, [['em', 'r']])]),
      C(`Go back the way you came`, `Retreat.`, [O(1, 'neutral', `{Team} doubles back and loops round. It costs a lot of time.`, [['time', -3]])]),
    ],
  }),
  E('any_storm', {
    cat: 'hazard', loc: '*', title: `Thunderstorm`,
    text: [`The sky turns black. Thunder cracks directly overhead, and then the rain comes down in sheets. Lightning splits a pine nearby. Water is running down the path like a river.`],
    scene: { light: 'storm', weather: 'rain' }, cast: ['a', 'b?'], say: [['a', `"Get away from the tall trees!"`], ['b', `"On the bright side, they cannot hear us over this."`, 'Intelligent']],
    choices: [
      rush(`Keep moving in the storm`, `The noise covers you.`, { hurt: 0.15, danger: 0.05, time: 1, t: { hurt: `{r} slips down a muddy bank in the downpour.`, ok: `Soaked to the bone, but nothing could hear {team} pass.` } }),
      safe(`Shelter under a rock overhang`, `Wait it out.`, { time: -2, t: `An hour under the rock. Cold, but dry-ish.` }),
      C(`Make a shelter with a tarp`, `Rig something up.`, [O(0.7, 'funny', `The tarp shelter is a masterpiece. It holds for ten minutes, then collapses on everyone.`, [['funny'], ['time', -1]]), O(0.3, 'neutral', `The wind takes the tarp. Gone.`, [['time', -1]])]),
      C(`Collect rainwater`, `Fresh water.`, [O(1, 'good', `Bottles filled with clean rainwater. Everyone drinks.`, [['heal', 'injured', 1], ['time', -1]])]),
      search(`Shelter in an old hunting hide`, `There is one just off the path.`, { item: 0.5, hurt: 0, danger: 0.12 }),
    ],
  }),
  E('any_lost', {
    cat: 'interaction', loc: '*', title: `Lost`,
    text: [`Every tree looks the same. {a} is certain they passed that stump an hour ago. {b} is certain they did not. The sun has gone behind the clouds.`],
    cast: ['a', 'b'], say: [['a', `"We have been here before. That stump. Look at it."`], ['b', `"All stumps look the same. That is what stumps do."`]],
    choices: [
      C(`Use the compass or map`, `Navigate properly.`, [O(1, 'good', `East is that way. Of course it is.`, [['time', 1]])], { req: { tags: ['map'] } }),
      C(`Follow moss on the trees`, `Moss grows on the north side. Supposedly.`, [O(0.5, 'good', `The moss trick works. Back on track.`), O(0.5, 'bad', `The moss trick does not work. Lost for another hour.`, [['time', -2], ['funny']])]),
      C(`Climb a tree to look`, `Get above the canopy.`, [O(0.7, 'good', `From the top: the radio mast. That way.`), O(0.3, 'hurt', `{a} climbs too high on a thin branch. It snaps.`, [['hurt', 'a', 1]])]),
      C(`Follow running water downhill`, `Streams lead somewhere.`, [O(0.6, 'good', `The stream leads to a path. A real path.`), O(0.4, 'bad', `The stream leads to a bog. A real bog.`, [['time', -2]])]),
      C(`Argue about it for a while`, `Someone has to be right.`, [O(1, 'funny', `Ten minutes of heated debate. In the end, {a} and {b} both point in completely different directions. You split the difference.`, [['funny'], ['time', -1]])]),
      C(`Wait for the sun to come out`, `It will show you which way is east.`, [O(0.7, 'good', `The clouds part. The sun is low in the west. East is behind you.`, [['time', -1]]), O(0.3, 'neutral', `The sun stays hidden. You pick a direction and hope.`, [['time', -1]])]),
    ],
  }),
  E('any_campfire', {
    cat: 'interaction', loc: '*', title: `Fireside`,
    text: [`In a sheltered hollow, {team} finds the ashes of someone's campfire. Still warm. A pan sits on the embers. For the first time all day, it feels almost safe.`],
    cast: ['a', 'b?'], say: [['a', `"Five minutes. Just five minutes by the fire."`], ['b', `"Does anyone know any campfire songs that are not about death?"`, 'Funny']],
    choices: [
      C(`Rest by the embers`, `Warmth and rest.`, [O(0.85, 'good', `Warm hands, a moment's peace. Everyone feels a little better.`, [['heal', 'injured', 1], ['time', -2]]), O(0.15, 'danger', `Whoever made this fire is coming back. And they are not themselves. They go for {r}.`, [['em', 'r']])]),
      C(`Sing a campfire song`, `Morale.`, [O(0.7, 'funny', `{a} leads a very quiet, very bad rendition of a camp song. Everyone joins in. Spirits lift.`, [['funny'], ['time', -1]]), O(0.3, 'danger', `The singing carries. Something hums along. Then lunges at {r}.`, [['em', 'r'], ['funny']])]),
      search(`Search the camp`, `Whoever was here left a bag.`, { item: 0.6, hurt: 0, danger: 0.1 }),
      safe(`Keep moving`, `A warm fire means someone was just here.`),
      C(`Tell scary stories`, `Too soon?`, [O(1, 'funny', `{a} starts a ghost story. Halfway through, everyone realises it is just today's events. Nobody sleeps.`, [['funny'], ['time', -1]])]),
    ],
  }),
  E('any_ivy', {
    cat: 'humour', loc: '*', title: `Itchy`,
    text: [`{a} has been rubbing their arm for a while. Then their leg. Then their face. Then {a} looks down and realises they have been walking through poison ivy for the last ten minutes.`],
    cast: ['a', 'b?'], say: [['a', `"Why does everything itch? Why does EVERYTHING itch?"`], ['b', `"Leaves of three, let it be. Everyone knows that."`, 'Nature lover']],
    choices: [
      C(`Wash it off in a stream`, `Quick rinse.`, [O(1, 'funny', `Cold water helps. {a} spends five minutes splashing like a duck.`, [['funny'], ['time', -1]])]),
      safe(`Ignore it and keep going`, `It is just an itch.`, { t: `{a} itches for the next three hours. Everyone hears about it.` }),
      C(`Find dock leaves`, `Nature's remedy.`, [O(0.7, 'funny', `{a} is wrapped in dock leaves like a burrito. It sort of helps.`, [['funny']]), O(0.3, 'neutral', `They are not dock leaves. They are more poison ivy.`, [['funny']])]),
      C(`Use some first aid cream`, `There is antihistamine in the kit.`, [O(1, 'good', `Instant relief. {a} could cry.`, [['use', 'tag', 'medical']])], { req: { tags: ['medical'] } }),
      C(`Mock {a} mercilessly`, `It is what friends do.`, [O(1, 'funny', `Everyone takes turns doing impressions of {a} itching. {a} does not find it funny. Everyone else does.`, [['funny']])]),
      C(`Roll in the mud to soothe it`, `Mud is cooling. Probably.`, [O(1, 'funny', `{a} rolls in the mud like a hippo. It does nothing for the itching, but it is very funny.`, [['funny']])]),
    ],
  }),
  E('any_injured_hiker', {
    npc: ['hiker'],
    cat: 'moral', loc: '*', title: `The Injured Hiker`, major: true,
    text: [`A hiker lies at the bottom of a slope, one leg twisted badly. "Please," he calls. "I fell. I am not bitten, I swear. I just cannot walk." Behind him, in the trees, shapes are moving.`],
    scene: { z: 2 }, cast: ['a', 'b?:Kind'], say: [['b', `"We cannot leave him. We just cannot."`, 'Kind'], ['a', `"They are coming. We have about a minute."`]],
    choices: [
      C(`Carry him out together`, `Leave no one behind.`, [O(0.6, 'good', `{Team} hauls him up the slope just in time. He thanks them and gives them {loot}, then limps toward his own camp.`, [['loot'], ['hero']]), O(0.4, 'hurt', `They get him out, but {r} is clawed by the first infected to arrive.`, [['hurt', 'r', 1], ['hero']])]),
      C(`Give him a weapon and leave`, `Give him a chance.`, [O(1, 'neutral', `{a} hands him a sturdy branch. "Good luck." He nods. They leave.`)]),
      safe(`Leave him`, `You cannot risk everyone for one stranger.`, { t: `His shouts follow {team} up the slope. Then they stop.`, fx: [['flag', 'left_hiker']] }),
      C(`Distract the infected while others help`, `Split the jobs.`, [O(0.55, 'good', `{a} leads the infected away while the others carry the hiker to safety.`, [['hero']]), O(0.45, 'danger', `{a} leads them away, but gets cornered.`, [['em', 'a']])], { req: { minAlive: 2 } }),
      C(`Splint his leg quickly`, `If he can walk, he can save himself.`, [O(0.7, 'good', `A quick splint. He can hobble. He waves {team} on.`, [['time', -1]]), O(0.3, 'danger', `Too slow. The first one arrives, going for {r}.`, [['em', 'r']])]),
      C(`Check him for bites`, `Make sure he is telling the truth.`, [O(0.6, 'good', `No bites. He was telling the truth. {Team} helps him up.`, [['hero']]), O(0.4, 'neutral', `There is a bite on his ankle. He sees you see it. "Go," he says.`)]),
    ],
  }),
  E('wade_twist', {
    npc: ['wade'],
    cat: 'interaction', loc: '*', req: { flags: ['npc_wade'], npcIs: ['wade', 'traitor'] }, stage: [10, 40], title: `Wade's Real Plan`, major: true,
    text: [`Wade has been quiet all afternoon. Now he stops and turns, rifle in his hands. "Here's the thing. That beacon calls one helicopter. One. And I'm going to be on it." He looks at the backpack.`],
    cast: ['a', 'b?'], say: [['a', `"Wade. Think about this."`], ['b', `"I KNEW it. I knew it from the eyebrows."`, 'Sarcastic']],
    choices: [
      C(`Talk him down`, `Everyone can fit. Nobody needs to get hurt.`, [O(0.5, 'good', `Wade wavers. Then lowers the rifle. "...Fine. But I'm sitting at the front." He stays, sulking.`, [['flag', 'wade_calm']]), O(0.5, 'bad', `Wade snatches something from the backpack and vanishes into the trees.`, [['lose'], ['npcgone', 'wade'], ['flag', 'wade_thief']])]),
      C(`Rush him`, `He cannot shoot everyone.`, [O(0.5, 'good', `{a} tackles Wade into the bracken. The rifle goes flying. Wade runs off, unarmed.`, [['npcgone', 'wade'], ['hero']]), O(0.5, 'hurt', `Wade swings the rifle butt. {a} goes down hard. Wade runs.`, [['hurt', 'a', 1], ['npcgone', 'wade'], ['lose']])]),
      C(`Give him what he wants`, `Hand over the backpack items he is staring at.`, [O(1, 'bad', `Wade takes what he wants and leaves without a word.`, [['lose'], ['npcgone', 'wade'], ['flag', 'wade_thief']])]),
      C(`Agree to his plan`, `Leave the others. You and Wade.`, [O(1, 'bad', `{a} nods. Wade smiles. That is a mistake.`, [['flag', 'wade_deal']])], { major: true }),
      C(`Call his bluff`, `"Shoot, then. Everything in this forest will hear it."`, [O(0.7, 'good', `Wade realises it. He lowers the gun and laughs nervously. "Only joking." Nobody believes him, but he behaves.`, [['flag', 'wade_calm']]), O(0.3, 'hurt', `He does not shoot. He swings. {a} is knocked down, and Wade runs.`, [['hurt', 'a', 1], ['npcgone', 'wade']])]),
    ],
  }),
  E('pemberton_birds', {
    npc: ['pemberton'],
    cat: 'humour', loc: '*', req: { flags: ['npc_pemberton'] }, title: `Pemberton's Warning`,
    text: [`Pemberton suddenly stops, binoculars up. "The crows," he whispers. "Look at the crows. They gather over the infected. They always do. There, and there. We should go between them."`],
    cast: ['a'], say: [['a', `"Pemberton, you beautiful nerd."`]],
    choices: [
      C(`Follow Pemberton's crow route`, `Trust the birds.`, [O(0.85, 'good', `Between the crows, the forest is empty. Pemberton is a genius.`, [['time', 2], ['hero']]), O(0.15, 'neutral', `One crow was just a crow. Minor detour.`, [['time', -1]])]),
      C(`Ask Pemberton about the local birds`, `He is dying to tell someone.`, [O(1, 'funny', `Pemberton gives a fifteen-minute talk on woodpeckers. It is genuinely interesting. Nobody admits it.`, [['funny'], ['time', -1]])]),
      safe(`Ignore the crows`, `They are just birds.`),
      C(`Let Pemberton scout ahead`, `He is good at not being seen.`, [O(0.7, 'item', `Pemberton returns with {loot} and a report of a clear path.`, [['loot']]), O(0.3, 'neutral', `Pemberton returns with nothing but a sighting of a rare finch. He is thrilled.`, [['funny']])]),
      C(`Rest while Pemberton watches`, `He has binoculars.`, [O(1, 'good', `A short rest under Pemberton's watchful eye.`, [['heal', 'injured', 1], ['time', -1]])]),
    ],
  }),
  E('dale_shortcut', {
    npc: ['dale'],
    cat: 'interaction', loc: '*', req: { flags: ['npc_dale'] }, title: `Dale's Path`,
    text: [`Ranger Dale points to a gap in a fence with a faded sign: FIREBREAK — NO PUBLIC ACCESS. "Fire road. Cuts straight east. Nobody uses it."`],
    cast: ['a'], say: [['a', `"Lead the way, Dale."`]],
    choices: [
      C(`Take the firebreak`, `Follow Dale.`, [O(0.85, 'good', `The fire road is wide and straight. Dale was right.`, [['time', 2], ['shortcut', 1]]), O(0.15, 'hurt', `Dale's leg gives out on the slope. {a} catches him and twists an ankle.`, [['hurt', 'a', 1], ['time', 1]])]),
      C(`Ask Dale about the beacon`, `Make sure you know what to do.`, [O(1, 'good', `"Fuse goes in the grey box. Or fuel in the generator out back. Then the big red switch." Clear instructions.`, [['flag', 'knows_power']])]),
      safe(`Stay on the main trail`, `Just in case.`),
      C(`Let Dale rest his leg`, `He needs it.`, [O(1, 'good', `A short rest. Dale re-bandages his leg and everyone catches their breath.`, [['heal', 'injured', 1], ['time', -1]])]),
      C(`Ask Dale where the supplies are`, `Rangers have stashes.`, [O(1, 'item', `Dale digs up a cache under a marked rock: {loot}.`, [['loot']])]),
    ],
  }),
  E('any_crawler', {
    cat: 'zombie', loc: '*', title: `Under the Leaves`,
    text: [`The leaves on the path shift. Something is lying under them, buried, waiting. A grey hand reaches out of the leaf litter toward {a}'s boot.`],
    scene: { z: 1 }, cast: ['a', 'b?'], say: [['a', `"Something is in the leaves. Something is IN THE LEAVES."`]],
    choices: [
      C(`{a} jumps clear`, `One big leap.`, [O(0.75, 'good', `{a} jumps like a startled deer. The hand closes on nothing.`, [['funny']]), O(0.25, 'danger', `A hand grabs {a}'s boot!`, [['em', 'a']])]),
      C(`Step back slowly`, `No sudden moves.`, [O(0.6, 'neutral', `Slowly back. The hand gropes around and goes still.`), O(0.4, 'danger', `It lunges out of the leaves at {a}.`, [['em', 'a']])]),
      C(`Pin it with a log`, `Roll something heavy on it.`, [O(0.7, 'good', `A log across its back. It is not going anywhere.`), O(0.3, 'hurt', `The log rolls off. {r} jumps back and twists an ankle.`, [['hurt', 'r', 1]])]),
      safe(`Everyone freeze`, `It might not know you are there.`, { time: -1, t: `After a long minute, the leaves go still again.` }),
      C(`Check the leaves around it`, `It might have dropped something.`, [O(0.4, 'item', `Its pack, buried beside it: {loot}.`, [['loot']]), O(0.6, 'danger', `It does not want you near its pack. It grabs at {r}.`, [['em', 'r']])]),
    ],
  }),
  E('any_backpack', {
    cat: 'item', loc: '*', title: `The Lost Pack`,
    text: [`Hanging from a branch, out of reach of animals, is a hiker's rucksack. Someone hung it there carefully. A label on the strap reads: "Back for this tomorrow. — J."`],
    cast: ['a'], say: [['a', `"J is not coming back for it."`]],
    choices: [
      C(`Take the backpack`, `J would want it used.`, [O(1, 'item', `Inside: {loot}, and a postcard of the lake.`, [['loot']])]),
      C(`Climb up and take only half`, `Leave something for J.`, [O(0.7, 'item', `{a} takes {loot} and leaves a note: "Sorry, J. Thank you."`, [['loot']]), O(0.3, 'hurt', `The branch breaks. {a} lands on the backpack.`, [['hurt', 'a', 1], ['loot']])]),
      safe(`Leave it for J`, `It is not yours.`, { t: `{a} leaves it hanging. Somewhere, maybe, J is still alive.` }),
      C(`Look for J`, `They might be close.`, [O(0.4, 'good', `J is hiding in a tree nearby. She shares {loot} and points east.`, [['loot'], ['hero']]), O(0.6, 'danger', `J is nearby. J is no longer J. It goes for {r}.`, [['em', 'r']])]),
      C(`Shake the branch to knock it down`, `Easier than climbing.`, [O(0.6, 'item', `The pack drops with a thud. Inside: {loot}.`, [['loot']]), O(0.4, 'funny', `The pack drops onto {a}'s head. Inside: a very heavy cast-iron pan. Nothing else.`, [['funny']])]),
    ],
  }),
  E('any_deer', {
    cat: 'hazard', loc: '*', title: `The Deer`,
    text: [`A deer stands in a clearing ahead. Its fur is matted. Its eyes are milky white. It turns its head toward {team} with a jerky, wrong movement. Even the animals.`],
    scene: { z: 0 }, cast: ['a', 'b?:Nature lover'], say: [['b', `"Oh no. Oh no, not the deer. That is horrible."`, 'Nature lover'], ['a', `"Can animals catch it? Since when?"`]],
    choices: [
      safe(`Back away and go around`, `Do not let it see you.`, { time: -1 }),
      rush(`Run past while it is confused`, `Animals are unpredictable.`, { hurt: 0.2, danger: 0.08, time: 1, t: { hurt: `The deer charges. {r} is knocked flat by its antlers.` } }),
      C(`Climb a tree and wait`, `Let it wander off.`, [O(0.7, 'neutral', `The deer wanders off eventually, twitching.`, [['time', -1]]), O(0.3, 'hurt', `The deer charges the tree. {r} falls out of it.`, [['hurt', 'r', 1]])]),
      C(`Throw something to scare it`, `Drive it away.`, [O(0.6, 'good', `It bolts into the trees. Gone.`), O(0.4, 'hurt', `It does not bolt. It charges. {r} takes an antler to the side.`, [['hurt', 'r', 1]])]),
      C(`Take notes on it`, `This could matter to scientists.`, [O(1, 'neutral', `{a} scribbles notes about the deer. If anyone ever studies this outbreak, they will want to know.`, [['flag', 'animal_notes']])]),
    ],
  }),

  E('any_quadbike', {
    cat: 'item', loc: '*', stage: [6, 40], w: 3, req: { noItems: ['fuel', 'fuse'] }, title: `The Quad Bike`,
    text: [`A park quad bike lies on its side in a ditch, engine cold. A red jerrycan is still strapped to the back rack. The rider's helmet sits on a stump nearby, very neatly, as if they meant to come back.`],
    cast: ['a', 'b?:Engineer'], say: [['b', `"Fuel. That is generator fuel. That could power the beacon."`, 'Engineer'], ['a', `"Somebody left this in a hurry."`]],
    choices: [
      C(`Unstrap the jerrycan`, `Take the fuel and go.`, [O(0.85, 'item', `{a} unstraps the jerrycan: {loot}. It sloshes reassuringly.`, [['item', 'fuel']]), O(0.15, 'danger', `The rider is in the ditch too, under the bike. It reaches for {r}.`, [['item', 'fuel'], ['em', 'r']])]),
      C(`Right the quad bike and ride it`, `Wheels beat feet.`, [O(0.45, 'good', `The engine catches. Everyone piles on and bounces down the trail. Huge time saved, and the fuel comes too.`, [['item', 'fuel'], ['time', 2]]), O(0.35, 'hurt', `It starts, then flips on the first bend. {r} is thrown into a bush. The fuel survives.`, [['hurt', 'r', 1], ['item', 'fuel'], ['funny']]), O(0.2, 'neutral', `Flat battery. The jerrycan is still there, at least.`, [['item', 'fuel'], ['time', -1]])]),
      search(`Search the saddlebags`, `Park quad bikes carry kit.`, { item: 0.7, hurt: 0, danger: 0.1 }),
      safe(`Leave it`, `Heavy fuel cans slow you down.`),
      C(`Try on the helmet`, `Safety first.`, [O(1, 'funny', `{a} wears the helmet for the next mile. It is two sizes too big and bonks on every branch.`, [['funny']])]),
    ],
  }),
  E('any_cache', {
    cat: 'item', loc: '*', stage: [10, 40], w: 3, req: { noItems: ['fuse'] }, title: `Ranger Cache`,
    text: [`Bolted to a tree is a green metal box stencilled PARKS SERVICE — EMERGENCY SPARES. It has a padlock and a keycard slot. Through a rust hole, {team} can see a box of fuses.`],
    cast: ['a', 'b?'], say: [['a', `"Spares. Beacon spares. This is exactly what we need."`]],
    choices: [
      C(`Smash the padlock with a rock`, `Brute force.`, [O(0.65, 'item', `Three hard blows and the lock gives. Inside: {loot}.`, [['item', 'fuse']]), O(0.2, 'hurt', `The rock slips. {r} crushes a finger, but the lock breaks.`, [['hurt', 'r', 1], ['item', 'fuse']]), O(0.15, 'danger', `The clanging brings something out of the trees toward {r}.`, [['em', 'r']])]),
      C(`Use the keycard`, `The slot looks like Parks Service.`, [O(1, 'item', `Beep. The box swings open: {loot}.`, [['item', 'fuse']])], { req: { items: ['keycard'] } }),
      C(`Lever it open with a branch`, `Leverage.`, [O(0.5, 'item', `The hinge pops. Inside: {loot}.`, [['item', 'fuse'], ['time', -1]]), O(0.5, 'neutral', `The branch snaps. The box wins.`, [['time', -1]])]),
      safe(`Leave it`, `You might not need it.`),
      search(`Search around the tree`, `Rangers sometimes hide the key nearby.`, { item: 0.5, hurt: 0, danger: 0.08, t: { item: `Under a stone at the base of the tree: {loot}.` } }),
      C(`Shake the box to see what rattles`, `Maybe it is not even locked properly.`, [O(0.3, 'item', `The lid was only jammed. It pops open: {loot}.`, [['item', 'fuse']]), O(0.7, 'neutral', `It rattles. It does not open. It is very satisfying to shake, though.`, [['funny']])]),
    ],
  }),

  E('any_wolves', {
    cat: 'hazard', loc: '*', title: `The Howling`,
    text: [`A howl rises from the trees, then another, then a whole chorus. Wolves. Real ones. And from the sound of it, they are hunting the infected, which means they are hunting near {team}.`],
    cast: ['a', 'b?:Nature lover'], say: [['b', `"Wolves avoid people. Usually. Stay together and stay calm."`, 'Nature lover'], ['a', `"Today has been very educational about wildlife."`]],
    choices: [
      safe(`Stay still and let the pack pass`, `Do not look like prey.`, { time: -1, t: `Grey shapes flow between the trees, chasing something that groans. They ignore {team} entirely.` }),
      C(`Follow the wolves at a distance`, `They are clearing the infected from your path.`, [O(0.6, 'good', `The pack drives a crowd of infected away north. {Team} slips east through the gap.`, [['time', 1]]), O(0.4, 'hurt', `One wolf doubles back to see who is following. {r} gets a warning nip.`, [['hurt', 'r', 1]])]),
      rush(`Hurry away in the other direction`, `Put distance between you and the pack.`, { hurt: 0.12, danger: 0.08, time: 1 }),
      C(`Climb a tree until it is quiet`, `Wolves cannot climb.`, [O(0.75, 'neutral', `From the branches, {team} watches the hunt pass beneath. Then silence.`, [['time', -1]]), O(0.25, 'hurt', `{r} slips climbing down afterwards.`, [['hurt', 'r', 1]])]),
      C(`Howl back`, `Why not.`, [O(0.5, 'funny', `{a} howls. The forest goes completely silent. The wolves, apparently, are embarrassed for everyone.`, [['funny']]), O(0.5, 'danger', `The wolves do not answer. Something else does, and it comes for {r}.`, [['em', 'r'], ['funny']])]),
    ],
  }),
  E('any_treehouse', {
    cat: 'item', loc: '*', title: `The Treehouse`,
    text: [`High in an old oak is a treehouse with a rope ladder, a hand-painted sign reading NO GROWN-UPS, and a periscope made from a drainpipe. The rope ladder is still down.`],
    cast: ['a', 'b?'], say: [['a', `"Safest place in the forest, probably."`], ['b', `"I always wanted a treehouse."`, 'Funny']],
    choices: [
      search(`Climb up and search it`, `Someone stocked it like a fort.`, { item: 0.7, hurt: 0.08, t: { item: `Inside, in a biscuit tin labelled EMERGENCYS: {loot}.`, hurt: `A rung snaps. {r} drops back to the ground.` } }),
      C(`Rest up there for a while`, `Pull the ladder up. Nothing can reach you.`, [O(1, 'good', `Ladder up, door shut. Half an hour of real rest in the branches.`, [['heal', 'injured', 1], ['time', -2]])]),
      C(`Use the periscope to scout`, `See over the undergrowth.`, [O(0.7, 'good', `Through the periscope: a clear path east, between two groups of infected.`, [['time', 1]]), O(0.3, 'funny', `The periscope points at a squirrel. Just a squirrel. Forever.`, [['funny']])]),
      safe(`Leave it`, `No time for treehouses.`),
      C(`Read the rules pinned to the door`, `Every treehouse has rules.`, [O(1, 'funny', `Rule 1: No grown-ups. Rule 2: No zombies. Rule 3: Password is BANANA. {a} says "banana" solemnly before going anywhere near it.`, [['funny']])]),
    ],
  }),
  E('any_stream', {
    cat: 'interaction', loc: '*', title: `Clear Water`,
    text: [`A clear stream bubbles over pebbles. Everyone is desperately thirsty. The water looks perfect. Upstream, out of sight, something splashes.`],
    cast: ['a', 'b?:Practical'], say: [['b', `"Boil it, or at least check upstream first."`, 'Practical'], ['a', `"I would drink a puddle right now."`]],
    choices: [
      C(`Drink straight away`, `Thirst wins.`, [O(0.7, 'good', `Cold, clean, wonderful. Everyone feels human again.`, [['heal', 'injured', 1]]), O(0.3, 'hurt', `Upstream, something was lying in the water. {r} feels very sick for an hour.`, [['hurt', 'r', 1]])]),
      C(`Check upstream first`, `See what is splashing.`, [O(0.6, 'good', `Just a heron. The water is safe. Everyone drinks.`, [['heal', 'injured', 1], ['time', -1]]), O(0.4, 'danger', `It is not a heron. It wades toward {r}.`, [['em', 'r']])]),
      C(`Boil water over a quick fire`, `Safe, but slow.`, [O(1, 'good', `Smoky, warm, safe water. Everyone feels better.`, [['heal', 'injured', 1], ['time', -2]])]),
      safe(`Push on thirsty`, `No risks.`, { t: `Dry mouths and cracked lips, but moving.` }),
      search(`Search the stream bank`, `Things wash down from upstream.`, { item: 0.55, hurt: 0, danger: 0.1, t: { item: `Caught in the reeds: a waterproof bag with {loot}.` } }),
    ],
  }),
  E('any_snare', {
    cat: 'humour', loc: '*', title: `Snared`,
    text: [`There is a twang, a whoosh, and suddenly {a} is hanging upside down from a tree by one ankle, swinging gently. An old hunter's snare. Everyone stares.`],
    cast: ['a', 'b?'], say: [['a', `"Nobody. Say. Anything."`], ['b', `"I am not saying anything. I am just taking a mental photograph."`, 'Funny']],
    choices: [
      C(`Cut {a} down`, `Quick and simple.`, [O(0.6, 'funny', `{a} drops into a heap of leaves. Dignity: gone. Ankle: fine.`, [['funny']]), O(0.4, 'hurt', `{a} drops headfirst. The leaves were not as deep as they looked.`, [['hurt', 'a', 1], ['funny']])]),
      C(`Lower {a} down carefully`, `Gently does it.`, [O(1, 'good', `{a} is lowered slowly to the ground like a very embarrassed piñata.`, [['time', -1], ['funny']])]),
      C(`Leave {a} hanging for a moment`, `Morale.`, [O(0.6, 'funny', `Thirty seconds of laughter, then a rescue. {a} vows revenge.`, [['funny']]), O(0.4, 'danger', `The laughter carries. Something comes to see, and goes for {r}.`, [['em', 'r'], ['funny']])]),
      C(`Look for more snares`, `Where there is one, there are more.`, [O(1, 'good', `{Team} finds three more snares and marks them. Then cuts {a} down.`, [['time', -1]])]),
      C(`Reset the snare as a trap for the infected`, `Use it.`, [O(0.7, 'good', `Once {a} is down, the snare is reset. Something will regret that later.`, [['flag', 'snare_set']]), O(0.3, 'funny', `Resetting the snare catches {a} again. Somehow.`, [['funny'], ['time', -1]])]),
    ],
  }),
  E('any_ramblers', {
    npc: ['joan', 'rambler'],
    cat: 'rescue', loc: '*', title: `The Ramblers`,
    text: [`Out of the trees march six pensioners in matching purple fleeces, walking poles clicking in unison. "Afternoon!" says their leader, a tiny woman called Joan. "Wellbrook Ramblers. We're doing the long loop. Bit busy today, isn't it?"`],
    cast: ['a', 'b?:Kind'], say: [['b', `"We need to get them to safety."`, 'Kind'], ['a', `"Joan, have you seen any... unusual walkers today?"`]],
    choices: [
      C(`Warn them and send them to the road`, `Point them out of the forest.`, [O(1, 'good', `Joan listens, nods briskly, and reorganises the Ramblers into a defensive formation. "Right. Poles up." They give {team} {loot}.`, [['loot'], ['hero']])]),
      C(`Walk with them for a while`, `Strength in numbers.`, [O(0.7, 'good', `The Ramblers set a brutal pace and know a shortcut through the heather. Joan decides she is coming all the way to the station. "Someone has to keep you lot moving."`, [['time', 1], ['npc', 'joan']]), O(0.3, 'funny', `The Ramblers stop every five minutes to identify a mushroom. It costs time, but nobody dares complain.`, [['time', -1], ['funny']])]),
      C(`Ask Joan for directions`, `Ramblers know every path.`, [O(1, 'good', `"Ranger station? Left at the split oak, then follow the old wall." Precise and correct.`, [['time', 1]])]),
      safe(`Wave and carry on`, `They seem to be coping.`, { t: `"Lovely day for it!" Joan calls after them.` }),
      C(`Ask them to share supplies`, `They are very well prepared.`, [O(1, 'item', `Joan produces {loot} from a bottomless rucksack. "Always prepared, dear."`, [['item', 'first_aid']])]),
    ],
  }),
  E('any_helicopter', {
    cat: 'interaction', loc: '*', stage: [8, 40], title: `Rotor Blades`,
    text: [`A helicopter thunders overhead, low over the treetops, searchlight sweeping. It is heading east, toward the ranger station. It does not see {team} through the canopy.`],
    scene: { light: 'dusk' }, cast: ['a', 'b?'], say: [['a', `"HEY! DOWN HERE!"`], ['b', `"They cannot see us through the trees. We need a clearing."`, 'Practical']],
    choices: [
      C(`Run for the nearest clearing and wave`, `Make yourselves seen.`, [O(0.4, 'good', `The searchlight swings over the clearing and lingers. A wing waggle. They know someone is out here.`, [['flag', 'heli_seen']]), O(0.6, 'neutral', `By the time {team} reaches the clearing, the helicopter is a dot on the horizon.`)]),
      C(`Fire the flare gun`, `Impossible to miss.`, [O(0.85, 'good', `The flare arcs through the canopy. The helicopter turns, circles, and drops a supply bag before heading east.`, [['use', 'flare_gun'], ['flag', 'heli_seen'], ['item', 'first_aid']]), O(0.15, 'neutral', `The flare tangles in the branches and fizzles out.`, [['use', 'flare_gun']])], { req: { items: ['flare_gun'] } }),
      safe(`Watch where it goes`, `It is heading for the station. Follow it.`, { time: 1, t: `The helicopter's heading confirms the way east.` }),
      C(`Shout and scream`, `Every voice counts.`, [O(0.3, 'neutral', `Nobody in a helicopter can hear shouting. Everybody on the ground can.`), O(0.7, 'danger', `The helicopter does not hear. Something in the trees does, and comes for {r}.`, [['em', 'r']])]),
      C(`Climb a tall tree to signal`, `Get above the canopy.`, [O(0.5, 'good', `{a} waves a jacket from the treetop. The pilot sees it.`, [['flag', 'heli_seen']]), O(0.5, 'hurt', `{a} gets most of the way up before a branch gives way.`, [['hurt', 'a', 1]])]),
      C(`Light a smoky fire in a clearing`, `Smoke rises above the trees.`, [O(0.45, 'good', `Green branches on a small fire send up a thick plume. The helicopter circles once before heading east.`, [['flag', 'heli_seen'], ['time', -1]]), O(0.55, 'danger', `The smoke is seen, by everything on the ground. Something comes for {r}.`, [['em', 'r'], ['time', -1]])]),
    ],
  }),
  E('any_campervan', {
    cat: 'item', loc: '*', title: `The Campervan`,
    text: [`A battered campervan sits at the end of a dirt track, curtains drawn, surfboard on the roof, stickers everywhere: I BRAKE FOR SQUIRRELS. The side door is half open.`],
    scene: { bg: 'road' }, cast: ['a', 'b?'], say: [['a', `"Hello? Anyone home?"`], ['b', `"There is a surfboard. We are hundreds of miles from the sea."`, 'Sarcastic']],
    choices: [
      search(`Search the campervan`, `Food, first aid, camping kit.`, { item: 0.75, hurt: 0, danger: 0.12 }),
      C(`Try to drive it`, `Keys are in the ignition.`, [O(0.4, 'good', `It starts! A bumpy mile down the track before it hits a fallen tree.`, [['time', 2]]), O(0.6, 'neutral', `Out of petrol. Of course it is.`, [['time', -1]])]),
      C(`Knock first`, `Manners.`, [O(0.5, 'good', `A sleepy voice: "Go away, man." A surfer, entirely unaware of the apocalypse. He gives {team} {loot} to leave him alone.`, [['loot'], ['funny']]), O(0.5, 'danger', `Something knocks back. Then the door slides open toward {r}.`, [['em', 'r']])]),
      safe(`Walk on by`, `Not worth the risk.`),
      C(`Siphon the fuel tank`, `There might be a little petrol left.`, [O(0.4, 'item', `A mouthful of petrol later, {a} has half-filled a jerrycan: {loot}.`, [['item', 'fuel'], ['funny']]), O(0.6, 'neutral', `Empty. And {a} now tastes petrol.`, [['funny']])]),
    ],
  }),
  E('any_whisper', {
    cat: 'moral', loc: '*', title: `The Voice in the Dark`,
    text: [`From somewhere off the path comes a voice, thin and pleading: "Help... please... help me..." It keeps repeating. Exactly the same words. Exactly the same way.`],
    scene: { light: 'dim' }, cast: ['a', 'b?:Intelligent'], say: [['b', `"Listen to it. It is saying exactly the same thing every time. That is not right."`, 'Intelligent'], ['a', `"What if someone really needs help?"`]],
    choices: [
      C(`Go and help`, `Someone needs you.`, [O(0.3, 'good', `It is a walkie-talkie on a loop, next to an injured walker who could not speak any more. {Team} gets him water and he points to his pack: {loot}.`, [['loot'], ['hero']]), O(0.7, 'danger', `It was a voice, once. What is making it now lunges for {r}.`, [['em', 'r']])]),
      safe(`Keep walking`, `It is a trap. It has to be.`, { t: `The voice keeps calling, the same words over and over, until it fades behind them.` }),
      C(`Call out and ask a question`, `See if it answers properly.`, [O(1, 'neutral', `"What is your name?" Pause. "Help... please... help me..." That settles it.`)]),
      C(`Sneak closer to look`, `Know what it is.`, [O(0.5, 'neutral', `Through the leaves: a phone on a log, playing a recording. Someone set it as a lure. For what?`, [['flag', 'lure_found']]), O(0.5, 'danger', `It sees {r} before {r} sees it.`, [['em', 'r']])]),
      C(`Throw a stone toward the voice`, `See what reacts.`, [O(0.6, 'neutral', `Something heavy moves toward the stone and stays there. {Team} goes the other way.`), O(0.4, 'danger', `It moves toward the stone, then turns toward {r}.`, [['em', 'r']])]),
    ],
  }),

  // ---------------- EMERGENCIES ----------------
  E('em_lunge', {
    cat: 'emergency', loc: '*', essential: true, repeat: true, title: `From the Trees!`,
    text: [`An infected crashes out of the undergrowth straight at {t}! Branches snap. Its arms are outstretched, mouth open, just a stride away.`, `A figure in a torn hiking jacket stumbles out of the ferns and lunges at {t}!`, `{t} brushes past a tree, and the tree has arms. An infected ranger grabs for {t}!`],
    scene: { z: 1, light: 'alert' }, cast: ['t!', 'h?'], say: [['h', `"{t}! Behind you!"`], ['t', `"No no no no NO!"`, 'Nervous']],
    choices: [
      C(`{t} dodges behind a tree`, `Put a trunk between you.`, [O(0.6, 'good', `{t} spins round a thick pine. It crashes into the bark. {t} is gone.`), O(0.22, 'hurt', `{t} dodges, but its nails rake their shoulder.`, [['hurt', 't', 1]]), O(0.08, 'infect', `{t} escapes, but there is a scratch on their neck. It is turning dark already.`, [['hurt', 't', 1], ['infect', 't']]), O(0.1, 'death', `It catches {t} against the tree.`, [['bite', 't']])]),
      C(`Fight it off together`, `Everyone piles in.`, [O(0.7, 'good', `Sticks, rocks and fury. It goes down. {t} is shaking but safe.`, [['hero']]), O(0.22, 'hurt', `They win, but {r} is hurt in the scramble.`, [['hurt', 'r', 1]]), O(0.08, 'death', `In the chaos, its teeth find {t}.`, [['bite', 't']])], { req: { minAlive: 2 } }),
      C(`{t} shoves it down a slope`, `Use the terrain.`, [O(0.6, 'good', `One hard shove and it tumbles down the bank.`), O(0.3, 'hurt', `{t} shoves it, but slips and slides after it, battered.`, [['hurt', 't', 1]]), O(0.1, 'death', `They both go down the slope. Only one gets up.`, [['bite', 't']])]),
      C(`{t} grabs a branch and swings`, `Anything will do.`, [O(0.55, 'good', `Crack! The branch connects. It goes down.`, [['hero']]), O(0.35, 'hurt', `The branch snaps on impact. {t} has to wrestle free, scratched.`, [['hurt', 't', 1]]), O(0.1, 'death', `The branch is rotten. So is the luck.`, [['bite', 't']])]),
      C(`Run and leave {t}`, `Save yourselves.`, [O(0.5, 'hurt', `{t} escapes alone and catches up later, hurt and silent.`, [['hurt', 't', 1]]), O(0.25, 'good', `{t} gets away alone. Nobody can look them in the eye.`), O(0.25, 'death', `{t} does not catch up.`, [['bite', 't']])], { req: { minAlive: 2 }, major: true }),
      C(`{t} climbs the nearest tree`, `Get off the ground.`, [O(0.55, 'good', `{t} scrambles up the branches like a squirrel. It claws at the bark below, then gives up.`, [['funny']]), O(0.35, 'hurt', `{t} gets up, but not before it gets a grip on one ankle.`, [['hurt', 't', 1]]), O(0.1, 'death', `The branch breaks. {t} falls right into its arms.`, [['bite', 't']])]),
      C(`{t} curls up and rolls away`, `Get under its grab.`, [O(0.5, 'good', `{t} rolls under its arms and away down the slope.`, [['funny']]), O(0.38, 'hurt', `{t} rolls into a thorn bush.`, [['hurt', 't', 1], ['funny']]), O(0.12, 'death', `It falls on {t}. It bites.`, [['bite', 't']])]),
      companionRescue,
    ],
    uses: {
      gun: U(`CRACK. The rifle shot drops it instantly. {t} is saved. The echo rolls across the whole valley.`, [['next', 'dwf_gun_echo'], ['hero']]),
      melee: U(`One swing of the hatchet and it is over. {t} is safe.`, [['hero']]),
      spray: U(`A face full of bear spray. It reels away, clawing at its eyes. {t} runs.`, []),
      noise: U(`A shriek of the whistle off to one side. It turns, confused, and {t} gets clear.`, [], { consume: 0 }),
      signal: U(`The flare gun fires straight past it in a blaze of orange. It staggers back, and {t} runs.`, []),
    },
  }),
  E('em_grab', {
    cat: 'emergency', loc: '*', essential: true, repeat: true, title: `Dragged Down!`,
    text: [`Something buried in the bracken seizes {t}'s ankle and pulls. {t} hits the ground hard and is being dragged backwards through the ferns.`, `The ground near the path is not ground. A buried hand bursts up and drags {t} down by the boot!`, `{t} slips into a ditch, and something already lying there grabs hold and will not let go!`],
    scene: { z: 2, light: 'alert' }, cast: ['t!', 'h?'], say: [['h', `"Grab my hand! GRAB MY HAND!"`], ['t', `"It has got my LEG!"`]],
    choices: [
      C(`Pull {t} free`, `Everyone heave.`, [O(0.68, 'good', `A tug of war, and {t} comes free, minus one hiking boot.`, [['funny']]), O(0.17, 'hurt', `{t} comes free with a deep scrape down one leg.`, [['hurt', 't', 1]]), O(0.07, 'infect', `{t} is free, but its nails broke the skin. The scratch is already darkening.`, [['hurt', 't', 1], ['infect', 't']]), O(0.08, 'death', `Another one rises from the ferns and bites {t}.`, [['bite', 't']])], { req: { minAlive: 2 } }),
      C(`{t} kicks free`, `Stamp until it lets go.`, [O(0.6, 'good', `Three hard kicks. It lets go. {t} scrambles away.`), O(0.32, 'hurt', `It lets go, but not before a nasty scratch.`, [['hurt', 't', 1]]), O(0.08, 'death', `It does not let go.`, [['bite', 't']])]),
      C(`{t} grabs a root and holds on`, `Anchor yourself.`, [O(0.55, 'good', `{t} clings to a root until its grip slips.`), O(0.35, 'hurt', `{t} gets free, battered and bleeding.`, [['hurt', 't', 1]]), O(0.1, 'death', `The root snaps.`, [['bite', 't']])]),
      C(`Smash its arm with a rock`, `Hit until it lets go.`, [O(0.55, 'good', `A heavy rock does the job. {t} is free.`), O(0.35, 'hurt', `The rock catches {t}'s ankle too. Ouch. But free.`, [['hurt', 't', 1], ['funny']]), O(0.1, 'death', `Too slow. Its teeth find {t}'s calf.`, [['bite', 't']])]),
      C(`Leave {t}`, `Save yourselves.`, [O(0.5, 'hurt', `{t} kicks free alone and limps after the group.`, [['hurt', 't', 2]]), O(0.5, 'death', `By the time anyone looks back, it is over.`, [['bite', 't']])], { req: { minAlive: 2 }, major: true }),
      C(`{t} plays dead`, `Go limp.`, [O(0.45, 'funny', `{t} goes floppy. Confused, it loosens its grip. {t} crawls away very slowly.`, [['funny']]), O(0.43, 'hurt', `It is not fooled. {t} fights free, scratched.`, [['hurt', 't', 1]]), O(0.12, 'death', `Playing dead does not work.`, [['bite', 't']])]),
      C(`{t} grabs fistfuls of dirt and throws it`, `Right in its face.`, [O(0.5, 'good', `A face full of dirt. Its grip loosens. {t} scrambles free.`), O(0.4, 'hurt', `It barely flinches. {t} fights free, scratched.`, [['hurt', 't', 1]]), O(0.1, 'death', `The dirt does nothing.`, [['bite', 't']])]),
      companionRescue,
    ],
    uses: {
      gun: U(`One shot into the ferns. The grip goes slack. {t} is free, and every creature in the forest heard it.`, [['next', 'dwf_gun_echo'], ['hero']]),
      melee: U(`The hatchet comes down. {t} is free.`, [['hero']]),
      spray: U(`A blast of bear spray into the ferns. It lets go instantly, thrashing.`, []),
      rope: U(`A loop of rope round {t}'s waist and everyone hauls. {t} pops free like a cork.`, [['funny']], { consume: 0 }),
    },
  }),
  E('em_surround', {
    cat: 'emergency', loc: '*', essential: true, repeat: true, title: `Surrounded in the Fog`,
    text: [`Fog drifts between the trees. {t} wanders a few steps from the group to check a noise, and three shapes close in from three sides. {t} is trapped against a fallen trunk.`, `{t} follows a noise behind a rock and walks into a ring of three infected campers.`, `Mist curls between the pines. When it clears, {t} is surrounded on three sides.`],
    scene: { z: 3, light: 'fog' }, cast: ['t!', 'h?'], say: [['h', `"{t}! Where are you?!"`], ['t', `"Over here! A little help!"`], ['t', `"I can handle three. Probably."`, 'Brave']],
    choices: [
      C(`{t} vaults the fallen trunk`, `Over and away.`, [O(0.55, 'good', `{t} clears the trunk in one leap and is gone into the fog.`), O(0.27, 'hurt', `{t} gets over, but lands badly on the other side.`, [['hurt', 't', 1]]), O(0.08, 'infect', `{t} vaults it, but one of them got a scratch in first. It stings.`, [['hurt', 't', 1], ['infect', 't']]), O(0.1, 'death', `{t} is grabbed mid-vault.`, [['bite', 't']])]),
      C(`Charge in and break the circle`, `Hit them from behind.`, [O(0.62, 'good', `{Team} crashes into them from behind. {t} bursts free.`, [['hero']]), O(0.28, 'hurt', `A brutal scrap. {r} is hurt pulling {t} out.`, [['hurt', 'r', 1]]), O(0.1, 'death', `In the scrum, one bites {t}.`, [['bite', 't']])], { req: { minAlive: 2 } }),
      C(`Make noise to draw them away`, `Bang sticks together.`, [O(0.55, 'good', `Two turn to the noise. {t} dodges the third.`), O(0.35, 'hurt', `Only one turns. {t} fights past the others, scratched.`, [['hurt', 't', 1]]), O(0.1, 'death', `None of them turn.`, [['bite', 't']])]),
      C(`{t} climbs up the fallen trunk's roots`, `Get high.`, [O(0.5, 'good', `{t} scrambles up the root ball out of reach and jumps clear.`), O(0.4, 'hurt', `{t} slips off the roots, but out of the circle.`, [['hurt', 't', 1]]), O(0.1, 'death', `They pull {t} down from the roots.`, [['bite', 't']])]),
      C(`Leave {t} to it`, `Three is too many.`, [O(0.4, 'hurt', `{t} fights free alone, badly hurt.`, [['hurt', 't', 2]]), O(0.3, 'good', `{t} gets out alone and is furious.`), O(0.3, 'death', `{t} does not make it.`, [['bite', 't']])], { req: { minAlive: 2 }, major: true }),
      C(`{t} barges through the smallest one`, `Shoulder down.`, [O(0.55, 'good', `{t} flattens the smallest one and runs through the gap.`, [['hero']]), O(0.35, 'hurt', `{t} gets through with a heavy blow to the ribs.`, [['hurt', 't', 1]]), O(0.1, 'death', `It does not fall. It holds on.`, [['bite', 't']])]),
      C(`{t} hides in the fog`, `Stay still. Let the fog hide you.`, [O(0.45, 'funny', `{t} stands perfectly still in the fog. They walk straight past.`, [['funny']]), O(0.4, 'hurt', `They find {t} anyway. {t} fights free.`, [['hurt', 't', 1]]), O(0.15, 'death', `The fog does not hide {t}.`, [['bite', 't']])]),
      companionRescue,
    ],
    uses: {
      gun: U(`Three shots in the fog. Three shapes fall. {t} stands shaking in the silence, and the echoes roll away down the valley.`, [['next', 'dwf_gun_echo'], ['hero']]),
      melee: U(`{t} swings the hatchet in a wide arc and clears a path out.`, [['hero']]),
      spray: U(`A wide fan of bear spray. All three reel back, and {t} sprints through.`, []),
      signal: U(`The flare gun lights the fog orange. They stagger back, dazzled, and {t} runs.`, []),
    },
  }),
  E('gun_echo', {
    cat: 'chain', loc: '*', essential: true, repeat: true, title: `The Echo`,
    text: [`The gunshot rolls across the valley like thunder. Then, from every direction, the forest answers: snapping branches, rustling, groans. Everything heard it.`],
    scene: { z: 4, light: 'alert' }, cast: ['a', 'b?'], say: [['a', `"That was loud. Move. Now."`]],
    choices: [
      rush(`Run before they arrive`, `Go!`, { hurt: 0.15, danger: 0.1, time: 1 }),
      C(`Hide in a thicket`, `Get into the brambles and wait.`, [O(0.7, 'neutral', `Thorns everywhere, but they walk right past.`, [['time', -2]]), O(0.3, 'danger', `One pushes into the thicket, toward {r}.`, [['em', 'r']])]),
      C(`Climb up into the trees`, `Get above them.`, [O(0.6, 'neutral', `From the branches, {team} watches them gather, then drift away.`, [['time', -1]]), O(0.4, 'hurt', `{r} slips on a branch.`, [['hurt', 'r', 1]])]),
      C(`Lead them off with more noise`, `Use the noise.`, [O(0.6, 'good', `{a} smashes a branch against a tree further off and doubles back. They follow the noise.`, [['hero'], ['time', 1]]), O(0.4, 'hurt', `{a} gets cornered making the noise.`, [['hurt', 'a', 1]])]),
      safe(`Walk calmly the other way`, `They are heading to where the shot was.`, { time: -1 }),
    ],
  }),

  // ---------------- TURN ----------------

  // ---------------- TIMEOUT ----------------
  E('timeout', {
    cat: 'timeout', loc: '*', essential: true, title: `Overrun`, major: true,
    text: [`A sound rolls through the valley like the sea: thousands of feet. The great horde has reached this part of the forest. The trees are full of them in every direction. There is no more time to reach the station.`],
    scene: { z: 6, light: 'night' }, cast: ['a', 'b?'], say: [['a', `"We are out of time."`], ['b', `"Then we make our own way out."`, 'Leader']],
    choices: [
      C(`Raft down the river`, `Water is the only way they cannot follow.`, [O(0.4, 'good', `A raft of logs and rope, a wild ride downstream, and the forest falls away behind.`, [['flag', 'river_escape']]), O(0.6, 'bad', `The river is too fast. The raft breaks up. Everyone scrambles back to the bank.`, [['flag', 'overrun']])]),
      C(`Build a signal fire`, `Someone might see the smoke.`, [O(0.35, 'good', `The smoke rises. Hours later, a firefighting plane circles, and a helicopter follows.`, [['flag', 'fire_rescue']]), O(0.65, 'bad', `The fire burns. Nobody comes but the horde.`, [['flag', 'overrun']])]),
      C(`Keep pushing for the station`, `Maybe the horde has a gap.`, [O(1, 'bad', `There is no gap. {Team} is forced back again and again.`, [['flag', 'overrun']])]),
      C(`Climb high and wait it out`, `Find the tallest tree.`, [O(1, 'bad', `Days in a tree. Then weeks in the forest.`, [['flag', 'overrun']])]),
      C(`Split up to find a way out`, `Cover more ground.`, [O(0.25, 'good', `One group finds a farm truck on a fire road and comes back for the others.`, [['flag', 'river_escape']]), O(0.6, 'bad', `Nobody finds a way out.`, [['flag', 'overrun']]), O(0.15, 'death', `Not everyone comes back. {r} is never seen again.`, [['kill', 'r', 'went missing searching for a way out of the forest'], ['flag', 'overrun']])]),
      C(`Seal yourselves in the bunker`, `It was built for exactly this.`, [O(1, 'good', `The steel door closes. Food, water, air filters. Safe. For as long as it takes.`, [['flag', 'bunker_haven']])], { req: { flags: ['knows_bunker'] } }),
      C(`Fire the flare gun straight up`, `The helicopter might still be looking.`, [O(0.7, 'good', `The flare bursts orange over the trees. Rotor blades answer within the hour.`, [['flag', 'fire_rescue']]), O(0.3, 'bad', `Nobody answers.`, [['flag', 'overrun']])], { req: { items: ['flare_gun'] } }),
    ],
  }),

  // ---------------- FINALE ----------------
  E('fin_approach', {
    cat: 'finale', loc: 'station', essential: true, repeat: true, title: `The Ranger Station`, major: true,
    text: [`Through the trees: the Emergency Ranger Station. A squat green building with a tall radio mast, a red light on top, blinking weakly. A generator shed out back. And between {team} and the door, a crowd of infected rangers in uniform, guarding it like they never stopped working.`],
    scene: { z: 4, light: 'dusk' }, cast: ['a', 'b?'], say: [['a', `"This is it. Get inside, power the beacon, and we go home."`], ['b', `"They are still wearing their name badges."`, 'Kind'], ['b', `"Final boss: angry rangers. Of course."`, 'Gamer']],
    choices: [
      C(`Charge the door together`, `All at once.`, [O(0.55, 'good', `A sprint, a shove, and the door slams shut behind {team}.`), O(0.35, 'hurt', `They make it inside, but {r} is clawed on the way.`, [['hurt', 'r', 1]]), O(0.1, 'death', `So close. {r} is pulled down on the steps.`, [['bite', 'r']])]),
      C(`Sneak round to the back door`, `Quiet and careful.`, [O(0.7, 'good', `The back door is unlocked. They never even turn round.`), O(0.3, 'hurt', `A dog chain rattles. They turn. {r} is hurt getting inside.`, [['hurt', 'r', 1]])]),
      C(`Use the keycard on the side door`, `Ranger access.`, [O(1, 'good', `Beep. Click. The side door opens straight into the control room.`)], { req: { items: ['keycard'] } }),
      C(`{a} draws them away`, `One leads them off so the others get in.`, [O(0.4, 'good', `{a} shouts and runs. They follow. Then {a} loops back through the trees and dives in the window. Legendary.`, [['hero']]), O(0.6, 'death', `{a} leads them off into the forest. The others get inside. {a} does not come back.`, [['kill', 'a', 'drew the infected rangers away from the station so the others could reach the beacon', 'hero']])], { req: { minAlive: 2 }, major: true }),
      C(`Wait for them to move`, `Hide and watch.`, [O(0.6, 'good', `As the sun sets, they wander into the trees. The door is clear.`, [['time', -1]]), O(0.4, 'hurt', `While waiting, {team} is found. {r} is hurt in the dash for the door.`, [['hurt', 'r', 1]])]),
      C(`Climb the radio mast to the roof hatch`, `Up and in from above.`, [O(0.55, 'good', `Up the mast, through the roof hatch, and down into the control room.`), O(0.35, 'hurt', `{r} slips on the mast rungs and falls onto the roof.`, [['hurt', 'r', 1]]), O(0.1, 'death', `{r} falls from the mast.`, [['kill', 'r', 'fell from the radio mast at the ranger station']])]),
      C(`Throw rocks at the generator shed to make noise`, `Draw them round the back.`, [O(0.6, 'good', `Clang! They shuffle round to the shed. {Team} runs for the front door.`), O(0.4, 'hurt', `Half of them go to the shed. The other half come for {team}. {r} is hurt in the dash.`, [['hurt', 'r', 1]])]),
    ],
    uses: {
      gun: U(`Every shot counts. {Team} fights a path to the door and slams it shut behind them.`, [['hero']]),
      signal: U(`The flare streaks over their heads into the forest. They turn after it, and {team} runs for the door.`, []),
      spray: U(`A wall of bear spray. The infected rangers stagger and choke, and {team} bursts through the door.`, []),
      noise: U(`A shrill whistle from the far side of the clearing. They turn. {Team} runs the other way, straight in.`, [], { consume: 0 }),
    },
  }),
  E('fin_beacon', {
    cat: 'finale', loc: 'station', essential: true, repeat: true, title: `The Beacon`, major: true, maxCond: 3,
    text: [`Inside the control room: a dusty console with a big red switch marked RESCUE BEACON. A warning light reads NO POWER. A fuse slot in a grey box hangs open and empty. Through the window, the generator shed. Outside, fists are already hammering on the door.`],
    scene: { bg: 'ranger', light: 'night', z: 3 }, cast: ['t?=@infected', 'a', 'b?'], say: [['a', `"Power. We need power. Now."`], ['b', `"Fuse goes in the box. Or fuel in the generator. Either one."`, 'Engineer']],
    choices: [
      C(`Let {npc} power the beacon while you hold the door`, `{npc} offers to run out to the generator shed.`, [{ p: 0.7, k: 'good', t: `{npc} sprints to the shed and rigs the old generator. The beacon roars to life. "Told you I'd get it going!"`, fx: [['flag','reached']], loyalty: 'loyal'}, { p: 0.3, k: 'good', t: `{npc} gets the generator running, then holds the shed door shut against the horde so {team} can reach the helicopter. {npc} never makes it out.`, fx: [['flag','reached'],['npcdie','held the generator shed so the beacon could call the helicopter']], loyalty: 'loyal'}, { p: 0.55, k: 'good', t: `It takes {npc} three tries and a lot of swearing, but the generator catches. The beacon pulses.`, fx: [['flag','reached']], loyalty: 'ordinary'}, { p: 0.45, k: 'bad', t: `{npc} cannot get the generator started. {Team} barricades in and waits for dawn.`, fx: [['flag','overrun']], loyalty: 'ordinary'}, { p: 1, k: 'bad', t: `{npc} powers the beacon, walks out to the helicopter when it lands, and tells the pilot everyone else is infected. The helicopter lifts off with one passenger.`, fx: [['flag','betrayed']], loyalty: 'traitor'}], { req: { companion: true, companionHuman: true } }),
      C(`Look for Wade`, `Where did he go?`, [O(1, 'bad', `Wade is already at the beacon, the fuse in his hand. He powers it up, then locks the door to the helipad behind him. "Sorry. One seat."`, [['flag', 'betrayed']])], { req: { flags: ['wade_deal'] } }),
      C(`Fit the beacon fuse`, `Slot the spare fuse into the grey box.`, [O(1, 'good', `The fuse clicks home. Lights flicker on. {a} slams the red switch. Far above, the beacon begins to pulse. Within the hour: rotor blades.`, [['use', 'fuse'], ['flag', 'reached']])], { req: { items: ['fuse'] } }),
      C(`Fuel the generator`, `Run out to the shed with the jerrycan.`, [O(0.8, 'good', `A dash to the shed, a glug of petrol, a pull of the cord. The generator roars. The beacon lights up. Rescue is coming.`, [['use', 'fuel'], ['flag', 'reached']]), O(0.2, 'death', `The generator roars into life and the beacon lights. But {r} is caught outside on the way back.`, [['use', 'fuel'], ['flag', 'reached'], ['bite', 'r']])], { req: { items: ['fuel'] } }),
      C(`Hotwire the beacon from the battery bank`, `It might be possible to bypass the fuse.`, [O(0.55, 'good', `Sparks fly. The beacon light flickers, then holds. It worked!`, [['flag', 'reached']]), O(0.45, 'hurt', `A shower of sparks throws {r} across the room. The beacon stays dead. But the radio works: "Copy, station. Sending a team at dawn."`, [['hurt', 'r', 1], ['flag', 'fire_rescue']])]),
      C(`Light a signal fire on the roof`, `Old school. Smoke and flames.`, [O(0.5, 'good', `The fire on the roof blazes into the night sky. A helicopter sees it within the hour.`, [['flag', 'fire_rescue']]), O(0.5, 'bad', `The fire is seen, by the horde. They pour into the clearing. {Team} barricades in and waits for dawn.`, [['flag', 'overrun']])]),
      C(`Use the station radio to call for help`, `Talk to rescue directly.`, [O(0.6, 'good', `"Station, we read you. Hold on. Helicopter inbound." A human voice has never sounded so good.`, [['flag', 'fire_rescue']]), O(0.4, 'bad', `The radio is dead without power. Nothing.`, [['flag', 'overrun']])]),
      C(`Search the station for spare parts`, `There might be a spare fuse in a drawer somewhere.`, [O(0.5, 'good', `In the bottom drawer of the ranger's desk: a spare fuse, still in its packet. Click. Switch. The beacon pulses. Rescue is coming.`, [['flag', 'reached']]), O(0.3, 'bad', `Drawers, cupboards, lockers. Nothing. The door is starting to give. {Team} barricades in for the night.`, [['flag', 'overrun']]), O(0.2, 'hurt', `Nothing in the drawers, and the door gives way. {r} is hurt holding it shut until dawn, when a rescue team finally arrives on foot.`, [['hurt', 'r', 1], ['flag', 'fire_rescue']])]),
      C(`Barricade and hold until morning`, `Hope someone comes.`, [O(0.4, 'good', `At dawn, a rescue team arrives on foot, following the noise. Somebody was looking after all.`, [['flag', 'fire_rescue']]), O(0.6, 'bad', `Dawn comes. Nobody else does.`, [['flag', 'overrun']])]),
      C(`Tell the others about {t}'s bite`, `The helicopter crew will check everyone.`, [O(1, 'neutral', `{t} nods, and quietly steps out into the night, closing the door behind them. "Get the beacon on," they say through the glass. "Go home."`, [['kill', 't', 'stepped outside the ranger station so the infection would not reach the rescue helicopter', 'hero'], ['next', 'dwf_fin_beacon']])], { req: { infected: true }, major: true }),
      C(`Hand the bunker files to the rescue crew`, `When they arrive, they need to know where it started.`, [O(1, 'good', `The beacon is jury-rigged to life just long enough. When the helicopter lands, {a} pushes the files into the pilot's hands. Her face goes pale.`, [['flag', 'reached'], ['flag', 'gave_files']])], { req: { items: ['files'], anyItems: ['fuse', 'fuel'] } }),
    ],
  }),

  // ---------------- FILLER ----------------
  E('filler', {
    cat: 'chain', loc: '*', essential: true, repeat: true, title: `Quiet Trees`,
    text: [`For a while, the forest is quiet. Wind in the pines. Birds, even. {Team} keeps moving east.`],
    cast: ['a'], say: [],
    choices: [
      safe(`Keep walking`, `Steady pace.`),
      search(`Forage along the way`, `Berries, mushrooms, anything.`, { item: 0.5, hurt: 0.08 }),
      rush(`Jog to make up time`, `Push hard.`, { hurt: 0.08, danger: 0.08 }),
      C(`Rest for a moment`, `Catch your breath.`, [O(1, 'good', `A short rest on a mossy log.`, [['heal', 'injured', 1], ['time', -1]])]),
      safe(`Stay off the path`, `Slow but hidden.`, { time: -1 }),
    ],
  }),
];

const T = travelTables({
  lowOk: [`A long, quiet walk through the trees. Nothing stirs.`, `The detour is slow but peaceful.`, `Birdsong, of all things. The long way round is completely calm.`, `Mossy paths and fallen leaves. Not a single groan the whole way.`, `A slow, winding trail, but it feels almost like a normal hike.`, `Deer tracks and a babbling stream. Nothing else.`, `The quiet route takes forever, but it stays quiet.`, `Squirrels chatter overhead. For once, that is the only sound.`],
  medOk: [`{Team} reaches {loc} without trouble.`, `A tense hike, but everyone makes it.`, `Twice the bracken rustles. Twice it is just the wind. Then {loc}.`, `Crows circle somewhere to the north as {team} reaches {loc}.`, `The trail is muddy and steep, but nobody falls.`, `Something howls far away. {Team} walks a little faster to {loc}.`, `Branches snap in the distance. Nothing comes closer.`, `Fog rolls in and out. {Team} reaches {loc} in one piece.`],
  highOk: [`A fast, risky push through rough ground, and it pays off.`, `{Team} covers the ground quickly.`, `Crashing straight downhill through the ferns. Fast, loud, and it works.`, `A sprint across open ground before anything notices.`, `Scrambling over rocks and roots, {team} saves a lot of time.`, `Ducking branches at full speed. Nothing keeps up.`, `A wild dash through the trees, and {team} arrives well ahead of the horde.`, `Reckless and muddy, but very fast.`],
  hurt: [`On the way, {r} trips on a root and falls hard.`, `{r} slides down a muddy bank on the way.`, `A branch whips back into {r}'s face.`, `{r} steps into a hidden hole and wrenches a knee.`, `Brambles tear at {r}'s arms all the way down the slope.`, `{r} slips on wet rock and lands on one hip.`],
  danger: [`Halfway there, an infected lurches out from behind a trunk at {r}!`, `On the way, something bursts from the bracken at {r}!`, `A shape drops out of a low tree right next to {r}!`, `Something was lying in the stream. It rises as {r} crosses.`, `An infected camper staggers out of a tent at {r}!`],
});

export default addComedy({
  words: { z: 'zombie', zs: 'zombies', goal: 'the beacon', place: 'forest', critter: 'crow' },
  id: A, title: `Deadwood Forest`, short: `Forest`,
  tagline: `A camping trip. A dead forest. One way out.`,
  premise: `A peaceful camping trip turns into a nightmare when the group discovers the surrounding forest is infected. The great horde is sweeping through the valley, and the only way to call for rescue is the emergency beacon at the ranger station.`,
  objective: `Reach the emergency ranger station and activate its rescue beacon before the forest is overrun.`,
  card: 'campsite', colour: '#6ab04c',
  clock: { start: 62, unit: 10, label: `Forest overrun in` },
  zones: [['campsite'], ['lake', 'trail', 'cabins'], ['river', 'ridge', 'swamp'], ['cave', 'mine', 'outpost'], ['gorge', 'road', 'bunker'], ['lookout', 'meadow', 'lumber']],
  zoneQuota: [[2, 3], [3, 5], [3, 5], [3, 5], [3, 5], [3, 4]],
  targetStages: 32, maxStages: 40,
  finale: [`${A}_fin_approach`, `${A}_fin_beacon`], finaleLoc: 'station',
  emergencies: [`${A}_em_lunge`, `${A}_em_grab`, `${A}_em_surround`],
  turnEvent: `${A}_inf_turned`, revealEvent: `${A}_inf_reveal`, cureItem: 'antidote', timeoutEvent: `${A}_timeout`, fillerEvent: `${A}_filler`,
  startKit: { easy: [['hatchet'], ['rifle', 2], ['first_aid'], ['bandages', 2], ['flashlight']], medium: [['bandages', 1], ['trail_mix', 1]], hard: [] },
  npcs: {
    pemberton: { name: `Pemberton`, traitor: 0.08, loyal: 0.6, hair: '#9b9aa3', hat: 'wide', hatC: '#8a7a4a', shirt: '#8a7a4a', legs: '#5c4b3b' },
    wade: { name: `Wade`, traitor: 0.45, loyal: 0.25, skin: '#dc9c6e', hair: '#3b2417', hat: 'cap', hatC: '#f77f00', shirt: '#5b6b2f', legs: '#3d4f22', beard: '#3b2417' },
    hazel: { name: `Hazel`, traitor: 0.06, loyal: 0.7, skin: '#f8cba6', hair: '#d9d9e3', style: 'long', shirt: '#3a7d44', legs: '#5c4b3b' },
    dale: { name: `Ranger Dale`, traitor: 0.05, loyal: 0.75, skin: '#905631', hair: '#1c1b20', hat: 'wide', hatC: '#7f5539', shirt: '#6b705c', legs: '#4a4e3a' },
    camper: { name: `the camper`, traitor: 0.25, loyal: 0.35, hair: '#e8c35a', shirt: '#c0392b', legs: '#2b2d42' },
    hiker: { name: `the hiker`, traitor: 0.2, loyal: 0.4, skin: '#734125', hair: '#1c1b20', shirt: '#2e5fa8', legs: '#5c4b3b' },
    joan: { name: `Joan`, traitor: 0.04, loyal: 0.7, skin: '#f8cba6', hair: '#ecebf2', style: 'bun', shirt: '#7d4cc9', legs: '#2b2d42' },
    rambler: { name: `the rambler`, traitor: 0.1, loyal: 0.5, skin: '#eeb48b', hair: '#9b9aa3', hat: 'wide', hatC: '#7d4cc9', shirt: '#7d4cc9', legs: '#2b2d42' },
  },
  items, locations, events: [...events, ...companionEvents(A), ...infectionEvents(A, { weaponWord: 'a hatchet or rifle' }), ...roleEvents(A, { weapon: 'hatchet', medical: 'bandages', light: 'flashlight', junk: 'camping gear' })], defaultLoot: ['bandages', 'trail_mix', 'berries', 'batteries'],
  travelText: [`{loc} is behind {team} now. Three ways lead on toward the ranger station. {clock} until the forest is overrun.`, `Time to leave {loc}. Which way now? The horde reaches this valley in {clock}.`, `The trees are thinning. Three paths onward from {loc}, and {clock} before the horde arrives.`, `Somewhere behind, thousands of feet are moving. {clock} left. Which path from {loc}?`, `The radio mast is still a long way east. {clock} on the clock. Pick a path.`],
  travelSay: [['a', [`"Which way? Quickly."`, `"Pick a path. We cannot stay."`, `"East. Which way is east?"`]]],
  travelOutcomes: T,
  restChoice: { l: `Rest and patch up first`, d: `Heal one injury, but lose time. You will choose the path after.`, o: [O(0.85, 'good', [`A short rest in a hollow. Wounds are cleaned and bound.`, `Everyone sits on a fallen log. Water, bandages, a few deep breaths.`, `A pause under a rock overhang. The worst scratches are washed in a stream.`, `A quiet glade, ten minutes, and fresh bandages all round.`, `A rest in a ruined shepherd's hut. Wounds are cleaned with boiled water.`, `Backs against a huge oak, {team} patches each other up.`], [['heal', 'injured', 1], ['time', -2]]), O(0.15, 'danger', [`The rest is interrupted. Something finds {r}!`, `Just as everyone sits down, the bracken parts beside {r}!`, `The quiet does not last. Something has followed {team} through the trees, and it goes for {r}!`], [['em', 'r'], ['time', -1]])] },
  scavengeChoice: { l: `Search {loc} one more time`, d: `One more look around before moving on. Costs time.`, o: [O(0.6, 'item', [`One last search turns up {loot}.`, `A final look round pays off: {loot}.`, `Under a mossy stone: {loot}.`, `Someone checks a hollow tree one more time. {loot}.`, `On the way out, {r} spots {loot} in the undergrowth.`], [['loot'], ['time', -1]]), O(0.4, 'neutral', [`Nothing more to find.`, `A second search turns up only pinecones.`, `Still nothing. Time to go.`, `Nothing but mud and leaves.`, `Nothing new. The forest keeps its secrets.`], [['time', -1]])] },
  quips: { ...GENERIC_QUIPS, Any: [...GENERIC_QUIPS.Any, `"Remind me never to go camping again. Ever."`, `"I think something just touched my leg. It was a fern. It was definitely a fern."`] },
  deathLines: GENERIC_DEATH_LINES,
  endings: [
    { id: 'total', title: `Swallowed by the Forest`, cat: 'Total team death', objective: false, when: (c) => c.none, text: `Nobody made it out of Deadwood Forest. Months later, a ranger found a trail map with a route drawn in pen, and the names {fallen} written in the margin.` },
    { id: 'betrayal', title: `One Seat`, cat: 'Betrayal', objective: false, when: (c) => c.flag('betrayed'), text: `Wade powered the beacon and took the only helicopter out. {survivors} watched it leave from the station window. They survived the night. Wade's name became a curse word in every rescue camp.` },
    { id: 'infected', title: `Passenger`, cat: 'Infection', objective: true, when: (c) => c.reached && c.infected, text: `The helicopter lifted {survivors} out of the forest. Somebody aboard was hiding a scratch. The pilot noticed first, somewhere over the lake.` },
    { id: 'secret', title: `Project Deadwood`, cat: 'Secret discovery', objective: true, when: (c) => c.reached && c.flag('gave_files'), text: `The Project Deadwood files reached the authorities. The bunker was sealed, the scientists were found, and the outbreak was traced to its source. {survivors} did not just escape. They ended it.` },
    { id: 'solo', title: `Lone Survivor`, cat: 'Complete rescue', objective: true, when: (c) => c.reached && c.total === 1, text: `{survivors} lit the beacon alone and walked out to the helicopter like it was nothing. It was not nothing.` },
    { id: 'complete', title: `Complete Rescue`, cat: 'Complete rescue', objective: true, when: (c) => c.reached && c.all, text: `The beacon pulsed red over the trees, and the helicopter came. {survivors} climbed aboard together, muddy, scratched and alive. Every single one of them.` },
    { id: 'sacrifice', title: `The One Who Stayed Behind`, cat: 'Heroic sacrifice', objective: true, when: (c) => c.reached && c.sacrifice, text: `The beacon called the helicopter because someone made sure the others got there. {survivors} flew home. {fallen} stayed in the forest forever.` },
    { id: 'last', title: `Last One Standing`, cat: 'Last survivor', objective: true, when: (c) => c.reached && c.alive === 1 && c.total > 1, text: `{survivors} pulled the switch alone, and the helicopter came for one. They still dream about the forest, and about {fallen}.` },
    { id: 'partial', title: `Partial Rescue`, cat: 'Partial rescue', objective: true, when: (c) => c.reached, text: `The beacon worked. The helicopter came. {survivors} climbed aboard and looked down at the dark trees where {fallen} were left behind.` },
    { id: 'fire', title: `Smoke Signals`, cat: 'Unexpected rescue', objective: false, when: (c) => c.flag('fire_rescue'), text: `The beacon never lit, but someone saw the signal anyway. A rescue crew reached {survivors} at dawn and flew them out over the burning valley.` },
    { id: 'river', title: `Down the Blackwater`, cat: 'Alternative escape', objective: false, when: (c) => c.flag('river_escape'), text: `They never reached the beacon. Instead, {survivors} rode the Blackwater River out of the forest and walked into a farming village two days later, soaked and starving and alive.` },
    { id: 'bunker', title: `Below Ground`, cat: 'Alternative safe haven', objective: false, when: (c) => c.flag('bunker_haven'), text: `{survivors} sealed themselves inside the Project Deadwood bunker. Air, water and food for a year. Outside, the forest belongs to the dead. Inside, they wait.` },
    { id: 'overrun', title: `Overrun`, cat: 'Failed rescue', objective: false, when: (c) => c.timeout || c.flag('overrun'), text: `The forest was overrun before the beacon could call for help. {survivors} are still out there among the trees, moving from hiding place to hiding place.` },
    { id: 'lost', title: `Lost in the Trees`, cat: 'Tragic ending', objective: false, when: () => true, text: `The journey ended before the ranger station. {survivors} remain somewhere in the forest.` },
  ],
});

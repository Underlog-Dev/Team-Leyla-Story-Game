// ADVENTURE 1: LAST TRAIN OUT — zombie-infested city, reach Stonebridge Station.
import { O, C, U, search, safe, rush, travelTables, GENERIC_QUIPS, GENERIC_DEATH_LINES, companionEvents, companionRescue } from './kit.js';

const A = 'lto';
const E = (id, o) => ({ id: `${A}_${id}`, ...o });

const items = {
  flashlight: { name: `Flashlight`, icon: 'torch', desc: `A heavy-duty torch. Each use drains the battery.`, tags: ['light'], qty: 3, max: 6 },
  batteries: { name: `Batteries`, icon: 'battery', desc: `Recharges a flashlight (+3 uses). Use it from the backpack any time.`, anytime: 'recharge', target: 'flashlight', amount: 3, qty: 1, max: 4 },
  first_aid: { name: `First Aid Kit`, icon: 'medkit', desc: `Restores 2 health to your most injured survivor. Use any time.`, tags: ['medical'], anytime: 'heal', heal: 2, qty: 1, max: 3 },
  bandages: { name: `Bandages`, icon: 'bandage', desc: `Restores 1 health to your most injured survivor. Use any time.`, tags: ['medical'], anytime: 'heal', heal: 1, qty: 2, max: 6 },
  energy_drink: { name: `Energy Drink`, icon: 'can', desc: `Restores 1 health. Tastes like batteries and regret.`, tags: ['drink'], anytime: 'heal', heal: 1, qty: 1, max: 4 },
  crowbar: { name: `Crowbar`, icon: 'crowbar', desc: `Pries doors open and hits hard. It will bend after a few uses.`, tags: ['melee', 'tool'], qty: 3, max: 3, unique: true },
  axe: { name: `Fire Axe`, icon: 'axe', desc: `Red, heavy and reassuring. Good for doors and worse things.`, tags: ['melee', 'tool'], qty: 4, max: 4, unique: true },
  pistol: { name: `Pistol`, icon: 'gun', desc: `A police pistol. Quantity is rounds left. Gunshots carry for streets.`, tags: ['gun'], qty: 3, max: 9 },
  flare: { name: `Road Flare`, icon: 'flare', desc: `Burns bright red and hisses loudly. Light, noise and a signal in one.`, tags: ['noise', 'light', 'signal'], qty: 1, max: 3 },
  firecrackers: { name: `Firecrackers`, icon: 'firework', desc: `A strip of bangers. Extremely loud, extremely distracting.`, tags: ['noise'], qty: 1, max: 3 },
  radio: { name: `Walkie-Talkie`, icon: 'radio', desc: `Tuned to a crackling military channel. Might reach someone.`, tags: ['radio', 'signal'], qty: 1, max: 1, unique: true },
  map: { name: `City Map`, icon: 'map', desc: `A tourist map with the Underground lines marked in biro.`, tags: ['map'], qty: 1, max: 1, unique: true },
  tinned_food: { name: `Tinned Peaches`, icon: 'food', desc: `Sweet, sticky and good for morale. Animals love them too.`, tags: ['food'], qty: 1, max: 5 },
  rope: { name: `Rope`, icon: 'rope', desc: `Twenty metres of blue climbing rope.`, tags: ['rope'], qty: 1, max: 1, unique: true },
  tunnel_key: { name: `Maintenance Key`, icon: 'key', desc: `Opens Underground service doors. Stamped "SB LINE".`, tags: ['key'], qty: 1, max: 1, unique: true },
  pass: { name: `Military Pass`, icon: 'card', desc: `An evacuation priority pass. Soldiers wave pass holders through.`, tags: ['pass'], qty: 1, max: 1, unique: true },
  serum: { name: `Experimental Serum`, icon: 'syringe', desc: `An unlabelled antiviral from the hospital lab. One dose. Use it from the backpack.`, tags: ['cure'], anytime: 'cure', qty: 1, max: 1, unique: true },
  research: { name: `Research Drive`, icon: 'drive', desc: `Dr Okafor's outbreak research on a battered USB drive. Somebody important will want this.`, tags: ['secret'], qty: 1, max: 1, unique: true },
  boat_keys: { name: `Narrowboat Keys`, icon: 'key', desc: `Keys on a cork keyring that says "BESSIE".`, tags: ['key', 'boat'], qty: 1, max: 1, unique: true },
};

const L = (name, scene, loot, travel, extra = {}) => ({ name, scene, loot, travel, ...extra });
const locations = {
  apartment: L(`Riverside Apartments`, 'apartment', ['flashlight', 'bandages', 'tinned_food', 'batteries', 'map']),
  kingsway: L(`Kingsway`, 'street', ['flare', 'bandages', 'energy_drink', 'crowbar'], { l: `Walk straight down Kingsway`, d: `The main road. Fast and direct, but wide open and very visible.`, risk: 'high' }),
  pricemart: L(`Price-Mart Supermarket`, 'supermarket', ['tinned_food', 'energy_drink', 'batteries', 'flashlight', 'first_aid'], { l: `Cut through Price-Mart`, d: `A supermarket full of supplies, and whatever is lurking in the aisles.`, risk: 'med' }),
  depot: L(`Wexford Bus Depot`, 'depot', ['crowbar', 'flare', 'rope', 'batteries'], { l: `Take the long way via the bus depot`, d: `A slow detour through rows of parked buses. Quiet, but it costs time.`, risk: 'low' }),
  hospital: L(`St Agnes Hospital`, 'hospital', ['first_aid', 'bandages', 'flashlight', 'energy_drink'], { l: `Head for St Agnes Hospital`, d: `Medical supplies, if the place is not overrun. It probably is.`, risk: 'med' }),
  police: L(`Ashford Police Station`, 'police', ['pistol', 'radio', 'flashlight', 'flare', 'bandages'], { l: `Make for Ashford Police Station`, d: `Weapons and radios, maybe. A fortress, or a trap.`, risk: 'med' }),
  alleys: L(`The Back Alleys`, 'alley', ['crowbar', 'energy_drink', 'firecrackers', 'rope'], { l: `Slip through the back alleys`, d: `A tangle of narrow shortcuts. Fast, but nowhere to run.`, risk: 'high' }),
  warehouse: L(`Docklands Warehouse`, 'warehouse', ['crowbar', 'rope', 'flare', 'axe', 'batteries'], { l: `Cross the docklands warehouses`, d: `Huge, echoing sheds full of crates. Plenty of places to hide.`, risk: 'med' }),
  tower: L(`Marlow Tower`, 'apartment', ['tinned_food', 'first_aid', 'firecrackers', 'radio'], { l: `Climb through Marlow Tower`, d: `A tower block with a skybridge. Slow stairs, but safe height.`, risk: 'low' }, { light: 'dim' }),
  mall: L(`The Galleria`, 'mall', ['energy_drink', 'firecrackers', 'flashlight', 'first_aid'], { l: `Run through the Galleria shopping centre`, d: `Glass, escalators, and a lot of open floor.`, risk: 'high' }),
  tunnels: L(`Underground Tunnels`, 'tunnel', ['flashlight', 'batteries', 'tunnel_key', 'flare'], { l: `Go underground on the tube line`, d: `The line runs almost straight to Stonebridge. Pitch dark and full of echoes.`, risk: 'high', time: 1 }),
  canal: L(`Canal Towpath`, 'canal', ['boat_keys', 'rope', 'tinned_food', 'bandages'], { l: `Follow the canal towpath`, d: `Quiet water and narrowboats. It winds a lot, so it is slower.`, risk: 'low' }),
  flyover: L(`The Flyover`, 'motorway', ['first_aid', 'flare', 'energy_drink', 'axe'], { l: `Climb up onto the flyover`, d: `The elevated motorway. Gridlocked cars, but a clear view ahead.`, risk: 'med' }),
  railyard: L(`Stonebridge Rail Yard`, 'railyard', ['crowbar', 'flare', 'batteries', 'bandages'], { l: `Sneak through the rail yard`, d: `Freight wagons and signal boxes right behind the station.`, risk: 'med' }),
  checkpoint: L(`Abandoned Checkpoint`, 'checkpoint', ['pistol', 'first_aid', 'radio', 'flare'], { l: `Go through the old army checkpoint`, d: `The army fell back from here. They left in a hurry.`, risk: 'high' }),
  sewers: L(`Storm Drains`, 'sewer', ['flashlight', 'rope', 'bandages', 'batteries'], { l: `Wade through the storm drains`, d: `Disgusting, slow, and hidden from everything above.`, risk: 'low' }),
  station: L(`Stonebridge Station`, 'station', []),
};

const events = [
  // ---------------- OPENINGS ----------------
  E('open_sirens', {
    cat: 'opening', loc: 'apartment', essential: true, title: `The Sirens`,
    text: [`Air-raid sirens wail across the city. From the flat window, {team} watches smoke curl over the river. The radio repeats one message: the last evacuation train leaves Stonebridge Station tonight. Then someone starts banging on the door downstairs.`],
    cast: ['a', 'b?'], say: [['a', `"Grab what you can carry. We are not coming back here."`], ['b', `"Do we really have to go outside? Like, outside outside?"`, 'Nervous'], ['b', `"Bagsy the fire axe if we find one."`, 'Gamer']],
    choices: [
      search(`Search the flat for supplies`, `Turn the place upside down before leaving. Costs a little time.`, { item: 0.75, hurt: 0, t: { none: `Cupboards full of nothing but pasta and regret.` } }),
      C(`Check the banging downstairs`, `It could be a neighbour who needs help. It could be something else.`, [O(0.5, 'item', `It is Mrs Patel from flat 2, clutching a bag. She presses {loot} into {a}'s hands. "My grandson is coming for me. Go, go!"`, [['loot']]), O(0.3, 'danger', `The door splinters. It is not Mrs Patel. Not any more. It goes for {r}!`, [['em', 'r']]), O(0.2, 'neutral', `By the time {team} gets downstairs, the banging has stopped. The street door hangs open.`)]),
      safe(`Leave right now by the fire escape`, `No looting, no delays. Every minute counts.`, { time: 1, t: `{Team} clatters down the fire escape and drops into the courtyard. Time saved.` }),
      C(`Barricade the door and plan the route`, `Sit down with the old A-Z and work out the safest way.`, [O(0.6, 'item', `Under a pile of takeaway menus, {a} finds {loot}. A plan starts to form.`, [['item', 'map'], ['time', -1]]), O(0.4, 'neutral', `Twenty minutes of arguing over street names. At least everyone agrees on the direction.`, [['time', -1]])]),
      search(`Raid the empty flat across the hall`, `The neighbours left in a hurry. Their door is half open.`, { item: 0.6, hurt: 0.15, t: { hurt: `{r} trips over a robot vacuum that is still bravely cleaning. Ow.` } }),
    ],
  }),
  E('open_tv', {
    cat: 'opening', loc: 'apartment', essential: true, title: `Final Broadcast`,
    text: [`The TV flickers: EVACUATION — STONEBRIDGE STATION — FINAL TRAIN. Then the picture dies. In the kitchen, {a} is calmly stuffing crisps into a pillowcase. Outside, a car alarm screams and then stops very suddenly.`],
    cast: ['a', 'b?'], say: [['a', `"What? Salt and vinegar is a survival food."`], ['b', `"We are going to die and you are packing snacks."`, 'Sarcastic'], ['b', `"Actually, salt is good for keeping energy up."`, 'Practical']],
    choices: [
      search(`Pack the essentials properly`, `Torch, plasters, water. A real survival kit.`, { item: 0.7, hurt: 0, t: { item: `{a} abandons the crisps and finds {loot} instead. Progress.` } }),
      C(`Check the rooftop for a view of the route`, `See which streets are clear before going down into them.`, [O(0.55, 'good', `From the roof, the route is clear: smoke to the east, a clear stretch to the west. {Team} picks the quiet way.`, [['time', 1]]), O(0.25, 'danger', `A figure is already on the roof, swaying by the water tank. It turns toward {r}.`, [['em', 'r']]), O(0.2, 'neutral', `Too much smoke to see anything. Just the distant thud of helicopters.`)]),
      C(`Knock on doors to see who else is going`, `Strength in numbers. Or more mouths to feed.`, [O(0.4, 'item', `Old Mr Davies in 4B is staying put, but gives {team} {loot}. "Make it to that train."`, [['loot'], ['time', -1]]), O(0.3, 'danger', `Flat 6 is not empty. Something inside slams against the door and it gives way toward {r}!`, [['em', 'r']]), O(0.3, 'neutral', `Silence behind every door. Everyone else has already gone.`, [['time', -1]])]),
      safe(`Go now. No time to waste.`, `Leave with nothing but a head start.`, { time: 1, t: `{Team} is out the door in thirty seconds. The street smells of smoke and diesel.` }),
      C(`Cook a big breakfast first`, `Nobody survives an apocalypse on an empty stomach. Probably.`, [O(0.65, 'funny', `Eggs, beans and a mountain of toast. Morale is sky high. It also took ages.`, [['time', -2], ['funny'], ['item', 'tinned_food']]), O(0.35, 'danger', `The smoke alarm goes off. Shrieking. Something on the landing starts clawing at the door toward {r}.`, [['em', 'r'], ['funny']])]),
    ],
  }),
  E('open_glass', {
    cat: 'opening', loc: 'apartment', essential: true, title: `Breaking Glass`,
    text: [`Glass shatters somewhere below. Groans echo up the stairwell. The infected are inside Riverside Apartments, and the last evacuation train leaves Stonebridge tonight. {a} is already at the window, gauging the drop to the bins below.`],
    cast: ['a', 'b?'], say: [['a', `"It is either the stairs or the bins. I vote bins."`], ['b', `"I vote neither. Can I vote neither?"`, 'Nervous'], ['b', `"Stairs. We stay calm, we go quietly, we live."`, 'Leader']],
    choices: [
      rush(`Jump down onto the bins`, `Fastest way out. Hopefully the bin lids hold.`, { hurt: 0.22, danger: 0, time: 1, t: { hurt: `The bin lid does not hold. {r} lands badly in a cloud of rubbish.`, ok: `A perfect landing in a pile of bin bags. Disgusting, but very quick.` } }),
      search(`Sneak down the stairs, checking flats on the way`, `Quiet and thorough. Flats on the way down might have supplies.`, { item: 0.45, hurt: 0, danger: 0.15 }),
      safe(`Lock the door and wait for them to pass`, `Let the noise die down before moving. It will cost time.`, { time: -2, t: `An hour of holding breath. The groaning drifts away. The stairs are clear.` }),
      C(`Climb up to the roof and cross to the next block`, `Rooftops connect along the street.`, [O(0.6, 'good', `A short hop across the gap and {team} is two buildings away before the infected even reach the top floor.`, [['time', 1]]), O(0.25, 'hurt', `{r} misjudges the gap and slams into the far ledge, scraped and winded.`, [['hurt', 'r', 1]]), O(0.15, 'neutral', `The gap is too wide. Back down the long way.`, [['time', -1]])]),
      C(`Make a racket to draw them upstairs`, `Bang pots on the top landing, then slip down the other staircase.`, [O(0.55, 'funny', `{a} plays the saucepans like a drum solo. The infected shuffle upstairs. {Team} slips out the back to a standing ovation of nobody.`, [['funny']]), O(0.45, 'danger', `It works too well. Infected pour from every floor, and one cuts off {r} on the landing!`, [['em', 'r']])]),
    ],
  }),

  // ---------------- APARTMENT ----------------
  E('apt_lift', {
    cat: 'exploration', loc: 'apartment', title: `The Lift Shaft`,
    text: [`The lift doors on the ground floor are jammed half open. Inside, the car is stuck between floors, and something drips from it. A first aid sign is stencilled on a cupboard behind the caretaker's desk.`],
    cast: ['a'], say: [['a', `"I am not going near that lift. I have seen films."`]],
    choices: [
      search(`Search the caretaker's office`, `Keys, torches and first aid kits live in caretakers' offices.`, { item: 0.6, hurt: 0.08 }),
      C(`Pry the lift doors and look inside`, `Whoever was in that lift might have dropped something.`, [O(0.35, 'item', `A duffel bag sits on the lift roof. Inside is {loot}.`, [['loot']]), O(0.35, 'danger', `The lift car lurches. An arm shoots through the gap toward {r}!`, [['em', 'r']]), O(0.3, 'neutral', `Nothing but a lost shoe and a terrible smell.`)]),
      safe(`Leave through the bin store`, `Quiet back door, straight onto the side street.`, { t: `The bin store door squeals, but nothing follows. {Team} is out.` }),
      search(`Check the post room parcels`, `Hundreds of undelivered parcels. Someone ordered something useful, surely.`, { item: 0.5, hurt: 0, time: -1, t: { none: `Forty pairs of novelty socks. Nothing else.`, item: `Under a pile of novelty socks: {loot}.` } }),
      rush(`Sprint out the front door`, `Straight onto the main road while it is quiet.`, { hurt: 0.1, danger: 0.08 }),
    ],
  }),

  // ---------------- KINGSWAY ----------------
  E('kw_pileup', {
    cat: 'exploration', loc: 'kingsway', title: `The Pile-Up`,
    text: [`A dozen cars are crumpled together across all four lanes of Kingsway. Doors hang open. Some car alarms still blink. Somewhere inside the wreckage, a phone is ringing.`],
    cast: ['a', 'b?'], say: [['a', `"Someone left in a hurry. Their loss, our gain."`], ['b', `"Should we answer that phone? That is how horror films start."`, 'Funny']],
    choices: [
      search(`Search the cars one by one`, `Glove boxes, boots and back seats. Slow but thorough.`, { item: 0.6, hurt: 0.1, danger: 0.08, time: -1 }),
      C(`Answer the ringing phone`, `Someone is trying very hard to reach someone.`, [O(0.4, 'good', `A shaky voice: "Stonebridge is real. They are still loading. Use the side gate on Mill Lane." The line dies.`, [['flag', 'side_gate']]), O(0.35, 'funny', `It is a recorded message about car insurance. {a} hangs up with great dignity.`, [['funny']]), O(0.25, 'danger', `The phone is in the hand of something in the back seat. It lunges for {r}!`, [['em', 'r']])]),
      safe(`Weave through the gaps quietly`, `Do not touch anything. Just get past.`),
      C(`Check the ambulance at the back of the pile`, `Ambulances carry proper medical kit.`, [O(0.55, 'item', `The ambulance is empty except for {loot}, still in its bracket.`, [['item', 'first_aid']]), O(0.25, 'hurt', `The paramedic is still here, and still moving. {r} gets clawed escaping.`, [['hurt', 'r', 1]]), O(0.2, 'neutral', `Already stripped bare.`)]),
      rush(`Climb over the roofs of the cars`, `The fastest straight line, if nobody slips.`, { hurt: 0.2, danger: 0.05, t: { hurt: `{r} slides off a bonnet and lands on a wing mirror.` } }),
    ],
  }),
  E('kw_newsvan', {
    cat: 'exploration', loc: 'kingsway', title: `Breaking News`,
    text: [`A TV news van sits outside a café, its satellite dish still pointing at the sky. The engine is ticking over. The presenter's notes are scattered on the seat: "Stonebridge — final departure — military only beyond the bridge?"`],
    cast: ['a', 'b?'], say: [['b', `"If we survive this, I want to be on the news. As a hero. Wearing sunglasses."`, 'Funny'], ['a', `"The engine is still running. Somebody was just here."`]],
    choices: [
      C(`Drive the van a few streets`, `The engine is running. Wheels beat feet.`, [O(0.45, 'good', `{a} drives like a getaway driver for three glorious streets before the road is blocked. Time saved.`, [['time', 2]]), O(0.3, 'hurt', `The van clips a lamppost. Everyone is thrown forward; {r} cracks their head on the dashboard.`, [['hurt', 'r', 1], ['time', 1]]), O(0.25, 'danger', `The horn jams on. Infected stream out of every doorway, and one hauls at {r}'s door!`, [['em', 'r']])]),
      search(`Search the van and the camera gear`, `News crews carry torches, batteries and first aid.`, { item: 0.6, hurt: 0.05 }),
      C(`Use the broadcast radio inside`, `The van has a proper transmitter. Maybe someone is listening.`, [O(0.5, 'good', `A military voice replies: "Copy. Stonebridge side gate is open to civilians. Mill Lane." {Team} memorises it.`, [['flag', 'side_gate'], ['time', -1]]), O(0.5, 'neutral', `Static. Then a looping message about staying indoors.`, [['time', -1]])]),
      safe(`Leave it and keep walking`, `Running engines attract attention. Move on.`),
      C(`Check the café behind it`, `The van crew might have been holed up inside.`, [O(0.4, 'item', `Behind the counter: {loot}, and a still-warm teapot.`, [['loot']]), O(0.3, 'funny', `{a} makes everyone a takeaway coffee. Barista skills are not lost on the apocalypse.`, [['funny'], ['time', -1]]), O(0.3, 'danger', `The crew are in the café. They are not crew any more. One staggers at {r}.`, [['em', 'r']])]),
    ],
  }),

  // ---------------- PRICE-MART ----------------
  E('pm_aisles', {
    cat: 'exploration', loc: 'pricemart', title: `Aisle Seven`,
    text: [`Price-Mart's lights flicker. Trolleys lie on their sides. A sign still promises "3 for 2 on tinned fruit". From the frozen aisle comes a slow, wet shuffling.`],
    cast: ['a', 'b?:Foodie'], say: [['b', `"Three for two. Even now. Respect."`, 'Foodie'], ['a', `"We take only what we need. Then we go."`, 'Leader']],
    choices: [
      search(`Split up and sweep every aisle`, `Cover the whole shop fast. Nobody is watching each other's back.`, { item: 0.7, hurt: 0.05, danger: 0.18, time: -1 }),
      search(`Search the front aisles together`, `Stick together near the exits and grab what is visible.`, { item: 0.45, hurt: 0.05, danger: 0.05, time: -1 }),
      C(`Raid the pharmacy counter`, `Behind the counter is a locked medicine cabinet.`, [O(0.5, 'item', `The cabinet pops open: {loot}.`, [['item', 'first_aid']]), O(0.2, 'hurt', `The cabinet glass shatters over {r}'s hands.`, [['hurt', 'r', 1]]), O(0.3, 'neutral', `Already raided. Only cough sweets left.`)]),
      safe(`Walk straight through to the back exit`, `Ignore the shelves. Just get out the other side.`),
      C(`Investigate the shuffling in the frozen aisle`, `Know what you are dealing with before it knows you.`, [O(0.45, 'funny', `It is a security guard in a walrus onesie, stuck in a chest freezer. He is fine. Very cold. He gives {team} {loot}.`, [['loot'], ['funny']]), O(0.55, 'danger', `It is a shopper with a trolley, still pushing it. It turns toward {r}.`, [['em', 'r']])]),
    ],
  }),
  E('pm_freezer', {
    cat: 'rescue', loc: 'pricemart', title: `The Walk-in Freezer`,
    text: [`Knocking from inside the walk-in freezer. Three slow knocks, then three fast. A voice, muffled: "Is anyone out there? Please, we have been in here two days." The handle is chained from the outside.`],
    cast: ['a', 'b?'], say: [['b', `"Who chains a freezer from the outside? Who did they lock in there?"`, 'Intelligent'], ['b', `"We have to help them. We have to."`, 'Kind']],
    choices: [
      C(`Break the chain and let them out`, `Use whatever is heavy. If they are telling the truth, they need you.`, [O(0.55, 'good', `Two shivering stock-room workers stumble out. They hug everyone, then give {team} their stash of {loot}.`, [['loot'], ['flag', 'helped_freezer'], ['hero']]), O(0.3, 'danger', `Only one of the voices was human. The other one is hungry and lunges for {r}.`, [['em', 'r']]), O(0.15, 'hurt', `The chain snaps back and whips {r} across the arm.`, [['hurt', 'r', 1]])], { major: true }),
      C(`Talk to them through the door first`, `Ask questions before opening anything.`, [O(0.6, 'good', `They answer everything. They are real. {Team} opens the door; they share their water and wish everyone luck.`, [['flag', 'helped_freezer'], ['time', -1]]), O(0.4, 'neutral', `The answers stop making sense. Then they stop altogether. {Team} leaves the chain alone.`, [['time', -1]])]),
      safe(`Leave them and move on`, `It might be a trap. It might not. You cannot risk it.`, { t: `The knocking follows {team} all the way to the exit. Nobody says anything.`, fx: [['flag', 'left_freezer']] }),
      C(`Pass food in through the vent and promise to send help`, `A compromise. Keep the door shut, but do not leave them with nothing.`, [O(1, 'neutral', `{a} pushes snacks through the vent. "We will tell the soldiers. I promise."`, [['flag', 'freezer_promise']])]),
      C(`Search the stock room while you decide`, `The stock room next door might hold bolt cutters, or supplies.`, [O(0.5, 'item', `Among the boxes: {loot}. The knocking keeps going.`, [['loot'], ['time', -1]]), O(0.5, 'neutral', `Nothing but toilet roll. Thousands of rolls.`, [['time', -1]])]),
    ],
  }),

  // ---------------- DEPOT ----------------
  E('dp_bus', {
    cat: 'exploration', loc: 'depot', title: `Route 38`,
    text: [`Rows of red double-deckers sit in the depot. One has its doors open and its keys in the ignition. The destination board still reads: 38 — STONEBRIDGE.`],
    cast: ['a', 'b?:Engineer'], say: [['b', `"I can get that running. Probably. Maybe. Give me a minute."`, 'Engineer'], ['a', `"It literally says Stonebridge. That has to be a sign."`]],
    choices: [
      C(`Try to start the bus`, `A double-decker would carry everyone. If it starts.`, [O(0.4, 'good', `The engine coughs into life. {a} drives Route 38 for a mile before the road is jammed. A mile is a mile.`, [['time', 2], ['shortcut', 1]]), O(0.35, 'neutral', `Click. Click. Click. The battery is dead.`, [['time', -1]]), O(0.25, 'danger', `The engine roars and wakes everything in the depot. Something drops from the top deck onto {r}!`, [['em', 'r']])]),
      search(`Search the drivers' lockers`, `Lunchboxes, torches, hi-vis vests.`, { item: 0.6, hurt: 0.05 }),
      safe(`Walk between the buses quietly`, `Use the buses as cover and keep moving.`),
      C(`Climb to the top deck for a lookout`, `See the route ahead from up high.`, [O(0.6, 'good', `From the top deck, {team} spots a clear route through the back streets.`, [['time', 1]]), O(0.4, 'hurt', `{r} bangs their head on the low ceiling. Classic.`, [['hurt', 'r', 1], ['funny']])]),
      search(`Check the depot office`, `Office drawers and a first aid box on the wall.`, { item: 0.5, hurt: 0, danger: 0.1 }),
    ],
  }),
  E('dp_mechanic', {
    npc: ['gary'],
    cat: 'interaction', loc: 'depot', title: `The Mechanic`,
    text: [`A man in oily overalls is sitting on an upturned crate, eating a sandwich as though nothing is wrong. His name badge says GARY. "Afternoon," he says. "Train, is it? Good luck."`],
    cast: ['a', 'b?'], say: [['a', `"Gary, the world is ending."`], ['b', `"Can I have half of that sandwich?"`, 'Foodie']],
    choices: [
      C(`Invite Gary to come with you`, `One more pair of hands. And he clearly knows the area.`, [O(0.5, 'good', `"Go on then." Gary shows {team} a gap in the fence that saves half an hour, then wanders off to "check on his mum".`, [['time', 2]]), O(0.5, 'funny', `"Nah. Got a shift at six." Gary stays, but gives everyone a biscuit.`, [['funny']])]),
      C(`Ask Gary for supplies`, `Mechanics have tools.`, [O(0.7, 'item', `Gary nods at his toolbox. "Take what you like." {Team} takes {loot}.`, [['loot']]), O(0.3, 'neutral', `"Bring it back when you are done," says Gary, handing over a spanner nobody needs.`, [['funny']])]),
      C(`Warn Gary about the infected`, `He does not seem to understand what is happening.`, [O(1, 'neutral', `Gary listens politely, then says "Right you are" and keeps eating. Some people cannot be helped.`)]),
      safe(`Leave Gary to his sandwich`, `Not your problem. Keep moving.`),
      C(`Ask Gary about Stonebridge`, `He has lived here his whole life.`, [O(0.6, 'good', `"Stonebridge? Side gate on Mill Lane. Army uses it. Tell them Gary sent you." Nobody knows if that will help.`, [['flag', 'side_gate']]), O(0.4, 'neutral', `Gary tells a twenty-minute story about a pigeon. It has nothing to do with Stonebridge.`, [['time', -1], ['funny']])]),
    ],
  }),

  // ---------------- HOSPITAL ----------------
  E('hs_er', {
    cat: 'zombie', loc: 'hospital', title: `Accident & Emergency`,
    text: [`The A&E waiting room is chaos frozen in place: overturned chairs, drip stands, a vending machine on its side. Beyond the double doors, figures in hospital gowns sway in the corridor. One of them is still holding a numbered ticket.`],
    scene: { z: 3, light: 'dim' }, cast: ['a', 'b?'], say: [['b', `"Number 47. They never called number 47."`, 'Funny'], ['a', `"Stay low. Do not let them see you."`]],
    choices: [
      search(`Raid the triage room`, `Bandages and kits are kept right behind the reception.`, { item: 0.65, hurt: 0.05, danger: 0.15 }),
      C(`Go through the corridor of patients`, `It is the direct route through the building.`, [O(0.45, 'good', `Shuffling, slow and careful, {team} passes right between them. Not one turns.`, [['time', 1]]), O(0.35, 'danger', `A gowned figure snaps its head round and grabs at {r}!`, [['em', 'r']]), O(0.2, 'hurt', `{r} slips on a wet floor sign. Ironic, and painful.`, [['hurt', 'r', 1], ['funny']])]),
      C(`Knock over the vending machine as a distraction`, `The crash will draw them away from the stairs.`, [O(0.6, 'good', `The machine crashes and the patients lurch toward the noise. Free chocolate everywhere.`, [['item', 'energy_drink']]), O(0.4, 'danger', `Half of them go for the noise. The other half go for {r}.`, [['em', 'r']])]),
      safe(`Go round the outside of the building`, `Skip the hospital. It will take longer.`, { time: -1 }),
      C(`Head up to the labs on the fourth floor`, `Rumour says the research team was working on a cure.`, [O(0.6, 'good', `The stairwell is clear. The fourth floor door says OKAFOR LAB.`, [['next', 'lto_hs_lab'], ['time', -1]]), O(0.4, 'danger', `The stairwell is not clear. Something comes down it fast, straight at {r}.`, [['em', 'r']])]),
    ],
  }),
  E('hs_lab', {
    cat: 'chain', loc: 'hospital', title: `Okafor Lab`, major: true,
    text: [`The lab is sealed but intact. On the bench: a fridge of vials marked with a biohazard symbol, a laptop with a USB drive still plugged in, and a note: "If anyone finds this — the research must reach the military. It could stop all of it. — Dr A. Okafor".`],
    scene: { bg: 'lab', light: 'dim' }, cast: ['a', 'b?:Intelligent'], say: [['b', `"These numbers... this is real. They found how it spreads."`, 'Intelligent'], ['a', `"We take the drive. Whatever happens."`]],
    choices: [
      C(`Take the research drive`, `Dr Okafor's work, carried to Stonebridge by hand.`, [O(1, 'item', `{a} pockets the drive. It feels heavier than it should.`, [['item', 'research'], ['flag', 'has_research']])]),
      C(`Take a vial of the experimental serum`, `Unlabelled. Untested. Possibly a cure.`, [O(1, 'item', `One vial fits safely in the first aid pouch. Nobody wants to need it.`, [['item', 'serum']])]),
      C(`Take both and run`, `Greedy, but this could change everything.`, [O(0.6, 'item', `Drive and vial, both secured. {Team} runs before luck runs out.`, [['item', 'research'], ['item', 'serum'], ['flag', 'has_research']]), O(0.4, 'danger', `The fridge alarm triggers as {a} grabs the vial. Something in the next room answers, coming for {r}.`, [['item', 'research'], ['item', 'serum'], ['flag', 'has_research'], ['em', 'r']])]),
      C(`Search the rest of the lab`, `There may be more supplies than just science.`, [O(0.6, 'item', `In the staff room: {loot}.`, [['loot'], ['time', -1]]), O(0.4, 'neutral', `Coffee mugs and half-finished crosswords. Nothing else.`, [['time', -1]])]),
      safe(`Leave everything. It is not your fight.`, `The train is what matters. Not science.`, { t: `The note stays on the bench. {Team} closes the door softly behind them.` }),
    ],
  }),
  E('hs_marta', {
    npc: ['marta'],
    cat: 'rescue', loc: 'hospital', title: `Nurse Marta`,
    text: [`In a supply cupboard, a nurse has barricaded herself in with a mop and a fire extinguisher. Her badge says MARTA. "Are any of you bitten?" she demands. "Show me your arms. All of you."`],
    cast: ['a', 'b?'], say: [['a', `"Nobody is bitten. We are heading for the train. Come with us."`], ['b', `"Can I just say: you are terrifying, and I love that."`, 'Funny']],
    choices: [
      C(`Show your arms and invite her along`, `A real nurse would be worth more than any first aid kit.`, [O(0.75, 'good', `Marta checks everyone, nods once, and grabs her bag. "Fine. But I am in charge of the bandages."`, [['npc', 'marta'], ['item', 'bandages']]), O(0.25, 'neutral', `"I am waiting for my shift partner," Marta says firmly. She gives {team} a roll of bandages and shuts the door.`, [['item', 'bandages']])], { major: true }),
      C(`Ask her to patch up the wounded`, `If anyone is hurt, now is the time.`, [O(1, 'good', `Marta works fast and without a word. Cuts cleaned, ankles strapped.`, [['heal', 'all', 1]])]),
      C(`Trade supplies for information`, `She has been here since the start. She knows things.`, [O(1, 'good', `"Doctor Okafor was working on something upstairs. Fourth floor. If you go, be quick." She gives {team} {loot}.`, [['loot'], ['flag', 'knows_lab']])]),
      safe(`Leave her be`, `She clearly wants to be left alone.`, { t: `Marta nods stiffly and pulls the door shut. The lock clicks.` }),
      C(`Take her supplies while she is distracted`, `Harsh, but the train is all that matters.`, [O(0.6, 'item', `{a} swipes {loot} from her trolley. It does not feel good.`, [['item', 'first_aid'], ['flag', 'stole_marta']]), O(0.4, 'hurt', `Marta catches {a} red-handed and swings the extinguisher. Fair enough.`, [['hurt', 'a', 1], ['funny']])], { major: true }),
    ],
  }),

  // ---------------- POLICE ----------------
  E('pd_armoury', {
    cat: 'exploration', loc: 'police', title: `The Armoury`,
    text: [`Ashford Police Station is dark. In the basement, the armoury cage is locked with a heavy padlock. Through the mesh, {team} can see a rack with one pistol left, and a box of road flares.`],
    scene: { bg: 'police', light: 'dim' }, cast: ['a', 'b?'], say: [['b', `"One pistol. One. Fine. I will share."`, 'Gamer'], ['a', `"Someone left in a hurry. Look at the keys on the floor."`]],
    choices: [
      C(`Pry the cage open`, `Brute force and a lot of noise.`, [O(0.5, 'item', `The padlock gives with a shriek of metal. {Team} takes {loot}.`, [['item', 'pistol'], ['time', -1]]), O(0.3, 'danger', `The noise echoes upstairs. Heavy boots, then a uniformed shape stumbling down toward {r}.`, [['em', 'r']]), O(0.2, 'hurt', `The bar slips. {r} smashes a knuckle against the cage.`, [['hurt', 'r', 1]])]),
      C(`Search the floor for the padlock key`, `Someone dropped a ring of keys in the panic.`, [O(0.55, 'item', `The third key fits. Quiet as a mouse, {team} takes the pistol and flares.`, [['item', 'pistol'], ['item', 'flare'], ['time', -1]]), O(0.45, 'neutral', `None of the keys fit. Twenty minutes wasted.`, [['time', -2]])]),
      C(`Pry the cage with a crowbar`, `Leverage beats brute force.`, [O(1, 'item', `The crowbar does the job in seconds. One pistol, two flares.`, [['item', 'pistol'], ['item', 'flare'], ['use', 'crowbar']])], { req: { items: ['crowbar'] } }),
      search(`Search the evidence lockers instead`, `Confiscated goods, all labelled and bagged.`, { item: 0.55, hurt: 0, danger: 0.08 }),
      safe(`Leave the guns. They will only make noise.`, `Quiet survivors are living survivors.`),
      C(`Check the front desk`, `Paperwork, radios, maybe a pass.`, [O(0.5, 'item', `In the sergeant's drawer is a laminated card: EVACUATION PRIORITY. {Team} takes {loot}.`, [['item', 'pass']]), O(0.5, 'item', `A charging dock with one radio left: {loot}.`, [['item', 'radio']])]),
    ],
  }),
  E('pd_cells', {
    npc: ['vince'],
    cat: 'moral', loc: 'police', title: `The Holding Cells`,
    text: [`A man is locked in cell three. He is unshaven, polite, and very keen to leave. "Name is Vince," he says. "Bit of a misunderstanding about a telly. Let me out and I will show you a way to the station nobody knows."`],
    cast: ['a', 'b?'], say: [['b', `"He has shifty eyebrows. I do not trust the eyebrows."`, 'Sarcastic'], ['b', `"Everyone deserves a second chance."`, 'Kind']],
    choices: [
      C(`Let Vince out and bring him along`, `He knows the city. He also stole a telly.`, [O(1, 'good', `Vince shakes everyone's hand and immediately knows a shortcut through the multi-storey car park. "Told you. Trust Vince."`, [['npc', 'vince'], ['time', 1]])], { major: true }),
      C(`Let him out but go separate ways`, `Do the decent thing, then leave him behind.`, [O(1, 'neutral', `Vince salutes and vanishes into the dark. "I owe you one," he calls. Nobody believes him.`, [['flag', 'freed_vince']])]),
      safe(`Leave him in the cell`, `Not your responsibility.`, { t: `"You will regret this!" shouts Vince. Then, quieter: "There are biscuits in the drawer, by the way."`, fx: [['item', 'tinned_food']] }),
      C(`Trade: his shortcut for his freedom`, `Get the information first. Then decide.`, [O(0.6, 'good', `Vince sketches a route on the wall. It is real. {Team} lets him go.`, [['time', 2], ['flag', 'freed_vince']]), O(0.4, 'bad', `Vince's "shortcut" is a dead end. {Team} wastes ages finding out.`, [['time', -2], ['flag', 'freed_vince']])]),
      search(`Search the custody office`, `Confiscated belongings are kept in bags behind the desk.`, { item: 0.6, hurt: 0, danger: 0.05 }),
    ],
  }),

  // ---------------- ALLEYS ----------------
  E('al_bins', {
    cat: 'humour', loc: 'alleys', title: `Bin Day`,
    text: [`The alley behind the takeaways is lined with overflowing bins. Something is rummaging in one of them. The lid lifts. A fox stares at {team}, holding an entire kebab.`],
    cast: ['a', 'b?'], say: [['a', `"That fox is living its best life."`], ['b', `"Respect the fox. The fox is clearly the apex survivor."`, 'Nature lover']],
    choices: [
      C(`Follow the fox`, `Animals always know the safe way out.`, [O(0.6, 'good', `The fox trots through a gap in a fence, and {team} follows it into a quiet back street. Shortcut.`, [['time', 1], ['funny']]), O(0.4, 'funny', `The fox leads everyone in a big circle back to the bins and then vanishes. Cheeky.`, [['time', -1], ['funny']])]),
      search(`Search the takeaway kitchens`, `Back doors are wide open.`, { item: 0.5, hurt: 0.1, danger: 0.12 }),
      C(`Feed the fox`, `Make a friend. Everyone needs a friend right now.`, [O(1, 'funny', `{a} offers half a sandwich. The fox takes it, judges it, and leaves.`, [['funny']])]),
      safe(`Ignore the fox and keep moving`, `It is just a fox.`),
      rush(`Run the length of the alley`, `Narrow alleys are death traps. Get through fast.`, { hurt: 0.12, danger: 0.1 }),
    ],
  }),
  E('al_fence', {
    cat: 'hazard', loc: 'alleys', title: `Dead End`,
    text: [`The alley ends in a three-metre chain-link fence topped with barbed wire. Behind {team}, slow footsteps are turning into the alley. On the other side of the fence, the road is clear.`],
    scene: { z: 2 }, cast: ['a', 'b?:Brave'], say: [['b', `"Go. I will hold them off. Just go!"`, 'Brave'], ['a', `"Up and over. Now. Do not look back."`]],
    choices: [
      rush(`Climb the fence as fast as you can`, `Barbed wire bites, but zombies bite harder.`, { hurt: 0.3, danger: 0.08, time: 0, t: { hurt: `{r} catches a leg on the barbed wire and tears free, bleeding.`, ok: `Over the top, bleeding a little, but over.` } }),
      C(`Throw a coat over the wire first`, `Take a few seconds to make it safer.`, [O(0.7, 'good', `The coat covers the barbs. {Team} climbs over cleanly. The coat stays behind as a souvenir.`), O(0.3, 'danger', `Those few seconds were too long. Hands grab at {r}'s ankle!`, [['em', 'r']])]),
      C(`Climb over using the rope`, `Loop the rope over the post and haul everyone up.`, [O(1, 'good', `Rope over the post, everyone hauled up and over in seconds. Textbook.`, [['time', 1]])], { req: { items: ['rope'] } }),
      C(`Turn and fight in the alley`, `It is narrow. They can only come one at a time.`, [O(0.5, 'good', `Shoulder to shoulder, {team} holds the alley. Three infected fall. Then there is time to climb.`, [['hero']]), O(0.35, 'hurt', `It is a brutal scrap. {r} takes a heavy blow.`, [['hurt', 'r', 1]]), O(0.15, 'danger', `One gets through the line and drags {r} down!`, [['em', 'r']])]),
      C(`Hide behind the industrial bins`, `Let them shuffle past.`, [O(0.6, 'neutral', `Holding breath in the bin juice. The footsteps pass. Gross, but alive.`, [['time', -1], ['funny']]), O(0.4, 'danger', `One sniffs the air and turns straight toward {r}'s hiding spot!`, [['em', 'r']])]),
      C(`Cut through the fence with the crowbar`, `Wrench up the bottom of the fence and crawl under.`, [O(1, 'good', `The crowbar levers up the fence. Everyone crawls under like it is a school assault course.`, [['use', 'crowbar']])], { req: { items: ['crowbar'] } }),
      C(`Look for a gap further along`, `Fences always have a weak spot.`, [O(0.5, 'good', `A loose panel near the wall. {Team} squeezes through just in time.`), O(0.5, 'danger', `There is a gap, but something else found it first. It comes for {r}.`, [['em', 'r']])]),
    ],
  }),

  // ---------------- WAREHOUSE ----------------
  E('wh_forklift', {
    cat: 'humour', loc: 'warehouse', title: `Forklift Certified`,
    text: [`The docklands warehouse is stacked with crates up to the roof. A forklift sits by the loading bay with the keys in it. {a} is already climbing into the seat with a look of pure joy.`],
    cast: ['a', 'b?'], say: [['a', `"I have always wanted to drive one of these. Always."`], ['b', `"Do you have a licence? Of any kind?"`, 'Practical']],
    choices: [
      C(`Let {a} drive the forklift`, `What could possibly go wrong?`, [O(0.45, 'funny', `{a} drives the forklift magnificently, lifting a crate to reveal {loot}. A natural.`, [['loot'], ['funny']]), O(0.35, 'hurt', `{a} drives straight into a stack of crates. It is spectacular. {r} gets clipped by a falling box.`, [['hurt', 'r', 1], ['funny']]), O(0.2, 'danger', `The beeping reverse alarm attracts every infected in the warehouse. One goes for {r}!`, [['em', 'r'], ['funny']])]),
      search(`Search the crates by hand`, `Crowbars, rope, all sorts of cargo.`, { item: 0.6, hurt: 0.1 }),
      C(`Use the forklift to block the doors`, `Seal the warehouse behind you so nothing follows.`, [O(1, 'good', `The forklift wedges the door shut. Nothing is following anyone now.`, [['flag', 'sealed_warehouse']])]),
      safe(`Leave it. Keep moving.`, `Somebody has to be the sensible one.`, { t: `{a} looks heartbroken but follows. The forklift dream lives on.` }),
      C(`Climb the crates for a view`, `See the route from up high.`, [O(0.6, 'good', `From the top crate, the station's floodlights are visible on the horizon. A clear route.`, [['time', 1]]), O(0.4, 'hurt', `The top crate wobbles. {r} rides it down to the floor.`, [['hurt', 'r', 1]])]),
    ],
  }),
  E('wh_cage', {
    npc: ['hoarder', 'hoarder'],
    cat: 'moral', loc: 'warehouse', title: `The Hoarders`,
    text: [`A loading cage is stuffed with supplies: water, tins, medicine. Three survivors guard it with cricket bats. Their leader, a woman in a hi-vis jacket, eyes {team}. "We do not share. But we trade."`],
    cast: ['a', 'b?'], say: [['b', `"They have a whole box of first aid kits. A whole box."`, 'Medic'], ['a', `"We do not want trouble."`, 'Leader']],
    choices: [
      C(`Trade an item from your backpack`, `Give something up to get something better.`, [O(1, 'item', `The hoarder takes {team}'s offer and shoves over {loot}. "Pleasure doing business."`, [['lose'], ['item', 'first_aid']])], { req: { minAlive: 1, anyItems: ['tinned_food', 'energy_drink', 'flare', 'batteries', 'bandages', 'firecrackers', 'map'] } }),
      C(`Offer to help them for supplies`, `Labour for goods. Carry their water to the roof.`, [O(0.7, 'item', `An hour of hauling. The hoarders pay fairly: {loot}.`, [['loot'], ['time', -2]]), O(0.3, 'hurt', `{r} strains something lifting the water tanks. The hoarders pay anyway.`, [['hurt', 'r', 1], ['loot'], ['time', -2]])]),
      C(`Try to steal from the cage`, `Distract them and grab what you can.`, [O(0.4, 'item', `While {a} asks for directions very slowly, someone snatches {loot}.`, [['loot']]), O(0.6, 'hurt', `A cricket bat to the ribs. The hoarders are not amused. {r} takes the hit.`, [['hurt', 'r', 1]])], { major: true }),
      safe(`Walk away politely`, `Nobody needs a fight with cricket bats.`),
      C(`Warn them about what is coming`, `Tell them about the evacuation train.`, [O(0.6, 'good', `The hi-vis leader softens. "Stonebridge? Take this, then." She gives {team} {loot}.`, [['loot']]), O(0.4, 'neutral', `"We are staying," she says. "This is our home now."`)]),
      C(`Ask for directions instead`, `Information is free. Usually.`, [O(1, 'good', `"Stonebridge? Follow the cranes, then the river." The hi-vis leader even points.`, [['time', 1]])]),
    ],
  }),

  // ---------------- MARLOW TOWER ----------------
  E('tw_community', {
    npc: ['bayo'],
    cat: 'moral', loc: 'tower', title: `The Fourteenth Floor`, major: true,
    text: [`On the fourteenth floor of Marlow Tower, a community has barricaded the stairs with furniture. They have rooftop gardens, rainwater tanks and a vegetable patch in a bathtub. Their leader, Pastor Bayo, smiles. "You are welcome to stay. Forever, if you like."`],
    cast: ['a', 'b?'], say: [['b', `"They have tomatoes. Real tomatoes."`, 'Foodie'], ['b', `"This is a trap. Nobody is this nice."`, 'Sarcastic'], ['a', `"It is safe here. Really safe."`]],
    choices: [
      C(`Thank them and promise to remember them`, `If the train fails, there is somewhere to come back to.`, [O(1, 'good', `Pastor Bayo writes the safe knock on {a}'s hand. "Three, then two. We will let you in."`, [['flag', 'tower_ally']])]),
      C(`Rest and eat with them`, `A proper meal and a proper rest.`, [O(1, 'good', `Soup, bread and an hour of real sleep. Everyone feels human again.`, [['heal', 'all', 1], ['time', -3], ['flag', 'tower_ally']])]),
      C(`Stay here for good`, `Forget the train. This is safe.`, [O(1, 'good', `{Team} decides. No more running. Pastor Bayo opens the barricade for the last time.`, [['flag', 'tower_haven'], ['end']])], { major: true }),
      C(`Trade for supplies`, `They have more than they need.`, [O(1, 'item', `In exchange for news of the outside, they give {team} {loot}.`, [['loot'], ['flag', 'tower_ally']])]),
      safe(`Politely refuse and keep moving`, `The train is the goal. Stay focused.`, { t: `Pastor Bayo nods. "God speed. Take the skybridge on the twentieth, it is faster."`, fx: [['time', 1]] }),
    ],
  }),
  E('tw_lift', {
    cat: 'hazard', loc: 'tower', title: `The Twentieth Floor`,
    text: [`The skybridge between Marlow Tower and the next block swings slightly in the wind. Half its glass panels are gone. Far below, the infected look like ants. Very hungry ants.`],
    scene: { light: 'dusk' }, cast: ['a', 'b?:Nervous'], say: [['b', `"I am not crossing that. Absolutely not. Never. ...Fine."`, 'Nervous'], ['a', `"Do not look down."`]],
    choices: [
      rush(`Cross the skybridge quickly`, `It is the fast way. Hold the rail.`, { hurt: 0.15, danger: 0, time: 1, t: { hurt: `A panel cracks under {r}. They make it, but bash a knee badly.`, ok: `Heart pounding, {team} crosses. Nobody looked down. Mostly.` } }),
      safe(`Take the stairs all the way down`, `Twenty floors. Slow, but solid.`, { time: -2, t: `Four hundred steps. Legs like jelly. But safe.` }),
      C(`Tie everyone together with rope and cross`, `If one person slips, the others hold.`, [O(1, 'good', `Roped together like mountaineers, {team} crosses without a wobble.`, [['time', 1]])], { req: { items: ['rope'] } }),
      C(`Crawl across on hands and knees`, `Low and slow, away from the broken panels.`, [O(0.75, 'funny', `It is not dignified, but it works. {a} narrates the whole crawl like a nature documentary.`, [['funny']]), O(0.25, 'hurt', `Broken glass on the floor. {r} cuts both palms.`, [['hurt', 'r', 1]])]),
      search(`Search the flats on the twentieth floor first`, `The doors are all open. People left fast.`, { item: 0.55, hurt: 0, danger: 0.1 }),
      C(`Wait for the wind to drop`, `The bridge swings less when it is calm.`, [O(0.7, 'neutral', `Twenty minutes later, the wind drops and the crossing is easy.`, [['time', -1]]), O(0.3, 'danger', `While waiting, the stairwell door bangs open. Something comes for {r}.`, [['em', 'r']])]),
    ],
  }),

  // ---------------- GALLERIA ----------------
  E('ml_foodcourt', {
    cat: 'exploration', loc: 'mall', title: `The Food Court`,
    text: [`The Galleria food court is eerie: trays still on tables, a pretzel stand's oven still glowing. On the escalator, infected ride slowly up and down, up and down, as if they cannot work out how to get off.`],
    scene: { z: 2 }, cast: ['a', 'b?'], say: [['b', `"They are stuck on the escalator. That is the funniest thing I have ever seen."`, 'Funny'], ['a', `"Do not laugh. They will hear you."`]],
    choices: [
      search(`Grab food and drinks from the counters`, `Quick raid on the food court.`, { item: 0.6, hurt: 0, danger: 0.1 }),
      C(`Switch off the escalators`, `Trap them at the top or let them loose?`, [O(0.5, 'good', `The escalators stop. The infected at the top stay at the top, confused. Path clear.`), O(0.5, 'danger', `The escalators stop. The infected walk off, straight toward {r}.`, [['em', 'r']])]),
      safe(`Sneak along the shop fronts`, `Stay in the shadows of the shutters.`),
      C(`Check the security office`, `CCTV screens might show a clear route.`, [O(0.6, 'good', `The cameras show a clear service exit. {Team} slips out the back.`, [['time', 1]]), O(0.4, 'item', `No route, but the guard left {loot} on the desk.`, [['loot']])]),
      C(`Raid the sports shop`, `Bats, bikes, rucksacks.`, [O(0.5, 'item', `The sports shop is untouched. {Team} grabs {loot}.`, [['loot']]), O(0.3, 'funny', `{a} comes back wearing a cycling helmet, knee pads and a tennis visor. "Armour."`, [['funny']]), O(0.2, 'danger', `A mannequin moves. It is not a mannequin. It goes for {r}!`, [['em', 'r']])]),
    ],
  }),
  E('ml_toyshop', {
    cat: 'humour', loc: 'mall', title: `The Toy Shop`,
    text: [`A toy shop on the upper level. A singing animatronic bear by the door bursts into "Happy Birthday" every time anyone walks past. It is very, very loud.`],
    cast: ['a', 'b?'], say: [['a', `"Make it stop. Make it stop right now."`], ['b', `"Actually... we could use that."`, 'Intelligent']],
    choices: [
      C(`Use the singing bear as a decoy`, `Leave it singing in the atrium to draw them away.`, [O(0.7, 'good', `The bear sings Happy Birthday to a crowd of thirty infected. {Team} sneaks out the far side.`, [['time', 1], ['funny']]), O(0.3, 'danger', `The bear stops singing halfway. The crowd turns round, toward {r}.`, [['em', 'r'], ['funny']])]),
      search(`Search the shop`, `Walkie-talkies, torches and party poppers.`, { item: 0.65, hurt: 0, t: { item: `In a box marked "Spy Kit": {loot}.` } }),
      C(`Smash the bear`, `Silence it forever.`, [O(0.5, 'funny', `{a} wrestles the bear to the floor. It sings one last, slow note. Silence.`, [['funny']]), O(0.5, 'hurt', `The bear fights back. A metal claw gets {r} in the arm. Unbelievable.`, [['hurt', 'r', 1], ['funny']])]),
      safe(`Back away slowly`, `Get out before something hears it.`),
      C(`Take some toys for morale`, `Everyone could use a little joy right now.`, [O(1, 'funny', `{a} picks a tiny plush zombie and names it Kevin. Kevin is now the team mascot.`, [['funny'], ['flag', 'kevin']])]),
    ],
  }),

  // ---------------- TUNNELS ----------------
  E('tn_dark', {
    cat: 'hazard', loc: 'tunnels', title: `Total Darkness`,
    text: [`Ten steps into the tunnel and the daylight is gone. The air smells of oil and something worse. Somewhere ahead, water drips. And under the dripping, something breathes.`],
    scene: { light: 'dark', z: 1 }, cast: ['a', 'b?'], say: [['b', `"Okay, I can see absolutely nothing. Is that normal? That feels bad."`, 'Nervous'], ['a', `"Hands on shoulders. Single file."`]],
    choices: [
      C(`Walk blind, hands on shoulders`, `Single file in the dark.`, [O(0.5, 'neutral', `Inch by inch, {team} makes it through the darkest stretch.`), O(0.3, 'hurt', `{r} walks face-first into a signal box.`, [['hurt', 'r', 1], ['funny']]), O(0.2, 'danger', `The breathing is right beside {r}!`, [['em', 'r']])]),
      C(`Use the flashlight`, `Light the way, even if it shows you to whatever is down here.`, [O(0.75, 'good', `The beam shows the way: a clear track and a service door marked STONEBRIDGE 1.2 MILES.`, [['use', 'flashlight'], ['time', 1]]), O(0.25, 'danger', `The beam lands on a face. It lunges at {r}.`, [['use', 'flashlight'], ['em', 'r']])], { req: { items: ['flashlight'] } }),
      C(`Follow the dripping water`, `Water runs downhill. Downhill is the platform.`, [O(0.6, 'good', `The trickle leads to an abandoned platform with a little light from above.`), O(0.4, 'hurt', `The water leads into a deep puddle. {r} drops into it up to the waist and wrenches a knee.`, [['hurt', 'r', 1]])]),
      safe(`Turn back and take the surface route`, `Better the devil you can see.`, { time: -2 }),
      C(`Open the service door with the maintenance key`, `The key should open the side passages.`, [O(1, 'good', `The key turns. A lit service corridor runs alongside the track. Safe and fast.`, [['time', 2]])], { req: { items: ['tunnel_key'] } }),
      C(`Light a flare`, `Bright, red, and loud.`, [O(0.6, 'good', `The flare lights up the tunnel like a red sunrise. The path is clear and the infected flinch away from it.`, [['use', 'flare'], ['time', 1]]), O(0.4, 'danger', `The flare shows the way, and shows everything down here where {team} is. One comes for {r}.`, [['use', 'flare'], ['em', 'r']])], { req: { items: ['flare'] } }),
      C(`Feel along the wall for a light switch`, `Tunnels have emergency lighting somewhere.`, [O(0.4, 'good', `Click. Emergency lights flicker on along the tunnel. Brilliant.`, [['time', 1]]), O(0.4, 'neutral', `Just cables. No switch.`, [['time', -1]]), O(0.2, 'hurt', `{r} grabs a cable and gets a nasty jolt.`, [['hurt', 'r', 1]])]),
      C(`Make a noise to see what answers`, `Better to know now than later.`, [O(0.5, 'neutral', `Only echoes answer. The way ahead is empty.`), O(0.5, 'danger', `Something answers, and it is coming fast for {r}.`, [['em', 'r']])]),
    ],
  }),
  E('tn_train', {
    cat: 'zombie', loc: 'tunnels', title: `The Stalled Train`,
    text: [`A tube train sits dead in the tunnel. Its windows are smeared from the inside. The carriages are full, and everything in them is pressed against the glass, watching {team} walk past.`],
    scene: { bg: 'tunnel', light: 'dark', z: 4 }, cast: ['a', 'b?'], say: [['b', `"Do not make eye contact. Do not make eye contact."`, 'Nervous'], ['a', `"Those doors are holding. Just keep walking."`]],
    choices: [
      rush(`Walk past quickly`, `The doors are shut. Probably sealed.`, { hurt: 0, danger: 0.15, time: 1, t: { ok: `The faces follow {team} all the way along the train. The doors hold.` } }),
      C(`Squeeze along the narrow gap by the wall`, `As far from the doors as possible.`, [O(0.7, 'neutral', `Back to the wall, inch by inch. The glass rattles, but holds.`), O(0.3, 'hurt', `{r} scrapes along a rusty cable bracket.`, [['hurt', 'r', 1]])]),
      C(`Walk on the roof of the train`, `Climb up and walk the roof carriage to carriage.`, [O(0.6, 'good', `The roof is solid. Below, the infected claw at the ceiling. {Team} is long gone.`, [['time', 1]]), O(0.4, 'hurt', `{r} stands up too fast and smacks the tunnel ceiling. Hard.`, [['hurt', 'r', 1], ['funny']])]),
      C(`Search the driver's cab`, `The cab is separate from the passengers.`, [O(0.6, 'item', `The cab is empty. The driver's bag holds {loot}.`, [['loot']]), O(0.4, 'danger', `The cab door was not locked from the inside. The driver was still in there, waiting for {r}.`, [['em', 'r']])]),
      safe(`Back up and find another way round`, `Another tunnel branch runs parallel.`, { time: -2 }),
    ],
  }),

  // ---------------- CANAL ----------------
  E('cn_boat', {
    npc: ['dot'],
    cat: 'exploration', loc: 'canal', title: `Bessie`,
    text: [`A painted narrowboat named Bessie is moored on the towpath. Flowers in pots, a cat flap, smoke from the chimney. An old woman in a captain's hat is sitting on the roof with a shotgun across her knees. "I see you," she says.`],
    cast: ['a', 'b?'], say: [['a', `"We are not here to cause trouble, madam."`], ['b', `"I want to be her when I grow up."`, 'Funny']],
    choices: [
      C(`Ask the captain for help`, `Politely. Very politely.`, [O(0.6, 'item', `"My name's Dot. If the train fails, Bessie goes down to the estuary at dawn. Take these, just in case." She tosses {team} the spare keys.`, [['item', 'boat_keys'], ['flag', 'met_dot']]), O(0.4, 'neutral', `Dot listens, then says: "Good luck. Stay off my boat." Fair enough.`)]),
      C(`Trade with her`, `She might have spare supplies.`, [O(1, 'item', `Dot trades {team} {loot} for news of the city.`, [['loot']])]),
      C(`Warn her about the evacuation`, `She might not know about the train.`, [O(1, 'good', `"Train? Not likely. Bessie's my home." She gives everyone a mug of tea. Morale restored.`, [['heal', 'injured', 1], ['time', -1]])]),
      safe(`Nod respectfully and keep walking`, `Never argue with someone holding a shotgun.`),
      C(`Ask her to take you downstream`, `A boat is faster than walking. Probably.`, [O(0.5, 'good', `"Only as far as the lock." Bessie chugs along at walking pace. It is still lovely.`, [['time', 1], ['heal', 'injured', 1]]), O(0.5, 'neutral', `"Bessie does four miles an hour. You walk faster." Dot is right.`)]),
    ],
  }),
  E('cn_swans', {
    cat: 'humour', loc: 'canal', title: `The Swans`,
    text: [`Two enormous swans block the towpath, hissing. They do not care about the apocalypse. They care about the towpath, and the towpath is theirs.`],
    cast: ['a', 'b?'], say: [['a', `"I would honestly rather fight a zombie."`], ['b', `"Swans can break your arm. Everyone knows that."`, 'Nature lover']],
    choices: [
      C(`Walk past them confidently`, `Show no fear.`, [O(0.5, 'funny', `{a} walks past with total confidence. The swans respect it. Unbelievable.`, [['funny']]), O(0.5, 'hurt', `The swans do not respect it. {r} is chased fifty metres and pecked on the backside.`, [['hurt', 'r', 1], ['funny']])]),
      C(`Feed them some food`, `A bribe for safe passage.`, [O(1, 'funny', `The swans take the offering and let {team} pass like royalty.`, [['use', 'tag', 'food'], ['funny']])], { req: { tags: ['food'] } }),
      safe(`Wait for them to move`, `They will get bored eventually.`, { time: -2, t: `Forty-five minutes later, the swans glide off. Nobody speaks of it.` }),
      C(`Climb up the bank and go around`, `Avoid the swans entirely.`, [O(0.6, 'neutral', `Through brambles and nettles. Everyone is stung, but nobody is pecked.`), O(0.4, 'hurt', `{r} slides back down the bank, straight toward the swans.`, [['hurt', 'r', 1], ['funny']])]),
      C(`Let {a} negotiate with them`, `Honestly, why not.`, [O(1, 'funny', `{a} gives a moving speech about unity in difficult times. The swans hiss through all of it. Then they leave anyway.`, [['funny'], ['time', -1]])]),
      C(`Run past screaming`, `Sometimes chaos is the plan.`, [O(0.5, 'funny', `Everyone sprints past shrieking. The swans are so confused they do nothing.`, [['funny'], ['time', 1]]), O(0.5, 'hurt', `The swans are not confused. {r} takes a wing to the face.`, [['hurt', 'r', 1], ['funny']])]),
    ],
  }),

  // ---------------- FLYOVER ----------------
  E('fy_traffic', {
    cat: 'exploration', loc: 'flyover', title: `Gridlock`,
    text: [`Up on the flyover, a mile of cars sits frozen bumper to bumper. Doors open. Suitcases spilled. From up here, Stonebridge Station's floodlights are visible on the horizon.`],
    cast: ['a', 'b?'], say: [['a', `"There it is. Stonebridge. We can actually see it."`], ['b', `"So close. Do not jinx it."`, 'Nervous']],
    choices: [
      search(`Search the abandoned cars`, `Suitcases full of everything people thought they needed.`, { item: 0.65, hurt: 0.05, danger: 0.12, time: -1 }),
      rush(`Run down the hard shoulder`, `A clear lane on the left. Straight run.`, { hurt: 0.1, danger: 0.12, time: 1 }),
      C(`Hotwire a motorbike`, `There is a scooter between the cars.`, [O(0.4, 'good', `{a} gets the scooter going. It is very slow and very funny, but it helps carry the bags.`, [['time', 1], ['funny']]), O(0.6, 'neutral', `Turns out hotwiring is harder than films make it look.`, [['time', -1], ['funny']])], { req: { trait: 'Engineer' } }),
      safe(`Walk between the cars carefully`, `Steady pace. Eyes open.`),
      C(`Check the coach in the middle lane`, `A school trip coach. It is very quiet.`, [O(0.5, 'item', `Empty. Teachers got everyone out. The first aid box is still there: {loot}.`, [['item', 'first_aid']]), O(0.5, 'neutral', `Nothing but packed lunches and a lost teddy.`)]),
      C(`Check the lorry at the front`, `Delivery lorries carry all sorts.`, [O(0.5, 'item', `The lorry is full of camping gear. {Team} grabs {loot}.`, [['loot']]), O(0.3, 'funny', `The lorry is full of garden gnomes. Hundreds of them. Watching.`, [['funny']]), O(0.2, 'danger', `The driver is still in the cab. It reaches for {r}.`, [['em', 'r']])]),
    ],
  }),
  E('fy_heli', {
    cat: 'exploration', loc: 'flyover', title: `The Fallen Helicopter`,
    text: [`A military helicopter lies on its side across two lanes, rotor blades bent like spoons. The cockpit is empty. A radio inside crackles: "Echo Two, Echo Two, any survivors respond."`],
    scene: { bg: 'motorway', props: ['heli'] }, cast: ['a', 'b?:Brave'], say: [['b', `"Someone might still be alive in there. I am checking."`, 'Brave'], ['a', `"Fuel is leaking. We have to be quick."`]],
    choices: [
      C(`Answer the radio`, `Someone is out there.`, [O(0.65, 'good', `"Copy, survivors. If you miss the train, signal from high ground. Echo Two will look." {Team} gets a rescue frequency.`, [['flag', 'heli_contact']]), O(0.35, 'neutral', `The battery dies mid-sentence.`)]),
      C(`Take the helicopter radio`, `It is battered but working.`, [O(1, 'item', `{a} prises the handset free: {loot}.`, [['item', 'radio']])]),
      search(`Search the wreck`, `Military kit, flares and medical packs.`, { item: 0.7, hurt: 0.15, t: { hurt: `{r} burns a hand on the hot engine casing.` } }),
      safe(`Stay clear in case it explodes`, `Fuel and sparks. No thanks.`, { t: `{Team} gives the wreck a very wide berth. It does not explode. But it might have.` }),
      C(`Look for the crew`, `They might be nearby and hurt.`, [O(0.4, 'good', `The pilot is slumped against the barrier, alive. She gives {team} a flare and a salute: "Get to that train."`, [['item', 'flare'], ['hero']]), O(0.6, 'danger', `The pilot is slumped against the barrier. She is not alive. Not exactly. She goes for {r}.`, [['em', 'r']])]),
    ],
  }),

  // ---------------- RAIL YARD ----------------
  E('ry_wagons', {
    cat: 'exploration', loc: 'railyard', title: `Freight Wagons`,
    text: [`The rail yard behind Stonebridge is a maze of freight wagons. Floodlights sweep the far end. Soldiers' voices drift over the fence: "Thirty minutes to final boarding!" They probably say that every thirty minutes.`],
    cast: ['a', 'b?'], say: [['a', `"We are so close I can hear them."`], ['b', `"This is exactly when things go wrong in films."`, 'Gamer']],
    choices: [
      search(`Search the wagons`, `Some are open. Military supply wagons.`, { item: 0.65, hurt: 0.08, danger: 0.12 }),
      rush(`Run for the station fence`, `Straight across the open tracks.`, { hurt: 0.1, danger: 0.15, time: 1 }),
      C(`Climb the signal box`, `Get a view of the station and the gates.`, [O(0.7, 'good', `From the signal box, the side gate on Mill Lane is clearly visible, and open.`, [['flag', 'side_gate']]), O(0.3, 'hurt', `The ladder rung snaps. {r} falls the last two metres.`, [['hurt', 'r', 1]])]),
      safe(`Creep along the wagons in the shadows`, `Avoid the floodlights and the open ground.`),
      C(`Shout to the soldiers`, `Let them know you are here.`, [O(0.5, 'good', `"Survivors! Hold position, we will cover you!" A soldier waves {team} toward a gap in the fence.`, [['flag', 'side_gate']]), O(0.5, 'danger', `The soldiers hear. So does everything else in the rail yard. One closes on {r}.`, [['em', 'r']])]),
    ],
  }),
  E('ry_signal', {
    npc: ['signalman'],
    cat: 'moral', loc: 'railyard', title: `The Signalman`,
    text: [`In the signal box, a railway signalman is pulling levers like his life depends on it. "If I do not switch the points, the evacuation train goes down the wrong line," he pants. "But they are coming up the stairs."`],
    scene: { bg: 'railyard', z: 2 }, cast: ['a', 'b?'], say: [['b', `"We cannot leave him. If that train goes wrong, nobody gets out."`, 'Kind'], ['a', `"How long do you need?"`]],
    choices: [
      C(`Hold the stairs while he works`, `Defend the signal box until the points are switched.`, [O(0.55, 'good', `{Team} holds the stairs. The points clunk over. "You saved hundreds of people," says the signalman.`, [['flag', 'saved_points'], ['hero'], ['time', -1]]), O(0.3, 'hurt', `They hold the stairs, but {r} takes a beating doing it.`, [['hurt', 'r', 1], ['flag', 'saved_points'], ['hero']]), O(0.15, 'danger', `The stairs fall. One breaks through toward {r}!`, [['em', 'r'], ['flag', 'saved_points']])], { major: true }),
      C(`Switch the points yourselves while he fights`, `You do the levers, he holds the door.`, [O(0.6, 'good', `{a} heaves the lever over. Clunk. Done.`, [['flag', 'saved_points']]), O(0.4, 'bad', `Wrong lever. Then the right one. It costs precious minutes.`, [['flag', 'saved_points'], ['time', -2]])]),
      safe(`Leave him to it and head for the station`, `The train is the goal. He has his job, you have yours.`, { t: `The signalman's shouts fade behind {team}. Nobody knows if he made it.`, fx: [['time', 1]] }),
      C(`Barricade the stairs and go`, `Buy him time without staying.`, [O(0.7, 'good', `A filing cabinet down the stairs. That will hold them for a while.`, [['flag', 'saved_points']]), O(0.3, 'hurt', `The cabinet slips. {r} gets a finger caught.`, [['hurt', 'r', 1], ['flag', 'saved_points']])]),
      C(`Ask him for a quick way in`, `He knows every inch of this yard.`, [O(1, 'good', `"Platform three, under the footbridge. Nobody guards it." He does not look up from his levers.`, [['flag', 'side_gate'], ['time', 1]])]),
    ],
  }),

  // ---------------- CHECKPOINT ----------------
  E('cp_abandoned', {
    cat: 'exploration', loc: 'checkpoint', title: `Checkpoint Delta`,
    text: [`Sandbags, razor wire and an overturned army truck. A hand-painted sign says CHECKPOINT DELTA — ALL CIVILIANS MUST BE SCREENED. Nobody is left to screen anyone.`],
    cast: ['a', 'b?'], say: [['a', `"They left everything. They must have been overrun."`], ['b', `"Overrun by what, though? Where are they?"`, 'Intelligent']],
    choices: [
      search(`Search the army truck`, `Military supplies, maybe weapons.`, { item: 0.7, hurt: 0.05, danger: 0.15 }),
      C(`Search the command tent`, `Officers keep the important things.`, [O(0.45, 'item', `On the map table: a clipboard of evacuation passes. {Team} takes {loot}.`, [['item', 'pass']]), O(0.3, 'item', `A field radio, still working: {loot}.`, [['item', 'radio']]), O(0.25, 'danger', `The officer is still in the tent, sitting very still. Then not still at all. It goes for {r}!`, [['em', 'r']])]),
      safe(`Go straight through`, `Do not touch anything. Things left behind are often left for a reason.`),
      C(`Use the screening station on yourselves`, `Check for bites before the soldiers do.`, [O(1, 'neutral', `The scanner beeps green for everyone who is clean. It is oddly reassuring.`, [['flag', 'screened']])]),
      rush(`Sprint past before anything notices`, `The open ground beyond is dangerous.`, { hurt: 0.1, danger: 0.15, time: 1 }),
    ],
  }),
  E('cp_soldier', {
    npc: ['hollis'],
    cat: 'rescue', loc: 'checkpoint', title: `Private Hollis`,
    text: [`A young soldier is pinned under the overturned truck, conscious and very pale. "Private Hollis," he gasps. "Please. I just need help getting this off my leg."`],
    cast: ['a', 'b?:Medic'], say: [['b', `"His leg is broken. If we lift it, I can splint it."`, 'Medic'], ['a', `"Hang on, Hollis. We have got you."`]],
    choices: [
      C(`Lift the truck together`, `Everyone pushes. It might just move.`, [O(0.6, 'good', `With a huge heave, the truck shifts. Hollis is free. "I can get you through the station gate. I owe you."`, [['npc', 'hollis'], ['flag', 'side_gate'], ['hero']]), O(0.4, 'hurt', `The truck shifts, and drops back. {r} wrenches their back badly, but Hollis is free.`, [['hurt', 'r', 1], ['npc', 'hollis'], ['flag', 'side_gate']])], { major: true }),
      C(`Lever it up with the crowbar`, `A lever beats muscle every time.`, [O(1, 'good', `The crowbar does the work. Hollis slides free. "I owe you everything."`, [['npc', 'hollis'], ['flag', 'side_gate'], ['use', 'tag', 'tool'], ['hero']])], { req: { tags: ['tool'] } }),
      C(`Check him for bites first`, `Make sure before helping.`, [O(0.75, 'good', `No bites. Just a broken leg. You lift the truck together.`, [['npc', 'hollis'], ['flag', 'side_gate']]), O(0.25, 'neutral', `There is a bite on his arm. Hollis sees your faces. "Go," he says quietly. "Just go."`, [['time', -1]])]),
      safe(`Leave him`, `You cannot carry an injured soldier.`, { t: `Hollis does not shout after {team}. That is somehow worse.`, fx: [['flag', 'left_hollis']] }),
      C(`Take his supplies and promise to send help`, `His pack has everything you need.`, [O(1, 'item', `Hollis gives {team} his pack: {loot}. "Tell my sergeant where I am."`, [['loot'], ['flag', 'left_hollis']])]),
      C(`Give him water and ask about the station`, `Help a little, learn a lot.`, [O(1, 'good', `Between sips, Hollis explains: "Mill Lane side gate. Tell them Hollis sent you." He insists he can wait for his unit.`, [['flag', 'side_gate']])]),
    ],
  }),

  // ---------------- SEWERS ----------------
  E('sw_rats', {
    cat: 'humour', loc: 'sewers', title: `The Smell`,
    text: [`The storm drains are knee-deep in water, and the smell is beyond description. A rat swims past {a}, makes eye contact, and keeps going. It seems to know where it is going.`],
    scene: { light: 'dark' }, cast: ['a', 'b?'], say: [['a', `"I have lived a full life. I can accept this."`], ['b', `"That rat has a better sense of direction than all of us."`, 'Sarcastic']],
    choices: [
      C(`Follow the rat`, `It worked with the fox. Maybe.`, [O(0.6, 'good', `The rat leads straight to a ladder. Bless the rat.`, [['time', 1], ['funny']]), O(0.4, 'funny', `The rat leads to a nest of five hundred more rats. Everyone screams and runs the right way by accident.`, [['funny']])]),
      search(`Search the debris caught in the grates`, `Things wash down here from all over the city.`, { item: 0.55, hurt: 0.1, t: { hurt: `{r} cuts a hand on something sharp in the water. Clean it quickly.` } }),
      safe(`Keep wading toward the exit`, `Slow and steady.`),
      C(`Hold your nose and run`, `Get it over with.`, [O(0.65, 'good', `Splashing and gagging, {team} reaches the far grate in record time.`, [['time', 1]]), O(0.35, 'hurt', `{r} slips face-first into the water. Nobody will forget this.`, [['hurt', 'r', 1], ['funny']])]),
      C(`Climb up onto the maintenance ledge`, `Out of the water, at least.`, [O(1, 'neutral', `The ledge is narrow but dry. Mostly.`, [['time', -1]])]),
    ],
  }),
  E('sw_flood', {
    cat: 'hazard', loc: 'sewers', title: `Rising Water`,
    text: [`A rumble overhead. Water starts pouring in from the side tunnels. The drain is flooding, fast. Ahead, a ladder leads up to a manhole. Behind, the way back is already waist-deep.`],
    scene: { light: 'dark', fx: 'water' }, cast: ['a', 'b?:Brave'], say: [['b', `"Everyone up the ladder. I will go last."`, 'Brave'], ['a', `"Move! Move!"`]],
    choices: [
      rush(`Race for the ladder`, `Everyone go, now!`, { hurt: 0.2, danger: 0, time: 1, t: { hurt: `{r} is swept off their feet and slammed into the wall before grabbing the ladder.` } }),
      C(`Link arms and wade together`, `Nobody gets swept away alone.`, [O(0.8, 'good', `Arms linked, {team} wades to the ladder. Nobody lets go.`), O(0.2, 'hurt', `The current is brutal. {r} takes a knock but holds on.`, [['hurt', 'r', 1]])]),
      C(`Tie the rope to the ladder and pull everyone across`, `Rope beats current.`, [O(1, 'good', `The rope holds. Everyone hauls along it to the ladder.`, [['time', 1]])], { req: { items: ['rope'] } }),
      C(`Climb onto the pipes and wait for it to drain`, `Get high and let the water pass.`, [O(0.6, 'neutral', `An hour clinging to a pipe. The water drains away.`, [['time', -2]]), O(0.4, 'hurt', `The pipe groans and gives way. {r} drops into the torrent.`, [['hurt', 'r', 1]])]),
      C(`Try the side tunnel`, `It might be higher ground.`, [O(0.5, 'good', `The side tunnel slopes up to a dry service room with {loot}.`, [['loot']]), O(0.5, 'hurt', `The side tunnel is worse. {r} gets battered by debris getting back.`, [['hurt', 'r', 1]])]),
      C(`Push open the manhole above you`, `There is a manhole right overhead.`, [O(0.6, 'good', `The cover shifts. Everyone scrambles up into the daylight, soaked.`), O(0.4, 'hurt', `The cover drops back onto {r}'s fingers. Agony, but everyone gets out.`, [['hurt', 'r', 1]])]),
    ],
  }),

  // ---------------- ANYWHERE: ZOMBIES ----------------
  E('any_shambler', {
    cat: 'zombie', loc: '*', title: `A Lone Infected`,
    text: [`A single infected stands in a doorway ahead, swaying gently, facing the wall. It has not noticed {team}. Yet. Its jacket says SECURITY.`],
    scene: { z: 1 }, cast: ['a', 'b?'], say: [['b', `"One of them. We can take one of them, right? Right?"`, 'Reckless'], ['b', `"Please let us just sneak past. Please."`, 'Nervous']],
    choices: [
      C(`Sneak past it`, `Silent steps, one by one.`, [O(0.7, 'neutral', `One by one, everyone tiptoes past. It never turns round.`), O(0.3, 'danger', `A crunch of glass under {r}'s foot. It turns.`, [['em', 'r']])]),
      C(`Take it down quietly`, `Surprise is on your side.`, [O(0.6, 'good', `Quick and quiet. It is over before it began. Its pocket held {loot}.`, [['loot'], ['hero']]), O(0.25, 'hurt', `It fights back harder than expected. {r} gets a nasty scratch, not a bite.`, [['hurt', 'r', 1]]), O(0.15, 'danger', `It spins round and grabs {r}!`, [['em', 'r']])]),
      C(`Wait for it to wander off`, `Patience. It will move eventually.`, [O(0.7, 'neutral', `Ten long minutes. It shuffles away down the street.`, [['time', -1]]), O(0.3, 'danger', `It wanders, straight toward {team}'s hiding spot and {r}.`, [['em', 'r']])]),
      C(`Throw something to distract it`, `Lob a can down the street.`, [O(0.75, 'good', `The can clatters away. It follows the noise. Path clear.`), O(0.25, 'danger', `The can bounces off its head. It turns, offended, toward {r}.`, [['em', 'r'], ['funny']])]),
      safe(`Go round the block`, `Avoid it entirely. Takes longer.`, { time: -1 }),
      C(`Quietly take it out with a melee weapon`, `A heavy tool makes this simple.`, [O(1, 'good', `One swing. Done. Nobody needs to talk about it.`, [['use', 'tag', 'melee']])], { req: { tags: ['melee'] } }),
    ],
  }),
  E('any_horde', {
    cat: 'zombie', loc: '*', stage: [8, 40], title: `The Horde`,
    text: [`The ground trembles. Round the corner comes a horde: hundreds of infected, moving as one, a slow tide filling the street from wall to wall. They have not seen {team} yet. They will in about a minute.`],
    scene: { z: 5, light: 'dusk' }, cast: ['a', 'b?'], say: [['a', `"Nobody move. Nobody breathe."`], ['b', `"That is... so many. That is too many."`, 'Nervous'], ['b', `"New plan: we run. That is the plan."`, 'Funny']],
    choices: [
      C(`Hide inside a parked car`, `Get in, lock the doors, get low.`, [O(0.65, 'neutral', `Squashed in the footwell of a hatchback, {team} waits as the horde flows past for twenty minutes.`, [['time', -2]]), O(0.35, 'danger', `One of them presses its face against the window. Right where {r} is.`, [['em', 'r']])]),
      rush(`Run ahead of them`, `Get ahead of the tide before it fills the street.`, { hurt: 0.15, danger: 0.2, time: 1 }),
      C(`Climb up onto a shop awning`, `Get above them and wait.`, [O(0.6, 'neutral', `The awning sags but holds. The horde passes beneath like a river.`, [['time', -1]]), O(0.4, 'hurt', `The awning rips. {r} crashes down onto a bench, just behind the last of the horde.`, [['hurt', 'r', 1]])]),
      C(`Duck into the nearest building`, `Any door, any shop.`, [O(0.5, 'item', `A newsagent. Quiet. Locked from inside. {Team} waits it out and leaves with {loot}.`, [['loot'], ['time', -1]]), O(0.5, 'danger', `A bookmaker's. Not empty. Something in the back goes for {r}.`, [['em', 'r']])]),
      C(`Lead them away with noise`, `Firecrackers on the far side of the street.`, [O(0.85, 'good', `Bang bang bang. The whole horde turns and shuffles after the noise. Brilliant.`, [['use', 'tag', 'noise'], ['time', 1]]), O(0.15, 'danger', `Most of them follow the noise. A few do not. One heads for {r}.`, [['use', 'tag', 'noise'], ['em', 'r']])], { req: { tags: ['noise'] } }),
      C(`Go back the way you came`, `Retreat and find another route.`, [O(1, 'neutral', `{Team} doubles back and finds another way. It costs a lot of time.`, [['time', -3]])]),
    ],
  }),
  E('any_crawler', {
    cat: 'zombie', loc: '*', title: `Under the Car`,
    text: [`Something scrapes on the tarmac. Under a parked van, a crawling infected is reaching out, fingers twitching, inches from {a}'s ankle.`],
    scene: { z: 1 }, cast: ['a', 'b?'], say: [['a', `"Nobody. Move. My. Feet."`], ['b', `"Step away really, really slowly."`, 'Practical']],
    choices: [
      C(`{a} jumps away`, `One big leap.`, [O(0.75, 'good', `{a} jumps like an Olympic athlete. The fingers close on air.`, [['funny']]), O(0.25, 'danger', `A hand grabs {a}'s trainer!`, [['em', 'a']])]),
      C(`Step away slowly`, `No sudden moves.`, [O(0.6, 'neutral', `One slow step. Two. Three. Clear.`), O(0.4, 'danger', `Not slow enough. It lunges for {a}.`, [['em', 'a']])]),
      C(`Kick the van to scare it back`, `Rock the van and see what happens.`, [O(0.5, 'funny', `It retreats under the van, offended. Everyone backs away.`, [['funny']]), O(0.5, 'hurt', `The van's alarm goes off and everyone panics. {r} trips over the kerb.`, [['hurt', 'r', 1]])]),
      safe(`Everyone freeze and wait`, `It can't see well. Let it lose interest.`, { time: -1, t: `After a long minute, the crawler drags itself away. Everybody breathes.` }),
      C(`Pin it with something heavy`, `A wheelie bin on top, then walk away.`, [O(0.7, 'good', `The bin traps it. Job done.`), O(0.3, 'hurt', `The bin tips. {r} lands on the pavement next to it, scraped and shaken.`, [['hurt', 'r', 1]])]),
    ],
  }),
  E('any_bus', {
    cat: 'zombie', loc: '*', stage: [5, 40], title: `The Rattling Bus`,
    text: [`A bus has crashed into a bus stop. Its doors are jammed shut, and it is full. Every window is a face, every face is pressed to the glass, and the whole bus rocks gently as {team} approaches.`],
    scene: { z: 3 }, cast: ['a', 'b?'], say: [['b', `"I think the doors are holding. I really, really hope the doors are holding."`, 'Nervous'], ['a', `"Do not go near the windows."`]],
    choices: [
      rush(`Walk past on the far side of the road`, `As far away as possible.`, { hurt: 0, danger: 0.12, time: 0, t: { ok: `The bus rocks harder as {team} passes. The doors hold.` } }),
      C(`Check the luggage hold underneath`, `Bus luggage holds are separate from the seats.`, [O(0.6, 'item', `The hold is full of suitcases. In one: {loot}.`, [['loot']]), O(0.4, 'danger', `A window cracks above {r} as they kneel by the hold.`, [['em', 'r']])]),
      safe(`Go around through the gardens`, `Back gardens and fences. Slower but hidden.`, { time: -1 }),
      C(`Brace the doors shut`, `Make sure nothing follows.`, [O(1, 'good', `A litter bin jammed through the door handles. Nothing is getting out.`, [['hero']])]),
      C(`Make a joke about the bus being late`, `Somebody has to.`, [O(1, 'funny', `{a}: "Typical. Wait forty minutes and then three full ones turn up at once." Everyone laughs nervously and moves on.`, [['funny']])]),
    ],
  }),

  // ---------------- ANYWHERE: HAZARDS ----------------
  E('any_fire', {
    cat: 'hazard', loc: '*', title: `The Burning Street`,
    text: [`A whole terrace of houses is on fire. Smoke rolls across the road. The heat makes the air shimmer. The only clear way forward goes right past the flames.`],
    scene: { light: 'fire' }, cast: ['a', 'b?'], say: [['a', `"Cover your mouths. Stay low."`], ['b', `"I am so sweaty. This is not a good look."`, 'Funny']],
    choices: [
      rush(`Run past the fire`, `Through the smoke, as fast as possible.`, { hurt: 0.25, danger: 0, time: 1, t: { hurt: `A window bursts in the heat. Glass and sparks hit {r}.` } }),
      safe(`Go a long way round`, `Avoid the fire entirely.`, { time: -2 }),
      C(`Soak your clothes in a puddle and go`, `Wet fabric over your faces.`, [O(0.85, 'good', `Soggy but protected, {team} crosses through the smoke safely.`, [['funny']]), O(0.15, 'hurt', `{r} still gets a nasty lungful of smoke.`, [['hurt', 'r', 1]])]),
      search(`Check the houses that are not burning yet`, `The end of the terrace is still untouched.`, { item: 0.55, hurt: 0.15, t: { hurt: `The roof timbers crack and drop near {r}.` } }),
      C(`Wait for the wind to change`, `Smoke shifts. Be patient.`, [O(0.6, 'good', `The wind turns. A clear path opens through the smoke.`, [['time', -1]]), O(0.4, 'danger', `While waiting, something stumbles out of the smoke, on fire, toward {r}.`, [['em', 'r']])]),
    ],
  }),
  E('any_gas', {
    cat: 'hazard', loc: '*', title: `Gas Leak`,
    text: [`The air smells of rotten eggs. A gas main has burst under the pavement, hissing loudly. Infected are drifting toward the sound. One spark and the whole street goes up.`],
    scene: { z: 2 }, cast: ['a', 'b?:Intelligent'], say: [['b', `"One spark. That is all it would take. We could use that."`, 'Intelligent'], ['a', `"Nobody even think about lighting anything."`]],
    choices: [
      safe(`Back away and go round`, `Not worth it.`, { time: -1 }),
      C(`Lure the infected in and ignite it from a distance`, `Dangerous, explosive, effective.`, [O(0.55, 'good', `A thrown flare, a huge whoomph. The street is clear. Everyone's eyebrows are slightly shorter.`, [['use', 'tag', 'signal'], ['time', 1], ['funny']]), O(0.45, 'hurt', `The blast is bigger than anyone expected. {r} is knocked flat by the shockwave.`, [['use', 'tag', 'signal'], ['hurt', 'r', 1], ['time', 1]])], { req: { tags: ['signal'] } }),
      rush(`Sprint through before it builds up`, `Hold your breath and go.`, { hurt: 0.15, danger: 0.1, time: 1 }),
      C(`Find the shut-off valve`, `It must be nearby.`, [O(0.5, 'good', `{a} finds the valve and cranks it shut. The hissing stops. A small victory.`, [['hero']]), O(0.5, 'danger', `The valve is behind a hedge. So is an infected, and it grabs for {r}.`, [['em', 'r']])]),
      C(`Search the gas company van`, `Tools and kit in the back.`, [O(0.6, 'item', `The van has {loot}.`, [['loot']]), O(0.4, 'neutral', `The van is locked. And a little bit on fire.`)]),
      C(`Tie a rag over your faces and walk through`, `It stinks, but a little gas will not kill you.`, [O(0.75, 'neutral', `Eyes streaming, {team} gets through.`), O(0.25, 'hurt', `{r} gets dizzy and falls against a railing.`, [['hurt', 'r', 1]])]),
    ],
  }),
  E('any_collapse', {
    cat: 'hazard', loc: '*', title: `Weak Floor`,
    text: [`Taking a shortcut through a derelict shop, the floor creaks ominously. Then it sags. Through the gaps in the boards, there is only darkness, and the sound of something moving down in the cellar.`],
    scene: { bg: 'interior', light: 'dim' }, cast: ['a', 'b?'], say: [['a', `"Spread your weight. Walk on the edges."`], ['b', `"How about we walk on literally anything else?"`, 'Sarcastic']],
    choices: [
      C(`Walk along the walls, one at a time`, `Slow and careful.`, [O(0.75, 'neutral', `One by one, along the skirting boards. Everyone crosses.`, [['time', -1]]), O(0.25, 'hurt', `A board snaps. {r} drops a leg into the hole and scrapes it raw.`, [['hurt', 'r', 1]])]),
      rush(`Run across all at once`, `Get over it before it gives.`, { hurt: 0.3, danger: 0.05, time: 1, t: { hurt: `The floor gives way beneath {r}, who drops into the cellar and climbs out bruised.` } }),
      safe(`Turn back and go round outside`, `No floor is worth falling through.`, { time: -1 }),
      C(`Investigate the cellar`, `Things are kept in cellars.`, [O(0.4, 'item', `With a careful climb down: {loot}. And no monster. Just a very large cat.`, [['loot'], ['funny']]), O(0.6, 'danger', `There is a monster. It reaches for {r}'s leg!`, [['em', 'r']])]),
      C(`Lay a door across the gap`, `Make a bridge.`, [O(1, 'good', `A door laid across the weak boards. It works perfectly. Engineering!`, [['time', -1]])]),
    ],
  }),

  // ---------------- ANYWHERE: RESCUES & MORAL ----------------
  E('any_dog', {
    npc: ['biscuit'],
    cat: 'rescue', loc: '*', title: `The Dog in the Car`,
    text: [`A scruffy terrier is trapped in a parked car, barking itself hoarse. Its collar tag says BISCUIT. The noise is drawing attention: figures are beginning to appear at the end of the road.`],
    scene: { z: 2 }, cast: ['a', 'b?'], say: [['b', `"We are taking the dog. This is not a discussion."`, 'Kind'], ['b', `"I would die for Biscuit. I have known Biscuit for four seconds."`, 'Funny'], ['a', `"That barking is going to bring every infected in the city."`]],
    choices: [
      C(`Smash the window and rescue Biscuit`, `A good dog deserves a chance.`, [O(0.7, 'good', `Glass, fur and a lot of licking. Biscuit is free, and very happy about it. Biscuit joins the team.`, [['npc', 'biscuit'], ['hero']]), O(0.3, 'danger', `The glass shatters, Biscuit bolts, and the noise brings an infected straight at {r}.`, [['npc', 'biscuit'], ['em', 'r']])], { major: true }),
      C(`Open the door properly`, `Find the keys, or a way in that is quieter.`, [O(0.5, 'good', `The back door is unlocked. Biscuit hops out and trots after {team} like he always lived with them.`, [['npc', 'biscuit']]), O(0.5, 'neutral', `Locked. The approaching figures force {team} to leave him.`)]),
      safe(`Leave him`, `You cannot save everyone.`, { t: `The barking fades behind {team}. Nobody looks back. Everybody wants to.` }),
      C(`Lure the infected away first`, `Draw them off, then come back for the dog.`, [O(0.5, 'good', `{a} leads the infected round the block while the others free Biscuit.`, [['npc', 'biscuit'], ['time', -1], ['hero']]), O(0.5, 'hurt', `{a} leads them off, but trips on a kerb at the corner and scrapes both knees.`, [['hurt', 'a', 1], ['npc', 'biscuit']])]),
      C(`Feed him through the window gap`, `Calm him down so he stops barking.`, [O(1, 'good', `Biscuit wolfs the food and goes quiet. Then he wriggles out through the gap. Clever dog.`, [['use', 'tag', 'food'], ['npc', 'biscuit']])], { req: { tags: ['food'] } }),
      C(`Talk to Biscuit through the glass`, `Calm him down without opening anything.`, [O(0.5, 'funny', `{a} talks to Biscuit like a hostage negotiator. Biscuit stops barking, impressed. The figures lose interest.`, [['funny']]), O(0.5, 'danger', `Biscuit keeps barking. The figures arrive, and one goes for {r}.`, [['em', 'r']])]),
    ],
  }),
  E('any_vince_meet', {
    npc: ['vince'],
    cat: 'interaction', loc: '*', req: { not: ['npc_vince', 'freed_vince'] }, title: `A Man with a Plan`,
    text: [`A man in a stolen-looking leather jacket steps out of a doorway, hands raised. "Easy, easy. Name is Vince. I know a way to Stonebridge nobody else knows. I just need a group to travel with. Safety in numbers, yeah?"`],
    cast: ['a', 'b?'], say: [['b', `"His watch is still got the price tag on."`, 'Intelligent'], ['b', `"I like him. He has nice teeth."`, 'Funny']],
    choices: [
      C(`Let Vince join you`, `He might know a shortcut. He might not.`, [O(1, 'good', `Vince grins. "You will not regret this." His first shortcut actually works.`, [['npc', 'vince'], ['time', 1]])], { major: true }),
      safe(`Tell him to get lost`, `You do not trust him.`, { t: `Vince shrugs. "Your loss." He vanishes as fast as he appeared.` }),
      C(`Ask Vince to prove himself`, `Information first. Then trust.`, [O(0.6, 'good', `Vince points out a sniper's nest the army abandoned, with {loot} left behind. Fair enough.`, [['loot'], ['npc', 'vince']]), O(0.4, 'bad', `Vince "proves himself" by stealing something from the backpack and running.`, [['lose']])]),
      C(`Search Vince's bag`, `See what he is carrying.`, [O(0.5, 'item', `Vince's bag is full of stolen phones and {loot}. He lets you keep it. "Call it a gift."`, [['loot']]), O(0.5, 'hurt', `Vince does not like his bag being searched. He shoves {r} into a wall and runs.`, [['hurt', 'r', 1]])]),
      C(`Trade with Vince`, `He clearly has goods to sell.`, [O(1, 'item', `Vince sells {team} {loot} for a promise to put in a good word with the army.`, [['loot']])]),
    ],
  }),
  E('vince_twist', {
    npc: ['vince'],
    cat: 'interaction', loc: '*', req: { flags: ['npc_vince'], npcIs: ['vince', 'traitor'] }, stage: [10, 40], title: `Vince's Offer`, major: true,
    text: [`Vince pulls {a} aside, voice low. "Look. The train only takes so many. I heard soldiers say they are turning people away. If we ditch the others, you and me get seats for sure."`],
    cast: ['a', 'b?'], say: [['a', `"Vince, are you serious?"`]],
    choices: [
      C(`Refuse and tell everyone`, `No secrets in this group.`, [O(0.5, 'neutral', `Vince laughs it off. "Joking! Obviously." Nobody laughs back. He leaves that night.`, [['npcgone', 'vince'], ['lose']]), O(0.5, 'good', `Vince looks ashamed. "You are right. I am sorry." He stays, and he means it this time.`, [['flag', 'vince_redeemed']])]),
      C(`Pretend to agree, then warn the others`, `Keep him close and watch him.`, [O(1, 'good', `The group keeps a careful eye on Vince. He knows it. He behaves.`, [['flag', 'vince_watched']])]),
      C(`Kick Vince out right now`, `No traitors.`, [O(1, 'neutral', `Vince storms off with a bag of {team}'s supplies.`, [['npcgone', 'vince'], ['lose']])]),
      C(`Agree to his plan`, `Survival is survival.`, [O(1, 'bad', `{a} nods. Vince smiles. That smile is the last honest thing about him.`, [['flag', 'vince_deal']])], { major: true }),
      C(`Ask what he really wants`, `There is always something more.`, [O(1, 'good', `Vince admits he has a daughter waiting at Stonebridge. Everything he did was for her. He stays loyal.`, [['flag', 'vince_redeemed']])]),
    ],
  }),
  E('any_trapped', {
    npc: ['higgins'],
    cat: 'rescue', loc: '*', req: { not: ['npc_higgins'] }, title: `Mr Higgins`,
    text: [`"Up here! Help!" An elderly man is waving from a first-floor balcony. The stairwell below him is full of infected. "Name's Higgins! I know these streets like the back of my hand! Get me down and I will show you the way!"`],
    scene: { z: 2 }, cast: ['a', 'b?'], say: [['b', `"He looks like my grandad. We are helping him."`, 'Kind'], ['b', `"He looks like he could fight a bear. We are helping him."`, 'Funny']],
    choices: [
      C(`Help him climb down the drainpipe`, `Talk him down slowly.`, [O(0.6, 'good', `Higgins comes down the drainpipe like a commando. "Royal Marines, '74." He points to a shortcut.`, [['npc', 'higgins'], ['time', 1], ['hero']]), O(0.4, 'hurt', `Higgins slips. {a} catches him and they both land in a heap. {a} takes the worst of it.`, [['hurt', 'a', 1], ['npc', 'higgins']])], { major: true }),
      C(`Throw him the rope`, `Tie it off and lower him.`, [O(1, 'good', `Higgins abseils down like it is nothing. "Thank you kindly. Now, follow me."`, [['npc', 'higgins'], ['time', 1]])], { req: { items: ['rope'] } }),
      C(`Clear the stairwell`, `Go in and fight through.`, [O(0.4, 'good', `{Team} clears the stairwell. Higgins walks out the front door and shakes everyone's hand.`, [['npc', 'higgins'], ['hero']]), O(0.6, 'danger', `There are more infected than anyone counted. One goes for {r}!`, [['em', 'r'], ['npc', 'higgins']])]),
      safe(`Call up that you will send help`, `You cannot risk it.`, { t: `"I will be here!" calls Higgins cheerfully. "Not going anywhere!"` }),
      C(`Ask him for directions from where he is`, `He can see the whole street from up there.`, [O(1, 'good', `"Left at the church, right at the chippy, under the railway bridge!" Higgins waves them off.`, [['time', 1]])]),
      C(`Distract the infected so he can escape`, `Lure them out of the stairwell.`, [O(0.55, 'good', `{a} bangs a bin lid. The infected pour out after the noise and Higgins slips out the back. "Much obliged!"`, [['npc', 'higgins'], ['hero']]), O(0.45, 'danger', `They pour out, faster than expected, toward {r}.`, [['em', 'r'], ['npc', 'higgins']])]),
    ],
  }),
  E('higgins_shortcut', {
    npc: ['higgins'],
    cat: 'interaction', loc: '*', req: { flags: ['npc_higgins'] }, title: `Higgins Knows a Way`,
    text: [`Mr Higgins stops, sniffs the air, and taps his nose. "Smell that? Bakery. Bakery means the old Granary Passage. Nobody knows about it but me and the rats."`],
    cast: ['a'], say: [['a', `"Mr Higgins, you are a legend."`]],
    choices: [
      C(`Follow Higgins through the passage`, `Trust the old man.`, [O(0.8, 'good', `The Granary Passage cuts through three streets. Higgins is unstoppable.`, [['time', 2], ['shortcut', 1]]), O(0.2, 'hurt', `The passage is low. {r} cracks their head on a beam, but it saves loads of time.`, [['hurt', 'r', 1], ['time', 2]])]),
      C(`Ask Higgins for war stories`, `Morale matters.`, [O(1, 'funny', `Higgins tells a story about fighting a goose in 1977. Everyone is crying with laughter.`, [['funny'], ['time', -1]])]),
      safe(`Stick to the main road`, `Just in case.`),
      C(`Raid the bakery first`, `Bakeries have flour, sugar and first aid kits.`, [O(0.6, 'item', `Stale bread and {loot}.`, [['loot']]), O(0.4, 'neutral', `Empty. But it smells amazing.`)]),
      C(`Let Higgins rest`, `He is old. He is tired. So is everyone.`, [O(1, 'good', `A short rest on a bench. Everyone recovers a little.`, [['heal', 'injured', 1], ['time', -1]])]),
    ],
  }),
  E('biscuit_warns', {
    npc: ['biscuit'],
    cat: 'interaction', loc: '*', req: { flags: ['npc_biscuit'] }, title: `Biscuit Growls`,
    text: [`Biscuit stops dead. His hackles rise. A low growl rumbles in his chest. He is staring at a dark doorway ahead.`],
    scene: { z: 1 }, cast: ['a', 'b?'], say: [['a', `"Good boy. What do you see?"`], ['b', `"I trust Biscuit with my life. Literally."`, 'Funny']],
    choices: [
      safe(`Trust Biscuit and go another way`, `Dogs know.`, { time: -1, t: `As {team} turns away, three infected stagger out of the doorway. Biscuit saved everyone.`, fx: [['hero']] }),
      C(`Let Biscuit lead the way`, `He seems to know where to go.`, [O(1, 'good', `Biscuit trots ahead and finds a safe gap through the gardens.`, [['time', 1]])]),
      C(`Investigate the doorway`, `Maybe it is something good.`, [O(0.3, 'item', `It is a cat. Biscuit is furious. Behind the cat: {loot}.`, [['loot'], ['funny']]), O(0.7, 'danger', `Biscuit was right. It lunges for {r}!`, [['em', 'r']])]),
      C(`Give Biscuit a treat`, `Good boys deserve treats.`, [O(1, 'funny', `Biscuit eats the treat, does a little spin, and finds {loot} in a hedge.`, [['use', 'tag', 'food'], ['loot'], ['funny']])], { req: { tags: ['food'] } }),
      C(`Wait and watch`, `See what comes out.`, [O(0.6, 'neutral', `Nothing comes out. Biscuit relaxes. Weird.`, [['time', -1]]), O(0.4, 'danger', `Something comes out, fast, straight at {r}.`, [['em', 'r']])]),
      C(`Pick Biscuit up and run`, `Carry the dog. Go fast.`, [O(0.7, 'good', `Biscuit is heavier than he looks, but very happy to be carried. Time saved.`, [['time', 1], ['funny']]), O(0.3, 'hurt', `Biscuit wriggles free. {r} trips over him.`, [['hurt', 'r', 1], ['funny']])]),
    ],
  }),
  E('marta_patch', {
    npc: ['marta'],
    cat: 'interaction', loc: '*', req: { flags: ['npc_marta'], injured: true }, title: `Marta's Clinic`,
    text: [`Marta stops the group in a quiet shop doorway. "Right. Everyone who is bleeding, sit down. Everyone who is not, keep watch. No arguments."`],
    cast: ['a'], say: [['a', `"Yes, Marta."`]],
    choices: [
      C(`Let Marta treat everyone`, `Takes time, but she is good.`, [O(1, 'good', `Marta works like a machine. Everyone is patched up.`, [['heal', 'all', 1], ['time', -2]])]),
      C(`Treat only the worst injury`, `Quick fix, keep moving.`, [O(1, 'good', `Marta fixes the worst wound in five minutes flat.`, [['heal', 'injured', 2], ['time', -1]])]),
      safe(`Keep moving. No time.`, `Marta disapproves, loudly.`, { t: `"Fine. Bleed, then," says Marta. She is not happy.` }),
      C(`Ask Marta to teach first aid`, `Learn while she works.`, [O(1, 'good', `Marta shows everyone how to tie a proper bandage. She gives them a spare.`, [['heal', 'injured', 1], ['item', 'bandages'], ['time', -1]])]),
      C(`Ask Marta about her family`, `She has been strong for everyone else.`, [O(1, 'neutral', `Marta's sister works at the evacuation centre. She is going to Stonebridge too. She smiles for the first time.`, [['heal', 'injured', 1], ['time', -1]])]),
    ],
  }),
  E('any_injured_stranger', {
    npc: ['stranger'],
    cat: 'moral', loc: '*', title: `The Bitten Stranger`, major: true,
    text: [`A woman sits against a wall, clutching her forearm. Blood seeps through her fingers. "It is just a cut," she says. "Please. I just need a bandage. Please." Her eyes are already starting to cloud.`],
    cast: ['a', 'b?'], say: [['b', `"That is a bite. That is definitely a bite."`, 'Intelligent'], ['b', `"We cannot just leave her."`, 'Kind']],
    choices: [
      C(`Give her a bandage and leave`, `A kindness that costs you something.`, [O(1, 'neutral', `{a} wraps her arm and squeezes her hand. "Thank you," she whispers. {Team} leaves her in peace.`, [['use', 'tag', 'medical'], ['hero']])], { req: { tags: ['medical'] } }),
      safe(`Walk away`, `She is bitten. There is nothing you can do.`, { t: `It is the hardest thing {team} has done today.` }),
      C(`Stay with her until the end`, `No one should be alone at the end.`, [O(0.7, 'neutral', `{a} sits with her. She talks about her garden. When she goes quiet, {team} leaves.`, [['time', -2]]), O(0.3, 'danger', `She turns faster than anyone expected, lunging at {r}!`, [['em', 'r']])]),
      C(`Ask her what she knows`, `She might have seen something useful.`, [O(1, 'good', `"Stonebridge... side gate... soldiers let people through at Mill Lane." She closes her eyes.`, [['flag', 'side_gate']])]),
      C(`Search her bag`, `She will not need it.`, [O(0.7, 'item', `Her bag has {loot}. She does not protest. She cannot any more.`, [['loot']]), O(0.3, 'danger', `She grabs {r}'s wrist as they reach for the bag!`, [['em', 'r']])]),
      C(`Promise to send soldiers back for her`, `A kind lie, or a real promise.`, [O(1, 'neutral', `She smiles. "Thank you." She knows. Everyone knows.`)]),
    ],
  }),

  // ---------------- ANYWHERE: INTERACTIONS & HUMOUR ----------------
  E('any_argue', {
    cat: 'interaction', loc: '*', title: `Which Way?`,
    text: [`At a crossroads, {a} and {b} disagree about the route. Loudly. {a} wants the shortcut through the estate. {b} wants the long, well-lit main road.`],
    cast: ['a', 'b'], say: [['a', `"It is faster! Trust me!"`], ['b', `"Trust you? You got us lost in a car park this morning."`]],
    choices: [
      rush(`Go with {a}: the shortcut`, `Faster, but darker.`, { hurt: 0.12, danger: 0.12, time: 1 }),
      safe(`Go with {b}: the main road`, `Slower, but you can see what is coming.`, { time: -1 }),
      C(`Settle it with rock, paper, scissors`, `Democracy in a crisis.`, [O(0.5, 'funny', `{a} throws rock. {b} throws scissors. {a} celebrates for far too long. Shortcut it is.`, [['funny'], ['time', 1]]), O(0.5, 'funny', `{b} wins with paper and does a victory lap. Main road it is.`, [['funny'], ['time', -1]])]),
      C(`Split up and meet on the other side`, `Two routes, two groups.`, [O(0.55, 'good', `Both groups arrive at the same time. Nobody admits who was right.`), O(0.25, 'danger', `One group runs into trouble. Something comes for {r}!`, [['em', 'r']]), O(0.2, 'item', `The shortcut group found {loot} on the way.`, [['loot']])]),
      C(`Check the map`, `Settle it with facts.`, [O(1, 'good', `The map shows a third route nobody thought of. Faster AND safer.`, [['time', 1]])], { req: { items: ['map'] } }),
      C(`Tell them both to stop shouting`, `The noise is the real danger.`, [O(0.7, 'good', `Silence. Then a group decision, made in whispers.`), O(0.3, 'danger', `Too late. The argument attracted something. It goes for {r}.`, [['em', 'r']])]),
    ],
  }),
  E('any_cafe', {
    cat: 'interaction', loc: '*', title: `The Quiet Café`,
    text: [`A little café with its shutters half down. Inside, it is dim and still. A tin of biscuits sits on the counter. For the first time all day, it is quiet enough to think.`],
    scene: { bg: 'interior', light: 'dim' }, cast: ['a', 'b?'], say: [['a', `"Five minutes. Just five minutes of sitting down."`], ['b', `"Is it weird that I miss my boring job?"`]],
    choices: [
      C(`Rest properly`, `Sit down, eat, breathe.`, [O(0.85, 'good', `Biscuits, water and ten minutes of rest. Everyone feels a little better.`, [['heal', 'injured', 1], ['time', -2]]), O(0.15, 'danger', `The kitchen door swings open. The chef never left. He comes for {r}.`, [['em', 'r']])]),
      search(`Search the kitchen and storeroom`, `Cafés stock first aid kits by law.`, { item: 0.6, hurt: 0.05, danger: 0.08 }),
      C(`Share stories about home`, `Remember what you are fighting for.`, [O(1, 'funny', `{a} tells the story of the worst holiday ever. By the end, everyone is laughing so hard they cry.`, [['funny'], ['time', -1]])]),
      safe(`Grab the biscuits and go`, `No time for sitting down.`, { fx: [['item', 'tinned_food']], t: `Biscuits in the backpack. Back on the road.` }),
      C(`Make a plan for the rest of the route`, `Use the quiet to think properly.`, [O(1, 'good', `Ten minutes with a napkin map. The route is clearer now.`, [['time', 1]])]),
    ],
  }),
  E('any_mannequin', {
    cat: 'humour', loc: '*', title: `Ambush!`,
    text: [`A figure looms in a shop window. {a} screams and swings at it with everything they have. The figure falls. It is a mannequin in a wedding dress. Its head rolls slowly into the gutter.`],
    cast: ['a', 'b?'], say: [['a', `"It moved. I swear it moved."`], ['b', `"You have defeated the bride. Congratulations."`, 'Sarcastic'], ['b', `"Honestly, good reflexes though."`, 'Brave']],
    choices: [
      C(`Laugh it off`, `Everyone needs a laugh.`, [O(0.8, 'funny', `Everyone laughs until it hurts. {a} will never live this down.`, [['funny']]), O(0.2, 'danger', `The laughter is too loud. A real infected comes round the corner toward {r}.`, [['em', 'r'], ['funny']])]),
      search(`Search the bridal shop`, `Wedding shops have sewing kits, scissors, and tea.`, { item: 0.45, hurt: 0, t: { item: `Behind the counter, among the veils: {loot}.` } }),
      C(`Hold a funeral for the mannequin`, `It deserves a send-off.`, [O(1, 'funny', `{a} gives a moving eulogy. The mannequin is laid to rest in a wheelie bin.`, [['funny'], ['time', -1]])]),
      safe(`Move on quickly before anything heard`, `That scream was very loud.`),
      C(`Wear the veil as a disguise`, `Maybe they cannot see you in white?`, [O(1, 'funny', `{a} wears the veil for a whole street. It does nothing. It is magnificent.`, [['funny']])]),
    ],
  }),
  E('any_icecream', {
    cat: 'humour', loc: '*', title: `Greensleeves`,
    text: [`An ice-cream van sits in the middle of the road, its chimes playing "Greensleeves" on an endless loop. Infected are drifting toward it from every direction, like it is a summer's day.`],
    scene: { z: 3 }, cast: ['a', 'b?'], say: [['a', `"We could use that as a distraction."`], ['b', `"I want a 99 Flake so badly it hurts."`, 'Foodie']],
    choices: [
      C(`Use the chimes as cover and sneak past`, `They are all watching the van.`, [O(0.8, 'good', `{Team} slips past while every infected stares lovingly at the van.`, [['time', 1]]), O(0.2, 'danger', `One of them is not interested in ice cream. It turns toward {r}.`, [['em', 'r']])]),
      C(`Steal ice cream from the van`, `Worth it. Absolutely worth it.`, [O(0.5, 'funny', `Three choc ices and a very sticky escape. Best decision all day.`, [['funny'], ['item', 'tinned_food']]), O(0.5, 'danger', `The infected are closer than they looked. One reaches for {r}, ice cream in hand.`, [['em', 'r'], ['funny']])]),
      C(`Drive the van away to lure them off`, `Take the party with you.`, [O(0.5, 'good', `{a} drives the van slowly round the corner, chimes blaring. Dozens follow it. {a} jumps out and runs back. Hero.`, [['hero'], ['funny'], ['time', 1]]), O(0.5, 'hurt', `The van will not go above five miles an hour. {a} has to jump out and sprint, scraping an arm on the kerb.`, [['hurt', 'a', 1], ['funny']])]),
      safe(`Go round the block`, `Leave the ice-cream party alone.`, { time: -1 }),
      C(`Switch off the chimes`, `That noise is a nightmare.`, [O(0.4, 'good', `Silence. The infected wander off, confused.`), O(0.6, 'danger', `The chimes stop. Every head turns, toward {r}.`, [['em', 'r']])]),
    ],
  }),
  E('any_trolley', {
    cat: 'humour', loc: '*', title: `The Trolley`,
    text: [`At the top of a long hill, {a} finds an abandoned shopping trolley and looks at it with the gleam of genius in their eye.`],
    cast: ['a', 'b?'], say: [['a', `"Hear me out."`], ['b', `"No. No. Absolutely not. ...How fast do you think it goes?"`, 'Reckless']],
    choices: [
      C(`Ride the trolley down the hill`, `It is technically transport.`, [O(0.55, 'funny', `{a} flies down the hill at incredible speed, whooping. The fastest anyone has travelled all day.`, [['funny'], ['time', 1]]), O(0.45, 'hurt', `The trolley hits a pothole. {a} goes over the front. Spectacularly.`, [['hurt', 'a', 1], ['funny']])]),
      C(`Use it to carry supplies`, `A sensible use for a trolley.`, [O(1, 'good', `The trolley makes carrying easier. Until a wheel falls off a street later.`)]),
      safe(`Walk down like normal people`, `Boring, but you keep your teeth.`),
      C(`Push someone else in it`, `Someone needs a rest.`, [O(1, 'funny', `{a} pushes the most tired person in the trolley. They nap. It is weirdly wholesome.`, [['funny'], ['heal', 'injured', 1]])]),
      C(`Search the bushes where it came from`, `Where there is a trolley, there is a shop.`, [O(0.6, 'item', `A dropped shopping bag. Inside: {loot}.`, [['loot']]), O(0.4, 'neutral', `Just more trolleys.`)]),
    ],
  }),
  E('any_confession', {
    cat: 'interaction', loc: '*', title: `Confession`,
    text: [`While catching their breath behind a wall, {a} quietly admits something. "I have never actually been to Stonebridge. I have no idea where it is. I have been following everyone else this whole time."`],
    cast: ['a', 'b'], say: [['b', `"WE have been following YOU."`], ['a', `"Oh."`]],
    choices: [
      C(`Ask a street sign`, `They are everywhere.`, [O(1, 'funny', `There is a big brown sign: STONEBRIDGE STATION, 2 MILES, with an arrow. Everyone pretends this was the plan.`, [['funny']])]),
      C(`Climb a lamp post to look`, `Get a view of the skyline.`, [O(0.7, 'good', `From the top of the lamp post: the station floodlights. Back on track.`), O(0.3, 'hurt', `{a} gets halfway up and slides down. Ouch.`, [['hurt', 'a', 1], ['funny']])]),
      C(`Use the map`, `That is what it is for.`, [O(1, 'good', `The map shows exactly where to go. Everyone stares at {a}.`, [['time', 1], ['funny']])], { req: { items: ['map'] } }),
      safe(`Follow the helicopters`, `They are all flying the same direction.`),
      C(`Have a group hug`, `It is been a long day.`, [O(1, 'funny', `A very awkward group hug behind a wall. Morale up. Dignity down.`, [['funny'], ['heal', 'injured', 1], ['time', -1]])]),
      C(`Blame {a} loudly`, `Someone has to.`, [O(1, 'funny', `Five minutes of gentle roasting. {a} takes it well. Then everyone admits they did not know the way either.`, [['funny'], ['time', -1]])]),
    ],
  }),

  // ---------------- ANYWHERE: DISCOVERIES ----------------
  E('any_backpack', {
    cat: 'item', loc: '*', title: `The Fallen Survivor`,
    text: [`A backpack lies in the road beside a bicycle with a buckled wheel. Its owner is nowhere to be seen. A note pinned to the strap reads: "If found, please use it well."`],
    cast: ['a'], say: [['a', `"They wanted it to be useful. Let us make it useful."`]],
    choices: [
      C(`Take the backpack`, `Respect the note.`, [O(1, 'item', `Inside: {loot}, and a photo of a smiling family.`, [['loot']])]),
      C(`Take the backpack and the bike`, `The bike might be fixable.`, [O(0.5, 'item', `The bike is beyond saving, but the backpack has {loot}.`, [['loot']]), O(0.5, 'hurt', `The bike chain snaps across {r}'s hand.`, [['hurt', 'r', 1], ['loot']])]),
      safe(`Leave it for someone who needs it more`, `Somebody else might be desperate.`, { t: `{a} adds a line to the note: "We left it for you. Good luck."`, fx: [['hero']] }),
      C(`Check the area for the owner`, `They might be hurt nearby.`, [O(0.4, 'good', `The owner is hiding in a phone box. Alive. She thanks {team} and shares {loot}.`, [['loot'], ['hero']]), O(0.6, 'danger', `The owner is nearby. She is not alive. Not exactly. She goes for {r}.`, [['em', 'r']])]),
      C(`Take just what you need`, `Leave something behind for the next person.`, [O(1, 'item', `{a} takes {loot} and leaves the rest.`, [['loot']])]),
    ],
  }),
  E('any_police_car', {
    cat: 'item', loc: '*', title: `Abandoned Patrol Car`,
    text: [`A police car sits with its doors open and its lights still spinning silently. The radio crackles with fragments: "...Stonebridge... final... all units..."`],
    cast: ['a', 'b?'], say: [['b', `"Imagine if we stole a police car. Imagine."`, 'Reckless']],
    choices: [
      search(`Search the boot`, `Patrol cars carry first aid kits, flares and more.`, { item: 0.75, hurt: 0, danger: 0.1, t: { item: `The boot holds {loot}, neatly packed.` } }),
      C(`Listen to the radio`, `There might be news.`, [O(0.6, 'good', `"...side gate, Mill Lane, civilians admitted..." Useful.`, [['flag', 'side_gate']]), O(0.4, 'neutral', `Just static and someone saying "copy" over and over.`)]),
      C(`Try to drive it`, `Siren off, of course.`, [O(0.3, 'good', `It starts! A few streets of driving before the road is blocked. Time saved.`, [['time', 2]]), O(0.4, 'neutral', `No keys. Of course.`), O(0.3, 'danger', `The siren goes off by accident. Very loud. Something charges at {r}.`, [['em', 'r'], ['funny']])]),
      safe(`Leave it alone`, `Do not touch police property.`),
      C(`Switch off the lights`, `They are drawing attention.`, [O(1, 'neutral', `Lights off. The street goes darker and somehow safer.`)]),
    ],
  }),
  E('any_radio_chatter', {
    cat: 'interaction', loc: '*', req: { tags: ['radio'] }, title: `Radio Chatter`,
    text: [`The walkie-talkie crackles to life: "This is Stonebridge Command. Final train departs on schedule. Civilian side gate on Mill Lane remains open. Repeat, Mill Lane."`],
    cast: ['a'], say: [['a', `"Mill Lane. Everyone remember that."`]],
    choices: [
      C(`Reply and ask for help`, `Tell them you are coming.`, [O(0.5, 'good', `"Copy, civilians. We will look out for you. Command out."`, [['flag', 'side_gate'], ['flag', 'heli_contact']]), O(0.5, 'neutral', `Nobody replies. But the message repeats.`, [['flag', 'side_gate']])]),
      safe(`Just listen`, `Save the battery.`, { fx: [['flag', 'side_gate']], t: `Mill Lane. The side gate. Everyone memorises it.` }),
      C(`Scan other frequencies`, `Who else is out there?`, [O(0.5, 'good', `Another group of survivors is heading for Stonebridge too. They warn about a horde on the main road.`, [['time', 1]]), O(0.5, 'funny', `A man is reading the football scores. To nobody. Forever.`, [['funny']])]),
      C(`Ask for a medical evacuation`, `Someone is hurt.`, [O(1, 'neutral', `"Negative. Get to the train." Short and harsh.`)], { req: { injured: true } }),
      C(`Turn it off`, `The noise could attract them.`, [O(1, 'neutral', `Silence. Better safe.`)]),
      C(`Ask about other survivors`, `Who else is coming?`, [O(1, 'neutral', `"Two hundred civilians processed. Room for more. Hurry." Then static.`)]),
    ],
  }),
  E('any_map_route', {
    cat: 'interaction', loc: '*', req: { items: ['map'] }, title: `The Map`,
    text: [`{a} unfolds the city map on the bonnet of a car. Someone has drawn on it in biro: a wobbly line from the river to Stonebridge, and the words "SAFE ROUTE?? — Jo".`],
    cast: ['a'], say: [['a', `"Jo, whoever you are, I hope you were right."`]],
    choices: [
      C(`Follow Jo's route`, `Trust a stranger's biro.`, [O(0.7, 'good', `Jo's route is quiet and clever. Thank you, Jo.`, [['time', 2]]), O(0.3, 'hurt', `Jo's route goes over a fence. {r} does not land well.`, [['hurt', 'r', 1], ['time', 1]])]),
      safe(`Use the map to stay on main roads`, `Safe and well-lit.`),
      C(`Look for supply points on the map`, `Pharmacies and shops along the way.`, [O(0.7, 'item', `A pharmacy, two streets over. {Team} grabs {loot}.`, [['loot'], ['time', -1]]), O(0.3, 'neutral', `The pharmacy was raided clean.`, [['time', -1]])]),
      C(`Plan the final approach`, `Work out how to get into the station.`, [O(1, 'good', `The map shows Mill Lane right next to the station. That is the way in.`, [['flag', 'side_gate']])]),
      C(`Fold the map into a paper hat`, `Morale.`, [O(1, 'funny', `{a} wears the map as a hat for a full minute, then unfolds it again, slightly ruined.`, [['funny']])]),
    ],
  }),

  // ---------------- EMERGENCIES ----------------
  E('em_lunge', {
    cat: 'emergency', loc: '*', essential: true, repeat: true, title: `It Lunges!`,
    text: [`An infected bursts out of nowhere and lunges at {t}! Its hands are grasping, its teeth bared, just a metre away.`],
    scene: { z: 1, light: 'alert' }, cast: ['t!', 'h?'], say: [['h', `"{t}! Watch out!"`], ['t', `"Get it off! Get it off!"`, 'Nervous']],
    choices: [
      C(`{t} shoves it away and runs`, `Push and sprint.`, [O(0.62, 'good', `{t} shoves with everything they have. It stumbles. {t} runs. Safe.`), O(0.2, 'hurt', `{t} shoves it away, but it rakes their arm with its nails.`, [['hurt', 't', 1]]), O(0.08, 'infect', `{t} gets away, but there is a scratch on their wrist that will not stop bleeding. It looks... wrong.`, [['hurt', 't', 1], ['infect', 't']]), O(0.1, 'death', `It holds on. Its teeth find {t}'s shoulder.`, [['bite', 't']])]),
      C(`Fight it off together`, `Everyone piles in.`, [O(0.7, 'good', `{Team} drags it off {t} and puts it down. Shaken, but whole.`, [['hero']]), O(0.22, 'hurt', `They win, but someone takes a nasty hit in the scrap. {r} is hurt.`, [['hurt', 'r', 1]]), O(0.08, 'death', `In the chaos, it bites {t}.`, [['bite', 't']])], { req: { minAlive: 2 } }),
      C(`{t} ducks and rolls`, `Get under the grab.`, [O(0.55, 'good', `{t} rolls under its arms like an action hero. Nobody is more surprised than {t}.`, [['funny']]), O(0.35, 'hurt', `{t} rolls straight into a lamp post.`, [['hurt', 't', 1], ['funny']]), O(0.1, 'death', `{t} rolls, and it falls on top of them. It bites.`, [['bite', 't']])]),
      C(`Throw something to distract it`, `Anything loud or shiny.`, [O(0.5, 'good', `A hurled bottle smashes behind it. It turns, and {t} slips away.`), O(0.4, 'hurt', `It barely flinches. {t} has to wrestle free and gets battered.`, [['hurt', 't', 2]]), O(0.1, 'death', `It does not even look. It bites {t}.`, [['bite', 't']])]),
      C(`Run and leave {t}`, `Save yourselves.`, [O(0.5, 'hurt', `{t} escapes alone, hurt, and catches up later, furious and silent.`, [['hurt', 't', 1]]), O(0.25, 'good', `{t} escapes on their own and catches up. Nobody can look them in the eye.`), O(0.25, 'death', `{t} is not fast enough. The others hear it happen.`, [['bite', 't']])], { req: { minAlive: 2 }, major: true }),
      C(`{t} grabs the nearest thing and swings`, `A bin lid, a bottle, anything.`, [O(0.55, 'good', `{t} swings a bin lid like a shield and a weapon at once. It goes down.`, [['hero']]), O(0.35, 'hurt', `The swing connects, but not before it scratches {t}.`, [['hurt', 't', 1]]), O(0.1, 'death', `The swing misses. It does not.`, [['bite', 't']])]),
      C(`{t} hides behind a car`, `Break line of sight.`, [O(0.55, 'good', `{t} dives behind a car and stays absolutely still. It loses interest.`), O(0.35, 'hurt', `It finds {t} and swipes before they scramble away.`, [['hurt', 't', 1]]), O(0.1, 'death', `It finds {t}. There is nowhere left to go.`, [['bite', 't']])]),
      companionRescue,
    ],
    uses: {
      gun: U(`BANG. {t} is saved, the infected drops. But the gunshot echoes off every building for streets around.`, [['next', 'lto_gun_echo'], ['hero']]),
      melee: U(`One heavy swing and it goes down. {t} is safe.`, [['hero']]),
      noise: U(`A screaming firecracker bounces away down the street. The infected spins after it, and {t} runs free.`, []),
      light: U(`A blaze of light in its face. It reels back, blinded, and {t} gets clear.`, []),
    },
  }),
  E('em_grab', {
    cat: 'emergency', loc: '*', essential: true, repeat: true, title: `Grabbed!`,
    text: [`Hands burst through a broken fence and seize {t}'s leg! {t} goes down hard, and the hands are pulling, dragging {t} toward the gap.`],
    scene: { z: 2, light: 'alert' }, cast: ['t!', 'h?'], say: [['h', `"Hold on! I have got you!"`], ['t', `"It has my leg! It HAS MY LEG!"`]],
    choices: [
      C(`Pull {t} free`, `Everyone grab an arm and heave.`, [O(0.68, 'good', `A desperate tug of war, and {t} comes free, minus one trainer.`, [['funny']]), O(0.17, 'hurt', `{t} comes free, but their leg is badly scraped on the fence.`, [['hurt', 't', 1]]), O(0.07, 'infect', `{t} comes free, but its nails broke the skin. The scratch is already turning dark.`, [['hurt', 't', 1], ['infect', 't']]), O(0.08, 'death', `Another one reaches through the gap. It bites {t}'s ankle.`, [['bite', 't']])], { req: { minAlive: 2 } }),
      C(`{t} kicks with the other leg`, `Stamp until it lets go.`, [O(0.6, 'good', `Three hard kicks and it lets go. {t} scrambles away.`), O(0.32, 'hurt', `It lets go, but it got a good scratch in first.`, [['hurt', 't', 1]]), O(0.08, 'death', `It does not let go. It pulls {t}'s leg through and bites.`, [['bite', 't']])]),
      C(`{t} slips out of the shoe`, `Wriggle the foot free.`, [O(0.55, 'funny', `{t} pops free of their trainer. The infected is left holding a size 9. {t} limps on in one sock.`, [['funny']]), O(0.35, 'hurt', `{t} twists free, but wrenches their ankle doing it.`, [['hurt', 't', 1]]), O(0.1, 'death', `The shoe will not come off. Neither will the hand.`, [['bite', 't']])]),
      C(`Smash the hands with a brick`, `Hit them until they let go.`, [O(0.55, 'good', `Bricks are very effective. {t} is free.`), O(0.35, 'hurt', `A brick slips and hits {t}'s foot. Ouch. But they are free.`, [['hurt', 't', 1], ['funny']]), O(0.1, 'death', `The fence gives way. They pour through, onto {t}.`, [['bite', 't']])]),
      C(`Leave {t} and run`, `Save yourselves.`, [O(0.5, 'hurt', `{t} gets free alone and limps after the group, badly hurt.`, [['hurt', 't', 2]]), O(0.5, 'death', `By the time anyone looks back, it is too late for {t}.`, [['bite', 't']])], { req: { minAlive: 2 }, major: true }),
      C(`{t} plays dead`, `Go limp. Maybe it loses interest.`, [O(0.45, 'funny', `{t} goes completely floppy. Confused, it lets go to grab something more lively. {t} crawls away.`, [['funny']]), O(0.43, 'hurt', `It does not lose interest. {t} has to fight free, badly scratched.`, [['hurt', 't', 1]]), O(0.12, 'death', `Playing dead does not work. It bites.`, [['bite', 't']])]),
      C(`{t} grabs the fence and holds on`, `Brace and pull back.`, [O(0.55, 'good', `{t} hauls against the fence until the grip slips.`), O(0.35, 'hurt', `{t} gets free with deep scratches down one shin.`, [['hurt', 't', 1]]), O(0.1, 'death', `The grip does not slip. Something bites through {t}'s jeans.`, [['bite', 't']])]),
      companionRescue,
    ],
    uses: {
      gun: U(`Two shots through the gap. The hands go limp. {t} is free, but the shots ring out across the city.`, [['next', 'lto_gun_echo'], ['hero']]),
      melee: U(`A heavy blow across the arms and {t} is free.`, [['hero']]),
      rope: U(`A loop of rope round {t}'s waist and everyone hauls. {t} shoots free like a cork from a bottle.`, [['funny']], { consume: 0 }),
      tool: U(`The crowbar pries the fence panel shut on the grasping arms. {t} pulls free.`, []),
    },
  }),
  E('em_surround', {
    cat: 'emergency', loc: '*', essential: true, repeat: true, title: `Cut Off!`,
    text: [`{t} wanders a few metres ahead to check a side street and is suddenly surrounded: three infected, closing in from three directions. {t} is trapped against a shop window.`],
    scene: { z: 3, light: 'alert' }, cast: ['t!', 'h?'], say: [['h', `"{t}! Hold on!"`], ['t', `"Little help? Little help would be great?"`, 'Funny'], ['t', `"I can take them. Probably. Maybe."`, 'Brave']],
    choices: [
      C(`{t} smashes through the shop window`, `Glass is better than teeth.`, [O(0.47, 'hurt', `{t} crashes through the window in a shower of glass, cut but free.`, [['hurt', 't', 1]]), O(0.08, 'infect', `{t} crashes through the glass, but one of them caught a scratch first. It burns.`, [['hurt', 't', 1], ['infect', 't']]), O(0.35, 'good', `{t} dives through the window and rolls out the back door. Movie stuff.`), O(0.1, 'death', `The window will not break. They reach {t}.`, [['bite', 't']])]),
      C(`Charge in and break the circle`, `Hit them from behind.`, [O(0.62, 'good', `{Team} hits them from behind. {t} bursts out of the gap.`, [['hero']]), O(0.2, 'hurt', `It is a brutal fight. {r} is hurt dragging {t} out.`, [['hurt', 'r', 1]]), O(0.08, 'infect', `{t} is out, but a long scratch runs down their forearm. Nobody says the word. Everyone thinks it.`, [['hurt', 't', 1], ['infect', 't']]), O(0.1, 'death', `In the scrum, one gets its teeth into {t}.`, [['bite', 't']])], { req: { minAlive: 2 } }),
      C(`Draw two of them away`, `Make noise on the far side.`, [O(0.55, 'good', `Two of them turn to the noise. {t} dodges the third and runs.`), O(0.35, 'hurt', `Only one turns. {t} fights past the other two, scratched.`, [['hurt', 't', 1]]), O(0.1, 'death', `None of them turn. {t} has nowhere to go.`, [['bite', 't']])]),
      C(`{t} climbs the drainpipe`, `Up and out of reach.`, [O(0.5, 'good', `{t} shins up the drainpipe and crosses the roofs to safety.`), O(0.4, 'hurt', `The drainpipe breaks halfway up. {t} falls, but is out of the circle.`, [['hurt', 't', 1]]), O(0.1, 'death', `They grab {t}'s ankles before they get high enough.`, [['bite', 't']])]),
      C(`Leave {t} to it`, `Three is too many.`, [O(0.4, 'hurt', `{t} fights free alone, badly hurt.`, [['hurt', 't', 2]]), O(0.3, 'good', `{t} gets out on their own and catches up, very angry.`), O(0.3, 'death', `{t} does not make it.`, [['bite', 't']])], { req: { minAlive: 2 }, major: true }),
      C(`{t} barges through the weakest one`, `Shoulder down and charge.`, [O(0.55, 'good', `{t} hits the smallest one like a rugby player. It goes flying. {t} is through.`, [['hero']]), O(0.35, 'hurt', `{t} gets through but takes a heavy hit on the way.`, [['hurt', 't', 1]]), O(0.1, 'death', `It does not go flying. It holds on, and bites.`, [['bite', 't']])]),
      C(`{t} stays perfectly still`, `Maybe they cannot see well.`, [O(0.45, 'funny', `{t} pretends to be a statue. Incredibly, they walk right past.`, [['funny']]), O(0.4, 'hurt', `It does not work. {t} has to fight free.`, [['hurt', 't', 1]]), O(0.15, 'death', `Statues do not get bitten. {t} does.`, [['bite', 't']])]),
      companionRescue,
    ],
    uses: {
      gun: U(`Three shots. Three down. {t} stands in the silence, shaking. Then the echoes start.`, [['next', 'lto_gun_echo'], ['hero']]),
      melee: U(`{t} swings wildly and clears a path through the circle.`, [['hero']]),
      noise: U(`A bang of firecrackers on the far side. All three turn. {t} is gone before they turn back.`, []),
      signal: U(`A blazing red flare thrown into the middle of them. They stagger back, and {t} runs through the gap.`, []),
    },
  }),
  E('gun_echo', {
    cat: 'chain', loc: '*', essential: true, repeat: true, title: `Echoes`,
    text: [`The gunshot is still echoing off the buildings. Then, from every direction, comes the answer: groans, footsteps, breaking glass. The whole neighbourhood is waking up.`],
    scene: { z: 4, light: 'alert' }, cast: ['a', 'b?'], say: [['a', `"That was loud. That was really loud. We need to go. Now."`], ['b', `"Worth it. Totally worth it. Now RUN."`, 'Gamer']],
    choices: [
      rush(`Run before they arrive`, `Leg it.`, { hurt: 0.15, danger: 0.1, time: 1 }),
      C(`Hide and let them pass`, `Get into a building and wait.`, [O(0.7, 'neutral', `Squashed in a phone shop's stock room, {team} waits for the crowd to thin.`, [['time', -2]]), O(0.3, 'danger', `One of them finds the hiding place. It goes for {r}!`, [['em', 'r']])]),
      C(`Climb onto a roof`, `Get above the crowd.`, [O(0.6, 'neutral', `Up on a garage roof, {team} watches them gather and then drift away.`, [['time', -1]]), O(0.4, 'hurt', `{r} slips on the gutter climbing up.`, [['hurt', 'r', 1]])]),
      C(`Lead them away with more noise`, `Use the noise against them.`, [O(0.6, 'good', `{a} smashes a car window two streets over and doubles back. The crowd follows the alarm.`, [['hero'], ['time', 1]]), O(0.4, 'hurt', `{a} makes the noise but gets cornered, and fights free.`, [['hurt', 'a', 1]])]),
      safe(`Walk calmly in the opposite direction`, `They are heading to where the noise was.`, { time: -1 }),
    ],
  }),

  // ---------------- INFECTION TURN ----------------
  E('turn', {
    cat: 'turn', loc: '*', essential: true, repeat: true, title: `The Fever`, major: true,
    text: [`{t} has been quiet for a while. Now they are sweating, shivering and grey. The scratch on their arm has turned dark, with black lines spreading under the skin. Everyone knows what it means. {t} knows it too.`],
    scene: { light: 'dim' }, cast: ['t!', 'h?'], say: [['t', `"It is fine. I am fine. Do not look at me like that."`], ['h', `"{t}... we need to talk about this."`]],
    choices: [
      C(`{t} walks away alone`, `{t} chooses to leave before they become a danger.`, [O(1, 'neutral', `{t} hugs everyone, one by one, then walks into the dusk without looking back. It is the bravest thing anyone has seen.`, [['kill', 't', 'walked away alone to protect the group from their infection', 'hero']])], { major: true }),
      C(`Stay with {t} until the end`, `Nobody should be alone.`, [O(1, 'neutral', `{Team} stays. {t} talks about what they will miss. When it is over, the group carries on, smaller and quieter.`, [['kill', 't', 'lost to the infection, surrounded by friends'], ['time', -2]])]),
      C(`Hide the infection and keep going`, `Maybe it will not get worse. Maybe nobody needs to know.`, [O(0.6, 'neutral', `{t} pulls down their sleeve. "I can make it to the train." Everyone pretends to believe it.`, [['conceal', 't']]), O(0.4, 'death', `It gets worse fast. {t} turns on {r} before anyone can react.`, [['kill', 't', 'turned from the infection'], ['hurt', 'r', 1]])]),
      C(`Search for medicine`, `There might be antibiotics nearby. Anything.`, [O(0.25, 'good', `A pharmacy, a miracle: a box of antivirals. {t}'s fever begins to drop.`, [['cure'], ['time', -2], ['hero']]), O(0.75, 'neutral', `Nothing. {t} insists on carrying on anyway, hiding the bite.`, [['conceal', 't'], ['time', -2]])]),
      C(`Let {t} decide`, `It is their life.`, [O(0.5, 'neutral', `{t} decides to keep going. "Get me to that train. They will have doctors."`, [['conceal', 't']]), O(0.5, 'neutral', `{t} decides to go alone. "Look after each other." And they are gone.`, [['kill', 't', 'chose to leave the group when the infection took hold', 'hero']])]),
    ],
    uses: {
      cure: U(`The experimental serum burns going in. {t} screams, shivers, sleeps. When they wake, the black lines are fading. It worked. It actually worked.`, [['cure'], ['hero']]),
    },
  }),

  // ---------------- TIMEOUT ----------------
  E('timeout', {
    cat: 'timeout', loc: '*', essential: true, title: `The Last Whistle`, major: true,
    text: [`A long, low horn sounds across the city, far away to the east. Then the rumble of a train, fading into the distance. {Team} stands in silence. The last train out has gone.`],
    scene: { light: 'night' }, cast: ['a', 'b?'], say: [['a', `"No. No, no, no."`], ['b', `"Okay. Okay. We just need a plan B."`, 'Leader']],
    choices: [
      C(`Head for the river and look for boats`, `The estuary leads out of the city.`, [O(0.3, 'good', `A rowing club. One boat left. It is a long, cold row out to the estuary, but it is away.`, [['flag', 'boat_escape']]), O(0.7, 'bad', `The river is choked with wrecks. There is no way out by water.`, [['flag', 'stranded']])]),
      C(`Light a signal fire on a rooftop`, `Somebody might still be flying.`, [O(0.35, 'good', `Hours later, a searchlight sweeps the roof. A helicopter. Somebody was looking.`, [['flag', 'heli']]), O(0.65, 'bad', `The fire burns all night. Nobody comes.`, [['flag', 'stranded']])]),
      C(`Keep walking to Stonebridge anyway`, `Maybe there is another train. Maybe soldiers stayed behind.`, [O(1, 'bad', `The station is empty. Just litter and silence and a sign: EVACUATION COMPLETE.`, [['flag', 'stranded']])]),
      C(`Find somewhere safe to hide`, `Hole up and wait for whatever comes next.`, [O(1, 'bad', `{Team} barricades an attic and waits. For days. Then weeks.`, [['flag', 'stranded']])]),
      C(`Split up and search for any way out`, `Cover more ground. Meet back here at dawn.`, [O(0.2, 'good', `One group finds a working rowing boat at the club on the river.`, [['flag', 'boat_escape']]), O(0.2, 'good', `One group finds an army flare on a rooftop. Fired at the right moment, it brings a helicopter.`, [['flag', 'heli']]), O(0.45, 'bad', `Nobody finds anything. The city is a cage.`, [['flag', 'stranded']]), O(0.15, 'death', `Not everyone comes back at dawn. {r} is never seen again.`, [['kill', 'r', 'went missing searching for a way out of the city'], ['flag', 'stranded']])]),
      C(`Go back to Marlow Tower`, `Pastor Bayo said you would always be welcome.`, [O(1, 'good', `Three knocks, then two. The barricade opens. "We kept your seats warm," says Pastor Bayo.`, [['flag', 'tower_haven']])], { req: { flags: ['tower_ally'] } }),
      C(`Call Echo Two on the radio`, `Signal for the helicopter that promised to look.`, [O(0.75, 'good', `"Echo Two, we have you." A helicopter drops out of the dark onto the roof. Seats for everyone.`, [['flag', 'heli']]), O(0.25, 'bad', `Static. Nobody answers.`, [['flag', 'stranded']])], { req: { anyItems: ['radio'] } }),
      C(`Wake up Dot and take Bessie down to the estuary`, `The narrowboat will leave at dawn.`, [O(1, 'good', `Dot is waiting with the engine running. "Knew you'd be back." Bessie chugs out of the city at four miles an hour, and nothing in the world could catch her.`, [['flag', 'boat_escape']])], { req: { items: ['boat_keys'] } }),
    ],
  }),

  // ---------------- FINALE ----------------
  E('fin_gates', {
    cat: 'finale', loc: 'station', essential: true, repeat: true, title: `Stonebridge Station`, major: true,
    text: [`There it is. Stonebridge Station, lit up like a fortress. Floodlights, sandbags, soldiers on the walls. Between {team} and the main gates: a crowd of infected, two hundred metres of open forecourt, and the sound of a train engine warming up.`],
    scene: { z: 5, light: 'night' }, cast: ['a', 'b?'], say: [['a', `"This is it. Everything we have done, it comes down to this."`], ['b', `"I will go first. If something happens, keep running."`, 'Brave'], ['b', `"Final level. No pressure."`, 'Gamer']],
    choices: [
      C(`Charge for the main gates together`, `All in, all at once.`, [O(0.55, 'good', `{Team} sprints across the forecourt. Soldiers open fire over their heads. The gates swing open.`), O(0.35, 'hurt', `They make it, but not cleanly. {r} is clawed in the scramble.`, [['hurt', 'r', 1]]), O(0.1, 'death', `So close. An infected drags {r} down metres from the gate.`, [['bite', 'r']])]),
      C(`Use the side gate on Mill Lane`, `The way everyone kept talking about.`, [O(0.85, 'good', `Mill Lane is quiet. A soldier at the side gate waves {team} through. "Quick, quick."`), O(0.15, 'hurt', `The lane is not quite empty. {r} gets a scratch before the gate slams shut behind them.`, [['hurt', 'r', 1]])], { req: { flags: ['side_gate'] } }),
      C(`Show the military pass`, `Priority evacuation. That is what it says.`, [O(1, 'good', `A soldier sees the pass and radios ahead. A squad escorts {team} straight through the crowd.`)], { req: { items: ['pass'] } }),
      C(`{a} draws the horde away`, `One person leads them off so everyone else can get through.`, [O(0.4, 'good', `{a} runs, shouting, waving. The horde follows. Then {a} doubles back through a gap and makes it. Unbelievable.`, [['hero']]), O(0.6, 'death', `{a} leads them away. The others make it through the gate. {a} does not come back.`, [['kill', 'a', 'drew the horde away from the station gates so the others could reach the train', 'hero']])], { req: { minAlive: 2 }, major: true }),
      C(`Wait for covering fire`, `Signal the soldiers and wait for them to clear a path.`, [O(0.6, 'good', `The soldiers spot {team} and lay down covering fire. A path opens.`), O(0.4, 'hurt', `It takes too long. Infected find {team}'s hiding place. {r} gets hurt before the soldiers clear them.`, [['hurt', 'r', 1]])]),
      C(`Sneak along the wall in the shadows`, `Slow and quiet.`, [O(0.6, 'good', `Inch by inch, along the wall. Nothing notices. The gates are right there.`), O(0.4, 'hurt', `A floodlight swings across them. In the confusion, {r} is grabbed and fights free.`, [['hurt', 'r', 1]])]),
      C(`Climb the scaffolding on the hotel next door`, `Cross to the station wall from above.`, [O(0.55, 'good', `Across the scaffolding and onto the station wall. Soldiers haul {team} over.`), O(0.35, 'hurt', `A plank gives way. {r} falls, but makes it over the wall.`, [['hurt', 'r', 1]]), O(0.1, 'death', `The scaffolding collapses beneath {r}.`, [['kill', 'r', 'fell from scaffolding outside Stonebridge Station']])]),
      C(`Shout and wave until the soldiers notice`, `Make yourselves seen.`, [O(0.5, 'good', `A soldier spots {team} and a squad pushes out to escort them in.`), O(0.5, 'hurt', `The soldiers notice. So do the infected. {r} is hurt in the rush to the gate.`, [['hurt', 'r', 1]])]),
    ],
    uses: {
      signal: U(`The flare arcs high over the forecourt. A soldier on the wall shouts: "Survivors! Covering fire!" A path opens like the parting of a sea.`, [['hero']]),
      gun: U(`Every shot counts. {Team} fights a path across the forecourt, and the soldiers join in from the walls.`, [['hero']]),
      noise: U(`Firecrackers thrown far to the left. The crowd turns. {Team} runs right, straight through the gate.`, []),
    },
  }),
  E('fin_platform', {
    cat: 'finale', loc: 'station', essential: true, repeat: true, title: `Platform Three`, major: true,
    text: [`Inside. Platform Three. The train is packed, its doors still open. A medic with a scanner is checking everyone who boards for bites. A sergeant is shouting: "Two minutes! Two minutes!"`],
    scene: { bg: 'platform', light: 'night' }, cast: ['t?=@infected', 'a', 'b?'], say: [['a', `"We made it. We actually made it."`], ['b', `"Do not say that yet. Not until the doors close."`, 'Practical']],
    choices: [
      C(`Look for Vince`, `He disappeared in the crowd.`, [O(1, 'bad', `Vince is already aboard. He has sold the group's seats to a man in a suit. The doors close with {team} outside.`, [['flag', 'betrayed']])], { req: { flags: ['vince_deal'] } }),
      C(`Board the train together`, `Everyone, now, through the scanner.`, [O(1, 'good', `The scanner beeps green, again and again. The doors hiss shut. The train begins to move.`, [['flag', 'reached']])]),
      C(`Help a family with a pram board first`, `A small kindness, even now.`, [O(0.8, 'good', `{a} lifts the pram aboard. The mother cries. Then {team} squeezes on as the doors close.`, [['flag', 'reached'], ['hero']]), O(0.2, 'hurt', `The doors start closing. {r} jams an arm in them to keep them open. Bruised, but everyone is aboard.`, [['flag', 'reached'], ['hurt', 'r', 1], ['hero']])]),
      C(`Hand the research drive to the medic`, `Dr Okafor's work, delivered at last.`, [O(1, 'good', `The medic reads the label and goes pale. "Sergeant! Get Command on the line. Now." {Team} is ushered into a carriage with an armed guard.`, [['flag', 'reached'], ['flag', 'gave_research']])], { req: { items: ['research'] } }),
      C(`Tell the medic about {t}'s bite`, `Honesty, even if it costs everything.`, [O(1, 'neutral', `The medic's face falls. Gently, firmly, {t} is led away to a separate carriage under guard. "We will do what we can." The others board.`, [['flag', 'reached'], ['flag', 'reported_infection'], ['kill', 't', 'was taken into quarantine at Stonebridge']])], { req: { infected: true }, major: true }),
      C(`Hold the doors for the people still running`, `Stragglers are still coming down the platform.`, [O(0.6, 'good', `{a} holds the doors. Six more people make it aboard. Then the train pulls away.`, [['flag', 'reached'], ['hero']]), O(0.4, 'death', `{a} holds the doors as the infected pour onto the platform. The train has to leave. {a} pushes the last runner aboard and stays behind.`, [['kill', 'a', 'held the train doors for strangers and was left behind on the platform', 'hero'], ['flag', 'reached']])], { major: true }),
      C(`Thank the soldiers on the way in`, `They held the station for everyone.`, [O(1, 'good', `A tired sergeant shakes {a}'s hand. "You made it. Now get on." The doors close behind {team}.`, [['flag', 'reached']])]),
      C(`Find the last carriage, away from the crowd`, `Somewhere quieter to breathe.`, [O(1, 'good', `The last carriage is half empty. {Team} collapses into the seats as the train pulls out.`, [['flag', 'reached']])]),
    ],
  }),

  // ---------------- FILLER (safety net) ----------------
  E('filler', {
    cat: 'chain', loc: '*', essential: true, repeat: true, title: `A Quiet Street`,
    text: [`For a few minutes, the street is quiet. Wind, litter, the distant thud of helicopters. {Team} keeps moving toward Stonebridge.`],
    cast: ['a'], say: [],
    choices: [
      safe(`Keep moving`, `Steady pace.`),
      search(`Check the houses along the way`, `Quick look through open doors.`, { item: 0.5, hurt: 0.08 }),
      rush(`Jog to make up time`, `Push the pace.`, { hurt: 0.08, danger: 0.08 }),
      C(`Take a short rest`, `Catch your breath.`, [O(1, 'good', `A short sit-down. A little better.`, [['heal', 'injured', 1], ['time', -1]])]),
      safe(`Stick to the shadows`, `Slow but hidden.`, { time: -1 }),
    ],
  }),
];

// Downpour is defined as a travel-style event in the list above for flavour,
// but has no choices; remove it to keep data clean.
const evs = events.filter((e) => e.choices);

const T = travelTables({
  lowOk: [`A long, careful walk. Nothing goes wrong.`, `The detour is slow but completely quiet.`],
  medOk: [`{Team} arrives at {loc} without trouble.`, `A tense journey, but everyone makes it.`],
  highOk: [`A fast, risky dash, and it pays off. Time saved.`, `{Team} pushes hard and covers the ground quickly.`],
  hurt: [`On the way, {r} stumbles over debris and lands badly.`, `{r} is clipped by a falling sign on the way.`],
  danger: [`Halfway there, an infected staggers out of a doorway at {r}!`, `On the way, something lurches from between two cars at {r}!`],
});

export default {
  id: A, title: `Last Train Out`, short: `City`,
  tagline: `The city has fallen. One train is leaving.`,
  premise: `The outbreak has overwhelmed the city. The military is preparing to evacuate the last survivors from Stonebridge Station, and the final train will not wait for anyone.`,
  objective: `Reach Stonebridge Station before the final evacuation train departs.`,
  card: 'station', colour: '#e63946',
  clock: { start: 58, unit: 10, label: `Train departs in` },
  zones: [['apartment'], ['kingsway', 'pricemart', 'depot'], ['hospital', 'police', 'alleys'], ['warehouse', 'tower', 'mall'], ['tunnels', 'canal', 'flyover'], ['railyard', 'checkpoint', 'sewers']],
  zoneQuota: [[2, 3], [3, 5], [3, 5], [3, 5], [3, 5], [3, 4]],
  targetStages: 32, maxStages: 40,
  finale: [`${A}_fin_gates`, `${A}_fin_platform`], finaleLoc: 'station',
  emergencies: [`${A}_em_lunge`, `${A}_em_grab`, `${A}_em_surround`],
  turnEvent: `${A}_turn`, timeoutEvent: `${A}_timeout`, fillerEvent: `${A}_filler`, turnDelay: 4,
  npcs: {
    gary: { name: `Gary`, traitor: 0, loyal: 0, hair: '#5e5e66', hat: 'cap', hatC: '#2e5fa8', shirt: '#2e5fa8', legs: '#2e5fa8' },
    marta: { name: `Marta`, traitor: 0.06, loyal: 0.75, skin: '#c98552', hair: '#1c1b20', style: 'bun', shirt: '#3a86b4', legs: '#3a86b4' },
    vince: { name: `Vince`, traitor: 0.45, loyal: 0.3, hair: '#1c1b20', shirt: '#1f1f24', legs: '#3d405b', extra: 'coat' },
    hoarder: { name: `the hoarder`, traitor: 0.3, loyal: 0.3, skin: '#f8cba6', hair: '#8f3b1b', shirt: '#f2c230', legs: '#2b2d42', extra: 'hivis' },
    bayo: { name: `Pastor Bayo`, traitor: 0.05, loyal: 0.7, skin: '#58311c', style: 'bald', shirt: '#6a4c93', legs: '#2b2d42', extra: 'tie' },
    dot: { name: `Dot`, traitor: 0.05, loyal: 0.6, skin: '#f8cba6', hair: '#d9d9e3', hat: 'captain', shirt: '#f2c230', legs: '#2b2d42' },
    signalman: { name: `the signalman`, traitor: 0.1, loyal: 0.5, hair: '#3b2417', hat: 'cap', hatC: '#f77f00', shirt: '#f77f00', legs: '#2b2d42', extra: 'hivis' },
    hollis: { name: `Private Hollis`, traitor: 0.08, loyal: 0.7, skin: '#ad6d3e', hat: 'helmet', hatC: '#556b2f', shirt: '#556b2f', legs: '#3d4f22' },
    higgins: { name: `Mr Higgins`, traitor: 0.08, loyal: 0.65, skin: '#f8cba6', hair: '#ecebf2', shirt: '#7f5539', legs: '#5c4b3b', beard: '#ecebf2' },
    stranger: { name: `the stranger`, traitor: 0.2, loyal: 0.4, skin: '#eeb48b', hair: '#6b3e1f', style: 'long', shirt: '#9d0208', legs: '#2b2d42' },
    biscuit: { name: `Biscuit`, traitor: 0, loyal: 0.8, kind: 'dog', coat: '#c8a26b' },
  },
  items, locations, events: [...evs, ...companionEvents(A)], defaultLoot: ['bandages', 'tinned_food', 'energy_drink', 'batteries'],
  travelText: [`{loc} is behind {team} now. Three routes lead on toward Stonebridge. The clock is ticking: {clock} until the train leaves.`, `Time to move on from {loc}. Which way now? {clock} left on the clock.`],
  travelSay: [['a', [`"Which way? Quickly."`, `"We cannot stay here. Pick a route."`, `"Every minute counts. Let us choose."`]]],
  travelOutcomes: T,
  restChoice: { l: `Rest and patch up first`, d: `Heal one injury, but lose precious time. You will choose the route after.`, o: [O(0.85, 'good', `A short, tense rest in a doorway. Wounds are cleaned and bound.`, [['heal', 'injured', 1], ['time', -2]]), O(0.15, 'danger', `The rest is interrupted. Something finds {r}!`, [['em', 'r'], ['time', -1]])] },
  scavengeChoice: { l: `Search {loc} one more time`, d: `One more look around before moving on. Costs time.`, o: [O(0.6, 'item', `One last sweep turns up {loot}.`, [['loot'], ['time', -1]]), O(0.4, 'neutral', `Nothing more to find here.`, [['time', -1]])] },
  quips: { ...GENERIC_QUIPS, Any: [...GENERIC_QUIPS.Any, `"I keep thinking that train is going to have a buffet car."`, `"How many more streets? Is it many? It feels like many."`] },
  deathLines: GENERIC_DEATH_LINES,
  endings: [
    { id: 'total', title: `Total Team Death`, cat: 'Total team death', objective: false, when: (c) => c.none, text: `Nobody made it. Somewhere in the city, the last train pulled away without them. Their names are written on a wall at Stonebridge by strangers who never knew them: {fallen}.` },
    { id: 'betrayal', title: `Sold Out`, cat: 'Betrayal', objective: false, when: (c) => c.flag('betrayed'), text: `Vince waved from the window as the train pulled away, with their seats. {survivors} stood on the empty platform, betrayed. Later, a soldier found them and promised another train "soon". Nobody believed him.` },
    { id: 'infected', title: `Something on the Train`, cat: 'Infection', objective: true, when: (c) => c.reached && c.infected, text: `The train rolled out of the city with {survivors} aboard, and a secret. Somewhere around the second hour, the fever came back. The rest of the story is told in hushed voices at the refugee camp, and never in full.` },
    { id: 'secret', title: `The Okafor Files`, cat: 'Secret discovery', objective: true, when: (c) => c.reached && c.flag('gave_research'), text: `Dr Okafor's research reached the military. Within a month, a treatment was being tested. {survivors} will never be famous, but everyone who survives the outbreak owes them something.` },
    { id: 'solo', title: `Lone Wolf`, cat: 'Complete rescue', objective: true, when: (c) => c.reached && c.total === 1, text: `{survivors} made it to Stonebridge alone, against everything the city threw at them. The soldiers at the door did not quite believe it. Neither did {survivors}.` },
    { id: 'complete', title: `Complete Rescue`, cat: 'Complete rescue', objective: true, when: (c) => c.reached && c.all, text: `Every single one of them made it. {survivors} sat together as the last train out crossed the river, filthy, exhausted and grinning like idiots. Against all odds, nobody was left behind.` },
    { id: 'sacrifice', title: `The One Who Stayed`, cat: 'Heroic sacrifice', objective: true, when: (c) => c.reached && c.sacrifice, text: `The train carried {survivors} to safety because someone chose not to get on it. {fallen} will be remembered at every campfire from here to the coast.` },
    { id: 'last', title: `Last Survivor`, cat: 'Last survivor', objective: true, when: (c) => c.reached && c.alive === 1 && c.total > 1, text: `{survivors} sat alone in a carriage full of strangers, holding onto a crumpled photograph and the memory of {fallen}. They had promised to make it. One of them did.` },
    { id: 'partial', title: `Partial Rescue`, cat: 'Partial rescue', objective: true, when: (c) => c.reached, text: `The train left the city with {survivors} aboard. They watched the skyline burn and thought of {fallen}, who did not make it. Survival has a price.` },
    { id: 'heli', title: `Echo Two`, cat: 'Unexpected rescue', objective: false, when: (c) => c.flag('heli'), text: `The train was gone, but someone was still looking. Echo Two lifted {survivors} off a rooftop at dawn and flew them out over the burning city. Not the plan, but a rescue all the same.` },
    { id: 'boat', title: `Bessie Goes to Sea`, cat: 'Alternative escape', objective: false, when: (c) => c.flag('boat_escape'), text: `They missed the train. They caught a boat. {survivors} drifted down to the estuary at walking pace while the city burned behind them, and in the morning, there was nothing but open water and seagulls.` },
    { id: 'tower', title: `The Fourteenth Floor`, cat: 'Alternative safe haven', objective: false, when: (c) => c.flag('tower_haven'), text: `{survivors} never reached Stonebridge. Instead they found a home: a tower block garden in the sky, rainwater, tomatoes in a bathtub, and Pastor Bayo's terrible jokes. It is not escape. But it is life.` },
    { id: 'failed', title: `Left Behind`, cat: 'Failed evacuation', objective: false, when: (c) => c.timeout || c.flag('stranded'), text: `The last train left without them. {survivors} are still out there in the city, surviving day by day, listening for helicopters that may never come.` },
    { id: 'lost', title: `Lost in the City`, cat: 'Tragic ending', objective: false, when: () => true, text: `The journey ended before Stonebridge. {survivors} remain somewhere in the city.` },
  ],
};

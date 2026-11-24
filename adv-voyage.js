// ADVENTURE 3: THE LAST VOYAGE — infected cruise ship, escape and reach the mainland.
import { addComedy } from './chaos.js';
import { O, C, U, search, safe, rush, travelTables, GENERIC_QUIPS, GENERIC_DEATH_LINES, companionEvents, companionRescue, infectionEvents, roleEvents } from './kit.js';

const A = 'voy';
const E = (id, o) => ({ id: `${A}_${id}`, ...o });

const items = {
  flashlight: { name: `Flashlight`, icon: 'torch', desc: `A crew torch. Each use drains the battery.`, tags: ['light'], qty: 3, max: 6 },
  batteries: { name: `Batteries`, icon: 'battery', desc: `Recharges the flashlight (+3 uses). Use it from the backpack any time.`, anytime: 'recharge', target: 'flashlight', amount: 3, qty: 1, max: 4 },
  first_aid: { name: `First Aid Kit`, icon: 'medkit', desc: `Restores 2 health to your most injured survivor. Use any time.`, tags: ['medical'], anytime: 'heal', heal: 2, qty: 1, max: 3 },
  bandages: { name: `Bandages`, icon: 'bandage', desc: `Restores 1 health to your most injured survivor. Use any time.`, tags: ['medical'], anytime: 'heal', heal: 1, qty: 2, max: 6 },
  canapes: { name: `Canapés`, icon: 'food', desc: `Tiny, fancy and filling. Restores 1 health.`, tags: ['food'], anytime: 'heal', heal: 1, qty: 2, max: 6 },
  fire_axe: { name: `Fire Axe`, icon: 'axe', desc: `From a glass case marked BREAK IN EMERGENCY. This counts.`, tags: ['melee', 'tool'], qty: 4, max: 4, unique: true },
  chef_knife: { name: `Chef's Knife`, icon: 'knife', desc: `Chef Bruno's favourite. Very sharp. Wears out after a few uses.`, tags: ['melee'], qty: 3, max: 3, unique: true },
  extinguisher: { name: `Fire Extinguisher`, icon: 'extinguisher', desc: `A blast of white foam blinds anything. Puts out fires too.`, tags: ['spray'], qty: 2, max: 3 },
  pistol: { name: `Security Pistol`, icon: 'gun', desc: `From the ship's security office. Quantity is rounds left. Very loud below decks.`, tags: ['gun'], qty: 3, max: 8 },
  flare_pistol: { name: `Flare Pistol`, icon: 'flare', desc: `A distress flare pistol. Seen for miles at sea, and very loud.`, tags: ['signal', 'noise', 'light'], qty: 1, max: 3 },
  champagne: { name: `Champagne`, icon: 'bottle', desc: `Pop the cork for a very loud distraction. Or celebrate. Once.`, tags: ['noise'], qty: 1, max: 3 },
  keycard: { name: `Master Keycard`, icon: 'card', desc: `Opens every cabin, crew door and locker on the ship.`, tags: ['key'], qty: 1, max: 1, unique: true },
  winch_key: { name: `Lifeboat Winch Key`, icon: 'key', desc: `A heavy brass key that releases the lifeboat davits.`, tags: ['winch'], qty: 1, max: 1, unique: true },
  lifejackets: { name: `Lifejackets`, icon: 'lifejacket', desc: `Bright orange and bulky. If the worst happens, they keep you afloat.`, tags: ['float'], qty: 3, max: 20 },
  radio: { name: `Crew Radio`, icon: 'radio', desc: `A handheld marine radio. Channel 16 is the distress channel.`, tags: ['radio', 'signal'], qty: 1, max: 1, unique: true },
  deck_plan: { name: `Deck Plan`, icon: 'map', desc: `A fold-out plan of every deck, with crew-only shortcuts marked.`, tags: ['map'], qty: 1, max: 1, unique: true },
  compass: { name: `Hand Compass`, icon: 'compass', desc: `A brass navigation compass from the bridge.`, tags: ['map', 'nav'], qty: 1, max: 1, unique: true },
  logbook: { name: `Captain's Logbook`, icon: 'book', desc: `The captain's private log. The cruise line knew about the outbreak before the ship sailed.`, tags: ['secret'], qty: 1, max: 1, unique: true },
  rope: { name: `Mooring Rope`, icon: 'rope', desc: `A coil of strong ship's rope.`, tags: ['rope'], qty: 1, max: 1, unique: true },
  antiviral: { name: `Ship's Antiviral`, icon: 'syringe', desc: `Dr Anand's last dose of an experimental antiviral. Use from the backpack.`, tags: ['cure'], anytime: 'cure', qty: 1, max: 1, unique: true },
  fuel: { name: `Diesel Can`, icon: 'fuel', desc: `Lifeboat motor fuel. Without it, you row.`, tags: ['fuel'], qty: 1, max: 1, unique: true },
};

const L = (name, scene, loot, travel, extra = {}) => ({ name, scene, loot, travel, ...extra });
const locations = {
  stateroom: L(`Cabin 7142`, 'stateroom', ['flashlight', 'canapes', 'bandages', 'lifejackets', 'deck_plan']),
  corridor7: L(`Deck 7 Corridor`, 'corridor', ['lifejackets', 'canapes', 'flashlight', 'extinguisher'], { l: `Creep down the Deck 7 corridor`, d: `Long, narrow and lined with cabin doors. Some of them are open.`, risk: 'med' }),
  dining: L(`Grand Dining Room`, 'restaurant', ['canapes', 'champagne', 'chef_knife', 'first_aid'], { l: `Cut through the Grand Dining Room`, d: `Chandeliers and silverware. And a lot of diners who never left.`, risk: 'high' }),
  casino: L(`Lucky Star Casino`, 'casino', ['champagne', 'keycard', 'flashlight', 'batteries'], { l: `Go round through the casino`, d: `Bright lights and slot machines. Longer, but quieter.`, risk: 'low' }),
  galley: L(`Galley Kitchens`, 'galley', ['chef_knife', 'canapes', 'extinguisher', 'first_aid'], { l: `Head down through the galley`, d: `Steel kitchens, knives and cold rooms.`, risk: 'med' }),
  theatre: L(`Neptune Theatre`, 'theatre', ['flashlight', 'champagne', 'rope', 'batteries'], { l: `Cross the Neptune Theatre`, d: `A thousand red seats in the dark. Something is still on stage.`, risk: 'med' }),
  lido: L(`Lido Pool Deck`, 'pool', ['lifejackets', 'canapes', 'flare_pistol', 'bandages'], { l: `Run across the Lido pool deck`, d: `Open air and a fast route aft. Very exposed.`, risk: 'high', time: 1 }),
  medbay: L(`Medical Centre`, 'medbay', ['first_aid', 'bandages', 'antiviral', 'flashlight'], { l: `Make for the Medical Centre`, d: `Supplies and maybe a doctor. Maybe patients too.`, risk: 'med' }),
  crew: L(`Crew Quarters`, 'corridor', ['winch_key', 'lifejackets', 'radio', 'keycard', 'pistol'], { l: `Take the crew-only stairs`, d: `A maze of narrow crew corridors. The staff know shortcuts.`, risk: 'low' }, { light: 'dim' }),
  hold: L(`Cargo Hold`, 'hold', ['fuel', 'rope', 'fire_axe', 'batteries'], { l: `Climb down into the cargo hold`, d: `Cars, crates and darkness deep in the ship.`, risk: 'high', time: 1 }, { light: 'dim' }),
  engine: L(`Engine Room`, 'engine', ['fuel', 'fire_axe', 'extinguisher', 'flashlight'], { l: `Go through the engine room`, d: `Huge machines, steam and noise. The heart of the ship.`, risk: 'med' }),
  flooded: L(`Flooded Deck 2`, 'flooded', ['lifejackets', 'rope', 'bandages'], { l: `Wade through flooded Deck 2`, d: `The water is rising. The fastest way aft, if you can swim.`, risk: 'high', time: 1 }),
  bridge: L(`The Bridge`, 'shipbridge', ['compass', 'radio', 'flare_pistol', 'pistol', 'logbook'], { l: `Climb up to the bridge`, d: `The ship's command centre. Radios, charts, and the captain.`, risk: 'low' }),
  lifeboats: L(`Lifeboat Station`, 'lifeboats', ['lifejackets', 'flare_pistol', 'fuel', 'winch_key'], { l: `Head for the lifeboat station`, d: `The boats are here, and so is everyone else.`, risk: 'high', time: 1 }),
  promenade: L(`Promenade Deck`, 'deck', ['lifejackets', 'rope', 'canapes', 'flare_pistol'], { l: `Walk the promenade deck`, d: `Wind, waves and long open railings.`, risk: 'med' }, { light: 'storm' }),
  tender: L(`Tender Bay`, 'flooded', ['fuel', 'lifejackets', 'rope', 'winch_key'], { l: `Sneak down to the tender bay`, d: `A hull door at the waterline where the shore boats dock.`, risk: 'low' }, { light: 'dim' }),
  sea: L(`Open Water`, 'sea', []),
};

const events = [
  // ---------------- OPENINGS ----------------
  E('open_alarm', {
    cat: 'opening', loc: 'stateroom', essential: true, title: `Seven Short Blasts`,
    text: [`The ship's horn blasts seven short times and one long: the general emergency signal. The lights in Cabin 7142 flicker and die, then come back red. In the corridor, someone is screaming, and someone else is laughing in a way that is very wrong.`],
    cast: ['a', 'b?'], say: [['a', `"Seven short, one long. That is the abandon ship signal."`], ['b', `"I paid for the deluxe package. This is not deluxe."`, 'Funny'], ['b', `"Lifejackets. Under the bed. Now."`, 'Practical']],
    choices: [
      search(`Grab lifejackets and supplies`, `Under the bed, in the wardrobe, the safe.`, { item: 0.8, hurt: 0, t: { item: `Under the bed: {loot}.` } }),
      C(`Look out into the corridor`, `What is happening out there?`, [O(0.5, 'neutral', `A steward runs past, bleeding. "Lifeboats! Deck 5! Don't let them touch you!" Then he is gone.`, [['flag', 'warned']]), O(0.5, 'danger', `Someone in a dressing gown is right outside the door. It lunges for {r}!`, [['em', 'r']])]),
      safe(`Barricade the door and listen`, `Work out what is going on before leaving.`, { time: -1, t: `Pressed against the door, {team} hears the whole deck descend into chaos. Then quiet.` }),
      C(`Climb across the balconies`, `Avoid the corridor completely.`, [O(0.6, 'good', `Balcony to balcony, four cabins along, and in through an open door near the stairs.`, [['time', 1]]), O(0.4, 'hurt', `{r} slips on the wet railing and lands hard on the next balcony.`, [['hurt', 'r', 1]])]),
      C(`Phone reception`, `Maybe someone knows what is happening.`, [O(0.5, 'funny', `"Thank you for calling Guest Services. Your call is important to us." For eleven minutes.`, [['funny'], ['time', -1]]), O(0.5, 'good', `A crew member answers, breathless: "Get to the bridge or the lifeboats. Avoid the dining room." Click.`, [['flag', 'warned']])]),
    ],
  }),
  E('open_dinner', {
    cat: 'opening', loc: 'stateroom', essential: true, title: `Formal Night`,
    text: [`{Team} is getting ready for formal night when the screaming starts in the Grand Dining Room below. The ship lurches. Glasses slide off the dressing table. An announcement crackles: "Ladies and gentlemen, please remain in your cabins." Then: "Oh God, no—" Static.`],
    cast: ['a', 'b?'], say: [['a', `"So, remaining in our cabins, then?"`], ['b', `"I am wearing a bow tie. I refuse to die in a bow tie."`, 'Funny'], ['b', `"Something hit the ship. We are listing."`, 'Intelligent']],
    choices: [
      search(`Change into proper clothes and pack`, `Shoes you can run in. A bag of supplies.`, { item: 0.7, hurt: 0, t: { item: `Trainers on, bag packed, and {loot} tucked inside.` } }),
      C(`Go to the dining room to see what happened`, `Somebody might need help.`, [O(0.4, 'neutral', `From the top of the grand staircase, {team} sees enough. Back to the cabin, fast.`, [['flag', 'warned']]), O(0.6, 'danger', `Halfway down the staircase, a waiter turns round. Its eyes are white. It comes for {r}.`, [['em', 'r']])]),
      safe(`Stay in the cabin for now`, `Follow the announcement.`, { time: -2, t: `An hour passes. The announcements stop. The ship tilts a little more. Time to go.` }),
      C(`Head straight for the lifeboats`, `Formal night is cancelled.`, [O(0.7, 'neutral', `Out the door and toward the stairs. The corridor is empty, for now.`, [['time', 1]]), O(0.3, 'danger', `A man in a tuxedo stumbles out of a cabin, straight at {r}.`, [['em', 'r']])]),
      C(`Raid the minibar`, `Supplies are supplies.`, [O(1, 'funny', `Two tiny chocolate bars, a bottle of champagne and a bag of nuts that costs nine pounds.`, [['item', 'champagne'], ['item', 'canapes'], ['funny']])]),
    ],
  }),
  E('open_blackout', {
    cat: 'opening', loc: 'stateroom', essential: true, title: `Blackout`,
    text: [`Darkness. The air conditioning stops. The engines stop. For the first time since leaving port, the ship is silent, except for the creak of the hull and something dragging itself along the corridor outside Cabin 7142.`],
    scene: { light: 'dark' }, cast: ['a', 'b?'], say: [['a', `"Nobody make a sound."`], ['b', `"I can hear my own heartbeat. Can everyone else hear my heartbeat?"`, 'Nervous']],
    choices: [
      C(`Feel around for the emergency torch`, `Every cabin has one by the door.`, [O(0.85, 'item', `Fingers find the bracket by the door: {loot}.`, [['item', 'flashlight']]), O(0.15, 'hurt', `{r} walks into the wardrobe door in the dark.`, [['hurt', 'r', 1], ['funny']])]),
      safe(`Wait for the dragging to pass`, `Silence is safety.`, { time: -1, t: `The dragging stops outside the door for a long minute. Then moves on.` }),
      C(`Open the curtains for moonlight`, `Some light is better than none.`, [O(0.7, 'good', `Moonlight floods in. Enough to pack by.`, [['loot']]), O(0.3, 'neutral', `Thick cloud. No moon at all.`)]),
      rush(`Slip out while it is past the door`, `Move now.`, { hurt: 0.05, danger: 0.15, time: 1 }),
      C(`Bang on the wall to the next cabin`, `Check if the neighbours are alive.`, [O(0.4, 'item', `Three knocks back, then the neighbours slide {loot} under the connecting door. "Good luck."`, [['loot']]), O(0.6, 'danger', `Something bangs back, harder. The connecting door bursts open toward {r}.`, [['em', 'r']])]),
    ],
  }),

  // ---------------- STATEROOM ----------------
  E('cabin_balcony', {
    cat: 'exploration', loc: 'stateroom', title: `The Balcony`,
    text: [`From the balcony, the sea is black and enormous. The ship is listing, tilting slowly toward the water. Far off on the horizon, a thin line of lights: the mainland. On the next balcony, a woman in a sun hat is calmly sunbathing by moonlight.`],
    cast: ['a', 'b?'], say: [['a', `"Land. That is land. We just need to get there."`], ['b', `"Is she... asleep? Or..."`, 'Nervous']],
    choices: [
      C(`Call out to the sunbather`, `She might need help.`, [O(0.5, 'funny', `"Do you MIND? I paid for this view." She is fine. She is incredibly fine. She throws over a spare lifejacket.`, [['item', 'lifejackets'], ['funny']]), O(0.5, 'danger', `She sits up very slowly. She is not fine. She climbs the divider toward {r}.`, [['em', 'r']])]),
      C(`Count the lifeboats you can see`, `How many are left?`, [O(1, 'neutral', `Half the lifeboats on this side are already gone. The rest hang from their davits, swinging.`, [['flag', 'warned']])]),
      search(`Search the cabin properly`, `Take your time.`, { item: 0.65, hurt: 0, time: -1 }),
      safe(`Go back inside and head out`, `No time for views.`),
      C(`Climb down to the deck below`, `It is only a short drop.`, [O(0.6, 'good', `A short drop to the deck below, closer to the stairs.`, [['time', 1]]), O(0.4, 'hurt', `{r} lands awkwardly on a sun lounger.`, [['hurt', 'r', 1], ['funny']])]),
    ],
  }),

  // ---------------- DECK 7 CORRIDOR ----------------
  E('c7_trolley', {
    cat: 'humour', loc: 'corridor7', title: `Room Service`,
    text: [`A room service trolley stands abandoned in the corridor. The silver cloches are still on the plates. Further down, a steward is standing very still, facing a door, holding a tray of drinks perfectly level.`],
    scene: { z: 1 }, cast: ['a', 'b?:Foodie'], say: [['b', `"Is that lobster? That is lobster. Nobody move."`, 'Foodie'], ['a', `"He is still holding the tray. That is commitment."`]],
    choices: [
      C(`Lift the cloches`, `Something tasty, or something nasty.`, [O(0.65, 'item', `Lobster thermidor, still warm, and {loot}. Someone eats a lobster tail in four seconds.`, [['item', 'canapes'], ['funny']]), O(0.35, 'funny', `Under the cloche is a single, sad boiled egg.`, [['funny']])]),
      C(`Use the trolley as a battering ram`, `Push it hard down the corridor.`, [O(0.6, 'good', `The trolley rockets down the corridor and knocks the steward flat. Path clear.`, [['funny']]), O(0.4, 'danger', `The trolley clips the wall and stops. The steward turns round. It comes for {r}.`, [['em', 'r']])]),
      safe(`Sneak past the steward`, `Quiet as a mouse.`),
      C(`Take a drink from his tray`, `He is not using it.`, [O(0.4, 'funny', `{a} lifts a champagne flute off the tray without the steward noticing. Smooth. So smooth.`, [['item', 'champagne'], ['funny']]), O(0.6, 'danger', `He notices. Service with a snarl. It goes for {r}.`, [['em', 'r']])]),
      search(`Check the open cabins on the way`, `Doors are wide open.`, { item: 0.55, hurt: 0, danger: 0.12 }),
    ],
  }),
  E('c7_doors', {
    cat: 'moral', loc: 'corridor7', title: `Knocking`,
    text: [`Behind cabin 7110, someone is knocking. "Please! The door is jammed! My husband needs his medicine!" Behind 7112, across the corridor, a deep groaning and the sound of something throwing itself against the door.`],
    cast: ['a', 'b?:Kind'], say: [['b', `"We have to help her. We have to."`, 'Kind'], ['a', `"If we make noise, 7112 is coming out too."`]],
    choices: [
      C(`Force open 7110`, `Kick it in.`, [O(0.5, 'good', `The door bursts open. An elderly couple, terrified, grateful. They give {team} {loot}.`, [['loot'], ['hero']]), O(0.5, 'danger', `The noise does it. 7112 explodes outward. Something goes for {r}.`, [['em', 'r'], ['hero']])], { major: true }),
      C(`Open it quietly with a master keycard`, `No noise at all.`, [O(1, 'good', `Beep. Click. The couple slip out silently and follow {team} to the stairs before heading for their muster station.`, [['hero']])], { req: { items: ['keycard'] } }),
      C(`Tell her to wait for the crew`, `Promise help is coming.`, [O(1, 'neutral', `"Thank you," she whispers. Nobody knows if anyone is coming.`)]),
      safe(`Keep walking`, `You cannot save everyone.`, { t: `The knocking follows {team} all the way to the stairwell.` }),
      C(`Pass medicine under the door`, `If you have first aid, share it.`, [O(1, 'good', `A first aid kit slides under the door. "God bless you," she says.`, [['use', 'tag', 'medical'], ['hero']])], { req: { tags: ['medical'] } }),
      C(`Brace 7112 shut first, then help`, `Deal with the danger before the rescue.`, [O(0.6, 'good', `A heavy trolley wedged against 7112. Then 7110 is forced open. Everybody gets out.`, [['hero'], ['time', -1]]), O(0.4, 'hurt', `7112 gives just as the trolley arrives. {r} is clawed before it is shoved back.`, [['hurt', 'r', 1], ['hero']])]),
      C(`Ask her what medicine he needs`, `Maybe you can find it.`, [O(0.5, 'item', `"Heart tablets. The steward's station has a box." {a} finds the box, slides it under the door, and pockets {loot} from the same shelf.`, [['loot'], ['hero'], ['time', -1]]), O(0.5, 'neutral', `She describes a pill nobody has heard of. You promise to look.`, [['time', -1]])]),
    ],
  }),

  // ---------------- DINING ROOM ----------------
  E('dining_buffet', {
    cat: 'zombie', loc: 'dining', title: `All You Can Eat`,
    text: [`The Grand Dining Room is lit by toppled candles. At the buffet, a dozen infected passengers in evening wear are shuffling slowly along the counter, plates in hand, as if they still remember queuing.`],
    scene: { z: 4, light: 'dim' }, cast: ['a', 'b?'], say: [['b', `"They are still queuing. Even now. That is the most British thing I have ever seen."`, 'Funny'], ['a', `"The exit is on the far side. Past the buffet."`]],
    choices: [
      C(`Join the queue and shuffle past`, `Blend in. Look hungry.`, [O(0.55, 'funny', `Plates in hand, shuffling, groaning a bit. {Team} queues all the way to the exit. Nobody notices.`, [['funny'], ['time', 1]]), O(0.45, 'danger', `{a} groans too convincingly. Every head turns. One reaches for {r}.`, [['em', 'r'], ['funny']])]),
      C(`Crawl under the tables`, `Long tablecloths, perfect cover.`, [O(0.7, 'neutral', `Under table after table, past dozens of shuffling shoes. Out the far side.`), O(0.3, 'danger', `Somebody is already under the last table. It grabs {r}.`, [['em', 'r']])]),
      safe(`Go back and find another way`, `Not through there.`, { time: -2 }),
      search(`Grab supplies from the captain's table`, `It is right by the door.`, { item: 0.6, hurt: 0, danger: 0.15, t: { item: `Next to the captain's empty chair: {loot}.` } }),
      C(`Pop a champagne cork as a distraction`, `They will go for the noise.`, [O(0.8, 'good', `POP. Every head turns to the far corner. {Team} walks out the front door.`, [['use', 'champagne'], ['time', 1]]), O(0.2, 'danger', `Most go for the noise. One does not. It comes for {r}.`, [['use', 'champagne'], ['em', 'r']])], { req: { items: ['champagne'] } }),
      C(`Knock over the chocolate fountain`, `Chaos as cover.`, [O(0.6, 'funny', `Chocolate everywhere. The infected slip and slide. {Team} escapes, slightly chocolate-covered.`, [['funny']]), O(0.4, 'hurt', `{r} slips in the chocolate too. Painfully.`, [['hurt', 'r', 1], ['funny']])]),
    ],
  }),
  E('dining_keycard', {
    cat: 'exploration', loc: 'dining', title: `The Maître d'`,
    text: [`Behind the reception podium of the dining room, the maître d' is slumped over the reservations book. On a lanyard around his neck: a gold MASTER keycard. It opens every door on the ship.`],
    scene: { z: 1 }, cast: ['a', 'b?'], say: [['a', `"That card opens everything. Everything."`], ['b', `"Is he... you know? Or just tired?"`, 'Nervous']],
    choices: [
      C(`Carefully lift the lanyard`, `Slow, gentle, do not wake him.`, [O(0.6, 'item', `The lanyard slides off. He does not stir. {Team} has {loot}.`, [['item', 'keycard']]), O(0.4, 'danger', `His head snaps up. He grabs {r}'s wrist!`, [['item', 'keycard'], ['em', 'r']])]),
      C(`Cut the lanyard from a distance`, `Use something long and sharp.`, [O(0.75, 'item', `Snip. The card drops. Safe.`, [['item', 'keycard']]), O(0.25, 'neutral', `The lanyard holds. The card stays.`)]),
      safe(`Leave him alone`, `Not worth the risk.`),
      C(`Check the reservations book`, `Who was eating tonight?`, [O(1, 'funny', `The book has a note: "Table 12 complained about the soup. Again." Even now, someone was complaining about the soup.`, [['funny']])]),
      search(`Search the wine cellar behind him`, `Expensive bottles, and maybe more.`, { item: 0.55, hurt: 0, danger: 0.1 }),
    ],
  }),

  // ---------------- CASINO ----------------
  E('casino_slots', {
    cat: 'humour', loc: 'casino', title: `Jackpot`,
    text: [`The Lucky Star Casino is still lit up, every slot machine flashing and jingling to an empty room. {a} has stopped in front of one. It says SUPER JACKPOT. There are three credits left on it.`],
    cast: ['a', 'b?'], say: [['a', `"Just one spin. One."`], ['b', `"We are on a sinking ship full of zombies."`, 'Practical'], ['b', `"Spin it. SPIN IT."`, 'Reckless']],
    choices: [
      C(`Spin the slot machine`, `Feeling lucky?`, [O(0.25, 'funny', `SUPER JACKPOT! Bells, lights, sirens. Coins everywhere. And every infected on the deck heading straight for the noise. Totally worth it.`, [['funny'], ['em', 'r']]), O(0.75, 'funny', `Two cherries and a lemon. {a} is devastated.`, [['funny']])]),
      search(`Search behind the cashier's desk`, `Casinos keep cash, keys and first aid.`, { item: 0.65, hurt: 0, danger: 0.1 }),
      safe(`Walk straight through`, `Gambling is for people with futures.`),
      C(`Unplug the machines`, `All that noise is drawing them in.`, [O(0.6, 'good', `Silence falls. The casino is much safer now.`), O(0.4, 'danger', `{a} pulls the main plug and the lights die. In the dark, something grabs at {r}.`, [['em', 'r']])]),
      C(`Check the poker table`, `There is a hand left face-down.`, [O(1, 'funny', `Four aces. Somebody was about to win big. {a} pockets the cards for luck.`, [['funny']])]),
    ],
  }),
  E('casino_parrot', {
    npc: ['admiral'],
    cat: 'rescue', loc: 'casino', title: `The Admiral`,
    text: [`A scarlet macaw sits on the roulette wheel, wearing a tiny captain's hat. "AHOY," it shrieks. "AHOY. ABANDON SHIP. BRAAAINS." A tag on its leg reads: ADMIRAL — PROPERTY OF CAPT. MOREAU.`],
    cast: ['a', 'b?'], say: [['a', `"Did that parrot just say brains?"`], ['b', `"I would follow that bird into battle."`, 'Funny']],
    choices: [
      C(`Bring the Admiral along`, `The captain's parrot. He might know the way.`, [O(1, 'funny', `The Admiral hops onto {a}'s shoulder. "FULL SPEED AHEAD." He is now a member of the team.`, [['npc', 'admiral'], ['funny']])], { major: true }),
      C(`Ask the parrot where the captain is`, `It is worth a try.`, [O(0.6, 'good', `"BRIDGE. BRIDGE. DECK TWELVE." Astonishingly useful.`, [['flag', 'captain_bridge']]), O(0.4, 'funny', `"PRETTY BOY. PRETTY BOY." Not useful.`, [['funny']])]),
      safe(`Leave the parrot`, `Birds can fly. He will be fine.`, { t: `"MUTINY," shrieks the Admiral as they leave.` }),
      C(`Feed the parrot`, `He looks hungry.`, [O(1, 'funny', `The Admiral eats a canapé and says "DELICIOUS" in the captain's exact voice. Unsettling.`, [['use', 'tag', 'food'], ['npc', 'admiral'], ['funny']])], { req: { tags: ['food'] } }),
      search(`Search the high-roller room`, `The VIP lounge behind the parrot.`, { item: 0.6, hurt: 0, danger: 0.12 }),
      C(`Teach the parrot to say something useful`, `"Help" would be nice.`, [O(1, 'funny', `{a} spends two minutes teaching the Admiral to say HELP. He learns to say KELP instead.`, [['funny'], ['time', -1]])]),
    ],
  }),

  // ---------------- GALLEY ----------------
  E('galley_bruno', {
    npc: ['bruno'],
    cat: 'rescue', loc: 'galley', title: `Chef Bruno`,
    text: [`In the galley, a huge chef in a stained white jacket is holding the kitchen door shut with his back, a ladle in each hand. "You! Help me! They want into my kitchen! NOBODY comes into my kitchen!" His name tag says BRUNO.`],
    scene: { z: 2 }, cast: ['a', 'b?:Foodie'], say: [['b', `"Chef! I love your work! The soufflé on Tuesday changed my life!"`, 'Foodie'], ['a', `"Bruno, the ship is sinking."`]],
    choices: [
      C(`Help Bruno hold the door`, `Push together.`, [O(0.6, 'good', `Shoulders to the door, {team} and Bruno hold until the banging stops. He hugs everyone. "You come with me. I know the way down."`, [['npc', 'bruno'], ['item', 'chef_knife'], ['hero']]), O(0.4, 'hurt', `The door bucks. {r} is slammed against the steel counter. But it holds, and Bruno joins the team.`, [['hurt', 'r', 1], ['npc', 'bruno']])], { major: true }),
      C(`Tell Bruno to run with you`, `Leave the kitchen.`, [O(0.5, 'good', `Bruno hesitates, then grabs his knives. "Fine. But I am bringing the good pan."`, [['npc', 'bruno'], ['item', 'chef_knife']]), O(0.5, 'neutral', `"Never! A captain goes down with his ship, a chef goes down with his kitchen!" He throws {team} a bag of canapés.`, [['item', 'canapes']])]),
      search(`Raid the kitchen while he holds the door`, `Knives, food, extinguishers.`, { item: 0.7, hurt: 0.05, danger: 0.12 }),
      safe(`Leave him to it`, `He seems to be handling it.`, { t: `"COWARDS!" roars Bruno, still holding the door.` }),
      C(`Ask Bruno about the infection`, `He has seen it start.`, [O(1, 'good', `"It was the seafood from the last port. The captain knew. He got a message and still sailed." Bruno spits. "It is in his logbook."`, [['flag', 'knows_logbook']])]),
    ],
  }),
  E('galley_fire', {
    cat: 'hazard', loc: 'galley', title: `Grease Fire`,
    text: [`A deep fryer has been left on. The oil bursts into flames that leap to the ceiling. Smoke pours across the galley. The fire sprinklers sputter and fail. The way out is past the burning station.`],
    scene: { light: 'fire' }, cast: ['a', 'b?'], say: [['a', `"Do NOT throw water on it!"`], ['b', `"I was literally about to throw water on it."`, 'Funny']],
    choices: [
      C(`Smother it with a fire blanket`, `There is one on the wall.`, [O(0.7, 'good', `The blanket drops over the fryer. The flames die. Perfect.`, [['hero']]), O(0.3, 'hurt', `{a} gets too close. Burnt hands, but the fire is out.`, [['hurt', 'a', 1]])]),
      C(`Spray it with the extinguisher`, `That is what it is for.`, [O(1, 'good', `A blast of foam and the fire is gone.`, [['use', 'extinguisher']])], { req: { items: ['extinguisher'] } }),
      rush(`Run past the flames`, `Cover your face and go.`, { hurt: 0.25, danger: 0, time: 1, t: { hurt: `A burst of flame catches {r}'s sleeve.` } }),
      safe(`Go back and find another route`, `Not worth it.`, { time: -2 }),
      C(`Slam the oven doors and turn off the gas`, `Cut the fuel.`, [O(0.6, 'good', `Gas off. The fire burns down on its own.`, [['time', -1]]), O(0.4, 'hurt', `The gas valve is too hot. {r} burns a hand turning it.`, [['hurt', 'r', 1]])]),
      C(`Throw flour over it`, `Flour smothers fire. Probably.`, [O(0.5, 'good', `A sack of flour over the fryer. A white cloud, and the fire is out.`, [['funny']]), O(0.5, 'hurt', `Flour in the air plus fire is a very bad combination. A whoomph of flame catches {r}.`, [['hurt', 'r', 1]])]),
    ],
  }),

  // ---------------- THEATRE ----------------
  E('theatre_show', {
    npc: ['delphine'],
    cat: 'humour', loc: 'theatre', title: `The Show Must Go On`,
    text: [`In the Neptune Theatre, a single spotlight shines on the stage, where a singer in a sequinned gown is belting out a ballad to a thousand empty seats. Except they are not all empty. Some of them are swaying.`],
    scene: { z: 3, light: 'dim' }, cast: ['a', 'b?'], say: [['a', `"She is still singing. They are listening. They are... enjoying it?"`], ['b', `"Honestly she is very good."`, 'Funny']],
    choices: [
      C(`Sneak along the side aisle while she sings`, `Every eye is on the stage.`, [O(0.75, 'good', `{Team} tiptoes the whole length of the theatre while the audience sways.`, [['time', 1]]), O(0.25, 'danger', `The song ends. Applause, sort of. And one of them notices {r}.`, [['em', 'r']])]),
      C(`Rescue the singer`, `She cannot sing forever.`, [O(0.6, 'good', `Her name is Delphine. She finishes the song with a flourish, bows, and jumps off the stage to join {team}. "Darling, I thought you'd never ask."`, [['npc', 'delphine'], ['hero']]), O(0.4, 'danger', `She stops singing to talk. The whole audience stands up at once. One reaches for {r}.`, [['npc', 'delphine'], ['em', 'r']])]),
      safe(`Go round through the backstage corridor`, `Avoid the audience.`, { time: -1 }),
      search(`Search the dressing rooms`, `Props, costumes, first aid.`, { item: 0.6, hurt: 0, danger: 0.08 }),
      C(`Join in with the song`, `Harmonies. Why not.`, [O(1, 'funny', `{a} joins in with a shaky harmony. The singer is delighted. The audience is confused. {Team} escapes during the key change.`, [['funny'], ['time', 1]])]),
    ],
  }),
  E('theatre_trapdoor', {
    cat: 'exploration', loc: 'theatre', title: `Under the Stage`,
    text: [`Behind the theatre curtain, a stage trapdoor stands open. A ladder leads down into the dark machinery under the stage. A sign says: CREW ONLY — LEADS TO DECK 4 SERVICE CORRIDOR.`],
    scene: { light: 'dim' }, cast: ['a', 'b?'], say: [['a', `"A shortcut. Down and aft."`]],
    choices: [
      C(`Climb down the trapdoor`, `Take the crew shortcut.`, [O(0.65, 'good', `Under the stage, through a hatch, and into a service corridor far aft. A real shortcut.`, [['time', 2], ['shortcut', 1]]), O(0.35, 'danger', `A stagehand is still down there in the dark, and it reaches for {r}.`, [['em', 'r']])]),
      C(`Use the flashlight to check first`, `See what is down there.`, [O(1, 'good', `The beam shows a clear ladder and an empty passage. Down and away.`, [['use', 'flashlight'], ['time', 2]])], { req: { items: ['flashlight'] } }),
      safe(`Ignore it`, `Dark holes are bad news.`),
      search(`Search the prop room`, `Swords, rope, smoke machines.`, { item: 0.6, hurt: 0.05, t: { item: `Among the fake swords and treasure chests: {loot}.` } }),
      C(`Drop a prop down to see if anything reacts`, `Test the waters.`, [O(0.6, 'neutral', `A rubber skull bounces down. Silence. Probably safe.`), O(0.4, 'danger', `Something reacts. It climbs the ladder fast, toward {r}.`, [['em', 'r']])]),
      C(`Close the trapdoor and lock it`, `Make sure nothing comes up behind you.`, [O(1, 'neutral', `The trapdoor bolts shut. Whatever is down there stays down there.`)]),
    ],
  }),

  // ---------------- LIDO ----------------
  E('lido_pool', {
    cat: 'zombie', loc: 'lido', title: `Pool Party`,
    text: [`The Lido deck is open to the night sky. Inflatable flamingos drift on the pool. In the water, a dozen infected in swimsuits are wading in slow circles, unable to climb out. The way aft runs right along the pool edge.`],
    scene: { z: 3 }, cast: ['a', 'b?'], say: [['b', `"Pool party from hell. Literally."`, 'Funny'], ['a', `"They cannot get out. Keep away from the edge."`]],
    choices: [
      C(`Walk along the far side of the deck`, `As far from the pool as possible.`, [O(0.75, 'neutral', `Hugging the railing, {team} gets past. Hands splash at the edge but nothing climbs out.`), O(0.25, 'danger', `One of them manages the pool ladder. It comes for {r}.`, [['em', 'r']])]),
      rush(`Sprint across`, `Fast, before they react.`, { hurt: 0.15, danger: 0.12, time: 1, t: { hurt: `{r} slips on the wet deck and slides into a sun lounger.` } }),
      search(`Search the pool bar`, `Supplies and lifejackets by the lifeguard station.`, { item: 0.6, hurt: 0, danger: 0.12 }),
      safe(`Go back inside and round`, `No pool parties.`, { time: -1 }),
      C(`Throw the inflatables in to distract them`, `Give them something to grab.`, [O(0.7, 'funny', `A flamingo, a unicorn, a giant doughnut. The infected wrestle the inflatables while {team} strolls past.`, [['funny']]), O(0.3, 'danger', `They ignore the flamingo. One heads for {r} at the ladder.`, [['em', 'r']])]),
    ],
  }),
  E('lido_slide', {
    cat: 'humour', loc: 'lido', title: `The Waterslide`,
    text: [`The Hydro-Twister waterslide spirals down from the top deck, down the side of the ship, and ends in a splash pool on Deck 5, right next to the lifeboat stairs. The water is still running.`],
    cast: ['a', 'b?'], say: [['a', `"Hear me out."`], ['b', `"I am not hearing you out. ...How fast is it?"`, 'Reckless']],
    choices: [
      C(`Everyone ride the waterslide`, `The fastest route aft. Probably.`, [O(0.55, 'funny', `WHEEEEE! A spiral of screaming joy, and {team} shoots out on Deck 5. Huge shortcut.`, [['funny'], ['time', 2], ['shortcut', 1]]), O(0.3, 'hurt', `The slide has a broken section. {r} bounces through it and lands hard in the splash pool.`, [['hurt', 'r', 1], ['funny'], ['time', 1]]), O(0.15, 'danger', `Someone was already in the splash pool at the bottom. Waiting. It grabs {r}.`, [['em', 'r'], ['funny']])]),
      safe(`Take the stairs like adults`, `Boring, but safe.`, { t: `Twelve flights of stairs. {a} looks longingly at the slide the whole way.` }),
      C(`Send one brave person down first`, `Test it.`, [O(0.7, 'good', `{a} goes first and shouts "CLEAR!" from the bottom. Everyone follows.`, [['time', 2], ['funny']]), O(0.3, 'hurt', `{a} goes first and finds the broken section. Bruised, but they shout a warning.`, [['hurt', 'a', 1], ['time', 1]])]),
      search(`Search the slide tower`, `The lifeguard hut is at the top.`, { item: 0.55, hurt: 0, danger: 0.08 }),
      C(`Slide down on a lifejacket for speed`, `Maximum velocity.`, [O(1, 'funny', `{a} rides a lifejacket down the slide at a speed science cannot explain. Everyone else follows the screaming.`, [['funny'], ['time', 2]])], { req: { items: ['lifejackets'] } }),
      C(`Block the slide so nothing comes down after you`, `Jam it with deck chairs.`, [O(1, 'neutral', `Three deck chairs wedged in the slide entrance. Then {team} takes the stairs.`, [['time', -1]])]),
    ],
  }),

  // ---------------- MEDBAY ----------------
  E('medbay_anand', {
    npc: ['anand'],
    cat: 'rescue', loc: 'medbay', title: `Dr Anand`,
    text: [`The Medical Centre is a wreck, but at the back, behind a locked glass door, a doctor in a mask is working at a microscope. She looks up. "Doctor Priya Anand. Are any of you bitten or scratched? Be honest. It matters."`],
    cast: ['a', 'b?:Medic'], say: [['b', `"Doctor, can I help? I have first aid training."`, 'Medic'], ['a', `"We are heading for the lifeboats. Come with us."`]],
    choices: [
      C(`Ask her to treat your wounds`, `She is a real doctor.`, [O(1, 'good', `Dr Anand works quickly and calmly. Everyone is patched up properly.`, [['heal', 'all', 1], ['time', -1]])]),
      C(`Invite her to come with you`, `A doctor could save lives.`, [O(0.6, 'good', `She packs a bag. "I was waiting for someone sensible." She joins the team.`, [['npc', 'anand'], ['item', 'first_aid']]), O(0.4, 'neutral', `"I have patients," she says, nodding at the quarantine ward. She gives {team} a first aid kit.`, [['item', 'first_aid']])], { major: true }),
      C(`Ask about the antiviral`, `Is there a treatment?`, [O(1, 'item', `"One dose. Experimental. It works if you use it before the fever peaks." She presses it into {a}'s hand: {loot}.`, [['item', 'antiviral']])]),
      safe(`Leave her to her work`, `She knows what she is doing.`),
      C(`Confess a scratch`, `Honesty matters.`, [O(1, 'good', `She checks carefully. "Not infected. Just a scratch." She cleans it anyway.`, [['heal', 'injured', 1]])], { req: { injured: true } }),
      C(`Ask what caused the outbreak`, `She must know.`, [O(1, 'good', `"Contaminated seafood from the last port. Captain Moreau was warned. It will be in his log." She looks furious.`, [['flag', 'knows_logbook']])]),
    ],
  }),
  E('medbay_quarantine', {
    cat: 'zombie', loc: 'medbay', title: `Quarantine Ward`,
    text: [`The quarantine ward door has a small window. Inside, beds rattle against their restraints. A whiteboard by the door reads: DO NOT OPEN. CONTAINED. The lock is flashing red. Then amber. Then green.`],
    scene: { z: 3, light: 'alert' }, cast: ['a', 'b?'], say: [['a', `"Green. Green is bad. Why is it green?"`], ['b', `"The power is failing. The locks are failing."`, 'Engineer']],
    choices: [
      rush(`Run before the door opens`, `Go, go, go.`, { hurt: 0.1, danger: 0.15, time: 1 }),
      C(`Hold the door shut`, `Keep them in.`, [O(0.5, 'good', `{Team} holds the door while {a} jams it with a chair. Contained, for now.`, [['hero']]), O(0.5, 'hurt', `The door bucks. {r} is thrown back. But it stays shut.`, [['hurt', 'r', 1]])]),
      C(`Grab supplies from the pharmacy first`, `There might be time.`, [O(0.55, 'item', `Pharmacy shelves: {loot}. The door is still holding.`, [['loot']]), O(0.45, 'danger', `The door gives. Something comes straight for {r}.`, [['em', 'r']])]),
      safe(`Barricade the corridor and go round`, `Slow, but they will not follow.`, { time: -2 }),
      C(`Lock it with the master keycard`, `Override the lock.`, [O(1, 'good', `Beep. The lock flicks back to red. Contained.`)], { req: { items: ['keycard'] } }),
      C(`Look through the window`, `Count how many.`, [O(0.7, 'neutral', `Eight beds. Eight patients. All of them are looking back at {a}.`), O(0.3, 'danger', `The glass cracks as one slams against it. Then the door opens. It goes for {r}.`, [['em', 'r']])]),
    ],
  }),

  // ---------------- CREW QUARTERS ----------------
  E('crew_lockers', {
    cat: 'exploration', loc: 'crew', title: `Crew Lockers`,
    text: [`The crew quarters are a maze of bunks and lockers. A board by the door lists LIFEBOAT ASSIGNMENTS, and a hook marked WINCH KEYS — DECK 5 has one brass key left on it.`],
    scene: { light: 'dim' }, cast: ['a', 'b?:Practical'], say: [['b', `"Winch key. That releases the lifeboats. We need that."`, 'Practical'], ['a', `"Grab it. Grab everything."`]],
    choices: [
      C(`Take the winch key`, `This is what lowers a lifeboat.`, [O(1, 'item', `The brass key is heavy and cold. {Team} has {loot}.`, [['item', 'winch_key']])]),
      search(`Search the lockers`, `Crew keep radios, torches and lifejackets.`, { item: 0.7, hurt: 0, danger: 0.12 }),
      safe(`Keep moving`, `No time.`),
      C(`Read the lifeboat assignments`, `Which boat is yours?`, [O(1, 'good', `Boat 14, starboard side, has a working motor according to a scrawled note. Good to know.`, [['flag', 'boat14']])]),
      C(`Check the bunks for survivors`, `Crew might be hiding.`, [O(0.4, 'good', `A young deckhand in a top bunk, terrified. He gives {team} his radio and runs for the stairs.`, [['item', 'radio']]), O(0.6, 'danger', `Someone is in a bunk. Not hiding. Waiting. It reaches for {r}.`, [['em', 'r']])]),
    ],
  }),
  E('crew_giles', {
    npc: ['giles'],
    cat: 'interaction', loc: ['crew', 'corridor7', 'casino'], req: { not: ['npc_giles'] }, title: `Purser Giles`,
    text: [`A man in an immaculate officer's uniform steps out of a doorway, smoothing his hair. "Purser Giles. Thank heavens, passengers. I can get you to a lifeboat. Officers know the quick way. Stay close to me."`],
    cast: ['a', 'b?'], say: [['b', `"His uniform is suspiciously clean."`, 'Intelligent'], ['b', `"An officer! We are saved!"`, 'Nervous']],
    choices: [
      C(`Follow Giles`, `He knows the ship.`, [O(1, 'good', `Giles leads the way through crew passages. He is very good at it.`, [['npc', 'giles'], ['time', 1]])], { major: true }),
      C(`Ask Giles for the winch key`, `Officers have them.`, [O(0.5, 'item', `Giles hesitates, then hands over a spare: {loot}.`, [['item', 'winch_key'], ['npc', 'giles']]), O(0.5, 'neutral', `"I'm afraid I don't have one," says Giles. His pocket jingles.`)]),
      safe(`Decline politely`, `You do not know him.`, { t: `Giles smiles too widely. "Suit yourselves." He disappears down the corridor.` }),
      C(`Ask him why he is not with the crew`, `Where is everyone else?`, [O(1, 'neutral', `"Oh, they're... busy." He does not look anyone in the eye.`, [['flag', 'suspect_giles']])]),
      C(`Ask for directions only`, `Information without company.`, [O(1, 'good', `"Crew stairwell C, straight down to Deck 5." Accurate, to everyone's surprise.`, [['time', 1]])]),
    ],
  }),

  // ---------------- CARGO HOLD ----------------
  E('hold_cars', {
    cat: 'exploration', loc: 'hold', title: `The Car Deck`,
    text: [`The cargo hold is full of passengers' cars, chained to the deck. Water is sloshing ankle-deep across the floor. A fuel station for the lifeboat engines stands by the far wall, with diesel cans lined up neatly.`],
    scene: { light: 'dim' }, cast: ['a', 'b?:Engineer'], say: [['b', `"Diesel. Lifeboat motors need diesel."`, 'Engineer'], ['a', `"Water is coming in. We need to be quick."`]],
    choices: [
      C(`Take a diesel can`, `For the lifeboat motor.`, [O(0.85, 'item', `{a} grabs a full diesel can: {loot}.`, [['item', 'fuel']]), O(0.15, 'danger', `Behind the fuel station, a crewman is still on duty. It turns toward {r}.`, [['item', 'fuel'], ['em', 'r']])]),
      search(`Search the cars`, `Boots full of holiday luggage.`, { item: 0.6, hurt: 0.05, danger: 0.12 }),
      safe(`Get out before it floods`, `No time.`, { time: 1, t: `{Team} splashes back up the stairs as the water rises behind.` }),
      C(`Start a car alarm as a distraction`, `Lure them down here.`, [O(0.7, 'good', `A dozen alarms go off at once. Every infected on this deck heads for the noise.`, [['time', 1]]), O(0.3, 'danger', `The alarms bring them, but too fast. One comes for {r}.`, [['em', 'r']])]),
      C(`Drive a car up the ramp`, `Why not.`, [O(0.3, 'funny', `{a} drives a convertible up the loading ramp onto Deck 3 with the roof down. Completely unnecessary. Completely glorious.`, [['funny'], ['time', 1]]), O(0.7, 'neutral', `The chains will not come off. The car stays.`, [['funny']])]),
    ],
  }),
  E('hold_ducks', {
    cat: 'humour', loc: 'hold', title: `Cargo Manifest`,
    text: [`A shipping crate has split open. Thousands of yellow rubber ducks are spilling out and floating across the flooding hold. The label reads: 50,000 UNITS — DUCK, RUBBER, NOVELTY.`],
    cast: ['a', 'b?'], say: [['a', `"Why. Why would anyone ship this many ducks."`], ['b', `"This is the best day of my life. I mean, apart from the zombies."`, 'Funny']],
    choices: [
      C(`Use the ducks as a distraction`, `Kick them across the water toward the infected.`, [O(0.7, 'funny', `A flotilla of ducks bobs across the hold. Every infected stops to stare. {Team} walks right past.`, [['funny'], ['time', 1]]), O(0.3, 'danger', `The ducks do not distract them. One wades toward {r} through the ducks. Horrifying and silly.`, [['em', 'r'], ['funny']])]),
      C(`Take a duck for luck`, `Every team needs a mascot.`, [O(1, 'funny', `{a} picks the best duck and names it Captain Quackers. He is now the team mascot.`, [['funny'], ['flag', 'duck']])]),
      search(`Search the other crates`, `Maybe something useful was shipped too.`, { item: 0.55, hurt: 0.05, t: { item: `Under a crate of novelty ducks: {loot}.` } }),
      safe(`Wade past the ducks`, `Ignore it. Ignore all of it.`),
      C(`Stack crates to climb to the upper hatch`, `Get out of the water.`, [O(0.6, 'good', `A wobbly tower of crates leads to a hatch onto Deck 3.`, [['time', 1]]), O(0.4, 'hurt', `The tower collapses. {r} lands in a sea of ducks.`, [['hurt', 'r', 1], ['funny']])]),
    ],
  }),

  // ---------------- ENGINE ROOM ----------------
  E('engine_restart', {
    cat: 'exploration', loc: 'engine', title: `Dead Engines`,
    text: [`The engine room is enormous and silent. A control panel flashes: GENERATOR 2 — OFFLINE — MANUAL RESTART REQUIRED. If the generators come back, the lights, pumps and lifeboat winches will work again.`],
    scene: { light: 'dim' }, cast: ['a', 'b?:Engineer'], say: [['b', `"I can do this. Prime the fuel, open the valve, hit the starter. Easy."`, 'Engineer'], ['a', `"If we get power back, the pumps might slow the sinking."`]],
    choices: [
      C(`Restart the generator`, `Follow the instructions on the panel.`, [O(0.55, 'good', `Prime, valve, starter. With a roar, Generator 2 thunders to life. Lights flicker on across the ship. The pumps start.`, [['flag', 'power'], ['time', 3], ['hero']]), O(0.3, 'neutral', `It coughs and dies. Not enough fuel in the line.`, [['time', -1]]), O(0.15, 'danger', `The noise of the starter wakes every infected engineer in the room. One lunges for {r}.`, [['em', 'r']])]),
      C(`Pour in diesel and restart`, `Give it the fuel it needs.`, [O(1, 'good', `With fresh fuel, the generator starts first time. Lights, pumps, winches: everything comes back.`, [['use', 'fuel'], ['flag', 'power'], ['time', 3], ['hero']])], { req: { items: ['fuel'] } }),
      search(`Search the engineers' workshop`, `Tools, torches and fuel cans.`, { item: 0.65, hurt: 0.05, danger: 0.12 }),
      safe(`Leave it`, `Engines are not your job.`),
      C(`Read the engineers' notice board`, `There might be useful information.`, [O(1, 'good', `A note: "If power fails, lifeboat davits can be released manually with the brass winch key." Useful.`, [['flag', 'knows_winch']])]),
      C(`Ask over the intercom for an engineer`, `Someone might still be down here.`, [O(0.35, 'good', `A voice crackles back: "Hit the green button, then the big lever!" The generator roars to life.`, [['flag', 'power'], ['time', 3]]), O(0.65, 'danger', `No engineer answers. Something else heard, and it comes for {r}.`, [['em', 'r']])]),
    ],
  }),
  E('engine_steam', {
    cat: 'hazard', loc: 'engine', title: `Steam`,
    text: [`A pipe bursts with a scream. Scalding steam floods the walkway, turning the engine room white. Through the cloud, shapes are moving.`],
    scene: { light: 'fog', z: 2 }, cast: ['a', 'b?'], say: [['a', `"Get down! Under the steam!"`]],
    choices: [
      C(`Crawl under the steam`, `It rises. Stay low.`, [O(0.75, 'good', `Low and fast, under the white cloud. Out the other side.`), O(0.25, 'hurt', `A blast of steam catches {r}'s arm.`, [['hurt', 'r', 1]])]),
      C(`Close the steam valve`, `It must be nearby.`, [O(0.5, 'good', `{a} finds the valve and spins it shut. The hissing stops.`, [['hero']]), O(0.5, 'hurt', `The valve is scalding. {a} burns both hands turning it.`, [['hurt', 'a', 1], ['hero']])]),
      rush(`Run through it`, `Cover your face and sprint.`, { hurt: 0.3, danger: 0.05, time: 1, t: { hurt: `{r} is scalded running through the steam.` } }),
      safe(`Go back the other way`, `Find another route.`, { time: -2 }),
      C(`Wait for the shapes to come through first`, `Let the steam do the work.`, [O(0.6, 'good', `The infected stumble into the steam and collapse. Path clear.`, [['time', -1]]), O(0.4, 'danger', `One staggers out of the steam, half-cooked and furious, straight at {r}.`, [['em', 'r']])]),
    ],
  }),

  // ---------------- FLOODED DECK ----------------
  E('flooded_swim', {
    cat: 'hazard', loc: 'flooded', title: `Underwater Corridor`,
    text: [`Deck 2 is flooded to the ceiling for a ten-metre stretch. Beyond it, the corridor rises again into air and dim light. The only way through is to hold your breath and swim.`],
    scene: { fx: 'water' }, cast: ['a', 'b?:Brave'], say: [['b', `"I will go first and tie a line."`, 'Brave'], ['a', `"Ten metres. Big breath. Do not panic."`]],
    choices: [
      C(`Swim through one at a time`, `Big breath and go.`, [O(0.75, 'good', `One by one, everyone surfaces on the far side, gasping.`), O(0.25, 'hurt', `{r} catches a sleeve on a door handle underwater and swallows half the sea.`, [['hurt', 'r', 1]])]),
      C(`Tie a rope line first`, `Pull yourselves through.`, [O(1, 'good', `With a rope to follow, everyone gets through quickly.`, [['time', 1]])], { req: { items: ['rope'] } }),
      C(`Put on lifejackets and float along the ceiling gap`, `There is a tiny air gap at the top.`, [O(0.6, 'good', `Noses pressed to the ceiling, floating in lifejackets, {team} makes it through.`, [['funny']]), O(0.4, 'neutral', `The jackets hold you up but you cannot dive. Back the way you came.`, [['time', -2]])], { req: { items: ['lifejackets'] } }),
      safe(`Go back and find a dry route`, `No swimming.`, { time: -2 }),
      C(`Search for an air pocket in the side cabins`, `Rest halfway.`, [O(0.5, 'item', `A cabin with an air pocket, and {loot} floating inside.`, [['loot']]), O(0.5, 'danger', `There is an air pocket. Something else is breathing in it. It grabs {r}.`, [['em', 'r']])]),
      C(`Wait for the water to drop`, `The pumps might kick in.`, [O(0.4, 'good', `The water drains a little. Enough to wade.`, [['time', -1]]), O(0.6, 'neutral', `It rises instead.`, [['time', -2]])]),
      C(`Send the strongest swimmer first with a light`, `Lead the way.`, [O(0.7, 'good', `{a} swims through and shines a light back. Everyone follows the glow.`), O(0.3, 'hurt', `{a} hits their head on a pipe underwater, but makes it.`, [['hurt', 'a', 1]])]),
    ],
  }),
  E('flooded_trapped', {
    cat: 'rescue', loc: 'flooded', title: `The Air Pocket`,
    text: [`Knocking. Inside a half-flooded crew cabin, two engineers are trapped in an air pocket, heads against the ceiling. "The door's jammed! Water's still rising! Please!"`],
    scene: { fx: 'water' }, cast: ['a', 'b?:Kind'], say: [['b', `"We are getting them out. Right now."`, 'Kind'], ['a', `"How long have they got?"`]],
    choices: [
      C(`Force the door together`, `Everyone pull.`, [O(0.6, 'good', `The door gives with a rush of water. Two engineers tumble out, coughing. One presses a winch key into {a}'s hand.`, [['item', 'winch_key'], ['hero']]), O(0.4, 'hurt', `The door bursts and the water knocks {r} flat. But everyone is out.`, [['hurt', 'r', 1], ['hero']])], { major: true }),
      C(`Smash the door with the fire axe`, `Chop through.`, [O(1, 'good', `Three swings and the door splits. The engineers swim out. "Winch key, take it. Boat 14 has a motor."`, [['use', 'fire_axe'], ['item', 'winch_key'], ['flag', 'boat14'], ['hero']])], { req: { items: ['fire_axe'] } }),
      C(`Tell them to dive under and out the porthole`, `Talk them through it.`, [O(0.5, 'good', `They take a breath and squeeze through the porthole. Free.`, [['hero']]), O(0.5, 'neutral', `The porthole is too small. They keep knocking.`)]),
      safe(`Promise to send help and move on`, `You cannot do this alone.`, { t: `The knocking follows {team} down the corridor. It gets quieter.` }),
      C(`Pass them an air tube`, `A hose through the gap.`, [O(0.7, 'good', `A length of hose through the door seal gives them air while {team} prises it open.`, [['hero'], ['time', -1]]), O(0.3, 'hurt', `{r} cuts a hand forcing the hose through.`, [['hurt', 'r', 1], ['hero']])]),
      C(`Look for another way into the cabin`, `There might be a connecting door.`, [O(0.5, 'good', `The connecting door from the next cabin opens. Both engineers scramble out and give {team} {loot}.`, [['loot'], ['hero']]), O(0.5, 'neutral', `No other way in. The knocking continues.`, [['time', -1]])]),
    ],
  }),

  // ---------------- BRIDGE ----------------
  E('bridge_captain', {
    npc: ['moreau'],
    cat: 'moral', loc: 'bridge', title: `Captain Moreau`, major: true,
    text: [`On the bridge, Captain Moreau sits in his chair, staring at the black sea, a bottle in his hand. His arm is bandaged. "I knew," he says, without turning. "I got the message before we sailed. I sailed anyway. It is all in the log." He taps a leather book beside him.`],
    scene: { light: 'night' }, cast: ['a', 'b?'], say: [['a', `"You knew? You knew, and you sailed?"`], ['b', `"Is that bandage hiding a bite, Captain?"`, 'Intelligent']],
    choices: [
      C(`Take the logbook`, `The world needs to know.`, [O(1, 'item', `{a} picks up the logbook. The captain does not try to stop it. "Make them pay," he whispers.`, [['item', 'logbook'], ['flag', 'has_logbook']])]),
      C(`Ask him to help you escape`, `He knows these waters.`, [O(0.6, 'good', `He stands, slowly. "Boat 14. Starboard. Head north-east for the lighthouse." He hands over his compass.`, [['item', 'compass'], ['flag', 'boat14']]), O(0.4, 'danger', `He stands. His eyes are going white. He lunges for {r}.`, [['em', 'r']])]),
      C(`Fix the helm and steer for land`, `The ship itself could get you there.`, [O(0.5, 'good', `The steering responds. If the engines have power, this ship could limp toward the coast.`, [['flag', 'helm']]), O(0.5, 'neutral', `The helm is locked out. It needs main power.`)]),
      C(`Send a mayday on the bridge radio`, `Tell the coastguard you are here.`, [O(0.7, 'good', `"Mayday mayday mayday. This is the Aurora Star." A voice answers: "Aurora Star, coastguard. Help is coming. Hold on."`, [['flag', 'coastguard']]), O(0.3, 'neutral', `Static. The bridge radio is dead without power.`)]),
      safe(`Leave him`, `He made his choice.`, { t: `Captain Moreau does not turn round. He stays with his ship.` }),
      C(`Check his bandage`, `If it is a bite, he is a danger.`, [O(0.5, 'neutral', `It is a bite. He nods. "I know. Leave me with my ship." He gives {team} the logbook.`, [['item', 'logbook'], ['flag', 'has_logbook']]), O(0.5, 'danger', `He does not like being touched. He turns, eyes white, toward {r}.`, [['em', 'r']])]),
    ],
  }),
  E('bridge_radio', {
    cat: 'exploration', loc: 'bridge', title: `Channel 16`,
    text: [`The radio room behind the bridge is intact. A big red DISTRESS button sits under a plastic cover. Charts of the coastline are spread across the table. A flare pistol hangs in a bracket on the wall.`],
    cast: ['a', 'b?:Intelligent'], say: [['b', `"The coast is closest to the north-east. About six miles."`, 'Intelligent'], ['a', `"Press the button. Press all the buttons."`]],
    choices: [
      C(`Press the distress button`, `Send the automatic mayday.`, [O(0.8, 'good', `The distress beacon starts transmitting. Somewhere, a coastguard station lights up.`, [['flag', 'coastguard']]), O(0.2, 'neutral', `The button lights, then dies. No power.`)]),
      C(`Take the flare pistol`, `For signalling from the lifeboat.`, [O(1, 'item', `The flare pistol comes off the bracket: {loot}.`, [['item', 'flare_pistol']])]),
      C(`Study the charts`, `Plan the route to land.`, [O(1, 'good', `North-east, six miles, a lighthouse on the point. {a} memorises it.`, [['flag', 'route']])]),
      safe(`Get out of here`, `The bridge is too exposed.`),
      search(`Search the officers' lockers`, `Officers keep the good kit.`, { item: 0.7, hurt: 0, danger: 0.1 }),
    ],
  }),

  // ---------------- LIFEBOATS ----------------
  E('lb_crowd', {
    npc: ['passenger', 'passenger'],
    cat: 'moral', loc: 'lifeboats', title: `Every Seat Counts`, major: true,
    text: [`The lifeboat station is chaos. Passengers fight over the last boats. A crew officer with a megaphone shouts: "Women and children first! No! Everybody! Just GET IN!" A lifeboat swings out, half full. Infected are coming down the deck.`],
    scene: { z: 3 }, cast: ['a', 'b?'], say: [['a', `"There! That boat has space!"`], ['b', `"Help the others first. Please."`, 'Kind']],
    choices: [
      C(`Help others into the boat`, `Every seat counts.`, [O(0.6, 'good', `{Team} lifts children and elderly passengers into the lifeboat as it lowers away. A dozen people saved.`, [['hero'], ['time', -1]]), O(0.4, 'hurt', `As the boat lowers, the infected arrive. {r} is hurt holding them back.`, [['hurt', 'r', 1], ['hero']])]),
      C(`Hold back the infected while the boat loads`, `Buy them time.`, [O(0.55, 'good', `Shoulder to shoulder, {team} holds the deck until the boat is away.`, [['hero']]), O(0.45, 'danger', `There are too many. One breaks through to {r}.`, [['em', 'r'], ['hero']])]),
      search(`Grab gear from the lifeboat lockers`, `Flares, lifejackets, fuel.`, { item: 0.75, hurt: 0, danger: 0.12 }),
      safe(`Stay back from the crowd`, `Wait for your moment.`, { time: -1 }),
      C(`Push your way through`, `Your survival comes first.`, [O(0.6, 'neutral', `Elbows and shouting. {Team} gets near the front, but the boat lowers away without them. Next boat.`, [['flag', 'pushed']]), O(0.4, 'hurt', `Someone shoves back. {r} is knocked into the railing.`, [['hurt', 'r', 1], ['flag', 'pushed']])]),
    ],
  }),
  E('lb_winch', {
    cat: 'hazard', loc: ['lifeboats', 'promenade', 'tender'], title: `The Jammed Davit`,
    text: [`Lifeboat 14 hangs from its davits, swinging in the wind. The release lever will not budge. A brass keyhole sits next to it: WINCH KEY REQUIRED. The ship lurches. The water is closer than it was.`],
    cast: ['a', 'b?:Engineer'], say: [['b', `"Without the key, we could crank it by hand. It will take ages."`, 'Engineer'], ['a', `"Hurry. HURRY."`]],
    choices: [
      C(`Use the winch key`, `Turn the key and lower away.`, [O(1, 'good', `Clunk. The davits release smoothly. Lifeboat 14 is ready.`, [['flag', 'boat_ready']])], { req: { items: ['winch_key'] } }),
      C(`Crank it by hand`, `Slow, back-breaking work.`, [O(0.6, 'good', `Arms burning, {team} cranks the boat down to deck level. Ready.`, [['flag', 'boat_ready'], ['time', -2]]), O(0.4, 'hurt', `The crank slips and spins. {r} takes the handle in the ribs. But the boat comes down.`, [['hurt', 'r', 1], ['flag', 'boat_ready'], ['time', -2]])]),
      C(`Hit the release with the fire axe`, `Brute force.`, [O(0.5, 'good', `One mighty swing and the release snaps. The boat drops to deck level with a bang.`, [['flag', 'boat_ready'], ['use', 'tag', 'tool']]), O(0.5, 'hurt', `The axe bounces off. {a} jars both arms. The boat stays.`, [['hurt', 'a', 1], ['use', 'tag', 'tool']])], { req: { tags: ['tool'] } }),
      safe(`Look for another boat`, `This one is stuck.`, { time: -2 }),
      search(`Search the lifeboat locker first`, `There might be supplies, or the key.`, { item: 0.6, hurt: 0, danger: 0.1 }),
      C(`Use the electric controls`, `If there is power, the winch works.`, [O(1, 'good', `Power is back. The motor whirs and the boat swings down. Ready.`, [['flag', 'boat_ready']])], { req: { flags: ['power'] } }),
      C(`Climb in and kick the release`, `Sometimes violence is the answer.`, [O(0.4, 'good', `Three hard kicks and the release jolts free. The boat drops to deck level.`, [['flag', 'boat_ready']]), O(0.6, 'hurt', `The release does not budge. {a} hurts a foot.`, [['hurt', 'a', 1]])]),
      C(`Wave down a crew member to help`, `Someone must know how to do this.`, [O(0.5, 'good', `A deckhand runs over, yanks a hidden safety pin, and the release works. "Every time," he sighs.`, [['flag', 'boat_ready']]), O(0.5, 'danger', `The crew member is not on duty any more. Not in that way. It comes for {r}.`, [['em', 'r']])]),
    ],
  }),

  // ---------------- PROMENADE ----------------
  E('prom_wave', {
    cat: 'hazard', loc: 'promenade', title: `The Wave`,
    text: [`A storm has blown in. Out on the open promenade deck, a huge wave crashes over the railing and sweeps across the wooden boards, carrying deck chairs, lifebuoys and anything not tied down.`],
    scene: { light: 'storm', weather: 'rain' }, cast: ['a', 'b?'], say: [['a', `"Hold onto the railing!"`], ['b', `"I did not sign up for the extreme package!"`, 'Funny']],
    choices: [
      C(`Grab the railing and hold on`, `Brace for it.`, [O(0.75, 'neutral', `The wave crashes over everyone. When it drains, everyone is still holding on. Soaked.`), O(0.25, 'hurt', `{r} loses their grip and is slammed into a lifeboat davit.`, [['hurt', 'r', 1]])]),
      rush(`Run for the doors before the next wave`, `Sprint across the deck.`, { hurt: 0.2, danger: 0, time: 1, t: { hurt: `The next wave catches {r} halfway.` } }),
      C(`Tie everyone together`, `Nobody gets swept away.`, [O(1, 'good', `Roped together, nobody can be lost. The waves do their worst and everyone stays on deck.`)], { req: { items: ['rope'] } }),
      safe(`Go back inside and take the corridors`, `Out of the weather.`, { time: -2 }),
      C(`Grab the lifebuoys as they wash past`, `They might be useful.`, [O(0.6, 'item', `{a} snatches a lifebuoy and a bag caught in it: {loot}.`, [['loot']]), O(0.4, 'hurt', `The wave pulls {a} toward the railing.`, [['hurt', 'a', 1]])]),
      C(`Duck under a lifeboat for shelter`, `Let the wave pass over.`, [O(0.7, 'neutral', `The wave crashes over the lifeboat above. {Team} stays mostly dry underneath.`), O(0.3, 'hurt', `The wave still finds a way in. {r} is swept into a davit.`, [['hurt', 'r', 1]])]),
    ],
  }),
  E('prom_quartet', {
    npc: ['musician', 'musician'],
    cat: 'interaction', loc: 'promenade', title: `The Quartet`,
    text: [`Under the promenade awning, a string quartet in soaked dinner jackets is still playing, eyes closed, completely absorbed. The cellist nods to {team} without missing a note.`],
    cast: ['a', 'b?'], say: [['a', `"They are still playing."`], ['b', `"Somehow that is the most comforting and the most terrifying thing I have ever seen."`, 'Sarcastic']],
    choices: [
      C(`Ask them to come with you`, `They will drown out here.`, [O(0.5, 'good', `The cellist shakes her head. "We play until the end. Take this." She hands over a flare pistol from the lifebuoy box.`, [['item', 'flare_pistol']]), O(0.5, 'neutral', `They smile and keep playing. They have made their choice.`)]),
      C(`Listen for a moment`, `Everyone needs a moment.`, [O(1, 'good', `Thirty seconds of music in the storm. Somehow, everyone feels braver.`, [['heal', 'injured', 1], ['time', -1]])]),
      C(`Request a song`, `Something cheerful.`, [O(1, 'funny', `{a} asks for something upbeat. They play a sea shanty at double speed. {Team} marches aft in time to the music.`, [['funny'], ['time', 1]])]),
      safe(`Keep moving`, `No time.`),
      C(`Use the music as cover`, `The infected follow sound.`, [O(0.7, 'good', `The infected drift toward the music. {Team} slips the other way.`, [['time', 1]]), O(0.3, 'danger', `One infected ignores the music and comes for {r}.`, [['em', 'r']])]),
    ],
  }),

  // ---------------- TENDER BAY ----------------
  E('tender_jetski', {
    cat: 'exploration', loc: 'tender', title: `The Toy Box`,
    text: [`The tender bay is a hangar at the waterline. A huge hull door is half open to the sea. Racked along the wall: kayaks, paddleboards, and two jet skis marked SHORE EXCURSIONS. The keys are in a cabinet with a glass front.`],
    scene: { light: 'dim' }, cast: ['a', 'b?:Reckless'], say: [['b', `"JET SKIS. We are taking the jet skis."`, 'Reckless'], ['a', `"Six miles of open sea on a jet ski?"`]],
    choices: [
      C(`Smash the cabinet and take the jet ski keys`, `Fast escape.`, [O(1, 'good', `Glass shatters. Two keys. If it comes to it, the jet skis could get some people out.`, [['flag', 'jetski']])]),
      search(`Search the tender bay lockers`, `Excursion gear: lifejackets, flares, fuel.`, { item: 0.7, hurt: 0, danger: 0.1 }),
      safe(`Ignore the toys`, `Lifeboats are safer.`),
      C(`Check the hull door controls`, `Could a lifeboat launch from here?`, [O(1, 'good', `The hull door can open fully onto the water. A boat could launch straight out.`, [['flag', 'hull_door']])]),
      C(`Try out a paddleboard`, `Just a little paddle.`, [O(1, 'funny', `{a} wobbles on a paddleboard for five seconds and falls in. Everyone agrees not to do that again.`, [['funny'], ['time', -1]])]),
    ],
  }),

  // ---------------- ANYWHERE ----------------
  E('any_steward', {
    cat: 'zombie', loc: '*', title: `Turndown Service`,
    text: [`An infected steward stands in the corridor, folding a towel into a swan with slow, jerky movements. Over and over. It has not noticed {team}.`],
    scene: { z: 1 }, cast: ['a', 'b?'], say: [['b', `"It is still doing towel animals. That is honestly the saddest thing."`, 'Kind'], ['b', `"I want that swan."`, 'Funny']],
    choices: [
      C(`Sneak past`, `Quietly.`, [O(0.7, 'neutral', `Tiptoe, tiptoe. It keeps folding.`), O(0.3, 'danger', `A floorboard creaks. It drops the swan and turns to {r}.`, [['em', 'r']])]),
      C(`Take it down quietly`, `Two people, one steward.`, [O(0.6, 'item', `Quick and quiet. Its trolley holds {loot}.`, [['loot'], ['hero']]), O(0.25, 'hurt', `It fights back. {r} is scratched.`, [['hurt', 'r', 1]]), O(0.15, 'danger', `It spins round and grabs {r}!`, [['em', 'r']])]),
      C(`Distract it with a towel`, `Throw a towel down the corridor.`, [O(0.75, 'funny', `It shuffles after the towel to fold it. Professional to the end.`, [['funny']]), O(0.25, 'danger', `It ignores the towel and turns to {r}.`, [['em', 'r']])]),
      safe(`Go round by another corridor`, `Avoid it.`, { time: -1 }),
      C(`Wait for it to finish the swan`, `It might move on.`, [O(0.6, 'neutral', `It finishes the swan, places it on a bed, and wanders into a cabin.`, [['time', -1], ['funny']]), O(0.4, 'danger', `It finishes the swan and turns round. Toward {r}.`, [['em', 'r']])]),
      C(`Take it down with a weapon`, `One clean hit.`, [O(1, 'item', `One swing. Its trolley holds {loot}.`, [['use', 'tag', 'melee'], ['loot']])], { req: { tags: ['melee'] } }),
    ],
  }),
  E('any_conga', {
    cat: 'zombie', loc: '*', stage: [8, 40], title: `The Conga Line`,
    text: [`Music is still playing from the deck speakers. And along the corridor comes a conga line of infected passengers in party hats, hands on each other's shoulders, shuffling in time. Forty of them. Heading straight for {team}.`],
    scene: { z: 6 }, cast: ['a', 'b?'], say: [['b', `"A zombie conga line. I have seen everything now. EVERYTHING."`, 'Funny'], ['a', `"Get out of the corridor. NOW."`]],
    choices: [
      C(`Dive into a cabin and shut the door`, `Let them pass.`, [O(0.65, 'neutral', `Squashed in a cabin bathroom, {team} listens to the conga pass. It takes a very long time.`, [['time', -2]]), O(0.35, 'danger', `The cabin is not empty. Something in the shower curtain reaches for {r}.`, [['em', 'r']])]),
      rush(`Run ahead of them`, `Outrun the line.`, { hurt: 0.15, danger: 0.2, time: 1 }),
      C(`Join the end of the conga line`, `Blend in. Dance.`, [O(0.45, 'funny', `{Team} joins the end of the line, hands on shoulders, kicking on the beat. They conga right past the stairs and peel off. Nobody will believe this.`, [['funny'], ['time', 1]]), O(0.55, 'danger', `The infected in front of {r} turns round mid-kick.`, [['em', 'r'], ['funny']])]),
      C(`Switch off the music`, `Break the rhythm.`, [O(0.5, 'good', `The music stops. The conga line falls apart in confusion.`), O(0.5, 'danger', `The music stops. Every head turns toward the sound of the switch, and {r}.`, [['em', 'r']])]),
      C(`Lure them away with a loud noise`, `Champagne cork, flare, anything.`, [O(0.85, 'good', `A bang down the side corridor. The whole conga line swerves after it.`, [['use', 'tag', 'noise'], ['time', 1]]), O(0.15, 'danger', `Most of them follow. Not the last one. It comes for {r}.`, [['use', 'tag', 'noise'], ['em', 'r']])], { req: { tags: ['noise'] } }),
      C(`Go back the way you came`, `Retreat.`, [O(1, 'neutral', `A long detour round the other side of the ship.`, [['time', -3]])]),
    ],
  }),
  E('any_list', {
    cat: 'hazard', loc: '*', stage: [6, 40], title: `The Ship Lurches`,
    text: [`With a groan of tortured metal, the whole ship tilts sharply. Everything slides: furniture, luggage, a piano. The floor is now a slope. Something heavy is sliding straight toward {team}.`],
    cast: ['a', 'b?'], say: [['a', `"PIANO! PIANO!"`], ['b', `"Why is there a piano? Why is it always a piano?"`, 'Sarcastic']],
    choices: [
      C(`Dive out of the way`, `Left. Now.`, [O(0.75, 'good', `The piano thunders past and smashes through a wall with a terrible chord.`, [['funny']]), O(0.25, 'hurt', `The piano clips {r}. A very musical injury.`, [['hurt', 'r', 1], ['funny']])]),
      C(`Grab onto a pillar`, `Hold on until it settles.`, [O(0.7, 'neutral', `Clinging to a pillar while the room rearranges itself. Then stillness.`), O(0.3, 'hurt', `A sliding table catches {r}.`, [['hurt', 'r', 1]])]),
      search(`Grab the luggage sliding past`, `Free supplies, delivered.`, { item: 0.6, hurt: 0.15, t: { item: `A suitcase slides right into {a}'s arms. Inside: {loot}.` } }),
      safe(`Get into a doorway and brace`, `Doorways are strong.`, { t: `Braced in a doorway, {team} rides out the lurch.` }),
      rush(`Slide down the slope deliberately`, `Use the tilt. It is downhill toward the stern.`, { hurt: 0.2, danger: 0, time: 1, t: { ok: `Everyone slides down the tilted corridor on their backsides. Undignified. Fast.`, hurt: `{r} slides into a fire extinguisher bracket.` } }),
    ],
  }),
  E('any_karaoke', {
    cat: 'humour', loc: '*', title: `Karaoke Lounge`,
    text: [`The karaoke lounge is empty, but the machine is still on, the screen glowing: "NEXT SINGER, PLEASE." A microphone lies on the stage. {a} is staring at it.`],
    cast: ['a', 'b?'], say: [['a', `"One song. For morale."`], ['b', `"If you sing, I am leaving you here."`, 'Sarcastic']],
    choices: [
      C(`{a} sings one song`, `For the team.`, [O(0.5, 'funny', `{a} belts out a power ballad with real emotion. Everyone cries a little. The infected outside are confused and leave.`, [['funny'], ['time', -1]]), O(0.5, 'danger', `{a} hits the high note. Everything on the deck hears it. One comes through the door for {r}.`, [['em', 'r'], ['funny']])]),
      C(`Use the karaoke speakers as a distraction`, `Crank the volume and leave.`, [O(0.75, 'good', `Full volume. Every infected on the deck shuffles toward the lounge as {team} leaves by the back.`, [['time', 1]]), O(0.25, 'danger', `They come faster than expected. One cuts off {r}.`, [['em', 'r']])]),
      search(`Search the lounge bar`, `Drinks, snacks, first aid.`, { item: 0.6, hurt: 0, danger: 0.1 }),
      safe(`Walk on by`, `Absolutely not.`, { t: `{a} looks back at the microphone with real longing.` }),
      C(`Do a duet`, `Two voices are better than one.`, [O(1, 'funny', `Two people, one microphone, one song about a ship. It is a disaster. It is beautiful.`, [['funny'], ['time', -1]])], { req: { minAlive: 2 } }),
      C(`Read the song list for a laugh`, `What is on it?`, [O(1, 'funny', `The top three most-played songs on this cruise were all about the sea. Bold choice.`, [['funny']])]),
    ],
  }),
  E('any_seasick', {
    cat: 'humour', loc: '*', title: `Seasick`,
    text: [`The ship is rolling heavily now. {a} goes pale, then green, then a colour nobody has a name for.`],
    cast: ['a', 'b?'], say: [['a', `"I am fine. I am so fine. I am going to be sick."`], ['b', `"Not on me. NOT ON ME."`, 'Funny']],
    choices: [
      C(`Find {a} some fresh air`, `Get to a window or a deck.`, [O(1, 'good', `Cold sea air. {a} slowly turns back to a normal colour.`, [['time', -1]])]),
      C(`Give {a} something to eat`, `Dry crackers help.`, [O(1, 'good', `{a} nibbles a canapé and stops swaying.`, [['use', 'tag', 'food'], ['heal', 'a', 1]])], { req: { tags: ['food'] } }),
      safe(`Push on regardless`, `{a} can be sick on the move.`, { t: `{a} is sick in a decorative plant pot. Nobody mentions it again.` }),
      C(`Stare at the horizon`, `Old sailor's trick.`, [O(0.6, 'good', `Eyes on the horizon. It works. {a} is amazed.`), O(0.4, 'funny', `There is no horizon. It is night. {a} stares at the darkness and feels worse.`, [['funny']])]),
      C(`Sing a sea shanty to take {a}'s mind off it`, `Morale.`, [O(1, 'funny', `Everyone joins in a shanty. {a} is still green, but smiling.`, [['funny'], ['time', -1]])]),
      C(`Let {a} lie down for a moment`, `Five minutes flat.`, [O(1, 'good', `{a} lies on a bench, eyes closed. Slowly, the world stops spinning.`, [['time', -1]])]),
    ],
  }),
  E('any_luggage', {
    cat: 'item', loc: '*', title: `Lost Luggage`,
    text: [`A pile of suitcases has slid into a corner of the corridor. Name tags flutter: "The Hendersons — Cabin 9021." "Mr B. Okonkwo." "PLEASE HANDLE WITH CARE."`],
    cast: ['a'], say: [['a', `"They will not mind. They really, really will not mind."`]],
    choices: [
      search(`Open the suitcases`, `Holiday supplies.`, { item: 0.75, hurt: 0, danger: 0.05 }),
      C(`Only open the one marked HANDLE WITH CARE`, `It must be important.`, [O(0.5, 'item', `Carefully packed inside: {loot}.`, [['loot']]), O(0.5, 'funny', `It is a collection of porcelain cats. Forty-one of them.`, [['funny']])]),
      safe(`Leave them`, `Not yours.`),
      C(`Use the suitcases as a barricade`, `Block the corridor behind you.`, [O(1, 'good', `A wall of suitcases. Nothing is following you through that.`)]),
      C(`Check the name tags against the cabins`, `Maybe the owners are alive.`, [O(1, 'neutral', `Cabin 9021 is empty. The Hendersons got out. Good for them.`)]),
    ],
  }),
  E('any_locked_family', {
    cat: 'moral', loc: '*', title: `The Locked Cabin`, major: true,
    text: [`Through a cabin door, a child is crying. A man's voice: "Shh, shh, they'll hear us." The door is barricaded from inside. In the corridor, infected are drifting toward the sound.`],
    scene: { z: 2 }, cast: ['a', 'b?:Kind'], say: [['b', `"We are not leaving a family. We are not."`, 'Kind'], ['a', `"Those things are heading straight for that door."`]],
    choices: [
      C(`Draw the infected away from their door`, `Make noise further down.`, [O(0.6, 'good', `{a} bangs on a fire door at the end of the corridor. The infected follow. The family's crying fades into silence.`, [['hero']]), O(0.4, 'danger', `The infected turn, all of them, toward {a}.`, [['em', 'a'], ['hero']])]),
      C(`Get the family out and take them with you`, `Strength in numbers.`, [O(0.55, 'good', `The father opens up. They follow {team} to the stairs and peel off toward a muster station.`, [['hero'], ['time', -1]]), O(0.45, 'hurt', `Opening up takes too long. {r} is hurt holding the infected back.`, [['hurt', 'r', 1], ['hero']])]),
      C(`Whisper instructions through the door`, `Tell them how to stay quiet.`, [O(1, 'neutral', `"Wet towel under the door. Hands over his ears. Hum a lullaby." The crying stops.`)]),
      safe(`Leave them`, `You cannot save everyone.`, { t: `{Team} walks away. Nobody speaks for a long time.` }),
      C(`Slide supplies under the door`, `Help them hold out.`, [O(1, 'good', `Food and water slide under the door. "Thank you," whispers the father.`, [['lose'], ['hero']])]),
      C(`Tell them the way to the muster station`, `Help them help themselves.`, [O(1, 'neutral', `"Deck 5, starboard, follow the green signs." The father whispers thanks.`)]),
    ],
  }),
  E('any_argue', {
    cat: 'interaction', loc: '*', title: `Port or Starboard?`,
    text: [`{a} and {b} cannot agree. {a} is sure the lifeboats are on the left. {b} is sure they are on the right. Neither of them knows which side is port.`],
    cast: ['a', 'b'], say: [['a', `"Port is left! Everyone knows port is left!"`], ['b', `"Left from which way? The ship has two ends!"`]],
    choices: [
      rush(`Go with {a}`, `Left it is.`, { hurt: 0.1, danger: 0.12, time: 1 }),
      safe(`Go with {b}`, `Right it is.`, { time: -1 }),
      C(`Check the deck plan`, `Settle it with facts.`, [O(1, 'good', `The plan settles it, and shows a crew shortcut too.`, [['time', 1]])], { req: { tags: ['map'] } }),
      C(`Ask the nearest sign`, `Ships have signs everywhere.`, [O(1, 'funny', `A sign right next to them: LIFEBOATS ← with an arrow. Everyone pretends this was the plan.`, [['funny']])]),
      C(`Rock paper scissors`, `The only fair way.`, [O(0.5, 'funny', `{a} wins with rock. Victory lap. Left it is.`, [['funny'], ['time', 1]]), O(0.5, 'funny', `{b} wins with paper. Smug. Right it is.`, [['funny']])]),
      C(`Split up and meet at the stairs`, `Try both.`, [O(0.6, 'good', `Both groups make it to the stairs. Nobody admits who was right.`), O(0.4, 'danger', `One group runs into trouble. Something comes for {r}.`, [['em', 'r']])]),
    ],
  }),
  E('giles_twist', {
    npc: ['giles'],
    cat: 'interaction', loc: '*', req: { flags: ['npc_giles'], npcIs: ['giles', 'traitor'] }, stage: [12, 40], title: `The Purser's Proposal`, major: true,
    text: [`Purser Giles pulls {a} aside, speaking fast and low. "Listen. Lifeboat 14 seats twelve. There are hundreds of passengers. If we go now, just us, quietly, nobody needs to know. The others will slow us down."`],
    cast: ['a', 'b?'], say: [['a', `"Giles, what are you saying?"`]],
    choices: [
      C(`Refuse and tell everyone`, `No secrets.`, [O(0.5, 'neutral', `Giles laughs it off. "A joke! Obviously." He slips away later with something from the backpack.`, [['npcgone', 'giles'], ['lose']]), O(0.5, 'good', `Giles flushes red. "I... you're right. I'm sorry." He stays, and seems to mean it.`, [['flag', 'giles_redeemed']])]),
      C(`Pretend to agree, then warn the others`, `Keep him close.`, [O(1, 'good', `Everyone keeps an eye on Giles. He knows. He behaves.`, [['flag', 'giles_watched']])]),
      C(`Throw him out of the group`, `No traitors.`, [O(1, 'neutral', `Giles storms off, but not before swiping something.`, [['npcgone', 'giles'], ['lose']])]),
      C(`Agree with him`, `Survival first.`, [O(1, 'bad', `{a} nods. Giles smiles. It is not a nice smile.`, [['flag', 'giles_deal']])], { major: true }),
      C(`Ask him what really happened to the crew`, `There is something he is not saying.`, [O(1, 'good', `He breaks down. He locked a crew door to save himself. He has been trying to make up for it. He stays, quietly.`, [['flag', 'giles_redeemed']])]),
    ],
  }),
  E('bruno_cooks', {
    npc: ['bruno'],
    cat: 'interaction', loc: '*', req: { flags: ['npc_bruno'] }, title: `Bruno's Kitchen`,
    text: [`Chef Bruno ducks into a deserted bar, rummages behind the counter, and emerges with a tray. "Nobody fights on an empty stomach. Eat. EAT."`],
    cast: ['a'], say: [['a', `"Bruno, I love you."`]],
    choices: [
      C(`Eat Bruno's food`, `He insists.`, [O(1, 'good', `Somehow, even now, Bruno's food is incredible. Everyone feels stronger.`, [['heal', 'all', 1], ['time', -1]])]),
      C(`Pack it for later`, `Food on the go.`, [O(1, 'item', `Bruno wraps everything up. "For later. For the boat." {Team} gets {loot}.`, [['item', 'canapes']])]),
      safe(`No time to eat`, `Keep moving.`, { t: `Bruno looks personally offended.` }),
      C(`Ask Bruno about the crew routes`, `He knows the back ways.`, [O(1, 'good', `"Kitchen lifts go down to Deck 3. Nobody uses them but us." A clever shortcut.`, [['time', 2]])]),
      C(`Ask Bruno for a weapon`, `He has many knives.`, [O(1, 'item', `Bruno hands over his second-best knife with great ceremony: {loot}.`, [['item', 'chef_knife']])]),
    ],
  }),
  E('admiral_warns', {
    npc: ['admiral'],
    cat: 'humour', loc: '*', req: { flags: ['npc_admiral'] }, title: `The Admiral Speaks`,
    text: [`The Admiral suddenly puffs up his feathers and screams: "DANGER! DANGER! STARBOARD!" A second later, a door on the right bursts open.`],
    scene: { z: 1 }, cast: ['a'], say: [['a', `"Good bird. GOOD BIRD."`]],
    choices: [
      C(`Run left, like the bird said`, `Trust the Admiral.`, [O(0.85, 'good', `{Team} dodges left as something lurches out of the right-hand door and misses everyone.`, [['hero']]), O(0.15, 'danger', `There is something on the left too. It goes for {r}.`, [['em', 'r']])]),
      C(`Let the Admiral fly ahead and scout`, `He can see over everything.`, [O(0.7, 'good', `The Admiral circles and comes back shrieking "CLEAR! CLEAR!" A safe route.`, [['time', 1]]), O(0.3, 'funny', `The Admiral flies off and comes back with a bread roll.`, [['funny']])]),
      safe(`Back away slowly`, `Whatever it is, avoid it.`, { time: -1 }),
      C(`Ask the Admiral about the captain`, `He might know where he is.`, [O(1, 'funny', `"CAPTAIN KNEW. CAPTAIN KNEW. LOG BOOK. SQUAWK." Everyone stares at the parrot in silence.`, [['flag', 'knows_logbook'], ['funny']])]),
      C(`Feed the Admiral a treat`, `He has earned it.`, [O(1, 'funny', `The Admiral eats a canapé and says, in the captain's voice: "Excellent work, crew."`, [['use', 'tag', 'food'], ['funny']])], { req: { tags: ['food'] } }),
      C(`Teach the Admiral a new word`, `Morale.`, [O(1, 'funny', `{a} teaches the Admiral to say "TEAM LEYLA". He says it for the rest of the night.`, [['funny']])]),
    ],
  }),
  E('anand_care', {
    npc: ['anand'],
    cat: 'interaction', loc: '*', req: { flags: ['npc_anand'], injured: true }, title: `Doctor's Orders`,
    text: [`Dr Anand stops the group in a quiet stairwell. "Sit. Everyone who is hurt, sit down now. I am not losing anyone to an infected cut."`],
    cast: ['a'], say: [['a', `"Yes, Doctor."`]],
    choices: [
      C(`Let her treat everyone`, `Takes time, but she is good.`, [O(1, 'good', `Cleaned, stitched and bandaged. Everyone is better.`, [['heal', 'all', 1], ['time', -2]])]),
      C(`Treat only the worst injury`, `Quick fix.`, [O(1, 'good', `The worst wound is cleaned and dressed in five minutes.`, [['heal', 'injured', 2], ['time', -1]])]),
      safe(`Keep moving`, `No time.`, { t: `Dr Anand mutters something unprintable in two languages.` }),
      C(`Ask her to check everyone for infection`, `Better to know.`, [O(1, 'good', `She checks every cut carefully. "Clean. All clean." Everyone breathes out.`, [['heal', 'injured', 1], ['time', -1]])]),
      C(`Ask for spare supplies`, `She packed a big bag.`, [O(1, 'item', `She hands over {loot}. "Use it wisely."`, [['item', 'bandages']])]),
    ],
  }),

  E('any_sprinklers', {
    cat: 'hazard', loc: '*', title: `Sprinklers`,
    text: [`Smoke drifts from a vent and the fire sprinklers burst into life, drenching the corridor in freezing water. Alarms whoop. Every infected on the deck is suddenly very interested in the noise.`],
    scene: { weather: 'rain', z: 2 }, cast: ['a', 'b?'], say: [['a', `"Great. Wet AND hunted."`], ['b', `"At least my hair was already a disaster."`, 'Funny']],
    choices: [
      rush(`Run through the spray`, `The alarm covers your footsteps.`, { hurt: 0.12, danger: 0.12, time: 1, t: { hurt: `{r} slips on the soaked carpet and goes down hard.` } }),
      C(`Find the alarm panel and silence it`, `Stop the noise.`, [O(0.6, 'good', `{a} smashes the reset button. Silence. The infected lose interest.`, [['hero']]), O(0.4, 'danger', `The panel is by a stairwell. Something is coming up it toward {r}.`, [['em', 'r']])]),
      safe(`Duck into a cabin until it stops`, `Wait it out.`, { time: -2, t: `Twenty soggy minutes in a stranger's cabin. Then quiet.` }),
      C(`Use the noise to slip past the infected`, `They are all looking the other way.`, [O(0.75, 'good', `Every head is turned to the alarm. {Team} creeps past in the spray.`, [['time', 1]]), O(0.25, 'danger', `One of them is looking the wrong way: at {r}.`, [['em', 'r']])]),
      search(`Search the soaked cabins nearby`, `Doors have swung open.`, { item: 0.55, hurt: 0, danger: 0.1 }),
    ],
  }),
  E('any_dutyfree', {
    cat: 'item', loc: '*', title: `Duty Free`,
    text: [`The duty-free shop is untouched: perfume, chocolate, sunglasses, giant teddy bears. A sign says SALE — EVERYTHING MUST GO. It does, now.`],
    scene: { bg: 'casino' }, cast: ['a', 'b?'], say: [['a', `"I have always wanted to rob a duty-free shop."`], ['b', `"Take the chocolate. Take ALL the chocolate."`, 'Foodie']],
    choices: [
      search(`Grab anything useful`, `Torches, first aid, snacks.`, { item: 0.75, hurt: 0, danger: 0.1 }),
      C(`Take the giant teddy bear`, `For morale.`, [O(1, 'funny', `{a} carries a two-metre teddy bear for the next three decks. It is a terrible idea and nobody wants to stop it.`, [['funny']])]),
      C(`Spray perfume to mask your scent`, `Maybe they hunt by smell.`, [O(0.5, 'good', `Smelling of "Midnight Orchid", {team} walks past two infected without them turning. Science?`, [['time', 1], ['funny']]), O(0.5, 'funny', `Everyone smells like a department store. It does nothing. It is very strong.`, [['funny']])]),
      safe(`Leave it`, `Shopping can wait.`),
      C(`Take some sunglasses`, `Look cool while escaping.`, [O(1, 'funny', `Everyone puts on designer sunglasses. In the dark. It is a very bad idea that looks incredible.`, [['funny']])]),
    ],
  }),
  E('any_lift', {
    cat: 'rescue', loc: '*', title: `Stuck Between Floors`,
    text: [`The glass lift in the atrium is stuck between floors. Inside, three passengers are banging on the glass. On the floor above, infected are gathering at the lift doors.`],
    scene: { bg: 'mall', z: 2 }, cast: ['a', 'b?:Engineer'], say: [['b', `"There is a manual release on the lift motor. I can lower it."`, 'Engineer'], ['a', `"We cannot just leave them in there."`]],
    choices: [
      C(`Prise the doors open and pull them out`, `Brute force.`, [O(0.6, 'good', `The doors give. Three grateful passengers climb out and head for their muster station. One presses {loot} into {a}'s hand.`, [['loot'], ['hero']]), O(0.4, 'hurt', `The doors snap shut on {r}'s fingers before giving way.`, [['hurt', 'r', 1], ['hero']])]),
      C(`Lower the lift by hand`, `Find the manual crank.`, [O(0.7, 'good', `Crank, crank, crank. The lift sinks to the deck below. Everyone out.`, [['hero'], ['time', -1]]), O(0.3, 'danger', `The cranking noise draws the infected down the stairs toward {r}.`, [['em', 'r']])]),
      C(`Tell them to stay quiet and wait`, `The lift is safe if they are silent.`, [O(1, 'neutral', `"Stay still. Stay quiet. Help is coming." They nod. You hope it is true.`)]),
      safe(`Move on`, `You cannot save everyone.`, { t: `The banging on the glass follows {team} across the atrium.` }),
      C(`Distract the infected on the floor above`, `Draw them away from the lift.`, [O(0.6, 'good', `A thrown chair crashes down the stairs. The infected follow it. The passengers climb out.`, [['hero']]), O(0.4, 'danger', `Half of them follow the chair. The other half follow {r}.`, [['em', 'r']])]),
    ],
  }),
  E('any_mime', {
    npc: ['mime'],
    cat: 'humour', loc: '*', title: `The Mime`,
    text: [`The ship's entertainer, a mime in white face paint, is trapped in an invisible box in the middle of the corridor. Either it is a very committed performance, or something is very wrong. It is hard to tell.`],
    scene: { z: 1 }, cast: ['a', 'b?'], say: [['a', `"Is he infected or just doing mime?"`], ['b', `"With mimes, honestly, who can say."`, 'Sarcastic']],
    choices: [
      C(`Applaud and see what happens`, `Every performer loves applause.`, [O(0.5, 'funny', `The mime bows, mimes opening a door, and walks off down a side corridor. Not infected. Just dedicated.`, [['funny']]), O(0.5, 'danger', `The applause breaks the spell. The mime turns. Its eyes are milky white. It goes for {r}.`, [['em', 'r'], ['funny']])]),
      C(`Mime back at it`, `Speak its language.`, [O(1, 'funny', `{a} mimes a rope, pulls the mime gently aside, and walks past. Nobody can believe it worked.`, [['funny']])]),
      safe(`Go round it`, `Give it a wide berth.`, { time: -1 }),
      rush(`Squeeze past quickly`, `Before it decides anything.`, { hurt: 0.08, danger: 0.15 }),
      C(`Check its prop bag`, `Mimes carry strange things.`, [O(0.6, 'item', `Among the white gloves and invisible ropes: {loot}.`, [['loot']]), O(0.4, 'danger', `The mime grabs its bag. And {r}'s wrist.`, [['em', 'r']])]),
    ],
  }),
  E('any_spa', {
    cat: 'interaction', loc: '*', title: `The Spa`,
    text: [`The Serenity Spa is dim and quiet, scented with eucalyptus. Whale song plays softly. Fluffy white robes hang on hooks. After everything, it feels like a different world.`],
    scene: { bg: 'stateroom', light: 'dim' }, cast: ['a', 'b?'], say: [['a', `"Five minutes. Just five minutes of whale song."`], ['b', `"Is this what peace feels like? I had forgotten."`, 'Nervous']],
    choices: [
      C(`Rest in the relaxation room`, `Recover.`, [O(0.85, 'good', `Ten minutes on heated loungers. Bruises ache less. Breathing slows.`, [['heal', 'injured', 1], ['time', -2]]), O(0.15, 'danger', `Someone was already in the steam room. They come out, toward {r}.`, [['em', 'r']])]),
      search(`Search the treatment rooms`, `Towels, first aid, supplies.`, { item: 0.6, hurt: 0, danger: 0.1 }),
      C(`Put on the fluffy robes`, `Why not.`, [O(1, 'funny', `{Team} carries on the escape in matching white spa robes. It is somehow both ridiculous and dignified.`, [['funny']])]),
      safe(`Keep moving`, `No time for luxury.`),
      C(`Hide in the mud bath`, `Cover yourselves in mud. Maybe they will not notice.`, [O(0.5, 'funny', `Covered in mud, {team} lies perfectly still as two infected shuffle through and leave.`, [['funny']]), O(0.5, 'neutral', `Nobody comes. Everyone is now covered in mud for no reason.`, [['funny'], ['time', -1]])]),
    ],
  }),
  E('any_ballpit', {
    cat: 'humour', loc: '*', title: `Kids' Club`,
    text: [`The Kids' Club is empty, thankfully, every child safely evacuated hours ago. But there is a huge ball pit in the middle of the room, and the shuffling footsteps in the corridor are getting closer.`],
    scene: { bg: 'interior', z: 1 }, cast: ['a', 'b?'], say: [['a', `"Into the ball pit. Do not argue."`], ['b', `"This is the greatest hiding place in human history."`, 'Funny']],
    choices: [
      C(`Hide in the ball pit`, `Dive in and stay still.`, [O(0.7, 'funny', `Buried in plastic balls, {team} holds still as something shuffles through and out. Then everyone stays in for one more minute. Just because.`, [['funny'], ['time', -1]]), O(0.3, 'danger', `Something wades into the ball pit. Right next to {r}.`, [['em', 'r'], ['funny']])]),
      C(`Barricade the door with soft play blocks`, `Foam blocks. Strong enough?`, [O(0.5, 'good', `A wall of foam blocks against the door. Surprisingly effective.`), O(0.5, 'funny', `The foam blocks bounce off the door. Everyone leaves through the window instead.`, [['funny']])]),
      search(`Search the staff room`, `First aid, snacks, radios.`, { item: 0.65, hurt: 0, danger: 0.1 }),
      safe(`Leave by the back door`, `No time to play.`),
      C(`Take some crayons and leave a message`, `For anyone who comes after.`, [O(1, 'funny', `{a} writes on the wall in bright green crayon: "WE WERE HERE. LIFEBOATS AFT. GOOD LUCK." Signed with a smiley face.`, [['funny']])]),
    ],
  }),
  E('any_atrium', {
    cat: 'hazard', loc: '*', stage: [5, 40], title: `The Atrium`,
    text: [`The ship's grand atrium rises six decks high, crowned by a glass dome. Now the whole ship is tilting, and the giant chandelier is swinging on its chain, creaking. The way across is directly beneath it.`],
    scene: { bg: 'mall' }, cast: ['a', 'b?'], say: [['a', `"Do NOT stand under the chandelier."`], ['b', `"That thing must weigh a ton."`, 'Engineer']],
    choices: [
      rush(`Sprint across underneath`, `Fast, before it falls.`, { hurt: 0.2, danger: 0, time: 1, t: { hurt: `Crystal drops rain down. One catches {r} across the shoulder.` } }),
      safe(`Go round the edge`, `Longer, but out of range.`, { time: -1 }),
      C(`Wait for it to swing away`, `Time the crossing.`, [O(0.75, 'good', `{a} counts the swings. "NOW!" Everyone crosses as it swings to the far side.`), O(0.25, 'hurt', `The timing is off by a second. {r} is clipped by the swinging crystals.`, [['hurt', 'r', 1]])]),
      C(`Drop it on the infected below`, `Use it.`, [O(0.5, 'good', `{a} unhooks the chain. The chandelier crashes onto a crowd of infected below in a shower of crystal.`, [['hero'], ['time', 1]]), O(0.5, 'hurt', `The chain whips loose. {r} is caught by it.`, [['hurt', 'r', 1]])]),
      search(`Search the atrium shops`, `Boutiques line the edge.`, { item: 0.55, hurt: 0, danger: 0.1 }),
    ],
  }),
  E('any_announcement', {
    cat: 'interaction', loc: '*', title: `Attention All Passengers`,
    text: [`The PA system crackles: "Attention all passengers. This is your captain speaking." A long pause. "The lifeboats on the starboard side are... are..." Then a crash, a groan, and the speakers play a cheerful jingle advertising tonight's comedy show.`],
    cast: ['a', 'b?'], say: [['a', `"Starboard lifeboats. Are what? ARE WHAT?"`], ['b', `"Tonight's comedy show is definitely cancelled."`, 'Funny']],
    choices: [
      C(`Head for the starboard side`, `That is where the lifeboats are, probably.`, [O(0.6, 'good', `The starboard corridors are quieter. A good call.`, [['time', 1], ['flag', 'boat14']]), O(0.4, 'danger', `The starboard corridor is not quiet. Something comes for {r}.`, [['em', 'r']])]),
      C(`Find the nearest PA microphone`, `Make your own announcement.`, [O(0.5, 'good', `{a} broadcasts: "Survivors, head aft, lifeboats starboard!" Somewhere, people start moving.`, [['hero']]), O(0.5, 'danger', `The microphone is at a crew station. The crew are still there. Sort of. One goes for {r}.`, [['em', 'r']])]),
      safe(`Ignore it and keep going`, `The captain is clearly not okay.`),
      C(`Listen for more announcements`, `There might be more.`, [O(0.5, 'neutral', `Just the jingle, over and over.`, [['time', -1]]), O(0.5, 'good', `A crew voice cuts in: "Tender bay hull door still opens. Repeat, tender bay." Useful.`, [['flag', 'hull_door'], ['time', -1]])]),
      C(`Unplug the speakers in this corridor`, `The jingle is drawing them in.`, [O(1, 'neutral', `Silence. Blessed silence.`)]),
    ],
  }),

  // ---------------- EMERGENCIES ----------------
  E('em_lunge', {
    cat: 'emergency', loc: '*', essential: true, repeat: true, title: `It Lunges!`,
    text: [`A cabin door bangs open and an infected passenger in a bathrobe lunges straight at {t}! Its hands grab at {t}'s collar, mouth wide.`, `A steward bursts out of a service hatch, tray clattering to the floor, and lunges at {t}!`, `A lift door slides open with a cheerful ping, and something inside launches itself at {t}!`],
    scene: { z: 1, light: 'alert' }, cast: ['t!', 'h?'], say: [['h', `"{t}! Watch out!"`], ['t', `"GET IT OFF ME!"`, 'Nervous']],
    choices: [
      C(`{t} shoves it back into the cabin`, `Push and slam the door.`, [O(0.6, 'good', `{t} shoves it back through the doorway and slams the door on it.`), O(0.22, 'hurt', `{t} gets it back inside, but it rakes their arm first.`, [['hurt', 't', 1]]), O(0.08, 'infect', `The door slams, but there is a scratch on {t}'s hand that will not stop stinging.`, [['hurt', 't', 1], ['infect', 't']]), O(0.1, 'death', `It drags {t} into the cabin. The door swings shut.`, [['bite', 't']])]),
      C(`Pull it off {t} together`, `Everyone grab it.`, [O(0.7, 'good', `{Team} drags it off and shoves it over the railing into the atrium below.`, [['hero']]), O(0.22, 'hurt', `They win, but {r} is hurt in the struggle.`, [['hurt', 'r', 1]]), O(0.08, 'death', `In the chaos, it bites {t}.`, [['bite', 't']])], { req: { minAlive: 2 } }),
      C(`{t} wriggles out of their jacket`, `Leave it holding the coat.`, [O(0.55, 'funny', `{t} slips out of the jacket and runs. It stands there holding an empty coat, confused.`, [['funny']]), O(0.35, 'hurt', `The jacket sticks. {t} tears free, scratched.`, [['hurt', 't', 1]]), O(0.1, 'death', `The jacket will not come off in time.`, [['bite', 't']])]),
      C(`Throw something heavy at it`, `A fire bucket, a vase, a chair.`, [O(0.5, 'good', `A brass fire bucket to the head. It goes down.`), O(0.4, 'hurt', `It barely notices. {t} has to wrestle free.`, [['hurt', 't', 2]]), O(0.1, 'death', `It does not even flinch.`, [['bite', 't']])]),
      C(`Run and leave {t}`, `Save yourselves.`, [O(0.5, 'hurt', `{t} escapes alone, hurt, and catches up later in silence.`, [['hurt', 't', 1]]), O(0.25, 'good', `{t} gets away alone. Nobody can look them in the eye.`), O(0.25, 'death', `{t} does not catch up.`, [['bite', 't']])], { req: { minAlive: 2 }, major: true }),
      C(`{t} ducks into the next cabin`, `Get a door between you.`, [O(0.55, 'good', `{t} dives into the next cabin and locks the door. It loses interest.`), O(0.35, 'hurt', `It gets an arm through before the door shuts. {t} is scratched.`, [['hurt', 't', 1]]), O(0.1, 'death', `The cabin is already occupied.`, [['bite', 't']])]),
      C(`{t} grabs a deck chair and swings`, `Anything will do.`, [O(0.55, 'good', `A deck chair across the head. It goes down.`, [['hero']]), O(0.35, 'hurt', `The chair folds up. Of course it does. {t} wrestles free, scratched.`, [['hurt', 't', 1], ['funny']]), O(0.1, 'death', `The chair folds, and so does {t}'s luck.`, [['bite', 't']])]),
      companionRescue,
    ],
    uses: {
      gun: U(`BANG. The pistol shot drops it. {t} is saved. The sound echoes down every corridor on the deck.`, [['next', 'voy_gun_echo'], ['hero']]),
      melee: U(`One heavy blow and it is down. {t} is safe.`, [['hero']]),
      spray: U(`A blast of extinguisher foam to the face. It reels away blind, and {t} runs.`, []),
      noise: U(`POP! A champagne cork fired down the corridor. It spins toward the sound, and {t} slips away.`, []),
      signal: U(`A flare fired straight past its head lights the corridor red. It recoils, and {t} gets clear.`, []),
    },
  }),
  E('em_grab', {
    cat: 'emergency', loc: '*', essential: true, repeat: true, title: `Grabbed Through the Railing!`,
    text: [`Hands shoot through the railings from the deck below and seize {t}'s ankle. {t} goes down hard, and is being dragged toward the edge.`, `A hand reaches out from under a cabin door and grabs {t}'s ankle, yanking {t} off their feet!`, `{t} steps over a pile of deck chairs and something underneath seizes a leg!`],
    scene: { z: 2, light: 'alert' }, cast: ['t!', 'h?'], say: [['h', `"Hold on, {t}!"`], ['t', `"It has got my LEG!"`]],
    choices: [
      C(`Pull {t} back`, `Everyone heave.`, [O(0.68, 'good', `A desperate tug of war, and {t} comes free, minus a shoe.`, [['funny']]), O(0.17, 'hurt', `{t} comes free, but their leg is scraped raw on the railing.`, [['hurt', 't', 1]]), O(0.07, 'infect', `{t} comes free, but its nails broke the skin. The scratch is darkening.`, [['hurt', 't', 1], ['infect', 't']]), O(0.08, 'death', `Another one reaches up and bites {t}'s ankle.`, [['bite', 't']])], { req: { minAlive: 2 } }),
      C(`{t} kicks free`, `Stamp until it lets go.`, [O(0.6, 'good', `Three kicks and it drops back to the deck below.`), O(0.32, 'hurt', `It lets go, but not before a nasty scratch.`, [['hurt', 't', 1]]), O(0.08, 'death', `It does not let go.`, [['bite', 't']])]),
      C(`{t} wraps an arm round a pillar`, `Anchor yourself.`, [O(0.55, 'good', `{t} hugs the pillar until the grip slips.`), O(0.35, 'hurt', `{t} gets free, bruised and bleeding.`, [['hurt', 't', 1]]), O(0.1, 'death', `The grip does not slip.`, [['bite', 't']])]),
      C(`Stamp on its fingers`, `Make it let go.`, [O(0.55, 'good', `A hard stamp and its fingers open. {t} rolls away.`), O(0.35, 'hurt', `A stamp misses and hits {t}'s foot. Ouch. But free.`, [['hurt', 't', 1], ['funny']]), O(0.1, 'death', `Too slow.`, [['bite', 't']])]),
      C(`Leave {t}`, `Save yourselves.`, [O(0.5, 'hurt', `{t} kicks free alone and limps after the group.`, [['hurt', 't', 2]]), O(0.5, 'death', `By the time anyone looks back, it is too late.`, [['bite', 't']])], { req: { minAlive: 2 }, major: true }),
      C(`{t} plays dead`, `Go limp.`, [O(0.45, 'funny', `{t} goes floppy. Confused, it lets go. {t} crawls away.`, [['funny']]), O(0.43, 'hurt', `It is not fooled. {t} fights free, scratched.`, [['hurt', 't', 1]]), O(0.12, 'death', `Playing dead does not work.`, [['bite', 't']])]),
      C(`{t} slips out of the shoe`, `Wriggle free.`, [O(0.5, 'funny', `{t} pops out of their loafer. It is left holding a very expensive shoe.`, [['funny']]), O(0.4, 'hurt', `{t} twists free, wrenching an ankle.`, [['hurt', 't', 1]]), O(0.1, 'death', `The shoe will not come off.`, [['bite', 't']])]),
      companionRescue,
    ],
    uses: {
      gun: U(`One shot down through the railings. The grip goes slack. Every infected on both decks heard it.`, [['next', 'voy_gun_echo'], ['hero']]),
      melee: U(`A heavy blow across its arm. {t} is free.`, [['hero']]),
      spray: U(`A blast of foam through the railings. It lets go, thrashing.`, []),
      rope: U(`A loop of rope round {t}'s waist and everyone hauls. {t} pops free.`, [['funny']], { consume: 0 }),
    },
  }),
  E('em_surround', {
    cat: 'emergency', loc: '*', essential: true, repeat: true, title: `Trapped in the Stairwell`,
    text: [`{t} goes a few steps ahead into a stairwell and is suddenly trapped: infected coming up from below and down from above. {t} is pinned on the landing.`, `{t} rounds a corner into the gift shop, and three infected shoppers turn round together.`, `The corridor lights go out. When they flicker back on, {t} is boxed in by infected on every side.`],
    scene: { z: 3, light: 'alert' }, cast: ['t!', 'h?'], say: [['h', `"{t}! Hold on!"`], ['t', `"Little help? Little help would be great?"`, 'Funny'], ['t', `"I can take them."`, 'Brave']],
    choices: [
      C(`{t} jumps the banister`, `Down to the next flight.`, [O(0.55, 'good', `{t} vaults the banister and drops a flight, landing running.`), O(0.27, 'hurt', `{t} lands badly a flight down, but clear.`, [['hurt', 't', 1]]), O(0.08, 'infect', `{t} jumps clear, but one of them got a scratch in first.`, [['hurt', 't', 1], ['infect', 't']]), O(0.1, 'death', `They catch {t} mid-jump.`, [['bite', 't']])]),
      C(`Charge in and break through`, `Hit them from behind.`, [O(0.62, 'good', `{Team} smashes into them. {t} bursts free.`, [['hero']]), O(0.28, 'hurt', `A brutal fight. {r} is hurt pulling {t} out.`, [['hurt', 'r', 1]]), O(0.1, 'death', `In the scrum, one bites {t}.`, [['bite', 't']])], { req: { minAlive: 2 } }),
      C(`{t} smashes through a fire door`, `There is one on the landing.`, [O(0.55, 'good', `{t} shoulders the fire door open and is gone.`), O(0.35, 'hurt', `The door is stiff. {t} gets through, scratched.`, [['hurt', 't', 1]]), O(0.1, 'death', `The door is locked.`, [['bite', 't']])]),
      C(`Make noise to draw them off`, `Bang on the walls further up.`, [O(0.55, 'good', `Half of them turn. {t} dodges the rest.`), O(0.35, 'hurt', `Only one turns. {t} fights past the others.`, [['hurt', 't', 1]]), O(0.1, 'death', `None of them turn.`, [['bite', 't']])]),
      C(`Leave {t} to it`, `Too many.`, [O(0.4, 'hurt', `{t} fights free alone, badly hurt.`, [['hurt', 't', 2]]), O(0.3, 'good', `{t} gets out alone and is furious.`), O(0.3, 'death', `{t} does not make it.`, [['bite', 't']])], { req: { minAlive: 2 }, major: true }),
      C(`{t} slides down the banister`, `Fast and stylish.`, [O(0.5, 'funny', `{t} slides down three flights of banister like a child at Christmas, straight past them all.`, [['funny']]), O(0.4, 'hurt', `{t} slides off at the bend and hits the wall.`, [['hurt', 't', 1], ['funny']]), O(0.1, 'death', `{t} slides straight into the arms of one at the bottom.`, [['bite', 't']])]),
      C(`{t} holds them off with a fire hose`, `There is a hose reel on the wall.`, [O(0.5, 'good', `A blast of water sends them tumbling down the stairs.`, [['hero']]), O(0.4, 'hurt', `The hose has no pressure. {t} fights free.`, [['hurt', 't', 1]]), O(0.1, 'death', `The hose is dry.`, [['bite', 't']])]),
      companionRescue,
    ],
    uses: {
      gun: U(`Shots ring out in the stairwell, deafening. They fall. {t} stands in the ringing silence, and then the echoes come back from every deck.`, [['next', 'voy_gun_echo'], ['hero']]),
      melee: U(`{t} swings hard and clears a path down the stairs.`, [['hero']]),
      spray: U(`A cloud of foam fills the stairwell. They stagger blind, and {t} runs through.`, []),
      signal: U(`A flare bounces off the stairwell walls in a blaze of red. They reel back, and {t} gets out.`, []),
    },
  }),
  E('gun_echo', {
    cat: 'chain', loc: '*', essential: true, repeat: true, title: `Echoes Below Deck`,
    text: [`The gunshot rings through the steel corridors like a bell. Then, from every deck, the ship answers: doors banging, feet shuffling, groans rising up the stairwells.`],
    scene: { z: 4, light: 'alert' }, cast: ['a', 'b?'], say: [['a', `"That was loud. Move. Now."`]],
    choices: [
      rush(`Run before they arrive`, `Go!`, { hurt: 0.15, danger: 0.1, time: 1 }),
      C(`Hide in a linen cupboard`, `Squash in and wait.`, [O(0.7, 'neutral', `Squashed among the towels, {team} waits as they shuffle past.`, [['time', -2]]), O(0.3, 'danger', `One opens the cupboard, looking for towels? It grabs {r}.`, [['em', 'r']])]),
      C(`Climb into the ceiling ducts`, `Get above them.`, [O(0.6, 'neutral', `Crawling through the ducts, {team} hears them gather below, and then drift away.`, [['time', -1]]), O(0.4, 'hurt', `The duct gives way. {r} drops through the ceiling.`, [['hurt', 'r', 1]])]),
      C(`Lead them off with more noise`, `Use the noise.`, [O(0.6, 'good', `{a} sets off a fire alarm two corridors over and doubles back. They follow the alarm.`, [['hero'], ['time', 1]]), O(0.4, 'hurt', `{a} gets cornered making the noise.`, [['hurt', 'a', 1]])]),
      safe(`Walk calmly the other way`, `They are going to where the shot was.`, { time: -1 }),
    ],
  }),

  // ---------------- TURN ----------------

  // ---------------- TIMEOUT ----------------
  E('timeout', {
    cat: 'timeout', loc: '*', essential: true, title: `Going Down`, major: true,
    text: [`With a roar of rushing water and a scream of tearing steel, the bow dips beneath the waves. The deck tilts steeper and steeper. Loose deck chairs slide past into the sea. The Aurora Star is sinking, now, and {team} is still aboard.`],
    scene: { bg: 'deck', light: 'storm', weather: 'rain' }, cast: ['a', 'b?'], say: [['a', `"JUMP! We have to jump!"`], ['b', `"Find something that floats! Anything!"`, 'Practical']],
    choices: [
      C(`Jump wearing lifejackets`, `Into the sea, together.`, [O(0.85, 'good', `{Team} jumps and bobs to the surface in a cluster of orange. Hours later, a fishing boat spots the lifejackets in its searchlight.`, [['flag', 'adrift']]), O(0.15, 'death', `The cold is unbearable. Not everyone lasts until the fishing boat arrives. {r} slips away in the night.`, [['kill', 'r', 'was lost in the cold water when the ship went down'], ['flag', 'adrift']])], { req: { items: ['lifejackets'] } }),
      C(`Grab a floating deck chair and jump`, `Anything that floats.`, [O(0.4, 'good', `Clinging to deck chairs, {team} drifts through the night. At dawn, a coastguard helicopter.`, [['flag', 'adrift']]), O(0.6, 'bad', `The sea is too rough. {Team} is dragged back toward the sinking ship and clambers onto the last dry deck.`, [['flag', 'sunk']])]),
      C(`Climb to the highest point`, `The funnel. The radio mast. Anywhere high.`, [O(1, 'bad', `The ship settles on a sandbank with its upper decks above water. {Team} clings to the funnel. It is not rescue. It is survival.`, [['flag', 'sunk']])]),
      C(`Launch a jet ski from the tender bay`, `Race for the shore.`, [O(0.6, 'good', `Two jet skis rocket out of the hull door. Six miles of black sea. The lighthouse grows closer.`, [['flag', 'reached'], ['flag', 'jetski_escape']]), O(0.4, 'bad', `The tender bay is flooded. The jet skis are gone.`, [['flag', 'sunk']])], { req: { flags: ['jetski'] } }),
      C(`Fire distress flares from the deck`, `Somebody has to see.`, [O(0.7, 'good', `Red flares burst over the sinking ship. A coastguard cutter changes course.`, [['use', 'flare_pistol'], ['flag', 'coastguard']]), O(0.3, 'bad', `The flares are lost in the rain.`, [['use', 'flare_pistol'], ['flag', 'sunk']])], { req: { items: ['flare_pistol'] } }),
      C(`Hold onto each other and jump`, `No lifejackets. Just courage.`, [O(0.35, 'good', `{Team} hits the water together and swims for a floating lifeboat cover. By dawn, a rescue boat.`, [['flag', 'adrift']]), O(0.45, 'bad', `The sea throws everyone back against the hull. {Team} drags themselves onto the last dry deck.`, [['flag', 'sunk']]), O(0.2, 'death', `The water is merciless. {r} is lost.`, [['kill', 'r', 'was lost in the water when the ship went down'], ['flag', 'adrift']])]),
      C(`Search for one last lifeboat`, `There might be one left.`, [O(0.3, 'good', `Lifeboat 22, half-swamped but floating. {Team} bails all night and lands on the coast at dawn.`, [['flag', 'reached']]), O(0.7, 'bad', `Every davit is empty.`, [['flag', 'sunk']])]),
      C(`Wait for the coastguard`, `Help was called.`, [O(0.8, 'good', `Spotlights sweep the water. A coastguard cutter pulls alongside the sinking ship and takes everyone off.`, [['flag', 'coastguard']]), O(0.2, 'bad', `They arrive too late for the ship, but find {team} clinging to the wreck at dawn.`, [['flag', 'coastguard']])], { req: { flags: ['coastguard'] } }),
      C(`Swim for the nearest floating wreckage`, `Anything that floats.`, [O(0.4, 'good', `A floating cabin door. Everyone clings to it until a rescue boat arrives at dawn.`, [['flag', 'adrift']]), O(0.45, 'bad', `The wreckage drifts away. {Team} scrambles back onto the ship.`, [['flag', 'sunk']]), O(0.15, 'death', `The sea takes {r}.`, [['kill', 'r', 'was lost in the water when the ship went down'], ['flag', 'adrift']])]),
    ],
  }),

  // ---------------- FINALE ----------------
  E('fin_launch', {
    cat: 'finale', loc: 'sea', essential: true, repeat: true, title: `Abandon Ship`, major: true, maxCond: 3,
    text: [`Lifeboat 14 swings at deck level, ready. The Aurora Star is listing badly now, rails dipping toward the black water. Infected are pouring onto the boat deck from both stairwells. This is the moment.`],
    scene: { bg: 'lifeboats', z: 4, light: 'night' }, cast: ['a', 'b?'], say: [['a', `"Everybody in! NOW!"`], ['b', `"I will cast off the ropes. Get in!"`, 'Brave'], ['b', `"Final escape sequence. Do NOT mess this up."`, 'Gamer']],
    choices: [
      C(`Let {npc} lower the boat while you hold the deck`, `{npc} offers to work the davits.`, [{ p: 0.8, k: 'good', t: `{npc} works the levers like a sailor. The boat drops smoothly and {npc} jumps in last.`, fx: [['flag','launched']], loyalty: 'loyal'}, { p: 0.2, k: 'good', t: `The davit jams. {npc} stays on deck, cranking by hand as the infected close in, until the boat is in the water. {npc} waves once and is gone.`, fx: [['flag','launched'],['npcdie','stayed on the sinking deck to lower the lifeboat by hand']], loyalty: 'loyal'}, { p: 0.6, k: 'good', t: `{npc} fumbles the levers, but the boat drops. Everyone tumbles in.`, fx: [['flag','launched']], loyalty: 'ordinary'}, { p: 0.4, k: 'hurt', t: `{npc} drops the boat too fast. It slams into the sea and {r} is thrown against the bench.`, fx: [['flag','launched'],['hurt','r',1]], loyalty: 'ordinary'}, { p: 1, k: 'bad', t: `{npc} climbs into the boat first, releases the davits, and drops away into the dark sea. Alone. {Team} is left on the deck.`, fx: [['flag','betrayed']], loyalty: 'traitor'}], { req: { companion: true, companionHuman: true } }),
      C(`Look for Giles`, `Where is the purser?`, [O(1, 'bad', `Giles is already in Lifeboat 14 with the engine running. He casts off, alone. "Sorry. Officers first."`, [['flag', 'betrayed']])], { req: { flags: ['giles_deal'] } }),
      C(`Pile into the lifeboat and drop it`, `Everyone in, release, fall.`, [O(0.6, 'good', `A heart-stopping drop, a huge splash, and the lifeboat is in the water, away from the ship.`, [['flag', 'launched']]), O(0.3, 'hurt', `The boat drops too fast and slams into the sea. {r} is thrown against the bench.`, [['hurt', 'r', 1], ['flag', 'launched']]), O(0.1, 'death', `As the boat drops, an infected grabs {r} from the deck and pulls them back.`, [['bite', 'r'], ['flag', 'launched']])]),
      C(`Lower it properly with the winch key`, `Smooth and controlled.`, [O(1, 'good', `The davits whirr. The boat glides down to the water like an elevator. Perfect.`, [['flag', 'launched']])], { req: { items: ['winch_key'] } }),
      C(`Launch from the tender bay hull door`, `Straight out at sea level.`, [O(1, 'good', `The hull door opens. The boat motors straight out onto the sea, quiet as a ghost.`, [['flag', 'launched']])], { req: { flags: ['hull_door'] } }),
      C(`{a} holds the deck while the others launch`, `One stays to buy time.`, [O(0.4, 'good', `{a} holds the stairwell door, then sprints and leaps into the boat as it drops. Legendary.`, [['hero'], ['flag', 'launched']]), O(0.6, 'death', `{a} holds the door until the boat is clear. They do not make the jump.`, [['kill', 'a', 'held back the infected on the boat deck so the lifeboat could launch', 'hero'], ['flag', 'launched']])], { req: { minAlive: 2 }, major: true }),
      C(`Jump overboard and swim to a floating boat`, `There is an empty lifeboat already in the water.`, [O(0.5, 'good', `A long, cold jump and a short, terrifying swim. Everyone hauls into the drifting lifeboat.`, [['flag', 'launched']]), O(0.4, 'hurt', `The water is freezing. {r} is battered against the hull before making it to the boat.`, [['hurt', 'r', 1], ['flag', 'launched']]), O(0.1, 'death', `The cold takes {r}'s breath away. They do not reach the boat.`, [['kill', 'r', 'was lost in the cold sea jumping from the ship']], )]),
      C(`Cut the ropes with an axe`, `Drop it the fast way.`, [O(0.7, 'good', `Thunk, thunk. The boat drops and lands upright. Away.`, [['flag', 'launched']]), O(0.3, 'hurt', `It lands at an angle. {r} is thrown into the sea and dragged back aboard.`, [['hurt', 'r', 1], ['flag', 'launched']])]),
      C(`Wait for the last stragglers`, `There are still passengers running for the boat.`, [O(0.5, 'good', `Six more passengers tumble in. Then {team} launches, full to the brim.`, [['hero'], ['flag', 'launched']]), O(0.5, 'hurt', `The infected arrive with the stragglers. {r} is hurt holding them back.`, [['hurt', 'r', 1], ['hero'], ['flag', 'launched']])]),
      C(`Slide down the falls ropes to a boat in the water`, `Rope burn is better than teeth.`, [O(0.6, 'good', `Hand over hand down the ropes, and into a half-empty lifeboat below.`, [['flag', 'launched']]), O(0.4, 'hurt', `{r} loses their grip halfway and drops into the boat.`, [['hurt', 'r', 1], ['flag', 'launched']])]),
    ],
    uses: {
      gun: U(`Every shot buys a second. {Team} piles into the boat and drops it into the sea as the last round is fired.`, [['hero'], ['flag', 'launched']]),
      spray: U(`A wall of extinguisher foam across the stairwell. They slip and slide while {team} launches.`, [['flag', 'launched']]),
      noise: U(`POP! A champagne cork down the far deck. They turn, and the boat drops.`, [['flag', 'launched']]),
    },
  }),
  E('fin_crossing', {
    cat: 'finale', loc: 'sea', essential: true, repeat: true, title: `Six Miles`, major: true, maxCond: 3,
    text: [`The lifeboat bobs on the black sea. Behind, the Aurora Star tilts slowly into the waves, lights flickering out deck by deck. Ahead, somewhere in the dark: the mainland. Six miles of open water. The wind is rising.`],
    scene: { bg: 'sea', light: 'night' }, cast: ['t?=@infected', 'a', 'b?'], say: [['a', `"Which way is land?"`], ['b', `"North-east. The lighthouse. Watch for the flash."`, 'Intelligent']],
    choices: [
      C(`Start the motor and head for the lights`, `Full speed for shore.`, [O(0.55, 'good', `The motor coughs into life. An hour later, the bow crunches onto a beach. Land. Real land.`, [['flag', 'reached']]), O(0.45, 'bad', `The motor has no fuel. {Team} drifts all night until a fishing boat finds them.`, [['flag', 'adrift']])]),
      C(`Fuel the motor and steer by compass`, `Fuel and navigation: the proper way.`, [O(1, 'good', `Full tank, true heading. The lighthouse appears exactly where it should. The bow slides onto the sand.`, [['use', 'fuel'], ['flag', 'reached']])], { req: { items: ['fuel'], anyItems: ['compass', 'deck_plan'] } }),
      C(`Fill the tank with diesel`, `Fuel first.`, [O(0.8, 'good', `A full tank and a straight run toward the shore lights. The bow hits the beach.`, [['use', 'fuel'], ['flag', 'reached']]), O(0.2, 'bad', `Fuel, but no idea which way. Hours of circling before a fishing boat finds you.`, [['use', 'fuel'], ['flag', 'adrift']])], { req: { items: ['fuel'] } }),
      C(`Row for shore`, `Everybody on the oars.`, [O(0.5, 'good', `Hours of rowing. Blisters. Then sand. They made it.`, [['flag', 'reached']]), O(0.3, 'hurt', `The current fights every stroke. {r} collapses from exhaustion before the shore appears at dawn.`, [['hurt', 'r', 1], ['flag', 'reached']]), O(0.2, 'bad', `The current is too strong. The boat drifts out to sea.`, [['flag', 'island']])]),
      C(`Fire the flare pistol`, `Signal for rescue.`, [O(0.8, 'good', `The red flare bursts over the sea. A coastguard cutter answers with its searchlight.`, [['use', 'flare_pistol'], ['flag', 'coastguard']]), O(0.2, 'bad', `The flare fizzles in the rain.`, [['use', 'flare_pistol'], ['flag', 'adrift']])], { req: { items: ['flare_pistol'] } }),
      C(`Radio the coastguard on channel 16`, `Mayday from the lifeboat.`, [O(0.85, 'good', `"Lifeboat, coastguard. We see you. Hold position." Twenty minutes later: searchlights.`, [['flag', 'coastguard']]), O(0.15, 'bad', `The radio gets soaked and dies.`, [['flag', 'adrift']])], { req: { items: ['radio'] } }),
      C(`Follow the lighthouse`, `Watch for the flash and steer toward it.`, [O(0.6, 'good', `Flash. Count. Flash. {Team} steers toward it all night, and at dawn, the lighthouse stands above them on the rocks.`, [['flag', 'reached']]), O(0.4, 'bad', `The light leads to a small rocky island, not the mainland. Safe, but stranded.`, [['flag', 'island']])]),
      C(`Drift and wait for rescue`, `Save your strength.`, [O(0.5, 'good', `At dawn, a coastguard helicopter.`, [['flag', 'coastguard']]), O(0.5, 'bad', `Two days adrift before a cargo ship spots the lifeboat.`, [['flag', 'adrift']])]),
      C(`Tell the others about {t}'s bite`, `Before you reach the shore.`, [O(1, 'neutral', `{t} listens, nods, and slips quietly over the side into the dark water, before anyone can stop them. "Get them home," they say.`, [['kill', 't', 'slipped into the sea so the infection would never reach the mainland', 'hero'], ['next', 'voy_fin_crossing']])], { req: { infected: true }, major: true }),
      C(`Wave the captain's logbook at the coastguard`, `Make sure the evidence lands with you.`, [O(1, 'good', `When the coastguard pulls alongside, {a} hands over the captain's logbook. "Read the last page." The officer reads it. Then reads it again.`, [['flag', 'coastguard'], ['flag', 'gave_logbook'], ['flag', 'reached']])], { req: { items: ['logbook'], anyItems: ['radio', 'flare_pistol'] } }),
      C(`Bail water and keep the boat steady`, `First, stay afloat.`, [O(0.5, 'good', `Bailing all night, drifting toward the coast. At dawn, the bow scrapes sand.`, [['flag', 'reached']]), O(0.5, 'bad', `By dawn, the boat has drifted far from land. A cargo ship spots it hours later.`, [['flag', 'adrift']])]),
    ],
  }),

  // ---------------- FILLER ----------------
  E('filler', {
    cat: 'chain', loc: '*', essential: true, repeat: true, title: `Empty Corridor`,
    text: [`For a moment, the corridor is empty. The ship creaks. Somewhere far below, water rushes. {Team} keeps moving aft.`],
    cast: ['a'], say: [],
    choices: [
      safe(`Keep moving`, `Steady pace.`),
      search(`Check the cabins along the way`, `Quick look through open doors.`, { item: 0.5, hurt: 0.08 }),
      rush(`Jog to make up time`, `Push the pace.`, { hurt: 0.08, danger: 0.08 }),
      C(`Take a short rest`, `Catch your breath.`, [O(1, 'good', `A short sit-down on the stairs.`, [['heal', 'injured', 1], ['time', -1]])]),
      safe(`Stick to the shadows`, `Slow but hidden.`, { time: -1 }),
    ],
  }),
];

const T = travelTables({
  lowOk: [`A long way round through quiet passages. Nothing stirs.`, `The detour is slow but completely quiet.`, `Empty crew corridors, humming lights, and nobody in them.`, `The long route through the service decks takes ages, but stays silent.`, `Past a row of closed cabins. Every door stays shut.`, `Quiet stairwells all the way down. Nobody follows.`, `The ship creaks and groans, but nothing else does.`, `A slow, careful walk. The only sound is water somewhere far below.`],
  medOk: [`{Team} reaches {loc} without trouble.`, `A tense walk, but everyone makes it.`, `Twice a cabin door rattles. Twice it holds. Then {loc}.`, `The ship lurches and everyone grabs the handrail. Then {loc}.`, `Muffled screams from a deck below, but {team} reaches {loc} safely.`, `Emergency lights flicker the whole way, but nothing jumps out.`, `A trail of abandoned suitcases leads all the way to {loc}.`, `Water sloshes underfoot. {Team} reaches {loc} soaked but whole.`],
  highOk: [`A fast, risky dash across the ship, and it pays off.`, `{Team} covers the distance quickly.`, `Straight down the main corridor at a sprint. Nothing catches up.`, `Through the middle of the atrium, fast, and out the far side.`, `Vaulting deck chairs and sliding down banisters. Time saved.`, `Loud and reckless, but very, very quick.`, `A mad run past a crowd of infected that turn far too slowly.`, `Down three stairwells in one breathless rush.`],
  hurt: [`On the way, the ship lurches and {r} is thrown against a bulkhead.`, `{r} slips on a wet stairwell on the way.`, `A loose fire extinguisher rolls into {r}'s ankle.`, `{r} cracks an elbow on a door frame as the ship tilts.`, `Broken glass from a shop window catches {r}'s hand.`, `{r} trips over a suitcase in the dark.`],
  danger: [`Halfway there, a cabin door bursts open beside {r}!`, `On the way, something lurches out of a service door at {r}!`, `A lift opens with a ping. Something inside reaches for {r}!`, `A figure in a bathrobe stumbles out of a stairwell, straight at {r}!`, `Something under a pile of deck chairs grabs at {r}!`],
});

export default addComedy({
  words: { z: 'zombie', zs: 'zombies', goal: 'the lifeboats', place: 'ship', critter: 'seagull' },
  id: A, title: `The Last Voyage`, short: `Ship`,
  tagline: `Luxury cruise. Infected passengers. Sinking fast.`,
  premise: `Passengers aboard the luxury cruise ship Aurora Star begin turning into zombies. The ship loses power and drifts into dangerous waters, taking on water by the hour.`,
  objective: `Escape the infected cruise ship and reach the mainland alive.`,
  card: 'deck', colour: '#4d96ff',
  clock: { start: 60, unit: 10, label: `Ship sinks in` },
  zones: [['stateroom'], ['corridor7', 'dining', 'casino'], ['galley', 'theatre', 'lido'], ['medbay', 'crew', 'hold'], ['engine', 'flooded', 'bridge'], ['lifeboats', 'promenade', 'tender']],
  zoneQuota: [[2, 3], [3, 5], [3, 5], [3, 5], [3, 5], [3, 4]],
  targetStages: 32, maxStages: 40,
  finale: [`${A}_fin_launch`, `${A}_fin_crossing`], finaleLoc: 'sea',
  emergencies: [`${A}_em_lunge`, `${A}_em_grab`, `${A}_em_surround`],
  turnEvent: `${A}_inf_turned`, revealEvent: `${A}_inf_reveal`, cureItem: 'antiviral', timeoutEvent: `${A}_timeout`, fillerEvent: `${A}_filler`,
  startKit: { easy: [['fire_axe'], ['first_aid'], ['bandages', 1]], medium: [['bandages', 1]], hard: [] },
  npcs: {
    bruno: { name: `Chef Bruno`, traitor: 0.07, loyal: 0.7, skin: '#eeb48b', hair: '#1c1b20', hat: 'chef', shirt: '#f7f7fa', legs: '#2b2d42', extra: 'apron', beard: '#1c1b20' },
    delphine: { name: `Delphine`, traitor: 0.15, loyal: 0.5, skin: '#734125', hair: '#1c1b20', style: 'long', shirt: '#e468a8', extra: 'gown' },
    admiral: { name: `the Admiral`, traitor: 0, loyal: 0.8, kind: 'parrot', hat: true },
    anand: { name: `Dr Anand`, traitor: 0.05, loyal: 0.75, skin: '#ad6d3e', hair: '#1c1b20', style: 'bun', shirt: '#f7f7fa', legs: '#2b2d42', extra: 'coat' },
    giles: { name: `Purser Giles`, traitor: 0.5, loyal: 0.2, skin: '#f8cba6', hair: '#d0661f', hat: 'captain', shirt: '#1d3557', legs: '#1d3557' },
    moreau: { name: `Captain Moreau`, traitor: 0.3, loyal: 0.3, skin: '#eeb48b', hair: '#9b9aa3', hat: 'captain', shirt: '#f7f7fa', legs: '#f7f7fa', beard: '#9b9aa3' },
    musician: { name: `the cellist`, traitor: 0.05, loyal: 0.5, hair: '#3b2417', shirt: '#1b1b22', legs: '#1b1b22', extra: 'tie' },
    passenger: { name: `the passenger`, traitor: 0.2, loyal: 0.4, skin: '#c98552', hair: '#6b3e1f', style: 'long', shirt: '#f77f00', legs: '#2b2d42' },
    mime: { name: `the mime`, traitor: 0.25, loyal: 0.4, skin: '#f7f7fa', style: 'bald', hat: 'cap', hatC: '#1b1b22', shirt: '#1b1b22', legs: '#1b1b22', extra: 'stripes' },
  },
  items, locations, events: [...events, ...companionEvents(A), ...infectionEvents(A, { weaponWord: 'an axe, knife or gun' }), ...roleEvents(A, { weapon: 'fire_axe', medical: 'bandages', light: 'flashlight', junk: 'ship fittings' })], defaultLoot: ['bandages', 'canapes', 'lifejackets', 'batteries'],
  travelText: [`{loc} is behind {team} now. Three ways lead aft toward the lifeboats. The ship sinks in {clock}.`, `Time to leave {loc}. Which way now? {clock} before the Aurora Star goes under.`, `The deck is tilting a little more. Three routes on from {loc}, and {clock} left.`, `A long groan runs through the hull. {clock} before the sea takes her. Which way?`, `Water is creeping up the stairwells. {clock} left. Pick a route from {loc}.`],
  travelSay: [['a', [`"Which way? Quickly."`, `"Pick a route. The water is rising."`, `"Aft. Lifeboats are aft. Which way is aft?"`]]],
  travelOutcomes: T,
  restChoice: { l: `Rest and patch up first`, d: `Heal one injury, but lose time. You will choose the route after.`, o: [O(0.85, 'good', [`A short rest in a locked cabin. Wounds are cleaned and bound.`, `Ten minutes in an empty crew mess. Bandages tightened, water shared.`, `A pause in a linen cupboard, among fresh towels. Cuts are cleaned up.`, `A quiet rest in a deserted bar. Someone finds a first aid box behind the counter.`, `Everyone sits on a stairwell landing and catches their breath. Wounds are wrapped.`, `A rest in a lifejacket store. Bandages and silence.`], [['heal', 'injured', 1], ['time', -2]]), O(0.15, 'danger', [`The rest is interrupted. Something finds {r}!`, `Just as everyone sits down, the cabin door handle turns near {r}!`, `The quiet does not last. Something has followed {team} down the corridor, and it goes for {r}!`], [['em', 'r'], ['time', -1]])] },
  scavengeChoice: { l: `Search {loc} one more time`, d: `One more look around before moving on. Costs time.`, o: [O(0.6, 'item', [`One last search turns up {loot}.`, `A final look round pays off: {loot}.`, `Under a seat cushion: {loot}.`, `Someone checks one more locker. {loot}.`, `On the way out, {r} spots {loot}.`], [['loot'], ['time', -1]]), O(0.4, 'neutral', [`Nothing more to find.`, `A second search turns up nothing but napkins.`, `Still nothing. Time to go.`, `Nothing new. Just wet carpet.`, `Every cupboard is empty now.`], [['time', -1]])] },
  quips: { ...GENERIC_QUIPS, Any: [...GENERIC_QUIPS.Any, `"I am leaving a very strongly worded review of this cruise."`, `"Remember when the worst thing about this trip was the buffet?"`] },
  deathLines: GENERIC_DEATH_LINES,
  endings: [
    { id: 'total', title: `Lost at Sea`, cat: 'Total team death', objective: false, when: (c) => c.none, text: `Nobody from the group reached the mainland. When the Aurora Star's passenger list was finally read out, the names {fallen} were among the missing.` },
    { id: 'betrayal', title: `Officers First`, cat: 'Betrayal', objective: false, when: (c) => c.flag('betrayed'), text: `Purser Giles took Lifeboat 14 and left {survivors} on the sinking deck. They survived, clinging to the wreck until the coastguard came. Giles was arrested the moment he stepped ashore.` },
    { id: 'infected', title: `Stowaway`, cat: 'Infection', objective: true, when: (c) => c.reached && c.infected, text: `{survivors} stepped onto the mainland at dawn, and someone among them was hiding a bite. The town's first case was reported that afternoon.` },
    { id: 'secret', title: `The Captain's Log`, cat: 'Secret discovery', objective: true, when: (c) => c.flag('gave_logbook'), text: `The captain's logbook proved the cruise line knew about the outbreak before the Aurora Star sailed. {survivors} testified at the inquiry. Heads rolled. The fleet was grounded.` },
    { id: 'solo', title: `Lone Survivor`, cat: 'Complete rescue', objective: true, when: (c) => c.reached && c.total === 1, text: `{survivors} dragged a lifeboat up onto the sand alone, collapsed on the beach, and laughed until they cried.` },
    { id: 'complete', title: `Land Ho!`, cat: 'Complete rescue', objective: true, when: (c) => c.reached && c.all, text: `The lifeboat crunched onto the beach at dawn and every single one of them stepped onto dry land. {survivors}: the last passengers of the Aurora Star, alive and together.` },
    { id: 'sacrifice', title: `The One Who Stayed Aboard`, cat: 'Heroic sacrifice', objective: true, when: (c) => c.reached && c.sacrifice, text: `{survivors} reached the shore because someone made sure they would. {fallen} went down with the Aurora Star, and the survivors never forgot it.` },
    { id: 'last', title: `Last Passenger`, cat: 'Last survivor', objective: true, when: (c) => c.reached && c.alive === 1 && c.total > 1, text: `{survivors} walked up the beach alone, the only one left of the group, carrying the memory of {fallen}.` },
    { id: 'partial', title: `Partial Rescue`, cat: 'Partial rescue', objective: true, when: (c) => c.reached, text: `The lifeboat reached the mainland with {survivors} aboard. They stood on the beach and watched the sea where {fallen} were lost.` },
    { id: 'coastguard', title: `Coastguard`, cat: 'Unexpected rescue', objective: true, when: (c) => c.flag('coastguard'), text: `Searchlights, a rope ladder and warm blankets. The coastguard plucked {survivors} from the sea before they reached land. They reached the mainland wrapped in foil blankets: not the escape they planned, but an escape all the same.` },
    { id: 'adrift', title: `Adrift`, cat: 'Unexpected rescue', objective: false, when: (c) => c.flag('adrift'), text: `{survivors} drifted for hours in the dark until a fishing boat found them. They never reached the mainland on their own, but they are alive.` },
    { id: 'island', title: `Lighthouse Island`, cat: 'Alternative safe haven', objective: false, when: (c) => c.flag('island'), text: `The current carried {survivors} to a tiny island with an automated lighthouse, a freshwater spring and seabirds. It is not the mainland. But for now, it is safe, and it is theirs.` },
    { id: 'sunk', title: `Going Down`, cat: 'Failed escape', objective: false, when: (c) => c.timeout || c.flag('sunk'), text: `The Aurora Star sank before they could escape. {survivors} clung to what was left above the waves, waiting for a rescue that came far too slowly.` },
    { id: 'lost', title: `Lost Aboard`, cat: 'Tragic ending', objective: false, when: () => true, text: `The voyage ended aboard the ship. {survivors} remain somewhere on the Aurora Star.` },
  ],
});

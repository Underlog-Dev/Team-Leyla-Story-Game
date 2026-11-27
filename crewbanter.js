// More personality for the crew: extra lines, conversations and decisions, plus
// how each person reacts to a ridiculous accident. Merged into PERSONAS by
// persona.js. Everyone gets clever, heroic, stupid and unlucky moments: nobody is
// only ever the joke, and nobody is always right.
import { O } from './kit.js';

const N = (t, ...need) => ({ t, need });
const P = (id, ctx, lines, opt = {}) => ({ id, ctx, lines, ...opt });
const X = (id, sits, l, d, o, opt = {}) => ({ id, sits, l, d, o, tag: 'char', ...opt });

export const EXTRA = {
  leyla: {
    lines: {
      returned: ['"No. Absolutely not. You do NOT get to come back, {d}."', '"I kept you alive for HOURS, {d}. And this is the thanks I get?"'],
      calm: ['"Does anyone have a sensible suggestion? Anyone? At all?"', '"I just want it noted that I said this was a bad idea. Earlier. Quietly. To myself."'],
      tense: ['"Okay, new rule: nobody does anything heroic without asking me first."'],
      mishap: ['"{v}. Of ALL the moments. Get up. GET UP."', '"I turn my back for ONE second."', '"Chat is never letting this go, {v}. Never."'],
      mishapdeath: ['"No. No, no, no. Not like that. Not {v}."'],
    },
    convos: [
      P('ley_sensible', 'calm', [['me', '"Okay. Does anyone have a sensible suggestion?"'], ['-', 'Silence. A long silence.'], ['me', '"We\'re actually going to die, aren\'t we?"'], ['b', '"I had one, but it involved a trampoline."']]),
      P('ley_alive', 'calm', [['me', '"Quick reminder that my one job is keeping you lot alive."'], ['b', '"And how is that going?"'], ['me', '"Ask me after the next five minutes."']]),
      P('ley_wrong', 'tense', [['me', '"LEFT! Everyone go LEFT!"'], ['-', 'Everyone goes left. Leyla goes right.'], ['me', '"...My other left. Come back."']]),
      P('ley_bravodoor', 'calm', [['bravo', '"Don\'t worry. I\'ve locked the door."'], ['me', '"Bravo. We\'re outside."'], ['bravo', '"Then nothing can get in."'], ['me', '"WE can\'t get in!"']], { w: 2 }),
    ],
    options: [
      X('ley_vote', ['blocker', 'hazard', 'search'], `Leyla calls a quick team vote`, `Democracy. In a zombie apocalypse. Takes a minute.`, [
        O(0.45, 'good', [`Leyla: "Hands up for plan A."\nNobody moves.\nLeyla: "Plan B?"\nEveryone points at a gap nobody else had noticed. It is a brilliant plan. It works.\nLeyla: "See? Teamwork."`], [['time', -1], ['funny']]),
        O(0.35, 'neutral', [`The vote is a tie. Then a recount. Then an argument about the recount.\nLeyla: "I am overruling everyone. We go round."`], [['time', -2], ['funny']]),
        O(0.2, 'danger', [`The vote gets loud. VERY loud. Something hears the democracy and comes for {r}.`], [['em', 'r']]),
      ]),
    ],
  },

  bravo: {
    lines: {
      returned: ['"{d}! Old friend! Shall we negotiate?" ...No. No negotiating with {d}.', '"Nine lives and I still haven\'t used one. {d} used theirs in one go."'],
      calm: ['"I am a professional zombie negotiator. I have a business card. It is a leaf."', '"I have locked the door. Which door? All of them. Probably."'],
      tense: ['"Leave this to me! I have a terrible plan!"'],
      mishap: ['"In my defence, that would never happen to a cat. Oh. Wait."', '"{v}, I have nine lives and even I would not have tried that."', '"Shall I lick it better, {v}?"'],
      mishapdeath: ['"...I would give {v} one of my lives. I would give them two."'],
    },
    convos: [
      P('bra_negot', 'calm', [['me', '"Nobody panic. I am a trained zombie negotiator."'], ['b', '"Trained by who?"'], ['me', '"By myself. In a mirror."'], ['b', '"How many negotiations have you done?"'], ['me', '"Including this one? One."']], { w: 2 }),
      P('bra_smart', 'calm', [['b', '"How do we get through that fence?"'], ['me', '"We go round it."'], ['-', 'Everybody looks. There is a gap in the fence twenty metres away. Bravo was right. Bravo is never right.'], ['b', '"...I hate this."']], { cats: ['zombie', 'hazard', 'travel', 'exploration'] }),
      P('bra_outside', 'calm', [['me', '"Don\'t worry, I\'ve locked the door."'], ['b', '"Bravo. We\'re all outside."'], ['me', '"Exactly. Nothing is getting in."'], ['b', '"WE are not getting in!"'], ['me', '"...Ah."']]),
      P('bra_plan', 'tense', [['me', '"I have an outrageous idea."'], ['b', '"No."'], ['me', '"It involves the bin."'], ['b', '"Absolutely not."'], ['-', 'Ten seconds later, the bin plan has saved everyone. Nobody speaks about it.']]),
    ],
    options: [
      X('bra_negotiate', ['blocker', 'em'], `Let Bravo try to negotiate with it`, `"Professional zombie negotiator." His words.`, [
        O(0.35, 'good', [`Bravo straightens his bow tie and steps forward.\nBravo: "Good evening. I represent this group. Let us talk terms."\nThe {z} stops. Tilts its head. And, very slowly, wanders off.\nBravo: "Another successful negotiation."`, `Bravo: "My client would like you to leave. In return, nothing. Final offer."\nThe {z} stares at him for a long time... and leaves.\nBravo: "They never read the small print."`], [['funny'], ['mem', 'clutch', 'v', 1]]),
        O(0.35, 'neutral', [`Bravo opens negotiations. The {z} opens its mouth. Bravo closes negotiations.\nEveryone goes the long way round.\nBravo: "Talks have broken down. For now."`], [['time', -1], ['funny']]),
        O(0.3, 'hurt', [`Bravo offers a firm handshake. The {z} accepts the hand. And tries to keep it.\nBravo: "THIS IS NOT IN THE CONTRACT!"`], [['hurt', 'v', 1], ['mem', 'blunder', 'v', 0], ['funny']]),
      ], { notT: true }),
      X('bra_shoe', ['blocker', 'em', 'hazard'], `Throw Bravo's shoe at it`, `He has very big shoes. He will not be happy.`, [
        O(0.45, 'good', [`{r} grabs one of Bravo's enormous shoes and launches it. It hits the {z} square in the face and it goes down like a sack of potatoes.\nBravo: "THOSE WERE ITALIAN."`], [['funny']]),
        O(0.35, 'neutral', [`The shoe sails right over the {z} and lands in a puddle. Bravo hops after it for five minutes.\nBravo: "Nobody. Throws. My. Shoes."`], [['time', -1], ['funny']]),
        O(0.2, 'danger', [`The shoe misses and bounces off a car. The alarm goes off. Something comes for {r}.\nBravo, in one sock: "This is why we can't have nice things."`], [['em', 'r']]),
      ], { notT: true }),
    ],
  },

  chris: {
    lines: {
      returned: ['"Statistically, the odds of {d} finding us again were tiny. Tiny!"', '"I need a moment. And then I need a spreadsheet of everyone who might come back."'],
      calm: ['"I have calculated our odds. I have also decided not to share them."', '"Technically, that should have worked. I stand by the maths."'],
      tense: ['"I\'ve calculated this exactly! ...Roughly! Ish!"'],
      mishap: ['"Statistically, {v}, that was incredibly unlikely. Well done."', '"I\'m putting that in the incident report. Under \'embarrassing\'."', '"{v}, there were about four hundred safer ways to do that."'],
      mishapdeath: ['"I ran every number. I never ran that one."'],
    },
    convos: [
      P('chr_round', 'tense', [['me', '"I\'ve calculated that this structure should hold all of us."'], ['-', 'CRACK.'], ['me', '"...There may have been a rounding error."'], ['b', '"A ROUNDING ERROR?!"']], { w: 2, cats: ['hazard'] }),
      P('chr_wrong', 'calm', [['me', '"The safest route is obviously north."'], ['b', '"The sign says the exit is south."'], ['me', '"Signs can be wrong."'], ['b', '"It\'s a SIGN, Chris."']]),
      P('chr_overthink', 'tense', [['me', '"Okay, if it moves at roughly two metres a second, and we\'re eight metres away..."'], ['b', '"CHRIS."'], ['me', '"...that gives us about four seconds."'], ['b', '"YOU USED THEM ALL!"']]),
      P('chr_right', 'calm', [['me', '"Don\'t lean on that railing."'], ['b', '"Why not?"'], ['-', 'The railing falls off by itself and clatters down four floors.'], ['me', '"That\'s why not."']], { env: ['city', 'ship'] }),
    ],
    options: [
      X('chr_bridge', ['hazard', 'blocker'], `Chris builds a bridge out of whatever is lying around`, `Wardrobe doors, a shopping trolley and a lot of faith.`, [
        O(0.45, 'good', [`Chris builds it in four minutes flat. It looks awful. It is solid.\nChris: "Engineering is ninety percent confidence."\nEveryone crosses safely.`], [['hero'], ['mem', 'clutch', 'v', 1], ['funny']]),
        O(0.3, 'hurt', [`Chris: "It should hold the weight of a small car."\nIt does not hold the weight of a small {r}.\nChris: "There may have been a rounding error."`], [['hurt', 'r', 1], ['mem', 'blunder', 'v', 0], ['funny']]),
        O(0.25, 'neutral', [`Chris spends ages measuring everything twice. By the time he is finished, everyone has just walked round.\nChris: "Fine. But mine would have been better."`], [['time', -2], ['funny']]),
      ]),
    ],
  },

  hyrisha: {
    lines: {
      returned: ['"{d}... I\'m so sorry. I\'m so, so sorry."'],
      mishap: ['"Oh no, {v}! Are you okay? I\'m not laughing! I\'m... I\'m laughing a tiny bit."', '"{v}, come here. Hug. Then we never speak of it."'],
      mishapdeath: ['"No... {v}... I should have been faster."'],
    },
    convos: [
      P('hyr_wrongway', 'tense', [['me', '"I\'ll lead them away!"'], ['-', 'Hyrisha sprints off at incredible speed. In completely the wrong direction. Straight past the danger and back again.'], ['b', '"HYRISHA, THE OTHER WAY!"'], ['me', '"I know! I\'m doing a lap!"']]),
    ],
    options: [
      X('hyr_hug', ['people'], `Let Hyrisha win them over with kindness`, `She hugs first and asks questions later.`, [
        O(0.5, 'item', [`Hyrisha walks straight up to the scared stranger and hugs them. Three seconds later they are crying, laughing, and giving the group {loot}.\nHyrisha: "Everyone just needs a hug sometimes!"`], [['loot'], ['mem', 'clutch', 'v', 1]]),
        O(0.3, 'neutral', [`The stranger does not want a hug. Hyrisha hugs them anyway. It is very awkward for everyone.`], [['time', -1], ['funny']]),
        O(0.2, 'hurt', [`Hyrisha goes in for the hug. The stranger panics and swings at her.\nHyrisha: "Ow! That's okay! I still forgive you!"`], [['hurt', 'v', 1]]),
      ]),
    ],
  },

  hiwi: {
    lines: {
      returned: ['"I am NOT filming this. ...Okay, I filmed a bit."'],
      mishap: ['"I got that on video. I\'m not deleting it, {v}. It\'s evidence."', '"{v}, sit still. Medic coming. Camera also coming."'],
      mishapdeath: ['"I filmed everything today. I wish I hadn\'t filmed that."'],
    },
    convos: [
      P('hiw_nofilm', 'tense', [['b', '"Hiwi, help! It\'s got me!"'], ['me', '"Hold on, the angle is..."'], ['b', '"HIWI!"'], ['-', 'Hiwi drops the phone, grabs the nearest broom and hits the {z} so hard the broom snaps.'], ['me', '"...Did anyone film that? Nobody filmed that? Typical."']], { cats: ['emergency', 'zombie'] }),
      P('hiw_proper', 'calm', [['b', '"Hiwi, is my arm supposed to bend like that?"'], ['me', '"No."'], ['-', 'Hiwi fixes it in two seconds flat. It is genuinely impressive.'], ['me', '"Don\'t make it a whole thing."']]),
    ],
  },

  dardan: {
    lines: {
      returned: ['"Had a ram like that once. Wouldn\'t stay in the field either."'],
      calm: ['"We should head for the farmland. I\'ve waited my whole life for my skills to be useful."', '"You can tell a lot from a cowpat. You don\'t want to know what."'],
      mishap: ['"Did that to myself once with a gate. Different gate. Same face."', '"{v}, I\'ve seen a sheep do better. And sheep are idiots."'],
      mishapdeath: ['"Lost a good dog like that once. Stupid accident. Never got over it."'],
    },
    convos: [
      P('dar_farm', 'calm', [['me', '"I think we should head for the farmland."'], ['b', '"Why?"'], ['me', '"Because I\'ve been waiting my entire life for my skills to become useful."'], ['b', '"What skills?"'], ['me', '"Gates. I am VERY good with gates."']], { w: 2 }),
      P('dar_fence', 'tense', [['b', '"Should we help him?"'], ['c', '"I think we should give him a moment."'], ['-', 'Dardan is hanging off a fence by his underwear.'], ['me', '"THE ZOMBIES ARE COMING!"'], ['b', '"Okay, NOW we help him."']], { cats: ['hazard', 'zombie', 'travel'] }),
      P('dar_animals', 'calm', [['-', 'A very sick-looking crow lands nearby and stares at Dardan.'], ['me', '(nodding slowly) "Mm. Mm-hm. Right."'], ['b', '"What is it saying?"'], ['me', '"It says go left. Also it\'s had a rough week."']]),
    ],
    options: [
      X('dar_animal', ['hazard', 'search', 'blocker'], `Dardan tries to talk to the infected animal`, `"It's still an animal. Mostly."`, [
        O(0.4, 'good', [`Dardan crouches and makes a low noise in his throat. The infected animal stops. Stares. And trots off, showing everyone a safe way through.\nDardan: "They always know the way. Always."`], [['hero'], ['mem', 'clutch', 'v', 1], ['funny']]),
        O(0.35, 'hurt', [`Dardan: "Easy, girl. Easy..."\nIt is not easy. It is not a girl. It bites him on the hand.\nDardan: "Had worse from a goose. I keep saying that. It keeps being true."`], [['hurt', 'v', 1], ['mem', 'blunder', 'v', 0]]),
        O(0.25, 'neutral', [`Dardan and the animal have a long, silent staring contest. The animal wins. Everyone goes round.`], [['time', -1], ['funny']]),
      ]),
    ],
  },

  sonila: {
    lines: {
      returned: ['"That isn\'t {d}. {d} would never. Keep telling yourselves that."'],
      mishap: ['"{v}! Are you hurt? Show me. ...Okay, I\'m going to laugh later, but right now, let me look."', '"It\'s okay, {v}. It happens to everyone. It does not happen to everyone."'],
      mishapdeath: ['"I was right there. I was RIGHT THERE."'],
    },
    convos: [
      P('son_fall', 'calm', [['me', '"Everyone careful, the floor\'s wet here."'], ['-', 'Sonila slips on the wet floor, goes completely flat, and gets straight back up.'], ['me', '"...As I was demonstrating."']], { env: ['city', 'ship'] }),
    ],
  },

  isma: {
    lines: {
      returned: ['"Blocked. {d}, you are blocked. In this life AND the next."'],
      mishap: ['"Blocked. {v}, you are blocked. That was too embarrassing to be associated with."', '"Oh, I am screenshotting this memory forever, {v}."'],
      mishapdeath: ['"...I\'d unblock everyone in the world to undo that one."'],
    },
    convos: [
      P('ism_trip', 'calm', [['me', '"Honestly, the amount of stupid things you lot do..."'], ['-', 'Isma walks straight into a lamp post.'], ['b', '"You were saying?"'], ['me', '"You are ALL blocked."']], { env: ['city', 'ship'] }),
      P('ism_report', 'tense', [['-', 'A {z} lurches round the corner.'], ['me', '"Right. That is it. I\'m reporting this whole street."'], ['b', '"To WHO?"'], ['me', '"I will FIND someone."']], { env: ['city'] }),
    ],
  },

  doa: {
    lines: {
      returned: ['"{d}... I saved you a slice of cake. I\'m not giving it to you now."'],
      mishap: ['"Oh {v}! Sit down, I\'ve got a biscuit somewhere. A biscuit fixes most things."', '"{v}, that was like the time I dropped a whole trifle. But worse. And on you."'],
      mishapdeath: ['"I was going to bake {v} a cake when this was over..."'],
    },
    convos: [
      P('doa_rumble', 'tense', [['-', 'A deep, terrible growl echoes round the room. Everyone freezes.'], ['b', '"What WAS that?"'], ['-', 'Another growl.'], ['me', '"...That was my stomach. Sorry. I skipped breakfast."']]),
      P('doa_measure', 'calm', [['b', '"How did you know it would take exactly six minutes?"'], ['me', '"Baking. Everything is baking if you think about it."'], ['b', '"That makes no sense."'], ['me', '"And yet I\'m right."']]),
    ],
  },

  toddy: {
    lines: {
      returned: ['"Fair play, {d}. Even I wouldn\'t have come back for more."'],
      mishap: ['"Respect, {v}. That was almost as stupid as one of my plans."', '"That\'s going in the hall of fame, {v}. Right next to me."'],
      mishapdeath: ['"I always thought it\'d be me. Doing something daft. Not {v}."'],
    },
    convos: [
      P('tod_jump', 'tense', [['me', '"I can jump that!"'], ['b', '"Toddy, NO."'], ['-', 'Toddy jumps it. He clears it by a mile and lands perfectly.'], ['me', '"...I did not expect that either."']], { cats: ['hazard', 'zombie'] }),
      P('tod_cool', 'calm', [['me', '(leaning against a wall, trying to look cool) "Yeah. I\'ve got this."'], ['-', 'The wall is a door. It opens. Toddy disappears backwards.'], ['me', '(from the floor) "Still got this."']], { env: ['city', 'ship'] }),
    ],
    options: [
      X('tod_slide', ['em'], `Toddy does an action-movie slide across the car bonnet`, `He has seen it in films. Loads of films.`, [
        O(0.4, 'good', [`Toddy runs, leaps and slides perfectly across the bonnet like he has done it a thousand times. He lands, turns and pulls {t} clear.\nToddy: "Hat stays on. Every time."`], [['hero'], ['mem', 'clutch', 'v', 1]]),
        O(0.4, 'hurt', [`Toddy slides. He sticks halfway. He squeaks to a stop in the middle of the bonnet and rolls off the side.\nToddy: "That works in films!"\n{r}: "Films use STUNT DOUBLES!"`], [['hurt', 'v', 1], ['mem', 'blunder', 'v', 0], ['funny']]),
        O(0.2, 'danger', [`The slide is perfect. The landing is right in front of another {z}. It goes for {r}.`], [['em', 'r']]),
      ], { notT: true, env: ['city'] }),
    ],
  },

  hatice: {
    lines: {
      returned: ['"Kheria hissed at the door. Kheria KNEW it was {d}."'],
      mishap: ['"Kheria, look away. Don\'t look at {v}. It\'s not for kittens."', '"{v}, even Kheria wouldn\'t have done that. And she eats plastic."'],
      mishapdeath: ['"Kheria loved {v}. She never sat on anyone else\'s feet like that."'],
    },
    convos: [
      P('hat_smart', 'tense', [['-', 'Kheria hisses at a closed door and refuses to move.'], ['me', '"Nobody open that door."'], ['b', '"It\'s just a door."'], ['me', '"Kheria says no. We listen to Kheria."'], ['-', 'Something thuds against the inside of the door. Hard.']]),
    ],
  },

  gaza: {
    lines: {
      returned: ['"{d} respawned on the wrong team. That\'s so unfair."'],
      mishap: ['"Bro just got clipped by real life, {v}. No respawn on that one. Well, there is. But still."', '"That\'s a fail compilation clip, {v}. Top three."'],
      mishapdeath: ['"No respawn... I keep saying it. I never thought about it."'],
    },
    convos: [
      P('gaz_upside', 'calm', [['me', '"Trust me, I\'m great with maps."'], ['-', 'Ten minutes later.'], ['b', '"Gaza, the map is upside down."'], ['me', '"...So technically we\'ve been going the right way for upside-down people."']]),
      P('gaz_clutch', 'tense', [['me', '"Hold. Hold. Hold..."'], ['b', '"WHAT ARE WE HOLDING FOR?"'], ['-', 'The {z} trips over a kerb right in front of them. Exactly as Gaza waited for.'], ['me', '"Timing. Ranked matches teach you timing."']]),
    ],
  },

  loni: {
    lines: {
      returned: ['"I\'ve always wanted a rematch with {d}. Not like this, though."'],
      mishap: ['"HA! {v}! I mean... are you okay? HA!"', '"{v}, if you wanted a fight that badly, you could have asked me."'],
      mishapdeath: ['"I wanted to go down swinging. {v} deserved that too."'],
    },
    convos: [
      P('lon_wait', 'tense', [['me', '(hair shooting straight up) "I\'m going in!"'], ['b', '"Loni, wait, it\'s..."'], ['-', 'Loni charges. It is a mannequin. He wins.'], ['me', '"...Still counts."']], { env: ['city', 'ship'] }),
      P('lon_think', 'calm', [['me', '"What if we just... didn\'t fight this one?"'], ['-', 'Everyone turns and stares at Loni.'], ['me', '"What? I can have a plan. It\'s a good plan. We sneak."'], ['b', '"Who are you and what have you done with Loni?"']]),
    ],
  },

  ikram: {
    lines: {
      returned: ['"I had a feeling we\'d see {d} again. I hate being right."'],
      mishap: ['"{v}. I saw that coming. I did not say anything. I regret nothing."', '"I have seen that happen once before. Also embarrassing."'],
      mishapdeath: ['"I didn\'t see that coming. I always see things coming."'],
    },
    convos: [
      P('ikr_wrong', 'calm', [['me', '"This way. I know this place."'], ['-', 'Ikram walks confidently into a broom cupboard and closes the door.'], ['-', 'A long pause. The door opens.'], ['me', '"...It used to be a corridor."']], { env: ['city', 'ship'] }),
    ],
  },
};

// Budz is not one of the built-in crew. A character the streamer creates called
// Budz gets this personality: epic quests, fantasy-adventure talk, and speeches
// at exactly the wrong moments.
export const BUDZ = {
  they: 'he', birthday: null, sign: null,
  lines: {
    returned: ['"{d}... you have passed into the shadow. And come back out of it. Rude."', '"Not all who wander are lost. {d} is VERY lost."'],
    calm: ['"This is just like the old fantasy stories. A small fellowship, a long road, and a terrible dark tower at the end."', '"One does not simply walk into a shopping centre in the apocalypse. But we will."', '"We need a wizard. Has anyone got a wizard?"', '"I would follow any of you to the end of the world. Which is handy, because here it is."'],
    tense: ['"STAND, MY FRIENDS! STAND AND... no, actually, run. RUN!"', '"They shall not pass! ...They are passing. Okay. Plan B."', '"Remember the great battle at the fortress! Remember it!"'],
    win: ['"A victory worthy of song! I will write the song. It will be very long."', '"The fellowship holds! For now!"'],
    fail: ['"Even in the old tales, things went wrong in the middle bit."', '"This is the dark chapter. There is always a dark chapter."'],
    hurt: ['"{h}, rest. A true hero must heal before the final battle."'],
    ouch: ['"Tis but a flesh wound! Wrong film. It still hurts."'],
    item: ['"{item}! A relic of great power! ...Or just a {item}."'],
    mishap: ['"{v}, the bards will sing of this. Unfortunately."', '"Even the greatest heroes stumble, {v}. Not usually like THAT, but still."'],
    mishapdeath: ['"{v}... a true member of the fellowship. Gone, like a hero. Well. Like a hero who tripped."'],
  },
  convos: [
    P('bud_helm', 'tense', [['me', '"Remember the great siege of the fortress? Outnumbered, surrounded..."'], ['b', '"Budz, that was a film."'], ['me', '"And yet the lesson remains!"'], ['b', '"What lesson?!"'], ['me', '"...Have more horses."']], { w: 2 }),
    P('bud_speech', 'tense', [['me', '"My friends! There may come a day when we give up..."'], ['b', '"BUDZ, IT\'S RIGHT BEHIND YOU."'], ['me', '"...but it is NOT TODAY! RUN!"']], { w: 2 }),
    P('bud_quest', 'calm', [['me', '"So. Our quest. We carry the precious supplies to the far mountain..."'], ['b', '"It\'s a car park."'], ['me', '"...to the far car park, where our destiny awaits."']], { env: ['city'] }),
    P('bud_count', 'calm', [['b', '"How many fantasy references is that today, Budz?"'], ['me', '"Not nearly enough."']]),
    P('bud_second', 'calm', [['me', '"I\'m hungry. Is it time for second breakfast?"'], ['b', '"We haven\'t had FIRST breakfast."'], ['me', '"Then we are behind on breakfasts. This is a crisis."']]),
    P('bud_ring', 'calm', [['me', '(holding up a shiny washer from the floor) "My precious..."'], ['b', '"Put it down."'], ['me', '"...Fine. But it was calling to me."']]),
    P('bud_eagles', 'tense', [['me', '"Where are the giant eagles when you need them?!"'], ['b', '"There are no eagles, Budz!"'], ['me', '"That is EXACTLY the problem with this apocalypse!"']]),
  ],
  options: [
    X('bud_speech', ['blocker', 'em', 'people'], `Budz gives an epic battle speech`, `Rousing. Long. Possibly too long.`, [
      O(0.4, 'good', [`Budz climbs onto a bin.\nBudz: "My friends! Today we are not survivors. We are LEGENDS!"\nSomething about it works. Everybody charges as one and the way is cleared before anyone has time to be scared.\nBudz: "Someone write that down."`], [['hero'], ['mem', 'clutch', 'v', 1], ['funny']]),
      O(0.35, 'neutral', [`Budz begins.\nBudz: "In the ancient tales, when the darkness came..."\nTwelve minutes later, he is still going. Everyone sneaks round while he talks.\nBudz: "...and THAT is why we never give up! ...Where is everyone?"`], [['time', -2], ['funny']]),
      O(0.25, 'danger', [`Budz: "FRIENDS! HEAR ME! WE SHALL..."\nEverything nearby hears him. It comes for {r}.\nBudz: "...Maybe a quieter speech next time."`], [['em', 'r'], ['mem', 'blunder', 'v', 0]]),
    ]),
    X('bud_quest', ['travel'], `Let Budz pick the path "like a true ranger"`, `He has read the books. All the books. (Random route.)`, [
      O(0.5, 'good', [`Budz kneels, touches the ground, sniffs the air.\nBudz: "This way. The ground does not lie."\nIt is a perfect route. Nobody knows how.`], [['moveRandom'], ['time', 1], ['mem', 'clutch', 'v', 1]]),
      O(0.3, 'neutral', [`Budz leads them on a long, scenic, deeply unnecessary detour.\nBudz: "The long road is the road of heroes."\nEveryone: "The long road is the LONG road."`], [['moveRandom'], ['time', -2], ['funny']]),
      O(0.2, 'danger', [`Budz: "Fear not! This path is safe!"\nThe path is not safe. Something comes for {r}.`], [['moveRandom'], ['em', 'r']]),
    ]),
  ],
};

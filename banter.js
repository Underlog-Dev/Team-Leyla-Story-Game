// Character banter: who says what, and when.
// Every survivor gets a consistent voice (from their personality tags), some get a
// random quirk each playthrough (running jokes), and the group remembers what
// happened earlier (callbacks). All text is theme-neutral and uses tokens:
//   {a} {b} {c}  speakers in a conversation      {m}  the person a memory is about
//   {h}  the person who just got hurt            {dead} who just died
//   {z} {zs} {Z} {Zs}  the monster word           {goal} {place} {critter}
//   {weapon} a weapon you are carrying           {snack} the speaker's favourite snack
//   {item} the item just found                   {zname} the zombie someone named
//   {n}  a running count                         {@key} whoever a memory is about

import { PERSONAS, personaOf, personaKey, packsOf, birthdayToday } from './persona.js';

// ---------------- voices ----------------
export const VOICES = ['Funny', 'Sarcastic', 'Nervous', 'Brave', 'Reckless', 'Kind', 'Intelligent', 'Practical', 'Mysterious', 'Gamer', 'Foodie', 'Nature lover', 'Loyal'];
const ROLE_VOICE = { Leader: 'Brave', Fighter: 'Reckless', Medic: 'Kind', Engineer: 'Practical', Scout: 'Nervous', Athlete: 'Funny' };
export function voiceOf(c) {
  const t = (c.traits || []).find((x) => VOICES.includes(x));
  return t || ROLE_VOICE[c.role] || 'Funny';
}

// One-liners by voice and situation. Short enough to read out on stream.
const VL = {
  Funny: {
    calm: ['"If anyone asks, I was never scared. I was doing cardio."', '"Five stars for the scenery. Minus four for the {zs}."', '"I would like to speak to the manager of the apocalypse."', '"New personal best: zero bites today. Round of applause please."'],
    tense: ['"Okay. OKAY. This is fine. This is so fine."', '"I would like to formally request to not be here."', '"Quick, someone say something funny. Not me. I am busy panicking."'],
    win: ['"And THAT is why I am the team mascot."', '"Somebody write that down. That was legendary."', '"Nailed it. Mostly by accident. But nailed it."'],
    fail: ['"Well. That went great. If you squint."', '"On the bright side... no, I have got nothing."', '"Let us all agree to never speak of this."'],
    hurt: ['"{h}, rub some dirt on it. Actually, do not. Dirt is gross now."', '"Do not worry, {h}. Scars are cool."'],
    ouch: ['"Ow. Ow ow ow. I am fine. I am being brave. OW."', '"Tell my story. Make me taller in it."'],
    item: ['"Ooh, {item}! I am naming it Kevin."', '"Shopping in the apocalypse. No queues."'],
  },
  Sarcastic: {
    calm: ['"Oh good. More walking. My favourite."', '"What a lovely day for certain death."', '"Remind me to leave a one-star review of the end of the world."', '"Love what they have done with the place. Very blood-chic."'],
    tense: ['"Oh brilliant. Exactly what we needed."', '"Fantastic. Truly. Ten out of ten."', '"Wow. Didn\'t see THAT coming. Said nobody."'],
    win: ['"Wow. Something went right. Mark the calendar."', '"I am shocked. Genuinely. Look at my face."'],
    fail: ['"Who could have possibly predicted that. Oh wait. Me."', '"Great plan. Truly. Ten out of ten."', '"And the award for worst idea goes to..."'],
    hurt: ['"Nice one, {h}. Really sticking the landing."', '"{h}, you are bleeding on my shoes. Rude."'],
    ouch: ['"Oh good. Pain. That is new and exciting."', '"Nobody say anything. I mean it."'],
    item: ['"{item}. Oh joy. Our problems are solved."', '"Wow, {item}. Truly we are blessed."'],
  },
  Nervous: {
    calm: ['"Did anyone else hear that? No? Just me? Great."', '"I am fine. My hands are shaking for fun."', '"Can we walk faster? And quieter? Both. Please."', '"Is it just me or is it too quiet? It is too quiet."'],
    tense: ['"Nope. Nope nope nope nope."', '"I want my mum. I want everyone\'s mum."', '"This is it. This is how it ends. In a {place}."'],
    win: ['"We are alive? We are ALIVE! I need to sit down."', '"My heart is still going about a million miles an hour."'],
    fail: ['"I KNEW it. I knew this would happen. I said."', '"I would like to go home now. Is home still there?"'],
    hurt: ['"{h}! Oh no oh no. Is it bad? It looks bad. Don\'t look at it."'],
    ouch: ['"Is that blood? That is blood. That is MY blood."', '"I think I am dying. Am I dying? Somebody check."'],
    item: ['"Oh nice. Is it... safe? Does it bite?"'],
  },
  Brave: {
    calm: ['"Stay close. Eyes open. We go together."', '"Nobody gets left behind. Not today."', '"We have made it this far. We keep going."'],
    tense: ['"Behind me. Now!"', '"Stand your ground. We have got this."', '"If it wants one of us, it goes through me first."'],
    win: ['"Good work, everyone. That is how we do it."', '"See? Together, we are unstoppable."'],
    fail: ['"Shake it off. We regroup and go again."', '"Bad call. My fault. Let us move."'],
    hurt: ['"{h}, lean on me. I have got you."', '"Stay with me, {h}. That is an order."'],
    ouch: ['"It is a scratch. Keep moving."', '"I have had worse. Probably."'],
    item: ['"Good find. That could save a life."'],
  },
  Reckless: {
    calm: ['"Honestly? I think we could take them. All of them."', '"Boring. Can we find something to fight?"', '"What is the worst that could happen? Do not answer that."'],
    tense: ['"YES. Finally, some action!"', '"Let me at it! LET ME AT IT!"', '"I have a plan. The plan is violence."'],
    win: ['"Told you. Fortune favours the absolutely unhinged."', '"Again! Let us do that again!"'],
    fail: ['"Okay, in my defence, that should have worked."', '"Worth it. Was it worth it? Kind of worth it."'],
    hurt: ['"{h}, that is going to leave a sick scar."'],
    ouch: ['"Ha! Is that all you have got? Ow."', '"Pain is just weakness leaving the body. Lots of weakness. OW."'],
    item: ['"Can I hit something with {item}? Asking for me."'],
  },
  Kind: {
    calm: ['"Everyone drink some water. Little things keep us alive."', '"You are all doing so well. Honestly."', '"Shout if you need a rest. Nobody has to be a hero."'],
    tense: ['"Hold hands if you need to! Stay together!"', '"It is okay! We are going to be okay!"'],
    win: ['"Group hug. Quickly. Then we run."', '"I am so proud of everyone right now."'],
    fail: ['"It is okay. Nobody is to blame. Mostly."', '"Deep breaths. We will fix this."'],
    hurt: ['"{h}, sit down, let me look at that. Brave face."', '"Oh, {h}. Come here. Let me help."'],
    ouch: ['"I am alright. Look after the others first."'],
    item: ['"Oh, {item}! Someone might really need that."'],
  },
  Intelligent: {
    calm: ['"Statistically, the shouting is not helping."', '"Interesting. They seem slower in the cold. Noted."', '"For the record, I calculated our odds. Do not ask."'],
    tense: ['"Do NOT run in a straight line! Zigzag! ZIGZAG!"', '"Twelve of them, one of us. Bad maths."', '"According to my calculations: RUN."'],
    win: ['"As predicted. Well, roughly predicted."', '"Science. Mostly science. Some luck."'],
    fail: ['"In hindsight, the data was against us."', '"That was a 30% chance. We hit the 30%."'],
    hurt: ['"{h}, keep pressure on it. Above the heart."'],
    ouch: ['"Superficial laceration. I am fine. Ow. Medically, ow."'],
    item: ['"{item}. Useful, if we use it properly."'],
  },
  Practical: {
    calm: ['"Count your supplies. Know what you have."', '"Tie your laces. Seriously. Now."', '"Nobody touch anything weird. I am looking at all of you."'],
    tense: ['"Weapons up. Exits? Where are the exits?"', '"Less screaming, more moving!"'],
    win: ['"Good. Next problem."', '"That worked. Let us not push our luck."'],
    fail: ['"Right. Lesson learned. Moving on."', '"Well, that was a waste of time and skin."'],
    hurt: ['"{h}, bandage it now, cry later."'],
    ouch: ['"Fine. It is fine. I will tape it."'],
    item: ['"{item}. Put it in the bag. Properly, not just chucked in."'],
  },
  Mysterious: {
    calm: ['"I have seen worse than this." (Nobody asks.)', '"The night has eyes."', '"I knew this day would come. I just did not think it would be a Tuesday."'],
    tense: ['"So. It begins."', '"I will handle this. Do not watch."'],
    win: ['"Exactly as I foresaw." (They did not.)', '(nods slowly, saying absolutely nothing)'],
    fail: ['"This, too, was foretold." (It was not.)', '"Hm."'],
    hurt: ['"{h}. You will heal. I have seen it." (Has not.)'],
    ouch: ['(stares into the distance, bleeding mysteriously)'],
    item: ['"{item}. Yes. This will be important later."'],
  },
  Gamer: {
    calm: ['"This is basically the tutorial level."', '"If I had a save point, I would use it right now."', '"I feel like we missed a side quest back there."'],
    tense: ['"BOSS FIGHT! Everyone, BOSS FIGHT!"', '"Lag! I have got lag! In real life!"', '"Do not panic, just mash buttons!"'],
    win: ['"GG. Easy. Well, medium."', '"Achievement unlocked: still alive."'],
    fail: ['"That was the game\'s fault. Unbalanced."', '"Can we reload? Please tell me we can reload."'],
    hurt: ['"{h} is on low health! Somebody use a potion!"'],
    ouch: ['"I just lost a heart! Real life has hearts?!"', '"Critical hit. I have taken a critical hit."'],
    item: ['"LOOT! Ooh, {item}. That is at least a rare drop."'],
  },
  Foodie: {
    calm: ['"When this is over I am eating an entire pizza."', '"I would trade my left shoe for a cup of tea."', '"Does anyone else smell toast? No? Just me? Oh no."'],
    tense: ['"I am too hungry to die right now!"', '"I have not even had lunch yet!"'],
    win: ['"That deserves a snack. Who has snacks?"'],
    fail: ['"I need comfort food. Immediately."'],
    hurt: ['"{h}, do you want a biscuit? Biscuits help."'],
    ouch: ['"Ow. I need a biscuit. For medical reasons."'],
    item: ['"{item}! Can you eat it? No? Shame."'],
  },
  'Nature lover': {
    calm: ['"The birds stopped singing. That is never good."', '"Look, the moss is still growing. Life finds a way."', '"Smell that? Fresh air. And also rot. Mostly rot."'],
    tense: ['"Everything just went quiet! That means danger!"', '"Even the {critter}s are running. RUN!"'],
    win: ['"Survival of the fittest. That is us."'],
    fail: ['"Nature is cruel. Also, that was a bad idea."'],
    hurt: ['"{h}, I know a leaf that helps with that. Somewhere."'],
    ouch: ['"Stung. Or bitten. Or stabbed. Something."'],
    item: ['"{item}. Not as good as a nice stick, but fine."'],
  },
  Loyal: {
    calm: ['"Whatever happens, we stick together."', '"I have got your back. All of you. Always."'],
    tense: ['"Nobody touches my friends!"', '"I am not leaving anyone. Not one."'],
    win: ['"That is my team! THAT is my team!"'],
    fail: ['"We get through this together. Like always."'],
    hurt: ['"{h}! Hold on, I am right here."'],
    ouch: ['"Don\'t stop for me. Okay, maybe stop a little."'],
    item: ['"Good find! Team effort, that."'],
  },
};

// ---------------- conversations ----------------
// lines: [speaker, text]. '-' is a stage direction (no speaker).
// pref: voice preferences for slots. mem: needs a memory, 'm' is that person.
const T = (id, ctx, lines, opt = {}) => ({ id, ctx, lines, ...opt });
export const TEMPLATES = [
  // ----- tense moments (emergencies, zombie scenes) -----
  T('please', 'tense', [['a', '"PASS ME THE {weapon}!"'], ['b', '"Say please."'], ['a', '"{b}, WE ARE LITERALLY ABOUT TO DIE!"'], ['b', '"That\'s not please."']], { pref: { b: ['Sarcastic', 'Funny', 'Mysterious'] } }),
  T('onthree', 'tense', [['a', '"On three. One... two..."'], ['b', '"Do we go ON three or AFTER three?"'], ['a', '"...Just go. GO!"']]),
  T('calm', 'tense', [['a', '"Everyone stay CALM!"'], ['b', '"I AM CALM!"'], ['c', '"You are standing on my foot."'], ['b', '"I am CALMLY standing on your foot!"']], { pref: { b: ['Nervous'] } }),
  T('behind', 'tense', [['a', '"Where is {b}?!"'], ['b', '"Right here." (directly behind {a})'], ['a', '"WHY ARE YOU BEHIND ME?!"'], ['b', '"Moral support."']], { pref: { b: ['Mysterious', 'Funny'] } }),
  T('plan', 'tense', [['a', '"I have a plan!"'], ['b', '"Is it running?"'], ['a', '"...It is mostly running."']], { pref: { a: ['Reckless', 'Brave'] } }),
  T('dibs', 'tense', [['a', '"Dibs not being bitten!"'], ['b', '"You can\'t call dibs on that!"'], ['a', '"I just did."']], { pref: { a: ['Funny', 'Gamer'] } }),
  T('noise', 'tense', [['-', 'Everyone freezes. Something shuffles closer.'], ['a', '(whispering) "Nobody. Move."'], ['b', '(whispering) "My nose is itchy."'], ['a', '(whispering) "Then DIE itchy."']]),
  T('fighting', 'tense', [['a', '"Should we fight it or run?"'], ['b', '"Run!"'], ['c', '"Fight!"'], ['a', '"Great. Very helpful. Thank you both."']], { pref: { b: ['Nervous'], c: ['Reckless'] } }),
  T('bigger', 'tense', [['a', '"Is it just me or is that one bigger than the others?"'], ['b', '"It\'s not just you."'], ['a', '"I was really hoping it was just me."']]),
  T('carry', 'tense', [['a', '"If I get bitten, you have to carry on without me."'], ['b', '"Deal."'], ['a', '"You could have hesitated a LITTLE."']], { pref: { b: ['Sarcastic', 'Practical'] } }),
  T('stairs', 'tense', [['a', '"They can\'t climb stairs, right?"'], ['b', '"Pretty sure they can climb stairs."'], ['a', '"Then what is the POINT of stairs?!"']]),

  // ----- calm moments (exploring, waiting, humour scenes) -----
  T('quiet', 'calm', [['a', '"Does anyone else hear that?"'], ['b', '"Hear what?"'], ['a', '"Exactly. It is too quiet."'], ['b', '"You can\'t complain about quiet AND noise."'], ['a', '"Watch me."']], { pref: { a: ['Nervous'] } }),
  T('snacktalk', 'calm', [['a', '"If you could save one snack from the apocalypse, what would it be?"'], ['b', '"{snack}."'], ['c', '"Wrong."'], ['b', '"How can a SNACK be wrong?!"']], { pref: { b: ['Foodie'] } }),
  T('whisper', 'calm', [['a', '"Okay. Whisper voices from now on."'], ['b', '"OKAY."'], ['a', '"That is... not a whisper."'], ['b', '"(whispering) okay."']]),
  T('lookout', 'calm', [['a', '"Who is on lookout?"'], ['-', 'Silence.'], ['b', '"I thought YOU were."'], ['a', '"I am asking because I WASN\'T."'], ['c', '"Nobody has been on lookout for an HOUR?!"']]),
  T('book', 'calm', [['a', '"When this is over I am writing a book."'], ['b', '"About surviving?"'], ['a', '"About how annoying all of you are. Chapter one: {b}."']], { pref: { a: ['Sarcastic'] } }),
  T('teamname', 'calm', [['a', '"Before we go any further, we need to discuss something very important."'], ['b', '"The plan?"'], ['a', '"Our team name."'], ['c', '"...We are doing this NOW?"'], ['a', '"Morale is a weapon, {c}."']], { pref: { a: ['Brave', 'Funny', 'Gamer'] } }),
  T('spoon', 'calm', [['a', '"{b}, why are you holding that like a sword?"'], ['b', '"It\'s a spoon."'], ['a', '"I KNOW it is a spoon."'], ['b', '"Then you know why."']], { pref: { b: ['Mysterious', 'Reckless'] } }),
  T('ifiturn', 'calm', [['a', '"Hypothetically, if I turned into a {z}, would you..."'], ['b', '"Yes."'], ['a', '"I didn\'t finish."'], ['b', '"Still yes."']], { pref: { b: ['Practical', 'Sarcastic'] } }),
  T('miles', 'calm', [['a', '"I reckon we have walked about eleven miles."'], ['b', '"It has been twenty minutes."'], ['a', '"Emotionally, eleven miles."']]),
  T('level2', 'calm', [['a', '"I think we are on level two now."'], ['b', '"What was level one?"'], ['a', '"The bit where {c} screamed at a coat."'], ['c', '"It LOOKED like a person."']], { pref: { a: ['Gamer'] } }),
  T('critter', 'calm', [['a', '"I think a {critter} is following us."'], ['b', '"It is a {critter}. It is not following us."'], ['a', '"It has been with us for ages, {b}. It KNOWS things."']]),
  T('run', 'calm', [['a', '"Technically, {zs} should not be able to run."'], ['b', '"Tell THEM that."'], ['a', '"I would, but they never listen. Classic {zs}."']], { pref: { a: ['Intelligent'] } }),
  T('water', 'calm', [['a', '"{b}, have you drunk any water today?"'], ['b', '"Does an energy drink count?"'], ['a', '"No."'], ['b', '"Then... technically no."']], { pref: { a: ['Kind', 'Practical'] } }),
  T('superpower', 'calm', [['a', '"If you could have one superpower right now, what would it be?"'], ['b', '"Flying. Obviously."'], ['c', '"Being somewhere else."'], ['a', '"That is not a superpower, {c}."'], ['c', '"It is today."']]),
  T('smell', 'calm', [['a', '"What is that SMELL?"'], ['b', '"Probably {zs}."'], ['c', '"...It might be me. I have not showered since this started."'], ['-', 'Everyone shuffles a step away from {c}.']]),
  T('favourite', 'calm', [['a', '"Be honest. Who is everyone\'s favourite?"'], ['b', '"Favourite what?"'], ['a', '"Person. In the group. Go."'], ['b', '"Not doing this."'], ['a', '"It\'s me, isn\'t it."']], { pref: { a: ['Funny', 'Reckless'] } }),
  T('selfie', 'calm', [['a', '"Quick selfie. For the memories."'], ['b', '"There is a {z} RIGHT behind us."'], ['a', '"Exactly. Content."']], { pref: { a: ['Funny', 'Reckless'] } }),
  T('soundtrack', 'calm', [['a', '"This would be so much less scary with background music."'], ['b', '"So hum something."'], ['-', '{a} hums the most tense music imaginable.'], ['b', '"Please stop."']]),
  T('dark', 'calm', [['a', '"Is anyone else scared of the dark?"'], ['b', '"Not the dark. What\'s IN the dark."'], ['c', '"Thanks, {b}. Really helpful."']], { pref: { a: ['Nervous'] } }),
  T('mvp', 'calm', [['a', '"I think I am the most useful person in this group."'], ['b', '"You tripped over a cat earlier."'], ['a', '"Strategically."']], { pref: { a: ['Reckless', 'Funny'] } }),
  T('rate', 'calm', [['a', '"Rate this place out of ten."'], ['b', '"Two."'], ['a', '"Harsh."'], ['b', '"One point is for there being no {zs} in this exact corner."']], { pref: { b: ['Sarcastic'] } }),
  T('rules', 'calm', [['a', '"Rule one of surviving: never split up."'], ['b', '"Rule two?"'], ['a', '"Never let {c} make the plan."'], ['c', '"HEY."']]),
  T('knock', 'calm', [['a', '"Knock knock."'], ['b', '"Not now."'], ['a', '"Knock KNOCK."'], ['b', '"...Who is there?"'], ['a', '"{Z}."'], ['b', '"{Z} who?"'], ['a', '"{Z} about to eat you if you don\'t walk faster."']], { pref: { a: ['Funny'] } }),
  T('jacket', 'calm', [['a', '"Nice jacket, {b}."'], ['b', '"Thanks. Found it on a {z}."'], ['a', '"...I hate that I like it."']]),
  T('serious', 'calm', [['a', '"{b}. I need to ask you something serious."'], ['b', '"What?"'], ['a', '"Do you think {zs} have feelings?"'], ['b', '"..."'], ['a', '"Because I think I hurt one\'s feelings earlier and I cannot stop thinking about it."']], { pref: { a: ['Kind', 'Nervous'] } }),

  T('trustweapon', 'calm', [['a', '"Who is carrying the {weapon}?"'], ['b', '"Me."'], ['c', '"Absolutely not. You dropped the torch down a drain earlier."'], ['b', '"ONE time."']]),
  T('trustmap', 'calm', [['a', '"Should {b} be in charge of directions?"'], ['c', '"{b} got lost in their own kitchen once."'], ['b', '"It was a BIG kitchen."']]),
  T('trustwatch', 'calm', [['a', '"{b}, you are on night watch."'], ['c', '"{b} fell asleep during a fire alarm once."'], ['b', '"It was a very relaxing fire alarm."'], ['a', '"...{c}, you are on night watch."']]),
  T('trustcook', 'calm', [['a', '"If we find food, who is cooking?"'], ['b', '"Me!"'], ['c', '"Over my dead body."'], ['b', '"That can be arranged. With my COOKING."'], ['c', '"That is exactly my point."']], { pref: { b: ['Foodie', 'Reckless'] } }),
  T('trustsecret', 'calm', [['a', '"Can I trust you with a secret, {b}?"'], ['b', '"Of course."'], ['a', '"I have no idea where we are."'], ['c', '"I HEARD THAT."']]),
  T('ducktalk', 'calm', [['a', '"Serious question. Could we survive in a shopping centre forever?"'], ['b', '"No."'], ['a', '"There is a cinema though."'], ['b', '"...Okay, let me think about it."']]),
  T('pact', 'calm', [['a', '"Let us make a pact. If one of us turns, the others have to say something nice at the funeral."'], ['b', '"Deal."'], ['c', '"What would you say about me?"'], ['b', '"...I will think of something."']]),
  T('fact', 'calm', [['a', '"Fun fact: a group of crows is called a murder."'], ['b', '"Why would you tell us that RIGHT NOW?"'], ['a', '"Because it is fun."'], ['b', '"It is not fun. Nothing about it is fun."']], { pref: { a: ['Intelligent', 'Nature lover'] } }),
  T('grudge', 'calm', [['a', '"I want everyone to know I have not forgotten what {b} did."'], ['b', '"What did I do?"'], ['a', '"You KNOW what you did."'], ['b', '"I genuinely do not."'], ['a', '"Good. Keep wondering."']], { pref: { a: ['Sarcastic', 'Mysterious'] } }),
  T('lastmeal', 'calm', [['a', '"If this was your last meal, what would it be?"'], ['b', '"{snack}."'], ['a', '"That is not a meal."'], ['b', '"It is if you have enough of it."']], { pref: { b: ['Foodie'] } }),
  T('perfect', 'calm', [['a', '"Is it weird that this is the fittest I have ever been?"'], ['b', '"Fear is a great personal trainer."'], ['a', '"Five stars. Would not recommend."']]),
  T('autograph', 'calm', [['a', '"When we survive this, we are going to be famous."'], ['b', '"Nobody is going to be famous."'], ['a', '"I am practising my autograph anyway."'], ['-', '{a} signs a bin.']], { pref: { a: ['Funny', 'Reckless', 'Gamer'] } }),
  T('formal', 'calm', [['a', '"I would like to call this meeting to order."'], ['b', '"This is not a meeting."'], ['a', '"Item one: {b} keeps interrupting."']], { pref: { a: ['Brave', 'Intelligent'] } }),
  T('ghost', 'calm', [['a', '"Do you think ghosts are real?"'], ['b', '"There are literally {zs} out there."'], ['a', '"So that is a yes?"'], ['b', '"It is a PLEASE STOP."']], { pref: { a: ['Nervous', 'Mysterious'] } }),
  T('compliment', 'calm', [['a', '"{b}, I just want to say: you are doing amazing."'], ['b', '"...What do you want?"'], ['a', '"Nothing! ...Can I have your snacks?"']]),
  T('hero', 'tense', [['a', '"I will hold them off! Go!"'], ['b', '"We are not leaving you!"'], ['a', '"...Okay good, because I did not actually have a plan for that bit."']], { pref: { a: ['Brave', 'Reckless'] } }),
  T('wrongway', 'tense', [['a', '"RUN!"'], ['-', 'Everyone runs.'], ['b', '"WRONG WAY! WRONG WAY!"'], ['-', 'Everyone runs the other way.']]),
  T('sorry', 'tense', [['a', '"If we don\'t make it, I just want to say I\'m sorry I ate your crisps, {b}."'], ['b', '"THAT WAS YOU?!"'], ['a', '"Focus! Zombies!"']]),
  T('swap', 'tense', [['a', '"Swap places with me!"'], ['b', '"Why?!"'], ['a', '"Because it is looking at ME!"']], { pref: { a: ['Nervous', 'Funny'] } }),
  T('cardio', 'tense', [['a', '"I KNEW I should have done more cardio!"'], ['b', '"Talk less, run more!"']]),
  T('rest', 'travel', [['a', '"Can we stop for five minutes?"'], ['b', '"We stopped five minutes ago."'], ['a', '"And it was beautiful. Let us do it again."']]),
  T('song', 'travel', [['a', '"Someone pick a song for the walk."'], ['b', '"No singing."'], ['a', '"Humming?"'], ['b', '"No humming."'], ['-', '{a} hums anyway, very quietly, the entire way.']], { pref: { a: ['Funny', 'Kind'] } }),
  T('road', 'travel', [['a', '"Which way?"'], ['b', '"Left."'], ['c', '"Right."'], ['a', '"Brilliant. So straight on, then."']]),
  // ----- travel -----
  T('arewethere', 'travel', [['a', '"Are we nearly at {goal}?"'], ['b', '"No."'], ['a', '"Are we nearly at {goal} NOW?"'], ['b', '"I will leave you here."']], { pref: { a: ['Funny'] } }),
  T('lead', 'travel', [['a', '"Who made {b} the leader?"'], ['b', '"Nobody. I just started walking first."'], ['c', '"And we all just... followed."']]),
  T('shortcut', 'travel', [['a', '"I know a shortcut."'], ['b', '"Is it the same shortcut as last time?"'], ['a', '"Last time was a learning experience."']], { pref: { a: ['Reckless'] } }),
  T('legs', 'travel', [['a', '"My legs are tired."'], ['b', '"The {zs} are not tired."'], ['a', '"...My legs are feeling much better actually."']]),

  // ----- reactions after an outcome -----
  T('didthat', 'after_win', [['a', '"Did that just... work?"'], ['b', '"Don\'t say it out loud. It will hear you."']]),
  T('highfive', 'after_win', [['a', '"High five!"'], ['b', '"Not now."'], ['a', '"Low five?"'], ['b', '"...Fine."']]),
  T('nailedit', 'after_win', [['a', '"Teamwork makes the dream work."'], ['b', '"You did nothing."'], ['a', '"I believed in you. That is work."']]),
  T('cheer', 'after_win', [['a', '"YES!"'], ['b', '"SHHH!"'], ['a', '(whispering) "yes."']]),
  T('newrule', 'after_fail', [['a', '"Okay. New rule: nobody does THAT again."'], ['b', '"Whose idea even was that?"'], ['-', 'Everyone slowly turns to look at the voices in their heads.']]),
  T('fine', 'after_fail', [['a', '"So that was bad."'], ['b', '"Very bad."'], ['c', '"Could have been worse."'], ['a', '"How?"'], ['c', '"...I am still thinking."']]),
  T('hurtok', 'after_hurt', [['a', '"{h}, are you okay?!"'], ['h', '"I am FINE."'], ['a', '"You are bleeding."'], ['h', '"Fashionably."']], { pref: { h: ['Funny', 'Reckless', 'Sarcastic'] } }),
  T('hurtlook', 'after_hurt', [['h', '"How bad is it? Don\'t lie."'], ['a', '"It is... fine."'], ['h', '"You paused."'], ['a', '"I did not pause."'], ['h', '"YOU PAUSED."']]),
  T('hurtbrave', 'after_hurt', [['a', '"{h}, you need to rest."'], ['h', '"Rest is for people who are not being chased."']], { pref: { h: ['Brave', 'Reckless', 'Practical'] } }),
  T('loot1', 'after_item', [['a', '"Ooh, {item}!"'], ['b', '"Don\'t get attached."'], ['a', '"Too late. I love it."']]),
  T('loot2', 'after_item', [['a', '"Is it edible?"'], ['b', '"It is {item}."'], ['a', '"That is not a no."']], { pref: { a: ['Foodie'] } }),
  T('loot3', 'after_item', [['a', '"Who is carrying {item}?"'], ['b', '"Not me. The backpack is already full of {c}\'s rubbish."'], ['c', '"It\'s not rubbish. It\'s CHARACTER."']]),
  T('nothing', 'after_nothing', [['a', '"Well, that was a waste of time."'], ['b', '"We found nothing AND lost time. Efficient."']], { pref: { b: ['Sarcastic'] } }),
  T('chaoswin', 'after_chaos_win', [['a', '"I can\'t believe that worked."'], ['b', '"I CAN believe it worked. I just don\'t want to."']]),
  T('chaoswin2', 'after_chaos_win', [['a', '"We are never telling anyone how we survived that."'], ['b', '"I am telling EVERYONE."']]),
  T('chaoswin3', 'after_chaos_win', [['a', '"That was the stupidest thing I have ever seen."'], ['b', '"And yet. Here we are. Alive."'], ['a', '"I hate that you are right."']]),
  T('chaosfail', 'after_chaos_fail', [['a', '"Whose idea was that?"'], ['b', '"The voices."'], ['a', '"We need new voices."']]),
  T('chaosfail2', 'after_chaos_fail', [['a', '"In fairness, that was never going to work."'], ['b', '"Then WHY DID WE DO IT?!"'], ['a', '"For the story."']]),
  T('chaosfail3', 'after_chaos_fail', [['a', '"Can we go back to making sensible decisions?"'], ['b', '"When did we EVER make sensible decisions?"']]),

  T('win4', 'after_win', [['a', '"I would like that on my CV, please."'], ['b', '"What would it say?"'], ['a', '"Excellent at not dying."']]),
  T('win5', 'after_win', [['a', '"Was that skill or luck?"'], ['b', '"Yes."']]),
  T('win6', 'after_win', [['a', '"Everyone okay?"'], ['b', '"Better than okay. I feel UNSTOPPABLE."'], ['c', '"Please do not say that. That is how people get stopped."']]),
  T('fail3', 'after_fail', [['a', '"Can we pretend that did not happen?"'], ['b', '"No. I will be bringing it up forever."']]),
  T('fail4', 'after_fail', [['a', '"That is going in the book."'], ['b', '"What book?"'], ['a', '"The book of things we never do again. It is getting long."']]),
  T('hurt4', 'after_hurt', [['h', '"Is it bad? Tell me straight."'], ['a', '"You will live."'], ['h', '"Will I THRIVE, though?"']], { pref: { h: ['Funny', 'Nervous'] } }),
  T('hurt5', 'after_hurt', [['a', '"{h}! Stay with me!"'], ['h', '"I am RIGHT HERE. It is a scratch."'], ['a', '"Sorry. I panicked."']], { pref: { a: ['Nervous', 'Kind', 'Loyal'] } }),
  T('item4', 'after_item', [['a', '"Does anyone know how {item} works?"'], ['b', '"How hard can it be?"'], ['c', '"Famous last words."']]),
  T('item5', 'after_item', [['a', '"Dibs on {item}."'], ['b', '"You cannot call dibs on shared supplies."'], ['a', '"Watch me. Dibs."']], { pref: { a: ['Reckless', 'Funny'] } }),
  T('chaoswin4', 'after_chaos_win', [['a', '"Write that down. That is a strategy now."'], ['b', '"That is NOT a strategy."'], ['a', '"It is in my book."']]),
  T('chaoswin5', 'after_chaos_win', [['-', 'Everyone stares at each other in silence.'], ['a', '"...Nobody tell my mum about this."']]),
  T('chaosfail4', 'after_chaos_fail', [['a', '"I want it on record that I voted against that."'], ['b', '"You did not."'], ['a', '"I voted against it IN MY HEART."']]),
  T('chaosfail5', 'after_chaos_fail', [['a', '"Okay. Lesson learned."'], ['b', '"What lesson?"'], ['a', '"...I will let you know when I learn it."']]),
  T('nothing2', 'after_nothing', [['a', '"Nothing?"'], ['b', '"Nothing."'], ['a', '"Not even a biscuit?"'], ['b', '"NOT EVEN A BISCUIT."']], { pref: { a: ['Foodie'] } }),
  // ----- grief (no jokes) -----
  T('grief1', 'grief', [['a', '"We keep going. For {dead}."'], ['b', '"For {dead}."']]),
  T('grief2', 'grief', [['a', '"{dead} should be here."'], ['-', 'Nobody answers. There is nothing to say.']]),
  T('grief3', 'grief', [['a', '"{dead} would have made a joke right now."'], ['b', '"Yeah. A really bad one."'], ['a', '"The worst."'], ['-', 'Nobody laughs. But it helps a little.']]),
  T('grief4', 'grief', [['a', '"I didn\'t even say goodbye to {dead}."'], ['b', '"None of us did. Come on. Stay close."']]),

  // ----- callbacks: things that happened earlier in THIS game -----
  T('cb_neg_ok', 'cb', [['a', '"Maybe {m} should do all our talking from now on."'], ['m', '"My rates have gone up."']], { mem: 'negotiate', ok: true }),
  T('cb_neg_fail', 'cb', [['a', '"Remember when {m} tried to negotiate with a {z}?"'], ['b', '"The {z} won the negotiation."'], ['m', '"It was a DRAW."']], { mem: 'negotiate', ok: false }),
  T('cb_neg_fail2', 'cb', [['m', '"I still think it was listening to me."'], ['a', '"It was trying to EAT you, {m}."'], ['m', '"Listening AND eating. Multitasking."']], { mem: 'negotiate', ok: false }),
  T('cb_walk_ok', 'cb', [['a', '"I still can\'t believe the zombie walk worked."'], ['m', '"It was my best performance."'], ['b', '"You were very convincing, {m}. Worryingly convincing."']], { mem: 'zwalk', ok: true }),
  T('cb_walk_fail', 'cb', [['a', '"Next time we pretend to be {zs}, can {m} NOT break character?"'], ['m', '"I SNEEZED. {Zs} sneeze too. Probably."']], { mem: 'zwalk', ok: false }),
  T('cb_dead', 'cb', [['a', '"{m}, nobody believed you were dead earlier."'], ['m', '"The {z} did. For a second."'], ['b', '"It sniffed your ear."']], { mem: 'playdead' }),
  T('cb_shoe', 'cb', [['a', '"{m}, where is your other shoe?"'], ['m', '"With a {z}. It is a long story."'], ['b', '"It is a very short story. You threw it."']], { mem: 'shoe' }),
  T('cb_shoe2', 'cb', [['a', '"Still one shoe, {m}?"'], ['m', '"It is a look. A brave look."']], { mem: 'shoe' }),
  T('cb_duck', 'cb', [['a', '"Why do we still have the duck?"'], ['m', '"The duck stays."'], ['b', '"What does the duck DO, {m}?"'], ['m', '"Nothing. Yet."']], { mem: 'duck' }),
  T('cb_duck2', 'cb', [['-', 'From somewhere in the backpack: a tiny squeak.'], ['a', '"Was that the duck?"'], ['m', '"She is excited."']], { mem: 'duck' }),
  T('cb_tester', 'cb', [['a', '"Should {m} go first again?"'], ['m', '"Why is it ALWAYS me?"'], ['b', '"You have a gift."']], { mem: 'tester' }),
  T('cb_vibes', 'cb', [['a', '"{m}, which way?"'], ['m', '"The vibes say left."'], ['b', '"The vibes nearly got us killed."'], ['m', '"The vibes are learning."']], { mem: 'vibes' }),
  T('cb_sing', 'cb', [['a', '"Nobody let {m} sing again."'], ['m', '"I heard that."'], ['a', '"You were meant to."']], { mem: 'sing' }),
  T('cb_named', 'cb', [['a', '"Do you think {zname} misses us?"'], ['m', '"Every single day."'], ['b', '"It has been about an hour."']], { mem: 'namer' }),
  T('cb_speech', 'cb', [['a', '"Whatever happens, do NOT let {m} give another speech."'], ['m', '"It was inspirational."'], ['b', '"It was forty minutes long."']], { mem: 'speech' }),
  T('cb_lick', 'cb', [['a', '"Are we all just moving past the fact that {m} licked something earlier?"'], ['m', '"It was SAFE."'], ['a', '"You did not know that!"']], { mem: 'lick' }),
  T('cb_hero', 'cb', [['a', '"{m}, what you did back there... thank you."'], ['m', '"Don\'t make it weird."'], ['a', '"I am going to make it a LITTLE bit weird."']], { mem: 'hero' }),
  T('cb_hurt', 'cb', [['a', '"How is the war wound, {m}?"'], ['m', '"Still attached. Mostly."']], { mem: 'hurt' }),
  T('cb_dance', 'cb', [['a', '"{m}, do the dance again."'], ['m', '"The dance is retired."'], ['b', '"The dance saved our lives."'], ['m', '"Which is why it is retired. Legends do not do encores."']], { mem: 'dance' }),
  T('cb_scream', 'cb', [['a', '"My ears are still ringing from when {m} screamed at that thing."'], ['m', '"It worked, didn\'t it?"'], ['a', '"I can\'t HEAR you."']], { mem: 'scream' }),
  T('cb_hug', 'cb', [['a', '"{m} tried to HUG a {z} today. Let that sink in."'], ['m', '"Everyone deserves love."'], ['b', '"Not THEM."']], { mem: 'hug' }),
  T('cb_blunder', 'cb', [['a', '"Are we REALLY trusting {m} with anything important? After last time?"'], ['m', '"That was a learning experience."'], ['b', '"For who?"']], { mem: 'blunder' }),
  T('cb_blunder2', 'cb', [['m', '"I have an idea."'], ['a', '"No."'], ['m', '"You haven\'t heard it."'], ['a', '"I heard your LAST one."']], { mem: 'blunder' }),
  T('cb_blunder3', 'cb', [['a', '"New rule: {m} doesn\'t get to choose anything for at least an hour."'], ['m', '"That\'s fair, honestly."']], { mem: 'blunder' }),
  T('cb_clutch', 'cb', [['a', '"Let {m} do it. {m} has been on fire today."'], ['m', '"Finally. Some respect."']], { mem: 'clutch' }),
  T('cb_clutch2', 'cb', [['a', '"Still can\'t believe {m} pulled that off earlier."'], ['m', '"Neither can I, honestly."']], { mem: 'clutch' }),
  T('cb_lost', 'cb', [['a', '"I miss {m}."'], ['b', '"Me too. Even the bad jokes."']], { mem: 'lost', dead: true, gap: 5 }),
  T('cb_lost2', 'cb', [['a', '"{m} would have loved this bit."'], ['b', '"{m} would have complained the whole way."'], ['a', '"...Yeah. That is what I mean."']], { mem: 'lost', dead: true, gap: 8 }),
];
export const TEMPLATE_BY_ID = Object.fromEntries(TEMPLATES.map((t) => [t.id, t]));

// ---------------- quirks: running jokes, different every game ----------------
export const SNACKS = ['custard creams', 'chicken nuggets', 'Jaffa Cakes', 'cheese toasties', 'Pot Noodles', 'chips and gravy', 'Haribo', 'chocolate digestives', 'pickled onion crisps', 'a Greggs sausage roll'];
export const QUIRKS = {
  counter: {
    first: [['me', '"That is {n}." '], ['b', '"{n} what?"'], ['me', '"{Zs} we have seen. I am keeping count."']],
    again: [[['me', '"{n}."'], ['b', '"Are you STILL counting?"'], ['me', '"Somebody has to."']], [['-', '{me} quietly adds another tick to the {z} tally. It is up to {n}.']], [['me', '"{n}. New record."'], ['b', '"That is not a good record, {me}."']], [['me', '"{n}."'], ['b', '"Can you count something nicer? Like sheep?"'], ['me', '"Sheep don\'t try to eat us."']], [['me', '(muttering) "{n}... {n}..."'], ['b', '"Are you counting OUT LOUD now?"']]],
  },
  namer: {
    first: [['me', '"I am calling that one Trevor."'], ['b', '"You cannot name the {zs}."'], ['me', '"Too late. Trevor is part of the family now."']],
    again: [[['me', '"That one is Brenda. Hi, Brenda."'], ['b', '"Stop naming them!"']], [['me', '"This lamp post is called Doug. Respect Doug."']], [['me', '"Our backpack\'s name is Keith, by the way."'], ['b', '"Since WHEN?"'], ['me', '"Since always. Keith has always been Keith."']], [['me', '"Our {critter} friend is called Graham now."'], ['b', '"Graham?"'], ['me', '"He looks like a Graham."']], [['me', '"That one is Gerald. Gerald looks tired. We have all been there, Gerald."']]],
  },
  snack: {
    first: [['me', '"Does anyone have any {snack}? Asking for me."'], ['b', '"It is the apocalypse, {me}."'], ['me', '"So that is a no."']],
    again: [[['me', '"I would fight a {z} for {snack} right now."'], ['b', '"Please don\'t."']], [['me', '"I just saw a shop sign that said {snack}. I am not okay."']], [['me', '"If I die, bury me with {snack}."'], ['b', '"Nobody is dying."'], ['me', '"Then FEED me {snack}."']], [['me', '"Day whatever of no {snack}. I am seeing them in the clouds now."']], [['me', '"I would share my last {snack} with any of you."'], ['b', '"Really?"'], ['me', '"No. But it was a nice thought."']]],
  },
  main: {
    first: [['me', '"And that was the day they realised... I was the main character."'], ['b', '"Who are you talking to?"'], ['me', '"The audience."']],
    again: [[['me', '"This is my villain origin story."'], ['b', '"You are not a villain."'], ['me', '"Not YET."']], [['me', '"(to nobody) Little did they know, things were about to get worse."'], ['b', '"Stop SAYING that!"']], [['me', '"Is this my redemption arc? It feels like my redemption arc."']], [['me', '"(slow-motion walk) This would look SO good in a trailer."'], ['b', '"Walk faster."']], [['me', '"Somewhere, someone is watching this and cheering for me."'], ['b', '"Nobody is watching this."'], ['me', '"You don\'t know that."']]],
  },
  whisper: {
    first: [['me', '(whispering at full volume) "DOES ANYONE HAVE A PLASTER?"'], ['b', '"That is NOT a whisper!"'], ['me', '"It is a STAGE whisper."']],
    again: [[['me', '(whisper-shouting) "IS IT SAFE?"'], ['b', '"It was."']], [['me', '"(very loud whisper) I THINK I SEE ONE."'], ['b', '"And now it sees YOU."']], [['me', '(whispering, somehow louder than talking) "EVERYONE BE QUIET."']], [['b', '"{me}, whisper."'], ['me', '"I AM WHISPERING."'], ['-', 'A {z} three streets away turns its head.']]],
  },
  plan: {
    first: [['me', '"I have a plan."'], ['b', '"What is it?"'], ['me', '"Step one: run. Step two: keep running."'], ['b', '"That is not a plan, that is cardio."']],
    again: [[['me', '"I have a new plan."'], ['b', '"Is it like the last plan?"'], ['me', '"It has less screaming."']], [['me', '"Plan Z. Like Zebra. Because we are out of other letters."']], [['me', '"Okay, my plan has a plan now."']], [['me', '"New plan: we find a castle."'], ['b', '"Where are we getting a CASTLE?"'], ['me', '"That is phase two."']], [['me', '"I have reviewed all my old plans. They were bad. This one is worse, but in a fun way."']]],
  },
  doc: {
    first: [['me', '(nature documentary voice) "Here we see the {z} in its natural habitat. Hungry. Confused."'], ['b', '"Please stop."'], ['me', '"...Much like {b} before lunch."']],
    again: [[['me', '(documentary voice) "The survivors move as one. Except {b}, who is lagging. Nature is cruel."']], [['me', '(documentary voice) "Notice how the {z} tilts its head. It has spotted its prey. That is us. We are the prey."'], ['b', '"Not helping!"']], [['me', '(documentary voice) "And here, the rare {critter}. It fears nothing. Not even {zs}. Respect."']], [['me', '(documentary voice) "The young {b} searches for food. It will not find any. Nature is cruel."'], ['b', '"I am RIGHT HERE."']]],
  },
  review: {
    first: [['me', '"{loc}: two stars. Would not get chased here again."'], ['b', '"Are you reviewing EVERYWHERE?"'], ['me', '"Somebody has to warn the others."']],
    again: [[['me', '"Three stars for this bit. Nice lighting. Too many {zs}."']], [['me', '"One star. The staff tried to eat me."']], [['me', '"Four stars. Would get lost here again. Lovely bins."'], ['b', '"Four stars? HERE?"'], ['me', '"Compared to the last place."']], [['me', '"Zero stars. A {z} touched my hair."']]],
  },
  mum: {
    first: [['me', '"If my mum could see me now..."'], ['b', '"She would be proud?"'], ['me', '"She would tell me to put a coat on."']],
    again: [[['me', '"My mum always said I would end up somewhere like this."'], ['b', '"She predicted the apocalypse?"'], ['me', '"She predicted I would make bad decisions."']], [['me', '"Mum, if you are out there: I ate a vegetable today. A tinned one. Still counts."']], [['me', '"My mum would know what to do right now."'], ['b', '"What would she do?"'], ['me', '"Shout at the {zs} until they apologised."']]],
  },
  critter: {
    first: [['me', '"Nobody move. There is a {critter}."'], ['b', '"There are {zs} EVERYWHERE and you are scared of a {critter}?"'], ['me', '"The {zs} are not looking at me like THAT, {b}."']],
    again: [[['me', '"The {critter} is back. It is following me. I KNOW it is."']], [['me', '"I would rather face ten {zs} than one more {critter}."'], ['b', '"Can we get that in writing?"']], [['-', 'A {critter} lands nearby.'], ['me', '(instantly hiding behind {b}) "Deal with it."'], ['b', '"It is a BIRD, {me}."']], [['me', '"The {critter}s are working with the {zs}. Think about it."'], ['b', '"I would really rather not."']]],
  },
};
const QUIRK_KEYS = Object.keys(QUIRKS);

// ---------------- setup ----------------
export function initBanter(s, r) {
  if (s.bt) return;
  const bt = { mem: {}, quirks: {}, snack: {}, jokes: {}, used: [], count: {}, chaosSeen: {}, lastChaos: -9, pcool: {}, pl: [], copt: {} };
  const party = r.shuffle(s.party.filter((c) => !personaOf(c)));
  const nQ = Math.min(party.length, s.party.length >= 5 ? 3 : s.party.length >= 2 ? 2 : 1);
  const keys = r.shuffle(QUIRK_KEYS.slice());
  for (let i = 0; i < nQ; i++) bt.quirks[party[i].id] = keys[i];
  for (const c of s.party) bt.snack[c.id] = r.pick(SNACKS);
  s.bt = bt;
}

export function remember(s, key, who, ok) {
  if (!s.bt || !who) return;
  s.bt.mem[key] = { who, stage: s.stage, ok: ok === undefined ? true : !!ok, calls: 0 };
}

// ---------------- selection ----------------
// H: { alive(s), fill(s, adv, text, ctx), r, inv names }
function castLines(s, H, slots, pref, fixed) {
  const r = H.r;
  const al = H.alive(s);
  const cast = { ...fixed };
  const used = new Set(Object.values(cast));
  for (const k of slots) {
    if (cast[k]) continue;
    const pool = al.filter((c) => !used.has(c.id));
    if (!pool.length) return null;
    const p = r.weighted(pool, (c) => (1 / (1 + (s.bt.count[c.id] || 0) * 0.6)) * ((pref?.[k] || []).includes(voiceOf(c)) ? 5 : 1));
    cast[k] = p.id; used.add(p.id);
  }
  return cast;
}

function render(s, adv, H, lines, cast, extra = {}) {
  const out = [];
  for (const [who, text] of lines) {
    const ctx = { cast: { ...cast }, me: cast.me, tok: extra };
    const t = H.fill(s, adv, text, ctx).replace(/^"([a-z])/, (m, c) => '"' + c.toUpperCase());
    if (who === '-') out.push({ who: null, text: t, aside: true });
    else if (cast[who]) { out.push({ who: cast[who], text: t }); s.bt.count[cast[who]] = (s.bt.count[cast[who]] || 0) + 1; }
  }
  return out;
}

function slotsOf(t) { return [...new Set(t.lines.map((l) => l[0]).filter((k) => k !== '-'))]; }

export function pickTemplate(s, adv, H, ctxName, fixed = {}, extra = {}) {
  const al = H.alive(s);
  const pool = TEMPLATES.filter((t) => t.ctx === ctxName && !s.bt.used.includes(t.id) && slotsOf(t).filter((k) => !fixed[k]).length <= al.length - Object.keys(fixed).filter((k) => fixed[k]).length && slotsOf(t).every((k) => fixed[k] || k !== 'h'));
  if (!pool.length) return null;
  const t = H.r.pick(pool);
  const cast = castLines(s, H, slotsOf(t), t.pref, fixed);
  if (!cast) return null;
  s.bt.used.push(t.id);
  if (s.bt.used.length > 60) s.bt.used.splice(0, 20);
  return render(s, adv, H, t.lines, cast, extra);
}

const aliveKeys = (s) => new Set(s.party.filter((c) => c.alive).map(personaKey).filter(Boolean));
function voiceLine(s, adv, H, c, key, extra = {}) {
  const p = personaOf(c);
  s.bt.pl ||= [];
  if (p && p.lines[key] && H.r.chance(0.75)) {
    const keys = aliveKeys(s);
    const opts = p.lines[key].map((l) => (typeof l === 'string' ? { t: l, need: [] } : l)).filter((l) => l.need.every((k) => keys.has(k)) && !s.bt.pl.includes(c.id + l.t.slice(0, 24)));
    if (opts.length) {
      const l = H.r.pick(opts);
      s.bt.pl.push(c.id + l.t.slice(0, 24));
      s.bt.count[c.id] = (s.bt.count[c.id] || 0) + 1;
      return { who: c.id, text: H.fill(s, adv, l.t, { cast: { me: c.id, v: c.id }, me: c.id, tok: extra }) };
    }
  }
  const packs = packsOf(c).filter((pk) => pk.lines[key]);
  if (packs.length && H.r.chance(0.5)) {
    const t = H.r.pick(H.r.pick(packs).lines[key]);
    if (!s.bt.pl.includes(c.id + t.slice(0, 24))) {
      s.bt.pl.push(c.id + t.slice(0, 24));
      s.bt.count[c.id] = (s.bt.count[c.id] || 0) + 1;
      return { who: c.id, text: H.fill(s, adv, t, { cast: { me: c.id, v: c.id }, me: c.id, tok: extra }) };
    }
  }
  const v = VL[voiceOf(c)] || VL.Funny;
  const list = v[key] || VL.Funny[key];
  if (!list || !list.length) return null;
  const t = H.fill(s, adv, list, { cast: { me: c.id }, me: c.id, tok: extra });
  s.bt.count[c.id] = (s.bt.count[c.id] || 0) + 1;
  return { who: c.id, text: t };
}

function quirkLines(s, adv, H) {
  const al = H.alive(s);
  const qs = al.filter((c) => s.bt.quirks[c.id]);
  if (!qs.length) return null;
  const me = H.r.pick(qs);
  const key = s.bt.quirks[me.id];
  const Q = QUIRKS[key];
  const j = (s.bt.jokes[key] ||= { n: 0, times: 0 });
  if (key === 'counter') j.n += H.r.range(1, 4) + (j.times ? 2 : 0);
  j.used ||= [];
  let fresh = Q.again.map((x, i) => i).filter((i) => !j.used.includes(i));
  if (!fresh.length) { j.used = []; fresh = Q.again.map((x, i) => i); }
  const vi = H.r.pick(fresh);
  const lines = j.times === 0 ? Q.first : Q.again[vi];
  if (j.times > 0) j.used.push(vi);
  const others = al.filter((c) => c.id !== me.id);
  if (lines.some((l) => l[0] === 'b') && !others.length) return null;
  j.times++;
  const cast = { me: me.id, b: others.length ? H.r.weighted(others, (c) => 1 / (1 + (s.bt.count[c.id] || 0))).id : null };
  return render(s, adv, H, lines, cast, { n: j.n, snack: s.bt.snack[me.id] });
}

// Conversations written for specific people (Leyla vs Bravo, Gaza vs Chris...).
function personaConvo(s, adv, H, ctxName) {
  const al = H.alive(s);
  const byKey = {};
  for (const c of al) { const k = personaKey(c); if (k) byKey[k] = c; }
  const cands = [];
  for (const [k, me] of Object.entries(byKey)) {
    // nobody's personality gets overused: a cooldown per person
    if (s.stage - (s.bt.pcool[k] ?? -9) < 3) continue;
    for (const cv of PERSONAS[k].convos) {
      if (cv.ctx !== ctxName || s.bt.used.includes(cv.id)) continue;
      if (cv.id.startsWith('ism_bday') && s.today === PERSONAS.chris.birthday) continue;
      const named = [...new Set([...cv.lines.map((l) => l[0]).filter((x) => PERSONAS[x]), ...(cv.need || [])])];
      if (!named.every((x) => byKey[x] && x !== k)) continue;
      const generic = [...new Set(cv.lines.map((l) => l[0]).filter((x) => x === 'b' || x === 'c'))];
      if (al.length < 1 + named.length + generic.length) continue;
      cands.push({ k, me, cv, named, generic, w: (cv.w || 1) * (1 + named.length * 0.5) });
    }
  }
  if (!cands.length) return null;
  const pick = H.r.weighted(cands, (x) => x.w);
  const fixed = { me: pick.me.id };
  for (const x of pick.named) fixed[x] = byKey[x].id;
  const cast = castLines(s, H, pick.generic, {}, fixed);
  if (!cast) return null;
  s.bt.used.push(pick.cv.id);
  s.bt.pcool[pick.k] = s.stage;
  return render(s, adv, H, pick.cv.lines, cast);
}

// Real birthdays (from the date the game is played).
function birthdayLines(s, adv, H) {
  if (s.bt.bday || s.stage < 2) return null;
  const c = birthdayToday(s);
  if (!c) return null;
  s.bt.bday = true;
  const al = H.alive(s).filter((x) => x.id !== c.id);
  const isma = al.find((x) => personaKey(x) === 'isma');
  if (personaKey(c) === 'chris' && isma) return render(s, adv, H, [['i', '"Happy birthday, Chris!"'], ['me', '"Isma, for the last time, it is not my bir..."'], ['-', 'Chris stops. Checks the date. Goes very quiet.'], ['me', '"...It actually IS my birthday."'], ['i', '"I KNOW. I have been right ALL ALONG."']], { me: c.id, i: isma.id });
  if (!al.length) return render(s, adv, H, [['me', '"Happy birthday to me. In the apocalypse. Brilliant."']], { me: c.id });
  const b = H.r.pick(al);
  return render(s, adv, H, [['b', `"Wait. What's the date today?"`], ['-', 'Somebody checks. Everyone turns to look at {me}.'], ['b', '"IT\'S YOUR BIRTHDAY!"'], ['me', '"...I didn\'t want to make a fuss."'], ['-', 'Everyone sings happy birthday to {me}, very quietly, in a dark corridor full of danger. It is the best birthday party in the history of the apocalypse.']], { me: c.id, b: b.id });
}

function callbackLines(s, adv, H) {
  const al = H.alive(s);
  const cands = TEMPLATES.filter((t) => {
    if (t.ctx !== 'cb' || s.bt.used.includes(t.id)) return false;
    const m = s.bt.mem[t.mem];
    if (!m || s.stage - m.stage < (t.gap || 2) || m.calls >= 2) return false;
    if (t.ok !== undefined && m.ok !== t.ok) return false;
    const who = s.party.find((c) => c.id === m.who);
    if (!who) return false;
    if (t.dead ? who.alive : !who.alive) return false;
    const speaking = slotsOf(t).filter((k) => k !== 'm').length + (t.dead ? 0 : 1);
    return al.length >= speaking;
  });
  if (!cands.length) return null;
  const t = H.r.pick(cands);
  const m = s.bt.mem[t.mem];
  const fixed = t.dead ? {} : { m: m.who };
  const cast = castLines(s, H, slotsOf(t).filter((k) => k !== 'm'), t.pref, fixed);
  if (!cast) return null;
  if (t.dead) cast.m = m.who;
  m.calls++;
  s.bt.used.push(t.id);
  // a dead person never speaks: drop any line they would have said
  const lines = t.dead ? t.lines.filter((l) => l[0] !== 'm') : t.lines;
  return render(s, adv, H, lines, cast);
}

// Banter shown when a stage opens.
export function sceneBanter(s, adv, H, e, { hasSay = false } = {}) {
  const r = H.r;
  const al = H.alive(s);
  if (!al.length || ['turn', 'timeout'].includes(e.cat)) return [];
  if (e.cat === 'finale') return [];
  if (e.cat === 'emergency') {
    if (al.length >= 2 && r.chance(0.4)) return (r.chance(0.5) && personaConvo(s, adv, H, 'tense')) || pickTemplate(s, adv, H, 'tense') || [];
    return [];
  }
  // serious moments get far less chatter
  const rate = e.cat === 'moral' ? 0.25 : e.cat === 'rescue' ? 0.55 : hasSay ? 0.55 : 0.8;
  const bday = birthdayLines(s, adv, H);
  if (bday) return bday;
  if (!r.chance(rate)) return [];
  if (e.cat === 'moral') { const c = r.weighted(al, (c) => 1 / (1 + (s.bt.count[c.id] || 0))); return [voiceLine(s, adv, H, c, 'calm')].filter(Boolean); }
  const roll = r.next();
  let out = null;
  const tenseScene = (e.cat === 'zombie' || e.cat === 'hazard') && r.chance(0.5);
  const peopleScene = (e.cat === 'interaction' || e.cat === 'rescue') && (e.npc || e.companion || /stranger|man|woman|someone|voice/i.test(String(e.text)));
  if (roll < 0.3) out = callbackLines(s, adv, H);
  if (!out && roll < 0.7) out = personaConvo(s, adv, H, peopleScene && r.chance(0.6) ? 'people' : tenseScene ? 'tense' : 'calm');
  if (!out && roll < 0.8) out = quirkLines(s, adv, H);
  if (!out && al.length >= 2 && r.chance(0.8)) out = pickTemplate(s, adv, H, e.cat === 'travel' ? (r.chance(0.6) ? 'travel' : 'calm') : (e.cat === 'zombie' || e.cat === 'hazard') && r.chance(0.5) ? 'tense' : 'calm');
  if (!out) { const c = r.weighted(al, (c) => 1 / (1 + (s.bt.count[c.id] || 0))); out = [voiceLine(s, adv, H, c, e.cat === 'zombie' ? 'tense' : 'calm')].filter(Boolean); }
  return out; // never cut a conversation before its punchline
}

export function griefBanter(s, adv, H, deadName) {
  if (H.alive(s).length < 2) return [];
  return pickTemplate(s, adv, H, 'grief', {}, { dead: deadName }) || [];
}

// Reaction after an outcome. info: { kind, chaos, hurtId, itemName, deaths }
export function reactionBanter(s, adv, H, info) {
  const r = H.r;
  const al = H.alive(s);
  if (!al.length || info.deaths) return [];
  if (!info.chaos && (info.cat === 'moral' || info.cat === 'finale' || info.cat === 'turn')) return [];
  if (!r.chance(info.chaos ? 0.85 : info.cat === 'travel' ? 0.2 : 0.5)) return [];
  const hurt = info.hurtId && al.find((c) => c.id === info.hurtId);
  const extra = { item: info.itemName || 'that', h: hurt ? hurt.name : '' };
  let ctx;
  if (info.chaos) ctx = ['hurt', 'danger', 'death', 'infect'].includes(info.kind) ? 'after_chaos_fail' : 'after_chaos_win';
  else if (info.kind === 'hurt' && hurt) ctx = 'after_hurt';
  else if (info.kind === 'item') ctx = 'after_item';
  else if (info.kind === 'good') ctx = 'after_win';
  else if (info.kind === 'neutral' && info.searched) ctx = 'after_nothing';
  else if (info.kind === 'danger') return [];
  else return [];
  // either a little conversation or one voice line
  if (ctx === 'after_win' && r.chance(0.25)) { const pc = personaConvo(s, adv, H, 'after_win'); if (pc) return pc; }
  if (al.length >= 2 && r.chance(0.55)) {
    const fixed = ctx === 'after_hurt' ? { h: hurt.id } : {};
    const conv = pickTemplate(s, adv, H, ctx, fixed, extra);
    if (conv) return conv;
  }
  if (ctx === 'after_hurt') {
    if (r.chance(0.5)) return [voiceLine(s, adv, H, hurt, 'ouch', extra)].filter(Boolean);
    const others = al.filter((c) => c !== hurt);
    if (others.length) return [voiceLine(s, adv, H, r.pick(others), 'hurt', extra)].filter(Boolean);
    return [];
  }
  const key = { after_item: 'item', after_win: 'win', after_nothing: 'fail', after_chaos_win: 'win', after_chaos_fail: 'fail' }[ctx];
  return [voiceLine(s, adv, H, r.weighted(al, (c) => 1 / (1 + (s.bt.count[c.id] || 0))), key, extra)].filter(Boolean);
}

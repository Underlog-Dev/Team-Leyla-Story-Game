// Personalities for the Team Leyla crew, plus interests for custom characters.
// A persona is matched by the character's name, so editing someone's look keeps
// their personality. Custom characters get "interests" read from their tags and
// description (pets, baking, gaming, selfies...). Dead characters never speak and
// never get options: everything here checks who is alive.
import { O } from './kit.js';

// lines: by situation. A line can be { t, need: ['bravo'] } when it mentions someone.
// convos: [speaker, text]. Speakers: 'me', another persona key, 'b'/'c' (anyone else), '-' (stage direction).
// options: character decisions. v is always this character.
const N = (t, ...need) => ({ t, need });
const P = (id, ctx, lines, opt = {}) => ({ id, ctx, lines, ...opt });
const X = (id, sits, l, d, o, opt = {}) => ({ id, sits, l, d, o, tag: 'char', ...opt });

export const SIGNS = {
  Aries: 'an Aries, so obviously {n} thinks {they} should be in charge',
  Taurus: 'a Taurus, so {n} is never, ever changing {their} mind',
  Gemini: 'a Gemini... which explains a LOT',
  Leo: 'a Leo, so {n} has already decided {they} are right',
  Libra: 'a Libra, so {n} will fight anything but cannot pick a snack',
  Scorpio: 'a Scorpio, so do NOT cross {n}. Or Kheria',
  Capricorn: 'a Capricorn. Basically a mountain goat. Very fitting for a farmer',
  Aquarius: 'an Aquarius, so {n} is far too famous for any of this',
  Pisces: 'a Pisces, so {n} is sensitive. Except about nails. About nails, {they} are terrifying',
  Cancer: 'a Cancer, so {n} will cry at this later, but in a strong way',
  Virgo: 'a Virgo, so {n} has already spotted everything we did wrong',
  Sagittarius: 'a Sagittarius, so {n} will wander off at some point. Watch {them}',
};

export const PERSONAS = {
  leyla: {
    they: 'she', birthday: '04-18', sign: 'Aries',
    lines: {
      calm: ['"Right. Team meeting. Everyone look at me."', N('"Rule one: we stick together. Rule two: nobody listens to Bravo."', 'bravo'), '"Chat, if you are watching this: I am doing my best."', '"I am the leader. I should have a lanyard. Why do I not have a lanyard?"'],
      tense: ['"Stay calm! I am calm! I am VERY calm!"', N('"EVERYONE BEHIND ME. Not you, Bravo, you are too tall, go to the side."', 'bravo'), '"Okay. What would chat do? RUN. Chat would say run."'],
      win: ['"And THAT is called leadership."', '"See? I DO know what I am doing. Sometimes."'],
      fail: ['"I am not mad. I am disappointed. And also mad."', N('"Whose idea was that? Don\'t answer. It was Bravo."', 'bravo')],
      hurt: ['"{h}! Talk to me! Are you okay?"'],
      ouch: ['"I am FINE. The leader does not get hurt. The leader gets... inconvenienced."'],
      item: [N('"{item}! Put it somewhere Bravo cannot reach it."', 'bravo'), '"{item}. Leader\'s privilege. Kidding. Mostly."'],
    },
    convos: [
      P('ley_please', 'tense', [['me', '"BRAVO, PASS ME THE {weapon}!"'], ['bravo', '"Say please."'], ['me', '"WE ARE LITERALLY ABOUT TO DIE!"'], ['bravo', '"That\'s not please."']], { w: 2 }),
      P('ley_plan', 'calm', [['me', '"Okay, here is the plan..."'], ['bravo', '"Can I say something?"'], ['me', '"No."'], ['bravo', '"It is about the plan."'], ['me', '"Is it helpful?"'], ['bravo', '"...No."']]),
      P('ley_count', 'calm', [['me', '"Headcount. Everyone shout your name."'], ['b', '"{b}!"'], ['bravo', '"Bravo!"'], ['c', '"{c}!"'], ['bravo', '"Bravo again. Just in case."'], ['me', '"Why are you like this."']]),
      P('ley_chat', 'calm', [['me', '"If chat could vote on who gets left behind..."'], ['b', '"Don\'t."'], ['me', '"...it would be Bravo."'], ['bravo', '"Chat LOVES me."']]),
      P('ley_normal', 'calm', [['me', '"Does anyone else just want one normal day?"'], ['b', '"What is a normal day?"'], ['me', '"Exactly. EXACTLY."']]),
      P('ley_stop', 'tense', [['me', '"Bravo, stop!"'], ['-', 'Bravo stops. Completely. Mid-step. In the middle of the danger.'], ['me', '"NOT THERE!"']], { need: ['bravo'] }),
    ],
    options: [
      X('ley_order', ['blocker', 'hazard'], `Leyla gives Bravo a direct order to deal with it`, `What could go wrong?`, [
        O(0.4, 'good', [`Leyla: "Bravo. Deal with it."\nBravo straightens his tie, walks over, and deals with it. Properly. First time.\nLeyla: "...Did that just happen?"\nBravo: "I listen sometimes."`], [['mem', 'clutch', '%bravo', 1], ['funny']]),
        O(0.3, 'neutral', [`Leyla: "Bravo, take care of it!"\nBravo gently tucks the {z} in with a blanket from his jacket and pats its head.\nLeyla: "NOT LIKE THAT!"\nIt takes twenty minutes to sneak round the sleeping {z}.`], [['time', -1], ['funny']]),
        O(0.3, 'danger', [`Leyla: "Bravo! Go left!"\nBravo goes right. Straight into the {z}'s arms. It goes for {r}, because of course it does.`], [['em', 'r']]),
      ], { need: ['bravo'] }),
    ],
  },

  bravo: {
    they: 'he', birthday: '06-10', sign: 'Gemini',
    lines: {
      calm: ['"I have nine lives. I have used seven. Do not ask about the other six."', '"Does this suit make me look like a survivor? It cost a lot of tuna."', '"I am a cat. I land on my feet. Usually on other people\'s feet."', '"Mrow." (Everyone waits. That is all he says.)'],
      tense: ['"Everyone stay calm! I am going to hide in a box!"', '"I would like to formally hiss at this situation."', '"Is now a bad time to say I am scared of water AND zombies?"'],
      win: ['"I would like to thank my suit."', '"You are welcome. I did nothing. But you are welcome."'],
      fail: ['"In my defence, I am a cat."', '"That was not my fault. That was my paws\' fault."'],
      hurt: ['"{h}, do you want me to lick it better? That is how cats do it."'],
      ouch: ['"Not the suit! ANYTHING but the suit!"', '"I have lost a life. That leaves... some."'],
      item: ['"{item}! Can I knock it off a table?"', '"Ooh. Shiny. Mine now."'],
    },
    convos: [
      P('bra_literal', 'calm', [['leyla', '"Bravo, keep an eye on the door."'], ['-', 'Bravo presses his face against the door and stares at it, unblinking.'], ['leyla', '"Not LITERALLY."'], ['me', '"You said keep an eye on..."'], ['leyla', '"I KNOW what I said."']]),
      P('bra_box', 'calm', [['b', '"Where is Bravo?"'], ['-', 'A cardboard box in the corner shuffles slightly.'], ['me', '(from inside the box) "No."'], ['b', '"Bravo, get out of the box."'], ['me', '"I live here now."']]),
      P('bra_laser', 'calm', [['-', 'A little red light dances across the wall.'], ['me', '"...Do not look at me. I am a professional."'], ['-', 'Bravo chases it into a cupboard. The cupboard door clicks shut.']]),
      P('bra_suit', 'calm', [['b', '"Why do you always wear a suit, Bravo?"'], ['me', '"In case of a funeral."'], ['b', '"...Whose?"'], ['me', '"Hopefully not mine."']]),
      P('bra_pull', 'calm', [['me', '"The door is not locked. It says PULL."'], ['-', 'Everyone has been pushing it for five minutes.'], ['leyla', '"...Nobody say ANYTHING."']]),
      P('bra_wire', 'tense', [['chris', '"Bravo, cut the wire! The red one!"'], ['me', '"Which red?"'], ['chris', '"THE ONLY RED ONE!"'], ['me', '"I am a cat, Chris. I see colours differently."']]),
      P('bra_tall', 'calm', [['b', '"Bravo, duck!"'], ['me', '"Where?"'], ['-', 'Bravo walks straight into a low sign. All six feet of him.']]),
    ],
    options: [
      X('bra_handle', ['em'], `Let Bravo handle it. Somehow.`, `Six feet of cat. How bad can it be?`, [
        O(0.5, 'good', [`Bravo pounces. Six feet of cat in a suit lands on it from nowhere. It is over in seconds.\nEveryone stares.\nBravo (straightening his tie): "What? I am a cat."`, `Bravo arches his back, puffs up to roughly twice his size and lets out a hiss so terrifying the {z} actually backs away from {t}.\nBravo: "And STAY away."`], [['hero'], ['mem', 'clutch', 'v', 1], ['funny']]),
        O(0.35, 'hurt', [`Bravo leaps! Bravo misses. Bravo lands in a bin. In the confusion, {t} gets scratched.`], [['hurt', 't', 1], ['mem', 'blunder', 'v', 0], ['funny']]),
        O(0.15, 'death', [`Bravo gets distracted by a moth at the worst possible moment. {t} does not get away.`], [['bite', 't'], ['mem', 'blunder', 'v', 0]]),
      ], { notT: true }),
      X('bra_box', ['blocker', 'hazard'], `Everyone hides in Bravo's cardboard box`, `"If I fits, I sits." There are several of you.`, [
        O(0.4, 'good', [`Somehow, everybody fits in the box. Nobody knows how. The {z} sniffs the box, decides boxes are not food, and leaves.\nBravo (from somewhere at the bottom): "I told you. Boxes are SAFE."`], [['funny'], ['mem', 'clutch', 'v', 1]]),
        O(0.35, 'neutral', [`The box holds three people and one very large cat. Everyone else just crouches next to it, pretending to be boxes too. It takes a long time, but it works.`], [['time', -2], ['funny']]),
        O(0.25, 'danger', [`The box falls apart. Everyone is now standing in a pile of cardboard looking at a {z}. It goes for {r}.`], [['em', 'r'], ['mem', 'blunder', 'v', 0]]),
      ]),
    ],
  },

  chris: {
    they: 'he', birthday: '05-10', sign: 'Taurus',
    lines: {
      calm: ['"I could fix that. I could fix most things. Not you lot, though."', '"I have done the maths. You do not want to know."', '"Give me some tape and ten minutes."'],
      tense: ['"Whoever had this idea, I want names. Later. RUN NOW."', '"This is fine. This is engineering. Panicked engineering."'],
      win: ['"Engineering. You are welcome."', '"Told you it would hold. I was about 60% sure."'],
      fail: ['"Interesting. Terrible, but interesting."', '"I am going to need everyone to stop having ideas."'],
      hurt: ['"{h}, keep it raised. And maybe stop doing whatever you were doing."'],
      ouch: ['"Ow. That is going in the incident report."'],
      item: ['"{item}. I can work with that."', '"{item}? Give me five minutes and it will be twice as useful."'],
    },
    convos: [
      P('chr_cod', 'tense', [['gaza', '"Don\'t worry, I\'ve done this hundreds of times."'], ['me', '"On Call of Duty."'], ['gaza', '"Experience is experience."'], ['toddy', '"He\'s convinced me."'], ['me', '"Of course he has."']], { w: 2 }),
      P('chr_cod2', 'tense', [['gaza', '"Trust me. I have done this a thousand times."'], ['me', '"On your PHONE."'], ['gaza', '"With headphones in. Very immersive."']]),
      P('chr_fix', 'calm', [['b', '"Chris, can you fix my phone?"'], ['me', '"There is no signal. There is no internet. There is no society."'], ['b', '"So... is that a yes?"']]),
      P('chr_decide', 'calm', [['b', '"What do you think we should do, Chris?"'], ['me', '"Honestly? The opposite of whatever we did last time."']]),
    ],
    options: [
      X('chr_build', ['hazard', 'blocker', 'search'], `Ask Chris to build a makeshift device`, `He has tape, a battery and a worrying look in his eye. (A whole scene.)`, [
        O(1, 'neutral', [`Chris rolls up his sleeves and empties his pockets: tape, wire, a battery and something that might be a spoon.\nChris: "Right. What are we building?"`], [['nextcx', 'build']]),
      ], { hideRisk: true }),
    ],
  },

  hyrisha: {
    they: 'she', birthday: '05-30', sign: 'Gemini',
    lines: {
      calm: ['"Is everyone okay? Has everyone eaten? Does anyone need a hug?"', '"I can run ahead and check! Back in two seconds!"', '"You are all doing amazing. I mean it!"'],
      tense: ['"I\'ll draw them away! Don\'t worry, I\'m fast!"', '"Everyone hold hands! Okay not literally, RUN!"'],
      win: ['"Yay! Group hug! A quick one!"', '"See? We\'ve totally got this!"'],
      fail: ['"It\'s okay! Nobody panic! I\'m panicking a tiny bit but it\'s fine!"'],
      hurt: ['"Oh no, {h}! Come here, I\'ve got you."'],
      ouch: ['"Ow! I\'m okay! ...Is my hair okay?"'],
      item: ['"{item}! Who needs it most? You have it."'],
    },
    convos: [
      P('hyr_hair', 'calm', [['b', '"Hyrisha, how is your hair still PERFECT?"'], ['me', '"What do you mean?"'], ['-', 'Behind her, something is on fire. Her hair does not move.'], ['b', '"We have been running for HOURS."'], ['me', '"Conditioner!"']]),
      P('hyr_salon', 'calm', [['-', 'Everyone is covered in mud, dust and something worse. Hyrisha looks like she has just left a salon.'], ['sonila', '"I need your hairdresser\'s number."'], ['me', '"Hehe, I don\'t have one!"'], ['sonila', '"Liar."']]),
      P('hyr_race', 'calm', [['toddy', '"Race you to that lamp post."'], ['me', '"Okay!"'], ['-', 'Hyrisha is already there.'], ['toddy', '"I didn\'t say GO!"'], ['me', '"Sorry! I got excited!"']]),
      P('hyr_snack', 'calm', [['me', '"{b}, you look tired. Do you want my last snack?"'], ['b', '"Are you sure?"'], ['me', '"I\'m sure! ...Can I have a tiny bit back?"']]),
    ],
    options: [
      X('hyr_outrun', ['em', 'blocker'], `Let Hyrisha outrun it`, `She is very fast. Her hair is even faster.`, [
        O(0.6, 'good', [`Hyrisha waves both arms.\nHyrisha: "Over here! Yoo-hoo!"\nShe takes off like a rocket. It chases her round three streets and loses her completely. She jogs back, barely out of breath.\nHer hair is perfect.`], [['hero'], ['mem', 'clutch', 'v', 1], ['time', 1]]),
        O(0.3, 'hurt', [`Hyrisha is fast. Unfortunately, so is the {z}. She gets away, but not without a nasty scrape.\nHyrisha: "I'm fine! Is my hair fine?"`], [['hurt', 'v', 1]]),
        O(0.1, 'danger', [`Hyrisha runs one way. The {z} goes the OTHER way. Straight at {r}.`], [['em', 'r']]),
      ], { notT: true }),
    ],
  },

  hiwi: {
    they: 'she', birthday: '02-18', sign: 'Aquarius',
    lines: {
      calm: ['"Hold on. The lighting in here is actually incredible."', '"If anyone asks, I was always this brave. Put it in my documentary."', '"Okay, smile! No? Fine. Candid shot."'],
      tense: ['"Nobody move! Okay, one photo, THEN everybody move."', '"Can someone hold my phone while I save your life?"'],
      win: ['"That is going on my story."', '"Ugh, I wish I had filmed that."'],
      fail: ['"Deleting that. From my memory AND my camera roll."'],
      hurt: ['"{h}, sit still. I\'m a medic. And do not post this."', '"{h}, let me see. Hmm. Not good. Not bad. Medium."'],
      ouch: ['"Do not film me right now. I mean it."'],
      item: ['"{item}! Hold it up, let me get a shot for the fans."'],
    },
    convos: [
      P('hiw_selfie', 'tense', [['me', '"Wait! Everyone get in!"'], ['b', '"HIWI, THERE IS A {Z} RIGHT THERE."'], ['me', '"Exactly. It\'s in the background. Content."'], ['-', '*click*']]),
      P('hiw_fans', 'calm', [['b', '"Do you think your fans are still out there?"'], ['me', '"My fans are everywhere."'], ['-', 'A {z} groans in the distance.'], ['me', '"See? He loves me."']]),
      P('hiw_doc', 'calm', [['me', '"Who needs patching up?"'], ['b', '"I have a scratch."'], ['me', '"Show me. ...That is nothing. I\'ll still do it properly. I have a reputation."']]),
      P('hiw_bravo', 'calm', [['me', '"Bravo, can you smile for once?"'], ['bravo', '"I am a cat. This IS my smile."'], ['-', 'It is not.']]),
      P('hiw_gaza', 'calm', [['me', '"Gaza, can I film you being cool?"'], ['gaza', '"I\'m always cool."'], ['-', 'Gaza trips over a kerb.'], ['me', '"...Got it."']]),
    ],
    options: [
      X('hiw_selfie', ['blocker', 'hazard', 'search', 'people'], `Hiwi takes a group selfie. Right now.`, `At a dangerously inappropriate moment. (A whole scene.)`, [
        O(1, 'neutral', [`Hiwi: "Everybody squeeze in! This is going to be iconic."\nNobody wants to. Everybody does.`], [['nextcx', 'photo']]),
      ], { hideRisk: true, tag: 'chaos' }),
    ],
  },

  dardan: {
    they: 'he', birthday: '01-04', sign: 'Capricorn',
    lines: {
      calm: ['"Back on the farm, we had a goat that was scarier than this."', '"Lovely bit of soil, that. Shame about the bodies."', '"The birds have gone quiet. Birds know things."'],
      tense: ['"Easy. Easy. Just like a bull having a bad day."', '"Treat it like a fox in the henhouse. Calm, quick, no nonsense."'],
      win: ['"Sorted. Same as a stuck sheep, really."'],
      fail: ['"Hm. That is a lambing-season sort of mess."'],
      hurt: ['"{h}, I\'ve stitched up a cow before. Hold still."'],
      ouch: ['"Had worse from a goose."'],
      item: ['"{item}. Better than a spade. Worse than a good dog."'],
    },
    convos: [
      P('dar_shoo', 'tense', [['me', '(walking calmly towards the {z}) "Hup hup hup. Go on. Get away with you."'], ['-', 'The {z} pauses, deeply confused.'], ['b', '"Dardan, that is NOT a sheep!"'], ['me', '"Works on sheep. Works on most things."']]),
      P('dar_rain', 'calm', [['me', '"Rain\'s coming. Twenty minutes."'], ['b', '"How do you know?"'], ['me', '"Cows lie down."'], ['b', '"There are no cows here."'], ['me', '"...I can just tell."']]),
      P('dar_kheria', 'calm', [['hatice', '"Dardan, do you think Kheria would like a farm?"'], ['me', '"Every cat likes a farm. Mice everywhere."'], ['hatice', '"She\'s scared of mice."'], ['me', '"...She can be the farm\'s emotional support."']]),
      P('dar_tractor', 'calm', [['gaza', '"If we had a drone, this would be so easy."'], ['me', '"If we had a tractor, this would be so easy."'], ['-', 'They stare at each other, both completely right.']]),
    ],
    options: [
      X('dar_tame', ['blocker', 'em'], `Let Dardan handle it like livestock`, `"It's just a big confused sheep, really."`, [
        O(0.35, 'good', [`Dardan walks up slowly, arms wide, making a low clicking noise.\nDardan: "Come on. Come on then. Good lad."\nThe {z} follows him. Like a sheep. Into a shed. He bolts the door.\nDardan: "Same as Tuesdays."`], [['hero'], ['mem', 'clutch', 'v', 1], ['funny']]),
        O(0.4, 'hurt', [`Dardan tries to herd it. It does not herd. It bites, like an angry goat, and Dardan gets the worst of it.\nDardan: "Had worse from a goose. Not much worse."`], [['hurt', 'v', 1], ['mem', 'blunder', 'v', 0]]),
        O(0.25, 'danger', [`Dardan whistles for it like a sheepdog. Every {z} in the area hears the whistle. They come for {r}.`], [['em', 'r'], ['mem', 'blunder', 'v', 0]]),
      ]),
    ],
  },

  sonila: {
    they: 'she', birthday: '03-03', sign: 'Pisces',
    lines: {
      calm: ['"I have broken a nail. Nobody speak to me for five minutes."', '"I scouted ahead. Good news: nothing. Bad news: also nothing. Including food."', '"Oh great, more walking. My favourite."'],
      tense: ['"Oh, perfect. Exactly what my nails needed."', '"Everyone keep screaming. I\'m sure it\'s helping."'],
      win: ['"Wow. We did something right. Somebody frame it."'],
      fail: ['"Incredible. Ten out of ten. Would panic again."'],
      hurt: ['"{h}, I fix cuticles, not legs. But I\'ll give it a go."'],
      ouch: ['"That is coming out of my nail fund."'],
      item: ['"{item}. Love that for us."'],
    },
    convos: [
      P('son_nails', 'tense', [['b', '"Sonila, help me pry this open!"'], ['me', '"With WHAT?"'], ['b', '"Your nails!"'], ['me', '"Do you know how long these took?"'], ['-', 'She does it anyway. It works. She will not stop talking about it for an hour.']]),
      P('son_dignity', 'tense', [['b', '"WE\'RE GOING TO DIE!"'], ['c', '"WE\'RE ALL GOING TO DIE!"'], ['me', '"Okay, but quieter, so we die with dignity."']]),
      P('son_claws', 'calm', [['bravo', '"Sonila, can you do my claws?"'], ['me', '"I do NAILS, Bravo."'], ['bravo', '"They are basically nails."'], ['me', '"...Sit. Ten minutes. Do not move."']]),
      P('son_review', 'calm', [['b', '"How\'s the route ahead, Sonila?"'], ['me', '"Lovely. Scenic. Only slightly full of the undead."']]),
    ],
    options: [
      X('son_sass', ['blocker', 'people'], `Let Sonila distract it with sarcastic conversation`, `She could bore anything to death. Including the dead.`, [
        O(0.45, 'good', [`Sonila: "Oh, wow. Love the look. Very 'just crawled out of a skip'. Is that the blood trend everyone's doing?"\nThe {z} stops. It looks down at itself. It looks almost... hurt.\nIt shuffles away to think about its choices.\nSonila: "You're welcome."`], [['mem', 'clutch', 'v', 1], ['funny']]),
        O(0.3, 'neutral', [`Sonila talks at it for ten minutes. The {z} does not understand sarcasm. It just sways. Eventually everyone gets bored and goes round.\nSonila: "Tough crowd."`], [['time', -1], ['funny']]),
        O(0.25, 'danger', [`Sonila: "Nice teeth. Ever heard of a dentist?"\nIt has not heard of a dentist. It does, however, want to show {r} its teeth.`], [['em', 'r'], ['mem', 'blunder', 'v', 0]]),
      ]),
      X('son_file', ['search', 'hazard'], `Sonila picks the lock with a nail file`, `"These are professional tools, actually."`, [
        O(0.55, 'item', [`Sonila crouches, tongue out, nail file in the lock. Click.\nSonila: "Twelve years of acrylics. Finally useful."\nInside: {loot}.`], [['loot'], ['mem', 'clutch', 'v', 1]]),
        O(0.3, 'neutral', [`The nail file snaps.\nSonila: "That was my GOOD file."\nShe does not speak for several minutes. Nobody dares to.`], [['time', -1], ['funny']]),
        O(0.15, 'hurt', [`The file slips. Sonila cuts her finger and, worse, chips a nail.\nSonila: "The finger is fine. The NAIL is a tragedy."`], [['hurt', 'v', 1]]),
      ]),
    ],
  },

  isma: {
    they: 'she', birthday: '08-18', sign: 'Leo',
    lines: {
      calm: ['"I don\'t trust that bin."', '"If anyone new tries to join us, I say no. Just in case."', '"I would die for this group. Not for strangers, though."'],
      tense: ['"Block it! Somebody BLOCK it!"', '"I KNEW we shouldn\'t have trusted that corner."'],
      win: ['"Good. Now nobody tell any strangers how we did it."'],
      fail: ['"This is what happens when we talk to people."'],
      hurt: ['"{h}! Who did this? Give me a name. I\'ll block them."'],
      ouch: ['"I\'m fine. Don\'t tell anyone outside the group."'],
      item: ['"{item}. Hide it. Strangers will want it."'],
    },
    convos: [
      P('ism_block', 'people', [['me', '"Block them."'], ['leyla', '"Isma, this is real life."'], ['me', '"Fine. I\'ll block them physically."'], ['-', 'Isma stands in the way, arms folded.']], { w: 2 }),
      P('ism_dont', 'people', [['me', '"I don\'t like them."'], ['b', '"You haven\'t even met them."'], ['me', '"I don\'t need to."']]),
      P('ism_bday', 'calm', [['me', '"Happy birthday, Chris!"'], ['chris', '"It is not my birthday."'], ['me', '"Happy birthday anyway."'], ['chris', '"My birthday is in MAY, Isma."'], ['me', '"And yet."']], { w: 1.5 }),
      P('ism_bday2', 'calm', [['me', '"Everyone, sing happy birthday to Chris."'], ['chris', '"Isma, PLEASE."'], ['-', 'Everyone sings. Quietly. Chris dies a little inside.']]),
      P('ism_bday3', 'after_win', [['me', '"That was Chris\'s birthday present."'], ['chris', '"IT IS NOT MY BIRTHDAY."']]),
      P('ism_threat', 'calm', [['me', '"If anyone hurts any of you, I will find them."'], ['b', '"Aww, that\'s sweet."'], ['me', '"It is not sweet. It is a threat. To them."']]),
      P('ism_ikram', 'calm', [['me', '"I don\'t trust Ikram."'], ['ikram', '"Good instinct."'], ['me', '"...Now I trust you even less."']]),
    ],
    options: [
      X('ism_block', ['blocker', 'people'], `Let Isma block it`, `Arms folded. Total commitment.`, [
        O(0.4, 'good', [`Isma plants herself in the way, arms folded, and gives it the coldest stare in history.\nIsma: "No."\nThe {z} stops. Thinks about it. And turns round.\nIsma: "Blocked."`], [['mem', 'clutch', 'v', 1], ['funny']]),
        O(0.2, 'neutral', [`Isma: "You are blocked."\nThe {z} does not know what that means. Isma explains it. For a long time. Everyone else sneaks round while it is confused.`], [['time', -1], ['funny']]),
        O(0.4, 'danger', [`Isma: "Blocked. Reported. Goodbye."\nIt turns out you cannot block a {z} in real life. It goes for Isma.`], [['em', 'v'], ['mem', 'blunder', 'v', 0]]),
      ]),
    ],
  },

  doa: {
    they: 'she', birthday: null, sign: null,
    lines: {
      calm: ['"This would be so much better with a cup of tea and a lemon drizzle."', '"I can fix that! Has anyone got a spoon? And a hair grip? And flour?"', '"You know what this situation needs? Cupcakes."'],
      tense: ['"I did NOT practise my sourdough for years to die like this!"', '"Stay calm! Think of a nice Victoria sponge!"'],
      win: ['"Yay! That deserves a cake. I\'ll make one when ovens exist again."'],
      fail: ['"That went flatter than my first soufflé."'],
      hurt: ['"Oh, {h}! When we get out of here, I\'m baking you a get-well cake."'],
      ouch: ['"Ow! I\'m fine! I\'m a sponge cake. I bounce back."'],
      item: ['"{item}! Can I bake with it? No? Can I fix something with it? YES."'],
    },
    convos: [
      P('doa_oven', 'tense', [['me', '"This is just like the time the oven caught fire!"'], ['b', '"How is this LIKE that?!"'], ['me', '"Everyone screaming, nobody listening, and someone was eating the raw dough."'], ['-', 'Everyone looks at Bravo.']], { need: ['bravo'] }),
      P('doa_flour', 'calm', [['me', '"Honestly, I think most problems can be solved with flour."'], ['chris', '"Name one."'], ['me', '"That {z}. If I threw enough flour at it."'], ['chris', '"That\'s not..."'], ['me', '"It would be VERY confused."']]),
      P('doa_cake', 'calm', [['b', '"Doa, what would you bake right now if you could?"'], ['me', '"A three-tier chocolate cake. With a little sugar {z} on top."'], ['b', '"...That\'s dark."'], ['me', '"It\'s FESTIVE."']]),
      P('doa_fix', 'calm', [['me', '"Pass me that!"'], ['b', '"Why?"'], ['-', 'Doa fixes the broken torch with a hair grip and a teaspoon in about twenty seconds.'], ['me', '"Baking teaches you patience. And violence."']]),
    ],
    options: [
      X('doa_bake', ['hazard', 'blocker', 'search', 'people'], `Ask Doa to solve it with her baking knowledge`, `This has nothing to do with baking. (A whole scene.)`, [
        O(1, 'neutral', [`Doa: "Okay. OKAY. I've got this. It's basically a recipe."\nIt is not a recipe. Doa starts rummaging for ingredients anyway.`], [['nextcx', 'bake']]),
      ], { hideRisk: true, tag: 'chaos' }),
    ],
  },

  toddy: {
    they: 'he', birthday: null, sign: null,
    lines: {
      calm: ['"I have a plan. It\'s risky. I love it."', '"Lost the hat once. Never again."', '"What if we just... sprinted? Everywhere? Forever?"'],
      tense: ['"I can jump that! Probably! Watch!"', '"Leave it to me!" (Nobody should leave it to him.)'],
      win: ['"TOLD YOU. Hat stays on, plan stays on."'],
      fail: ['"Okay, that was plan B. I didn\'t HAVE a plan B."'],
      hurt: ['"{h}, walk it off! That\'s what I do. That\'s why I limp."'],
      ouch: ['"I\'m fine! The hat\'s fine! That\'s all that matters!"'],
      item: ['"{item}! Can I throw it? I\'m going to throw it."'],
    },
    convos: [
      P('tod_plan', 'calm', [['me', '"Right, I\'ve got a plan."'], ['b', '"Oh no."'], ['me', '"Step one: we get on the roof."'], ['b', '"How?"'], ['me', '"Step two: we\'re on the roof."']]),
      P('tod_hat', 'tense', [['b', '"Toddy, your hat!"'], ['-', 'Toddy dives straight back into danger to grab his bucket hat.'], ['me', '"GOT IT!"'], ['b', '"Was that WORTH it?!"'], ['me', '"Every time."']]),
      P('tod_lived', 'calm', [['me', '"How hard can it be?"'], ['b', '"You said that last time."'], ['me', '"And I lived."'], ['b', '"BARELY!"'], ['me', '"Living is living."']]),
      P('tod_loni', 'tense', [['loni', '"Let\'s fight it!"'], ['me', '"Let\'s fight it!"'], ['b', '"STOP AGREEING WITH EACH OTHER!"']]),
    ],
    options: [
      X('tod_plan', ['hazard', 'blocker', 'travel'], `Let Toddy test his own escape plan`, `He has absolute confidence in it. That is the scary part. (A whole scene.)`, [
        O(1, 'neutral', [`Toddy adjusts his bucket hat.\nToddy: "Right. Listen up. This is going to be the best plan you have ever heard."\nIt is not going to be.`], [['nextcx', 'toddy']]),
      ], { hideRisk: true, tag: 'chaos' }),
    ],
  },

  hatice: {
    they: 'she', birthday: '11-18', sign: 'Scorpio',
    lines: {
      calm: ['"Kheria, are you okay in there? Mummy\'s here."', '"Look at that little bird. Kheria, do NOT look at that little bird."', '"Everyone keep your voices down. Kheria is sleeping."'],
      tense: ['"Someone hold Kheria! No wait, I\'LL hold Kheria! Everyone else, PANIC."', '"If anything happens to Kheria, I will end this apocalypse myself."'],
      win: ['"Kheria, did you see that? We did it! ...She is not impressed."'],
      fail: ['"Oh no. Is Kheria okay? Kheria is okay. Okay. NOW I panic."'],
      hurt: ['"{h}, sweetheart, sit down. Kheria, give them some space."'],
      ouch: ['"Ow! Kheria, don\'t look, Mummy is fine."'],
      item: ['"{item}! Kheria, look! ...She doesn\'t care. Fair."'],
    },
    convos: [
      P('hat_priority', 'tense', [['b', '"Hatice, there\'s a {z} behind you!"'], ['me', '"Is Kheria okay?"'], ['b', '"THERE IS A {Z}..."'], ['me', '"IS. KHERIA. OKAY."'], ['b', '"...Yes."'], ['me', '"Then I can deal with the {z}."']]),
      P('hat_hiss', 'calm', [['-', 'Kheria hisses at Bravo.'], ['bravo', '"Rude."'], ['me', '"She doesn\'t like other cats."'], ['bravo', '"I am not a cat. I am a gentleman."'], ['-', 'Kheria hisses again.']]),
      P('hat_food', 'calm', [['me', '"Does anyone have food for Kheria?"'], ['b', '"We don\'t have food for US."'], ['me', '"So that\'s a no for Kheria?"'], ['b', '"...I have half a biscuit."'], ['-', 'Kheria gets the biscuit.']]),
      P('hat_flowers', 'calm', [['me', '"Oh! Look at these little flowers. Even now."'], ['b', '"Hatice, we need to MOVE."'], ['me', '"Ten seconds. They deserve ten seconds."']]),
    ],
    options: [
      X('hat_kheria', ['search', 'hazard'], `Ask Hatice whether Kheria can fit through the gap`, `She is very small and very judgemental.`, [
        O(0.45, 'item', [`Hatice: "Go on, baby. Find something good."\nKheria slinks through the gap. A long pause. She comes back dragging {loot}, drops it at Hatice's feet and walks off.\nHatice: "THAT'S MY GIRL."`], [['loot'], ['mem', 'clutch', 'v', 1]]),
        O(0.35, 'neutral', [`Kheria looks at the gap. Kheria looks at Hatice. Kheria sits down and washes her paw.\nHatice: "She says no."`], [['time', -1], ['funny']]),
        O(0.2, 'hurt', [`Kheria goes in, gets spooked by something, and comes out of the gap like a rocket, straight up Hatice's arm.\nHatice: "It's fine! It's fine! She didn't mean it!"`], [['hurt', 'v', 1]]),
      ]),
    ],
  },

  gaza: {
    they: 'he', birthday: null, sign: null,
    lines: {
      calm: ['"In CoD, this is the bit right before the ambush. Just saying."', '"Check your corners. CHECK YOUR CORNERS."', '"I need a loadout. Any loadout."'],
      tense: ['"Enemy spotted! Twelve o\'clock! Well, eleven-ish!"', '"I\'m going in! Cover me!" (There is no cover.)'],
      win: ['"Clean. Like a ranked match."', '"Squad wipe. Easy."'],
      fail: ['"Lag. That was lag."', '"Respawn in five... oh. No. Okay."'],
      hurt: ['"{h}, you\'re down! I\'ll revive you! ...How do you revive in real life?"'],
      ouch: ['"I\'m hit! Where\'s the health regen?!"'],
      item: ['"{item}. Not a sniper. But I\'ll take it."'],
    },
    convos: [
      P('gaz_respawn', 'tense', [['me', '"I\'ll draw them off. I\'ll just respawn."'], ['b', '"GAZA. THERE ARE NO RESPAWNS."'], ['-', 'Gaza stops. Thinks. Slowly walks back.'], ['me', '"...Good shout."']]),
      P('gaz_roof', 'tense', [['me', '"Two on the left, one on the roof!"'], ['b', '"There\'s nobody on the roof."'], ['me', '"There\'s ALWAYS one on the roof."']]),
      P('gaz_squad', 'calm', [['me', '"If this was a squad: Leyla is the leader, Chris is the engineer, and Bravo is..."'], ['leyla', '"The liability."'], ['bravo', '"The mascot."'], ['me', '"...The liability mascot."']], { need: ['chris'] }),
      P('gaz_quiet', 'calm', [['b', '"Gaza, you\'ve been quiet."'], ['me', '"I\'m listening for footsteps. Headphones on in real life."'], ['b', '"You don\'t have headphones."'], ['me', '"Mentally, I do."']]),
    ],
    options: [
      X('gaz_lead', ['blocker', 'hazard'], `Let Gaza lead the attack using his Call of Duty experience`, `Thousands of hours of gameplay. Zero hours of real life. (A whole scene.)`, [
        O(1, 'neutral', [`Gaza crouches, holds up a fist like it means something, and looks back at everyone.\nGaza: "Okay squad. Follow my callouts."\nNobody knows what the fist means.`], [['nextcx', 'cod']]),
      ], { hideRisk: true }),
    ],
  },

  loni: {
    they: 'he', birthday: '10-15', sign: 'Libra',
    lines: {
      calm: ['"Is anyone going to fight something? No? Boring."', '"My hair\'s flat. That means it\'s too quiet."', '"I volunteer. For what? Doesn\'t matter."'],
      tense: ['(his hair shoots straight up) "FINALLY."', '"LET\'S GO! WHO\'S FIRST?!"'],
      win: ['"That\'s right! Who\'s NEXT?!"'],
      fail: ['"Okay. That one fought back."'],
      hurt: ['"{h}! Who did that? Point. Just point."'],
      ouch: ['"Ha! That tickled! That REALLY hurt!"'],
      item: ['"{item}. Can I hit things with it?"'],
    },
    convos: [
      P('lon_me', 'calm', [['b', '"Okay, we need someone to..."'], ['me', '"ME."'], ['b', '"You don\'t know what it is yet."'], ['me', '"Still me."'], ['b', '"...It\'s carrying the bags."'], ['me', '"...Still me, I guess."']]),
      P('lon_hair', 'tense', [['-', 'Loni\'s hair shoots straight up, crackling.'], ['b', '"Oh no. The hair\'s up."'], ['c', '"Everyone stand back. THE HAIR IS UP."']]),
      P('lon_gone', 'calm', [['b', '"So the plan is, first we..."'], ['-', 'Loni has already gone.'], ['b', '"...first we lose Loni, apparently."']]),
    ],
    options: [
      X('lon_charge', ['blocker', 'em', 'hazard'], `Let Loni charge in before anyone finishes explaining the plan`, `"So the plan is..." "GOING!"`, [
        O(0.45, 'good', [`Leyla: "Okay, the plan is, we wait for..."\nLoni's hair shoots straight up and he is gone, roaring.\nIt is chaos. It is loud. It somehow works.\nLoni (breathing hard): "What was the plan?"`], [['hero'], ['mem', 'clutch', 'v', 1]]),
        O(0.35, 'hurt', [`Loni charges in, hair crackling, before anyone can stop him. He wins. He also gets hurt winning.\nLoni: "Worth it."`], [['hurt', 'v', 1]]),
        O(0.2, 'danger', [`Loni charges the wrong way, straight past it. It turns and goes for {r} instead.\nLoni: "...Was it left? It was left, wasn't it."`], [['em', 'r'], ['mem', 'blunder', 'v', 0]]),
      ], { notT: true }),
    ],
  },

  ikram: {
    they: 'he', birthday: null, sign: null,
    lines: {
      calm: ['"This place used to be different." (Nobody asks how he knows.)', '"I have been here before. A long time ago. Or tomorrow."', '(Ikram is standing behind everyone. Nobody saw him arrive.)'],
      tense: ['"Left in three. Two..."', '"Do not touch the blue door." (There is no blue door. Yet.)'],
      win: ['(Ikram nods once. That is all.)', '"As expected."'],
      fail: ['"Hm. That was not supposed to happen. This time."'],
      hurt: ['"{h}. Chew this." (He hands over a leaf. Nobody knows what it is. It helps.)'],
      ouch: ['(Ikram does not react at all. Is he even bleeding? It is hard to tell.)'],
      item: ['"{item}. I left that there."'],
    },
    convos: [
      P('ikr_where', 'calm', [['b', '"Ikram, where are you actually from?"'], ['me', '"Around."'], ['b', '"Around where?"'], ['me', '"Around."']]),
      P('ikr_torch', 'calm', [['b', '"I would kill for a torch right now."'], ['-', 'Ikram hands over a torch. Nobody saw where it came from.'], ['b', '"...Thank you?"'], ['me', '"Do not ask."']]),
      P('ikr_knew', 'calm', [['b', '"How did you know that would work?"'], ['me', '"Lucky guess."'], ['b', '"You didn\'t guess. You KNEW."'], ['me', '"...Lucky knowing."']]),
      P('ikr_sign', 'calm', [['b', '"Ikram, when\'s your birthday?"'], ['me', '"Which one?"']]),
    ],
    options: [
      X('ikr_code', ['search'], `Ask Ikram how he knows the combination to the lock`, `He has not even looked at it yet.`, [
        O(0.7, 'item', [`Ikram walks up to the lock without looking and types four numbers.\nClick.\nInside: {loot}.\n{r}: "How did you KNOW that?"\nIkram: "Lucky."`], [['loot'], ['mem', 'clutch', 'v', 1]]),
        O(0.2, 'neutral', [`Ikram stares at the lock for a long time.\nIkram: "Not this one."\nHe will not explain what that means.`], [['time', -1], ['funny']]),
        O(0.1, 'danger', [`Ikram opens it instantly. Inside is something that should NOT have been let out. It goes for {r}.\nIkram: "Ah. That one."`], [['em', 'r']]),
      ]),
      X('ikr_route', ['travel'], `Follow Ikram's "shortcut"`, `He will not say how he knows it. (Random route.)`, [
        O(0.6, 'good', [`Ikram leads everyone through a gap in a fence, down an alley that is not on any map, and out the other side.\n{r}: "How do you know these places?"\nIkram: "I just do."`], [['moveRandom'], ['time', 2], ['mem', 'clutch', 'v', 1]]),
        O(0.25, 'neutral', [`The shortcut is long. Very long. Ikram does not seem bothered.\nIkram: "It used to be shorter."`], [['moveRandom'], ['time', -1], ['funny']]),
        O(0.15, 'danger', [`Ikram stops dead.\nIkram: "...This was not here last time."\nSomething comes for {r}.`], [['moveRandom'], ['em', 'r']]),
      ]),
    ],
  },
};

// ---------------- custom characters: interests read from tags and description ----------------
const PACKS = [
  { id: 'pet', match: /\b(cat|kitten|dog|puppy|hamster|rabbit|bunny|parrot|pet)\b/i, lines: { calm: ['"{pet} is fine. {pet} is always fine. Is {pet} fine?"', '"Everyone keep it down. {pet} is sleeping."'], tense: ['"Somebody protect {pet}! People second!"'] },
    options: [X('pk_pet', ['search', 'hazard'], `Send {v}'s {pettype} {pet} through the gap`, `Small, fast and only slightly cooperative.`, [O(0.45, 'item', [`{pet} squeezes through and comes back with {loot}.\n{v}: "THAT'S MY BABY."`], [['loot']]), O(0.35, 'neutral', [`{pet} sits down and refuses.\n{v}: "She's on strike."`], [['time', -1], ['funny']]), O(0.2, 'hurt', [`{pet} panics and climbs {v} like a tree.`], [['hurt', 'v', 1]])])] },
  { id: 'bake', match: /\b(bak\w*|cook\w*|chef|cake|food|foodie|kitchen)\b/i, lines: { calm: ['"This place needs a good stew. And a fire. And a kitchen."', '"I could make something amazing with three ingredients and a bin lid."'], tense: ['"I am too good a cook to die like this!"'] },
    options: [X('pk_bake', ['hazard', 'blocker', 'people'], `Ask {v} to solve it with cooking knowledge`, `It has nothing to do with cooking. (A whole scene.)`, [O(1, 'neutral', [`{v}: "Right. It's basically a recipe."\nIt is not a recipe.`], [['nextcx', 'bake']])], { hideRisk: true, tag: 'chaos' })] },
  { id: 'game', match: /\b(gam\w*|xbox|playstation|fortnite|call of duty|cod|console|fifa|minecraft)\b/i, lines: { calm: ['"This is basically a side quest."', '"Check your corners. Trust me."'], tense: ['"No respawns! NO RESPAWNS!"'] },
    options: [X('pk_game', ['blocker', 'hazard'], `Let {v} lead using their gaming experience`, `Hours and hours of practice. On a screen. (A whole scene.)`, [O(1, 'neutral', [`{v}: "Okay squad, follow my callouts."`], [['nextcx', 'cod']])], { hideRisk: true })] },
  { id: 'selfie', match: /\b(selfie|photo\w*|camera|influencer|famous|celebrity|tiktok|instagram|streamer|youtube\w*)\b/i, lines: { calm: ['"Hold on, the lighting is perfect."'], tense: ['"One photo! ONE!"'] },
    options: [X('pk_selfie', ['blocker', 'hazard', 'people'], `{v} takes a group selfie. Right now.`, `At the worst possible moment. (A whole scene.)`, [O(1, 'neutral', [`{v}: "Everybody squeeze in!"`], [['nextcx', 'photo']])], { hideRisk: true, tag: 'chaos' })] },
  { id: 'farm', match: /\b(farm\w*|animal\w*|horse|sheep|cow|outdoor\w*|garden\w*|nature)\b/i, lines: { calm: ['"The birds have gone quiet. Birds know things."'], tense: ['"Easy... treat it like a scared animal."'] },
    options: [X('pk_farm', ['blocker'], `Let {v} handle it like an animal`, `"It's just a big confused cow, really."`, [O(0.35, 'good', [`{v} walks up slowly, making soft clicking noises. The {z} follows {v} into a shed like a lost sheep. Bolt. Done.`], [['hero']]), O(0.4, 'hurt', [`It does not respond to clicking noises. It responds with teeth.`], [['hurt', 'v', 1]]), O(0.25, 'danger', [`{v} whistles. Every {z} nearby hears the whistle. They come for {r}.`], [['em', 'r']])])] },
  { id: 'beauty', match: /\b(nail\w*|makeup|make-up|hair\w*|fashion|beauty|lash\w*|salon)\b/i, lines: { calm: ['"I have broken a nail. This is the real tragedy."'], tense: ['"Not the outfit! Anything but the outfit!"'] },
    options: [X('pk_sass', ['blocker', 'people'], `Let {v} roast it until it leaves`, `A full fashion critique.`, [O(0.45, 'good', [`{v}: "Babe. The rags? The smell? The DRAGGING foot?"\nIt looks down at itself, ashamed, and shuffles away.`], [['funny']]), O(0.3, 'neutral', [`The {z} does not understand fashion. Everyone goes round.`], [['time', -1]]), O(0.25, 'danger', [`It takes the critique personally. It goes for {r}.`], [['em', 'r']])])] },
  { id: 'sport', match: /\b(sport\w*|football\w*|gym|runn\w*|athlet\w*|fast|boxing|boxer|rugby|basketball)\b/i, lines: { calm: ['"I could do this all day. Well, half a day."'], tense: ['"Leave this to my legs!"'] },
    options: [X('pk_run', ['em', 'blocker'], `Let {v} outrun it`, `Proper athlete. Hopefully.`, [O(0.6, 'good', [`{v} takes off. It chases {v} round the block and loses. Easy.`], [['hero']]), O(0.3, 'hurt', [`{v} is fast. Not fast enough to avoid a nasty fall.`], [['hurt', 'v', 1]]), O(0.1, 'danger', [`It ignores {v} completely and goes for {r}.`], [['em', 'r']])], { notT: true })] },
  { id: 'fix', match: /\b(fix\w*|build\w*|engineer\w*|mechanic|tech\w*|repair\w*|wires?|tools?)\b/i, lines: { calm: ['"Give me tape and ten minutes."'], tense: ['"Hold on, I can rig something!"'] },
    options: [X('pk_build', ['hazard', 'blocker', 'search'], `Ask {v} to build a makeshift device`, `Tape, wire and confidence. (A whole scene.)`, [O(1, 'neutral', [`{v} empties their pockets: tape, wire and a battery.\n{v}: "Right. What are we building?"`], [['nextcx', 'build']])], { hideRisk: true })] },
  { id: 'mystery', match: /\b(myster\w*|secret\w*|nobody knows|unknown|strange|shadow\w*)\b/i, lines: { calm: ['"I have been here before." (Nobody asks.)'], tense: ['"Left. Now. Do not ask."'] },
    options: [X('pk_know', ['search'], `Ask {v} how they know the code`, `They have not looked at it yet.`, [O(0.7, 'item', [`{v} types four numbers without looking. Click. Inside: {loot}.\n{v}: "Lucky."`], [['loot']]), O(0.2, 'neutral', [`{v}: "Not this one." They will not explain.`], [['time', -1]]), O(0.1, 'danger', [`It opens. Something comes out. It goes for {r}.`], [['em', 'r']])])] },
  { id: 'army', match: /\b(army|soldier|military|marine|navy|tactical|helmet)\b/i, lines: { calm: ['"Stay in formation. What formation? Any formation."'], tense: ['"Contact! CONTACT!"'] },
    options: [X('pk_army', ['blocker'], `Let {v} run a proper military drill`, `Hand signals and everything.`, [O(0.5, 'good', [`{v} does hand signals. Nobody understands them. Everyone copies anyway, and somehow it works.`], [['time', 1], ['funny']]), O(0.3, 'neutral', [`{v} explains the hand signals for twenty minutes.`], [['time', -2]]), O(0.2, 'danger', [`Someone salutes at the wrong moment and knocks over a bin. It comes for {r}.`], [['em', 'r']])])] },
  { id: 'music', match: /\b(music\w*|sing\w*|guitar|dj|rapper|rap|piano|drum\w*|band)\b/i, lines: { calm: ['"This needs a soundtrack. I\'ll hum."'], tense: ['"Drop the beat! There is no beat! RUN!"'] },
    options: [X('pk_rap', ['blocker', 'people'], `{v} drops a freestyle to distract it`, `Bars. Absolute bars.`, [O(0.4, 'good', [`{v}: "Yo, I'm alive and you're not, that's a fact / you can shuffle on forward, I'm stepping back."\nIt is so confused it wanders off.`], [['funny']]), O(0.35, 'neutral', [`The freestyle goes on for nine minutes. Nobody claps.`], [['time', -1], ['funny']]), O(0.25, 'danger', [`It hates the beat. It goes for {r}.`], [['em', 'r']])])] },
];

// ---------------- lookups ----------------
export function personaOf(c) { return c ? PERSONAS[String(c.name || '').trim().toLowerCase()] || null : null; }
export function personaKey(c) { const k = String(c?.name || '').trim().toLowerCase(); return PERSONAS[k] ? k : null; }

export function packsOf(c) {
  if (personaOf(c)) return [];
  const text = [c.description || '', ...(c.traits || [])].join(' ');
  return PACKS.filter((p) => p.match.test(text));
}
// A custom character's pet: "a cat called Biscuit" -> { pet: 'Biscuit', type: 'cat' }
export function petOf(c) {
  const d = c.description || '';
  const m = /\b(cat|kitten|dog|puppy|hamster|rabbit|bunny|parrot)\b(?:[^.]{0,20}?\b(?:called|named)\s+([A-Z][\w'-]+))?/i.exec(d);
  if (!m) return { pet: 'the pet', type: 'pet' };
  return { pet: m[2] || `the ${m[1].toLowerCase()}`, type: m[1].toLowerCase() };
}

// All option definitions by id (for resolving a choice).
export const OPTION_BY_ID = {};
for (const p of Object.values(PERSONAS)) for (const x of p.options) OPTION_BY_ID[x.id] = x;
for (const p of PACKS) for (const x of p.options) OPTION_BY_ID[x.id] = x;

// Options available right now, each tied to the living character who would do it.
export function characterOptions(s) {
  const al = s.party.filter((c) => c.alive);
  const keys = new Set(al.map(personaKey).filter(Boolean));
  const out = [];
  for (const c of al) {
    const p = personaOf(c);
    if (p) { for (const x of p.options) if ((x.need || []).every((k) => keys.has(k))) out.push({ x, who: c.id }); }
    else for (const pk of packsOf(c)) for (const x of pk.options) out.push({ x, who: c.id });
  }
  return out;
}

// Star signs for the star-sign chaos option (only real, known birthdays).
export function signLine(s) {
  const al = s.party.filter((c) => c.alive);
  const bits = [];
  const gem = al.filter((c) => personaOf(c)?.sign === 'Gemini');
  for (const c of al) {
    const p = personaOf(c);
    if (!p) continue;
    if (p.sign === 'Gemini' && gem.length > 1) continue;
    if (p.sign) bits.push(`${c.name} is ${SIGNS[p.sign].replace(/\{n\}/g, c.name).replace(/\{they\}/g, p.they).replace(/\{their\}/g, p.they === 'she' ? 'her' : 'his').replace(/\{them\}/g, p.they === 'she' ? 'her' : 'him')}.`);
    else if (c.name.toLowerCase() === 'ikram') bits.push(`Ikram's star sign is... unknown. Of course it is.`);
  }
  if (gem.length > 1) bits.unshift(`${gem.map((c) => c.name).join(' AND ')} are both Geminis. Nobody can explain how.`);
  return bits.slice(0, 4).join('\n');
}

// Real birthdays: if today is someone's birthday, the group notices.
export function birthdayToday(s) {
  if (!s.today) return null;
  return s.party.find((c) => c.alive && personaOf(c)?.birthday === s.today) || null;
}

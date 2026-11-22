// 10x10 pixel item icons drawn from character maps. Letters map to colours.
const PAL = {
  k: '#1c1c22', w: '#f1faee', g: '#adb5bd', d: '#6c757d', y: '#ffd166', o: '#f77f00', r: '#e63946', R: '#9d0208', b: '#457b9d', B: '#1d3557',
  n: '#8d5524', N: '#5e3b23', G: '#2a9d8f', l: '#90be6d', p: '#c77dff', s: '#f4a261', c: '#a8dadc', e: '#e9c46a', m: '#b5838d',
};
const ICONS = {
  torch: ['..........', '......yy..', '.....yyyy.', '..ddddyy..', '.ddddddy..', 'dddddd....', 'gdddd.....', 'gg........', '..........', '..........'],
  lantern: ['....kk....', '...k..k...', '..dddddd..', '..dyyyyd..', '..dyooyd..', '..dyooyd..', '..dyyyyd..', '..dddddd..', '...dddd...', '..........'],
  battery: ['..........', '....gg....', '..dddddd..', '..dyyyyd..', '..dyyyyd..', '..dddddd..', '..dkkkkd..', '..dkkkkd..', '..dddddd..', '..........'],
  medkit: ['..........', '...kkkk...', '.wwwwwwww.', '.wwwrrwww.', '.wwrrrrww.', '.wwrrrrww.', '.wwwrrwww.', '.wwwwwwww.', '..........', '..........'],
  bandage: ['..........', '..wwww....', '.wwwwww...', '.wwggwwww.', '.wwggwwww.', '.wwwwwwww.', '..wwwwwww.', '......ww..', '..........', '..........'],
  can: ['..........', '...gggg...', '...GGGG...', '...GwwG...', '...GwwG...', '...GGGG...', '...GGGG...', '...gggg...', '..........', '..........'],
  crowbar: ['.......rr.', '......r..r', '.....r....', '....r.....', '...r......', '..r.......', '.r........', 'rr........', '..........', '..........'],
  axe: ['....gg....', '...gggg...', '..ggNNgg..', '...gNNg...', '....NN....', '....NN....', '....NN....', '....NN....', '....NN....', '..........'],
  gun: ['..........', '..........', '.kkkkkkkk.', '.kddddddk.', '.kkkkkkk..', '...kNN....', '...kNN....', '...kNN....', '..........', '..........'],
  rifle: ['..........', '..........', 'kkkkkkkkk.', '.kdddddNNN', '......NNNN', '.......NNN', '..........', '..........', '..........', '..........'],
  flare: ['....y.....', '...yoy....', '....o.....', '...rrr....', '...rwr....', '...rrr....', '...rrr....', '...rrr....', '...kkk....', '..........'],
  firework: ['..y...y...', '...y.y....', '....r.....', '...rrr....', '...rwr....', '...rrr....', '...rrr....', '....k.....', '....k.....', '..........'],
  radio: ['......k...', '......k...', '...ddddd..', '...dGGGd..', '...dGGGd..', '...ddddd..', '...dkdkd..', '...dkdkd..', '...ddddd..', '..........'],
  map: ['..........', '.eeeeeeee.', '.eblleeee.', '.ebbllrre.', '.eeblleee.', '.eeebbbee.', '.eeeeebbe.', '.eeeeeeee.', '..........', '..........'],
  food: ['..........', '...gggg...', '..gggggg..', '..ssssss..', '..soooos..', '..soooos..', '..ssssss..', '..gggggg..', '..........', '..........'],
  rope: ['..........', '...nnnn...', '..n....n..', '.n..nn..n.', '.n.n..n.n.', '.n..nn..n.', '..n....n..', '...nnnn...', '.....n....', '......n...'],
  key: ['..........', '..yyy.....', '.y...y....', '.y...yyyyy', '.y...y.y.y', '..yyy.....', '..........', '..........', '..........', '..........'],
  card: ['..........', '.wwwwwwww.', '.wbbwwwww.', '.wbbwkkkw.', '.wwwwwwww.', '.wkkkkkkw.', '.wrrrrrrw.', '.wwwwwwww.', '..........', '..........'],
  syringe: ['........k.', '.......k..', '......gg..', '.....gcg..', '....gcg...', '...gcg....', '..ggg.....', '.g........', '..........', '..........'],
  drive: ['..........', '...gggg...', '...gkkg...', '..bbbbbb..', '..bbbbbb..', '..bwwwwb..', '..bbbbbb..', '..bbbbbb..', '..........', '..........'],
  compass: ['...kkkk...', '..kwwwwk..', '.kwwrwwwk.', '.kwwrwwwk.', '.kwwkwwwk.', '.kwwbwwwk.', '..kwwwwk..', '...kkkk...', '..........', '..........'],
  fuel: ['..........', '....rrr...', '...rrrrr..', '..rrrrrrr.', '..rwwwwrr.', '..rrrrrrr.', '..rrrrrrr.', '..rrrrrrr.', '..........', '..........'],
  fuse: ['..........', '..........', '..gggggg..', '.kyyyyyyk.', '.kyyyyyyk.', '..gggggg..', '..........', '..........', '..........', '..........'],
  spray: ['....kk....', '...rr.....', '...dd.....', '..rrrr....', '..rwwr....', '..rwwr....', '..rrrr....', '..rrrr....', '..........', '..........'],
  extinguisher: ['...kkk....', '..k.d.....', '...rr.....', '..rrrr....', '..rwwr....', '..rrrr....', '..rrrr....', '..rrrr....', '...rr.....', '..........'],
  lifejacket: ['..........', '..oo..oo..', '.oooooooo.', '.ooowwooo.', '.oooooooo.', '.ooowwooo.', '.oooooooo.', '..oooooo..', '..........', '..........'],
  bottle: ['....GG....', '....GG....', '....GG....', '...GGGG...', '..GGwwGG..', '..GGwwGG..', '..GGGGGG..', '..GGGGGG..', '..........', '..........'],
  knife: ['.........g', '........gg', '.......gg.', '......gg..', '.....gg...', '...NN.....', '..NN......', '.NN.......', '..........', '..........'],
  book: ['..........', '.RRRRRRR..', '.RyyRRRRw.', '.RRRRRRRw.', '.RRyyyRRw.', '.RRRRRRRw.', '.RRRRRRR..', '..........', '..........', '..........'],
  spanner: ['.g.....g..', '.gg...gg..', '..gg.gg...', '...ggg....', '...gg.....', '..gg......', '.gg.......', 'gg........', '..........', '..........'],
  water: ['....bb....', '...bbbb...', '..bbcbbb..', '..bcbbbb..', '..bbbbbb..', '...bbbb...', '..........', '..........', '..........', '..........'],
  berries: ['....ll....', '...l..l...', '..p....p..', '.ppp..ppp.', '.ppp..ppp.', '..p.pp.p..', '...pppp...', '....pp....', '..........', '..........'],
  generic: ['..........', '..nnnnnn..', '.nnnnnnnn.', '.neeeeeen.', '.nnnnnnnn.', '.nnnnnnnn.', '.nnnnnnnn.', '..........', '..........', '..........'],
};

export function iconSVG(name, size = 40) {
  const map = ICONS[name] || ICONS.generic;
  let s = '';
  map.forEach((row, y) => { for (let x = 0; x < row.length; x++) { const c = PAL[row[x]]; if (c) s += `<rect x="${x}" y="${y}" width="1" height="1" fill="${c}"/>`; } });
  return `<svg class="px-icon" viewBox="0 0 10 10" width="${size}" height="${size}" shape-rendering="crispEdges" aria-hidden="true">${s}</svg>`;
}
export const ICON_NAMES = Object.keys(ICONS);

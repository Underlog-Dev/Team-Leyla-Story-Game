// UI layer: screens, routing, and wiring to the engine and storage.
import { createStorage } from './storage.js';
import { AVATAR_OPTIONS, TRAITS, ROLE_LIST, avatarSVG, defaultAvatar, randomAvatar } from './avatar.js';
import { makeCharacter, randomCharacter, exportLibrary, parseImport, mergeLibrary, MAX_CHARACTERS, MAX_TRAITS, cleanName, starterCrew } from './characters.js';
import { ADVENTURES, advById } from './adventures.js';
import { newGame, choose, useItem, findItemUse, formatClock, historyRecord, updateReplay, statsFrom, hpLabel, MAX_HP, listNames, companionSummary, npcName, ROLES, DIFFICULTY, MAX_PARTY, infectDelay, mercyKill } from './engine.js';
import { makeSeed, cleanSeed } from './rng.js';
import { sceneSVG } from './scenes.js';
import { iconSVG } from './icons.js';

const app = document.getElementById('app');
const S = {
  screen: 'home', store: null, chars: [], save: null, history: [], replay: null, settings: {},
  editing: null, selected: new Set(), advId: null, seed: '', customSeed: '', game: null, adv: null,
  sel: null, pack: null, modal: null, toast: null, histOpen: null, flash: false, busy: false,
};

const h = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------------- boot ----------------
async function boot() {
  try {
    S.store = await createStorage();
    [S.chars, S.save, S.history, S.replay, S.settings] = await Promise.all([S.store.characters(), S.store.getSave(), S.store.history(), S.store.getReplay(), S.store.getSettings()]);
    if (S.save && !advById(S.save.adv)) S.save = null;
    // give older characters a role (roles became required)
    for (let i = 0; i < S.chars.length; i++) { if (!S.chars[i].role) { S.chars[i] = makeCharacter({ ...S.chars[i] }); try { await S.store.saveCharacter(S.chars[i]); } catch {} } }
  } catch (e) {
    console.error(e);
    S.toast = 'Saving is unavailable in this browser. You can still play, but nothing will be remembered.';
  }
  applySettings();
  const hash = location.hash.replace('#', '');
  if (['library', 'history'].includes(hash)) S.screen = hash;
  render();
}

function applySettings() {
  document.body.dataset.ts = S.settings.textSize || '1';
}

function go(screen) { S.screen = screen; S.modal = null; S.pack = null; history.replaceState(null, '', screen === 'home' ? location.pathname : '#' + screen); render(); window.scrollTo(0, 0); }
function toast(msg) { S.toast = msg; renderToast(); clearTimeout(toast.t); toast.t = setTimeout(() => { S.toast = null; renderToast(); }, 3200); }
function renderToast() { let el = document.getElementById('toast'); if (!el) { el = document.createElement('div'); el.id = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); } el.textContent = S.toast || ''; el.className = S.toast ? 'show' : ''; }
function modal(title, body, buttons) { S.modal = { title, body, buttons }; renderModal(); }
function closeModal() { S.modal = null; renderModal(); }
function renderModal() {
  let el = document.getElementById('modal');
  if (!S.modal) { if (el) el.remove(); return; }
  if (!el) { el = document.createElement('div'); el.id = 'modal'; document.body.appendChild(el); el.addEventListener('click', onClick); }
  const m = S.modal;
  el.innerHTML = `<div class="modal-back" data-a="modalClose"></div><div class="modal-box panel" role="dialog" aria-modal="true" aria-label="${h(m.title)}"><h2>${h(m.title)}</h2><div class="modal-body">${m.body}</div><div class="modal-btns">${m.buttons.map((b, i) => `<button class="btn ${b.cls || ''}" data-a="modalBtn" data-i="${i}">${h(b.label)}</button>`).join('')}</div></div>`;
  const btn = el.querySelector('.modal-btns .btn'); if (btn) btn.focus();
}

// ---------------- screens ----------------
function render() {
  const fn = SCREENS[S.screen] || SCREENS.home;
  app.innerHTML = fn();
  app.dataset.screen = S.screen;
  renderModal();
  renderToast();
}

const ROLE_ICON = { Medic: '✚', Engineer: '🔧', Fighter: '⚔', Scout: '👁', Leader: '★', Athlete: '⚡' };
const roleChip = (r) => (r ? `<span class="chip role">${ROLE_ICON[r] || ''} ${h(r)}</span>` : '');
const back = (to = 'home', label = 'Back') => `<button class="btn small ghost" data-a="go" data-to="${to}" aria-label="${label}">◀ ${label}</button>`;

const SCREENS = {
  home() {
    const sv = S.save;
    const advTitle = sv ? advById(sv.adv)?.title : '';
    return `<div class="home">
      <div class="home-scene">${sceneSVG({ bg: 'station', z: 4, light: 'night' }, S.chars.slice(0, 4), { stage: 3 })}</div>
      <div class="logo"><div class="logo-top">TEAM LEYLA</div><div class="logo-main">SURVIVAL<br>STORIES</div><div class="logo-sub">A zombie story game for brave groups 🧟</div></div>
      <div class="menu">
        ${sv ? `<button class="btn big green" data-a="continue">▶ Continue Adventure<small>${h(advTitle)} · Stage ${sv.stage}</small></button>` : ''}
        <button class="btn big red" data-a="newAdventure">☠ New Adventure</button>
        <button class="btn big" data-a="go" data-to="library">☺ Character Library <small>${S.chars.length}/${MAX_CHARACTERS} survivors</small></button>
        <button class="btn big" data-a="go" data-to="history">📜 Adventure History</button>
      </div>
      ${isInstalled() ? '' : `<div class="menu"><button class="btn install" data-a="installHelp">📲 Add the game to your Home Screen</button></div>`}
      <p class="foot">Free to play · Everything saves on this device · No accounts</p>
    </div>`;
  },

  library() {
    const full = S.chars.length >= MAX_CHARACTERS;
    return `<div class="screen">
      <header class="bar">${back()}<h1>Character Library</h1><span class="count">${S.chars.length}/${MAX_CHARACTERS}</span></header>
      <div class="row wrap gap">
        <button class="btn green" data-a="newChar" ${full ? 'disabled' : ''}>＋ New Character</button>
        <button class="btn" data-a="randomChar" ${full ? 'disabled' : ''}>🎲 Random</button>
        ${starterCrew(S.chars.map((c) => c.name)).length && !full ? `<button class="btn" data-a="addCrew">★ Starter crew</button>` : ''}
        <button class="btn" data-a="exportLib" ${S.chars.length ? '' : 'disabled'}>⬇ Export</button>
        <button class="btn" data-a="importLib">⬆ Import</button>
      </div>
      ${S.chars.length ? `<div class="char-grid">${S.chars.map((c) => `<div class="char-card panel">
          ${avatarSVG(c.avatar, { size: 72 })}
          <div class="char-name">${h(c.name)}</div>
          <div class="traits">${roleChip(c.role)}${c.traits.map((t) => `<span class="chip">${h(t)}</span>`).join('')}</div>
          ${c.description ? `<div class="desc">${h(c.description)}</div>` : ''}
          <div class="row gap"><button class="btn small" data-a="editChar" data-id="${c.id}">Edit</button><button class="btn small red" data-a="delChar" data-id="${c.id}">Delete</button></div>
        </div>`).join('')}</div>`
        : `<div class="empty panel"><p>No survivors yet. Create your first character, or add a few random ones to get going.</p><button class="btn green" data-a="addCrew">★ Add the starter crew (8 ready-made characters)</button><button class="btn" data-a="quickFour">🎲 Add 4 random survivors</button></div>`}
      <p class="note">Characters are never deleted when they die in a story. Use Export to back them up or move them to another device.</p>
    </div>`;
  },

  editor() {
    const c = S.editing;
    return `<div class="screen">
      <header class="bar">${back('library', 'Cancel')}<h1>${c.isNew ? 'New Character' : 'Edit Character'}</h1></header>
      <div class="editor">
        <div class="editor-preview panel">${avatarSVG(c.avatar, { size: 160 })}
          <button class="btn small" data-a="randAvatar">🎲 Randomise look</button></div>
        <label class="field"><span>Name</span><input id="cname" maxlength="18" value="${h(c.name)}" placeholder="Survivor name" autocomplete="off"></label>
        <div class="opts panel">${AVATAR_OPTIONS.map((o) => `<div class="opt"><span class="opt-l">${o.label}</span>
          <button class="arrow" data-a="cycle" data-k="${o.key}" data-d="-1" aria-label="Previous ${o.label}">◀</button>
          <span class="opt-v">${h(o.name(c.avatar[o.key]))}</span>
          <button class="arrow" data-a="cycle" data-k="${o.key}" data-d="1" aria-label="Next ${o.label}">▶</button></div>`).join('')}</div>
        <div class="field"><span>Role <small>(required, gives a real advantage in the story)</small></span>
          <div class="role-pick">${ROLE_LIST.map((r) => `<button class="role-opt ${c.role === r ? 'on' : ''}" data-a="role" data-r="${r}" aria-pressed="${c.role === r}"><b>${ROLE_ICON[r]} ${r}</b><span>${h(ROLES[r])}</span></button>`).join('')}</div></div>
        <div class="field"><span>Personality <small>(up to ${MAX_TRAITS}, optional, changes how they talk and act)</small></span>
          <div class="trait-pick">${TRAITS.map((t) => `<button class="chip pick ${c.traits.includes(t) ? 'on' : ''}" data-a="trait" data-t="${t}" aria-pressed="${c.traits.includes(t)}">${t}</button>`).join('')}</div></div>
        <label class="field"><span>Short description <small>(optional)</small></span><textarea id="cdesc" maxlength="160" rows="2" placeholder="e.g. Ex-postie who never stops talking">${h(c.description)}</textarea></label>
        <div class="row gap"><button class="btn big green" data-a="saveChar">💾 Save Character</button></div>
      </div>
    </div>`;
  },

  select() {
    const n = S.selected.size;
    return `<div class="screen">
      <header class="bar">${back()}<h1>Choose Survivors</h1><span class="count">${n}/${MAX_PARTY}</span></header>
      ${S.chars.length ? `<p class="note pad">Pick up to ${MAX_PARTY} survivors. Your choices steer the whole team, and anyone can get hurt.</p><div class="row gap wrap"><button class="btn small" data-a="selAll">🎲 Pick ${Math.min(MAX_PARTY, S.chars.length)} at random</button><button class="btn small" data-a="selNone">Clear</button><button class="btn small" data-a="go" data-to="library">Manage library</button></div>
      <div class="char-grid pickable">${S.chars.map((c) => `<button class="char-card panel ${S.selected.has(c.id) ? 'on' : ''}" data-a="toggleSel" data-id="${c.id}" aria-pressed="${S.selected.has(c.id)}">
        ${avatarSVG(c.avatar, { size: 64 })}<div class="char-name">${h(c.name)}</div>${roleChip(c.role)}<div class="tick">${S.selected.has(c.id) ? '✔' : ''}</div></button>`).join('')}</div>
      <div class="sticky-foot"><button class="btn big red" data-a="toAdventures" ${n ? '' : 'disabled'}>Next ▶ <small>${n ? `${n} survivor${n > 1 ? 's' : ''}` : 'pick at least 1'}</small></button></div>`
        : `<div class="empty panel"><p>You need at least one character. Too busy to make your own? Use the starter crew.</p><button class="btn green" data-a="addCrew">★ Use the starter crew</button><button class="btn" data-a="quickFour">🎲 Add 4 random survivors</button><button class="btn" data-a="newChar">＋ Create one</button></div>`}
    </div>`;
  },

  adventures() {
    const ends = S.replay?.endings || {};
    return `<div class="screen">
      <header class="bar">${back('select')}<h1>Choose Adventure</h1></header>
      <div class="adv-list">${ADVENTURES.map((a) => {
        const found = Object.keys(ends[a.id] || {}).length;
        return `<button class="adv-card panel" data-a="pickAdv" data-id="${a.id}" style="--accent:${a.colour}">
          <div class="adv-art">${sceneSVG({ bg: a.card, z: 3, light: 'night' }, [], { stage: 1 })}<div class="adv-title">${h(a.title)}</div></div>
          <div class="adv-info"><div class="tag">${h(a.tagline)}</div><div class="obj">🎯 ${h(a.objective)}</div><div class="meta">${a.events.length} story events · ${found}/${a.endings.length} endings found</div></div>
        </button>`; }).join('')}</div>
    </div>`;
  },

  intro() {
    const a = advById(S.advId);
    const party = S.chars.filter((c) => S.selected.has(c.id));
    return `<div class="screen intro" style="--accent:${a.colour}">
      <header class="bar">${back('adventures')}<h1>${h(a.title)}</h1></header>
      <div class="scene-wrap">${sceneSVG({ bg: a.card, z: 2, light: 'night' }, party, { stage: 2 })}</div>
      <div class="panel story"><p>${h(a.premise)}</p></div>
      <div class="panel objective"><div class="lbl">OBJECTIVE</div><p>${h(a.objective)}</p><div class="clock">⏱ ${h(a.clock.label)} ${formatClock(a, a.clock.start + DIFFICULTY[diffNow()].clock)}</div></div>
      <div class="panel"><div class="lbl">YOUR TEAM (${party.length})</div><div class="roster big">${party.map((c) => `<div class="mini">${avatarSVG(c.avatar, { size: 44 })}<span>${h(c.name)}</span><small class="r">${ROLE_ICON[c.role] || ''} ${h(c.role || '')}</small></div>`).join('')}</div></div>
      <div class="panel"><div class="lbl">DIFFICULTY</div><div class="diff-pick">${Object.entries(DIFFICULTY).map(([k, d]) => `<button class="diff-opt ${diffNow() === k ? 'on' : ''} d-${k}" data-a="diff" data-k="${k}" aria-pressed="${diffNow() === k}"><b>${d.label}</b><span>${h(d.blurb)}</span></button>`).join('')}</div></div>
      <details class="panel seedbox"><summary>Story seed: <b>${h(S.customSeed || S.seed)}</b></summary>
        <p class="note">Every adventure gets a random seed. Type a seed from your history to replay that exact story with the same team and choices. Seed replays ignore replay history.</p>
        <div class="row gap"><input id="seedIn" maxlength="12" placeholder="e.g. K7Q2MX" value="${h(S.customSeed)}" autocapitalize="characters"><button class="btn small" data-a="setSeed">Use seed</button><button class="btn small" data-a="clearSeed">Random</button></div></details>
      <div class="sticky-foot"><button class="btn big red" data-a="start">Begin Adventure ▶</button></div>
    </div>`;
  },

  play() {
    const g = S.game, a = S.adv;
    if (!g || !a) return SCREENS.home();
    const cur = g.cur;
    const party = g.party;
    const castChars = cur.scene.cast.map((id) => party.find((p) => p.id === id)).filter(Boolean);
    const sel = S.sel != null ? cur.choices[S.sel] : null;
    const last = g.last;
    const invCount = g.inv.reduce((n, i) => n + 1, 0);
    return `<div class="play ${S.flash ? 'flash' : ''}" style="--accent:${a.colour}">
      <header class="topbar">
        <button class="icon-btn" data-a="homeConfirm" aria-label="Home">🏠</button>
        <div class="tb-mid"><div class="tb-title">${h(a.title)}</div><div class="tb-sub">${h(DIFFICULTY[g.diff || 'medium'].label)} · Stage ${g.stage} · ⏱ ${formatClock(a, g.clock)}</div><div class="heat" title="Noise: risky outcomes draw more infected and raise every danger">🧟 Noise <span>${Array.from({ length: 4 }, (_, i) => `<i class="${(g.heat || 0) > i * 2 ? 'on' : ''}"></i>`).join('')}</span></div></div>
        <button class="icon-btn" data-a="textSize" aria-label="Text size">Aa</button>
      </header>
      <div class="roster ${party.length > 7 ? 'many' : ''}">${party.length > 7 ? `<div class="alive-count">${party.filter((c) => c.alive).length}/${party.length} alive</div>` : ''}${party.map((c) => `<div class="mini ${c.alive ? '' : 'dead'} ${c.alive && c.infected && !['cured', 'dead'].includes(c.infected.resolved) ? 'infected' : ''}" title="${h(c.name)}: ${c.alive ? hpLabel(c.hp) : 'Dead'}">
        <div class="pic">${avatarSVG(c.avatar, { size: 38 })}${c.alive ? '' : '<div class="xmark">✕</div>'}${c.alive && c.infected && !['cured', 'dead'].includes(c.infected.resolved) ? `<div class="inf-badge" title="Turns in ${Math.max(0, c.infected.at + infectDelay(g) - g.stage)} turns">🦠${Math.max(0, c.infected.at + infectDelay(g) - g.stage)}${c.infected.resolved === 'restrained' ? '⛓' : ''}</div>` : ''}</div>
        <span class="nm">${h(c.name)}</span><span class="hp">${c.alive ? '♥'.repeat(c.hp) + '<i>' + '♥'.repeat(MAX_HP - c.hp) + '</i>' : '0/3'}</span></div>`).join('')}</div>
      ${g.npcs.length ? `<div class="companions">With you: ${g.npcs.map((id) => `<b>${h(npcName(a, id))}</b>`).join(', ')}</div>` : ''}
      <div class="scene-wrap">${sceneSVG(cur.scene, castChars, { stage: g.stage })}<div class="scene-title">${h(cur.title)}</div></div>
      <div class="story">
        ${last ? `<div class="outcome panel ${last.deaths.length ? 'bad' : last.kind === 'hurt' || last.kind === 'danger' || last.kind === 'infect' ? 'warn' : 'ok'}">
          <div class="lbl">WHAT HAPPENED · <span>${h(last.choice)}</span></div><p>${h(last.text)}</p>
          <div class="chips">${last.gained.map((n) => `<span class="chip g">＋ ${h(n)}</span>`).join('')}${last.lost.map((n) => `<span class="chip r">－ ${h(n)}</span>`).join('')}${last.hurt.filter((n) => !last.deaths.includes(n)).map((n) => `<span class="chip r">🩸 ${h(n)} hurt</span>`).join('')}${last.healed.map((n) => `<span class="chip g">✚ ${h(n)} healed</span>`).join('')}${last.deaths.map((n) => `<span class="chip dead">☠ ${h(n)} died</span>`).join('')}</div></div>` : ''}
        ${cur.react ? `<p class="react">${h(cur.react)}</p>` : ''}
        <p class="narr">${h(cur.text)}</p>
        ${cur.say.map((l) => { const c = party.find((p) => p.id === l.who); return `<div class="say">${avatarSVG(c.avatar, { size: 34 })}<div><b>${h(c.name)}</b><span>${h(l.text)}</span></div></div>`; }).join('')}
        ${sel ? `<div class="selected panel"><div class="lbl">YOUR DECISION</div><p class="sl">${h(sel.label)}</p><p>${h(sel.desc)}</p>${riskHTML(sel.risk)}</div>` : `<div class="selected hint">Choose an option below, then press NEXT.</div>`}
      </div>
      ${infectedBanner(g, a)}
      <div class="choices">${cur.choices.map((c, i) => `<button class="choice ${S.sel === i ? 'on' : ''}" data-a="pick" data-i="${i}" aria-pressed="${S.sel === i}"><span class="num">${i + 1}</span><span class="cl">${c.special ? '<em class="unlock">★ Unlocked</em>' : ''}${h(c.label)}${riskHTML(c.risk)}</span></button>`).join('')}</div>
      <div class="playfoot">
        <button class="btn pack" data-a="openPack">🎒 Backpack${invCount ? `<span class="badge">${invCount}</span>` : ''}</button>
        <button class="btn next ${sel ? 'ready' : ''}" data-a="next" ${sel ? '' : 'disabled'}>NEXT ➜</button>
      </div>
      ${S.pack ? packHTML() : ''}
    </div>`;
  },

  ending() {
    const g = S.game, a = S.adv;
    const e = g.ending;
    const al = g.party.filter((c) => c.alive), dd = g.party.filter((c) => !c.alive);
    const majors = g.log.decisions.filter((d) => d.major).slice(-8);
    const list = (title, arr, fn) => arr.length ? `<div class="panel"><div class="lbl">${title}</div><ul>${arr.map((x) => `<li>${fn(x)}</li>`).join('')}</ul></div>` : '';
    return `<div class="screen ending" style="--accent:${a.colour}">
      <div class="end-banner ${e.objective ? 'win' : 'lose'}"><div class="small">${h(a.title)} · ${h(DIFFICULTY[g.diff || 'medium'].label)}</div><div class="end-title">${h(e.title)}</div><div class="end-cat">${h(e.cat)}</div></div>
      <div class="panel story"><p>${h(e.text)}</p></div>
      <div class="stats">
        <div class="stat ${e.objective ? 'g' : 'r'}"><b>${e.objective ? '✔' : '✕'}</b><span>Objective</span></div>
        <div class="stat"><b>${g.stage}</b><span>Stages</span></div>
        <div class="stat g"><b>${al.length}</b><span>Survivors</span></div>
        <div class="stat r"><b>${dd.length}</b><span>Deaths</span></div>
      </div>
      <div class="panel"><div class="lbl">THE TEAM</div><div class="end-roster">${g.party.map((c) => `<div class="end-char ${c.alive ? '' : 'dead'}"><div class="pic">${avatarSVG(c.avatar, { size: 56 })}${c.alive ? '' : '<div class="xmark">✕</div>'}</div><b>${h(c.name)}</b><span>${c.alive ? (c.infected && c.infected.resolved !== 'cured' ? 'Survived… infected' : hpLabel(c.hp)) : h(c.cause)}</span></div>`).join('')}</div></div>
      ${companionSummary(g, a).length ? `<div class="panel"><div class="lbl">COMPANIONS — THE TRUTH</div>${companionSummary(g, a).map((c) => `<div class="comp-row"><b>${h(c.name)}</b> <span class="chip ${c.loyalty === 'loyal' ? 'g' : c.loyalty === 'traitor' ? 'r' : ''}">${c.loyalty === 'loyal' ? '✔ Loyal' : c.loyalty === 'traitor' ? '☠ Traitor' : 'Ordinary'}</span> <small>${c.died ? h(c.cause || 'died') : c.stayed ? 'stayed to the end' : c.loyalty === 'traitor' ? 'betrayed the group' : 'went their own way'}</small></div>`).join('')}</div>` : ''}
      ${list('MAJOR DECISIONS', majors, (d) => `<b>Stage ${d.stage}:</b> ${h(d.choice)}`)}
      ${list('HEROIC MOMENTS', g.log.heroic.slice(0, 6), (d) => h(d.text))}
      ${list('FUNNY MOMENTS', g.log.funny.slice(0, 6), (d) => h(d.text))}
      ${list('DISCOVERIES', g.log.discoveries.slice(0, 12), (d) => `${h(d.name)} <small>(stage ${d.stage})</small>`)}
      ${list('ITEMS USED', g.log.itemsUsed, (d) => `${h(d.name)}${d.secret ? ' <span class="chip g">secret use!</span>' : ''} <small>(stage ${d.stage})</small>`)}
      ${list('FALLEN', g.log.deaths, (d) => `<b>${h(d.name)}</b> ${h(d.cause)} <small>(stage ${d.stage})</small>`)}
      <p class="note center">Seed ${h(g.seed)}</p>
      <div class="menu">
        <button class="btn big red" data-a="replayAdv">↻ Play ${h(a.title)} again</button>
        <button class="btn big" data-a="otherAdv">Choose another adventure</button>
        <button class="btn" data-a="go" data-to="history">📜 Adventure History</button>
        <button class="btn" data-a="go" data-to="home">🏠 Home</button>
      </div>
    </div>`;
  },

  history() {
    const st = statsFrom(S.history);
    return `<div class="screen">
      <header class="bar">${back()}<h1>Adventure History</h1></header>
      <div class="stats">
        <div class="stat"><b>${st.total}</b><span>Played</span></div>
        <div class="stat g"><b>${st.escapes}</b><span>Escapes</span></div>
        <div class="stat"><b>${st.endingsFound}</b><span>Endings found</span></div>
        <div class="stat"><b class="sm">${h(st.most)}</b><span>Most played</span></div>
      </div>
      ${st.chars.length ? `<div class="panel"><div class="lbl">SURVIVAL RATES</div><div class="rates">${st.chars.slice(0, 20).map((c) => `<div class="rate">${avatarSVG(c.avatar, { size: 30 })}<span>${h(c.name)}</span><div class="bar-o"><div class="bar-i" style="width:${Math.round(c.survived / c.played * 100)}%"></div></div><b>${Math.round(c.survived / c.played * 100)}%</b></div>`).join('')}</div></div>` : ''}
      <div class="panel"><div class="lbl">ENDINGS DISCOVERED</div>${ADVENTURES.map((a) => { const found = S.replay?.endings?.[a.id] || {}; return `<div class="end-found"><b>${h(a.title)}</b><div class="chips">${a.endings.filter((e) => e.id !== 'lost').map((e) => found[e.id] ? `<span class="chip g">${h(e.title)}</span>` : `<span class="chip locked">???</span>`).join('')}</div></div>`; }).join('')}</div>
      <div class="lbl pad">PAST ADVENTURES</div>
      ${S.history.length ? S.history.map((r) => `<div class="panel hist ${S.histOpen === r.id ? 'open' : ''}">
          <button class="hist-head" data-a="histToggle" data-id="${r.id}"><span><b>${h(r.advTitle)}</b> · ${h(r.ending?.title || '')}</span><small>${new Date(r.date).toLocaleString()} · ${r.survivors}/${r.party.length} survived · seed ${h(r.seed)}</small></button>
          ${S.histOpen === r.id ? `<div class="hist-body"><div class="end-roster">${r.party.map((c) => `<div class="end-char ${c.alive ? '' : 'dead'}"><div class="pic">${avatarSVG(c.avatar, { size: 40 })}${c.alive ? '' : '<div class="xmark">✕</div>'}</div><b>${h(c.name)}</b><span>${c.alive ? 'Survived' : h(c.cause || 'Died')}</span></div>`).join('')}</div>
            <p><b>Ending:</b> ${h(r.ending?.cat)} · <b>Objective:</b> ${r.objective ? 'completed' : 'failed'} · <b>Stages:</b> ${r.stages}</p>
            <details><summary>Decisions (${r.decisions.length})</summary><ol>${r.decisions.map((d) => `<li>${h(d.choice)}</li>`).join('')}</ol></details>
            <p class="note">${r.events.length} story events encountered.</p></div>` : ''}
        </div>`).join('') : '<p class="note pad">No adventures finished yet.</p>'}
      <div class="row gap wrap pad"><button class="btn small" data-a="resetReplay">Reset replay memory</button><button class="btn small red" data-a="clearHistory">Clear adventure history</button></div>
      <p class="note pad">Replay memory makes the game favour scenes you have not seen recently. Resetting it does not touch your characters or history.</p>
    </div>`;
  },
};

function infectedBanner(g, a) {
  const sick = g.party.filter((c) => c.alive && c.infected && c.infected.resolved === false);
  if (!sick.length) return '';
  const weapon = g.inv.some((i) => (a.items[i.id]?.tags || []).some((t) => t === 'melee' || t === 'gun'));
  const cure = g.inv.find((i) => (a.items[i.id]?.tags || []).includes('cure'));
  return sick.map((c) => {
    const left = Math.max(0, c.infected.at + infectDelay(g) - g.stage);
    return `<div class="inf-banner panel">${avatarSVG(c.avatar, { size: 40 })}<div class="ib-text"><b>🦠 ${h(c.name)} is infected</b><span>Turns in <b>${left}</b> turn${left === 1 ? '' : 's'}. Find a cure, or put them down before they attack someone.</span>
      <div class="row gap wrap">${cure ? `<button class="btn small green" data-a="cureNow" data-id="${c.id}" data-item="${cure.id}">💉 Use ${h(a.items[cure.id].name)}</button>` : ''}${weapon ? `<button class="btn small red" data-a="mercy" data-id="${c.id}">Put ${h(c.name)} down</button>` : ''}${!cure && !weapon ? '<small>No cure and no weapon. Keep searching.</small>' : ''}</div></div></div>`;
  }).join('');
}

function riskHTML(risk) {
  if (!risk || !risk.length) return '';
  return `<span class="risk">${risk.map((r) => `<em class="rk ${r.k}">${h(r.label)}</em>`).join('<i>·</i>')}</span>`;
}

function packHTML() {
  const g = S.game, a = S.adv, p = S.pack;
  const sel = p.item ? g.inv.find((i) => i.id === p.item) : null;
  const d = sel ? a.items[sel.id] : null;
  return `<div class="pack-overlay"><div class="pack panel" role="dialog" aria-label="Backpack">
    <div class="pack-head"><h2>🎒 Backpack</h2><button class="btn small" data-a="closePack">◀ BACK</button></div>
    ${p.msg ? `<div class="pack-msg ${p.ok ? 'ok' : 'no'}">${h(p.msg)}</div>` : ''}
    ${g.inv.length ? `<div class="pack-grid">${g.inv.map((i) => { const it = a.items[i.id]; return `<button class="pack-item ${p.item === i.id ? 'on' : ''}" data-a="packSel" data-id="${i.id}">${iconSVG(it.icon, 36)}<span>${h(it.name)}</span>${i.qty > 1 || it.max > 1 ? `<b class="qty">×${i.qty}</b>` : ''}</button>`; }).join('')}</div>`
      : `<p class="note">Your backpack is empty. Search places to find items.</p>`}
    ${d ? `<div class="pack-detail">${iconSVG(d.icon, 48)}<div><b>${h(d.name)}</b> <small>${sel.qty > 1 || d.max > 1 ? `(${sel.qty} ${d.tags?.includes('gun') ? 'rounds' : 'left'})` : ''}</small><p>${h(d.desc)}</p></div></div>
      ${p.confirm ? `<div class="confirm"><p>Use <b>${h(d.name)}</b> now?</p><div class="row gap"><button class="btn green" data-a="useYes">✔ Yes, use it</button><button class="btn" data-a="useNo">✕ No</button></div></div>` : `<button class="btn big green" data-a="useAsk">USE</button>`}` : g.inv.length ? '<p class="note">Tap an item to see what it does.</p>' : ''}
  </div></div>`;
}

function diffNow() { return DIFFICULTY[S.settings?.difficulty] ? S.settings.difficulty : 'medium'; }

function isInstalled() {
  try { return window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches; } catch { return false; }
}

// ---------------- actions ----------------
const A = {
  installHelp() {
    const android = /android/i.test(navigator.userAgent);
    const steps = android
      ? [['⋮', 'Tap the <b>three dots</b> in the top right of Chrome.'], ['📲', 'Tap <b>Add to Home screen</b> (or <b>Install app</b>).'], ['✅', 'Tap <b>Add</b>. The zombie icon appears on your Home Screen.']]
      : [['•••', 'Tap the <b>three dots</b> in the bottom right of Safari.'], ['⬆️', 'Tap <b>Share</b>.'], ['👇', 'Scroll down the list.'], ['➕', 'Tap <b>Add to Home Screen</b>.'], ['✅', 'Tap <b>Add</b> in the top right. Done!']];
    modal('Add to Home Screen', `<ol class="install-steps">${steps.map(([ic, t], i) => `<li><span class="step-n">${i + 1}</span><span class="step-ic">${ic}</span><span>${t}</span></li>`).join('')}</ol><p class="note">The game then opens full screen from the zombie icon, like a normal app. Your characters are saved separately there, so use <b>Export</b> in the Character Library to bring them across.</p>`, [{ label: 'Got it', cls: 'green' }]);
  },
  go: (d) => go(d.to),
  modalClose: () => closeModal(),
  modalBtn: (d) => { const b = S.modal.buttons[+d.i]; closeModal(); if (b.fn) b.fn(); },
  async continue() {
    const sv = await S.store.getSave();
    if (!sv) { toast('No saved adventure found.'); S.save = null; render(); return; }
    S.game = sv; S.adv = advById(sv.adv); S.sel = null;
    if (sv.finished) go('ending'); else go('play');
  },
  newAdventure() {
    const start = () => { S.selected = new Set([...S.selected].filter((id) => S.chars.some((c) => c.id === id))); go('select'); };
    if (S.save) modal('Start a new adventure?', '<p>Your current adventure is saved. Starting a new one will replace that save.</p>', [{ label: 'Start new', cls: 'red', fn: start }, { label: 'Cancel' }]);
    else start();
  },
  newChar() { if (S.chars.length >= MAX_CHARACTERS) return toast(`The library is full (${MAX_CHARACTERS}).`); S.editing = { isNew: true, name: '', avatar: randomAvatar(), role: null, traits: [], description: '' }; go('editor'); },
  async addCrew() {
    const crew = starterCrew(S.chars.map((c) => c.name)).slice(0, MAX_CHARACTERS - S.chars.length);
    if (!crew.length) return toast('The starter crew is already in your library.');
    for (const c of crew) { await S.store.saveCharacter(c); S.chars.push(c); }
    if (S.screen === 'select' && !S.selected.size) crew.slice(0, MAX_PARTY).forEach((c) => S.selected.add(c.id));
    render(); toast(`${crew.length} starter characters added.`);
  },
  role(d) { syncEditor(); S.editing.role = d.r; render(); },
  diff(d) { S.settings.difficulty = d.k; S.store?.setSettings(S.settings).catch(() => {}); render(); },
  async randomChar() { if (S.chars.length >= MAX_CHARACTERS) return; const c = randomCharacter(S.chars.map((x) => x.name)); await S.store.saveCharacter(c); S.chars.push(c); render(); toast(`${c.name} joined the library.`); },
  async quickFour() { for (let i = 0; i < 4 && S.chars.length < MAX_CHARACTERS; i++) { const c = randomCharacter(S.chars.map((x) => x.name)); await S.store.saveCharacter(c); S.chars.push(c); if (S.selected.size < MAX_PARTY) S.selected.add(c.id); } render(); },
  editChar(d) { const c = S.chars.find((x) => x.id === d.id); S.editing = { ...structuredClone(c), isNew: false }; go('editor'); },
  delChar(d) {
    const c = S.chars.find((x) => x.id === d.id);
    modal('Delete character?', `<div class="center">${avatarSVG(c.avatar, { size: 72 })}<p>Delete <b>${h(c.name)}</b> from your library forever? Their past adventures stay in your history.</p></div>`, [
      { label: 'Delete', cls: 'red', fn: async () => { await S.store.deleteCharacter(c.id); S.chars = S.chars.filter((x) => x.id !== c.id); S.selected.delete(c.id); render(); toast(`${c.name} deleted.`); } }, { label: 'Keep' }]);
  },
  randAvatar() { syncEditor(); S.editing.avatar = randomAvatar(); render(); },
  cycle(d) { syncEditor(); const o = AVATAR_OPTIONS.find((x) => x.key === d.k); const v = S.editing.avatar[o.key] + Number(d.d); S.editing.avatar[o.key] = (v + o.count) % o.count; render(); },
  trait(d) { syncEditor(); const t = S.editing.traits; const i = t.indexOf(d.t); if (i >= 0) t.splice(i, 1); else if (t.length < MAX_TRAITS) t.push(d.t); else toast(`Pick up to ${MAX_TRAITS} traits.`); render(); },
  async saveChar() {
    syncEditor();
    const e = S.editing;
    if (!cleanName(e.name)) { toast('Give your survivor a name first.'); document.getElementById('cname')?.focus(); return; }
    if (!e.role) { toast('Pick a role for your survivor first.'); document.querySelector('.role-pick')?.scrollIntoView({ block: 'center' }); return; }
    const c = makeCharacter({ ...e, id: e.isNew ? undefined : e.id, created: e.created });
    try { await S.store.saveCharacter(c); } catch { toast('Could not save. Is storage full?'); return; }
    const i = S.chars.findIndex((x) => x.id === c.id);
    if (i >= 0) S.chars[i] = c; else S.chars.push(c);
    toast(`${c.name} saved.`);
    go('library');
  },
  exportLib() {
    const text = exportLibrary(S.chars);
    modal('Export characters', `<p>Download a backup file, or copy the backup text and keep it somewhere safe (for example, in Notes).</p>`, [
      { label: '⬇ Download file', cls: 'green', fn: () => { const blob = new Blob([text], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `team-leyla-characters-${new Date().toISOString().slice(0, 10)}.json`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000); toast('Backup downloaded.'); } },
      { label: '📋 Copy text', fn: async () => { try { await navigator.clipboard.writeText(text); toast('Backup copied to clipboard.'); } catch { modal('Copy this backup', `<textarea class="backup" readonly rows="8">${h(text)}</textarea>`, [{ label: 'Done' }]); } } },
      { label: 'Cancel' }]);
  },
  importLib() {
    modal('Import characters', `<p>Choose a backup file, or paste backup text below.</p><input type="file" id="importFile" accept=".json,application/json,text/plain"><textarea id="importText" class="backup" rows="5" placeholder="…or paste backup text here"></textarea>`, [
      { label: 'Import', cls: 'green', fn: () => doImport() }, { label: 'Cancel' }]);
    pendingImport.text = '';
    setTimeout(() => {
      document.getElementById('importFile')?.addEventListener('change', async (ev) => { const f = ev.target.files[0]; if (f) { pendingImport.text = await f.text(); const ta = document.getElementById('importText'); if (ta) ta.value = pendingImport.text.slice(0, 2000); } });
      document.getElementById('importText')?.addEventListener('input', (ev) => { pendingImport.text = ev.target.value; });
    }, 0);
  },
  selAll() { S.selected = new Set([...S.chars].sort(() => Math.random() - 0.5).slice(0, MAX_PARTY).map((c) => c.id)); render(); },
  selNone() { S.selected.clear(); render(); },
  toggleSel(d) { if (S.selected.has(d.id)) S.selected.delete(d.id); else if (S.selected.size >= MAX_PARTY) return toast(`A team can have up to ${MAX_PARTY} survivors.`); else S.selected.add(d.id); render(); },
  toAdventures() { if (!S.selected.size) return; go('adventures'); },
  pickAdv(d) { S.advId = d.id; S.seed = makeSeed(); S.customSeed = ''; go('intro'); },
  setSeed() { const v = cleanSeed(document.getElementById('seedIn')?.value); if (!v) return toast('Type a seed first.'); S.customSeed = v; render(); toast(`Seed ${v} will be used.`); },
  clearSeed() { S.customSeed = ''; S.seed = makeSeed(); render(); },
  async start() {
    const a = advById(S.advId);
    const party = S.chars.filter((c) => S.selected.has(c.id)).slice(0, MAX_PARTY);
    if (!party.length) return go('select');
    const seed = S.customSeed || S.seed;
    try {
      S.game = newGame(a, party, seed, { replay: S.replay, useReplay: !S.customSeed, difficulty: diffNow() });
    } catch (e) { console.error(e); return toast('Could not start the adventure: ' + e.message); }
    S.adv = a; S.sel = null; S.pack = null;
    await save();
    go('play');
  },
  pick(d) { S.sel = Number(d.i); const y = window.scrollY; render(); window.scrollTo(0, y); },
  async next() {
    if (S.sel == null || S.busy) return;
    S.busy = true;
    const before = S.game.party.filter((c) => c.alive).length;
    try { choose(S.game, S.adv, S.sel); } catch (e) { console.error(e); toast('Something went wrong: ' + e.message); S.busy = false; return; }
    S.sel = null;
    await afterAdvance(before);
    S.busy = false;
  },
  homeConfirm() { modal('Leave this adventure?', '<p>Your progress is saved. You can carry on later with Continue Adventure on the home screen.</p>', [{ label: 'Go home', cls: 'red', fn: () => { S.save = S.game; go('home'); } }, { label: 'Stay' }]); },
  textSize() { const n = String(((Number(S.settings.textSize || 1)) % 3) + 1); S.settings.textSize = n; applySettings(); S.store?.setSettings(S.settings).catch(() => {}); toast(['', 'Text: normal', 'Text: large', 'Text: extra large'][n]); },
  mercy(d) {
    const c = S.game.party.find((x) => x.id === d.id);
    modal(`Put ${c.name} down?`, `<div class="center">${avatarSVG(c.avatar, { size: 64 })}<p>This uses a weapon from the backpack. ${h(c.name)} will die now, before the infection takes them.</p></div>`, [
      { label: `Yes, put ${c.name} down`, cls: 'red', fn: async () => { const before = S.game.party.filter((x) => x.alive).length; const r = mercyKill(S.game, S.adv, c.id); toast(r.msg); if (r.ok) await afterAdvance(before); } }, { label: 'Not yet' }]);
  },
  cureNow(d) {
    const c = S.game.party.find((x) => x.id === d.id);
    const item = S.adv.items[d.item];
    modal(`Use the ${item.name}?`, `<p>Give the ${h(item.name)} to ${h(c.name)} to stop the infection.</p>`, [
      { label: '💉 Yes, use it', cls: 'green', fn: async () => { const r = useItem(S.game, S.adv, d.item); toast(r.msg); await save(); render(); } }, { label: 'Not yet' }]);
  },
  openPack() { S.pack = { item: null, confirm: false, msg: '' }; render(); },
  closePack() { S.pack = null; render(); },
  packSel(d) { S.pack = { item: d.id, confirm: false, msg: '' }; render(); },
  useAsk() { S.pack.confirm = true; S.pack.msg = ''; render(); },
  useNo() { S.pack.confirm = false; render(); },
  async useYes() {
    const id = S.pack.item;
    const before = S.game.party.filter((c) => c.alive).length;
    const r = useItem(S.game, S.adv, id);
    if (!r.ok) { S.pack = { item: id, confirm: false, msg: r.msg, ok: false }; render(); return; }
    if (r.advanced) { S.pack = null; S.sel = null; await afterAdvance(before); return; }
    S.pack = { item: S.game.inv.some((i) => i.id === id) ? id : null, confirm: false, msg: r.msg, ok: true };
    await save(); render();
  },
  async replayAdv() { S.advId = S.adv.id; S.selected = new Set(S.game.party.map((c) => c.id).filter((id) => S.chars.some((c) => c.id === id)).slice(0, MAX_PARTY)); S.seed = makeSeed(); S.customSeed = ''; if (!S.selected.size) return go('select'); go('intro'); },
  otherAdv() { S.selected = new Set(S.game.party.map((c) => c.id).filter((id) => S.chars.some((c) => c.id === id)).slice(0, MAX_PARTY)); if (!S.selected.size) return go('select'); go('adventures'); },
  histToggle(d) { S.histOpen = S.histOpen === d.id ? null : d.id; render(); },
  resetReplay() { modal('Reset replay memory?', '<p>The game will forget which scenes you have already seen and which endings you found. Characters and history are not affected.</p>', [{ label: 'Reset', cls: 'red', fn: async () => { await S.store.resetReplay(); S.replay = null; render(); toast('Replay memory reset.'); } }, { label: 'Cancel' }]); },
  clearHistory() { modal('Clear adventure history?', '<p>This deletes the list of past adventures and their statistics. Your characters are not affected.</p>', [{ label: 'Clear', cls: 'red', fn: async () => { await S.store.clearHistory(); S.history = []; render(); toast('History cleared.'); } }, { label: 'Cancel' }]); },
};

const pendingImport = { text: '' };
async function doImport() {
  const text = pendingImport.text || document.getElementById('importText')?.value || '';
  const res = parseImport(text);
  if (res.error) { toast(res.error); return; }
  const apply = async (mode) => {
    const m = mergeLibrary(S.chars, res.characters, mode);
    try { await S.store.replaceCharacters(m.list); } catch { toast('Import failed: storage error.'); return; }
    S.chars = await S.store.characters();
    render();
    toast(mode === 'replace' ? `Library replaced with ${m.list.length} characters.` : `Imported: ${m.added} added, ${m.updated} updated${m.dropped ? `, ${m.dropped} skipped (library full)` : ''}.`);
  };
  modal(`Found ${res.characters.length} character${res.characters.length > 1 ? 's' : ''}`, `<p>Add them to your current library, or replace your library entirely?</p>${res.skipped ? `<p class="note">${res.skipped} invalid entries were skipped.</p>` : ''}`, [
    { label: 'Add to library', cls: 'green', fn: () => apply('merge') }, { label: 'Replace library', cls: 'red', fn: () => apply('replace') }, { label: 'Cancel' }]);
}

function syncEditor() {
  const n = document.getElementById('cname'); const d = document.getElementById('cdesc');
  if (n && S.editing) S.editing.name = n.value;
  if (d && S.editing) S.editing.description = d.value;
}

async function save() {
  try { await S.store.setSave(S.game); S.save = S.game; } catch (e) { console.error(e); toast('Could not save progress on this device.'); }
}

async function afterAdvance(aliveBefore) {
  const g = S.game;
  S.flash = g.party.filter((c) => c.alive).length < aliveBefore;
  if (g.finished) {
    try {
      S.replay = updateReplay(S.replay, g);
      await S.store.setReplay(S.replay);
      const rec = historyRecord(g, S.adv);
      await S.store.addHistory(rec);
      S.history.unshift(rec);
      await S.store.clearSave(); S.save = null;
    } catch (e) { console.error(e); }
    go('ending');
  } else {
    await save();
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  if (S.flash) setTimeout(() => { S.flash = false; document.querySelector('.play')?.classList.remove('flash'); }, 900);
}

function onClick(e) {
  const el = e.target.closest('[data-a]');
  if (!el || el.disabled) return;
  const fn = A[el.dataset.a];
  if (fn) { e.preventDefault(); Promise.resolve(fn(el.dataset, el)).catch((err) => { console.error(err); toast('Error: ' + err.message); }); }
}
app.addEventListener('click', onClick);
document.addEventListener('keydown', (e) => {
  if (S.screen !== 'play' || S.pack || S.modal) return;
  if (e.target.matches('input,textarea')) return;
  if (/^[1-5]$/.test(e.key)) A.pick({ i: Number(e.key) - 1 });
  if (e.key === 'Enter' && S.sel != null) A.next();
});
window.addEventListener('error', (e) => { console.error(e.error); });

boot();

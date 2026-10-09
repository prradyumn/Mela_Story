// ================= ENGINE =================
const W = 1920, H = 1080;
const $ = (s, r = document) => r.querySelector(s);
const stage = $('#stage'), world = $('#world'), ui = $('#ui'), hud = $('#hud');
function el(tag, cls, parent, html, css) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  if (css) Object.assign(e.style, css);
  (parent || world).appendChild(e);
  return e;
}
// ---------- layout overrides (written by the editor, saved as JSON) ----------
let LAYOUT = { items: {}, text: {} };
try { if (window.LAYOUT_DEFAULT) LAYOUT = JSON.parse(JSON.stringify(window.LAYOUT_DEFAULT)); } catch (e) { }
try { const ls = JSON.parse(localStorage.getItem('mela_layout') || 'null'); if (ls && ls.items) LAYOUT = ls; } catch (e) { }
LAYOUT.items = LAYOUT.items || {}; LAYOUT.text = LAYOUT.text || {};
let SCN = 'title';
const LI = n => LAYOUT.items[SCN + '.' + n] || {};
function reg(e, name, kind = 'css') {
  const id = SCN + '.' + name; e.dataset.eid = id; e.dataset.kind = kind;
  if (kind === 'css') { const o = LAYOUT.items[id] || {}; if (o.dx || o.dy) e.style.translate = `${o.dx || 0}px ${o.dy || 0}px`; if (o.s && o.s !== 1) e.style.scale = o.s; }
  return e;
}
// ---------- fit stage to window ----------
function fit() {
  const s = Math.min(innerWidth / W, innerHeight / H);
  stage.style.transform = `translate(${-W * s / 2}px,${-H * s / 2}px) scale(${s})`;
}
addEventListener('resize', fit); fit();

// ---------- assets ----------
const IMG = {}, BUF = {}, DUR = {};
const IMAGES = ['bg_01_gate', 'bg_02_chaupal', 'bg_03_bazaar', 'bg_04_office', 'bg_05_mela', 'bg_05_mela_dusk', 'bg_ins_sweets',
  'db5', 'db6', 'db7', 'db8', 'parch', 'office_fg', 'pari_idle', 'pari_point', 'pari_happy', 'aaru_run', 'aaru_shout', 'aaru_jump', 'baba_idle', 'baba_ask',
  'guddu_write', 'guddu_scratch', 'guddu_surprised', 'guddu_proud', 'manju_teach', 'gudiya_idle', 'gudiya_hop'];
const AUDIO = ['m_title', 'm_village_long', 'm_hurry', 'm_festive',
  'sfx_boing', 'sfx_bubble', 'sfx_coins', 'sfx_confetti', 'sfx_cycle_bell', 'sfx_ding', 'sfx_drumroll_hit', 'sfx_paper', 'sfx_pop',
  'sfx_rise', 'sfx_scribble', 'sfx_sparkle', 'sfx_stamp', 'sfx_swish', 'sfx_tick', 'sfx_whoosh', 'sfx_goat', 'sfx_whoosh_soft', 'sfx_swish_soft',
  't0', 'n1', 'b1', 'g1', 'n2', 'r1', 'p1', 'p2', 'p3', 'r2', 'p4', 'g2', 'p5', 'n3', 'g3', 'p6', 'r3', 'n4', 'x1'];
const SRC = window.EMBED || {};
const imgURL = n => SRC[n] || `assets/story/${n}.webp`;
// audio: Ogg Opus first (smaller), MP3 fallback for browsers that can't decode it (older Safari / iOS)
const OGG = !!document.createElement('audio').canPlayType('audio/ogg; codecs="opus"');
const auURL = (n, ext = OGG ? 'ogg' : 'mp3') => SRC[n] || `assets/audio/${n}.${ext}`;
let AC, master, musicBus, voiceBus, sfxBus;
const MUSIC_LEVEL = 0.22, MUSIC_DUCK = 0.07;   // music bus: normal level, and while a voice speaks (Oct 2026: lowered again, −5 dB / −6 dB)
async function loadAll(onProg) {
  AC = new (window.AudioContext || window.webkitAudioContext)();
  master = AC.createGain(); master.connect(AC.destination);
  musicBus = AC.createGain(); musicBus.gain.value = MUSIC_LEVEL; musicBus.connect(master);
  voiceBus = AC.createGain(); voiceBus.gain.value = 1.0;
  try { voiceAn = AC.createAnalyser(); voiceAn.fftSize = 1024; voiceSamples = new Float32Array(voiceAn.fftSize); voiceBus.connect(voiceAn); voiceAn.connect(master); }
  catch (e) { voiceAn = null; voiceBus.connect(master); }   // the analyser passes the voice through unchanged (drives the talking mouths)
  sfxBus = AC.createGain(); sfxBus.gain.value = 0.7; sfxBus.connect(master);
  // talking/explaining frames are first needed after the opening (hookC onwards, the games): they load in the background
  // once everything else is in, so "Tap to begin" comes sooner. IMG[n] exists at once, so char() can use them any time.
  const LATER = /^(pari_explain|pari_cheer|manju_talk|guddu_talk|baba_talk)_\d+$/, now = IMAGES.filter(n => !LATER.test(n)), later = IMAGES.filter(n => LATER.test(n));
  const total = now.length + AUDIO.length; let done = 0;
  const tick = () => onProg(++done / total);
  const pImg = now.map(n => new Promise(res => { const i = new Image(); i.onload = i.onerror = () => { IMG[n] = i; tick(); res(); }; i.src = imgURL(n); }));
  later.forEach(n => { IMG[n] = new Image(); });
  const decode = async url => { const r = await fetch(url); if (!r.ok) throw new Error(r.status + ' ' + url); const ab = await r.arrayBuffer(); return new Promise((ok, no) => AC.decodeAudioData(ab, ok, no)); };
  const pAu = AUDIO.map(async n => {
    try { BUF[n] = await decode(auURL(n)).catch(e => { if (SRC[n] || !OGG) throw e; return decode(auURL(n, 'mp3')); }); DUR[n] = BUF[n].duration; }
    catch (e) { console.warn('audio', n, e); DUR[n] = 2; }
    tick();
  });
  await Promise.all([...pImg, ...pAu]);
  later.forEach(n => { IMG[n].src = imgURL(n); });
}
/* warm(): make sure these images are decoded before they first appear (IMG names or URLs). Resolves when done. */
function warm(list) { return Promise.all(list.map(n => { const im = typeof n === 'string' ? (IMG[n] || Object.assign(new Image(), { src: n })) : n; return im && im.decode ? im.decode().catch(() => { }) : null; })); }
window.warm = warm;
// ---------- audio unlock (Safari / iPad / embedded previews need this inside a real tap) ----------
let AUDIO_UNLOCKED = false; window.EDIT_PAUSED = false;
function unlockAudio() {
  if (!AC || window.EDIT_PAUSED) return;
  if (AC.state !== 'running') { try { AC.resume(); } catch (e) { } }
  if (!AUDIO_UNLOCKED) { try { const b = AC.createBuffer(1, 1, 22050), s = AC.createBufferSource(); s.buffer = b; s.connect(AC.destination); s.start(0); AUDIO_UNLOCKED = true; } catch (e) { } }
}
['pointerdown', 'touchend', 'mousedown', 'keydown', 'click'].forEach(ev => addEventListener(ev, unlockAudio, { capture: true, passive: true }));
document.addEventListener('visibilitychange', () => { if (!document.hidden) unlockAudio(); });
const soundPill = el('div', '', document.getElementById('stage'), '🔇 Tap for sound', { position: 'absolute', left: '34px', bottom: '30px', zIndex: 70, padding: '10px 22px 12px', borderRadius: '24px', background: '#b5361d', color: '#fff', fontFamily: 'Baloo', fontWeight: 800, fontSize: '28px', border: '4px solid #fff3d6', cursor: 'pointer', display: 'none' });
soundPill.addEventListener('click', e => { e.stopPropagation(); unlockAudio(); });
setInterval(() => { soundPill.style.display = (AC && AC.state !== 'running' && !window.EDIT_PAUSED && !document.getElementById('loader')) ? 'block' : 'none'; }, 500);
// ---------- audio ----------
const live = new Set();
function play(n, { bus = sfxBus, gain = 1, loop = false, offset = 0, rate = 1 } = {}) {
  if (!BUF[n] || !AC) return null;
  const s = AC.createBufferSource(); s.buffer = BUF[n]; s.loop = loop; s.playbackRate.value = rate;
  const g = AC.createGain(); g.gain.value = gain; s.connect(g); g.connect(bus);
  s.start(0, offset % BUF[n].duration); const h = { s, g, n }; live.add(h); s.onended = () => live.delete(h); return h;
}
const sfx = (n, gain = 1, rate = 1) => { if (!SKIPPING) play('sfx_' + n, { gain, rate }); };
let music = null;
function playMusic(n, { fade = 1.2, gain = 1, loop = true, offset = 0 } = {}) {
  if (music && music.n === n) return;
  const now = AC.currentTime;
  if (music) { const old = music; old.g.gain.cancelScheduledValues(now); old.g.gain.setValueAtTime(old.g.gain.value, now); old.g.gain.linearRampToValueAtTime(0, now + fade); setTimeout(() => { try { old.s.stop(); } catch (e) { } }, fade * 1000 + 100); }
  music = play(n, { bus: musicBus, gain: 0, loop, offset }); if (!music) return;
  music.g.gain.setValueAtTime(0, now); music.g.gain.linearRampToValueAtTime(gain, now + fade);
}
let voiceNow = null;
function voice(n) {
  if (SKIPPING) return;
  if (voiceNow) fadeStop(voiceNow, AC.currentTime);
  voiceNow = play(n, { bus: voiceBus, gain: 1.15 });
  const t = AC.currentTime, d = DUR[n] || 2;
  musicBus.gain.cancelScheduledValues(t); musicBus.gain.setValueAtTime(musicBus.gain.value, t);
  musicBus.gain.linearRampToValueAtTime(MUSIC_DUCK, t + 0.25); musicBus.gain.setValueAtTime(MUSIC_DUCK, t + d); musicBus.gain.linearRampToValueAtTime(MUSIC_LEVEL, t + d + 1.6);   // slow swell back: no pumping between lines
}
// fade a voice out over a few ms before stopping it (an instant stop clicks)
function fadeStop(h, t) { try { h.g.gain.cancelScheduledValues(t); h.g.gain.setValueAtTime(h.g.gain.value, t); h.g.gain.linearRampToValueAtTime(0, t + .03); h.s.stop(t + .04); } catch (e) { } }
function stopVoices() { const t = AC.currentTime; if (voiceNow) fadeStop(voiceNow, t); voiceNow = null; musicBus.gain.cancelScheduledValues(t); musicBus.gain.setValueAtTime(musicBus.gain.value, t); musicBus.gain.linearRampToValueAtTime(MUSIC_LEVEL, t + .4); }

// ---------- scene + camera ----------
let SKIPPING = false, CUR = null;
const skipBtn = $('#skip');
function newScene() {
  world.innerHTML = ''; ui.innerHTML = ''; P.length = 0;
  gsap.killTweensOf(world); gsap.set(world, { x: 0, y: 0, scale: 1, filter: 'none' });
  IDLE.forEach(t => t.kill()); IDLE.length = 0;
  return el('div', 'scene', world);
}
function bgImg(s, name, css = {}) { return el('div', 'bg', s, null, Object.assign({ width: (IMG[name].naturalWidth * 1080 / IMG[name].naturalHeight) + 'px', backgroundImage: `url(${IMG[name].src})` }, css)); }
// run a timeline as a skippable cutscene
function playTL(tl, { skippable = true } = {}) {
  return new Promise(res => {
    CUR = tl; tl.eventCallback('onComplete', () => { skipBtn.classList.remove('on'); CUR = null; res(); });
    if (skippable) skipBtn.classList.add('on');
    tl.play(0);
  });
}
skipBtn.addEventListener('click', e => {
  e.stopPropagation(); if (!CUR) return;
  SKIPPING = true; stopVoices(); CUR.progress(1); SKIPPING = false;
});
const SPEED = +(new URLSearchParams(location.search).get('speed') || 1); if (SPEED !== 1) gsap.globalTimeline.timeScale(SPEED);
const wait = s => new Promise(r => setTimeout(r, s * 1000 / SPEED));

// ---------- transitions ----------
const wipe = $('#wipe');
async function irisOut(x = 50, y = 50) { sfx('whoosh', .8); await gsap.fromTo(wipe, { clipPath: `circle(0% at ${x}% ${y}%)` }, { clipPath: `circle(150% at ${x}% ${y}%)`, duration: .7, ease: 'power3.in' }); }
async function irisIn(x = 50, y = 50) { await gsap.fromTo(wipe, { clipPath: `circle(150% at ${x}% ${y}%)` }, { clipPath: `circle(0% at ${x}% ${y}%)`, duration: .8, ease: 'power3.out' }); }

const fade = $('#fade');
async function fadeOut(d = .35) { await gsap.to(fade, { opacity: 1, duration: d, ease: 'power1.in' }); }
async function fadeIn(d = .4) { await gsap.to(fade, { opacity: 0, duration: d, ease: 'power1.out' }); }
// ---------- characters ----------
// talk: pose -> which mouth its overlay a/<key>_<pose>_m.webp shows ('open' or 'closed'); the pose image has the other one.
// cycles: frame loops a/<file>_<i>.webp facing right; h = frame height in stage px at scale 1, speed = travel px/s,
// fps = leg frames per second at that speed (the frame follows the distance, so slowing down slows the legs too),
// lift = px the frames sit up to match the standing poses' feet.
// acts: talking animations a/<file>_<i>.webp that play while a line is spoken (say(..., { act })): frames [0, intro) once,
// [intro, outro) loop while the voice plays, [outro, n) once at the end, then the character settles into a pose.
// mode 'pp' (sheets that don't loop back to frame 0): forward and back while talking, then glide back to frame 0.
// lift = px the frames sit up (negative = down) to put the feet on the same ground as the poses.
// (Mouth overlays and cycle frames are made from the ChatGPT sheets by art_package/tools/import_sheets.py.)
const CH = {
  pari: { name: 'Pari', h: 540, color: '#2f63c9', poses: ['idle', 'point', 'happy'], talk: { point: 'closed', happy: 'open' },
    cycles: { walk: { file: 'pari_walk', n: 20, h: 534.9, speed: 220, fps: 12, lift: 2 } },
    acts: { explain: { file: 'pari_explain', n: 36, h: 541.2, fps: 12, intro: 5, outro: 31 },
            cheer: { file: 'pari_cheer', n: 36, h: 539.5, fps: 15, mode: 'once' } } },   // claps (0–21), fist-pump (22–35)
  aaru: { name: 'Aaru', h: 480, color: '#e8701a', poses: ['run', 'shout', 'jump'], talk: { shout: 'closed', jump: 'closed' },
    cycles: { run: { file: 'aaru_run', n: 36, h: 462, speed: 420, fps: 9, lift: 5 } } },
  baba: { name: 'Baba', h: 620, color: '#8a5a2b', poses: ['idle', 'ask'], talk: { ask: 'closed' },
    acts: { talk: { file: 'baba_talk', n: 36, h: 621, fps: 14, mode: 'pp', lift: -1 } } },
  guddu: { name: 'Guddu Bhaiya', h: 640, color: '#3b8a46', poses: ['write', 'scratch', 'surprised', 'proud'], talk: { scratch: 'closed', surprised: 'closed', proud: 'open' },
    acts: { talk: { file: 'guddu_talk', n: 36, h: 650.2, fps: 10.5, mode: 'pp', lift: -6 } } },
  manju: { name: 'Manju Mausi', h: 580, color: '#c93b76', poses: ['teach'], acts: { talk: { file: 'manju_talk', n: 36, h: 585, fps: 10.5, mode: 'pp', lift: -3 } } },
  gudiya: { name: 'Gudiya', h: 250, color: '#b5361d', poses: ['idle', 'hop'], cycles: { trot: { file: 'gudiya_trot', n: 4, h: 229.2, speed: 300, fps: 8, lift: 3 } } },
};
Object.entries(CH).forEach(([k, c]) => {
  Object.keys(c.talk || {}).forEach(p => IMAGES.push(`${k}_${p}_m`));
  [...Object.values(c.cycles || {}), ...Object.values(c.acts || {})].forEach(cy => { for (let i = 0; i < cy.n; i++) IMAGES.push(`${cy.file}_${i}`); });
});
const IDLE = [];
function char(s, key, x, pose, { ground = 1030, flip = false, scale = 1, z = 5, name = key } = {}) {
  const lo = LI(name); x += lo.dx || 0; ground += lo.dy || 0; scale *= lo.s || 1; if (lo.flip != null) flip = lo.flip;
  const c = CH[key], wrap = el('div', 'char', s, null, { left: x + 'px', top: ground + 'px', zIndex: z });
  const body = el('div', 'body', wrap);
  el('div', 'shadow', body, null, { width: (key === 'gudiya' ? 200 : 230) + 'px' });
  const imgs = {}, mouths = {}, frames = {}, tf = 'translateX(-50%)' + (flip ? ' scaleX(-1)' : '');
  c.poses.forEach(p => { const i = el('img', '', body); i.src = IMG[key + '_' + p].src; i.style.height = c.h * scale + 'px'; if (flip) i.style.transform = tf; imgs[p] = i; });
  Object.keys(c.talk || {}).forEach(p => { const i = el('img', 'mouth', body); i.src = IMG[`${key}_${p}_m`].src; i.style.height = c.h * scale + 'px'; i.style.transform = tf; mouths[p] = i; });
  Object.entries(c.cycles || {}).forEach(([n, cy]) => { frames[n] = [...Array(cy.n)].map((_, j) => { const i = el('img', 'frame', body); i.src = IMG[`${cy.file}_${j}`].src; i.style.height = cy.h * scale + 'px'; i.style.bottom = cy.lift * scale + 'px'; return i; }); });
  Object.entries(c.acts || {}).forEach(([n, a]) => { frames[n] = [...Array(a.n)].map((_, j) => { const i = el('img', 'frame', body); i.src = IMG[`${a.file}_${j}`].src; i.style.height = a.h * scale + 'px'; i.style.bottom = (a.lift || 0) * scale + 'px'; i.style.transform = tf; return i; }); });
  imgs[pose].style.opacity = 1;
  const o = { key, c, wrap, body, imgs, mouths, frames, pose, x, ground, h: c.h * scale, scale, flip, moving: null, act: null };
  reg(wrap, name, 'char'); wrap._o = o; if (Object.keys(mouths).length) RESTERS.add(o);
  const br = gsap.to(body, { scaleY: 1.012, scaleX: .995, duration: 1.6 + Math.random() * .5, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  IDLE.push(br);
  gsap.set(wrap, { y: 0, x: 0 });
  return o;
}
function pose(tl, t, o, p, { hop = true } = {}) {
  tl.call(() => {
    Object.entries(o.imgs).forEach(([k, i]) => gsap.to(i, { opacity: k === p ? 1 : 0, duration: .14 }));
    o.pose = p;
  }, null, t);
  if (hop) tl.fromTo(o.body, { y: 0 }, { y: -10, duration: .22, yoyo: true, repeat: 1, ease: 'sine.inOut', immediateRender: false }, t);
}
function setPose(o, p) { Object.entries(o.imgs).forEach(([k, i]) => i.style.opacity = k === p ? 1 : 0); o.pose = p; }

// ---------- moving: walk / run / trot ----------
// move(): slides the character from x offset `from` to `to` (px, relative to where char() put them) while its cycle plays.
// The frame follows the distance travelled, so the feet stay planted at any speed or ease. The frames face right and are
// mirrored when moving left. enter: true puts them at `from` straight away (an entrance from off screen); otherwise they
// stand still until t (an exit). `end` = pose to settle into on arrival. dur = null -> distance / the cycle's speed.
// Returns the end time.
function cycleOn(o, cyc, dir) {
  if (o.act) { o.frames[o.act.name].forEach(i => i.style.opacity = 0); o.act = null; ACTORS.delete(o); }   // walking ends any talking act
  o.moving = cyc;
  Object.values(o.imgs).forEach(i => { gsap.killTweensOf(i); i.style.opacity = 0; });
  Object.values(o.mouths).forEach(i => i.style.opacity = 0);
  o.frames[cyc].forEach(i => i.style.transform = 'translateX(-50%)' + (dir < 0 ? ' scaleX(-1)' : ''));
}
function cycleOff(o, p) {
  if (!o.moving) return;
  o.frames[o.moving].forEach(i => i.style.opacity = 0); o.moving = null; setPose(o, p || o.pose);
}
function move(tl, t, o, cyc, from, to, dur = null, { ease = 'power1.inOut', end = null, enter = false } = {}) {
  const c = o.c.cycles && o.c.cycles[cyc];
  if (dur == null) dur = Math.abs(to - from) / ((c ? c.speed : 300) * o.scale);
  if (!c) { tl.fromTo(o.wrap, { x: from }, { x: to, duration: dur, ease, immediateRender: enter }, t); return t + dur; }
  const dir = to < from ? -1 : 1, step = c.speed / c.fps * o.scale;
  tl.fromTo(o.wrap, { x: from }, { x: to, duration: dur, ease, immediateRender: enter,
    onStart: () => cycleOn(o, cyc, dir),
    onUpdate: () => { if (!o.moving) cycleOn(o, cyc, dir); const k = Math.floor(Math.abs(gsap.getProperty(o.wrap, 'x') - from) / step) % c.n; o.frames[cyc].forEach((i, j) => i.style.opacity = j === k ? 1 : 0); },
    onComplete: () => cycleOff(o, end),
    onReverseComplete: () => cycleOff(o, null) }, t);
  return t + dur;
}

// ---------- acting while talking (e.g. Pari explaining) ----------
// actOn(): the act's intro plays, then its loop runs until actOff(), which plays the outro and settles into `end`.
// Clocked on the global GSAP timeline, so ?speed= and the editor's pause apply. Skip jumps straight to `end`.
const ACTORS = new Set();
const actClock = () => gsap.globalTimeline.time();
function actOn(o, name, end = null) {
  const a = o.c.acts && o.c.acts[name]; if (!a || o.moving) return;
  if (o.act && o.act.name === name && o.act.stopAt == null) return;      // already explaining: keep going
  if (o.act) o.frames[o.act.name].forEach(i => i.style.opacity = 0);
  Object.values(o.imgs).forEach(i => { gsap.killTweensOf(i); i.style.opacity = 0; });
  o.act = { name, a, t0: actClock(), stopAt: null, end, shown: -1 }; ACTORS.add(o);
}
function actDone(o) {
  if (!o.act) return; const { name, end } = o.act;
  o.frames[name].forEach(i => i.style.opacity = 0); o.act = null; ACTORS.delete(o); setPose(o, end || o.pose);
}
function actOff(o, end) { if (!o.act) return; o.act.end = end || o.pose; if (SKIPPING) actDone(o); else if (o.act.stopAt == null) o.act.stopAt = actClock(); }
gsap.ticker.add(() => {
  ACTORS.forEach(o => {
    if (!o.wrap.isConnected) { ACTORS.delete(o); return; }
    const A = o.act, a = A.a; let k;
    if (a.mode === 'once') { k = Math.floor((actClock() - A.t0) * a.fps); if (k >= a.n) { actDone(o); return; } }   // plays through once, then the end pose
    else if (a.mode === 'pp') {
      if (A.stopAt != null) { if (A.from == null) A.from = Math.max(0, A.shown); k = A.from - Math.floor((actClock() - A.stopAt) * a.fps * 3); if (k <= 0) { actDone(o); return; } }  // glide back to frame 0
      else { const f = Math.floor((actClock() - A.t0) * a.fps), P = 2 * (a.n - 1), m = f % P; k = m < a.n ? m : P - m; }
    } else {
      if (A.stopAt != null) k = a.outro + Math.floor((actClock() - A.stopAt) * a.fps);   // outro, then settle
      else { const f = Math.floor((actClock() - A.t0) * a.fps); k = f < a.intro ? f : a.intro + (f - a.intro) % (a.outro - a.intro); }
      if (k >= a.n) { actDone(o); return; }
    }
    if (k !== A.shown) { o.frames[A.name].forEach((i, j) => i.style.opacity = j === k ? 1 : 0); A.shown = k; }
  });
});

/* cheer(): play a one-shot act (e.g. Pari's clap + fist-pump) at time t on a timeline, then settle into `end` */
function cheer(tl, t, o, end = null, name = 'cheer') { tl.call(() => { talkOff(o); actOn(o, name, end); }, null, t); const a = o.c.acts && o.c.acts[name]; return t + (a ? a.n / a.fps : 0); }

// ---------- talking mouths ----------
// While a line plays, the speaker switches between the pose's own mouth and its overlay in step with the loudness of
// the voice (read from voiceBus). With no audio (muted / locked), the mouth flaps at a natural speech rhythm instead.
let voiceAn = null, voiceSamples = null;
const TALKERS = new Set();
/* RESTERS: everyone with mouth overlays. Several poses are drawn mid-shout with an open mouth (Aaru shout/jump, Guddu
   surprised/scratch, Baba ask, Pari point: CH.talk[pose] === 'closed' means the overlay is the CLOSED mouth). When that
   character is not speaking, the closed-mouth overlay stays on, so nobody looks like they are talking over someone else. */
const RESTERS = new Set();
function talkOn(o) { if (Object.keys(o.mouths).length) { o.mo = { open: false, since: 0 }; o.rest = undefined; TALKERS.add(o); } }
function talkOff(o) { TALKERS.delete(o); o.rest = undefined; Object.values(o.mouths).forEach(i => i.style.opacity = 0); }   // the RESTERS tick then shuts an open-mouth pose
function voiceLevel() {
  if (!voiceAn || !AC || AC.state !== 'running') return -1;   // audio locked / unavailable: flap at a speech rhythm
  if (!voiceNow) return 0;                                    // audio on but no line playing: the mouth stays shut
  voiceAn.getFloatTimeDomainData(voiceSamples); let s = 0;
  for (let i = 0; i < voiceSamples.length; i++) s += voiceSamples[i] * voiceSamples[i];
  return Math.sqrt(s / voiceSamples.length);
}
gsap.ticker.add(() => {
  RESTERS.forEach(o => {
    if (!o.wrap.isConnected) { RESTERS.delete(o); return; }
    if (TALKERS.has(o)) return;
    const want = !o.moving && !o.act && o.c.talk[o.pose] === 'closed' ? o.pose : null;
    if (want === o.rest) return; o.rest = want;
    Object.entries(o.mouths).forEach(([p, i]) => { i.style.opacity = p === want ? 1 : 0; });
  });
  if (!TALKERS.size || window.EDIT_PAUSED) return;
  const now = performance.now(), lv = voiceLevel(), ts = now / 1000;
  TALKERS.forEach(o => {
    if (!o.wrap.isConnected) { TALKERS.delete(o); return; }
    const m = o.mo;
    const want = lv < 0 ? Math.sin(ts * 26.4) + .7 * Math.sin(ts * 14.5 + 1) > .35   // ~4 syllables a second
      : (m.open ? lv > .02 : lv > .045);                                              // hysteresis: no flicker
    if (want !== m.open && now - m.since > 75) { m.open = want; m.since = now; }
    const alt = o.c.talk[o.pose];
    Object.entries(o.mouths).forEach(([p, i]) => { i.style.opacity = (!o.moving && !o.act && p === o.pose && (alt === 'open') === m.open) ? 1 : 0; });
  });
});
// talking bounce for d seconds
// ---------- acting: how each character moves while talking ----------
// period = one nod cycle (s), lift = nod height (px), lean = forward lean (deg), intro = the first emphasis beat
const ACT = {
  baba:   { period: 1.5, lift: 3, lean: 1.2, intro: 6 },   // slow, gentle elder
  pari:   { period: 1.1, lift: 4, lean: 1.8, intro: 9 },   // calm, confident
  guddu:  { period: .8, lift: 3, lean: -1, intro: 7, jitter: 1.2 },   // a little nervous
  aaru:   { period: .7, lift: 7, lean: 2.5, intro: 14 },   // energetic, but not frantic
  manju:  { period: 1.3, lift: 3, lean: 1.2, intro: 6 },
  gudiya: { period: .9, lift: 5, lean: 2, intro: 10 },
};
// line moods tweak the base style
const MOOD = {
  excited: { period: .85, lift: 1.3, intro: 1.4 }, calm: { period: 1.2, lift: .8, intro: .7 },
  explain: { period: 1.15, lift: .8, intro: .8 }, surprised: { period: .9, lift: 1.1, intro: 1.8 }, proud: { period: 1, lift: 1, intro: 1.3 },
};
const LINE_MOOD = { r1: 'excited', r2: 'excited', r3: 'excited', p2: 'explain', p4: 'calm', p5: 'calm', b1: 'calm', g2: 'surprised', g3: 'proud', p6: 'proud' };
function talk(tl, t, o, d, id) {
  const a = Object.assign({ jitter: 0 }, ACT[o.key] || ACT.pari), m = MOOD[LINE_MOOD[id]] || {};
  const period = a.period * (m.period || 1), lift = a.lift * (m.lift || 1), intro = a.intro * (m.intro || 1);
  const dir = o.flip ? -1 : 1, lean = a.lean * dir;
  // 1) one clear emphasis beat as the line starts (a small lift and lean toward the listener)
  tl.to(o.body, { y: -intro, rotate: lean, duration: .42, ease: 'power2.out' }, t);
  tl.to(o.body, { y: -lift * .5, rotate: lean * .6, duration: .5, ease: 'sine.inOut' }, t + .42);
  // 2) slow, soft nods for the rest of the line
  const n = Math.max(0, Math.floor((d - 1) / period));
  if (n > 0) tl.to(o.body, { y: -lift, rotate: lean * .6 + a.jitter * dir, duration: period / 2, yoyo: true, repeat: n * 2 - 1, ease: 'sine.inOut' }, t + .92);
  // 3) settle back to neutral
  tl.to(o.body, { y: 0, rotate: 0, duration: .6, ease: 'power2.inOut' }, t + Math.max(.92 + n * period, d - .2));
}
// a proper jump: fast up, slower hang, soft landing (repeat = number of jumps)
function jump(tl, t, o, h = 70, times = 2, up = .32) {
  for (let i = 0; i < times; i++) {
    const t0 = t + i * (up * 2.3);
    tl.to(o.body, { y: -h, duration: up, ease: 'power2.out' }, t0);
    tl.to(o.body, { y: 0, duration: up * 1.1, ease: 'power2.in' }, t0 + up);
    tl.fromTo(o.body, { scaleY: .94 }, { scaleY: 1, duration: .25, ease: 'back.out(3)', immediateRender: false }, t0 + up * 2.1);
  }
}
// ---------- dialogue ----------
// dialogue box shapes (native px): body inner text rect + tail tip
const DB = {
  db5: { w: 572, h: 235, tip: [565, 217], box: [84, 30, 478, 178] },   // pill, tail bottom-right
  db7: { w: 592, h: 235, tip: [585, 217], box: [46, 30, 508, 180] },   // rect, tail bottom-right
  db8: { w: 458, h: 281, tip: [55, 264], box: [40, 30, 420, 180] },    // rect, tail bottom-left
  db6: { w: 322, h: 273, tip: [292, 256], box: [62, 68, 262, 196] },   // oval, tail bottom-right
};
const measurer = el('div', 'bubble', stage, '<div class="txt"><div></div></div>', { visibility: 'hidden', left: '-3000px', top: '0' });
function fitScale(shape, html) {
  const d = DB[shape], t = measurer.firstChild, inner = t.firstChild; inner.innerHTML = html;
  const bw = d.box[2] - d.box[0], bh = d.box[3] - d.box[1];
  for (let k = 1; k <= 2.6; k += .05) { t.style.width = bw * k + 'px'; t.style.height = 'auto'; if (inner.offsetHeight <= bh * k - 6) return k; }
  return 2.6;
}
/* side: 'L' / 'R' forces which way the bubble opens (default: away from the stage edge the speaker is near). Use 'R' for a
   speaker left of centre whose bubble would cover someone on the right (bridge2: Pari's p5 opens to the left, Guddu stays clear). */
function bubbleFor(s, o, text, side = null) {
  const onLeft = side ? side === 'L' : o.x < W / 2, plain = text.replace(/<[^>]+>/g, '');
  let shape;
  if (plain.length <= 30) shape = 'db6';
  else if (onLeft) shape = (o.key === 'aaru' || o.key === 'guddu') ? 'db5' : 'db8';
  else shape = (o.key === 'aaru' || o.key === 'guddu') ? 'db5' : 'db7';
  const d = DB[shape];
  // mirror when the tail points the wrong way for this side
  const tailRight = d.tip[0] > d.w / 2, mirror = onLeft ? tailRight : !tailRight;
  const words = text.split(' ').map(w => `<span class="w">${w}</span>`).join(' ');
  const k = fitScale(shape, words);
  const bw = d.w * k, bh = d.h * k;
  const tipX = (mirror ? d.w - d.tip[0] : d.tip[0]) * k, tipY = d.tip[1] * k;
  const bx0 = (mirror ? d.w - d.box[2] : d.box[0]) * k, by0 = d.box[1] * k;
  const b = el('div', 'bubble', s, null, { width: bw + 'px', height: bh + 'px' });
  const img = el('img', 'db', b); img.src = IMG[shape].src; if (mirror) img.style.transform = 'scaleX(-1)';
  const tx = el('div', 'txt', b, `<div>${words}</div>`, { left: bx0 + 'px', top: by0 + 'px', width: (d.box[2] - d.box[0]) * k + 'px', height: (d.box[3] - d.box[1]) * k + 'px' });
  // aim tail tip just above the speaker's head
  const headX = o.x + (onLeft ? 30 : -30), headY = o.ground - o.h - 6;
  let left = headX - tipX, top = headY - tipY;
  left = Math.max(24, Math.min(W - bw - 24, left));
  top = Math.max(left + bw > 1560 ? 210 : 115, top);
  b.style.left = left + 'px'; b.style.top = top + 'px';
  b.style.setProperty('--ox', tipX + 'px'); b.style.setProperty('--oy', tipY + 'px');
  gsap.set(b, { opacity: 0, scale: .5 });
  return b;
}
// say: bubble + voice + typewriter + bounce. returns end time
// act: play that talking animation (CH[key].acts) for the line instead of the pose + mouth; end = pose to settle into.
function say(tl, s, t, id, o, text, { gap = .35, hold = .15, p = null, act = null, end = null, side = null } = {}) {
  text = LAYOUT.text[id] || text;
  const d = DUR[id] || 2.5, b = reg(bubbleFor(s, o, text, side), 'bubble_' + id), ws = b.querySelectorAll('.w');
  if (p) pose(tl, t - .05, o, p);
  tl.to(b, { opacity: 1, scale: 1, duration: .32, ease: 'back.out(2.4)' }, t);
  tl.call(() => { voice(id); sfx('bubble', .5); talkOn(o); }, null, t + .05);
  tl.call(() => talkOff(o), null, t + d + .08);
  if (act) { tl.call(() => actOn(o, act), null, t); tl.call(() => actOff(o, end), null, t + d + .08); }
  tl.to(ws, { opacity: 1, duration: .08, stagger: Math.max(.04, (d * .88) / ws.length) }, t + .1);
  talk(tl, t + .05, o, d, id);
  tl.to(b, { opacity: 0, scale: .85, y: -14, duration: .25, ease: 'power2.in' }, t + d + hold);
  return t + d + hold + gap;
}
// voiceOver: the narrator is voice only, with no text on screen. Same timing as narrate(): the voice starts at t+.1,
// and it returns t + duration + .75, the moment the next beat may start.
function voiceOver(tl, t, id) { const d = DUR[id] || 3; tl.call(() => voice(id), null, t + .1); return t + d + .75; }
// narrate: the parchment narrator panel (text on screen). Not used by the story any more; kept for reference.
function narrate(tl, t, id, text, { gap = .4 } = {}) {
  text = LAYOUT.text[id] || text;
  const d = DUR[id] || 3, n = reg(el('div', 'narr', ui), 'narrator_' + id);
  el('div', 'tag', n, 'NARRATOR');
  const words = text.split(' ').map(w => `<span class="w">${w}</span>`).join(' ');
  el('div', 'txt', n, words); const ws = n.querySelectorAll('.w');
  gsap.set(n, { yPercent: -160, opacity: 0 });
  tl.to(n, { yPercent: 0, opacity: 1, duration: .5, ease: 'back.out(1.6)' }, t);
  tl.call(() => { voice(id); sfx('paper', .6); }, null, t + .1);
  tl.to(ws, { opacity: 1, duration: .1, stagger: Math.max(.04, (d * .9) / ws.length) }, t + .2);
  tl.to(n, { yPercent: -160, opacity: 0, duration: .4, ease: 'power2.in' }, t + d + .35);
  return t + d + .35 + gap;
}
// hanging wooden sign
function sign(parent, html, x, y, size = 56, name = 'sign') {
  const s = reg(el('div', 'sign', parent, null, { left: x + 'px', top: y + 'px' }), name);
  const b = el('div', 'board', s, html, { fontSize: size + 'px' });
  const r1 = el('div', 'rope', s, null, { left: '40px' }), r2 = el('div', 'rope', s, null, { right: '40px' });
  gsap.set(s, { xPercent: -50, y: -700, rotate: 0 });
  return s;
}
function dropSign(tl, t, s) {
  tl.to(s, { y: 0, duration: .9, ease: 'bounce.out' }, t);
  tl.fromTo(s, { rotate: -5 }, { rotate: 0, duration: 2.2, ease: 'elastic.out(1,0.3)', immediateRender: false }, t + .6);
  tl.call(() => sfx('stamp', .7), null, t + .45);
}
// ---------- HUD ----------
const SUN = { p: 0 };
function sunTracker() {
  const d = el('div', 'sun', hud, `<svg viewBox="0 0 290 160" width="290" height="160">
    <rect x="3" y="3" width="284" height="154" rx="26" fill="#fffaf0" stroke="#3a220f" stroke-width="5"/>
    <path d="M30 128 Q145 -10 260 128" fill="none" stroke="#e8c27a" stroke-width="6" stroke-dasharray="4 12" stroke-linecap="round"/>
    <rect x="20" y="126" width="250" height="10" rx="5" fill="#7a9a3c"/>
    <g id="sunG"><circle r="22" fill="#ffb52e" stroke="#e8701a" stroke-width="4"/>
      <g stroke="#ffb52e" stroke-width="5" stroke-linecap="round">${[...Array(8)].map((_, i) => { const a = i * Math.PI / 4; return `<line x1="${Math.cos(a) * 30}" y1="${Math.sin(a) * 30}" x2="${Math.cos(a) * 38}" y2="${Math.sin(a) * 38}"/>` }).join('')}</g></g>
    <text x="145" y="30" text-anchor="middle" font-family="Baloo" font-weight="800" font-size="22" fill="#3a220f">SUNSET</text></svg>`);
  return d;
}
const sunEl = sunTracker();
function sunPos(p) {
  const t = p, x = (1 - t) * (1 - t) * 30 + 2 * (1 - t) * t * 145 + t * t * 260, y = (1 - t) * (1 - t) * 128 + 2 * (1 - t) * t * -10 + t * t * 128;
  const g = sunEl.querySelector('#sunG'); g.setAttribute('transform', `translate(${x},${Math.min(y, 124)})`);
  g.querySelector('circle').setAttribute('fill', p > .8 ? '#ff7a2e' : '#ffb52e');
}
function sunTo(tl, t, p, dur = 2) { tl.to(SUN, { p, duration: dur, ease: 'sine.inOut', onUpdate: () => sunPos(SUN.p) }, t); }
sunPos(0);
const MARI = `<svg viewBox="-32 -32 64 64">${[...Array(12)].map((_, i) => `<ellipse rx="10" ry="19" transform="rotate(${i * 30}) translate(0,-13)" fill="currentColor" stroke="#7a3a08" stroke-width="2"/>`).join('')}<circle r="10" fill="#b84a0a" stroke="#7a3a08" stroke-width="2"/></svg>`;
const flowers = el('div', 'flowers', hud, [...Array(7)].map(() => MARI).join(''));
const flowerEls = [...flowers.children];
function setFlowers(n) { flowerEls.forEach((f, i) => { f.style.color = i < n ? '#ffa31a' : '#d9cbb0'; f.style.filter = i < n ? 'drop-shadow(0 0 8px #ffcf4a)' : 'none'; }); }
setFlowers(0);
const chip = el('div', 'chip', hud, '');

// ---------- particles (petals / confetti / fireworks / jalebi) ----------
const fx = $('#fx'), fxc = fx.getContext('2d'); fx.width = W; fx.height = H;
const P = [];
function petals(n = 40, { y0 = -40, spread = W, x0 = 0 } = {}) {
  for (let i = 0; i < n; i++) P.push({ k: 'petal', x: x0 + Math.random() * spread, y: y0 - Math.random() * 600, vx: (Math.random() - .5) * 40, vy: 60 + Math.random() * 80, r: Math.random() * 6.28, vr: (Math.random() - .5) * 3, s: 8 + Math.random() * 10, c: ['#ffa31a', '#ffcf3a', '#e8570e', '#fff0a0'][i % 4], life: 12 });
}
function confetti(n = 160, x = W / 2, y = H * .35) {
  for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, v = 400 + Math.random() * 700; P.push({ k: 'conf', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 400, r: Math.random() * 6.28, vr: (Math.random() - .5) * 12, s: 10 + Math.random() * 10, c: ['#ffa31a', '#2f63c9', '#e33b6b', '#3bb36b', '#ffd83a', '#9b5de5'][i % 6], life: 5 }); }
}
/* a firework: a bright flash + a ring of glowing streaks (drawn additively, no shadowBlur) + a few white glitters */
function firework(x, y, c, big = 1) {
  P.push({ k: 'flash', x, y, vx: 0, vy: 0, s: 190 * big, c, life: .55, max: .55 });
  const n = Math.round(90 * big);
  for (let i = 0; i < n; i++) { const a = i / n * 6.28 + Math.random() * .05, v = (320 + Math.random() * 200) * big; P.push({ k: 'fw', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, s: 4.6 + Math.random() * 2, c, life: 1.6 + Math.random() * .7 }); }
  for (let i = 0; i < 26; i++) { const a = Math.random() * 6.28, v = Math.random() * 170 * big; P.push({ k: 'fw', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, s: 2.2, c: '#fffbe6', life: 1 + Math.random() * .8 }); }
}
function jalebis(n = 26) { for (let i = 0; i < n; i++) P.push({ k: 'jal', x: 80 + Math.random() * (W - 160), y: -60 - Math.random() * 500, vx: 0, vy: 260 + Math.random() * 160, r: Math.random() * 6.28, vr: (Math.random() - .5) * 4, s: 26 + Math.random() * 16, life: 6 }); }
/* a jalebi: a thick syrupy orange spiral with a dark crisp edge and a glossy highlight (it read as a thin scribble before) */
function drawJalebi(s) {
  fxc.lineCap = 'round'; fxc.lineJoin = 'round'; fxc.beginPath();
  for (let a = 0; a < 6.28 * 2.4; a += .18) { const r = s * .15 * a / 1.2; const px = Math.cos(a) * r, py = Math.sin(a) * r; a ? fxc.lineTo(px, py) : fxc.moveTo(px, py); }
  fxc.lineWidth = s * .42; fxc.strokeStyle = '#8a3d05'; fxc.stroke();
  fxc.lineWidth = s * .3; fxc.strokeStyle = '#f39a1e'; fxc.stroke();
  fxc.lineWidth = s * .09; fxc.strokeStyle = 'rgba(255,238,175,.9)'; fxc.stroke();
}
let lastT = performance.now();
function fxLoop(now) {
  const dt = Math.min(.05, (now - lastT) / 1000); lastT = now;
  fxc.clearRect(0, 0, W, H);
  for (let i = P.length - 1; i >= 0; i--) {
    const p = P[i]; p.life -= dt; if (p.life <= 0 || p.y > H + 80) { P.splice(i, 1); continue; }
    if (p.k === 'petal') { p.vx += Math.sin(now / 600 + i) * 4 * dt * 10; }
    if (p.k === 'conf') { p.vy += 900 * dt; p.vx *= .985; }
    if (p.k === 'spark') { p.vy += 120 * dt; p.vx *= .97; p.vy *= .97; }
    if (p.k === 'fw') { p.vy += 95 * dt; p.vx *= .962; p.vy *= .962; }
    p.x += p.vx * dt; p.y += p.vy * dt; p.r = (p.r || 0) + (p.vr || 0) * dt;
    fxc.save(); fxc.translate(p.x, p.y); fxc.rotate(p.r || 0);
    if (p.k === 'petal') { fxc.fillStyle = p.c; fxc.beginPath(); fxc.ellipse(0, 0, p.s * .45, p.s, 0, 0, 6.28); fxc.fill(); }
    else if (p.k === 'conf') { fxc.fillStyle = p.c; fxc.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); }
    else if (p.k === 'spark') { fxc.globalAlpha = Math.min(1, p.life); fxc.fillStyle = p.c; fxc.shadowColor = p.c; fxc.shadowBlur = 12; fxc.beginPath(); fxc.arc(0, 0, p.s, 0, 6.28); fxc.fill(); }
    else if (p.k === 'jal') drawJalebi(p.s);
    else if (p.k === 'fw') {   // a glowing streak along its motion
      const al = Math.min(1, p.life * 1.4); fxc.globalCompositeOperation = 'lighter'; fxc.lineCap = 'round';
      fxc.globalAlpha = al * .55; fxc.strokeStyle = p.c; fxc.lineWidth = p.s * 3.6; fxc.beginPath(); fxc.moveTo(0, 0); fxc.lineTo(-p.vx * .08, -p.vy * .08); fxc.stroke();
      fxc.globalAlpha = al; fxc.lineWidth = p.s; fxc.strokeStyle = p.c; fxc.stroke();
      fxc.globalAlpha = al * .9; fxc.fillStyle = '#fffbe6'; fxc.beginPath(); fxc.arc(0, 0, p.s * .55, 0, 6.28); fxc.fill();
    } else if (p.k === 'flash') {
      const k = 1 - p.life / p.max, r = p.s * (.4 + k), g = fxc.createRadialGradient(0, 0, 0, 0, 0, r);
      g.addColorStop(0, `rgba(255,250,225,${.85 * (1 - k)})`); g.addColorStop(1, 'rgba(255,220,150,0)');
      fxc.globalCompositeOperation = 'lighter'; fxc.fillStyle = g; fxc.beginPath(); fxc.arc(0, 0, r, 0, 6.28); fxc.fill();
    }
    fxc.restore();
  }
  requestAnimationFrame(fxLoop);
}
requestAnimationFrame(fxLoop);
// floating numbers around a point
// thoughts: numbers that pop out of a character's head and hang around it (their muddle), each at the time it is said.
// Slots that would overlap `avoid` (their speech bubble) or leave the stage are skipped. At `until` they are sucked into `sinkTo`.
function thoughts(s, tl, o, items, { avoid = null, until = null, sinkTo = null } = {}) {
  const hx = o.x, hy = o.ground - o.h * .84, M = 24;
  const bx = avoid && { l: parseFloat(avoid.style.left) - M, t: parseFloat(avoid.style.top) - M, r: parseFloat(avoid.style.left) + parseFloat(avoid.style.width) + M, b: parseFloat(avoid.style.top) + parseFloat(avoid.style.height) + M };
  const slots = [[-280, -30], [240, -10], [-310, 95], [255, 110], [-240, -140], [215, -140], [-330, 210], [265, 220]]
    .map(([dx, dy]) => ({ x: hx + dx, y: hy + dy }))
    .filter(p => { const l = p.x - 150, r = p.x + 150, t = p.y - 36, b = p.y + 36;
      return l > 40 && r < W - 40 && t > 40 && (!bx || r < bx.l || l > bx.r || b < bx.t || t > bx.b); });
  items.forEach(({ txt, at }, i) => {
    const p = slots[i % slots.length], n = el('div', 'numfloat', s, txt, { left: p.x + 'px', top: p.y + 'px', zIndex: 21 });
    gsap.set(n, { xPercent: -50, yPercent: -50, opacity: 0, scale: .3, x: hx - p.x, y: hy - p.y });
    tl.to(n, { opacity: 1, scale: 1, x: 0, y: 0, rotate: (i % 2 ? 1 : -1) * (5 + i * 2), duration: .55, ease: 'back.out(2)' }, at);
    tl.to(n, { y: -16, duration: 1.1, yoyo: true, repeat: 3, ease: 'sine.inOut' }, at + .55);
    if (until != null) tl.to(n, { x: (sinkTo || { x: hx }).x - p.x, y: (sinkTo || { y: hy }).y - p.y, scale: .15, opacity: 0, rotate: 0, duration: .45, ease: 'power2.in', overwrite: 'auto' }, Math.max(until + i * .07, at + .7));   // a number lands in its slot before it is sucked away (the last one used to cross his face and vanish)
  });
}
function numbers(s, tl, t, list, cx, cy, dur = 4) {
  list.forEach((txt, i) => {
    const n = el('div', 'numfloat', s, txt, { left: cx + 'px', top: cy + 'px' });
    gsap.set(n, { opacity: 0, xPercent: -50 });
    const a = -2.4 + i * (1.6 / Math.max(1, list.length - 1)) * 1.6, r = 230 + (i % 2) * 60;
    tl.to(n, { opacity: 1, x: Math.cos(a) * r, y: Math.sin(a) * r * .7 - 60, rotate: (Math.random() - .5) * 20, duration: .6, ease: 'back.out(2)' }, t + i * .35);
    tl.to(n, { y: '-=30', duration: 1.4, yoyo: true, repeat: 1, ease: 'sine.inOut' }, t + i * .35 + .6);
    tl.to(n, { opacity: 0, scale: .6, duration: .4 }, t + dur);
  });
}
const shaker = $('#shaker');
function birds(s, n = 5, y = 140) {
  for (let i = 0; i < n; i++) {
    const b = el('div', 'bird', s, '<svg viewBox="0 0 46 20"><path d="M2 12 Q12 0 23 12 Q34 0 44 12" fill="none" stroke="#3a2a1a" stroke-width="3.5" stroke-linecap="round"/></svg>', { left: '-80px', top: (y + (i % 3) * 40 + Math.random() * 30) + 'px', transform: `scale(${.7 + Math.random() * .6})` });
    gsap.to(b.firstChild, { scaleY: -.6, duration: .22 + Math.random() * .08, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.fromTo(b, { x: -100 - i * 70 }, { x: 2100, y: '-=' + (40 + Math.random() * 80), duration: 16 + Math.random() * 6, ease: 'none', repeat: -1, delay: i * .4 });
  }
}
function dust(tl, s, t, x, y, n = 5) {
  for (let i = 0; i < n; i++) { const d = el('div', 'dust', s, null, { left: x + 'px', top: y + 'px' }); gsap.set(d, { opacity: 0, scale: .3 });
    tl.fromTo(d, { opacity: .8, scale: .3, x: 0, y: 0 }, { opacity: 0, scale: 1.6 + Math.random(), x: -60 - Math.random() * 80, y: -30 - Math.random() * 30, duration: .9, ease: 'power2.out', immediateRender: false }, t + i * .18); }
}
function shake(tl, t, amp = 12) { tl.fromTo(shaker, { x: 0 }, { x: amp, duration: .05, yoyo: true, repeat: 7, ease: 'none', immediateRender: false }, t); tl.set(shaker, { x: 0 }, t + .42); }

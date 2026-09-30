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
  'sfx_rise', 'sfx_scribble', 'sfx_sparkle', 'sfx_stamp', 'sfx_swish', 'sfx_tick', 'sfx_whoosh', 'sfx_goat',
  't0', 'n1', 'b1', 'g1', 'n2', 'r1', 'p1', 'p2', 'p3', 'r2', 'p4', 'g2', 'p5', 'n3', 'g3', 'p6', 'r3', 'n4', 'x1'];
const SRC = window.EMBED || {};
const imgURL = n => SRC[n] || `a/${n}.webp`;
// audio: Ogg Opus first (smaller), MP3 fallback for browsers that can't decode it (older Safari / iOS)
const OGG = !!document.createElement('audio').canPlayType('audio/ogg; codecs="opus"');
const auURL = (n, ext = OGG ? 'ogg' : 'mp3') => SRC[n] || `au/${n}.${ext}`;
let AC, master, musicBus, voiceBus, sfxBus;
async function loadAll(onProg) {
  AC = new (window.AudioContext || window.webkitAudioContext)();
  master = AC.createGain(); master.connect(AC.destination);
  musicBus = AC.createGain(); musicBus.gain.value = 0.55; musicBus.connect(master);
  voiceBus = AC.createGain(); voiceBus.gain.value = 1.0; voiceBus.connect(master);
  sfxBus = AC.createGain(); sfxBus.gain.value = 0.7; sfxBus.connect(master);
  const total = IMAGES.length + AUDIO.length; let done = 0;
  const tick = () => onProg(++done / total);
  const pImg = IMAGES.map(n => new Promise(res => { const i = new Image(); i.onload = i.onerror = () => { IMG[n] = i; tick(); res(); }; i.src = imgURL(n); }));
  const decode = async url => { const r = await fetch(url); if (!r.ok) throw new Error(r.status + ' ' + url); const ab = await r.arrayBuffer(); return new Promise((ok, no) => AC.decodeAudioData(ab, ok, no)); };
  const pAu = AUDIO.map(async n => {
    try { BUF[n] = await decode(auURL(n)).catch(e => { if (SRC[n] || !OGG) throw e; return decode(auURL(n, 'mp3')); }); DUR[n] = BUF[n].duration; }
    catch (e) { console.warn('audio', n, e); DUR[n] = 2; }
    tick();
  });
  await Promise.all([...pImg, ...pAu]);
}
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
  if (voiceNow) try { voiceNow.s.stop(); } catch (e) { }
  voiceNow = play(n, { bus: voiceBus, gain: 1.15 });
  const t = AC.currentTime, d = DUR[n] || 2;
  musicBus.gain.cancelScheduledValues(t); musicBus.gain.setValueAtTime(musicBus.gain.value, t);
  musicBus.gain.linearRampToValueAtTime(0.2, t + 0.25); musicBus.gain.setValueAtTime(0.2, t + d); musicBus.gain.linearRampToValueAtTime(0.55, t + d + 0.8);
}
function stopVoices() { if (voiceNow) try { voiceNow.s.stop(); } catch (e) { } voiceNow = null; const t = AC.currentTime; musicBus.gain.cancelScheduledValues(t); musicBus.gain.setValueAtTime(0.55, t); }

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
const CH = {
  pari: { name: 'Pari', h: 540, color: '#2f63c9', poses: ['idle', 'point', 'happy'] },
  aaru: { name: 'Aaru', h: 480, color: '#e8701a', poses: ['run', 'shout', 'jump'] },
  baba: { name: 'Baba', h: 620, color: '#8a5a2b', poses: ['idle', 'ask'] },
  guddu: { name: 'Guddu Bhaiya', h: 640, color: '#3b8a46', poses: ['write', 'scratch', 'surprised', 'proud'] },
  manju: { name: 'Manju Mausi', h: 580, color: '#c93b76', poses: ['teach'] },
  gudiya: { name: 'Gudiya', h: 250, color: '#b5361d', poses: ['idle', 'hop'] },
};
const IDLE = [];
function char(s, key, x, pose, { ground = 1030, flip = false, scale = 1, z = 5, name = key } = {}) {
  const lo = LI(name); x += lo.dx || 0; ground += lo.dy || 0; scale *= lo.s || 1; if (lo.flip != null) flip = lo.flip;
  const c = CH[key], wrap = el('div', 'char', s, null, { left: x + 'px', top: ground + 'px', zIndex: z });
  const body = el('div', 'body', wrap);
  el('div', 'shadow', body, null, { width: (key === 'gudiya' ? 200 : 230) + 'px' });
  const imgs = {};
  c.poses.forEach(p => { const i = el('img', '', body); i.src = IMG[key + '_' + p].src; i.style.height = c.h * scale + 'px'; if (flip) i.style.transform = 'translateX(-50%) scaleX(-1)'; imgs[p] = i; });
  imgs[pose].style.opacity = 1;
  const o = { key, c, wrap, body, imgs, pose, x, ground, h: c.h * scale, flip };
  reg(wrap, name, 'char'); wrap._o = o;
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
function bubbleFor(s, o, text) {
  const onLeft = o.x < W / 2, plain = text.replace(/<[^>]+>/g, '');
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
function say(tl, s, t, id, o, text, { gap = .35, hold = .15, p = null } = {}) {
  text = LAYOUT.text[id] || text;
  const d = DUR[id] || 2.5, b = reg(bubbleFor(s, o, text), 'bubble_' + id), ws = b.querySelectorAll('.w');
  if (p) pose(tl, t - .05, o, p);
  tl.to(b, { opacity: 1, scale: 1, duration: .32, ease: 'back.out(2.4)' }, t);
  tl.call(() => { voice(id); sfx('bubble', .5); }, null, t + .05);
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
function firework(x, y, c) {
  for (let i = 0; i < 70; i++) { const a = i / 70 * 6.28, v = 220 + Math.random() * 160; P.push({ k: 'spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, s: 3 + Math.random() * 2, c, life: 1.6 + Math.random() * .6 }); }
}
function jalebis(n = 26) { for (let i = 0; i < n; i++) P.push({ k: 'jal', x: 80 + Math.random() * (W - 160), y: -60 - Math.random() * 500, vx: 0, vy: 260 + Math.random() * 160, r: Math.random() * 6.28, vr: (Math.random() - .5) * 4, s: 26 + Math.random() * 16, life: 6 }); }
function drawJalebi(s) {
  fxc.lineWidth = s * .28; fxc.strokeStyle = '#f08a12'; fxc.lineCap = 'round'; fxc.beginPath();
  for (let a = 0; a < 6.28 * 2.6; a += .2) { const r = s * .12 * a / 1.2; const px = Math.cos(a) * r, py = Math.sin(a) * r; a ? fxc.lineTo(px, py) : fxc.moveTo(px, py); }
  fxc.stroke(); fxc.lineWidth = s * .1; fxc.strokeStyle = 'rgba(255,230,140,.8)'; fxc.stroke();
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
    p.x += p.vx * dt; p.y += p.vy * dt; p.r = (p.r || 0) + (p.vr || 0) * dt;
    fxc.save(); fxc.translate(p.x, p.y); fxc.rotate(p.r || 0);
    if (p.k === 'petal') { fxc.fillStyle = p.c; fxc.beginPath(); fxc.ellipse(0, 0, p.s * .45, p.s, 0, 0, 6.28); fxc.fill(); }
    else if (p.k === 'conf') { fxc.fillStyle = p.c; fxc.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); }
    else if (p.k === 'spark') { fxc.globalAlpha = Math.min(1, p.life); fxc.fillStyle = p.c; fxc.shadowColor = p.c; fxc.shadowBlur = 12; fxc.beginPath(); fxc.arc(0, 0, p.s, 0, 6.28); fxc.fill(); }
    else if (p.k === 'jal') drawJalebi(p.s);
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
    if (until != null) tl.to(n, { x: (sinkTo || { x: hx }).x - p.x, y: (sinkTo || { y: hy }).y - p.y, scale: .15, opacity: 0, rotate: 0, duration: .45, ease: 'power2.in', overwrite: 'auto' }, until + i * .07);
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

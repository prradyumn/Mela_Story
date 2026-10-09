// ================= STORY: The Mela Before Sunset =================
const TXT = {
  n1: 'It’s Mela day in Apnapur! It starts in the evening. There will be lights, sweets and a big giant wheel. The Panchayat has ₹6,00,000 to buy things for setting up shops in the Mela. All items need to be bought before the sun goes down.',
  b1: 'Guddu, is our money enough?',
  g1: 'Wait… 42,538 plus 23,184… carry one… Let me write it all down!',
  n2: 'Guddu Bhaiya will take forever if he keeps adding like this. The sun will set soon.',
  r1: 'Easy! The total is ten crore!',
  p1: 'Aaru, that is a wild guess. Let’s make a smart guess.',
  p2: 'First, we change each price to a round number. Round numbers are easy to add. A smart guess like this is called an estimate.',
  p3: 'Come! Let’s go to the bazaar.',
  r2: 'All the prices are round numbers now! Yayy!',
  p4: 'Well done! The shopkeepers sent their bills to the Panchayat office. Let’s check them.',
  g2: 'All seven bills done? So fast? I am still on page two!',
  p5: 'Bhaiya… You find out the exact amount. By that time, we will get the items for the mela shops. The shopkeepers are waiting at the Mela Ground. Let’s go and pay them.',
  n3: 'The sun goes down. The Mela lights are finally on! The giant wheel starts to turn. We bought everything, and there is still money left.',
  g3: 'I finished! Exactly ₹83,165 is left.',   // Oct 2026: matches the L3 bills (₹6,00,000 − ₹5,16,835); g3 voice must say this too
  p6: 'We said about ₹84,000. That is nearly the same!',
  r3: 'Yayy! Now jalebees for everyone!',
  n4: 'The Sarpanch gives you a gold badge.',
};
const inr = v => '₹' + Math.round(v).toString().replace(/(\d)(?=(\d\d)+\d$)/g, '$1,');
function warmTint(s, a) { return el('div', 'tint', s, null, { background: 'linear-gradient(180deg,rgba(255,120,30,.55),rgba(255,170,60,.25) 55%,rgba(120,40,0,.25))', mixBlendMode: 'multiply', opacity: a }); }
function goButton(parent, label, x, y) {
  const b = el('div', 'btn', parent, label, { left: x + 'px', top: y + 'px' });
  gsap.set(b, { xPercent: -50, scale: 0 });
  b.addEventListener('pointerdown', () => gsap.to(b, { y: 8, duration: .08 }));
  ['pointerup', 'pointerleave'].forEach(ev => b.addEventListener(ev, () => gsap.to(b, { y: 0, duration: .15, ease: 'back.out(3)' })));
  return b;
}
function waitClick(node) { return new Promise(r => node.addEventListener('click', e => { e.stopPropagation(); AC.resume(); sfx('pop'); r(); }, { once: true })); }

// office: counter + chairs drawn over anyone standing behind the counter
function officeFG(s) { return el('div', 'bg', s, null, { left: '0px', width: '1919px', backgroundImage: `url(${IMG.office_fg.src})`, zIndex: 7, pointerEvents: 'none' }); }
// Guddu behind the counter, identical in every office shot. The counter + register stack (office_fg, z7) hide him from the waist down;
// a soft wall shadow (z4) and counter contact shade (z8) sit him in the room, and a warm grade matches the window light.
function officeGuddu(s, pose) {
  const x = 1130, ground = 996, scale = .92;   // just left of the register stack, so it overlaps his arm only
  const g = char(s, 'guddu', x, pose, { ground, scale, flip: true, z: 5 });
  Object.values(g.imgs).forEach(i => i.style.filter = 'drop-shadow(0 10px 8px rgba(60,30,5,.28)) sepia(.14) saturate(.94) brightness(.95)');
  Object.values(g.mouths).forEach(i => i.style.filter = 'sepia(.14) saturate(.94) brightness(.95)');   // same grade on the talking mouths
  Object.values(g.frames).flat().forEach(i => i.style.filter = 'drop-shadow(0 10px 8px rgba(60,30,5,.28)) sepia(.14) saturate(.94) brightness(.95)');   // and on his talking frames
  el('div', '', s, null, { position: 'absolute', left: (g.x - 250) + 'px', top: (g.ground - g.h - 10) + 'px', width: '380px', height: (g.h * .62) + 'px', borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(70,35,10,.30), rgba(70,35,10,0))', filter: 'blur(14px)', zIndex: 4, pointerEvents: 'none' });
  el('div', '', s, null, { position: 'absolute', left: (g.x - 190) + 'px', top: '628px', width: '360px', height: '46px', background: 'radial-gradient(ellipse 50% 60% at 50% 0%, rgba(60,28,8,.34), rgba(60,28,8,0))', mixBlendMode: 'multiply', zIndex: 8, pointerEvents: 'none' });
  return g;
}
// ---------------- TITLE ----------------

// ---------- flow helpers ----------
let NEXT_IN = 'iris';          // how the next screen should be revealed
const T = id => LAYOUT.text[id] || TXT[id];
function reveal(x = 50, y = 50) { if (NEXT_IN === 'fade') { fadeIn(); gsap.set(wipe, { clipPath: 'circle(0% at 50% 50%)' }); } else { gsap.set(fade, { opacity: 0 }); irisIn(x, y); } }
async function cutTo() { await fadeOut(.35); NEXT_IN = 'fade'; }   // same location, new shot
function hudState({ sun = null, sunVis = null, hud = false, chip: c = '', flowers: f = 0 } = {}) {
  if (sun != null) { SUN.p = sun; sunPos(sun); }
  if (sunVis != null) gsap.to(sunEl, { opacity: sunVis ? 1 : 0, duration: .4 });
  gsap.to([chip, flowers], { opacity: hud ? 1 : 0, duration: .4 }); if (hud) { chip.textContent = c; setFlowers(f); }
}
function panel(parent, html, css, name) { return reg(el('div', 'card', parent, html, css), name); }

async function title() {
  SCN = 'title'; hudState({ sun: 0, sunVis: false });
  const s = newScene();
  const bg = bgImg(s, 'bg_01_gate', { left: '0px' });
  gsap.fromTo(bg, { scale: 1.12, transformOrigin: '50% 40%' }, { scale: 1.0, duration: 9, ease: 'sine.out' });
  // sun rays
  const rays = el('div', 'tint', s, null, { background: 'repeating-conic-gradient(from 0deg at 88% 8%, rgba(255,240,180,.22) 0 7deg, transparent 7deg 16deg)', mixBlendMode: 'screen' });
  gsap.to(rays, { rotate: 6, transformOrigin: '88% 8%', duration: 8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  // welcome text painted on the gate board
  const wel = reg(el('div', '', s, 'Welcome to Apnapur', { position: 'absolute', left: '1072px', top: '212px', transform: 'translate(-50%,-50%)', fontFamily: 'Baloo', fontWeight: 800, fontSize: '66px', color: '#5a2d0c', textShadow: '0 2px 0 rgba(255,220,160,.6), 0 -1px 0 rgba(0,0,0,.35)', whiteSpace: 'nowrap', letterSpacing: '.01em' }), 'welcome');
  gsap.fromTo(wel, { opacity: 0, scale: .7 }, { opacity: .92, scale: 1, duration: 1, delay: .6, ease: 'back.out(2)' });
  const goat = char(s, 'gudiya', 1580, 'idle', { ground: 1050, scale: 1.05 });
  const tl = gsap.timeline();
  move(tl, 1.1, goat, 'trot', 420, 0, null, { ease: 'sine.out', end: 'idle', enter: true });
  tl.call(() => { setPose(goat, 'hop'); sfx('boing', .6); }, null, 2.75);
  tl.call(() => setPose(goat, 'idle'), null, 3.5);
  jump(tl, 2.75, goat, 55, 1, .34);
  gsap.to(goat.body, { rotate: 4, duration: 1.3, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 3 });
  goat.wrap.style.cursor = 'pointer'; goat.wrap.style.pointerEvents = 'auto'; goat.body.style.pointerEvents = 'auto';
  goat.wrap.querySelectorAll('img').forEach(i => i.style.pointerEvents = 'auto');
  goat.wrap.addEventListener('click', () => { sfx('goat', 1); gsap.timeline().to(goat.body, { y: -50, duration: .3, ease: 'power2.out' }).to(goat.body, { y: 0, duration: .34, ease: 'power2.in' }); });
  // Pari and Aaru welcome us at the gate (left), Gudiya is on the right; the title is spoken (t0), not shown on a card
  const pari = char(s, 'pari', 300, 'happy', { ground: 1045 });
  const aaru = char(s, 'aaru', 540, 'shout', { ground: 1055 });
  move(tl, .3, pari, 'walk', -520, 0, null, { ease: 'sine.out', end: 'happy', enter: true });
  move(tl, .6, aaru, 'run', -760, 0, null, { ease: 'sine.out', end: 'shout', enter: true });
  tl.call(() => voice('t0'), null, 1.3);
  jump(tl, 2.9, aaru, 45, 1);   // once he has run in
  // no second Play button: the cover's Start began the game. The welcome plays (t0), then the story moves on by itself.
  birds(s, 5, 90);
  petals(50);
  const iv = setInterval(() => petals(6), 1500);
  playMusic('m_title', { gain: .9 });
  await wait(Math.max(5, 1.3 + (DUR.t0 || 3) + 1.6));
  clearInterval(iv); tl.kill();
  await irisOut(50, 80);
  NEXT_IN = 'iris';
}


// ---------------- HOOK A (row 2): chaupal, morning ----------------
// ---------- cinematic shots (hookA opening montage) ----------
// shot(): a full-stage layer holding one background on a "camera" element. camMove() eases the camera from a to b,
// where {x, y} is the stage point to keep centred and s the zoom; the image edges never come into view.
function shot(parent, bg, z = 15) {
  const wrap = el('div', '', parent, null, { position: 'absolute', left: 0, top: 0, width: W + 'px', height: H + 'px', overflow: 'hidden', zIndex: z, pointerEvents: 'none' });
  const cam = el('div', '', wrap, null, { position: 'absolute', left: 0, top: 0, height: H + 'px', transformOrigin: '0 0' });
  const b = bgImg(cam, bg, { left: '0px' }); cam.style.width = b.style.width;
  return { wrap, cam, bw: parseFloat(b.style.width) };
}
function camMove(tl, sh, t, dur, a, b, ease = 'sine.inOut') {
  const p = { ...a }, apply = () => gsap.set(sh.cam, { scale: p.s,
    x: Math.min(0, Math.max(W - sh.bw * p.s, W / 2 - p.x * p.s)), y: Math.min(0, Math.max(H - H * p.s, H / 2 - p.y * p.s)) });
  apply(); tl.to(p, { ...b, duration: dur, ease, onUpdate: apply }, t);
}

async function hookA() {
  SCN = 'hookA'; hudState({ sun: 0, sunVis: false });
  const s = newScene();
  bgImg(s, 'bg_02_chaupal', { left: '0px' });
  birds(s, 4, 60);
  const baba = char(s, 'baba', 420, 'idle', { ground: 1040 });
  const guddu = char(s, 'guddu', 1480, 'write', { ground: 1040, flip: true });
  const grade = warmTint(s, 0);
  await warm(['bg_01_gate', 'bg_05_mela_dusk', 'bg_ins_sweets', 'bg_05_mela', 'bg_02_chaupal']);   // no decode hitch at the cuts
  playMusic('m_village_long', { gain: .85, fade: 1.5 });
  const tl = gsap.timeline({ paused: true });
  tl.call(() => reveal(50, 80), null, 0);
  // ---- opening montage: one slow camera move per shot, each cut on the word (n1 voice starts at V) ----
  // n1 word times (faster-whisper, Oct 2026 voice): "It starts in the evening" 3.38 · "sweets" 6.30 · "a big giant wheel" 7.02 ·
  // "The Panchayat" 9.26 · "six lakh rupees" 10.28–11.60 · "All items…" 14.62 · "sun" 17.42. Cuts land ~.2 s before the word.
  const V = .9, cut = [V + 3.2, V + 6.08, V + 6.85, V + 9.07];   // "It starts in the evening…" (dusk lights) | "sweets" | "a big giant wheel" | "The Panchayat…"
  let prev = null;   // crossfade in on the cut, then hide the shot underneath so it can't show through later
  const xf = (sh, at) => { gsap.set(sh.wrap, { opacity: 0 }); tl.to(sh.wrap, { opacity: 1, duration: .35, ease: 'sine.inOut' }, at - .2);
    if (prev) tl.set(prev.wrap, { opacity: 0 }, at + .2); prev = sh; };
  // 1 "It’s Mela day in Apnapur!" push through the gate from the title screen
  const g = shot(s, 'bg_01_gate'); prev = g;
  const wl = LAYOUT.items['title.welcome'] || {};
  el('div', '', g.cam, 'Welcome to Apnapur', { position: 'absolute', left: (1072 + (wl.dx || 0)) + 'px', top: (212 + (wl.dy || 0)) + 'px', transform: 'translate(-50%,-50%)', fontFamily: 'Baloo', fontWeight: 800, fontSize: '66px', color: '#5a2d0c', opacity: .92, textShadow: '0 2px 0 rgba(255,220,160,.6), 0 -1px 0 rgba(0,0,0,.35)', whiteSpace: 'nowrap' });
  el('div', 'tint', g.wrap, null, { background: 'repeating-conic-gradient(from 0deg at 88% 8%, rgba(255,240,180,.2) 0 7deg, transparent 7deg 16deg)', mixBlendMode: 'screen' });
  birds(g.wrap, 3, 120);
  for (let i = 0; i < 14; i++) { const pe = el('div', '', g.wrap, null, { position: 'absolute', left: (Math.random() * W) + 'px', top: '-30px', width: '14px', height: '9px', borderRadius: '50%', background: ['#f7b733', '#e8870e', '#ff9f1c'][i % 3] });
    tl.fromTo(pe, { y: Math.random() * 300 }, { y: 700 + Math.random() * 400, x: 60 + Math.random() * 120, rotate: 540, duration: 3.6, ease: 'none' }, 0); }
  camMove(tl, g, 0, cut[0] + .3, { x: 960, y: 540, s: 1 }, { x: 1000, y: 600, s: 1.3 }, 'power1.inOut');
  // 2 "It starts in the evening. There will be lights," a dreamy glimpse of the Mela at dusk, panning along the bulb strings
  const d = shot(s, 'bg_05_mela_dusk'); xf(d, cut[0]);
  for (let i = 0; i < 16; i++) { const k = el('div', '', d.wrap, null, { position: 'absolute', left: (Math.random() * W) + 'px', top: (80 + Math.random() * 520) + 'px', width: (18 + Math.random() * 30) + 'px', height: '0', paddingBottom: '0', borderRadius: '50%' });
    k.style.height = k.style.width; k.style.background = 'radial-gradient(circle, rgba(255,214,120,.85), rgba(255,170,60,0) 70%)'; k.style.filter = 'blur(2px)';
    tl.fromTo(k, { opacity: 0 }, { opacity: .9, x: 40 + Math.random() * 60, duration: 1.6, yoyo: true, repeat: 1, ease: 'sine.inOut' }, cut[0] + Math.random() * .5); }
  el('div', 'tint', d.wrap, null, { background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(25,10,35,.55))' });
  tl.call(() => sfx('sparkle', .45), null, cut[0] + .2);
  camMove(tl, d, cut[0] - .2, cut[1] - cut[0] + .6, { x: 620, y: 330, s: 1.5 }, { x: 1150, y: 330, s: 1.5 });
  // 3 "sweets" the bazaar's sweet stall, from a dedicated close-up painting (bg_ins_sweets, 4K, repainted from bg_03_bazaar)
  const w = shot(s, 'bg_ins_sweets'); xf(w, cut[1]);
  camMove(tl, w, cut[1] - .2, cut[2] - cut[1] + .6, { x: 1000, y: 560, s: 1.04 }, { x: 1080, y: 600, s: 1.14 });
  // 4 "and a big giant wheel." start tight on the wheel and pull back and up to show how big it is
  const m = shot(s, 'bg_05_mela'); xf(m, cut[2]);
  camMove(tl, m, cut[2] - .2, cut[3] - cut[2] + .5, { x: 1390, y: 520, s: 2.2 }, { x: 1330, y: 430, s: 1.3 }, 'power2.out');
  // 5 "The Panchayat has ₹6,00,000…" the story begins: the montage fades to the chaupal, first faces
  tl.to(m.wrap, { opacity: 0, duration: .5, ease: 'sine.inOut' }, cut[3] - .2);
  tl.fromTo(world, { scale: 1.08 }, { scale: 1, duration: 6, ease: 'sine.out', immediateRender: false }, cut[3] - .2);
  // MELA MONEY board: the same green/gold board the child pays from in level 3. It drops in as the chaupal appears and counts
  // up in round ₹50,000 steps, landing on ₹6,00,000 as n1 says "six lakh rupees" (voice 10.28–11.60 s)
  const ost = sign(s, `<div style="font-size:34px;letter-spacing:.12em;color:#f3d27a">MELA MONEY</div><div class="amt" style="font-size:112px;line-height:1.05;display:inline-block;min-width:520px">₹0</div>`, 960, 330, 56, 'melamoney');
  Object.assign(ost.querySelector('.board').style, { background: 'linear-gradient(#237a43,#1a5c33)', border: '8px solid #d9a93a', borderRadius: '22px', color: '#fff3c4', textShadow: '0 5px 0 rgba(10,40,20,.45)', boxShadow: '0 16px 0 rgba(58,34,15,.25), inset 0 0 0 4px rgba(255,225,140,.35)' });
  const amt = ost.querySelector('.amt');
  dropSign(tl, cut[3] - .05, ost);
  const c0 = cut[3] + .55, c1 = V + 11.35, steps = 12;
  for (let i = 1; i <= steps; i++) tl.call(() => { amt.textContent = inr(i * 50000); sfx('tick', .35, .9 + i * .05); }, null, c0 + (c1 - c0) * Math.pow(i / steps, 1.3));
  tl.call(() => { sfx('coins', .9); sfx('ding', .6); }, null, c1);
  tl.fromTo(amt, { scale: 1 }, { scale: 1.16, duration: .18, yoyo: true, repeat: 1, ease: 'power2.out', immediateRender: false }, c1);
  // 6 "All items need to be bought before the sun goes down." the light warms and the sunset tracker appears on "sun"
  tl.to(grade, { opacity: .15, duration: 2, ease: 'sine.inOut' }, V + 14.6);
  tl.to(sunEl, { opacity: 1, duration: .6 }, V + 17.42); tl.call(() => sfx('rise', .6), null, V + 17.42);
  tl.fromTo(sunEl, { scale: 1.6, transformOrigin: '100% 0%' }, { scale: 1, duration: .8, ease: 'back.out(2)', immediateRender: false }, V + 17.42);
  let t = voiceOver(tl, V - .1, 'n1');   // voice only: the pictures carry the story, no narration text
  tl.to(ost, { y: -800, duration: .7, ease: 'back.in(1.4)' }, t - .2);
  tl.to(world, { scale: 1.12, x: 90, duration: 3.5, ease: 'sine.inOut' }, t);
  t = say(tl, s, t + .3, 'b1', baba, T('b1'), { act: 'talk', end: 'idle' });
  tl.to(world, { x: -110, scale: 1.13, duration: 2.5, ease: 'sine.inOut' }, t - .4);
  // Guddu is muddled: scratching his head while each number pops out of it as he says it (g1 word times from Whisper;
  // the voice starts .05s after the bubble). On "Let me write it all down!" they drop into his notebook and he writes.
  pose(tl, t, guddu, 'scratch');
  const gEnd = say(tl, s, t + .2, 'g1', guddu, T('g1')), vs = t + .25;
  const gBubble = [...s.querySelectorAll('.bubble')].pop();
  thoughts(s, tl, guddu, [{ txt: '42,538', at: vs + .8 }, { txt: '+ 23,184', at: vs + 3.4 }, { txt: 'carry 1…', at: vs + 6.45 }, { txt: '= 65,7…?', at: vs + 6.9 }],
    { avoid: gBubble, until: vs + 7.25, sinkTo: { x: guddu.x - 30, y: guddu.ground - guddu.h * .55 } });
  pose(tl, vs + 7.25, guddu, 'write');
  tl.call(() => sfx('scribble', .7), null, vs + 7.3);
  tl.to(world, { x: 0, scale: 1, duration: .6, ease: 'power2.inOut' }, gEnd + .3);
  await playTL(tl);
  await irisOut(50, 50); NEXT_IN = 'iris';
}
// ---------------- HOOK B (row 3a): Guddu keeps writing, the sun sinks ----------------
async function hookB() {
  SCN = 'hookB'; hudState({ sun: 0, sunVis: true });   // the tracker already popped in at the end of hookA
  const s = newScene();
  bgImg(s, 'bg_02_chaupal', { left: '0px' });
  const tint = warmTint(s, 0.15);
  const g = char(s, 'guddu', 960, 'write', { ground: 1040 });
  const tl = gsap.timeline({ paused: true });
  tl.call(() => reveal(50, 50), null, 0);
  tl.to(tint, { opacity: .5, duration: 8 }, 0);
  tl.fromTo(world, { scale: 1.02 }, { scale: 1.12, duration: 9, ease: 'sine.inOut' }, 0);
  sunTo(tl, 1.4, .12, 3);
  tl.call(() => sfx('scribble', .6), null, .6);
  for (let i = 0; i < 6; i++) {
    const pg = el('div', '', s, '', { position: 'absolute', left: '960px', top: '560px', width: '70px', height: '90px', background: '#fffdf4', border: '3px solid #9ab', borderRadius: '6px', backgroundImage: 'repeating-linear-gradient(#fffdf4 0 12px,#b9c9e6 12px 14px)' });
    gsap.set(pg, { opacity: 0 });
    tl.to(pg, { opacity: 1, duration: .1 }, 1.5 + i * .7);
    tl.to(pg, { x: (i % 2 ? 1 : -1) * (180 + i * 50), y: -260 - i * 20, rotate: (i % 2 ? 1 : -1) * 260, duration: 1.6, ease: 'power2.out' }, 1.5 + i * .7);
    tl.to(pg, { y: '+=500', opacity: 0, duration: 1.4, ease: 'power1.in' }, 3.1 + i * .7);
    tl.call(() => sfx('paper', .4), null, 1.5 + i * .7);
  }
  const u = voiceOver(tl, .6, 'n2');
  tl.set({}, {}, u + .3);
  await playTL(tl);
  await cutTo();
}
// ---------------- HOOK C (row 3b): Aaru's wild guess ----------------
async function hookC() {
  SCN = 'hookC'; hudState({ sun: .12, sunVis: true });
  const s = newScene();
  bgImg(s, 'bg_02_chaupal', { left: '0px' });
  warmTint(s, .5);
  const aaru = char(s, 'aaru', 430, 'run', { ground: 1045 });
  const goat = char(s, 'gudiya', 700, 'hop', { ground: 1050 });
  const pari = char(s, 'pari', 1500, 'idle', { ground: 1040, flip: true });
  const tl = gsap.timeline({ paused: true });
  tl.call(() => reveal(), null, 0);
  // run in from the left
  move(tl, .2, aaru, 'run', -760, 0, null, { ease: 'sine.out', end: 'shout', enter: true });
  move(tl, .3, goat, 'trot', -900, 0, null, { ease: 'sine.out', end: 'idle', enter: true });
  tl.call(() => { sfx('whoosh', .6); sfx('goat', .7); }, null, .2);
  dust(tl, s, .4, 150, 1000, 6);
  let u = 2.35;   // Aaru has arrived
  // left of centre (clear of Pari's bubble on the right) on a dark pill, so it reads against the marigold garlands
  const burst = reg(el('div', '', s, '₹10,00,00,000 ?!', { position: 'absolute', left: '640px', top: '128px', padding: '4px 40px 10px', borderRadius: '70px', background: 'rgba(70,22,4,.78)', border: '5px solid #ffd83a', boxShadow: '0 10px 24px rgba(40,10,0,.45)', fontFamily: 'Baloo', fontWeight: 800, fontSize: '100px', lineHeight: 1.1, color: '#ffd83a', WebkitTextStroke: '5px #5a1d05', paintOrder: 'stroke fill', textShadow: '6px 6px 0 #5a1d05', whiteSpace: 'nowrap', zIndex: 12 }), 'burst');
  gsap.set(burst, { scale: 0, rotate: -8, xPercent: -50 });
  const rEnd = say(tl, s, u, 'r1', aaru, T('r1'), { p: 'shout' });
  tl.to(burst, { scale: 1, duration: .4, ease: 'back.out(3)' }, u + (DUR.r1 || 2) * .6);
  shake(tl, u + (DUR.r1 || 2) * .6, 10);
  tl.call(() => sfx('pop', 1), null, u + (DUR.r1 || 2) * .6);
  u = rEnd;
  const X = reg(el('div', '', s, '✕', { position: 'absolute', left: '640px', top: '30px', fontFamily: 'Baloo', fontWeight: 800, fontSize: '260px', color: '#e0301e', textShadow: '0 6px 0 #6a0f06', zIndex: 13 }), 'cross');
  gsap.set(X, { scale: 3, opacity: 0, xPercent: -50 });
  const p1s = u;
  u = say(tl, s, u, 'p1', pari, T('p1'), { p: 'point' });
  tl.to(X, { scale: 1, opacity: 1, duration: .3, ease: 'power4.in' }, p1s + (DUR.p1 || 3) * .35);
  tl.call(() => sfx('stamp', 1), null, p1s + (DUR.p1 || 3) * .35 + .28);
  tl.to([burst, X], { y: 700, rotate: 25, opacity: 0, duration: .9, ease: 'power2.in' }, u - .2);
  tl.set({}, {}, u + .6);
  await playTL(tl);
  await cutTo();
}
// ---------------- HOOK D (row 3c): Pari explains estimation (close-up) ----------------
async function hookD() {
  SCN = 'hookD'; hudState({ sun: .12, sunVis: true });
  const s = newScene();
  bgImg(s, 'bg_02_chaupal', { left: '0px', filter: 'blur(4px) brightness(.92)', transform: 'scale(1.3)', transformOrigin: '75% 60%' });
  warmTint(s, .5);
  const pari = char(s, 'pari', 1470, 'happy', { ground: 1066, scale: 1.24, flip: true });   // close-up, but her shoes stay in frame
  const card = panel(s, `<div style="font-size:34px;color:#8a5a2b;letter-spacing:.06em">ROUND EACH PRICE</div>
   <div style="margin-top:16px;font-size:66px"><span>42,538</span> <span style="color:#e8870e">→</span> <span class="rb" style="color:#2f63c9">43,000</span></div>
   <div style="font-size:66px"><span>23,184</span> <span style="color:#e8870e">→</span> <span class="rb" style="color:#2f63c9">23,000</span></div>
   <div class="sum" style="margin-top:14px;font-size:44px;color:#3b8a46;white-space:nowrap">43,000 + 23,000 = 66,000 ✓</div>`, { left: '60px', top: '200px', width: '660px', zIndex: 10 }, 'roundcard');
  const est = reg(el('div', 'ost-pill', s, 'Smart guess = <span style="color:#e8870e">Estimate</span>', { position: 'absolute', left: '390px', top: '700px', fontSize: '60px', whiteSpace: 'nowrap', zIndex: 10 }), 'estimate');
  gsap.set(est, { xPercent: -50, scale: 0 });
  gsap.set(card, { scale: 0, opacity: 0 });
  const rb = card.querySelectorAll('.rb'), sm = card.querySelector('.sum');
  gsap.set(rb, { opacity: 0, x: -30 }); gsap.set(sm, { opacity: 0, y: 20 });
  const tl = gsap.timeline({ paused: true });
  tl.call(() => reveal(), null, 0);
  tl.fromTo(pari.wrap, { x: 200, opacity: 0 }, { x: 0, opacity: 1, duration: .6, ease: 'power3.out' }, .1);
  const p2s = .7, d2 = DUR.p2 || 7;
  tl.to(card, { scale: 1, opacity: 1, duration: .5, ease: 'back.out(2)' }, p2s);
  tl.to(rb[0], { opacity: 1, x: 0, duration: .4, ease: 'back.out(2)' }, p2s + d2 * .2); tl.call(() => sfx('ding', .6), null, p2s + d2 * .2);
  tl.to(rb[1], { opacity: 1, x: 0, duration: .4, ease: 'back.out(2)' }, p2s + d2 * .32); tl.call(() => sfx('ding', .6, 1.12), null, p2s + d2 * .32);
  tl.to(sm, { opacity: 1, y: 0, duration: .4, ease: 'back.out(2)' }, p2s + d2 * .5); tl.call(() => sfx('sparkle', .7), null, p2s + d2 * .5);
  tl.to(est, { scale: 1, duration: .5, ease: 'back.out(2.6)' }, p2s + d2 * .78); tl.call(() => { sfx('sparkle', 1); petals(30); }, null, p2s + d2 * .78);
  const u = say(tl, s, p2s, 'p2', pari, T('p2'), { act: 'explain', end: 'happy' });
  tl.set({}, {}, u + .8);
  await playTL(tl);
  await cutTo();
}
// ---------------- HOOK E (row 3d): off to the bazaar ----------------
async function hookE() {
  SCN = 'hookE'; hudState({ sun: .12, sunVis: true });
  const s = newScene();
  bgImg(s, 'bg_02_chaupal', { left: '0px' });
  warmTint(s, .5);
  const aaru = char(s, 'aaru', 430, 'shout', { ground: 1045 });
  const goat = char(s, 'gudiya', 700, 'idle', { ground: 1050 });
  const pari = char(s, 'pari', 1500, 'point', { ground: 1040, flip: true });
  const tl = gsap.timeline({ paused: true });
  tl.call(() => reveal(), null, 0);
  let u = say(tl, s, .4, 'p3', pari, T('p3'), { p: 'point' });
  pose(tl, u - .6, aaru, 'jump'); tl.call(() => { sfx('boing', .8); setPose(goat, 'hop'); }, null, u - .6);
  jump(tl, u - .6, aaru, 70, 2);
  const go = sign(s, 'Go to the bazaar ➜', 960, 430, 58, 'gosign');
  dropSign(tl, u - .1, go);
  const e = u + .9;   // once Aaru's two jumps have landed
  move(tl, e, aaru, 'run', 0, 650, null, { ease: 'sine.in' });
  move(tl, e + .1, pari, 'walk', 0, 360, null, { ease: 'sine.in' });
  move(tl, e + .15, goat, 'trot', 0, 520, null, { ease: 'sine.in' });
  tl.to(world, { x: -300, scale: 1.35, filter: 'blur(6px)', duration: .7, ease: 'power3.in' }, e + 1.1);
  await playTL(tl);
  await irisOut(90, 50); NEXT_IN = 'iris';
}

// ---------------- LEVEL PLACEHOLDERS ----------------
const LEVELS = {
  1: { bg: 'bg_03_bazaar', chip: 'Aakoli Bazaar · Round the price tags', title: 'Level 1 · Aakoli Bazaar', what: 'Round the price tags at 7 shops', rule: 'Hundreds digit 5 or more → go up. Less than 5 → stay down.', sun: [.12, .35] },
  2: { bg: 'bg_04_office', chip: 'Panchayat office · Add the bills', title: 'Level 2 · Panchayat Office', what: 'Estimate the total of 7 bills', rule: 'Round each price first, then add the round numbers.', sun: [.35, .6] },
  3: { bg: 'bg_05_mela', chip: 'Mela Ground · Pay and find money left', title: 'Level 3 · Mela Ground', what: 'Pay 7 shopkeepers from ₹6,00,000', rule: 'Round the bill, then subtract it from the Mela Money.', sun: [.6, .85] },
};
async function level(n) {
  SCN = 'level' + n; hudState({ sun: LEVELS[n].sun[0], sunVis: true, hud: true, chip: LEVELS[n].chip, flowers: 0 });
  const L = LEVELS[n]; const s = newScene();
  const bg = bgImg(s, L.bg, { left: '0px' });
  const lt = warmTint(s, .15 + n * .12); if (n === 2) lt.style.zIndex = 9;
  playMusic('m_hurry', { gain: .75 });
  chip.textContent = L.chip;
  if (n === 1) {
    gsap.fromTo(bg, { x: 0 }, { x: -(2593 - 1920), duration: 14, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    char(s, 'pari', 230, 'point', { ground: 1060, scale: .8 }); char(s, 'manju', 1720, 'teach', { ground: 1060, scale: .8, flip: true });
  } else if (n === 2) {
    officeGuddu(s, 'write');
    officeFG(s);
    char(s, 'pari', 760, 'point', { ground: 1072, scale: .82, z: 8 });
    reg(el('div', '', s, '<b>7</b> bills left', { position: 'absolute', left: '1380px', top: '330px', fontFamily: 'Baloo', fontWeight: 800, fontSize: '40px', padding: '6px 20px', background: '#fffaf0', border: '4px solid #3a220f', borderRadius: '20px' }), 'billsleft');
  } else {
    char(s, 'baba', 230, 'idle', { ground: 1060, scale: .8 }); char(s, 'pari', 1700, 'point', { ground: 1060, scale: .8, flip: true });
    reg(el('div', '', s, '<div style="font-size:30px;letter-spacing:.1em">MELA MONEY</div><div style="font-size:64px">₹6,00,000</div>', { position: 'absolute', left: '380px', top: '420px', padding: '16px 34px', background: '#1f6b3a', color: '#fff3c4', border: '8px solid #d9a93a', borderRadius: '16px', fontFamily: 'Baloo', fontWeight: 800, textAlign: 'center' }), 'melamoney');
  }
  const card = reg(el('div', 'card', ui, `<div style="font-size:30px;color:#b5361d;letter-spacing:.1em">GAME PLUGS IN HERE</div>
    <div style="font-size:76px;line-height:1.05;margin-top:8px">${L.title}</div>
    <div style="font-size:40px;font-family:Fredoka;font-weight:500;margin-top:10px">${L.what}</div>
    <div style="font-size:30px;font-family:Fredoka;font-weight:500;margin-top:16px;padding:10px 20px;background:#fff1c9;border-radius:14px;border:3px dashed #c98a4a">${L.rule}</div>`, { left: '960px', top: '300px', width: '1100px' }), 'card');
  gsap.set(card, { xPercent: -50, scale: 0 }); gsap.to(card, { scale: 1, duration: .6, ease: 'back.out(2)', delay: .6 });
  reveal(10, 50);
  // Real game hook: window.GAME_LEVELS[n](api) can replace this demo later.
  if (window.GAME_LEVELS && window.GAME_LEVELS[n]) {
    gsap.set(card, { display: 'none' });
    await window.GAME_LEVELS[n]({ n, level: L, scene: s, stage, world, ui, hud, IMG, BUF, sfx, play, voice, playMusic, char, setPose, say, reg, el, setFlowers, setChip: t => chip.textContent = t, setSun: p => { SUN.p = p; sunPos(p); }, sunTo: (p, d = 1) => gsap.to(SUN, { p, duration: d, onUpdate: () => sunPos(SUN.p) }), wait });
  }
  else {
    const b = reg(goButton(ui, 'Play demo ▶', 960, 780), 'playdemo'); gsap.to(b, { scale: 1, duration: .5, delay: 1, ease: 'back.out(2.5)' });
    await waitClick(b);
    gsap.to([b, card], { scale: 0, duration: .3 });
    const tl = gsap.timeline();
    for (let i = 0; i < 7; i++) { tl.call(() => { setFlowers(i + 1); sfx('ding', .6, 1 + i * .06); gsap.fromTo(flowerEls[i], { scale: 1.8 }, { scale: 1, duration: .4, ease: 'back.out(3)' }); }, null, .3 + i * .45); }
    sunTo(tl, 0, L.sun[1], 3.6);
    await tl.then();
    await wait(.5);
  }
  await irisOut(50, 50); NEXT_IN = 'iris';
}


// ---------------- BRIDGE 1 (row 5) ----------------
async function bridge1() {
  SCN = 'bridge1'; hudState({ sun: .35, sunVis: true, hud: true, chip: '7 of 7 done!', flowers: 7 });
  const s = newScene();
  bgImg(s, 'bg_03_bazaar', { left: -(2593 - 1920) + 'px' });
  warmTint(s, .35);
  const pari = char(s, 'pari', 520, 'happy', { ground: 1045 });
  const aaru = char(s, 'aaru', 1380, 'jump', { ground: 1045, flip: true });
  playMusic('m_village_long', { gain: .85, offset: 40 });
  const tl = gsap.timeline({ paused: true });
  tl.call(() => reveal(), null, 0);
  tl.fromTo(flowerEls, { scale: 1 }, { scale: 1.35, duration: .25, yoyo: true, repeat: 1, stagger: .08 }, .3);
  tl.call(() => sfx('sparkle', .8), null, .3);
  jump(tl, .5, aaru, 75, 2);
  tl.call(() => sfx('boing', .8), null, .5);
  let t = say(tl, s, 2.1, 'r2', aaru, T('r2'));
  cheer(tl, 2.4, pari, 'happy');                                   // Pari claps and fist-pumps while Aaru cheers
  t = say(tl, s, t, 'p4', pari, T('p4'), { act: 'explain', end: 'happy' });
  const go = sign(s, 'Go to the office ➜', 960, 420, 58, 'gosign'); dropSign(tl, t - .3, go); t += 1.2;
  move(tl, t - .3, pari, 'walk', 0, 360, null, { ease: 'sine.in' });
  move(tl, t - .2, aaru, 'run', 0, 600, null, { ease: 'sine.in' });
  tl.to(world, { x: -300, scale: 1.35, filter: 'blur(6px)', duration: .7, ease: 'power3.in' }, t + .8);
  await playTL(tl);
  await irisOut(90, 50); NEXT_IN = 'iris';
}
// ---------------- BRIDGE 2 (row 7) ----------------
async function bridge2() {
  SCN = 'bridge2'; hudState({ sun: .6, sunVis: true, hud: true, chip: '7 of 7 done!', flowers: 7 });
  const s = newScene();
  bgImg(s, 'bg_04_office', { left: '0px' });
  const guddu = officeGuddu(s, 'write');   // 'write' = his talking frame 0 (mouth shut): 'surprised' has an open mouth and looked like he was talking over Pari
  officeFG(s);
  const pari = char(s, 'pari', 720, 'idle', { ground: 1052, scale: .92, z: 8 });
  warmTint(s, .45).style.zIndex = 9;
  playMusic('m_village_long', { gain: .85, offset: 80 });
  const pile = reg(el('div', '', s, '', { position: 'absolute', left: '800px', top: '520px', width: '220px', height: '160px', zIndex: 7 }), 'donepile');   // on the counter between Pari and Guddu (Pari's p5 bubble opens over the left side)
  for (let i = 0; i < 7; i++) el('div', '', pile, '', { position: 'absolute', left: (i % 2) * 6 + 'px', bottom: i * 10 + 'px', width: '200px', height: '120px', background: '#fffdf4', border: '3px solid #8a6a4a', borderRadius: '6px', transform: `rotate(${(i % 3 - 1) * 3}deg)`, backgroundImage: 'repeating-linear-gradient(#fffdf4 0 14px,#c9d6ee 14px 16px)' });
  el('div', '', pile, 'DONE ✓', { position: 'absolute', left: '40px', top: '-30px', fontFamily: 'Baloo', fontWeight: 800, fontSize: '34px', color: '#fff', background: '#3b8a46', padding: '2px 16px', borderRadius: '12px', border: '4px solid #1f4d27' });
  const tl = gsap.timeline({ paused: true });
  tl.call(() => reveal(), null, 0);
  tl.from(pile.children, { y: -400, opacity: 0, duration: .45, stagger: .12, ease: 'bounce.out' }, .3);
  tl.call(() => sfx('paper', .7), null, .3);
  tl.to(world, { scale: 1.08, x: -80, duration: 1.2, ease: 'power2.inOut' }, 1.4);
  let t = say(tl, s, 1.8, 'g2', guddu, T('g2'), { act: 'talk', end: 'write' });
  tl.call(() => sfx('sparkle', .5), null, 1.9);
  tl.to(world, { scale: 1, x: 0, duration: 1, ease: 'power2.inOut' }, t - .3);
  t = say(tl, s, t, 'p5', pari, T('p5'), { act: 'explain', end: 'happy', side: 'R' });   // opens to the left, over the shelves: Guddu stays in view
  const go = sign(s, 'Go to the Mela Ground ➜', 1500, 330, 54, 'gosign'); go.style.zIndex = 11; dropSign(tl, t - .3, go); t += 1.2;   // over the window wall, toward the door: clear of Guddu + the DONE pile
  move(tl, t - .3, pari, 'walk', 0, 400, null, { ease: 'sine.in' });
  tl.to(world, { x: -300, scale: 1.35, filter: 'blur(6px)', duration: .7, ease: 'power3.in' }, t + .9);
  await playTL(tl);
  await irisOut(90, 50); NEXT_IN = 'iris';
}
// ---------------- ENDING A (row 9a): sunset, lights on ----------------
async function endA() {
  SCN = 'endA'; hudState({ sun: .85, sunVis: true });
  const s = newScene();
  bgImg(s, 'bg_05_mela', { left: '0px' });
  const dusk = bgImg(s, 'bg_05_mela_dusk', { left: '0px', opacity: 0 });
  el('div', '', s, `<svg width="1920" height="200" viewBox="0 0 1920 200"><path d="M40 40 Q960 190 1880 40" stroke="#3a220f" stroke-width="4" fill="none"/></svg>`, { position: 'absolute', left: 0, top: 0 });
  const bulbs = [...Array(7)].map((_, i) => { const tt = (i + 1) / 8, x = (1 - tt) * (1 - tt) * 40 + 2 * (1 - tt) * tt * 960 + tt * tt * 1880, y = (1 - tt) * (1 - tt) * 40 + 2 * (1 - tt) * tt * 190 + tt * tt * 40; return el('div', '', s, '', { position: 'absolute', left: x - 18 + 'px', top: y + 'px', width: '36px', height: '46px', borderRadius: '50% 50% 45% 45%', background: '#8a7a60', border: '4px solid #3a220f' }); });
  await warm(['bg_05_mela', 'bg_05_mela_dusk']);
  playMusic('m_festive', { gain: .8, fade: 2 });
  const tl = gsap.timeline({ paused: true });
  tl.call(() => reveal(), null, 0);
  tl.fromTo(world, { scale: 1.1 }, { scale: 1, duration: 10, ease: 'sine.out' }, 0);
  const n3s = .6, d3 = DUR.n3 || 8;
  const t = voiceOver(tl, n3s, 'n3');
  tl.to(dusk, { opacity: 1, duration: 3, ease: 'sine.inOut' }, n3s + .3);
  sunTo(tl, n3s, 1, 3); tl.to(sunEl, { opacity: 0, duration: .8 }, n3s + 3);
  bulbs.forEach((b, i) => { tl.to(b, { background: '#ffe47a', boxShadow: '0 0 30px 12px rgba(255,210,90,.85)', duration: .2 }, n3s + d3 * .3 + i * .22); tl.call(() => sfx('tick', .8, 1 + i * .1), null, n3s + d3 * .3 + i * .22); });
  tl.call(() => sfx('sparkle', .9), null, n3s + d3 * .3 + 1.6);
  for (let k = 0; k < 7; k++) tl.call(() => { firework(260 + (k % 4) * 450 + Math.random() * 200, 110 + Math.random() * 150, ['#ffd83a', '#ff6ea8', '#6ee7ff', '#9dff7a'][k % 4], 1.15); sfx('pop', .5, .7); }, null, n3s + d3 * .5 + k * .6);
  tl.set({}, {}, Math.max(t, n3s + d3 * .5 + 4.4) + .3);
  await playTL(tl);
  await cutTo();
}
// ---------------- ENDING B (row 9b): the answer ----------------
async function endB() {
  SCN = 'endB'; hudState({ sunVis: false });
  const s = newScene();
  bgImg(s, 'bg_05_mela_dusk', { left: '0px' });
  const pari = char(s, 'pari', 400, 'happy', { ground: 1045, scale: .95 });
  const guddu = char(s, 'guddu', 1450, 'proud', { ground: 1045, scale: .95, flip: true });
  const baba = char(s, 'baba', 1740, 'idle', { ground: 1045, scale: .9, flip: true });
  const eq = reg(el('div', 'ost-pill', s, '₹83,165 <span style="color:#e8870e">≈</span> ₹84,000', { position: 'absolute', left: '900px', top: '820px', fontSize: '76px', whiteSpace: 'nowrap', zIndex: 12 }), 'approx');
  gsap.set(eq, { xPercent: -50, scale: 0 });
  const tl = gsap.timeline({ paused: true });
  tl.call(() => reveal(), null, 0);
  for (let k = 0; k < 3; k++) tl.call(() => firework(560 + k * 300 + Math.random() * 120, 110 + Math.random() * 90, ['#ffd83a', '#ff6ea8', '#6ee7ff'][k]), null, .3 + k * 1.4);
  let t = say(tl, s, .5, 'g3', guddu, T('g3'), { act: 'talk', end: 'proud' });
  tl.to(eq, { scale: 1, duration: .6, ease: 'back.out(2.4)' }, t - .6);
  tl.call(() => sfx('ding', .8), null, t - .5);
  t = say(tl, s, t, 'p6', pari, T('p6'), { act: 'explain', end: 'happy' });
  tl.to(eq, { scale: 1.12, duration: .3, yoyo: true, repeat: 1 }, t - 1);
  tl.call(() => sfx('sparkle', .8), null, t - 1);
  const tc = cheer(tl, t - .1, pari, 'happy'); tl.set({}, {}, Math.max(t + .5, tc + .2));   // "nearly the same!" → Pari cheers
  await playTL(tl);
  await cutTo();
}
// ---------------- ENDING C (row 9c): jalebi + the badge ----------------
async function endC() {
  SCN = 'endC'; hudState({ sunVis: false });
  const s = newScene();
  bgImg(s, 'bg_05_mela_dusk', { left: '0px' });
  const aaru = char(s, 'aaru', 760, 'jump', { ground: 1045 });
  const goat = char(s, 'gudiya', 1120, 'idle', { ground: 1050 });
  const tl = gsap.timeline({ paused: true });
  tl.call(() => reveal(), null, 0);
  const r3s = .4;
  let t = say(tl, s, r3s, 'r3', aaru, T('r3'));
  jump(tl, r3s + (DUR.r3 || 3) + .1, aaru, 80, 2);
  const rain = t - .2;   // after Aaru's bubble has gone, so the jalebis never cover his words
  tl.call(() => { sfx('boing', .8); jalebis(20); setPose(goat, 'hop'); sfx('goat', .9); }, null, rain);
  jump(tl, rain, goat, 60, 3, .3);
  tl.call(() => setPose(goat, 'idle'), null, rain + 3);
  tl.to(world, { scale: 1.05, duration: 6, ease: 'sine.inOut' }, r3s);
  t = voiceOver(tl, t + .8, 'n4');
  await playTL(tl);
  const b = reg(goButton(ui, 'Get my badge ★', 960, 260), 'badgebtn'); gsap.to(b, { scale: 1, duration: .5, ease: 'back.out(2.5)' });
  await waitClick(b);
  play('sfx_drumroll_hit', { gain: .9 });
  await irisOut(50, 50); NEXT_IN = 'iris';
}

// ---------------- BADGE (row 10) ----------------
async function badge() {
  SCN = 'badge'; hudState({ sunVis: false });
  const s = newScene();
  bgImg(s, 'bg_05_mela_dusk', { left: '0px', filter: 'blur(10px) brightness(.7)', transform: 'scale(1.05)' });
  const card = el('div', 'card', ui, '', { left: '960px', top: '70px', width: '1120px', height: '950px' });
  gsap.set(card, { xPercent: -50 });
  const medal = reg(el('div', '', ui, `<svg viewBox="-160 -200 320 400" width="340" height="425">
   <path d="M-70 -200 L-20 -60 L-60 -60 Z" fill="#c93b3b"/><path d="M70 -200 L20 -60 L60 -60 Z" fill="#2f63c9"/>
   <polygon points="-90,-200 -30,-40 30,-40 90,-200 40,-200 0,-90 -40,-200" fill="#e33b3b" stroke="#6a1010" stroke-width="5"/>
   <circle cx="0" cy="60" r="130" fill="#f6c343" stroke="#8a5a0a" stroke-width="10"/>
   <circle cx="0" cy="60" r="104" fill="#ffd966" stroke="#c98a1a" stroke-width="6"/>
   <polygon fill="#fff4c2" stroke="#c98a1a" stroke-width="5" points="${[...Array(10)].map((_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 34 : 78; return (Math.cos(a) * r).toFixed(1) + ',' + (60 + Math.sin(a) * r).toFixed(1) }).join(' ')}"/>
   <rect class="shine" x="-40" y="-80" width="30" height="300" fill="rgba(255,255,255,.55)" transform="rotate(25)"/></svg>`, { position: 'absolute', left: '960px', top: '96px', transform: 'translateX(-50%)', perspective: '800px' }), 'medal');
  const t1 = el('div', '', ui, 'You saved the Mela!', { position: 'absolute', left: '960px', top: '540px', fontFamily: 'Baloo', fontWeight: 800, fontSize: '64px', color: '#b5361d', whiteSpace: 'nowrap' });
  const t2 = el('div', '', ui, 'Smart Guess Star!', { position: 'absolute', left: '960px', top: '608px', fontFamily: 'Baloo', fontWeight: 800, fontSize: '96px', color: '#e8870e', textShadow: '0 5px 0 #6b3d16', whiteSpace: 'nowrap' });
  const t3 = el('div', '', ui, 'You rounded 7 prices, added 7 bills and paid 7 shopkeepers.', { position: 'absolute', left: '960px', top: '740px', fontFamily: 'Fredoka', fontWeight: 500, fontSize: '34px', color: '#3a220f', whiteSpace: 'nowrap' });
  [t1, t2, t3].forEach(x => gsap.set(x, { xPercent: -50, opacity: 0, y: 30 }));
  const again = goButton(ui, 'Play again ↻', 960, 850);
  const tl = gsap.timeline({ paused: true });
  tl.call(() => reveal(50, 40), null, 0);
  tl.from(card, { scale: .6, opacity: 0, duration: .5, ease: 'back.out(2)' }, .1);
  tl.fromTo(medal, { rotateY: 900, scale: 0, y: -200 }, { rotateY: 0, scale: 1, y: 0, duration: 1.3, ease: 'power3.out' }, .15);   // with the card, so it is never an empty card
  tl.call(() => { confetti(220, 960, 360); sfx('confetti', 1); sfx('sparkle', 1); }, null, 1.9);
  tl.call(() => voice('x1'), null, 2.0);
  tl.fromTo(medal.querySelector('.shine'), { x: -160 }, { x: 180, duration: 1, ease: 'power2.inOut', repeat: -1, repeatDelay: 1.6 }, 2);
  tl.to([t1, t2, t3], { opacity: 1, y: 0, duration: .5, stagger: .2, ease: 'back.out(2)' }, .9);
  tl.to(again, { scale: 1, duration: .5, ease: 'back.out(2.5)' }, 3.6);
  tl.to(medal, { y: -12, duration: 1.4, yoyo: true, repeat: -1, ease: 'sine.inOut' }, 3.6);
  tl.call(() => { const iv = setInterval(() => confetti(40, 200 + Math.random() * 1520, 200), 2200); again._iv = iv; }, null, 3);
  tl.play(0);
  await waitClick(again);
  clearInterval(again._iv);
  await irisOut(50, 50); NEXT_IN = 'iris';
}


// ---------------- RUN ----------------
const FLOW = [
  ['title', title], ['hookA', hookA], ['hookB', hookB], ['hookC', hookC], ['hookD', hookD], ['hookE', hookE],
  ['level1', () => level(1)], ['bridge1', bridge1], ['level2', () => level(2)], ['bridge2', bridge2], ['level3', () => level(3)],
  ['endA', endA], ['endB', endB], ['endC', endC], ['badge', badge]];
window.FLOW = FLOW;
async function main() {
  const lp = $('#lp'), bar = $('#loader .bar i');
  await loadAll(p => bar.style.width = (p * 100).toFixed(0) + '%');
  await document.fonts.load('600 32px Poppins'); await document.fonts.ready;
  // the cover's Start button (the tap unlocks audio); the whole cover is tappable too
  gsap.to('#loader .bar', { opacity: 0, duration: .3 });
  lp.textContent = 'Start ▶'; lp.classList.add('ready'); $('#loader').classList.add('ready');
  gsap.fromTo(lp, { scale: 0 }, { scale: 1, duration: .6, ease: 'back.out(2.4)', onComplete: () => gsap.to(lp, { scale: 1.06, duration: .75, yoyo: true, repeat: -1, ease: 'sine.inOut' }) });
  await new Promise(r => $('#loader').addEventListener('click', () => { unlockAudio(); r(); }, { once: true }));
  try { play('sfx_cycle_bell', { gain: 1 }); } catch (e) { }   // storyboard: cycle bell on Start
  try { await AC.resume(); } catch (e) { }
  gsap.to('#loader', { opacity: 0, duration: .5, onComplete: () => $('#loader').remove() });
  const q = new URLSearchParams(location.search);
  let i = Math.max(0, FLOW.findIndex(f => f[0] === (q.get('from') || q.get('scene'))));
  if (i > 0) { gsap.set(wipe, { clipPath: 'circle(150% at 50% 50%)' }); NEXT_IN = 'iris'; if (FLOW[i][0].startsWith('level') || FLOW[i][0].startsWith('bridge')) playMusic(FLOW[i][0].startsWith('level') ? 'm_hurry' : 'm_village_long'); else if (FLOW[i][0].startsWith('end') || FLOW[i][0] === 'badge') playMusic('m_festive'); else playMusic('m_village_long'); }
  const once = q.has('scene');
  while (true) {
    window.CUR_SCREEN = FLOW[i][0]; if (window.onScreen) window.onScreen(FLOW[i][0]);
    await FLOW[i][1]();
    if (once) return;
    i = (i + 1) % FLOW.length;
  }
}
main();

// ================= STORY: The Mela Before Sunset =================
const TXT = {
  n1: 'Today is Mela day in Apnapur! Tonight there will be lights, sweets and a big giant wheel. The Panchayat has ₹6,00,000 to buy things for the Mela. But the shops close when the sun goes down.',
  b1: 'Guddu, is our money enough?',
  g1: 'Wait… 42,538 plus 23,184… carry one… Let me write it all down!',
  n2: 'Guddu Bhaiya adds every number fully. It takes a long time. The sun is going down.',
  r1: 'Easy! The total is ten crore!',
  p1: 'Aaru, that is a wild guess. Let’s make a smart guess.',
  p2: 'First, we change each price to a round number. Round numbers are easy to add. A smart guess like this is called an estimate.',
  p3: 'Come! Let’s go to the bazaar.',
  r2: 'All the prices are round numbers now! Correct-correct!',
  p4: 'Well done! The shopkeepers sent their bills to the Panchayat office. Let’s check them.',
  g2: 'All seven bills? So fast? I am still on page two!',
  p5: 'The shopkeepers are waiting at the Mela Ground. Baba has the money. Let’s go and pay them.',
  n3: 'The sun goes down. The Mela lights come on! The giant wheel starts to turn. We bought everything, and there is still money left.',
  g3: 'I finished! Exactly ₹83,380 is left.',
  p6: 'We said about ₹84,000. That is nearly the same!',
  r3: 'Correct-correct! Now jalebi for everyone!',
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
  tl.fromTo(goat.wrap, { x: 420 }, { x: 0, duration: 1.1, ease: 'power3.out' }, 1.2);
  tl.call(() => { setPose(goat, 'hop'); sfx('boing', .6); }, null, 1.2);
  tl.call(() => setPose(goat, 'idle'), null, 2.2);
  jump(tl, 1.6, goat, 55, 1, .34);
  gsap.to(goat.body, { rotate: 4, duration: 1.3, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 3 });
  goat.wrap.style.cursor = 'pointer'; goat.wrap.style.pointerEvents = 'auto'; goat.body.style.pointerEvents = 'auto';
  goat.wrap.querySelectorAll('img').forEach(i => i.style.pointerEvents = 'auto');
  goat.wrap.addEventListener('click', () => { sfx('goat', 1); gsap.timeline().to(goat.body, { y: -50, duration: .3, ease: 'power2.out' }).to(goat.body, { y: 0, duration: .34, ease: 'power2.in' }); });
  // title board
  const sg = sign(ui, `<div style="font-size:100px;line-height:1">The Mela Before Sunset</div><div style="font-size:40px;margin-top:12px;color:#6b3d16;font-family:Fredoka;font-weight:700;text-shadow:none">Addition and subtraction by estimation</div>`, 900, 500, 56, 'titleboard');
  sg.querySelector('.board').style.background = 'linear-gradient(#fff3d6,#f2d9a2)';
  sg.querySelector('.board').style.color = '#b5361d';
  sg.querySelector('.board').style.textShadow = '0 5px 0 rgba(90,45,12,.25)';
  dropSign(tl, .4, sg);
  tl.call(() => voice('t0'), null, 1.3);
  const start = reg(goButton(ui, 'Start ▶', 900, 820), 'start');
  tl.to(start, { scale: 1, duration: .6, ease: 'back.out(2.5)' }, 2.6);
  tl.to(start, { scale: 1.06, duration: .7, yoyo: true, repeat: -1, ease: 'sine.inOut' }, 3.3);
  birds(s, 5, 90);
  petals(50);
  const iv = setInterval(() => petals(6), 1500);
  playMusic('m_title', { gain: .9 });
  await waitClick(start);
  clearInterval(iv); tl.kill();
  play('sfx_cycle_bell', { gain: 1 });
  gsap.to(start, { scale: .9, duration: .1, yoyo: true, repeat: 1 });
  await wait(.7);
  await irisOut(50, 80);
  NEXT_IN = 'iris';
}


// ---------------- HOOK A (row 2): chaupal, morning ----------------
async function hookA() {
  SCN = 'hookA'; hudState({ sun: 0, sunVis: false });
  const s = newScene();
  bgImg(s, 'bg_02_chaupal', { left: '0px' });
  birds(s, 4, 60);
  const baba = char(s, 'baba', 420, 'idle', { ground: 1040 });
  const guddu = char(s, 'guddu', 1480, 'write', { ground: 1040, flip: true });
  playMusic('m_village_long', { gain: .85, fade: 1.5 });
  const tl = gsap.timeline({ paused: true });
  tl.fromTo(world, { scale: 1.08 }, { scale: 1, duration: 6, ease: 'sine.out' }, 0);
  tl.call(() => reveal(50, 80), null, 0);
  let t = .8;
  const ost = sign(s, `<div>Mela Day in Apnapur!</div><div id="mon" style="font-size:46px;color:#ffe08a;margin-top:6px">Money: ₹0</div>`, 960, 360, 64, 'meladay');
  dropSign(tl, t + 1.2, ost);
  const money = { v: 0 };
  tl.to(money, { v: 600000, duration: 2.2, ease: 'power2.out', onUpdate: () => { const m = ost.querySelector('#mon'); if (m) m.textContent = 'Money: ' + inr(money.v); } }, t + 6.2);
  tl.call(() => sfx('coins', .9), null, t + 6.3);
  t = narrate(tl, t, 'n1', T('n1'));
  tl.to(ost, { y: -800, duration: .7, ease: 'back.in(1.4)' }, t - .2);
  tl.to(world, { scale: 1.12, x: 90, duration: 3.5, ease: 'sine.inOut' }, t);
  t = say(tl, s, t + .3, 'b1', baba, T('b1'), { p: 'ask' });
  tl.to(world, { x: -110, scale: 1.13, duration: 2.5, ease: 'sine.inOut' }, t - .4);
  pose(tl, t, guddu, 'scratch');
  const gEnd = say(tl, s, t + .2, 'g1', guddu, T('g1'));
  pose(tl, t + (DUR.g1 || 5) * .55, guddu, 'write');
  tl.call(() => sfx('scribble', .7), null, t + (DUR.g1 || 5) * .55);
  numbers(s, tl, t + .5, ['42,538', '+ 23,184', 'carry 1…', '= 65,7…?'], 1120, 760, (DUR.g1 || 5) + .8);
  tl.to(world, { x: 0, scale: 1, duration: .6, ease: 'power2.inOut' }, gEnd + .3);
  await playTL(tl);
  await irisOut(50, 50); NEXT_IN = 'iris';
}
// ---------------- HOOK B (row 3a): Guddu keeps writing, the sun sinks ----------------
async function hookB() {
  SCN = 'hookB'; hudState({ sun: 0, sunVis: false });
  const s = newScene();
  bgImg(s, 'bg_02_chaupal', { left: '0px' });
  const tint = warmTint(s, 0.15);
  const g = char(s, 'guddu', 960, 'write', { ground: 1040 });
  const tl = gsap.timeline({ paused: true });
  tl.call(() => reveal(50, 50), null, 0);
  tl.to(tint, { opacity: .5, duration: 8 }, 0);
  tl.fromTo(world, { scale: 1.02 }, { scale: 1.12, duration: 9, ease: 'sine.inOut' }, 0);
  tl.to(sunEl, { opacity: 1, duration: .6 }, 1); tl.call(() => sfx('rise', .6), null, 1);
  tl.fromTo(sunEl, { scale: 1.6, transformOrigin: '100% 0%' }, { scale: 1, duration: .8, ease: 'back.out(2)' }, 1);
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
  const u = narrate(tl, .6, 'n2', T('n2'));
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
  tl.fromTo(aaru.wrap, { x: -760 }, { x: 0, duration: 1.4, ease: 'power2.out' }, .2);
  tl.to(aaru.body, { y: -20, duration: .24, yoyo: true, repeat: 5, ease: 'sine.inOut' }, .2);
  tl.fromTo(goat.wrap, { x: -1000 }, { x: 0, duration: 1.6, ease: 'power2.out' }, .35);
  tl.to(goat.body, { y: -32, duration: .27, yoyo: true, repeat: 5, ease: 'sine.inOut' }, .35);
  tl.call(() => { sfx('whoosh', .6); sfx('goat', .7); }, null, .2);
  dust(tl, s, .4, 150, 1000, 6);
  tl.call(() => setPose(goat, 'idle'), null, 2);
  let u = 1.9;
  const burst = reg(el('div', '', s, '₹10,00,00,000 ?!', { position: 'absolute', left: '960px', top: '120px', fontFamily: 'Baloo', fontWeight: 800, fontSize: '100px', color: '#ffd83a', WebkitTextStroke: '5px #5a1d05', paintOrder: 'stroke fill', textShadow: '8px 8px 0 #5a1d05', whiteSpace: 'nowrap', zIndex: 12 }), 'burst');
  gsap.set(burst, { scale: 0, rotate: -8, xPercent: -50 });
  const rEnd = say(tl, s, u, 'r1', aaru, T('r1'), { p: 'shout' });
  tl.to(burst, { scale: 1, duration: .4, ease: 'back.out(3)' }, u + (DUR.r1 || 2) * .6);
  shake(tl, u + (DUR.r1 || 2) * .6, 10);
  tl.call(() => sfx('pop', 1), null, u + (DUR.r1 || 2) * .6);
  u = rEnd;
  const X = reg(el('div', '', s, '✕', { position: 'absolute', left: '960px', top: '40px', fontFamily: 'Baloo', fontWeight: 800, fontSize: '260px', color: '#e0301e', textShadow: '0 6px 0 #6a0f06', zIndex: 13 }), 'cross');
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
  const pari = char(s, 'pari', 1470, 'point', { ground: 1150, scale: 1.3, flip: true });
  const card = panel(s, `<div style="font-size:34px;color:#8a5a2b;letter-spacing:.06em">ROUND EACH PRICE</div>
   <div style="margin-top:16px;font-size:66px"><span>42,538</span> <span style="color:#e8870e">→</span> <span class="rb" style="color:#2f63c9">43,000</span></div>
   <div style="font-size:66px"><span>23,184</span> <span style="color:#e8870e">→</span> <span class="rb" style="color:#2f63c9">23,000</span></div>
   <div class="sum" style="margin-top:14px;font-size:44px;color:#3b8a46;white-space:nowrap">43,000 + 23,000 = 66,000 ✓</div>`, { left: '60px', top: '200px', width: '660px', zIndex: 10 }, 'roundcard');
  const est = reg(el('div', 'ost-big', s, 'Smart guess = <span style="color:#ffd83a">Estimate</span>', { position: 'absolute', left: '390px', top: '690px', fontSize: '70px', whiteSpace: 'nowrap', zIndex: 10 }), 'estimate');
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
  const u = say(tl, s, p2s, 'p2', pari, T('p2'));
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
  dropSign(tl, u - .1, go); u += 1.4;
  tl.to(world, { x: -300, scale: 1.35, filter: 'blur(6px)', duration: .7, ease: 'power3.in' }, u);
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
    const gd = char(s, 'guddu', 1400, 'write', { ground: 940, scale: .85, flip: true, z: 5 });
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
  t = say(tl, s, t, 'p4', pari, T('p4'), { p: 'point' });
  const go = sign(s, 'Go to the office ➜', 960, 420, 58, 'gosign'); dropSign(tl, t - .3, go); t += 1.2;
  tl.to(world, { x: -300, scale: 1.35, filter: 'blur(6px)', duration: .7, ease: 'power3.in' }, t + .5);
  await playTL(tl);
  await irisOut(90, 50); NEXT_IN = 'iris';
}
// ---------------- BRIDGE 2 (row 7) ----------------
async function bridge2() {
  SCN = 'bridge2'; hudState({ sun: .6, sunVis: true, hud: true, chip: '7 of 7 done!', flowers: 7 });
  const s = newScene();
  bgImg(s, 'bg_04_office', { left: '0px' });
  const guddu = char(s, 'guddu', 1390, 'surprised', { ground: 945, scale: .95, flip: true, z: 5 });
  officeFG(s);
  const pari = char(s, 'pari', 720, 'idle', { ground: 1074, scale: .92, z: 8 });
  warmTint(s, .45).style.zIndex = 9;
  playMusic('m_village_long', { gain: .85, offset: 80 });
  const pile = reg(el('div', '', s, '', { position: 'absolute', left: '300px', top: '520px', width: '220px', height: '160px', zIndex: 8 }), 'donepile');
  for (let i = 0; i < 7; i++) el('div', '', pile, '', { position: 'absolute', left: (i % 2) * 6 + 'px', bottom: i * 10 + 'px', width: '200px', height: '120px', background: '#fffdf4', border: '3px solid #8a6a4a', borderRadius: '6px', transform: `rotate(${(i % 3 - 1) * 3}deg)`, backgroundImage: 'repeating-linear-gradient(#fffdf4 0 14px,#c9d6ee 14px 16px)' });
  el('div', '', pile, 'DONE ✓', { position: 'absolute', left: '40px', top: '-30px', fontFamily: 'Baloo', fontWeight: 800, fontSize: '34px', color: '#fff', background: '#3b8a46', padding: '2px 16px', borderRadius: '12px', border: '4px solid #1f4d27' });
  const tl = gsap.timeline({ paused: true });
  tl.call(() => reveal(), null, 0);
  tl.from(pile.children, { y: -400, opacity: 0, duration: .45, stagger: .12, ease: 'bounce.out' }, .3);
  tl.call(() => sfx('paper', .7), null, .3);
  tl.to(world, { scale: 1.08, x: -80, duration: 1.2, ease: 'power2.inOut' }, 1.4);
  let t = say(tl, s, 1.8, 'g2', guddu, T('g2'));
  tl.call(() => sfx('sparkle', .5), null, 1.9);
  tl.to(world, { scale: 1, x: 0, duration: 1, ease: 'power2.inOut' }, t - .3);
  t = say(tl, s, t, 'p5', pari, T('p5'), { p: 'point' });
  const go = sign(s, 'Go to the Mela Ground ➜', 960, 400, 58, 'gosign'); dropSign(tl, t - .3, go); t += 1.2;
  tl.to(world, { x: -300, scale: 1.35, filter: 'blur(6px)', duration: .7, ease: 'power3.in' }, t + .5);
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
  playMusic('m_festive', { gain: .8, fade: 2 });
  const tl = gsap.timeline({ paused: true });
  tl.call(() => reveal(), null, 0);
  tl.fromTo(world, { scale: 1.1 }, { scale: 1, duration: 10, ease: 'sine.out' }, 0);
  const n3s = .6, d3 = DUR.n3 || 8;
  const t = narrate(tl, n3s, 'n3', T('n3'));
  tl.to(dusk, { opacity: 1, duration: 3, ease: 'sine.inOut' }, n3s + .3);
  sunTo(tl, n3s, 1, 3); tl.to(sunEl, { opacity: 0, duration: .8 }, n3s + 3);
  bulbs.forEach((b, i) => { tl.to(b, { background: '#ffe47a', boxShadow: '0 0 30px 12px rgba(255,210,90,.85)', duration: .2 }, n3s + d3 * .3 + i * .22); tl.call(() => sfx('tick', .8, 1 + i * .1), null, n3s + d3 * .3 + i * .22); });
  tl.call(() => sfx('sparkle', .9), null, n3s + d3 * .3 + 1.6);
  for (let k = 0; k < 7; k++) tl.call(() => { firework(300 + Math.random() * 1320, 260 + Math.random() * 200, ['#ffd83a', '#ff6ea8', '#6ee7ff', '#9dff7a'][k % 4]); sfx('pop', .5, .7); }, null, n3s + d3 * .5 + k * .6);
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
  const baba = char(s, 'baba', 1760, 'idle', { ground: 1045, scale: .9, flip: true });
  const eq = reg(el('div', 'ost-big', s, '₹83,380 <span style="color:#ffd83a">≈</span> ₹84,000', { position: 'absolute', left: '930px', top: '640px', fontSize: '88px', whiteSpace: 'nowrap', zIndex: 12 }), 'approx');
  gsap.set(eq, { xPercent: -50, scale: 0 });
  const tl = gsap.timeline({ paused: true });
  tl.call(() => reveal(), null, 0);
  for (let k = 0; k < 3; k++) tl.call(() => firework(700 + Math.random() * 500, 160 + Math.random() * 120, ['#ffd83a', '#ff6ea8', '#6ee7ff'][k]), null, .3 + k * 1.4);
  let t = say(tl, s, .5, 'g3', guddu, T('g3'));
  tl.to(eq, { scale: 1, duration: .6, ease: 'back.out(2.4)' }, t - .6);
  tl.call(() => sfx('ding', .8), null, t - .5);
  t = say(tl, s, t, 'p6', pari, T('p6'));
  tl.to(eq, { scale: 1.12, duration: .3, yoyo: true, repeat: 1 }, t - 1);
  tl.call(() => sfx('sparkle', .8), null, t - 1);
  tl.set({}, {}, t + .5);
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
  tl.call(() => { sfx('boing', .8); jalebis(18); setPose(goat, 'hop'); sfx('goat', .9); }, null, r3s + (DUR.r3 || 3) * .6);
  jump(tl, r3s + (DUR.r3 || 3) * .6, goat, 60, 3, .3);
  tl.call(() => setPose(goat, 'idle'), null, r3s + (DUR.r3 || 3) * .6 + 3);
  tl.to(world, { scale: 1.05, duration: 6, ease: 'sine.inOut' }, r3s);
  t = narrate(tl, t + .8, 'n4', T('n4'));
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
  const card = el('div', 'card', ui, '', { left: '960px', top: '120px', width: '980px', height: '840px' });
  gsap.set(card, { xPercent: -50 });
  const medal = reg(el('div', '', ui, `<svg viewBox="-160 -200 320 400" width="340" height="425">
   <path d="M-70 -200 L-20 -60 L-60 -60 Z" fill="#c93b3b"/><path d="M70 -200 L20 -60 L60 -60 Z" fill="#2f63c9"/>
   <polygon points="-90,-200 -30,-40 30,-40 90,-200 40,-200 0,-90 -40,-200" fill="#e33b3b" stroke="#6a1010" stroke-width="5"/>
   <circle cx="0" cy="60" r="130" fill="#f6c343" stroke="#8a5a0a" stroke-width="10"/>
   <circle cx="0" cy="60" r="104" fill="#ffd966" stroke="#c98a1a" stroke-width="6"/>
   <polygon fill="#fff4c2" stroke="#c98a1a" stroke-width="5" points="${[...Array(10)].map((_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 34 : 78; return (Math.cos(a) * r).toFixed(1) + ',' + (60 + Math.sin(a) * r).toFixed(1) }).join(' ')}"/>
   <rect class="shine" x="-40" y="-80" width="30" height="300" fill="rgba(255,255,255,.55)" transform="rotate(25)"/></svg>`, { position: 'absolute', left: '960px', top: '150px', transform: 'translateX(-50%)', perspective: '800px' }), 'medal');
  const t1 = el('div', '', ui, 'You saved the Mela!', { position: 'absolute', left: '960px', top: '590px', fontFamily: 'Baloo', fontWeight: 800, fontSize: '64px', color: '#b5361d', whiteSpace: 'nowrap' });
  const t2 = el('div', '', ui, 'Smart Guess Star!', { position: 'absolute', left: '960px', top: '660px', fontFamily: 'Baloo', fontWeight: 800, fontSize: '96px', color: '#e8870e', textShadow: '0 5px 0 #6b3d16', whiteSpace: 'nowrap' });
  const t3 = el('div', '', ui, 'You rounded 7 prices, added 7 bills and paid 7 shopkeepers.', { position: 'absolute', left: '960px', top: '790px', fontFamily: 'Fredoka', fontWeight: 500, fontSize: '36px', color: '#3a220f', whiteSpace: 'nowrap' });
  [t1, t2, t3].forEach(x => gsap.set(x, { xPercent: -50, opacity: 0, y: 30 }));
  const again = goButton(ui, 'Play again ↻', 960, 890);
  const tl = gsap.timeline({ paused: true });
  tl.call(() => reveal(50, 40), null, 0);
  tl.from(card, { scale: .6, opacity: 0, duration: .5, ease: 'back.out(2)' }, .1);
  tl.fromTo(medal, { rotateY: 900, scale: 0, y: -200 }, { rotateY: 0, scale: 1, y: 0, duration: 1.6, ease: 'power3.out' }, .4);
  tl.call(() => { confetti(220, 960, 360); sfx('confetti', 1); sfx('sparkle', 1); }, null, 1.9);
  tl.call(() => voice('x1'), null, 2.0);
  tl.fromTo(medal.querySelector('.shine'), { x: -160 }, { x: 180, duration: 1, ease: 'power2.inOut', repeat: -1, repeatDelay: 1.6 }, 2);
  tl.to([t1, t2, t3], { opacity: 1, y: 0, duration: .5, stagger: .25, ease: 'back.out(2)' }, 2.2);
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
  lp.textContent = 'Tap to begin'; gsap.to(lp, { scale: 1.08, duration: .6, yoyo: true, repeat: -1 });
  await new Promise(r => $('#loader').addEventListener('click', () => { unlockAudio(); r(); }, { once: true }));
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

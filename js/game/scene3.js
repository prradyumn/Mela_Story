/* L3SC — Level 3 scene pieces (Mela Ground · Pari's money cart). Coordinates are stage px from the Figma DEV SPEC
   (frame 137:343) and lane_layout.json. The world (lane, lit stalls, signs, bill, burst, wheel) scrolls with the camera:
   screen x = world x − camera. The sky, sun, Pari, the cart, the "−", the slates and Aaru are fixed on screen. */
(function () {
  const { $, wait, sparks } = ST;
  const D = window.LEVEL3, A = n => GA('l3/' + n);
  const fmt = n => LEVEL1.fmt(n), rs = n => '₹' + fmt(n);
  const SIMG = n => (window.IMG && IMG[n] && IMG[n].src) || (window.EMBED && EMBED[n]) || `assets/story/${n}.webp`;   // story sprites
  const W = $('#world3'), clock = () => gsap.globalTimeline.time();
  const glowOn = (el, rgba = '255,214,90', px = 24, n = 3) => gsap.fromTo(el, { filter: `drop-shadow(0 0 0 rgba(${rgba},0))` },
    { filter: `drop-shadow(0 0 ${px}px rgba(${rgba},1))`, duration: .35, yoyo: true, repeat: n, ease: 'sine.inOut', onComplete: () => gsap.set(el, { clearProps: 'filter' }) });

  /* ---------- Pari (pari_push sheet: 6×6, 24 fps; frame 0 when still) ---------- */
  const P = $('#pari3'); P.style.backgroundImage = `url(${A('pari_push_sheet.webp')})`;
  let pariOn = false, pariT0 = 0;
  const pariFrame = k => { P.style.backgroundPosition = `${(k % 6) * 20}% ${Math.floor(k / 6) * 20}%`; };
  gsap.ticker.add(() => { if (pariOn) pariFrame(Math.floor((clock() - pariT0) * 24) % 36); });
  const Pari = { walk(on) { pariOn = on; pariT0 = clock(); if (!on) pariFrame(0); }, reset() { pariOn = false; pariFrame(0); } };
  pariFrame(0);

  /* ---------- talk waves (L3 has no bubbles: the speaker's head gets three soft arcs while the VO plays) ---------- */
  const WV = $('#waves3'); let wavesTl = null;
  const HEADS = { pari: { x: 150, y: 600, left: false }, baba: { x: 1500, y: 560, left: true }, guddu: { x: 1620, y: 560, left: true } };
  const Waves = {
    on(who) { const h = HEADS[who]; if (!h) return Waves.off(); gsap.set(WV, { left: h.x, top: h.y, opacity: 1 }); WV.classList.toggle('left', h.left);
      if (wavesTl) wavesTl.kill(); wavesTl = gsap.timeline({ repeat: -1 }).fromTo(WV.children, { opacity: 0, scale: .85 }, { opacity: 1, scale: 1, duration: .32, stagger: .14, ease: 'sine.out' }).to(WV.children, { opacity: .25, duration: .3, stagger: .1 }); },
    off() { if (wavesTl) { wavesTl.kill(); wavesTl = null; } gsap.to(WV, { opacity: 0, duration: .2 }); }
  };

  /* ---------- the money cart: wheels roll with the distance, the chalk panel shows the live money ---------- */
  const C = $('#cart3'), wheels = C.querySelectorAll('.wheel'), pval = C.querySelector('.pval');
  let wheelBase = 0, wheelAng = 0;
  const Cart = {
    roll(dist) { wheelAng = wheelBase + dist / 80 * 180 / Math.PI; gsap.set(wheels, { rotation: wheelAng }); },
    rollStart() { wheelBase = wheelAng; },
    speed(on) { gsap.to(C.querySelectorAll('.speed'), { opacity: on ? 1 : 0, x: on ? -14 : 0, duration: .25, stagger: .05 }); },
    glow() { return gsap.fromTo(C.querySelector('.cglow'), { opacity: 0 }, { opacity: 1, duration: .35, yoyo: true, repeat: 3, ease: 'sine.inOut' }); },   // cheap: opacity only
    show(on, dur = .4) { return gsap.to(C, { autoAlpha: on ? 1 : 0, duration: dur }); }   // Pari stays (Figma 04)
  };
  const Panel = {
    v: D.start, approx: false,
    set(v, approx = false) { Panel.v = v; Panel.approx = approx; pval.textContent = (approx ? '≈ ' : '') + rs(v); gsap.set(pval, { opacity: 1, clipPath: 'none' }); },
    glow() { return glowOn(pval, '255,230,140', 18, 3); },
    /* the duster sweeps the panel twice, chalk smears appear, the old number fades */
    async wipe() {
      const du = $('#duster3'), sm = C.querySelectorAll('.smears i');
      gsap.set(du, { left: 430, top: 793, opacity: 1, rotation: -6 }); SND.sfx('swish', .5);
      gsap.to(sm, { opacity: 1, duration: .25, stagger: .12 });
      gsap.to(pval, { opacity: 0, duration: .7 });
      await gsap.timeline().to(du, { left: 640, duration: .32, ease: 'sine.inOut' }).to(du, { left: 450, duration: .3, ease: 'sine.inOut' }).to(du, { left: 640, duration: .3, ease: 'sine.inOut' });
      gsap.to(du, { opacity: 0, y: 30, duration: .25, onComplete: () => gsap.set(du, { y: 0 }) });
      gsap.to(sm, { opacity: 0, duration: .5, delay: .1 });
    },
    /* chalk writes the new value in, left to right */
    async write(v, approx = true) {
      Panel.set(v, approx); SND.sfx('scribble', .5);
      await gsap.fromTo(pval, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: .7, ease: 'power1.inOut' });
      gsap.set(pval, { clipPath: 'none' }); gsap.fromTo(pval, { scale: 1.12 }, { scale: 1, duration: .35, ease: 'back.out(3)' });
    }
  };

  /* ---------- camera + push ---------- */
  const Cam = {
    x: 0,
    set(x) { Cam.x = x; gsap.set(W, { x: -x, y: 0, scale: 1 }); },
    /* Pari pushes the cart: the lane scrolls to camera `to`, the wheels turn distance/80 rad, Pari plays her push frames */
    async push(to, { dur = 1.4, ease = 'power2.inOut' } = {}) {
      const from = Cam.x, o = { x: from }; if (Math.abs(to - from) < 1) return;
      Cart.rollStart(); Pari.walk(to > from); if (to > from) { Cart.speed(true); SND.sfx('whoosh', .25); }
      await gsap.to(o, { x: to, duration: dur, ease, onUpdate() { Cam.set(o.x); Cart.roll(o.x - from); } });
      Pari.walk(false); Cart.speed(false);
    }
  };

  /* ---------- the "−" (take away) ---------- */
  const M = $('#minus3');
  const Minus = {
    show() { SND.sfx('pop', .4); return gsap.to(M, { scale: 1, duration: .35, ease: 'back.out(3)' }); },
    hide() { return gsap.to(M, { scale: 0, duration: .2 }); },
    glow() { return glowOn(M, '255,214,90', 22, 3); }
  };

  /* ---------- the shopkeeper's bill on the stall hook ---------- */
  const B = $('#bill3'), HK = $('#hook3');
  let sway = null;
  /* the hook is drawn over the bill's rope loop (the bill hangs ON it), at the stall's hook point */
  const hookAt = i => { const [hx, hy] = D.hooks[i]; HK.style.display = 'block'; gsap.set(HK, { left: hx - 14, top: hy - 42 }); };
  const Bill = {
    i: 0,
    show(i, price, { teach = false } = {}) {
      const [hx, hy] = D.hooks[i]; Bill.i = i;
      if (sway) { sway.kill(); sway = null; }
      B.className = teach ? 'teach' : ''; gsap.set(B, { clearProps: 'transform,opacity' }); Object.assign(B.style, { left: (hx - 150) + 'px', top: (hy - 16) + 'px' });   // rope loop top 12 px above the hook's curve
      hookAt(i);
      B.querySelector('.price').textContent = rs(price);
      gsap.set(B.querySelector('.chip'), { opacity: 0, scale: 1 }); gsap.set(B.querySelector('.paid'), { opacity: 0 });
    },
    /* drops from 150 px above onto the hook, then swings −9° → 0 */
    /* drops from 150 px above; the loop catches the hook (a little bounce), then it swings −9° → 0 and keeps a gentle sway */
    async drop() {
      SND.sfx('swish', .4);
      await gsap.fromTo(B, { y: -150, opacity: 0, rotation: 0 }, { y: 6, opacity: 1, duration: .42, ease: 'power2.in' });
      SND.sfx('tick', .5);
      gsap.to(B, { y: 0, duration: .35, ease: 'back.out(3)' });
      await gsap.fromTo(B, { rotation: -9 }, { rotation: 0, duration: 1.2, ease: 'elastic.out(1,.28)' });
      sway = gsap.fromTo(B, { rotation: -1.2 }, { rotation: 1.2, duration: 1.6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    },
    async chip(color, value) {
      const c = B.querySelector('.chip'); c.textContent = '≈ ' + fmt(value); c.classList.toggle('yellow', color === 'yellow');
      SND.sfx('pop', .4); await gsap.fromTo(c, { opacity: 0, scale: .4 }, { opacity: 1, scale: 1, duration: .35, ease: 'back.out(2.4)' });
    },
    glow() { return glowOn(B.querySelector('.price'), '255,214,90', 18, 3); },
    async paid() {
      const p = B.querySelector('.paid'); SND.sfx('stamp', .8);
      gsap.fromTo(B, { scale: 1.07 }, { scale: 1, duration: .4, ease: 'elastic.out(1,.4)' });
      await gsap.fromTo(p, { opacity: 0, scale: 1.7, rotation: -14 }, { opacity: 1, scale: 1, rotation: -8, duration: .22, ease: 'power3.in' });
    },
    away() { if (sway) { sway.kill(); sway = null; } gsap.to(HK, { opacity: 0, duration: .3, onComplete: () => { HK.style.display = 'none'; gsap.set(HK, { opacity: 1 }); } });
      return gsap.to(B, { y: -260, rotation: 10, opacity: 0, duration: .55, ease: 'power2.in', onComplete: () => B.classList.add('hidden') }); },
    centre() { const [hx, hy] = D.hooks[Bill.i]; return { x: hx - Cam.x, y: hy + 130 }; }
  };

  /* ---------- the three answer slates (takhti) ---------- */
  const S = [...document.querySelectorAll('#game .slate3')];
  let onPick = null;
  S.forEach((s, i) => { s.style.left = (930 + i * 230) + 'px';
    s.addEventListener('pointerdown', e => { e.preventDefault(); if (!onPick || s.classList.contains('locked') || s.classList.contains('faded')) return; SND.sfx('pop', .35); onPick(i); }); });
  const Slates = {
    S,
    async show(vals) {
      S.forEach((s, i) => { s.className = 'slate3 locked'; s.querySelector('.val').textContent = rs(vals[i]); gsap.set(s, { clearProps: 'all' }); s.style.left = (930 + i * 230) + 'px'; gsap.set(s.querySelector('.tick'), { scale: 0 }); });
      SND.sfx('rise', .35);
      await gsap.fromTo(S, { y: 320, opacity: 0 }, { y: 0, opacity: 1, duration: .5, stagger: .12, ease: 'back.out(1.5)' });
    },
    enable(fn) { onPick = fn; S.forEach(s => s.classList.remove('locked')); },
    disable() { onPick = null; S.forEach(s => s.classList.add('locked')); },
    state(i, cls) { const s = S[i], lock = s.classList.contains('locked'); s.className = 'slate3' + (cls ? ' ' + cls : '') + (lock ? ' locked' : ''); },
    wiggle(i) { return gsap.fromTo(S[i], { rotation: 0 }, { rotation: 5, duration: .06, repeat: 5, yoyo: true, ease: 'sine.inOut', onComplete: () => gsap.set(S[i], { rotation: 0 }) }); },
    pulse() { S.forEach(s => { if (!s.classList.contains('faded') && !s.classList.contains('glow')) { s.classList.remove('pulse'); void s.offsetWidth; s.classList.add('pulse'); } }); },
    tick(i) { return gsap.to(S[i].querySelector('.tick'), { scale: 1, duration: .3, ease: 'back.out(3)' }); },
    /* centre of a slate in the coordinates SC.Hand.show expects (the hand lands at (1002 + 230i, 935), as in Figma) */
    handAt(i) { return { x: 936 + i * 230, y: 1039 }; },
    async hide() { await gsap.to(S, { y: 320, opacity: 0, duration: .35, stagger: .05, ease: 'power2.in' }); S.forEach(s => s.className = 'slate3 hidden'); }
  };

  /* ---------- Aaru: runs on the ground (story run frames by distance), hops in place with the potli held up in his hand ---------- */
  const AR = $('#aaru3'), AI = AR.querySelector('img'), PT = $('#potli3');
  const RUN_H = 360, JUMP_H = 380, STEP = 50, SPEED = 750, GROUND = 990;   // ~85 % of Pari; feet on the same ground line as Pari and the cart
  const JW = JUMP_H * 659 / 1080;                                           // aaru_jump canvas width at JUMP_H
  const ast = { x: 2100, feet: GROUND, face: -1, pose: 'run', k: 0, potli: false };
  const SH = document.createElement('i'); SH.className = 'ashadow'; AR.parentNode.insertBefore(SH, AR);
  function aaruLayout() {
    gsap.set(AR, { left: ast.x, top: ast.feet });
    const up = Math.max(0, GROUND - ast.feet);                    // his shadow stays on the ground and shrinks as he hops
    gsap.set(SH, { left: ast.x - 90, top: GROUND - 16, scale: 1 - up / 220, opacity: AR.style.display === 'none' ? 0 : .9 - up / 160 });
    if (ast.pose === 'jump') { AI.src = SIMG('aaru_jump'); AI.style.height = JUMP_H + 'px'; AI.style.bottom = '0px'; }
    else { AI.src = SIMG('aaru_run_' + ast.k); AI.style.height = RUN_H + 'px'; AI.style.bottom = '-4px'; }
    AI.style.transform = 'translateX(-50%)' + (ast.face < 0 ? ' scaleX(-1)' : '');
    if (!ast.potli) return;
    let fx, fy;
    if (ast.pose === 'jump') {   // the raised fist on the side he faces (aaru_jump: right fist at 0.94, 0.12 of the canvas)
      fx = ast.x - JW / 2 + (ast.face > 0 ? .94 : .06) * JW; fy = ast.feet - JUMP_H + .12 * JUMP_H;
      gsap.set(PT, { left: fx - 50, top: fy - 16, rotation: 0 });
    } else {                     // running: hugged to his chest
      fx = ast.x + ast.face * .14 * RUN_H; fy = ast.feet - .56 * RUN_H;
      gsap.set(PT, { left: fx - 50, top: fy - 50, rotation: ast.face * 6 });
    }
  }
  let hopTl = null;
  const Aaru = {
    show(x, feet = GROUND) { Object.assign(ast, { x, feet, pose: 'run', k: 0 }); AR.style.display = 'block'; aaruLayout(); },
    hide() { Aaru.bounce(false); AR.style.display = 'none'; gsap.set(SH, { opacity: 0 }); ast.potli = false; gsap.to(PT, { opacity: 0, duration: .2 }); },
    pose(p) { ast.pose = p; aaruLayout(); },
    face(d) { ast.face = d; aaruLayout(); },
    carry(on) { ast.potli = on; gsap.set(PT, { opacity: on ? 1 : 0 }); aaruLayout(); },
    async run(toX, toFeet = GROUND) {
      Aaru.bounce(false);
      const x0 = ast.x, f0 = ast.feet, o = { t: 0 }; ast.face = toX < x0 ? -1 : 1; ast.pose = 'run';
      await gsap.to(o, { t: 1, duration: Math.max(.35, Math.abs(toX - x0) / SPEED), ease: 'sine.inOut', onUpdate() { ast.x = x0 + (toX - x0) * o.t; ast.feet = f0 + (toFeet - f0) * o.t; ast.k = Math.floor(Math.abs(ast.x - x0) / STEP) % 36; aaruLayout(); } });
    },
    /* excited little hops on the spot (jump pose), until bounce(false) */
    bounce(on) {
      if (hopTl) { hopTl.kill(); hopTl = null; ast.feet = GROUND; aaruLayout(); }
      if (!on) return;
      ast.pose = 'jump';
      hopTl = gsap.timeline({ repeat: -1, repeatDelay: .12 }).to(ast, { feet: GROUND - 34, duration: .2, ease: 'power2.out', onUpdate: aaruLayout }).to(ast, { feet: GROUND, duration: .2, ease: 'power2.in', onUpdate: aaruLayout });
    },
    async hop(h = 70) { Aaru.bounce(false); ast.pose = 'jump'; await gsap.to(ast, { feet: GROUND - h, duration: .22, ease: 'power2.out', yoyo: true, repeat: 1, onUpdate: aaruLayout }); },
    potliCentre() { const r = PT.getBoundingClientRect(), st = $('#stage').getBoundingClientRect(), k = st.width / 1920; return { x: (r.left - st.left) / k + r.width / k / 2, y: (r.top - st.top) / k + r.height / k * .6 }; },
    /* hand the potli over: it flies from his hand onto the bill */
    async giveTo(x, y) { const c = Aaru.potliCentre(); gsap.set(PT, { opacity: 0 }); ast.potli = false; await ST.flyImg(A('potli.webp'), c.x, c.y, x, y, { size: 100, endSize: 70, lift: 120, dur: .5 }); }
  };

  /* ---------- coins: arc from the cart's money bag into the potli (or off-screen in the how-to) ---------- */
  const BAG = { x: 451, y: 721 };
  const Coins = {
    async toPotli(n = 5) {
      SND.sfx('coins', .6);
      const t = Aaru.potliCentre();   // into the potli in his raised hand
      await Promise.all(Array.from({ length: n }, (_, k) => new Promise(r => gsap.delayedCall(k * .12, () => ST.flyImg(A('coin.webp'), BAG.x, BAG.y, t.x + (k - 2) * 6, t.y, { size: 54, endSize: 44, lift: 220 + k * 20, dur: .6 }).then(r)))));
      gsap.fromTo(PT, { scale: 1.15 }, { scale: 1, duration: .3, ease: 'back.out(3)' });
    },
    hopOff(n = 4) {
      SND.sfx('coins', .45);
      for (let k = 0; k < n; k++) gsap.delayedCall(k * .15, () => ST.flyImg(A('coin.webp'), BAG.x, BAG.y, 700 + k * 130, -80, { size: 54, endSize: 64, lift: 160, dur: .9 }));
    }
  };

  /* ---------- stalls: dark → lit crossfade + light burst; sun ---------- */
  const LIT = [...document.querySelectorAll('#game .lit3')], BU = $('#burst3');
  const Stall = {
    set(n) { LIT.forEach((l, i) => gsap.set(l, { opacity: i < n ? 1 : 0 })); },
    async light(i) {
      const [hx, hy] = D.hooks[i];
      gsap.set(BU, { left: hx - 360, top: hy + 10 - 360 });
      SND.sfx('rise', .5); SND.sfx('sparkle', .7);
      gsap.fromTo(BU, { scale: .4, opacity: 1 }, { scale: 1.2, opacity: 0, duration: 1.2, ease: 'power2.out' });
      await gsap.to(LIT[i], { opacity: 1, duration: .8, ease: 'sine.inOut' });
      sparks(hx - Cam.x, hy - 120, 16, 140);
    }
  };
  const SUN = $('#sun3');
  const Sun = { set(paid) { gsap.set(SUN, { top: 50 + 60 * paid }); }, to(paid) { return gsap.to(SUN, { top: 50 + 60 * paid, duration: 1.2, ease: 'sine.inOut' }); } };

  /* ---------- fireworks (6×6 sheet, 256², 24 fps, anchor centre) ---------- */
  const FW = $('#fw3');
  const Fw = {
    burst(cx, cy, size) {
      const d = document.createElement('div'); d.className = 'fw'; FW.appendChild(d);
      Object.assign(d.style, { left: (cx - size / 2) + 'px', top: (cy - size / 2) + 'px', width: size + 'px', height: size + 'px', backgroundImage: `url(${A('firework_sheet.webp')})`, backgroundSize: `${size * 6}px ${size * 6}px` });
      const o = { f: 0 }; SND.sfx('pop', .45, .7);
      gsap.to(o, { f: 35, duration: 36 / 24, ease: 'none', onUpdate() { const k = Math.round(o.f); d.style.backgroundPosition = `${-(k % 6) * size}px ${-Math.floor(k / 6) * size}px`; }, onComplete: () => d.remove() });
    },
    show(list, every = 1.1, times = 2) { for (let r = 0; r < times; r++) list.forEach(([x, y, s], k) => gsap.delayedCall(r * every * list.length / 2 + k * .45, () => Fw.burst(x, y, s))); },
    clear() { FW.innerHTML = ''; }
  };

  /* ---------- finale: whole lane lit, the baked wheel is replaced by stand + spinning rotor ---------- */
  const WH = $('#wheel3'), ROT = WH.querySelector('.rotor');
  const CLIP = 'polygon(0 0, 4960px 0, 4960px 756px, 5760px 756px, 5760px 1080px, 0 1080px)';   // hides the wheel baked into the lane
  let spin = null;
  const Wheel = {
    async light() {
      gsap.set(['#lane3', '#laneLit3'], { clipPath: CLIP });
      WH.style.display = 'block'; gsap.set(ROT, { rotation: 0 });
      gsap.to('#laneLit3', { opacity: 1, duration: 1.4 });
      gsap.fromTo(WH, { opacity: 0 }, { opacity: 1, duration: .6 });
      gsap.set(BU, { left: D.wheel[0] - 420, top: D.wheel[1] - 420, width: 840, height: 840 });
      gsap.fromTo(BU, { scale: .5, opacity: 1 }, { scale: 1.2, opacity: 0, duration: 1.6, ease: 'power2.out', onComplete: () => gsap.set(BU, { width: 720, height: 720 }) });
      spin = gsap.to(ROT, { rotation: 360, duration: 8, ease: 'none', repeat: -1 }); spin.timeScale(0);
      gsap.to(spin, { timeScale: 1, duration: 2.5, ease: 'power1.in' });
    },
    reset() { if (spin) { spin.kill(); spin = null; } WH.style.display = 'none'; gsap.set(['#lane3', '#laneLit3'], { clipPath: 'none' }); gsap.set('#laneLit3', { opacity: 0 }); }
  };

  /* ---------- how-to 3: zoom out to the whole lane (1/3) — stall numbers pop, ★ on the wheel, the mini cart traces the route ---------- */
  const MAP = $('#map3');
  const NUMS = [[90.7, 351.3], [320.7, 351.7], [550.7, 311.3], [780.7, 311.3], [1010.7, 311.7], [1240.7, 359], [1470.7, 362.7]];
  const Map = {
    async on() {
      Cart.show(false); Minus.hide();
      gsap.to('#ground3', { opacity: 1, duration: .6 });
      await gsap.to(W, { x: 0, y: 300, scale: 1 / 3, duration: 1.2, ease: 'power2.inOut' });
      MAP.innerHTML = `<div class="route"></div><img class="mini" src="${A('money_cart.webp')}" alt="">` + NUMS.map(([x, y], i) => `<div class="num" style="left:${x}px;top:${y}px">${i + 1}</div>`).join('') + `<div class="star" style="left:1748px;top:330px">★</div>`;
      const nums = MAP.querySelectorAll('.num'), star = MAP.querySelector('.star');
      gsap.set([...nums, star], { scale: 0 }); gsap.from(MAP.querySelector('.route'), { scaleX: 0, transformOrigin: '0 50%', duration: .8 });
      nums.forEach((n, i) => gsap.to(n, { scale: 1, duration: .3, ease: 'back.out(3)', delay: .2 + i * .3, onStart: () => SND.sfx('pop', .35, 1 + i * .06) }));
      gsap.to(star, { scale: 1, duration: .4, ease: 'back.out(3)', delay: .2 + 7 * .3, onStart: () => SND.sfx('sparkle', .5) });
      gsap.to(MAP.querySelector('.mini'), { left: 1660, duration: 3.2, ease: 'sine.inOut', delay: .4 });
    },
    async off(instant = false) {
      gsap.to(MAP, { opacity: 0, duration: instant ? 0 : .3, onComplete: () => { MAP.innerHTML = ''; gsap.set(MAP, { opacity: 1 }); } });
      gsap.to('#ground3', { opacity: 0, duration: instant ? 0 : .6 });
      await gsap.to(W, { x: -Cam.x, y: 0, scale: 1, duration: instant ? 0 : 1.1, ease: 'power2.inOut' });
      Cart.show(true, instant ? 0 : .4);
    }
  };

  /* ---------- Baba (story talking frames baba_talk_0–35, same as the story's CH.baba.acts.talk): walks in from the right,
     talks while his VO plays (forward and back), glides back to frame 0 (≈ baba_idle) when he stops, walks out ---------- */
  const BB = $('#baba3'), BN = 36, BFPS = 10.5;
  const bImgs = [...Array(BN)].map(() => { const im = document.createElement('img'); im.alt = ''; BB.appendChild(im); return im; });
  let bLoaded = false, bTalk = false, bT0 = 0, bStop = null, bFrom = 0, bShown = -1;
  const bFrame = k => { if (k === bShown) return; bImgs.forEach((im, j) => im.style.opacity = j === k ? 1 : 0); bShown = k; };
  gsap.ticker.add(() => {
    if (bTalk) { const f = Math.floor((clock() - bT0) * BFPS), P2 = 2 * (BN - 1), m = f % P2; bFrame(m < BN ? m : P2 - m); }
    else if (bStop != null) { const k = bFrom - Math.floor((clock() - bStop) * BFPS * 3); if (k <= 0) { bStop = null; bFrame(0); } else bFrame(k); }
  });
  const Baba = {
    async enter() {
      if (!bLoaded) { bImgs.forEach((im, i) => im.src = SIMG('baba_talk_' + i)); bLoaded = true; }
      bFrame(0); gsap.set(BB, { x: 520, opacity: 0 });
      gsap.to(BB, { y: -8, duration: .2, yoyo: true, repeat: 3, ease: 'sine.inOut' });
      await gsap.to(BB, { x: 0, opacity: 1, duration: .9, ease: 'power2.out' });
    },
    async exit() { Baba.talk(false); gsap.to(BB, { y: -8, duration: .2, yoyo: true, repeat: 3, ease: 'sine.inOut' }); await gsap.to(BB, { x: 520, opacity: 0, duration: .8, ease: 'power2.in' }); },
    talk(on) {
      if (on) { if (!bTalk) { bT0 = clock() - Math.max(0, bShown) / BFPS; bTalk = true; bStop = null; } }
      else if (bTalk) { bTalk = false; bStop = clock(); bFrom = Math.max(0, bShown); }
    },
    hide() { bTalk = false; bStop = null; gsap.set(BB, { opacity: 0, x: 520 }); if (bLoaded) bFrame(0); }
  };

  /* ---------- Guddu Bhaiya (story sprites): walks in from the right with his notebook for the teach round ---------- */
  const GD = $('#guddu3');
  const Guddu = {
    async enter() { GD.src = SIMG('guddu_write'); gsap.set(GD, { x: 480, opacity: 0 });
      gsap.to(GD, { y: -8, duration: .2, yoyo: true, repeat: 3, ease: 'sine.inOut' });
      await gsap.to(GD, { x: 0, opacity: 1, duration: .9, ease: 'power2.out' }); },
    pose(p) { GD.src = SIMG('guddu_' + p); },
    async exit() { gsap.to(GD, { y: -8, duration: .2, yoyo: true, repeat: 3, ease: 'sine.inOut' }); await gsap.to(GD, { x: 480, opacity: 0, duration: .8, ease: 'power2.in' }); },
    hide() { gsap.set(GD, { opacity: 0, x: 480 }); }
  };

  window.L3SC = { Guddu, Cam, Pari, Waves, Cart, Panel, Minus, Bill, Slates, Aaru, Coins, Stall, Sun, Fw, Wheel, Map, Baba, glowOn };
})();

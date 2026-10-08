/* GFX — the game's visual polish layer (Oct 2026). Visual only: no numbers, choices, lines or 3-strike timings change.
   · grade(p)      sunset grade: the light warms with the sun (L1 golden → L2 orange); characters get the same grade (--cg)
   · focus(on)     while Pari asks, the background dims at the edges (the numbers, buttons and characters stay bright);
                   flash() = a warm glow on a correct answer. Background life calms down while a question is up.
   · press(el)     squash on tap · ring(el) = ring of light from the correct answer
   · stars(imgs,n) complete-card stars stamp in one by one
   · ambient(n)    background life: L1 bunting + birds, L2 dust in the window light, L3 bulbs twinkle on lit stalls
   · hopTrail()    dotted arc behind Gudiya's hops on the number line
   Layers sit right above #gBg (auto z, DOM order), so every game piece stays above them; L3 has its own copies in #l3. */
(function () {
  const { $, sparks } = ST;
  const mk = (id, cls, html = '') => { const d = document.createElement('div'); if (id) d.id = id; if (cls) d.className = cls; d.innerHTML = html; return d; };
  const amb = mk('gAmb'), grade = mk('gGrade', '', '<i class="gold"></i><i class="dusk"></i>'), focus = mk('gFocus', 'gfocus'), flash = mk('gFlash', 'gflash');
  $('#gBg').after(amb, grade, focus, flash);
  const trail = mk('gTrail'); $('#gudiya').before(trail);                  // under Gudiya, over the number line
  const focus3 = mk('focus3', 'gfocus'), flash3 = mk('flash3', 'gflash'); $('#world3').after(focus3, flash3);
  const tw3 = mk('tw3'); $('#laneLit3').after(tw3);
  const stage = $('#stage');
  const clamp = v => Math.max(0, Math.min(1, v));
  const inL3 = () => !!window.L3_ACTIVE;

  /* ---------- sunset grade ----------
     p = sun position on the story's scale (L1 .12 → .35, L2 .35 → .6). gold builds through L1, dusk joins in L2. */
  const G = { p: 0 };
  function applyGrade() {
    const g = clamp((G.p - .1) / .36), d = clamp((G.p - .38) / .26);
    grade.children[0].style.opacity = g; grade.children[1].style.opacity = d;
    $('#game').style.setProperty('--cg', `sepia(${(.04 + .16 * g + .08 * d).toFixed(3)}) saturate(${(1 + .1 * g).toFixed(3)}) brightness(${(1 - .04 * g - .08 * d).toFixed(3)})`);
  }
  let gradeTw = null;
  function setGrade(p, dur = 1.4) {
    if (gradeTw) gradeTw.kill();
    if (!dur) { G.p = p; applyGrade(); return; }
    // the overlay glides; the character filter changes once, at the end of the step (a filter that animates every frame is costly)
    gradeTw = gsap.to(G, { p, duration: dur, ease: 'sine.inOut', onUpdate() {
      grade.children[0].style.opacity = clamp((G.p - .1) / .36); grade.children[1].style.opacity = clamp((G.p - .38) / .26);
    }, onComplete: applyGrade });
  }

  /* ---------- focus dim + flash ---------- */
  let focusOn = false;
  const FOCUS = { 1: { x: '50%', y: '56%', o: 1 }, 2: { x: '62%', y: '52%', o: 1 }, 3: { x: '50%', y: '52%', o: .75 } };
  function setFocus(on) {
    if (focusOn === on) return; focusOn = on;
    const el = inL3() ? focus3 : focus, f = FOCUS[GFX.level] || FOCUS[1];
    el.style.setProperty('--fx', f.x); el.style.setProperty('--fy', f.y);
    gsap.to(el, { opacity: on ? f.o : 0, duration: on ? .8 : .5, ease: 'sine.inOut', overwrite: true });
    calm(on);
  }
  function doFlash(x = 960, y = 600) {
    const el = inL3() ? flash3 : flash;
    el.style.setProperty('--x', x + 'px'); el.style.setProperty('--y', y + 'px');
    gsap.timeline().to(el, { opacity: 1, duration: .14, ease: 'power2.out' }).to(el, { opacity: 0, duration: 1, ease: 'sine.inOut' });
  }

  /* ---------- buttons: squash on tap, ring of light from the correct one ---------- */
  // Web Animations on the individual `scale` property: stacks with GSAP's transform and survives class swaps
  function press(el) { try { el.animate([{ scale: '1' }, { scale: '1.07 .86', offset: .3 }, { scale: '.97 1.05', offset: .62 }, { scale: '1' }], { duration: 380, easing: 'ease-out' }); } catch (e) { } }
  function stageRect(el) {
    const s = stage.getBoundingClientRect(), r = el.getBoundingClientRect(), k = 1920 / s.width;
    return { x: (r.left - s.left) * k, y: (r.top - s.top) * k, w: r.width * k, h: r.height * k };
  }
  function ringAt(x, y, d, { n = 2, grow = 1.9, colour = '255,214,90' } = {}) {
    for (let i = 0; i < n; i++) {
      const r = mk(null, 'gring'); r.style.cssText = `left:${x - d / 2}px;top:${y - d / 2}px;width:${d}px;height:${d}px;--c:${colour}`;
      $('#gFx').appendChild(r);
      gsap.fromTo(r, { scale: .55, opacity: 1 }, { scale: grow, opacity: 0, duration: .85, delay: i * .16, ease: 'power2.out', onComplete: () => r.remove() });
    }
  }
  /* a ring of light in the answer's own shape (rounded rect), growing out from it */
  function ring(el, radius = el.classList.contains('gbtn') ? 60 : 34) {
    const r = stageRect(el);
    for (let i = 0; i < 2; i++) {
      const d = mk(null, 'gring'); d.style.cssText = `left:${r.x - 6}px;top:${r.y - 6}px;width:${r.w + 12}px;height:${r.h + 12}px;border-radius:${radius}px;--c:255,214,90`;
      $('#gFx').appendChild(d);
      gsap.fromTo(d, { scaleX: .96, scaleY: .96, opacity: 1 }, { scaleX: 1 + 90 / r.w, scaleY: 1 + 90 / r.h, opacity: 0, duration: .8, delay: i * .18, ease: 'power2.out', onComplete: () => d.remove() });
    }
  }

  /* ---------- complete card: stars stamp in one by one ---------- */
  async function stars(imgs, n) {
    const card = imgs[0].closest('.gcard');
    for (let i = 0; i < imgs.length; i++) {
      const im = imgs[i], won = i < n;
      await gsap.fromTo(im, { scale: 2.6, rotation: -28, opacity: 0 }, { scale: 1, rotation: 0, opacity: won ? 1 : .35, duration: .3, ease: 'power3.in' });
      if (won) {
        SND.sfx('stamp', .55); SND.sfx('sparkle', .8);
        const r = stageRect(im); sparks(r.x + r.w / 2, r.y + r.h / 2, 16, 110); ringAt(r.x + r.w / 2, r.y + r.h / 2, r.w * 1.1, { n: 1, grow: 1.7 });
        gsap.fromTo(card, { y: 0 }, { y: 5, duration: .06, yoyo: true, repeat: 1 });
      }
      gsap.fromTo(im, { scale: .86 }, { scale: 1, duration: .35, ease: 'back.out(3)' });
      await new Promise(r => gsap.delayedCall(.16, r));
    }
  }

  /* ---------- background life (calm while a question is up) ---------- */
  let life = [], calmed = false, birdCall = null, twAll = [];
  const keep = t => { life.push(t); if (calmed) t.timeScale(.25); return t; };
  function calm(on) {
    calmed = on;
    life.concat(twAll).forEach(t => gsap.to(t, { timeScale: on ? .25 : 1, duration: .6, overwrite: 'auto' }));
    gsap.to([amb, tw3], { opacity: on ? .8 : 1, duration: .6, overwrite: 'auto' });
  }
  function stopLife() {
    life.forEach(t => t.kill()); life = []; strings = []; lastBg = ''; if (birdCall) { birdCall.kill(); birdCall = null; }
    amb.innerHTML = ''; gsap.set(amb, { opacity: 1 }); amb.className = '';
  }
  const PENN = ['#e8870e', '#b5361d', '#3fa34d', '#2f62c9', '#f7b733', '#e85d9b', '#fff3d6'];
  /* a string of pennants between two anchors (functions → {x, y}): one end tied to the marigold bar (fixed), the other to a
     stall's roof ridge in the background, so it follows #gBg as the bazaar pans (relaid out whenever the background moves) */
  let strings = [], lastBg = '';
  function layString(st) {
    const a = st.a(), b = st.b(), cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2 + st.sag * 2;
    st.path.setAttribute('d', `M${a.x} ${a.y} Q${cx} ${cy} ${b.x} ${b.y}`);
    st.penns.forEach((p, k) => {
      const t = (k + 1) / (st.penns.length + 1), x = (1 - t) * (1 - t) * a.x + 2 * t * (1 - t) * cx + t * t * b.x, y = (1 - t) * (1 - t) * a.y + 2 * t * (1 - t) * cy + t * t * b.y;
      p.style.left = (x - 17) + 'px'; p.style.top = (y - 2) + 'px';
    });
    st.knots.forEach((k, i) => { const q = i ? b : a; k.setAttribute('transform', `translate(${q.x} ${q.y})`); });
  }
  function bunting(a, b, sag, n, shift) {
    // the string, a knot where it meets the marigold bar, and a tied knot with two short loose ends on the awning
    amb.insertAdjacentHTML('beforeend', `<svg class="bstr" viewBox="0 0 1920 1080"><path fill="none" stroke="#5a3212" stroke-width="3.5" stroke-linecap="round"/><g class="k"><circle r="5.5" fill="#5a3212"/></g><g class="k"><path d="M0 0 q-3 12 -9 18 M0 0 q4 11 2 19" fill="none" stroke="#5a3212" stroke-width="3" stroke-linecap="round"/><circle r="7" fill="#6b3d16" stroke="#3a1f08" stroke-width="2"/></g></svg>`);
    const svg = amb.lastChild, st = { a, b, sag, path: svg.querySelector('path'), knots: [...svg.querySelectorAll('g.k')], penns: [] };
    for (let i = 0; i < n; i++) {
      const p = mk(null, 'penn'); p.style.background = PENN[(i + shift) % PENN.length]; amb.appendChild(p); st.penns.push(p);
      keep(gsap.fromTo(p, { rotation: -5 - Math.random() * 3 }, { rotation: 5 + Math.random() * 3, duration: 1.3 + Math.random() * .9, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: -Math.random() * 2 }));
    }
    strings.push(st); layString(st);
  }
  // tie points on the stalls' awnings in bg_bazaar px (just inside the slanted edge facing the middle) → stage px through #gBg
  // (#gBg is the 1920×1080 art at 1.15×, left −144, top −81, plus its pan x / footstep y)
  const BGP = (ix, iy) => () => ({ x: -144 + ix * 1.15 + gsap.getProperty('#gBg', 'x'), y: -81 + iy * 1.15 + gsap.getProperty('#gBg', 'y') });
  gsap.ticker.add(() => {
    if (!strings.length) return;
    const k = gsap.getProperty('#gBg', 'x') + ',' + gsap.getProperty('#gBg', 'y');
    if (k !== lastBg) { lastBg = k; strings.forEach(layString); }
  });
  function flock() {
    const left = Math.random() < .5, y = 110 + Math.random() * 90, n = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < n; i++) {
      const b = mk(null, 'gbird', '<svg viewBox="0 0 46 20"><path d="M2 12 Q12 0 23 12 Q34 0 44 12" fill="none" stroke="#4a3626" stroke-width="3.5" stroke-linecap="round"/></svg>');
      amb.appendChild(b); const s = .55 + Math.random() * .35;
      keep(gsap.to(b.firstChild, { scaleY: -.6, duration: .2 + Math.random() * .08, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
      keep(gsap.fromTo(b, { x: left ? -120 - i * 60 : 2040 + i * 60, y: y + i * 22 + (i % 2) * 14, scale: s, scaleX: left ? s : -s },
        { x: left ? 2040 : -140, y: '-=' + (30 + Math.random() * 50), duration: 14 + Math.random() * 4, ease: 'none', onComplete: () => b.remove() }));
    }
    birdCall = gsap.delayedCall(16 + Math.random() * 10, flock);
  }
  function motes() {
    amb.insertAdjacentHTML('beforeend', '<i class="beam"></i>');
    keep(gsap.fromTo(amb.lastChild, { opacity: .55 }, { opacity: 1, duration: 4.5, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
    for (let i = 0; i < 22; i++) {
      const m = mk(null, 'mote'), s = 7 + Math.random() * 9; m.style.cssText = `width:${s}px;height:${s}px`;
      amb.appendChild(m);
      const x = 60 + Math.random() * 760, y = 40 + Math.random() * 470;
      gsap.set(m, { x, y, opacity: 0 });
      keep(gsap.to(m, { x: x + 40 + Math.random() * 90, y: y + 30 + Math.random() * 70, duration: 7 + Math.random() * 6, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: -Math.random() * 6 }));
      keep(gsap.to(m, { opacity: .5 + Math.random() * .5, duration: 1.6 + Math.random() * 2, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: Math.random() * 2 }));
    }
  }
  function ambient(level) {
    stopLife(); GFX.level = level; calmed = false;
    if (level === 1) { amb.className = 'l1'; bunting(() => ({ x: 694, y: 74 }), BGP(281, 369), 26, 10, 0); bunting(() => ({ x: 1226, y: 74 }), BGP(1676, 385), 26, 10, 3); birdCall = gsap.delayedCall(4, flock); }   // tied to each awning's slanted edge (visible at every pan step)
    if (level === 2) { amb.className = 'l2'; motes(); }
  }

  /* ---------- L3: the bulbs of a lit stall twinkle ---------- */
  const D3 = window.LEVEL3;
  tw3.innerHTML = D3.bulbs.map((list, i) => `<div class="twg" data-i="${i}">${list.map(([x, y]) => `<i style="left:${x - 26}px;top:${y - 26}px"></i>`).join('')}</div>`).join('');
  const groups = [...tw3.children], twOf = [];
  function twinkle(n) {   // stalls 0..n-1 are lit
    groups.forEach((g, i) => {
      const on = i < n;
      if (on && !twOf[i]) {
        twOf[i] = [...g.children].map(b => gsap.fromTo(b, { opacity: .15 }, { opacity: .95, duration: .5 + Math.random() * .9, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: Math.random() * 1.2 }));
        twAll.push(...twOf[i]); if (calmed) twOf[i].forEach(t => t.timeScale(.25));
        gsap.fromTo(g, { opacity: 0 }, { opacity: 1, duration: .8 });
      }
      if (!on && twOf[i]) { twOf[i].forEach(t => t.kill()); twAll = twAll.filter(t => !twOf[i].includes(t)); twOf[i] = null; gsap.set(g, { opacity: 0 }); }
    });
  }

  /* ---------- Gudiya's hop trail on the number line ---------- */
  function hopTrail(x0, x1, y, lift, dur) {
    const n = Math.max(4, Math.round(Math.abs(x1 - x0) / 22));
    for (let i = 1; i < n; i++) {
      const t = i / n, d = mk(null, 'tdot');
      d.style.left = (x0 + (x1 - x0) * t - 6) + 'px'; d.style.top = (y - lift * Math.sin(Math.PI * t) - 6) + 'px';
      trail.appendChild(d);
      gsap.fromTo(d, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: .16, delay: t * dur, ease: 'back.out(3)' });
      gsap.to(d, { opacity: 0, duration: .5, delay: 2.4 + t * .3, onComplete: () => d.remove() });
    }
  }

  /* ---------- marigold flight: petals fall off behind it ---------- */
  function petal(x, y) {
    const p = mk(null, 'gpetal'); $('#gFx').appendChild(p);
    p.style.background = Math.random() < .5 ? '#f08c12' : '#ffbf2e';
    gsap.fromTo(p, { x: x - 6, y: y - 9, rotation: Math.random() * 360, opacity: 1, scale: .7 + Math.random() * .5 },
      { x: x - 6 + (Math.random() - .5) * 70, y: y + 60 + Math.random() * 70, rotation: '+=' + (120 + Math.random() * 200), opacity: 0, duration: .8 + Math.random() * .4, ease: 'power1.in', onComplete: () => p.remove() });
  }

  function reset() {
    setFocus(false); gsap.set([focus, focus3, flash, flash3], { opacity: 0 });
    trail.innerHTML = ''; stopLife(); twinkle(0); gsap.set(tw3, { opacity: 1 });
  }

  window.GFX = { level: 1, grade: setGrade, focus: setFocus, flash: doFlash, press, ring, ringAt, stars, ambient, calm, twinkle, hopTrail, petal, stageRect, reset };
})();

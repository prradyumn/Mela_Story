/* HUD (chip · marigolds · sun tracker) and the coach (avatar + speech bubble). */
(function () {
  const { $, readTime, sparks } = ST;

  // ---------- marigolds ----------
  function marigoldSVG() {
    let off = '', on = '';
    for (let i = 0; i < 12; i++) {
      const r = i * 30;
      off += `<ellipse cx="32" cy="15" rx="7" ry="12" transform="rotate(${r} 32 32)" fill="#f6eedc" stroke="#cdb994" stroke-width="1.6"/>`;
      on += `<ellipse cx="32" cy="14" rx="7.5" ry="13" transform="rotate(${r} 32 32)" fill="#f08c12" stroke="#b45a05" stroke-width="1.4"/>`;
    }
    let onIn = '';
    for (let i = 0; i < 10; i++) onIn += `<ellipse cx="32" cy="21" rx="5.5" ry="9" transform="rotate(${i * 36 + 18} 32 32)" fill="#ffbf2e" stroke="#d98a0c" stroke-width="1.1"/>`;
    return `<svg viewBox="0 0 64 64"><g class="m-off">${off}<circle cx="32" cy="32" r="9" fill="#efe2c4" stroke="#cdb994" stroke-width="1.6"/></g>
      <g class="m-on">${on}${onIn}<circle cx="32" cy="32" r="8" fill="#c8550a"/><circle cx="29.5" cy="29.5" r="2.6" fill="#ffd27a" opacity=".8"/></g></svg>`;
  }
  const plate = $('#mariPlate');
  const maris = [];
  for (let i = 0; i < 7; i++) {
    const m = document.createElement('div'); m.className = 'mari'; m.style.left = (20 + i * 72) + 'px'; m.innerHTML = marigoldSVG();
    plate.appendChild(m); maris.push(m);
  }
  const mariCentre = i => ({ x: 690 + 4 + 20 + i * 72 + 32, y: 26 + 4 + 10 + 32 });

  // ---------- sun tracker ----------
  $('#sunPanel').innerHTML = `<svg viewBox="0 0 300 160">
    <path d="M20 132 A130 130 0 0 1 280 132" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="2 10" stroke-linecap="round"/>
    <path d="M0 160 L0 128 Q40 104 86 122 Q130 140 170 116 Q220 92 300 124 L300 160 Z" fill="#6a9a3a" stroke="#3e5f1e" stroke-width="3"/>
    <g transform="translate(276 92)"><rect x="-2" y="0" width="4" height="34" fill="#5a3212"/><path d="M2 2 L18 8 L2 14 Z" fill="#b5361d"/></g>
    <g id="gSun"><circle r="30" fill="#ffd54a" opacity=".35"/>${Array.from({ length: 10 }, (_, i) => `<rect x="-2.5" y="-31" width="5" height="10" rx="2.5" fill="#f7a823" transform="rotate(${i * 36})"/>`).join('')}<circle r="19" fill="#ffc21f" stroke="#e8870e" stroke-width="3"/></g>
  </svg>`;
  const sun = $('#gSun');
  const sunState = { p: 0 };
  const placeSun = () => { const p = sunState.p; sun.setAttribute('transform', `translate(${150 - 130 * Math.cos(Math.PI * p)} ${132 - 130 * Math.sin(Math.PI * p)})`); };

  const HUD = {
    show() { const h = $('#gHud'); h.classList.remove('hidden'); gsap.fromTo(h, { y: -220 }, { y: 0, duration: .6, ease: 'back.out(1.4)' }); },
    chip(t) { $('#gChip').textContent = t; },
    setLit(n) { maris.forEach((m, i) => m.classList.toggle('lit', i < n)); },
    lit: 0,
    async lightNext(fromX, fromY) {
      const i = HUD.lit; if (i >= 7) return; HUD.lit++;
      const c = mariCentre(i);
      await ST.flyImg('data:image/svg+xml;utf8,' + encodeURIComponent(marigoldSVG().replace('class="m-off"', 'opacity="0"')), fromX, fromY, c.x, c.y, { size: 90, endSize: 64, lift: 160, dur: .7 });
      maris[i].classList.add('lit'); SND.sfx('sparkle');
      gsap.fromTo(maris[i], { scale: 1.6 }, { scale: 1, duration: .5, ease: 'back.out(3)' });
      sparks(c.x, c.y, 12, 70);
    },
    sun(p, dur = 0.9) { return gsap.to(sunState, { p, duration: dur, ease: 'power2.inOut', onUpdate: placeSun }); },
    setSun(p) { sunState.p = p; placeSun(); },
    glow(id) { const g = $(id); return gsap.timeline().to(g, { opacity: 1, duration: .25 }).to(g, { opacity: .3, duration: .3, yoyo: true, repeat: 3 }).to(g, { opacity: 0, duration: .3 }); },
    celebrate() { maris.forEach((m, i) => gsap.fromTo(m, { scale: 1 }, { scale: 1.35, duration: .22, yoyo: true, repeat: 1, delay: i * .08, ease: 'power2.out' })); }
  };

  // ---------- coach ----------
  const WHO = {
    pari:  { name: 'Pari',        img: GA('pari_happy.webp'),  x: -84, y: 4,  h: 520, colour: '#2f62c9' },
    manju: { name: 'Manju Mausi', img: GA('manju_teach.webp'), x: -88, y: 2,  h: 520, colour: '#8a3fb5' },
    guddu: { name: 'Guddu Bhaiya', img: GA('guddu_scratch.webp'), x: -96, y: 0, h: 520, colour: '#2e7d32' },
    aaru:  { name: 'Aaru',        img: GA('aaru_jump.webp'),   x: -70, y: 18, h: 470, colour: '#c0392b' }
  };
  let who = null, talk = null, sayN = 0;

  /* Full-body coaches, using the same frames as the story's CH[key].acts. Each plays its talking loop while its VO plays.
     mode 'iol' (Pari explain: 0-4 hands apart, 5-30 loop, 31-35 hands together) | 'pp' (Manju, Guddu: forward and back,
     then glide back to frame 0 = their resting pose). Clocked on the GSAP timeline (respects ?speed=); back-to-back
     lines keep the loop going. Where they stand depends on COACH.pariSpot ('stand' = L1, 'desk' = L2):
       L1 steps with the stage (COACH.step): 'front' while the stage is empty (feet near the bottom, full size), 'back'
          while the number line is up (higher + 80%, so the size matches the depth and the line/buttons stay clear).
          Pari on the left; Manju on the right, mirrored so her raised finger points in (the bubble moves right).
       L2 'desk': Pari left and Guddu between the bubble and the bill, both behind the desk (cut at its top edge).
     The bubble follows the speaker's face (its tail flips to point right for Manju/Guddu).
     COACH.fullPari = false falls back to the round avatar for everyone (Aaru always uses it: no sprite yet). */
  const SA = n => (window.IMG && IMG[n] && IMG[n].src) || (window.EMBED && EMBED[n]) || `assets/story/${n}.webp`;
  const SPOTS = {   // x, y = feet on stage · s = scale · side = which side the bubble sits · bubble = fixed bubble spot (desk)
    pari:  { front: { x: 150,  y: 1050, s: 1, side: 'L' }, back: { x: 122, y: 1046, s: .72, side: 'L', tail: 'D', bubble: { left: 28, bottom: 420, width: 400 } },
             desk: { x: 190, y: 1151, s: 1.5, side: 'L', clip: 862, bubble: { left: 300, bottom: 548, width: 420 } } },   // L2: big, behind the desk
    manju: { front: { x: 1715, y: 958, s: .95, side: 'R' }, back: { x: 1800, y: 1046, s: .72, side: 'R', tail: 'D', bubble: { right: 28, bottom: 420, width: 400 } },
             desk: { x: 1772, y: 778, s: 1, side: 'R', clip: 534 } },
    guddu: { front: { x: 1745, y: 1050, s: 1, side: 'R' }, back: { x: 1772, y: 770, s: .8, side: 'R' },
             desk: { x: 815, y: 1193, s: 1.45, side: 'L', tail: 'R', clip: 862, bubble: { left: 300, bottom: 548, width: 420 } } }
  };
  const spotOf = key => SPOTS[key][Coach.pariSpot === 'desk' ? 'desk' : Coach.depth] || SPOTS[key].front;
  function Actor(key, { file, n, fps, mode, intro = 0, outro = n, h, lift = 0, flip = false }) {
    const box = $('#' + key + 'Coach'), clock = () => gsap.globalTimeline.time();
    const imgs = [...Array(n)].map(() => { const im = document.createElement('img'); im.alt = ''; im.style.height = h + 'px'; im.style.bottom = lift + 'px';
      if (flip) im.style.transform = 'translateX(-50%) scaleX(-1)'; box.appendChild(im); return im; });
    let loaded = false, talking = false, t0 = 0, stopAt = null, from = 0, shown = -1, quietCall = null;
    const frame = k => { if (k === shown) return; imgs.forEach((im, j) => im.style.opacity = j === k ? 1 : 0); shown = k; };
    const A = {
      on: false, spot: SPOTS[key].front, h, key,
      /* stand on the current spot; animate = glide there (stepping forward / back) */
      place(animate) {
        const sp = spotOf(key); A.spot = sp;
        box.style.clipPath = sp.clip ? `inset(-1000px -600px ${(sp.y - sp.clip) / sp.s}px -600px)` : 'none';   // clip is in unscaled px: divide by the scale
        box.classList.toggle('desk', !!sp.clip);
        gsap.killTweensOf(box, 'left,top,scale');
        (animate ? gsap.to : gsap.set)(box, { left: sp.x, top: sp.y, scale: sp.s, ...(animate ? { duration: .6, ease: 'power2.inOut' } : {}) });
      },
      show() {
        if (!loaded) { imgs.forEach((im, i) => im.src = SA(`${file}_${i}`)); loaded = true; }
        A.place(false);
        if (shown < 0) frame(0);
        if (!A.on) { A.on = true; gsap.to(box, { opacity: 1, duration: .25 }); }
      },
      hide() { if (A.on) { A.on = false; gsap.to(box, { opacity: 0, duration: .25 }); } A.quiet(true); },
      talk() {
        if (quietCall) { quietCall.kill(); quietCall = null; } if (talking) return;
        t0 = clock() - (mode === 'pp' ? Math.max(0, shown) : (stopAt != null ? intro : 0)) / fps; talking = true; stopAt = null;
      },
      quiet(now) {
        if (quietCall) quietCall.kill();
        const stop = () => { quietCall = null; if (talking) { talking = false; stopAt = clock(); from = Math.max(0, shown); } };
        if (now) stop(); else quietCall = gsap.delayedCall(.45, stop);
      },
      reset() { talking = false; stopAt = null; if (quietCall) quietCall.kill(); quietCall = null; A.on = false; gsap.set(box, { opacity: 0 }); if (loaded) frame(0); },
      tick() {
        if (talking) {
          const f = Math.floor((clock() - t0) * fps);
          if (mode === 'pp') { const P = 2 * (n - 1), m = f % P; frame(m < n ? m : P - m); }
          else frame(f < intro ? f : intro + (f - intro) % (outro - intro));
        } else if (stopAt != null) {
          const s = (clock() - stopAt) * fps;
          if (mode === 'pp') { const k = from - Math.floor(s * 3); if (k <= 0) { stopAt = null; frame(0); } else frame(k); }   // glide back to rest
          else { const k = outro + Math.floor(s); if (k >= n) { stopAt = null; frame(n - 1); } else frame(k); }               // hands back together
        }
      }
    };
    return A;
  }
  const CAST = {
    pari:  Actor('pari',  { file: 'pari_explain', n: 36, fps: 12, mode: 'iol', intro: 5, outro: 31, h: 486 }),
    manju: Actor('manju', { file: 'manju_talk', n: 36, fps: 10.5, mode: 'pp', h: 525, lift: -4, flip: true }),
    guddu: Actor('guddu', { file: 'guddu_talk', n: 36, fps: 10.5, mode: 'pp', h: 584, lift: -8 })
  };
  gsap.ticker.add(() => Object.values(CAST).forEach(a => a.tick()));

  /* the bubble sits beside the speaker's face (tail pointing at it); desk spots use a fixed place */
  let bubbleFor = null;
  function placeBubble(actor, animate) {
    const b = $('#bubble'); bubbleFor = actor;
    const sp = actor ? actor.spot : { side: 'L', bubble: { left: 214, bottom: 692 } };
    const down = sp.tail === 'D';
    b.classList.toggle('posR', sp.side === 'R'); b.classList.toggle('tailD', down); b.classList.toggle('tailR', !down && (sp.side === 'R' || sp.tail === 'R'));
    let v;
    b.style.width = sp.bubble && sp.bubble.width ? sp.bubble.width + 'px' : '';
    if (sp.bubble) v = sp.bubble.right != null ? { right: sp.bubble.right, bottom: sp.bubble.bottom } : { left: sp.bubble.left, bottom: sp.bubble.bottom };
    else {
      const hh = actor.h * sp.s, face = sp.y - .9 * hh, bottom = 1080 - (face + 38);
      v = sp.side === 'R' ? { right: 1920 - (sp.x - .1 * hh - 34), bottom } : { left: sp.x + .1 * hh + 34, bottom };
    }
    if (v.right != null) { b.style.left = 'auto'; } else { b.style.right = 'auto'; }
    gsap.killTweensOf(b, 'left,right,bottom');
    (animate ? gsap.to : gsap.set)(b, { ...v, ...(animate ? { duration: .6, ease: 'power2.inOut' } : {}) });
  }

  const Coach = {
    cast: CAST, pari: CAST.pari, fullPari: true, pariSpot: 'stand', depth: 'front',
    show() { const c = $('#coach'); if (!c.classList.contains('hidden')) return; c.classList.remove('hidden'); Object.values(CAST).forEach(a => a.reset()); who = null; Coach.depth = 'front'; gsap.set('#avatar', { scale: 0 }); },
    /* L1: 'back' when the number line comes up, 'front' when the stage is clear again — everyone on stage glides there */
    step(d) {
      if (Coach.depth === d) return; Coach.depth = d;
      if (Coach.pariSpot === 'desk') return;
      Object.values(CAST).forEach(a => { if (a.on) a.place(true); });
      if (bubbleFor && bubbleFor.on) placeBubble(bubbleFor, true);
    },
    /* Put a coach on stage before they speak (e.g. Guddu at his desk for all of L2) / take one off (Manju after the teach) */
    present(key) { Coach.show(); if (CAST[key]) CAST[key].show(); },
    dismiss(key) { if (CAST[key]) CAST[key].hide(); if (who && who.startsWith(key + '@')) who = null; },
    hideBubble() { gsap.to('#bubble', { scale: 0, opacity: 0, duration: .2 }); },
    /* Swap the bubble text for a longer version of the same line (no new VO) */
    update(line) { $('#bubbleText').innerHTML = line.text.replace(/(₹[\d,]+)/g, '<b>$1</b>'); SND.setCurrent(line); gsap.fromTo('#bubbleText', { opacity: .3 }, { opacity: 1, duration: .3 }); gsap.fromTo('#bubble', { scale: 1.03 }, { scale: 1, duration: .25 }); },
    /* Show a line, play its VO (or wait a reading time). Resolves when the line is done. */
    /* L3: voice only — no bubble, no avatar, no full-body coach. The level draws its own talk waves via onTalk(who, on). */
    voiceOnly: false, onTalk: null,
    say(line, { append } = {}) {
      if (Coach.voiceOnly) {
        SND.setCurrent(line); const my = ++sayN, who = line.who || 'pari';
        if (Coach.onTalk) Coach.onTalk(who, true, line);
        return SND.vo(line.vo, readTime(line.text)).then(() => { if (my === sayN && Coach.onTalk) Coach.onTalk(who, false, line); });
      }
      Coach.show();
      const key = line.who || 'pari', w = WHO[key] || WHO.pari, actor = Coach.fullPari !== false && CAST[key];
      const spot = actor ? key + '@' + Coach.pariSpot : key;
      if (who !== spot) {
        who = spot;
        if (actor) { gsap.to('#avatar', { scale: 0, duration: .2 }); actor.show(); }       // full-body coach
        else {                                                                              // round avatar (Aaru, or fallback)
          CAST.pari.hide();
          const im = $('#avatar img'); im.src = w.img; im.style.height = w.h + 'px'; im.style.left = w.x + 'px'; im.style.top = w.y + 'px';
          gsap.fromTo('#avatar', { rotation: -8, scale: .5 }, { rotation: 0, scale: 1, duration: .45, ease: 'back.out(2.5)' });
        }
      }
      // the bubble sits by whoever is talking
      const b = $('#bubble'); placeBubble(actor || null, false);
      $('#bubbleName').textContent = w.name; $('#bubbleName').style.background = w.colour;
      $('#bubbleText').innerHTML = line.text.replace(/(₹[\d,]+)/g, '<b>$1</b>');
      if (append) gsap.fromTo('#bubbleText', { opacity: .3 }, { opacity: 1, duration: .3 });
      else { SND.sfx('bubble'); gsap.fromTo(b, { scale: .6, opacity: 0 }, { scale: 1, opacity: 1, duration: .38, ease: 'back.out(2)' }); }
      SND.setCurrent(line);
      if (talk) { talk.kill(); talk = null; gsap.set('#avatar img', { y: 0 }); }
      Object.values(CAST).forEach(a => { if (a !== actor) a.quiet(true); });   // only the speaker talks
      const my = ++sayN;                     // a newer line cuts this one: only the newest one may stop the talking
      if (actor) actor.talk();
      else talk = gsap.to('#avatar img', { y: -6, duration: .18, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      return SND.vo(line.vo, readTime(line.text)).then(() => {
        if (my !== sayN) return;
        if (actor) actor.quiet();
        if (talk) { talk.kill(); talk = null; gsap.to('#avatar img', { y: 0, duration: .15 }); }
      });
    }
  };

  window.HUD = HUD; window.COACH = Coach;
})();

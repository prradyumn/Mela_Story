/* L2SC — Level 2 scene pieces: the bill (DOM + canvas twin for the crumple), the three answer stamps,
   bill pile, CHECKED basket, ink pad, and the stamp sequence. Coordinates match Figma "★ L2 · Clean build". */
(function () {
  const { $, sparks, wait } = ST;
  const fmt = n => LEVEL1.fmt(n), rs = n => '₹' + fmt(n);
  const BILL = { x: 1000, y: 196, w: 620, h: 775 }, BC = { x: BILL.x + BILL.w / 2, y: BILL.y + BILL.h / 2 };
  const SLOT = i => ({ left: 50 + i * 265, top: 553 });
  const PILE_C = { x: 1775, y: 600 }, BASKET_C = { x: 1775, y: 742 };

  /* ---------- the bill ---------- */
  const state = { title: '', items: [], show: 0, chips: null, chipVis: [false, false], total: false, mark: null };
  const paperImg = new Image(); paperImg.src = GA('bill_paper.webp');
  const markImg = new Image(); markImg.src = GA('stamp_mark.webp');
  const el = $('#bill2');
  function render() {
    el.querySelector('.b-title').textContent = state.title;
    [1, 2].forEach(i => {
      const it = state.items[i - 1], row = $('#bi' + i);
      row.style.visibility = it && state.show >= i ? 'visible' : 'hidden';
      if (it) { row.querySelector('.b-name').textContent = it[0]; row.querySelector('.b-price').textContent = rs(it[1]);
        const c = row.querySelector('.b-chip'); c.textContent = '≈ ' + fmt(LEVEL2.round(it[1])); c.classList.toggle('yellow', state.chips === 'yellow'); c.style.opacity = state.chips && state.chipVis[i - 1] ? 1 : 0; }
    });
    ['.b-rule', '.b-total', '.b-box'].forEach(s => el.querySelector(s).style.visibility = state.total ? 'visible' : 'hidden');
    el.querySelector('.b-box').style.opacity = state.mark ? 0 : 1;
    const m = el.querySelector('.b-mark'); m.style.opacity = state.mark ? 1 : 0; if (state.mark) m.querySelector('span').textContent = 'About ' + rs(state.mark);
  }
  /* Draw the same bill on a canvas (1.5×) — the crumple texture */
  function drawBill(s = state) {
    const k = 1.5, c = document.createElement('canvas'); c.width = BILL.w * k; c.height = BILL.h * k;
    const g = c.getContext('2d'); g.scale(k, k); g.textBaseline = 'top';
    g.drawImage(paperImg, 0, 0, BILL.w, BILL.h);
    g.fillStyle = '#b5361d'; g.font = '800 52px Baloo'; g.fillText(s.title, 100, 32);
    g.fillStyle = '#7a4a22'; g.font = '600 20px Poppins'; g.fillText('Panchayat Mela · Apnapur', 104, 84);
    s.items.forEach((it, i) => {
      if (s.show <= i) return; const y0 = 136 + i * 136;
      g.fillStyle = '#3a220f'; g.font = '600 30px Poppins'; g.fillText(it[0], 100, y0 + 4);
      g.font = '700 64px Fredoka'; const p = rs(it[1]); g.fillText(p, 100, y0 + 44); const pw = g.measureText(p).width;
      if (s.chips && s.chipVis[i]) { const t = '≈ ' + fmt(LEVEL2.round(it[1])); g.font = '700 34px Fredoka'; const tw = g.measureText(t).width, x = 100 + pw + 22, y = y0 + 54;
        g.fillStyle = s.chips === 'yellow' ? '#fff1b8' : '#e6efff'; g.strokeStyle = s.chips === 'yellow' ? '#e0a81c' : '#2f62c9'; g.lineWidth = 3;
        g.beginPath(); g.roundRect ? g.roundRect(x, y, tw + 32, 50, 14) : g.rect(x, y, tw + 32, 50); g.fill(); g.stroke();
        g.fillStyle = s.chips === 'yellow' ? '#8a5a10' : '#2f62c9'; g.fillText(t, x + 16, y + 9); }
    });
    if (s.total) {
      g.strokeStyle = '#7a4a22'; g.lineWidth = 3; g.setLineDash([14, 10]); g.beginPath(); g.moveTo(96, 430); g.lineTo(566, 430); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#3a220f'; g.font = '800 40px Baloo'; g.fillText('About total:', 100, 452);
      if (s.mark) { g.save(); g.translate(312, 587); g.rotate(5 * Math.PI / 180); g.globalAlpha = .92; g.drawImage(markImg, -230, -75, 460, 147);
        g.fillStyle = '#c0392b'; g.font = '700 48px Fredoka'; g.textAlign = 'center'; g.fillText('About ' + rs(s.mark), 0, -31); g.restore(); }
      else { g.strokeStyle = '#c98a4a'; g.lineWidth = 4; g.setLineDash([16, 10]); g.beginPath(); g.roundRect ? g.roundRect(100, 516, 300, 130, 22) : g.rect(100, 516, 300, 130); g.stroke(); g.setLineDash([]);
        g.fillStyle = '#c98a4a'; g.font = '700 96px Fredoka'; g.textAlign = 'center'; g.fillText('?', 250, 534); g.textAlign = 'left'; }
    }
    return c;
  }
  const ball = $('#ball2');
  const placeBall = (x, y, s, rot = 0) => gsap.set(ball, { x: x - s / 2, y: y - s / 2, width: s, height: s, rotation: rot });
  function arc(x0, y0, x1, y1, s0, s1, lift, dur, ease = 'power1.inOut') {
    const o = { t: 0 };
    return new Promise(res => gsap.to(o, { t: 1, duration: dur, ease, onUpdate() { const t = o.t; placeBall(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t - lift * Math.sin(Math.PI * t), s0 + (s1 - s0) * t, t * 300); }, onComplete: res }));
  }

  const Bill = {
    state, drawBill,
    set(title, items) { Object.assign(state, { title, items, show: 0, chips: null, chipVis: [false, false], total: false, mark: null }); render(); },
    hide() { el.classList.add('hidden'); },
    /* ball hops off the pile → grows → the 3D paper un-crumples flat into the bill (title only) */
    async enter(fromPile = true) {
      render(); SND.sfx('paper', .6);
      gsap.set(ball, { opacity: 1, attr: { src: GA('paper_ball_3.webp') } });
      if (fromPile) await arc(PILE_C.x, PILE_C.y, BC.x, BC.y, 70, CRUMPLE.R * 2.1, 160, .55);
      else { placeBall(BC.x, BC.y, CRUMPLE.R * 2.1); await gsap.fromTo(ball, { scale: .2 }, { scale: 1, duration: .3 }); }
      const done = CRUMPLE.unCrumple(drawBill(), BC.x, BC.y, .75);
      gsap.to(ball, { opacity: 0, duration: .12 });
      const used3D = await done;
      el.classList.remove('hidden'); gsap.set(el, { opacity: 1, scale: 1, rotation: 0 });
      if (!used3D) await gsap.fromTo(el, { scale: .3, rotation: -20, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: .45, ease: 'back.out(1.6)' });
      CRUMPLE.hide();
      gsap.fromTo(el, { scaleY: .97 }, { scaleY: 1, duration: .35, ease: 'elastic.out(1,.5)' });
    },
    /* write a line in (left → right reveal) */
    async write(i) {
      state.show = Math.max(state.show, i); render();
      const row = $('#bi' + i); SND.sfx('scribble', .4);
      await gsap.fromTo(row, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: .6, ease: 'power1.inOut' });
    },
    async showTotal() { state.total = true; render(); await gsap.fromTo(el.querySelectorAll('.b-rule,.b-total,.b-box'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .35, stagger: .1 }); },
    /* ≈ round-number chips next to the prices: which = 1, 2 or 'both'; colour 'blue' (answer) or 'yellow' (hint) */
    chips(color, which = 'both') {
      const was = state.chipVis.slice(), recolour = state.chips !== color;
      state.chips = color; if (which === 'both') state.chipVis = [true, true]; else state.chipVis[which - 1] = true;
      render();
      const cs = [...el.querySelectorAll('.b-chip')].filter((c, i) => state.chipVis[i] && (!was[i] || recolour));
      if (!cs.length) return Promise.resolve();
      SND.sfx('pop', .4);
      return gsap.fromTo(cs, { scale: .4, opacity: 0 }, { scale: 1, opacity: 1, duration: .35, stagger: .25, ease: 'back.out(2.4)' });
    },
    glowPrices() { const ps = el.querySelectorAll('.b-price'); ps.forEach((p, i) => gsap.delayedCall(i * 1.1, () => { p.classList.remove('glow'); void p.offsetWidth; p.classList.add('glow'); })); },
    showMark(v) { state.mark = v; render(); return gsap.fromTo(el.querySelector('.b-mark'), { scale: 1.25, opacity: 0 }, { scale: 1, opacity: 1, duration: .25, ease: 'power3.out' }); },
    /* the 3D crumple → ball → arc into the basket (or off-screen for practice) */
    async crumpleTo(toBasket = true) {
      const tex = drawBill();
      el.classList.add('hidden'); SND.sfx('paper', .7);
      const used3D = await CRUMPLE.crumple(tex, BC.x, BC.y, .65);
      placeBall(BC.x, BC.y, CRUMPLE.R * 2.1, 0); gsap.set(ball, { opacity: 1, scale: 1 }); CRUMPLE.hide();
      if (!used3D) await gsap.fromTo(ball, { scale: 1.6 }, { scale: 1, duration: .25 });
      SND.sfx('whoosh', .35);
      if (toBasket) { await arc(BC.x, BC.y, BASKET_C.x, BASKET_C.y - 6, CRUMPLE.R * 2.1, 64, 260, .7, 'power1.in'); gsap.set(ball, { opacity: 0 }); Basket.add(); }
      else { await arc(BC.x, BC.y, 2150, 820, CRUMPLE.R * 2.1, 140, 200, .6, 'power1.in'); gsap.set(ball, { opacity: 0 }); }
    }
  };

  /* ---------- stamps ---------- */
  const S = [...document.querySelectorAll('#game .stamp2')];
  let onPick = null;
  S.forEach(s => s.addEventListener('pointerdown', e => { e.preventDefault(); if (!onPick || s.classList.contains('locked') || s.classList.contains('faded')) return; SND.sfx('pop', .35); onPick(+s.dataset.i); }));
  const Stamps = {
    S, vals: [],
    async show(vals) {
      Stamps.vals = vals;
      S.forEach((s, i) => { s.className = 'stamp2 locked'; s.querySelector('.val').textContent = rs(vals[i]); s.querySelector('.art').src = GA('stamp_tool.webp'); gsap.set(s, { clearProps: 'all' }); Object.assign(s.style, { left: SLOT(i).left + 'px', top: SLOT(i).top + 'px' }); gsap.set(s.querySelector('.tick'), { scale: 0 }); });
      SND.sfx('rise', .35);
      await gsap.fromTo(S, { y: 340, opacity: 0 }, { y: 0, opacity: 1, duration: .5, stagger: .09, ease: 'back.out(1.5)' });
    },
    enable(fn) { onPick = fn; S.forEach(s => s.classList.remove('locked')); },
    disable() { onPick = null; S.forEach(s => s.classList.add('locked')); },
    state(i, cls) { const s = S[i], lock = s.classList.contains('locked'); s.className = 'stamp2' + (cls ? ' ' + cls : '') + (lock ? ' locked' : ''); },
    wiggle(i) { return gsap.fromTo(S[i], { rotation: 0 }, { rotation: 5, duration: .06, repeat: 5, yoyo: true, ease: 'sine.inOut', onComplete: () => gsap.set(S[i], { rotation: 0 }) }); },
    pulse() { S.forEach(s => { if (!s.classList.contains('faded') && !s.classList.contains('glow')) { s.classList.remove('pulse'); void s.offsetWidth; s.classList.add('pulse'); } }); },
    centre(i) { return { x: SLOT(i).left + 125, y: SLOT(i).top + 265 }; },
    async hide() { await gsap.to(S, { y: 340, opacity: 0, duration: .35, stagger: .05, ease: 'power2.in' }); S.forEach(s => s.className = 'stamp2 hidden'); },
    /* correct: lift → dip in the ink → fly to the bill → THUMP → mark → lift back to the slot */
    async press(i, value) {
      const s = S[i], art = s.querySelector('.art'), pad = $('#inkPad'), slot = SLOT(i);
      gsap.fromTo(pad, { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: .35, ease: 'back.out(1.6)' });
      gsap.to(s.querySelector('.tick'), { scale: 1, duration: .3, ease: 'back.out(3)' });
      await gsap.to(s, { left: 790, top: 470, duration: .45, ease: 'power2.inOut' });
      await gsap.to(s, { top: 512, scaleY: .92, duration: .14, ease: 'power2.in' });          // dip
      SND.sfx('tick', .4);
      await gsap.to(s, { top: 440, scaleY: 1, duration: .2, ease: 'power2.out' });
      gsap.to(pad, { opacity: 0, y: 80, duration: .3, delay: .2 });
      await gsap.to(s, { left: 1125, top: 430, duration: .4, ease: 'power2.inOut' });          // over the "?" box
      await gsap.to(s, { top: 504, duration: .12, ease: 'power3.in' });
      s.classList.add('pressed'); art.src = GA('stamp_tool_pressed.webp');                      // THUMP
      SND.sfx('stamp', .8);
      gsap.fromTo('#bill2', { scaleY: .95 }, { scaleY: 1, duration: .35, ease: 'elastic.out(1,.4)' });
      gsap.fromTo('#game', { x: 0 }, { x: 4, duration: .05, yoyo: true, repeat: 3, onComplete: () => gsap.set('#game', { x: 0 }) });
      sparks(1250, 830, 12, 90, ['#c0392b', '#e14b3b', '#9d2a1e']);
      await wait(.12);
      Bill.showMark(value);
      s.classList.remove('pressed'); art.src = GA('stamp_tool.webp');
      await gsap.to(s, { top: 380, duration: .25, ease: 'power2.out' });
      await gsap.to(s, { left: slot.left, top: slot.top, duration: .5, ease: 'power2.inOut' });
    }
  };

  /* ---------- pile + basket ---------- */
  const Pile = {
    set(n) { $('#pileLeft').textContent = n + (n === 1 ? ' bill left' : ' bills left'); gsap.set('#pile2', { opacity: n > 0 ? 1 : 0 }); },
    glow() { return gsap.fromTo('#pile2', { filter: 'drop-shadow(0 0 0 rgba(247,183,51,0))' }, { filter: 'drop-shadow(0 0 26px rgba(247,183,51,1))', duration: .45, yoyo: true, repeat: 3 }); },
    bump() { gsap.fromTo('#pileLeft', { scale: 1.4 }, { scale: 1, duration: .4, ease: 'back.out(3)' }); }
  };
  const Basket = {
    n: 0,
    set(n) { Basket.n = n; $('#basketBalls').innerHTML = Array.from({ length: Math.min(n, 7) }, (_, i) => `<img src="${GA('paper_ball_3.webp')}" style="left:${30 + ((i * 47) % 170)}px;top:${(i < 4 ? 0 : -22) + 12}px">`).join(''); },
    add() { Basket.set(Basket.n + 1); SND.sfx('tick', .4); const b = $('#basketBalls').lastElementChild; gsap.fromTo(b, { y: -30 }, { y: 0, duration: .35, ease: 'bounce.out' }); gsap.fromTo('#basket2', { scaleY: 1 }, { scaleY: .92, duration: .1, yoyo: true, repeat: 1, transformOrigin: '50% 100%' }); },
    glow() { return gsap.fromTo('#basket2', { filter: 'drop-shadow(0 0 0 rgba(247,183,51,0))' }, { filter: 'drop-shadow(0 0 22px rgba(247,183,51,1))', duration: .4, yoyo: true, repeat: 1 }); }
  };

  window.L2SC = { Bill, Stamps, Pile, Basket, BILL, BC };
})();

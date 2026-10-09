/* L2SC — Level 2 scene pieces: the bill (DOM + canvas twin for the packing fold), the three answer stamps,
   bill pile, CHECKED basket, ink pad, and the stamp sequence. Coordinates match Figma "★ L2 · Clean build". */
(function () {
  const { $, sparks, wait } = ST;
  const fmt = n => LEVEL1.fmt(n), rs = n => '₹' + fmt(n);
  const BILL = { x: 1000, y: 196, w: 620, h: 775 }, BC = { x: BILL.x + BILL.w / 2, y: BILL.y + BILL.h / 2 };
  const SLOT = i => ({ left: 50 + i * 265, top: 740 });                 // on the desk (top edge y 860, office_desk_l2)
  const PILE_C = { x: 1775, y: 867 }, BASKET_C = { x: 1775, y: 944 };   // pile + basket drawn at 80% (css scale)

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
    g.fillStyle = '#b5361d'; g.font = '800 52px Baloo'; g.fillText(s.title, 100, 46);
    g.fillStyle = '#7a4a22'; g.font = '600 20px Poppins'; g.fillText('Panchayat Mela · Apnapur', 104, 98);
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
  /* ---------- packing: the bill folds in half (bottom up), in half again (right over left), a red band ties the packet,
     and it drops into the CHECKED basket. A new bill arrives the other way: a packet flies off the pile and unfolds.
     Built from the bill's own canvas (drawBill) as CSS 3D pieces — no WebGL needed. ---------- */
  const PK = $('#pack2'), PAPER_BACK = '#f6ecd6';
  const PW = BILL.w, PH = BILL.h, QW = PW / 2, QH = PH / 2;
  function piece(tex, sx, sy, sw, sh) {          // a part of the bill texture as its own canvas
    const k = tex.width / PW, c = document.createElement('canvas'); c.width = sw * k; c.height = sh * k;
    c.getContext('2d').drawImage(tex, sx * k, sy * k, sw * k, sh * k, 0, 0, sw * k, sh * k);
    Object.assign(c.style, { position: 'absolute', left: 0, top: 0, width: sw + 'px', height: sh + 'px', backfaceVisibility: 'hidden' }); return c;
  }
  const div = (css, parent = PK) => { const d = document.createElement('div'); Object.assign(d.style, { position: 'absolute', ...css }); parent.appendChild(d); return d; };
  const back = (w, h, parent, flip) => div({ left: 0, top: 0, width: w + 'px', height: h + 'px', background: `linear-gradient(135deg, ${PAPER_BACK}, #efe2c6)`,
    boxShadow: 'inset 0 0 0 2px rgba(122,74,34,.35)', backfaceVisibility: 'hidden', transform: flip }, parent);
  /* builds the fold pieces at the bill's place and returns a paused timeline: progress 0 = flat bill, 1 = tied packet */
  function foldTL(tex) {
    PK.innerHTML = ''; gsap.set(PK, { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0 });
    const root = div({ left: BILL.x + 'px', top: BILL.y + 'px', width: PW + 'px', height: PH + 'px', transformStyle: 'preserve-3d', willChange: 'transform' });   // no filter here: a filter over 3D pieces re-rasterises every frame
    // fold 1: top half stays, bottom half turns up over it (shows the paper's back)
    const top = piece(tex, 0, 0, PW, QH); root.appendChild(top);
    const f1 = div({ left: 0, top: QH + 'px', width: PW + 'px', height: QH + 'px', transformStyle: 'preserve-3d', transformOrigin: '50% 0' }, root);
    f1.appendChild(piece(tex, 0, QH, PW, QH)); back(PW, QH, f1, 'rotateX(180deg)');
    // fold 2: the half-height packet — left quarter stays, right quarter turns over it
    const s2 = div({ left: 0, top: 0, width: PW + 'px', height: QH + 'px', transformStyle: 'preserve-3d', visibility: 'hidden' }, root);
    back(QW, QH, s2);
    const f2 = div({ left: QW + 'px', top: 0, width: QW + 'px', height: QH + 'px', transformStyle: 'preserve-3d', transformOrigin: '0 50%' }, s2);
    back(QW, QH, f2); back(QW, QH, f2, 'rotateY(180deg)');
    // the red band that ties the packet
    const band = div({ left: '-6px', top: (QH / 2 - 22) + 'px', width: (QW + 12) + 'px', height: '44px', background: 'linear-gradient(#d0442c,#a8321c)', borderRadius: '6px',
      boxShadow: '0 3px 0 rgba(58,34,15,.25)', transformOrigin: '0 50%', visibility: 'hidden' }, root);
    const knot = div({ left: (QW / 2 - 30) + 'px', top: (QH / 2 - 34) + 'px', width: '60px', height: '68px', borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, #e85a3f, #a8321c)',
      boxShadow: '0 3px 0 rgba(58,34,15,.3)', visibility: 'hidden' }, root);
    const tl = gsap.timeline({ paused: true });
    tl.to(f1, { rotationX: 180, duration: .42, ease: 'power2.inOut' })
      .set([top, f1], { visibility: 'hidden' }).set(s2, { visibility: 'visible' })
      .to(f2, { rotationY: -180, duration: .36, ease: 'power2.inOut' })
      .set(band, { visibility: 'visible' }).fromTo(band, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: .25, ease: 'power2.out', immediateRender: false })   // fades as it unties (no red stub left beside the paper)
      .set(knot, { visibility: 'visible' }).fromTo(knot, { scale: 0 }, { scale: 1, duration: .22, ease: 'back.out(3)', immediateRender: false });
    tl.root = root; return tl;
  }
  const PACK_C = { x: BILL.x + QW / 2, y: BILL.y + QH / 2 };          // centre of the tied packet (before it flies)
  function fly(x0, y0, x1, y1, s0, s1, lift, dur, ease = 'power1.inOut') {   // moves the whole packet layer along an arc
    const o = { t: 0 };
    return new Promise(res => gsap.to(o, { t: 1, duration: dur, ease, onUpdate() { const t = o.t, s = s0 + (s1 - s0) * t;
      gsap.set(PK, { x: (x0 + (x1 - x0) * t) - PACK_C.x, y: (y0 + (y1 - y0) * t - lift * Math.sin(Math.PI * t)) - PACK_C.y, scale: s, rotation: 8 * Math.sin(Math.PI * t), transformOrigin: `${PACK_C.x}px ${PACK_C.y}px` }); }, onComplete: res }));
  }
  const PKT_S = .26;                                                    // packet size when it lands in the basket / sits on the pile

  const Bill = {
    state, drawBill,
    set(title, items) { Object.assign(state, { title, items, show: 0, chips: null, chipVis: [false, false], total: false, mark: null }); render(); },
    hide() { el.classList.add('hidden'); },
    /* a packet flies off the pile → the band comes off → it unfolds flat into the bill (title only) */
    async enter(fromPile = true) {
      render(); SND.sfx('paper', .6);
      const tl = foldTL(drawBill()); tl.progress(1);
      if (fromPile) await fly(PILE_C.x, PILE_C.y, PACK_C.x, PACK_C.y, PKT_S, 1, 160, .55);
      else await gsap.fromTo(PK, { scale: .3, opacity: 0, transformOrigin: `${PACK_C.x}px ${PACK_C.y}px` }, { scale: 1, opacity: 1, duration: .3 });
      gsap.set(PK, { x: 0, y: 0, scale: 1, rotation: 0 });
      await new Promise(r => { tl.eventCallback('onReverseComplete', r); tl.reverse(); });
      el.classList.remove('hidden'); gsap.set(el, { opacity: 1, scale: 1, rotation: 0 }); PK.innerHTML = '';
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
    /* fold, fold, tie → the packet drops into the CHECKED basket (or slides off-screen for practice) */
    async crumpleTo(toBasket = true) { return Bill.packTo(toBasket); },
    async packTo(toBasket = true) {
      const tl = foldTL(drawBill());
      el.classList.add('hidden'); SND.sfx('paper', .7);
      await new Promise(r => { tl.eventCallback('onComplete', r); tl.play(0); });
      SND.sfx('pop', .4);
      await wait(.25);
      SND.sfx('whoosh', .35);
      if (toBasket) { const t = slotStage(Basket.n); await fly(PACK_C.x, PACK_C.y, t.x, t.y - 26, 1, PKT_W * BASKET_AT.s / QW, 240, .7, 'power1.in'); Basket.add(); }   // into its own slot
      else await fly(PACK_C.x, PACK_C.y, 2200, 820, 1, .5, 180, .6, 'power1.in');
      PK.innerHTML = ''; gsap.set(PK, { x: 0, y: 0, scale: 1, rotation: 0 });
    }
  };

  /* ---------- stamps ---------- */
  const S = [...document.querySelectorAll('#game .stamp2')];
  let onPick = null;
  S.forEach(s => s.addEventListener('pointerdown', e => { e.preventDefault(); if (!onPick || s.classList.contains('locked') || s.classList.contains('faded')) return; SND.sfx('pop', .35); GFX.press(s); onPick(+s.dataset.i); }));
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
    /* SC.Hand.show(x, y) puts the fingertip at (x + 141, y + 16): press the stamp by its knob (like you would), so the hand never covers the number */
    handAt(i) { return { x: SLOT(i).left + 125 - 141, y: SLOT(i).top + 66 - 16 }; },
    async hide() { await gsap.to(S, { y: 340, opacity: 0, duration: .35, stagger: .05, ease: 'power2.in' }); S.forEach(s => s.className = 'stamp2 hidden'); },
    /* correct: lift → dip in the ink → fly to the bill → THUMP → mark → lift back to the slot */
    async press(i, value) {
      const s = S[i], art = s.querySelector('.art'), pad = $('#inkPad'), slot = SLOT(i);
      gsap.fromTo(pad, { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: .35, ease: 'back.out(1.6)' });
      gsap.to(s.querySelector('.tick'), { scale: 1, duration: .3, ease: 'back.out(3)' });
      await gsap.to(s, { left: 790, top: 640, duration: .45, ease: 'power2.inOut' });
      await gsap.to(s, { top: 680, scaleY: .92, duration: .14, ease: 'power2.in' });          // dip
      SND.sfx('tick', .4);
      await gsap.to(s, { top: 610, scaleY: 1, duration: .2, ease: 'power2.out' });
      gsap.to(pad, { opacity: 0, y: 80, duration: .3, delay: .2 });
      await gsap.to(s, { left: 1125, top: 520, duration: .4, ease: 'power2.inOut' });          // over the "?" box
      await gsap.to(s, { top: 598, duration: .12, ease: 'power3.in' });                         // the stamp face lands ON the box, where the mark appears
      s.classList.add('pressed'); art.src = GA('stamp_tool_pressed.webp');                      // THUMP
      SND.sfx('stamp', .8);
      gsap.fromTo('#bill2', { scaleY: .95 }, { scaleY: 1, duration: .35, ease: 'elastic.out(1,.4)' });
      gsap.fromTo('#l2', { x: 0 }, { x: 4, duration: .05, yoyo: true, repeat: 3, onComplete: () => gsap.set('#l2', { x: 0 }) });   // shake just the desk layer
      sparks(1250, 830, 12, 90, ['#c0392b', '#e14b3b', '#9d2a1e']);
      await wait(.12);
      Bill.showMark(value);
      s.classList.remove('pressed'); art.src = GA('stamp_tool.webp');
      await gsap.to(s, { top: 420, duration: .25, ease: 'power2.out' });
      await gsap.to(s, { left: slot.left, top: 470, duration: .42, ease: 'power2.inOut' });   // up and over the other stamps
      await gsap.to(s, { top: slot.top, duration: .2, ease: 'power2.in' });
    }
  };

  /* ---------- pile + basket ---------- */
  const Pile = {
    set(n) { $('#pileLeft').textContent = n + (n === 1 ? ' bill left' : ' bills left'); gsap.set('#pile2', { opacity: n > 0 ? 1 : 0 }); },
    glow() { return gsap.fromTo('#pile2', { filter: 'drop-shadow(0 0 0 rgba(247,183,51,0))' }, { filter: 'drop-shadow(0 0 26px rgba(247,183,51,1))', duration: .45, yoyo: true, repeat: 3 }); },
    bump() { gsap.fromTo('#pileLeft', { scale: 1.4 }, { scale: 1, duration: .4, ease: 'back.out(3)' }); }
  };
  /* the checked letters stand INSIDE the basket: back row of 4, front row of 3, leaning a little; their bottoms go behind the
     front rim (a second copy of the basket art clipped to the rim + front, .basket-art.front). Slots are in basket px (250 wide);
     k scales them for the bigger basket on the complete card. */
  const PKT_SLOTS = [[68, 60, -8], [109, 58, -3], [150, 58, 4], [190, 60, 9], [88, 70, 6], [129, 72, -4], [170, 70, 3]];   // sunk into the basket: only the tops show above the rim
  const PKT_W = 46, PKT_H = 58;
  const pktHTML = (n, k = 1) => PKT_SLOTS.slice(0, Math.min(n, 7)).map(([x, y, r]) =>
    `<div class="pkt" style="left:${(x - PKT_W / 2) * k}px;top:${(y - PKT_H / 2) * k}px;width:${PKT_W * k}px;height:${PKT_H * k}px;transform:rotate(${r}deg)"></div>`).join('');
  const BASKET_AT = { x: 1650, y: 930, s: .8 };   // #basket2 on stage (scale .8, origin top centre)
  const slotStage = i => { const [x, y] = PKT_SLOTS[Math.min(i, 6)]; return { x: BASKET_AT.x + 125 + (x - 125) * BASKET_AT.s, y: BASKET_AT.y + y * BASKET_AT.s }; };
  const Basket = {
    n: 0, html: pktHTML, slot: slotStage,
    set(n) { Basket.n = n; $('#basketBalls').innerHTML = pktHTML(n); },
    add() { Basket.set(Basket.n + 1); SND.sfx('tick', .4); const b = $('#basketBalls').lastElementChild; gsap.fromTo(b, { y: -30 }, { y: 0, duration: .35, ease: 'bounce.out' }); gsap.fromTo('#basket2', { scaleY: 1 }, { scaleY: .92, duration: .1, yoyo: true, repeat: 1, transformOrigin: '50% 100%' }); },
    glow() { return gsap.fromTo('#basket2', { filter: 'drop-shadow(0 0 0 rgba(247,183,51,0))' }, { filter: 'drop-shadow(0 0 22px rgba(247,183,51,1))', duration: .4, yoyo: true, repeat: 1 }); }
  };

  window.L2SC = { Bill, Stamps, Pile, Basket, BILL, BC };
})();

/* Scene pieces: price tag, number line, markers, answer buttons, cart, rule strip, hand, Next button. */
(function () {
  const { $, fmt, rs, NL, vx, sparks } = ST;
  const BTN_W = 320, BTN_TOP = 829.5;
  const MK = { tipX: 114.3, tipY: 177.3 };   // marker art is 234×198; its point is here

  // ---------- price tag ----------
  const Tag = {
    data: null,
    async show(item, icon, price) {
      Tag.data = { item, icon, price };
      $('#tagIcon').src = GA(`ic_${icon}.webp`);
      $('#tagName').textContent = item;
      $('#tagPrice').innerHTML = [...rs(price)].map(c => `<span class="d">${c}</span>`).join('');
      $('#tagPrice').style.visibility = '';
      gsap.set('#tagStamp', { opacity: 0 });
      const rig = $('#tagRig'); rig.classList.remove('hidden');
      const tag = $('#tag'); tag.style.left = '0px';
      const w = tag.offsetWidth; tag.style.left = (960 - w / 2) + 'px';
      SND.sfx('whoosh');
      gsap.set(rig, { x: 0, opacity: 1 });
      await gsap.timeline()
        .fromTo(rig, { y: -560, rotation: 0 }, { y: 0, duration: .55, ease: 'power2.in' })
        .to(rig, { rotation: 5, duration: .16, ease: 'sine.out' })
        .to(rig, { rotation: -3, duration: .3, ease: 'sine.inOut' })
        .to(rig, { rotation: 1.2, duration: .3, ease: 'sine.inOut' })
        .to(rig, { rotation: 0, duration: .3, ease: 'sine.inOut' });
    },
    async swingOut() {
      const rig = $('#tagRig'); if (rig.classList.contains('hidden')) return;
      SND.sfx('whoosh', .3);
      await gsap.to(rig, { x: -1200, rotation: -18, duration: .5, ease: 'power2.in' });
      rig.classList.add('hidden'); gsap.set(rig, { x: 0, rotation: 0 });
    },
    digit(on) {
      const ds = $('#tagPrice').querySelectorAll('.d'); const d = ds[ds.length - 3];
      ds.forEach(x => x.classList.remove('glow'));
      if (on && d) { d.classList.add('glow'); gsap.fromTo(d, { scale: 1.5 }, { scale: 1, duration: .5, ease: 'back.out(3)' }); }
    },
    iconCentre() { const t = $('#tag'); return { x: t.offsetLeft + 26 + 60, y: 188 + 114 + 60 }; },
    async stamp(value) {
      const tag = $('#tag'), price = $('#tagPrice'), st = $('#tagStamp');
      Tag.digit(false);
      await gsap.to(tag, { rotationY: 90, duration: .18, ease: 'power2.in' });
      price.style.visibility = 'hidden';
      st.textContent = rs(value); st.style.left = ($('#tagText').offsetLeft - 6) + 'px'; st.style.top = '146px';
      gsap.set(st, { opacity: 1 });
      await gsap.to(tag, { rotationY: 0, duration: .22, ease: 'power2.out' });
      SND.sfx('stamp');
      gsap.fromTo(st, { scale: 1.8, rotation: -14 }, { scale: 1, rotation: -6, duration: .32, ease: 'back.out(2)' });
      gsap.fromTo('#tagRig', { y: 6 }, { y: 0, duration: .3, ease: 'elastic.out(1,.4)' });
    }
  };

  // ---------- number line ----------
  function placeTicks() {
    const T = [['#tickL', NL.x0, 102, 56], ['#tickR', NL.x1, 102, 56], ['#tickM', NL.mid, 74.4, 34]];
    T.forEach(([id, x, h, up]) => { const e = $(id); e.style.left = (x - h * 40 / 120 / 2) + 'px'; e.style.top = (NL.top - up) + 'px'; });
  }
  placeTicks();
  const Line = {
    lo: 0, hi: 0,
    async show(lo, hi, { endLabels = true } = {}) {
      if (window.COACH && COACH.step) COACH.step('back');   // the coaches step back to make room for the line
      Line.lo = lo; Line.hi = hi;
      $('#labL').textContent = fmt(lo); $('#labR').textContent = fmt(hi); $('#labM').textContent = fmt((lo + hi) / 2);
      $('#labL').style.left = NL.x0 + 'px'; $('#labR').style.left = NL.x1 + 'px'; $('#labM').style.left = NL.mid + 'px';
      $('#numline').classList.remove('hidden');
      gsap.set(['#labL', '#labR'], { opacity: 0 }); gsap.set('#labM', { opacity: 0 });
      SND.sfx('swish');
      const tl = gsap.timeline();
      tl.fromTo('#nlBar', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: .55, ease: 'power2.out' })
        .fromTo(['#tickL', '#tickM', '#tickR'], { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: .3, stagger: .12, ease: 'back.out(2.5)' }, '-=.35')
        .to('#labM', { opacity: 1, duration: .3 }, '-=.1');
      if (endLabels) tl.fromTo(['#labL', '#labR'], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .3, stagger: .08 }, '<');
      await tl;
    },
    hideEndLabels() { return gsap.to(['#labL', '#labR'], { opacity: 0, scale: .6, duration: .18 }); },
    async hide() { await gsap.to('#numline', { opacity: 0, duration: .3 }); $('#numline').classList.add('hidden'); gsap.set('#numline', { opacity: 1 }); gsap.set(['#labL', '#labR'], { scale: 1 }); }
  };

  // ---------- markers ----------
  const Marker = {
    async show(lo, hi, v) {
      const m = $('#marker'); m.querySelector('span').textContent = rs(v); m.classList.remove('hidden');
      gsap.set(m, { left: vx(lo, hi, lo) - MK.tipX, top: NL.top + 4 - MK.tipY, opacity: 1, scale: 1, y: 0 });
      SND.sfx('pop');
      await gsap.timeline()
        .fromTo(m, { y: -140, opacity: 0 }, { y: 0, opacity: 1, duration: .35, ease: 'back.out(1.6)' })
        .to(m, { left: vx(lo, hi, v) - MK.tipX, duration: .7, ease: 'power2.inOut' })
        .fromTo(m, { scaleY: .9 }, { scaleY: 1, duration: .25, ease: 'back.out(3)' });
    },
    bounce() { return gsap.to('#marker', { y: -26, duration: .2, yoyo: true, repeat: 5, ease: 'power1.out' }); },
    async pop() { const m = $('#marker'); const r = m.getBoundingClientRect(); sparks(parseFloat(m.style.left) + 117, NL.top - 90, 10, 80); await gsap.to(m, { scale: 0, opacity: 0, duration: .25, ease: 'back.in(2)' }); m.classList.add('hidden'); gsap.set(m, { scale: 1 }); },
    async green(x, tipY, value) {
      const m = $('#markerGreen'); m.querySelector('span').textContent = rs(value); m.classList.remove('hidden');
      gsap.set(m, { left: x - MK.tipX, top: tipY - MK.tipY, opacity: 1, scale: 1 });
      SND.sfx('pop');
      await gsap.fromTo(m, { y: -180, opacity: 0 }, { y: 0, opacity: 1, duration: .45, ease: 'bounce.out' });
    },
    async hideAll() { await gsap.to(['#marker', '#markerGreen'], { opacity: 0, duration: .25 }); $('#marker').classList.add('hidden'); $('#markerGreen').classList.add('hidden'); }
  };

  // ---------- answer buttons ----------
  const B = { L: $('#btnL'), R: $('#btnR') };
  let onPick = null;
  Object.values(B).forEach(b => b.addEventListener('pointerdown', e => {
    e.preventDefault();
    if (b.classList.contains('locked') || b.classList.contains('faded') || !onPick) return;
    SND.sfx('pop', .35); onPick(b.dataset.side);
  }));
  const Btns = {
    B,
    async show(lo, hi) {
      B.L.querySelector('.lbl').textContent = fmt(lo); B.R.querySelector('.lbl').textContent = fmt(hi);
      [['L', NL.x0], ['R', NL.x1]].forEach(([s, x]) => { const b = B[s]; b.className = 'gbtn locked'; b.style.width = BTN_W + 'px'; b.style.left = (x - BTN_W / 2) + 'px'; b.style.top = BTN_TOP + 'px'; gsap.set(b.querySelector('.tick-badge'), { scale: 0 }); });
      Line.hideEndLabels();
      SND.sfx('pop');
      await gsap.fromTo([B.L, B.R], { scale: .55, opacity: 0 }, { scale: 1, opacity: 1, duration: .45, stagger: .09, ease: 'back.out(2.2)' });
    },
    enable(fn) { onPick = fn; B.L.classList.remove('locked'); B.R.classList.remove('locked'); },
    disable() { onPick = null; B.L.classList.add('locked'); B.R.classList.add('locked'); },
    state(side, cls) {
      const b = B[side]; const lock = b.classList.contains('locked');
      b.className = 'gbtn' + (cls ? ' ' + cls : '') + (lock ? ' locked' : '');
    },
    wiggle(side) { return gsap.fromTo(B[side], { x: 0 }, { x: 14, duration: .06, repeat: 5, yoyo: true, ease: 'sine.inOut', onComplete: () => gsap.set(B[side], { x: 0 }) }); },
    tick(side) { gsap.to(B[side].querySelector('.tick-badge'), { scale: 1, duration: .35, ease: 'back.out(3)' }); gsap.fromTo(B[side], { scale: 1.12 }, { scale: 1, duration: .4, ease: 'back.out(2)' }); },
    centre(side) { return { x: side === 'L' ? NL.x0 : NL.x1, y: BTN_TOP + 60 }; },
    async hide() { await gsap.to([B.L, B.R], { opacity: 0, scale: .8, duration: .25 }); B.L.className = B.R.className = 'gbtn hidden'; gsap.set([B.L, B.R], { scale: 1, opacity: 1 }); }
  };

  // ---------- cart (only shown when an item is collected) ----------
  // slots on the cart bed (cart art is 330 px wide; the bed sits at y ≈ 97). Back row first, then front row.
  const SLOTS = [[150, 115], [222, 112], [294, 109], [366, 106], [186, 130], [258, 127], [330, 124]];   // bottom-centre of each item on a 420-px cart
  const Cart = {
    n: 0, shown: false, items: [],
    setItems(list) { Cart.items = list.slice(); Cart.n = list.length; render(); },
    async collect(iconSrc, from) {
      const c = $('#cart');
      if (!Cart.shown) await Cart.show();
      const i = Cart.items.length, [sx, sy] = SLOTS[i % 7];
      const tx = 1486 + sx, ty = 162 + sy - 45;      // centre of the slot on stage
      await ST.flyImg(iconSrc, from.x, from.y, tx, ty, { size: 120, endSize: 90, lift: 220, dur: .8 });
      Cart.items.push(iconSrc); Cart.n = Cart.items.length; render();
      const im = $('#cartItems').lastElementChild;
      gsap.fromTo(im, { y: -18, scaleY: .8 }, { y: 0, scaleY: 1, duration: .35, ease: 'bounce.out' });
      SND.sfx('pop', .45);
      gsap.fromTo(c, { rotation: 0 }, { rotation: -2.5, duration: .1, yoyo: true, repeat: 1, transformOrigin: '70% 95%' });
      gsap.fromTo('#cartCount', { scale: 1.6 }, { scale: 1, duration: .4, ease: 'back.out(3)' });
      ST.sparks(tx, ty, 10, 70);
    },
    /* The cart moment (L1, after a correct answer): the cart rolls in to the centre of the stage, the item drops into it
       from the tag, the cart bounces and the count goes up. home() sends it back to its corner (top right). */
    CEN: { x: 960, y: 628, s: 1.3 },        // centre of the cart on stage during the moment (wheels on the sand, y ~790)
    async moment(iconSrc, from) {
      const c = $('#cart'), C = Cart.CEN, dx = C.x - (1486 + 210), dy = C.y - (162 + 125);
      gsap.set(c, { transformOrigin: '50% 50%' });
      if (!Cart.shown) { Cart.shown = true; gsap.set(c, { x: dx - 1500, y: dy, scale: C.s, rotation: 0, opacity: 1 }); }
      SND.sfx('whoosh', .4);
      await gsap.to(c, { x: dx, y: dy, scale: C.s, duration: .8, ease: 'back.out(1.1)' });
      gsap.fromTo(c, { rotation: -3 }, { rotation: 0, duration: .5, ease: 'elastic.out(1,.35)' });
      const i = Cart.items.length, [sx, sy] = SLOTS[i % 7];
      const tx = C.x + (sx - 210) * C.s, ty = C.y + (sy - 45 - 125) * C.s;
      await ST.flyImg(iconSrc, from.x, from.y, tx, ty, { size: 150, endSize: 90 * C.s, lift: 170, dur: .8 });
      Cart.items.push(iconSrc); Cart.n = Cart.items.length; render();
      gsap.fromTo($('#cartItems').lastElementChild, { y: -22, scaleY: .75 }, { y: 0, scaleY: 1, duration: .4, ease: 'bounce.out' });
      SND.sfx('pop', .45); SND.sfx('ding');            // a soft drop into the cart (coins are for paying, in L3)
      gsap.fromTo(c, { y: dy }, { y: dy + 10, duration: .1, yoyo: true, repeat: 1 });
      gsap.fromTo('#cartCount', { scale: 1.8 }, { scale: 1, duration: .45, ease: 'back.out(3)' });
      ST.sparks(tx, ty, 16, 110);
    },
    home() { return gsap.to('#cart', { x: 0, y: 0, scale: 1, rotation: 0, duration: .6, ease: 'power2.inOut' }); },
    async show() { Cart.shown = true; SND.sfx('whoosh', .3); await gsap.fromTo('#cart', { x: 460, opacity: 1 }, { x: 0, opacity: 1, duration: .55, ease: 'back.out(1.3)' }); },
    async hide() { if (!Cart.shown) return; Cart.shown = false; await gsap.to('#cart', { x: 460, y: 0, scale: 1, duration: .4, ease: 'power2.in' }); }
  };
  function render() {
    $('#cartItems').innerHTML = Cart.items.map((src, i) => { const [x, y] = SLOTS[i % 7]; return `<img src="${src}" style="left:${x - 45}px;top:${y - 90}px;z-index:${i < 4 ? 1 : 2}">`; }).join('');
    $('#cartCount').textContent = `${Cart.items.length} / 7`;
  }

  // ---------- rule strip + hand ----------
  const Rule = {
    on: false,
    show(text) { if (Rule.on) { gsap.fromTo('#rule', { scale: 1.06 }, { scale: 1, duration: .3 }); return; } Rule.on = true; $('#ruleText').textContent = text; SND.sfx('rise', .35); return gsap.fromTo('#rule', { y: 140, opacity: 0, xPercent: -50, x: 0 }, { y: 0, opacity: 1, xPercent: -50, duration: .45, ease: 'back.out(1.6)' }); },
    hide() { if (!Rule.on) return; Rule.on = false; return gsap.to('#rule', { y: 140, opacity: 0, duration: .3, ease: 'power2.in' }); }
  };
  gsap.set('#rule', { xPercent: -50, x: 0 }); $('#rule').style.transform = '';
  let handTl = null;
  const Hand = {
    show(x, y) {   // (x, y) = centre of the button; the hand points down, fingertip lands right of the number
      const h = $('#hand'); gsap.set(h, { left: x + 66, top: y - 104, opacity: 1 });
      if (handTl) handTl.kill();
      handTl = gsap.timeline({ repeat: -1 }).fromTo(h, { y: -30, scale: 1 }, { y: 0, duration: .35, ease: 'power2.in' }).to(h, { scale: .9, duration: .12, yoyo: true, repeat: 1 }).to(h, { y: -30, duration: .35, ease: 'power2.out' }).to({}, { duration: .25 });
    },
    hide() { if (handTl) { handTl.kill(); handTl = null; } gsap.to('#hand', { opacity: 0, duration: .2 }); }
  };

  let shop = 0;
  function bgShift() { shop++; return gsap.to('#gBg', { x: shop % 2 ? -80 : 80, duration: .9, ease: 'power2.inOut' }); }

  window.SC = { Tag, Line, Marker, Btns, Cart, Rule, Hand, bgShift, BTN_TOP };
})();

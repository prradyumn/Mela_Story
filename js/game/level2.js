/* Level 2 flow: banner → how-to → teach (Guddu + Pari) → 7 bills → complete.
   Each bill, one thing at a time: ball from the pile un-crumples into the bill → price 1 writes in → price 2 + "About total"
   → three stamps rise. 3-strike: Oops (+ Gudiya pops in) → Hint (yellow ≈ chips) → Nudge (hand). 10 s idle once.
   Correct: blue ≈ chips → stamp dips in the ink → THUMP on the bill → red "About ₹…" mark → marigold + sun →
   the bill crumples into the CHECKED basket → next bill. */
(function () {
  const { $, wait, sparks, confetti } = ST;
  const { Bill, Stamps, Pile, Basket } = L2SC;
  const D = window.LEVEL2;
  const fmt = n => LEVEL1.fmt(n);
  const result = { stars: [] };

  /* ---------- intro lines play on their own (same rule as Level 1: no Next, no tap-to-continue; Skip = Bill 1) ---------- */
  let skipping = false, skipRes = null;
  async function beat(line, action) {
    if (skipping) return;
    const said = COACH.say(line);
    if (action) await action();
    if (skipping) return;
    await Promise.race([said.then(() => wait(.6)), new Promise(r => { skipRes = r; })]);
    SND.stopVo();
  }
  function skipBtn(on) {
    const b = $('#btnSkip');
    if (on) { b.classList.remove('hidden'); gsap.fromTo(b, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .4, delay: 1 }); }
    else gsap.to(b, { opacity: 0, duration: .25, onComplete: () => b.classList.add('hidden') });
  }
  $('#btnSkip').addEventListener('pointerdown', e => { if (!window.L2_ACTIVE || skipping) return; skipping = true; SND.stopVo(); skipBtn(false); skipRes && skipRes(); });

  /* ---------- one bill: 3-strike play ---------- */
  function play(b, L, { teach = false } = {}) {
    return new Promise(resolve => {
      let strikes = 0, idleCall = null, idlePlayed = false, done = false;
      const right = b.choices.indexOf(L.ans);
      const armIdle = () => {
        if (idleCall) idleCall.kill(); if (idlePlayed) return;
        idleCall = gsap.delayedCall(10, () => { idlePlayed = true; COACH.say(L.idle); Bill.glowPrices(); Stamps.pulse(); });
      };
      async function onPick(i) {
        if (done) return; if (idleCall) idleCall.kill();
        if (i === right) { done = true; Stamps.disable(); await correct(); resolve(strikes); return; }
        strikes++; Stamps.disable();
        Stamps.state(i, 'wrong'); Stamps.wiggle(i); SND.sfx('boing');
        gsap.delayedCall(.8, () => { if (!done && strikes < 3) Stamps.state(i, ''); });
        const fb = l => Promise.race([COACH.say(l), wait(1.3)]);
        if (strikes === 1) { gudiyaBleat(); await fb(L.oops); }
        else if (strikes === 2) { Bill.chips('yellow'); await fb(L.hint); }
        else {
          b.choices.forEach((v, k) => Stamps.state(k, k === right ? 'glow' : 'faded'));
          const c = Stamps.centre(right); Hand.show(c.x - 76, c.y - 16);
          await fb(L.nudge);
        }
        if (!done) { Stamps.enable(onPick); if (strikes < 3) Stamps.state(i, ''); armIdle(); }
      }
      async function correct() {
        SND.stopVo(); Hand.hide();
        b.choices.forEach((v, k) => Stamps.state(k, k === right ? 'correct' : 'faded'));
        SND.sfx('bell'); SND.sfx('ding');
        const okLine = COACH.say(L.ok); COACH.cheer();          // Pari cheers through her "Yes!"
        await Bill.chips('blue');
        await Stamps.press(right, L.ans);
        if (!teach) {
          HUD.lit++; HUD.setLit(HUD.lit);                              // count kept (the story gets 7 flowers); no marigold plate in L2
          result.stars.push(strikes === 0 ? 'gold' : strikes < 3 ? 'silver' : 'none');
        }
        await okLine;
        await wait(teach ? .8 : 1.2);
      }
      Stamps.enable(onPick); armIdle();
    });
  }
  const Hand = SC.Hand;
  async function gudiyaBleat() {
    const G = GUDIYA;
    await G.enter(1810, 1072, 190);
    await G.bleat();
    gsap.delayedCall(1.4, async () => { await G.trotTo(2150, 1072, 190); G.hide(); });
  }

  /* ---------- banner ---------- */
  async function banner() {
    const ov = $('#titleOv'), c = $('#titleCard');
    c.querySelector('.lvl').textContent = 'Level 2';
    c.querySelector('h1').textContent = 'Panchayat Office'; c.querySelector('h1').style.fontSize = '88px';
    c.querySelector('p').textContent = 'Add the bills — about how much?';
    $('#titleIcons').innerHTML = ['bill_pile', 'stamp_tool', 'checked_basket'].map(n => `<img src="${GA(n + '.webp')}" alt="" style="width:${n === 'stamp_tool' ? 90 : 150}px;height:110px">`).join('');
    ov.classList.remove('hidden'); gsap.set(ov, { opacity: 1 });
    await gsap.fromTo(c, { scale: .6, opacity: 0 }, { scale: 1, opacity: 1, duration: .55, ease: 'back.out(1.7)' });
    gsap.from('#titleIcons img', { y: 30, opacity: 0, duration: .35, stagger: .08, ease: 'back.out(2)' });
    SND.sfx('rise');
    await wait(2.2);
    await gsap.to(ov, { opacity: 0, duration: .35 }); ov.classList.add('hidden');
  }

  /* ---------- how-to + teach ---------- */
  async function howto() {
    HUD.chip(`${D.chip} · How to play`);
    const E = D.example;
    for (const line of D.howto) {
      await beat(line, async () => {
        if (line.show === 'pile') Pile.glow();
        if (line.show === 'example') { Bill.set(E.title, E.items); await Bill.enter(); await Bill.write(1); await Bill.write(2); await wait(.3); await Bill.chips('blue'); }
        if (line.show === 'stamps') { await Bill.showTotal(); await Stamps.show(E.choices); Stamps.S.forEach(s => s.classList.add('pulse')); }
      });
      if (skipping) return;
    }
    await Promise.all([Stamps.hide(), Bill.crumpleTo(false)]);
  }
  async function teach() {
    const T = D.teach;
    HUD.chip(`${D.chip} · Try one with Pari`);
    const L = { ans: T.answer, ok: T.ok, oops: T.oops, hint: T.hint, nudge: T.nudge, idle: T.idle };
    for (const line of T.lines) {
      if (skipping) return;
      if (line.show === 'stamps') {
        skipBtn(false); COACH.say(line);
        await Stamps.show(T.choices);
        const right = T.choices.indexOf(T.answer); Stamps.state(right, 'glow');
        const c = Stamps.centre(right); Hand.show(c.x - 76, c.y - 16);
        await play(T, L, { teach: true });
        await Promise.all([Stamps.hide(), Bill.crumpleTo(false)]);
        return;
      }
      await beat(line, async () => {
        if (line.show === 'bill') { Bill.set(T.title, T.items); await Bill.enter(); await Bill.write(1); await Bill.write(2); await Bill.showTotal(); }
        if (line.show === 'chip1') await Bill.chips('blue', 1);
        if (line.show === 'chip2') await Bill.chips('blue', 2);
      });
    }
  }

  /* ---------- one bill ---------- */
  async function billRound(b, i) {
    const n = i + 1, L = D.qLines(b, n);
    HUD.chip(`${D.chip} · Bill ${n} of 7`);
    Pile.set(8 - n); Pile.bump();
    const ask = COACH.say({ ...L.ask, text: `Here is bill ${n}.` });
    Bill.set('BILL ' + n, b.items);
    await Bill.enter();                                              // beat 1: the paper un-crumples (title only)
    COACH.update({ ...L.ask, text: `Here is bill ${n}. ${b.items[0][0]} ${LEVEL1.rs(b.items[0][1])}…` });
    await Bill.write(1);                                             // beat 2: price 1
    COACH.update(L.ask);
    await Bill.write(2); await Bill.showTotal();                     // beat 3: price 2 + "About total: ?"
    await Stamps.show(b.choices);                                    // beat 4: the stamps
    SND.setCurrent(L.ask);
    await play(b, L);
    await ask;
    Pile.set(7 - n);
    await Promise.all([Stamps.hide(), Bill.crumpleTo(true)]);         // paper squash → CHECKED basket
  }

  /* ---------- complete ---------- */
  async function complete() {
    COACH.hideBubble(); HUD.chip(`${D.chip} · 7 of 7`); HUD.celebrate(); HUD.sun(D.sun[1]);
    const gold = result.stars.filter(s => s === 'gold').length, nStars = gold >= 6 ? 3 : gold >= 4 ? 2 : 1;
    const ov = $('#done2'); ov.classList.remove('hidden');
    const imgs = ov.querySelectorAll('#done2Stars img');
    imgs.forEach((im, i) => { im.src = GA(i < nStars ? 'ui_star_gold.webp' : 'ui_star_silver.webp'); im.style.opacity = i < nStars ? 1 : .35; });
    ov.querySelector('.balls').innerHTML = Array.from({ length: 7 }, (_, i) => `<div class="pkt" style="left:${30 + (i % 4) * 95 + (i > 3 ? 48 : 0)}px;top:${i > 3 ? 0 : 36}px"></div>`).join('');
    $('#done2Score').textContent = `${gold} of 7 on the first try`;
    SND.sfx('confetti'); confetti(90);
    await gsap.fromTo('#done2Card', { scale: .5, opacity: 0 }, { scale: 1, opacity: 1, duration: .5, ease: 'back.out(1.7)' });
    for (let i = 0; i < 3; i++) { gsap.fromTo(imgs[i], { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: .45, ease: 'back.out(2.5)' }); if (i < nStars) SND.sfx('sparkle'); await wait(.3); }
    gsap.from('#done2Basket .balls .pkt', { y: -120, opacity: 0, duration: .45, stagger: .08, ease: 'bounce.out' });
    const cta = $('#done2Cta'); cta.classList.add('pulse');
    // moves on by itself once the card has been seen; tapping the button just goes a little sooner (same as Level 1)
    await Promise.race([wait(3), new Promise(res => cta.addEventListener('pointerdown', e => { e.preventDefault(); SND.sfx('pop'); res(); }, { once: true }))]);
    return { stars: nStars, gold, perShop: result.stars.slice() };
  }

  /* ---------- reset + run ---------- */
  function reset() {
    skipping = false; result.stars = [];
    $('#l2').classList.remove('hidden'); $('#done2').classList.add('hidden'); $('#done2Cta').classList.remove('pulse');
    Bill.hide(); $('#pack2').innerHTML = ''; Stamps.S.forEach(s => s.className = 'stamp2 hidden'); Basket.set(0); Pile.set(7);
    gsap.set(['#inkPad', '#ball2', '#crumpleCv'], { opacity: 0 }); gsap.set('#done2Card', { clearProps: 'transform,opacity' });
    // anything Level 1 left behind
    ['#coach', '#btnSkip', '#gudiya', '#doneOv', '#tagRig', '#numline', '#marker', '#markerGreen', '#titleOv'].forEach(s => $(s).classList.add('hidden'));
    ['#btnL', '#btnR'].forEach(s => $(s).className = 'gbtn hidden'); gsap.set(['#cart', '#rule', '#hand', '#bleat'], { opacity: 0 }); $('#gFx').innerHTML = '';
    const bg = $('#gBg'); gsap.set(bg, { clearProps: 'all' }); Object.assign(bg.style, { left: '0px', top: '0px', width: '1920px', height: '1080px', backgroundImage: `url(${GA('office_desk_l2.webp')})` });   // taller wall, slimmer desk (top edge y 740)
  }
  async function run({ startAt = 0, skipIntro = false } = {}) {
    window.L2_ACTIVE = true; COACH.pariSpot = 'desk';   // full-body Pari behind the desk
    reset();
    SND.preload(D.allLines().map(l => l.id));
    HUD.setLit(startAt); HUD.lit = startAt; HUD.setSun(D.sun[0] + (D.sun[1] - D.sun[0]) * startAt / 7);
    Basket.set(startAt);
    const warmed = warm(['office_desk_l2.webp', 'bill_paper.webp', 'stamp_tool.webp', 'stamp_tool_pressed.webp', 'stamp_mark.webp', 'ink_pad.webp', 'bill_pile.webp', 'checked_basket.webp'].map(GA));
    await banner(); await warmed;
    HUD.show();
    COACH.present('guddu');                      // Guddu Bhaiya is at his desk for the whole level
    gsap.set(['#sunPanel', '#gChip', '#mariPlate', '#glowMari'], { autoAlpha: 0 });   // L2: no sun, chip or marigolds — characters + bill get the room
    if (!skipIntro) {
      skipBtn(true);
      await howto(); await teach();
      skipBtn(false); Hand.hide(); Stamps.disable();
      if (skipping) { Stamps.hide(); if (!$('#bill2').classList.contains('hidden')) await Bill.crumpleTo(false); }
    }
    for (let i = startAt; i < 7; i++) await billRound(D.bills[i], i);
    const res = await complete();
    window.L2_ACTIVE = false; COACH.pariSpot = 'stand'; gsap.set(['#sunPanel', '#gChip', '#mariPlate'], { autoAlpha: 1 });
    return res;
  }
  window.LEVEL2_RUN = run;
})();

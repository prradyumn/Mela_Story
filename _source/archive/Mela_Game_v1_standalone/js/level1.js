/* Level 1 flow: How to play → Teach (with Pari & Manju Mausi) → 7 shops → Level complete.
   Storyboard rules: one new thing at a time · 3-strike feedback (Oops → Hint → Hand nudge) ·
   10 s inactivity line plays once · correct = bell + green button + stamp + marigold + sun step,
   then 2 s and the next shop slides in. */
(function () {
  const { $, NL, vx, rs, fmt, wait, sparks, confetti } = ST;
  const { Tag, Line, Marker, Btns, Cart, Rule, Hand, bgShift } = SC;
  const D = window.LEVEL1;
  const CORNER = { x: 1820, y: 1036, h: 205 };     // Gudiya waits here
  const ON_BAR = { y: NL.top + 4, h: 165 };          // Gudiya standing on the number line

  const result = { stars: [] };   // per shop: 'gold' | 'silver' | 'none'

  /* ---------- one question (also used for the teach round) ---------- */
  function play(q, L, { teach = false } = {}) {
    return new Promise(resolve => {
      let strikes = 0, idleCall = null, idlePlayed = false, done = false;
      const correctSide = L.ans === q.lo ? 'L' : 'R', wrongSide = correctSide === 'L' ? 'R' : 'L';

      const armIdle = () => {
        if (idleCall) idleCall.kill();
        if (idlePlayed) return;
        idleCall = gsap.delayedCall(10, () => {
          idlePlayed = true;
          COACH.say(L.idle);
          ['L', 'R'].forEach(s => { if (!Btns.B[s].classList.contains('faded') && !Btns.B[s].classList.contains('glow')) Btns.B[s].classList.add('pulse'); });
          gsap.delayedCall(3.5, () => ['L', 'R'].forEach(s => Btns.B[s].classList.remove('pulse')));
          Marker.bounce();
        });
      };

      async function onPick(side) {
        if (done) return;
        if (idleCall) idleCall.kill();
        ['L', 'R'].forEach(s => Btns.B[s].classList.remove('pulse'));
        if (side === correctSide) { done = true; Btns.disable(); await correct(); resolve(strikes); return; }

        strikes++;
        Btns.disable();
        Btns.state(side, 'wrong'); Btns.wiggle(side); SND.sfx('boing');
        gsap.delayedCall(.75, () => { if (!done && strikes < 3) Btns.state(side, ''); });
        const fb = l => Promise.race([COACH.say(l), wait(1.3)]);   // child can answer again after ~1 s; a new tap cuts the line
        if (strikes === 1) { GUDIYA.bleat(); await fb(L.oops); }
        else if (strikes === 2) { Tag.digit(true); Rule.show(D.rule); await fb(L.hint); }
        else {
          Btns.state(wrongSide, 'faded'); Btns.state(correctSide, 'glow');
          const c = Btns.centre(correctSide); Hand.show(c.x, c.y);
          await fb(L.nudge);
        }
        if (!done) { Btns.enable(onPick); if (strikes < 3) Btns.state(side, ''); armIdle(); }
      }

      async function correct() {
        SND.stopVo(); Hand.hide();
        Btns.state(correctSide, 'correct'); Btns.state(wrongSide, 'faded'); Btns.tick(correctSide);
        SND.sfx('bell'); SND.sfx('ding');
        const okLine = COACH.say(L.ok);
        Rule.hide();
        // Gudiya leaps onto the line where the price is, then hops to the round number
        const px = vx(q.lo, q.hi, q.price), ax = correctSide === 'L' ? NL.x0 : NL.x1;
        await Marker.pop();
        await GUDIYA.leapTo(px, ON_BAR.y, ON_BAR.h);
        const hops = Math.max(2, Math.ceil(Math.abs(L.ans - q.price) / 125));
        await GUDIYA.hopTo(ax + (correctSide === 'L' ? 6 : -6), ON_BAR.y, hops);
        Marker.green(ax, ON_BAR.y - ON_BAR.h - 4, L.ans);
        GUDIYA.cheer();
        // tag flips to the stamp, the cart collects the item
        await Tag.stamp(L.ans);
        if (!teach) {
          const from = Tag.iconCentre();
          await Cart.collect(`assets/img/ic_${q.icon}.webp`, from);
          // a marigold for the HUD and one step of the sun
          const k = HUD.lit; await HUD.lightNext(1486 + 260, 162 + 90);
          HUD.sun(D.sun[0] + (D.sun[1] - D.sun[0]) * (k + 1) / 7);
          result.stars.push(strikes === 0 ? 'gold' : strikes < 3 ? 'silver' : 'none');
        }
        await okLine;
        await wait(teach ? 1.2 : 2);   // storyboard: "After 2 seconds the next shop slides in"
      }

      Btns.enable(onPick); armIdle();
    });
  }

  /* ---------- clear the stage between shops ---------- */
  async function clearShop() {
    COACH.hideBubble();
    const back = GUDIYA.state.x !== CORNER.x ? GUDIYA.trotTo(CORNER.x, CORNER.y, CORNER.h) : null;
    await Promise.all([Btns.hide(), Marker.hideAll(), Cart.hide(), Rule.hide(), Line.hide()]);
    await Promise.all([Tag.swingOut(), bgShift(), back]);
  }

  /* ---------- intro lines play on their own (no Next button) ----------
     A line moves on when its voice ends (+ a short pause). Tapping anywhere moves on straight away.
     "Skip ⏭" jumps to Shop 1. */
  let skipping = false;
  function tapToContinue() {
    return new Promise(res => {
      const t0 = performance.now();
      const h = e => {
        if (e.target.closest('.btn, .round-btn, #btnSkip')) return;
        if (performance.now() - t0 < 500) return;
        ST.stage.removeEventListener('pointerdown', h); res();
      };
      ST.stage.addEventListener('pointerdown', h);
      tapToContinue.cancel = () => ST.stage.removeEventListener('pointerdown', h);
    });
  }
  async function beat(line, action) {
    if (skipping) return;
    const said = COACH.say(line, { more: true });
    if (action) await action();
    if (skipping) return;
    await Promise.race([said.then(() => wait(.6)), tapToContinue(), skipWait()]);
    tapToContinue.cancel && tapToContinue.cancel();
    COACH.more(false);
    SND.stopVo();
  }
  let skipRes = null;
  const skipWait = () => new Promise(r => { skipRes = r; });
  function skipBtn(on) {
    const b = $('#btnSkip');
    if (on) { b.classList.remove('hidden'); gsap.fromTo(b, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .4, delay: 1 }); }
    else gsap.to(b, { opacity: 0, duration: .25, onComplete: () => b.classList.add('hidden') });
  }
  $('#btnSkip').addEventListener('pointerdown', e => { e.preventDefault(); if (skipping) return; skipping = true; SND.sfx('whoosh', .3); SND.stopVo(); skipBtn(false); skipRes && skipRes(); });

  /* ---------- How to play ---------- */
  async function howto() {
    HUD.chip(`${D.chip} · How to play`);
    const s = D.howtoSample;
    for (const line of D.howto) {
      await beat(line, async () => {
        if (line.show === 'tag') await Tag.show(s.item, s.icon, s.price);
        if (line.show === 'line') { await Line.show(s.lo, s.hi); await Marker.show(s.lo, s.hi, s.price); }
        if (line.show === 'hud') {
          await Promise.all([Marker.hideAll(), Line.hide()]); await Tag.swingOut();
          HUD.glow('#glowMari'); gsap.delayedCall(1.4, () => { HUD.glow('#glowSun'); HUD.sun(D.sun[0] + .06, .6).then(() => HUD.sun(D.sun[0], .6)); });
        }
      });
      if (skipping) return;
    }
  }

  /* ---------- Teach: try one with Pari ---------- */
  async function teach() {
    const T = D.teach;
    HUD.chip(`${D.chip} · Try one with Pari`);
    const L = { ans: T.answer, ok: T.ok, oops: T.oops, hint: T.hint, nudge: T.nudge, idle: T.idle };
    for (const line of T.lines) {
      if (skipping) return;
      if (line.show === 'buttons') {
        skipBtn(false);
        COACH.say(line);
        Rule.hide(); await Btns.show(T.lo, T.hi);
        if ($('#gudiya').classList.contains('hidden')) GUDIYA.enter(CORNER.x, CORNER.y, CORNER.h);
        Btns.state('R', 'glow');
        const c = Btns.centre('R'); Hand.show(c.x, c.y);       // show, don't tell: the hand demonstrates the tap
        await play({ ...T, word: 'sweets', n: 0 }, L, { teach: true });
        return;
      }
      await beat(line, async () => {
        if (line.show === 'tag') await Tag.show(T.item, T.icon, T.price);
        if (line.show === 'line') { await Line.show(T.lo, T.hi); await Marker.show(T.lo, T.hi, T.price); }
        if (line.show === 'digit') { Tag.digit(true); await wait(.4); Rule.show(D.rule); }
      });
    }
  }

  /* ---------- one shop ---------- */
  async function shopRound(q, i) {
    q.n = i + 1;
    const L = D.qLines(q, q.n);
    HUD.chip(`${D.chip} · Shop ${i + 1} of 7`);
    // beat 1: only the tag (bubble shows the first sentence; the VO file is the whole question)
    const ask = COACH.say({ ...L.ask, text: L.ask1 });
    await Tag.show(q.item, q.icon, q.price);
    await wait(.7);
    // beat 2: the number line + red arrow
    COACH.update(L.ask);
    await Line.show(q.lo, q.hi);
    await Marker.show(q.lo, q.hi, q.price);
    // beat 3: the two answers (+ Gudiya, if she isn't there yet)
    await Btns.show(q.lo, q.hi);
    if ($('#gudiya').classList.contains('hidden')) GUDIYA.enter(CORNER.x, CORNER.y, CORNER.h);
    SND.setCurrent(L.ask);
    await play(q, L);
    await ask;
  }

  /* ---------- level complete ---------- */
  async function complete() {
    COACH.hideBubble(); HUD.chip(`${D.chip} · 7 of 7`);
    HUD.celebrate(); HUD.sun(D.sun[1]);
    GUDIYA.hide();
    const gold = result.stars.filter(s => s === 'gold').length;
    const nStars = gold >= 6 ? 3 : gold >= 4 ? 2 : 1;
    const ov = $('#doneOv'); ov.classList.remove('hidden');
    const imgs = ov.querySelectorAll('#doneStars img');
    imgs.forEach((im, i) => { im.src = i < nStars ? 'assets/img/ui_star_gold.webp' : 'assets/img/ui_star_silver.webp'; im.style.opacity = i < nStars ? 1 : .35; });
    $('#doneScore').textContent = `${gold} of 7 on the first try`;
    SND.sfx('confetti'); confetti(90);
    await gsap.fromTo('#doneCard', { scale: .5, opacity: 0 }, { scale: 1, opacity: 1, duration: .5, ease: 'back.out(1.7)' });
    for (let i = 0; i < 3; i++) {
      gsap.fromTo(imgs[i], { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: .45, ease: 'back.out(2.5)' });
      if (i < nStars) { SND.sfx('sparkle'); const r = imgs[i]; sparks(730 + r.offsetLeft + r.offsetWidth / 2, 180 + 24 + 150 + r.offsetTop, 14, 90); }
      await wait(.3);
    }
    SND.sfx('whoosh');
    await gsap.fromTo('#doneCart', { x: -900, rotation: -4 }, { x: 0, rotation: 0, duration: .9, ease: 'power3.out' });
    gsap.fromTo('#doneCart', { y: 0 }, { y: -10, duration: .15, yoyo: true, repeat: 1 });
    for (const line of D.complete) await COACH.say(line);
    const cta = $('#doneCta'); cta.classList.add('pulse');
    await new Promise(res => cta.addEventListener('pointerdown', e => { e.preventDefault(); SND.sfx('pop'); res(); }, { once: true }));
    return { stars: nStars, gold, perShop: result.stars.slice() };
  }

  /* ---------- run ---------- */
  async function run({ startAt = 0, skipIntro = false } = {}) {
    gsap.set('#bg', { x: 0 });
    HUD.show(); HUD.setLit(startAt); HUD.lit = startAt; HUD.setSun(D.sun[0] + (D.sun[1] - D.sun[0]) * startAt / 7);
    Cart.setItems(D.questions.slice(0, startAt).map(q => `assets/img/ic_${q.icon}.webp`));
    if (!skipIntro) {
      skipBtn(true);
      await howto();
      await teach();
      skipBtn(false); Hand.hide(); Btns.disable();
      if (skipping) { HUD.chip(`${D.chip} · Shop 1 of 7`); if ($('#gudiya').classList.contains('hidden')) GUDIYA.enter(CORNER.x, CORNER.y, CORNER.h); }
      await clearShop();
    }
    for (let i = startAt; i < D.questions.length; i++) {
      await shopRound(D.questions[i], i);
      await clearShop();
    }
    return complete();
  }

  window.LEVEL1_RUN = run;
})();

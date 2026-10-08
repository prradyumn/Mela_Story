/* Level 3 flow: banner → how-to (Baba · paying makes it less · the lane map) → teach (₹2,00,000 − ₹38,760) → 7 payments
   → finale (the whole Mela lights, the giant wheel spins) → complete. Figma ★ L3 · Clean build v3, DEV SPEC 137:343.
   Each payment: PUSH (camera = hook − 1180) → DROP (bill on the hook) → ASK (bill, then panel glow; "−" pops; slates rise)
   → 3-strike (Oops + Gudiya / Hint + yellow ≈ chip + "−" glow / Nudge + hand) · idle 10 s once
   → PAY (Aaru, coins into the potli, the duster rewrites the panel) → LIGHT (PAID, the stall lights up, marigold, sun).
   No speech bubbles in L3: COACH.voiceOnly, the speaker gets talk waves. Running total uses the ROUNDED value. */
(function () {
  const { $, wait, confetti } = ST;
  const { Guddu, Cam, Pari, Waves, Cart, Panel, Minus, Bill, Slates, Aaru, Coins, Stall, Sun, Fw, Wheel, Map, Baba } = L3SC;
  const D = window.LEVEL3, Hand = SC.Hand;
  const fmt = n => LEVEL1.fmt(n), rs = n => '₹' + fmt(n);
  const result = { stars: [] };
  const CAM = i => D.hooks[i][0] - D.hookScreenX;              // camera for stall i
  const durOf = l => (window.DUR && DUR[l.vo]) || ST.readTime(l.text);
  /* the number being spoken glows: the bill first, then the cart panel (no word timings → share of the line) */
  const glowAlong = (line, parts) => { const d = durOf(line); parts.forEach(([t, fn]) => gsap.delayedCall(d * t, fn)); };

  /* ---------- lines play on their own (no Next, no tap-to-continue; Skip = payment 1) ---------- */
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
  $('#btnSkip').addEventListener('pointerdown', () => { if (!window.L3_ACTIVE || skipping) return; skipping = true; SND.stopVo(); skipBtn(false); skipRes && skipRes(); });

  async function gudiyaBleat() {
    const G = GUDIYA;
    await G.enter(1703, 800, 180);
    await G.bleat();
    gsap.delayedCall(1.4, async () => { await G.trotTo(2150, 800, 180); G.hide(); });
  }

  /* ---------- one question: 3-strike play ---------- */
  function play(q, L, { teach = false, i = 0 } = {}) {
    return new Promise(resolve => {
      let strikes = 0, idleCall = null, idlePlayed = false, done = false;
      const right = q.choices.indexOf(L.ans);
      const armIdle = () => {
        if (idleCall) idleCall.kill(); if (idlePlayed) return;
        idleCall = gsap.delayedCall(10, () => { idlePlayed = true; COACH.say(L.idle); Bill.glow(); Cart.glow(); Slates.pulse(); });
      };
      async function onPick(k) {
        if (done) return; if (idleCall) idleCall.kill();
        if (k === right) { done = true; Slates.disable(); await correct(); resolve(strikes); return; }
        strikes++; Slates.disable();
        Slates.state(k, 'wrong'); Slates.wiggle(k); SND.sfx('boing');
        gsap.delayedCall(.8, () => { if (!done && strikes < 3) Slates.state(k, ''); });
        const fb = l => Promise.race([COACH.say(l), wait(1.3)]);
        if (strikes === 1) { gudiyaBleat(); await fb(L.oops); }
        else if (strikes === 2) { Bill.chip('yellow', L.r); Minus.glow(); await fb(L.hint); }
        else {
          q.choices.forEach((v, j) => Slates.state(j, j === right ? 'glow' : 'faded'));
          const h = Slates.handAt(right); Hand.show(h.x, h.y);
          await fb(L.nudge);
        }
        if (!done) { Slates.enable(onPick); if (strikes < 3) Slates.state(k, ''); armIdle(); }
      }
      async function correct() {
        SND.stopVo(); Hand.hide();
        q.choices.forEach((v, j) => Slates.state(j, j === right ? 'correct' : 'faded')); Slates.tick(right);
        SND.sfx('bell'); SND.sfx('ding');
        const okLine = COACH.say(L.ok);
        await Bill.chip('blue', L.r);
        if (teach) {
          await Panel.wipe(); await Panel.write(L.ans, true); await Bill.paid();
        } else {
          await pay(i, L);
          result.stars.push(strikes === 0 ? 'gold' : strikes < 3 ? 'silver' : 'none');
        }
        await okLine;
        await wait(.5);
      }
      Slates.enable(onPick); armIdle();
    });
  }

  /* ---------- PAY + LIGHT ---------- */
  async function pay(i, L) {
    // PAY: the slates and the "−" sink (the front is clear), Aaru runs in on the ground from the right, stops by the cart and
    // hops with the potli held up
    Minus.hide(); await Slates.hide();
    Aaru.show(2150); Aaru.carry(false);
    await Aaru.run(950);
    Aaru.face(-1); Aaru.carry(true); Aaru.bounce(true);
    await Coins.toPotli(5);                                        // coins arc from the cart bag into his potli
    await Panel.wipe();                                            // the duster wipes the panel…
    await Panel.write(L.ans, true);                                // …and the new ≈ value is chalked in
    // LIGHT: Aaru runs the money over to the stall and hands it in → PAID → the stall lights up
    await Aaru.run(1430);
    Aaru.face(-1); Aaru.pose('jump');
    const c = Bill.centre();
    await Aaru.giveTo(c.x, c.y - 30);
    await Bill.paid();
    Stall.light(i); Aaru.hop(60);
    HUD.lightNext(c.x, c.y);
    Sun.to(i + 1);
    await wait(1);
    Aaru.run(2150).then(() => Aaru.hide());
    await Bill.away();
  }

  /* ---------- banner ---------- */
  async function banner() {
    const ov = $('#titleOv'), c = $('#titleCard');
    c.querySelector('.lvl').textContent = 'Level 3';
    c.querySelector('h1').textContent = 'Mela Ground'; c.querySelector('h1').style.fontSize = '96px';
    c.querySelector('p').textContent = 'Push the money cart. Pay. Light the Mela!';
    $('#titleIcons').innerHTML = [['money_cart', 220, 150], ['potli', 110, 120], ['light_burst', 170, 170]].map(([n, w, h]) => `<img src="${GA('l3/' + n + '.webp')}" alt="" style="width:${w}px;height:${h}px;object-fit:contain">`).join('');
    ov.classList.remove('hidden'); gsap.set(ov, { opacity: 1 });
    await gsap.fromTo(c, { scale: .6, opacity: 0 }, { scale: 1, opacity: 1, duration: .55, ease: 'back.out(1.7)' });
    gsap.from('#titleIcons img', { y: 30, opacity: 0, duration: .35, stagger: .08, ease: 'back.out(2)' });
    SND.sfx('rise');
    await wait(2.2);
    await gsap.to(ov, { opacity: 0, duration: .35 }); ov.classList.add('hidden');
  }

  /* ---------- how-to ---------- */
  async function howto() {
    for (const line of D.howto) {
      await beat(line, async () => {
        if (line.show === 'baba') { glowAlong(line, [[.32, () => { Cart.glow(); Panel.glow(); }]]); await Baba.enter(); Baba.talk(true); }
        if (line.show === 'less') { await Minus.show(); Coins.hopOff(4); }
        if (line.show === 'map') { await Map.on(); }
      });
      if (line.show === 'baba') { Baba.talk(false); Baba.exit(); }
      if (line.show === 'less') Minus.hide();
      if (line.show === 'map') await Map.off(skipping);
      if (skipping) return;
    }
  }

  /* ---------- teach: ₹2,00,000 − a ₹38,760 bill ---------- */
  async function teach() {
    const T = D.teach;
    const L = { ans: T.answer, r: D.round(T.bill), ok: T.ok, oops: T.oops, hint: T.hint, nudge: T.nudge, idle: T.idle };
    for (const line of T.lines) {
      if (skipping) return;
      if (line.show === 'slates') {
        skipBtn(false); COACH.say(line);
        await Minus.show(); await Slates.show(T.choices);
        const right = T.choices.indexOf(T.answer); Slates.state(right, 'glow');
        const h = Slates.handAt(right); Hand.show(h.x, h.y);
        await play(T, L, { teach: true });
        // Guddu: "Umm... it's 1,61,240 to be exact. But your number is so close. Good job!"
        Guddu.pose('surprised'); await COACH.say(T.exact); Guddu.pose('proud'); await wait(.3);
        Guddu.exit();
        // Baba: "Very good. Now the real money: ₹6,00,000. Let's pay!" — the panel refills on "₹6,00,000"
        Baba.enter().then(() => Baba.talk(true));
        const said = COACH.say(T.baba);
        gsap.delayedCall(durOf(T.baba) * .35, async () => { await Panel.wipe(); await Panel.write(D.start, false); Cart.glow(); });
        Bill.away(); Slates.hide(); Minus.hide();
        await said; Baba.talk(false); await wait(.4);
        await Baba.exit();
        return;
      }
      await beat(line, async () => {
        if (line.show === 'bill') {
          Panel.set(T.money, false); glowAlong(line, [[.1, () => Panel.glow()], [.45, () => Bill.glow()]]);
          Bill.show(0, T.bill, { teach: true }); await Bill.drop();
        }
        if (line.show === 'chip') await Bill.chip('blue', D.round(T.bill));
        if (line.show === 'guddu') { await Guddu.enter(); Guddu.pose('scratch'); }   // Guddu tries it the long way…
      });
    }
  }

  /* ---------- one payment ---------- */
  async function stallRound(i) {
    const b = D.bills[i], n = i + 1, L = D.qLines(b, n);
    await Cam.push(CAM(i));                                       // PUSH
    Bill.show(i, b.price); await Bill.drop();                     // DROP — one new thing at a time
    const ask = COACH.say(L.ask);                                 // ASK — the bill glows on its price, the cart panel on the money
    glowAlong(L.ask, [[.12, () => Bill.glow()], [.45, () => { Panel.glow(); Cart.glow(); }]]);
    await wait(.4); await Minus.show(); await Slates.show(b.choices);
    SND.setCurrent(L.ask);
    await play(b, L, { i });
    await ask;
  }

  /* ---------- finale: the whole Mela lights up, the giant wheel spins, fireworks ---------- */
  async function finale() {
    try { playMusic('m_festive', { gain: .8, fade: 2 }); } catch (e) { }
    await Cam.push(D.finaleCam, { dur: 2 });
    Stall.set(7); Wheel.light(); SND.sfx('confetti', .7); SND.sfx('sparkle', .8);
    Fw.show([[390, 180, 300], [880, 130, 240], [1145, 215, 190]], 1.1, 2);
    Aaru.show(1134); Aaru.face(1); Aaru.bounce(true);                    // Aaru jumps for joy by the wheel
    await wait(3.4);
  }

  /* ---------- complete ---------- */
  async function complete() {
    gsap.to('#gHud', { autoAlpha: 0, duration: .3 }); HUD.celebrate();
    const gold = result.stars.filter(s => s === 'gold').length, nStars = gold >= 6 ? 3 : gold >= 4 ? 2 : 1;
    const ov = $('#done3'); ov.classList.remove('hidden');
    const imgs = ov.querySelectorAll('#done3Stars img');
    imgs.forEach((im, i) => { im.src = GA(i < nStars ? 'ui_star_gold.webp' : 'ui_star_silver.webp'); im.style.opacity = i < nStars ? 1 : .35; });
    ov.querySelectorAll('#done3Badges img').forEach((im, i) => im.style.left = (40 + i * 104) + 'px');
    ov.querySelector('.sub').textContent = `7 shopkeepers paid — about ${rs(Panel.v)} is left.`;
    ov.querySelector('#done3Money .v').textContent = '≈ ' + rs(Panel.v);
    SND.sfx('confetti'); confetti(90);
    Fw.show([[280, 220, 280], [1665, 185, 250]], 1.2, 2);
    await gsap.fromTo('#done3Card', { scale: .5, opacity: 0 }, { scale: 1, opacity: 1, duration: .5, ease: 'back.out(1.7)' });
    for (let i = 0; i < 3; i++) { gsap.fromTo(imgs[i], { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: .45, ease: 'back.out(2.5)' }); if (i < nStars) SND.sfx('sparkle'); await wait(.3); }
    gsap.from('#done3Badges img', { y: -60, opacity: 0, duration: .4, stagger: .08, ease: 'back.out(2)' });
    const cta = $('#done3Cta'); cta.classList.add('pulse');
    // moves on by itself once the card has been seen; tapping the button just goes a little sooner (same as L1/L2)
    await Promise.race([wait(3), new Promise(res => cta.addEventListener('pointerdown', e => { e.preventDefault(); SND.sfx('pop'); res(); }, { once: true }))]);
    return { stars: nStars, gold, perShop: result.stars.slice(), left: Panel.v };
  }

  /* ---------- reset + run ---------- */
  function reset() {
    skipping = false; result.stars = [];
    // anything Level 1 / Level 2 left behind
    ['#coach', '#btnSkip', '#gudiya', '#doneOv', '#tagRig', '#numline', '#marker', '#markerGreen', '#titleOv', '#l2'].forEach(s => $(s).classList.add('hidden'));
    ['#btnL', '#btnR'].forEach(s => $(s).className = 'gbtn hidden'); gsap.set(['#cart', '#rule', '#hand', '#bleat'], { opacity: 0 }); $('#gFx').innerHTML = '';
    gsap.set('#gBg', { autoAlpha: 0 });
    // the L3 layer, clean
    $('#l3').classList.remove('hidden'); $('#done3').classList.add('hidden'); $('#done3Cta').classList.remove('pulse');
    gsap.set('#done3Card', { clearProps: 'transform,opacity' }); gsap.set('#gHud', { autoAlpha: 1 });
    Wheel.reset(); Fw.clear(); Stall.set(0); Sun.set(0); Pari.reset(); Waves.off(); Baba.hide(); Guddu.hide(); Aaru.hide();
    $('#bill3').classList.add('hidden'); Slates.S.forEach(s => s.className = 'slate3 hidden'); gsap.set('#minus3', { scale: 0 });
    gsap.set(['#duster3', '#potli3'], { opacity: 0 }); gsap.set('#cart3', { autoAlpha: 1 }); gsap.set('#ground3', { opacity: 0 }); $('#map3').innerHTML = '';
    Panel.set(D.start, false); Cam.set(CAM(0));
  }
  async function run({ startAt = 0, skipIntro = false } = {}) {
    window.L3_ACTIVE = true;
    COACH.voiceOnly = true; COACH.onTalk = (who, on) => on ? Waves.on(who) : Waves.off();
    reset();
    SND.preload(D.allLines().map(l => l.id));
    HUD.setLit(startAt); HUD.lit = startAt;
    if (startAt > 0) { Stall.set(startAt); Sun.set(startAt); Panel.set(D.moneyBefore(startAt), true); Cam.set(CAM(startAt - 1)); }
    // decode the big pictures while the banner shows (the lit lane is 5760 px: decoding it on the first payment froze ~0.8 s)
    const warmed = new Promise(r => gsap.delayedCall(.7, () => warm(['l3/mela_lane_dark.webp', 'l3/mela_lane_lit.webp', 'l3/wheel_rotor.webp', 'l3/wheel_stand.webp', 'l3/firework_sheet.webp', 'l3/pari_push_sheet.webp', 'l3/light_burst.webp', 'l3/coin.webp', 'l3/potli.webp'].map(GA)).then(r)));   // after the banner has popped in
    await banner(); await warmed;
    HUD.show();
    gsap.set(['#gChip', '#sunPanel', '#glowSun'], { autoAlpha: 0 }); gsap.set('#mariPlate', { autoAlpha: 1 }); gsap.set('#btnSpeaker', { top: 34 });   // L3 HUD: 🔊 + marigolds only
    if (!skipIntro) {
      skipBtn(true);
      await howto(); await teach();
      skipBtn(false); Hand.hide(); Slates.disable();
      if (skipping) {   // Skip: tidy the intro away and start at payment 1
        Map.off(true); Baba.hide(); Guddu.hide(); Waves.off(); Slates.hide(); Minus.hide(); $('#bill3').classList.add('hidden');
        Panel.set(D.start, false); gsap.set('#cart3', { autoAlpha: 1 });
      }
    }
    // Figma 08: Q1 starts with the cart rolling up to stall 1 (lane 980 → 830): ease back a little after the teach, then push
    if (startAt === 0) { if (Math.abs(Cam.x - CAM(0)) < 1) await Cam.push(CAM(0) - 150, { dur: .6, ease: 'sine.inOut' }); else Cam.set(CAM(0) - 150); }
    for (let i = startAt; i < 7; i++) await stallRound(i);
    await finale();
    const res = await complete();
    window.L3_ACTIVE = false; COACH.voiceOnly = false; COACH.onTalk = null; Waves.off();
    gsap.set(['#gChip', '#sunPanel', '#glowSun', '#gHud'], { autoAlpha: 1 }); gsap.set('#btnSpeaker', { top: 34 });
    return res;
  }
  window.LEVEL3_RUN = run;
})();

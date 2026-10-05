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
    return `<svg viewBox="0 0 64 64"><g class="off">${off}<circle cx="32" cy="32" r="9" fill="#efe2c4" stroke="#cdb994" stroke-width="1.6"/></g>
      <g class="on">${on}${onIn}<circle cx="32" cy="32" r="8" fill="#c8550a"/><circle cx="29.5" cy="29.5" r="2.6" fill="#ffd27a" opacity=".8"/></g></svg>`;
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
    <g id="sun"><circle r="30" fill="#ffd54a" opacity=".35"/>${Array.from({ length: 10 }, (_, i) => `<rect x="-2.5" y="-31" width="5" height="10" rx="2.5" fill="#f7a823" transform="rotate(${i * 36})"/>`).join('')}<circle r="19" fill="#ffc21f" stroke="#e8870e" stroke-width="3"/></g>
  </svg>`;
  const sun = $('#sun');
  const sunState = { p: 0 };
  const placeSun = () => { const p = sunState.p; sun.setAttribute('transform', `translate(${150 - 130 * Math.cos(Math.PI * p)} ${132 - 130 * Math.sin(Math.PI * p)})`); };

  const HUD = {
    show() { const h = $('#hud'); h.classList.remove('hidden'); gsap.fromTo(h, { y: -220 }, { y: 0, duration: .6, ease: 'back.out(1.4)' }); },
    chip(t) { $('#chip').textContent = t; },
    setLit(n) { maris.forEach((m, i) => m.classList.toggle('lit', i < n)); },
    lit: 0,
    async lightNext(fromX, fromY) {
      const i = HUD.lit; if (i >= 7) return; HUD.lit++;
      const c = mariCentre(i);
      await ST.flyImg('data:image/svg+xml;utf8,' + encodeURIComponent(marigoldSVG().replace('class="off"', 'opacity="0"')), fromX, fromY, c.x, c.y, { size: 90, endSize: 64, lift: 160, dur: .7 });
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
    pari:  { name: 'Pari',        img: 'assets/img/pari_happy.webp',  x: -84, y: 4,  h: 520, colour: '#2f62c9' },
    manju: { name: 'Manju Mausi', img: 'assets/img/manju_teach.webp', x: -88, y: 2,  h: 520, colour: '#8a3fb5' },
    aaru:  { name: 'Aaru',        img: 'assets/img/aaru_jump.webp',   x: -70, y: 18, h: 470, colour: '#c0392b' }
  };
  let who = null, talk = null;
  const Coach = {
    show() { const c = $('#coach'); if (!c.classList.contains('hidden')) return; c.classList.remove('hidden'); gsap.fromTo('#avatar', { scale: 0 }, { scale: 1, duration: .45, ease: 'back.out(2)' }); },
    hideBubble() { gsap.to('#bubble', { scale: 0, opacity: 0, duration: .2 }); },
    /* Show a line, play its VO (or wait a reading time). Resolves when the line is done. */
    /* Swap the bubble text for a longer version of the same line (no new VO) */
    update(line) { $('#bubbleText').innerHTML = line.text.replace(/(₹[\d,]+)/g, '<b>$1</b>'); SND.setCurrent(line); gsap.fromTo('#bubbleText', { opacity: .3 }, { opacity: 1, duration: .3 }); gsap.fromTo('#bubble', { scale: 1.03 }, { scale: 1, duration: .25 }); },
    more(on) { gsap.killTweensOf('#bubbleMore'); const m = $('#bubbleMore'); if (on) { gsap.set(m, { opacity: 0 }); gsap.to(m, { opacity: 1, delay: 1.2, duration: .3 }); gsap.fromTo(m, { x: 0 }, { x: 8, duration: .45, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1.2 }); } else gsap.set(m, { opacity: 0 }); },
    say(line, { append, more } = {}) {
      Coach.show(); Coach.more(!!more);
      const w = WHO[line.who] || WHO.pari;
      if (who !== line.who) {
        who = line.who;
        const im = $('#avatar img'); im.src = w.img; im.style.height = w.h + 'px'; im.style.left = w.x + 'px'; im.style.top = w.y + 'px';
        gsap.fromTo('#avatar', { rotation: -8, scale: .85 }, { rotation: 0, scale: 1, duration: .45, ease: 'back.out(2.5)' });
      }
      $('#bubbleName').textContent = w.name; $('#bubbleName').style.background = w.colour;
      $('#bubbleText').innerHTML = line.text.replace(/(₹[\d,]+)/g, '<b>$1</b>');
      const b = $('#bubble');
      if (append) gsap.fromTo('#bubbleText', { opacity: .3 }, { opacity: 1, duration: .3 });
      else { SND.sfx('bubble'); gsap.fromTo(b, { scale: .6, opacity: 0 }, { scale: 1, opacity: 1, duration: .38, ease: 'back.out(2)' }); }
      SND.setCurrent(line);
      if (talk) talk.kill();
      talk = gsap.to('#avatar img', { y: -6, duration: .18, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      return SND.vo(line.vo, readTime(line.text)).then(() => { if (talk) { talk.kill(); talk = null; gsap.to('#avatar img', { y: 0, duration: .15 }); } });
    }
  };

  window.HUD = HUD; window.COACH = Coach;
})();

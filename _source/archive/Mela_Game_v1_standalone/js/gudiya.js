/* Gudiya the goat — sprite-ready actor.
   Position is her FEET (x, y) on the 1920×1080 stage. `h` is her standing height in px.

   ▸ Adding the hop sprite later: give the pose a `sheet` instead of `src`, e.g.
       GUDIYA_POSES.hop = { sheet:'assets/img/gudiya_hop_sheet.png', cols:4, rows:2, frames:8, fps:14,
                            aspect: frameW/frameH, cx:.5, foot:.95, face:'left', scale:1, once:true };
     `once:true` plays the sheet once per hop (take-off → land), otherwise it loops.
     A list of separate images works too: `frames:['a.png','b.png',…]` (that is how `trot` works now). */
window.GUDIYA_POSES = {
  idle: { src: 'assets/img/gudiya_idle.webp', aspect: 507 / 640, cx: .513, foot: .987, face: 'left', scale: 1 },
  hop:  { src: 'assets/img/gudiya_hop.webp',  aspect: 732 / 640, cx: .534, foot: .90,  face: 'left', scale: 1 },
  trot: { frames: [0, 1, 2, 3].map(i => `assets/img/gudiya_trot_${i}.webp`), fps: 10, aspect: 867 / 640, cx: .42, foot: 1, face: 'right', scale: .74 }
};

(function () {
  const { $, dust } = ST;
  const root = $('#gudiya'), body = root.querySelector('.body'), flip = root.querySelector('.flip');
  const st = { x: 1820, y: 1036, h: 205, pose: null, faceRight: false };
  let anim = null, breathe = null;

  // preload every pose image so swaps never flash
  Object.values(GUDIYA_POSES).forEach(p => [].concat(p.src || p.sheet || p.frames || []).forEach(s => { const i = new Image(); i.src = s; }));

  function layout() {
    const p = GUDIYA_POSES[st.pose]; const H = st.h * p.scale; const W = H * p.aspect;
    body.style.width = W + 'px'; body.style.height = H + 'px';
    body.style.left = (-W * p.cx) + 'px'; body.style.top = (-H * p.foot) + 'px';
    flip.style.transform = ((p.face === 'right') !== st.faceRight) ? 'scaleX(-1)' : '';
    root.style.transform = `translate(${st.x}px,${st.y}px)`;
  }
  function setPose(name) {
    if (anim) { anim.kill(); anim = null; }
    st.pose = name; const p = GUDIYA_POSES[name];
    flip.innerHTML = '';
    if (p.src) { const im = new Image(); im.src = p.src; flip.appendChild(im); }
    else if (p.frames) {
      const im = new Image(); im.src = p.frames[0]; flip.appendChild(im); const o = { f: 0 };
      anim = gsap.to(o, { f: p.frames.length, duration: p.frames.length / p.fps, ease: 'none', repeat: -1, onUpdate() { im.src = p.frames[Math.floor(o.f) % p.frames.length]; } });
    } else if (p.sheet) {
      const d = document.createElement('div'); d.className = 'sheet';
      d.style.backgroundImage = `url(${p.sheet})`; d.style.backgroundSize = `${p.cols * 100}% ${p.rows * 100}%`; flip.appendChild(d);
      const o = { f: 0 }, show = f => { const c = f % p.cols, r = Math.floor(f / p.cols); d.style.backgroundPosition = `${p.cols > 1 ? c / (p.cols - 1) * 100 : 0}% ${p.rows > 1 ? r / (p.rows - 1) * 100 : 0}%`; };
      show(0);
      anim = gsap.to(o, { f: p.frames - .001, duration: p.frames / p.fps, ease: 'none', repeat: p.once ? 0 : -1, onUpdate() { show(Math.floor(o.f)); } });
    }
    layout();
  }
  function idleBreath(on) {
    if (breathe) { breathe.kill(); breathe = null; gsap.set(body, { scaleY: 1, scaleX: 1 }); }
    if (on) breathe = gsap.to(body, { scaleY: 1.025, duration: 1.1, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  }
  function land(x, y) {
    dust(x, y); SND.sfx('tick', .3);
    return gsap.fromTo(body, { scaleY: .82, scaleX: 1.12 }, { scaleY: 1, scaleX: 1, duration: .28, ease: 'back.out(3)' });
  }
  // one arc from current spot to (x,y)
  function arc(x, y, { lift = 60, dur = .32, h } = {}) {
    const x0 = st.x, y0 = st.y, h0 = st.h, h1 = h ?? st.h; const o = { t: 0 };
    return new Promise(res => gsap.to(o, {
      t: 1, duration: dur, ease: 'none',
      onUpdate() { const t = o.t; st.x = x0 + (x - x0) * t; st.y = y0 + (y - y0) * t - lift * Math.sin(Math.PI * t); st.h = h0 + (h1 - h0) * t; layout(); },
      onComplete: res
    }));
  }

  const G = {
    state: st,
    show(x = 1820, y = 1036, h = 205) { Object.assign(st, { x, y, h, faceRight: false }); root.classList.remove('hidden'); setPose('idle'); idleBreath(true); gsap.fromTo(root, { opacity: 0 }, { opacity: 1, duration: .3 }); },
    hide() { idleBreath(false); return gsap.to(root, { opacity: 0, duration: .3, onComplete: () => root.classList.add('hidden') }); },
    face(right) { st.faceRight = right; layout(); },
    /* Trot in from off-screen right to her corner */
    async enter(x = 1820, y = 1036, h = 205) {
      root.classList.remove('hidden'); gsap.set(root, { opacity: 1 });
      Object.assign(st, { x: 2080, y, h, faceRight: false }); setPose('trot'); idleBreath(false);
      await new Promise(r => gsap.to(st, { x, duration: .8, ease: 'power1.out', onUpdate: layout, onComplete: r }));
      setPose('idle'); idleBreath(true); land(x, y);
    },
    /* Big leap (e.g. corner → onto the number line) */
    async leapTo(x, y, h) {
      idleBreath(false); G.face(x > st.x); setPose('hop'); SND.sfx('swish');
      await arc(x, y, { lift: 260, dur: .62, h });
      setPose('idle'); G.face(false); await land(x, y);
    },
    /* Small hops along the line, landing exactly on (x, y) */
    async hopTo(x, y, hops = 3) {
      idleBreath(false); const x0 = st.x; G.face(x > x0);
      for (let i = 1; i <= hops; i++) {
        setPose('hop');
        await arc(x0 + (x - x0) * i / hops, y, { lift: 54, dur: .3 });
        setPose('idle'); G.face(x > x0); land(st.x, st.y);
        await new Promise(r => gsap.delayedCall(.07, r));
      }
      G.face(false); idleBreath(true);
    },
    /* Trot back (used between questions) */
    async trotTo(x, y, h) {
      idleBreath(false); setPose('trot'); G.face(x > st.x);
      const d = Math.abs(x - st.x);
      await new Promise(r => gsap.to(st, { x, y, h: h ?? st.h, duration: Math.max(.5, d / 1400), ease: 'power1.inOut', onUpdate: layout, onComplete: r }));
      setPose('idle'); G.face(false); idleBreath(true);
    },
    /* Wrong answer: hop on the spot + "Meh-eh!" */
    async bleat() {
      idleBreath(false); setPose('hop'); SND.sfx('goat');
      const b = $('#bleat'); b.style.left = (st.x - 170) + 'px'; b.style.top = (st.y - st.h - 150) + 'px';
      gsap.fromTo(b, { scale: .3, opacity: 0 }, { scale: 1, opacity: 1, duration: .3, ease: 'back.out(2.5)' });
      gsap.to(b, { opacity: 0, scale: .8, duration: .25, delay: 1.5 });
      await arc(st.x, st.y, { lift: 70, dur: .38 });
      setPose('idle'); land(st.x, st.y); idleBreath(true);
    },
    /* Happy double-bounce */
    async cheer() {
      idleBreath(false); setPose('hop');
      await arc(st.x, st.y, { lift: 46, dur: .26 }); land(st.x, st.y);
      await arc(st.x, st.y, { lift: 30, dur: .22 });
      setPose('idle'); land(st.x, st.y); idleBreath(true);
    }
  };
  window.GUDIYA = G;
})();

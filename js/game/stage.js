/* Game helpers: number-line geometry, particles. The game lives in <div id="game"> inside the story stage
   (the story already scales the 1920×1080 stage, so nothing is scaled here). */
(function () {
  const $ = s => document.querySelector(s);
  const stage = $('#game');

  // Indian grouping: 124317 → 1,24,317
  const fmt = n => {
    const s = String(Math.round(n)); if (s.length <= 3) return s;
    let head = s.slice(0, -3); const tail = s.slice(-3); const parts = [];
    while (head.length > 2) { parts.unshift(head.slice(-2)); head = head.slice(0, -2); }
    if (head) parts.unshift(head);
    return parts.join(',') + ',' + tail;
  };
  const rs = n => '₹' + fmt(n);

  // Number line (same numbers as the Figma "L1 · Clean build" frames)
  const NL = { x0: 470, x1: 1450,   // narrowed (was 327–1593) so Pari / Gudiya fit at the edges
                top: 765.5, bot: 819.5, mid: 960 };
  const vx = (lo, hi, v) => NL.x0 + (v - lo) / (hi - lo) * (NL.x1 - NL.x0);

  const wait = s => new Promise(r => gsap.delayedCall(s, r));
  const readTime = t => Math.min(6.5, Math.max(2.0, 1.2 + t.split(/\s+/).length * 0.33));

  // ---------- particles ----------
  const fx = $('#gFx');
  function sparks(x, y, n = 14, spread = 120, colors) {
    for (let i = 0; i < n; i++) {
      const d = document.createElement('div'); d.className = 'spark'; fx.appendChild(d);
      const a = Math.random() * Math.PI * 2, r = spread * (.45 + Math.random() * .55);
      if (colors) d.style.background = colors[i % colors.length];
      gsap.fromTo(d, { x: x - 9, y: y - 9, scale: .4 + Math.random() * .8, opacity: 1 },
        { x: x - 9 + Math.cos(a) * r, y: y - 9 + Math.sin(a) * r, opacity: 0, scale: .2, duration: .55 + Math.random() * .35, ease: 'power2.out', onComplete: () => d.remove() });
    }
  }
  function dust(x, y) {
    for (let i = 0; i < 2; i++) {
      const d = document.createElement('div'); d.className = 'gdust'; fx.appendChild(d);
      const dir = i ? 1 : -1;
      gsap.fromTo(d, { x: x - 20, y: y - 14, scale: .5, opacity: .9 }, { x: x - 20 + dir * 46, y: y - 22, scale: 1.4, opacity: 0, duration: .45, ease: 'power2.out', onComplete: () => d.remove() });
    }
  }
  function confetti(n = 80) {
    const cols = ['#e8870e', '#f7b733', '#b5361d', '#3fa34d', '#2f62c9', '#e85d9b'];
    for (let i = 0; i < n; i++) {
      const d = document.createElement('div'); d.className = 'confetti'; d.style.background = cols[i % cols.length]; fx.appendChild(d);
      const x = 300 + Math.random() * 1320;
      gsap.fromTo(d, { x, y: -40, rotation: Math.random() * 360 },
        { x: x + (Math.random() - .5) * 400, y: 1120, rotation: '+=' + (360 + Math.random() * 540), duration: 2.2 + Math.random() * 1.6, delay: Math.random() * .6, ease: 'power1.in', onComplete: () => d.remove() });
    }
  }
  // Fly a copy of an image along an arc from (x0,y0) to (x1,y1). Returns a promise.
  function flyImg(src, x0, y0, x1, y1, { size = 110, endSize = 70, lift = 220, dur = .75, trail = false } = {}) {
    return new Promise(res => {
      const im = document.createElement('img'); im.src = src; im.className = 'flyer'; im.style.width = im.style.height = size + 'px'; im.style.left = '0px'; im.style.top = '0px'; im.style.transform = `translate(${x0 - size / 2}px,${y0 - size / 2}px)`; fx.appendChild(im);
      const o = { t: 0 }; let k = 0;
      gsap.to(o, {
        t: 1, duration: dur, ease: 'power1.inOut',
        onUpdate() {
          const t = o.t, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t - lift * Math.sin(Math.PI * t), s = size + (endSize - size) * t;
          im.style.width = im.style.height = s + 'px'; im.style.transform = `translate(${x - s / 2}px,${y - s / 2}px) rotate(${t * 20}deg)`;
          if (trail && window.GFX && k++ % 2 === 1) GFX.petal(x, y);   // petals fall off behind a flying marigold
        },
        onComplete() { im.remove(); res(); }
      });
    });
  }
  function toast(msg) { const t = $('#gToast'); t.textContent = msg; gsap.fromTo(t, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: .3 }); gsap.to(t, { opacity: 0, delay: 2.4, duration: .4 }); }

  window.ST = { $, stage, fmt, rs, NL, vx, wait, readTime, sparks, dust, confetti, flyImg, toast };
})();

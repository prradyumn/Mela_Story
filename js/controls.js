/* js/controls.js — Back + Pause buttons (top-left of the stage, story and games alike). Loaded right after the
   stage markup, before the engine, so its pausable setTimeout is in place for every wait() / timer that follows.
   · Pause ⏸: freezes everything where it is — GSAP (all tweens/timelines), Web/CSS animations, the particle canvas
     (engine fxLoop checks GAME_PAUSED), mouths (EDIT_PAUSED), all audio (AudioContext suspended) and every pending
     setTimeout (their remaining time is kept). A "Paused" screen with a big ▶ resumes; P / Space toggle it.
     It also pauses by itself when the tab is hidden or the device is turned to portrait.
   · Back ◀: one step back. In a game level it restarts the previous question (?shop / ?bill = N; HUD.lit = how many
     are solved), from its first question it goes to the screen before the level; in the story it goes to the
     previous screen. It reloads at that point (?from=…, keeps ?speed / ?qa) — the cover then says "Continue ▶"
     because audio needs a fresh tap after a reload. */
(() => {
  // ---------- pausable setTimeout ----------
  const _st = window.setTimeout.bind(window), _ct = window.clearTimeout.bind(window), T = new Map();
  let nid = 1e6, PAUSED = false;
  function arm(id, t) { t.due = performance.now() + t.rem; t.real = _st(() => { T.delete(id); typeof t.fn === 'function' ? t.fn(...t.a) : (0, eval)(t.fn); }, t.rem); }
  window.setTimeout = function (fn, d, ...a) { const id = nid++, t = { fn, a, rem: Math.max(0, +d || 0) }; T.set(id, t); if (!PAUSED) arm(id, t); return id; };
  window.clearTimeout = id => { const t = T.get(id); if (t) { _ct(t.real); T.delete(id); } else _ct(id); };

  const stage = document.getElementById('stage');
  const css = document.createElement('style');
  css.textContent = `
  #ctl{position:absolute;left:40px;top:34px;z-index:76;display:none;gap:16px}
  #ctl.on{display:flex}
  #ctl .cb{width:96px;height:96px;border-radius:50%;background:#fffaf0;border:4px solid #7a4a1f;box-shadow:0 6px 0 rgba(58,34,15,.25);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .08s}
  #ctl .cb:active{transform:translateY(4px);box-shadow:0 2px 0 rgba(58,34,15,.25)}
  #ctl .cb svg{width:50px;height:50px}
  #pauseOv{position:absolute;inset:0;z-index:75;display:none;flex-direction:column;align-items:center;justify-content:center;gap:34px;background:rgba(29,18,8,.62);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);cursor:pointer}
  #pauseOv.on{display:flex}
  #pauseOv h2{font:800 96px/1 Baloo,Fredoka,sans-serif;color:#fff3d6;text-shadow:0 6px 0 rgba(0,0,0,.35);letter-spacing:2px}
  #pauseOv .play{width:220px;height:220px;border-radius:50%;background:linear-gradient(#ffcf5a,#e8870e);border:8px solid #fff3d6;box-shadow:0 12px 0 rgba(0,0,0,.3),0 0 60px rgba(255,190,80,.55);display:flex;align-items:center;justify-content:center;animation:pz 1.4s ease-in-out infinite}
  #pauseOv .play svg{width:110px;height:110px;margin-left:16px}
  #pauseOv p{font:600 34px Poppins,sans-serif;color:#f3d9b0}
  @keyframes pz{50%{transform:scale(1.06)}}
  body.gpaused #stage *:not(#pauseOv):not(#pauseOv *){animation-play-state:paused!important}
  /* make room: the game's 🔊 + Skip and the story chip move right of Back + Pause */
  #game #btnSpeaker{left:264px!important} #game #btnSkip{left:384px} #stage > #hud .chip{left:264px}`;
  document.head.appendChild(css);

  const ICON = {
    back: '<svg viewBox="0 0 24 24"><path d="M14.5 5 7.5 12l7 7" fill="none" stroke="#3a220f" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4.2" height="14" rx="1.3" fill="#3a220f"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.3" fill="#3a220f"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M6 4.5v15l13-7.5z" fill="#fffaf0" stroke="#fffaf0" stroke-width="1.5" stroke-linejoin="round"/></svg>'
  };
  const ctl = document.createElement('div'); ctl.id = 'ctl';
  ctl.innerHTML = `<div class="cb" id="btnBack" title="Back">${ICON.back}</div><div class="cb" id="btnPause" title="Pause">${ICON.pause}</div>`;
  const ov = document.createElement('div'); ov.id = 'pauseOv';
  ov.innerHTML = `<h2>Paused</h2><div class="play">${ICON.play}</div><p>Tap to continue</p>`;
  stage.appendChild(ov); stage.appendChild(ctl);
  const ac = () => (typeof AC !== 'undefined' ? AC : null);
  const anims = [];

  function setPause(p) {
    if (p === PAUSED || !ctl.classList.contains('on')) return;
    PAUSED = p; window.GAME_PAUSED = p; window.EDIT_PAUSED = p;   // EDIT_PAUSED: the engine keeps audio locked + mouths still
    document.body.classList.toggle('gpaused', p); ov.classList.toggle('on', p);
    const a = ac();
    if (p) {
      const now = performance.now(); T.forEach(t => { _ct(t.real); t.rem = Math.max(0, t.due - now); });
      gsap.globalTimeline.pause(); a && a.suspend();
      document.getAnimations().forEach(x => { if (x.playState === 'running' && !ov.contains(x.effect && x.effect.target)) { x.pause(); anims.push(x); } });
    } else {
      gsap.globalTimeline.resume(); a && a.resume();
      anims.splice(0).forEach(x => { try { x.play(); } catch (e) { } });
      T.forEach((t, id) => arm(id, t));
    }
  }
  window.setGamePause = setPause;
  const tap = (el, fn) => el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); fn(); });
  tap(ctl.querySelector('#btnPause'), () => setPause(true));
  tap(ov, () => setPause(false));
  addEventListener('keydown', e => {
    if (document.body.classList.contains('editing') || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (e.key === 'p' || e.key === 'P' || (e.key === ' ' && ctl.classList.contains('on'))) { e.preventDefault(); setPause(!PAUSED); }
    else if (e.key === 'Escape' && PAUSED) setPause(false);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) setPause(true); });
  const port = matchMedia('(orientation: portrait) and (pointer: coarse)');
  (port.addEventListener ? port.addEventListener('change', e => e.matches && setPause(true)) : port.addListener(e => e.matches && setPause(true)));

  // ---------- back ----------
  function back() {
    const F = window.FLOW || [], cur = window.CUR_SCREEN || 'title', i = Math.max(0, F.findIndex(f => f[0] === cur));
    const q = new URLSearchParams(), old = new URLSearchParams(location.search);
    ['speed', 'qa'].forEach(k => old.has(k) && q.set(k, old.get(k)));
    const m = /^level(\d)$/.exec(cur), solved = m && typeof HUD !== 'undefined' ? Math.min(7, HUD.lit | 0) : 0;
    if (m && solved > 0) { q.set('from', cur); q.set(m[1] === '1' ? 'shop' : 'bill', solved); }   // previous question (1-based = solved)
    else q.set('from', F[Math.max(0, i - 1)] ? F[Math.max(0, i - 1)][0] : 'title');
    try { setPause(false); } catch (e) { }
    gsap.to('#fade', { opacity: 1, duration: .25, onComplete: () => { location.search = '?' + q.toString(); } });
  }
  tap(ctl.querySelector('#btnBack'), back);

  // show the buttons once the cover has gone (Start / Continue tapped); "Continue ▶" after a Back reload
  if (new URLSearchParams(location.search).has('from')) document.addEventListener('DOMContentLoaded', () => {
    const lp = document.getElementById('lp'); new MutationObserver(() => { if (lp.classList.contains('ready') && lp.textContent !== 'Continue ▶') lp.textContent = 'Continue ▶'; }).observe(lp, { childList: true, attributes: true });
  });
  const watch = setInterval(() => { if (!document.getElementById('loader')) { ctl.classList.add('on'); gsap.fromTo(ctl, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: .4, ease: 'back.out(2)' }); clearInterval(watch); } }, 300);
})();

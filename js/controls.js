/* js/controls.js — ONE pause button (bottom-right corner, story and games alike) that opens a small menu (QA Oct 2026:
   Back + Pause + 🔊 were three separate buttons). Loaded right after the stage markup, before the engine, so its pausable
   setTimeout is in place for every wait() / timer that follows.
   · Pause ⏸: freezes everything where it is — GSAP (all tweens/timelines), Web/CSS animations, the particle canvas
     (engine fxLoop checks GAME_PAUSED), mouths (EDIT_PAUSED), all audio (AudioContext suspended) and every pending
     setTimeout (their remaining time is kept). P / Space toggle it; it also pauses by itself when the tab is hidden or the
     device is turned to portrait. The menu: ▶ Resume (big) · ↺ Back · 🔊 Hear again (game levels: replays the last line,
     it replaces the game's old 🔊 button) · Sound on/off (master gain, remembered in this browser).
   · Back: one step back. In a game level it restarts the previous question (?shop / ?bill = N; HUD.lit = how many are
     solved), from its first question it goes to the screen before the level; in the story it goes to the previous
     screen. It reloads at that point (?from=…, keeps ?speed / ?qa) — the cover then says "Continue ▶".
   · Phones: --tap scales the pause button and the Skip buttons up to a ≥ 48 CSS px target, --txt enlarges the few
     small labels (bill subtitle, ABOUT tags, "bills left", money-left line, halfway label) when the stage is shrunk. */
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
  #ctl{position:absolute;right:18px;bottom:18px;z-index:76;display:none;scale:var(--tap,1);transform-origin:100% 100%}
  #ctl.on{display:flex}
  #ctl .cb{width:72px;height:72px;opacity:.9;border-radius:50%;background:#fffaf0;border:4px solid #7a4a1f;box-shadow:0 6px 0 rgba(58,34,15,.25);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .08s;position:relative}
  #ctl .cb:active{transform:translateY(4px);box-shadow:0 2px 0 rgba(58,34,15,.25)}
  #ctl .cb svg{width:38px;height:38px}
  #ctl .cb .mute{position:absolute;right:-6px;top:-6px;width:30px;height:30px;border-radius:50%;background:#b5361d;border:3px solid #fffaf0;display:none;align-items:center;justify-content:center}
  #ctl .cb .mute svg{width:18px;height:18px}
  body.gmuted #ctl .cb .mute{display:flex}
  #pauseOv{position:absolute;inset:0;z-index:75;display:none;flex-direction:column;align-items:center;justify-content:center;gap:30px;background:rgba(29,18,8,.66);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}
  #pauseOv.on{display:flex}
  #pauseOv h2{font:800 96px/1 Baloo,Fredoka,sans-serif;color:#fff3d6;text-shadow:0 6px 0 rgba(0,0,0,.35);letter-spacing:2px}
  #pauseOv .play{width:220px;height:220px;border-radius:50%;background:linear-gradient(#ffcf5a,#e8870e);border:8px solid #fff3d6;box-shadow:0 12px 0 rgba(0,0,0,.3),0 0 60px rgba(255,190,80,.55);display:flex;align-items:center;justify-content:center;animation:pz 1.4s ease-in-out infinite;cursor:pointer}
  #pauseOv .play svg{width:110px;height:110px;margin-left:16px}
  #pauseOv .row{display:flex;gap:28px;margin-top:14px}
  #pauseOv .mb{display:flex;align-items:center;gap:16px;height:120px;padding:0 40px 0 30px;border-radius:60px;background:#fffaf0;border:5px solid #7a4a1f;box-shadow:0 8px 0 rgba(0,0,0,.3);font:800 44px/1 Baloo,Fredoka,sans-serif;color:#3a220f;cursor:pointer}
  #pauseOv .mb:active{transform:translateY(5px);box-shadow:0 3px 0 rgba(0,0,0,.3)}
  #pauseOv .mb svg{width:56px;height:56px}
  #pauseOv .mb.hide{display:none}
  @keyframes pz{50%{transform:scale(1.06)}}
  body.gpaused #stage *:not(#pauseOv):not(#pauseOv *){animation-play-state:paused!important}
  /* the old 🔊 button is in the pause menu now ("Hear again") */
  #game #btnSpeaker{display:none!important}
  /* Skip lives top-right everywhere (story: under the sunset tracker; games: in the corner) */
  #game #btnSkip{left:auto!important;right:34px;top:44px}
  #skip,#game #btnSkip{scale:var(--tap,1);transform-origin:100% 0}
  /* phones: the few small labels grow when the stage is shrunk (--txt = 1 on desktop) */
  #game #pileLeft{font-size:calc(24px * var(--txt,1))!important}
  #game #bill2 .b-sub{font-size:calc(20px * var(--txt,1))!important;white-space:nowrap}
  #game .stamp2 .about{font-size:calc(22px * var(--txt,1))!important}
  #game .slate3 .about{font-size:calc(19px * var(--txt,1))!important}
  #game #bill3 .try{font-size:calc(16px * var(--txt,1))!important}
  #game #done3Money .lab{font-size:calc(20px * var(--txt,1))!important}
  #game #done3Money .ex{font-size:calc(22px * var(--txt,1))!important}`;
  document.head.appendChild(css);

  const SVG = (p, c = '#3a220f') => `<svg viewBox="0 0 24 24">${p.replace(/C/g, c)}</svg>`;
  const ICON = {
    pause: SVG('<rect x="6" y="5" width="4.2" height="14" rx="1.3" fill="C"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.3" fill="C"/>'),
    play: SVG('<path d="M6 4.5v15l13-7.5z" fill="C" stroke="C" stroke-width="1.5" stroke-linejoin="round"/>', '#fffaf0'),
    back: SVG('<path d="M9 7 4.5 11.5 9 16" fill="none" stroke="C" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 11.5h9.5a5 5 0 0 1 0 10H11" fill="none" stroke="C" stroke-width="2.6" stroke-linecap="round"/>'),
    hear: SVG('<path d="M4 9h4l5-4v14l-5-4H4z" fill="C"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="C" stroke-width="2" stroke-linecap="round"/>'),
    on: SVG('<path d="M4 9h4l5-4v14l-5-4H4z" fill="C"/><path d="M16 8.5a5 5 0 0 1 0 7" fill="none" stroke="C" stroke-width="2" stroke-linecap="round"/>'),
    off: SVG('<path d="M4 9h4l5-4v14l-5-4H4z" fill="C"/><path d="M16 9l5 6M21 9l-5 6" fill="none" stroke="C" stroke-width="2.2" stroke-linecap="round"/>'),
    x: SVG('<path d="M5 5l14 14M19 5 5 19" stroke="C" stroke-width="3.4" stroke-linecap="round"/>', '#fff')
  };
  const ctl = document.createElement('div'); ctl.id = 'ctl';
  ctl.innerHTML = `<div class="cb" id="btnPause" title="Pause (P)">${ICON.pause}<i class="mute">${ICON.x}</i></div>`;
  const ov = document.createElement('div'); ov.id = 'pauseOv';
  ov.innerHTML = `<h2>Paused</h2><div class="play" id="pmPlay" title="Resume">${ICON.play}</div>
    <div class="row"><div class="mb" id="pmBack">${ICON.back}Back</div><div class="mb" id="pmHear">${ICON.hear}Hear again</div><div class="mb" id="pmSound"></div></div>`;
  stage.appendChild(ov); stage.appendChild(ctl);
  const ac = () => (typeof AC !== 'undefined' ? AC : null);
  const anims = [];

  // ---------- sound on / off (master gain; remembered in this browser) ----------
  let MUTED = false; try { MUTED = localStorage.getItem('mela_mute') === '1'; } catch (e) { }
  const applyMute = () => {
    document.body.classList.toggle('gmuted', MUTED);
    ov.querySelector('#pmSound').innerHTML = MUTED ? `${ICON.off}Sound off` : `${ICON.on}Sound on`;
    try { if (typeof master !== 'undefined' && master) master.gain.value = MUTED ? 0 : 1; } catch (e) { }
  };
  applyMute(); const mw = setInterval(() => { if (typeof master !== 'undefined' && master) { applyMute(); clearInterval(mw); } }, 400);

  function setPause(p) {
    if (p === PAUSED || !ctl.classList.contains('on')) return;
    PAUSED = p; window.GAME_PAUSED = p; window.EDIT_PAUSED = p;   // EDIT_PAUSED: the engine keeps audio locked + mouths still
    document.body.classList.toggle('gpaused', p); ov.classList.toggle('on', p);
    ov.querySelector('#pmHear').classList.toggle('hide', !(/^level/.test(window.CUR_SCREEN || '') && typeof SND !== 'undefined' && SND.replay));
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
  tap(ov, () => { });   // taps on the dim background do nothing (the menu needs a choice)
  tap(ov.querySelector('#pmPlay'), () => setPause(false));
  tap(ov.querySelector('#pmHear'), () => { setPause(false); setTimeout(() => { try { SND.replay(); } catch (e) { } }, 150); });
  tap(ov.querySelector('#pmSound'), () => { MUTED = !MUTED; try { localStorage.setItem('mela_mute', MUTED ? '1' : '0'); } catch (e) { } applyMute(); });
  addEventListener('keydown', e => {
    if (document.body.classList.contains('editing') || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (e.key === 'p' || e.key === 'P' || (e.key === ' ' && ctl.classList.contains('on'))) { e.preventDefault(); setPause(!PAUSED); }
    else if (e.key === 'Escape' && PAUSED) setPause(false);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) setPause(true); });
  const port = matchMedia('(orientation: portrait) and (pointer: coarse)');
  (port.addEventListener ? port.addEventListener('change', e => e.matches && setPause(true)) : port.addListener(e => e.matches && setPause(true)));

  // ---------- phones: bigger tap targets + readable small labels when the 1920×1080 stage is shrunk ----------
  function sizeUI() {
    const s = stage.getBoundingClientRect().width / 1920 || 1;
    stage.style.setProperty('--tap', Math.min(2.2, Math.max(1, 48 / (72 * s))).toFixed(3));   // pause button ≥ 48 CSS px
    stage.style.setProperty('--txt', Math.min(1.5, Math.max(1, .5 / s)).toFixed(3));
  }
  const reSize = () => requestAnimationFrame(sizeUI);
  addEventListener('resize', reSize); addEventListener('orientationchange', () => setTimeout(sizeUI, 400));
  document.addEventListener('fullscreenchange', () => setTimeout(sizeUI, 150)); if (window.visualViewport) visualViewport.addEventListener('resize', reSize);
  reSize();

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
  tap(ov.querySelector('#pmBack'), back);

  // show the buttons once the cover has gone (Start / Continue tapped); "Continue ▶" after a Back reload
  if (new URLSearchParams(location.search).has('from')) document.addEventListener('DOMContentLoaded', () => {
    const lp = document.getElementById('lp'); new MutationObserver(() => { if (lp.classList.contains('ready') && lp.textContent !== 'Continue ▶') lp.textContent = 'Continue ▶'; }).observe(lp, { childList: true, attributes: true });
  });
  const watch = setInterval(() => { if (!document.getElementById('loader')) { ctl.classList.add('on'); gsap.fromTo(ctl, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .4, ease: 'back.out(2)' }); clearInterval(watch); } }, 300);
})();

/* js/guard.js — final-build hardening (Oct 2026). Loaded after the engine (uses its fit()).
   · No zooming: pinch / double-tap (touch-action + Safari gesture events), Ctrl/⌘ + wheel and Ctrl/⌘ + / − / 0.
     If the browser zooms anyway (menu), fit() still scales the 1920×1080 stage to the window.
   · No copying the art: no context menu, long-press "Save image" callout, image drag, text selection, copy/cut,
     or save / print / view-source shortcuts. (Nothing in a browser can make files truly un-downloadable; this
     stops the casual ways.) The layout editor's inputs still work locally.
   · Phones / tablets: a "turn your device" screen in portrait, full screen + landscape lock on the first tap
     (Android / iPad), and fit() follows the visual viewport (address bars, rotation). */
(() => {
  const D = document, coarse = matchMedia('(pointer: coarse)').matches;
  const editable = t => t && t.closest && t.closest('input, textarea, [contenteditable], #ed');
  const css = D.createElement('style');
  css.textContent = `
  html,body,#app,#stage{touch-action:none;overscroll-behavior:none;-webkit-touch-callout:none;-webkit-text-size-adjust:100%;text-size-adjust:100%}
  *{-webkit-touch-callout:none} img,canvas{-webkit-user-drag:none;user-select:none}
  #ed input,#ed textarea{user-select:text;-webkit-user-select:text;touch-action:auto}
  #rotate{position:fixed;inset:0;z-index:100000;display:none;flex-direction:column;align-items:center;justify-content:center;gap:28px;
    background:radial-gradient(circle at 50% 40%,#5a2f12,#1d1208 70%);color:#fff3d6;font:800 26px/1.25 Baloo,'Baloo 2',Fredoka,system-ui,sans-serif;text-align:center;padding:24px}
  #rotate .ph{width:74px;height:124px;border:7px solid #f7b733;border-radius:16px;position:relative;animation:rot 2.2s ease-in-out infinite}
  #rotate .ph::after{content:'';position:absolute;left:50%;bottom:7px;width:14px;height:14px;margin-left:-7px;border-radius:50%;background:#f7b733}
  #rotate small{font:600 17px/1.3 Poppins,system-ui,sans-serif;color:#f3d9b0;opacity:.85}
  @keyframes rot{0%,20%{transform:rotate(0)}50%,80%{transform:rotate(-90deg)}100%{transform:rotate(0)}}
  @media (orientation: portrait) and (pointer: coarse){#rotate{display:flex}}`;
  D.head.appendChild(css);
  const rot = D.createElement('div'); rot.id = 'rotate';
  rot.innerHTML = '<div class="ph"></div><div>Turn your device sideways<br>to play The Mela Before Sunset</div><small>The game plays in landscape.</small>';
  D.body.appendChild(rot);

  // ---- zoom ----
  const stop = e => e.preventDefault();
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(ev => D.addEventListener(ev, stop, { passive: false }));
  D.addEventListener('touchmove', e => { if (e.touches.length > 1 || (e.scale && e.scale !== 1)) e.preventDefault(); }, { passive: false });
  addEventListener('wheel', e => { if (e.ctrlKey || e.metaKey) e.preventDefault(); }, { passive: false });
  addEventListener('keydown', e => {
    if (!(e.ctrlKey || e.metaKey) || editable(e.target)) return;
    if (['+', '-', '=', '_', '0', 's', 'p', 'u', 'c', 'x', 'a'].includes(e.key.toLowerCase())) e.preventDefault();
  }, true);

  // ---- copying the art ----
  ['contextmenu', 'dragstart', 'selectstart', 'copy', 'cut'].forEach(ev => D.addEventListener(ev, e => { if (!editable(e.target)) e.preventDefault(); }, true));

  // ---- phones / tablets ----
  if (coarse) D.addEventListener('pointerdown', function first() {
    const r = D.documentElement, go = r.requestFullscreen || r.webkitRequestFullscreen;
    if (!go || D.fullscreenElement || D.webkitFullscreenElement) return;
    try { const p = go.call(r, { navigationUI: 'hide' }); if (p && p.then) p.then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => { })).catch(() => { }); } catch (e) { }
  }, { once: true, capture: true });
  const refit = () => { if (typeof fit === 'function') fit(); };
  if (window.visualViewport) visualViewport.addEventListener('resize', refit);
  addEventListener('orientationchange', () => { refit(); setTimeout(refit, 350); });
  D.addEventListener('fullscreenchange', () => setTimeout(refit, 100));
})();

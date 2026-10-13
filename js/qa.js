/* QA panel: jump straight to any level (or any shop / bill / payment inside it), the story start or the ending.
   · Press Q anywhere (live site too) to open / close it; Esc closes; while it is open 1 / 2 / 3 jump to that level.
   · The small "QA" tab (bottom-left of the window) is shown locally (localhost / file://) or with ?qa=1 (handy on tablets,
     which have no Q key); ?qa=0 hides the tab. Q works either way.
   Each jump reloads the page at that point (?from=…, plus ?shop= / ?bill= for a question); the cover then says "Continue ▶"
   (audio needs one tap after a reload). Other URL params (?speed=) are kept. */
(() => {
  const q = new URLSearchParams(location.search);
  const LOCAL = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  const showTab = (LOCAL || q.get('qa') === '1') && q.get('qa') !== '0';

  const css = document.createElement('style');
  css.textContent = `
  #qa{position:fixed;left:10px;bottom:10px;z-index:100001;font:700 13px/1.2 system-ui,sans-serif;color:#fff7e8}
  #qa .tab{border:0;border-radius:16px;padding:7px 10px;cursor:pointer;font:inherit;color:#fff7e8;background:rgba(58,34,15,.55);box-shadow:0 2px 6px rgba(0,0,0,.25)}
  #qa.notab .tab{display:none}
  #qa .panel{display:none;position:absolute;left:0;bottom:40px;min-width:330px;padding:14px 14px 12px;border-radius:16px;background:rgba(36,22,10,.95);box-shadow:0 10px 30px rgba(0,0,0,.45);border:1px solid #7a4a1f}
  #qa.notab .panel{bottom:0}
  #qa.open .panel{display:block}
  #qa h4{margin:0 0 10px;font-size:14px;color:#ffcf6a;display:flex;justify-content:space-between;align-items:center}
  #qa h4 small{font-weight:600;color:#c9a77c;font-size:11px}
  #qa .row{display:flex;align-items:center;gap:5px;margin:7px 0;flex-wrap:wrap}
  #qa .row .lbl{flex:0 0 100%;font-size:12px;color:#e8d3b0;margin-bottom:1px}
  #qa button.go{border:0;border-radius:12px;padding:7px 11px;cursor:pointer;font:inherit;color:#fff7e8;background:#5a3818}
  #qa button.go:hover{background:#b86a12}
  #qa button.go.lv{background:#8a4d14}
  #qa button.go.on{background:#2e7d32}
  #qa button.n{padding:7px 0;width:30px;text-align:center}`;
  document.head.appendChild(css);

  const LV = [['level1', 'Level 1 · Bazaar', 'shop', 'Shop'], ['level2', 'Level 2 · Office', 'bill', 'Bill'], ['level3', 'Level 3 · Mela', 'bill', 'Pay']];
  const box = document.createElement('div'); box.id = 'qa'; if (!showTab) box.classList.add('notab');
  box.innerHTML = `<button class="tab" title="QA shortcuts (Q)">QA</button>
    <div class="panel"><h4>Jump to <small>Q open/close · 1 2 3 · Esc</small></h4>
      <div class="row"><button class="go" data-to="title">▶ Story start</button><button class="go" data-to="hookD">Smart guess</button><button class="go" data-to="endA">Ending</button><button class="go" data-to="badge">Badge</button></div>
      ${LV.map(([id, name, k, word], i) => `<div class="row"><span class="lbl">${name}</span>
        <button class="go lv" data-to="${id}" title="From the start (key ${i + 1})">Start</button>
        ${[1, 2, 3, 4, 5, 6, 7].map(n => `<button class="go n" data-to="${id}" data-${k}="${n}" title="${word} ${n}">${n}</button>`).join('')}</div>`).join('')}
    </div>`;
  document.body.appendChild(box);

  // keep the panel's clicks away from the story (the loader / Skip / editor listen on the page)
  ['pointerdown', 'mousedown', 'click', 'touchend'].forEach(ev => box.addEventListener(ev, e => e.stopPropagation()));
  const toggle = on => box.classList.toggle('open', on);
  box.querySelector('.tab').addEventListener('click', () => toggle());
  const jump = (to, extra = {}) => {
    const p = new URLSearchParams(location.search);
    ['scene', 'from', 'shop', 'bill', 'edit'].forEach(k => p.delete(k));
    p.set('from', to); Object.entries(extra).forEach(([k, v]) => p.set(k, v));
    location.search = p.toString();
  };
  box.querySelectorAll('.go').forEach(b => b.addEventListener('click', () => jump(b.dataset.to, b.dataset.shop ? { shop: b.dataset.shop } : b.dataset.bill ? { bill: b.dataset.bill } : {})));
  addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey || document.body.classList.contains('editing') || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (e.key === 'q' || e.key === 'Q') { e.preventDefault(); toggle(); }
    else if (box.classList.contains('open') && e.key === 'Escape') toggle(false);
    else if (box.classList.contains('open') && /^[123]$/.test(e.key)) jump('level' + e.key);
  }, true);
  // highlight the screen that is on now
  setInterval(() => box.querySelectorAll('.go.lv, .go[data-to="title"], .go[data-to="endA"], .go[data-to="badge"], .go[data-to="hookD"]').forEach(b => b.classList.toggle('on', window.CUR_SCREEN === b.dataset.to)), 500);
})();

/* QA shortcuts: a small "QA" tab in the bottom-left corner of the window that opens Level 1 / Level 2 / Level 3 buttons.
   Each one reloads the page straight into that game (?from=levelN), so the game starts clean and the story continues
   after it. Other URL params (?speed=, ?qa=) are kept.
   Shown when running locally (localhost / file://) or with ?qa=1 in the URL (e.g. on the live Vercel link). */
(() => {
  const q = new URLSearchParams(location.search);
  const LOCAL = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  if (!(LOCAL || q.get('qa') === '1') || q.get('qa') === '0') return;

  const css = document.createElement('style');
  css.textContent = `
  #qa{position:fixed;left:10px;bottom:10px;z-index:10000;display:flex;align-items:center;gap:6px;font:700 13px/1 system-ui,sans-serif}
  #qa button{border:0;border-radius:16px;padding:7px 12px;cursor:pointer;font:inherit;color:#fff7e8;background:rgba(58,34,15,.82);box-shadow:0 2px 6px rgba(0,0,0,.25)}
  #qa button:hover{background:#b86a12}
  #qa .tab{background:rgba(58,34,15,.55);padding:7px 10px}
  #qa .go{display:none} #qa.open .go{display:inline-block}
  #qa .go.on{background:#2e7d32}`;
  document.head.appendChild(css);

  const box = document.createElement('div'); box.id = 'qa';
  box.innerHTML = `<button class="tab" title="QA shortcuts">QA</button>
    <button class="go" data-to="level1">Level 1 · Bazaar</button>
    <button class="go" data-to="level2">Level 2 · Office</button>
    <button class="go" data-to="level3">Level 3 · Mela</button>`;
  document.body.appendChild(box);

  // keep the panel's clicks away from the story (the loader / Skip / editor listen on the page)
  ['pointerdown', 'mousedown', 'click', 'touchend'].forEach(ev => box.addEventListener(ev, e => e.stopPropagation()));
  box.querySelector('.tab').addEventListener('click', () => box.classList.toggle('open'));
  box.querySelectorAll('.go').forEach(b => b.addEventListener('click', () => {
    const p = new URLSearchParams(location.search);
    ['scene', 'from', 'shop', 'bill', 'edit'].forEach(k => p.delete(k));
    p.set('from', b.dataset.to);
    location.search = p.toString();
  }));
  // highlight the game that is on screen
  setInterval(() => box.querySelectorAll('.go').forEach(b => b.classList.toggle('on', window.CUR_SCREEN === b.dataset.to)), 500);
})();

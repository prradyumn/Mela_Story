/* js/lang.js — languages + captions (Oct 2026, user: "language JSON files … toggle to switch … text inside the narrator box and the
   character dialogue box; voice only for Hindi and English").
   - lang/<code>.json = { meta, names, lines: { <voice id>: text } } for en, hi, gu, mr, ta, te, or. Edit the text there.
   - The caption box follows the voice: every voice(id) call (story and all three levels) shows that line's text in the narrator box
     (t0, n1–n4, x1) or in the speaking character's dialogue box, for as long as the voice plays.
   - Language toggle: chips on the cover and in the pause menu; remembered (localStorage mela_lang); ?lang=hi picks one for a test.
   - Voices: only the English voice files exist today. Other languages show their text over the English voice. A Hindi voice set
     goes in assets/audio/hi/ (story) and assets/game/vo/hi/ (game), see the note at the end. */
(function () {
  const stage = document.getElementById('stage');
  const CODES = ['en', 'hi', 'gu', 'mr', 'ta', 'te', 'or'];
  const NATIVE = { en: 'English', hi: 'हिन्दी', gu: 'ગુજરાતી', mr: 'मराठी', ta: 'தமிழ்', te: 'తెలుగు', or: 'ଓଡ଼ିଆ' };
  const FONTS = { hi: 'Noto Sans Devanagari', mr: 'Noto Sans Devanagari', gu: 'Noto Sans Gujarati', ta: 'Noto Sans Tamil', te: 'Noto Sans Telugu', or: 'Noto Sans Oriya' };
  const STACK = { hi: "'Noto Sans Devanagari','Nirmala UI','Mangal'", mr: "'Noto Sans Devanagari','Nirmala UI','Mangal'", gu: "'Noto Sans Gujarati','Nirmala UI','Shruti'", ta: "'Noto Sans Tamil','Nirmala UI','Latha'", te: "'Noto Sans Telugu','Nirmala UI','Gautami'", or: "'Noto Sans Oriya','Nirmala UI','Kalinga'" };
  const DICT = {}; let cur = 'en';
  try { const q = new URLSearchParams(location.search).get('lang'); cur = CODES.includes(q) ? q : (localStorage.getItem('mela_lang') || 'en'); } catch (e) { }
  if (!CODES.includes(cur)) cur = 'en';

  // who speaks each voice id: story ids by name, game ids from the level data
  const WHO = { t0: 'narrator', n1: 'narrator', n2: 'narrator', n3: 'narrator', n4: 'narrator', x1: 'narrator', b1: 'baba' };
  'g1 g2 g3'.split(' ').forEach(k => WHO[k] = 'guddu'); 'p1 p2 p3 p4 p5 p6'.split(' ').forEach(k => WHO[k] = 'pari'); 'r1 r2 r3'.split(' ').forEach(k => WHO[k] = 'aaru');
  [1, 2, 3].forEach(n => { try { (window['LEVEL' + n].allLines() || []).forEach(l => { if (l.id) WHO[l.id] = l.who; }); } catch (e) { } });

  async function load(code) {
    if (DICT[code]) return DICT[code];
    let d = null;
    try { const emb = window.EMBED && EMBED['lang/' + code]; d = emb ? JSON.parse(emb) : await (await fetch(`lang/${code}.json`)).json(); } catch (e) { }
    if (d) DICT[code] = d; return d;
  }
  function font(code) {
    const f = FONTS[code]; if (!f || document.getElementById('lf_' + f)) return;
    const l = document.createElement('link'); l.id = 'lf_' + f; l.rel = 'stylesheet'; l.href = `https://fonts.googleapis.com/css2?family=${f.replace(/ /g, '+')}:wght@500;700&display=swap`; document.head.appendChild(l);
  }

  // ---------- the caption box ----------
  const cap = document.createElement('div'); cap.id = 'cap'; cap.innerHTML = '<div class="ct"></div><div class="cx"></div>'; stage.appendChild(cap);
  const tag = cap.querySelector('.ct'), txt = cap.querySelector('.cx'); let token = 0, shownId = null;
  function render(id) {
    const d = DICT[cur] || DICT.en; if (!d) return false; const text = (d.lines && d.lines[id]) || (DICT.en && DICT.en.lines[id]); if (!text) return false;
    const who = WHO[id] || 'narrator', names = d.names || {};
    // in a level, feedback lines (oops / hint / nudge / idle) play while the answers are tappable at the bottom: show those at the top
    const top = /^level/.test(window.CUR_SCREEN || '') && /_(oops|hint|nudge|idle)$|^L[123]_(oops|idle)$/.test(id);
    cap.className = 'on ' + (who === 'narrator' ? 'cn' : 'cc cw-' + who) + (top ? ' top' : ''); cap.lang = cur;
    cap.style.setProperty('--capfont', STACK[cur] || "'Poppins'");
    tag.textContent = names[who] || who; txt.textContent = text;
    const n = text.length; cap.style.setProperty('--capsize', (n > 260 ? 29 : n > 170 ? 32 : n > 100 ? 35 : 38) + 'px');
    shownId = id; return true;
  }
  function hide() { token++; cap.classList.remove('on'); shownId = null; }
  function show(id) {
    if (!render(id)) { hide(); return; }
    const my = ++token, d = (typeof DUR !== 'undefined' && DUR[id]) || 3.5;
    setTimeout(() => { if (token === my) { cap.classList.remove('on'); shownId = null; } }, (d + .3) * 1000);
  }
  // follow the voice: every voice() call (story + game) and every stop
  const _voice = window.voice, _stop = window.stopVoices;
  if (typeof _voice === 'function') voice = function (id) { const r = _voice.apply(this, arguments); try { show(id); } catch (e) { } return r; };
  if (typeof _stop === 'function') stopVoices = function () { hide(); return _stop.apply(this, arguments); };

  // ---------- the toggle ----------
  const bars = [];
  function chips(cls) {
    const b = document.createElement('div'); b.className = 'langbar ' + cls;
    b.innerHTML = CODES.map(c => `<button type="button" class="lc" data-c="${c}" lang="${c}">${NATIVE[c]}</button>`).join('');
    b.addEventListener('pointerdown', e => { const c = e.target.closest('.lc'); if (!c) return; e.preventDefault(); e.stopPropagation(); set(c.dataset.c); });
    bars.push(b); return b;
  }
  const paint = () => bars.forEach(b => b.querySelectorAll('.lc').forEach(c => c.classList.toggle('on', c.dataset.c === cur)));
  async function set(code) {
    if (!CODES.includes(code)) return; font(code); await load(code); await load('en'); cur = code;
    try { localStorage.setItem('mela_lang', code); } catch (e) { } document.documentElement.lang = code; paint();
    if (shownId) render(shownId);   // a line on screen changes language at once
  }
  const loader = document.getElementById('loader'); if (loader) loader.appendChild(chips('lbcover'));
  const pov = document.getElementById('pauseOv'); if (pov) pov.appendChild(chips('lbpause'));
  paint(); font(cur); load('en'); load(cur).then(() => { if (cur !== 'en') document.documentElement.lang = cur; });
  window.LANG = { codes: CODES, get code() { return cur; }, set, load, text: id => ((DICT[cur] || DICT.en || {}).lines || {})[id], who: id => WHO[id] };
})();

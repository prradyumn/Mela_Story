// ================= LAYOUT EDITOR (temporary, for manual fixes) =================
// Open with ?edit=1 in the URL or press E. Pause, drag things, then Export JSON.
(() => {
  const q = new URLSearchParams(location.search);
  let on = false, paused = false, sel = null, drag = null;
  const css = document.createElement('style');
  css.textContent = `
  #ed{position:fixed;right:12px;top:12px;width:330px;max-height:calc(100vh - 24px);overflow:auto;z-index:9999;background:rgba(24,16,10,.94);color:#f6e7cf;font:13px/1.35 system-ui,sans-serif;border:1px solid #6b4a2a;border-radius:12px;padding:12px;box-shadow:0 10px 30px rgba(0,0,0,.5);display:none}
  #ed h3{margin:0 0 8px;font-size:14px;color:#ffcf6a;display:flex;justify-content:space-between;align-items:center}
  #ed .row{display:flex;gap:6px;align-items:center;margin:6px 0;flex-wrap:wrap}
  #ed button{background:#3a2a1a;color:#f6e7cf;border:1px solid #7a5a3a;border-radius:7px;padding:5px 9px;cursor:pointer;font-size:12px}
  #ed button:hover{background:#5a3f24} #ed button.pri{background:#b86a12;border-color:#e89a3a;color:#fff}
  #ed select,#ed input,#ed textarea{background:#140d07;color:#f6e7cf;border:1px solid #6b4a2a;border-radius:6px;padding:4px 6px;font-size:12px}
  #ed input[type=number]{width:64px} #ed input[type=range]{flex:1}
  #ed textarea{width:100%;height:70px;resize:vertical}
  #ed .k{opacity:.65;font-size:11px}
  #ed .list{max-height:150px;overflow:auto;border:1px solid #4a3522;border-radius:6px;padding:4px}
  #ed .list div{padding:2px 5px;border-radius:4px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #ed .list div:hover{background:#3a2a1a} #ed .list div.on{background:#b86a12;color:#fff}
  #edTag{position:fixed;left:12px;top:12px;z-index:9999;background:#b86a12;color:#fff;font:600 12px system-ui;padding:6px 10px;border-radius:8px;display:none;pointer-events:none}
  body.editing.paused #stage [data-eid], body.editing.paused #stage [data-eid] *{pointer-events:auto!important;cursor:move}
  body.editing.paused #stage [data-eid]:hover{outline:2px dashed rgba(25,227,255,.7);outline-offset:3px}
  body.editing.paused #stage [data-kind=char]:hover img{outline:2px dashed rgba(25,227,255,.7)}
  #stage .ed-sel{outline:3px solid #19e3ff!important;outline-offset:3px}
  #stage .ed-sel[data-kind=char] img{outline:3px solid #19e3ff}`;
  document.head.appendChild(css);
  const P = document.createElement('div'); P.id = 'ed'; document.body.appendChild(P);
  const tag = document.createElement('div'); tag.id = 'edTag'; tag.textContent = 'EDIT MODE · paused'; document.body.appendChild(tag);
  P.innerHTML = `
  <h3>Mela layout editor <button id="edX" title="Hide (E)">✕</button></h3>
  <div class="row"><select id="edScr"></select><button id="edGo" class="pri">Jump</button><button id="edRe">↻ Replay</button></div>
  <div class="row"><button id="edPlay" class="pri">⏸ Pause</button><input id="edT" type="range" min="0" max="1" step="0.01" value="0"><span id="edTl" class="k">0.0s</span></div>
  <div class="k">Pause, then click or drag anything with a dashed outline. Arrows nudge (Shift = 10px) · +/- scale · F flip · R reset · Space play/pause</div>
  <hr style="border-color:#4a3522">
  <div class="row"><b id="edId" style="color:#ffcf6a;word-break:break-all">nothing selected</b></div>
  <div class="row">x <input id="edDx" type="number" step="1"> y <input id="edDy" type="number" step="1"> scale <input id="edS" type="number" step="0.02" min="0.2" max="4"></div>
  <div class="row"><label><input id="edF" type="checkbox"> flip (characters)</label><button id="edRs">Reset item</button></div>
  <div id="edTxtW" style="display:none"><div class="k">Line text (voice stays the same)</div><textarea id="edTxt"></textarea></div>
  <div class="k" style="margin-top:6px">Items on this screen</div><div class="list" id="edList"></div>
  <hr style="border-color:#4a3522">
  <div class="row"><button id="edExp" class="pri">⬇ Export JSON</button><button id="edCp">Copy JSON</button><button id="edImp">⬆ Import</button><input id="edFile" type="file" accept=".json,application/json" style="display:none"></div>
  <div class="row"><button id="edRsS">Reset this screen</button><button id="edRsA">Reset all</button></div>
  <div class="k" id="edMsg">Edits auto-save in this browser. Export to keep them.</div>`;
  const $e = id => P.querySelector('#' + id);
  const save = () => { try { localStorage.setItem('mela_layout', JSON.stringify(LAYOUT)); } catch (e) { } msg('Saved in this browser · ' + Object.keys(LAYOUT.items).length + ' items, ' + Object.keys(LAYOUT.text).length + ' text edits'); };
  const msg = m => $e('edMsg').textContent = m;
  // screens
  const fill = () => { const s = $e('edScr'); s.innerHTML = (window.FLOW || []).map(f => `<option ${f[0] === window.CUR_SCREEN ? 'selected' : ''}>${f[0]}</option>`).join(''); };
  window.onScreen = id => { fill(); select(null); setTimeout(list, 300); setTimeout(list, 1500); };
  $e('edGo').onclick = () => { location.search = '?edit=1&from=' + $e('edScr').value; };
  $e('edRe').onclick = () => { location.search = '?edit=1&from=' + (window.CUR_SCREEN || 'title'); };
  // play / pause
  function setPaused(p) {
    paused = p; document.body.classList.toggle('paused', p);
    window.EDIT_PAUSED = p;
    if (p) { gsap.globalTimeline.pause(); AC && AC.suspend(); } else { select(null); gsap.globalTimeline.resume(); AC && AC.resume(); }
    $e('edPlay').textContent = p ? '▶ Play' : '⏸ Pause'; tag.style.display = on && p ? 'block' : 'none'; list();
  }
  $e('edPlay').onclick = () => setPaused(!paused);
  // timeline scrub (cutscenes only)
  const slider = $e('edT');
  setInterval(() => { if (!on) return; const c = window.CUR || (typeof CUR !== 'undefined' ? CUR : null); if (c && document.activeElement !== slider) { slider.max = c.duration().toFixed(2); slider.value = c.time().toFixed(2); $e('edTl').textContent = c.time().toFixed(1) + ' / ' + c.duration().toFixed(1) + 's'; } }, 200);
  slider.oninput = () => { const c = typeof CUR !== 'undefined' ? CUR : null; if (!c) return; if (!paused) setPaused(true); SKIPPING = true; stopVoices(); c.time(+slider.value); SKIPPING = false; $e('edTl').textContent = (+slider.value).toFixed(1) + 's'; };
  // selection
  const items = () => [...document.querySelectorAll('#stage [data-eid]')];
  function list() {
    const L = $e('edList'); L.innerHTML = '';
    items().forEach(n => { const d = document.createElement('div'); d.textContent = n.dataset.eid.split('.').slice(1).join('.') + (n.dataset.kind === 'char' ? ' 🧍' : ''); if (n === sel) d.className = 'on'; d.onclick = () => { if (!paused) setPaused(true); select(n); }; L.appendChild(d); });
  }
  const cur = n => Object.assign({ dx: 0, dy: 0, s: 1 }, LAYOUT.items[n.dataset.eid] || {});
  function select(n) {
    if (sel) sel.classList.remove('ed-sel'); sel = n;
    if (!n) { $e('edId').textContent = 'nothing selected'; ['edDx', 'edDy', 'edS'].forEach(i => $e(i).value = ''); $e('edTxtW').style.display = 'none'; list(); return; }
    n.classList.add('ed-sel'); const o = cur(n);
    if (n._base === undefined) n._base = JSON.parse(JSON.stringify(LAYOUT.items[n.dataset.eid] || {}));
    $e('edId').textContent = n.dataset.eid + (n.dataset.kind === 'char' ? ' (character)' : '');
    $e('edDx').value = Math.round(o.dx); $e('edDy').value = Math.round(o.dy); $e('edS').value = (+o.s).toFixed(2);
    $e('edF').checked = n.dataset.kind === 'char' ? !!(o.flip != null ? o.flip : n._o && n._o.flip) : false; $e('edF').disabled = n.dataset.kind !== 'char';
    const m = n.dataset.eid.match(/\.(?:bubble|narrator)_(\w+)$/);
    $e('edTxtW').style.display = m ? 'block' : 'none';
    if (m) { $e('edTxt').value = LAYOUT.text[m[1]] || (typeof TXT !== 'undefined' && TXT[m[1]]) || ''; $e('edTxt').dataset.line = m[1]; }
    list();
  }
  // apply values to the live element
  function apply(n) {
    const id = n.dataset.eid, o = cur(n);
    if (n.dataset.kind === 'char') {
      const b = Object.assign({ dx: 0, dy: 0, s: 1 }, n._base || {});
      n.style.translate = `${o.dx - b.dx}px ${o.dy - b.dy}px`; n.style.scale = o.s / b.s;
      if (o.flip != null && n._o) n.querySelectorAll('img').forEach(i => i.style.transform = 'translateX(-50%)' + (o.flip ? ' scaleX(-1)' : ''));
    } else { n.style.translate = `${o.dx}px ${o.dy}px`; n.style.scale = o.s; }
    LAYOUT.items[id] = o; save(); select(n);
  }
  function setVals(n, patch) { const o = Object.assign(cur(n), patch); o.dx = Math.round(o.dx); o.dy = Math.round(o.dy); o.s = Math.max(.2, Math.min(4, +(+o.s).toFixed(3))); LAYOUT.items[n.dataset.eid] = o; apply(n); }
  ['edDx', 'edDy', 'edS'].forEach(i => $e(i).onchange = () => sel && setVals(sel, { dx: +$e('edDx').value, dy: +$e('edDy').value, s: +$e('edS').value }));
  $e('edF').onchange = () => sel && setVals(sel, { flip: $e('edF').checked });
  $e('edRs').onclick = () => { if (!sel) return; LAYOUT.items[sel.dataset.eid] = sel.dataset.kind === 'char' ? { dx: 0, dy: 0, s: 1 } : { dx: 0, dy: 0, s: 1 }; apply(sel); };
  $e('edTxt').oninput = () => {
    const id = $e('edTxt').dataset.line, v = $e('edTxt').value; if (!id) return;
    if (v.trim()) LAYOUT.text[id] = v; else delete LAYOUT.text[id];
    const t = sel && sel.querySelector('.txt > div, .txt'); if (t) t.innerHTML = v.split(' ').map(w => `<span class="w" style="opacity:1">${w}</span>`).join(' ');
    save();
  };
  // topmost editable element under the pointer (layers like #ui would otherwise swallow the click)
  function pick(x, y) {
    for (const h of document.elementsFromPoint(x, y)) { const n = h.closest && h.closest('#stage [data-eid]'); if (n) { if (n.dataset.kind === 'char' && h.tagName === 'IMG' && getComputedStyle(h).opacity === '0') continue; return n; } }
    return null;
  }
  // stage pointer interactions
  const stageEl = document.getElementById('stage');
  const scaleOf = n => { const st = stageEl.getBoundingClientRect().width / 1920; const inWorld = n.closest('#world'); return st * (inWorld ? (gsap.getProperty(document.getElementById('world'), 'scale') || 1) : 1); };
  stageEl.addEventListener('pointerdown', e => {
    if (!on || !paused) return; const n = pick(e.clientX, e.clientY); if (!n) { select(null); return; }
    e.preventDefault(); e.stopPropagation(); select(n);
    const o = cur(n); drag = { n, x: e.clientX, y: e.clientY, dx: o.dx, dy: o.dy, k: scaleOf(n) };
    stageEl.setPointerCapture(e.pointerId);
  }, true);
  stageEl.addEventListener('pointermove', e => { if (!drag) return; setVals(drag.n, { dx: drag.dx + (e.clientX - drag.x) / drag.k, dy: drag.dy + (e.clientY - drag.y) / drag.k }); });
  stageEl.addEventListener('pointerup', () => { drag = null; });
  stageEl.addEventListener('click', e => { if (on && paused) { e.stopPropagation(); e.preventDefault(); } }, true);
  // keys
  addEventListener('keydown', e => {
    if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    if (e.key === 'e' || e.key === 'E') { toggle(); return; }
    if (!on) return;
    if (e.key === ' ') { e.preventDefault(); setPaused(!paused); return; }
    if (!sel) return; const st = e.shiftKey ? 10 : 1, o = cur(sel);
    const map = { ArrowLeft: { dx: o.dx - st }, ArrowRight: { dx: o.dx + st }, ArrowUp: { dy: o.dy - st }, ArrowDown: { dy: o.dy + st }, '+': { s: o.s + .02 }, '=': { s: o.s + .02 }, '-': { s: o.s - .02 }, f: { flip: !(o.flip != null ? o.flip : sel._o && sel._o.flip) }, r: { dx: 0, dy: 0, s: 1 } };
    const p = map[e.key]; if (p) { e.preventDefault(); if (p.flip != null && sel.dataset.kind !== 'char') return; setVals(sel, p); }
  });
  // export / import
  const json = () => JSON.stringify({ version: 1, note: 'The Mela Before Sunset: layout overrides. items: screen.element -> {dx, dy (px on the 1920x1080 stage), s (scale), flip}. text: line id -> replacement text.', items: LAYOUT.items, text: LAYOUT.text }, null, 2);
  $e('edExp').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([json()], { type: 'application/json' })); a.download = 'mela_layout.json'; a.click(); msg('Downloaded mela_layout.json'); };
  $e('edCp').onclick = async () => { try { await navigator.clipboard.writeText(json()); msg('Copied to clipboard'); } catch (e) { msg('Copy failed; use Export'); } };
  $e('edImp').onclick = () => $e('edFile').click();
  $e('edFile').onchange = async () => { const f = $e('edFile').files[0]; if (!f) return; try { const d = JSON.parse(await f.text()); LAYOUT.items = d.items || {}; LAYOUT.text = d.text || {}; save(); location.search = '?edit=1&from=' + (window.CUR_SCREEN || 'title'); } catch (e) { msg('That file is not a valid layout JSON'); } };
  $e('edRsS').onclick = () => { const p = (window.CUR_SCREEN || '') + '.'; Object.keys(LAYOUT.items).forEach(k => k.startsWith(p) && delete LAYOUT.items[k]); save(); location.search = '?edit=1&from=' + window.CUR_SCREEN; };
  $e('edRsA').onclick = () => { if (!confirm('Reset every layout edit?')) return; LAYOUT.items = {}; LAYOUT.text = {}; save(); location.search = '?edit=1&from=' + (window.CUR_SCREEN || 'title'); };
  $e('edX').onclick = () => toggle();
  function toggle() { on = !on; P.style.display = on ? 'block' : 'none'; document.body.classList.toggle('editing', on); if (!on && paused) setPaused(false); tag.style.display = on && paused ? 'block' : 'none'; fill(); list(); }
  if (q.get('edit') === '1') toggle();
})();

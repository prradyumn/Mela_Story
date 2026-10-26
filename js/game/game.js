/* Plugs the game into the story (contract: CLAUDE.md §8).
   story.js → level(n) builds its own scene, then awaits window.GAME_LEVELS[n](api) and iris-wipes to the next bridge.
   Level 1 covers the stage with the game layer (#game), runs, then hands the HUD state back to the story.
   Run alone:  index.html?scene=level1 (&shop=4)  ·  ?scene=level2 (&bill=3)  ·  ?scene=level3 (&bill=3)  ·  faster: &speed=3 */
window.GAME_LEVELS = window.GAME_LEVELS || {};

/* QA bugs 27 / 33 / 34 (slow network: half-drawn screens, the Bazaar "loading twice", the intro buttons cut off): a level's pictures are
   downloaded AND decoded before its layer is shown. GAME_PRELOAD(n) is cached; the story starts the next level's while the child plays. */
(function () {
  const L2RE = /office_desk|bill_|checked_basket|ink_pad|paper_ball|stamp_|guddu_(scratch|proud|surprised)/, L3RE = /\/l3\//;
  const levelOf = u => L3RE.test(u) ? 3 : L2RE.test(u) ? 2 : 1;
  function urls() {
    const s = new Set(); document.querySelectorAll('#game img').forEach(i => i.src && s.add(i.src));
    for (const sh of document.styleSheets) { let rules; try { rules = sh.cssRules; } catch (e) { continue; }
      for (const r of rules) { if (!/#game/.test(r.selectorText || '')) continue; (r.cssText.match(/url\(["']?[^"')]+["']?\)/g) || []).forEach(u => { try { s.add(new URL(u.replace(/^url\(["']?|["']?\)$/g, ''), sh.href || location.href).href); } catch (e) { } }); } }
    return [...s].filter(u => /assets\/game\//.test(u));
  }
  const pre = {};
  window.GAME_PRELOAD = n => pre[n] || (pre[n] = Promise.race([
    Promise.all(urls().filter(u => levelOf(u) === n).map(u => { const im = new Image(); im.src = u; return im.decode ? im.decode().catch(() => { }) : Promise.resolve(); })),
    new Promise(r => setTimeout(r, 12000))]));
})();

/* Hand back to the story WITHOUT a blank flash (QA Oct 2026): the game stays on screen; story.js level() iris-wipes over it and
   only then calls GAME_HANDBACK, which hides the game layer and brings the story HUD back underneath the wipe.
   (It used to fade #game out over the hidden story scene: ~1 s of dark brown + the old level chip.) */
function handBack(api, root, extra) {
  window.GAME_HANDBACK = () => { root.classList.add('hidden'); gsap.set(root, { opacity: 1 }); if (extra) extra(); gsap.set(api.hud, { opacity: 1 }); };
}

window.GAME_LEVELS[1] = async (api) => {
  await GAME_PRELOAD(1);   // the level's art is ready before the layer shows
  GAME_PRELOAD(2);   // start the next level's pictures while this one is played
  const root = document.getElementById('game');
  const q = new URLSearchParams(location.search);
  LEVEL1.sun = api.level.sun.slice(); COACH.fullPari = true; COACH.pariSpot = 'stand'; gsap.set(['#sunPanel', '#gChip', '#mariPlate'], { autoAlpha: 1 });                    // the story decides where the sun is in level 1

  // the game has its own background, HUD and coach: hide the story's scene + HUD underneath
  document.getElementById('l2').classList.add('hidden'); document.getElementById('l3').classList.add('hidden'); gsap.set('#gBg', { clearProps: 'all' });
  api.scene.style.visibility = 'hidden';
  gsap.to(api.hud, { opacity: 0, duration: .3 });
  root.classList.remove('hidden'); gsap.set(root, { opacity: 1 });

  const shop = parseInt(q.get('shop'), 10);
  const res = await LEVEL1_RUN({ startAt: shop > 0 ? Math.min(6, shop - 1) : 0, skipIntro: shop > 0, embedded: true });
  window.GAME_RESULT = Object.assign(window.GAME_RESULT || {}, { level1: res });

  // hand back: story HUD shows 7 marigolds and the sun where the level ended
  GFX.reset(); api.setFlowers(7); api.setSun(api.level.sun[1]);
  SND.stopVo();
  handBack(api, root);
};

window.GAME_LEVELS[2] = async (api) => {
  await GAME_PRELOAD(2);   // the level's art is ready before the layer shows
  GAME_PRELOAD(3);   // start the next level's pictures while this one is played
  const root = document.getElementById('game');
  const q = new URLSearchParams(location.search);
  LEVEL2.sun = api.level.sun.slice(); document.getElementById('l3').classList.add('hidden');
  api.scene.style.visibility = 'hidden';
  gsap.to(api.hud, { opacity: 0, duration: .3 });
  root.classList.remove('hidden'); gsap.set(root, { opacity: 1 });
  const bill = parseInt(q.get('bill'), 10);
  const res = await LEVEL2_RUN({ startAt: bill > 0 ? Math.min(6, bill - 1) : 0, skipIntro: bill > 0 });
  window.GAME_RESULT = Object.assign(window.GAME_RESULT || {}, { level2: res }); GFX.reset();
  api.setFlowers(7); api.setSun(api.level.sun[1]);
  SND.stopVo();
  handBack(api, root, () => document.getElementById('l2').classList.add('hidden'));
};

window.GAME_LEVELS[3] = async (api) => {
  await GAME_PRELOAD(3);   // the level's art is ready before the layer shows
  const root = document.getElementById('game');
  const q = new URLSearchParams(location.search);
  LEVEL3.sun = api.level.sun.slice(); document.getElementById('l2').classList.add('hidden');
  api.scene.style.visibility = 'hidden';
  gsap.to(api.hud, { opacity: 0, duration: .3 });
  root.classList.remove('hidden'); gsap.set(root, { opacity: 1 });
  const bill = parseInt(q.get('bill'), 10);
  const res = await LEVEL3_RUN({ startAt: bill > 0 ? Math.min(6, bill - 1) : 0, skipIntro: bill > 0 });
  window.GAME_RESULT = Object.assign(window.GAME_RESULT || {}, { level3: res }); GFX.reset();
  api.setFlowers(7); api.setSun(api.level.sun[1]);
  SND.stopVo();
  handBack(api, root, () => { document.getElementById('l3').classList.add('hidden'); gsap.set('#gBg', { clearProps: 'all' }); });
};

/* 🔊 replay button */
document.getElementById('btnSpeaker').addEventListener('pointerdown', e => {
  e.preventDefault(); e.stopPropagation();
  gsap.fromTo('#btnSpeaker', { scale: .85 }, { scale: 1, duration: .3, ease: 'back.out(3)' });
  SND.replay();
});

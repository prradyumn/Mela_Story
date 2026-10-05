/* Plugs the game into the story (contract: CLAUDE.md §8).
   story.js → level(n) builds its own scene, then awaits window.GAME_LEVELS[n](api) and iris-wipes to the next bridge.
   Level 1 covers the stage with the game layer (#game), runs, then hands the HUD state back to the story.
   Run alone:  index.html?scene=level1 (&shop=4)  ·  index.html?scene=level2 (&bill=3)  ·  faster: &speed=3 */
window.GAME_LEVELS = window.GAME_LEVELS || {};

window.GAME_LEVELS[1] = async (api) => {
  const root = document.getElementById('game');
  const q = new URLSearchParams(location.search);
  LEVEL1.sun = api.level.sun.slice(); COACH.fullPari = true; COACH.pariSpot = 'stand';                    // the story decides where the sun is in level 1

  // the game has its own background, HUD and coach: hide the story's scene + HUD underneath
  document.getElementById('l2').classList.add('hidden'); gsap.set('#gBg', { clearProps: 'all' });
  api.scene.style.visibility = 'hidden';
  gsap.to(api.hud, { opacity: 0, duration: .3 });
  root.classList.remove('hidden'); gsap.set(root, { opacity: 1 });

  const shop = parseInt(q.get('shop'), 10);
  const res = await LEVEL1_RUN({ startAt: shop > 0 ? Math.min(6, shop - 1) : 0, skipIntro: shop > 0, embedded: true });
  window.GAME_RESULT = Object.assign(window.GAME_RESULT || {}, { level1: res });

  // hand back: story HUD shows 7 marigolds and the sun where the level ended
  api.setFlowers(7); api.setSun(api.level.sun[1]);
  SND.stopVo();
  await gsap.to(root, { opacity: 0, duration: .35 });
  root.classList.add('hidden');
  gsap.to(api.hud, { opacity: 1, duration: .3 });
};

window.GAME_LEVELS[2] = async (api) => {
  const root = document.getElementById('game');
  const q = new URLSearchParams(location.search);
  LEVEL2.sun = api.level.sun.slice();
  api.scene.style.visibility = 'hidden';
  gsap.to(api.hud, { opacity: 0, duration: .3 });
  root.classList.remove('hidden'); gsap.set(root, { opacity: 1 });
  const bill = parseInt(q.get('bill'), 10);
  const res = await LEVEL2_RUN({ startAt: bill > 0 ? Math.min(6, bill - 1) : 0, skipIntro: bill > 0 });
  window.GAME_RESULT = Object.assign(window.GAME_RESULT || {}, { level2: res });
  api.setFlowers(7); api.setSun(api.level.sun[1]);
  SND.stopVo();
  await gsap.to(root, { opacity: 0, duration: .35 });
  root.classList.add('hidden'); document.getElementById('l2').classList.add('hidden');
  gsap.to(api.hud, { opacity: 1, duration: .3 });
};

/* 🔊 replay button */
document.getElementById('btnSpeaker').addEventListener('pointerdown', e => {
  e.preventDefault(); e.stopPropagation();
  gsap.fromTo('#btnSpeaker', { scale: .85 }, { scale: 1, duration: .3, ease: 'back.out(3)' });
  SND.replay();
});

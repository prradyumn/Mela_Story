/* Boot: title card → Level 1.
   Handy URL options for testing:  ?shop=4  (start at shop 4, skip how-to + teach)
                                   ?fast=3  (play everything 3× faster) */
(function () {
  const { $ } = ST;
  const qs = new URLSearchParams(location.search);
  if (qs.get('fast')) gsap.globalTimeline.timeScale(parseFloat(qs.get('fast')) || 1);

  // title card icons
  $('#titleIcons').innerHTML = LEVEL1.questions.map(q => `<img src="assets/img/ic_${q.icon}.webp" alt="">`).join('');
  gsap.from('#titleCard', { scale: .7, opacity: 0, duration: .6, ease: 'back.out(1.7)' });
  gsap.from('#titleIcons img', { y: 30, opacity: 0, duration: .4, stagger: .07, delay: .3, ease: 'back.out(2)' });
  gsap.to('#btnPlay', { scale: 1.05, duration: .7, yoyo: true, repeat: -1, ease: 'sine.inOut' });

  $('#btnSpeaker').addEventListener('pointerdown', e => { e.preventDefault(); gsap.fromTo('#btnSpeaker', { scale: .85 }, { scale: 1, duration: .3, ease: 'back.out(3)' }); SND.replay(); });
  $('#btnMusic').addEventListener('pointerdown', e => { e.preventDefault(); $('#btnMusic').classList.toggle('off', !SND.toggleMusic()); });

  let started = false;
  $('#btnPlay').addEventListener('pointerdown', async e => {
    e.preventDefault(); if (started) return; started = true;
    SND.unlock(); SND.sfx('bell');
    gsap.killTweensOf('#btnPlay');
    await gsap.to('#titleOv', { opacity: 0, duration: .4 });
    $('#titleOv').classList.add('hidden');
    const shop = Math.max(0, Math.min(6, (parseInt(qs.get('shop')) || 1) - 1));
    const res = await LEVEL1_RUN({ startAt: shop, skipIntro: qs.has('shop') });
    window.GAME_RESULT = res;
    if (window.GAME_HOOKS && typeof GAME_HOOKS.onLevelComplete === 'function') GAME_HOOKS.onLevelComplete(1, res);
    else { ST.toast('Level 2 · Panchayat office is next — coming in v2'); setTimeout(() => location.reload(), 3200); }
  });
})();

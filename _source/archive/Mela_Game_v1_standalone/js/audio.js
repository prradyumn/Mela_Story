/* Audio: short SFX, background music and voice-over.
   - SFX/music live in assets/sfx and assets/music (.ogg + .mp3, the browser picks one).
   - VO: assets/vo/<id>.ogg|.mp3. A missing file is fine: the line stays on screen for a reading time.
   - The 🔊 button replays the current line: the VO file if there is one, otherwise the browser voice. */
(function () {
  const ext = (() => { const a = document.createElement('audio'); return a.canPlayType('audio/ogg; codecs="vorbis"') ? 'ogg' : 'mp3'; })();
  const SFX = {
    bell: 'sfx_cycle_bell', ding: 'sfx_ding', goat: 'sfx_goat', pop: 'sfx_pop', whoosh: 'sfx_whoosh',
    swish: 'sfx_swish', stamp: 'sfx_stamp', sparkle: 'sfx_sparkle', confetti: 'sfx_confetti', tick: 'sfx_tick',
    boing: 'sfx_boing', rise: 'sfx_rise', bubble: 'sfx_bubble', coins: 'sfx_coins'
  };
  const VOL = { bell: .55, ding: .6, goat: .7, pop: .5, whoosh: .45, swish: .4, stamp: .7, sparkle: .5, confetti: .6, tick: .35, boing: .5, rise: .45, bubble: .35, coins: .55 };
  const pools = {};
  const voMissing = new Set(); const voExt = {};
  let music = null, musicOn = true, unlocked = false, voEl = null, current = null, pending = null;

  function pool(name) {
    if (!pools[name]) {
      pools[name] = [0, 1, 2].map(() => { const a = new Audio(`assets/sfx/${SFX[name]}.${ext}`); a.preload = 'auto'; return a; });
      pools[name].i = 0;
    }
    return pools[name];
  }

  const Audio_ = {
    unlock() {
      if (unlocked) return; unlocked = true;
      Object.keys(SFX).forEach(pool);
      music = new Audio(`assets/music/m_village_long.${ext}`); music.loop = true; music.volume = 0.16;
      if (musicOn) music.play().catch(() => {});
    },
    sfx(name, vol) {
      if (!SFX[name] || !unlocked) return;
      const p = pool(name); const a = p[p.i++ % p.length];
      try { a.currentTime = 0; a.volume = vol ?? VOL[name] ?? .5; a.play().catch(() => {}); } catch (e) {}
    },
    toggleMusic() {
      musicOn = !musicOn;
      if (music) musicOn ? music.play().catch(() => {}) : music.pause();
      return musicOn;
    },
    duck(on) { if (music) gsap.to(music, { volume: on ? 0.06 : 0.16, duration: .4 }); },

    /* Play a VO id. Resolves when it ends, or after `fallbackSec` if there is no file. */
    vo(id, fallbackSec) {
      Audio_.stopVo();
      return new Promise(res => {
        let finished = false, timer = null;
        const finish = () => { if (finished) return; finished = true; if (timer) timer.kill(); Audio_.duck(false); if (pending === finish) pending = null; res(); };
        pending = finish;                                   // stopVo() resolves whatever is still waiting
        const later = () => { timer = gsap.delayedCall(fallbackSec, finish); };
        if (!id || voMissing.has(id) || !unlocked) { later(); return; }
        // try the compressed file first, then the .wav the Voice Studio writes
        const tryExt = list => {
          if (!list.length) { voMissing.add(id); voEl = null; Audio_.duck(false); later(); return; }
          const a = new Audio(`assets/vo/${id}.${list[0]}`); voEl = a;
          const fail = () => { if (voEl !== a) return; tryExt(list.slice(1)); };
          a.addEventListener('error', fail, { once: true });
          a.addEventListener('ended', finish, { once: true });
          a.addEventListener('playing', () => { voExt[id] = list[0]; }, { once: true });
          a.play().catch(err => { if (err && err.name === 'NotAllowedError') { voEl = null; later(); } else fail(); });
        };
        Audio_.duck(true);
        tryExt(voExt[id] ? [voExt[id]] : [ext, 'wav']);
      });
    },
    stopVo() {
      if (voEl) { try { voEl.pause(); } catch (e) {} voEl = null; }
      if (window.speechSynthesis) speechSynthesis.cancel();
      if (pending) pending();
    },
    setCurrent(line) { current = line; },
    replay() {
      if (!current) return;
      if (current.vo && !voMissing.has(current.vo)) { Audio_.vo(current.vo, 0).then(() => { if (voMissing.has(current.vo)) Audio_.replay(); }); return; }
      if (!window.speechSynthesis) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(window.LEVEL1 && LEVEL1.spoken ? LEVEL1.spoken(current.text) : current.text);
      const v = speechSynthesis.getVoices().find(v => /en[-_]IN/i.test(v.lang)) || speechSynthesis.getVoices().find(v => /^en/i.test(v.lang));
      if (v) u.voice = v; u.rate = .92; u.pitch = 1.1;
      speechSynthesis.speak(u);
    }
  };
  window.SND = Audio_;
})();

/* Game audio on top of the story engine (js/story/engine.js):
   - SFX → the story's sfx() (same files in assets/audio, same sfx bus, respects Skip/mute).
   - Music → the story already plays m_hurry during levels; the game adds none.
   - VO → assets/game/vo/<id>.ogg|.mp3|.wav (made with tools/voice_studio.html). Each file is decoded once into the
     story's BUF/DUR and played with the story's voice(), so it ducks the music exactly like story lines.
     A missing file is fine: the line stays on screen for a reading time.
   Engine globals used: AC, BUF, DUR, sfx, voice, stopVoices (classic scripts share one global scope). */
(function () {
  const NAME = { bell: 'cycle_bell' };          // game name → story sfx file (sfx_<name>)
  const VOL = { bell: .55, ding: .6, goat: .7, pop: .5, whoosh: .45, swish: .4, stamp: .7, sparkle: .5, confetti: .6, tick: .35, boing: .5, rise: .45, bubble: .35, coins: .55 };
  const OGG = !!document.createElement('audio').canPlayType('audio/ogg; codecs="opus"');
  const loading = {}, missing = new Set();
  let current = null, pending = null, noVO = false;

  async function load(id) {
    if (BUF[id]) return true;
    if (missing.has(id) || noVO) return false;
    if (!loading[id]) loading[id] = (async () => {
      const urls = [];
      const emb = window.EMBED && (EMBED[`game/vo/${id}.mp3`]);
      if (emb) urls.push(emb); else urls.push(...(OGG ? ['ogg', 'mp3', 'wav'] : ['mp3', 'wav']).map(e => GA(`vo/${id}.${e}`)));
      for (const u of urls) {
        try {
          const r = await fetch(u); if (!r.ok) continue;
          const ab = await r.arrayBuffer();
          BUF[id] = await new Promise((ok, no) => AC.decodeAudioData(ab, ok, no)); DUR[id] = BUF[id].duration;
          return true;
        } catch (e) { /* try the next format */ }
      }
      missing.add(id); return false;
    })();
    return loading[id];
  }

  const SND = {
    sfx(name, vol) { try { sfx(NAME[name] || name, vol ?? VOL[name] ?? .5); } catch (e) { } },
    /* Load these VO ids in the background, in order (call at level start) */
    async preload(ids) { let miss = 0, any = false; for (const id of ids) { if (await load(id)) { miss = 0; any = true; } else if (++miss >= 3) { if (!any) noVO = true; return; } } },   // no VO files yet → stop asking
    /* Play a VO id. Resolves when it ends, or after `fallbackSec` if there is no file. */
    vo(id, fallbackSec) {
      SND.stopVo();
      return new Promise(res => {
        let finished = false, timer = null;
        const finish = () => { if (finished) return; finished = true; if (timer) timer.kill(); if (pending === finish) pending = null; res(); };
        pending = finish;
        const after = s => { timer = gsap.delayedCall(s, finish); };
        if (!id) { after(fallbackSec); return; }
        load(id).then(ok => {
          if (finished) return;
          if (ok && !SKIPPING) { voice(id); after(DUR[id] + .05); }
          else after(fallbackSec);
        });
      });
    },
    stopVo() {
      try { stopVoices(); } catch (e) { }
      if (window.speechSynthesis) speechSynthesis.cancel();
      if (pending) pending();
    },
    setCurrent(line) { current = line; },
    /* 🔊 button: replay the current line (VO file, or the browser voice if there is none yet) */
    async replay() {
      if (!current) return;
      if (current.vo && await load(current.vo)) { voice(current.vo); return; }
      if (!window.speechSynthesis) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(LEVEL1.spoken ? LEVEL1.spoken(current.text) : current.text);
      const v = speechSynthesis.getVoices().find(v => /en[-_]IN/i.test(v.lang)) || speechSynthesis.getVoices().find(v => /^en/i.test(v.lang));
      if (v) u.voice = v; u.rate = .92; u.pitch = 1.1;
      speechSynthesis.speak(u);
    }
  };
  window.SND = SND;
})();

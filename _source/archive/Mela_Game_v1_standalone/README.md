# The Mela Before Sunset — Game v1 (Level 1 · Aakoli Bazaar)

Open `index.html` in Chrome / Safari / Edge. No build step, no server needed.
The game stage is 1920×1080 and scales to fit any screen.

## Flow (matches the storyboard + Figma page "★ L1 · Clean build")
How to play (3 lines) → Teach with Pari & Manju Mausi (₹34,872) → 7 shops → Level complete.
**No Next buttons:** each intro line moves on by itself when the voice ends. Tapping anywhere moves on sooner ("tap ▸" in the bubble), and **Skip ⏭** jumps straight to Shop 1. In the teach round the hand shows where to tap.

Each shop shows **one thing at a time**: price tag drops in → number line draws + red arrow slides to the price → two answer buttons pop in.

| Event | What happens |
|---|---|
| Wrong #1 | "Oops! Try again…" · button goes red + wiggles · Gudiya hops and bleats |
| Wrong #2 | Hint line · hundreds digit glows on the tag · rule strip slides up |
| Wrong #3 | Nudge line · wrong button fades · right one glows · hand taps it |
| 10 s no tap | Inactivity line (once) · buttons pulse · red arrow bounces |
| Correct | Bell · green button ✓ · **Gudiya leaps onto the line at the price and hops to the round number** · green arrow lands on that number · tag flips to a red stamp · **the item flies from the tag into the cart** · a marigold flies to the HUD · sun steps · next shop after 2 s |

Stars: first try = gold, after Oops/Hint = silver, after the hand = none. Level: ≥6 gold → 3★, ≥4 → 2★, else 1★.

## Files
```
index.html            stage markup
css/game.css          all styling (palette, fonts, 3-slice buttons, layout)
js/data/level1.js     every line of text + the 7 prices (edit content here)
js/audio.js           SFX, music, voice-over (with fallbacks)
js/stage.js           scaling, helpers, number-line geometry, particles
js/hud.js             marigolds, sun tracker, coach avatar + speech bubble
js/gudiya.js          Gudiya actor (sprite-ready)
js/scene.js           tag, number line, markers, buttons, cart, hint strip, hand
js/level1.js          the level flow + 3-strike logic
js/main.js            title card + boot
tools/voice_studio.html   makes all voice lines with Gemini TTS
tools/convert_vo.sh       optional: wav → ogg/mp3
assets/               img (webp), sfx, music, fonts
```

## Testing shortcuts
- `index.html?shop=4` — start straight at shop 4 (skips how-to + teach)
- `index.html?fast=3` — play everything 3× faster

## Voice-over (Gemini TTS)
1. Open `tools/voice_studio.html` in Chrome.
2. Paste your Gemini API key (it stays in that tab only — never saved to any file).
3. Choose this `Mela_Game_v1` folder → **Test one line** → **Generate missing lines** (50 lines, about 5–10 min; rate limits are retried automatically).
4. Reload the game. Voices: Pari = Leda, Manju Mausi = Gacrux, Aaru = Puck (changeable in the studio). Big numbers are read in Indian English ("two lakh thirty-eight thousand…").
Optional: `tools/convert_vo.sh` makes smaller .ogg/.mp3 copies with ffmpeg. Missing files are fine — the line stays on screen for a reading time.
`L1_howto_1..3 · L1_teach_1..4 · L1_teach_ok / _oops / _hint / _nudge / _idle · L1_oops · L1_q1..L1_q7 · L1_q{n}_ok / _hint / _nudge / _idle · L1_done_1..2`
The 🔊 button replays the current line (uses the browser voice until real VO exists).

## Adding Gudiya's hop sprite
In `js/gudiya.js`, replace the `hop` pose with a sheet:
```js
GUDIYA_POSES.hop = { sheet:'assets/img/gudiya_hop_sheet.png', cols:4, rows:2, frames:8, fps:14,
                     aspect: frameW/frameH, cx:.5, foot:.95, face:'left', scale:1, once:true };
```
Nothing else changes — every hop, leap and bleat uses the pose.

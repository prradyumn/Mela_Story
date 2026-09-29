# CLAUDE.md — "The Mela Before Sunset"

Context for any Claude session (VS Code, CLI, Cowork) working in this folder. Read this first.

## 1. What this is

An interactive **motion-graphic story + math game** for **Grade 6** students on **addition and subtraction by estimation** (rounding to the nearest thousand, then adding and subtracting round numbers).

- A single web page, **HTML + CSS + JS**, with no framework and no build step during development. GSAP is the only library, vendored as `gsap.min.js`.
- The story plays **continuously**. It is **not** a slide deck and has no "Next" buttons. Buttons appear only where the child must act (Start, level launch, "Get my badge").
- **Current state:** the **story is finished**. The **3 game levels are placeholders** (a "GAME PLUGS IN HERE" card plus a "Play demo ▶" button that lights 7 marigolds).
- **Plan:** build the **game as a standalone module first**, then **integrate it into the story** through the `window.GAME_LEVELS` hook (§8). Don't rewrite the story to fit the game. The game plugs into the story.

## 2. How to run

```bash
cd Mela_Story        # this folder: the one and only index.html lives here
python3 -m http.server 8123
# open http://localhost:8123/
```

Use Chrome or Safari. Audio needs a user gesture, so the loader says "Tap to begin". Opening `index.html` via `file://` usually works too, but a server is safer for audio decoding.

URL parameters:

| Param | Effect |
|---|---|
| `?scene=hookD` | Run **only** that screen, then stop. Best for iterating. |
| `?from=level2` | Start from that screen and continue the flow. |
| `?speed=3` | Speed up all waits and timelines, for quick checks. |
| `?edit=1` | Open the layout editor (§7). Pressing **E** also works, but only locally (localhost or file://). |

Screen ids are listed in §4.

**Single-file build**, for sharing: `python3 build.py` → `dist/The_Mela_Before_Sunset.html` (about 11.6 MB). It inlines CSS, fonts, images and audio as base64 into `window.EMBED`, which `engine.js` checks before fetching files. Rebuild after every change you want to share. The single file embeds the **MP3** audio (it must play anywhere, including iOS Safari).

**Vercel deploy:** there is no build step. This folder *is* the site, and Vercel serves `index.html` and the files next to it as they are. `vercel.json` sets cache headers (html/js/css always revalidate, so a new deploy shows up at once). `.vercelignore` keeps `dist/`, `voice_samples/`, `build.py`, `layout.json` and this file out of the upload. Deploy from this folder with `npx vercel --prod`, or import the repo into Vercel (framework "Other", no build command). On the live site the layout editor opens only with `?edit=1`.

## 3. Files

Everything lives in this one folder. There is a single `index.html`, and no `source/` or `web/` copies.

```
index.html     layer structure + script order: gsap → layout.js → engine.js → story.js → editor.js
style.css      fonts (@font-face), bubbles, narrator panel, signs, cards, HUD, buttons, wipe
engine.js      reusable engine: loading, audio, characters, acting, bubbles, HUD, particles, transitions
story.js       the story itself: dialogue text (TXT), screens, LEVELS data, FLOW, main()
editor.js      temporary layout editor (IIFE); E key only works locally, the live site needs ?edit=1
layout.json    saved manual layout edits (source of truth)
layout.js      GENERATED from layout.json by build.py → window.LAYOUT_DEFAULT
build.py       builds the shareable single file dist/The_Mela_Before_Sunset.html (+ regenerates layout.js)
dist/          GENERATED single-file build, not deployed
voice_samples/ Pari voice experiments + tools (not deployed; see voice_samples/pari/tools/README.md)
vercel.json    Vercel config: static, no build, cache headers
favicon.svg    marigold tab icon
a/  *.webp     backgrounds (height 1080), characters (900px tall cutouts), dialogue boxes db5–db8, parch, office_fg, button art btn_l/btn_m/btn_r (Gemini-generated)
au/ *.ogg      voice lines, music, SFX in Ogg Opus (voices 48k mono, SFX 64k, music 80k); loaded first
au/ *.mp3      the same files as MP3: masters + fallback when the browser can't decode Ogg (older Safari / iOS)
f/  *.woff2    Baloo 2, Poppins 600, Fredoka (latin + devanagari subsets for ₹)
```

The original user assets (character sheets, backgrounds, Union dialogue-box PNGs and the storyboard CSV) are in the parent folder `character_package 2/`.

## 4. Story → screens (`FLOW` in story.js)

Village of **Apnapur**. It is Mela day. The Panchayat has **₹6,00,000** to buy things for the Mela, but the shops close at sunset. Guddu Bhaiya adds everything digit by digit and is too slow. Pari teaches **estimation** (smart guess). The child helps across 3 levels while the **sun sinks** (HUD sun tracker, top right).

| # | id | Location / bg | What happens | Lines |
|---|---|---|---|---|
| 1 | `title` | gate | Title card, Start button | t0 |
| 2 | `hookA` | chaupal | Narrator intro + money sign; Baba asks; Guddu starts adding with floating numbers | n1, b1, g1 |
| 3 | `hookB` | chaupal | Guddu alone, pages flying, sun tracker appears | n2 |
| 4 | `hookC` | chaupal | Aaru and Gudiya run in: "ten crore!"; Pari: wild guess ✕ | r1, p1 |
| 5 | `hookD` | chaupal (blurred close-up) | Rounding card 42,538→43,000 + 23,184→23,000 = 66,000; "Smart guess = Estimate" | p2 |
| 6 | `hookE` | chaupal | Aaru jumps; "Go to the bazaar" sign | p3 |
| 7 | `level1` | bazaar (2593px wide, pans) | **GAME L1**: round price tags at 7 shops | — |
| 8 | `bridge1` | bazaar | Aaru celebrates, Pari sends us to the office | r2, p4 |
| 9 | `level2` | office | **GAME L2**: estimate the total of 7 bills | — |
| 10 | `bridge2` | office | Guddu amazed ("still on page two"); off to the Mela | g2, p5 |
| 11 | `level3` | mela ground | **GAME L3**: pay 7 shopkeepers from ₹6,00,000 | — |
| 12 | `endA` | mela → dusk crossfade | Sun sets, 7 bulbs, fireworks (no characters) | n3 |
| 13 | `endB` | mela dusk | Guddu: exactly ₹83,380 left; Pari: we said about ₹84,000; ≈ banner | g3, p6 |
| 14 | `endC` | mela dusk | Aaru: jalebi for everyone! Jalebi rain; narrator: gold badge; "Get my badge" button | r3, n4 |
| 15 | `badge` | — | Badge screen, "Play again" loops the flow | — |

The dialogue text lives in `TXT` at the top of `story.js`. Voice files use the same ids (`au/<id>.ogg` + `au/<id>.mp3`). If you change a line's text, **regenerate its voice** (§9), or the audio won't match.

## 5. Engine essentials (engine.js)

**Stage.** It is fixed at **1920×1080** and scaled to fit the window (`fit()`), so always use stage pixel coordinates. Layers from bottom to top:

- `#shaker > #world` (scene content)
- `#ui` (bubbles, cards, buttons)
- `#hud` (sun, chip, flowers)
- `canvas#fx` (particles)
- `#fade`
- `#wipe` (iris)
- `#skip`
- `#loader`

**Screen pattern:**
```js
async function myScreen() {
  SCN = 'myScreen'; hudState({...});          // SCN namespaces editor ids
  const s = newScene();                        // clears world/ui/particles
  bgImg(s, 'bg_02_chaupal');
  const pari = char(s, 'pari', 700, 'idle', { ground: 1040, scale: .9, flip: false, z: 6 });
  const tl = gsap.timeline();
  let t = say(tl, s, 0.5, 'p1', pari, T('p1'));  // returns end time (voice duration based)
  t = narrate(tl, t, 'n2', T('n2'));
  await reveal();                              // iris/fade in (depends on NEXT_IN)
  await playTL(tl);                            // resolves at end or on Skip
  await cutTo();  /* same location */          // or: await irisOut(); NEXT_IN='iris'
}
```

**Key helpers:**

- `el(tag, cls, parent, html, css)`
- `reg(el, name, kind)` registers the element for the editor and applies saved layout.
- `bgImg`, `char`, `pose(tl,t,o,p)`, `setPose(o,p)`, `talk(tl,t,o,d,id)`, `jump(tl,t,o,h,times,up)`, `say`, `narrate`, `sign`, `dropSign`
- `numbers`, `shake`, `birds`, `dust`, `petals`, `confetti`, `firework`, `jalebis`
- `sfx(name, gain, rate)` plays `au/sfx_<name>.mp3`.
- `voice(id)`, `playMusic(id, {gain, fade})`, `stopVoices()`
- `wait(sec)`
- `sunTo(tl, t, p, dur)` and `sunPos(p)`: `p` runs 0→1 across the sky.
- `setFlowers(n)` sets 0–7 marigolds.
- `irisOut`/`irisIn`, `fadeOut`/`fadeIn`

In story.js: `T(id)`, `reveal`, `cutTo`, `hudState`, `panel`, `officeFG`, `warmTint`, `goButton`, `waitClick`.

**Characters (`CH`):**

| key | name | base h | poses |
|---|---|---|---|
| pari | Pari (guide, estimation hero) | 540 | idle, point, happy |
| aaru | Aaru (excitable, "Correct-correct!") | 480 | run, shout, jump |
| baba | Baba (elder, holds the money) | 620 | idle, ask |
| guddu | Guddu Bhaiya (slow exact adder) | 640 | write, scratch, surprised, proud |
| manju | Manju Mausi (shopkeeper) | 580 | teach |
| gudiya | Gudiya (goat) | 250 | idle, hop |

Image names are `a/<key>_<pose>.webp`. `char()` returns `{root, body, imgs, pose, key}`. Ground is the y of the feet.

**Acting.** Each character's style comes from `ACT` (period, lift, lean, intro, jitter), and each line's mood from `MOOD` via `LINE_MOOD[id]`. `talk()` does **one** emphasis beat, then slow nods, then settles. **Don't tween `scaleY` on `.body`**, because that conflicts with the idle breathing tween.

**Dialogue boxes.**

- They use the user's Union PNGs (`db5`–`db8`) and **must never be stretched**. Only uniform `fitScale()` is allowed.
- Text is **Poppins SemiBold (600), 32px**, colour `#3a220f`.
- `bubbleFor()` chooses the box:
  - db6 oval if the text is ≤30 characters
  - db5 pill for Aaru and Guddu
  - db7 or db8 rect otherwise, by speaker side
- The image is mirrored if the tail points the wrong way, and the tail tip is aimed above the speaker's head.
- Box geometry (`DB`) holds w, h, tip and the inner text rect.
- Always `await document.fonts.load('600 32px Poppins')` before measuring (main() already does this).

**Narrator.** The `.narr` parchment panel sits top-left in Poppins 32px.

**Office z-order (level2 and bridge2).**

- Guddu stands **behind** the counter at z 5.
- `office_fg.webp` (the counter and chairs, cut from the bg) is at z 7.
- Pari is in front at z 8.
- The tint is at z 9.

Keep this order so no one looks like they're standing on a chair.

**Palette.** Brown ink `#3a220f`, cream `#fffaf0`, saffron `#e8870e` / `#f7b733`, red `#b5361d`, green money board `#1f6b3a` with gold `#d9a93a`. Headings use Baloo 2 800, UI numbers use Fredoka.

## 6. Audio

WebAudio buses: `musicBus`, `voiceBus` (voice ducks the music), `sfxBus`.

- `unlockAudio()` runs on the first gesture. A 🔇 "Tap for sound" pill appears whenever the AudioContext isn't running.
- `SKIPPING` (set while the Skip button fast-forwards) suppresses voice and SFX.

**Files:**

- **Music:** `m_title`, `m_village_long` (story), `m_hurry` (levels), `m_festive` (ending).
- **SFX:** boing, bubble, coins, confetti, cycle_bell, ding, drumroll_hit, goat, paper, pop, rise, scribble, sparkle, stamp, swish, tick, whoosh.
- **Voices:** t0, n1–n4, b1, g1–g3, p1–p6, r1–r3, x1.

## 7. Layout editor (temporary)

Open it with `?edit=1`, or with the **E** key when running locally.

- **Playback:** pause/play (it suspends the global GSAP timeline and the audio), scrub the timeline, and jump to any screen.
- **Moving objects:** click an object to select it. Picking uses `elementsFromPoint` because `#ui` captures pointer events. Then:
  - drag, or use the arrows (Shift for 10px steps)
  - `+`/`-` to scale, **F** to flip, **R** to reset
- **Text:** edit bubble and narrator text.

Edits are saved to localStorage `mela_layout`, and **Export JSON** downloads `mela_layout.json`.

**To make edits permanent:** replace `layout.json` with the exported file, then run `python3 build.py`, which regenerates `layout.js`.

Load priority is **localStorage > layout.js default**. Clear localStorage to see the baked defaults.

Schema:
```json
{ "version":1,
  "items": { "hookA.pari": {"dx":0,"dy":0,"s":1,"flip":false} },
  "text":  { "p1": "overridden line text" } }
```

Overrides use CSS `translate` and `scale` (individual properties), so they stack with GSAP transforms without conflicts. Element keys are `SCN + '.' + name`.

## 8. GAME INTEGRATION CONTRACT (the important part)

`level(n)` in story.js sets up the scene first:

- the background
- the characters
- the HUD chip
- the sun at `LEVELS[n].sun[0]`
- 0/7 flowers
- `m_hurry` music

Then it checks for a game:

```js
window.GAME_LEVELS = {
  1: async (api) => { /* play level 1; resolve when finished */ },
  2: async (api) => { ... },
  3: async (api) => { ... },
};
```

If `GAME_LEVELS[n]` exists, the placeholder card is hidden and the story **awaits your promise**. When the promise resolves, the story iris-wipes to the next bridge screen. Load the game script **after story.js is parsed but before the level runs**. Simplest: add `<script src="game.js"></script>` after `story.js` in `index.html`. `build.py` inlines every `<script src>` it finds in index.html automatically.

`api` contains:

| key | use |
|---|---|
| `n`, `level` | level number and `LEVELS[n]` = `{bg, chip, title, what, rule, sun:[start,end]}` |
| `scene`, `stage`, `world`, `ui`, `hud` | DOM nodes. Put game UI in `ui` (or `scene` for world-space items). |
| `IMG`, `BUF` | loaded images / decoded audio buffers |
| `sfx(name,gain,rate)`, `play`, `voice(id)`, `playMusic` | audio |
| `char`, `setPose`, `say`, `reg`, `el` | reuse story characters, bubbles and editor registration |
| `setFlowers(0..7)` | marigold progress in the HUD (1 per solved item) |
| `setChip(text)` | HUD chip text, e.g. "3 of 7 done" |
| `setSun(p)` / `sunTo(p, dur)` | move the sun; go from `level.sun[0]` → `level.sun[1]` as items are solved |
| `wait(sec)` | respects `?speed=` |

**Level specs** (from the storyboard; the full game sheet, screens 4–32, is still to come from the user):

- **L1 · Aakoli Bazaar:** 7 shops with price tags. The child rounds each price to the nearest **thousand**. Rule: hundreds digit ≥ 5 → round up, < 5 → round down. Manju Mausi and Pari are present, and the bazaar bg is 2593px wide and pans.
- **L2 · Panchayat Office:** 7 bills. Round each one, then add the round numbers to **estimate the total**. Guddu writes behind the counter, and a "7 bills left" badge (`reg` name `billsleft`) should count down.
- **L3 · Mela Ground:** pay 7 shopkeepers from **₹6,00,000** (the green "MELA MONEY" board, `reg` name `melamoney`). Round each bill, then **subtract** it from the remaining money.
- The ending says the exact money left is **₹83,380** and the estimate is **about ₹84,000**. **The game data must produce these numbers**, or `TXT.g3`/`TXT.p6` and their voices must be regenerated.
- **Feedback ideas already in the assets:**
  - `sfx_cycle_bell` for correct answers
  - `sfx_goat` / Gudiya hop for wrong answers (gentle)
  - `ding` plus a marigold per item
  - `coins` for paying
  - `stamp` for approving a bill
- Keep it kid-friendly: large tap targets (≥120px), Indian number format (`inr()` in story.js gives `₹6,00,000`), and no fail state. Retry with a hint.

**Recommended workflow:** build `game.js` so it works stand-alone first. For example, open `index.html?scene=level1` and it runs just that level with the story scene around it. Once all 3 levels work, run the full flow without `?scene` and rebuild.

## 9. Regenerating assets

- **Voices:** Gemini TTS `gemini-3.8-flash-tts`. Use this prompt format, because a plain "You are…" instruction gets read aloud:
  ```
  # AUDIO PROFILE: <Name>
  <short persona>
  ### DIRECTOR'S NOTES
  Style: <warm, playful, Indian English, pace…>
  #### TRANSCRIPT
  <line>
  ```
  - Voices: narrator **Sulafat**, Baba **Algenib**, Guddu **Fenrir**, Pari **Leda**, Aaru **Puck**, announcer **Sadachbia**.
  - Save the result as `au/<id>.mp3`, then make the Ogg: `ffmpeg -i au/<id>.mp3 -c:a libopus -b:a 48k -ac 1 au/<id>.ogg` (music: `-b:a 80k -vbr constrained`). Line timing follows voice duration automatically.
- **Music:** Lyria (`lyria-3-clip-preview` about 30s; `lyria-3.5` for long tracks).
- **API key:** never commit an API key to this folder. Use an env var such as `GEMINI_API_KEY`.

## 10. Gotchas

- GSAP overrides `transform`. Center elements with `xPercent:-50`, not CSS `translateX(-50%)`. Use `immediateRender:false` on `fromTo`s placed later in a timeline.
- Editor offsets use CSS `translate`/`scale`, and GSAP uses `transform`. Keep them separate.
- `newScene()` wipes `#world`, `#ui` and particles. Anything the game adds to `ui` is removed automatically on the next screen.
- Measure text only after fonts load.
- The ₹ glyph comes from the devanagari font subsets via `unicode-range`. Keep those `@font-face` rules.
- All coordinates are 1920×1080 stage px. Don't use `vw`/`vh` inside the stage.
- Audio won't start without a gesture, and preview panes and some embedded viewers block it. Test in real Chrome.
- `?scene=` runs one screen and stops. `?from=` continues and loops.

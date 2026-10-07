# CLAUDE.md — "The Mela Before Sunset" (story + game)

Context for any Claude session (VS Code, CLI, Cowork) working in this folder. **Read this first.**

## 1. What this is

An interactive **motion-graphic story + maths game** for **Grade 6** on **addition and subtraction by estimation**
(round to the nearest thousand, then add / subtract the round numbers).

- **One web app:** `index.html` + plain HTML/CSS/JS. No framework, no build step while developing. GSAP is the only library (`js/vendor/gsap.min.js`).
- The **story** plays continuously (no slide deck, no Next buttons). It is finished.
- The **game** plugs into the story through `window.GAME_LEVELS[n](api)` (§8).
  - **Level 1 · Aakoli Bazaar is built** (`js/game/`): how-to → teach → 7 shops → level complete, then the story's `bridge1` continues.
  - **Level 2 · Panchayat office is built** (`js/game/*2.js`, §8.5): how-to → try one → 7 bills (stamp the round total) → complete, then `bridge2`.
  - **Level 3 is still the story's placeholder** ("GAME PLUGS IN HERE" card + "Play demo ▶"). Build it the same way (§8.4).
- Design source: Figma file **"The Mela Before Sunset — Game Flows"** <https://www.figma.com/design/IN41gDRxuDd3crVbfeBEnU>.
  Page **"★ L1 · Clean build (game-ready)"** is what L1 implements (21 annotated frames); **"★ L2 · Clean build (game-ready)"** is what L2 implements (26 frames, L2 components on the Assets page). Pages **★ G3 / ★ G4** hold the gamified designs for the next levels.
- Pedagogy source: the storyboard `_source/notes/The_Mela_before_Sunset_-_Game.csv` (screens 4–34). **Never change the numbers, the 2-choice / 3-choice format or the 3-strike rule** without the user.

## 2. How to run

```bash
cd Mela_Story
python3 -m http.server 8123
# open http://localhost:8123/
```

Use Chrome or Safari (audio needs the "Tap to begin" gesture). `file://` mostly works, but use the server.

| URL param | Effect |
|---|---|
| `?scene=level1` | Run **only** that screen, then stop. Best for iterating. (Works for every id in §4.) |
| `?from=hookE` | Start at that screen and continue the flow. |
| `?speed=3` | Speed up all GSAP time (story + game). |
| `?scene=level1&shop=4` | Game: skip how-to/teach and start at shop 4. |
| `?edit=1` | Layout editor (§7). **E** also works locally. |
| `?qa=1` | QA shortcuts: a small **QA** tab (top-left of the window) that opens **Level 1 · Bazaar** / **Level 2 · Office**; each reloads into that game (`?from=levelN`, keeps `?speed=`). Always on locally and in the single file (file://); on the live site only with `?qa=1`; `?qa=0` hides it. `js/qa.js`. |

- **Single-file build** (to share/email): `python3 tools/build.py` → `dist/The_Mela_Before_Sunset.html` (~28 MB). It inlines all CSS, fonts, story images/audio **and the game art + game VO (mp3)** into `window.EMBED`. Rebuild after changes you want to share.
- **Vercel:** no build. This folder is the site. `vercel.json` sets cache headers; `.vercelignore` keeps `_source/`, `tools/`, `dist/`, docs out of the upload. Deploy with `npx vercel --prod`.
- **Git:** this folder is the repo (`main`, GitHub remote). The October 2026 reorganisation moved files (see §3) — commit it as one "restructure" commit.

## 3. Files

```
index.html              story stage + script order: gsap → story (layout, engine, story) → game (data … game.js) → editor
css/story.css           story styles (fonts @font-face, bubbles, signs, cards, HUD, buttons, wipe)
css/game.css            game styles — every rule scoped under #game, so it never touches the story
js/vendor/gsap.min.js
js/vendor/three.min.js  Three.js r149 UMD — only used by js/game/crumple.js (L2 paper squash)
js/story/engine.js      reusable engine: loading, audio buses, characters, acting, bubbles, HUD, particles, transitions
js/story/story.js       the story: dialogue (TXT), screens, LEVELS, FLOW, main()
js/story/editor.js      temporary layout editor
js/story/layout.json    saved layout edits (source of truth) → tools/build.py writes js/story/layout.js
js/game/data/level1.js  ALL L1 content: lines (storyboard wording), 7 prices, qLines(), allLines(), spoken()
js/game/markup.js       builds <div id="game"> inside #stage; GA(path) = game asset URL (or EMBED data URI)
js/game/audio.js        SND: game audio through the story engine (sfx, VO via BUF/voice(), replay)
js/game/stage.js        ST: number-line geometry (NL, vx), fmt/rs, particles, flyImg
js/game/hud.js          HUD (chip, 7 marigolds, sun tracker) + COACH (avatar + speech bubble, say/update)
js/game/gudiya.js       GUDIYA actor (sprite-ready poses: idle / hop / trot; leapTo, hopTo, trotTo, bleat, cheer)
js/game/scene.js        SC: price tag, number line, red/green markers, answer buttons, cart, rule strip, hand
js/game/level1.js       L1 flow: banner → how-to → teach → 7 shops (3-strike) → complete. LEVEL1_RUN()
js/game/data/level2.js  ALL L2 content: howto, example, teach (try one), 7 bills, oops/hint/nudge/idle, qLines(), allLines()
js/game/markup2.js      builds the L2 layer #l2 (pile, basket, bill paper, 3 stamps, ink pad, ball, #crumpleCv, #done2 card)
js/game/crumple.js      CRUMPLE: Three.js paper crumple / un-crumple of the bill (2D fallback without WebGL)
js/game/scene2.js       L2SC: Bill (enter, write, chips, mark, crumpleTo), Stamps (show, press = ink → thump → mark), Pile, Basket
js/game/level2.js       L2 flow: banner → how-to → try one → 7 bills (3-strike) → complete. LEVEL2_RUN()
js/game/game.js         window.GAME_LEVELS[1] / [2] = the hooks the story calls
assets/fonts/           Baloo 2, Poppins 600, Fredoka (latin + devanagari subsets for ₹)
assets/story/           story images (*.webp): backgrounds 2x, characters, mouths *_m, walk/run/trot frames, pari_explain_0–35 + pari_walk_0–19 (ludo.ai sheets), db5–db8, btn_*
assets/audio/           story + shared audio: voices (t0, n1–n4, b1, g1–g3, p1–p6, r1–r3, x1), music m_*, sfx_* (.ogg Opus + .mp3)
assets/game/            game art (*.webp): bg_bazaar, number line nl_*, cart_*, price tag, 3-slice buttons btn*_l/m/r, icons ic_*, characters
assets/game/            + L2: office_desk, bill_paper, bill_pile, checked_basket, ink_pad, paper_ball_1-3, stamp_mark, stamp_tool(_pressed), guddu_scratch/proud/surprised
assets/game/vo/         game voice lines L1_* (done) and L2_* (to generate) .wav/.ogg/.mp3 — made with tools/voice_studio.html
tools/build.py          single-file build → dist/
tools/voice_studio.html Gemini TTS for every game line (key pasted in the browser, never saved)
tools/convert_vo.sh     wav → trimmed -16 LUFS mp3 80k + ogg opus 48k (same as story voices)
dist/                   GENERATED single file (tracked, not deployed)
_source/                NOT part of the app (not deployed):
  figma_assets/         clean backgrounds bgc_*, nl_*/cart_* PNG masters, previews; g2/ = the 11 L2 PNG masters
  art_package/          character art tools (import_sheets.py → assets/story), refs, raw sprites
  Mela_Sprite_Sheets/   ChatGPT talking/movement sheets (input of import_sheets.py talk|cycles)
  manju_sprites/, guddu_sprites/  ludo.ai 6x6 talking sheets (import_sheets.py talk2 → assets/story/manju_talk_0–35, guddu_talk_0–35)
  aaru_sprites/         ludo.ai 6x6 sheet: Aaru running right, 36 frames that loop as a whole (import_sheets.py aaru2 → assets/story/aaru_run_0–35)
  pari_sprites/         ludo.ai 6x6 sheets: sheet_a = Pari explaining, sheet_b = Pari walking (input of import_sheets.py pari2; walk loop = frames 7–26)
  voice_samples/        Pari voice experiments (Indic Parler-TTS "Riya")
  game_ui_assets/       original game UI PNGs (ic_*, ui_*, sk_*, map_mela)
  notes/                storyboard CSVs, GAME_UI_PLAN.md, GAME_UI_PACKAGE.md, contact sheets
  archive/Mela_Game_v1_standalone/   the first stand-alone game build (reference only)
```

The original user art (character sheets, backgrounds, Union dialogue PNGs) is in the parent folder `character_package 2/`.

## 4. Story → screens (`FLOW` in story.js)

Village of **Apnapur**. It is Mela day. The Panchayat has **₹6,00,000** to buy things for the Mela, but the shops close at sunset. Guddu Bhaiya adds everything digit by digit and is too slow. Pari teaches **estimation** (smart guess). The child helps across 3 levels while the **sun sinks** (HUD sun tracker, top right).

| # | id | Location / bg | What happens | Lines |
|---|---|---|---|---|
| 1 | `title` | gate | Pari (namaste) and Aaru welcome us on the left, Gudiya on the right. No title card: the title is spoken (t0). Start button | t0 |
| 2 | `hookA` | gate → mela dusk → bazaar → mela → chaupal | **Opening montage** under n1: full frame (same aspect ratio as the rest of the story, no cinema bars), one slow camera move per shot, each cut on the spoken word. Shots: push through the gate ("Mela day in Apnapur") → dusk bulb strings ("lights") → sweet stall ("sweets") → pull back from the giant wheel. Then the chaupal: the green MELA MONEY board counts up to ₹6,00,000 on "six lakh rupees", and the sunset tracker pops in on "sun goes down". n1 is voice only. Then Baba asks; Guddu's muddle (`thoughts`) | n1, b1, g1 |
| 3 | `hookB` | chaupal | Guddu alone, pages flying, sun starts to sink (the tracker is already on from hookA) | n2 |
| 4 | `hookC` | chaupal | Aaru and Gudiya run in: "ten crore!"; Pari: wild guess ✕ | r1, p1 |
| 5 | `hookD` | chaupal (blurred close-up) | Rounding card 42,538→43,000 + 23,184→23,000 = 66,000; "Smart guess = Estimate" | p2 |
| 6 | `hookE` | chaupal | Aaru jumps; "Go to the bazaar" sign | p3 |
| 7 | `level1` | game layer (clean bazaar) | **GAME L1 (built)**: round price tags at 7 shops → `js/game/` | game VO L1_* |
| 8 | `bridge1` | bazaar | Aaru celebrates, Pari sends us to the office | r2, p4 |
| 9 | `level2` | office | **GAME L2**: estimate the total of 7 bills | — |
| 10 | `bridge2` | office | Guddu amazed ("still on page two"); off to the Mela | g2, p5 |
| 11 | `level3` | mela ground | **GAME L3**: pay 7 shopkeepers from ₹6,00,000 | — |
| 12 | `endA` | mela → dusk crossfade | Sun sets, 7 bulbs, fireworks (no characters) | n3 |
| 13 | `endB` | mela dusk | Guddu: exactly ₹83,165 left; Pari: we said about ₹84,000; ≈ banner | g3, p6 |
| 14 | `endC` | mela dusk | Aaru: jalebi for everyone! Jalebi rain; narrator: gold badge; "Get my badge" button | r3, n4 |
| 15 | `badge` | — | Badge screen, "Play again" loops the flow | — |

The dialogue text lives in `TXT` at the top of `story.js`. Voice files use the same ids (`assets/audio/<id>.ogg` + `.mp3`). If you change a line's text, **regenerate its voice** (§9), or the audio won't match.

## 5. Story engine essentials (js/story/engine.js)

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
- `thoughts(s, tl, o, [{txt, at}], {avoid, until, sinkTo})`: numbers pop out of a character's head as they're said and hang around it, skipping any spot that overlaps `avoid` (their speech bubble) or leaves the stage. At `until` they get sucked into `sinkTo`. Used for Guddu's muddle in hookA, timed to g1's Whisper word times. He keeps the `scratch` pose until "Let me write…".
- `move(tl, t, o, cycle, from, to, dur, {ease, end, enter})`: walk/run/trot (`'walk'` Pari, `'run'` Aaru, `'trot'` Gudiya). Slides the character from x offset `from` to `to` while the cycle frames play. The frame follows the distance travelled, so the feet never slide. The frames face right and are mirrored when moving left. `enter: true` places them at `from` at once (entrance from off screen); `end` is the pose to settle into. Used for the entrances (title, hookC) and the exits (hookE, bridge1, bridge2).
- **Acting while talking:** acts use mode 'iol' (Pari explain) or 'pp' (Manju/Guddu talk: forward and back, then glide back to frame 0). Guddu's `talk` plays on g2 (bridge2, end 'surprised') and g3 (endB, end 'proud'); officeGuddu() grades his frames too. `say(..., { act: 'explain', end: 'happy' })` plays `CH[key].acts.explain` instead of the pose + mouth: frames 0–4 hands come apart, 5–30 loop while the voice plays (her mouth moves in the drawing), 31–35 hands back together, then the `end` pose (namaste `happy` matches the last frame). Used for Pari's explaining lines p2 (hookD), p4 (bridge1), p5 (bridge2), p6 (endB); p1/p3 keep `point` (she points at Aaru / the way). Skip jumps straight to the end pose; walking cancels an act.
- **Talking mouths:** `say()` turns the speaker's mouth on for the line. The pose image and its overlay `assets/story/<key>_<pose>_m.webp` alternate in step with the voice loudness (an AnalyserNode on `voiceBus`). With no audio, the mouth flaps at a speech rhythm. Which poses have one is `CH[key].talk` (`{pose: 'open'|'closed'}`, the mouth the overlay shows).
- `sfx(name, gain, rate)` plays `assets/audio/sfx_<name>` (ogg, mp3 fallback).
- `voice(id)`, `playMusic(id, {gain, fade})`, `stopVoices()`
- `wait(sec)`
- `sunTo(tl, t, p, dur)` and `sunPos(p)`: `p` runs 0→1 across the sky.
- `setFlowers(n)` sets 0–7 marigolds.
- `irisOut`/`irisIn`, `fadeOut`/`fadeIn`

In js/story/story.js: `T(id)`, `reveal`, `cutTo`, `hudState`, `panel`, `officeFG`, `warmTint`, `goButton`, `waitClick`.

**Characters (`CH`):**

| key | name | base h | poses |
|---|---|---|---|
| pari | Pari (guide, estimation hero) | 540 | idle, point, happy |
| aaru | Aaru (excitable, "Correct-correct!") | 480 | run, shout, jump |
| baba | Baba (elder, holds the money) | 620 | idle, ask |
| guddu | Guddu Bhaiya (slow exact adder) | 640 | write, scratch, surprised, proud |
| manju | Manju Mausi (shopkeeper) | 580 | teach |
| gudiya | Gudiya (goat) | 250 | idle, hop |

Image names are `assets/story/<key>_<pose>.webp`. `char()` returns `{root, body, imgs, pose, key}`. Ground is the y of the feet.

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

**Narrator.** The narrator is **voice only**: no narration text anywhere (no panel, no subtitles). Use `voiceOver(tl, t, id)`. It plays the voice at t+.1 and returns the time the next beat may start. The old parchment panel `narrate()` is still in engine.js but unused. Speech bubbles for characters stay.

**One aspect ratio.** The whole story is full-frame 16:9. Don't add letterbox or cinema bars to single scenes.

**Cinematic shots.** `shot(parent, bg)` puts a background on its own camera layer. `camMove(tl, shot, t, dur, {x,y,s}, {x,y,s})` eases the camera (keeps stage point x,y centred at zoom s, and never shows the image edge).

**Office z-order (level2 and bridge2).**

- Guddu stands **behind** the counter at z 5. Always create him with `officeGuddu(s, pose)` (story.js). It fixes his spot, size and warm grade for every office shot, and adds a soft wall shadow (z 4) and counter contact shade (z 8). The counter hides him from the waist down, and the register stack overlaps his arm.
- `office_fg.webp` (the counter, chairs, **and the register stack + wooden tray that sit on the counter**, cut from the bg) is at z 7.
  It must stay pixel-aligned with `bg_04_office.webp`. If the office bg ever changes, re-cut it with the same mask.
- Pari is in front at z 8.
- The tint is at z 9.

Keep this order so no one looks like they're standing on a chair.

**Palette.** Brown ink `#3a220f`, cream `#fffaf0`, saffron `#e8870e` / `#f7b733`, red `#b5361d`, green money board `#1f6b3a` with gold `#d9a93a`. Headings use Baloo 2 800, UI numbers use Fredoka.

## 6. Audio

WebAudio buses: `musicBus`, `voiceBus` (voice ducks the music), `sfxBus`. Music level: `MUSIC_LEVEL` 0.4, ducked to `MUSIC_DUCK` 0.14 under voices (engine.js; lowered from 0.55/0.2 in Oct 2026 — the user found it overwhelming).

- `unlockAudio()` runs on the first gesture. A 🔇 "Tap for sound" pill appears whenever the AudioContext isn't running.
- `SKIPPING` (set while the Skip button fast-forwards) suppresses voice and SFX.

**Files:**

- **Music:** `m_title`, `m_village_long` (story), `m_hurry` (levels), `m_festive` (ending).
- **SFX:** boing, bubble, coins, confetti, cycle_bell, ding, drumroll_hit, goat, paper, pop, rise, scribble, sparkle, stamp, swish, tick, whoosh, **whoosh_soft, swish_soft**. The game maps whoosh/swish to the soft versions (`NAME` in js/game/audio.js: high hiss filtered out, level matched to the bell/ding — the user found the originals harsh in L1); the story keeps the originals for its iris wipes. The cart drop is a soft pop + ding (coins are for paying in L3).
- **Voices:** t0, n1–n4, b1, g1–g3, p1–p6, r1–r3, x1.

## 7. Layout editor (temporary)

Open it with `?edit=1`, or with the **E** key when running locally.

- **Playback:** pause/play (it suspends the global GSAP timeline and the audio), scrub the timeline, and jump to any screen.
- **Moving objects:** click an object to select it. Picking uses `elementsFromPoint` because `#ui` captures pointer events. Then:
  - drag, or use the arrows (Shift for 10px steps)
  - `+`/`-` to scale, **F** to flip, **R** to reset
- **Text:** edit bubble and narrator text.

Edits are saved to localStorage `mela_layout`, and **Export JSON** downloads `mela_layout.json`.

**To make edits permanent:** replace `js/story/layout.json` with the exported file, then run `python3 tools/build.py`, which regenerates `js/story/layout.js`.

Load priority is **localStorage > layout.js default**. Clear localStorage to see the baked defaults.

Schema:
```json
{ "version":1,
  "items": { "hookA.pari": {"dx":0,"dy":0,"s":1,"flip":false} },
  "text":  { "p1": "overridden line text" } }
```

Overrides use CSS `translate` and `scale` (individual properties), so they stack with GSAP transforms without conflicts. Element keys are `SCN + '.' + name`.

## 8. GAME (the important part)

### 8.1 Contract with the story
`level(n)` in story.js builds its scene (bg, characters, HUD chip, sun at `LEVELS[n].sun[0]`, 0/7 flowers, `m_hurry` music),
then — if `window.GAME_LEVELS[n]` exists — hides the placeholder card and **awaits** it. When the promise resolves the story
iris-wipes to the next bridge. Game scripts load after story.js (see index.html); `tools/build.py` inlines every `<script src>`.

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

### 8.2 How Level 1 is wired (`js/game/game.js`)
- The game is its own layer `<div id="game">` (z 45: above story `#ui`/`#hud`, below `#fade`/`#wipe`/`#loader`), built by `markup.js` at load and hidden.
- `GAME_LEVELS[1](api)`: sets `LEVEL1.sun = api.level.sun`, hides the story scene + story HUD, shows `#game`, runs `LEVEL1_RUN({ startAt, skipIntro, embedded:true })`,
  then `api.setFlowers(7)`, `api.setSun(level.sun[1])`, hides `#game` and shows the story HUD again → story continues to `bridge1`.
- In the story, the game's complete card skips its own Aaru/Pari lines because `bridge1` says them (r2, p4).
- **Audio:** `SND` uses the story engine globals (`sfx`, `voice`, `stopVoices`, `BUF`, `DUR`, `AC`). Game VO files are decoded once into `BUF['L1_…']` and played with `voice()`, so they duck the music like story lines. No VO yet → lines show for a reading time (`ST.readTime`), and the 🔊 button uses the browser voice.
- **Assets:** always reference game art through `GA('file.webp')` (JS) or `url(../assets/game/…)` (CSS) so the single-file build can embed it.
- **Coach (hud.js → `CAST`, `SPOTS`, `COACH.step`):** full-body talking sprites, same frames as the story's `CH[key].acts` (`IMG[...]`); each plays its loop while its VO plays. **L1 steps with the stage:** `'front'` while the stage is clear (Pari feet at (150, 1050), Manju at (1715, 958), full size); when the number line comes up they shift to the **far edges, small** (`'back'`: ×0.72, feet on the ground — Pari (122, 1046), Manju (1800, 1046)) with the bubble above them and its tail pointing down (`.tailD`). The number line was narrowed to x 470–1450 (`NL`, `#nlBar` 428/1064) so the game happens in the middle between them; Manju is dismissed when the answer buttons come (the right edge is Gudiya's). They stay at the edges through the cart moment. The bubble follows the speaker's face (`placeBubble`; `.posR`/`.tailR` for Manju). Manju: `COACH.dismiss('manju')` after the teach. **L2 `'desk'`:** Pari (140, 778) and Guddu (800, 870) behind the desk, cut at its top edge; `COACH.present('guddu')` at L2 start; fixed bubble with the tail flipping to Guddu. Aaru still uses the round `#avatar`.
- **Naming:** game globals are `ST, SC, HUD, COACH, GUDIYA, SND, GA, LEVEL1, LEVEL1_RUN`; game ids/classes that could clash are prefixed (`#gBg #gHud #gChip #gFx #gToast #gSun`, `.gbtn .gcard .gchip .gbody .gshadow .gdust .m-on/.m-off`). Keep new game CSS under `#game`.

### 8.3 Level 1 design rules (agreed with the user — keep them)
- **One new thing at a time:** tag drops in (bubble: first sentence) → number line draws + red arrow slides to the price → two answer buttons pop in at the ends of the line.
- **No Next buttons, no tap to continue.** The game moves on by itself: intro/teach lines advance when their VO ends (+0.6 s), the level banner after 2.2 s, and the level-complete card after 3 s (tapping "Go to the office" only goes sooner). The only taps are the answers and **Skip ⏭** (jumps to Shop 1). The teach round shows the hand on 35,000.
- **3-strike (storyboard):** wrong 1 → "Oops…" + red wiggle + Gudiya bleat · wrong 2 → hint line + hundreds digit glows + rule strip · wrong 3 → nudge line + wrong fades + right glows + hand. **10 s idle** → idle line once + pulse + arrow bounce.
- **Correct:** bell + green ✓ → red arrow pops → **Gudiya leaps onto the line at the price and hops to the round number** (hops ∝ distance) → green arrow lands above her → tag flips to a red stamp → **the cart moment** (`Cart.moment`, user request Oct 2026): the line, buttons and markers clear, the cart rolls along the ground from off-screen left to the centre (×1.3 at 960, 628; a small wheel bob, `rollBob`), the item drops into it from the tag (pop + ding, n / 7 pops, sparks), **Gudiya leaps to the cart's left and jumps for joy** (`GUDIYA.joy`) → the cart **rolls on out to the right, off the scene** (`Cart.leave`; user: "it should simply go left to right") while the marigold flies from the cart to the HUD and the sun steps → next shop after 2 s.
- **Stars:** first try gold · after Oops/Hint silver · after hand none. Level: ≥6 gold → 3★, ≥4 → 2★, else 1★ (`window.GAME_RESULT.level1`).
- Clean backgrounds, low cognitive load, big targets (buttons 320×120), Indian number format, no fail state.
- Gudiya's hop is **sprite-ready**: replace `GUDIYA_POSES.hop` with a sheet (`{sheet, cols, rows, frames, fps, aspect, cx, foot, face, once:true}`) — nothing else changes. The user will supply the sprite.

### 8.4 Building Level 3 (next)
1. Design reference: Figma page **"★ L3 · Clean build v3 (final art)"** — 19 annotated, wired frames + a **DEV SPEC** frame (state machine, layer order, coordinates, data, asset list). Concept: Pari pushes Baba's money cart down a dark lane; per stall: bill drops on the hook → tap the slate with the money left → Aaru pays → the stall lights; finale = wheel_rotor spins. No speech bubbles / chip / sun panel in L3. Art: `mela_game_assets_webp/` (+ `lane_layout.json`, sprite-sheet JSONs).
2. Content: add `js/game/data/level3.js` from the storyboard — exact numbers and lines; 3 answer choices.
3. Reuse ST/SC/HUD/COACH/GUDIYA/SND; add level-specific pieces (bill paper card, Mela money board, bulb string) as new modules; register `GAME_LEVELS[2]` / `[3]` in `game.js`.
4. Add the new VO ids to `allLines()` so the Voice Studio picks them up.
5. **Maths check before building L3:** the storyboard's seven exact bills total ₹5,16,835 → exact money left **₹83,165**, but the story ending (`TXT.g3`, endB banner, g3 voice) says **₹83,380**. Ask the user which to change (fixing the story line + re-voicing g3 is the smaller change). The running estimate ends at ₹84,000 ✓.
6. The story's L3 placeholder has a MELA MONEY board (`melamoney`) — the game layer covers it; reuse the idea inside the game.

### 8.5 How Level 2 is wired
- `GAME_LEVELS[2](api)` hides the story scene + HUD, runs `LEVEL2_RUN({ startAt, skipIntro })`, then `setFlowers(7)`, `setSun(level.sun[1])`. `GAME_LEVELS[1]` hides `#l2`, so the levels never show each other's pieces.
- Test one bill: `?scene=level2&bill=N` (1–7). Whole hand-off: `?from=bridge1`.
- Layout (Oct 2026 recomposition, user: "reduce the wooden desk, characters + bills are the major components"): `office_desk_l2.webp` is the `#gBg` (office_desk re-cut: tall wall, only the desk top; **desk top edge y 860**). Bill 620×775 at (1000,196) is the hero; 3 stamps at x 50 + i·265, y 740; ink pad (812, 952); pile (1650, 775) and CHECKED basket (1650, 930) at 80%. Pari (190, 1151, ×1.5) and Guddu (815, 1193, ×1.45) behind the desk (clip y 862, divided by the scale in `place()`), bubble fixed between them (left 300, bottom 548, 420 wide). **L2 hides the chip, marigolds and sunset tracker** (`#gChip #mariPlate #sunPanel`, shown again after / in L1); the marigold count still runs (`HUD.lit`) so the story gets 7 flowers. **No race panel.**
- Round: a paper ball flies off the pile and **un-crumples** into the bill → the items write in → Pari asks → 3 stamps rise. Correct: blue chips show the rounding → the stamp dips in the ink pad, thumps the bill (pressed art, squash, shake, red sparks) → stamp mark with the value → the bill is **packed** (`Bill.packTo`): folds in half bottom-up, in half again right-over-left, a red band + knot tie it, and the packet drops into the CHECKED basket. A new bill arrives the other way: a packet flies off the pile and unfolds (`Bill.enter`).
- **Packing** (scene2.js `foldTL`): CSS 3D pieces cut from the bill's canvas twin (`drawBill`), no WebGL. The old Three.js crumple (`crumple.js` + `three.min.js`, 600 KB) is retired to `_source/archive/crumple/`; `Bill.crumpleTo` is kept as an alias of `packTo`.
- Same rules as L1 (§8.3): no taps but answers + Skip, auto-advance, 3-strike (Oops + Gudiya bleat / yellow hint chips / fade + glow + hand), 10 s idle, stars.
- Coach: full-body Pari in L2 too — L2 sets `COACH.pariSpot = 'desk'` (same spot as L1, cut at the desk's top edge y 532 so the stamps stay clear) and back to `'stand'` at the end. `COACH.fullPari = false` would fall back to the round avatar. Guddu Bhaiya speaks via the round avatar (`WHO.guddu`, guddu_scratch.webp).
- VO ids are `L2_*` (42 lines from `LEVEL2.allLines()`), **all generated** (Oct 2026, `tools/gen_vo.mjs`, which now reads L1 + L2 = 92 lines like the Voice Studio; Guddu = Fenrir) and checked by transcribing them back (4 slips remade: a doubled line, invented "Okay…" openers). Guddu's teach line is 12.8 s: he speaks both numbers slowly, in character.

### 8.6 How Level 3 is wired (Mela Ground · Pari's money cart)
- Design: Figma ★ L3 · Clean build v3 (section 132:4, 19 frames) + DEV SPEC 137:343; build prompt `_source/notes/L3_BUILD_PROMPT.md`. Art: `assets/game/l3/` (pack + lane_layout.json kept in `_source/l3_asset_pack/`), plus `sk_*` badges and `money_board` converted from `_source/game_ui_assets`.
- Files: `js/game/data/level3.js` (lines, numbers, choices, hooks/boxes/signs, `qLines`, `allLines` → 42 `L3_*` ids), `markup3.js` (#l3 layer, own stacking context z 5), `scene3.js` (L3SC: Cam, Pari push sheet, Waves, Cart + Panel, Minus, Bill, Slates, Aaru, Coins, Stall, Sun, Fw, Wheel, Map, Baba), `level3.js` (flow, `LEVEL3_RUN`), CSS block `#game #l3 …`. `GAME_LEVELS[3]` in game.js. `?scene=level3&bill=N` jumps to payment N. QA tab has a Level 3 button.
- Camera: world x = screen x + `Cam.x`; `Cam.x = hook[i].x − 1180`; finale camera 3840. Left of the lane: `#pad3` mirrors the lane's ground strip (y ≥ 756). How-to 3 zooms the world to 1/3 (`Map.on`) with `#ground3` filling below.
- Loop per payment: PUSH (1.4 s, wheels distance/80 rad, pari_push 24 fps, speed lines) → DROP (bill −150 → hook, swing −9° elastic) → ASK (VO; bill glows at 12 % of the line, panel + cart at 45 % — no word timings) → "−" pops → slates rise (stagger .12) → 3-strike as L1/L2 (Oops + Gudiya trot/bleat · Hint + yellow ≈ chip + "−" glow · Nudge: others fade 35 %, hand) · idle 10 s once → PAY (bell, slate ✓, blue ≈ chip, Aaru runs in, 5 coins arc bag → potli, duster wipes) → LIGHT (chalk writes "≈ ₹…", Aaru runs to the stall, PAID stamp, `.lit3` crossfade + light_burst, marigold from the bill, sun sinks 60 px) → slates sink, bill flies off. Running total = ROUNDED values (`moneyBefore`).
- No bubbles in L3: `COACH.voiceOnly = true` + `COACH.onTalk` → talk waves at the speaker's head (`Waves`; Pari / Baba). HUD: only 🔊 (moved to y 34) + marigolds; chip + sun panel hidden; all restored at the end.
- Finale: lane + lit layer clipped before x 4960 (except the ground), wheel_stand + wheel_rotor (750 px at 4960, 49) — rotor spins 360°/8 s easing in; whole lane crossfades to lit; firework_sheet ×3 twice; m_festive. Complete card (Figma 19): stars, 7 shop badges, MONEY LEFT ≈ ₹84,000, auto 3 s → story `endA`.
- Connected staging (Oct 2026 fix, user: "Aaru looks odd, the board and the tyres look copy-pasted"): the cart wheels sit **behind** the body with their hubs on its bottom rail and roll on the ground (y 433 in the cart) with a contact shadow; the bill hangs **on** a drawn iron hook (`#hook3`, over the rope loop, at the stall hook point), pivots on its loop, casts a shadow and sways gently; **Aaru runs on the same ground line as Pari and the cart** (feet y 990, 360 px tall, ground shadow), the slates sink before he comes, he hops by the cart with the potli held up in his raised fist (coins arc into it), runs to the stall, the potli flies onto the bill → PAID, then he runs off right.
- Agreed with the user (Oct 2026): how-to says "lights up one stall of the Mela!"; the exact money left is ₹83,165 (story ending changed to match).

## 9. Regenerating assets

- **Story voices:** Gemini TTS `gemini-3.8-flash-tts`, prompt format:
  ```
  # AUDIO PROFILE: <Name>
  <short persona>
  ### DIRECTOR'S NOTES
  Style: <warm, playful, Indian English, pace…>
  #### TRANSCRIPT
  <line>
  ```
  Voices: narrator **Sulafat**, Baba **Algenib**, Guddu **Fenrir**, Pari **Leda**, Aaru **Puck**, announcer **Sadachbia**; game adds Manju Mausi **Gacrux**.
  Save `assets/audio/<id>.mp3` (re-encode to 56k mono like the others: `-ac 1 -b:a 56k`), then `ffmpeg -i <id>.mp3 -c:a libopus -b:a 48k -ac 1 <id>.ogg` (music `-b:a 80k -vbr constrained`).
- **Game voices (terminal):** `GEMINI_API_KEY=… node tools/gen_vo.mjs` (same model, voices, prompts and spoken numbers as the studio; skips lines that exist, `--force id…` remakes some), then `tools/convert_vo.sh`. All 92 game lines (L1 + L2) were made this way (Oct 2026) and checked by transcribing them back with Gemini. The `.wav` masters live in `_source/game_vo_masters/` (gen_vo.mjs writes there, convert_vo.sh reads there); the game loads `.ogg`, then `.mp3`.
- **Game voices (browser):** open `tools/voice_studio.html` (Chrome; via the local server if `file://` blocks the request) → paste key → choose this folder → **Generate missing lines** → writes `assets/game/vo/L1_*.wav`. Then `tools/convert_vo.sh` for ogg/mp3 (needed for the single-file build). Big numbers are spoken in Indian English words by `LEVEL1.spoken()`.
  Cloud/agent shells may not reach `generativelanguage.googleapis.com` (egress policy); then use the studio in the browser. The local Mac terminal can.
- **Asset masters (Oct 2026 size pass):** the originals of every image/audio file are in `_source/asset_masters/` before re-encoding (frames ~1.25× their largest on-screen size, webp q78; poses + mouths 1080 tall q85, same factor so they stay aligned; backgrounds same size q80; voice MP3s 56k mono; music and Ogg untouched). Re-encode from there if quality ever needs to go back up. Story images 17.2 → 12.6 MB, voice MP3s 4.9 → 3.5 MB, single file 36 → 28 MB.
- **Game VO end click (fixed Oct 2026):** Gemini TTS ends every clip with a ~120–190 ms loud, DC-offset burst after the speech (heard as a "cable dropping" thud when a line ends). All 92 masters were trimmed (raw copies in `_source/game_vo_masters/_raw_with_end_click/`) and `gen_vo.mjs` strips it automatically (`stripEndBurst`). The engine also fades a voice out over 30 ms when it is cut (`fadeStop`) and ramps the music back up instead of jumping.
- **Loading:** engine `loadAll` waits only for what the opening needs; the talking/explaining frames (`pari_explain`, `manju_talk`, `guddu_talk`) load in the background after it (`LATER`).
- **Sprites/mouths:** `python3 _source/art_package/tools/import_sheets.py talk|cycles|pari2` → writes into `assets/story/`. Manju Mausi's sprites are coming next: give her an `acts.explain` the same way and a full-body coach like Pari's.
- **Music:** Lyria (`lyria-3-clip-preview` ≈30 s; `lyria-3.5` long).
- **API keys: never write a key into any file in this folder** (no .env either). Ask the user to paste it into the Voice Studio, or use an env var for a one-off script outside the repo.

## 10. Gotchas

- GSAP overrides `transform`. Center elements with `xPercent:-50`, not CSS `translateX(-50%)`. Use `immediateRender:false` on `fromTo`s placed later in a timeline.
- Editor offsets use CSS `translate`/`scale`, and GSAP uses `transform`. Keep them separate.
- `newScene()` wipes `#world`, `#ui` and particles. Anything the game adds to `ui` is removed automatically on the next screen.
- Measure text only after fonts load.
- The ₹ glyph comes from the devanagari font subsets via `unicode-range`. Keep those `@font-face` rules.
- All coordinates are 1920×1080 stage px. Don't use `vw`/`vh` inside the stage.
- Audio won't start without a gesture, and preview panes and some embedded viewers block it. Test in real Chrome.
- `?scene=` runs one screen and stops. `?from=` continues and loops.
- Game: if you rename a game id or class, update `js/game/markup.js`, `css/game.css` and the JS that queries it together.
- Game: `newScene()` does not clear `#game` (it is outside `#world/#ui`) — `level1.js → reset()` resets it at every run (the story loops on "Play again").
- Game VO missing → the game fetches 3 ids, sees none and stops asking (`SND.preload`) and shows lines for a reading time instead. (L1 has all its VO now.)
- Running git from the Cowork device shell can leave `.git/index.lock` behind — delete it if git in VS Code says another process is running.


## 11. Status & next steps (Oct 2026)

- [x] Story complete · [x] Level 1 game (clean, storyboard-faithful, plugged in) · [x] project restructured
- [x] L1 voices generated (50 lines, Gemini TTS) and converted · [x] game progresses on its own (no tap to continue)
- [ ] Listen through L1 once with sound and tweak timing if any line feels rushed
- [ ] Gudiya hop sprite sheet from the user → `GUDIYA_POSES.hop`
- [x] Level 2 (Panchayat office, 7 bills, stamps + Three.js paper crumple) — §8.5
- [ ] Generate L2 voices in tools/voice_studio.html (it skips the L1 files that exist), then tools/convert_vo.sh
- [ ] Level 3 (Mela ground, pay & money left) — §8.4
- [x] Ending fixed to ₹83,165 (TXT.g3 + endB banner + g3 voice re-made, Fenrir; master in `_source/story_vo_masters/g3.wav`)
- [x] Level 3 built (§8.6) with all 42 L3_* voices (Pari = Leda, Baba = Algenib), checked by transcription
- [ ] Rebuild `dist/` and deploy when a level is done

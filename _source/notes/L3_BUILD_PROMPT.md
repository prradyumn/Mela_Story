# Build Level 3 (Mela Ground · "Pari's money cart") — prompt for VS Code Claude

You are working in the Mela_Story project (story + game, plain HTML/CSS/JS + GSAP, no build step).
Levels 1 and 2 are built and plugged into the story. Your job: build **Level 3** the same way, from the finished Figma design, and plug it in at `window.GAME_LEVELS[3]`.

## 0. Read first (in this order)
1. `CLAUDE.md` (whole file — structure, story↔game contract, §8.3 L1 rules, §8.4/8.5, gotchas). The L3 entry in §8.4 points at the Figma page below.
2. `js/game/game.js`, `js/game/level2.js`, `js/game/scene2.js`, `js/game/markup2.js`, `js/game/data/level2.js`, `js/game/hud.js` — L3 must copy L2's patterns (beat(), play() 3-strike, banner(), complete(), reset(), run({startAt, skipIntro}), Skip ⏭, idle 10 s, stars, VO through SND, GA() asset paths, CSS scoped under #game).
3. `_source/notes/The_Mela_before_Sunset_-_Game.csv` rows 25–33 (storyboard screens 24–32): every L3 line, number, answer choice, Oops / Hint / Nudge / idle text. **Use this wording and these numbers exactly.**
4. `mela_game_assets_webp/` — README.txt, asset_manifest.json, **lane_layout.json** (hook positions, wheel pivot, pathTop), pari_push_sheet.json, firework_sheet.json.

## 1. Figma (design source — use the Figma MCP)
File: **The Mela Before Sunset — Game Flows** · fileKey `IN41gDRxuDd3crVbfeBEnU`
Page: **★ L3 · Clean build v3 (final art)** → https://www.figma.com/design/IN41gDRxuDd3crVbfeBEnU/The-Mela-Before-Sunset?node-id=132-4
- Section `132:4` — 19 frames (1920×1080 = stage px, 1:1 with the game) + an annotation card under each frame (VO line + ANIM notes) + a wired prototype (flow "L3 · Mela Ground · Pari's money cart (final art)").
- **DEV SPEC frame `137:343`** — state machine, layer order with exact coordinates, world geometry, camera formula, data table, asset list. Treat it as the spec.
- Frame ids: 01 banner `133:24` · 02 Baba hands over the cart `133:54` · 03 paying = less `133:88` · 04 lane map `133:131` · 05 teach-1 `133:54299` · 06 teach tap `133:54341` · 07 teach ✓ `133:54399` · 08 PUSH `133:54531` · 09 DROP `133:54494` · 10 ASK `133:54564` · 11 IDLE `133:54618` · 12 WRONG1 `133:54672` · 13 WRONG2 `133:54730` · 14 WRONG3 `133:54786` · 15 PAY `134:442` · 16 LIGHT `134:511` · 17 Q2 ask `132:54190` · 18 FINALE wheel `135:522` · 19 complete `135:570`.
- Use `get_screenshot` (fileKey + nodeId) to see frames, `get_metadata` / `get_design_context` for positions, names and the annotation text. Layer names say what each thing is ("pari (pari_push sheet · frame 0)", "panel value (live)", "lit · stall 1", "wheel rotor (spins about 5335,424)" …).
- Do NOT export art from Figma — the real files are already in the project (below). Figma is for layout, states and motion notes only. Don't edit the Figma file.

## 2. The game in one paragraph
Dark Mela lane at sunset, 7 stalls + a giant wheel. Pari pushes Baba's money cart; its chalk panel shows the live money (₹6,00,000 → "≈ ₹…" after each payment). For each of the 7 stalls: the cart rolls up (camera pans) → the shopkeeper's bill drops onto the stall hook and swings → Pari asks → the child taps one of 3 answer slates (takhti) with "about how much money is left" → Aaru runs in, coins go into his potli, the duster wipes the panel and the new rounded total is chalked in → Aaru runs the money to the stall, PAID stamps the bill → **that stall lights up** (dark→lit crossfade + light burst), a marigold lights, the sun sinks a step. After payment 7 the whole lane lights and the giant wheel spins with fireworks. **Decluttered on purpose:** no speech bubbles, no round avatar, no level chip, no sun panel, no "=". Characters talk (VO + subtle talk waves), the number being spoken glows, 🔊 replays. Keep only: cart, bill, "−", 3 slates, 7-marigold strip, 🔊, Skip.

## 3. Assets
- New L3 art: `mela_game_assets_webp/*.webp` → move/copy to `assets/game/l3/` (keep names) and reference with `GA('l3/…')`. sky_dusk (opaque, fixed), sun_disc, mela_lane_dark + mela_lane_lit (5760×1080, identical geometry — the lane scrolls; dark→lit per stall), money_cart (no wheels), cart_wheel (×2, rotate in code), potli, coin, duster, bill_hang (blank), takhti (blank face), light_burst, wheel_rotor + wheel_stand (1000×1000, pivot 500,500), firework_sheet (6×6, 256², 24 fps, anchor centre), pari_push_sheet (6×6, 352×304, 24 fps, anchor bottom-centre).
- All text is live (prices, shop names on the blank signboards, slate values, panel value).
- Reused sprites: Pari explain frames `assets/story/pari_explain_0–35` (if you need a non-pushing talk pose), Aaru `assets/story/aaru_run_0–35` (9 fps, see engine.js CH.aaru.cycles.run) + aaru_jump, Gudiya `assets/game/gudiya_trot_0–3` + GUDIYA actor (bleat), Baba `baba_idle/baba_ask` (story), stamp_mark (PAID), ui_hand, stars, marigold HUD.
- Left of the lane (camera < 0) there is no art: extend the ground (mirror the lane's bottom strip, y ≥ 756) or start the camera at 0 and give the cart its own entrance.
- Finale: the lane art has the wheel baked in. Hide it (clip the lit lane before x 4960 + show only the ground under the wheel) and draw wheel_stand + wheel_rotor centred on the pivot (5335,424) at ~750 px; spin the rotor.

## 4. Mechanics (see DEV SPEC for numbers)
- Camera: `camera.x = hook[i].x − 1180` so the active hook sits at screen x 1180. Sky fixed; lane + lit layer + bills move with the camera.
- PUSH ~1.4 s power2.inOut; wheels rotate distance/80 rad; Pari plays pari_push at 24 fps only while moving (frame 0 when still); sun steps down 1/7.
- DROP: bill from −150 px to the hook (0.45 s) then swing −9° → 0 (elastic).
- ASK: VO; glow the bill price while "₹65,722" is said and the cart panel while "₹6,00,000" is said; "−" pops; 3 slates rise (stagger 0.12 s). Input only after this.
- 3-strike exactly like L1/L2: wrong1 Oops + red wiggle + Gudiya trot/bleat; wrong2 hint + YELLOW "≈ 66,000" chip on the bill + "−" glows; wrong3 nudge + other slates fade + hand. Idle 10 s once.
- PAY → LIGHT as in frames 15–16. The running total uses the **rounded** value. Marigold +1 per payment (not in the teach round).
- Teach round (frames 05–07): ₹2,00,000 − ₹38,760 (≈ 39,000) → ₹1,61,000; then Baba: "Very good. Now the real money: ₹6,00,000. Let's pay!"
- No Next taps anywhere (auto-advance on VO end + 0.6 s; banner 2.2 s; complete card 3 s). Stars rule same as L1/L2 → `window.GAME_RESULT.level3`.
- Data (verify against the CSV): Flowers ₹65,722→5,34,000 · Sweets ₹49,278→4,85,000 · Tent ₹1,55,959→3,29,000 · Lights ₹73,222→2,56,000 · Sound ₹74,246→1,82,000 · Snacks ₹43,377→1,39,000 · Food ₹55,031→84,000 (choices in DEV SPEC).

## 5. Files to add / change
- `js/game/data/level3.js` (all lines, numbers, choices, qLines(), allLines() with ids `L3_*`), `js/game/markup3.js` (#l3 layer), `js/game/scene3.js` (Lane/camera, Cart, Bill, Slates, Aaru, Burst, Wheel), `js/game/level3.js` (flow, exports LEVEL3_RUN), register `GAME_LEVELS[3]` in `game.js` (hide #l1/#l2 bits like L2 does; setFlowers(7), setSun(level.sun[1]) at the end), CSS block in `css/game.css` under `#game`, script tags in `index.html`.
- L2 sets `COACH.fullPari=false`; L3 hides the coach bubble entirely (no bubbles) — add a flag rather than breaking L1's full-body Pari.
- Add L3 lines to `tools/voice_studio.html` (add a Baba profile if it is missing; reuse the existing Pari and Aaru profiles). Never write an API key into any file.
- `?scene=level3&bill=N` to jump to a payment (like L2's `?bill=`); `?from=bridge2` to test the hand-off; level3 → ending must still work.
- Update CLAUDE.md (§8.5-style "How Level 3 is wired") when done.

## 6. Open decisions (ask the user, don't guess)
1. How-to line says "lights one bulb"; design lights a stall → suggest "Every payment lights up one stall of the Mela!".
2. Exact money left is ₹83,165 but the story ending (TXT.g3 + g3 voice) says ₹83,380.

## 7. Done means
All 7 payments + teach + all 3-strike paths + idle + finale + complete card play in Chrome with no console errors; L1 and L2 still pass; screenshots of PUSH, ASK, LIGHT and FINALE match the Figma frames; nothing outside the game layer changed except the documented hooks.

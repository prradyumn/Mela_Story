# GAME_UI_PLAN.md — The Mela Before Sunset (3-level game)

This file is the companion to `CLAUDE.md`. The source is the game sheet `The Mela before Sunset - Game.csv` (screens 4–32). Stage: 1920×1080. Everything plugs in through `window.GAME_LEVELS[n](api)`; see CLAUDE.md §8.

Direction: **clean Grade 6 UI with game feel**. Big tap targets, one task per screen, juicy feedback, and no fail state. Rewards come from the sheet (marigolds, sun, bulbs, stamps) plus two extra layers: **stars** and a **diya streak**.

---

## 0. Maths check (done)

- All L1, L2 and L3 answers, distractors and teach examples in the sheet are correct. The L3 running estimate goes 5,34,000 → 4,85,000 → 3,29,000 → 2,56,000 → 1,82,000 → 1,39,000 → **84,000** ✔.
- ⚠ **Exact money left is ₹83,165, not ₹83,380.** The seven exact bills add up to ₹5,16,835. `TXT.g3`, the `approx` banner in endB (story.js line ~438) and the `g3` voice need changing to **₹83,165**. The story still works: "₹83,165 ≈ ₹84,000, nearly the same".
- Built-in callback: **the L3 bills are exactly the L2 bill totals.** For example, Flower seller ₹65,722 = Flowers 42,538 + Garlands 23,184. So the L3 bill cards are the same papers the child stamped in the office, which gets a "Bill 1 ✔ checked" corner stamp.
- The bazaar background shows veg, cloth, pots, bangles, tea & sweets, toys and flowers stalls. The L1 items are different (diyas, balloons, flags…), so each **price tag carries its own item icon**. That keeps the background as it is.

## 1. Game layer on top of the sheet

| Layer | Rule | Where it shows |
|---|---|---|
| Marigolds (sheet) | 1 per solved question, always earned | HUD centre (existing) |
| Sun (sheet) | Moves `level.sun[0]→[1]` in 7 steps | HUD right (existing) |
| **Stars** (new) | Per question: first try = ★ gold; after "Oops" or hint = ☆ silver; after hand nudge = no star. Level stars: ≥6 gold → 3★, ≥4 → 2★, else 1★ | Level-complete card, badge screen (x/9) |
| **Diya streak** (new) | 3 right in a row on first try → a diya lights with a flame whoosh; 5 → "Super streak!" | Small pill under the marigolds, shown only while a streak is active |
| Bulbs (sheet, L3) | 1 per payment | String across the Mela scene |
| **You vs Guddu** (new, L2) | Guddu's page counter crawls (page 1 → 2) while the child's bill count runs 1 → 7 | Small race tag above Guddu |
| **Mela map** (new) | 3 stops: Bazaar → Office → Mela Ground; the current one pulses and done ones get a flag | Level intro (3 s) and level complete |

**3-strike flow (every question):**

1. **Wrong 1:** red glow + wiggle + Gudiya hops and bleats, plus the "Oops" line.
2. **Wrong 2:** hint (a yellow highlight on the digit or round numbers, and the rule strip).
3. **Wrong 3:** hand nudge on the correct button while the others fade.
4. **Inactivity:** after 10 s, the inactivity line plays once and the buttons pulse.
5. **Correct:** bell + green button + stamp + a marigold flies to the HUD + the sun steps + streak check. The next item comes in after 2 s.

A 🔊 **replay** button in the top-left, under the chip, replays the question VO.

**No "Next" taps.** The how-to and teach lines auto-play, as they do in the story. The only taps are answers and one "Let's play!" button after how-to.

## 2. Shared components (Figma page "Components")

1. **HUD** (existing): chip · 7 marigolds · sun tracker. New: replay button (96 px circle), streak pill, "Q 3/7" dots.
2. **Answer button**: `btn_l/m/r` art, 3-slice, min 360×140. States: default · hover/press · pulse (inactivity) · correct (green) · wrong (red glow + wiggle) · faded (nudge).
3. **Helper**: Pari cut-out at the bottom-left (scale ~0.55) + speech bubble (db5–db8) for game VO. Gudiya at the bottom-right reacts to wrong answers.
4. **Hint strip**: parchment strip at the bottom-centre, 1100×110, with an icon and rule text.
5. **Hand pointer**: tap loop (press + ripple).
6. **Stamp**: red rubber-stamp mark with the rounded value, rotated −8°, with a stamp-in animation.
7. **Level intro card**: level medallion + title + mini map.
8. **Level complete card**: "7 of 7!" + stars 1–3 fly in + streak best + mini map with a new flag.

## 3. Level 1 · Aakoli Bazaar — "Round the price tags"

Screens: How-to (S4) → Teach (S5, ₹34,872) → Q1–Q7 (S6–S12) → Complete.

```
┌ chip ─────────── ✿✿✿✿✿✿✿ ─────────── sun ┐
│ 🔊                                        │
│              ╎ rope                       │
│        ┌──────────────┐  price tag        │
│        │ [diya icon]  │  item + price     │
│        │ Diyas        │  hundreds digit   │
│        │ ₹12,346      │  can glow yellow  │
│        └──────────────┘                   │
│              ▼ red arrow at 12,346        │
│  12,000 |━━━━━━━━━┿━━━━━━━━━| 13,000      │   number line x 360→1560, y 700
│  [ 12,000 ]              [ 13,000 ]       │   answer buttons under the ends
│ Pari   [hint strip]                Gudiya │
└───────────────────────────────────────────┘
```

- **Transition between shops:** the bazaar background pans about 330 px, the old tag swings out and the new tag drops in on its rope.
- **Correct:** the tag flips to a red stamp showing ₹12,000. The arrow slides to that end of the line and the end dot glows green.
- **Hint:** the hundreds digit glows, and the rule strip reads "5 or more → go up · less than 5 → stay down".
- **Teach screen:** as the lines play, the arrow slides in, the digit glows, Manju Mausi stands on the right, then "Tap 35,000".

## 4. Level 2 · Panchayat Office — "Add the bills"

Screens: How-to (S14) → Teach (S15, 21,648 + 43,315) → Q1–Q7 (S16–S22) → Complete.

```
┌ chip ─────────── ✿✿✿✿✿✿✿ ─────────── sun ┐
│ 🔊  [7 bills left]                [Guddu: page 1] │
│ done  ┌────────────────────────┐   Guddu behind   │
│ pile  │ BILL 1        ~lined~  │   counter (z5),  │
│ (left)│ Flowers   ₹42,538  ≈43,000 │ writing     │
│       │ Garlands  ₹23,184  ≈23,000 │             │
│       │ ────────────────────── │                  │
│       │ About total:  ?        │                  │
│       └────────────────────────┘                  │
│ [About ₹66,000] [About ₹56,000] [About ₹76,000]   │   row y ~880
│ Pari                                       Gudiya │
└───────────────────────────────────────────────────┘
```

- The bill paper is a card over the scene, 760×620, tilted about −2°, and slides in from the pile.
- The **≈ round numbers** appear in blue on correct and in yellow for the hint.
- **Correct:** the stamp shows "About ₹66,000", the bill slides to the done pile (existing position left 300 / top 520 / z 8), and the "bills left" count drops.
- **Race tag:** Guddu's page counter stays on 1–2. On correct, Pari says "Guddu Bhaiya is still on page one!"

## 5. Level 3 · Mela Ground — "Pay and find the money left"

Screens: How-to (S24, Baba) → Teach (S25, 2,00,000 − 38,760) → Q1–Q7 (S26–S32) → Complete.

```
┌ chip ─────────── ✿✿✿✿✿✿✿ ─────────── sun ┐
│  ●  ●  ●  ○  ○  ○  ○   bulb string (7)   │   y ~230, lights a stall glow
│ ┌─MELA MONEY─┐        ┌──────────────┐   │
│ │ ₹5,34,000  │   −    │[flower icon] │   │   bill card = L2 paper
│ │▓▓▓▓▓▓▓░░░░ │        │Flower seller │   │   + "Bill 1 ✔" corner
│ └────────────┘        │ ₹65,722 ≈66k │   │
│  money bar            └──────────────┘   │
│ [About ₹5,34,000] [About ₹6,66,000] [About ₹5,24,000] │
│ Baba  Pari                        Gudiya │
└──────────────────────────────────────────┘
```

- **Correct:**
  - coins fly from the board to the bill card
  - the board counts down to "About ₹5,34,000"
  - the gold money bar shrinks
  - one bulb and its stall light up
  - the bill card slides away to the shopkeeper
- **Hint:** "≈ 66,000" appears in yellow, and the minus sign pulses (message: "paying → money gets less").
- **After Q7:** all 7 bulbs glow, which leads straight into `endA` (sunset).

## 6. Figma file structure (next phase)

1. **Cover**
2. **Foundations**: colours (CLAUDE.md palette), type (Baloo 2 800 headings / Poppins 600 32 body / Fredoka numbers), radii, shadows.
3. **Components** (§2), with all their states.
4. **L1 frames**: How-to · Teach · Question in 6 states (default, wrong 1, hint, nudge, correct, idle) · Complete.
5. **L2 frames**: same set.
6. **L3 frames**: same set.
7. **Flow**: prototype links + map + badge with stars.

All frames are 1920×1080 and use the real backgrounds and characters from `a/`.

## 7. Game VO (about 130 lines) — I generate these

- Voices: Pari **Leda**, Baba **Algenib**, Guddu **Fenrir**, and a new voice for Manju Mausi (a warm older-woman voice; audition 2–3 options).
- IDs: `L{n}_{screen}_{type}`, for example `L1_q3_hint`. Types: `q` (question), `ok`, `oops`, `hint`, `nudge`, `idle`.
- "Oops" and idle lines are shared across a level.
- Every file needs both `.ogg` and `.mp3` (CLAUDE.md §9).
- **New SFX** (synthesised): bulb click-hum, star chime ×3, streak whoosh + diya flame, tag flip, paper slide, level-complete fanfare, soft wrong "bonk".

# Grade 6 Village Game UI Package

This package contains 27 production-sized transparent PNG components matching the established warm 2D Indian children's-storybook art style.

## Global UI rules

- Every asset is an RGBA PNG with a transparent canvas.
- Shapes are chunky, friendly, colourful, and readable at game scale.
- Surfaces intended for dynamic content are blank so text and values can be added in code.
- No asset contains readable text, letters, numbers, logos, watermarks, or real currency artwork.
- The palette, outlines, painterly shading, and festive village materials match the character and environment packages.

## Asset manifest

### Large UI surfaces

| File | Dimensions | Use |
| --- | ---: | --- |
| `ui_price_tag.png` | 700 × 520 | Blank kraft-paper price tag with string hole. |
| `ui_bill_paper.png` | 900 × 1000 | Blank lined notebook bill with torn top edge and light crumpling. |
| `ui_money_board.png` | 900 × 560 | Blank green chalkboard in a carved gold-wood frame. |
| `map_mela.png` | 1920 × 1080 | Top-down village game map with winding path through bazaar, Panchayat office, and mela. |

### Level 1 item icons

All files are 400 × 400.

- `ic_sweets.png`
- `ic_diyas.png`
- `ic_balloons.png`
- `ic_flags.png`
- `ic_rangoli.png`
- `ic_chairs.png`
- `ic_carpet.png`
- `ic_giantwheel.png`

### Level 3 shopkeeper badges

All files are 400 × 400 and share one carved-wood and marigold badge system.

- `sk_flower.png`
- `sk_sweet.png`
- `sk_tent.png`
- `sk_light.png`
- `sk_sound.png`
- `sk_snack.png`
- `sk_food.png`

### Currency, guidance, rewards, and streaks

| File | Dimensions | Use |
| --- | ---: | --- |
| `ui_coins.png` | 300 × 300 | Generic gold game-coin stack with no real currency marks. |
| `ui_notes.png` | 300 × 300 | Generic paper game-note bundle with no denominations or real currency design. |
| `ui_hand.png` | 300 × 300 | Cartoon pointing/tapping hand with tap ripple. |
| `ui_star_gold.png` | 300 × 300 | Chunky gold reward star. |
| `ui_star_silver.png` | 300 × 300 | Chunky silver reward star. |
| `ui_diya_lit.png` | 300 × 300 | Decorated clay diya with flame. |
| `ui_diya_off.png` | 300 × 300 | Matching decorated clay diya without flame. |
| `ui_badge_medal.png` | 1000 × 1000 | Text-free gold “Smart Guess Star” medal with marigold ribbon. |

## Optional buttons

Green and red `btn_l/m/r` variants were not included because no existing button artwork, dimensions, or nine-slice geometry was present in the workspace. This avoids inventing assets that would not match the game's actual button system. The supplied table explicitly marked this set as optional.

## Generation prompt set

The existing character lineup and mela scene were used as style references only. Each asset was generated separately with the following invariants: polished 2D Indian children's-storybook rendering, clean dark-brown outlines, soft painterly shading, friendly gamified proportions, tactile materials, complete isolated silhouette, transparent background, and no text or logos. Related families used shared construction rules: consistent inventory icons, one carved-wood shopkeeper badge system, matched gold/silver stars, and a lit diya derived from the exact unlit diya design.


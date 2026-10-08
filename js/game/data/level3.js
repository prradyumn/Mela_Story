/* Level 3 · Mela Ground · Pay and find the money left ("Pari's money cart")
   Lines are word-for-word from the storyboard ("The Mela before Sunset – Game", screens 24–32, Oct 2026 revision), except the
   money: the sheet's "₹83,000" is kept mathematically correct (1,39,000 − 55,000 = 84,000; exact left ₹83,165) — agreed with the user.
   Geometry is from mela_game_assets_webp/lane_layout.json + the Figma DEV SPEC (frame 137:343).
   VO ids: L3_* in assets/game/vo/. Missing files → the line plays for a reading time (no bubbles in L3). */
window.LEVEL3 = {
  id: 3,
  chip: 'Mela Ground',
  sun: [0.6, 0.85],            // overwritten by the story (LEVELS[3].sun)
  start: 600000,

  // world (lane) geometry, 1 px = 1 stage px; the lane art is 5760×1080
  hooks: [[350, 508], [1040, 507], [1730, 436], [2420, 436], [3110, 436], [3800, 522], [4490, 522]],
  boxes: [[44, 636], [758, 1439], [1330, 2129], [2020, 2819], [2710, 3509], [3400, 4199], [4090, 4802]],   // stall x ranges (lit crossfade)
  signs: [['FLOWERS', 346], ['SWEETS', 347], ['TENT HOUSE', 226], ['LIGHTS', 226], ['SOUND', 226], ['SNACKS', 369], ['FOOD', 380]],   // text, top y (centred on the hook x)
  wheel: [5335, 424], pathTop: 780,
  // bulb centres on the lit lane (found in mela_lane_lit.webp), per stall: they twinkle once that stall is lit (js/game/fx.js)
  bulbs: [[[112,494],[172,493],[229,493],[290,493],[348,494],[407,494],[468,493],[528,493],[587,493]], [[799,492],[863,490],[921,493],[979,493],[1041,490],[1096,492],[1157,490],[1219,493],[1275,492]], [[1552,416],[1611,417],[1670,417],[1729,416],[1788,418],[1847,417],[1907,417],[1967,417]], [[2189,451],[2189,490],[2189,529],[2243,416],[2266,451],[2266,531],[2267,491],[2267,652],[2302,417],[2342,451],[2342,490],[2342,531],[2342,653],[2361,416],[2418,531],[2419,450],[2420,414],[2420,491],[2422,653],[2478,417],[2496,491],[2496,530],[2497,451],[2498,653],[2537,417],[2572,451],[2572,653],[2573,531],[2574,490],[2597,417]], [[2872,417],[2931,418],[2991,418],[3051,418],[3109,418],[3169,418],[3227,417],[3288,418]], [[3559,507],[3623,509],[3682,507],[3740,507],[3799,508],[3860,507],[3917,510],[3976,507],[4037,508]], [[4251,507],[4312,506],[4372,509],[4431,507],[4489,507],[4547,507],[4607,507],[4669,508],[4723,507]]],
  hookScreenX: 1180,           // camera = hook.x − 1180
  finaleCam: 3840,

  howto: [
    { who: 'baba', vo: 'L3_howto_1', text: 'Here is the Mela money: ₹6,00,000. Seven shopkeepers will come for their money.', show: 'baba' },
    { who: 'pari', vo: 'L3_howto_2', text: 'Each time we pay, the money gets less. Make the bill a round number in your head. Then take it away.', show: 'less' },
    { who: 'pari', vo: 'L3_howto_3', text: 'Choose about how much money is left.', show: 'map' }
  ],

  teach: {
    money: 200000, bill: 38760, choices: [161000, 239000, 151000], answer: 161000,
    lines: [
      { who: 'pari', vo: 'L3_teach_1', text: 'Let’s try one. For example, we have ₹2,00,000. The bill is ₹38,760.', show: 'bill' },
      { who: 'pari', vo: 'L3_teach_2', text: 'First, round off the bill. ₹38,760 is about 39,000.', show: 'chip' },
      { who: 'guddu', vo: 'L3_teach_guddu', text: 'Let me try... It’s 2,00,000 minus 38,760... borrow one... um...', show: 'guddu' },
      { who: 'pari', vo: 'L3_teach_3', text: 'Now take it away. 2,00,000 minus 39,000 is 1,61,000. Tap ₹1,61,000.', show: 'slates' }
    ],
    ok:    { who: 'pari', vo: 'L3_teach_ok',    text: 'Yes! About ₹1,61,000 is left.' },
    exact: { who: 'guddu', vo: 'L3_teach_exact', text: 'Umm... it’s 1,61,240 to be exact. But your number is so close. Good job!' },
    baba:  { who: 'baba', vo: 'L3_teach_baba',  text: 'Very good. Now the real money: ₹6,00,000. Let’s pay!' },
    oops:  { who: 'pari', vo: 'L3_teach_oops',  text: 'Oops! Try again. We are paying, so the money gets less.' },
    hint:  { who: 'pari', vo: 'L3_teach_hint',  text: 'Hint: 200 thousand take away 39 thousand is 161 thousand.' },
    nudge: { who: 'pari', vo: 'L3_teach_nudge', text: 'Tap About ₹1,61,000.' },
    idle:  { who: 'pari', vo: 'L3_teach_idle',  text: 'Take the round number away from the money.' }
  },

  oops: { who: 'pari', vo: 'L3_oops', text: 'Oops! Try again. We are paying money, so the money gets less.' },
  idle: { who: 'pari', vo: 'L3_idle', text: 'Round the bill first. Then take it away from the money.' },

  // who = how Pari names the shopkeeper · choices in storyboard order
  bills: [
    { who: 'flower seller', badge: 'sk_flower', price: 65722,  choices: [534000, 666000, 524000] },
    { who: 'sweet shop',    badge: 'sk_sweet',  price: 49278,  choices: [475000, 485000, 583000] },
    { who: 'tent house',    badge: 'sk_tent',   price: 155959, choices: [641000, 319000, 329000] },
    { who: 'light shop',    badge: 'sk_light',  price: 73222,  choices: [256000, 246000, 402000] },
    { who: 'sound shop',    badge: 'sk_sound',  price: 74246,  choices: [172000, 330000, 182000] },
    { who: 'snack stall',   badge: 'sk_snack',  price: 43377,  choices: [225000, 139000, 129000] },
    { who: 'food stall',    badge: 'sk_food',   price: 55031,  choices: [84000, 194000, 74000] }
  ],
  completeCta: 'See the Mela at sunset'
};

(function (D) {
  const fmt = n => window.LEVEL1.fmt(n), rs = n => '₹' + fmt(n);
  const r1000 = n => Math.round(n / 1000) * 1000;
  D.round = r1000;
  /* money on the cart before payment i (0-based): ₹6,00,000, then the rounded running total */
  D.moneyBefore = i => D.bills.slice(0, i).reduce((m, b) => m - r1000(b.price), D.start);
  /* All lines for payment n (1–7), worded like the storyboard */
  D.qLines = (b, n) => {
    const have = D.moneyBefore(n - 1), r = r1000(b.price), ans = have - r;
    if (!b.choices.includes(ans)) console.warn('L3 payment', n, 'answer not in choices', ans);
    const haveTxt = n === 1 ? rs(have) : 'about ' + rs(have);
    return {
      ans, have, r,
      ask:   { who: 'pari', vo: `L3_q${n}`,       text: `The ${b.who} wants ${rs(b.price)}. We have ${haveTxt}. About how much money is left?` },
      ok:    { who: 'pari', vo: `L3_q${n}_ok`,    text: n === 7 ? `Yes! About ${rs(ans)} is left. We paid everyone!` : `Yes! About ${rs(ans)} is left. One more stall lights up!` },
      oops:  D.oops,
      hint:  { who: 'pari', vo: `L3_q${n}_hint`,  text: `Hint: ${rs(b.price)} is about ${fmt(r)}. Now take ${fmt(r)} away from ${fmt(have)}.` },
      nudge: { who: 'pari', vo: `L3_q${n}_nudge`, text: `${fmt(have)} minus ${fmt(r)} is ${fmt(ans)}. Tap About ${rs(ans)}.` },
      idle:  D.idle
    };
  };
  /* Every voiced line in the level, in play order */
  D.allLines = () => {
    const T = D.teach, out = [...D.howto, ...T.lines, T.ok, T.exact, T.baba, T.oops, T.hint, T.nudge, T.idle, D.oops, D.idle];
    D.bills.forEach((b, i) => { const L = D.qLines(b, i + 1); out.push(L.ask, L.ok, L.hint, L.nudge); });
    return out.map(l => ({ id: l.vo, who: l.who, text: l.text }));
  };
})(window.LEVEL3);

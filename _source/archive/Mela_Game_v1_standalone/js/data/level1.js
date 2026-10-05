/* Level 1 · Aakoli Bazaar · Round the price tags
   All lines are taken word-for-word from the storyboard ("The Mela before Sunset – Game", screens 4–13).
   `vo` = file id inside assets/vo/ (L1_*.mp3 / .ogg). If a file is missing the game simply shows the
   line in the bubble and waits for a reading time, so recorded VO can be dropped in later with no code change. */
window.LEVEL1 = {
  id: 1,
  title: 'Aakoli Bazaar',
  subtitle: 'Round the price tags',
  chip: 'Aakoli Bazaar',
  bg: 'assets/img/bg_bazaar.webp',
  sun: [0.02, 0.32],          // sun moves from → to across the 7 questions (0 = sunrise side, 1 = sunset side)

  howto: [
    { who: 'pari', vo: 'L1_howto_1', text: 'Welcome to the bazaar! Every shop has a price tag. The prices are big and messy.', show: 'tag' },
    { who: 'pari', vo: 'L1_howto_2', text: 'Under each tag there is a number line. Tap the round number that the price is closest to.', show: 'line' },
    { who: 'pari', vo: 'L1_howto_3', text: 'Every right answer lights up a marigold. Look at the sun too. Let’s finish before sunset!', show: 'hud' }
  ],
  howtoSample: { item: 'Diyas', icon: 'diyas', price: 12346, lo: 12000, hi: 13000 },

  teach: {
    item: 'Sweets', icon: 'sweets', price: 34872, lo: 34000, hi: 35000, answer: 35000,
    lines: [
      { who: 'manju', vo: 'L1_teach_1', text: 'Keep it simple, beta. Change the price to the nearest thousand.', show: 'tag' },
      { who: 'pari',  vo: 'L1_teach_2', text: 'Look at this price: ₹34,872. It is between 34,000 and 35,000. Which one is closer?', show: 'line' },
      { who: 'manju', vo: 'L1_teach_3', text: 'Look at the hundreds digit. It is 8. 8 is 5 or more, so we go up.', show: 'digit' },
      { who: 'pari',  vo: 'L1_teach_4', text: 'So ₹34,872 is about 35,000. Tap 35,000.', show: 'buttons' }
    ],
    ok:    { who: 'pari', vo: 'L1_teach_ok',    text: 'Yes! ₹34,872 is about ₹35,000. Now you try!' },
    oops:  { who: 'pari', vo: 'L1_teach_oops',  text: 'Oops! Try again. The hundreds digit is 8. 8 is 5 or more.' },
    hint:  { who: 'pari', vo: 'L1_teach_hint',  text: 'Hint: 5 or more means go up. Go up to 35,000.' },
    nudge: { who: 'pari', vo: 'L1_teach_nudge', text: 'Tap 35,000.' },
    idle:  { who: 'pari', vo: 'L1_teach_idle',  text: 'Which is closer, 34,000 or 35,000?' }
  },

  rule: 'Hundreds digit 5 or more → go up.   Less than 5 → stay down.',
  oops: { who: 'pari', vo: 'L1_oops', text: 'Oops! Try again. Look where the red arrow is on the line.' },

  // q / ok / hint / nudge / idle lines are built from these numbers with the storyboard wording (see game.js → qLines)
  questions: [
    { item: 'Diyas',           word: 'diyas',           icon: 'diyas',      price: 12346,  lo: 12000,  hi: 13000 },
    { item: 'Balloons',        word: 'balloons',        icon: 'balloons',   price: 18729,  lo: 18000,  hi: 19000 },
    { item: 'Flags',           word: 'flags',           icon: 'flags',      price: 25481,  lo: 25000,  hi: 26000 },
    { item: 'Rangoli colours', word: 'rangoli colours', icon: 'rangoli',    price: 36652,  lo: 36000,  hi: 37000 },
    { item: 'Chairs',          word: 'chairs',          icon: 'chairs',     price: 47508,  lo: 47000,  hi: 48000 },
    { item: 'Carpets',         word: 'carpets',         icon: 'carpet',     price: 124317, lo: 124000, hi: 125000 },
    { item: 'Giant wheel',     word: 'giant wheel',     icon: 'giantwheel', price: 238864, lo: 238000, hi: 239000 }
  ],

  complete: [
    { who: 'aaru', vo: 'L1_done_1', text: 'All the prices are round numbers now! Correct-correct!' },
    { who: 'pari', vo: 'L1_done_2', text: 'Well done! The shopkeepers sent their bills to the Panchayat office. Let’s check them.' }
  ],
  completeCta: 'Go to the office'
};

/* ---------- shared helpers (used by the game and by tools/voice_studio.html) ---------- */
(function (D) {
  const fmt = n => { const s = String(Math.round(n)); if (s.length <= 3) return s; let h = s.slice(0, -3); const t = s.slice(-3), p = []; while (h.length > 2) { p.unshift(h.slice(-2)); h = h.slice(0, -2); } if (h) p.unshift(h); return p.join(',') + ',' + t; };
  const rs = n => '₹' + fmt(n);
  D.fmt = fmt; D.rs = rs;

  /* All lines for shop n (1–7), worded exactly like the storyboard */
  D.qLines = (q, n) => {
    const ans = q.price - q.lo < q.hi - q.price ? q.lo : q.hi;
    const hd = Math.floor(q.price / 100) % 10;
    return {
      ans,
      ask:   { who: 'pari', vo: `L1_q${n}`,       text: `The ${q.word} cost ${rs(q.price)}. Is it closer to ${fmt(q.lo)} or ${fmt(q.hi)}? Tap the answer.` },
      ask1:  `The ${q.word} cost ${rs(q.price)}.`,
      ok:    { who: 'pari', vo: `L1_q${n}_ok`,    text: `Yes! ${rs(q.price)} is about ${rs(ans)}.` },
      oops:  D.oops,
      hint:  { who: 'pari', vo: `L1_q${n}_hint`,  text: `Hint: Look at the hundreds digit. It is ${hd}. ${hd} is ${hd >= 5 ? '5 or more, so we go up' : 'less than 5, so we stay down'}.` },
      nudge: { who: 'pari', vo: `L1_q${n}_nudge`, text: `${rs(q.price)} is closer to ${fmt(ans)}. Tap ${fmt(ans)}.` },
      idle:  { who: 'pari', vo: `L1_q${n}_idle`,  text: `Look at the red arrow. Is it nearer ${fmt(q.lo)} or ${fmt(q.hi)}?` }
    };
  };

  /* Every voiced line in the level, in play order (50 lines) */
  D.allLines = () => {
    const T = D.teach, out = [...D.howto, ...T.lines, T.ok, T.oops, T.hint, T.nudge, T.idle, D.oops];
    D.questions.forEach((q, i) => { const L = D.qLines(q, i + 1); out.push(L.ask, L.ok, L.hint, L.nudge, L.idle); });
    out.push(...D.complete);
    return out.map(l => ({ id: l.vo, who: l.who, text: l.text }));
  };

  /* Text the voice actually reads: big numbers become Indian-English words (₹1,24,317 → "one lakh twenty-four thousand three hundred seventeen rupees") */
  const ones = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
  const tens = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
  const two = n => n < 20 ? ones[n] : tens[Math.floor(n / 10)] + (n % 10 ? '-' + ones[n % 10] : '');
  const three = n => { const h = Math.floor(n / 100), r = n % 100; return (h ? ones[h] + ' hundred' + (r ? ' ' : '') : '') + (r || !h ? two(r) : ''); };
  const words = n => {
    if (n === 0) return 'zero';
    const cr = Math.floor(n / 1e7), lk = Math.floor(n / 1e5) % 100, th = Math.floor(n / 1000) % 100, rest = n % 1000; const p = [];
    if (cr) p.push(three(cr) + ' crore'); if (lk) p.push(two(lk) + ' lakh'); if (th) p.push(two(th) + ' thousand'); if (rest) p.push(three(rest));
    return p.join(' ');
  };
  D.spoken = text => text
    .replace(/₹\s?([\d,]+)/g, (_, d) => words(parseInt(d.replace(/,/g, ''), 10)) + ' rupees')
    .replace(/\b\d{1,3}(?:,\d{2,3})+\b/g, d => words(parseInt(d.replace(/,/g, ''), 10)))
    .replace(/→/g, 'means')
    .replace(/(^|[.!?]\s+)([a-z])/g, (m, a, b) => a + b.toUpperCase());
})(window.LEVEL1);


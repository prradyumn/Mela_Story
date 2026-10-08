/* Level 2 · Panchayat Office · Add the bills
   Lines are word-for-word from the storyboard ("The Mela before Sunset – Game", screens 14–23).
   VO ids: L2_* in assets/game/vo/ (made with tools/voice_studio.html). Missing files → the line shows for a reading time. */
window.LEVEL2 = {
  id: 2,
  chip: 'Panchayat Office',
  sun: [0.35, 0.6],            // overwritten by the story (LEVELS[2].sun)

  howto: [
    { who: 'pari', vo: 'L2_howto_1', text: 'Look! Seven bills on Guddu Bhaiya\'s desk. Each bill has two prices.', show: 'pile' },
    { who: 'pari', vo: 'L2_howto_2', text: 'Do not need to add the numbers as they are. Make each price a round number in your head. Then add the round numbers.', show: 'example' },
    { who: 'pari', vo: 'L2_howto_3', text: 'Choose the answer that is the closest thousand.', show: 'stamps' }
  ],
  example: { title: 'EXAMPLE', items: [['Rice', 31472], ['Oil', 18915]], choices: [40000, 50000, 60000] },

  teach: {
    title: 'TRY ONE', items: [['Diyas', 21648], ['Candles', 43315]], choices: [55000, 65000, 75000], answer: 65000,
    lines: [
      { who: 'guddu', vo: 'L2_teach_1', text: '21,648 plus 43,315… I need my big notebook…', show: 'bill' },
      { who: 'pari',  vo: 'L2_teach_2', text: 'No need! 21,648 is about 22,000.', show: 'chip1' },
      { who: 'pari',  vo: 'L2_teach_3', text: '43,315 is about 43,000.', show: 'chip2' },
      { who: 'pari',  vo: 'L2_teach_4', text: 'Now add the round numbers. 22,000 plus 43,000 is 65,000. So the bill is about ₹65,000. Tap ₹65,000.', show: 'stamps' }
    ],
    ok:    { who: 'pari', vo: 'L2_teach_ok',    text: 'Yes! The bill is about ₹65,000. Easy! Now you try.' },
    oops:  { who: 'pari', vo: 'L2_teach_oops',  text: 'Oops! Try again. 22,000 plus 43,000. Count the thousands: 22 and 43.' },
    hint:  { who: 'pari', vo: 'L2_teach_hint',  text: 'Hint: 22 thousand plus 43 thousand is 65 thousand.' },
    nudge: { who: 'pari', vo: 'L2_teach_nudge', text: 'Tap About ₹65,000.' },
    idle:  { who: 'pari', vo: 'L2_teach_idle',  text: 'Add the two round numbers.' }
  },

  oops: { who: 'pari', vo: 'L2_oops', text: 'Oops! Try again. First, make each price a round number in your head.' },
  idle: { who: 'pari', vo: 'L2_idle', text: 'Think of the round numbers. Then add them.' },

  // items: [name on the bill, price] · choices in storyboard order · extra = bonus words after the OK line
  bills: [
    { items: [['Flowers', 42538], ['Garlands', 23184]], choices: [66000, 56000, 76000], extra: ' Look, Guddu Bhaiya is still on page one!' },
    { items: [['Sweets', 36415], ['Tea', 12863]],       choices: [39000, 59000, 49000] },
    { items: [['Tent', 124317], ['Stage', 31642]],      choices: [166000, 156000, 146000] },
    { items: [['Lights', 54276], ['Wires', 18946]],     choices: [73000, 83000, 63000] },
    { items: [['Speaker', 47892], ['Mic', 26354]],      choices: [64000, 74000, 84000] },
    { items: [['Snacks', 28163], ['Plates', 15214]],    choices: [53000, 33000, 43000] },
    { items: [['Food', 33745], ['Water', 21286]],       choices: [55000, 45000, 65000] }
  ],
  completeCta: 'Go to the Mela Ground'
};

(function (D) {
  const fmt = n => window.LEVEL1.fmt(n), rs = n => '₹' + fmt(n);
  const r1000 = n => Math.round(n / 1000) * 1000;
  D.round = r1000;
  /* All lines for bill n (1–7), worded like the storyboard */
  D.qLines = (b, n) => {
    const [a, c] = b.items, ra = r1000(a[1]), rc = r1000(c[1]), ans = ra + rc;
    if (!b.choices.includes(ans)) console.warn('L2 bill', n, 'answer not in choices', ans);
    return {
      ans,
      ask:   { who: 'pari', vo: `L2_q${n}`,       text: `Here is bill ${n}. ${a[0]} ${rs(a[1])} and ${c[0].toLowerCase()} ${rs(c[1])}. What will be the total? Choose the closest number.` },
      ok:    { who: 'pari', vo: `L2_q${n}_ok`,    text: `Yes! ${fmt(ra)} plus ${fmt(rc)} is ${fmt(ans)}. The bill is about ${rs(ans)}.${b.extra || ''}` },
      oops:  D.oops,
      hint:  { who: 'pari', vo: `L2_q${n}_hint`,  text: `Hint: ${rs(a[1])} is about ${fmt(ra)}. ${rs(c[1])} is about ${fmt(rc)}. Now add them.` },
      nudge: { who: 'pari', vo: `L2_q${n}_nudge`, text: `${fmt(ra)} plus ${fmt(rc)} is ${fmt(ans)}. Tap About ${rs(ans)}.` },
      idle:  D.idle
    };
  };
  /* Every voiced line in the level, in play order */
  D.allLines = () => {
    const T = D.teach, out = [...D.howto, ...T.lines, T.ok, T.oops, T.hint, T.nudge, T.idle, D.oops, D.idle];
    D.bills.forEach((b, i) => { const L = D.qLines(b, i + 1); out.push(L.ask, L.ok, L.hint, L.nudge); });
    return out.map(l => ({ id: l.vo, who: l.who, text: l.text }));
  };
})(window.LEVEL2);

/* Level 2 layer (Panchayat office desk) inside #game. Built at load, hidden until GAME_LEVELS[2] runs. */
(function () {
  const stamp = i => `<div class="stamp2 hidden" data-i="${i}"><img class="art" src="${GA('stamp_tool.webp')}" alt=""><div class="about">ABOUT</div><div class="val"></div><i class="tick"><svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></i></div>`;
  const item = i => `<div class="b-item" id="bi${i}"><div class="b-name"></div><div class="b-row"><span class="b-price"></span><span class="b-chip"></span></div></div>`;
  const l2 = document.createElement('div');
  l2.id = 'l2'; l2.className = 'hidden';
  l2.innerHTML = `
    <div id="pile2" class="abs"><img class="pile-art" src="${GA('bill_pile.webp')}" alt=""><div id="pileLeft">7 bills left</div></div>
    <div id="basket2" class="abs"><div id="basketBalls"></div><img class="basket-art" src="${GA('checked_basket.webp')}" alt=""><div class="basket-tag">CHECKED</div></div>
    <div id="bill2" class="abs hidden">
      <img class="paper" src="${GA('bill_paper.webp')}" alt="">
      <div class="b-title"></div><div class="b-sub">Panchayat Mela · Apnapur</div>
      ${item(1)}${item(2)}
      <div class="b-rule"></div><div class="b-total">About total:</div>
      <div class="b-box"><span>?</span></div>
      <div class="b-mark"><img src="${GA('stamp_mark.webp')}" alt=""><span></span></div>
    </div>
    ${stamp(0)}${stamp(1)}${stamp(2)}
    <img id="inkPad" class="abs" src="${GA('ink_pad.webp')}" alt="">
    <img id="ball2" class="abs" src="${GA('paper_ball_3.webp')}" alt="">
    <canvas id="crumpleCv" width="1920" height="1080"></canvas>
    <div class="overlay hidden" id="done2">
      <div class="gcard" id="done2Card">
        <h2>7 bills checked!</h2>
        <div class="sub">All about right — faster than Guddu’s notebook.</div>
        <div id="done2Stars"><img alt=""><img alt=""><img alt=""></div>
        <div id="done2Basket"><div class="balls"></div><img class="basket-art" src="${GA('checked_basket.webp')}" alt=""><div class="basket-tag">CHECKED</div></div>
        <div id="done2Score"></div>
        <div class="gbtn cta abs" id="done2Cta">Go to the Mela Ground</div>
      </div>
    </div>`;
  const game = document.getElementById('game');
  game.insertBefore(l2, document.getElementById('gHud'));   // under the HUD + coach, above the background
})();

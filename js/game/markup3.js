/* Level 3 layer (Mela Ground · Pari's money cart) inside #game. Built at load, hidden until GAME_LEVELS[3] runs.
   Layer order (Figma DEV SPEC 137:343, back → front): sky · sun · world (lane pad, dark lane, lit stalls, signs, bill,
   light burst, wheel) · Pari · cart · "−" · slates · Aaru + potli · duster/coins · fireworks · complete card. */
(function () {
  const D = window.LEVEL3, A = n => GA('l3/' + n);
  const slate = i => `<div class="slate3 hidden" data-i="${i}"><img class="art" src="${A('takhti.webp')}" alt=""><div class="about">ABOUT</div><div class="val"></div><i class="tick"><svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></i></div>`;
  const lit = D.boxes.map(([x0, x1], i) => { const top = D.hooks[i][1] < 480 ? 150 : 290;
    return `<div class="lit3" data-i="${i}" style="left:${x0}px;top:${top}px;width:${x1 - x0}px;height:${756 - top}px"><img src="${A('mela_lane_lit.webp')}" alt="" style="left:${-x0}px;top:${-top}px"></div>`; }).join('');
  const signs = D.signs.map(([t, y], i) => `<div class="sign3" style="left:${D.hooks[i][0] - 200}px;top:${y}px">${t}</div>`).join('');
  const l3 = document.createElement('div');
  l3.id = 'l3'; l3.className = 'hidden';
  l3.innerHTML = `
    <img id="sky3" src="${A('sky_dusk.webp')}" alt="">
    <img id="sun3" src="${A('sun_disc.webp')}" alt="">
    <div id="world3">
      <div id="ground3"></div>
      <div id="pad3"><img src="${A('mela_lane_dark.webp')}" alt=""></div>
      <img id="lane3" class="lane" src="${A('mela_lane_dark.webp')}" alt="">
      ${lit}
      <img id="laneLit3" class="lane" src="${A('mela_lane_lit.webp')}" alt="">
      ${signs}
      <img id="burst3" src="${A('light_burst.webp')}" alt="">
      <div id="wheel3"><img class="stand" src="${A('wheel_stand.webp')}" alt=""><img class="rotor" src="${A('wheel_frame.webp')}" alt="">${[...Array(8)].map((_, k) => `<i class="cab" style="background-position:${-k * 124}px 0"></i>`).join('')}</div>
      <div id="bill3" class="hidden">
        <img class="art" src="${A('bill_hang.webp')}" alt="">
        <div class="try">TRY ONE</div><div class="price"></div><div class="chip"></div>
        <div class="paid"><img src="${GA('stamp_mark.webp')}" alt=""><span>PAID ✓</span></div>
      </div>
      <svg id="hook3" viewBox="-14 -40 28 52" width="28" height="52"><path d="M0 -38 L0 2 A7 7 0 1 0 7 -5 L7 -9" fill="none" stroke="#2c2a30" stroke-width="5.5" stroke-linecap="round"/><path d="M0 -38 L0 2 A7 7 0 1 0 7 -5 L7 -9" fill="none" stroke="#8d8a96" stroke-width="2.4" stroke-linecap="round"/><rect x="-6" y="-40" width="12" height="7" rx="2" fill="#5a3a1c" stroke="#2c1a0c" stroke-width="1.5"/></svg>
    </div>
    <div id="map3"></div>
    <div id="pari3" style="display:none"></div>
    <div id="waves3"><i></i><i></i><i></i></div>
    <div id="cart3">
      <i class="speed"></i><i class="speed"></i><i class="speed"></i>
      <i class="cglow"></i><i class="cshadow"></i>
      <div class="board"><img src="${A('money_board.webp')}" alt=""><div class="plabel">MELA MONEY</div><div class="pval"></div><div class="smears"><i></i><i></i><i></i></div></div>
      <img class="bag" src="${A('potli.webp')}" alt="">
      <img class="cartonly" src="${A('cart_only.webp')}" alt="">
      <div class="talkp"></div>
      <div class="pull"></div>
    </div>
    <img id="duster3" src="${A('duster.webp')}" alt="">
    <div id="guddu3"></div>
    <div id="minus3"><span></span></div>
    ${slate(0)}${slate(1)}${slate(2)}
    <div id="baba3"></div>
    <div id="aaru3"><img alt=""></div>
    <img id="potli3" src="${A('potli.webp')}" alt="">
    <div id="fw3"></div>
    <div class="overlay hidden" id="done3"><div class="dim"></div>
      <div class="gcard sunset" id="done3Card">
        <div class="gkick">Level 3 · Done</div>
        <h2>The Mela is lit!</h2>
        <div class="sub"></div>
        <div id="done3Stars"><img alt=""><img alt=""><img alt=""></div>
        <div id="done3Badges">${D.bills.map(b => `<img src="${A(b.badge + '.webp')}" alt="">`).join('')}</div>
        <div id="done3Money"><img src="${A('money_board.webp')}" alt=""><div class="lab">MONEY LEFT</div><div class="v"></div></div>
        <div class="gbtn cta abs" id="done3Cta">${D.completeCta}</div>
      </div>
    </div>`;
  const game = document.getElementById('game');
  game.insertBefore(l3, document.getElementById('gHud'));   // under the HUD (marigolds, 🔊), above the game background
})();

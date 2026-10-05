/* Builds the game layer inside the story stage. Loaded after story.js, before the other game scripts.
   All game art comes through GA(): the single-file build (tools/build.py) puts it in window.EMBED. */
window.GA = p => (window.EMBED && window.EMBED['game/' + p]) || 'assets/game/' + p;
(function () {
  const root = document.createElement('div');
  root.id = 'game'; root.className = 'hidden';
  root.innerHTML = `
    <div id="gBg"></div>

    <!-- price tag on its rope -->
    <div id="tagRig" class="hidden">
      <div id="rope"></div>
      <div id="tag">
        <img id="tagIcon" alt="">
        <div id="tagText"><div id="tagName"></div><div id="tagPrice"></div></div>
        <div id="tagStamp"></div>
      </div>
    </div>

    <!-- number line -->
    <div id="numline" class="hidden">
      <img class="nl-tick" id="tickL" src="${GA('nl_tick_big.webp')}" alt="">
      <img class="nl-tick" id="tickR" src="${GA('nl_tick_big.webp')}" alt="">
      <img class="nl-tick mid" id="tickM" src="${GA('nl_tick_big.webp')}" alt="">
      <img id="nlBar" src="${GA('nl_bar.webp')}" alt="">
      <div class="nl-label" id="labL"></div>
      <div class="nl-label mid" id="labM"></div>
      <div class="nl-label" id="labR"></div>
    </div>
    <div class="marker hidden" id="marker"><img src="${GA('nl_marker.webp')}" alt=""><span></span></div>
    <div class="marker hidden" id="markerGreen"><img src="${GA('nl_marker_green.webp')}" alt=""><span></span></div>

    <!-- answer buttons -->
    <div class="gbtn hidden" id="btnL" data-side="L"><span class="lbl"></span><i class="tick-badge"><svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></i></div>
    <div class="gbtn hidden" id="btnR" data-side="R"><span class="lbl"></span><i class="tick-badge"><svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></i></div>
    <div class="abs hidden" id="btnSkip">Skip <svg viewBox="0 0 24 24"><path d="M5 5l8 7-8 7zM13 5l8 7-8 7z" fill="currentColor"/></svg></div>

    <!-- Gudiya + reactions -->
    <div id="gudiya" class="hidden"><div class="gshadow"></div><div class="gbody"><div class="flip"></div></div></div>
    <div id="bleat" class="abs">Meh-eh!</div>

    <!-- cart (appears only when an item is collected) -->
    <div id="cart" class="abs"><div id="cartItems"></div><img class="cart-img" src="${GA('cart_empty.webp')}" alt=""><div id="cartCount">0 / 7</div></div>

    <!-- hint strip + hand -->
    <div id="rule" class="abs"><span class="bulb"><svg viewBox="0 0 24 24"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" fill="#f7b733" stroke="#8a5a10" stroke-width="1.6" stroke-linejoin="round"/></svg></span><span id="ruleText"></span></div>
    <img id="hand" class="abs" src="${GA('ui_hand.webp')}" alt="">

    <!-- HUD -->
    <div id="gHud" class="hidden">
      <div class="gchip abs" id="gChip"></div>
      <div class="round-btn abs" id="btnSpeaker" title="Hear it again"><svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#3a220f"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="#3a220f" stroke-width="2" stroke-linecap="round"/></svg></div>
      <div class="abs" id="mariPlate"></div>
      <div class="abs" id="sunPanel"></div>
      <div class="glow-ring" id="glowMari" style="left:678px;top:14px;width:564px;height:116px"></div>
      <div class="glow-ring" id="glowSun" style="left:1558px;top:4px;width:344px;height:180px;border-radius:36px"></div>
    </div>

    <!-- coach: Pari full body (explaining frames, filled by hud.js) · round avatar for the others · speech bubble -->
    <div id="coach" class="hidden">
      <div class="abs coachFig" id="pariCoach"><div class="pc-shadow"></div></div>
      <div class="abs coachFig" id="manjuCoach"><div class="pc-shadow"></div></div>
      <div class="abs coachFig" id="gudduCoach"><div class="pc-shadow"></div></div>
      <div class="abs" id="avatar"><img alt=""></div>
      <div class="abs" id="bubble"><div id="bubbleName"></div><div id="bubbleText"></div></div>
    </div>

    <!-- title -->
    <div class="overlay" id="titleOv">
      <div class="dim"></div>
      <div class="gcard" id="titleCard">
        <div class="lvl">Level 1</div>
        <h1>Aakoli Bazaar</h1>
        <p>Round the price tags before sunset</p>
        <div id="titleIcons"></div>
              </div>
    </div>

    <!-- level complete -->
    <div class="overlay hidden" id="doneOv">
      <div class="gcard" id="doneCard">
        <h2>7 of 7 done!</h2>
        <div class="sub">Every price is a round number now.</div>
        <div id="doneStars"><img alt=""><img alt=""><img alt=""></div>
        <img id="doneCart" src="${GA('cart_full.webp')}" alt="">
        <div id="doneScore"></div>
        <div class="gbtn cta abs" id="doneCta">Go to the office</div>
      </div>
    </div>

    <div id="gFx"></div>
    <div id="gToast" class="abs"></div>`;
  const stage = document.getElementById('stage');
  stage.insertBefore(root, document.getElementById('fx'));   // above the story's #ui and #hud, below the iris/fade/loader
})();

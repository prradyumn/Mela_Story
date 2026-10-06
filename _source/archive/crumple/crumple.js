/* CRUMPLE — the Level 2 paper-squash transition (Three.js r149, js/vendor/three.min.js).
   The bill is drawn onto a canvas texture (L2SC.drawBill) and mapped onto a 26×32-segment plane in an orthographic
   scene that matches the 1920×1080 stage. crumple() pulls every vertex onto a lumpy sphere (paper wraps from the
   centre to the back), adds creases, spins it a little and returns when it is a ball; unCrumple() runs the same
   motion backwards. Flat shading on a Lambert material gives the facets. If WebGL is not available (or the texture
   is blocked, e.g. file:// images), both fall back to a 2D squash so the game never stalls. */
(function () {
  const W = 620, H = 775, SX = 26, SY = 32, R = 108;
  let ok = null, renderer, scene, cam, mesh, geo, base, target, crease, tex;
  const cv = () => document.getElementById('crumpleCv');

  function init() {
    if (ok !== null) return ok;
    try {
      if (!window.THREE) throw new Error('no THREE');
      renderer = new THREE.WebGLRenderer({ canvas: cv(), alpha: true, antialias: true, premultipliedAlpha: false });
      renderer.setPixelRatio(1); renderer.setSize(1920, 1080, false); renderer.setClearColor(0x000000, 0);
      if ('outputColorSpace' in renderer) renderer.outputColorSpace = 'srgb'; else renderer.outputEncoding = THREE.sRGBEncoding;
      scene = new THREE.Scene();
      cam = new THREE.OrthographicCamera(0, 1920, 0, -1080, -3000, 3000);   // stage px; y is negated
      scene.add(new THREE.AmbientLight(0xffffff, 0.62));
      const d = new THREE.DirectionalLight(0xffffff, 0.5); d.position.set(-0.45, 0.75, 1); scene.add(d);
      geo = new THREE.PlaneGeometry(W, H, SX, SY);
      const p = geo.attributes.position; base = Float32Array.from(p.array);
      target = new Float32Array(p.array.length); crease = new Float32Array(p.count);
      const maxD = Math.hypot(W / 2, H / 2), hash = i => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
      for (let i = 0; i < p.count; i++) {
        const x = base[i * 3], y = base[i * 3 + 1];
        const th = Math.min(1, Math.hypot(x, y) / maxD) * Math.PI * 0.96, ph = Math.atan2(y, x);
        const gx = Math.round((x / W + .5) * 6), gy = Math.round((y / H + .5) * 7);   // coarse lumps
        const r = R * (0.82 + 0.36 * hash(gx * 13 + gy * 7)) + (hash(i) - .5) * 14;
        target[i * 3] = r * Math.sin(th) * Math.cos(ph);
        target[i * 3 + 1] = r * Math.sin(th) * Math.sin(ph);
        target[i * 3 + 2] = r * Math.cos(th);
        crease[i] = Math.sin(x * 0.045 + y * 0.028) * Math.cos(y * 0.051 - x * 0.019) + (hash(i + 99) - .5) * .8;
      }
      tex = new THREE.CanvasTexture(document.createElement('canvas'));
      const mat = new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide, flatShading: true, transparent: true, alphaTest: 0.08 });
      mesh = new THREE.Mesh(geo, mat); scene.add(mesh);
      ok = true;
    } catch (e) { console.warn('crumple: 2D fallback', e); ok = false; }
    return ok;
  }

  function pose(t, cx, cy) {
    const p = geo.attributes.position.array, e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, wr = Math.sin(Math.PI * Math.min(1, t * 1.15));
    for (let i = 0, n = crease.length; i < n; i++) {
      const k = i * 3;
      p[k] = base[k] + (target[k] - base[k]) * e;
      p[k + 1] = base[k + 1] + (target[k + 1] - base[k + 1]) * e;
      p[k + 2] = base[k + 2] + (target[k + 2] - base[k + 2]) * e + crease[i] * 46 * wr;
    }
    geo.attributes.position.needsUpdate = true;
    mesh.position.set(cx, -cy, 0);
    mesh.rotation.set(-0.35 * e, 0.55 * e, -0.75 * e);
    renderer.render(scene, cam);
  }

  function setTexture(canvas) {
    tex.image = canvas; tex.needsUpdate = true;
    if ('colorSpace' in tex) tex.colorSpace = 'srgb'; else tex.encoding = THREE.sRGBEncoding;
  }

  const Crumple = {
    R,
    /* paper (drawn on `canvas`) centred at (cx,cy) → ball. Resolves at the ball moment. */
    crumple(canvas, cx, cy, dur = .65) {
      if (!init()) return Promise.resolve(false);
      try { setTexture(canvas); pose(0, cx, cy); } catch (e) { ok = false; return Promise.resolve(false); }
      gsap.set(cv(), { opacity: 1 });
      const o = { t: 0 };
      return new Promise(res => gsap.to(o, { t: 1, duration: dur, ease: 'power1.in', onUpdate: () => pose(o.t, cx, cy), onComplete: () => res(true) }));
    },
    /* ball → flat paper. Resolves when flat. */
    unCrumple(canvas, cx, cy, dur = .75) {
      if (!init()) return Promise.resolve(false);
      try { setTexture(canvas); pose(1, cx, cy); } catch (e) { ok = false; return Promise.resolve(false); }
      gsap.set(cv(), { opacity: 1 });
      const o = { t: 1 };
      return new Promise(res => gsap.to(o, { t: 0, duration: dur, ease: 'power2.out', onUpdate: () => pose(o.t, cx, cy), onComplete: () => res(true) }));
    },
    /* test hook: render one frame of the crumple at t (0 = flat, 1 = ball) */
    _frame(canvas, t, cx, cy) { if (!init()) return false; setTexture(canvas); gsap.set(cv(), { opacity: 1 }); pose(t, cx, cy); return true; },
    hide() { gsap.set(cv(), { opacity: 0 }); if (ok) { renderer.clear(); } },
    available() { return init(); }
  };
  window.CRUMPLE = Crumple;
})();

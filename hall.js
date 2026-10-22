/* ==========================================================================
   YOA PRO — La galería (escena 3D)
   Three.js r149 · script clásico (sin módulos) · expone window.__HALL__
   La cámara recorre el pasillo según el scroll: cada sección con [data-cam]
   es una parada. Las piezas se definen en lib/manifest.js.
   ========================================================================== */
(function () {
  "use strict";

  var B = window.__BRAND__ || { exhibits: [], rooms: [] };
  var Hall = { ok: false, layout: null, onStop: null, onCamera: null };
  window.__HALL__ = Hall;

  var THREE;
  var ACCENT = 0xc8f05a;
  var WARM = 0xecebe6;
  var BG = 0x0b0c0d;

  // ---- Planta del pasillo (el visitante avanza hacia -z) ----
  var HALL_W = 14, HALL_H = 7, Z_START = 14, Z_END = -94;
  var EX_Z = [-10, -18.5, -33, -41.5, -50, -65, -73.5];
  var ROOM_Z = { 1: -3.5, 2: -26, 3: -57.5 };
  var PORTALS_Z = [6, -14.25, -37.25, -45.75, -69.25, -80];
  var ATRIUM = { x: 0, y: 3.4, z: -86 };
  var SCREEN_W = 5.0, SCREEN_H = 3.125, SCREEN_Y = 2.95;
  var ANG = 0.62; // giro de las pantallas hacia el centro del pasillo

  var reduced = false;
  try { reduced = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function webglOK() {
    try {
      var c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
    } catch (e) { return false; }
  }

  // ---------------------------------------------------------------------------
  // Texturas generadas en canvas
  // ---------------------------------------------------------------------------
  function makeCanvas(w, h) {
    var c = document.createElement("canvas");
    c.width = w; c.height = h;
    return c;
  }
  function canvasTexture(c, srgb) {
    var t = new THREE.CanvasTexture(c);
    if (srgb !== false) t.encoding = THREE.sRGBEncoding;
    return t;
  }

  function radialTex() {
    var c = makeCanvas(256, 256), g = c.getContext("2d");
    var gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(0.35, "rgba(255,255,255,0.45)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    return canvasTexture(c, false);
  }

  function beamTex() {
    var c = makeCanvas(8, 256), g = c.getContext("2d");
    var gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, "rgba(255,255,255,0.9)");
    gr.addColorStop(0.55, "rgba(255,255,255,0.18)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 8, 256);
    return canvasTexture(c, false);
  }

  function floorTex() {
    var c = makeCanvas(256, 256), g = c.getContext("2d");
    g.fillStyle = "#101213"; g.fillRect(0, 0, 256, 256);
    g.fillStyle = "rgba(255,255,255,0.05)";
    g.fillRect(0, 0, 256, 2); g.fillRect(0, 0, 2, 256);
    g.fillStyle = "rgba(255,255,255,0.018)";
    g.fillRect(0, 128, 256, 1); g.fillRect(128, 0, 1, 256);
    var t = canvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }

  function wallTex() {
    var c = makeCanvas(256, 256), g = c.getContext("2d");
    g.fillStyle = "#121416"; g.fillRect(0, 0, 256, 256);
    g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(0, 0, 3, 256);
    g.fillStyle = "rgba(255,255,255,0.025)"; g.fillRect(3, 0, 1, 256);
    var t = canvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }

  function dashTex() {
    var c = makeCanvas(8, 128), g = c.getContext("2d");
    g.clearRect(0, 0, 8, 128);
    g.fillStyle = "rgba(200,240,90,1)"; g.fillRect(0, 0, 8, 56);
    var t = canvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }

  // Etiquetas de texto (se redibujan cuando cargan las fuentes)
  var labels = [];
  function makeLabel(w, h, draw) {
    var c = makeCanvas(w, h);
    var tex = canvasTexture(c);
    tex.anisotropy = 4;
    var L = { c: c, tex: tex, draw: draw };
    L.redraw = function () {
      var g = c.getContext("2d");
      g.clearRect(0, 0, w, h);
      draw(g, w, h);
      tex.needsUpdate = true;
    };
    L.redraw();
    labels.push(L);
    return tex;
  }

  function mono(px, weight) { return (weight || 500) + " " + px + "px 'JetBrains Mono', ui-monospace, monospace"; }
  function display(px, weight) { return (weight || 600) + " " + px + "px 'Archivo', 'Manrope', system-ui, sans-serif"; }
  function setSpacing(g, v) { try { g.letterSpacing = v; } catch (e) {} }
  function setStretch(g, v) { try { g.fontStretch = v; } catch (e) {} }

  function hexToRgb(hex) {
    var n = parseInt(hex.replace("#", ""), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function rgba(hex, a) { var c = hexToRgb(hex); return "rgba(" + c.r + "," + c.g + "," + c.b + "," + a + ")"; }

  // Marcador de pantalla mientras no haya captura real (parece una web, no un hueco)
  function placeholderTex(ex, i, total) {
    var W = 1280, H = 800;
    return makeLabel(W, H, function (g) {
      var tint = ex.tint || "#c8f05a";
      g.fillStyle = "#0f1112"; g.fillRect(0, 0, W, H);
      var bg = g.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, rgba(tint, 0.10)); bg.addColorStop(1, rgba(tint, 0.02));
      g.fillStyle = bg; g.fillRect(0, 0, W, H);

      // barra de navegación
      g.fillStyle = "rgba(255,255,255,0.04)"; g.fillRect(0, 0, W, 72);
      g.fillStyle = tint; g.fillRect(48, 28, 16, 16);
      g.fillStyle = "#ecebe6"; g.font = display(20, 600); setStretch(g, "expanded");
      g.textBaseline = "middle"; g.fillText(ex.title.toUpperCase(), 78, 37);
      g.fillStyle = "rgba(236,235,230,0.35)";
      for (var k = 0; k < 4; k++) g.fillRect(W - 420 + k * 86, 34, 58, 5);
      g.strokeStyle = tint; g.lineWidth = 2; g.strokeRect(W - 150 + 34, 22, 82, 30);

      // cabecera
      g.fillStyle = rgba(tint, 0.9); g.font = mono(15, 500); setSpacing(g, "3px");
      g.fillText((ex.sub || "").toUpperCase(), 64, 170);
      setSpacing(g, "0px");
      g.fillStyle = "#ecebe6"; g.font = display(76, 600); setStretch(g, "expanded");
      var words = ex.title.split(" "), line = "", y = 250, lines = 0;
      for (var w = 0; w < words.length; w++) {
        var test = line ? line + " " + words[w] : words[w];
        if (g.measureText(test).width > 640 && line) { g.fillText(line, 60, y); y += 84; line = words[w]; lines++; }
        else line = test;
      }
      g.fillText(line, 60, y);
      g.fillStyle = "rgba(236,235,230,0.30)";
      g.fillRect(64, y + 70, 460, 8); g.fillRect(64, y + 92, 380, 8); g.fillRect(64, y + 114, 300, 8);
      g.fillStyle = tint; g.fillRect(64, y + 160, 190, 50);
      g.strokeStyle = "rgba(236,235,230,0.4)"; g.lineWidth = 2; g.strokeRect(272, y + 160, 170, 50);

      // bloque de imagen
      var ix = 760, iy = 120, iw = 456, ih = 420;
      var ig = g.createLinearGradient(ix, iy, ix + iw, iy + ih);
      ig.addColorStop(0, rgba(tint, 0.55)); ig.addColorStop(1, rgba(tint, 0.12));
      g.fillStyle = ig; g.fillRect(ix, iy, iw, ih);
      g.save(); g.beginPath(); g.rect(ix, iy, iw, ih); g.clip();
      g.strokeStyle = "rgba(255,255,255,0.10)"; g.lineWidth = 1;
      for (var d = -ih; d < iw; d += 22) { g.beginPath(); g.moveTo(ix + d, iy + ih); g.lineTo(ix + d + ih, iy); g.stroke(); }
      g.restore();

      // tarjetas inferiores
      for (var cI = 0; cI < 3; cI++) {
        var cx = 64 + cI * 392;
        g.fillStyle = "rgba(255,255,255,0.045)"; g.fillRect(cx, 600, 360, 150);
        g.fillStyle = rgba(tint, 0.7); g.fillRect(cx + 24, 628, 28, 4);
        g.fillStyle = "rgba(236,235,230,0.35)"; g.fillRect(cx + 24, 656, 220, 8); g.fillRect(cx + 24, 678, 170, 8);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Escena
  // ---------------------------------------------------------------------------
  var renderer, scene, camera, clock;
  var items = [];          // piezas expuestas
  var dash, rings = [], dust, dustSpeed = [];
  var stops = [];
  var cur = { p: null, t: null, fov: 52 };
  var pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  var dimNow = -1, lastStop = -1, running = true, aspect = 1;
  var radial, beam;

  Hall.init = function (canvas) {
    if (!window.THREE || !webglOK() || !canvas) {
      document.documentElement.classList.add("no-webgl");
      return false;
    }
    THREE = window.THREE;

    try {
      var DPR = Math.min(window.devicePixelRatio || 1, 1.75);
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: DPR < 2, powerPreference: "high-performance" });
      renderer.setPixelRatio(DPR);                          // primero el pixel ratio…
      renderer.setSize(window.innerWidth, window.innerHeight, false); // …luego el tamaño
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
    } catch (e) {
      document.documentElement.classList.add("no-webgl");
      return false;
    }

    scene = new THREE.Scene();
    scene.background = new THREE.Color(BG);
    scene.fog = new THREE.FogExp2(BG, 0.03);
    aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(52, aspect, 0.1, 160);
    clock = new THREE.Clock();
    radial = radialTex();
    beam = beamTex();

    buildHall();
    buildPortals();
    buildExhibits();
    buildAtrium();
    if (!reduced) buildDust();

    scene.add(new THREE.AmbientLight(0xffffff, 0.34));
    scene.add(new THREE.HemisphereLight(0xdfe3dc, 0x0b0c0d, 0.5));
    var follow = new THREE.PointLight(0xfff6e8, 0.9, 16, 2);
    follow.name = "follow";
    scene.add(follow);

    Hall.layout = {
      zStart: Z_START, zEnd: Z_END, halfW: HALL_W / 2,
      exhibits: items.map(function (it) { return { id: it.ex.id, x: it.group.position.x, z: it.group.position.z, side: it.ex.side, room: it.ex.room }; }),
      rooms: Object.keys(ROOM_Z).map(function (k) { return { n: +k, z: ROOM_Z[k] }; }),
      atrium: ATRIUM
    };

    measure();
    var first = desired(window.scrollY || 0);
    cur.p = first.p.clone(); cur.t = first.t.clone(); cur.fov = first.fov;

    bindEvents();
    Hall.ok = true;

    // Etiquetas con las fuentes definitivas
    var fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    Promise.race([fontsReady, new Promise(function (r) { setTimeout(r, 2500); })]).then(function () {
      labels.forEach(function (L) { L.redraw(); });
      measure();
    });

    requestAnimationFrame(loop);
    return true;
  };

  function std(color, rough, metal) {
    return new THREE.MeshStandardMaterial({ color: color, roughness: rough, metalness: metal });
  }
  function basic(color, opacity, additive) {
    var m = new THREE.MeshBasicMaterial({ color: color, transparent: opacity < 1 || !!additive, opacity: opacity });
    if (additive) { m.blending = THREE.AdditiveBlending; m.depthWrite = false; }
    return m;
  }

  function buildHall() {
    var len = Z_START - Z_END, cz = (Z_START + Z_END) / 2;

    var ft = floorTex(); ft.repeat.set(HALL_W / 2, len / 2);
    ft.anisotropy = renderer.capabilities.getMaxAnisotropy();
    var floor = new THREE.Mesh(new THREE.PlaneGeometry(HALL_W, len), new THREE.MeshStandardMaterial({ map: ft, roughness: 0.38, metalness: 0.55 }));
    floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, cz);
    scene.add(floor);

    var wt = wallTex(); wt.repeat.set(len / 3.5, 1);
    var wallMat = new THREE.MeshStandardMaterial({ map: wt, roughness: 0.9, metalness: 0.08 });
    var wl = new THREE.Mesh(new THREE.PlaneGeometry(len, HALL_H), wallMat);
    wl.rotation.y = Math.PI / 2; wl.position.set(-HALL_W / 2, HALL_H / 2, cz); scene.add(wl);
    var wr = new THREE.Mesh(new THREE.PlaneGeometry(len, HALL_H), wallMat);
    wr.rotation.y = -Math.PI / 2; wr.position.set(HALL_W / 2, HALL_H / 2, cz); scene.add(wr);

    var ceil = new THREE.Mesh(new THREE.PlaneGeometry(HALL_W, len), std(0x0c0e0f, 0.95, 0));
    ceil.rotation.x = Math.PI / 2; ceil.position.set(0, HALL_H, cz); scene.add(ceil);

    var endWall = new THREE.Mesh(new THREE.PlaneGeometry(HALL_W, HALL_H), std(0x0e1012, 0.9, 0.05));
    endWall.position.set(0, HALL_H / 2, Z_END); scene.add(endWall);

    // tiras de luz del techo
    var stripMat = basic(0xb9bcb4, 1);
    [-2.4, 2.4].forEach(function (x) {
      var s = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, len - 4), stripMat);
      s.position.set(x, HALL_H - 0.03, cz); scene.add(s);
      var glow = new THREE.Mesh(new THREE.PlaneGeometry(1.4, len - 4), new THREE.MeshBasicMaterial({ map: radial, color: 0xd8dbd2, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false }));
      glow.rotation.x = Math.PI / 2; glow.position.set(x, HALL_H - 0.06, cz); scene.add(glow);
    });

    // zócalos con luz de acento
    var baseMat = basic(ACCENT, 0.55);
    [-1, 1].forEach(function (sx) {
      var b = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, len - 2), baseMat);
      b.position.set(sx * (HALL_W / 2 - 0.03), 0.07, cz); scene.add(b);
    });

    // línea guía del suelo (avanza hacia el fondo)
    var dt = dashTex(); dt.repeat.set(1, 140);
    dash = dt;
    var guide = new THREE.Mesh(new THREE.PlaneGeometry(0.05, len - 10), new THREE.MeshBasicMaterial({ map: dt, transparent: true, opacity: 0.55, depthWrite: false }));
    guide.rotation.x = -Math.PI / 2; guide.position.set(0, 0.012, cz - 3); scene.add(guide);
  }

  function portal(z, room) {
    var g = new THREE.Group(); g.position.z = z;
    var metal = std(0x1a1d20, 0.35, 0.7);
    var light = basic(room ? ACCENT : 0xdcded6, room ? 0.95 : 0.55);
    var px = HALL_W / 2 - 0.25;
    [-1, 1].forEach(function (sx) {
      var p = new THREE.Mesh(new THREE.BoxGeometry(0.35, HALL_H, 0.35), metal);
      p.position.set(sx * px, HALL_H / 2, 0); g.add(p);
      var l = new THREE.Mesh(new THREE.BoxGeometry(0.035, HALL_H - 0.45, 0.035), light);
      l.position.set(sx * (px - 0.2), (HALL_H - 0.45) / 2, 0.18); g.add(l);
    });
    var top = new THREE.Mesh(new THREE.BoxGeometry(HALL_W - 0.15, 0.35, 0.35), metal);
    top.position.set(0, HALL_H - 0.17, 0); g.add(top);
    var tl = new THREE.Mesh(new THREE.BoxGeometry(2 * (px - 0.2), 0.035, 0.035), light);
    tl.position.set(0, HALL_H - 0.45, 0.18); g.add(tl);

    if (room) {
      var rn = room.n < 10 ? "0" + room.n : "" + room.n;
      var tex = makeLabel(2048, 160, function (c, w, h) {
        c.fillStyle = "#0d0f10"; c.fillRect(0, 0, w, h);
        c.strokeStyle = "rgba(236,235,230,0.18)"; c.lineWidth = 3; c.strokeRect(1.5, 1.5, w - 3, h - 3);
        c.textBaseline = "middle"; c.textAlign = "center";
        c.font = mono(58, 500); setSpacing(c, "14px");
        var a = "SALA " + rn, b = "  ·  " + room.name.toUpperCase();
        var wa = c.measureText(a).width, wb = c.measureText(b).width;
        var x0 = w / 2 - (wa + wb) / 2;
        c.textAlign = "left";
        c.fillStyle = "#c8f05a"; c.fillText(a, x0, h / 2);
        c.fillStyle = "#ecebe6"; c.fillText(b, x0 + wa, h / 2);
      });
      var lab = new THREE.Mesh(new THREE.PlaneGeometry(9, 0.7), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
      lab.position.set(0, HALL_H - 1.05, 0.2); g.add(lab);
    }
    scene.add(g);
  }

  function buildPortals() {
    PORTALS_Z.forEach(function (z) { portal(z, null); });
    (B.rooms || []).forEach(function (r) { if (ROOM_Z[r.n] !== undefined) portal(ROOM_Z[r.n], r); });
  }

  // Marco de navegador encima de cada pantalla
  var BAR = 0.24;
  function browserBarTex(ex) {
    return makeLabel(1600, 77, function (c, w, h) {
      c.fillStyle = "#1b1e21"; c.fillRect(0, 0, w, h);
      c.fillStyle = "rgba(255,255,255,0.06)"; c.fillRect(0, h - 2, w, 2);
      ["#ff6159", "#ffbd2e", "#28c941"].forEach(function (col, k) {
        c.beginPath(); c.arc(34 + k * 30, h / 2, 9, 0, Math.PI * 2); c.fillStyle = col; c.globalAlpha = 0.85; c.fill(); c.globalAlpha = 1;
      });
      var pw = 620, px = (w - pw) / 2, py = 16, ph = h - 32;
      c.fillStyle = "#26292d"; roundRect(c, px, py, pw, ph, ph / 2); c.fill();
      c.fillStyle = "#c8f05a"; roundRect(c, px + 22, h / 2 - 7, 12, 10, 2); c.fill();
      c.strokeStyle = "#c8f05a"; c.lineWidth = 2.4; c.beginPath(); c.arc(px + 28, h / 2 - 7, 4.5, Math.PI, 0); c.stroke();
      c.fillStyle = "#c9ccc4"; c.font = mono(22, 500); c.textBaseline = "middle"; setSpacing(c, "1px");
      c.fillText(ex.domain || ex.title, px + 46, h / 2 + 1);
      c.fillStyle = "rgba(236,235,230,0.25)";
      for (var k = 0; k < 3; k++) c.fillRect(w - 120 + k * 30, h / 2 - 2, 16, 4);
    });
  }
  function roundRect(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  // Brillo de cristal en diagonal
  var sheenT = null;
  function sheenTex() {
    if (sheenT) return sheenT;
    var c = makeCanvas(256, 256), g = c.getContext("2d");
    var gr = g.createLinearGradient(0, 0, 256, 256);
    gr.addColorStop(0, "rgba(255,255,255,0.10)"); gr.addColorStop(0.28, "rgba(255,255,255,0.03)");
    gr.addColorStop(0.42, "rgba(255,255,255,0.0)"); gr.addColorStop(0.62, "rgba(255,255,255,0.05)");
    gr.addColorStop(0.7, "rgba(255,255,255,0.0)"); gr.addColorStop(1, "rgba(255,255,255,0.0)");
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    sheenT = canvasTexture(c, false);
    return sheenT;
  }
  // Carcasa del móvil: cuerpo redondeado con hueco para la pantalla
  var PH_W = 0.98, PH_H = 2.02, PH_SW = 0.9, PH_SH = 1.94;
  var bezelT = null;
  function bezelTex() {
    if (bezelT) return bezelT;
    var W = 392, H = 808, c = makeCanvas(W, H), g = c.getContext("2d");
    g.fillStyle = "#121416"; roundRect(g, 2, 2, W - 4, H - 4, 58); g.fill();
    g.strokeStyle = "rgba(236,235,230,0.28)"; g.lineWidth = 3; roundRect(g, 3, 3, W - 6, H - 6, 57); g.stroke();
    var ix = (W - W * PH_SW / PH_W) / 2, iy = (H - H * PH_SH / PH_H) / 2;
    g.globalCompositeOperation = "destination-out";
    roundRect(g, ix, iy, W - ix * 2, H - iy * 2, 44); g.fill();
    g.globalCompositeOperation = "source-over";
    g.fillStyle = "#050606"; roundRect(g, W / 2 - 46, iy + 14, 92, 26, 13); g.fill();
    bezelT = canvasTexture(c);
    return bezelT;
  }
  function placeholderMobileTex(ex) {
    return makeLabel(390, 844, function (g, W, H) {
      var tint = ex.tint || "#c8f05a";
      g.fillStyle = "#0f1112"; g.fillRect(0, 0, W, H);
      var bg = g.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, rgba(tint, 0.12)); bg.addColorStop(1, rgba(tint, 0.02));
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      g.fillStyle = tint; g.fillRect(24, 64, 12, 12);
      g.fillStyle = "rgba(236,235,230,0.5)"; g.fillRect(W - 50, 64, 26, 3); g.fillRect(W - 50, 72, 26, 3);
      g.fillStyle = rgba(tint, 0.9); g.font = mono(11, 500); setSpacing(g, "2px"); g.textBaseline = "alphabetic";
      g.fillText((ex.sub || "").toUpperCase(), 24, 150);
      setSpacing(g, "0px"); g.fillStyle = "#ecebe6"; g.font = display(36, 600); setStretch(g, "expanded");
      var words = ex.title.split(" "), line = "", y = 196;
      for (var k = 0; k < words.length; k++) {
        var t = line ? line + " " + words[k] : words[k];
        if (g.measureText(t).width > W - 48 && line) { g.fillText(line, 24, y); y += 42; line = words[k]; } else line = t;
      }
      g.fillText(line, 24, y);
      g.fillStyle = "rgba(236,235,230,0.3)"; g.fillRect(24, y + 34, 280, 6); g.fillRect(24, y + 50, 220, 6);
      g.fillStyle = tint; roundRect(g, 24, y + 84, W - 48, 46, 23); g.fill();
      var ig = g.createLinearGradient(0, y + 160, W, H);
      ig.addColorStop(0, rgba(tint, 0.5)); ig.addColorStop(1, rgba(tint, 0.1));
      g.fillStyle = ig; roundRect(g, 24, y + 160, W - 48, 250, 14); g.fill();
    });
  }

  function placePhone(phone) {
    var inward = phone.userData.inward, wide = aspect >= 1.15;
    phone.position.set(inward * (SCREEN_W / 2 - (wide ? 0.3 : 0.75)), -0.72, wide ? 0.45 : 0.3);
    phone.rotation.y = -inward * (wide ? 0.16 : 0.08);
  }

  function buildExhibits() {
    var list = (B.exhibits || []).slice(0, EX_Z.length);
    var total = list.length;
    var plinthMat = std(0x15181a, 0.4, 0.5);
    var frameMat = std(0x1b1e21, 0.3, 0.75);

    list.forEach(function (ex, i) {
      var sx = ex.side === "R" ? 1 : -1;
      var rot = ex.side === "R" ? -ANG : ANG;
      var tint = new THREE.Color(ex.tint || "#c8f05a");
      var group = new THREE.Group();
      group.position.set(sx * 4.35, 0, EX_Z[i]);
      group.rotation.y = rot;

      var plinth = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.55, 1.1), plinthMat);
      plinth.position.y = 0.275; group.add(plinth);
      var edge = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.014, 0.014), basic(ACCENT, 0.85));
      edge.position.set(0, 0.552, 0.552); group.add(edge);

      var num = (i + 1 < 10 ? "0" : "") + (i + 1) + " / " + (total < 10 ? "0" : "") + total;
      var plaque = makeLabel(1024, 100, function (c, w, h) {
        c.textBaseline = "middle"; c.font = mono(34, 500); setSpacing(c, "6px");
        c.fillStyle = "#c8f05a"; c.fillText(num, 8, h / 2);
        var nw = c.measureText(num + "   ").width;
        c.fillStyle = "#ecebe6"; c.fillText(ex.title.toUpperCase(), 8 + nw, h / 2);
      });
      var pl = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.35), new THREE.MeshBasicMaterial({ map: plaque, transparent: true, toneMapped: false }));
      pl.position.set(-0.55, 0.28, 0.556); group.add(pl);

      // ---- pantalla de escritorio con barra de navegador ----
      var screenGroup = new THREE.Group();
      screenGroup.position.y = SCREEN_Y;
      group.add(screenGroup);
      var TH = SCREEN_H + BAR;

      var halo = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN_W * 1.8, TH * 2.0), new THREE.MeshBasicMaterial({ map: radial, color: tint, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false }));
      halo.position.z = -0.1; screenGroup.add(halo);

      var frame = new THREE.Mesh(new THREE.BoxGeometry(SCREEN_W + 0.16, TH + 0.16, 0.1), frameMat);
      screenGroup.add(frame);

      var bar = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN_W, BAR), new THREE.MeshBasicMaterial({ map: browserBarTex(ex), toneMapped: false, fog: false }));
      bar.position.set(0, SCREEN_H / 2, 0.052); screenGroup.add(bar);

      var smat = new THREE.MeshBasicMaterial({ map: placeholderTex(ex, i, total), toneMapped: false, fog: false });
      var screen = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN_W, SCREEN_H), smat);
      screen.position.set(0, -BAR / 2, 0.052); screenGroup.add(screen);

      var sheen = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN_W, TH), new THREE.MeshBasicMaterial({ map: sheenTex(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
      sheen.position.z = 0.058; screenGroup.add(sheen);

      var rimMat = basic(ACCENT, 0.0);
      [[SCREEN_W + 0.22, 0.016, 0, (TH + 0.22) / 2], [SCREEN_W + 0.22, 0.016, 0, -(TH + 0.22) / 2],
       [0.016, TH + 0.22, (SCREEN_W + 0.22) / 2, 0], [0.016, TH + 0.22, -(SCREEN_W + 0.22) / 2, 0]].forEach(function (r) {
        var m = new THREE.Mesh(new THREE.BoxGeometry(r[0], r[1], 0.016), rimMat);
        m.position.set(r[2], r[3], 0.06); screenGroup.add(m);
      });

      // ---- móvil flotando delante, hacia el centro del pasillo ----
      var phone = new THREE.Group();
      var inward = ex.side === "R" ? -1 : 1;
      phone.userData.inward = inward;
      placePhone(phone);
      screenGroup.add(phone);
      var pmat = new THREE.MeshBasicMaterial({ map: placeholderMobileTex(ex), toneMapped: false, fog: false });
      var pscreen = new THREE.Mesh(new THREE.PlaneGeometry(PH_SW, PH_SH), pmat);
      phone.add(pscreen);
      var back = new THREE.Mesh(new THREE.PlaneGeometry(PH_W * 0.97, PH_H * 0.97), new THREE.MeshBasicMaterial({ color: 0x0c0d0e }));
      back.position.z = -0.012; phone.add(back);
      var bez = new THREE.Mesh(new THREE.PlaneGeometry(PH_W, PH_H), new THREE.MeshBasicMaterial({ map: bezelTex(), transparent: true, toneMapped: false, fog: false }));
      bez.position.z = 0.004; phone.add(bez);
      var psheen = new THREE.Mesh(new THREE.PlaneGeometry(PH_SW, PH_SH), new THREE.MeshBasicMaterial({ map: sheenTex(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
      psheen.position.z = 0.008; phone.add(psheen);
      var pglow = new THREE.Mesh(new THREE.PlaneGeometry(PH_W * 2.2, PH_H * 1.6), new THREE.MeshBasicMaterial({ map: radial, color: 0x000000, transparent: true, opacity: 0.55, depthWrite: false }));
      pglow.position.z = -0.03; phone.add(pglow);

      // luz de museo
      var cone = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 2.7, HALL_H - 0.4, 40, 1, true), new THREE.MeshBasicMaterial({ map: beam, color: 0xfff3dc, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      cone.position.set(0, (HALL_H - 0.4) / 2 + 0.2, 1.3); group.add(cone);
      var pool = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 4), new THREE.MeshBasicMaterial({ map: radial, color: tint, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false }));
      pool.rotation.x = -Math.PI / 2; pool.position.set(0, 0.015, 1.6); group.add(pool);

      scene.add(group);

      var n = new THREE.Vector3(Math.sin(rot), 0, Math.cos(rot));
      var r = new THREE.Vector3(Math.cos(rot), 0, -Math.sin(rot));
      var C = new THREE.Vector3(group.position.x, SCREEN_Y, group.position.z).add(n.clone().multiplyScalar(0.05));

      var it = {
        ex: ex, i: i, group: group, screenGroup: screenGroup, phone: phone,
        halo: halo, rimMat: rimMat, pool: pool, cone: cone, mats: [smat, pmat],
        n: n, r: r, C: C, phase: 0, active: 0, views: []
      };
      items.push(it);
      loadScreen(it, ex.img, smat, SCREEN_H / SCREEN_W, 1);
      loadScreen(it, ex.imgMobile, pmat, PH_SH / PH_SW, 1.25);
    });
  }

  // Carga una captura y la encuadra; si es de página completa, se recorre sola
  function loadScreen(it, src, mat, sr, speed) {
    if (!src || location.protocol === "file:") return; // WebGL no puede leer imágenes en file://
    var img = new Image();
    img.decoding = "async";
    img.onload = function () {
      try {
        var t = new THREE.Texture(img);
        t.encoding = THREE.sRGBEncoding;
        t.anisotropy = renderer.capabilities.getMaxAnisotropy();
        t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
        t.minFilter = THREE.LinearMipmapLinearFilter;
        var ir = img.naturalHeight / img.naturalWidth, view = { tex: t, tall: false, rep: 1, speed: speed };
        if (ir > sr * 1.15) { view.tall = true; view.rep = sr / ir; t.repeat.set(1, view.rep); t.offset.set(0, 1 - view.rep); }
        else if (ir < sr) { var rx = ir / sr; t.repeat.set(rx, 1); t.offset.set((1 - rx) / 2, 0); }
        else { var ry = sr / ir; t.repeat.set(1, ry); t.offset.set(0, 1 - ry); }
        t.needsUpdate = true;
        var old = mat.map; mat.map = t; mat.needsUpdate = true;
        it.views.push(view);
      } catch (e) { /* se queda el marcador */ }
    };
    img.src = src;
  }

  function buildAtrium() {
    var g = new THREE.Group();
    g.position.set(ATRIUM.x, ATRIUM.y, ATRIUM.z);
    var r1 = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.04, 12, 200), new THREE.MeshBasicMaterial({ color: ACCENT, toneMapped: false }));
    var r2 = new THREE.Mesh(new THREE.TorusGeometry(2.9, 0.012, 8, 200), basic(WARM, 0.55));
    var r3 = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.01, 8, 200), basic(WARM, 0.4));
    r2.rotation.x = 1.2; r3.rotation.y = 1.1;
    g.add(r1); g.add(r2); g.add(r3);
    rings = [r1, r2, r3];
    var glow = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({ map: radial, color: ACCENT, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.position.z = -0.6; g.add(glow);
    scene.add(g);

    var disk = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial({ map: radial, color: ACCENT, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false }));
    disk.rotation.x = -Math.PI / 2; disk.position.set(0, 0.016, ATRIUM.z); scene.add(disk);

    var word = makeLabel(2048, 360, function (c, w, h) {
      c.textAlign = "center"; c.textBaseline = "middle";
      c.font = display(250, 700); setStretch(c, "expanded"); setSpacing(c, "18px");
      c.fillStyle = "#ecebe6"; c.fillText("YOA PRO", w / 2, h / 2 + 10);
    });
    var wm = new THREE.Mesh(new THREE.PlaneGeometry(11, 1.93), new THREE.MeshBasicMaterial({ map: word, transparent: true, opacity: 0.13, toneMapped: false, depthWrite: false }));
    wm.position.set(0, 3.5, Z_END + 0.05); scene.add(wm);
  }

  function buildDust() {
    var N = window.innerWidth < 760 ? 220 : 520;
    var pos = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * (HALL_W - 1);
      pos[i * 3 + 1] = 0.2 + Math.random() * (HALL_H - 0.4);
      pos[i * 3 + 2] = Z_END + Math.random() * (Z_START - Z_END);
      dustSpeed.push(0.03 + Math.random() * 0.06);
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    dust = new THREE.Points(geo, new THREE.PointsMaterial({ color: WARM, size: 0.03, transparent: true, opacity: 0.45, depthWrite: false, sizeAttenuation: true }));
    scene.add(dust);
  }

  // ---------------------------------------------------------------------------
  // Planos de cámara
  // ---------------------------------------------------------------------------
  function V(x, y, z) { return new THREE.Vector3(x, y, z); }

  function exhibitShot(it) {
    var wide = aspect >= 1.15;
    var fov = wide ? 42 : 55;
    var tanH = Math.tan(fov * Math.PI / 360);
    var p, t;
    if (wide) {
      var d = SCREEN_W / (0.46 * 2 * tanH * aspect);
      d = Math.max(d, SCREEN_H / (0.62 * 2 * tanH));
      var W = 2 * d * tanH * aspect;
      var s = W * 0.21 * (it.ex.side === "R" ? -1 : 1);
      t = it.C.clone().add(it.r.clone().multiplyScalar(s));
      p = t.clone().add(it.n.clone().multiplyScalar(d));
    } else {
      var d2 = clamp(SCREEN_W / (0.9 * 2 * tanH * aspect), 6, 15);
      var Vh = 2 * d2 * tanH;
      t = it.C.clone().add(V(0, -Vh * 0.2, 0));
      p = it.C.clone().add(it.n.clone().multiplyScalar(d2)).add(V(0, -Vh * 0.05, 0));
    }
    return { p: p, t: t, fov: fov, dim: 0 };
  }

  function shotFor(key) {
    var wide = aspect >= 1.15;
    if (key === "hero") return { p: V(0, 2.05, 12.5), t: V(0, 2.75, -40), fov: wide ? 52 : 64, dim: 0.05 };
    if (key === "intro") return { p: V(0, 2.25, 6.8), t: V(wide ? 1.4 : 0, 2.6, -30), fov: wide ? 50 : 62, dim: 0.35 };
    if (key.indexOf("room-") === 0) {
      var n = +key.split("-")[1], z = ROOM_Z[n] !== undefined ? ROOM_Z[n] : 0;
      var rf = wide ? 52 : 66, rt = Math.tan(rf * Math.PI / 360);
      var rd = Math.max(6.5, 9.6 / (2 * rt * aspect));      // que el rótulo de la sala quepa entero
      return { p: V(0, 2.0, z + Math.min(rd, 17)), t: V(0, 5.3, z), fov: rf, dim: 0.12 };
    }
    if (key.indexOf("ex-") === 0) {
      var id = key.slice(3);
      for (var i = 0; i < items.length; i++) if (items[i].ex.id === id) return exhibitShot(items[i]);
    }
    var A = ATRIUM.z;
    if (key === "services") return { p: V(0, 3.0, A + 11), t: V(0, 3.4, A - 2), fov: 50, dim: 0.62 };
    if (key === "process") return { p: V(-3.4, 2.4, A + 9), t: V(0, 3.4, A - 2), fov: 50, dim: 0.62 };
    if (key === "plans") return { p: V(3.4, 2.6, A + 8), t: V(0, 3.4, A - 2), fov: 50, dim: 0.62 };
    if (key === "contact") return wide
      ? { p: V(-3.2, 3.3, A + 7.2), t: V(-3.2, 3.4, A - 2), fov: 46, dim: 0.28 }
      : { p: V(0, 3.3, A + 9.5), t: V(0, 3.4, A - 2), fov: 60, dim: 0.4 };
    return { p: V(0, 2.2, 0), t: V(0, 2.6, -30), fov: 52, dim: 0.3 };
  }

  function measure() {
    var els = document.querySelectorAll("[data-cam]");
    var maxS = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    var sy = window.scrollY || 0;
    stops = [];
    for (var i = 0; i < els.length; i++) {
      var el = els[i], rc = el.getBoundingClientRect();
      var top = rc.top + sy;
      var a = el.getAttribute("data-cam-anchor") === "top" ? top : top + rc.height / 2 - window.innerHeight / 2;
      a = clamp(a, 0, maxS);
      if (stops.length && a <= stops[stops.length - 1].anchor) a = stops[stops.length - 1].anchor + 1;
      stops.push({ key: el.getAttribute("data-cam"), el: el, anchor: a, shot: shotFor(el.getAttribute("data-cam")) });
    }
    Hall.stops = stops;
  }

  function ease(t) {
    var u = clamp((t - 0.1) / 0.8, 0, 1);
    return u * u * (3 - 2 * u);
  }

  var tmpP, tmpT;
  function desired(y) {
    if (!tmpP) { tmpP = new THREE.Vector3(); tmpT = new THREE.Vector3(); }
    if (!stops.length) { var s0 = shotFor("hero"); return { p: s0.p, t: s0.t, fov: s0.fov, dim: s0.dim, idx: 0 }; }
    if (y <= stops[0].anchor) { var a = stops[0].shot; return { p: a.p, t: a.t, fov: a.fov, dim: a.dim, idx: 0 }; }
    var last = stops[stops.length - 1];
    if (y >= last.anchor) { var b = last.shot; return { p: b.p, t: b.t, fov: b.fov, dim: b.dim, idx: stops.length - 1 }; }
    for (var i = 0; i < stops.length - 1; i++) {
      var A = stops[i], Bs = stops[i + 1];
      if (y >= A.anchor && y < Bs.anchor) {
        var raw = (y - A.anchor) / (Bs.anchor - A.anchor);
        var e = ease(raw);
        tmpP.copy(A.shot.p).lerp(Bs.shot.p, e);
        tmpT.copy(A.shot.t).lerp(Bs.shot.t, e);
        return { p: tmpP, t: tmpT, fov: lerp(A.shot.fov, Bs.shot.fov, e), dim: lerp(A.shot.dim, Bs.shot.dim, e), idx: raw < 0.5 ? i : i + 1 };
      }
    }
    return { p: last.shot.p, t: last.shot.t, fov: last.shot.fov, dim: last.shot.dim, idx: stops.length - 1 };
  }

  // ---------------------------------------------------------------------------
  // Bucle
  // ---------------------------------------------------------------------------
  function bindEvents() {
    var resizeT;
    window.addEventListener("resize", function () {
      clearTimeout(resizeT);
      resizeT = setTimeout(onResize, 120);
    });
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function () { measure(); });
      ro.observe(document.body);
    }
    window.addEventListener("load", measure);
    if (matchMedia("(hover: hover)").matches) {
      window.addEventListener("pointermove", function (e) {
        pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      }, { passive: true });
    }
    document.addEventListener("visibilitychange", function () {
      running = !document.hidden;
      if (running) { clock.getDelta(); requestAnimationFrame(loop); }
    });
  }

  function onResize() {
    aspect = window.innerWidth / window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    items.forEach(function (it) { placePhone(it.phone); });
    measure();
  }

  Hall.measure = function () { if (Hall.ok) measure(); };

  var look = null, followLight = null, firstFrame = true;
  function loop() {
    if (!running) return;
    requestAnimationFrame(loop);
    var dt = Math.min(clock.getDelta(), 0.1);
    var time = clock.elapsedTime;
    var y = window.scrollY || 0;
    var d = desired(y);

    var k = 1 - Math.exp(-dt * (reduced ? 7 : 3.4));
    cur.p.lerp(d.p, k);
    cur.t.lerp(d.t, k);
    cur.fov = lerp(cur.fov, d.fov, k);

    pointer.sx = lerp(pointer.sx, pointer.x, 1 - Math.exp(-dt * 2.5));
    pointer.sy = lerp(pointer.sy, pointer.y, 1 - Math.exp(-dt * 2.5));

    camera.position.copy(cur.p);
    camera.position.x += pointer.sx * 0.22;
    camera.position.y += -pointer.sy * 0.12;
    if (!look) look = new THREE.Vector3();
    look.copy(cur.t);
    camera.lookAt(look);
    if (Math.abs(camera.fov - cur.fov) > 0.01) { camera.fov = cur.fov; camera.updateProjectionMatrix(); }

    if (!followLight) followLight = scene.getObjectByName("follow");
    followLight.position.set(cur.p.x, cur.p.y + 1.2, cur.p.z - 2.5);

    // escena atenuada cuando hay mucho texto encima
    if (Math.abs(d.dim - dimNow) > 0.004) {
      dimNow = d.dim;
      document.documentElement.style.setProperty("--scene-dim", dimNow.toFixed(3));
    }

    // piezas: actividad según la distancia a su parada
    var vh = window.innerHeight;
    for (var i = 0; i < items.length; i++) {
      var it = items[i], target = 0;
      for (var s = 0; s < stops.length; s++) {
        if (stops[s].key === "ex-" + it.ex.id) { target = 1 - clamp(Math.abs(y - stops[s].anchor) / (vh * 0.7), 0, 1); break; }
      }
      it.active = lerp(it.active, target, 1 - Math.exp(-dt * 4));
      it.halo.material.opacity = 0.1 + it.active * 0.32;
      it.pool.material.opacity = 0.12 + it.active * 0.2;
      it.cone.material.opacity = 0.03 + it.active * 0.045;
      it.rimMat.opacity = it.active * 0.9;
      it.screenGroup.position.y = SCREEN_Y + Math.sin(time * 0.8 + i) * 0.035;

      // pantallas más tenues hasta que llega la cámara
      var lum = 0.62 + it.active * 0.38;
      it.mats[0].color.setScalar(lum); it.mats[1].color.setScalar(lum);
      it.phone.position.y = -0.72 + Math.sin(time * 1.1 + i * 2) * 0.03;

      // recorre las capturas de arriba abajo mientras la pieza está activa; vuelve arriba al salir
      if (it.active > 0.55) it.phase += dt / 16;
      else it.phase = Math.max(0, it.phase - dt * 0.6);
      for (var v = 0; v < it.views.length; v++) {
        var vw = it.views[v];
        if (!vw.tall) continue;
        var pp = (it.phase * vw.speed) % 2, ping = pp < 1 ? pp : 2 - pp;
        var eased = 0.5 - 0.5 * Math.cos(Math.PI * ping);
        vw.tex.offset.y = (1 - vw.rep) * (1 - eased);
      }
    }

    if (dash) dash.offset.y -= dt * 0.35;
    for (var r = 0; r < rings.length; r++) {
      rings[r].rotation.z += dt * (0.05 + r * 0.03) * (reduced ? 0.4 : 1);
      if (r > 0) rings[r].rotation.x += dt * 0.04 * r;
    }
    if (dust) {
      var arr = dust.geometry.attributes.position.array;
      for (var p = 0; p < dustSpeed.length; p++) {
        arr[p * 3 + 1] += dustSpeed[p] * dt;
        if (arr[p * 3 + 1] > HALL_H - 0.2) arr[p * 3 + 1] = 0.2;
      }
      dust.geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);

    if (firstFrame) { firstFrame = false; document.documentElement.classList.add("scene-ready"); }
    if (d.idx !== lastStop) {
      lastStop = d.idx;
      if (typeof Hall.onStop === "function") Hall.onStop(d.idx, stops[d.idx] ? stops[d.idx].key : "");
    }
    if (typeof Hall.onCamera === "function") {
      Hall.onCamera(cur.p.x, cur.p.z, Math.atan2(cur.t.x - cur.p.x, -(cur.t.z - cur.p.z)));
    }
  }
})();

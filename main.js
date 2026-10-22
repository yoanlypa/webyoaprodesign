/* ==========================================================================
   YOA PRO — interfaz: navegación, revelados, HUD, visita guiada y formulario
   ========================================================================== */
(function () {
  "use strict";

  var B = window.__BRAND__ || {};
  var root = document.documentElement;
  var reduced = false;
  try { reduced = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

  function safe(fn, name) {
    try { fn(); } catch (err) { if (window.console) console.warn("[YOA PRO] " + name + ":", err); }
  }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function navH() { return parseInt(getComputedStyle(root).getPropertyValue("--nav-h"), 10) || 72; }

  // ---------------------------------------------------------------------------
  // Scroll animado (el mismo para enlaces, "Siguiente pieza" y visita guiada)
  // ---------------------------------------------------------------------------
  var scrollAnim = null;
  function stopScrollAnim() {
    if (scrollAnim) { cancelAnimationFrame(scrollAnim.raf); scrollAnim = null; root.style.scrollBehavior = ""; }
  }
  function animateScroll(to, done) {
    stopScrollAnim();
    var from = window.scrollY || 0;
    var maxS = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    to = clamp(to, 0, maxS);
    var dist = Math.abs(to - from);
    if (dist < 2) { if (done) done(); return; }
    var dur = reduced ? 350 : clamp(dist / 1.5, 900, 2600);
    var t0 = performance.now();
    root.style.scrollBehavior = "auto";
    scrollAnim = {};
    (function step(now) {
      var t = clamp((now - t0) / dur, 0, 1);
      var e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      window.scrollTo(0, from + (to - from) * e);
      if (t < 1) scrollAnim.raf = requestAnimationFrame(step);
      else { scrollAnim = null; root.style.scrollBehavior = ""; if (done) done(); }
    })(t0);
    scrollAnim.raf = scrollAnim.raf || 0;
  }

  // Posición de llegada de una sección: la parada de cámara si existe
  function targetFor(el) {
    var H = window.__HALL__;
    if (H && H.ok && H.stops) {
      for (var i = 0; i < H.stops.length; i++) if (H.stops[i].el === el) return H.stops[i].anchor;
    }
    return el.getBoundingClientRect().top + (window.scrollY || 0) - navH();
  }

  // ---------------------------------------------------------------------------
  function initSplash() {
    var splash = $("[data-splash]");
    if (!splash) return;
    var hide = function () { splash.classList.add("is-out"); };
    var check = setInterval(function () {
      if (root.classList.contains("scene-ready") || root.classList.contains("no-webgl")) { clearInterval(check); setTimeout(hide, 450); }
    }, 120);
    window.addEventListener("load", function () { setTimeout(hide, 1600); });
    setTimeout(function () { clearInterval(check); hide(); }, 4000);
  }

  function initNav() {
    var nav = $("[data-nav]");
    var toggle = $(".nav-toggle");
    var onScroll = function () { nav.classList.toggle("is-scrolled", (window.scrollY || 0) > 24); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    if (toggle) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      $$(".nav-links a").forEach(function (a) {
        a.addEventListener("click", function () { nav.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); });
      });
    }
  }

  function initAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      stopTour();
      animateScroll(id === "#inicio" ? 0 : targetFor(el));
      if (history.replaceState) history.replaceState(null, "", id);
    });
  }

  function initReveal() {
    var els = $$(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("is-visible"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el, i) {
      if (el.closest(".hero")) el.style.transitionDelay = (0.15 + i * 0.09) + "s";
      io.observe(el);
    });
    setTimeout(function () {
      $$(".reveal:not(.is-visible)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-visible");
      });
    }, 6000);
  }

  // ---------------------------------------------------------------------------
  // Escena 3D + HUD
  // ---------------------------------------------------------------------------
  var ROOM_NAMES = {};
  (B.rooms || []).forEach(function (r) { ROOM_NAMES[r.n] = r.name; });
  var EX_INDEX = {};
  (B.exhibits || []).forEach(function (ex, i) { EX_INDEX[ex.id] = { i: i, ex: ex }; });
  var TOTAL = (B.exhibits || []).length;
  function two(n) { return n < 10 ? "0" + n : "" + n; }

  function placeName(key) {
    if (key === "hero") return "Recepción";
    if (key === "intro") return "Vestíbulo";
    if (key.indexOf("room-") === 0) { var n = +key.split("-")[1]; return "Sala " + two(n) + " · Acceso"; }
    if (key.indexOf("ex-") === 0) {
      var e = EX_INDEX[key.slice(3)];
      return e ? "Sala " + two(e.ex.room) + " · Pieza " + two(e.i + 1) + "/" + two(TOTAL) : "Galería";
    }
    if (key === "services") return "Atrio · Servicios";
    if (key === "process") return "Atrio · Método";
    if (key === "plans") return "Atrio · Planes";
    if (key === "contact") return "Salida · Contacto";
    return "Galería";
  }

  var hudMarker = null, hudOn = false;
  function buildMap(layout) {
    var svg = $("[data-hud-map]");
    if (!svg || !layout) return;
    var NS = "http://www.w3.org/2000/svg";
    var span = layout.zStart - layout.zEnd;
    var X = function (z) { return 8 + (layout.zStart - z) / span * 224; };
    var Y = function (x) { return 28 + (x / layout.halfW) * 19; };
    function el(tag, attrs) { var n = document.createElementNS(NS, tag); for (var k in attrs) n.setAttribute(k, attrs[k]); svg.appendChild(n); return n; }
    el("rect", { x: 8, y: 9, width: 224, height: 38, fill: "none", stroke: "rgba(236,235,230,0.25)", "stroke-width": 1 });
    el("line", { x1: 12, y1: 28, x2: 228, y2: 28, stroke: "rgba(200,240,90,0.35)", "stroke-width": 0.75, "stroke-dasharray": "2 3" });
    layout.rooms.forEach(function (r) {
      el("line", { x1: X(r.z), y1: 9, x2: X(r.z), y2: 47, stroke: "#c8f05a", "stroke-width": 1 });
      var t = el("text", { x: X(r.z) + 3, y: 6.5, fill: "rgba(236,235,230,0.55)", "font-size": 6, "font-family": "JetBrains Mono, monospace" });
      t.textContent = "S" + two(r.n);
    });
    layout.exhibits.forEach(function (e) {
      el("rect", { x: X(e.z) - 3, y: Y(e.x) - 1.5, width: 6, height: 3, fill: "rgba(236,235,230,0.85)", "data-ex": e.id });
    });
    el("circle", { cx: X(layout.atrium.z), cy: 28, r: 5, fill: "none", stroke: "#c8f05a", "stroke-width": 1 });
    hudMarker = el("path", { d: "M5 0 L-4 -3.6 L-2 0 L-4 3.6 Z", fill: "#c8f05a" });
    buildMap.X = X; buildMap.Y = Y;
  }

  function initScene() {
    var H = window.__HALL__;
    var canvas = $("#hall");
    if (!H || !H.init || !H.init(canvas)) { root.classList.add("no-webgl"); return; }

    var hud = $(".hud");
    var roomLabel = $("[data-hud-room]");
    buildMap(H.layout);
    var exhibits = $$(".exhibit");
    var firstStop = true;

    H.onStop = function (idx, key) {
      if (firstStop) { firstStop = false; root.classList.add("webgl-on"); }
      exhibits.forEach(function (s) { s.classList.toggle("is-current", s.getAttribute("data-cam") === key); });
      if (roomLabel) roomLabel.textContent = placeName(key);
      hudOn = key === "intro" || key.indexOf("room-") === 0 || key.indexOf("ex-") === 0;
      if (hud) hud.classList.toggle("is-on", hudOn);
      if (tour.on) updateTourLabel(key);
    };

    var lx = 0, lz = 0, ly = 0;
    H.onCamera = function (x, z, yaw) {
      if (!hudMarker || !hudOn) return;
      if (Math.abs(x - lx) + Math.abs(z - lz) + Math.abs(yaw - ly) < 0.01) return;
      lx = x; lz = z; ly = yaw;
      hudMarker.setAttribute("transform", "translate(" + buildMap.X(z).toFixed(2) + " " + buildMap.Y(x).toFixed(2) + ") rotate(" + (yaw * 180 / Math.PI).toFixed(1) + ")");
    };

    // Si en 4,5 s no hay ni un fotograma, se queda la versión sin 3D
    setTimeout(function () {
      // En una pestaña en segundo plano el navegador no pinta: no es un fallo de WebGL
      if (!root.classList.contains("scene-ready") && !document.hidden) { root.classList.add("no-webgl"); root.classList.remove("webgl-on"); }
    }, 4500);
  }

  function initProgress() {
    var bar = $("[data-progress]");
    if (!bar) return;
    var tick = false;
    function upd() {
      tick = false;
      var maxS = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      bar.style.transform = "scaleX(" + clamp((window.scrollY || 0) / maxS, 0, 1).toFixed(4) + ")";
    }
    window.addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  function initActiveLinks() {
    var links = $$(".nav-links a");
    var map = { exposicion: links[0], servicios: links[1], metodo: links[2], planes: links[3], contacto: links[4] };
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        var key = (id.indexOf("sala-") === 0 || id.indexOf("pieza-") === 0) ? "exposicion" : id;
        links.forEach(function (l) { l.classList.remove("is-active"); });
        if (map[key]) map[key].classList.add("is-active");
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
    $$("main > section").forEach(function (s) { io.observe(s); });
  }

  // ---------------------------------------------------------------------------
  // Visita guiada
  // ---------------------------------------------------------------------------
  var tour = { on: false, i: 0, timer: 0, list: [] };
  var pill, pillLabel, tourBtns;

  function updateTourLabel(key) {
    if (!pillLabel) return;
    pillLabel.textContent = "Visita guiada · " + placeName(key);
  }
  function stopTour() {
    if (!tour.on) return;
    tour.on = false;
    clearTimeout(tour.timer);
    stopScrollAnim();
    if (pill) pill.hidden = true;
    tourBtns.forEach(function (b) { b.textContent = "Iniciar visita guiada"; });
  }
  function nextStop() {
    if (!tour.on) return;
    if (tour.i >= tour.list.length) { stopTour(); return; }
    var el = tour.list[tour.i++];
    var key = el.getAttribute("data-cam") || "";
    animateScroll(targetFor(el), function () {
      if (!tour.on) return;
      var wait = key.indexOf("ex-") === 0 ? 6500 : key.indexOf("room-") === 0 ? 3800 : 5200;
      tour.timer = setTimeout(nextStop, wait);
    });
  }
  function startTour() {
    tour.list = $$("main [data-cam]").filter(function (s) { return s.getAttribute("data-cam") !== "hero"; });
    var y = window.scrollY || 0;
    tour.i = 0;
    for (var k = 0; k < tour.list.length; k++) { if (targetFor(tour.list[k]) > y + 40) { tour.i = k; break; } }
    tour.on = true;
    if (pill) pill.hidden = false;
    tourBtns.forEach(function (b) { b.textContent = "Visita en curso…"; });
    nextStop();
  }
  function initTour() {
    pill = $("[data-tour-pill]");
    pillLabel = $("[data-tour-label]");
    tourBtns = $$("[data-tour]");
    tourBtns.forEach(function (b) { b.addEventListener("click", function () { tour.on ? stopTour() : startTour(); }); });
    var stopBtn = $("[data-tour-stop]");
    if (stopBtn) stopBtn.addEventListener("click", stopTour);
    var interrupt = function (e) {
      if (!tour.on) return;
      if (e.target && e.target.closest && (e.target.closest("[data-tour-pill]") || e.target.closest("[data-tour]"))) return;
      stopTour();
    };
    window.addEventListener("wheel", interrupt, { passive: true });
    window.addEventListener("touchstart", interrupt, { passive: true });
    window.addEventListener("keydown", interrupt);
    window.addEventListener("pointerdown", interrupt);
  }

  // ---------------------------------------------------------------------------
  // Formulario → WhatsApp
  // ---------------------------------------------------------------------------
  function initForm() {
    var form = $("[data-wa-form]");
    if (!form) return;
    var note = $("[data-form-note]", form);
    var baseNote = note ? note.textContent : "";
    $$("[data-plan]").forEach(function (a) {
      a.addEventListener("click", function () {
        var msg = form.querySelector("[name=mensaje]");
        if (msg && !msg.value) msg.value = "Me interesa el " + a.getAttribute("data-plan").toLowerCase() + ".";
      });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      ["nombre", "negocio"].forEach(function (n) {
        var input = form.querySelector("[name=" + n + "]");
        var field = input.closest(".field");
        var bad = !input.value.trim();
        field.classList.toggle("is-invalid", bad);
        if (bad) ok = false;
      });
      if (!ok) {
        if (note) { note.textContent = "Indica tu nombre y tu negocio para poder responderte."; note.classList.add("is-error"); }
        return;
      }
      if (note) { note.textContent = baseNote; note.classList.remove("is-error"); }
      var v = function (n) { var el = form.querySelector("[name=" + n + "]"); return el ? el.value.trim() : ""; };
      var web = (form.querySelector("[name=web]:checked") || {}).value || "";
      var text = "Hola, soy " + v("nombre") + " (" + v("negocio") + "). " +
        (web === "Sí" ? "Ya tengo web y quiero mejorarla." : "Todavía no tengo web.") +
        (v("mensaje") ? " " + v("mensaje") : "") + " Vengo de la galería de YOA PRO.";
      window.open("https://wa.me/" + (B.phone || "34603379870") + "?text=" + encodeURIComponent(text), "_blank", "noopener");
    });
  }

  function initLiveLinks() {
    $$("[data-live]").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href && href !== "#") a.hidden = false;
    });
  }

  function initYear() {
    var y = $("[data-year]");
    if (y) y.textContent = new Date().getFullYear();
  }

  // ---------------------------------------------------------------------------
  // Texto dinámico: palabras que entran, palabra rotatoria y contadores
  // ---------------------------------------------------------------------------
  function splitWords(el) {
    if (el.getAttribute("data-words-done")) return;
    el.setAttribute("data-words-done", "1");
    var i = 0;
    function wrap(text) {
      var frag = document.createDocumentFragment();
      text.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
        var w = document.createElement("span"); w.className = "w";
        var inner = document.createElement("span"); inner.textContent = part; inner.style.setProperty("--i", i++);
        w.appendChild(inner); frag.appendChild(w);
      });
      return frag;
    }
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
        if (ch.nodeType === 3) node.replaceChild(wrap(ch.textContent), ch);
        else if (ch.nodeType === 1 && ch.tagName !== "BR") walk(ch);
      });
    })(el);
  }

  function initWords() {
    var els = $$("[data-words]");
    els.forEach(splitWords);
    if (!("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { threshold: 0.01 });
    els.forEach(function (el) { io.observe(el); });
    setTimeout(function () {
      els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-in"); });
    }, 6000);
  }

  function initRotator() {
    var rot = $("[data-rotate]");
    if (!rot) return;
    var words = $$("span", rot), k = 0;
    if (words.length < 2) return;
    setInterval(function () {
      if (document.hidden) return;
      var cur = words[k];
      cur.classList.remove("is-on"); cur.classList.add("is-out");
      k = (k + 1) % words.length;
      var nx = words[k];
      nx.classList.remove("is-out"); void nx.offsetWidth; nx.classList.add("is-on");
      setTimeout(function () { cur.classList.remove("is-out"); }, 700);
    }, 2600);
  }

  function initCount() {
    var els = $$("[data-count]");
    if (!els.length || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target, to = +el.getAttribute("data-count"), t0 = performance.now(), dur = reduced ? 300 : 1100;
        (function step(now) {
          var t = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(to * e);
          if (t < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { io.observe(el); });
  }

  function boot() {
    safe(initSplash, "splash");
    safe(initNav, "nav");
    safe(initAnchors, "anchors");
    safe(initWords, "words");
    safe(initReveal, "reveal");
    safe(initRotator, "rotator");
    safe(initCount, "count");
    safe(initScene, "scene");
    safe(initProgress, "progress");
    safe(initActiveLinks, "active-links");
    safe(initTour, "tour");
    safe(initForm, "form");
    safe(initLiveLinks, "live-links");
    safe(initYear, "year");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

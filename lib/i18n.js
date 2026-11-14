/* ==========================================================================
   YOA PRO — idiomas (español / inglés)
   El HTML está escrito en español. Si el visitante elige inglés, este archivo
   cambia cada texto por su traducción antes de que arranquen las animaciones.

   Para traducir un texto nuevo: copia el texto en español tal cual está en
   index.html (con sus etiquetas, p. ej. <span class="hl">) y pon al lado su
   versión en inglés. Si un texto no está aquí, se queda en español.
   ========================================================================== */
(function () {
  "use strict";

  var EN = {
    // ---- Cabecera y navegación
    "Estudio digital": "Digital studio",
    "Exposición": "Exhibition",
    "Servicios": "Services",
    "Método": "Method",
    "Planes": "Plans",
    "Contacto": "Contact",
    "Solicitar propuesta": "Request a proposal",
    "Menú": "Menu",
    "YOA PRO, inicio": "YOA PRO, home",
    "Principal": "Main",
    "Abriendo la galería": "Opening the gallery",
    "Estás en": "You are in",
    "Recepción": "Reception",
    "Visita guiada": "Guided tour",
    "Detener": "Stop",

    // ---- Recepción
    "YOA PRO · Galería de proyectos": "YOA PRO · Project gallery",
    'Webs que <span class="rotator" data-rotate><span class="is-on">trabajan</span><span>venden</span><span>dan citas</span><span>convencen</span></span><br />por tu negocio.':
      'Websites that <span class="rotator" data-rotate><span class="is-on">work</span><span>sell</span><span>book clients</span><span>convince</span></span><br />for your business.',
    "Diseño, publicación y mantenimiento para negocios de la Costa del Sol. Pasa y recorre la galería.":
      "Design, launch and maintenance for businesses on the Costa del Sol. Come in and walk through the gallery.",
    "Iniciar visita guiada": "Start guided tour",
    "Visita en curso…": "Tour in progress…",
    "05 piezas · 03 salas": "05 pieces · 03 rooms",
    "<i></i>Desplázate para entrar": "<i></i>Scroll to enter",

    // ---- El estudio
    "01 — El estudio": "01 — The studio",
    'Diseño claro. Webs rápidas. <span class="hl">Trato directo.</span>': 'Clear design. Fast websites. <span class="hl">Direct contact.</span>',
    "Estudio independiente en Benalmádena. Te enseñamos tu web antes de que pagues nada.":
      "Independent studio in Benalmádena. We show you your website before you pay anything.",
    "Propuesta previa": "Preview first",
    "Ves tu web antes de decidir": "See your website before you decide",
    'Desde <span data-count="200">200</span> €': 'From <span data-count="200">200</span> €',
    "Pago único, IVA aparte": "One-off payment, VAT not included",
    "Todo en uno": "All in one",
    "Diseño, hosting y mantenimiento": "Design, hosting and maintenance",

    // ---- Salas
    "Sala 01 · 2 piezas": "Room 01 · 2 pieces",
    "Estética y arte": "Beauty and art",
    "Imagen cuidada y el contacto siempre a mano.": "A polished image and contact always at hand.",
    "Sala 02 · 2 piezas": "Room 02 · 2 pieces",
    "Inmobiliaria y reformas": "Real estate and renovations",
    "Casas y obras, con los números a la vista.": "Homes and building work, with the numbers in plain sight.",
    "Sala 03 · 1 pieza": "Room 03 · 1 piece",
    "Tatuaje y piercing": "Tattoo and piercing",
    "De Instagram a la cita, sin intermediarios.": "From Instagram to the appointment, no middlemen.",

    // ---- Piezas
    "Proyecto": "Project",
    "Plantilla": "Template",
    "Propuesta": "Proposal",
    "Ver la web": "Visit the website",
    "Ver la demo": "View the demo",
    "Siguiente": "Next",
    "Siguiente sala": "Next room",
    "Salir al atrio": "Go to the atrium",

    "Estética corporal · Málaga": "Body aesthetics · Málaga",
    "Su web era solo imágenes y Google no podía leer nada. Ahora son 32 páginas con texto real, en español e inglés.":
      "Their website was just images and Google couldn't read a thing. Now it has 32 pages of real text, in Spanish and English.",
    "SEO local en Málaga": "Local SEO in Málaga",
    "Una página por tratamiento": "One page per treatment",
    "Reserva online": "Online booking",
    "Web de Sculptology": "Sculptology website",

    "Cine y artes visuales · Málaga": "Film and visual arts · Málaga",
    "Portfolio de una actriz, filmmaker y artista entre dos idiomas.": "Portfolio of an actress, filmmaker and artist across two languages.",
    "Español e inglés": "Spanish and English",
    "Reel y filmografía": "Reel and filmography",
    "Arte y prensa": "Art and press",
    "Web de Diana Noris": "Diana Noris website",

    "Inmobiliaria · Costa del Sol": "Real estate · Costa del Sol",
    "Buscador, fichas y valorador de viviendas, en español e inglés.": "Property search, listings and home valuation tool, in Spanish and English.",
    "Valorador online": "Online valuation",
    "Calculadora de hipoteca": "Mortgage calculator",
    "Dos idiomas": "Two languages",
    "Plantilla web para inmobiliarias Almara Propiedades": "Almara Propiedades real estate website template",

    "Obras y reformas · Benalmádena": "Building and renovations · Benalmádena",
    "Más de 30 años de oficio, contados con la misma seriedad.": "Over 30 years in the trade, told with the same seriousness.",
    "Presupuesto detallado": "Detailed quote",
    "Planificación": "Planning",
    "Planos técnicos": "Technical drawings",
    "Web de KERKHU Obras y Reformas": "KERKHU Obras y Reformas website",

    "Tatuaje y piercing · Costa del Sol": "Tattoo and piercing · Costa del Sol",
    "Flash que se reserva, precio antes de preguntar y cita en un mensaje.": "Bookable flash, prices before you ask and an appointment in one message.",
    "Flash reservable": "Bookable flash",
    "Presupuesto online": "Online quote",
    "Cita en 4 pasos": "Booking in 4 steps",
    "Plantilla web para estudios de tatuaje Marea Negra": "Marea Negra tattoo studio website template",

    // ---- Servicios
    "02 — Servicios": "02 — Services",
    "Lo que hacemos.": "What we do.",
    "Diseño web": "Web design",
    "A medida y pensado primero para el móvil.": "Custom-made and mobile-first.",
    "Rediseño": "Redesign",
    "Tu web antigua, convertida en una que funciona.": "Your old website, turned into one that works.",
    "Hosting y mantenimiento": "Hosting and maintenance",
    "Servidor, seguridad y cambios: de eso nos ocupamos.": "Server, security and updates: we take care of it.",
    "Asistente con IA": "AI assistant",
    "Agenda tus citas y revisa tu correo.": "Books your appointments and checks your email.",

    // ---- Método
    "03 — Método": "03 — Method",
    'Cuatro pasos. <span class="hl">Ninguno a ciegas.</span>': 'Four steps. <span class="hl">None of them blind.</span>',
    "Hablamos": "We talk",
    "Cómo trabajas y qué necesitas.": "How you work and what you need.",
    "Te la enseñamos": "We show it to you",
    "Ves tu web antes de pagar.": "You see your website before paying.",
    "La publicamos": "We launch it",
    "Dominio, textos y fotos, listos.": "Domain, copy and photos, all set.",
    "La cuidamos": "We look after it",
    "Cambios y soporte cuando los pidas.": "Changes and support whenever you ask.",

    // ---- Planes
    "04 — Planes": "04 — Plans",
    "Dos formas de empezar.": "Two ways to start.",
    "Pago único": "One-off payment",
    "+ IVA": "+ VAT",
    "Tu web lista y publicada. Pagas una vez.": "Your website ready and live. You pay once.",
    "Diseño a medida": "Custom design",
    "Versión móvil": "Mobile version",
    "Puesta en marcha": "Launch",
    "Elegir pago único": "Choose one-off payment",
    "Todo incluido": "All included",
    "Plan anual": "Annual plan",
    "/ mes · facturado anualmente": "/ month · billed annually",
    "Web, hosting y mantenimiento en una sola cuota.": "Website, hosting and maintenance in one fee.",
    "Diseño y desarrollo": "Design and development",
    "Hosting y certificado SSL": "Hosting and SSL certificate",
    "Mantenimiento y cambios": "Maintenance and changes",
    "Elegir plan anual": "Choose annual plan",
    "¿Reservas, tienda o asistente con IA? Te damos precio cerrado.": "Bookings, online shop or AI assistant? We'll give you a fixed price.",

    // ---- Contacto
    "05 — Contacto": "05 — Contact",
    'Fin del recorrido. <span class="hl">Empieza el tuyo.</span>': 'End of the tour. <span class="hl">Start yours.</span>',
    "Cuéntanos qué haces y te preparamos tu propuesta.": "Tell us what you do and we'll prepare your proposal.",
    "WhatsApp y teléfono": "WhatsApp and phone",
    "Correo": "Email",
    "Zona": "Area",
    "Nombre": "Name",
    "Negocio": "Business",
    "Nombre y sector": "Name and industry",
    "¿Tienes web ahora?": "Do you have a website now?",
    "Sí": "Yes",
    'Mensaje <em>(opcional)</em>': 'Message <em>(optional)</em>',
    "Enviar por WhatsApp": "Send via WhatsApp",
    "Se abrirá WhatsApp con tu mensaje listo para enviar.": "WhatsApp will open with your message ready to send.",
    "Diseño y desarrollo web · Benalmádena, Málaga": "Web design and development · Benalmádena, Málaga",

    // ---- Textos que genera main.js / hall.js
    "Vestíbulo": "Lobby",
    "Sala": "Room",
    "Pieza": "Piece",
    "Acceso": "Entrance",
    "Galería": "Gallery",
    "Atrio · Servicios": "Atrium · Services",
    "Atrio · Método": "Atrium · Method",
    "Atrio · Planes": "Atrium · Plans",
    "Salida · Contacto": "Exit · Contact",
    "SALA": "ROOM",
    "Indica tu nombre y tu negocio para poder responderte.": "Please enter your name and business so we can reply.",
    "Estética corporal": "Body aesthetics",
    "Cine y artes visuales": "Film and visual arts",
    "Inmobiliaria": "Real estate",
    "Obras y reformas": "Building and renovations",

    // ---- Metadatos
    "YOA PRO · Estudio de diseño web en la Costa del Sol": "YOA PRO · Web design studio on the Costa del Sol",
    "YOA PRO diseña, publica y mantiene webs para negocios de la Costa del Sol. Recorre nuestra galería de proyectos en 3D.":
      "YOA PRO designs, launches and maintains websites for businesses on the Costa del Sol. Walk through our 3D project gallery."
  };

  // ---- Idioma elegido: ?lang=en en la URL > elección guardada > idioma del navegador
  var lang = "es";
  try {
    var q = (location.search.match(/[?&]lang=(es|en)\b/) || [])[1];
    var saved = localStorage.getItem("yoapro-lang");
    lang = q || saved || ((navigator.language || "").toLowerCase().indexOf("en") === 0 ? "en" : "es");
    if (q) localStorage.setItem("yoapro-lang", q);
  } catch (e) {}

  var norm = function (s) { return String(s).replace(/<br\s*\/?>/g, "<br>").replace(/=""/g, "").replace(/\s+/g, " ").trim(); };
  var DICT = {};
  Object.keys(EN).forEach(function (k) { DICT[norm(k)] = EN[k]; });

  // Traductor para los textos que crea el JavaScript (main.js, hall.js)
  window.__LANG__ = lang;
  window.__t = function (s) { return lang === "en" && DICT[norm(s)] ? DICT[norm(s)] : s; };

  // Nombres de salas y piezas que se pintan dentro de la escena 3D
  var B = window.__BRAND__;
  if (lang === "en" && B) {
    (B.rooms || []).forEach(function (r) { r.name = window.__t(r.name); });
    (B.exhibits || []).forEach(function (x) { x.sub = window.__t(x.sub); });
  }

  function translatePage() {
    var html = document.documentElement;
    html.lang = lang;
    if (lang === "en") {
      document.title = window.__t(document.title);
      var md = document.querySelector('meta[name="description"]');
      if (md) md.content = window.__t(md.content);

      var nodes = document.body.querySelectorAll("h1,h2,h3,p,li,a,button,legend,span,em,small,label > span");
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        if (el.closest("[data-lang-switch]")) continue;
        var t = DICT[norm(el.innerHTML)];
        if (t !== undefined) el.innerHTML = t;
      }
      var attrs = ["alt", "placeholder", "aria-label"];
      attrs.forEach(function (a) {
        var list = document.body.querySelectorAll("[" + a + "]");
        for (var j = 0; j < list.length; j++) {
          var v = DICT[norm(list[j].getAttribute(a))];
          if (v !== undefined) list[j].setAttribute(a, v);
        }
      });
    }

    // Banderas: marca la activa y cambia de idioma al pulsar
    var btns = document.querySelectorAll("[data-lang-switch] [data-lang]");
    for (var k = 0; k < btns.length; k++) {
      var b = btns[k];
      var on = b.getAttribute("data-lang") === lang;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.addEventListener("click", function () {
        var l = this.getAttribute("data-lang");
        if (l === lang) return;
        try { localStorage.setItem("yoapro-lang", l); } catch (e) {}
        var url = location.pathname + (l === "en" ? "?lang=en" : "?lang=es") + location.hash;
        location.replace(url);
      });
    }
  }

  translatePage();
})();

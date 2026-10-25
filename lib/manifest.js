/* ==========================================================================
   YOA PRO — datos de la galería
   Edita aquí las piezas de la exposición (lo que se ve en 3D).
   Los textos de cada ficha están en index.html (sección .exhibit con el mismo id).

   Capturas de cada web (página completa; la sala 3D las recorre solas):
     assets/img/<id>.webp     escritorio, 1440 px de ancho
     assets/img/<id>-m.webp   móvil, 390 px de ancho (a 2x = 780 px)
   domain: texto de la barra del navegador (si no hay, se muestra el nombre).
   ========================================================================== */
(function () {
  "use strict";

  window.__BRAND__ = {
    name: "YOA PRO",
    phone: "34603379870",
    email: "yoainstalaciones@hotmail.com",

    rooms: [
      { n: 1, name: "Estética y arte" },
      { n: 2, name: "Construcción y reformas" },
      { n: 3, name: "Tatuaje y piercing" }
    ],

    // side: "L" = pared izquierda (ficha a la derecha) · "R" = pared derecha (ficha a la izquierda)
    // tint: color base del marcador mientras no haya captura
    exhibits: [
      { id: "sculptology", room: 1, title: "Sculptology",            sub: "Estética corporal",      side: "L", tint: "#c9b28f", img: "assets/img/sculptology.webp", imgMobile: "assets/img/sculptology-m.webp", domain: "sculptology.eu" },
      { id: "diana-noris", room: 1, title: "Diana Noris",            sub: "Cine y artes visuales",  side: "R", tint: "#b9a3c9", img: "assets/img/diana-noris.webp", imgMobile: "assets/img/diana-noris-m.webp", domain: "diananoris.com" },
      { id: "vip-team",    room: 2, title: "Vip Team Home & Design", sub: "Reformas",               side: "R", tint: "#9fb3c4", img: "assets/img/vip-team.webp", imgMobile: "assets/img/vip-team-m.webp" },
      { id: "kerkhu",      room: 2, title: "KERKHU",                 sub: "Obras y reformas",       side: "L", tint: "#c7c0a8", img: "assets/img/kerkhu.webp", imgMobile: "assets/img/kerkhu-m.webp", domain: "kerkhu.com" },
      { id: "walk-ink",    room: 3, title: "Walk Ink Tattoostudio",  sub: "Estudio de tatuaje",     side: "R", tint: "#d48f7a", img: "assets/img/walk-ink.webp", imgMobile: "assets/img/walk-ink-m.webp" },
      { id: "inkspiration",room: 3, title: "INKspiration",           sub: "Tattoo & Piercing",      side: "L", tint: "#8fc0b4", img: "assets/img/inkspiration.webp", imgMobile: "assets/img/inkspiration-m.webp" }
    ]
  };
})();

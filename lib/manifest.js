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
      { n: 2, name: "Inmobiliaria y reformas" },
      { n: 3, name: "Tatuaje y piercing" }
    ],

    // side: "L" = pared izquierda (ficha a la derecha) · "R" = pared derecha (ficha a la izquierda)
    // tint: color base del marcador mientras no haya captura
    exhibits: [
      { id: "sculptology", room: 1, title: "Sculptology",            sub: "Estética corporal",      side: "L", tint: "#c9b28f", img: "assets/img/sculptology.webp", imgMobile: "assets/img/sculptology-m.webp", domain: "sculptology.eu" },
      { id: "diana-noris", room: 1, title: "Diana Noris",            sub: "Cine y artes visuales",  side: "R", tint: "#b9a3c9", img: "assets/img/diana-noris.webp", imgMobile: "assets/img/diana-noris-m.webp", domain: "diananoris.com" },
      { id: "almara",      room: 2, title: "Almara Propiedades",     sub: "Inmobiliaria",           side: "R", tint: "#9fb3c4", img: "assets/img/almara.webp", imgMobile: "assets/img/almara-m.webp" },
      { id: "kerkhu",      room: 2, title: "KERKHU",                 sub: "Obras y reformas",       side: "L", tint: "#c7c0a8", img: "assets/img/kerkhu.webp", imgMobile: "assets/img/kerkhu-m.webp", domain: "kerkhu.com" },
      { id: "marea-negra", room: 3, title: "Marea Negra",           sub: "Tatuaje y piercing",     side: "R", tint: "#d48f7a", img: "assets/img/marea-negra.webp", imgMobile: "assets/img/marea-negra-m.webp" }
    ]
  };
})();

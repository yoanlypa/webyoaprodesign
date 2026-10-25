# YOA PRO · Galería de webs

Portfolio con recorrido 3D: el visitante entra en una galería y, al hacer scroll, la cámara avanza por tres salas con una pantalla flotante por proyecto. Web estática (HTML + CSS + JS), sin npm ni compilación.

## Estructura

```
index.html        textos de todas las secciones y fichas de cada pieza
styles.css        diseño
hall.js           escena 3D (pasillo, salas, pantallas, cámara)
main.js           menú, HUD, visita guiada, formulario a WhatsApp
lib/manifest.js   lista de piezas que se ven en 3D (id, sala, lado, color, imagen)
lib/three.min.js  Three.js r149
assets/img/       capturas de las webs  →  <id>.webp
tools/capturar.py script para sacar las capturas (no se publica)
Dockerfile, nginx.conf   despliegue en Coolify
.htaccess                despliegue en Hostinger compartido (Apache)
```

## Poner las capturas reales

Cada pieza tiene una pantalla de escritorio y un móvil flotante:

- `assets/img/<id>.webp` → escritorio, captura de página completa a 1440 px de ancho
- `assets/img/<id>-m.webp` → móvil, captura de página completa a 390 px (780 px reales)

Ids: `sculptology`, `diana-noris`, `andujar`, `vip-team`, `kerkhu`, `walk-ink`, `inkspiration`. Si falta una imagen, se ve un marcador con el nombre del proyecto. Las capturas largas se recorren solas de arriba abajo cuando la cámara llega a la pieza.

Ya están las de **Sculptology**, **Diana Noris**, **Vip Team** y **KERKHU** (sacadas de sus repos de GitHub). Para el resto:
`python tools/capturar.py kerkhu=https://... andujar=https://...`

## Demos de propuestas

Las demos de Andújar, Vip Team, KERKHU, Walk Ink e INKspiration están copiadas en `demos/<id>/` y se ven en `yoapro.site/demos/<id>/`. El servidor les pone `noindex` para que Google no las confunda con las webs reales de esos negocios. Son copias: si cambias una demo en su repo, vuelve a copiarla aquí.

## Enlace "Ver la web"

En `index.html`, en la ficha de cada pieza, rellena el `href` del enlace con `data-live`. Si está vacío, el enlace no aparece.

## Añadir o quitar una pieza

1. `lib/manifest.js`: añade o quita la entrada en `exhibits`.
2. `index.html`: añade o quita la `<section class="exhibit" data-cam="ex-<id>">` correspondiente, en el mismo orden.
3. `hall.js`: la lista `EX_Z` fija la posición de cada pantalla en el pasillo (7 huecos).

## Probar en local

La escena 3D necesita servidor (abriendo el archivo con doble clic se ven los marcadores, no las capturas):

```
python -m http.server 8765
```
y abre http://localhost:8765

## Desplegar en yoapro.site (VPS con Coolify)

1. **GitHub:** crea un repo (p. ej. `yoapro-site`) y sube el contenido de esta carpeta (que `index.html` y `Dockerfile` queden en la raíz).
2. **Coolify:** New Resource → tu repo → build pack **Dockerfile**, puerto expuesto **80**. En *Domains* añade `https://yoapro.site` y `https://www.yoapro.site`, activa *Redirect HTTP to HTTPS* y la redirección de www. Deploy.
3. **Hostinger (hPanel):** Dominios → yoapro.site → Gestionar → **DNS / Nameservers**. Borra los registros A, AAAA y CNAME de `@` y `www`, y crea dos registros **A** (`@` y `www`) con la IP de tu VPS.
4. Espera a que propague (minutos, hasta 24 h). Coolify pide el certificado SSL solo cuando el dominio ya apunta al VPS; si no sale el candado, vuelve a pulsar *Deploy*.

### Alternativa: hosting compartido de Hostinger

Sube el contenido de la carpeta a `public_html` desde el Administrador de archivos (el `.htaccess` ya va incluido; si no aparece al subirlo, es porque tu ordenador oculta los archivos que empiezan por punto: súbelo aparte).

Tras cada cambio sube el número `?v=20261025c` de los `<link>` y `<script>` de `index.html` para que nadie vea la versión antigua.

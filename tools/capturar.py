"""
Capturas de webs para la galería de YOA PRO (herramienta de desarrollo, no se publica).

Uso:
    pip install playwright pillow
    python -m playwright install chromium
    python tools/capturar.py sculptology=https://... kerkhu=https://... andujar=https://...

Guarda assets/img/<id>.webp (escritorio, 1440 px) y assets/img/<id>-m.webp (móvil, 390 px a 2x),
página completa recortada a 4000 px de alto. La pantalla 3D la recorre sola de arriba abajo.
Los <id> son los de lib/manifest.js.
"""
import sys, io, asyncio
from pathlib import Path
from PIL import Image
from playwright.async_api import async_playwright

OUT = Path(__file__).resolve().parent.parent / "assets" / "img"
MAX_H = 4000

async def capture(page, ident, url, suffix=""):
    await page.goto(url, wait_until="networkidle", timeout=60000)
    await page.wait_for_timeout(1500)
    # recorre la página para que carguen imágenes diferidas y animaciones de entrada
    h = await page.evaluate("document.documentElement.scrollHeight")
    for y in range(0, min(h, MAX_H), 600):
        await page.evaluate(f"window.scrollTo(0,{y})")
        await page.wait_for_timeout(250)
    await page.evaluate("window.scrollTo(0,0)")
    await page.wait_for_timeout(800)
    png = await page.screenshot(full_page=True)
    im = Image.open(io.BytesIO(png)).convert("RGB")
    if im.height > MAX_H:
        im = im.crop((0, 0, im.width, MAX_H))
    OUT.mkdir(parents=True, exist_ok=True)
    dest = OUT / f"{ident}{suffix}.webp"
    im.save(dest, "WEBP", quality=82, method=6)
    print(f"  ok  {ident:14s} {im.width}x{im.height}  -> {dest}")

async def main(pairs):
    async with async_playwright() as p:
        b = await p.chromium.launch()
        desk = await b.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
        mob = await (await b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)).new_page()
        for ident, url in pairs:
            for page, suffix in ((desk, ""), (mob, "-m")):
                try:
                    await capture(page, ident, url, suffix)
                except Exception as e:
                    print(f"  ERROR {ident}{suffix}: {e}")
        await b.close()

if __name__ == "__main__":
    pairs = [a.split("=", 1) for a in sys.argv[1:] if "=" in a]
    if not pairs:
        print(__doc__); sys.exit(1)
    asyncio.run(main(pairs))

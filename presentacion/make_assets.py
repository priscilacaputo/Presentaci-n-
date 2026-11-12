"""Genera fondos, QR y códigos de barras para la presentación. Uso: python3 make_assets.py"""
import math, random, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import segno

A = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")
W, H, SS = 1920, 1080, 2

def hexc(h): return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def gradient(c0, c1, glow, glow_pos, glow_r):
    y, x = np.mgrid[0:H, 0:W]
    t = np.clip((x / W * 0.55 + y / H * 0.45), 0, 1)[..., None]
    base = np.array(hexc(c0)) * (1 - t) + np.array(hexc(c1)) * t
    d = np.sqrt((x - glow_pos[0]) ** 2 + (y - glow_pos[1]) ** 2)
    g = np.clip(1 - d / glow_r, 0, 1)[..., None] ** 2
    base = base * (1 - g * 0.55) + np.array(hexc(glow)) * g * 0.55
    return Image.fromarray(base.astype("uint8"))

def dotted_arc(img, p0, p1, p2, n=46, color="FFFFFF"):
    big = Image.new("RGBA", (W * SS, H * SS), (0, 0, 0, 0))
    dr = ImageDraw.Draw(big)
    for i in range(n + 1):
        t = i / n
        x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t ** 2 * p2[0]
        y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t ** 2 * p2[1]
        r = (4 + 6 * t) * SS
        a = int(40 + 170 * t)
        dr.ellipse([x * SS - r, y * SS - r, x * SS + r, y * SS + r], fill=hexc(color) + (a,))
    big = big.resize((W, H), Image.LANCZOS)
    img = img.convert("RGBA"); img.alpha_composite(big); return img.convert("RGB")

# Fondos con el degradé oficial de Aeropuertos Argentina (assets/bg_marca.png)
MARCA = Image.open(os.path.join(A, "bg_marca.png")).convert("RGB").resize((W, H), Image.LANCZOS)

def overlay(alpha_fn, base=MARCA, color="0B2128"):
    x = np.linspace(0, 1, W)[None, :].repeat(H, 0)
    y = np.linspace(0, 1, H)[:, None].repeat(W, 1)
    a = np.clip(alpha_fn(x, y), 0, 1)[..., None]
    out = np.array(base, dtype=float) * (1 - a) + np.array(hexc(color), dtype=float) * a
    return Image.fromarray(out.astype("uint8"))

# Portada y cierre: oscuro a la izquierda (texto) y degradé de marca a la derecha (ticket)
cover = overlay(lambda x, y: 0.86 - 0.62 * x)
cover = dotted_arc(cover, (760, 1110), (1350, 1020), (1960, 70), color="FFFFFF")
cover.save(f"{A}/bg_cover.png")
close = overlay(lambda x, y: 0.86 - 0.62 * x)
close = dotted_arc(close, (1960, 640), (1560, 90), (1120, -40), color="FFFFFF")
close.save(f"{A}/bg_close.png")
# Cambio de destino: degradé de marca con velo parejo para que el tablero destaque
overlay(lambda x, y: 0.50 + 0 * x).save(f"{A}/bg_dep.png")

# Fondo de contenido: azul petróleo con luces de marca (azul, turquesa y verde)
def glow(img, cx, cy, r, color, k):
    y, x = np.mgrid[0:H, 0:W]
    g = np.clip(1 - np.sqrt((x - cx) ** 2 + (y - cy) ** 2) / r, 0, 1)[..., None] ** 1.6 * k
    return img * (1 - g) + np.array(hexc(color), dtype=float) * g
base = np.ones((H, W, 3)) * np.array(hexc("0B2128"), dtype=float)
base = glow(base, 0, 0, 1500, "2A74B5", 0.42)
base = glow(base, W, H, 1400, "14B3A6", 0.34)
base = glow(base, W, 0, 1100, "A7CE75", 0.16)
Image.fromarray(base.astype("uint8")).save(f"{A}/bg_contenido.png")

# Códigos de barras
def barcode(path, color, seed=7):
    rnd = random.Random(seed)
    im = Image.new("RGBA", (900, 120), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    x = 0
    while x < 900:
        w = rnd.choice([3, 3, 6, 9, 12]); gap = rnd.choice([4, 6, 9])
        d.rectangle([x, 0, x + w, 120], fill=hexc(color) + (255,)); x += w + gap
    im.save(path)
barcode(f"{A}/barcode_claro.png", "F2F7F8")
barcode(f"{A}/barcode_oscuro.png", "0B2128", seed=11)

# QR a las páginas reales
for name, url in [("grilla", "https://grilla-inteligente-termo.vercel.app/"),
                  ("termo", "https://web-termo.vercel.app/"),
                  ("bhs", "https://patio-de-valijas-aep.vercel.app/"),
                  ("hvac", "https://hvacsetpoint.vercel.app/"),
                  ("recorrida", "https://recorrida-f778.vercel.app/"),
                  ("techo", "https://filtraciones-infra.vercel.app/"),
                  ("pista", "https://infra-lado-pista.vercel.app/")]:
    segno.make(url, error="m").save(f"{A}/qr_{name}.png", scale=12, border=2, dark="0B2128", light="FFFFFF")
import json
cfg = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "config.json")))
segno.make(cfg["presentationUrl"], error="m").save(f"{A}/qr_presentacion.png", scale=12, border=1, dark="0B2128", light="F3F7F8")
print("ok")

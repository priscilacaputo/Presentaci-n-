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

def dotted_arc(img, p0, p1, p2, n=46, color="8ECB93"):
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

# Portada: degradé marca + arco de vuelo punteado
cover = gradient("07161D", "0F5E6B", "8ECB93", (1750, 120), 1100)
cover = dotted_arc(cover, (760, 1110), (1350, 1020), (1960, 70))
cover.save(f"{A}/bg_cover.png")

# Cierre: degradé invertido
close = gradient("0F5E6B", "07161D", "2F86B8", (200, 950), 1200)
close = dotted_arc(close, (1960, 640), (1560, 90), (1120, -40), color="4FB0E8")
close.save(f"{A}/bg_close.png")

# Códigos de barras
def barcode(path, color, seed=7):
    rnd = random.Random(seed)
    im = Image.new("RGBA", (900, 120), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    x = 0
    while x < 900:
        w = rnd.choice([3, 3, 6, 9, 12]); gap = rnd.choice([4, 6, 9])
        d.rectangle([x, 0, x + w, 120], fill=hexc(color) + (255,)); x += w + gap
    im.save(path)
barcode(f"{A}/barcode_claro.png", "EDEFF1")
barcode(f"{A}/barcode_oscuro.png", "0A0D10", seed=11)

# QR a las páginas reales
for name, url in [("grilla", "https://grilla-inteligente-termo.vercel.app/"),
                  ("termo", "https://web-termo.vercel.app/"),
                  ("bhs", "https://patio-de-valijas-aep.vercel.app/"),
                  ("hvac", "https://hvacsetpoint.vercel.app/"),
                  ("recorrida", "https://recorrida-f778.vercel.app/"),
                  ("techo", "https://filtraciones-infra.vercel.app/"),
                  ("pista", "https://infra-lado-pista.vercel.app/")]:
    segno.make(url, error="m").save(f"{A}/qr_{name}.png", scale=12, border=2, dark="0A0D10", light="FFFFFF")
print("ok")

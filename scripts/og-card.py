#!/usr/bin/env python3
"""
Generates the social share card (app/opengraph-image.png).

Drawn from the site's own design tokens and typefaces rather than mocked up
separately, so the preview card and the page cannot drift apart. Re-run after
changing the palette or the name:

    python3 scripts/og-card.py

Requires Pillow and the two variable fonts (fetched on first run into
.cache/fonts/, which is gitignored).
"""

from __future__ import annotations

import os
import urllib.request

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT_DIR = os.path.join(ROOT, ".cache", "fonts")
OUT = os.path.join(ROOT, "app", "opengraph-image.png")
TWITTER_OUT = os.path.join(ROOT, "app", "twitter-image.png")

FONTS = {
    "archivo.ttf": "https://github.com/google/fonts/raw/main/ofl/archivo/Archivo%5Bwdth,wght%5D.ttf",
    "jbmono.ttf": "https://github.com/google/fonts/raw/main/ofl/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf",
}

# --- design tokens, mirrored from app/globals.css -------------------------
BG = (7, 7, 10)
FG = (244, 242, 236)
MUTED = (139, 139, 153)
PURPLE = (177, 74, 255)
BLUE = (46, 217, 255)

W, H = 1200, 630
MARGIN = 72


def font_path(name: str) -> str:
    os.makedirs(FONT_DIR, exist_ok=True)
    path = os.path.join(FONT_DIR, name)
    if not os.path.exists(path):
        urllib.request.urlretrieve(FONTS[name], path)
    return path


def archivo(size: int, weight: int = 900, width: int = 100) -> ImageFont.FreeTypeFont:
    f = ImageFont.truetype(font_path("archivo.ttf"), size)
    f.set_variation_by_axes([weight, width])
    return f


def mono(size: int, weight: int = 500) -> ImageFont.FreeTypeFont:
    f = ImageFont.truetype(font_path("jbmono.ttf"), size)
    f.set_variation_by_axes([weight])
    return f


def _falloff_mask(radius: int, strength: float, res: int = 160) -> Image.Image:
    """
    Circular alpha mask that reaches exactly zero at the circle edge.

    PIL's Image.radial_gradient only saturates at the *corners* of its square,
    so its mid-edge value is ~180/255 — pasting it leaves a visible box seam.
    Building the falloff by hand at low resolution and scaling up avoids that
    and costs nothing.
    """
    mask = Image.new("L", (res, res), 0)
    px = mask.load()
    c = (res - 1) / 2
    for y in range(res):
        dy = (y - c) / c
        for x in range(res):
            dx = (x - c) / c
            d = (dx * dx + dy * dy) ** 0.5
            if d >= 1.0:
                continue
            t = 1.0 - d
            px[x, y] = int(255 * strength * t * t * (3 - 2 * t))  # smoothstep
    return mask.resize((radius * 2, radius * 2), Image.BICUBIC)


def glow(img: Image.Image, cx: int, cy: int, radius: int, colour, strength: float) -> None:
    """A soft radial wash, the same trick the page background uses."""
    mask = _falloff_mask(radius, strength)
    layer = Image.new("RGB", (radius * 2, radius * 2), colour)
    img.paste(layer, (cx - radius, cy - radius), mask)


def tracked(draw: ImageDraw.ImageDraw, xy, text: str, font, fill, tracking: float = 0.0):
    """Pillow has no letter-spacing, so step the pen manually."""
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += font.getlength(ch) + tracking
    return x


def tracked_width(text: str, font, tracking: float = 0.0) -> float:
    return sum(font.getlength(c) for c in text) + tracking * max(len(text) - 1, 0)


def build() -> Image.Image:
    img = Image.new("RGB", (W, H), BG)

    # Background washes — purple low-left, blue right, matching the hero.
    glow(img, 170, 610, 520, PURPLE, 0.34)
    glow(img, 1180, 300, 460, BLUE, 0.13)
    glow(img, 640, 700, 420, PURPLE, 0.12)

    d = ImageDraw.Draw(img)

    # --- top rule and eyebrow --------------------------------------------
    d.line([(MARGIN, 96), (W - MARGIN, 96)], fill=(38, 38, 48), width=1)

    f_eyebrow = mono(19, 500)
    d.rectangle([MARGIN, 62, MARGIN + 11, 73], fill=PURPLE)
    tracked(d, (MARGIN + 26, 58), "SUYASH", f_eyebrow, FG, 2.4)

    right = "DON'T JUST SCROLL. EXPERIENCE IT."
    rw = tracked_width(right, f_eyebrow, 2.4)
    tracked(d, (W - MARGIN - rw, 58), right, f_eyebrow, MUTED, 2.4)

    # --- the name ---------------------------------------------------------
    f_name = archivo(152, weight=900, width=112)
    tracking = -7.0
    y = 176
    tracked(d, (MARGIN - 6, y), "SUYASH", f_name, FG, tracking)
    tracked(d, (MARGIN - 6, y + 142), "PANDEY.", f_name, PURPLE, tracking)

    # --- accent rule ------------------------------------------------------
    rule_y = 486
    d.line([(MARGIN, rule_y), (MARGIN + 92, rule_y)], fill=PURPLE, width=3)
    d.line([(MARGIN + 104, rule_y), (W - MARGIN, rule_y)], fill=(38, 38, 48), width=1)

    # --- role strip -------------------------------------------------------
    f_role = mono(21, 500)
    tracked(
        d,
        (MARGIN, rule_y + 26),
        "AI & DATA SCIENCE ENGINEER   DEVELOPER   CREATIVE TECHNOLOGIST",
        f_role,
        MUTED,
        2.0,
    )

    # --- chapter rail motif, bottom right ---------------------------------
    f_tick = mono(15, 400)
    tx = W - MARGIN - 118
    ty = 196
    for i in range(1, 8):
        active = i == 1
        tracked(d, (tx, ty), f"0{i}", f_tick, FG if active else (58, 58, 70), 1.4)
        d.line([(tx + 40, ty + 9), (tx + (74 if active else 58), ty + 9)],
               fill=PURPLE if active else (40, 40, 50), width=2 if active else 1)
        ty += 30

    return img


if __name__ == "__main__":
    card = build()
    card.save(OUT, "PNG", optimize=True)
    card.save(TWITTER_OUT, "PNG", optimize=True)
    print(f"wrote {OUT}  ({os.path.getsize(OUT) // 1024} KB)")
    print(f"wrote {TWITTER_OUT}")

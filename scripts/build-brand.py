#!/usr/bin/env python3
"""Generate Arnova Group Agency logo SVGs and brand comparison boards."""
from __future__ import annotations

import math
import os
from pathlib import Path

import cairosvg
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path("/workspace/arnova-agency")
BRAND_OUT = Path("/workspace/arnova-agency-brand")
ASSETS = ROOT / "assets" / "brand"

FONT_DIR = Path("/usr/share/fonts/truetype/sand-box/google")
FONTS = {
    "newsreader": FONT_DIR / "Newsreader" / "Newsreader-VariableFont_opsz,wght.ttf",
    "source_sans": FONT_DIR / "Source Sans 3" / "SourceSans3-VariableFont_wght.ttf",
    "fraunces": FONT_DIR / "Fraunces" / "Fraunces-VariableFont_SOFT,WONK,opsz,wght.ttf",
    "figtree": FONT_DIR / "Figtree" / "Figtree-VariableFont_wght.ttf",
    "syne": FONT_DIR / "Syne" / "Syne-VariableFont_wght.ttf",
    "instrument": FONT_DIR / "Instrument Sans" / "InstrumentSans-VariableFont_wdth,wght.ttf",
}


def hex_to_rgb(hx: str) -> tuple[int, int, int]:
    h = hx.lstrip("#")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def lin(c: float) -> float:
    c = c / 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def luminance(hx: str) -> float:
    r, g, b = hex_to_rgb(hx)
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)


def contrast(a: str, b: str) -> float:
    l1, l2 = luminance(a), luminance(b)
    return (max(l1, l2) + 0.05) / (min(l1, l2) + 0.05)


def aa_label(ratio: float, large: bool = False) -> str:
    if ratio >= 4.5:
        return "AA"
    if ratio >= 3:
        return "AA large"
    return "fail"


# ---------------------------------------------------------------------------
# Palettes — all listed text pairs are contrast-checked below.
# ---------------------------------------------------------------------------
OPTIONS = [
    {
        "id": "option-1",
        "slug": "apex-navy",
        "name": "Apex Navy",
        "number": "01",
        "concept": "A sharp architectural A for a confident, editorial consultancy.",
        "display": "newsreader",
        "sans": "source_sans",
        "font_display_css": '"Newsreader", "Times New Roman", serif',
        "font_sans_css": '"Source Sans 3", "Source Sans Pro", "Segoe UI", sans-serif',
        "colors": {
            "primary": "#0C2038",
            "accent": "#C4A46B",
            "accent_text": "#7A5A1E",
            "bg": "#F7F4EE",
            "surface": "#FFFFFF",
            "surface_alt": "#EDE8DF",
            "text": "#122033",
            "muted": "#4E5A68",
            "line": "#D6D0C6",
            "on_primary": "#F7F4EE",
            "on_accent": "#122033",
            "success": "#0F6A45",
            "warn": "#8A4B00",
            "dark_bg": "#0A1624",
            "dark_surface": "#132033",
            "dark_text": "#F3EFE7",
            "dark_muted": "#B5BDC7",
            "dark_line": "#2A3A4E",
        },
        "pairs": [
            ("Text on background", "text", "bg"),
            ("Text on surface", "text", "surface"),
            ("Muted text on background", "muted", "bg"),
            ("Primary as link on background", "primary", "bg"),
            ("Accent text on background", "accent_text", "bg"),
            ("Ivory on primary", "on_primary", "primary"),
            ("Navy on accent", "on_accent", "accent"),
            ("Accent on primary (UI)", "accent", "primary"),
            ("Success on background", "success", "bg"),
            ("Warning on background", "warn", "bg"),
            ("Dark text on dark background", "dark_text", "dark_bg"),
            ("Dark muted on dark background", "dark_muted", "dark_bg"),
            ("Accent on dark background", "accent", "dark_bg"),
        ],
    },
    {
        "id": "option-2",
        "slug": "ridge-forest",
        "name": "Ridge Forest",
        "number": "02",
        "concept": "Terraced steps that form an A — grounded, warm, and built for Rwanda.",
        "display": "fraunces",
        "sans": "figtree",
        "font_display_css": '"Fraunces", "Times New Roman", serif',
        "font_sans_css": '"Figtree", "Segoe UI", sans-serif',
        "colors": {
            "primary": "#104037",
            "accent": "#B44E22",
            "accent_text": "#8F3A12",
            "accent_on_dark": "#E4C9A0",
            "bg": "#F4F1EA",
            "surface": "#FFFFFF",
            "surface_alt": "#E8E3D8",
            "text": "#14211E",
            "muted": "#4A5A55",
            "line": "#D4CFC4",
            "on_primary": "#F4F1EA",
            "on_accent": "#FFF8F3",
            "success": "#1A6E42",
            "warn": "#8A3B00",
            "dark_bg": "#0B1C18",
            "dark_surface": "#14302A",
            "dark_text": "#F3EFE6",
            "dark_muted": "#B3C0BB",
            "dark_line": "#2A4A42",
        },
        "pairs": [
            ("Text on background", "text", "bg"),
            ("Muted text on background", "muted", "bg"),
            ("Primary as link on background", "primary", "bg"),
            ("Accent text on background", "accent_text", "bg"),
            ("Accent as text on background", "accent", "bg"),
            ("Ivory on primary", "on_primary", "primary"),
            ("Ivory on accent", "on_accent", "accent"),
            ("Sand accent on primary (UI)", "accent_on_dark", "primary"),
            ("Success on background", "success", "bg"),
            ("Warning on background", "warn", "bg"),
            ("Dark text on dark background", "dark_text", "dark_bg"),
            ("Dark muted on dark background", "dark_muted", "dark_bg"),
            ("Sand accent on dark background", "accent_on_dark", "dark_bg"),
        ],
    },
    {
        "id": "option-3",
        "slug": "signal-slate",
        "name": "Signal Slate",
        "number": "03",
        "concept": "A gateway A with a clear door — precise, modern, and quietly technical.",
        "display": "syne",
        "sans": "instrument",
        "font_display_css": '"Syne", "Segoe UI", sans-serif',
        "font_sans_css": '"Instrument Sans", "Segoe UI", sans-serif',
        "colors": {
            "primary": "#161618",
            "accent": "#0C6F86",
            "accent_text": "#0A5A6C",
            "bg": "#F7F7F5",
            "surface": "#FFFFFF",
            "surface_alt": "#ECECE8",
            "text": "#161618",
            "muted": "#5A5A5E",
            "line": "#D8D8D4",
            "on_primary": "#F7F7F5",
            "on_accent": "#F7F7F5",
            "success": "#0D7A4C",
            "warn": "#8A5800",
            "dark_bg": "#111113",
            "dark_surface": "#1C1C1F",
            "dark_text": "#F4F4F1",
            "dark_muted": "#B8B8BC",
            "dark_line": "#3A3A3E",
        },
        "pairs": [
            ("Text on background", "text", "bg"),
            ("Muted text on background", "muted", "bg"),
            ("Primary as link on background", "primary", "bg"),
            ("Accent text on background", "accent_text", "bg"),
            ("Ivory on primary", "on_primary", "primary"),
            ("Ivory on accent", "on_accent", "accent"),
            ("Accent on primary (UI, large)", "accent", "primary"),
            ("Success on background", "success", "bg"),
            ("Warning on background", "warn", "bg"),
            ("Dark text on dark background", "dark_text", "dark_bg"),
            ("Dark muted on dark background", "dark_muted", "dark_bg"),
            ("Accent on dark background (UI, large)", "accent", "dark_bg"),
        ],
    },
]


def mark_apex(fill: str) -> str:
    # Architectural A: two tapering legs meeting at a sharp peak, thick floating crossbar.
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none" role="img" aria-labelledby="t">
<title id="t">Arnova Group Agency mark</title>
<g fill="{fill}">
  <polygon points="16,70 36,12 44,12 30,70"/>
  <polygon points="64,70 44,12 36,12 50,70"/>
  <rect x="25" y="42" width="30" height="7"/>
</g>
</svg>
'''


def mark_ridge(fill: str) -> str:
    # Three terraced bands that taper like an A, with a gap in the base (the counter).
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none" role="img" aria-labelledby="t">
<title id="t">Arnova Group Agency mark</title>
<g fill="{fill}">
  <rect x="28" y="10" width="24" height="14" rx="3"/>
  <rect x="16" y="30" width="48" height="14" rx="3"/>
  <rect x="6" y="50" width="26" height="16" rx="3"/>
  <rect x="48" y="50" width="26" height="16" rx="3"/>
</g>
</svg>
'''


def mark_signal(fill: str) -> str:
    # Gateway A: closed-base A with a rectangular door cut from the counter to the threshold.
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none" role="img" aria-labelledby="t">
<title id="t">Arnova Group Agency mark</title>
<path fill="{fill}" fill-rule="evenodd" d="M14 70 36 10h8L66 70H52.5L40 34 27.5 70H14Zm20-22h12v22H34V48Z"/>
</svg>
'''


MARK_FNS = {
    "option-1": mark_apex,
    "option-2": mark_ridge,
    "option-3": mark_signal,
}


def wordmark_svg(opt: dict, fill: str, subfill: str) -> str:
    # Text-based wordmark; boards render type in Pillow for faithful typography.
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 80" role="img" aria-labelledby="t">
<title id="t">Arnova Group Agency</title>
<text x="0" y="48" fill="{fill}" font-family={opt["font_display_css"].split(",")[0]} font-size="42" font-weight="650" letter-spacing="-1.2">ARNOVA</text>
<text x="0" y="72" fill="{subfill}" font-family={opt["font_sans_css"].split(",")[0]} font-size="11" font-weight="600" letter-spacing="3.6">GROUP AGENCY</text>
</svg>
'''


def lockup_svg(opt: dict, mark_fill: str, word_fill: str, subfill: str) -> str:
    mark = MARK_FNS[opt["id"]](mark_fill)
    inner = mark.split(">", 1)[1].rsplit("</svg>", 1)[0]
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 96" role="img" aria-labelledby="t">
<title id="t">Arnova Group Agency</title>
<g transform="translate(0,8) scale(1)">{inner}</g>
<text x="102" y="50" fill="{word_fill}" font-family={opt["font_display_css"].split(",")[0]} font-size="42" font-weight="650" letter-spacing="-1.2">ARNOVA</text>
<text x="104" y="76" fill="{subfill}" font-family={opt["font_sans_css"].split(",")[0]} font-size="11" font-weight="600" letter-spacing="3.6">GROUP AGENCY</text>
</svg>
'''


def write_svgs(opt: dict) -> Path:
    folder = ASSETS / opt["id"]
    folder.mkdir(parents=True, exist_ok=True)
    c = opt["colors"]
    (folder / "mark-light.svg").write_text(MARK_FNS[opt["id"]](c["primary"]))
    (folder / "mark-dark.svg").write_text(MARK_FNS[opt["id"]](c["accent"] if opt["id"] != "option-3" else c["on_primary"]))
    # Option 3 dark mark should be ivory on charcoal; accent is used as a signal color, not the mark.
    if opt["id"] == "option-2":
        (folder / "mark-dark.svg").write_text(MARK_FNS[opt["id"]](c["accent_on_dark"]))
    (folder / "wordmark-light.svg").write_text(wordmark_svg(opt, c["primary"], c["muted"]))
    (folder / "wordmark-dark.svg").write_text(wordmark_svg(opt, c["dark_text"], c["dark_muted"]))
    (folder / "lockup-light.svg").write_text(lockup_svg(opt, c["primary"], c["primary"], c["muted"]))
    dark_mark = c["accent"] if opt["id"] == "option-1" else (c["accent_on_dark"] if opt["id"] == "option-2" else c["on_primary"])
    (folder / "lockup-dark.svg").write_text(lockup_svg(opt, dark_mark, c["dark_text"], c["dark_muted"]))
    return folder


_FONT_CACHE: dict[tuple, Path] = {}

def _instantiated(path: Path, size: int, weight: int, opsz: float | None) -> Path:
    key = (str(path), int(weight), int(opsz or size))
    if key in _FONT_CACHE:
        return _FONT_CACHE[key]
    from fontTools.ttLib import TTFont
    from fontTools.varLib.instancer import instantiateVariableFont
    import tempfile
    tt = TTFont(str(path))
    coords = {}
    if "fvar" in tt:
        for ax in tt["fvar"].axes:
            tag = ax.axisTag
            if tag == "wght":
                coords[tag] = max(ax.minValue, min(weight, ax.maxValue))
            elif tag == "opsz":
                val = opsz if opsz is not None else size
                coords[tag] = max(ax.minValue, min(val, ax.maxValue))
            elif tag == "SOFT":
                coords[tag] = 0
            elif tag == "WONK":
                coords[tag] = 0
            elif tag == "wdth":
                coords[tag] = 100
        if coords:
            tt = instantiateVariableFont(tt, coords, overlap=True)
    tmp = Path(tempfile.mkstemp(suffix=".ttf")[1])
    tt.save(tmp)
    _FONT_CACHE[key] = tmp
    return tmp

def font(path: Path, size: int, weight: int = 400, opsz: float | None = None) -> ImageFont.FreeTypeFont:
    try:
        inst = _instantiated(path, size, weight, opsz)
        return ImageFont.truetype(str(inst), size=size)
    except Exception:
        return ImageFont.truetype(str(path), size=size)


def text_size(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont) -> tuple[int, int]:
    b = draw.textbbox((0, 0), text, font=fnt)
    return b[2] - b[0], b[3] - b[1]


def svg_to_png(svg_path: Path, width: int) -> Image.Image:
    data = cairosvg.svg2png(url=str(svg_path), output_width=width)
    from io import BytesIO
    im = Image.open(BytesIO(data)).convert("RGBA")
    return im


def rounded_rect(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def render_board(opt: dict) -> Path:
    W, H = 1600, 2300
    c = opt["colors"]
    bg = hex_to_rgb(c["bg"])
    img = Image.new("RGB", (W, H), bg)
    d = ImageDraw.Draw(img)
    sans_path = FONTS[opt["sans"]]
    display_path = FONTS[opt["display"]]

    f_kicker = font(sans_path, 28, 650)
    f_name = font(display_path, 92, 650)
    f_concept = font(sans_path, 32, 400)
    f_label = font(sans_path, 22, 650)
    f_hex = font(sans_path, 22, 500)
    f_small = font(sans_path, 18, 500)
    f_nav = font(sans_path, 26, 600)
    f_word = font(display_path, 86, 650)
    f_sub = font(sans_path, 22, 600)
    f_card_title = font(display_path, 40, 650)
    f_card_body = font(sans_path, 24, 400)
    f_btn = font(sans_path, 24, 650)

    margin = 90
    y = 80
    d.text((margin, y), f"OPTION {opt['number']}", font=f_kicker, fill=hex_to_rgb(c["accent_text"]))
    y += 50
    d.text((margin, y), opt["name"], font=f_name, fill=hex_to_rgb(c["primary"]))
    y += 120
    # concept wrap
    concept = opt["concept"]
    d.text((margin, y), concept, font=f_concept, fill=hex_to_rgb(c["muted"]))
    y += 80

    # Light lockup panel
    panel = (margin, y, W - margin, y + 280)
    rounded_rect(d, panel, 24, hex_to_rgb(c["surface"]), hex_to_rgb(c["line"]), 2)
    mark = svg_to_png(ASSETS / opt["id"] / "mark-light.svg", 180)
    img.paste(mark, (margin + 48, y + 50), mark)
    d.text((margin + 260, y + 70), "ARNOVA", font=f_word, fill=hex_to_rgb(c["primary"]))
    d.text((margin + 264, y + 175), "GROUP  AGENCY", font=f_sub, fill=hex_to_rgb(c["muted"]))
    d.text((W - margin - 200, y + 28), "LIGHT", font=f_label, fill=hex_to_rgb(c["muted"]))
    y += 310

    # Dark lockup panel
    dark_mark_color_key = "accent" if opt["id"] == "option-1" else ("accent_on_dark" if opt["id"] == "option-2" else "on_primary")
    panel = (margin, y, W - margin, y + 280)
    rounded_rect(d, panel, 24, hex_to_rgb(c["dark_bg"]))
    mark_d = svg_to_png(ASSETS / opt["id"] / "mark-dark.svg", 180)
    img.paste(mark_d, (margin + 48, y + 50), mark_d)
    d.text((margin + 260, y + 70), "ARNOVA", font=f_word, fill=hex_to_rgb(c["dark_text"]))
    d.text((margin + 264, y + 175), "GROUP  AGENCY", font=f_sub, fill=hex_to_rgb(c["dark_muted"]))
    d.text((W - margin - 200, y + 28), "DARK", font=f_label, fill=hex_to_rgb(c["dark_muted"]))
    y += 320

    # Palette
    d.text((margin, y), "PALETTE", font=f_label, fill=hex_to_rgb(c["muted"]))
    y += 44
    swatches = [
        ("Primary", "primary"),
        ("Accent", "accent"),
        ("Accent text", "accent_text"),
        ("Background", "bg"),
        ("Surface", "surface"),
        ("Text", "text"),
        ("Muted", "muted"),
        ("Line", "line"),
        ("Success", "success"),
        ("Warning", "warn"),
        ("Dark bg", "dark_bg"),
        ("Dark text", "dark_text"),
    ]
    if "accent_on_dark" in c:
        swatches.insert(3, ("Accent on dark", "accent_on_dark"))
    cols = 4
    sw_w, sw_h, gap = 330, 92, 16
    for i, (label, key) in enumerate(swatches):
        col, row = i % cols, i // cols
        x0 = margin + col * (sw_w + gap)
        y0 = y + row * (sw_h + gap)
        rounded_rect(d, (x0, y0, x0 + sw_w, y0 + sw_h), 14, hex_to_rgb(c[key]), hex_to_rgb(c["line"]), 1)
        # pick readable label color
        ink = "#F7F4EE" if contrast("#F7F4EE", c[key]) >= contrast("#122033", c[key]) else "#122033"
        d.text((x0 + 16, y0 + 16), label, font=f_label, fill=hex_to_rgb(ink))
        d.text((x0 + 16, y0 + 48), c[key].upper(), font=f_hex, fill=hex_to_rgb(ink))
    rows = math.ceil(len(swatches) / cols)
    y += rows * (sw_h + gap) + 28

    # Contrast strip (compact)
    d.text((margin, y), "CONTRAST  ·  WCAG AA TEXT PAIRS", font=f_label, fill=hex_to_rgb(c["muted"]))
    y += 36
    f_pair = font(sans_path, 20, 500)
    for label, fgk, bgk in opt["pairs"]:
        ratio = contrast(c[fgk], c[bgk])
        tag = aa_label(ratio)
        # skip drawing every pair if tight — we'll list all, two columns
    # two-column list
    pairs = opt["pairs"]
    mid = math.ceil(len(pairs) / 2)
    for col, chunk in enumerate((pairs[:mid], pairs[mid:])):
        yy = y
        x0 = margin + col * 720
        for label, fgk, bgk in chunk:
            ratio = contrast(c[fgk], c[bgk])
            tag = aa_label(ratio)
            if "large" in label.lower() or "UI" in label:
                if ratio >= 3:
                    tag = "AA large" if ratio < 4.5 else "AA"
            line = f"{label}  {ratio:.1f}:1  {tag}"
            d.text((x0, yy), line, font=f_pair, fill=hex_to_rgb(c["text"]))
            yy += 28
    y += mid * 28 + 36

    # Mock navbar
    d.text((margin, y), "DESKTOP NAVBAR", font=f_label, fill=hex_to_rgb(c["muted"]))
    y += 36
    nav_h = 92
    nav_box = (margin, y, W - margin, y + nav_h)
    # white bar with bottom shadow-ish line
    rounded_rect(d, nav_box, 16, hex_to_rgb(c["surface"]), hex_to_rgb(c["line"]), 2)
    mark_s = svg_to_png(ASSETS / opt["id"] / "mark-light.svg", 72)
    img.paste(mark_s, (margin + 24, y + 10), mark_s)
    d.text((margin + 110, y + 26), "Arnova Group", font=font(display_path, 28, 650), fill=hex_to_rgb(c["primary"]))
    links = ["Services", "Pricing", "About", "Contact"]
    lx = margin + 430
    for link in links:
        d.text((lx, y + 32), link, font=f_nav, fill=hex_to_rgb(c["text"]))
        lx += 150
    # CTA
    cta = (W - margin - 200, y + 22, W - margin - 24, y + 70)
    rounded_rect(d, cta, 24, hex_to_rgb(c["primary"]))
    tw, th = text_size(d, "Get a quote", f_btn)
    d.text((cta[0] + (176 - tw) / 2, y + 32), "Get a quote", font=f_btn, fill=hex_to_rgb(c["on_primary"]))
    y += nav_h + 48

    # Button + card row
    d.text((margin, y), "BUTTON  AND  CARD", font=f_label, fill=hex_to_rgb(c["muted"]))
    y += 36
    # primary button
    btn1 = (margin, y + 80, margin + 220, y + 140)
    rounded_rect(d, btn1, 28, hex_to_rgb(c["primary"]))
    d.text((margin + 44, y + 96), "Get a quote", font=f_btn, fill=hex_to_rgb(c["on_primary"]))
    # accent button
    btn2 = (margin + 250, y + 80, margin + 470, y + 140)
    rounded_rect(d, btn2, 28, hex_to_rgb(c["accent"]))
    on_acc = c["on_accent"]
    d.text((margin + 300, y + 96), "View work", font=f_btn, fill=hex_to_rgb(on_acc))
    # card
    card = (margin + 520, y, W - margin, y + 230)
    rounded_rect(d, card, 20, hex_to_rgb(c["surface"]), hex_to_rgb(c["line"]), 2)
    d.text((card[0] + 32, card[1] + 28), "Business websites", font=f_card_title, fill=hex_to_rgb(c["text"]))
    d.text((card[0] + 32, card[1] + 90), "Clear pages for companies in Rwanda,", font=f_card_body, fill=hex_to_rgb(c["muted"]))
    d.text((card[0] + 32, card[1] + 124), "with a path to get in touch.", font=f_card_body, fill=hex_to_rgb(c["muted"]))
    link_col = c.get("accent_text", c["primary"])
    d.text((card[0] + 32, card[1] + 172), "Explore services  →", font=f_btn, fill=hex_to_rgb(link_col))

    out = BRAND_OUT / f"{opt['id']}.png"
    img.save(out, "PNG", optimize=True)
    return out


def render_overview(opts: list[dict]) -> Path:
    W, H = 2880, 1680
    # warm shared background
    img = Image.new("RGB", (W, H), (246, 243, 237))
    d = ImageDraw.Draw(img)
    sans = FONTS["source_sans"]
    display = FONTS["newsreader"]
    f_title = font(display, 72, 650)
    f_sub = font(sans, 30, 400)
    f_name = font(display, 48, 650)
    f_concept = font(sans, 24, 400)
    f_kicker = font(sans, 22, 650)
    d.text((80, 60), "Arnova Group Agency", font=f_title, fill=(12, 32, 51))
    d.text((80, 150), "Brand options for review  ·  three directions, one name", font=f_sub, fill=(78, 90, 104))

    col_w = 860
    gap = 50
    x0 = 80
    y0 = 230
    for i, opt in enumerate(opts):
        c = opt["colors"]
        x = x0 + i * (col_w + gap)
        # card
        rounded_rect(d, (x, y0, x + col_w, H - 80), 28, hex_to_rgb(c["bg"]), hex_to_rgb(c["line"]), 2)
        d.text((x + 40, y0 + 36), f"OPTION {opt['number']}", font=f_kicker, fill=hex_to_rgb(c["accent_text"]))
        d.text((x + 40, y0 + 80), opt["name"], font=f_name, fill=hex_to_rgb(c["primary"]))
        # wrap concept
        words = opt["concept"].split()
        lines, cur = [], ""
        for w in words:
            trial = (cur + " " + w).strip()
            bb = d.textbbox((0, 0), trial, font=f_concept)
            if bb[2] - bb[0] > col_w - 90:
                lines.append(cur)
                cur = w
            else:
                cur = trial
        if cur:
            lines.append(cur)
        yy = y0 + 150
        for line in lines:
            d.text((x + 40, yy), line, font=f_concept, fill=hex_to_rgb(c["muted"]))
            yy += 34

        # light mark + word
        mark = svg_to_png(ASSETS / opt["id"] / "mark-light.svg", 140)
        img.paste(mark, (x + 40, yy + 20), mark)
        d.text((x + 200, yy + 30), "ARNOVA", font=font(FONTS[opt["display"]], 54, 650), fill=hex_to_rgb(c["primary"]))
        d.text((x + 202, yy + 100), "GROUP  AGENCY", font=font(FONTS[opt["sans"]], 18, 600), fill=hex_to_rgb(c["muted"]))

        # dark inset
        dy = yy + 180
        rounded_rect(d, (x + 40, dy, x + col_w - 40, dy + 180), 18, hex_to_rgb(c["dark_bg"]))
        mark_d = svg_to_png(ASSETS / opt["id"] / "mark-dark.svg", 120)
        img.paste(mark_d, (x + 64, dy + 30), mark_d)
        d.text((x + 210, dy + 46), "ARNOVA", font=font(FONTS[opt["display"]], 46, 650), fill=hex_to_rgb(c["dark_text"]))
        d.text((x + 212, dy + 110), "GROUP  AGENCY", font=font(FONTS[opt["sans"]], 16, 600), fill=hex_to_rgb(c["dark_muted"]))

        # mini swatches
        keys = ["primary", "accent", "bg", "text", "success", "warn"]
        sy = dy + 210
        sw = 110
        for j, key in enumerate(keys):
            sx = x + 40 + j * (sw + 14)
            rounded_rect(d, (sx, sy, sx + sw, sy + 70), 10, hex_to_rgb(c[key]), hex_to_rgb(c["line"]), 1)
            ink = "#F7F4EE" if contrast("#F7F4EE", c[key]) >= contrast("#122033", c[key]) else "#122033"
            d.text((sx + 8, sy + 24), c[key].upper(), font=font(FONTS[opt["sans"]], 14, 600), fill=hex_to_rgb(ink))

        # mini nav
        ny = sy + 100
        rounded_rect(d, (x + 40, ny, x + col_w - 40, ny + 70), 12, hex_to_rgb(c["surface"]), hex_to_rgb(c["line"]), 1)
        ms = svg_to_png(ASSETS / opt["id"] / "mark-light.svg", 48)
        img.paste(ms, (x + 54, ny + 11), ms)
        d.text((x + 110, ny + 20), "Arnova", font=font(FONTS[opt["display"]], 22, 650), fill=hex_to_rgb(c["primary"]))
        d.text((x + 280, ny + 22), "Services    Pricing    About", font=font(FONTS[opt["sans"]], 16, 600), fill=hex_to_rgb(c["text"]))
        rounded_rect(d, (x + col_w - 220, ny + 16, x + col_w - 56, ny + 54), 18, hex_to_rgb(c["primary"]))
        d.text((x + col_w - 208, ny + 24), "Get a quote", font=font(FONTS[opt["sans"]], 15, 650), fill=hex_to_rgb(c["on_primary"]))

    out = BRAND_OUT / "overview.png"
    img.save(out, "PNG", optimize=True)
    return out


def contrast_report() -> str:
    lines = ["# Brand contrast report\n"]
    for opt in OPTIONS:
        c = opt["colors"]
        lines.append(f"## {opt['name']}\n")
        lines.append(f"{opt['concept']}\n")
        for label, fgk, bgk in opt["pairs"]:
            ratio = contrast(c[fgk], c[bgk])
            need_large = "large" in label.lower() or "(UI" in label
            tag = "AA" if ratio >= 4.5 else ("AA large" if ratio >= 3 else "FAIL")
            if need_large and 3 <= ratio < 4.5:
                tag = "AA large (as labelled)"
            lines.append(f"- {label}: `{c[fgk]}` on `{c[bgk]}` — **{ratio:.2f}:1** ({tag})")
        lines.append("")
    return "\n".join(lines) + "\n"


def main() -> None:
    BRAND_OUT.mkdir(parents=True, exist_ok=True)
    ASSETS.mkdir(parents=True, exist_ok=True)
    for opt in OPTIONS:
        write_svgs(opt)
        path = render_board(opt)
        print("board", path, path.stat().st_size)
    overview = render_overview(OPTIONS)
    print("overview", overview, overview.stat().st_size)
    report = contrast_report()
    (BRAND_OUT / "contrast-report.md").write_text(report)
    print(report)


if __name__ == "__main__":
    main()

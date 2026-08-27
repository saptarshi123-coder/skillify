"""
pdf_builder.py
Canvas-based rendering engine recreating the reference "Maryam" CV template,
matched as closely as possible element-for-element:

  - deep maroon (#800000) rounded side panel with soft drop shadow
  - profile photo seated on a maroon rounded-square backdrop (or a matching
    initials monogram block when the user has no photo), with the person's
    name in an overlapped white pill (left edge) and the graduation year in
    an overlapped maroon pill (right edge)
  - white bordered "Contact" card (script heading, centred details)
  - script-font ("Lobster") headings everywhere; Poppins body text
  - Education rows laid out year-column-first, like the reference
  - Technical Skills split into "Software Skills" app-icon badges and
    "Other Skills" dash list, followed by pill-shaped skill tags
  - bordered white "Experience" / "Languages" / "Interest" cards with drop
    shadows; centred card headings; 4-pointed star bullets; maroon link
    pills at the foot of the Experience card
  - languages render with proficiency bars, not bare words
  - optional QR-code chip at the foot of the sidebar linking to the user's
    portfolio / LinkedIn / GitHub
  - subtle branded footer rule ("Generated with Skillify") on the cream strip

AUTO-FIT: profiles with heavy content are re-rendered at progressively
smaller type scales (down to 80%) instead of silently clipping off the
bottom of the page. The layout geometry never changes -- only type and
spacing breathe.

IMPORTANT TRADE-OFF -- please read before using this for technical-domain
CVs: this style is decorative and image-heavy (custom fonts, colored
shapes, icon-like badges). It looks great to a human reviewer, but most
ATS (applicant tracking system) parsers will struggle with it far more
than a plain single-column layout. Best suited to creative-domain
applications (Design, Writing, Marketing, Videography, Photography)
that a human looks at directly.

This is a FIXED single-page design (matching the reference template's own
genre -- a one-page infographic resume, not a paginated document).
"""

from __future__ import annotations

import base64
import binascii
import datetime as _dt
import hashlib
import io
import math
import os
from typing import List, Optional, Tuple

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas as canvas_module
from reportlab.platypus import Paragraph

from domain_engine import (
    SECTION_ACHIEVEMENTS,
    SECTION_CERTIFICATIONS,
    SECTION_EDUCATION,
    SECTION_INTERESTS,
    SECTION_INTERNSHIPS,
    SECTION_LANGUAGES,
    SECTION_PROJECTS,
    SECTION_SKILLS,
    SECTION_SOFT_SKILLS,
    SECTION_SUMMARY,
    CVLayoutPlan,
)
from repository import NormalizedProfile

PAGE_SIZE = A4
PAGE_WIDTH, PAGE_HEIGHT = A4
MARGIN = 26

# --- Palette (tuned against the reference image) --------------------------
CREAM = colors.HexColor("#FFF8F0")          # page background
PANEL_RED = colors.HexColor("#800000")      # deep maroon panel / filled shapes
ACCENT_RED = colors.HexColor("#8B0000")     # borders, headings on white
SHADOW_TINT = colors.HexColor("#3A0A0A")    # drop shadows (drawn semi-transparent)
WHITE = colors.white
TEXT_DARK = colors.HexColor("#2E2320")
TEXT_SOFT = colors.HexColor("#57443C")
TEXT_ON_RED = colors.HexColor("#F7EAE2")
SUBHEAD_ON_RED = colors.HexColor("#F2CFC4")
TRACK_TINT = colors.HexColor("#EBD9CE")     # language-bar unfilled track

# App-icon style badge colors (Adobe-tool hues: blue / purple / violet /
# orange, plus spares), used for the "Software Skills" badge row.
ICON_BADGE_COLORS = [
    colors.HexColor("#31A8FF"),
    colors.HexColor("#8A5CF6"),
    colors.HexColor("#D861C8"),
    colors.HexColor("#FF9A00"),
    colors.HexColor("#45B69C"),
    colors.HexColor("#5B6770"),
]

FONT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts")
_FONTS_REGISTERED = False

# Resolved once, after registration, instead of re-checking font
# availability via try/except on every single _script_font()/_body_font()
# call throughout a render (each PDF makes 50-100+ of these calls).
_RESOLVED_FONTS: dict[str, str] = {}


def _register_fonts() -> None:
    global _FONTS_REGISTERED
    if _FONTS_REGISTERED:
        return
    font_files = {
        "Lobster": "Lobster-Regular.ttf",
        "Poppins": "Poppins-Regular.ttf",
        "Poppins-Bold": "Poppins-Bold.ttf",
        "Poppins-SemiBold": "Poppins-SemiBold.ttf",
        "Poppins-Italic": "Poppins-Italic.ttf",
    }
    for name, filename in font_files.items():
        path = os.path.join(FONT_DIR, filename)
        if os.path.isfile(path):
            try:
                pdfmetrics.registerFont(TTFont(name, path))
            except Exception:
                pass

    def _resolve(candidate: str, fallback: str) -> str:
        try:
            pdfmetrics.getFont(candidate)
            return candidate
        except Exception:
            return fallback

    _RESOLVED_FONTS["script"] = _resolve("Lobster", "Helvetica-Bold")
    _RESOLVED_FONTS["regular"] = _resolve("Poppins", "Helvetica")
    _RESOLVED_FONTS["bold"] = _resolve("Poppins-Bold", "Helvetica-Bold")
    _RESOLVED_FONTS["semibold"] = _resolve("Poppins-SemiBold", "Helvetica-Bold")
    _RESOLVED_FONTS["italic"] = _resolve("Poppins-Italic", "Helvetica-Oblique")
    _FONTS_REGISTERED = True


def _script_font() -> str:
    return _RESOLVED_FONTS.get("script", "Helvetica-Bold")


def _body_font(weight: str = "regular") -> str:
    return _RESOLVED_FONTS.get(weight, _RESOLVED_FONTS.get("regular", "Helvetica"))


# --- Low-level drawing helpers -------------------------------------------

def _draw_star(cnv, cx: float, cy: float, size: float, color) -> None:
    """Four-pointed sparkle star, as used throughout the reference."""
    outer, inner = size, size * 0.32
    points = []
    for i in range(8):
        angle = math.pi / 4 * i
        r = outer if i % 2 == 0 else inner
        points.append((cx + r * math.sin(angle), cy + r * math.cos(angle)))
    p = cnv.beginPath()
    p.moveTo(*points[0])
    for pt in points[1:]:
        p.lineTo(*pt)
    p.close()
    cnv.setFillColor(color)
    cnv.drawPath(p, fill=1, stroke=0)


def _round_rect(cnv, x, y, w, h, radius, fill_color=None, stroke_color=None, line_width=1.0) -> None:
    cnv.saveState()
    if fill_color is not None:
        cnv.setFillColor(fill_color)
    if stroke_color is not None:
        cnv.setStrokeColor(stroke_color)
        cnv.setLineWidth(line_width)
    cnv.roundRect(x, y, w, h, radius, stroke=1 if stroke_color is not None else 0, fill=1 if fill_color is not None else 0)
    cnv.restoreState()


def _card_shadow(cnv, x, y, w, h, radius, offset=3.2, alpha=0.20) -> None:
    """Soft drop shadow, drawn just below-right of where a card will sit."""
    cnv.saveState()
    cnv.setFillColor(SHADOW_TINT)
    try:
        cnv.setFillAlpha(alpha)
    except Exception:
        pass
    cnv.roundRect(x + offset, y - offset, w, h, radius, stroke=0, fill=1)
    cnv.restoreState()


def _pill(cnv, x, y, text, font, size, text_color, bg_color, border_color=None, pad_x=8, pad_y=4) -> float:
    text_w = pdfmetrics.stringWidth(text, font, size)
    w = text_w + 2 * pad_x
    h = size + 2 * pad_y
    _round_rect(cnv, x, y, w, h, radius=h / 2, fill_color=bg_color, stroke_color=border_color, line_width=1.0)
    cnv.setFillColor(text_color)
    cnv.setFont(font, size)
    cnv.drawString(x + pad_x, y + pad_y + size * 0.28, text)
    return w


def _flow_pills(cnv, items: List[str], x0, y_top, max_width, font, size, text_color, bg_color, border_color=None, line_gap=6, item_gap=6) -> float:
    pill_h = size + 8
    row_height = pill_h + line_gap
    x = x0
    row_top = y_top
    for item in items:
        text_w = pdfmetrics.stringWidth(item, font, size)
        pill_w = text_w + 16
        if x + pill_w > x0 + max_width and x != x0:
            x = x0
            row_top -= row_height
        _pill(cnv, x, row_top - pill_h, item, font, size, text_color, bg_color, border_color)
        x += pill_w + item_gap
    return (y_top - row_top) + row_height


def _abbreviate(label: str) -> str:
    words = label.strip().split()
    if len(words) >= 2:
        return (words[0][0] + words[1][0]).upper()
    return label.strip()[:2].upper() if label.strip() else "??"


def _flow_icon_badges(cnv, items: List[str], x0, y_top, max_width, size=27, gap=8) -> float:
    """Small rounded squares with a 2-letter abbreviation, app-icon style."""
    x = x0
    row_top = y_top
    row_height = size + gap
    for i, item in enumerate(items):
        if x + size > x0 + max_width and x != x0:
            x = x0
            row_top -= row_height
        color = ICON_BADGE_COLORS[i % len(ICON_BADGE_COLORS)]
        y = row_top - size
        _round_rect(cnv, x, y, size, size, radius=6, fill_color=color)
        label = _abbreviate(item)
        cnv.setFillColor(WHITE)
        font = _body_font("bold")
        fsize = 9.5 if len(label) <= 2 else 7
        text_w = pdfmetrics.stringWidth(label, font, fsize)
        cnv.setFont(font, fsize)
        cnv.drawString(x + (size - text_w) / 2, y + size * 0.34, label)
        x += size + gap
    return (y_top - row_top) + row_height


def _decode_image_bytes(b64_str: str) -> Optional[bytes]:
    try:
        return base64.b64decode(b64_str, validate=True)
    except (binascii.Error, ValueError):
        return None


def _make_rounded_square_photo_png(raw_bytes: bytes, size_px: int = 320, radius_ratio: float = 0.07) -> Optional[bytes]:
    try:
        from PIL import Image as PILImage, ImageDraw
    except ImportError:
        return None
    try:
        src = PILImage.open(io.BytesIO(raw_bytes)).convert("RGBA")
    except Exception:
        return None
    w, h = src.size
    side = min(w, h)
    left, top = (w - side) // 2, (h - side) // 2
    src = src.crop((left, top, left + side, top + side)).resize((size_px, size_px))
    mask = PILImage.new("L", (size_px, size_px), 0)
    draw = ImageDraw.Draw(mask)
    radius = int(size_px * radius_ratio)
    draw.rounded_rectangle((0, 0, size_px, size_px), radius=radius, fill=255)
    out = PILImage.new("RGBA", (size_px, size_px))
    out.paste(src, (0, 0), mask=mask)
    buf = io.BytesIO()
    out.save(buf, format="PNG")
    return buf.getvalue()


def _prepare_photo_reader(photo_base64: str):
    raw = _decode_image_bytes(photo_base64)
    if raw is None:
        return None
    png_bytes = _make_rounded_square_photo_png(raw)
    if png_bytes is None:
        return None
    return ImageReader(io.BytesIO(png_bytes))


# Cache the prepared logo (decode + resize math) by content hash. The
# brand logo is the SAME file on every single CV generated across the
# whole app -- with this cache, that decode/measure work happens once per
# process instead of once per CV.
_logo_cache: dict[str, tuple] = {}

# Cache the rounded-square photo conversion (PIL crop + mask + resize) by
# content hash. Real payoff when the same user's CV is regenerated for a
# different target_domain in the same session -- their photo doesn't need
# reprocessing each time.
_photo_cache: dict[str, Optional[ImageReader]] = {}

# Same idea for QR codes -- encoding a URL is deterministic, so cache the
# rendered PNG reader by URL hash.
_qr_cache: dict[str, Optional[ImageReader]] = {}


def _prepare_logo_cached(logo_base64: str):
    key = hashlib.md5(logo_base64.encode("ascii", "ignore")).hexdigest()
    if key not in _logo_cache:
        _logo_cache[key] = _prepare_logo(logo_base64)
    return _logo_cache[key]


def _prepare_photo_reader_cached(photo_base64: str):
    key = hashlib.md5(photo_base64.encode("ascii", "ignore")).hexdigest()
    if key not in _photo_cache:
        _photo_cache[key] = _prepare_photo_reader(photo_base64)
    return _photo_cache[key]


def _make_qr_png_bytes(url: str) -> Optional[bytes]:
    """Render a URL as a maroon-on-white QR PNG. Returns None if the
    optional qrcode dependency isn't installed -- the CV simply omits the
    QR chip in that case."""
    try:
        import qrcode
    except ImportError:
        return None
    try:
        qr = qrcode.QRCode(
            box_size=8,
            border=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
        )
        qr.add_data(url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="#800000", back_color="white").convert("RGB")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        return buf.getvalue()
    except Exception:
        return None


def _prepare_qr_cached(url: str):
    key = hashlib.md5(url.encode("utf-8", "ignore")).hexdigest()
    if key not in _qr_cache:
        png = _make_qr_png_bytes(url)
        _qr_cache[key] = ImageReader(io.BytesIO(png)) if png else None
    return _qr_cache[key]


def _prepare_logo(logo_base64: str):
    raw = _decode_image_bytes(logo_base64)
    if raw is None:
        return None
    try:
        reader = ImageReader(io.BytesIO(raw))
        px_w, px_h = reader.getSize()
    except Exception:
        return None
    max_h, max_w = 0.26 * inch, 0.34 * inch
    ratio = min(max_w / px_w, max_h / px_h)
    return reader, px_w * ratio, px_h * ratio


def _draw_paragraph(cnv, text: str, x: float, y_top: float, width: float, style: ParagraphStyle) -> float:
    para = Paragraph(text, style)
    w, h = para.wrap(width, PAGE_HEIGHT)
    para.drawOn(cnv, x, y_top - h)
    return h


def _measure_paragraph(text: str, width: float, style: ParagraphStyle):
    para = Paragraph(text, style)
    _, h = para.wrap(width, PAGE_HEIGHT)
    return para, h


def _centered_text(cnv, text: str, cx: float, y: float, font: str, size: float, color) -> None:
    cnv.setFillColor(color)
    cnv.setFont(font, size)
    w = pdfmetrics.stringWidth(text, font, size)
    cnv.drawString(cx - w / 2, y, text)


def _first_name(full_name: str) -> str:
    return full_name.strip().split(" ")[0] if full_name.strip() else "there"


def _script_title(cnv, text: str, x: float, y: float, color, size=15) -> None:
    """Script-font section heading -- plain text, exactly like the reference."""
    cnv.setFillColor(color)
    cnv.setFont(_script_font(), size)
    cnv.drawString(x, y, text)


MAIN_SECTIONS = {SECTION_SUMMARY, SECTION_PROJECTS, SECTION_INTERNSHIPS, SECTION_LANGUAGES, SECTION_INTERESTS, SECTION_ACHIEVEMENTS}

# Auto-fit ladder: first pass renders at natural size; if any column ran
# out of room, later passes tighten type/spacing down to 80%. Geometry,
# colors and the design itself never change.
SCALE_LADDER = (1.00, 0.96, 0.92, 0.88, 0.84, 0.80)

# Language proficiency levels -> bar fill fractions (order matters:
# longest phrase match wins so "Upper Intermediate" beats "Intermediate").
_LEVEL_FRACTIONS = [
    ("native", 1.00),
    ("mother tongue", 1.00),
    ("advanced", 0.88),
    ("upper intermediate", 0.72),
    ("proficient", 0.78),
    ("professional", 0.72),
    ("full professional", 0.82),
    ("fluent", 0.78),
    ("conversational", 0.52),
    ("intermediate", 0.55),
    ("working knowledge", 0.48),
    ("elementary", 0.32),
    ("limited", 0.30),
    ("basic", 0.28),
    ("beginner", 0.22),
]

LEVEL_BAR_COLORS = [
    PANEL_RED,
    colors.HexColor("#9A2B2B"),
    colors.HexColor("#A84A4A"),
    colors.HexColor("#B46464"),
]


def _level_fraction(level: str) -> float:
    lvl = (level or "").strip().lower()
    if not lvl:
        return 0.60
    for phrase, frac in _LEVEL_FRACTIONS:
        if phrase in lvl:
            return frac
    return 0.60


def _initials(full_name: str) -> str:
    parts = [p for p in full_name.strip().split() if p]
    if len(parts) >= 2:
        return (parts[0][0] + parts[-1][0]).upper()
    return (parts[0][:2].upper() if parts else "SK")


def _render_once(
    profile: NormalizedProfile,
    plan: CVLayoutPlan,
    logo_base64: str | None,
    target_domain_label: str,
    scale: float,
) -> Tuple[io.BytesIO, bool]:
    """
    One full render pass at the given type scale. Returns (buffer, overflowed)
    where `overflowed` means some content didn't fit and the caller should
    retry tighter.
    """

    def fs(v: float) -> float:
        """Scale a type/spacing value for this pass."""
        return v * scale

    buffer = io.BytesIO()
    cnv = canvas_module.Canvas(buffer, pagesize=PAGE_SIZE)
    cnv.setTitle(f"{profile.full_name} - CV")
    cnv.setAuthor(profile.full_name)

    # --- Page background ---
    cnv.setFillColor(CREAM)
    cnv.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=1, stroke=0)

    # --- Column geometry ---
    content_w = PAGE_WIDTH - 2 * MARGIN
    sidebar_w = content_w * 0.40
    sidebar_x = MARGIN
    main_x = MARGIN + sidebar_w + 18
    main_w = PAGE_WIDTH - MARGIN - main_x
    panel_bottom = MARGIN

    # --- Top bar: "CV" wordmark (left) + domain pill (right) ---
    top_y = PAGE_HEIGHT - MARGIN - 6
    _draw_star(cnv, MARGIN + 5, top_y - 6, 7, PANEL_RED)
    cnv.setFillColor(PANEL_RED)
    cnv.setFont(_script_font(), fs(20))
    cnv.drawString(MARGIN + 16, top_y - fs(12), "CV")

    pill_x = PAGE_WIDTH - MARGIN  # default if no domain label
    if target_domain_label:
        font = _body_font("bold")
        text_w = pdfmetrics.stringWidth(target_domain_label, font, fs(10))
        pill_w = text_w + 22
        pill_x = PAGE_WIDTH - MARGIN - pill_w
        pill_y = top_y - fs(18)
        _round_rect(cnv, pill_x, pill_y, pill_w, fs(23), radius=fs(23) / 2, fill_color=PANEL_RED)
        cnv.setFillColor(WHITE)
        cnv.setFont(font, fs(10))
        cnv.drawString(pill_x + 11, pill_y + fs(7), target_domain_label)

    content_top = top_y - fs(32)

    # =====================================================================
    # SIDEBAR: photo block -> contact card -> maroon panel with sections
    # =====================================================================
    photo = _prepare_photo_reader_cached(profile.photo_base64) if profile.photo_base64 else None
    block = 146
    block_x = sidebar_x + 4
    block_top = content_top - 2

    if photo is not None:
        # Maroon rounded-square backdrop with the photo seated inside it.
        _card_shadow(cnv, block_x, block_top - block, block, block, radius=14)
        _round_rect(cnv, block_x, block_top - block, block, block, radius=14, fill_color=PANEL_RED)
        inset = 7
        cnv.drawImage(photo, block_x + inset, block_top - block + inset,
                      width=block - 2 * inset, height=block - 2 * inset, mask="auto")
    else:
        # No photo uploaded: a matching maroon monogram block keeps the
        # layout (and the overlapping name/year pills) intact.
        _card_shadow(cnv, block_x, block_top - block, block, block, radius=14)
        _round_rect(cnv, block_x, block_top - block, block, block, radius=14, fill_color=PANEL_RED)
        _round_rect(cnv, block_x + 7, block_top - block + 7, block - 14, block - 14,
                    radius=10, fill_color=colors.HexColor("#8E2020"))
        initials = _initials(profile.full_name)
        mono_size = fs(44) if len(initials) <= 2 else fs(34)
        _centered_text(cnv, initials, block_x + block / 2, block_top - block / 2 - mono_size * 0.35,
                       _script_font(), mono_size, WHITE)
        _draw_star(cnv, block_x + block - 26, block_top - 26, 8, SUBHEAD_ON_RED)

    # Name pill overlapping the LEFT edge of the photo/monogram block --
    # shown whenever we have a name, photo or not.
    name_label = profile.full_name.strip() or "Name"
    nf, ns = _body_font("semibold"), fs(9)
    if pdfmetrics.stringWidth(name_label, nf, ns) > block * 0.78:
        ns = fs(8)
    nw = pdfmetrics.stringWidth(name_label, nf, ns) + 18
    nh = fs(18)
    npx = block_x - nw * 0.32
    npy = block_top - block * 0.46
    _round_rect(cnv, npx, npy, nw, nh, radius=nh / 2, fill_color=WHITE, stroke_color=ACCENT_RED, line_width=1.0)
    cnv.setFillColor(ACCENT_RED)
    cnv.setFont(nf, ns)
    cnv.drawString(npx + 9, npy + nh * 0.28, name_label)

    # Graduation-year pill overlapping the RIGHT edge, slightly lower.
    year_label = (profile.graduation_year or "").strip()
    if year_label:
        yf, ys = _body_font("semibold"), fs(9)
        yw = pdfmetrics.stringWidth(year_label, yf, ys) + 18
        yh = fs(18)
        ypx = block_x + block - yw * 0.68
        ypy = block_top - block * 0.74
        _round_rect(cnv, ypx, ypy, yw, yh, radius=yh / 2, fill_color=PANEL_RED)
        cnv.setFillColor(WHITE)
        cnv.setFont(yf, ys)
        cnv.drawString(ypx + 9, ypy + yh * 0.28, year_label)

    cursor_y = block_top - block - fs(18)

    # --- Contact white card ---
    contact_lines: List[str] = []
    if profile.phone:
        contact_lines.append(profile.phone)
    if profile.email:  # only when actually present -- no blank rows
        contact_lines.append(profile.email)
    if profile.linkedin_url:
        contact_lines.append(_shorten_link(profile.linkedin_url))
    if profile.github_url:
        contact_lines.append(_shorten_link(profile.github_url))
    if profile.portfolio_url:
        contact_lines.append(_shorten_link(profile.portfolio_url))

    overflowed = False
    if contact_lines:
        contact_style = ParagraphStyle(
            "ContactLine", fontName=_body_font("semibold"), fontSize=fs(8), leading=fs(12.5),
            textColor=ACCENT_RED, alignment=TA_CENTER,
        )
        contact_pad = 10
        contact_w = sidebar_w
        contact_x = sidebar_x
        contact_text = "<br/>".join(contact_lines)
        _, contact_text_h = _measure_paragraph(contact_text, contact_w - 2 * contact_pad, contact_style)
        heading_h = fs(24)
        contact_h = contact_text_h + 2 * contact_pad + heading_h
        contact_y = cursor_y - contact_h
        _card_shadow(cnv, contact_x, contact_y, contact_w, contact_h, radius=12)
        _round_rect(cnv, contact_x, contact_y, contact_w, contact_h, radius=12, fill_color=WHITE, stroke_color=ACCENT_RED, line_width=1.1)
        _centered_text(cnv, "Contact", contact_x + contact_w / 2, contact_y + contact_h - heading_h + 7,
                       _script_font(), fs(15), PANEL_RED)
        _draw_paragraph(cnv, contact_text, contact_x + contact_pad, contact_y + contact_h - heading_h,
                        contact_w - 2 * contact_pad, contact_style)
        cursor_y = contact_y - fs(20)

    # --- Deep maroon rounded panel with drop shadow ---
    panel_top = cursor_y
    panel_h = panel_top - panel_bottom
    _card_shadow(cnv, sidebar_x, panel_bottom, sidebar_w, panel_h, radius=24, offset=4, alpha=0.25)
    _round_rect(cnv, sidebar_x, panel_bottom, sidebar_w, panel_h, radius=24, fill_color=PANEL_RED)

    inner_x = sidebar_x + 18
    inner_w = sidebar_w - 36
    cursor_y = panel_top - fs(24)

    body_on_red = ParagraphStyle("BodyOnRed", fontName=_body_font(), fontSize=fs(8.5), leading=fs(12.5), textColor=TEXT_ON_RED)

    # Fixed display order inside the panel (matches the reference template):
    # Education -> Technical Skills -> Certifications -> Soft Skills.
    _present = set(plan.section_order)
    sidebar_keys = [
        k for k in (SECTION_EDUCATION, SECTION_SKILLS, SECTION_CERTIFICATIONS, SECTION_SOFT_SKILLS)
        if k in _present
    ]

    for key in sidebar_keys:
        if cursor_y < panel_bottom + fs(24):
            overflowed = True
            break

        if key == SECTION_EDUCATION and (profile.college or profile.degree):
            _script_title(cnv, "Education", inner_x, cursor_y, WHITE, size=fs(15))
            cursor_y -= fs(20)

            # Year column on the left (script font, like the reference),
            # description text to the right of it.
            year_col_w = 64
            year_text = profile.graduation_year or ""
            desc_text = profile.degree or "Education"
            if profile.college:
                desc_text += f"<br/>From,<br/>{profile.college}"

            desc_style = ParagraphStyle("EduDesc", fontName=_body_font("semibold"), fontSize=fs(8.5), leading=fs(12.5), textColor=WHITE)
            _, desc_h = _measure_paragraph(desc_text, inner_w - year_col_w, desc_style)

            row_y = cursor_y
            if year_text:
                _draw_star(cnv, inner_x + 4, row_y - 6, 5, SUBHEAD_ON_RED)
                cnv.setFillColor(WHITE)
                cnv.setFont(_script_font(), fs(11.5))
                cnv.drawString(inner_x + 12, row_y - fs(8), year_text)
            _draw_paragraph(cnv, desc_text, inner_x + year_col_w, row_y, inner_w - year_col_w, desc_style)
            cursor_y = row_y - max(desc_h, fs(16)) - fs(20)

        elif key == SECTION_SKILLS and profile.has_skills():
            _script_title(cnv, "Technical Skills", inner_x, cursor_y, WHITE, size=fs(15))
            cursor_y -= fs(22)

            categories = [cat for cat in profile.skills if cat.items]

            # "Software Skills" -> app-icon badges (first category, capped).
            if categories:
                cnv.setFillColor(SUBHEAD_ON_RED)
                cnv.setFont(_body_font("semibold"), fs(9))
                cnv.drawString(inner_x, cursor_y, "Software Skills")
                cursor_y -= fs(15)
                first_items = categories[0].items[:8]
                consumed = _flow_icon_badges(cnv, first_items, inner_x, cursor_y, inner_w,
                                             size=fs(27), gap=fs(8))
                cursor_y -= consumed + fs(8)

                # "Other Skills" -> dash list from the next category.
                other_items: List[str] = []
                for cat in categories[1:]:
                    other_items.extend(cat.items)
                if not other_items and len(categories[0].items) > 8:
                    other_items = categories[0].items[8:]
                if other_items:
                    cnv.setFillColor(SUBHEAD_ON_RED)
                    cnv.setFont(_body_font("semibold"), fs(9))
                    cnv.drawString(inner_x, cursor_y, "Other Skills")
                    cursor_y -= fs(14)
                    dash_lines = ["- " + item for item in other_items[:6]]
                    h = _draw_paragraph(cnv, "<br/>".join(dash_lines), inner_x, cursor_y, inner_w, body_on_red)
                    cursor_y -= h + fs(8)

                # Remaining categories become pill tags, like the reference's
                # Branding / Website Design / Copy Writing row.
                extra_items: List[str] = []
                for cat in categories[2:]:
                    extra_items.extend(cat.items)
                if extra_items:
                    consumed = _flow_pills(
                        cnv, extra_items, inner_x, cursor_y, inner_w,
                        _body_font(), fs(8), ACCENT_RED, WHITE, border_color=ACCENT_RED,
                        line_gap=fs(6), item_gap=fs(6),
                    )
                    cursor_y -= consumed
            cursor_y -= fs(12)

        elif key == SECTION_CERTIFICATIONS and profile.has_certifications():
            _script_title(cnv, "Certifications", inner_x, cursor_y, WHITE, size=fs(15))
            cursor_y -= fs(20)
            lines = []
            for cert in profile.certifications:
                bit = cert.name
                if cert.issuer:
                    bit += f" &mdash; {cert.issuer}"
                lines.append(bit)
            h = _draw_paragraph(cnv, "<br/>".join(lines), inner_x, cursor_y, inner_w, body_on_red)
            cursor_y -= h + fs(16)

        elif key == SECTION_SOFT_SKILLS and profile.has_soft_skills():
            _script_title(cnv, "Soft Skills", inner_x, cursor_y, WHITE, size=fs(15))
            cursor_y -= fs(20)
            h = _draw_paragraph(cnv, ", ".join(profile.soft_skills), inner_x, cursor_y, inner_w, body_on_red)
            cursor_y -= h + fs(14)

    # --- QR chip at the foot of the sidebar (portfolio / LinkedIn / GitHub) ---
    qr_target = profile.portfolio_url or profile.linkedin_url or profile.github_url
    if qr_target:
        qr_reader = _prepare_qr_cached(qr_target)
        if qr_reader is not None:
            chip_w = sidebar_w - 36
            chip_h = fs(84)
            if cursor_y - chip_h >= panel_bottom + fs(12):
                chip_x = sidebar_x + 18
                chip_y = cursor_y - chip_h
                _round_rect(cnv, chip_x, chip_y, chip_w, chip_h, radius=10, fill_color=WHITE)
                qr_side = chip_h - fs(26)
                cnv.drawImage(qr_reader, chip_x + (chip_w - qr_side) / 2,
                              chip_y + fs(16), qr_side, qr_side)
                _centered_text(cnv, "Scan My Portfolio", chip_x + chip_w / 2, chip_y + fs(6),
                               _script_font(), fs(10), PANEL_RED)
                cursor_y = chip_y - fs(8)
            else:
                overflowed = True

    # =====================================================================
    # MAIN COLUMN: headline, summary, experience card, projects,
    # achievements, languages card, interest card
    # =====================================================================
    main_cursor = content_top
    first_name = _first_name(profile.full_name)

    headline_style = ParagraphStyle("Headline", fontName=_script_font(), fontSize=fs(27), leading=fs(31), textColor=PANEL_RED)

    hello_text = "Hello,"
    _, hello_h = _measure_paragraph(hello_text, main_w, headline_style)
    _draw_paragraph(cnv, hello_text, main_x, main_cursor, main_w, headline_style)
    hello_w = pdfmetrics.stringWidth(hello_text, _script_font(), fs(27))
    _draw_star(cnv, main_x + hello_w + fs(20), main_cursor - hello_h * 0.52, fs(12), PANEL_RED)
    main_cursor -= hello_h - 2

    _, name_h = _measure_paragraph(f"I'm {first_name}!", main_w, headline_style)
    _draw_paragraph(cnv, f"I'm {first_name}!", main_x, main_cursor, main_w, headline_style)
    main_cursor -= name_h

    # Optional professional headline from the profile, as an italic tagline.
    tagline = (profile.headline or "").strip()
    if tagline:
        tagline_style = ParagraphStyle(
            "Tagline", fontName=_body_font("italic"), fontSize=fs(9.5),
            leading=fs(13), textColor=TEXT_SOFT,
        )
        _, th = _measure_paragraph(tagline, main_w, tagline_style)
        _draw_paragraph(cnv, tagline, main_x, main_cursor - fs(2), main_w, tagline_style)
        main_cursor -= th + fs(6)
    main_cursor -= fs(10)

    quote_style = ParagraphStyle(
        "Quote", fontName=_body_font(), fontSize=fs(9), leading=fs(12.8),
        textColor=TEXT_DARK, alignment=TA_JUSTIFY,
    )
    main_keys = [k for k in plan.section_order if k in MAIN_SECTIONS]
    expected_main_sections = sum(
        1 for k in main_keys if k != SECTION_SUMMARY
    )
    rendered_main_sections = 0

    for key in main_keys:
        if main_cursor < panel_bottom + fs(20):
            overflowed = True
            break

        if key == SECTION_SUMMARY:
            quote_text = f"&ldquo;{plan.summary_text}&rdquo;"
            h = _draw_paragraph(cnv, quote_text, main_x, main_cursor, main_w, quote_style)
            main_cursor -= h + fs(16)

        elif key == SECTION_INTERNSHIPS and profile.has_internships():
            block_lines = []
            for job in profile.internships:
                block_lines.append(("title", f"<b>{job.role} &mdash; {job.company}</b>"))
                if job.duration:
                    block_lines.append(("sub", f"<i>{job.duration}</i>"))
                for hl in job.highlights:
                    block_lines.append(("bullet", hl))

            title_style = ParagraphStyle("ExpTitle", fontName=_body_font(), fontSize=fs(9.5), leading=fs(13.5), textColor=TEXT_DARK)
            sub_style = ParagraphStyle("ExpSub", fontName=_body_font("italic"), fontSize=fs(8.5), leading=fs(12), textColor=TEXT_SOFT)
            bullet_style = ParagraphStyle("ExpBullet", fontName=_body_font(), fontSize=fs(9), leading=fs(13), textColor=TEXT_DARK)
            style_map = {"title": title_style, "sub": sub_style, "bullet": bullet_style}

            # Pass 1: measure every line WITHOUT drawing, so the card's
            # background can be painted BEFORE any text.
            measured = []
            for kind, text in block_lines:
                x_off = fs(16) if kind == "bullet" else fs(2)
                avail_width = main_w - fs(30) - x_off
                para, h = _measure_paragraph(text, avail_width, style_map[kind])
                measured.append((kind, para, h, x_off))

            # Link pills at the foot of the card (LinkedIn / GitHub /
            # Portfolio), mirroring the reference's Freelance / Youtube pills.
            link_labels: List[str] = []
            if profile.linkedin_url:
                link_labels.append("LinkedIn")
            if profile.github_url:
                link_labels.append("GitHub")
            if profile.portfolio_url:
                link_labels.append("Portfolio")

            # Reserve room for a small QR tile beside the link pills.
            has_qr = qr_target is not None and _prepare_qr_cached(qr_target) is not None
            qr_zone = (fs(62) if link_labels or has_qr else 0) if has_qr else 0
            pills_zone = (fs(30) if link_labels else 0) + qr_zone

            total_text_h = sum(h + 2 for _, _, h, _ in measured)
            inner_top = main_cursor - fs(38)
            card_bottom = inner_top - total_text_h - 10 - pills_zone
            card_h = main_cursor - card_bottom
            if card_bottom < panel_bottom + fs(12):
                overflowed = True
                continue
            rendered_main_sections += 1

            # Pass 2: shadow + card background + heading, THEN text.
            _card_shadow(cnv, main_x, card_bottom, main_w, card_h, radius=16)
            _round_rect(cnv, main_x, card_bottom, main_w, card_h, radius=16, fill_color=WHITE, stroke_color=ACCENT_RED, line_width=1.2)
            _centered_text(cnv, "Experience", main_x + main_w / 2, main_cursor - fs(29), _script_font(), fs(15), PANEL_RED)

            y = inner_top
            for kind, para, h, x_off in measured:
                if kind == "bullet":
                    _draw_star(cnv, main_x + fs(21), y - 5, fs(4.5), PANEL_RED)
                para.drawOn(cnv, main_x + fs(15) + x_off, y - h)
                y -= h + fs(3)

            footer_base = card_bottom + fs(12)
            if link_labels:
                pill_y = footer_base + (qr_zone if qr_zone else 0)
                px = main_x + fs(22)
                for label in link_labels:
                    w = _pill(cnv, px, pill_y, label, _body_font("semibold"), fs(8.5), WHITE, PANEL_RED,
                              pad_x=fs(8), pad_y=fs(4))
                    px += w + fs(10)

            if has_qr:
                qr_tile = fs(52)
                qx = main_x + main_w - qr_tile - fs(16)
                qy = card_bottom + fs(10)
                _round_rect(cnv, qx, qy, qr_tile, qr_tile, radius=6, fill_color=WHITE, stroke_color=TRACK_TINT, line_width=0.8)
                cnv.drawImage(_prepare_qr_cached(qr_target), qx + 4, qy + 4, qr_tile - 8, qr_tile - 8)

            main_cursor = card_bottom - fs(17)

        elif key == SECTION_PROJECTS and profile.has_projects():
            _script_title(cnv, "Projects", main_x, main_cursor, PANEL_RED, size=fs(15))
            main_cursor -= fs(20)
            proj_title_style = ParagraphStyle("ProjTitle", fontName=_body_font(), fontSize=fs(9), leading=fs(13), textColor=TEXT_DARK)
            proj_desc_style = ParagraphStyle("ProjDesc", fontName=_body_font(), fontSize=fs(8.5), leading=fs(12.5), textColor=TEXT_DARK)
            rendered_main_sections += 1
            for proj in profile.projects:
                title = f"<b>{proj.title}</b>"
                if proj.link:
                    title += f" &mdash; <font color='#8B0000'>{_shorten_link(proj.link)}</font>"
                h = _draw_paragraph(cnv, title, main_x + fs(14), main_cursor, main_w - fs(14), proj_title_style)
                main_cursor -= h + fs(2)
                if proj.description:
                    h = _draw_paragraph(cnv, proj.description, main_x + fs(14), main_cursor, main_w - fs(14), proj_desc_style)
                    main_cursor -= h + fs(4)
                if proj.tech_stack:
                    consumed = _flow_pills(cnv, proj.tech_stack, main_x + fs(14), main_cursor, main_w - fs(14),
                                           _body_font(), fs(7.5), WHITE, PANEL_RED,
                                           line_gap=fs(6), item_gap=fs(6))
                    main_cursor -= consumed
                main_cursor -= fs(14)

        elif key == SECTION_LANGUAGES and profile.has_languages():
            langs = profile.languages
            any_level = any(lang.level for lang in langs)

            title_zone = fs(46)
            row_h = fs(38) if any_level else fs(20)
            body_h = row_h * len(langs)
            card_h = title_zone + body_h + fs(12)
            card_bottom = main_cursor - card_h
            if card_bottom < panel_bottom + fs(12):
                overflowed = True
                continue
            rendered_main_sections += 1

            _card_shadow(cnv, main_x, card_bottom, main_w, card_h, radius=16)
            _round_rect(cnv, main_x, card_bottom, main_w, card_h, radius=16, fill_color=WHITE, stroke_color=ACCENT_RED, line_width=1.2)
            _centered_text(cnv, "Languages", main_x + main_w / 2, main_cursor - fs(26), _script_font(), fs(15), PANEL_RED)

            col_w = main_w / max(len(langs), 1)
            row_y = main_cursor - fs(50)
            bar_w = min(col_w - fs(24), fs(70))
            for i, lang in enumerate(langs):
                cx = main_x + col_w * i + col_w / 2
                _centered_text(cnv, lang.name, cx, row_y, _script_font(), fs(13), PANEL_RED)
                if lang.level:
                    frac = _level_fraction(lang.level)
                    _centered_text(cnv, lang.level, cx, row_y - fs(13), _body_font(), fs(8), TEXT_SOFT)
                    bx = cx - bar_w / 2
                    by = row_y - fs(24)
                    _round_rect(cnv, bx, by, bar_w, fs(4.5), radius=fs(2.2), fill_color=TRACK_TINT)
                    _round_rect(cnv, bx, by, max(bar_w * frac, fs(4.5)), fs(4.5), radius=fs(2.2), fill_color=PANEL_RED)
                row_y -= row_h

            main_cursor = card_bottom - fs(17)

        elif key == SECTION_INTERESTS and profile.has_interests():
            item_style = ParagraphStyle("InterestLine", fontName=_body_font(), fontSize=fs(9), leading=fs(13), textColor=TEXT_DARK)
            measured_items = []
            for item in profile.interests:
                para, h = _measure_paragraph(item, main_w - fs(48), item_style)
                measured_items.append((para, h))

            pill_font, pill_size = _script_font(), fs(13)
            pill_w = pdfmetrics.stringWidth("Interest", pill_font, pill_size) + fs(30)
            pill_h = fs(22)
            top_pad, gap_after_pill, bottom_pad = fs(10), fs(12), fs(10)
            items_h = sum(h + fs(4) for _, h in measured_items)
            card_h = top_pad + pill_h + gap_after_pill + items_h + bottom_pad
            card_bottom = main_cursor - card_h
            if card_bottom < panel_bottom + fs(12):
                overflowed = True
                continue
            rendered_main_sections += 1

            _card_shadow(cnv, main_x, card_bottom, main_w, card_h, radius=16)
            _round_rect(cnv, main_x, card_bottom, main_w, card_h, radius=16, fill_color=WHITE, stroke_color=ACCENT_RED, line_width=1.2)

            # Maroon "Interest" pill badge, centred at the top of the card.
            pill_x = main_x + (main_w - pill_w) / 2
            pill_y = main_cursor - top_pad - pill_h
            _round_rect(cnv, pill_x, pill_y, pill_w, pill_h, radius=pill_h / 2, fill_color=PANEL_RED)
            cnv.setFillColor(WHITE)
            cnv.setFont(pill_font, pill_size)
            cnv.drawString(pill_x + fs(15), pill_y + fs(5.5), "Interest")

            y = pill_y - gap_after_pill
            for para, h in measured_items:
                _draw_star(cnv, main_x + fs(24), y - 5, fs(4.5), PANEL_RED)
                para.drawOn(cnv, main_x + fs(32), y - h)
                y -= h + fs(4)

            main_cursor = card_bottom - fs(17)

        elif key == SECTION_ACHIEVEMENTS and profile.has_achievements():
            _script_title(cnv, "Achievements", main_x, main_cursor, PANEL_RED, size=fs(15))
            main_cursor -= fs(20)
            ach_style = ParagraphStyle("AchLine", fontName=_body_font(), fontSize=fs(9), leading=fs(13), textColor=TEXT_DARK)
            rendered_main_sections += 1
            for item in profile.achievements:
                _draw_star(cnv, main_x + fs(6), main_cursor - 5, fs(4.5), PANEL_RED)
                h = _draw_paragraph(cnv, item, main_x + fs(16), main_cursor, main_w - fs(16), ach_style)
                main_cursor -= h + fs(16)

    if rendered_main_sections < expected_main_sections:
        overflowed = True

    # --- Branded footer: thin rule + tagline on the cream margin strip ---
    rule_y = 16
    cnv.setStrokeColor(TRACK_TINT)
    cnv.setLineWidth(0.8)
    cnv.line(MARGIN, rule_y, PAGE_WIDTH - MARGIN, rule_y)
    stamp = _dt.datetime.now().strftime("%b %Y")
    footer_bits = ["Generated with Skillify"]
    if target_domain_label:
        footer_bits.append(target_domain_label)
    footer_bits.append(stamp)
    footer_text = "  •  ".join(footer_bits)
    _centered_text(cnv, footer_text, PAGE_WIDTH / 2, 5.5, _body_font(), 6.5, TEXT_SOFT)

    # --- Brand logo: bottom-right corner, above the footer rule, always on
    # the plain cream background (never on top of the colored panel/cards) ---
    logo = _prepare_logo_cached(logo_base64) if logo_base64 else None
    if logo is not None:
        reader, lw, lh = logo
        logo_x = PAGE_WIDTH - MARGIN - lw
        logo_y = rule_y + 2
        cnv.drawImage(reader, logo_x, logo_y, width=lw, height=lh, mask="auto", preserveAspectRatio=True)

    cnv.showPage()
    cnv.save()
    buffer.seek(0)
    return buffer, overflowed


def _shorten_link(url: str, max_len: int = 42) -> str:
    """Trim scheme + long paths so contact-card links stay on one line."""
    cleaned = url.split("://", 1)[-1]
    cleaned = cleaned.rstrip("/")
    if len(cleaned) <= max_len:
        return cleaned
    return cleaned[: max_len - 3] + "..."


def build_cv_pdf(
    profile: NormalizedProfile,
    plan: CVLayoutPlan,
    logo_base64: str | None = None,
    target_domain_label: str = "",
) -> io.BytesIO:
    """Render the CV, auto-shrinking type if the content overflows one page."""
    _register_fonts()

    buffer = io.BytesIO()
    overflowed = True
    for scale in SCALE_LADDER:
        buffer, overflowed = _render_once(profile, plan, logo_base64, target_domain_label, scale)
        if not overflowed:
            break
    return buffer

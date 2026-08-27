"""
sample_data.py
Demo dataset loader for smoke-testing the CV pipeline without real app
data. Reads `data/sample_profiles.json` (six diverse profiles across
domains), generates a colored initials avatar for each profile at load
time, and hands them out either randomly or by id.

Used by:
    GET /api/v1/cv/demo/random    -- random sample -> PDF
    GET /api/v1/cv/demo/profiles  -- list what's in the dataset

This module is deliberately separate from the production path: your app's
real account data never touches it.
"""

from __future__ import annotations

import base64
import io
import json
import os
import random
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from schemas import TargetDomain

DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "sample_profiles.json")

# Pleasant avatar backdrop colors (hex), cycled deterministically per id.
AVATAR_COLORS = [
    "#2F3E5C",  # slate blue
    "#2F6B5C",  # teal green
    "#3E6B5C",  # sea green
    "#5C4A2F",  # warm brown
    "#4A2F5C",  # plum
    "#5C2F3E",  # wine
]


@dataclass(frozen=True)
class DemoProfile:
    """One dataset entry, ready for the generator."""

    id: str
    default_domain: TargetDomain
    profile: Dict[str, Any]


def _initials(full_name: str) -> str:
    parts = [p for p in full_name.strip().split() if p]
    if len(parts) >= 2:
        return (parts[0][0] + parts[-1][0]).upper()
    return parts[0][:2].upper() if parts else "SK"


def _avatar_base64(initials: str, bg_hex: str) -> str:
    """Render an initials avatar PNG as base64 -- stands in for the user's
    uploaded photo so the photo slot of the CV gets exercised too."""
    from PIL import Image, ImageDraw, ImageFont

    size = 320
    img = Image.new("RGB", (size, size), bg_hex)
    draw = ImageDraw.Draw(img)

    font = None
    for candidate in (
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts", "Poppins-Bold.ttf"),
        "DejaVuSans-Bold.ttf",
    ):
        try:
            font = ImageFont.truetype(candidate, 110)
            break
        except Exception:
            continue
    if font is None:
        font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), initials, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((size - tw) / 2 - bbox[0], (size - th) / 2 - bbox[1]), initials, fill="white", font=font)

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("ascii")


def _load_dataset() -> List[DemoProfile]:
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        raw = json.load(f)

    entries: List[DemoProfile] = []
    for i, entry in enumerate(raw["profiles"]):
        profile: Dict[str, Any] = dict(entry["profile"])
        color_index = sum(entry["id"].encode()) % len(AVATAR_COLORS)
        profile.setdefault("photo_base64", _avatar_base64(_initials(profile["full_name"]), AVATAR_COLORS[color_index]))
        entries.append(
            DemoProfile(
                id=entry["id"],
                default_domain=TargetDomain(entry["default_domain"]),
                profile=profile,
            )
        )
    return entries


_DATASET: Optional[List[DemoProfile]] = None


def _dataset() -> List[DemoProfile]:
    global _DATASET
    if _DATASET is None:
        _DATASET = _load_dataset()
    return _DATASET


def list_demo_profiles() -> List[Dict[str, str]]:
    """Dataset index for the /demo/profiles endpoint."""
    return [
        {
            "id": p.id,
            "full_name": p.profile["full_name"],
            "default_domain": p.default_domain.value,
        }
        for p in _dataset()
    ]


def get_demo_profile_by_id(profile_id: str) -> Optional[DemoProfile]:
    for p in _dataset():
        if p.id == profile_id:
            return p
    return None


def get_random_demo_profile(profile_id: Optional[str] = None) -> DemoProfile:
    """Return the requested entry, or a RANDOM one when no id is given."""
    if profile_id:
        found = get_demo_profile_by_id(profile_id)
        if found is None:
            raise KeyError(profile_id)
        return found
    return random.choice(_dataset())

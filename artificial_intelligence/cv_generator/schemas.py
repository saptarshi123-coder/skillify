"""
schemas.py
Data contracts for the Skillify CV Generator module.

- TargetDomain: the 9 supported target domains.
- SkillCategory / Project / Internship / Certification / Achievement:
  internal building blocks used by repository.py, domain_engine.py and
  pdf_builder.py.
- ProfileRequest / CVGenerateRequest: the request body your app POSTs to
  /api/v1/cv/generate. Every field is optional except full_name and email,
  so an app can send exactly what its account model has. Validation caps
  keep payloads sane (and hostile payloads rejected with a clean 422).
"""

from __future__ import annotations

import base64
import binascii
import re
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator, model_validator

ALLOWED_IMAGE_TYPES = {"image/png", "image/jpeg", "image/jpg", "image/webp"}
# Decoded photo cap -- 5 MB is generous for a profile picture; anything
# larger would bloat the PDF far past A4 print quality anyway.
MAX_PHOTO_BYTES = 5 * 1024 * 1024


class TargetDomain(str, Enum):
    """Supported target domains for CV content prioritization."""

    SDE = "SDE"
    AI_ML = "AI/ML"
    DATA_SCIENCE = "Data Science"
    ENGINEERING = "Engineering"
    UI_UX = "UI/UX"
    VIDEOGRAPHY = "Videography"
    PHOTOGRAPHY = "Photography"
    WRITER = "Writer"
    MARKETING = "Marketing"


class SkillCategory(BaseModel):
    """A named group of skills, e.g. 'Languages': ['Python', 'Go']."""

    category: str = Field(min_length=1, max_length=60)
    items: List[str] = Field(default_factory=list, max_length=30)

    @field_validator("items")
    @classmethod
    def _clean_items(cls, v: List[str]) -> List[str]:
        return [i.strip()[:80] for i in v if isinstance(i, str) and i.strip()]


class Project(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    description: str = Field(default="", max_length=600)
    tech_stack: List[str] = Field(default_factory=list, max_length=15)
    link: Optional[str] = Field(default=None, max_length=300)

    @field_validator("tech_stack")
    @classmethod
    def _clean_stack(cls, v: List[str]) -> List[str]:
        return [i.strip()[:40] for i in v if isinstance(i, str) and i.strip()]


class Internship(BaseModel):
    company: str = Field(min_length=1, max_length=120)
    role: str = Field(min_length=1, max_length=120)
    duration: str = Field(default="", max_length=60)
    highlights: List[str] = Field(default_factory=list, max_length=8)

    @field_validator("highlights")
    @classmethod
    def _clean_highlights(cls, v: List[str]) -> List[str]:
        return [h.strip()[:220] for h in v if isinstance(h, str) and h.strip()]


class Certification(BaseModel):
    name: str = Field(min_length=1, max_length=140)
    issuer: Optional[str] = Field(default=None, max_length=120)
    year: Optional[str] = Field(default=None, max_length=10)


class Achievement(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    description: Optional[str] = Field(default=None, max_length=400)


class LanguageEntryIn(BaseModel):
    name: str = Field(min_length=1, max_length=40)
    level: str = Field(default="", max_length=20)


class ProfileRequest(BaseModel):
    """
    The profile payload your app sends. Mirrors what repository.normalize_raw_profile()
    understands, so the app can serialize its account/profile object almost as-is.

    photo_base64 accepts any of:
      - raw base64 image data
      - a data URI: "data:image/png;base64,iVBORw0KG..."
    """

    full_name: str = Field(..., min_length=2, max_length=80)
    email: str = Field(..., max_length=120)
    phone: Optional[str] = Field(default=None, max_length=30)
    linkedin_url: Optional[str] = Field(default=None, max_length=300)
    github_url: Optional[str] = Field(default=None, max_length=300)
    portfolio_url: Optional[str] = Field(default=None, max_length=300)
    college: Optional[str] = Field(default=None, max_length=140)
    degree: Optional[str] = Field(default=None, max_length=140)
    graduation_year: Optional[str] = Field(default=None, max_length=9)
    headline: Optional[str] = Field(default=None, max_length=90)
    photo_base64: Optional[str] = None

    languages: List[LanguageEntryIn] = Field(default_factory=list, max_length=6)
    interests: List[str] = Field(default_factory=list, max_length=10)
    soft_skills: List[str] = Field(default_factory=list, max_length=12)

    skills: List[SkillCategory] = Field(default_factory=list, max_length=8)
    projects: List[Project] = Field(default_factory=list, max_length=8)
    internships: List[Internship] = Field(default_factory=list, max_length=5)
    certifications: List[Certification] = Field(default_factory=list, max_length=8)
    achievements: List[Achievement] = Field(default_factory=list, max_length=8)

    @field_validator(
        "full_name", "email", "phone", "linkedin_url", "github_url",
        "portfolio_url", "college", "degree", "graduation_year", "headline",
    )
    @classmethod
    def _strip(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        v = v.strip()
        return v or None

    @field_validator("interests", "soft_skills")
    @classmethod
    def _clean_str_list(cls, v: List[str]) -> List[str]:
        return [i.strip()[:80] for i in v if isinstance(i, str) and i.strip()]

    @field_validator("email")
    @classmethod
    def _email_shape(cls, v: str) -> str:
        # Deliberately loose shape check -- pydantic's strict EmailStr would
        # reject some real-world addresses; we only need display validity.
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", v):
            raise ValueError("email must look like name@domain.tld")
        return v.lower()

    @field_validator("linkedin_url", "github_url", "portfolio_url")
    @classmethod
    def _url_scheme(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        if not re.match(r"^https?://", v, flags=re.IGNORECASE):
            v = f"https://{v}"
        return v

    @field_validator("graduation_year")
    @classmethod
    def _year_shape(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        if not re.match(r"^\d{4}(\s*-\s*\d{4})?$|^(19|20)\d{2}$", v):
            raise ValueError("graduation_year must be a year like 2026 or a range like 2023 - 2027")
        return v

    @field_validator("photo_base64")
    @classmethod
    def _validate_photo(cls, v: Optional[str]) -> Optional[str]:
        if v is None or not v.strip():
            return None

        data = v.strip()
        media_type = None
        if data.startswith("data:"):
            header, sep, payload = data.partition(",")
            if not sep:
                raise ValueError("photo_base64 data URI is malformed")
            match = re.match(r"^data:([-\w.+]+/[-\w.+]+);base64$", header)
            if match:
                media_type = match.group(1).lower()
            elif not header.endswith(";base64"):
                raise ValueError("photo_base64 data URI must be base64-encoded")
            data = payload

        try:
            raw = base64.b64decode(data, validate=True)
        except (binascii.Error, ValueError) as exc:
            raise ValueError("photo_base64 is not valid base64 image data") from exc

        if len(raw) == 0:
            raise ValueError("photo_base64 decodes to empty bytes")
        if len(raw) > MAX_PHOTO_BYTES:
            raise ValueError(f"photo too large ({len(raw)} bytes); limit is {MAX_PHOTO_BYTES}")

        sniffed = _sniff_image_type(raw)
        if sniffed is None:
            raise ValueError("photo_base64 is not a PNG/JPEG/WebP image")
        if media_type is not None and media_type in ALLOWED_IMAGE_TYPES and media_type != sniffed:
            raise ValueError(f"photo data URI says {media_type} but bytes are {sniffed}")

        # Re-emit normalized bare base64 (no data-URI prefix) so downstream
        # code only ever sees clean payload.
        return base64.b64encode(raw).decode("ascii")


_MAGIC_SIGNATURES = (
    (b"\x89PNG\r\n\x1a\n", "image/png"),
    (b"\xff\xd8\xff", "image/jpeg"),
    (b"RIFF", "image/webp"),  # WebP: RIFF....WEBP
)


def _sniff_image_type(raw: bytes) -> Optional[str]:
    """Return the detected MIME type from magic bytes, else None."""
    for signature, mime in _MAGIC_SIGNATURES:
        if raw.startswith(signature):
            if mime == "image/webp" and raw[8:12] != b"WEBP":
                continue
            return mime
    return None


class CVGenerateRequest(BaseModel):
    """Body for POST /api/v1/cv/generate."""

    target_domain: TargetDomain
    download: bool = False
    profile: ProfileRequest

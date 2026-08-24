"""
repository.py
Data Access Abstraction layer.

IMPORTANT: This module does NOT connect to a database and does NOT define
any tables/models. Skillify's database and profile-fetching logic already
exist. This file only NORMALIZES whatever your existing DB layer returns
into a consistent internal shape (`NormalizedProfile`) that domain_engine.py
and pdf_builder.py can work with -- so the rest of the CV generator never
needs to know or care what your DB looks like.

HOW TO WIRE THIS TO YOUR REAL DATABASE
---------------------------------------
You already have a function/method somewhere in Skillify that loads a
user's profile (e.g. `get_user_profile(user_id)` from a service layer, an
ORM query, etc). You do NOT need to change it. Just pass it into
`DBProfileRepository` as `fetch_fn`:

    from cv_generator.repository import DBProfileRepository
    from your_existing_app.profiles import get_user_profile  # already exists

    repo = DBProfileRepository(user_id=current_user.id, fetch_fn=get_user_profile)
    normalized_profile = repo.get_profile()

`fetch_fn` must return a dict (or an object with attributes) shaped roughly
like the fields below -- if your existing function returns something
differently named, either adapt its output before passing it in, or edit
`normalize_raw_profile()` below to match your field names. That is the
ONLY function you should need to touch when migrating/replacing the DB
layer later -- everything downstream (domain_engine.py, pdf_builder.py)
stays untouched.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Callable, List, Optional

from schemas import Certification, Internship, Project, SkillCategory


@dataclass
class LanguageEntry:
    name: str
    level: str = ""


@dataclass
class NormalizedProfile:
    """Render-ready, internal representation of a user's profile."""

    full_name: str
    email: str
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    headline: Optional[str] = None
    college: Optional[str] = None
    degree: Optional[str] = None
    graduation_year: Optional[str] = None
    photo_base64: Optional[str] = None  # user's own profile picture, if their profile has one
    languages: List["LanguageEntry"] = field(default_factory=list)
    interests: List[str] = field(default_factory=list)
    soft_skills: List[str] = field(default_factory=list)

    skills: List[SkillCategory] = field(default_factory=list)
    projects: List[Project] = field(default_factory=list)
    internships: List[Internship] = field(default_factory=list)
    certifications: List[Certification] = field(default_factory=list)
    achievements: List[str] = field(default_factory=list)

    def has_skills(self) -> bool:
        return any(cat.items for cat in self.skills)

    def has_projects(self) -> bool:
        return len(self.projects) > 0

    def has_internships(self) -> bool:
        return len(self.internships) > 0

    def has_certifications(self) -> bool:
        return len(self.certifications) > 0

    def has_achievements(self) -> bool:
        return len(self.achievements) > 0

    def has_portfolio_links(self) -> bool:
        return bool(self.github_url or self.linkedin_url or self.portfolio_url)

    def has_photo(self) -> bool:
        return bool(self.photo_base64)

    def has_languages(self) -> bool:
        return len(self.languages) > 0

    def has_interests(self) -> bool:
        return len(self.interests) > 0

    def has_soft_skills(self) -> bool:
        return len(self.soft_skills) > 0


def _get(raw: Any, key: str, default=None):
    """Read `key` from a dict OR an object (ORM row / model instance)."""
    if raw is None:
        return default
    if isinstance(raw, dict):
        return raw.get(key, default)
    return getattr(raw, key, default)


def _normalize_skills(raw_skills: Any) -> List[SkillCategory]:
    """
    Accepts either:
      - [{"category": "Languages", "items": ["Python", "Go"]}, ...]
      - {"Languages": ["Python", "Go"], "Frameworks": [...]}
      - ["Python", "Go", "SQL"]  (flat list -> single "Skills" category)
    and normalizes to List[SkillCategory].
    """
    if not raw_skills:
        return []

    if isinstance(raw_skills, dict):
        return [
            SkillCategory(category=cat, items=list(items))
            for cat, items in raw_skills.items()
            if items
        ]

    if isinstance(raw_skills, list) and raw_skills and isinstance(raw_skills[0], str):
        return [SkillCategory(category="Skills", items=list(raw_skills))]

    categories: List[SkillCategory] = []
    for entry in raw_skills or []:
        cat = _get(entry, "category", "Skills")
        items = _get(entry, "items", []) or []
        if items:
            categories.append(SkillCategory(category=cat, items=list(items)))
    return categories


def _normalize_projects(raw_projects: Any) -> List[Project]:
    projects: List[Project] = []
    for entry in raw_projects or []:
        projects.append(
            Project(
                title=_get(entry, "title", "Untitled Project"),
                description=_get(entry, "description", "") or "",
                tech_stack=list(_get(entry, "tech_stack", []) or []),
                link=_get(entry, "link"),
            )
        )
    return projects


def _normalize_internships(raw_internships: Any) -> List[Internship]:
    internships: List[Internship] = []
    for entry in raw_internships or []:
        internships.append(
            Internship(
                company=_get(entry, "company", ""),
                role=_get(entry, "role", ""),
                duration=_get(entry, "duration", "") or "",
                highlights=list(_get(entry, "highlights", []) or []),
            )
        )
    return internships


def _normalize_certifications(raw_certs: Any) -> List[Certification]:
    certs: List[Certification] = []
    for entry in raw_certs or []:
        certs.append(
            Certification(
                name=_get(entry, "name", "Untitled Certification"),
                issuer=_get(entry, "issuer"),
                year=_get(entry, "year"),
            )
        )
    return certs


def _normalize_achievements(raw_achievements: Any) -> List[str]:
    achievements: List[str] = []
    for entry in raw_achievements or []:
        if isinstance(entry, str):
            achievements.append(entry)
            continue
        title = _get(entry, "title", "")
        desc = _get(entry, "description")
        achievements.append(f"{title} - {desc}" if desc else title)
    return [a for a in achievements if a]


def _strip_data_uri(value: str) -> str:
    """
    Apps very commonly send photos as data URIs
    ("data:image/png;base64,iVBORw0KG..."). Strip the prefix so only the
    bare base64 payload flows downstream. Bare base64 passes through as-is.
    """
    value = value.strip()
    if value.startswith("data:") and "," in value:
        return value.split(",", 1)[1]
    return value


def _resolve_photo_base64(raw: Any) -> Optional[str]:
    """
    Pull the user's own profile picture out of whatever your existing
    Skillify profile data provides. Supports either of these, checked in
    order -- edit this if your DB uses a different field name:

      - `profile_photo_base64` / `photo_base64`: already base64-encoded
        image data (bare, or wrapped in a "data:image/...;base64," URI).
      - `profile_photo_path` / `photo_path`: a local file path (e.g. if
        your DB stores an uploads-folder path) -- read from disk here.

    If your app stores photos as a remote URL instead, resolve that URL to
    bytes/base64 in your own fetch_fn before passing the profile in here --
    this module intentionally does not make network calls itself.
    """
    already_encoded = _get(raw, "profile_photo_base64") or _get(raw, "photo_base64")
    if already_encoded:
        return _strip_data_uri(str(already_encoded))

    photo_path = _get(raw, "profile_photo_path") or _get(raw, "photo_path")
    if photo_path:
        import base64
        import os

        if os.path.isfile(photo_path):
            with open(photo_path, "rb") as f:
                return base64.b64encode(f.read()).decode("ascii")

    return None


def _normalize_languages(raw_languages: Any) -> List[LanguageEntry]:
    """
    Accepts either:
      - [{"name": "Urdu", "level": "Native"}, ...]
      - ["Urdu", "English"]  (flat list -> no proficiency level shown)
    Optional field -- most profiles won't have this, and the languages
    section simply won't render if it's empty.
    """
    entries: List[LanguageEntry] = []
    for item in raw_languages or []:
        if isinstance(item, str):
            entries.append(LanguageEntry(name=item))
        else:
            entries.append(LanguageEntry(name=_get(item, "name", ""), level=_get(item, "level", "") or ""))
    return entries


def normalize_raw_profile(raw: Any) -> NormalizedProfile:
    """
    Convert whatever your existing Skillify DB/profile layer returns
    (a dict, an ORM model instance, a Pydantic model -- anything with the
    fields below as keys or attributes) into a NormalizedProfile.

    This is the single place to edit if your existing field names differ
    (e.g. if your DB calls it `github` instead of `github_url`).
    """
    return NormalizedProfile(
        full_name=_get(raw, "full_name") or _get(raw, "name", ""),
        email=_get(raw, "email", ""),
        phone=_get(raw, "phone"),
        linkedin_url=_get(raw, "linkedin_url") or _get(raw, "linkedin"),
        github_url=_get(raw, "github_url") or _get(raw, "github"),
        portfolio_url=_get(raw, "portfolio_url") or _get(raw, "portfolio"),
        headline=_get(raw, "headline"),
        college=_get(raw, "college"),
        degree=_get(raw, "degree"),
        graduation_year=_get(raw, "graduation_year"),
        photo_base64=_resolve_photo_base64(raw),
        languages=_normalize_languages(_get(raw, "languages")),
        interests=list(_get(raw, "interests") or _get(raw, "hobbies") or []),
        soft_skills=list(_get(raw, "soft_skills") or []),
        skills=_normalize_skills(_get(raw, "skills")),
        projects=_normalize_projects(_get(raw, "projects")),
        internships=_normalize_internships(_get(raw, "internships")),
        certifications=_normalize_certifications(_get(raw, "certifications")),
        achievements=_normalize_achievements(_get(raw, "achievements")),
    )


class ProfileRepository(ABC):
    """Abstract contract for fetching/normalizing a user's profile."""

    @abstractmethod
    def get_profile(self) -> NormalizedProfile:
        raise NotImplementedError


class DBProfileRepository(ProfileRepository):
    """
    Production adapter: wraps YOUR existing Skillify profile-fetch function.
    Does not open a connection or run a query itself -- it delegates to
    `fetch_fn`, which is whatever function/method your app already uses to
    load a user's profile from the existing database.
    """

    def __init__(self, user_id: Any, fetch_fn: Callable[[Any], Any]):
        self.user_id = user_id
        self.fetch_fn = fetch_fn

    def get_profile(self) -> NormalizedProfile:
        raw = self.fetch_fn(self.user_id)
        if raw is None:
            raise ValueError(f"No profile found for user_id={self.user_id!r}")
        return normalize_raw_profile(raw)


class DictProfileRepository(ProfileRepository):
    """
    Lightweight adapter for local testing (see test_local.py) or for cases
    where you've already fetched the profile dict yourself and just want it
    normalized without wiring up DBProfileRepository.
    """

    def __init__(self, raw_profile: Any):
        self.raw_profile = raw_profile

    def get_profile(self) -> NormalizedProfile:
        return normalize_raw_profile(self.raw_profile)

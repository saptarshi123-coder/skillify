"""
service.py
Single entry point that ties the module together:
  ProfileRepository -> domain_engine -> pdf_builder -> PDF bytes

Call `generate_cv_pdf_bytes(...)` from wherever your existing authenticated
Skillify route lives. This file has no auth, no routing, and no DB code.
"""

from __future__ import annotations

import base64
import os
from typing import Any, Callable, Optional, Union

from domain_engine import build_layout_plan
from pdf_builder import build_cv_pdf
from repository import DBProfileRepository, DictProfileRepository, ProfileRepository
from schemas import TargetDomain


def load_logo_base64(logo_path: Optional[str]) -> Optional[str]:
    """
    Reads the Skillify logo image file from disk and returns it as base64,
    ready for pdf_builder to embed in the CV header. Returns None if no path
    is given or the file can't be found (CV still generates, just without a
    logo).
    """
    if not logo_path:
        return None
    if not os.path.isfile(logo_path):
        return None
    with open(logo_path, "rb") as f:
        return base64.b64encode(f.read()).decode("ascii")


def generate_cv_pdf_bytes(
    target_domain: Union[str, TargetDomain],
    *,
    profile_repository: Optional[ProfileRepository] = None,
    user_id: Any = None,
    fetch_profile_fn: Optional[Callable[[Any], Any]] = None,
    raw_profile: Any = None,
    logo_path: Optional[str] = None,
) -> bytes:
    """
    Generate a CV PDF and return it as raw bytes.

    Provide exactly ONE of the following ways to supply profile data:
      1. `profile_repository` -- your own ProfileRepository instance.
      2. `user_id` + `fetch_profile_fn` -- wraps your existing Skillify
         profile-fetch function (DBProfileRepository under the hood).
      3. `raw_profile` -- an already-fetched profile dict/object
         (DictProfileRepository under the hood). Useful for local testing.

    `target_domain` accepts either a TargetDomain enum member or a plain
    string like "SDE", "AI/ML", "UI/UX", "Writer", etc.
    """
    if isinstance(target_domain, str):
        target_domain = TargetDomain(target_domain)

    if profile_repository is None:
        if fetch_profile_fn is not None:
            profile_repository = DBProfileRepository(user_id=user_id, fetch_fn=fetch_profile_fn)
        elif raw_profile is not None:
            profile_repository = DictProfileRepository(raw_profile)
        else:
            raise ValueError(
                "Provide profile_repository, (user_id + fetch_profile_fn), or raw_profile."
            )

    normalized_profile = profile_repository.get_profile()
    layout_plan = build_layout_plan(normalized_profile, target_domain)

    logo_base64 = load_logo_base64(logo_path)

    pdf_buffer = build_cv_pdf(
        profile=normalized_profile,
        plan=layout_plan,
        logo_base64=logo_base64,
        target_domain_label=target_domain.value,
    )
    return pdf_buffer.read()

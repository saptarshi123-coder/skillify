"""
main.py
API routes for the Skillify CV Generator. Can be used two ways:

1. STANDALONE (recommended for hosting):
   Run `server.py` -- it mounts this router into a ready-to-deploy app
   with CORS, health check and an interactive web preview at "/".

   uvicorn server:app --host 0.0.0.0 --port $PORT

2. MOUNTED INTO YOUR EXISTING SKILLIFY APP:
   Call set_dependencies() at startup to wire in your real profile-fetch
   function, then include this router:

       from cv_generator.main import router as cv_router, set_dependencies
       from your_existing_app.profiles import get_user_profile

       set_dependencies(fetch_profile_fn=get_user_profile,
                        logo_path="assets/skillify_logo.jpeg")
       app.include_router(cv_router)

ROUTES
------
POST /api/v1/cv/generate          App sends the account's full profile as
                                  JSON (photo as base64/data URI included).
                                  Returns the generated PDF. Body flag
                                  `download: true` forces attachment mode.
POST /api/v1/cv/generate-upload   Same, but the photo is uploaded as a
                                  multipart file alongside a JSON payload.
GET  /api/v1/cv/demo/random       DEMO: picks a random profile from the
                                  bundled sample dataset (or a specific one
                                  via ?id=...) and returns its CV as PDF --
                                  for checking the pipeline works before
                                  wiring your app's real account data.
GET  /api/v1/cv/demo/profiles     DEMO: lists the sample dataset entries.
GET  /api/v1/generate-cv          Legacy account-based flow: your existing
                                  auth passes user_id; the wired-in
                                  fetch_profile_fn loads the profile.
"""

from __future__ import annotations

import base64
import json
import re
from typing import Any, Callable, Optional

from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile
from fastapi.responses import Response

from schemas import MAX_PHOTO_BYTES, CVGenerateRequest, TargetDomain
from service import generate_cv_pdf_bytes
import sample_data

router = APIRouter(prefix="/api/v1", tags=["cv-generator"])

# Populated via set_dependencies() when this router is mounted into your
# existing app. Kept as simple module-level hooks so this file stays
# framework-glue only -- no auth or DB logic lives here.
_fetch_profile_fn: Optional[Callable[[Any], Any]] = None
_logo_path: Optional[str] = None


def set_dependencies(
    fetch_profile_fn: Callable[[Any], Any],
    logo_path: Optional[str] = None,
) -> None:
    """Call this once at startup from your existing app to wire in your
    real profile-fetch function and (optionally) the Skillify logo path."""
    global _fetch_profile_fn, _logo_path
    _fetch_profile_fn = fetch_profile_fn
    _logo_path = logo_path


def _default_logo_path() -> Optional[str]:
    """Logo bundled with this module, resolved relative to this file so it
    works no matter what the process working directory is."""
    import os

    candidate = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "skillify_logo.jpeg")
    return candidate if os.path.isfile(candidate) else None


def _safe_filename(name: str, fallback: str = "CV") -> str:
    """Sanitize a user-supplied name for use in a Content-Disposition
    header (blocks header injection and filesystem-hostile characters)."""
    cleaned = re.sub(r"[^A-Za-z0-9 _.-]+", "", name).strip()
    cleaned = re.sub(r"\s+", "_", cleaned)
    return cleaned[:60] or fallback


def _pdf_response(pdf_bytes: bytes, full_name: str, download: bool, domain_label: str) -> Response:
    base_name = _safe_filename(full_name, fallback="Skillify_CV")
    suffix = f"_{_safe_filename(domain_label)}" if domain_label else ""
    filename = f"{base_name}{suffix}_CV.pdf"
    disposition_type = "attachment" if download else "inline"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'{disposition_type}; filename="{filename}"'},
    )


def _generation_error(exc: Exception) -> HTTPException:
    return HTTPException(status_code=500, detail=f"CV generation failed: {exc}")


@router.post("/cv/generate")
def generate_cv_from_request(request: CVGenerateRequest) -> Response:
    """
    The app-facing endpoint: receives the authenticated user's profile data
    straight from their account in the app -- name, contact, education,
    skills, projects, internships, certifications, achievements, languages,
    interests, soft skills and profile photo (base64 or data URI) -- and
    returns the generated CV as a PDF binary stream.

    Set `"download": true` in the body to get Content-Disposition:
    attachment (a direct download); leave false to stream it inline for
    in-app preview.
    """
    try:
        pdf_bytes = generate_cv_pdf_bytes(
            target_domain=request.target_domain,
            raw_profile=request.profile,
            logo_path=_logo_path or _default_logo_path(),
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise _generation_error(exc) from exc

    return _pdf_response(pdf_bytes, request.profile.full_name, request.download, request.target_domain.value)


@router.post("/cv/generate-upload")
async def generate_cv_from_upload(
    payload: str = Form(..., description="JSON body identical to /cv/generate (minus the photo)"),
    photo: Optional[UploadFile] = File(None, description="Profile photo file (PNG/JPEG/WebP, max 5 MB)"),
) -> Response:
    """
    Multipart variant for apps that upload the photo as a file instead of
    embedding base64 in JSON. `payload` is a JSON string shaped like the
    /cv/generate request; `photo` is the optional image part.
    """
    try:
        data = json.loads(payload)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=422, detail=f"payload is not valid JSON: {exc}") from exc

    # Remove any embedded photo so the uploaded file wins.
    profile_data = data.get("profile")
    if isinstance(profile_data, dict):
        profile_data.pop("photo_base64", None)

    request = CVGenerateRequest.model_validate(data)

    if photo is not None and (await photo.read(1)):
        await photo.seek(0)
        raw = await photo.read()
        if len(raw) > MAX_PHOTO_BYTES:
            raise HTTPException(status_code=422, detail=f"photo too large ({len(raw)} bytes); limit is {MAX_PHOTO_BYTES}")
        from schemas import _sniff_image_type

        sniffed = _sniff_image_type(raw)
        if sniffed is None:
            raise HTTPException(status_code=422, detail="photo must be a PNG/JPEG/WebP image")
        request.profile.photo_base64 = base64.b64encode(raw).decode("ascii")

    try:
        pdf_bytes = generate_cv_pdf_bytes(
            target_domain=request.target_domain,
            raw_profile=request.profile,
            logo_path=_logo_path or _default_logo_path(),
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise _generation_error(exc) from exc

    return _pdf_response(pdf_bytes, request.profile.full_name, request.download, request.target_domain.value)


@router.get("/cv/demo/profiles", tags=["demo"])
def list_demo_dataset() -> dict:
    """
    DEMO: the bundled sample dataset. Use an `id` from here to pin a
    specific sample in /cv/demo/random, or ignore it for fully random picks.
    """
    return {"count": len(sample_data.list_demo_profiles()), "profiles": sample_data.list_demo_profiles()}


@router.get("/cv/demo/random", tags=["demo"])
def generate_demo_cv(
    profile_id: Optional[str] = Query(
        None,
        alias="id",
        description="Optional: pin one dataset entry (see /cv/demo/profiles). Omitted = random pick.",
    ),
    target_domain: Optional[str] = Query(
        None,
        description="Optional domain override. Default: each sample's own default domain.",
    ),
    download: bool = Query(False, description="true = attachment download; false (default) = inline preview."),
) -> Response:
    """
    DEMO endpoint proving the whole pipeline works end-to-end:
    dataset -> random pick -> domain engine -> PDF builder -> PDF response.

    Point your app (or just a browser / curl) at this before wiring real
    account data. The generated CV is indistinguishable from what a real
    user would get -- photo avatar included.
    """
    try:
        demo = sample_data.get_random_demo_profile(profile_id)
    except KeyError:
        available = ", ".join(p["id"] for p in sample_data.list_demo_profiles())
        raise HTTPException(status_code=404, detail=f"Unknown demo id {profile_id!r}. Available: {available}")

    try:
        domain = TargetDomain(target_domain) if target_domain else demo.default_domain
    except ValueError as exc:
        allowed = ", ".join(d.value for d in TargetDomain)
        raise HTTPException(status_code=422, detail=f"Unknown target_domain {target_domain!r}. Allowed: {allowed}") from exc

    try:
        pdf_bytes = generate_cv_pdf_bytes(
            target_domain=domain,
            raw_profile=demo.profile,
            logo_path=_default_logo_path(),
        )
    except Exception as exc:  # noqa: BLE001
        raise _generation_error(exc) from exc

    return _pdf_response(pdf_bytes, f"Sample {demo.profile['full_name']}", download, domain.value)


# ---------------------------------------------------------------------------
# OPTIONAL -- FULLY DISABLED. Do NOT uncomment unless YOU want the app itself
# to serve RANDOMLY GENERATED fake-person demo CVs (random name/contact/
# skills each call). Your real users' data path above is completely separate
# and unaffected either way.
#
# import random as _random
# from test_local import build_random_fake_profile
#
# @router.get("/cv/demo/random-fake", tags=["demo"])
# def generate_fake_demo_cv(
#     seed: Optional[int] = Query(None, description="Reuse a seed to reproduce the exact same fake person."),
#     target_domain: Optional[str] = Query(None, description="Optional domain pin; omitted = random."),
#     download: bool = Query(False),
# ) -> Response:
#     """DEMO (fake data): random invented person -> CV PDF. Never uses real account data."""
#     chosen_domain, fake_profile = build_random_fake_profile(target_domain, seed=seed)
#     try:
#         pdf_bytes = generate_cv_pdf_bytes(
#             target_domain=chosen_domain,
#             raw_profile=fake_profile,
#             logo_path=_default_logo_path(),
#         )
#     except Exception as exc:  # noqa: BLE001
#         raise _generation_error(exc) from exc
#     return _pdf_response(pdf_bytes, f"Demo {fake_profile['full_name']}", download, chosen_domain)
#
# NOTE: test_local.py is guarded by `if __name__ == "__main__"` so importing
# it here NEVER writes files or runs anything on app startup. Safe.
# ---------------------------------------------------------------------------


@router.get("/generate-cv")
def generate_cv(
    user_id: str = Query(..., description="ID of the already-authenticated user"),
    target_domain: str = Query(..., description="One of the supported Skillify domains"),
    download: bool = Query(
        False,
        description="If true, forces a file download (attachment). If false (default), the PDF opens inline for preview.",
    ),
) -> Response:
    """
    Legacy/account-based flow: your existing route/middleware authenticates
    the caller, and the fetch_profile_fn wired in via set_dependencies()
    loads their saved profile from your database.
    """
    if _fetch_profile_fn is None:
        raise HTTPException(
            status_code=500,
            detail="CV generator not wired up: call set_dependencies() at app startup.",
        )

    try:
        domain = TargetDomain(target_domain)
    except ValueError as exc:
        allowed = ", ".join(d.value for d in TargetDomain)
        raise HTTPException(status_code=422, detail=f"Unknown target_domain {target_domain!r}. Allowed: {allowed}") from exc

    try:
        pdf_bytes = generate_cv_pdf_bytes(
            target_domain=domain,
            user_id=user_id,
            fetch_profile_fn=_fetch_profile_fn,
            logo_path=_logo_path or _default_logo_path(),
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise _generation_error(exc) from exc

    return _pdf_response(pdf_bytes, user_id, download, domain.value)

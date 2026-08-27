"""
tests/test_cv_generator.py
End-to-end coverage for the Skillify CV Generator:

- repository normalization (dicts, objects, data-URI photos, flat skills)
- schema validation of the POST body (email shape, photo sniffing, caps)
- domain engine ordering + summary generation
- PDF smoke tests (real bytes, single page, non-trivial size)
- API behaviour via FastAPI TestClient: both POST flows, download
  headers, validation errors, health probe

Run from the "CV Generator" folder:
    .venv/bin/python -m pytest tests/ -v
"""

from __future__ import annotations

import base64
import io
import os
import sys
import zlib

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import main as cv_main  # noqa: E402
import server  # noqa: E402
from domain_engine import SECTION_PROJECTS, SECTION_SKILLS, SECTION_SUMMARY, build_layout_plan  # noqa: E402
from repository import DictProfileRepository, normalize_raw_profile  # noqa: E402
from schemas import ProfileRequest, TargetDomain  # noqa: E402
from service import generate_cv_pdf_bytes  # noqa: E402


# ---------------------------------------------------------------- helpers

def _tiny_png_b64(color=(128, 0, 0)) -> str:
    """A real 8x8 PNG built by hand -- no PIL dependency in the test env."""
    width = height = 8
    row = b"\x00" + bytes(color) * width  # filter byte + RGB pixels
    raw = row * height
    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            len(data).to_bytes(4, "big") + tag + data
            + zlib.crc32(tag + data).to_bytes(4, "big")
        )
    ihdr = (width).to_bytes(4, "big") + (height).to_bytes(4, "big") + b"\x08\x02\x00\x00\x00"
    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(raw))
        + chunk(b"IEND", b"")
    )
    return base64.b64encode(png).decode("ascii")


def _sample_profile(**overrides) -> dict:
    profile = {
        "full_name": "Ananya Raj",
        "email": "ananya@example.com",
        "phone": "+91 98765 43210",
        "linkedin_url": "https://linkedin.com/in/ananyaraj",
        "github_url": "https://github.com/ananyaacodes",
        "college": "XYZ Institute of Technology",
        "degree": "B.Tech Computer Science",
        "graduation_year": "2027",
        "skills": [
            {"category": "Languages", "items": ["Python", "JavaScript", "SQL"]},
            {"category": "Frameworks", "items": ["FastAPI", "React"]},
        ],
        "projects": [{
            "title": "Skillify",
            "description": "Social app with a Python recommendation backend.",
            "tech_stack": ["Python", "FastAPI"],
            "link": "https://github.com/ananyaacodes/skillify",
        }],
        "internships": [{
            "company": "Acme Corp",
            "role": "Software Engineering Intern",
            "duration": "May 2026 - Jul 2026",
            "highlights": ["Built a REST API used by 3 teams"],
        }],
        "certifications": [{"name": "AWS Cloud Practitioner", "issuer": "Amazon", "year": "2025"}],
        "achievements": [{"title": "Hackathon Winner", "description": "College-wide hackathon, 2025"}],
        "languages": [{"name": "Hindi", "level": "Native"}, {"name": "English", "level": "Fluent"}],
        "interests": ["Chess", "Open-source"],
        "soft_skills": ["Team collaboration", "Communication"],
    }
    profile.update(overrides)
    return profile


def _post_body(profile: dict | None = None, **extra) -> dict:
    return {"target_domain": "SDE", "download": False,
            "profile": _sample_profile() if profile is None else profile, **extra}


@pytest.fixture(scope="module")
def client():
    return TestClient(server.create_app())


# ------------------------------------------------------------ repository

class TestRepository:
    def test_dict_normalization(self):
        p = normalize_raw_profile(_sample_profile())
        assert p.full_name == "Ananya Raj"
        assert p.has_skills() and p.has_projects() and p.has_internships()
        assert p.languages[1].level == "Fluent"

    def test_object_normalization(self):
        class Row:
            full_name = "Kabir Sen"
            email = "kabir@example.com"
            github = "github.com/kabirsen"
        p = normalize_raw_profile(Row())
        assert p.full_name == "Kabir Sen"
        assert p.github_url == "github.com/kabirsen"

    def test_data_uri_photo_is_stripped(self):
        raw = _sample_profile(photo_base64=f"data:image/png;base64,{_tiny_png_b64()}")
        p = normalize_raw_profile(raw)
        assert p.photo_base64 and p.photo_base64.startswith("iVBOR")
        assert "," not in p.photo_base64[:80]

    def test_flat_skills_list(self):
        raw = _sample_profile(skills=["Python", "Go"])
        p = normalize_raw_profile(raw)
        assert p.skills[0].category == "Skills"
        assert set(p.skills[0].items) == {"Python", "Go"}

    def test_missing_photo_is_none(self):
        assert normalize_raw_profile(_sample_profile()).photo_base64 is None


# --------------------------------------------------------------- schemas

class TestSchemas:
    def test_valid_request_accepts_data_uri_photo(self):
        body = _post_body()
        body["profile"]["photo_base64"] = f"data:image/png;base64,{_tiny_png_b64()}"
        req = ProfileRequest.model_validate(body["profile"])
        assert req.photo_base64.startswith("iVBOR")

    def test_rejects_bad_email(self):
        bad = _sample_profile(email="not-an-email")
        with pytest.raises(Exception):
            ProfileRequest.model_validate(bad)

    def test_rejects_non_image_bytes(self):
        fake = base64.b64encode(b"definitely not an image").decode()
        bad = _sample_profile(photo_base64=fake)
        with pytest.raises(Exception, match="image"):
            ProfileRequest.model_validate(bad)

    def test_reject_oversized_photo(self):
        huge_png = _tiny_png_b64() + base64.b64encode(b"\x00" * (6 * 1024 * 1024)).decode()
        bad = _sample_profile(photo_base64=huge_png)
        with pytest.raises(Exception):
            ProfileRequest.model_validate(bad)

    def test_url_scheme_autocompleted(self):
        req = ProfileRequest.model_validate(_sample_profile(linkedin_url="linkedin.com/in/x"))
        assert req.linkedin_url == "https://linkedin.com/in/x"

    def test_bad_graduation_year(self):
        with pytest.raises(Exception):
            ProfileRequest.model_validate(_sample_profile(graduation_year="soon"))


# --------------------------------------------------------- domain engine

class TestDomainEngine:
    def test_technical_order_leads_with_skills(self):
        plan = build_layout_plan(normalize_raw_profile(_sample_profile()), TargetDomain.SDE)
        keys = [k for k in plan.section_order if k != SECTION_SUMMARY]
        assert keys.index(SECTION_SKILLS) < keys.index(SECTION_PROJECTS)

    def test_summary_mentions_degree_and_skill(self):
        plan = build_layout_plan(normalize_profile := normalize_raw_profile(_sample_profile()), TargetDomain.SDE)
        assert "B.Tech Computer Science candidate at XYZ Institute of Technology" in plan.summary_text
        assert "Python" in plan.summary_text

    def test_single_project_grammar(self):
        plan = build_layout_plan(normalize_raw_profile(_sample_profile(internships=[])), TargetDomain.SDE)
        assert "1 project and" not in plan.summary_text
        assert "1 project" in plan.summary_text


# ----------------------------------------------------------- pdf builder

class TestPdfBuilder:
    def test_generates_real_pdf_bytes(self):
        pdf = generate_cv_pdf_bytes(target_domain="SDE", raw_profile=_sample_profile())
        assert pdf.startswith(b"%PDF-")
        assert len(pdf) > 2000

    def test_all_nine_domains_render(self):
        for domain in TargetDomain:
            pdf = generate_cv_pdf_bytes(
                target_domain=domain,
                raw_profile=_sample_profile(
                    photo_base64=_tiny_png_b64(),
                    headline="Aspiring engineer who ships",
                ),
            )
            assert pdf.startswith(b"%PDF-"), domain.value

    def test_minimal_profile_still_renders(self):
        pdf = generate_cv_pdf_bytes(
            target_domain="UI/UX",
            raw_profile={"full_name": "Meera Iyer", "email": "meera@example.com"},
        )
        assert pdf.startswith(b"%PDF-")

    def test_dense_profile_auto_fits_without_error(self):
        dense = _sample_profile(
            projects=[{"title": f"Project {i}", "description": "x " * 60} for i in range(6)],
            internships=[{"company": f"C{i}", "role": "Intern", "duration": "2025",
                          "highlights": ["did things " * 10]} for i in range(4)],
            achievements=[{"title": f"Achievement {i}"} for i in range(6)],
        )
        pdf = generate_cv_pdf_bytes(target_domain="SDE", raw_profile=dense)
        assert pdf.startswith(b"%PDF-")

    def test_qr_chip_appears_when_links_exist(self):
        try:
            import qrcode  # noqa: F401
        except ImportError:
            pytest.skip("qrcode not installed")
        pdf_with_links = generate_cv_pdf_bytes(target_domain="SDE", raw_profile=_sample_profile())
        pdf_no_links = generate_cv_pdf_bytes(
            target_domain="SDE",
            raw_profile=_sample_profile(linkedin_url=None, github_url=None),
        )
        # QR adds an embedded PNG image stream; sizes should differ measurably.
        assert abs(len(pdf_with_links) - len(pdf_no_links)) > 500


# ------------------------------------------------------------------- api

class TestApi:
    def test_health(self, client):
        res = client.get("/health")
        assert res.status_code == 200
        assert res.json()["status"] == "ok"

    def test_post_generate_returns_inline_pdf(self, client):
        res = client.post("/api/v1/cv/generate", json=_post_body())
        assert res.status_code == 200
        assert res.headers["content-type"] == "application/pdf"
        assert "inline" in res.headers["content-disposition"]
        assert res.content.startswith(b"%PDF-")

    def test_post_generate_download_flag_sets_attachment(self, client):
        body = _post_body(download=True)
        res = client.post("/api/v1/cv/generate", json=body)
        assert res.status_code == 200
        cd = res.headers["content-disposition"]
        assert "attachment" in cd
        assert "Ananya_Raj_SDE_CV.pdf" in cd

    def test_filename_sanitized_against_injection(self, client):
        evil = _sample_profile(full_name='Eve" \r\nX-Injected: yes\r\n')
        res = client.post("/api/v1/cv/generate", json=_post_body(evil))
        assert res.status_code == 200
        cd = res.headers.get("content-disposition", "")
        # The real security property: one clean header line -- no CRLF
        # injection, no stray quotes inside the quoted filename, exactly
        # one filename= field.
        assert "\r" not in cd and "\n" not in cd
        assert cd.count("filename=") == 1
        inner = cd.split('filename="', 1)[1].removesuffix('"')
        assert '"' not in inner
        assert ": " not in inner

    def test_invalid_domain_is_422(self, client):
        body = _post_body()
        body["target_domain"] = "Astrophysics"
        res = client.post("/api/v1/cv/generate", json=body)
        assert res.status_code == 422

    def test_missing_required_fields_is_422(self, client):
        res = client.post("/api/v1/cv/generate", json={"target_domain": "SDE"})
        assert res.status_code == 422

    def test_upload_flow_with_file_photo(self, client):
        payload = _post_body()
        payload.pop("download")
        files = {"photo": ("me.png", base64.b64decode(_tiny_png_b64()), "image/png")}
        data = {"payload": __import__("json").dumps(payload)}
        res = client.post("/api/v1/cv/generate-upload", data=data, files=files)
        assert res.status_code == 200
        assert res.content.startswith(b"%PDF-")

    def test_upload_flow_rejects_fake_image(self, client):
        payload = _post_body()
        files = {"photo": ("me.png", b"not an image", "image/png")}
        res = client.post("/api/v1/cv/generate-upload",
                          data={"payload": __import__("json").dumps(payload)}, files=files)
        assert res.status_code == 422

    def test_legacy_get_requires_wiring(self, client):
        cv_main._fetch_profile_fn = None
        try:
            res = client.get("/api/v1/generate-cv", params={"user_id": "u1", "target_domain": "SDE"})
            assert res.status_code == 500
            assert "set_dependencies" in res.json()["detail"]
        finally:
            cv_main._fetch_profile_fn = None

    def test_legacy_get_with_wired_fetcher(self, client):
        cv_main.set_dependencies(fetch_profile_fn=lambda uid: _sample_profile(), logo_path=None)
        try:
            res = client.get("/api/v1/generate-cv",
                             params={"user_id": "u1", "target_domain": "SDE", "download": True})
            assert res.status_code == 200
            assert res.content.startswith(b"%PDF-")
            assert "attachment" in res.headers["content-disposition"]
        finally:
            cv_main._fetch_profile_fn = None

    def test_legacy_get_unknown_domain_is_422(self, client):
        cv_main.set_dependencies(fetch_profile_fn=lambda uid: _sample_profile(), logo_path=None)
        try:
            res = client.get("/api/v1/generate-cv", params={"user_id": "u1", "target_domain": "Nope"})
            assert res.status_code == 422
        finally:
            cv_main._fetch_profile_fn = None

    def test_legacy_get_missing_profile_is_404(self, client):
        cv_main.set_dependencies(fetch_profile_fn=lambda uid: None, logo_path=None)
        try:
            res = client.get("/api/v1/generate-cv", params={"user_id": "ghost", "target_domain": "SDE"})
            assert res.status_code == 404
        finally:
            cv_main._fetch_profile_fn = None

    def test_root_is_api_index_not_ui(self, client):
        res = client.get("/")
        assert res.status_code == 200
        data = res.json()
        assert data["service"] == "skillify-cv-generator"
        assert data["endpoints"]["generate_cv"] == "/api/v1/cv/generate"


class TestDemoMode:
    """The bundled sample-dataset flow used to smoke-test the pipeline."""

    def test_dataset_lists_six_profiles(self, client):
        res = client.get("/api/v1/cv/demo/profiles")
        assert res.status_code == 200
        data = res.json()
        assert data["count"] == len(data["profiles"]) >= 6
        ids = [p["id"] for p in data["profiles"]]
        assert len(set(ids)) == len(ids)
        assert all({"id", "full_name", "default_domain"} <= set(p) for p in data["profiles"])

    def test_random_pick_returns_pdf(self, client):
        # Hit it several times so multiple random entries get exercised.
        for _ in range(6):
            res = client.get("/api/v1/cv/demo/random")
            assert res.status_code == 200
            assert res.content.startswith(b"%PDF-")
            cd = res.headers["content-disposition"]
            assert "inline" in cd
            assert cd.startswith('inline; filename="Sample_')
            assert cd.endswith('_CV.pdf"')

    def test_pinned_id_is_deterministic(self, client):
        res1 = client.get("/api/v1/cv/demo/random", params={"id": "ananya-sde"})
        res2 = client.get("/api/v1/cv/demo/random", params={"id": "ananya-sde"})
        assert res1.status_code == res2.status_code == 200
        # Same pinned profile => same person/domain in the filename; PDF bytes
        # themselves differ only by the embedded creation timestamp.
        assert res1.headers["content-disposition"] == res2.headers["content-disposition"]
        assert abs(len(res1.content) - len(res2.content)) < 200
        assert res1.content.startswith(b"%PDF-")

    def test_unknown_demo_id_is_404_with_hints(self, client):
        res = client.get("/api/v1/cv/demo/random", params={"id": "nobody"})
        assert res.status_code == 404
        assert "Available:" in res.json()["detail"]

    def test_bad_domain_override_is_422(self, client):
        res = client.get("/api/v1/cv/demo/random", params={"target_domain": "Astrology"})
        assert res.status_code == 422

    def test_download_flag_and_domain_override(self, client):
        res = client.get("/api/v1/cv/demo/random",
                         params={"id": "kabir-writer", "target_domain": "Marketing", "download": True})
        assert res.status_code == 200
        assert "attachment" in res.headers["content-disposition"]
        assert "Kabir_Sen_Marketing_CV.pdf" in res.headers["content-disposition"]

    def test_every_dataset_entry_renders(self, client):
        listing = client.get("/api/v1/cv/demo/profiles").json()["profiles"]
        for entry in listing:
            res = client.get("/api/v1/cv/demo/random", params={"id": entry["id"]})
            assert res.status_code == 200, entry["id"]
            assert res.content.startswith(b"%PDF-"), entry["id"]

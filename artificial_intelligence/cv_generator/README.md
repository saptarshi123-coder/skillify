# Skillify CV Generator

Production-grade, domain-aware, one-page PDF resume / CV generator for the **Skillify** platform.

Turns a Skillify account's profile data (name, contact, education, skills, projects, internships, achievements, certificates) into an ATS-friendly, pixel-perfect single-page A4 PDF matching modern high-tier tech and design CV standards.

---

## Quick Start

```bash
# 1. Enter the cv_generator directory
cd backend/cv_generator

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the standalone API server
python server.py
# (or: uvicorn server:app --reload --port 8000)
```

```
App (APK) ──POST profile JSON (+photo)──▶ Backend ──▶ domain engine ──▶ PDF builder
   ▲                                                                    │
   └────────────────── PDF bytes back (preview / download) ◀────────────┘
```

## Quick start (local)

```bash
cd "CV Generator"
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python server.py            # or: .venv/bin/uvicorn server:app --reload
```

Then check:

| URL | What it is |
|---|---|
| `http://localhost:8000/docs` | Swagger docs for every endpoint |
| `http://localhost:8000/health` | Uptime probe |
| `http://localhost:8000/` | Tiny JSON service index (deployment sanity check) |

## API endpoints

All routes are prefixed with `/api/v1`.

### `POST /cv/generate` — the route your app uses

Send the account's profile as JSON; receive the generated CV as PDF.
Set `"download": true` to force an attachment download instead of an
inline stream.

```jsonc
POST /api/v1/cv/generate
{
  "target_domain": "SDE",          // SDE · AI/ML · Data Science · Engineering · UI/UX · Videography · Photography · Writer · Marketing
  "download": false,               // false = inline preview, true = attachment download
  "profile": {
    "full_name": "Ananya Raj",     // required
    "email": "ananya@example.com", // required
    "phone": "+91 98765 43210",
    "headline": "Aspiring ML engineer",
    "linkedin_url": "https://linkedin.com/in/ananyaraj",
    "github_url": "https://github.com/ananyaacodes",
    "portfolio_url": "https://ananya.dev",
    "college": "XYZ Institute of Technology",
    "degree": "B.Tech Computer Science",
    "graduation_year": "2027",
    "photo_base64": "data:image/png;base64,iVBORw0KG...",   // bare base64 also accepted
    "skills":       [{ "category": "Languages", "items": ["Python", "Go", "SQL"] }],
    "projects":     [{ "title": "Skillify", "description": "...", "tech_stack": ["FastAPI"], "link": "https://..." }],
    "internships":  [{ "company": "Acme Corp", "role": "SWE Intern", "duration": "May–Jul 2026", "highlights": ["Built a REST API used by 3 teams"] }],
    "certifications":[{"name": "AWS Cloud Practitioner", "issuer": "Amazon", "year": "2025"}],
    "achievements": [{ "title": "Hackathon Winner", "description": "College-wide, 2025" }],
    "languages":    [{ "name": "Hindi", "level": "Native" }, { "name": "English", "level": "Fluent" }],
    "interests":    ["Chess", "Open-source"],
    "soft_skills":  ["Team collaboration", "Communication"]
  }
}
```

**Response:** `200 OK`, `application/pdf`, with
`Content-Disposition: inline; filename="Ananya_Raj_SDE_CV.pdf"`
(or `attachment` when `download: true`). Invalid input → `422` with a
clear message. Photos are validated by magic-byte sniffing (PNG/JPEG/WebP,
5 MB cap) — corrupt uploads are rejected before they can reach the PDF.

### `POST /cv/generate-upload` — multipart variant

Same result, but the photo goes up as a file part instead of base64:

```
curl -X POST https://<host>/api/v1/cv/generate-upload \
  -F 'payload={"target_domain":"UI/UX","profile":{"full_name":"Meera Iyer","email":"meera@example.com"}}' \
  -F 'photo=@me.png;type=image/png'
```

### `GET /cv/demo/random` — try it before wiring your app

Smoke-test the whole pipeline (dataset → random pick → domain engine →
PDF) without sending any real data:

```
GET /api/v1/cv/demo/random                              # random sample -> inline PDF
GET /api/v1/cv/demo/random?id=ananya-sde                # pin a specific sample
GET /api/v1/cv/demo/random?target_domain=Marketing      # override its domain
GET /api/v1/cv/demo/random?download=true                # attachment download
```

The dataset (`data/sample_profiles.json`) holds six diverse profiles —
SDE, UI/UX, Writer, Data Science, Marketing, Videography — each rendered
with a generated initials avatar in the photo slot. `GET
/api/v1/cv/demo/profiles` lists them. Demo routes are separate from the
production path; your app's real account data never touches them.

### `GET /generate-cv?user_id=...&target_domain=...` — legacy account flow

If you mount this router into your **existing** Skillify FastAPI app (see
bottom), this route loads the saved profile from *your* database via the
function you wire in, then returns the same PDF stream.

## Connecting your Android app (APK)

The backend must run on a reachable host (see next section) — an APK can't
run this Python code on-device; it calls the hosted API over HTTPS.

**1. Internet permission** in your manifest:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

**2. Use HTTPS.** Android 9+ blocks plain-text HTTP by default. Host this
service behind HTTPS (Render/Railway/Fly give you HTTPS free) and point
the app at that URL. If you *must* test against `http://192.168.x.x`
during development, add a network-security-config allowing that host only
— never ship it.

**3. Generate + preview + download from Kotlin/Java:**

```kotlin
val payload = JSONObject().apply {
    put("target_domain", "SDE")
    put("download", false)
    put("profile", JSONObject(mapOf(
        "full_name" to account.name,
        "email" to account.email,
        "phone" to account.phone,
        "college" to account.college,
        "degree" to account.degree,
        "graduation_year" to account.gradYear,
        "photo_base64" to account.photoAsBase64DataUri, // "data:image/jpeg;base64,..." is fine
        "skills" to JSONArray(account.skillGroups),
        "projects" to JSONArray(account.projects)
    )))
}

// POST and open the returned PDF
val body = payload.toString().toRequestBody("application/json".toMediaType())
val request = Request.Builder()
    .url("https://<your-host>/api/v1/cv/generate")
    .post(body)
    .build()

client.newCall(request).execute().use { res ->
    require(res.isSuccessful) { res.body!!.string() }   // 4xx carries a JSON "detail"
    val pdfBytes = res.body!!.bytes()                    // render with Android's PdfRenderer,
                                                         // or save + open via an ACTION_VIEW intent
}
```

For a direct download button, send `"download": true` and just write the
response bytes to `Downloads/` (or hand them to `DownloadManager`). Native
apps don't need CORS — that only applies to browsers/webviews; if you load
the PDF in a WebView, set `CV_CORS_ORIGINS` accordingly.

## Deploying to web hosting

Everything standard hosts expect is included:

- **Procfile** → `web: uvicorn server:app --host 0.0.0.0 --port $PORT`
  (works on Render, Railway, Fly.io, Heroku, PythonAnywhere, any VPS).
- Dependencies pinned in **requirements.txt**.
- `/health` endpoint for platform health checks.
- Root `/` returns a small JSON index — hit it once after deploy to
  confirm the service is live before pointing your APK at it.

Environment variables:

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `8000` | Bind port (`python server.py`) |
| `HOST` | `0.0.0.0` | Bind address |
| `CV_CORS_ORIGINS` | `*` | Comma-separated allowed origins for webviews/browsers |

Example (Render/Railway): create a Web Service from this folder → build
`pip install -r requirements.txt` → start command
`uvicorn server:app --host 0.0.0.0 --port $PORT` → note the generated
`https://...` URL → use it in your APK.

## Design & features of the generated CV

Single-page infographic resume matching the Skillify reference template:
cream page, deep-maroon rounded side panel with drop shadow, photo (or
matching initials monogram when none) on a maroon backdrop with
overlapping name/year pills, script-font ("Lobster") headings with Poppins
body, white bordered Contact card, colored app-icon skill badges, pill
skill tags, star bullets, Experience/Languages/Interest cards.

Recent upgrades (same design language):

- **Auto-fit** — dense profiles re-render at progressively tighter type
  (down to 80%) instead of clipping off the bottom of the page.
- **QR chip** at the foot of the sidebar linking to portfolio /
  LinkedIn / GitHub (skipped automatically if no links or the optional
  `qrcode` package isn't installed).
- **Language proficiency bars** in the Languages card.
- **Branded footer rule** — "Generated with Skillify • <domain> • <date>".
- Domain-aware section ordering + auto-generated professional summary
  (technical domains lead with skills/projects; creative domains lead
  with portfolio/achievements).

Trade-off worth knowing: this style is decorative and image-heavy. It
looks great to human reviewers but parses poorly in ATS scanners — best
for creative-domain applications that are read directly by people.

## Project layout

```
CV Generator/
  schemas.py         Pydantic models: TargetDomain enum, ProfileRequest/CVGenerateRequest
                     (email shape, URL scheme fix-up, photo magic-byte sniffing, size caps)
  repository.py      Normalizes dicts OR objects into NormalizedProfile (data-URI aware)
  domain_engine.py   Per-domain section ordering + professional-summary generator
  pdf_builder.py     ReportLab canvas engine: template render, QR chip, language bars,
                     initials avatar, branded footer, auto-fit scale ladder
  service.py         Single entry point gluing repository → engine → builder
  main.py            FastAPI routes (POST generate / POST upload / legacy GET)
  server.py          Hosting-ready standalone API app: CORS, /health, JSON index
  sample_data.py     Demo dataset loader (random pick, ids, generated avatars)
  data/              sample_profiles.json — six diverse demo profiles
  fonts/             Lobster + Poppins TTFs (SIL Open Font License)
  assets/            Skillify logo
  test_local.py      Quick visual sanity check → writes sample_*.pdf
  tests/             pytest suite (32 tests: schemas, repo, engine, PDF, API)
  Procfile           web: uvicorn server:app --host 0.0.0.0 --port $PORT
  requirements.txt
```

## Testing

```bash
.venv/bin/python -m pytest tests/ -v     # full suite
.venv/bin/python test_local.py           # regenerate the three sample PDFs
```

## Mounting into your existing Skillify FastAPI app (optional)

```python
from cv_generator.main import router as cv_router, set_dependencies
from your_existing_app.profiles import get_user_profile   # already exists

set_dependencies(fetch_profile_fn=get_user_profile, logo_path="assets/skillify_logo.jpeg")
app.include_router(cv_router)
```

If your field names differ (`github` vs `github_url`, etc.), edit only
`repository.normalize_raw_profile()` — nothing downstream changes.

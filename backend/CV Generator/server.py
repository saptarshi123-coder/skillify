"""
server.py
Standalone, hosting-ready FastAPI app for the Skillify CV Generator.
Pure API -- no web UI. Your Android APK (or any client) calls the
endpoints over HTTP and receives the generated CV as PDF bytes.

Run locally:
    uvicorn server:app --reload
    -- or --
    python server.py

Deploy (any Python web host / Render / Railway / Fly.io / VPS):
    web: uvicorn server:app --host 0.0.0.0 --port $PORT   (see Procfile)

The route your app uses:
    POST /api/v1/cv/generate          profile JSON (+base64 photo) -> PDF
    POST /api/v1/cv/generate-upload   multipart photo variant -> PDF
    GET  /api/v1/generate-cv          legacy account/user_id flow

Environment variables:
    PORT              Port to bind when run via `python server.py` (default 8000)
    HOST              Bind address (default 0.0.0.0)
    CV_CORS_ORIGINS   Comma-separated list of allowed app origins.
                      Default "*" (any origin). For production, set this to
                      your app's real origin(s), e.g.
                      CV_CORS_ORIGINS=https://myapp.com,https://www.myapp.com
"""

from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from main import router as cv_router

API_PREFIX = "/api/v1"


def create_app() -> FastAPI:
    app = FastAPI(
        title="Skillify CV Generator",
        description=(
            "Turns a Skillify account's profile data (photo, skills, projects, "
            "experience, education...) into a polished one-page PDF CV.\n\n"
            "`POST " + API_PREFIX + "/cv/generate` with the account's profile "
            "JSON returns the PDF back -- inline for preview, or as a download."
        ),
        version="2.0.0",
        docs_url="/docs",
        redoc_url=None,
    )

    # --- CORS: lets the Skillify app call this API from webviews/browsers ---
    raw_origins = os.environ.get("CV_CORS_ORIGINS", "*")
    origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins or ["*"],
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["Content-Disposition"],
    )

    # --- Health probe for uptime monitors / hosting platforms ---
    @app.get("/health", tags=["meta"])
    def health() -> JSONResponse:
        return JSONResponse({"status": "ok", "service": "skillify-cv-generator"})

    # --- Root: tiny machine-readable index so you can verify the deploy ---
    @app.get("/", tags=["meta"], include_in_schema=False)
    def index() -> JSONResponse:
        return JSONResponse({
            "service": "skillify-cv-generator",
            "status": "running",
            "docs": "/docs",
            "health": "/health",
            "endpoints": {
                "generate_cv": f"{API_PREFIX}/cv/generate",
                "generate_cv_upload": f"{API_PREFIX}/cv/generate-upload",
                "legacy_account_flow": f"{API_PREFIX}/generate-cv",
            },
        })

    # --- The CV generator routes ---
    app.include_router(cv_router)

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "server:app",
        host=os.environ.get("HOST", "0.0.0.0"),
        port=int(os.environ.get("PORT", "8000")),
    )

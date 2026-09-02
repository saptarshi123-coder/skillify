import os
from contextlib import asynccontextmanager
import httpx
import uvicorn
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import database as db
from app_routes import router as app_router

HIRING_AI_URL = os.getenv("HIRING_AI_URL", "http://localhost:18005")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database tables
    db.init_db()
    
    # Initialize shared httpx.AsyncClient with 60s timeout
    app.state.http_client = httpx.AsyncClient(timeout=60.0)
    
    yield
    
    # Clean up client on shutdown
    await app.state.http_client.aclose()

app = FastAPI(
    title="Skillify Mobile App Backend",
    description="FastAPI Backend for Skillify Mobile App & Smart Hiring AI Integration",
    version="1.0.0",
    lifespan=lifespan
)

# Open CORS for mobile application access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(app_router)

@app.get("/", tags=["Index"])
async def root_index():
    """Root index returning API documentation & available routes."""
    return {
        "service": "Skillify Mobile App Backend API",
        "status": "running",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "admin": [
                "POST /api/app/jobs",
                "GET /api/app/jobs",
                "POST /api/app/jobs/{job_id}/applicants",
                "GET /api/app/jobs/{job_id}/applicants",
                "GET /api/app/jobs/{job_id}/ranking",
                "POST /api/app/jobs/{job_id}/finalize"
            ],
            "candidate": [
                "POST /api/app/candidates/register",
                "GET /api/app/candidates/{applicant_id}/quiz",
                "POST /api/app/candidates/{applicant_id}/quiz/submit",
                "GET /api/app/candidates/{applicant_id}/result",
                "POST /api/app/candidates/{applicant_id}/cv"
            ]
        }
    }

@app.get("/health", tags=["Health"])
async def health_check(request: Request):
    """Health check endpoint checking backend & upstream Smart Hiring AI reachability."""
    hiring_ai_status = "error"
    hiring_url = os.getenv("HIRING_AI_URL", "http://localhost:18005")
    
    try:
        client: httpx.AsyncClient = request.app.state.http_client
        res = await client.get(f"{hiring_url.rstrip('/')}/hiring/applicants", timeout=3.0)
        if res.status_code == 200:
            hiring_ai_status = "ok"
    except Exception:
        hiring_ai_status = "unreachable"

    return {
        "status": "ok",
        "backend": "ok",
        "upstream_hiring_ai": hiring_ai_status,
        "hiring_ai_url": hiring_url
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app_server:app", host="0.0.0.0", port=port, reload=True)

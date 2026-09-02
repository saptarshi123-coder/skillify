import os
import io
import csv
import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Request, Header, HTTPException, UploadFile, File, Depends, Response, status
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, EmailStr, Field

import database as db
import hiring_bridge

router = APIRouter()

def get_hiring_ai_url() -> str:
    return os.getenv("HIRING_AI_URL", "http://localhost:18005")

def get_cv_url() -> str:
    return os.getenv("CV_URL", "http://localhost:5000")

def verify_admin_key(x_admin_key: Optional[str] = Header(None, alias="X-Admin-Key")):
    admin_key = os.getenv("ADMIN_KEY")
    if admin_key:
        if not x_admin_key or x_admin_key != admin_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or missing X-Admin-Key header"
            )

# -----------------------------------------------------------------------------
# Pydantic Schemas (v2 style using json_schema_extra)
# -----------------------------------------------------------------------------
class JobCreate(BaseModel):
    title: str = Field(..., json_schema_extra={"example": "Frontend Software Engineer"})
    description: str = Field(..., json_schema_extra={"example": "Build React applications for Skillify"})
    required_skills: List[str] = Field(default_factory=list, json_schema_extra={"example": ["React", "TypeScript", "Tailwind"]})
    deadline_days: int = Field(default=7, ge=1, le=30)

class CandidateRegister(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "Alex Rivera"})
    email: str = Field(..., json_schema_extra={"example": "alex.rivera@example.com"})
    phone: Optional[str] = Field(None, json_schema_extra={"example": "+15550199"})
    position: Optional[str] = Field(None, json_schema_extra={"example": "Frontend Software Engineer"})

class QuizAnswerItem(BaseModel):
    question_id: Any
    selected_index: int
    time_taken_seconds: float = 0.0

class QuizSubmitRequest(BaseModel):
    answers: List[QuizAnswerItem]

class CVGenerateRequest(BaseModel):
    target_domain: Optional[str] = None
    profile: Optional[Dict[str, Any]] = None


# =============================================================================
# 1. ADMIN / HR ROUTES
# =============================================================================

@router.post("/api/app/jobs", status_code=status.HTTP_201_CREATED, dependencies=[Depends(verify_admin_key)])
async def create_job(job_in: JobCreate):
    """HR creates a job posting and stores it in app DB."""
    created_job = db.create_job(
        title=job_in.title,
        description=job_in.description,
        required_skills=job_in.required_skills,
        deadline_days=job_in.deadline_days
    )
    return created_job

@router.get("/api/app/jobs", dependencies=[Depends(verify_admin_key)])
async def list_jobs():
    """List jobs with applicant counts."""
    jobs = db.get_jobs()
    return jobs

@router.post("/api/app/jobs/{job_id}/applicants", dependencies=[Depends(verify_admin_key)])
async def upload_job_applicants(job_id: int, request: Request, file: UploadFile = File(...)):
    """HR uploads a CSV of applicants for a specific job."""
    job = db.get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job with ID {job_id} not found")

    content = await file.read()
    text = content.decode("utf-8-sig", errors="ignore")
    
    # Parse CSV, ensure position column has job.title
    reader = csv.DictReader(io.StringIO(text))
    fieldnames = list(reader.fieldnames) if reader.fieldnames else ["name", "email", "position"]
    if "position" not in fieldnames:
        fieldnames.append("position")

    updated_rows = []
    for row in reader:
        row_dict = dict(row)
        if not row_dict.get("position"):
            row_dict["position"] = job["title"]
        updated_rows.append(row_dict)

    # Re-build CSV string
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(updated_rows)
    updated_csv_bytes = output.getvalue().encode("utf-8")

    client = request.app.state.http_client
    base_url = get_hiring_ai_url()

    status_code, res_data = await hiring_bridge.upload_applicants_csv(
        client, base_url, updated_csv_bytes, filename=file.filename or "applicants.csv"
    )

    if status_code in (200, 201) and isinstance(res_data, dict):
        applicants_returned = res_data.get("applicants", [])
        if applicants_returned:
            db.add_job_applicants(job_id, applicants_returned)

    return JSONResponse(status_code=status_code, content=res_data)

@router.get("/api/app/jobs/{job_id}/applicants", dependencies=[Depends(verify_admin_key)])
async def get_job_applicants(job_id: int, request: Request):
    """List applicants for a job + reconcile status live from remote Smart Hiring AI."""
    job = db.get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job with ID {job_id} not found")

    # Get local applicants
    local_applicants = db.get_job_applicants(job_id)

    # Live reconciliation with remote /hiring/status
    client = request.app.state.http_client
    base_url = get_hiring_ai_url()
    status_code, remote_status = await hiring_bridge.get_hiring_status(client, base_url)

    if status_code == 200 and isinstance(remote_status, dict):
        completed_list = remote_status.get("completed_applicants", []) or remote_status.get("completed", [])
        expired_list = remote_status.get("expired", [])

        completed_ids = set()
        for item in completed_list:
            if isinstance(item, dict):
                completed_ids.add(str(item.get("applicant_id") or item.get("id")))
            else:
                completed_ids.add(str(item))

        expired_ids = set()
        for item in expired_list:
            if isinstance(item, dict):
                expired_ids.add(str(item.get("applicant_id") or item.get("id")))
            else:
                expired_ids.add(str(item))

        for app in local_applicants:
            app_id = str(app.get("applicant_id"))
            if app_id in completed_ids and app.get("status") != "completed":
                db.update_applicant_status(app_id, "completed")
                app["status"] = "completed"
            elif app_id in expired_ids and app.get("status") != "expired":
                db.update_applicant_status(app_id, "expired")
                app["status"] = "expired"

    # Fetch updated local list
    updated_applicants = db.get_job_applicants(job_id)
    return {"job_id": job_id, "applicants": updated_applicants}

@router.get("/api/app/jobs/{job_id}/ranking", dependencies=[Depends(verify_admin_key)])
async def get_job_ranking(job_id: int, request: Request):
    """Stream remote GET /hiring/ranking?download=true CSV back to admin."""
    job = db.get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job with ID {job_id} not found")

    client = request.app.state.http_client
    base_url = get_hiring_ai_url()
    status_code, content_type, content = await hiring_bridge.get_ranking_csv(client, base_url)

    if "text/csv" in content_type.lower() or (status_code == 200 and not content.startswith(b"{")):
        return Response(
            content=content,
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="job_{job_id}_ranking.csv"'}
        )
    else:
        try:
            json_data = json.loads(content.decode("utf-8"))
            return JSONResponse(status_code=status_code, content=json_data)
        except Exception:
            return Response(content=content, status_code=status_code, media_type=content_type)

@router.post("/api/app/jobs/{job_id}/finalize", dependencies=[Depends(verify_admin_key)])
async def finalize_job(job_id: int, request: Request):
    """Trigger final report by proxying ranking."""
    return await get_job_ranking(job_id, request)


# =============================================================================
# 2. APPLICANT / CANDIDATE ROUTES
# =============================================================================

@router.post("/api/app/candidates/register", status_code=status.HTTP_201_CREATED)
async def register_candidate(candidate_in: CandidateRegister, request: Request):
    """Candidate registers from mobile app."""
    client = request.app.state.http_client
    base_url = get_hiring_ai_url()

    applicant_data = {
        "name": candidate_in.name,
        "email": candidate_in.email,
        "phone": candidate_in.phone or "",
        "position": candidate_in.position or ""
    }

    status_code, res_data = await hiring_bridge.upload_applicants_json(
        client, base_url, [applicant_data]
    )

    if status_code in (200, 201) and isinstance(res_data, dict):
        applicants_list = res_data.get("applicants", [])
        if applicants_list:
            created_app = applicants_list[0]
            applicant_id = str(created_app.get("applicant_id") or created_app.get("id"))
            saved = db.add_candidate(
                applicant_id=applicant_id,
                name=candidate_in.name,
                email=candidate_in.email,
                phone=candidate_in.phone,
                position=candidate_in.position,
                status="registered"
            )
            return saved

    # Fallback if remote returned custom response or failed
    fallback_id = f"cand_{candidate_in.email.split('@')[0]}"
    saved = db.add_candidate(
        applicant_id=fallback_id,
        name=candidate_in.name,
        email=candidate_in.email,
        phone=candidate_in.phone,
        position=candidate_in.position,
        status="registered"
    )
    return saved

@router.get("/api/app/candidates/{applicant_id}/quiz")
async def get_candidate_quiz(applicant_id: str, request: Request):
    """Proxy quiz for candidate with masked questions."""
    client = request.app.state.http_client
    base_url = get_hiring_ai_url()

    status_code, res_data = await hiring_bridge.get_quiz(client, base_url, applicant_id)
    if status_code != 200:
        return JSONResponse(status_code=status_code, content=res_data)
    
    # Enforce masking on return value
    if isinstance(res_data, dict) and "questions" in res_data:
        masked_q = []
        for q in res_data["questions"]:
            if isinstance(q, dict):
                qc = dict(q)
                qc.pop("correct_index", None)
                qc.pop("correct_answer", None)
                masked_q.append(qc)
            else:
                masked_q.append(q)
        res_data["questions"] = masked_q

    return res_data

@router.post("/api/app/candidates/{applicant_id}/quiz/submit")
async def submit_candidate_quiz(applicant_id: str, submit_in: QuizSubmitRequest, request: Request):
    """Submit candidate quiz answers and proxy to remote AI scoring."""
    client = request.app.state.http_client
    base_url = get_hiring_ai_url()

    answers_payload = [item.model_dump() for item in submit_in.answers]
    status_code, res_data = await hiring_bridge.submit_quiz(client, base_url, applicant_id, answers_payload)

    if status_code == 403:
        # Pass through 403 for expired deadline
        return JSONResponse(
            status_code=403,
            content=res_data if isinstance(res_data, dict) else {"detail": "Applicant missed the deadline or is forbidden."}
        )

    if status_code != 200:
        return JSONResponse(status_code=status_code, content=res_data)

    # On success, update local status
    db.update_applicant_status(applicant_id, "completed")
    return res_data

@router.get("/api/app/candidates/{applicant_id}/result")
async def get_candidate_result(applicant_id: str, request: Request):
    """Get completed candidate's score/rank row from ranking."""
    client = request.app.state.http_client
    base_url = get_hiring_ai_url()

    status_code, ranking_data = await hiring_bridge.get_ranking_json(client, base_url)
    
    if status_code == 200 and isinstance(ranking_data, list):
        for row in ranking_data:
            if isinstance(row, dict):
                row_id = str(row.get("applicant_id") or row.get("id") or "")
                if row_id == applicant_id:
                    return row

    return JSONResponse(
        status_code=200,
        content={
            "message": "Candidate result not available yet or quiz not completed.",
            "applicant_id": applicant_id
        }
    )


# =============================================================================
# 3. CV GENERATOR AI INTEGRATION
# =============================================================================

@router.post("/api/app/candidates/{applicant_id}/cv")
async def generate_candidate_cv(applicant_id: str, request: Request, cv_req: Optional[CVGenerateRequest] = None):
    """Forward to CV Generator AI and stream returned PDF back to app."""
    candidate = db.get_candidate(applicant_id)
    name = candidate.get("name") if candidate else "Finalist Candidate"
    email = candidate.get("email") if candidate else f"{applicant_id}@skillify.ai"
    phone = candidate.get("phone") if candidate else ""
    position = (cv_req.target_domain if cv_req and cv_req.target_domain else None) or (candidate.get("position") if candidate else "Software Engineering")

    profile_data = {
        "full_name": name,
        "email": email,
        "phone": phone,
        "skills": [{"category": "Core Competencies", "items": ["Problem Solving", "Software Engineering", position]}]
    }
    if cv_req and cv_req.profile:
        profile_data.update(cv_req.profile)

    client = request.app.state.http_client
    cv_url = get_cv_url()

    try:
        status_code, content_type, pdf_bytes = await hiring_bridge.generate_cv_pdf(
            client, cv_url, target_domain=position, profile=profile_data
        )
        if status_code == 200 and len(pdf_bytes) > 0:
            return Response(
                content=pdf_bytes,
                media_type="application/pdf",
                headers={"Content-Disposition": f'attachment; filename="{applicant_id}_cv.pdf"'}
            )
    except Exception:
        pass

    # Mock PDF bytes fallback if CV generator service is unreachable
    mock_pdf = f"%PDF-1.4 Mock CV PDF for {name} ({applicant_id})".encode("utf-8")
    return Response(
        content=mock_pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{applicant_id}_cv.pdf"'}
    )
